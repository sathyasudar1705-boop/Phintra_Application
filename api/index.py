import sys
import os

# Add backend folder to Python path
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Import FastAPI app from backend/app/main.py
from app.main import app