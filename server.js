const express = require("express");

const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");  // ← added

dotenv.config()
const app = express();
app.set('trust proxy', 1); 
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const API_KEY = process.env.API_KEY;

// ── Rate Limiter ─────────────────────────────────────────────────────────────
const scanLimiter = rateLimit({                   // ← added
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`[RATE LIMIT] IP ${req.ip} exceeded scan limit`);
    res.status(429).json({
      error: "Too many requests",
      message: "You have exceeded the limit of 10 scans per minute. Please wait before trying again.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 - Date.now() / 1000)
    });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "CyberShield backend running", port: PORT });
});

app.post("/check", scanLimiter, async (req, res) => { 
  
  console.log(`[DEBUG] req.ip = ${req.ip}`);          // ← add this
  console.log(`[DEBUG] x-forwarded-for = ${req.headers['x-forwarded-for']}`); // ← and this
  
  const userUrl = req.body.url;
  if (!userUrl) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    new URL(userUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  console.log(`[SCAN] Checking: ${userUrl}`);

  const requestBody = {
    client: {
      clientId: "cybershield-hackathon",
      clientVersion: "2.0"
    },
    threatInfo: {
      threatTypes: [
        "MALWARE",
        "SOCIAL_ENGINEERING",
        "UNWANTED_SOFTWARE",
        "POTENTIALLY_HARMFUL_APPLICATION"
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url: userUrl }]
    }
  };

  try {
  

const response = await fetch(
  `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  }
);

    if (!response.ok) {
      const errText = await response.text();

      if (response.status === 429) {                // ← added: surface Google quota errors
        console.error("[API QUOTA] Google Safe Browsing quota exceeded");
        return res.status(503).json({
          error: "API quota exceeded",
          message: "The Google Safe Browsing quota has been reached. Please try again later."
        });
      }

      console.error(`[API ERROR] Status ${response.status}:`, errText);
      return res.status(502).json({
        error: `Google API error: ${response.status}`,
        detail: errText
      });
    }

    const data = await response.json();
    console.log(`[RESULT] Matches: ${data.matches ? data.matches.length : 0}`);
    res.json(data);

  } catch (error) {
    console.error("[FETCH ERROR]", error.message);
    res.status(500).json({ error: "Backend fetch failed", detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🛡️  CyberShield Backend`);
  console.log(`🚀  Running at http://localhost:${PORT}`);
  console.log(`📡  POST /check to scan a URL`);
  console.log(`🔒  Rate limit: 10 requests / minute / IP\n`);  // ← added
});