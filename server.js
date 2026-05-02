const express = require("express");
const cors = require("cors");
const dns= require("dns").promises;

const app = express();
const PORT = 3000;

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

// Health check — open http://localhost:3000 to verify server is running
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
  console.log(`📡  POST /check to scan a URL\n`);
});
