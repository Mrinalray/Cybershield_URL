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

function createApp(options = {}) {
  const app = express();
  const fetchImpl = options.fetchImpl || fetch;
  const apiKey = options.apiKey || API_KEY;
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

    if (!userUrl) {
      return res.status(400).json({ error: "No URL provided" });
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
