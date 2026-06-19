<div align="center">

<img src="assets/cybershield.png" alt="CyberShield" width="600" />

# 🛡️ CyberShield URL Scanner

**Real-time URL security scanner — detect phishing, malware, and social engineering threats before you click.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-3b82f6?style=for-the-badge&logo=googlechrome&logoColor=white)](https://mrinalray.github.io/Cybershield_URL/)
[![License](https://img.shields.io/badge/License-Educational-10b981?style=for-the-badge)](LICENSE)
[![Contributors](https://img.shields.io/github/contributors/mrinalray/Cybershield_URL?style=for-the-badge&color=8b5cf6&label=Contributors)](https://github.com/mrinalray/Cybershield_URL/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/mrinalray/Cybershield_URL?style=for-the-badge&color=f59e0b)](https://github.com/mrinalray/Cybershield_URL/stargazers)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Real-time URL Scanning** | Instant analysis against Google's threat database |
| 📸 **Screenshot Scanner** | Drag & drop screenshots — Gemini AI extracts URLs via OCR |
| 💬 **AI Scam Detector Chat** | Analyze suspicious emails, messages, or job pitches |
| 🛡️ **Threat Detection** | Phishing, malware, and social engineering threats |
| ⚡ **Fast & Responsive UI** | Clean interface with instant results |

---

## 🖼️ Preview

![CyberShield Main Page](assets/cybershield_main_page.png)
![CyberShield Result](assets/cybershield_result.png)

---

## 🧠 How It Works

```
 ┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌────────────────┐
 │  1. Enter URL   │───▶│  2. Send Request │───▶│  3. Threat Scan  │───▶│  4. Result     │
 │  or Screenshot  │    │  to Security API │    │  (Safe Browsing) │    │  ✅ Safe        │
 └─────────────────┘    └──────────────────┘    └──────────────────┘    │  ⚠️ Threat     │
                                                                          └────────────────┘
```

1. **Enter URL or Upload Screenshot** — Manually type a URL or drag & drop a screenshot. Gemini AI extracts the URL automatically via OCR.
2. **Send Request** — The app securely forwards the URL to Google Safe Browsing.
3. **Threat Analysis** — Scanned for phishing, malware, and social engineering in real time.
4. **Clear Result** — ✅ Safe (no threats) or ⚠️ Threat (malicious content found).

---

## 🧰 Tech Stack

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Google Safe Browsing](https://img.shields.io/badge/Google%20Safe%20Browsing-4285F4?style=flat-square&logo=google&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-8B5CF6?style=flat-square&logo=google&logoColor=white)

</div>

---

## 🔑 API Setup

<details>
<summary><b>🌐 Google Safe Browsing API</b></summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Safe Browsing API**
3. Navigate to **APIs & Services → Credentials** and generate a key
4. Save it as `API_KEY` in your `.env` file

</details>

<details>
<summary><b>🤖 Gemini API</b></summary>

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **Get API Key** and create a new key
3. Save it as `GEMINI_API_KEY` in your `.env` file

</details>

---

## ⚙️ Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/mrinalray/Cybershield_URL.git
cd Cybershield_URL

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Open .env and fill in API_KEY and GEMINI_API_KEY

# 4. Start the backend
node server.js

# 5. Open frontend
# Open index.html in your browser
```

> ⚠️ **Never expose your API keys publicly.** Always use environment variables in production.

---

## 🚀 Roadmap

- [ ] 🔐 Email breach checker (HIBP API)
- [ ] 📊 Threat analytics dashboard with charts
- [ ] 🌍 Browser extension
- [ ] 🤖 AI-based threat detection
- [ ] 📤 Export scan logs for offline analysis

---

## 🤝 Contributors

<div align="center">

**A huge thank you to all the amazing people who have contributed to CyberShield! 💙**

<!-- readme: contributors-start -->
<!-- readme: contributors-end -->

<a href="https://github.com/mrinalray/Cybershield_URL/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mrinalray/Cybershield_URL" alt="Contributors" width="600"/>
</a>

<br/>

**Want to contribute?**  
Check out our [Contributing Guidelines](CONTRIBUTING.md) and submit a PR — your avatar gets added automatically! 🚀

</div>

---

## 👨‍💻 Authors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/mrinalray">
        <img src="https://github.com/mrinalray.png" width="80" style="border-radius:50%"/><br/>
        <sub><b>Mrinal Roy</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/real-rahul1">
        <img src="https://github.com/real-rahul1.png" width="80" style="border-radius:50%"/><br/>
        <sub><b>Rahul Sah</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## ⭐ Support

If CyberShield helped you or you think it's cool:

[![Star on GitHub](https://img.shields.io/badge/⭐%20Star%20this%20repo-f59e0b?style=for-the-badge)](https://github.com/mrinalray/Cybershield_URL/stargazers)
[![Fork it](https://img.shields.io/badge/🍴%20Fork%20it-10b981?style=for-the-badge)](https://github.com/mrinalray/Cybershield_URL/fork)

---

<div align="center">
<sub>📜 This project is for educational and demonstration purposes.</sub>
</div>
