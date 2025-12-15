# ⚡ Fasting Pro
> **The Ultimate Intermittent Fasting Companion**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Active](https://img.shields.io/badge/Status-Active-success.svg)]()
[![Platform: Web](https://img.shields.io/badge/Platform-PWA-blue.svg)]()

**Fasting Pro** is a modern, privacy-focused, and feature-rich Progressive Web App (PWA) designed to help you track your intermittent fasting journey. Built with performance and aesthetics in mind, it provides real-time body status updates, hydration tracking, and gamified progress monitoring—all without tracking you.

---

## ✨ Features

### ⏱️ Smart Fasting Timer
- **Flexible Protocols:** Choose from 16:8, 18:6, 20:4 (Warrior), OMAD (23:1), or set a **Custom Duration**.
- **Real-Time Progress:** Visual ring timer with circadian rhythm indicators (Day/Night icons).
- **Edit & Adjust:** Forgot to start? Easily edit your start time.

### 🧬 Body Status Timeline
- Know exactly what's happening inside your body.
- **5 Metabolic Stages:** Anabolic, Catabolic, Ketosis, Autophagy, and Growth Hormone.
- Dynamic cards update automatically as your fast progresses.

### 💧 Hydration Tracker (Pro)
- Track your water intake in **ML**.
- Visual progress bar with a daily goal of **2000ml**.
- **Undo Function:** Mistakes happen. Remove entries with a single click.

### ⚖️ Weight & Analytics
- **Interactive Charts:** Visualize your weight loss trends over time.
- **Detailed History:** complete log of all your past fasts with mood ratings (Energized, Tired, etc.).
- **Data Safe:** Your data belongs to you. **Export** to JSON and **Import** anytime.

### 🏆 Gamification
- **Badges:** Unlock achievements for consistency (3-day streak, 7-day streak, etc.).
- **Confetti:** Celebrate your wins!
- **Streaks:** Keep the flame alive by fasting daily.

---

## 🛠️ Tech Stack

- **Core:** HTML5, Modern JavaScript (ES6+), Tailwind CSS (via CDN for dev).
- **Data:** LocalStorage (100% Client-Side Privacy).
- **Visuals:** FontAwesome Icons, Chart.js for analytics.
- **PWA:** Service Worker enabled for offline usage and "Add to Home Screen" capability.

---

## 🚀 Getting Started

You can run this app locally or deploy it to the web.

### Option 1: Live Demo (GitHub Pages)
Use the deployed link (check the repo description!).

### Option 2: Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/op-h/fasting-app.git
   ```
2. Navigate to the folder:
   ```bash
   cd fasting-app
   ```
3. Start a local server (needed for Modules/PWA):
   ```bash
   # Python
   python -m http.server 8080
   
   # OR Node/NPM
   npx serve .
   ```
4. Open `http://localhost:8080` in your browser.

---

## 📱 Mobile Installation (PWA)

**iOS:**
1. Open in Safari.
2. Tap the "Share" button.
3. Select **"Add to Home Screen"**.

**Android:**
1. Open in Chrome.
2. Tap the menu (three dots).
3. Select **"Install App"** .

---

## 🔒 Privacy

Fasting Pro collects **zero personal data**.
- No accounts.
- No cloud servers.
- All data stays on your device (LocalStorage).

To backup your data, use the **Data Safe** feature in the Progress tab.

---

## 🤝 Contributing

Contributions are welcome!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">Made with ❤️ for the Fasting Community</p>
