import csv
import sqlite3

conn = sqlite3.connect("d:/smart-campus/backend/campus_lost_found.db")
cur = conn.cursor()

cur.execute("SELECT id, identifier, email, full_name FROM users ORDER BY id;")
sqlite_users = cur.fetchall()
print("SQLite Users:")
for u in sqlite_users:
    print(" ", u)

with open("d:/smart-campus/backend/db/01_users.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    csv_users = [row for row in reader]

print(f"\nCSV Users count: {len(csv_users)}")
csv_ids = {int(r['id']) for r in csv_users}
sqlite_ids = {u[0] for u in sqlite_users}
print("IDs in SQLite but not in CSV:", sqlite_ids - csv_ids)
print("IDs in CSV but not in SQLite:", csv_ids - sqlite_ids)

conn.close()

