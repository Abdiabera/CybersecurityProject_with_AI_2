# 🔐 CryptoLab — Cryptography Simulator

**Per Scholas Greater Boston · Cohort 2026-BOS-02 · Network Defense Module 125**

An interactive cryptography learning simulator for CompTIA Security+ learners.  
**No installation required — just open `index.html` in a browser.**

---

## ⚡ Quick Start

```
1. Download or copy the entire cryptolab/ folder
2. Open the folder
3. Double-click index.html
4. Start learning immediately
```

That's it. No Node.js, no npm, no terminal, no server needed.

---

## 📁 Folder Structure

```
cryptolab/
├── index.html      ← Open this file to launch the simulator
├── style.css       ← All visual styles and animations
├── script.js       ← All application logic and crypto helpers
├── assets/         ← Reserved for future images/icons
└── README.md       ← This file
```

---

## 🌐 Browser Compatibility

| Browser  | Support  |
|----------|----------|
| Chrome 80+ | ✅ Fully supported |
| Firefox 75+ | ✅ Fully supported |
| Edge 80+   | ✅ Fully supported |
| Safari 14+ | ✅ Fully supported |

**Requires BigInt support** (for RSA math) — available in all modern browsers listed above.

---

## 📡 Fonts & Offline Use

The portal loads **Outfit, DM Sans, and Fira Code** from Google Fonts on first launch.

- **Online:** Fonts load automatically from Google CDN.
- **Offline after first visit:** Fonts are cached by the browser — no re-download needed.
- **Completely offline (never been online):** The portal uses clean system sans-serif fonts. All functionality works perfectly — only the typeface changes.

---

## 📚 Learning Modules

| # | Module | What Learners Explore |
|---|--------|----------------------|
| 1 | 🔒 Confidentiality | Live packet animation — see plaintext interception vs encrypted safety |
| 2 | ⚿ Symmetric Encryption | Caesar, DES, 3DES, RC4, AES-128/256 — tabs, sliders, character-by-character cipher |
| 3 | ⚷ Asymmetric / RSA | 4-step RSA walkthrough with real BigInt math — Alice, Bob, and Eve |
| 4 | ⚡ Attack Lab | Real brute-force simulation + MITM animated attack |
| 5 | ✍ Digital Signatures | Sign, tamper, verify — hash pipeline with live feedback |
| 6 | ★ Challenge Quiz | 6 questions, XP rewards, badge unlock at 70%+ |

---

## 🎮 Gamification System

| Element | Description |
|---------|-------------|
| **XP Points** | Awarded for every interaction (encrypting, steps, correct answers) |
| **Level** | Every 100 XP = 1 level up |
| **Badges** | 6 badges: First Encrypt 🔐, Secure Channel 🛡, Key Master 🗝, Ethical Hacker ⚡, Signed & Verified ✍, Quiz Ace 🏆 |
| **Toast notifications** | Green for XP, purple for badge unlocks |

---

## 🏫 Classroom Deployment Options

### Option A — USB / Local Network Share
Copy the `cryptolab/` folder to a USB drive or shared network folder.  
Students open `index.html` directly from the shared location.

### Option B — GitHub Pages (free hosting)
1. Create a GitHub repository
2. Upload the `cryptolab/` folder contents to the repo root
3. Enable GitHub Pages: Settings → Pages → Branch: main
4. Share the URL: `https://yourusername.github.io/reponame/`

### Option C — School Web Server
Upload the `cryptolab/` folder to any web server directory.  
Works on Apache, Nginx, IIS, or any static file host.

### Option D — Canvas / LMS Embed
Upload as a course file package in Canvas, Blackboard, or Moodle.  
Link to `index.html` as an external tool or downloadable resource.

---

## 🔧 Technical Notes

- **Pure HTML5 + CSS3 + ES2020 Vanilla JavaScript** — no frameworks
- **Module pattern (IIFE)** — each learning module has its own private state
- **requestAnimationFrame** — 60fps packet animation in Confidentiality module
- **BigInt** — real RSA modular exponentiation (`modPow`) in Asymmetric module
- **CSS Custom Properties** — full design system via `--cyan`, `--purple`, `--green`, etc.
- **CSS Grid + Flexbox** — fully responsive down to mobile widths

---

## 🎨 Design System

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0D0B1F` | Page background |
| `--cyan` | `#818CF8` | Primary accent (violet-indigo) |
| `--purple` | `#7C3AED` | Secondary accent |
| `--green` | `#10B981` | Success / secure |
| `--orange` | `#F97316` | Warning / plaintext |
| `--red` | `#EF4444` | Danger / attack |
| `--gold` | `#FBBF24` | Achievements |
| Font heading | Outfit 700 | Headings, labels, nav |
| Font body | DM Sans 400 | Body text |
| Font mono | Fira Code 400 | Terminal, code |

---

## 👨‍🏫 Instructor

**Dr. Solomon Seifu** — Lead Instructor, Cybersecurity Program  
Per Scholas Greater Boston · CompTIA CySA+, Network+, Cisco Ethical Hacker

Co-instructor / TA: **Naly Rosario**

---

*Built with vanilla HTML/CSS/JS for maximum portability and offline reliability.*  
*No build tools. No dependencies. Just open and learn.*
