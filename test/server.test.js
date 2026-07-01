const test = require("node:test");
const assert = require("node:assert/strict");
const fetch = require("node-fetch");
const { createApp } = require("../server");

async function runRequest(app, body, origin) {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(origin ? { Origin: origin } : {})
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

test("returns 400 for invalid URL", async () => {
  const app = createApp({
    apiKey: "test-key",
    allowedOrigins: ["http://localhost:3000"],
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({})
    })
  });

  const result = await runRequest(app, { url: "not-a-url" }, "http://localhost:3000");
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "Invalid URL format");
});

test("returns 502 when Google API returns an upstream error", async () => {
  const app = createApp({
    apiKey: "test-key",
    retries: 0,
    allowedOrigins: ["http://localhost:3000"],
    fetchImpl: async () => ({
      ok: false,
      status: 503,
      text: async () => "service unavailable"
    })
  });

  const result = await runRequest(app, { url: "https://example.com" }, "http://localhost:3000");
  assert.equal(result.status, 502);
  assert.equal(result.body.error, "Google API error: 503");
});

test("returns safe response when no threat matches exist", async () => {
  const app = createApp({
    apiKey: "test-key",
    retries: 0,
    allowedOrigins: ["http://localhost:3000"],
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({})
    })
  });

  const result = await runRequest(app, { url: "https://example.com" }, "http://localhost:3000");
  assert.equal(result.status, 200);
  assert.ok(result.body.typosquatting);
  assert.equal(result.body.typosquatting.original.threat, "safe");
  assert.ok(result.body.typosquatting.variants.length > 0);
});

test("returns threat response when matches are found", async () => {
  const mockThreatResponse = {
    matches: [{ threatType: "MALWARE" }]
  };

  const app = createApp({
    apiKey: "test-key",
    retries: 0,
    allowedOrigins: ["http://localhost:3000"],
    fetchImpl: async () => ({
      ok: true,
      json: async () => mockThreatResponse
    })
  });

  const result = await runRequest(app, { url: "https://bad.example.com" }, "http://localhost:3000");
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.matches, mockThreatResponse.matches);
  assert.equal(result.body.typosquatting.original.threat, "malicious");
});

test("retries transient fetch failures before succeeding", async () => {
  let attempts = 0;

  const app = createApp({
    apiKey: "test-key",
    retries: 2,
    timeoutMs: 100,
    allowedOrigins: ["http://localhost:3000"],
    fetchImpl: async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error("temporary network issue");
      }

      return {
        ok: true,
        json: async () => ({})
      };
    }
  });

  const result = await runRequest(app, { url: "https://example.com" }, "http://localhost:3000");
  assert.equal(result.status, 200);
  assert.equal(attempts, 3);
});

test("returns 400 for missing URL", async () => {
  const app = createApp({
    apiKey: "test-key",
    allowedOrigins: ["http://localhost:3000"],
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({})
    })
  });

  const result = await runRequest(app, {}, "http://localhost:3000");
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "No URL provided or invalid format");
});

test("generates and filters typosquatting variants correctly", async () => {
  const app = createApp({
    apiKey: "test-key",
    retries: 0,
    allowedOrigins: ["http://localhost:3000"],
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({})
    })
  });

  const result = await runRequest(app, { url: "https://google.com" }, "http://localhost:3000");
  assert.equal(result.status, 200);
  assert.ok(result.body.typosquatting);
  
  const variants = result.body.typosquatting.variants;
  assert.ok(variants.length > 0 && variants.length <= 20);

  const categories = new Set(variants.map(v => v.category));
  assert.ok(categories.has("homoglyph"));
  assert.ok(categories.has("tld"));
  
  variants.forEach(v => {
    assert.ok(v.distance <= 2);
    assert.ok(v.threat === "suspicious" || v.threat === "malicious");
  });
});

async function runApiRequest(app, endpoint, body) {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}${endpoint}`, {
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

test("returns 400 for missing image parameter in extract-url", async () => {
  const app = createApp({
    apiKey: "test-key"
  });

  const result = await runApiRequest(app, "/api/extract-url", {});
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "No image data provided");
});

test("returns 400 for invalid image format in extract-url", async () => {
  const app = createApp({
    apiKey: "test-key"
  });

  const result = await runApiRequest(app, "/api/extract-url", { image: "not-a-base64-data-url" });
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "Invalid image data format. Must be a base64 data URL");
});

test("returns 500 when geminiKey is missing in extract-url", async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const app = createApp({
    apiKey: "test-key"
  });

  try {
    const result = await runApiRequest(app, "/api/extract-url", { image: "data:image/png;base64,iVBORw" });
    assert.equal(result.status, 500);
    assert.equal(result.body.error, "Missing Gemini API key configuration");
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }
});

test("returns extracted URL when Gemini OCR call is successful", async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "dummy-key";

  const mockGeminiResponse = {
    candidates: [{
      content: {
        parts: [{
          text: "https://example.com"
        }]
      }
    }]
  };

  const app = createApp({
    geminiKey: "dummy-key",
    fetchImpl: async () => ({
      ok: true,
      json: async () => mockGeminiResponse
    })
  });

  try {
    const result = await runApiRequest(app, "/api/extract-url", { image: "data:image/png;base64,iVBORw" });
    assert.equal(result.status, 200);
    assert.equal(result.body.url, "https://example.com");
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }
});

test("returns null URL when Gemini OCR call returns NONE", async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "dummy-key";

  const mockGeminiResponse = {
    candidates: [{
      content: {
        parts: [{
          text: "NONE"
        }]
      }
    }]
  };

  const app = createApp({
    geminiKey: "dummy-key",
    fetchImpl: async () => ({
      ok: true,
      json: async () => mockGeminiResponse
    })
  });

  try {
    const result = await runApiRequest(app, "/api/extract-url", { image: "data:image/png;base64,iVBORw" });
    assert.equal(result.status, 200);
    assert.equal(result.body.url, null);
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }
});
