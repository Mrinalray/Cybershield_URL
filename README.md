# 🛡️ CyberShield URL Scanner
![CyberShield Banner](public/favicon.png)

🚀 **CyberShield** is a premium, real-time URL security scanner designed to protect your digital footprint by detecting phishing, malware, and other social engineering threats before you visit them.

🔗 **Live Demo:** [cybershield-url.netlify.app](https://cybershield-url.netlify.app)

---

## 📌 Features

*   🔍 **Real-time URL Scanning**: Powered by the **Google Safe Browsing API** for industry-standard threat detection.
*   🌓 **Dual-Theme Engine**: Premium **Dark Mode** (Emerald/Sky Blue) and **Light Mode** (Orange/Red) with automatic persistence.
*   📱 **Mobile-First Responsive Design**: Optimized for a seamless experience across smartphones, tablets, and desktops.
*   🚀 **Performance Optimized**: Session-based loader logic ensures a fast browsing experience within the app.
*   📄 **Integrated Documentation**: Built-in Privacy Policy, Terms of Service, and a comprehensive Usage Guide.
*   🛡️ **Pro Footer Architecture**: Production-ready navigational footer for easy access to legal and project resources.

---

## 🧠 How It Works
![Main Page View](assets/cybershield_main_page.png)

1. 🔗 **Enter URL**  
   The user inputs a website link into the scanner.

2. ⚡ **Send Request**  
   The application sends the URL to the security API.

3. 🛡️ **Threat Analysis**  
   Google Safe Browsing analyzes the URL for:
   - Phishing attacks  
   - Malware  
   - Social engineering threats  

4. 📊 **Display Result**  
   The system shows a clear result:
   - ✅ **Safe** — No threats detected  
   - ⚠️ **Potential Threat** — Risky or malicious content found  

---

## 🛠️ Tech Stack

| Layer        | Technology |
|-------------|-----------|
| Frontend     | HTML5 |
| Styling      | CSS3 (Custom Properties, Responsive Design) |
| Logic        | JavaScript (Vanilla JS) |
| Backend      | Node.js (API Handling) |
| Security API | Google Safe Browsing API |
| Deployment   | Render / Netlify / GitHub Pages |

---

## 📸 Preview

![CyberShield Preview](assets/cybershield_result.png)

---

## 🔑 API Integration

This project uses:

* Google Safe Browsing API

  * Detects malicious URLs
  * Requires API key from Google Cloud Console

---

## ⚙️ Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/Mrinalray/Cybershield_URL.git
cd Cybershield_URL
```

2. Add your API key:

```js
const API_KEY = "YOUR_API_KEY";
```

3. Run locally:

* Open `index.html` in browser

---

## ⚠️ Important Notes

* Do NOT expose your API key publicly
* Use environment variables for production
* This is a client-side demo (for hackathon/project use)

---

## 🚀 Future Improvements

* 🔐 Email breach checker integration (HIBP API)
* 📊 Threat analytics dashboard
* 🌍 Browser extension support
* 🤖 AI-based threat detection

---

## 👨‍💻 Author

**Mrinal Roy**

* GitHub: https://github.com/mrinalray
  
**Rahul Sah**
  * GitHub: https://github.com/real-rahul1
  

---

## ⭐ Support & Feedback

If you find this tool helpful:
- ⭐ **Star this repository** to show your support.
- 🍴 **Fork it** to add your own features.
- 📢 **Report issues** if you encounter any bugs.

---

## 📜 License
This project is for educational and demonstration purposes. See the [LICENSE](LICENSE.md) file for more details. Powered by Google Safe Browsing.
