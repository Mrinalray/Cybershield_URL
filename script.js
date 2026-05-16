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
   {name: "Disha Samanta",     img: "Disha.jpg" },
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
    toggle.setAttribute('aria-label', 'Hide team members');
    toggle.setAttribute('aria-expanded', 'true');
  } else {
    wrap.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-label', 'Show team members');
    toggle.setAttribute('aria-expanded', 'false');
  }
}



//  SCANNER

let totalScans = 0, safeCount = 0, dangerCount = 0;

function isValidUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

function formatAndValidateUrl(input) {
  if (!input || input.trim() === '') {
    return { valid: false, error: 'Enter a URL', url: null };
  }

  let url = input.trim();

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  if (!isValidUrl(url)) {
    return { valid: false, error: 'Invalid URL format. Please enter a valid website URL.', url: null };
  }

  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname) {
      return { valid: false, error: 'URL must include a domain name.', url: null };
    }
    return { valid: true, error: null, url: url };
  } catch (e) {
    return { valid: false, error: 'Invalid URL. Please check and try again.', url: null };
  }
}

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
  const input = document.getElementById('urlInput').value;
  const validation = formatAndValidateUrl(input);

  if (!validation.valid) {
    showResult('error', 'Invalid Input', validation.error, '', []);
    return;
  }

  function isValidURL(str) {
  try {
    const parsed = new URL(str);
    const hostname = parsed.hostname;
    // must have http/https AND a hostname with at least one dot (e.g. google.com)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
           hostname.includes('.') &&
           hostname.length > 3;
  } catch (e) {
    return false;
  }
}

const urlInput = document.getElementById('urlInput');
const urlError = document.getElementById('urlError');

if (!isValidURL(url)) {
  urlInput.classList.add('input-error');
  urlError.textContent  = '⚠ Please enter a valid URL (e.g. https://example.com)';
  urlError.style.display = 'block';
  btn.disabled = false;
  return;                       
}

urlInput.classList.remove('input-error');
urlError.style.display = 'none';

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

document.getElementById('urlInput').addEventListener('input', () => {
  document.getElementById('urlInput').classList.remove('input-error');
  document.getElementById('urlError').style.display = 'none';
});