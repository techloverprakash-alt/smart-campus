import csv
import os
import sqlite3
from pathlib import Path
import psycopg2

BASE_DIR = Path(__file__).resolve().parent.parent
env_file = BASE_DIR / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'\""))

db_path = BASE_DIR / "campus_lost_found.db"
sqlite_conn = sqlite3.connect(db_path)
sqlite_cur = sqlite_conn.cursor()

pg_url = os.getenv("DATABASE_URL")
pg_conn = None
pg_cur = None
try:
    pg_conn = psycopg2.connect(pg_url, connect_timeout=5)
    pg_cur = pg_conn.cursor()
except Exception as e:
    print(f"Warning: Remote PostgreSQL connection skipped ({e})")

csv_dir = BASE_DIR / "db"
print(f"{'Table / CSV':<34} | {'CSV':>5} | {'SQLite':>6} | {'Supabase PG':>11}")
print("-" * 65)

for cf in sorted(csv_dir.glob("*.csv")):
    tbl = cf.stem.split("_", 1)[1]
    with open(cf, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)
        csv_count = sum(1 for _ in reader)
    
    sqlite_cur.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name=?;", (tbl,))
    exists = sqlite_cur.fetchone()[0]
    sqlite_count = None
    if exists:
        sqlite_cur.execute(f"SELECT count(*) FROM {tbl};")
        sqlite_count = sqlite_cur.fetchone()[0]
    
    pg_count = None
    if pg_cur:
        try:
            pg_cur.execute(f'SELECT count(*) FROM public."{tbl}";')
            pg_count = pg_cur.fetchone()[0]
        except Exception:
            pg_conn.rollback()
            pg_count = "N/A"
    
    print(f"{tbl:<34} | {csv_count:>5} | {str(sqlite_count):>6} | {str(pg_count):>11}")

sqlite_conn.close()
if pg_conn:
    pg_conn.close()

