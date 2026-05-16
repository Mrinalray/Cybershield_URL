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
      <div class="member-card">

        <div class="member-avatar">

          <img
            src="${m.img}"
            alt="${m.name}"
            onerror="this.parentElement.innerHTML='${initials}'"
          >

        </div>

        <div class="member-name">
          ${m.name}
        </div>

      </div>
    `;

  }).join('');

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

  document.getElementById('urlInput').value = url;
  document.getElementById('urlInput').focus();

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

// Show Result Card

function showResult(type, title, desc, url, threats) {

  const icons = {
    safe: '✓',
    danger: '✕',
    loading: '',
    error: '!'
  };

  document.getElementById('result').innerHTML = `

    <div class="result-card ${type}">

      <div class="result-icon">

        ${
          type === 'loading'
            ? '<div class="spinner"></div>'
            : `<span>${icons[type]}</span>`
        }

      </div>

      <div class="result-body">

        <div class="result-title">
          ${title}
        </div>

        <div class="result-desc">
          ${desc}
        </div>

        ${
          url
            ? `<div class="result-url">${url}</div>`
            : ''
        }

        ${
          threats && threats.length
            ? `
              <div class="threat-tags">
                ${threats.map(t =>
                  `<span class="threat-tag">${t}</span>`
                ).join('')}
              </div>
            `
            : ''
        }

      </div>

    </div>
  `;
}

// ─────────────────────────────
// RISK ANALYSIS
// ─────────────────────────────

function showRiskAnalysis(score, confidence, status) {

  const riskSection = document.getElementById('riskAnalysis');

  const riskFill = document.getElementById('riskFill');

  const confidenceFill =
    document.getElementById('confidenceFill');

  const riskText =
    document.getElementById('riskScoreText');

  const confidenceText =
    document.getElementById('confidenceText');

  const riskLabel =
    document.getElementById('riskLabel');

  riskSection.classList.remove('hidden');

  // Reset Classes

  riskFill.classList.remove(
    'safe',
    'warning',
    'danger'
  );

  confidenceFill.classList.remove(
    'safe',
    'warning',
    'danger'
  );

  let levelClass = 'safe';
  let label = 'LOW RISK';

  if (score >= 70) {

    levelClass = 'danger';
    label = 'HIGH RISK';

  } else if (score >= 40) {

    levelClass = 'warning';
    label = 'MEDIUM RISK';

  }

  riskFill.classList.add(levelClass);
  confidenceFill.classList.add(levelClass);

  // Reset widths before animation

  riskFill.style.width = '0%';
  confidenceFill.style.width = '0%';

  // Animate

  setTimeout(() => {

    riskFill.style.width = `${score}%`;
    confidenceFill.style.width = `${confidence}%`;

  }, 100);

  riskText.innerHTML =
    `Risk Score: <strong>${score}%</strong>`;

  confidenceText.innerHTML =
    `Confidence Level: <strong>${confidence}%</strong>`;

  riskLabel.textContent = label;
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

  const btn =
    document.getElementById('scanBtn');

  btn.disabled = true;

  // Loading State

  showResult(
    'loading',
    'Scanning...',
    'Checking against threat databases. Please wait.',
    url,
    []
  );

  try {

    const response = await fetch(
      'https://cybershield-sxz0.onrender.com/check',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({ url })
      }
    );

    if (!response.ok) {
      throw new Error(
        'Server error ' + response.status
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // ─────────────────────────
    // THREAT DETECTED
    // ─────────────────────────

    if (data.matches && data.matches.length > 0) {

      const threats = [
        ...new Set(
          data.matches.map(m =>
            m.threatType.replace(/_/g, ' ')
          )
        )
      ];

      updateStats('danger');

      showResult(
        'danger',
        'Threat Detected!',
        'This URL is flagged as dangerous. Do not visit it.',
        url,
        threats
      );

      // Show High Risk Meter

      showRiskAnalysis(
        92,
        96,
        'danger'
      );

    }

    // ─────────────────────────
    // SAFE URL
    // ─────────────────────────

    else {

      updateStats('safe');

      showResult(
        'safe',
        'URL is Safe',
        'No threats detected. Google Safe Browsing found no issues.',
        url,
        []
      );

      // Show Low Risk Meter

      showRiskAnalysis(
        12,
        94,
        'safe'
      );

    }

  }

  // ─────────────────────────
  // ERROR HANDLING
  // ─────────────────────────

  catch (err) {

    showResult(
      'error',
      'Backend Not Connected',

      `Make sure your backend server is running.<br>
       <small style="color:#334155">
         Error: ${err.message}
       </small>`,

      '',
      []
    );

  }

  finally {

    btn.disabled = false;

  }

}

// ─────────────────────────────
// ENTER KEY SUPPORT
// ─────────────────────────────

document
  .getElementById('urlInput')
  .addEventListener('keydown', e => {

    if (e.key === 'Enter') {
      checkSecurity();
    }

  });
  
