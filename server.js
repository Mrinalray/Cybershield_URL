const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

try {
  require("dotenv").config();
} catch {
  // dotenv is optional in this project environment.
}

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const BASE_RETRY_DELAY_MS = 250;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

function toPositiveInteger(value, fallback) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
}

function toNonNegativeInteger(value, fallback) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 0) {
    return parsed;
  }

  return fallback;
}

function calculateRetryDelay(attempt) {
  return BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
}

const REQUEST_TIMEOUT_MS = toPositiveInteger(process.env.REQUEST_TIMEOUT_MS, 5000);
const REQUEST_RETRIES = toNonNegativeInteger(process.env.REQUEST_RETRIES, 2);
const DEFAULT_ALLOWED_ORIGINS = [
  "https://cybershield-url.netlify.app",
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAllowedOrigins() {
  const configured = process.env.CORS_ORIGINS;

  if (!configured) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function sanitizeErrorDetail(message, fallback) {
  if (process.env.NODE_ENV === "production") {
    return fallback;
  }

  return message;
}

async function callSafeBrowsingWithRetry(fetchImpl, apiKey, requestBody, timeoutMs, maxRetries) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }
      );

      if (response.ok) {
        return { ok: true, data: await response.json() };
      }

      const detail = await response.text();
      const shouldRetry = RETRYABLE_STATUS_CODES.has(response.status) && attempt < maxRetries;

      if (shouldRetry) {
        await sleep(calculateRetryDelay(attempt));
        continue;
      }

      return {
        ok: false,
        status: response.status,
        detail
      };
    } catch (error) {
      const isTimeout = error.name === "AbortError";
      const shouldRetry = attempt < maxRetries;

      if (shouldRetry) {
        await sleep(calculateRetryDelay(attempt));
        continue;
      }

      return {
        ok: false,
        fetchError: isTimeout
          ? `Google API request timed out after ${timeoutMs}ms`
          : "Google API network request failed"
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return { ok: false, fetchError: "Google API request failed" };
}

const SYSTEM_INSTRUCTION = `You are CyberShield AI, an advanced digital fraud and scam detection assistant.
Your goal is to analyze messages, emails, SMS, job offers, investment pitches, or other text pasted by the user to determine if it is a scam.

Cover these main categories:
1. Phishing: Credential theft attempts, fake bank logins, malicious link clicks, weird domain patterns.
2. Fake Job Offers: Advance-fee recruitment scams, daily-tasks-for-pay scams, remote data entry traps, payment requests for kits.
3. OTP Fraud / UPI PIN Theft: Requests to share OTP code, PINs, card verification details, or social engineering to approve transfers.
4. Investment Scams: Crypto doubling programs, high-yield investment programs (HYIP), fake telegram channel recommendations, pump & dump schemes.
5. Impersonation Scams: Fake courier support (FedEx, DHL, India Post, customs duty), mock law enforcement/police warnings, fake friends/bosses asking for emergency money.

Analyze threat indicators like artificial urgency, fear tactics, grammatical errors, request for sensitive files/data, payment instructions, or unrecognized URLs.

Provide output conforming EXACTLY to the requested JSON schema.
- "classification": Assess if this message is safe, suspicious (has minor flags or questionable intent), or malicious (clear fraud signature).
- "scamType": Choose the matching scam category ("phishing", "fake_job", "otp_fraud", "investment_scam", "impersonation", "other", or "none" if safe).
- "confidence": Percentage score (0 to 100) representing threat analysis confidence.
- "explanation": Explain clearly why this message was classified this way. Highlight the specific threat indicators (e.g. urgent requests, unverified links) detected. If the user is asking general follow-up safety questions, answer them helpful and directly here.
- "actionableAdvice": Specific, actionable warning instructions (e.g. "Do NOT click the link", "Contact FedEx directly via their official number").`;

function createApp(options = {}) {
  const app = express();
  const fetchImpl = options.fetchImpl || fetch;
  const apiKey = options.apiKey || API_KEY;
  const geminiKey = options.geminiKey || process.env.GEMINI_API_KEY;
  const timeoutMs = toPositiveInteger(options.timeoutMs, REQUEST_TIMEOUT_MS);
  const retries = toNonNegativeInteger(options.retries, REQUEST_RETRIES);
  const allowedOrigins = options.allowedOrigins || getAllowedOrigins();

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  }));

  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({ status: "CyberShield backend running", port: PORT });
  });

  app.post("/check", async (req, res) => {
    const userUrl = req.body.url;

    if (!userUrl || typeof userUrl !== "string") {
      return res.status(400).json({ error: "No URL provided or invalid format" });
    }

    if (userUrl.length > 2048) {
      return res.status(400).json({ error: "URL exceeds maximum length of 2048 characters" });
    }

    try {
      new URL(userUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Missing API key configuration" });
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

    const result = await callSafeBrowsingWithRetry(fetchImpl, apiKey, requestBody, timeoutMs, retries);

    if (!result.ok) {
      if (result.fetchError) {
        console.error("[FETCH ERROR]", result.fetchError);
        return res.status(500).json({
          error: "Backend fetch failed",
          detail: sanitizeErrorDetail(result.fetchError, "Failed to contact Safe Browsing API")
        });
      }

      console.error(`[API ERROR] Status ${result.status}:`, result.detail);
      return res.status(502).json({
        error: `Google API error: ${result.status}`,
        detail: sanitizeErrorDetail(result.detail, "Safe Browsing API request failed")
      });
    }

    console.log(`[RESULT] Matches: ${result.data.matches ? result.data.matches.length : 0}`);
    return res.json(result.data);
  });

  app.post("/api/scam-detect", async (req, res) => {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "No message text provided or invalid format" });
    }

    if (!geminiKey) {
      return res.status(500).json({ error: "Missing Gemini API key configuration" });
    }

    console.log(`[SCAM DETECT] Analyzing message input`);

    const formattedContents = [];
    if (Array.isArray(history)) {
      history.forEach(h => {
        formattedContents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      });
    }
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    try {
      const fetchImpl = options.fetchImpl || fetch;
      const response = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: formattedContents,
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }]
            },
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  classification: {
                    type: "STRING",
                    enum: ["safe", "suspicious", "malicious"]
                  },
                  scamType: {
                    type: "STRING",
                    enum: ["phishing", "fake_job", "otp_fraud", "investment_scam", "impersonation", "other", "none"]
                  },
                  confidence: {
                    type: "INTEGER"
                  },
                  explanation: {
                    type: "STRING"
                  },
                  actionableAdvice: {
                    type: "STRING"
                  }
                },
                required: ["classification", "scamType", "confidence", "explanation", "actionableAdvice"]
              }
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[GEMINI API ERROR] Status ${response.status}:`, errText);
        return res.status(502).json({
          error: `Gemini API error: ${response.status}`,
          detail: "Failed to communicate with LLM backend"
        });
      }

      const responseData = await response.json();
      
      if (
        responseData.candidates &&
        responseData.candidates[0] &&
        responseData.candidates[0].content &&
        responseData.candidates[0].content.parts &&
        responseData.candidates[0].content.parts[0]
      ) {
        const text = responseData.candidates[0].content.parts[0].text;
        try {
          const parsed = JSON.parse(text);
          return res.json(parsed);
        } catch (jsonErr) {
          console.error("[JSON PARSE ERROR] Text was:", text);
          return res.status(502).json({
            error: "Invalid JSON response structure from LLM",
            detail: "Failed to parse model response"
          });
        }
      }

      return res.status(502).json({
        error: "Empty content returned from LLM service",
        detail: "No candidates returned"
      });
    } catch (fetchErr) {
      console.error("[GEMINI FETCH ERROR]", fetchErr);
      return res.status(500).json({
        error: "Failed to fetch response from Gemini backend",
        detail: fetchErr.message
      });
    }
  });

  app.use((err, req, res, next) => {
    if (err && err.message === "Not allowed by CORS") {
      return res.status(403).json({ error: "CORS origin denied" });
    }

    return next(err);
  });

  return app;
}

const app = createApp();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log("\n🛡️  CyberShield Backend");
    console.log(`🚀  Running at http://localhost:${PORT}`);
    console.log("📡  POST /check to scan a URL\n");
  });
}

module.exports = {
  app,
  createApp,
  callSafeBrowsingWithRetry,
  getAllowedOrigins
};
