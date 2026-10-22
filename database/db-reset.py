import os
import sys
import re
import pyodbc
from dotenv import load_dotenv

# Ưu tiên load database/.env, nếu không có thì fallback sang server/.env
env_path = os.path.join(os.path.dirname(__file__), '.env')
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(__file__), '..', 'server', '.env')
load_dotenv(env_path)

DB_SERVER = os.getenv('DB_SERVER', '127.0.0.1')
DB_PORT = os.getenv('DB_PORT', '1433')
DB_NAME = os.getenv('DB_NAME', 'bus_management')
DB_USER = os.getenv('DB_USER', 'bus_admin')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'BusBooking@2026')

DRIVER = '{ODBC Driver 17 for SQL Server}'

def get_server_target():
    if DB_PORT and ',' not in DB_SERVER and '\\' not in DB_SERVER:
        return f"{DB_SERVER},{DB_PORT}"
    return DB_SERVER

def get_connection(database, autocommit=False):
    server_target = get_server_target()
    
    # 1. Thử Windows Authentication (Trusted Connection)
    try:
        conn_str = f"DRIVER={DRIVER};SERVER={server_target};DATABASE={database};Trusted_Connection=yes;TrustServerCertificate=yes"
        return pyodbc.connect(conn_str, autocommit=autocommit)
    except Exception as e_win:
        # 2. Thử SQL Authentication (UID & PWD) nếu Windows Auth không thành công
        try:
            conn_str = f"DRIVER={DRIVER};SERVER={server_target};DATABASE={database};UID={DB_USER};PWD={DB_PASSWORD};TrustServerCertificate=yes"
            return pyodbc.connect(conn_str, autocommit=autocommit)
        except Exception as e_sql:
            print(f"[ERROR] Failed to connect to {server_target} ({database}):")
            print(f"  Windows Auth failed: {e_win}")
            print(f"  SQL Auth failed: {e_sql}")
            raise e_sql

def reset_database():
    try:
        server_target = get_server_target()
        print(f"Connecting to master database on [{server_target}]...")
        master_conn = get_connection('master', autocommit=True)
        master_cursor = master_conn.cursor()

        # In thông tin instance SQL Server thực tế
        master_cursor.execute("SELECT @@SERVERNAME, @@SERVICENAME")
        srv_name, svc_name = master_cursor.fetchone()
        print(f"--> Target SQL Server: {srv_name} (Service: {svc_name})")

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
        db_conn = get_connection(DB_NAME)
        db_cursor = db_conn.cursor()

        scripts_dir = os.path.join(os.path.dirname(__file__), 'scripts')
        
        # Thứ tự thực thi chuẩn xác theo phụ thuộc đồ thị đối tượng (Topological Order)
        ordered_files = [
            '01_schema.sql',
            '02_constraints.sql',
            '03_indexes.sql',
            '04_functions.sql',
            '05_transactions.sql',
            '06_triggers.sql',
            '09_views.sql',
            '08_stored_procedures.sql',
            '10_seed_data.sql',
            '07_permissions.sql',
        ]

        for file in ordered_files:
            file_path = os.path.join(scripts_dir, file)
            if not os.path.exists(file_path):
                print(f"Skipping {file} (not found)...")
                continue

            print(f"Executing {file}...")
            with open(file_path, 'r', encoding='utf-8') as f:
                sql_text = f.read()

            # Tách các lệnh batch bằng từ khóa 'GO'
            batches = re.split(r'(?i)^\s*GO\s*$', sql_text, flags=re.MULTILINE)

            for batch in batches:
                clean_batch = batch.strip()
                if clean_batch:
                    db_cursor.execute(clean_batch)
            
            db_conn.commit()

        db_conn.close()
        print(f"\n[OK] Database [{DB_NAME}] on [{srv_name}] reset and seeded successfully!")

    except Exception as e:
        print("\n[FAIL] Database reset failed:")
        print(e)
        sys.exit(1)

if __name__ == "__main__":
    reset_database()