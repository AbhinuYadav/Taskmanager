from sqlalchemy import text
from app.database import engine

def check_database():
    print("=" * 50)
    print("PostgreSQL Database Check")
    print("=" * 50)
    
    try:
        with engine.connect() as conn:
            # Check PostgreSQL version
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"\n✅ Connected to: {version[:80]}...")
            
            # Check current database
            result = conn.execute(text("SELECT current_database()"))
            db_name = result.fetchone()[0]
            print(f"📊 Database: {db_name}")
            
            # List all tables
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = result.fetchall()
            
            print("\n📋 Tables in database:")
            if tables:
                for table in tables:
                    # Count rows in each table
                    count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table[0]}"))
                    count = count_result.fetchone()[0]
                    print(f"   ✓ {table[0]} ({count} rows)")
            else:
                print("   ⚠️ No tables found. Run 'python init_db.py' first.")
                
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check password in .env file")
        print("3. Verify database 'taskmanager' exists")

if __name__ == "__main__":
    check_database()