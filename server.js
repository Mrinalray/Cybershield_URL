const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv")
dotenv.config()

const app = express();
const PORT =AIzaSyD3o2irj2vCFZf1teD7f7tqMX4-wmacJ28;


app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());


const  API_KEY = process.env.API_KEY;


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
