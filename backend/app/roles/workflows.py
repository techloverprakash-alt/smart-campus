from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.modules.core.models import User
from app.modules.lost_and_found.models import FoundReport, LostReport
from app.modules.lost_and_found.repository import LostAndFoundRepository
from app.modules.lost_and_found.service import LostAndFoundService


class StudentWorkflow:
    """Workflows accessible to authenticated students."""
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user
        self.service = LostAndFoundService(db)
        self.repo = LostAndFoundRepository(db)

    def get_my_reports(self) -> List[LostReport]:
        return self.repo.list_lost_reports(reporter_id=self.user.id)

    def submit_lost_item(self, payload: Any) -> LostReport:
        return self.service.submit_lost_report(payload, reporter_id=self.user.id)


class OfficerWorkflow:
    """Workflows executed by campus security and custodial officers."""
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user
        self.service = LostAndFoundService(db)
        self.repo = LostAndFoundRepository(db)

    def intake_found_item(self, payload: Any) -> FoundReport:
        return self.service.submit_found_report(payload, reported_by=self.user.id)

    def process_handover_release(self, handover_data: Any) -> Any:
        return self.service.complete_handover(handover_data, officer_id=self.user.id)


class AdminWorkflow:
    """Workflows executed by campus administrators."""
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user
        self.service = LostAndFoundService(db)
        self.repo = LostAndFoundRepository(db)

    def get_custody_audit(self) -> Dict[str, Any]:
        total_lost = len(self.repo.list_lost_reports())
        total_found = len(self.repo.list_found_reports())
        active_matches = len(self.repo.list_matches(status="HANDOVER_READY"))
        return {
            "total_lost_reports": total_lost,
            "total_found_reports": total_found,
            "ready_for_handover_count": active_matches,
        }
