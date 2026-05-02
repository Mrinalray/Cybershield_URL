const express = require("express");
const cors = require("cors");
const https = require("https");
const http = require("http");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — allows your frontend to connect
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ⚠️ IMPORTANT: Replace this with a NEW API key from Google Cloud Console
// Your old key was exposed publicly — revoke it immediately at:
// https://console.cloud.google.com/apis/credentials
const  API_KEY = process.env.API_KEY;

// Helper function to fetch security metadata
async function getUrlMetadata(targetUrl) {
  return new Promise((resolve) => {
    const urlObj = new URL(targetUrl);
    const protocol = urlObj.protocol === "https:" ? https : http;
    
    const options = {
      method: "HEAD", // Just get headers
      timeout: 5000,
    };

    const req = protocol.request(targetUrl, options, (res) => {
      const headers = res.headers;
      resolve({
        https: urlObj.protocol === "https:",
        hsts: !!headers["strict-transport-security"],
        csp: !!headers["content-security-policy"],
        xFrame: !!headers["x-frame-options"],
        server: headers["server"] || "Unknown",
        contentType: headers["content-type"] || "Unknown"
      });
    });

    req.on("error", () => {
      resolve({ https: urlObj.protocol === "https:", error: true });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ https: urlObj.protocol === "https:", timeout: true });
    });

    req.end();
  });
}

// Health check
app.get("/", (req, res) => {
  res.json({ status: "CyberShield backend running", port: PORT });
});

app.post("/check", async (req, res) => {
  const userUrl = req.body.url;

  if (!userUrl) {
    return res.status(400).json({ error: "No URL provided" });
  }

  // Validate URL format
  try {
    new URL(userUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  // Check if domain actually exists
  try {
    const hostname = new URL(userUrl).hostname;
    await dns.lookup(hostname);
  } catch {
    return res.status(200).json({ exists: false });
  }
  
  console.log(`[SCAN] Checking: ${userUrl}`);

  // 1. Fetch metadata (Headers/SSL)
  const metadata = await getUrlMetadata(userUrl);

  // 2. Check Google Safe Browsing
  const requestBody = {
    client: { clientId: "cybershield-hackathon", clientVersion: "2.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
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
      return res.status(502).json({ error: `Google API error: ${response.status}`, metadata });
    }

    const data = await response.json();
    res.json({ ...data, metadata });

  } catch (error) {
    res.status(500).json({ error: "Backend fetch failed", metadata });
  }
});

app.listen(PORT, () => {
  console.log(`\n🛡️  CyberShield Backend`);
  console.log(`🚀  Running at http://localhost:${PORT}`);
  console.log(`📡  POST /check to scan a URL\n`);
});
