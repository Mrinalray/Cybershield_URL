const test = require("node:test");
const assert = require("node:assert/strict");
const fetch = require("node-fetch");
const { createApp } = require("../server");

async function runRequest(app, body) {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/scam-detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    return {
      status: response.status,
      body: await response.json()
    };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("returns 400 for missing message parameter", async () => {
  const app = createApp({
    apiKey: "test-key"
  });

  const result = await runRequest(app, {});
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "No message text provided or invalid format");
});

test("returns 502 when Gemini API returns an upstream error", async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "dummy-key";
  
  const app = createApp({
    fetchImpl: async () => ({
      ok: false,
      status: 503,
      text: async () => "service unavailable"
    })
  });

  try {
    const result = await runRequest(app, { message: "test message" });
    assert.equal(result.status, 502);
    assert.equal(result.body.error, "Gemini API error: 503");
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }
});

test("returns structured report payload when scan is successful", async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "dummy-key";

  const mockGeminiResponse = {
    candidates: [{
      content: {
        parts: [{
          text: JSON.stringify({
            classification: "malicious",
            scamType: "phishing",
            confidence: 95,
            explanation: "Suspicious login links detected.",
            actionableAdvice: "Do not click links."
          })
        }]
      }
    }]
  };

  const app = createApp({
    fetchImpl: async () => ({
      ok: true,
      json: async () => mockGeminiResponse
    })
  });

  try {
    const result = await runRequest(app, { message: "urgent bank check required http://fake-login" });
    assert.equal(result.status, 200);
    assert.equal(result.body.classification, "malicious");
    assert.equal(result.body.scamType, "phishing");
    assert.equal(result.body.confidence, 95);
    assert.equal(result.body.explanation, "Suspicious login links detected.");
    assert.equal(result.body.actionableAdvice, "Do not click links.");
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }
});

test("uses options.geminiKey exclusively and does not fall back to options.apiKey or API_KEY", async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  let requestUrl = null;
  const app = createApp({
    geminiKey: "custom-gemini-key",
    apiKey: "wrong-safe-browsing-key",
    fetchImpl: async (url) => {
      requestUrl = url;
      return {
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  classification: "safe",
                  scamType: "none",
                  confidence: 100,
                  explanation: "Verified safe",
                  actionableAdvice: "None"
                })
              }]
            }
          }]
        })
      };
    }
  });

  try {
    const result = await runRequest(app, { message: "Hello" });
    assert.equal(result.status, 200);
    assert.ok(requestUrl.includes("key=custom-gemini-key"));
    assert.ok(!requestUrl.includes("wrong-safe-browsing-key"));
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }
});

