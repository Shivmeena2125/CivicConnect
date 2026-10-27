# 🏛️ CivicConnect — Smart Public Issue Reporting & Resolution System
### Phase 1: Interactive Citizen Grievance Dashboard

[![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B%20Modules-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 & CSS3](https://img.shields.io/badge/UI-HTML5%20%26%20CSS3-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Storage](https://img.shields.io/badge/Demo%20Storage-localStorage%20(Safe%20Quota)-emerald.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
[![Phase](https://img.shields.io/badge/Phase-1%20Working%20Prototype-success.svg)](#)

---

## 📌 Project Overview

**CivicConnect** is a modern civic engagement and municipal issue resolution portal. It empowers citizens to report everyday neighborhood problems (potholes, garbage accumulation, streetlight outages, water pipeline bursts) and track their resolution progress transparently in real time.

This repository contains **Phase 1: The Citizen Dashboard**, built strictly using standard web technologies (**HTML5, CSS3, and Vanilla JavaScript with ES6 Modules**) following the **Service Layer Pattern**.

---

## ✨ Features (Phase 1 Citizen Dashboard)

- **📊 Live Dynamic Metrics**: 4 real-time dashboard counters (Total Complaints, Pending, In Progress, Resolved) calculated automatically from data.
- **📝 Grievance Reporting Form**:
  - Validates title, category, location, and description before submission.
  - Generates unique complaint tracking IDs (e.g., `CC-2026-1001`).
  - Rejects empty or invalid submissions with inline error messages.
- **📷 Client-Side Smart Photo Compression**:
  - Supports image file upload and mobile rear camera capture (`capture="environment"`).
  - Validates allowed file types (`image/jpeg`, `image/png`, `image/webp`) and enforces a 2MB upload limit.
  - Automatically resizes and compresses photos in-memory using an HTML5 `<canvas>` (scaled to max 800px at 75% JPEG quality) to prevent browser `localStorage` quota crashes.
  - Photo attachment is completely optional.
- **🔍 Real-Time Debounced Search & Filters**:
  - Live search across Complaint ID, Title, Category, and Location.
  - Category dropdown filter (Road Damage, Garbage, Streetlight, Water Leakage, Other).
  - Status dropdown filter (Pending, In Progress, Resolved).
  - Instant filter reset button and friendly empty states.
- **👁️ Comprehensive Tracking & Details Modal**:
  - Click any complaint card to view full grievance information, formatted dates, status pills, and attached photo.
- **💾 Quota-Safe Browser Persistence**:
  - Pre-seeded with 4 diverse municipal sample complaints.
  - Automatically restores saved data on page refresh.
  - Handles `QuotaExceededError` gracefully.
  - Includes a "Reset Demo Data" option with confirmation modal.
- **📱 Fully Responsive Design**:
  - Clean desktop layout with fixed sidebar.
  - Mobile-optimized layout with collapsible drawer navigation and touch-friendly controls.

---

## 📁 Project Structure

```text
CivicConnect/
├── frontend/
│   ├── index.html              # Main Citizen Dashboard HTML5 page
│   ├── css/
│   │   └── styles.css          # Responsive design, CSS variables, modal styling
│   ├── js/
│   │   ├── app.js              # Application entrypoint & toast notifications
│   │   ├── config.js           # Central configuration, limits & sample seed data
│   │   ├── services/
│   │   │   ├── complaintService.js   # Business logic, ID generation, calculations
│   │   │   └── storageService.js     # Safe localStorage read/write & quota handling
│   │   └── modules/
│   │       ├── complaintForm.js      # Form validation, canvas compression & preview
│   │       ├── complaintList.js      # Card rendering, badge formatting & selection
│   │       ├── dashboardStats.js     # Top metrics counter updates
│   │       ├── complaintFilters.js   # Debounced search & dropdown filtering
│   │       └── detailsModal.js       # Complete grievance details & full photo view
│   └── assets/
├── docs/
│   ├── architecture.md         # System design, layer diagrams & data flow
│   ├── api-contract.md         # Future Spring Boot REST API specifications & MySQL schema
│   └── learning-guide.md       # 40+ Technical viva cross-questions & 2-min presentation script
├── test/
│   └── verify.js               # Automated 45-point test suite for logic & validation
├── server.js                   # Lightweight zero-dependency Node.js dev server
├── start-civicconnect.bat       # 1-Click Windows launch script
├── .gitignore
└── README.md
```

---

## 🚀 How to Run on Windows (4 Easy Methods)

### Method 1: 1-Click Double Click (Recommended for Windows)
Simply double-click the file:
```
start-civicconnect.bat
```
This automatically starts the local server and opens `http://localhost:3000` in your default browser.

---

### Method 2: Using Node.js (Zero external npm packages)
1. Open PowerShell or Command Prompt in the `CivicConnect` folder.
2. Run:
   ```powershell
   node server.js
   ```
3. Open your browser and visit:
   ```text
   http://localhost:3000
   ```

---

### Method 3: Using VS Code Live Server Extension
1. Open the `CivicConnect` folder in VS Code.
2. In the file explorer, navigate to `frontend/index.html`.
3. Right-click `index.html` and click **"Open with Live Server"**.

---

### Method 4: Using Python
If Python is installed, run from the `CivicConnect/frontend` folder:
```powershell
python -m http.server 3000
```
Then open `http://localhost:3000`.

---

## 🧪 Testing & Verification Checklist

To run the automated verification test suite:
```powershell
node test/verify.js
```
**Current automated test result: 45 / 45 Passed (0 Failed).**

| # | Flow / Feature | Status | Verification Detail |
|---|---|---|---|
| 1 | Dashboard initializes correctly | ✅ Verified | Seed data & layout loaded without console errors |
| 2 | Sample complaints display | ✅ Verified | 4 diverse initial complaints rendered |
| 3 | Valid complaint submission | ✅ Verified | Creates unique ID, prepends card, updates stats |
| 4 | Empty / invalid form rejection | ✅ Verified | Form prevented from submit; clear inline errors |
| 5 | Photo selection & preview | ✅ Verified | Preview thumbnail shown with file name and size |
| 6 | Invalid format / oversized photo | ✅ Verified | Rejects non-image files and files > 2MB |
| 7 | Client-side image compression | ✅ Verified | Scales max dimension to 800px at 75% JPEG via Canvas |
| 8 | Search by ID, Title, Location | ✅ Verified | Debounced live search filters cards correctly |
| 9 | Category & Status dropdown filters | ✅ Verified | Filters correctly combine with search text |
| 10 | Dashboard counters update | ✅ Verified | Total, Pending, In Progress, Resolved stay synchronized |
| 11 | Persistent storage on refresh | ✅ Verified | Browser `localStorage` retains state |
| 12 | Reset Demo Data confirmation | ✅ Verified | Confirmation modal resets back to 4 sample complaints |
| 13 | Mobile & Desktop layout | ✅ Verified | Responsive breakpoints at 768px and 1024px |

---

## ⚠️ Demo Scope & Storage Limitations

- **Browser-Specific Storage:** Data is stored in this browser's `localStorage`. Opening the site on another machine or clearing browser history will not share or retain the data.
- **Client-Side Prototype:** No actual server upload or remote database connection is made in Phase 1.
- **Read-Only Statuses:** Status changes (from *Pending* to *In Progress* or *Resolved*) will be unlocked in Phase 2 via the Department Staff Dashboard.

---

## 🔮 Phase 2 Roadmap (Spring Boot + MySQL)

1. **Java Spring Boot 3 Backend**:
   - REST Controllers for `/api/v1/complaints`.
   - Spring Data JPA with MySQL database connection.
   - Spring Security 6 with JWT token authentication.
2. **Staff & Admin Portals**:
   - Department Staff dashboard to inspect grievances and change status.
   - Admin dashboard for inter-department routing and performance analytics.
3. **Cloud Image Storage**:
   - AWS S3 or Google Cloud Storage integration for photo attachments.

---

## 📤 How to Push to GitHub

1. Open PowerShell inside the `CivicConnect` directory:
   ```powershell
   git init
   git add .
   git commit -m "feat: CivicConnect Phase 1 Citizen Dashboard complete"
   ```
2. Create a new repository on your GitHub account named `CivicConnect`.
3. Link your remote repository and push:
   ```powershell
   git branch -M main
   git remote add origin https://github.com/<your-username>/CivicConnect.git
   git push -u origin main
   ```
4. **Deploying on GitHub Pages:**
   - In your GitHub repo, go to **Settings** -> **Pages**.
   - Under **Source**, select `Deploy from a branch`.
   - Select `main` branch and `/frontend` folder.
   - Click **Save**. Your live URL will be ready in 1-2 minutes!

---

## 👨‍💻 Project Author
- **Developer:** B.Tech Computer Science & Engineering (4th Year)
- **Institution:** College of Engineering
- **Academic Year:** 2026
