from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from .database import engine, Base, test_connection
from .routers import auth, projects, tasks, members
import os

print("=" * 50)
print("Starting Task Manager API")
print("=" * 50)

# Test database connection
test_connection()

# Create database tables
print("📋 Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Database tables ready!")

app = FastAPI(title="Team Task Manager API", version="1.0.0")
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Add your NEW Railway Frontend URL here:
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://comfortable-achievement-production.up.railway.app",
        "https://comfortable-achievement-production-6e17.up.railway.app",
        "https://taskmanager-app-by-abhinu.up.railway.app"# <--- Paste your URL here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(members.router)

@app.get("/")
def root():
    return {
        "message": "Team Task Manager API", 
        "status": "running", 
        "database": "PostgreSQL"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

print("=" * 50)
print("🚀 Server is ready to start!")
print("=" * 50)
