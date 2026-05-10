//  LOADER

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const main   = document.getElementById('mainPage');

  if (sessionStorage.getItem('loaderShown')) {
    if (loader) loader.style.display = 'none';
    if (main) main.classList.remove('hidden');
    return;
  }

  setTimeout(() => {
    if (loader) loader.classList.add('fade-out');
    setTimeout(() => {
      if (loader) loader.style.display = 'none';
      if (main) main.classList.remove('hidden');
      sessionStorage.setItem('loaderShown', 'true');
    }, 500);
  }, 3200);
});


//  THEME TOGGLE

(function initTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  if (theme === 'light') {
    document.body.classList.add('light-mode');
  }
})();

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
});


//  TEAM — collapsible

const team = [
  { name: "Mrinal Roy",    img: "public/Mrinal.jpg"   },
  { name: "Rahul Sah",     img: "public/Rahul.jpg"    },
  { name: "Swastika Shaw", img: "public/Swastika.jpg" },
  { name: "Arpita Roy",    img: "public/Arpita.jpg"   },
  { name: "Disha Samanta", img: "public/Disha.jpg" },
];

(function buildTeam() {
  const grid = document.getElementById('teamGrid');
  grid.innerHTML = team.map(m => {
    const initials = m.name.split(' ').map(w => w[0]).join('');
    return `
      <div class="member-card">
        <div class="member-avatar">
          <img src="${m.img}" alt="${m.name}"
            onerror="this.parentElement.innerHTML='${initials}'">
        </div>
        <div class="member-name">${m.name}</div>
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
    toggle.setAttribute('aria-label', 'Hide team');
  } else {
    wrap.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-label', 'Show team');
  }
}



//  SCANNER

let totalScans = 0, safeCount = 0, dangerCount = 0;

function fillExample(url) {
  document.getElementById('urlInput').value = url;
  document.getElementById('urlInput').focus();
}

function updateStats(type) {
  totalScans++;
  if (type === 'safe')   safeCount++;
  if (type === 'danger') dangerCount++;
  document.getElementById('totalScans').textContent  = totalScans;
  document.getElementById('safeCount').textContent   = safeCount;
  document.getElementById('dangerCount').textContent = dangerCount;
}

function showResult(type, title, desc, url, threats) {
  const icons = {
    safe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    danger: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    loading: '<div class="spinner"></div>'
  };

  document.getElementById('result').innerHTML = `
    <div class="result-card ${type}">
      <div class="result-icon">
        ${icons[type]}
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

var arr=[];

async function checkSecurity() {
  const input = document.getElementById('urlInput').value.trim();
  if (!input) {
    showResult('error', 'Enter a URL', 'Please type a URL to scan above.', '', []);
    return;
  }


  let url = input;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
    url=url.toLowerCase();
  }

  const btn = document.getElementById('scanBtn');
  btn.disabled = true;
  showResult('loading', 'Scanning...', 'Checking against threat databases. Please wait.', url, []);

  var i=arr.length;
  var v=0;
  for(v;v<i;v++){
    if(arr[v]==url){
      showResult('error', 'Already Scanned', 'Please type a different URL to scan above.', '', []);
      btn.disabled = false;
      return;
    }
  }
  arr.push(url);

  try {
const BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '')
  ? 'http://localhost:3000'
  : 'https://cybershield-sxz0.onrender.com';
const response = await fetch(`${BASE_URL}/check`, {
        method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    // ← fix: handle rate limit response from backend
    if (response.status === 429) {
      const data = await response.json();
      const wait = data.retryAfter ? ` Try again in ${data.retryAfter}s.` : '';
      showResult('error', 'Slow Down!',
        `You've hit the scan limit (10 per minute).${wait}`, '', []);
      return;
    }

    if (!response.ok) throw new Error('Server error ' + response.status);
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
    showResult('error', 'Backend Not Connected',
      `Make sure your backend server is running.<br>
       <small style="color:#334155">Error: ${err.message}</small>`,
      '', []);
  } finally {
    btn.disabled = false;
  }
}

document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkSecurity();
});