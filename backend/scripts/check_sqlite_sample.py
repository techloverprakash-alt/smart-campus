import sqlite3

conn = sqlite3.connect("d:/smart-campus/backend/campus_lost_found.db")
cur = conn.cursor()
cur.execute("SELECT * FROM users LIMIT 2;")
print("users sample:", cur.fetchall())

cur.execute("SELECT * FROM subjects LIMIT 2;")
print("subjects sample:", cur.fetchall())

conn.close()

