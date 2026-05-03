import psycopg2

# Test with your actual password
try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="postgres",  # Connect to default database first
        user="postgres",
        password="Abhinu@2105"  # Your actual password
    )
    print("✅ Successfully connected to PostgreSQL!")
    
    # Create a cursor
    cur = conn.cursor()
    
    # Get PostgreSQL version
    cur.execute("SELECT version()")
    version = cur.fetchone()
    print(f"PostgreSQL Version: {version[0][:50]}...")
    
    # Check if taskmanager database exists
    cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'taskmanager'")
    exists = cur.fetchone()
    
    if exists:
        print("✅ Database 'taskmanager' exists")
    else:
        print("❌ Database 'taskmanager' does NOT exist")
        print("Creating it now...")
        cur.execute("CREATE DATABASE taskmanager")
        print("✅ Database 'taskmanager' created")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Connection failed: {e}")
    print(f"Error type: {type(e).__name__}")