// ─────────────────────────────
// LOADER
// ─────────────────────────────

window.addEventListener('load', () => {

  setTimeout(() => {

    const loader = document.getElementById('loader');
    const main = document.getElementById('mainPage');

    loader.classList.add('fade-out');

    setTimeout(() => {
      loader.style.display = 'none';
      main.classList.remove('hidden');

      // Move focus to main content after loader for screen readers
      main.setAttribute('tabindex', '-1');
      main.focus();

    }, 500);

  }, 3200);

});

// ─────────────────────────────
// TEAM — collapsible
// ─────────────────────────────

const team = [
  { name: "Mrinal Roy", img: "Mrinal.jpg" },
  { name: "Rahul Sah", img: "Rahul.jpg" },
  { name: "Swastika Shaw", img: "Swastika.jpg" },
  { name: "Arpita Roy", img: "Arpita.jpg" },
  { name: "Disha Samanta", img: "Disha.jpg" },
];

(function buildTeam() {

  const grid = document.getElementById('teamGrid');

  grid.innerHTML = team.map(m => {

    const initials = m.name
      .split(' ')
      .map(w => w[0])
      .join('');

    return `
      <div class="member-card" role="listitem">

        <div class="member-avatar">

          <img
            src="${m.img}"
            alt="${m.name} - Team Member"
            onerror="this.parentElement.innerHTML='${initials}'"
          >

        </div>

        <div class="member-name">
          ${m.name}
        </div>

      </div>
    `;

  }).join('');

  // Add list role to grid for screen readers
  grid.setAttribute('role', 'list');
  grid.setAttribute('aria-label', 'Team members');

})();

let teamOpen = false;

function toggleTeam() {

  teamOpen = !teamOpen;

  const wrap = document.getElementById('teamGridWrap');
  const toggle = document.getElementById('teamToggle');

  if (teamOpen) {

    wrap.classList.add('open');
    toggle.classList.add('open');

    toggle.setAttribute('aria-label', 'Hide team members');
    toggle.setAttribute('aria-expanded', 'true');

  } else {

    wrap.classList.remove('open');
    toggle.classList.remove('open');

    toggle.setAttribute('aria-label', 'Show team members');
    toggle.setAttribute('aria-expanded', 'false');
  }
}

// ─────────────────────────────
// SECURITY TIPS
// ─────────────────────────────

const TIPS = {

  MALWARE: [
    'Never download files or software from untrusted or unfamiliar websites.',
    'Keep your antivirus software updated and run regular scans.',
    'Avoid clicking links in unsolicited emails or messages — they may silently install malware.',
    'Use a reputable ad blocker; malicious ads can trigger drive-by downloads.',
    'Keep your OS and browser updated — patches close exploits malware relies on.',
  ],

  SOCIAL_ENGINEERING: [
    'Legitimate websites never ask for your password via email or a popup.',
    'Always check the full URL carefully — phishing sites mimic real ones with subtle typos.',
    'Look for HTTPS and a valid padlock before entering any personal information.',
    'When in doubt, go directly to the official website instead of clicking a link.',
    'Enable two-factor authentication (2FA) so stolen passwords alone cannot access your accounts.',
  ],

  UNWANTED_SOFTWARE: [
    'Only install software from official sources like verified app stores or developer sites.',
    'Read permissions carefully before installing browser extensions or apps.',
    'Regularly audit installed programs and remove anything you do not recognise.',
    'Avoid "free" software bundles — they often include unwanted programs bundled silently.',
    'Use a browser with built-in protection against unwanted software downloads.',
  ],

  POTENTIALLY_HARMFUL_APPLICATION: [
    'Avoid sideloading apps from outside official stores unless you fully trust the source.',
    'Check app reviews and publisher details before granting installation permissions.',
    'Revoke unnecessary permissions for apps that request access to sensitive data.',
    'Keep your device OS updated to protect against known app vulnerabilities.',
    'Use a mobile security app to scan for potentially harmful applications.',
  ],

  general: [
    'Use a password manager to generate and store strong, unique passwords.',
    'Enable two-factor authentication on every account that supports it.',
    'Regularly back up important data to an offline or encrypted cloud location.',
    'Avoid using public Wi-Fi for banking or sensitive logins without a VPN.',
    'Review your privacy settings on social media — oversharing aids social engineering.',
    'Check "Have I Been Pwned" (haveibeenpwned.com) to see if your email was leaked.',
    'Be sceptical of urgency — scammers manufacture time pressure to bypass your judgement.',
    'Lock your devices with a strong PIN or biometric — physical access is a real threat.',
    'Use a DNS-level blocker like 1.1.1.1 with filtering to block malicious domains.',
    'Think before you click. Pause, inspect the URL, then decide.',
  ],

};

