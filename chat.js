// ─────────────────────────────
// LOADER & THEME
// ─────────────────────────────

window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    const main = document.getElementById('mainPage');
    if (loader && main) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
        main.classList.remove('hidden');
      }, 500);
    }
  }, 3200);
});

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
      if (btn) btn.textContent = '☀️';
    } else {
      document.documentElement.classList.remove('light-mode');
      if (btn) btn.textContent = '🌙';
    }
    localStorage.setItem('theme', theme);
  }
})();

// ─────────────────────────────
// SCAM DETECTOR LOGIC
// ─────────────────────────────

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
  el.style.height = (el.scrollHeight) + 'px';
}

function clearChat() {
  conversationHistory = [];
  const historyDiv = document.getElementById('chatHistory');
  if (historyDiv) {
    historyDiv.innerHTML = `
      <div class="chat-msg robot">
        <div class="chat-avatar">🛡️</div>
        <div class="chat-bubble">
          <strong>Chat Cleared!</strong>
          <p class="chat-welcome-text">
            Paste any suspicious message above and click Verify to analyze it.
          </p>
        </div>
      </div>
    `;
  }
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const historyDiv = document.getElementById('chatHistory');
  const typing = document.getElementById('typingIndicator');

  const text = input.value.trim();
  if (!text) return;

  // Disable input/button
  input.value = '';
  input.style.height = 'auto';
  input.disabled = true;
  sendBtn.disabled = true;

  // Append user bubble
  appendMessage('user', text);
  scrollToBottom();

  // Show typing dot indicator
  if (typing) {
    typing.classList.remove('hidden');
    scrollToBottom();
  }

  try {
    const apiHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000'
      : 'https://cybershield-sxz0.onrender.com';

    const response = await fetch(`${apiHost}/api/scam-detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: text,
        history: conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const report = await response.json();
    
    // Hide typing indicator
    if (typing) {
      typing.classList.add('hidden');
    }

    // Append AI bubble with structured report
    appendAnalysisReport(report);
    scrollToBottom();

    // Save history (we serialize our memory)
    conversationHistory.push({ role: 'user', text: text });
    // Save model's explanation response as the context text
    conversationHistory.push({ role: 'model', text: report.explanation });

  } catch (err) {
    if (typing) {
      typing.classList.add('hidden');
    }
    appendMessage('robot', `⚠️ <strong>Error analyzing message:</strong> ${err.message}. Make sure the backend server is running.`);
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
      <div class="chat-bubble user-bubble">
        ${escapeHTML(messageText)}
      </div>
    `;
  } else {
    msgDiv.innerHTML = `
      <div class="chat-avatar">🛡️</div>
      <div class="chat-bubble">
        ${messageText}
      </div>
    `;
  }

  historyDiv.appendChild(msgDiv);
}

function appendAnalysisReport(report) {
  const historyDiv = document.getElementById('chatHistory');
  if (!historyDiv) return;

  const classification = report.classification || 'safe';

  const categories = {
    phishing: '🎣 Phishing / Credential Theft',
    fake_job: '💼 Fake Job Offer',
    otp_fraud: '🛡️ OTP / PIN Fraud',
    investment_scam: '📉 Investment Scam',
    impersonation: '👤 Impersonation Fraud',
    other: '⚠️ Suspicious Request',
    none: '✅ Safe Communication'
  };

  const scamLabel = categories[report.scamType] || 'General Text';

  const reportHtml = `
    <div class="report-header-row">
      <span class="report-badge classification-${classification}">
        ${classification}
      </span>
      <span class="report-scam-type">
        ${scamLabel}
      </span>
    </div>

    <!-- Explanation -->
    <p class="report-explanation">
      ${escapeHTML(report.explanation).replace(/\n/g, '<br>')}
    </p>

    <!-- Score & Progress -->
    <div class="report-score-section">
      <div class="report-score-labels">
        <span>Threat Confidence</span>
        <span>${report.confidence}%</span>
      </div>
      <div class="report-progress-track">
        <div class="report-progress-bar classification-${classification}" style="width: ${report.confidence}%;"></div>
      </div>
    </div>

    <!-- Actionable Advice -->
    <div class="report-advice-box classification-${classification}">
      <strong class="report-advice-title">Advice:</strong> ${escapeHTML(report.actionableAdvice)}
    </div>
  `;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg robot';
  msgDiv.innerHTML = `
    <div class="chat-avatar">🤖</div>
    <div class="chat-bubble report-bubble classification-border-${classification}">
      ${reportHtml}
    </div>
  `;

  historyDiv.appendChild(msgDiv);
}

function scrollToBottom() {
  const historyDiv = document.getElementById('chatHistory');
  if (historyDiv) {
    historyDiv.scrollTop = historyDiv.scrollHeight;
  }
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
