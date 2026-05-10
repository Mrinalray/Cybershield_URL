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

1.  🔗 **Enter URL**: Paste any suspicious link into the scanner.
2.  ⚡ **Analyze**: The application instantly queries the Google Safe Browsing database.
3.  📊 **Results**:
    *   ✅ **SAFE**: No threats detected.
    *   🚩 **DANGER**: Malicious content identified (Phishing, Malware, etc.).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla JavaScript |
| **Styling** | CSS3 (Custom Properties, Grid, Flexbox) |
| **Backend** | Node.js (API Proxy & Rate Limiting) |
| **Security API** | Google Safe Browsing API |
| **Persistence** | `localStorage` (Theme), `sessionStorage` (Loader) |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- A Google Cloud API Key (with Safe Browsing API enabled)

### Local Development

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Mrinalray/Cybershield_URL.git
    cd Cybershield_URL
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_api_key_here
    PORT=3000
    ```

4.  **Run the Server**:
    ```bash
    node server.js
    ```
    Open `http://localhost:3000` in your browser.

---

## 📂 Project Structure

```text
Cybershield_URL/
├── public/           # Static assets (Images, Favicon)
├── index.html        # Main scanner interface
├── docs.html         # User documentation
├── privacy.html      # Privacy policy
├── terms.html        # Terms of service
├── script.js         # Core application logic
├── style.css         # Modern design system
└── server.js         # Backend API handler
```

---

## 👨‍💻 Contributors

*   **Mrinal Roy** — [GitHub](https://github.com/mrinalray)
*   **Rahul Sah** — [GitHub](https://github.com/real-rahul1)

---

## ⭐ Support & Feedback

If you find this tool helpful:
- ⭐ **Star this repository** to show your support.
- 🍴 **Fork it** to add your own features.
- 📢 **Report issues** if you encounter any bugs.

---

## 📜 License
This project is for educational and demonstration purposes. Powered by Google Safe Browsing.