// Tracks last shown general tip index to avoid repeats
let lastGeneralTipIndex = -1;

function getRandomTip(arr, lastIndex = -1) {
  let index;
  do {
    index = Math.floor(Math.random() * arr.length);
  } while (arr.length > 1 && index === lastIndex);
  lastGeneralTipIndex = index;
  return { tip: arr[index], index };
}

function buildTipsHtml(threatTypes) {

  const isThreat = threatTypes && threatTypes.length > 0;

  if (isThreat) {

    // Collect unique tip sets for each detected threat type
    const sections = [];

    const threatLabels = {
      MALWARE: { label: 'Malware', icon: '🦠' },
      SOCIAL_ENGINEERING: { label: 'Phishing / Social Engineering', icon: '🎣' },
      UNWANTED_SOFTWARE: { label: 'Unwanted Software', icon: '📦' },
      POTENTIALLY_HARMFUL_APPLICATION: { label: 'Harmful Application', icon: '⚠️' },
    };

    threatTypes.forEach(threat => {
      const tipPool = TIPS[threat];
      if (!tipPool) return;

      const meta = threatLabels[threat] || { label: threat, icon: '⚠️' };

      // Pick 3 random non-repeating tips from the pool
      const shuffled = [...tipPool].sort(() => Math.random() - 0.5).slice(0, 3);

      sections.push(`
        <div class="tips-threat-section">
          <div class="tips-threat-label">
            <span aria-hidden="true">${meta.icon}</span> ${meta.label} Tips
          </div>
          <ul class="tips-list" role="list">
            ${shuffled.map(t => `<li role="listitem">${t}</li>`).join('')}
          </ul>
        </div>
      `);
    });

    return `
      <div class="tips-card danger-tips" role="region" aria-label="Safety tips for detected threats">
        <div class="tips-header">
          <span class="tips-header-icon" aria-hidden="true">🛡️</span>
          <span class="tips-header-title">Stay Safe — What To Do Next</span>
        </div>
        <div class="tips-body">
          ${sections.join('')}
          <p class="tips-footer-note">Do <strong>not</strong> visit this URL. Report it to your IT team or via <a href="https://safebrowsing.google.com/safebrowsing/report_phish/" target="_blank" rel="noopener noreferrer">Google Safe Browsing Report</a>.</p>
        </div>
      </div>
    `;

  } else {

    // Safe URL — show a random rotating general tip
    const { tip } = getRandomTip(TIPS.general, lastGeneralTipIndex);

    return `
      <div class="tips-card safe-tips" role="region" aria-label="Cybersecurity awareness tip">
        <div class="tips-header">
          <span class="tips-header-icon" aria-hidden="true">💡</span>
          <span class="tips-header-title">Cybersecurity Tip of the Scan</span>
        </div>
        <div class="tips-body">
          <p class="tips-general-tip">${tip}</p>
          <button type="button" class="tips-refresh-btn" onclick="refreshGeneralTip()" aria-label="Show another cybersecurity tip">
            🔄 Show another tip
          </button>
        </div>
      </div>
    `;

  }
}

