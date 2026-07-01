const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
dotenv.config();

console.log("API_KEY:", process.env.API_KEY);
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── CORS ───
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500',
     'https://cybershield-sxz0.onrender.com','https://mrinalray.github.io', 'null'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, file://) or matching allowed list
    if (!origin || ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
      return cb(null, true);
    }
    cb(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '1mb' }));

const SAFE_BROWSING_KEY = process.env.API_KEY;
const GEMINI_KEY        = process.env.GEMINI_API_KEY;

// ─── Timeout + Retry helper ───
const MAX_RETRIES = parseInt(process.env.REQUEST_RETRIES  || '2', 10);
const TIMEOUT_MS  = parseInt(process.env.REQUEST_TIMEOUT_MS || '8000', 10);

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    if (retries > 0 && (err.name === 'AbortError' || err.message.includes('fetch'))) {
      console.warn(`[RETRY] ${retries} left — ${err.message}`);
      await new Promise(r => setTimeout(r, 400));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

// ─── Health check ───
app.get('/', (req, res) => {
  res.json({ status: 'CyberShield backend running', port: PORT, version: '2.0' });
});

// ─── URL Safe Browsing check ───
app.post('/check', async (req, res) => {
  const userUrl = req.body.url;
  if (!userUrl) return res.status(400).json({ error: 'No URL provided' });

  try { new URL(userUrl); } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  if (!SAFE_BROWSING_KEY) {
    return res.status(503).json({ error: 'SAFE_BROWSING API key not configured (set API_KEY in .env)' });
  }

  console.log(`[SCAN] ${userUrl}`);

  const body = {
    client: { clientId: 'cybershield', clientVersion: '2.0' },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url: userUrl }]
    }
  };

  try {
    const response = await fetchWithRetry(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${SAFE_BROWSING_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[API ERROR] ${response.status}:`, errText);
      return res.status(502).json({ error: `Google API error: ${response.status}`, detail: errText });
    }

    const data = await response.json();
    console.log(`[RESULT] Matches: ${data.matches ? data.matches.length : 0}`);
    res.json(data);

  } catch (err) {
    console.error('[FETCH ERROR]', err.message);
    res.status(500).json({ error: 'Backend fetch failed', detail: err.message });
  }
});



// ─── Scam Text Detection (AI) ───
app.post('/api/scam-detect', async (req, res) => {
  console.log('[SCAM-DETECT] Request received:', req.body.message?.slice(0, 50));  // ← add this
  
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  if (!GEMINI_KEY) {
    // Fallback mock response when key not configured
    console.warn('[SCAM-DETECT] GEMINI_API_KEY not set — returning mock response');
    return res.json({
      classification:    'suspicious',
      scamType:          'other',
      confidence:        60,
      explanation:       'AI analysis unavailable (GEMINI_API_KEY not configured). Based on pattern matching, this message contains elements that warrant caution.',
      actionableAdvice:  'Do not share personal details or send money. Configure GEMINI_API_KEY in your .env file to enable full AI analysis.'
    });
  }

  const systemPrompt = `You are CyberShield, an expert scam and fraud detection AI. Analyze the provided message and return ONLY a valid JSON object (no markdown, no code fences) with exactly these fields:
{
  "classification": "safe" | "suspicious" | "danger",
  "scamType": "phishing" | "fake_job" | "otp_fraud" | "investment_scam" | "impersonation" | "other" | "none",
  "confidence": <integer 0-100>,
  "explanation": "<2-4 sentence analysis of the message and why it is or is not suspicious>",
  "actionableAdvice": "<1-2 sentence concrete advice for the user>"
}`;

  const conversationMessages = [];
  if (history && Array.isArray(history)) {
    history.forEach(turn => {
      if (turn.role === 'user')  conversationMessages.push({ role: 'user',  parts: [{ text: turn.text }] });
      if (turn.role === 'model') conversationMessages.push({ role: 'model', parts: [{ text: turn.text }] });
    });
  }
  conversationMessages.push({ role: 'user', parts: [{ text: `Analyze this message:\n\n${message}` }] });

  try {
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: conversationMessages,
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
        })
      }
    );

    if (!response.ok) {
  const errText = await response.text();
  console.error('[GEMINI ERROR]', response.status, errText);  // ← add this line
  return res.status(502).json({ error: 'Gemini API error', detail: errText });
}

    const data     = await response.json();
    const rawText  = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned  = rawText.replace(/```json|```/g, '').trim();
    const parsed   = JSON.parse(cleaned);
    res.json(parsed);

  } catch (err) {
    console.error('[SCAM-DETECT ERROR]', err.message);
    res.status(500).json({ error: 'Scam analysis failed', detail: err.message });
  }
});

// ─── Start ───
app.listen(PORT, () => {
  console.log(`\n🛡️  CyberShield Backend v2.0`);
  console.log(`🚀  http://localhost:${PORT}`);
  console.log(`📡  POST /check           — URL scan`);
  console.log(`🤖  POST /api/scam-detect — AI scam detection\n`);
});
