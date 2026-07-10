# CyberShield Architecture

CyberShield is a small vanilla JavaScript application backed by an Express API. The project intentionally avoids a frontend framework, so page-level behavior is split across focused HTML, CSS, and browser JavaScript files.

## Runtime Components

| Area | Files | Responsibility |
| --- | --- | --- |
| URL scanner | `index.html`, `script.js`, `style.css` | Accepts user-entered URLs, sends scan requests, renders scan status, and stores local scan history. |
| Scam detector chat | `chat.html`, `chat.js`, `style.css` | Accepts suspicious message text, sends it to the backend AI endpoint, and renders structured risk analysis. |
| Threat dashboard | `dashboard.html`, `style.css` | Reads browser-local scan history and visualizes safe/threat scan counts. |
| Backend API | `server.js` | Handles CORS, Google Safe Browsing requests, Gemini scam analysis requests, retries, and error responses. |
| Tests | `test/` | Contains Node test files for backend behavior and API edge cases. |

## Data Flow

### URL Scan

1. The user enters a URL in `index.html`.
2. `script.js` normalizes the input and sends `POST /check` to the backend.
3. `server.js` validates the URL and forwards it to Google Safe Browsing.
4. The browser receives the scan result and stores a minimal local record in `localStorage` under `cybershield_history`.
5. `dashboard.html` reads that local history to render analytics. The dashboard does not send history to the backend.

### Scam Text Analysis

1. The user enters suspicious message text in `chat.html`.
2. `chat.js` sends `POST /api/scam-detect` with the message and optional conversation history.
3. `server.js` forwards the prompt to Gemini and expects a structured JSON response.
4. `chat.js` renders the classification, scam type, confidence, explanation, and advice in the chat history.

## Local Storage Contract

`cybershield_history` is an array of scan records:

```json
{
  "url": "https://example.com/",
  "status": "safe",
  "threats": [],
  "timestamp": "2026-07-11T10:00:00.000Z"
}
```

Only browser-local scan history is stored. API keys, Gemini prompts, and server responses are not stored in `localStorage`.

## Environment Variables

| Variable | Used By | Purpose |
| --- | --- | --- |
| `API_KEY` | `server.js` | Google Safe Browsing API key. |
| `GEMINI_API_KEY` | `server.js` | Gemini API key for scam analysis. |
| `PORT` | `server.js` | Optional local server port, defaults to `3000`. |
| `CORS_ORIGINS` | `server.js` | Optional comma-separated allowlist for browser origins. |
| `REQUEST_RETRIES` | `server.js` | Optional retry count for upstream API calls. |
| `REQUEST_TIMEOUT_MS` | `server.js` | Optional timeout for upstream API calls. |

## Contributor Notes

- Keep API keys on the server. Frontend files must not contain secrets.
- Prefer small page-specific scripts over broad rewrites.
- Use `localStorage` only for user-owned browser state.
- Keep scan and chat failures actionable for users; avoid exposing raw secrets or internal stack traces in the UI.
- When changing backend behavior, update or add tests in `test/` where practical.
