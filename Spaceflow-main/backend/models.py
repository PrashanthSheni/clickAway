import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text, Enum, Date
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from database import Base


def uuid_str():
    return str(uuid.uuid4())


def utcnow():
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    employee = "employee"
    manager = "manager"
    admin = "admin"


class ResourceType(str, enum.Enum):
    room = "room"
    desk = "desk"
    parking = "parking"
    equipment = "equipment"


class BookingState(str, enum.Enum):
    draft = "draft"
    pending_approval = "pending_approval"
    approved = "approved"
    rejected = "rejected"
    checked_in = "checked_in"
    no_show_warning = "no_show_warning"
    no_show = "no_show"
    extension_pending = "extension_pending"
    cancelled = "cancelled"
    completed = "completed"


class NotificationType(str, enum.Enum):
    booking_approved = "booking_approved"
    booking_rejected = "booking_rejected"
    check_in_warning = "check_in_warning"
    no_show = "no_show"
    maintenance_impact = "maintenance_impact"
    extension_update = "extension_update"
    approval_required = "approval_required"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.employee)
    department: Mapped[str] = mapped_column(String, default="General")
    manager_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String, default="approved")
    pending_manager_name: Mapped[str | None] = mapped_column(String, nullable=True)
    pending_manager_email: Mapped[str | None] = mapped_column(String, nullable=True)
    reliability_score: Mapped[float] = mapped_column(Float, default=100.0)
    completed_count: Mapped[int] = mapped_column(Integer, default=0)
    no_show_count: Mapped[int] = mapped_column(Integer, default=0)
    cancelled_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    bookings = relationship("Booking", back_populates="user", foreign_keys="Booking.user_id", cascade="all, delete-orphan")
    notifications = relationship("Notification", cascade="all, delete-orphan")


class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    email: Mapped[str] = mapped_column(String, index=True)
    code: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    name: Mapped[str] = mapped_column(String, index=True)
    type: Mapped[ResourceType] = mapped_column(Enum(ResourceType))
    description: Mapped[str] = mapped_column(Text, default="")
    floor: Mapped[int] = mapped_column(Integer, default=1)
    building: Mapped[str] = mapped_column(String, default="HQ")
    capacity: Mapped[int] = mapped_column(Integer, default=1)
    amenities: Mapped[list] = mapped_column(JSON, default=list)
    image_url: Mapped[str] = mapped_column(String, default="")
    availability_start: Mapped[str] = mapped_column(String, default="08:00")
    availability_end: Mapped[str] = mapped_column(String, default="20:00")
    x: Mapped[int] = mapped_column(Integer, default=0)  # floor map coordinates
    y: Mapped[int] = mapped_column(Integer, default=0)
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    policy = relationship("ResourcePolicy", back_populates="resource", uselist=False, cascade="all, delete-orphan")


class ResourcePolicy(Base):
    __tablename__ = "resource_policies"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    resource_id: Mapped[str] = mapped_column(String, ForeignKey("resources.id", ondelete="CASCADE"), unique=True)
    max_duration_minutes: Mapped[int] = mapped_column(Integer, default=240)
    min_advance_minutes: Mapped[int] = mapped_column(Integer, default=0)
    max_advance_days: Mapped[int] = mapped_column(Integer, default=30)
    allowed_departments: Mapped[list] = mapped_column(JSON, default=list)  # empty = all
    allowed_roles: Mapped[list] = mapped_column(JSON, default=list)  # empty = all

    resource = relationship("Resource", back_populates="policy")


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    resource_id: Mapped[str] = mapped_column(String, ForeignKey("resources.id"), index=True)
    title: Mapped[str] = mapped_column(String, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    capacity_requested: Mapped[int] = mapped_column(Integer, default=1)
    state: Mapped[BookingState] = mapped_column(Enum(BookingState), default=BookingState.pending_approval, index=True)
    check_in_code: Mapped[str] = mapped_column(String, default="")
    qr_token: Mapped[str] = mapped_column(String, default="")
    checked_in_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    approved_by: Mapped[str | None] = mapped_column(String, nullable=True)
    approval_note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="bookings", foreign_keys=[user_id])
    resource = relationship("Resource")
    events = relationship("BookingEvent", back_populates="booking", cascade="all, delete-orphan")
    extensions = relationship("ExtensionRequest", back_populates="booking", cascade="all, delete-orphan")
    alternative_suggestions = relationship("AlternativeSuggestion", cascade="all, delete-orphan")


class BookingEvent(Base):
    __tablename__ = "booking_events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    booking_id: Mapped[str] = mapped_column(String, ForeignKey("bookings.id", ondelete="CASCADE"), index=True)
    actor_id: Mapped[str | None] = mapped_column(String, nullable=True)
    event_type: Mapped[str] = mapped_column(String)
    from_state: Mapped[str] = mapped_column(String, default="")
    to_state: Mapped[str] = mapped_column(String, default="")
    message: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    booking = relationship("Booking", back_populates="events")


class MaintenanceBlock(Base):
    __tablename__ = "maintenance_blocks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    resource_id: Mapped[str] = mapped_column(String, ForeignKey("resources.id"), index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    reason: Mapped[str] = mapped_column(Text, default="")
    created_by: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ExtensionRequest(Base):
    __tablename__ = "extension_requests"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    booking_id: Mapped[str] = mapped_column(String, ForeignKey("bookings.id", ondelete="CASCADE"), index=True)
    requested_end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    reason: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String, default="pending")  # pending/approved/rejected
    reviewed_by: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    booking = relationship("Booking", back_populates="extensions")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType))
    title: Mapped[str] = mapped_column(String)
    message: Mapped[str] = mapped_column(Text, default="")
    link: Mapped[str] = mapped_column(String, default="")
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)


class AlternativeSuggestion(Base):
    __tablename__ = "alternative_suggestions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    booking_id: Mapped[str] = mapped_column(String, ForeignKey("bookings.id", ondelete="CASCADE"), index=True)
    resource_id: Mapped[str] = mapped_column(String)
    suggested_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    suggested_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    reason: Mapped[str] = mapped_column(String, default="")
    rank_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_str)
    email: Mapped[str] = mapped_column(String, index=True)
    success: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
