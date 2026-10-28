import os
import psycopg2

db_url = "postgresql://postgres:VmJAuSEGo94YbYAi@db.svxpszxdzlmceiahtqmj.supabase.co:5432/postgres"

conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;")
tables = [r[0] for r in cur.fetchall()]
print(f"Supabase public tables count: {len(tables)}")
for t in tables:
    cur.execute(f"SELECT count(*) FROM public.{t};")
    cnt = cur.fetchone()[0]
    print(f"  {t}: {cnt} rows")
conn.close()

