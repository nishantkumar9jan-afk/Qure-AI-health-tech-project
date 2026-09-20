# QureAI — Patient OPD Queue & Wait Time Predictor

A patient-centric outpatient department (OPD) queue intelligence platform that predicts personalized consultation waiting times, provides dynamic queue positions, and sends turn proximity alerts directly to patients' devices.

---

## ?? Features for Patients

1. **Live Token Tracking**:
   - Real-time countdown of predicted waiting minutes with confidence intervals.
   - Live count of patients ahead in line.
   - Assigned doctor, specialization, room location, and current serving token.
2. **Turn Proximity Notifications**:
   - Two-tone Web Audio API chime when patient is next or turn is near.
   - Mobile alerts simulator for SMS and WhatsApp.
3. **Digital QR Code Token Pass**:
   - Generates an on-screen QR pass that can be scanned or saved to easily reopen tracking on any phone.
4. **Self Check-In**:
   - Patients can check in digitally, choose their physician/department, and instantly receive their OPD token.
5. **Live Doctor Queues & Schedules**:
   - Check current doctor caseloads, consult status (Consulting, Available, On Break), and wait times before arriving.

---

## ?? Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, `qrcode.react`, Web Audio API.
- **Backend**: FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2.
- **Machine Learning**: Scikit-Learn `GradientBoostingRegressor` ($R^2 > 0.99$).
- **Database**: SQLite (built-in) / PostgreSQL ready.

---

## ? Quick Start

```bash
# Backend (FastAPI + ML Engine)
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Frontend (React 18 + Vite)
cd frontend
npm install
npm run dev
```

App: `http://127.0.0.1:3000`  
Docs: `http://127.0.0.1:8000/docs`
