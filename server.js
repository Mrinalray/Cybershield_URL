const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

dotenv.config();

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("\n[FATAL ERROR] API_KEY is missing in environment variables.");
  console.error("Please create a .env file with your Google Safe Browsing API key.\n");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://safebrowsing.googleapis.com"],
    },
  })
);

// CORS restricted to frontend domains (adjust as needed for production)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5500", "http://127.0.0.1:5500"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "10kb" })); // Prevents large payload DoS

// Rate limiter for scan endpoint
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many scan requests from this IP, please try again later." }
});

app.get("/", (req, res) => {
  res.json({ status: "CyberShield backend running", port: PORT });
});

app.post("/check", scanLimiter, async (req, res) => {
  const userUrl = req.body.url;

  if (!userUrl || typeof userUrl !== 'string') {
    return res.status(400).json({ error: "No URL provided" });
  }

  if (userUrl.length > 2048) {
    return res.status(400).json({ error: "URL is too long" });
  }
  
  let validUrl;
  try {
    validUrl = new URL(userUrl);
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      return res.status(400).json({ error: "Invalid URL protocol. Only HTTP and HTTPS are allowed." });
    }
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

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
      threatEntries: [{ url: validUrl.href }]
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Don't leak exact Google API errors to client
      console.error(`[API ERROR] Status ${response.status}:`, await response.text());
      return res.status(502).json({
        error: "Threat detection service is temporarily unavailable."
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    clearTimeout(timeoutId);
    console.error("[FETCH ERROR]", error.message);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: "Threat detection service timed out." });
    }
    res.status(500).json({ error: "Internal server error occurred during scan." });
  }
});

app.listen(PORT, () => {
  console.log(`\n🛡️  CyberShield Backend`);
  console.log(`🚀  Running at http://localhost:${PORT}`);
});
