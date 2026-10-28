import datetime
from sqlalchemy import (
    Boolean,
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
import app.modules.auth.models as _auth_models


# =============================================================================
# Table 42: notifications
# =============================================================================
class Notification(Base):
    """
    Table 42: notifications
    User-directed push alerts, academic reminders, and system notifications.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(64), nullable=False, index=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", foreign_keys=[user_id])
    deliveries = relationship("NotificationDelivery", back_populates="notification", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Notification id={self.id} user_id={self.user_id} title='{self.title}'>"


# =============================================================================
# Table 43: emergency_broadcasts
# =============================================================================
class EmergencyBroadcast(Base):
    """
    Table 43: emergency_broadcasts
    High-priority campus-wide emergency bulletins.
    """
    __tablename__ = "emergency_broadcasts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    message = Column(Text, nullable=False)
    target_audience = Column(String(64), default="ALL_CAMPUS", nullable=False)
    status = Column(String(32), default="DRAFT", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    sent_at = Column(DateTime, nullable=True)

    creator = relationship("User", foreign_keys=[created_by])

    def __repr__(self):
        return f"<EmergencyBroadcast id={self.id} status='{self.status}'>"


# =============================================================================
# Table 44: notification_deliveries
# =============================================================================
class NotificationDelivery(Base):
    """
    Table 44: notification_deliveries
    Multi-channel dispatch logs (IN_APP, EMAIL, PUSH, SMS).
    """
    __tablename__ = "notification_deliveries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    notification_id = Column(Integer, ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False, index=True)
    channel = Column(String(32), nullable=False)  # IN_APP, EMAIL, PUSH, SMS
    delivery_status = Column(String(32), default="PENDING", nullable=False)  # DELIVERED, FAILED, PENDING
    attempt_count = Column(Integer, default=0, nullable=False)
    delivered_at = Column(DateTime, nullable=True)

    notification = relationship("Notification", back_populates="deliveries")

    def __repr__(self):
        return f"<NotificationDelivery id={self.id} channel='{self.channel}' status='{self.delivery_status}'>"

