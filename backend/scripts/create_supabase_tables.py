import sys
from pathlib import Path

backend_dir = Path("d:/smart-campus/backend")
sys.path.insert(0, str(backend_dir))

from app.database import engine, Base
import app.modules.auth.models
import app.modules.academic.models
import app.modules.attendance.models
import app.modules.materials.models
import app.modules.complaints.models
import app.modules.lost_and_found.models
import app.modules.notifications.models

print("Connecting to Supabase PostgreSQL and creating tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
except Exception as e:
    print("Error creating tables:", e)
    raise

