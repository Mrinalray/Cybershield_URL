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
  const input = document.getElementById('urlInput');
  input.value = url;
  input.focus();
  toggleClearBtn();
}

const urlInput = document.getElementById('urlInput');
const clearBtn = document.getElementById('clearInput');

function toggleClearBtn() {
  if (clearBtn) {
    clearBtn.style.display = urlInput.value ? 'flex' : 'none';
  }
}

if (urlInput) {
  urlInput.addEventListener('input', toggleClearBtn);
}

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    toggleClearBtn();
    urlInput.focus();
  });
}

function updateStats(type) {
  totalScans++;
  if (type === 'safe')   safeCount++;
  if (type === 'danger') dangerCount++;
  document.getElementById('totalScans').textContent  = totalScans;
  document.getElementById('safeCount').textContent   = safeCount;
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
    safe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    danger: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    loading: '<div class="spinner"></div>'
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
      if (item.type === 'safe') icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ffb4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      else if (item.type === 'warning') icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      else if (item.type === 'danger') icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

      return `<div class="breakdown-item ${item.type}">${icon} <span>${item.text}</span></div>`;
    }).join('');

    riskSectionHtml = `
      <div class="risk-analysis">
        <div class="risk-header">
          <div class="risk-stat">
            <div class="risk-stat-value" style="color: ${meterColor}"><span id="animated-score">0</span><span class="risk-stat-max">/100</span></div>
            <div class="risk-stat-label">Risk Score</div>
          </div>
          <div class="risk-stat">
            <div class="risk-stat-value"><span id="animated-confidence">0</span>%</div>
            <div class="risk-stat-label">Confidence</div>
          </div>
        </div>
        
        <div class="risk-meter-wrap">
          <div class="risk-meter-bar" style="width: 0%; background-color: ${meterColor};" data-target-width="${riskData.score}%"></div>
        </div>

        <div class="risk-breakdown">
          ${breakdownHtml}
        </div>
      </div>
    `;
  }

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
        ${riskSectionHtml}
      </div>
    </div>`;

  if (riskSectionHtml) {
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
  document.getElementById('urlInput').disabled = true;
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
    // Simulate network delay for UI effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock backend threat detection
    let isMockThreat = false;
    let mockThreats = [];
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('testsafebrowsing.appspot.com') || lowerUrl.includes('phishing') || lowerUrl.includes('malware')) {
      isMockThreat = true;
      if (lowerUrl.includes('malware')) {
        mockThreats.push('MALWARE');
      } else {
        mockThreats.push('SOCIAL ENGINEERING');
      }
    }

    if (isMockThreat) {
      updateStats('danger');
      showResult('danger', 'Threat Detected!',
        'This URL is flagged as dangerous. Do not visit it.', url, mockThreats);
    } else {
      updateStats('safe');
      showResult('safe', 'URL is Safe',
        'No threats detected. Our local heuristic found no issues.', url, []);
    }

  } catch (err) {
    showResult('error', 'Scan Error',
      `An unexpected error occurred.<br>
       <small style="color:#334155">Error: ${err.message}</small>`,
      '', []);
  } finally {
    btn.disabled = false;
    document.getElementById('urlInput').disabled = false; 
  }
}

document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkSecurity();
});