# 📖 Project Instructions & File Principles

Welcome to the **CyberShield URL Scanner** documentation! This guide provides a detailed breakdown of the project's file architecture and the working principles behind each component.

---

## 📂 File Architecture & Principles

### 1. 🌐 `index.html`
- **Role**: The foundational skeletal structure of the application.
- **Working Principle**: 
  - Contains the **Cinematic Loader** which provides a premium first-impression experience.
  - Houses the **Main Scanner Interface**, where users input URLs for security checks.
  - Implements a **Responsive Hero Section** and a collapsible **Team Section** for professional branding.
  - Links all external styles and scripts.

### 2. 📜 `script.js`
- **Role**: The engine driving frontend interactivity and logic.
- **Working Principle**:
  - **Loader Management**: Controls the timed fade-out and visibility of the initial loading screen.
  - **Theme Toggle Engine**: Manages the switch between **Dark Mode** and **Light Mode** by updating the body class and persisting preferences.
  - **Team Rendering**: Dynamically builds the team member cards using an internal data array.
  - **API Orchestrator**: Handles the `POST` request to the backend server and renders the security result status (Safe/Danger).

### 3. 🎨 `style.css`
- **Role**: The comprehensive design system of the application.
- **Working Principle**:
  - **Dual-Theme Variables**: Uses CSS Custom Properties (`--bg-color`, `--accent-1`, etc.) to switch between the Emerald/Sky Blue (Dark) and Orange/Red (Light) themes instantly.
  - **Grid & Flexbox**: Ensures a modern, pixel-perfect layout that adapts to all screen sizes.
  - **Micro-Animations**: Defines hover effects, loading rings, and smooth transitions for a "Premium SaaS" feel.

### 4. ⚙️ `server.js`
- **Role**: The secure Node.js backend proxy.
- **Working Principle**:
  - **API Shielding**: Safely hides the Google Safe Browsing API Key on the server-side to prevent exposure in the frontend.
  - **CORS Management**: Configures secure communication between the frontend client and the backend server.
  - **Request Validation**: Sanitizes and validates the user-provided URL before sending it to the official security database.
  - **API Proxy**: Acts as a bridge between the user and Google's threat detection infrastructure.

### 5. 📦 `package.json`
- **Role**: Project configuration and dependency manifest.
- **Working Principle**:
  - Defines the entry point (`server.js`).
  - Lists essential dependencies: `express` (web server), `cors` (cross-origin sharing), and `dotenv` (environment variable management).

### 6. 🖼️ `assets/` (Folder)
- **Role**: Centralized repository for project media.
- **Working Principle**: Stores branding icons, background grids, and team member headshots used throughout the UI.

### 7. 📘 `README.md` & `INSTRUCTIONS.md`
- **Role**: Project documentation and user guide.
- **Working Principle**: Provides setup instructions, technical overviews, and contribution guidelines for developers and users.

---

## ⚡ Core Workflow Summary

1. **Initialization**: The user lands on the page, triggering the `script.js` loader and theme initialization.
2. **Input**: A URL is pasted into the `index.html` input field.
3. **Transmission**: `script.js` sends the URL to the `server.js` endpoint.
4. **Verification**: `server.js` queries the **Google Safe Browsing API**.
5. **Feedback**: The result is returned and displayed on the UI with a theme-aware security badge.

---

> [!TIP]
> Always ensure your `.env` file is properly configured with your `API_KEY` before running `server.js` to enable real-time scanning.
