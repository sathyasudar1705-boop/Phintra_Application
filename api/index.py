import sys
import os

# Add backend directory to the path so that app imports resolve correctly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi import FastAPI
from app.main import app as main_app

# Create a parent FastAPI application to mount our main_app
app = FastAPI(title="Phintra Vercel Handler")

# Mount the main app at the '/api' prefix to handle /api/* rewrites automatically
app.mount("/api", main_app)