function refreshGeneralTip() {
  const { tip } = getRandomTip(TIPS.general, lastGeneralTipIndex);
  const tipEl = document.querySelector('.tips-general-tip');
  if (tipEl) {
    tipEl.style.opacity = '0';
    setTimeout(() => {
      tipEl.textContent = tip;
      tipEl.style.opacity = '1';
    }, 200);
  }
}

function showTips(threatTypes) {
  const resultEl = document.getElementById('result');
  if (!resultEl) return;

  // Remove any existing tips card
  const existing = resultEl.querySelector('.tips-card');
  if (existing) existing.remove();

  const tipsHtml = buildTipsHtml(threatTypes);
  resultEl.insertAdjacentHTML('beforeend', tipsHtml);
}

// ─────────────────────────────
// SCANNER
// ─────────────────────────────

let totalScans = 0;
let safeCount = 0;
let dangerCount = 0;

// Validate URL

function isValidUrl(urlString) {

  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }

}

// Format & Validate URL

function formatAndValidateUrl(input) {

  if (!input || input.trim() === '') {

    return {
      valid: false,
      error: 'Enter a URL',
      url: null
    };

  }

  let url = input.trim();

  // Auto add HTTPS

  if (
    !url.startsWith('http://') &&
    !url.startsWith('https://')
  ) {
    url = 'https://' + url;
  }

  if (!isValidUrl(url)) {

    return {
      valid: false,
      error: 'Invalid URL format. Please enter a valid website URL.',
      url: null
    };

  }

  try {

    const urlObj = new URL(url);

    if (!urlObj.hostname) {

      return {
        valid: false,
        error: 'URL must include a domain name.',
        url: null
      };

    }

    return {
      valid: true,
      error: null,
      url: url
    };

  } catch (e) {

    return {
      valid: false,
      error: 'Invalid URL. Please check and try again.',
      url: null
    };

  }

}

// Fill Example URL

function fillExample(url) {

  const input = document.getElementById('urlInput');
  input.value = url;
  input.focus();

  // Update aria-label to reflect filled value for screen readers
  input.setAttribute('aria-label', `URL input, filled with ${url}. Press Enter or click Scan URL to scan.`);

}

// Update Stats

function updateStats(type) {

  totalScans++;

  if (type === 'safe') {
    safeCount++;
  }

  if (type === 'danger') {
    dangerCount++;
  }

  document.getElementById('totalScans').textContent = totalScans;
  document.getElementById('safeCount').textContent = safeCount;
  document.getElementById('dangerCount').textContent = dangerCount;

}

function calculateRiskScore(url, isThreat) {
  let score = 0;
  const breakdown = [];

  // 1. Existing threat status
  if (isThreat) {
    score += 50;
    breakdown.push({ text: 'Google Safe Browsing flagged as threat', type: 'danger' });
  } else {
    breakdown.push({ text: 'Safe Browsing found no known threats', type: 'safe' });
  }

  // 2. HTTPS usage
  if (url.startsWith('https://')) {
    breakdown.push({ text: 'HTTPS enabled', type: 'safe' });
  } else {
    score += 20;
    breakdown.push({ text: 'Not using HTTPS (Insecure connection)', type: 'warning' });
  }

  // 3. URL length
  if (url.length > 75) {
    score += 15;
    breakdown.push({ text: 'URL length unusually high', type: 'warning' });
  } else {
    breakdown.push({ text: 'Standard URL length', type: 'safe' });
  }

  // 4. Suspicious characters
  const suspiciousChars = /[@!*'<>()]/;
  if (suspiciousChars.test(url)) {
    score += 15;
    breakdown.push({ text: 'Suspicious characters detected', type: 'warning' });
  }

  // 5. IP-based URL
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
  if (ipRegex.test(url)) {
    score += 20;
    breakdown.push({ text: 'IP-based domain detected', type: 'danger' });
  }

  // 6. Excessive subdomains
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    const parts = urlObj.hostname.split('.');
    if (parts.length > 3) {
      score += 10;
      breakdown.push({ text: 'Excessive subdomains used', type: 'warning' });
    } else {
       breakdown.push({ text: 'Domain structure appears normal', type: 'safe' });
    }
  } catch (e) {
    score += 20;
    breakdown.push({ text: 'Invalid or complex domain structure', type: 'danger' });
  }

  score = Math.min(100, score);

  let confidence = isThreat ? 99 : 88;
  if (!isThreat && score > 20) confidence -= 12;

  return { score, confidence, breakdown };
}

