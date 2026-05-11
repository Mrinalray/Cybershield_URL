# Issue and Solution Report

## Issue Summary

The backend needed three reliability and security improvements:

1. No timeout/retry strategy existed for Google Safe Browsing API calls, so transient failures could break scans.
2. CORS was configured with wildcard origin (`"*"`), allowing requests from any site.
3. There were no automated backend tests for key API behaviors.

## Solution Applied

### 1) Google API Timeout + Retry

- Added timeout handling for Safe Browsing requests.
- Added retry logic for transient failures (network errors and retryable HTTP status codes).
- Added configurable retry and timeout settings via environment variables.
- Added validation for timeout/retry numeric config values.

### 2) CORS Restriction

- Replaced wildcard CORS with an allowlist approach.
- Added support for configuring allowed frontend origins through `CORS_ORIGINS`.
- Kept safe local defaults for development.
- Added explicit denial behavior for non-allowed origins.

### 3) Automated Tests

Added backend tests for:

- URL validation (invalid URL request path).
- Upstream API error mapping.
- Safe response flow (no threat matches).
- Threat response flow (matches returned).
- Retry behavior on transient failures.

## Files Updated

- `server.js`
- `test/server.test.js`
- `package.json`
- `README.md`

## Validation / Test Notes

- Test command: `npm test`
- Current local run in this environment fails before execution due missing installed dependency module (`node-fetch`) in local node_modules.
- After dependencies are installed, the tests are expected to validate the scenarios listed above.

## Environment Variables Introduced/Used

- `API_KEY`
- `CORS_ORIGINS`
- `REQUEST_TIMEOUT_MS`
- `REQUEST_RETRIES`

## Outcome

The backend is now more resilient against transient upstream failures, has tighter cross-origin access control, and includes automated coverage for core API behavior and error handling paths.
