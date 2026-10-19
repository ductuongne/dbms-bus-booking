import os
import sys
import re
import pyodbc
from dotenv import load_dotenv

# Load .env file from the SAME directory as this script (the 'database' folder)
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

DB_SERVER = os.getenv('DB_SERVER', 'localhost')
DB_NAME = os.getenv('DB_NAME', 'bus_management')

DRIVER = '{ODBC Driver 17 for SQL Server}'

def get_connection_string(database):
    # Sử dụng Trusted_Connection=yes cho Windows Authentication
    return f"DRIVER={DRIVER};SERVER={DB_SERVER};DATABASE={database};Trusted_Connection=yes;TrustServerCertificate=yes"

def reset_database():
    try:
        print("Connecting to master database...")
        master_conn = pyodbc.connect(get_connection_string('master'), autocommit=True)
        master_cursor = master_conn.cursor()

        print(f"Dropping database [{DB_NAME}] if it exists...")
        master_cursor.execute(f"""
            IF DB_ID('{DB_NAME}') IS NOT NULL
            BEGIN
                ALTER DATABASE [{DB_NAME}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                DROP DATABASE [{DB_NAME}];
            END
        """)

        print(f"Creating database [{DB_NAME}]...")
        master_cursor.execute(f"CREATE DATABASE [{DB_NAME}]")
        master_conn.close()

        print(f"Connecting to new database [{DB_NAME}]...")
        db_conn = pyodbc.connect(get_connection_string(DB_NAME))
        db_cursor = db_conn.cursor()

        scripts_dir = os.path.join(os.path.dirname(__file__), 'scripts')
        
        # Get all .sql files and sort them alphabetically
        files = sorted([
            f for f in os.listdir(scripts_dir)
            if f.endswith('.sql')
            and f != '11_backup_restore.sql'
            and f != '07_permissions.sql'
        ])
                

        for file in files:
            print(f"Executing {file}...")
            file_path = os.path.join(scripts_dir, file)
            
            with open(file_path, 'r', encoding='utf-8') as f:
                sql_text = f.read()

            # Split script into separate statements using 'GO' as the delimiter
            batches = re.split(r'(?i)^\s*GO\s*$', sql_text, flags=re.MULTILINE)

            for batch in batches:
                if batch.strip():
                    db_cursor.execute(batch)
            
            db_conn.commit()

        db_conn.close()
        print("\n[OK] Database reset and seeded successfully!")

    except Exception as e:
        print("\n[FAIL] Database reset failed:")
        print(e)
        sys.exit(1)

if __name__ == "__main__":
    reset_database()