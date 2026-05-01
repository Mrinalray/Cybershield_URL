// ════════════════════════════
//  LOADER
// ════════════════════════════
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    const main = document.getElementById('mainPage');
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
      main.classList.remove('hidden');
      loadHistory(); // ← restore history after page reveals
    }, 500);
  }, 3200);
});


// ════════════════════════════
//  TEAM — collapsible
// ════════════════════════════
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
    const initials = m.name.split(' ').map(w => w[0]).join('');
    return `
      <div class="member-card">
        <div class="member-avatar">
          <img src="${m.img}" alt="${m.name}"
            onerror="this.parentElement.textContent='${initials}'">
        </div>
        <div class="member-name">${m.name}</div>
      </div>`;
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
    toggle.setAttribute('aria-label', 'Hide team');
  } else {
    wrap.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-label', 'Show team');
  }
}


// ════════════════════════════
//  SCANNER
// ════════════════════════════
let totalScans = 0, safeCount = 0, dangerCount = 0;

function fillExample(url) {
  document.getElementById('urlInput').value = url;
  document.getElementById('urlInput').focus();
}

function updateStats(type) {
  totalScans++;
  if (type === 'safe') safeCount++;
  if (type === 'danger') dangerCount++;
  document.getElementById('totalScans').textContent = totalScans;
  document.getElementById('safeCount').textContent = safeCount;
  document.getElementById('dangerCount').textContent = dangerCount;
}

function showResult(type, title, desc, url, threats) {
  const icons = { safe: '✓', danger: '✕', loading: '', error: '!' };
  document.getElementById('result').innerHTML = `
    <div class="result-card ${type}">
      <div class="result-icon">
        ${type === 'loading'
      ? '<div class="spinner"></div>'
      : `<span>${icons[type]}</span>`}
      </div>
      <div class="result-body">
        <div class="result-title">${title}</div>
        <div class="result-desc">${desc}</div>
        ${url ? `<div class="result-url">${url}</div>` : ''}
        ${threats && threats.length
      ? `<div class="threat-tags">${threats.map(t =>
        `<span class="threat-tag">${t}</span>`).join('')}</div>`
      : ''}
      </div>
    </div>`;
}

async function checkSecurity() {
  const input = document.getElementById('urlInput').value.trim();
  if (!input) {
    showResult('error', 'Enter a URL', 'Please type a URL to scan above.', '', []);
    return;
  }

  let url = input;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const btn = document.getElementById('scanBtn');
  btn.disabled = true;
  showResult('loading', 'Scanning...', 'Checking against threat databases. Please wait.', url, []);

  try {
    const response = await fetch('https://cybershield-sxz0.onrender.com/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error('Server error ' + response.status);
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    if (data.matches && data.matches.length > 0) {
      const threats = [...new Set(data.matches.map(m => m.threatType.replace(/_/g, ' ')))];
      updateStats('danger');
      showResult('danger', 'Threat Detected!',
        'This URL is flagged as dangerous. Do not visit it.', url, threats);
      saveToHistory({ url, type: 'danger', title: 'Threat Detected', threats });
    } else {
      updateStats('safe');
      showResult('safe', 'URL is Safe',
        'No threats detected. Google Safe Browsing found no issues.', url, []);
      saveToHistory({ url, type: 'safe', title: 'Safe', threats: [] });
    }

  } catch (err) {
    showResult('error', 'Backend Not Connected',
      `Make sure your backend server is running.<br>
       <small style="color:#334155">Error: ${err.message}</small>`,
      '', []);
    // Do not save failed/error scans to history
  } finally {
    btn.disabled = false;
  }
}

document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkSecurity();
});


// ════════════════════════════
//  SCAN HISTORY  (localStorage)
// ════════════════════════════
const HISTORY_KEY = 'cybershield_scan_history';
const MAX_HISTORY = 50;

function saveToHistory(scan) {
  let history = getHistory();

  // Remove any previous entry for the same URL (de-duplicate)
  history = history.filter(item => item.url !== scan.url);

  // Attach timestamp and prepend
  scan.scannedAt = new Date().toISOString();
  history.unshift(scan);

  // Cap to MAX_HISTORY
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory(history);
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory([]);
}

function deleteSingleEntry(url) {
  const history = getHistory().filter(item => item.url !== url);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory(history);
}

function rescanUrl(url) {
  document.getElementById('urlInput').value = url;
  document.getElementById('urlInput').scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => checkSecurity(), 300);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function renderHistory(history) {
  const list = document.getElementById('historyList');
  const emptyEl = document.getElementById('historyEmpty');
  const clearBtn = document.getElementById('clearHistoryBtn');

  list.innerHTML = '';

  if (!history || history.length === 0) {
    emptyEl.style.display = 'flex';
    clearBtn.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  clearBtn.style.display = 'flex';

  history.forEach((item, idx) => {
    const isSafe = item.type === 'safe';
    const icon = isSafe ? '✓' : '✕';
    const label = isSafe ? 'Safe' : 'Threat';
    const tagClass = isSafe ? 'history-tag--safe' : 'history-tag--danger';
    const threats = item.threats && item.threats.length
      ? item.threats.map(t => `<span class="threat-tag" style="font-size:10px;padding:2px 8px">${t}</span>`).join('')
      : '';

    const card = document.createElement('div');
    card.className = `history-card history-card--${item.type}`;
    card.style.animationDelay = `${idx * 35}ms`;
    card.innerHTML = `
      <div class="hc-icon-wrap hc-icon-wrap--${item.type}">${icon}</div>
      <div class="hc-body">
        <div class="hc-url" title="${item.url}">${item.url}</div>
        ${threats ? `<div class="hc-threats">${threats}</div>` : ''}
      </div>
      <div class="hc-meta">
        <span class="hc-badge ${tagClass}">${label}</span>
        <span class="hc-date">${formatDate(item.scannedAt)}</span>
        <button class="hc-btn hc-btn--rescan" title="Re-scan" onclick="rescanUrl('${item.url.replace(/'/g, "\\'")}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
        <button class="hc-btn hc-btn--delete" title="Remove" onclick="deleteSingleEntry('${item.url.replace(/'/g, "\\'")}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>`;
    list.appendChild(card);
  });
}

function loadHistory() {
  renderHistory(getHistory());
}

const toggleBtn = document.getElementById("themeToggle");
const body = document.body;

function applyTheme(theme) {
  body.classList.remove("dark", "light");
  body.classList.add(theme);

  toggleBtn.textContent = theme === "dark" ? "🌙" : "☀️";
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  applyTheme(savedTheme);
} else {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(systemDark ? "dark" : "light");
}

toggleBtn.addEventListener("click", () => {
  const isDark = body.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");

  toggleBtn.style.transform = "rotate(180deg)";
  setTimeout(() => {
    toggleBtn.style.transform = "rotate(0deg)";
  }, 300);
});


window.matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
   
    if (!localStorage.getItem("theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });