import uvicorn
from app.database import test_connection

if __name__ == "__main__":
    print("Starting Task Manager Backend...")
    
    # Test database connection before starting
    if not test_connection():
        print("❌ Database connection failed. Please check your configuration.")
        print("Continuing anyway as it might work...")
    
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )