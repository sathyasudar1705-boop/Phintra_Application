# Phintra Security Monorepo

Phintra is a comprehensive employee security training and simulated phishing awareness platform. This monorepo organizes the project into structured, clean, and distinct subprojects.

## Folder Structure

```
phintra-project/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── database.py        # Database connection config
│   │   ├── config.py          # App configuration
│   │   ├── dependencies.py    # FastAPI dependencies
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routes/            # API endpoint routers
│   │   ├── services/          # Business logic services
│   │   ├── utils/             # Helpers
│   │   └── middleware/        # Middlewares
│   ├── migrations/            # Alembic migrations folder
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Backend environment configuration
│   └── README_BACKEND.md      # Backend setup guide
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx           # React main entrypoint
│   │   ├── App.jsx            # React root component
│   │   ├── routes/            # Routing configuration
│   │   ├── pages/             # Portal pages (admin, employee, auth)
│   │   ├── components/        # Reusable UI components
│   │   ├── layouts/           # Page layouts
│   │   ├── context/           # React contexts
│   │   ├── services/          # API services
│   │   ├── assets/            # Static assets
│   │   └── styles/            # CSS styles
│   ├── package.json           # Frontend Node dependencies
│   ├── .env.example           # Frontend environment configuration
│   └── README_FRONTEND.md     # Frontend setup guide
│
├── gmail-addon/
│   ├── Code.js                # Apps Script code
│   ├── appsscript.json        # Apps Script manifest
│   └── README_GMAIL_ADDON.md  # Gmail Add-on setup guide
│
├── docs/                      # UI/UX & technical documentation
│   ├── PHINTRA_UI_UX_DOCUMENTATION.md
│   ├── PHINTRA_USER_FLOW_DOCUMENTATION.md
│   ├── PHINTRA_BUTTON_AND_COLOR_GUIDE.md
│   └── PHINTRA_TECHNICAL_FLOW.md
│
├── archive_unused/            # Archive directory for duplicate/unused files
├── README.md                  # Monorepo documentation
└── .gitignore                 # Monorepo git ignores
```

## Required Environment Variables

### Backend (`backend/.env`)
Create a `.env` file inside the `backend/` directory with the following variables:
```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_email
SMTP_PASSWORD=your_smtp_password
```

### Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend/` directory with the following variable:
```env
VITE_API_BASE_URL=http://127.0.0.1:8001
```

## Startup Commands

### Running Backend
From the root directory:
```bash
cd backend
venv\Scripts\activate      # On Windows
source venv/bin/activate   # On Unix/macOS
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### Running Frontend
From the root directory in a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

---

## Troubleshooting & Common Errors

### 1. Backend Import Errors
If you receive a `ModuleNotFoundError: No module named 'app'`, make sure you run uvicorn with `python -m uvicorn app.main:app` from the `backend/` directory.

### 2. Frontend Port Collision
Vite runs on port `5173` by default. If port `5173` is already in use, Vite will prompt to run on the next available port. Update your `FRONTEND_URL` in the backend `.env` accordingly.

### 3. Database Connection Issues
Verify that `DATABASE_URL` is set correctly and the database server is running. If using Neon or PostgreSQL, ensure the connection string is valid.