function showResult(type, title, desc, url, threats) {

  const icons = {
    safe: '✓',
    danger: '✕',
    loading: '',
    error: '!'
  };

  // Map result type to human-readable label for screen readers
  const ariaLabels = {
    safe: 'Safe',
    danger: 'Danger',
    error: 'Error',
    loading: 'Loading'
  };

  const isThreat = type === 'danger';
  let riskSectionHtml = '';
  let riskData = null;

  if ((type === 'safe' || type === 'danger') && url) {
    riskData = calculateRiskScore(url, isThreat);

    let meterColor = 'var(--accent-1)';
    if (riskData.score > 30) meterColor = '#fbbf24';
    if (riskData.score > 60) meterColor = '#f87171';

    let breakdownHtml = riskData.breakdown.map(item => {
      let icon = '';
      let iconLabel = '';
      if (item.type === 'safe') {
        icon = `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ffb4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        iconLabel = 'Safe';
      } else if (item.type === 'warning') {
        icon = `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        iconLabel = 'Warning';
      } else if (item.type === 'danger') {
        icon = `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        iconLabel = 'Danger';
      }

      return `<div class="breakdown-item ${item.type}" role="listitem"><span class="sr-only">${iconLabel}:</span>${icon} <span>${item.text}</span></div>`;
    }).join('');

    riskSectionHtml = `
      <div class="risk-analysis" role="region" aria-label="Risk Analysis">
        <div class="risk-header">
          <div class="risk-stat">
            <div class="risk-stat-value" style="color: ${meterColor}"><span id="animated-score" aria-label="Risk score">0</span><span class="risk-stat-max" aria-hidden="true">/100</span></div>
            <div class="risk-stat-label">Risk Score</div>
          </div>
          <div class="risk-stat">
            <div class="risk-stat-value"><span id="animated-confidence" aria-label="Confidence percentage">0</span>%</div>
            <div class="risk-stat-label">Confidence</div>
          </div>
        </div>

        <div class="risk-meter-wrap" role="progressbar" aria-valuenow="${riskData.score}" aria-valuemin="0" aria-valuemax="100" aria-label="Risk level meter">
          <div class="risk-meter-bar" style="width: 0%; background-color: ${meterColor};" data-target-width="${riskData.score}%"></div>
        </div>

        <div class="risk-breakdown" role="list" aria-label="Risk breakdown details">
          ${breakdownHtml}
        </div>
      </div>
    `;
  }

  document.getElementById('result').innerHTML = `

    <div class="result-card ${type}" role="region" aria-label="Scan result: ${ariaLabels[type] || type}">

      <div class="result-icon" aria-hidden="true">

        ${
          type === 'loading'
            ? '<div class="spinner"></div>'
            : type === 'scan-loading'
            ? ''
            : `<span>${icons[type]}</span>`
        }

      </div>

      <div class="result-body">
        <div class="result-title">${title}</div>
        <div class="result-desc">${desc}</div>
        ${url ? `<div class="result-url" aria-label="Scanned URL: ${url}">${url}</div>` : ''}
        ${threats && threats.length
          ? `<div class="threat-tags" role="list" aria-label="Detected threats">${threats.map(t =>
              `<span class="threat-tag" role="listitem">${t}</span>`).join('')}</div>`
          : ''}
        ${(type === 'safe' || type === 'danger') ? `
          <div class="export-btns">
            <button type="button" onclick="downloadPDF()" class="export-btn export-btn-pdf" aria-label="Download scan report as PDF">⬇ Download PDF</button>
            <button type="button" onclick="downloadImage()" class="export-btn export-btn-img" aria-label="Download scan report as image">⬇ Download Image</button>
          </div>` : ''}
      </div>
    </div>`;

  // Move focus to result div so screen readers announce the outcome
  const resultEl = document.getElementById('result');
  resultEl.setAttribute('tabindex', '-1');
  resultEl.focus();

  if (riskSectionHtml) {
    // Append risk section inside result div, after the result card
    resultEl.insertAdjacentHTML('beforeend', riskSectionHtml);

    setTimeout(() => {
      const bar = document.querySelector('.risk-meter-bar');
      if (bar) {
        bar.style.width = bar.getAttribute('data-target-width');
      }

      const scoreEl = document.getElementById('animated-score');
      if (scoreEl && riskData) {
        let start = 0;
        const end = riskData.score;
        const duration = 1200;
        const interval = 20;
        const step = end / (duration / interval) || 0;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) {
            start = end;
            clearInterval(timer);
          }
          scoreEl.textContent = Math.round(start);
        }, interval);
      }

      const confEl = document.getElementById('animated-confidence');
      if (confEl && riskData) {
        let startConf = 0;
        const endConf = riskData.confidence;
        const durationConf = 1200;
        const intervalConf = 20;
        const stepConf = endConf / (durationConf / intervalConf) || 0;
        const timerConf = setInterval(() => {
          startConf += stepConf;
          if (startConf >= endConf) {
            startConf = endConf;
            clearInterval(timerConf);
          }
          confEl.textContent = Math.round(startConf);
        }, intervalConf);
      }
    }, 50);
  }
}

// ─────────────────────────────
// MAIN SECURITY CHECK
// ─────────────────────────────

async function checkSecurity() {

  const input =
    document.getElementById('urlInput').value;

  const validation =
    formatAndValidateUrl(input);

  // Validation failed

  if (!validation.valid) {

    showResult(
      'error',
      'Invalid Input',
      validation.error,
      '',
      []
    );

    return;
  }

  const url = validation.url;

  const typoCard = document.getElementById('typosquattingCard');
  if (typoCard) {
    typoCard.classList.add('hidden');
  }

  const btn =
    document.getElementById('scanBtn');

  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  btn.setAttribute('aria-label', 'Scanning URL, please wait...');

  // Loading State — enhanced scan animation

  document.getElementById('result').innerHTML = `
    <div class="result-card loading" role="status" aria-live="polite" aria-label="Scanning in progress">
      <div class="result-body">
        <div class="scan-loading">
          <div class="scan-shield-wrap" aria-hidden="true">
            <div class="scan-shield-ring-outer"></div>
            <div class="scan-shield-ring"></div>
            <div class="scan-shield-icon">
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" stroke-width="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
          <div>
            <div class="result-title" style="text-align:center;">Scanning URL...</div>
            <div class="result-url" style="text-align:center;margin-top:8px;" aria-label="URL being scanned: ${url}">${url}</div>
          </div>
          <div class="scan-progress-wrap" aria-hidden="true">
            <div class="scan-progress-bar">
              <div class="scan-progress-fill"></div>
            </div>
            <div class="scan-status-text">
              <span class="scan-status-step">Checking threat databases...</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  // Animate status text steps
  const statusEl = document.querySelector('.scan-status-step');
  const steps = [
    'Connecting to Safe Browsing API...',
    'Analyzing URL patterns...',
    'Checking threat databases...',
    'Finalizing results...'
  ];
  let stepIndex = 0;
  const stepTimer = setInterval(() => {
    stepIndex++;
    if (stepIndex < steps.length && statusEl) {
      statusEl.textContent = steps[stepIndex];
    } else {
      clearInterval(stepTimer);
    }
  }, 800);

  try {
    const apiHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3002'
      : 'https://cybershield-sxz0.onrender.com';
    const response = await fetch(`${apiHost}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error('Server error ' + response.status);
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    if (data.matches && data.matches.length > 0) {
      const allThreats = data.matches.map(m => m.threatType);
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const hasPhishing = allThreats.includes('SOCIAL_ENGINEERING');
      const hasMalware = allThreats.includes('MALWARE');
      const hasUnwanted = allThreats.includes('UNWANTED_SOFTWARE');
      const hasHarmful = allThreats.includes('POTENTIALLY_HARMFUL_APPLICATION');
      const threats = [...new Set(allThreats.map(t => t.replace(/_/g, ' ')))];
      updateStats('danger');
      showResult('danger', 'Threat Detected!',
        `This URL is flagged as dangerous. Do not visit it.<br><br>
        <div class="breakdown" role="list" aria-label="Security breakdown">
          <div class="breakdown-item" role="listitem">
            <span aria-hidden="true">${isHttps ? '✅' : '⚠️'}</span>
            <span class="sr-only">${isHttps ? 'Secure' : 'Insecure'}:</span>
            <b>HTTPS:</b> ${isHttps ? 'Secure connection' : 'Not secure'}
          </div>
          <div class="breakdown-item" role="listitem">
            <span aria-hidden="true">${hasMalware ? '🔴' : '✅'}</span>
            <span class="sr-only">${hasMalware ? 'Detected' : 'Clear'}:</span>
            <b>Malware:</b> ${hasMalware ? 'Detected!' : 'No malware detected'}
          </div>
          <div class="breakdown-item" role="listitem">
            <span aria-hidden="true">${hasPhishing ? '🔴' : '✅'}</span>
            <span class="sr-only">${hasPhishing ? 'Detected' : 'Clear'}:</span>
            <b>Phishing:</b> ${hasPhishing ? 'Phishing detected!' : 'No phishing detected'}
          </div>
          <div class="breakdown-item" role="listitem">
            <span aria-hidden="true">${hasUnwanted ? '🔴' : '✅'}</span>
            <span class="sr-only">${hasUnwanted ? 'Detected' : 'Clear'}:</span>
            <b>Unwanted Software:</b> ${hasUnwanted ? 'Detected!' : 'None detected'}
          </div>
          <div class="breakdown-item" role="listitem">
            <span aria-hidden="true">${hasHarmful ? '🔴' : '✅'}</span>
            <span class="sr-only">${hasHarmful ? 'Detected' : 'Clear'}:</span>
            <b>Harmful App:</b> ${hasHarmful ? 'Detected!' : 'None detected'}
          </div>
        </div>`, url, threats);

      // Show threat-specific tips
      showTips(allThreats);
      showDomainReputation(url);
    } else {
      updateStats('safe');
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const allThreats = data.matches ? data.matches.map(m => m.threatType) : [];
      const hasPhishing = allThreats.includes('SOCIAL_ENGINEERING');
      const hasMalware = allThreats.includes('MALWARE');
      const hasUnwanted = allThreats.includes('UNWANTED_SOFTWARE');
      const hasHarmful = allThreats.includes('POTENTIALLY_HARMFUL_APPLICATION');

      showResult('safe', 'URL is Safe',
        `No threats detected. Google Safe Browsing found no issues.<br><br>
        <div class="breakdown" role="list" aria-label="Security breakdown">
          <div class="breakdown-item" role="listitem">
            <span aria-hidden="true">${isHttps ? '✅' : '⚠️'}</span>
            <span class="sr-only">${isHttps ? 'Secure' : 'Warning'}:</span>
            <b>HTTPS:</b> ${isHttps ? 'Secure connection' : 'Not secure — use with caution'}
          </div>
          <div class="breakdown-item" role="listitem">
            <span aria-hidden="true">${hasMalware ? '🔴' : '✅'}</span>
            <span class="sr-only">${hasMalware ? 'Detected' : 'Clear'}:</span>
            <b>Malware:</b> ${hasMalware ? 'Detected!' : 'No malware detected'}
          </div>
          <div class="breakdown-item" role="listitem">
            <span aria-hidden="true">${hasPhishing ? '🔴' : '✅'}</span>
            <span class="sr-only">${hasPhishing ? 'Detected' : 'Clear'}:</span>
            <b>Phishing:</b> ${hasPhishing ? 'Phishing detected!' : 'No phishing detected'}
          </div>
          <div class="breakdown-item" role="listitem">
            <span aria-hidden="true">${hasUnwanted ? '🔴' : '✅'}</span>
            <span class="sr-only">${hasUnwanted ? 'Detected' : 'Clear'}:</span>
            <b>Unwanted Software:</b> ${hasUnwanted ? 'Detected!' : 'None detected'}
          </div>
          <div class="breakdown-item" role="listitem">
            <span aria-hidden="true">${hasHarmful ? '🔴' : '✅'}</span>
            <span class="sr-only">${hasHarmful ? 'Detected' : 'Clear'}:</span>
            <b>Harmful App:</b> ${hasHarmful ? 'Detected!' : 'None detected'}
          </div>
        </div>`, url, []);

      // Show rotating general tip
      showTips([]);
      showDomainReputation(url);
    }

    if (data.typosquatting) {
      const typoCard = document.getElementById('typosquattingCard');
      if (typoCard) {
        typoCard.classList.remove('hidden');
        renderFamilyTree(data.typosquatting);
      }
    }

  } catch (err) {
    showResult('error', 'Scan Error',
      `An unexpected error occurred.<br>
       <small style="color:#334155">Error: ${err.message}</small>`,
      '', []);
  } finally {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    btn.setAttribute('aria-label', 'Scan the entered URL for security threats');
  }

}

document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkSecurity();
});

async function captureReport() {
  const card = document.querySelector('#result .result-card');
  if (!card) return null;

  const reportDiv = document.createElement('div');
  reportDiv.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    width: 600px; padding: 32px;
    background: #1e293b; border-radius: 12px;
    font-family: sans-serif; color: #f1f5f9;
  `;
  reportDiv.setAttribute('aria-hidden', 'true');
  reportDiv.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="background:#0f766e;width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;">🛡️</div>
      <div>
        <div style="font-size:20px;font-weight:700;color:#00ffb4;">CyberShield Report</div>
        <div style="font-size:12px;color:#94a3b8;">${new Date().toLocaleString()}</div>
      </div>
    </div>
    <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:16px;">
      ${card.querySelector('.result-title') ? `<div style="font-size:18px;font-weight:700;color:#00ffb4;margin-bottom:8px;">${card.querySelector('.result-title').innerText}</div>` : ''}
      ${card.querySelector('.result-url') ? `<div style="font-size:13px;color:#94a3b8;margin-bottom:12px;">${card.querySelector('.result-url').innerText}</div>` : ''}
      <div style="font-size:14px;color:#cbd5e1;line-height:1.8;">
        ${card.querySelector('.breakdown') ? card.querySelector('.breakdown').innerText.split('\n').filter(l => l.trim()).map(l => `<div style="padding:4px 0;border-bottom:1px solid #1e293b;">${l}</div>`).join('') : ''}
      </div>
    </div>
    ${card.querySelector('.threat-tags') ? `<div style="margin-top:12px;">${card.querySelector('.threat-tags').innerText.split('\n').map(t => `<span style="background:#7f1d1d;color:#fca5a5;padding:4px 10px;border-radius:20px;font-size:12px;margin-right:6px;">${t}</span>`).join('')}</div>` : ''}
  `;
  document.body.appendChild(reportDiv);
  const canvas = await html2canvas(reportDiv, { scale: 2, backgroundColor: '#1e293b' });
  document.body.removeChild(reportDiv);
  return canvas;
}

async function downloadImage() {
  const canvas = await captureReport();
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'cybershield-report.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

async function downloadPDF() {
  const canvas = await captureReport();
  if (!canvas) return;
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 20, pageWidth, imgHeight);
  pdf.save('cybershield-report.pdf');
}
// ─────────────────────────────
// DOMAIN REPUTATION
// ─────────────────────────────

async function showDomainReputation(url) {
  const resultEl = document.getElementById('result');

  // Remove existing domain card
  const existing = resultEl.querySelector('.domain-card');
  if (existing) existing.remove();

  // Placeholder while loading
  const placeholder = document.createElement('div');
  placeholder.className = 'domain-card loading-domain';
  placeholder.innerHTML = `<div class="domain-loading">🔍 Looking up domain info...</div>`;
  resultEl.insertAdjacentElement('beforeend', placeholder);

  try {
    const apiHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000'
      : 'https://cybershield-sxz0.onrender.com';

    const response = await fetch(`${apiHost}/domain-info?domain=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error);

    const trustColor = data.trustScore >= 70 ? '#00ffb4' : data.trustScore >= 40 ? '#fbbf24' : '#f87171';
    const trustLabel = data.trustScore >= 70 ? 'Trusted' : data.trustScore >= 40 ? 'Moderate' : 'Low Trust';

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

    placeholder.outerHTML = `
      <div class="domain-card" role="region" aria-label="Domain Reputation">
        <div class="domain-header">
          <span class="domain-header-icon" aria-hidden="true">🌐</span>
          <span class="domain-header-title">Domain Reputation</span>
          <span class="domain-trust-badge" style="color: ${trustColor}; border-color: ${trustColor};">
            ${trustLabel} · ${data.trustScore}/100
          </span>
        </div>
        <div class="domain-grid">
          <div class="domain-stat">
            <div class="domain-stat-label">Domain</div>
            <div class="domain-stat-value">${data.domain}</div>
          </div>
          <div class="domain-stat">
            <div class="domain-stat-label">Age</div>
            <div class="domain-stat-value">${data.ageYears !== null ? data.ageYears + ' years' : 'N/A'}</div>
          </div>
          <div class="domain-stat">
            <div class="domain-stat-label">Registered</div>
            <div class="domain-stat-value">${formatDate(data.registered)}</div>
          </div>
          <div class="domain-stat">
            <div class="domain-stat-label">Expires</div>
            <div class="domain-stat-value">${formatDate(data.expiry)}</div>
          </div>
          <div class="domain-stat">
            <div class="domain-stat-label">Registrar</div>
            <div class="domain-stat-value">${data.registrar || 'N/A'}</div>
          </div>
          <div class="domain-stat">
            <div class="domain-stat-label">Nameservers</div>
            <div class="domain-stat-value">${data.nameservers.length ? data.nameservers.join(', ') : 'N/A'}</div>
          </div>
        </div>
        ${data.status.length ? `
        <div class="domain-status">
          ${data.status.map(s => `<span class="domain-status-tag">${s}</span>`).join('')}
        </div>` : ''}
      </div>
    `;

  } catch (err) {
    placeholder.outerHTML = `
      <div class="domain-card domain-error" role="region" aria-label="Domain Reputation">
        <div class="domain-header">
          <span aria-hidden="true">🌐</span>
          <span class="domain-header-title">Domain Reputation</span>
        </div>
        <p class="domain-error-msg">Could not fetch domain info: ${err.message}</p>
      </div>
    `;
  }
}
// ─────────────────────────────
// THEME TOGGLE
// ─────────────────────────────

(function initTheme() {

  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme') || 'dark';

  applyTheme(saved);

  if (btn) {
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.contains('light-mode');
      applyTheme(isLight ? 'dark' : 'light');
    });
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
      if (btn) {
        btn.textContent = '☀️';
        btn.setAttribute('aria-label', 'Switch to dark mode');
        btn.setAttribute('aria-pressed', 'false');
      }
    } else {
      document.documentElement.classList.remove('light-mode');
      if (btn) {
        btn.textContent = '🌙';
        btn.setAttribute('aria-label', 'Switch to light mode');
        btn.setAttribute('aria-pressed', 'true');
      }
    }
    localStorage.setItem('theme', theme);
  }

})();