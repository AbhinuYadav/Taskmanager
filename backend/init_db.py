from sqlalchemy import inspect, text
from app.database import engine, Base, test_connection
from app import models

def init_database():
    print("=" * 60)
    print("PostgreSQL Database Initialization")
    print("=" * 60)
    
    # Test connection
    print("\n1. Testing database connection...")
    if not test_connection():
        print("❌ Cannot proceed without database connection")
        return False
    
    # Create all tables
    print("\n2. Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
    
    # List all tables
    print("\n3. Tables created:")
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    if tables:
        for table in tables:
            print(f"   ✓ {table}")
    else:
        print("   No tables found?")
    
    print("\n" + "=" * 60)
    print("✅ Database initialization complete!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    init_database()