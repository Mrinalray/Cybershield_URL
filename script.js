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

  const url = validation.url;
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
        <div class="breakdown">
          <div class="breakdown-item">
            ${isHttps ? '✅' : '⚠️'} <b>HTTPS:</b> ${isHttps ? 'Secure connection' : 'Not secure'}
          </div>
          <div class="breakdown-item">
            ${hasMalware ? '🔴' : '✅'} <b>Malware:</b> ${hasMalware ? 'Detected!' : 'No malware detected'}
          </div>
          <div class="breakdown-item">
            ${hasPhishing ? '🔴' : '✅'} <b>Phishing:</b> ${hasPhishing ? 'Phishing detected!' : 'No phishing detected'}
          </div>
          <div class="breakdown-item">
            ${hasUnwanted ? '🔴' : '✅'} <b>Unwanted Software:</b> ${hasUnwanted ? 'Detected!' : 'None detected'}
          </div>
          <div class="breakdown-item">
            ${hasHarmful ? '🔴' : '✅'} <b>Harmful App:</b> ${hasHarmful ? 'Detected!' : 'None detected'}
          </div>
        </div>`, url, threats);
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
        <div class="breakdown">
          <div class="breakdown-item">
            ${isHttps ? '✅' : '⚠️'} <b>HTTPS:</b> ${isHttps ? 'Secure connection' : 'Not secure — use with caution'}
          </div>
          <div class="breakdown-item">
            ${hasMalware ? '🔴' : '✅'} <b>Malware:</b> ${hasMalware ? 'Detected!' : 'No malware detected'}
          </div>
          <div class="breakdown-item">
            ${hasPhishing ? '🔴' : '✅'} <b>Phishing:</b> ${hasPhishing ? 'Phishing detected!' : 'No phishing detected'}
          </div>
          <div class="breakdown-item">
            ${hasUnwanted ? '🔴' : '✅'} <b>Unwanted Software:</b> ${hasUnwanted ? 'Detected!' : 'None detected'}
          </div>
          <div class="breakdown-item">
            ${hasHarmful ? '🔴' : '✅'} <b>Harmful App:</b> ${hasHarmful ? 'Detected!' : 'None detected'}
          </div>
        </div>`, url, []);
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
//  SCREENSHOT UPLOAD — OCR URL EXTRACTION

const dropZone   = document.getElementById('dropZone');
const fileInput  = document.getElementById('fileInput');
const previewImg = document.getElementById('previewImg');
const ocrStatus  = document.getElementById('ocrStatus');

const URL_REGEX = /\b((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s"'<>]*)?)\b/gi;

function extractUrlsFromText(text) {
  const matches = text.match(URL_REGEX) || [];
  return [...new Set(matches.map(m => m.trim()))];
}

function setOcrStatus(msg, isError = false) {
  ocrStatus.textContent = msg;
  ocrStatus.style.color = isError ? '#ff5c7a' : '#94a3b8';
}

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

['dragenter', 'dragover'].forEach(evt =>
  dropZone.addEventListener(evt, e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  })
);

['dragleave', 'drop'].forEach(evt =>
  dropZone.addEventListener(evt, e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  })
);

dropZone.addEventListener('drop', e => {
  const file = e.dataTransfer.files[0];
  if (file) handleImageFile(file);
});

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) handleImageFile(file);
});

function handleImageFile(file) {
  if (!file.type.startsWith('image/')) {
    setOcrStatus('Please upload an image file (PNG, JPG, etc.)', true);
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    previewImg.src = e.target.result;
    previewImg.classList.remove('hidden');
    runOcr(file);
  };
  reader.readAsDataURL(file);
}

async function runOcr(file) {
  if (typeof Tesseract === 'undefined') {
    setOcrStatus('OCR engine failed to load. Check your connection.', true);
    return;
  }

  setOcrStatus('Reading text from screenshot…');

  try {
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          setOcrStatus(`Reading screenshot… ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    const urls = extractUrlsFromText(text);

    if (urls.length === 0) {
      setOcrStatus('No URL found in that image. Try a clearer screenshot.', true);
      return;
    }

    const chosenUrl = urls[0];
    document.getElementById('urlInput').value = chosenUrl;
    setOcrStatus(
      urls.length > 1
        ? `Found ${urls.length} URLs — scanning the first: ${chosenUrl}`
        : `Found URL: ${chosenUrl} — scanning…`
    );

    checkSecurity();
  } catch (err) {
    setOcrStatus('Could not read text from that image. Try a clearer screenshot.', true);
  }
}
