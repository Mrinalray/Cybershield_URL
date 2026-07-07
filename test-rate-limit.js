// Simple rate limit tester — sends a burst of POST /check to local server
const fetch = require('node-fetch');

const TARGET = process.env.TARGET || 'http://localhost:3000/check';
const TOTAL = parseInt(process.env.TOTAL || '120', 10);
const DELAY_MS = parseInt(process.env.DELAY_MS || '80', 10); // inter-request delay

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log(`Sending ${TOTAL} POSTs to ${TARGET} (delay ${DELAY_MS}ms)`);
  let got429 = 0;
  for (let i = 1; i <= TOTAL; i++) {
    try {
      const res = await fetch(TARGET, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' })
      });
      const txt = await res.text();
      console.log(`#${i} -> ${res.status}${res.status===429 ? ' (RATE LIMITED)' : ''}`);
      if (res.status === 429) {
        got429++;
        try { console.log('Body:', JSON.parse(txt)); } catch (e) { console.log('Body:', txt); }
      }
    } catch (err) {
      console.error(`#${i} ERROR`, err.message);
    }
    await sleep(DELAY_MS);
  }
  console.log(`Done. Observed ${got429} rate-limited responses.`);
}

run().catch(e => { console.error('Test failed', e); process.exit(1); });
