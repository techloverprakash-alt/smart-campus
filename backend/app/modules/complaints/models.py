import datetime
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base
import app.modules.academic.models as _academic_models
import app.modules.auth.models as _auth_models


# =============================================================================
# Table 24: issue_categories
# =============================================================================
class IssueCategory(Base):
    """
    Table 24: issue_categories
    Categories for campus facility complaints (HVAC, Electrical, IT, etc.).
    """
    __tablename__ = "issue_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(128), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    default_priority = Column(String(32), default="MEDIUM", nullable=False)

    complaints = relationship("Complaint", back_populates="category")

    def __repr__(self):
        return f"<IssueCategory id={self.id} name='{self.name}'>"


# =============================================================================
# Table 25: complaints
# =============================================================================
class Complaint(Base):
    """
    Table 25: complaints
    Infrastructure and maintenance issue tickets filed by students or staff.
    """
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_number = Column(String(64), unique=True, nullable=False, index=True)
    reported_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("campus_locations.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("issue_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    room_identifier = Column(String(64), nullable=True)
    description = Column(Text, nullable=False)
    priority = Column(String(32), default="MEDIUM", nullable=False, index=True)
    status = Column(String(32), default="OPEN", nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    reporter = relationship("User", foreign_keys=[reported_by])
    location = relationship("CampusLocation", foreign_keys=[location_id])
    category = relationship("IssueCategory", back_populates="complaints")
    assignments = relationship("ComplaintAssignment", back_populates="complaint", cascade="all, delete-orphan")
    work_orders = relationship("WorkOrder", back_populates="complaint", cascade="all, delete-orphan")
    status_history = relationship("ComplaintStatusHistory", back_populates="complaint", cascade="all, delete-orphan")
    upvotes = relationship("ComplaintUpvote", back_populates="complaint", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Complaint id={self.id} ticket='{self.ticket_number}' status='{self.status}'>"


# =============================================================================
# Table 26: complaint_assignments
# =============================================================================
class ComplaintAssignment(Base):
    """
    Table 26: complaint_assignments
    Technician and maintenance staff task delegation.
    """
    __tablename__ = "complaint_assignments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    complaint = relationship("Complaint", back_populates="assignments")
    technician = relationship("User", foreign_keys=[assigned_to])
    assigner = relationship("User", foreign_keys=[assigned_by])

    def __repr__(self):
        return f"<ComplaintAssignment id={self.id} complaint_id={self.complaint_id} tech={self.assigned_to}>"


# =============================================================================
# Table 27: work_orders
# =============================================================================
class WorkOrder(Base):
    """
    Table 27: work_orders
    Technical field repair workflow and SLA tracking.
    """
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), default="PENDING", nullable=False, index=True)
    target_sla = Column(DateTime, nullable=True)
    diagnostic_note = Column(Text, nullable=True)
    technician_remarks = Column(Text, nullable=True)
    lockout_tag = Column(String(64), nullable=True)

    complaint = relationship("Complaint", back_populates="work_orders")
    media = relationship("WorkOrderMedia", back_populates="work_order", cascade="all, delete-orphan")
    requisitions = relationship("PartRequisition", back_populates="work_order", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<WorkOrder id={self.id} complaint_id={self.complaint_id} status='{self.status}'>"


# =============================================================================
# Table 28: work_order_media
# =============================================================================
class WorkOrderMedia(Base):
    """
    Table 28: work_order_media
    Visual inspection and proof of repair photos (BEFORE / AFTER).
    """
    __tablename__ = "work_order_media"

    id = Column(Integer, primary_key=True, autoincrement=True)
    work_order_id = Column(Integer, ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    media_id = Column(Integer, ForeignKey("media_attachments.id", ondelete="CASCADE"), nullable=False, index=True)
    photo_type = Column(String(32), nullable=False)  # BEFORE, AFTER

    work_order = relationship("WorkOrder", back_populates="media")
    media_attachment = relationship("MediaAttachment")

    def __repr__(self):
        return f"<WorkOrderMedia id={self.id} wo={self.work_order_id} type='{self.photo_type}'>"


# =============================================================================
# Table 29: complaint_status_history
# =============================================================================
class ComplaintStatusHistory(Base):
    """
    Table 29: complaint_status_history
    Audit trail of status transitions for complaint resolution.
    """
    __tablename__ = "complaint_status_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    changed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    old_status = Column(String(32), nullable=True)
    new_status = Column(String(32), nullable=False)
    changed_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    complaint = relationship("Complaint", back_populates="status_history")
    user = relationship("User", foreign_keys=[changed_by])

    def __repr__(self):
        return f"<ComplaintStatusHistory id={self.id} {self.old_status}->{self.new_status}>"


# =============================================================================
# Table 30: spare_parts
# =============================================================================
class SparePart(Base):
    """
    Table 30: spare_parts
    Inventory of maintenance replacement components.
    """
    __tablename__ = "spare_parts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    part_code = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    trade = Column(String(64), nullable=False, index=True)
    stock = Column(Integer, default=0, nullable=False)
    storage_bin = Column(String(64), nullable=True)

    requisition_items = relationship("PartRequisitionItem", back_populates="spare_part")

    def __repr__(self):
        return f"<SparePart id={self.id} code='{self.part_code}' stock={self.stock}>"


# =============================================================================
# Table 31: part_requisitions
# =============================================================================
class PartRequisition(Base):
    """
    Table 31: part_requisitions
    Material requests filed by technicians for work orders.
    """
    __tablename__ = "part_requisitions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    work_order_id = Column(Integer, ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    requested_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(32), default="PENDING", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    work_order = relationship("WorkOrder", back_populates="requisitions")
    requester = relationship("User", foreign_keys=[requested_by])
    items = relationship("PartRequisitionItem", back_populates="requisition", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<PartRequisition id={self.id} wo={self.work_order_id} status='{self.status}'>"


# =============================================================================
# Table 32: part_requisition_items
# =============================================================================
class PartRequisitionItem(Base):
    """
    Table 32: part_requisition_items
    Line items for parts requested with quantities.
    """
    __tablename__ = "part_requisition_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    requisition_id = Column(Integer, ForeignKey("part_requisitions.id", ondelete="CASCADE"), nullable=False, index=True)
    spare_part_id = Column(Integer, ForeignKey("spare_parts.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Integer, default=1, nullable=False)

    requisition = relationship("PartRequisition", back_populates="items")
    spare_part = relationship("SparePart", back_populates="requisition_items")

    def __repr__(self):
        return f"<PartRequisitionItem id={self.id} part={self.spare_part_id} qty={self.quantity}>"


# =============================================================================
# Table 33: complaint_upvotes
# =============================================================================
class ComplaintUpvote(Base):
    """
    Table 33: complaint_upvotes
    Community validation and priority escalation through peer upvotes.
    """
    __tablename__ = "complaint_upvotes"

    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    complaint = relationship("Complaint", back_populates="upvotes")
    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<ComplaintUpvote complaint_id={self.complaint_id} user_id={self.user_id}>"

