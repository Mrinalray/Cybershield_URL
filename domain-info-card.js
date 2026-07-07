/**
 * domain-info-card.js
 * Implements #184 — Domain Information Card for the CyberShield threat dashboard.
 *
 * Integration: call renderDomainInfoCard(url) after showResult() in checkSecurity().
 * The card is injected into #domainInfoCard in index.html.
 */

// ─────────────────────────────────────────────────────────────────────────────
// PSL LIMITATION (KNOWN FOLLOW-UP):
// The splitHostname heuristic below treats the last dot-separated label as the
// TLD and does NOT consult the Public Suffix List (PSL). Compound TLDs such as
// .co.uk or .com.au will split incorrectly (e.g. mail.google.co.uk → domain
// "co", TLD ".uk"). Fixing this properly requires a real PSL dependency (`psl`
// or `tldts`) and should be a separate, deliberate change — see issue #184.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Splits a hostname into { subdomain, domain, tld }.
 * Returns null values where the concept does not apply (IPs, localhost, etc.).
 *
 * @param {string} hostname
 * @returns {{ subdomain: string|null, domain: string, tld: string|null }}
 */
function splitHostname(hostname) {
  const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  const isIPv6 = hostname.includes(":");
  if (isIPv4 || isIPv6 || !hostname.includes(".")) {
    // IP addresses, "localhost", or any single-label host have no
    // meaningful subdomain/root/TLD split.
    return { subdomain: null, domain: hostname, tld: null };
  }
  const labels = hostname.split(".");
  const tld = labels[labels.length - 1];
  const domain = labels[labels.length - 2];
  const subdomainLabels = labels.slice(0, -2);
  const subdomain = subdomainLabels.length > 0 ? subdomainLabels.join(".") : null;
  return { subdomain, domain, tld };
}

/**
 * Parse a raw URL string using the native URL API.
 * Returns a result object or { ok: false } on parse failure.
 *
 * @param {string} rawUrl
 * @returns {{ ok: true, fields: object } | { ok: false }}
 */
function parseUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (_) {
    return { ok: false };
  }

  const protocol = parsed.protocol.replace(":", "").toUpperCase();
  const hostname = parsed.hostname;

  // Build query string: join all key=value pairs with " & "; null if zero params.
  const queryPairs = [];
  parsed.searchParams.forEach((value, key) => {
    queryPairs.push(value ? `${key}=${value}` : key);
  });
  const query = queryPairs.length > 0 ? queryPairs.join(" & ") : null;

  // Fragment: strip leading "#"; null if empty.
  const fragment = parsed.hash ? parsed.hash.replace(/^#/, "") : null;

  // Path: parsed.pathname is always at least "/"; treat "/" as meaningful.
  const path = parsed.pathname || null;

  const { subdomain, domain, tld } = splitHostname(hostname);

  return {
    ok: true,
    fields: {
      protocol,
      hostname,
      subdomain,
      domain,
      tld: tld ? `.${tld}` : null,
      path,
      query,
      fragment,
    },
  };
}

/**
 * Renders a single info row.
 *
 * @param {string} icon   - emoji icon
 * @param {string} label  - uppercase label text
 * @param {string|null} value - field value; null/empty renders em dash placeholder
 * @returns {string} HTML string
 */
function infoRow(icon, label, value) {
  const isEmpty = value === null || value === undefined || value === "";
  const displayValue = isEmpty ? "\u2014" : value;
  const valueClass = isEmpty ? "dic-value dic-empty" : "dic-value dic-populated";
  return `
    <div class="dic-row" role="row">
      <span class="dic-label" role="rowheader">
        <span class="dic-icon" aria-hidden="true">${icon}</span>
        ${label}
      </span>
      <span class="${valueClass}" role="cell">${displayValue}</span>
    </div>`;
}

/**
 * Renders the Domain Information Card into the #domainInfoCard element.
 * Three states:
 *   idle   — no url provided yet
 *   error  — URL constructor threw (malformed string)
 *   success — all 8 fields rendered
 *
 * @param {string|undefined} url - the just-scanned URL string
 */
function renderDomainInfoCard(url) {
  const container = document.getElementById("domainInfoCard");
  if (!container) return;

  const header = `
    <div class="dic-header">
      <span class="dic-header-icon" aria-hidden="true">&#127760;</span>
      <span class="dic-header-title">Domain Information</span>
    </div>`;

  // ── IDLE STATE ──────────────────────────────────────────────────────────────
  if (!url || url.trim() === "") {
    container.innerHTML = `
      <div class="dic-card" aria-label="Domain Information Card">
        ${header}
        <div class="dic-idle">Scan a URL to see its structural breakdown.</div>
      </div>`;
    return;
  }

  const result = parseUrl(url);

  // ── ERROR STATE ─────────────────────────────────────────────────────────────
  if (!result.ok) {
    container.innerHTML = `
      <div class="dic-card" aria-label="Domain Information Card">
        ${header}
        <div class="dic-error">Couldn&#39;t parse this URL. Check the format and try again.</div>
      </div>`;
    return;
  }

  // ── SUCCESS STATE ───────────────────────────────────────────────────────────
  const { protocol, hostname, subdomain, domain, tld, path, query, fragment } = result.fields;

  container.innerHTML = `
    <div class="dic-card" aria-label="Domain Information Card">
      ${header}
      <div class="dic-body" role="table" aria-label="URL component breakdown">
        ${infoRow("\uD83C\uDF10", "Protocol",  protocol)}
        ${infoRow("\uD83C\uDFE0", "Hostname",  hostname)}
        ${infoRow("\uD83E\uDDE9", "Subdomain", subdomain)}
        ${infoRow("\uD83C\uDF0D", "Domain",    domain)}
        ${infoRow("\uD83C\uDFF7\uFE0F", "TLD", tld)}
        ${infoRow("\uD83D\uDCC2", "Path",      path)}
        ${infoRow("\uD83D\uDD0D", "Query",     query)}
        ${infoRow("\uD83D\uDD16", "Fragment",  fragment)}
      </div>
    </div>`;
}

// Expose to global scope so script.js (non-module) can call it directly.
window.renderDomainInfoCard = renderDomainInfoCard;
