# QureAI — Smart OPD Queue Predictor

An AI-powered outpatient department (OPD) queue management system that replaces static token numbers with dynamic, machine-learning-predicted waiting times and live queue tracking.

---

## ?? Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Chart.js (`react-chartjs-2`), Lucide React, `qrcode.react`, Web Audio API Chimes.
- **Backend**: FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2.
- **Database**: SQLite (built-in zero configuration) / PostgreSQL ready.
- **Machine Learning**: Scikit-Learn `GradientBoostingRegressor` ($R^2 > 0.99$), Pandas, NumPy, Joblib.

---

## ?? Repository Structure

```
smart-opd-queue-predictor/
+-- backend/
¦   +-- opd_wait_model.joblib   # Trained Scikit-Learn ML regression model
¦   +-- ml_engine.py            # Dataset generator, training pipeline & inference engine
¦   +-- database.py             # SQLAlchemy DB engine, connection pooling
¦   +-- models.py               # Hospital, Doctor, Patient, Token, QueueHistory schemas
¦   +-- schemas.py              # Pydantic v2 validation models
¦   +-- main.py                 # FastAPI REST application & QureAI endpoints
¦   +-- opd_queue.db            # SQLite relational database
¦   +-- requirements.txt        # Python backend dependencies
+-- frontend/
¦   +-- index.html              # HTML shell & font definitions
¦   +-- package.json            # Node.js dependencies & scripts (qure-ai)
¦   +-- vite.config.js          # Vite config with /api proxy to port 8000
¦   +-- tailwind.config.js      # Tailwind CSS configuration with hospital palette
¦   +-- src/
¦       +-- App.jsx             # Root layout & tab router
¦       +-- main.jsx            # React root mount
¦       +-- index.css           # Tailwind directives & glow animations
¦       +-- services/
¦       ¦   +-- api.js          # Centralized API service layer
¦       +-- utils/
¦       ¦   +-- audio.js        # Web Audio API chime generator
¦       +-- components/
¦           +-- Navbar.jsx              # QureAI brand, clock, theme toggle & hospital switch
¦           +-- PatientTracker.jsx      # Token search, wait timer, turn chime, QR pass
¦           +-- ReceptionDesk.jsx       # Intake check-in, priority tagging, live queue actions
¦           +-- LiveDisplay.jsx         # Waiting lounge TV / Kiosk display board
¦           +-- AnalyticsDashboard.jsx  # Chart.js graphs, peak hours, doctor metrics
+-- README.md                   # Full architecture and deployment guide
```

---

## ? Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: `http://127.0.0.1:8000/docs`

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Web Application: `http://127.0.0.1:3000`
