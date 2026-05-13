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
  assert.deepEqual(result.body, {});
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
  assert.deepEqual(result.body, mockThreatResponse);
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
