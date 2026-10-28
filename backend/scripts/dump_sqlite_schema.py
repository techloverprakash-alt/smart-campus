import sqlite3

conn = sqlite3.connect("d:/smart-campus/backend/campus_lost_found.db")
cur = conn.cursor()
cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;")
for name, sql in cur.fetchall():
    if not name.startswith("sqlite_"):
        print(f"--- TABLE: {name} ---")
        print(sql)
        print()
conn.close()

