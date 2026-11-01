import os
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

db_url = os.getenv("DATABASE_URL")
print(f"Connecting to: {db_url.split('@')[-1] if db_url else 'None'}")

conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;")
tables = [r[0] for r in cur.fetchall()]
print(f"Supabase public tables count: {len(tables)}")
for t in tables:
    cur.execute(f'SELECT count(*) FROM public."{t}";')
    cnt = cur.fetchone()[0]
    print(f"  {t}: {cnt} rows")
conn.close()

