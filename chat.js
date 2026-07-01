// ═══════════════════════════════════
// THEME — prevent flash
// ═══════════════════════════════════
(function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') document.documentElement.classList.add('light-mode');
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

  // Keyboard submit
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});

// ═══════════════════════════════════
// SCAM DETECTOR
// ═══════════════════════════════════
let conversationHistory = [];

const TEMPLATES = {
  job: "Congratulations! Your resume has been selected for the position of Virtual Assistant. Weekly pay is $1,200. No experience needed. To start immediately, you must deposit $150 via Bitcoin for your software training kit. Reply YES if interested.",
  phishing: "FedEx ALERT: Your parcel has a pending delivery fee of $2.99. If not paid within 12 hours, the package will be returned to the sender. Please resolve at http://dhl-pending-delivery-fees-support.xyz/status",
  otp: "ALERT: Suspected unauthorized transaction of $500 on your account. If this was not you, call our security helpline immediately at 1-800-FAKE-BANK. Our agent will verify your identity. Please prepare to share the 6-digit OTP sent to your mobile phone to lock your card.",
  crypto: "Welcome to the official CryptoDouble community! Guaranteed 200% return on deposit in 24 hours. Tested by thousands of members. Send any amount from 0.05 BTC to 2 BTC to our promotional address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa and receive double back instantly. Time is running out!"
};

function fillTemplate(type) {
  const input = document.getElementById('chatInput');
  if (input && TEMPLATES[type]) {
    input.value = TEMPLATES[type];
    adjustTextareaHeight(input);
    input.focus();
  }
}

function adjustTextareaHeight(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function clearChat() {
  conversationHistory = [];
  const historyDiv = document.getElementById('chatHistory');
  if (!historyDiv) return;
  historyDiv.innerHTML = `
    <div class="chat-msg robot">
      <div class="chat-avatar">🛡️</div>
      <div class="chat-bubble">
        <strong>Chat cleared.</strong>
        <p class="chat-welcome-text">Paste a suspicious message above and click Analyze to inspect it.</p>
      </div>
    </div>`;
}

async function sendMessage() {
  const input   = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const typing  = document.getElementById('typingIndicator');

  const text = input ? input.value.trim() : '';
  if (!text) return;

  input.value = '';
  input.style.height = 'auto';
  input.disabled = true;
  sendBtn.disabled = true;

  appendMessage('user', text);
  scrollToBottom();

  if (typing) { typing.classList.remove('hidden'); scrollToBottom(); }

  const apiHost = 'https://cybershield-30a3.onrender.com';

  try {
    const response = await fetch(`${apiHost}/api/scam-detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: conversationHistory })
    });

    if (!response.ok) throw new Error(`Server status: ${response.status}`);
    const report = await response.json();

    if (typing) typing.classList.add('hidden');

    appendAnalysisReport(report);
    scrollToBottom();

    conversationHistory.push({ role: 'user', text });
    conversationHistory.push({ role: 'model', text: report.explanation });

  } catch (err) {
    if (typing) typing.classList.add('hidden');
    appendMessage('robot', `⚠️ <strong>Analysis failed:</strong> ${escapeHTML(err.message)}. Make sure the backend server is running.`);
    scrollToBottom();
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

function appendMessage(role, messageText) {
  const historyDiv = document.getElementById('chatHistory');
  if (!historyDiv) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${role}`;

  if (role === 'user') {
    msgDiv.innerHTML = `
      <div class="chat-bubble user-bubble">${escapeHTML(messageText)}</div>`;
  } else {
    msgDiv.innerHTML = `
      <div class="chat-avatar">🛡️</div>
      <div class="chat-bubble">${messageText}</div>`;
  }

  historyDiv.appendChild(msgDiv);
}

function appendAnalysisReport(report) {
  const historyDiv = document.getElementById('chatHistory');
  if (!historyDiv) return;

  const classification = report.classification || 'safe';

  const categories = {
    phishing:         '🎣 Phishing / Credential Theft',
    fake_job:         '💼 Fake Job Offer',
    otp_fraud:        '🛡️ OTP / PIN Fraud',
    investment_scam:  '📉 Investment Scam',
    impersonation:    '👤 Impersonation Fraud',
    other:            '⚠️ Suspicious Request',
    none:             '✅ Safe Communication'
  };

  const scamLabel = categories[report.scamType] || 'General Analysis';

  const reportHtml = `
    <div class="report-header-row">
      <span class="report-badge classification-${classification}">${classification.toUpperCase()}</span>
      <span class="report-scam-type">${scamLabel}</span>
    </div>
    <p class="report-explanation">${escapeHTML(report.explanation || '').replace(/\n/g, '<br>')}</p>
    <div class="report-score-section">
      <div class="report-score-labels">
        <span>Threat Confidence</span>
        <span>${report.confidence || 0}%</span>
      </div>
      <div class="report-progress-track">
        <div class="report-progress-bar classification-${classification}" style="width:${report.confidence || 0}%"></div>
      </div>
    </div>
    <div class="report-advice-box classification-${classification}">
      <strong class="report-advice-title">Advice: </strong>${escapeHTML(report.actionableAdvice || '')}
    </div>`;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg robot';
  msgDiv.innerHTML = `
    <div class="chat-avatar">🤖</div>
    <div class="chat-bubble report-bubble classification-border-${classification}">${reportHtml}</div>`;

  historyDiv.appendChild(msgDiv);
}

function scrollToBottom() {
  const historyDiv = document.getElementById('chatHistory');
  if (historyDiv) historyDiv.scrollTop = historyDiv.scrollHeight;
}

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
