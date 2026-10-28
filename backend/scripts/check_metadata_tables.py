import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path("d:/smart-campus/backend")))

from app.database import Base
# Import all model modules
import app.modules.auth.models
import app.modules.academic.models
import app.modules.attendance.models
import app.modules.materials.models
import app.modules.complaints.models
import app.modules.core.models
import app.modules.lost_and_found.models
import app.modules.notifications.models

print(f"Total tables registered on Base.metadata: {len(Base.metadata.tables)}")
for t in sorted(Base.metadata.tables.keys()):
    print(" ", t)

