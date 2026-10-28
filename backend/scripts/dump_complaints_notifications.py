import csv
from pathlib import Path

csv_dir = Path("d:/smart-campus/backend/db")

check_indices = [
    "24_issue_categories",
    "25_complaints",
    "26_complaint_assignments",
    "27_work_orders",
    "28_work_order_media",
    "29_complaint_status_history",
    "30_spare_parts",
    "31_part_requisitions",
    "32_part_requisition_items",
    "33_complaint_upvotes",
    "42_notifications",
    "43_emergency_broadcasts",
    "44_notification_deliveries",
]

for name in check_indices:
    fpath = csv_dir / f"{name}.csv"
    with open(fpath, "r", encoding="utf-8") as f:
        reader = list(csv.reader(f))
        print(f"=== {name}.csv ({len(reader)-1} rows) ===")
        print("Header:", reader[0])
        for r in reader[1:]:
            print(" ", r)
        print()

