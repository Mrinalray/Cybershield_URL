//  LOADER
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    const main   = document.getElementById('mainPage');
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
      main.classList.remove('hidden');
    }, 500);
  }, 3200);
});

//  TEAM — collapsible
const team = [
  { name: "Mrinal Roy",    img: "Mrinal.jpg"   },
  { name: "Rahul Sah",     img: "Rahul.jpg"    },
  { name: "Swastika Shaw", img: "Swastika.jpg" },
  { name: "Arpita Roy",    img: "Arpita.jpg"   },
  { name: "Disha Samanta", img: "Disha.jpg" },
];

function sanitizeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

(function buildTeam() {
  const grid = document.getElementById('teamGrid');
  grid.innerHTML = team.map(m => {
    const safeName = sanitizeHTML(m.name);
    const safeImg = sanitizeHTML(m.img);
    const initials = safeName.split(' ').map(w => w[0]).join('');
    return `
      <div class="member-card">
        <div class="member-avatar">
          <img src="${safeImg}" alt="${safeName}"
            onerror="this.parentElement.innerHTML='${initials}'">
        </div>
        <div class="member-name">${safeName}</div>
      </div>`;
  }).join('');
})();

let teamOpen = false;

function toggleTeam() {
  teamOpen = !teamOpen;
  const wrap   = document.getElementById('teamGridWrap');
  const toggle = document.getElementById('teamToggle');
  if (teamOpen) {
    wrap.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Hide team');
  } else {
    wrap.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Show team');
  }
}

//  SCANNER
let totalScans = parseInt(localStorage.getItem('totalScans') || '0');
let safeCount = parseInt(localStorage.getItem('safeCount') || '0');
let dangerCount = parseInt(localStorage.getItem('dangerCount') || '0');

function renderStats() {
  document.getElementById('totalScans').textContent  = totalScans;
  document.getElementById('safeCount').textContent   = safeCount;
  document.getElementById('dangerCount').textContent = dangerCount;
}
renderStats();

function fillExample(url) {
  document.getElementById('urlInput').value = url;
  document.getElementById('urlInput').focus();
}

function updateStats(type) {
  totalScans++;
  if (type === 'safe')   safeCount++;
  if (type === 'danger') dangerCount++;
  localStorage.setItem('totalScans', totalScans);
  localStorage.setItem('safeCount', safeCount);
  localStorage.setItem('dangerCount', dangerCount);
  renderStats();
}

function showResult(type, title, desc, url, threats) {
  const icons = { safe: '✓', danger: '✕', loading: '', error: '!' };
  const safeTitle = sanitizeHTML(title);
  const safeDesc = sanitizeHTML(desc);
  const safeUrl = sanitizeHTML(url);
  
  let threatsHtml = '';
  if (threats && threats.length) {
    threatsHtml = `<div class="threat-tags">${threats.map(t => 
      `<span class="threat-tag">${sanitizeHTML(t)}</span>`).join('')}</div>`;
  }

  document.getElementById('result').innerHTML = `
    <div class="result-card ${type}">
      <div class="result-icon">
        ${type === 'loading'
          ? '<div class="spinner"></div>'
          : `<span>${icons[type]}</span>`}
      </div>
      <div class="result-body">
        <div class="result-title">${safeTitle}</div>
        <div class="result-desc">${safeDesc}</div>
        ${safeUrl ? `<div class="result-url">${safeUrl}</div>` : ''}
        ${threatsHtml}
      </div>
    </div>`;
}

async function checkSecurity() {
  const input = document.getElementById('urlInput').value.trim();
  if (!input) {
    showResult('error', 'Enter a URL', 'Please type a URL to scan above.', '', []);
    return;
  }
  
  if (input.length > 2048) {
    showResult('error', 'URL too long', 'The provided URL exceeds the maximum length allowed.', '', []);
    return;
  }

  let url = input;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Only prepend https if the input looks like a valid hostname, to prevent javascript: or data: injection
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(url)) {
      url = 'https://' + url;
    }
  }

  const btn = document.getElementById('scanBtn');
  btn.disabled = true;
  showResult('loading', 'Scanning...', 'Checking against threat databases. Please wait.', url, []);

  // Use relative URL so it works when deployed and for local dev, or fallback to localhost if file protocol
  const backendUrl = window.location.protocol === 'file:' 
    ? 'http://localhost:3000/check' 
    : '/check';

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Server returned status ' + response.status);
    }
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    if (data.matches && data.matches.length > 0) {
      const threats = [...new Set(data.matches.map(m => m.threatType.replace(/_/g, ' ')))];
      updateStats('danger');
      showResult('danger', 'Threat Detected!',
        'This URL is flagged as dangerous. Do not visit it.', url, threats);
    } else {
      updateStats('safe');
      showResult('safe', 'URL is Safe',
        'No threats detected. Google Safe Browsing found no issues.', url, []);
    }

  } catch (err) {
    showResult('error', 'Scan Failed',
      `An error occurred while scanning the URL. Make sure the backend server is running.`,
      '', []);
  } finally {
    btn.disabled = false;
  }
}

document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkSecurity();
});