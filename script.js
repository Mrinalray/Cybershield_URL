// ═══════════════════════════════════
// THEME — init immediately to prevent flash
// ═══════════════════════════════════
(function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') {
    document.documentElement.classList.add('light-mode');
  }
})();

// ═══════════════════════════════════
// LOADER — skip on back-navigation
// ═══════════════════════════════════
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const main   = document.getElementById('mainPage');
  if (!loader || !main) return;

  if (sessionStorage.getItem('introShown')) {
    loader.style.display = 'none';
    main.classList.remove('hidden');
  } else {
    setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
        main.classList.remove('hidden');
        sessionStorage.setItem('introShown', 'true');
      }, 500);
    }, 3200);
  }
});

// Handle bfcache (back/forward navigation)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    const loader = document.getElementById('loader');
    const main   = document.getElementById('mainPage');
    if (loader) loader.style.display = 'none';
    if (main)   { main.classList.remove('hidden'); main.style.opacity = '1'; }
  }
});

// ═══════════════════════════════════
// THEME TOGGLE
// ═══════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }

  // Build team grid
  buildTeam();

  // Load persisted session stats
  loadStats();
});

// ═══════════════════════════════════
// TEAM
// ═══════════════════════════════════
const team = [
  { name: "Mrinal Roy",     img: "Mrinal.jpg"   },
  { name: "Rahul Sah",      img: "Rahul.jpg"    },
  { name: "Swastika Shaw",  img: "Swastika.jpg" },
  { name: "Arpita Roy",     img: "Arpita.jpg"   },
  { name: "Disha Samanta",  img: "Disha.jpg"    },
];

function buildTeam() {
  const grid = document.getElementById('teamGrid');
  if (!grid) return;
  grid.innerHTML = team.map(m => {
    const initials = m.name.split(' ').map(w => w[0]).join('');
    return `
      <div class="member-card">
        <div class="member-avatar">
          <img src="${m.img}" alt="${m.name}" onerror="this.parentElement.innerHTML='${initials}'">
        </div>
        <div class="member-name">${m.name}</div>
      </div>`;
  }).join('');
}

let teamOpen = false;

function toggleTeam() {
  teamOpen = !teamOpen;
  const wrap   = document.getElementById('teamGridWrap');
  const toggle = document.getElementById('teamToggle');
  if (!wrap || !toggle) return;
  wrap.classList.toggle('open', teamOpen);
  toggle.classList.toggle('open', teamOpen);
  toggle.setAttribute('aria-label', teamOpen ? 'Hide team' : 'Show team');
}

// ═══════════════════════════════════
// SCANNER
// ═══════════════════════════════════
let totalScans = 0, safeCount = 0, dangerCount = 0;

function loadStats() {
  const history = JSON.parse(localStorage.getItem('cybershield_history') || '[]');
  totalScans = history.length;
  safeCount  = history.filter(r => r.status === 'safe').length;
  dangerCount = history.filter(r => r.status === 'danger').length;
  renderStats();
}

function renderStats() {
  const t = document.getElementById('totalScans');
  const s = document.getElementById('safeCount');
  const d = document.getElementById('dangerCount');
  if (t) t.textContent = totalScans;
  if (s) s.textContent = safeCount;
  if (d) d.textContent = dangerCount;
}

function fillExample(url) {
  const input = document.getElementById('urlInput');
  if (input) { input.value = url; input.focus(); }
}

function normalizeScanUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { error: 'Paste the URL you want to check above.' };
  }

  if (/^(javascript|data|file|ftp):/i.test(trimmed)) {
    return { error: 'Only http and https URLs can be scanned safely.' };
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { error: 'Only http and https URLs can be scanned safely.' };
    }
    if (!parsed.hostname.includes('.')) {
      return { error: 'Enter a complete domain such as example.com.' };
    }
    return { url: parsed.toString() };
  } catch {
    return { error: 'Enter a valid URL or domain name.' };
  }
}

function saveToHistory(url, status, threats) {
  const history = JSON.parse(localStorage.getItem('cybershield_history') || '[]');
  history.push({ url, status, threats, timestamp: new Date().toISOString() });
  localStorage.setItem('cybershield_history', JSON.stringify(history));
}

function showResult(type, title, desc, url, threats) {
  const el = document.getElementById('result');
  if (!el) return;
  el.innerHTML = `
    <div class="result-card ${type}">
      <div class="result-icon">
        ${type === 'loading'
          ? '<div class="spinner"></div>'
          : `<span>${type === 'safe' ? '✓' : type === 'danger' ? '✕' : '!'}</span>`}
      </div>
      <div class="result-body">
        <div class="result-title">${title}</div>
        <div class="result-desc">${desc}</div>
        ${url ? `<div class="result-url">${url}</div>` : ''}
        ${threats && threats.length
          ? `<div class="threat-tags">${threats.map(t => `<span class="threat-tag">${t}</span>`).join('')}</div>`
          : ''}
      </div>
    </div>`;
}

async function checkSecurity() {
  const input = document.getElementById('urlInput');
  const btn   = document.getElementById('scanBtn');
  const text  = input ? input.value.trim() : '';

  const normalized = normalizeScanUrl(text);
  if (normalized.error) {
    showResult('error', 'Check the URL format', normalized.error, '', []);
    return;
  }

  const url = normalized.url;

  if (btn) btn.disabled = true;
  showResult('loading', 'Scanning...', 'Checking against threat databases…', url, []);

  try {
    const apiHost = 'https://cybershield-30a3.onrender.com';

    const response = await fetch(`${apiHost}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error(`Server error ${response.status}`);
    const data = await response.json();
    console.log("API Response:", data);
    if (data.error) throw new Error(data.error);

    if (data.matches && data.matches.length > 0) {
      const threats = [...new Set(data.matches.map(m => m.threatType.replace(/_/g, ' ')))];
      totalScans++; dangerCount++;
      renderStats();
      saveToHistory(url, 'danger', data.matches.map(m => m.threatType));
      showResult('danger', '⚠ Threat Detected', 'This URL is flagged as dangerous. Do not visit it.', url, threats);
    } else {
      totalScans++; safeCount++;
      renderStats();
      saveToHistory(url, 'safe', []);
      showResult('safe', '✓ URL is Safe', 'No known threats detected via Google Safe Browsing.', url, []);
    }

  } catch (err) {
    showResult('error', 'Backend Not Connected',
      `Ensure your backend server is running.<br><small>Error: ${err.message}</small>`, '', []);
  } finally {
    if (btn) btn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('urlInput');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkSecurity();
    });
  }
});
