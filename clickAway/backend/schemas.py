from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    name: str
    role: str
    department: str
    manager_id: Optional[str] = None
    status: str
    pending_manager_name: Optional[str] = None
    pending_manager_email: Optional[str] = None
    reliability_score: float
    completed_count: int
    no_show_count: int
    cancelled_count: int


class ManagerHierarchy(BaseModel):
    manager: UserOut
    employees: List[UserOut]


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    pending_manager_name: Optional[str] = None
    pending_manager_email: Optional[EmailStr] = None
    verification_code: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    department: Optional[str] = None
    manager_id: Optional[str] = None


class DeleteUserIn(BaseModel):
    reason: str


class SendVerificationCodeIn(BaseModel):
    email: EmailStr


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class PolicyIn(BaseModel):
    max_duration_minutes: int = 240
    min_advance_minutes: int = 0
    max_advance_days: int = 30
    allowed_departments: List[str] = []
    allowed_roles: List[str] = []


class PolicyOut(PolicyIn):
    model_config = ConfigDict(from_attributes=True)
    id: str
    resource_id: str


class ResourceIn(BaseModel):
    name: str
    type: str
    description: str = ""
    floor: int = 1
    building: str = "HQ"
    capacity: int = 1
    amenities: List[str] = []
    image_url: str = ""
    availability_start: str = "08:00"
    availability_end: str = "20:00"
    x: int = 0
    y: int = 0
    requires_approval: bool = False
    active: bool = True
    policy: Optional[PolicyIn] = None


class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    type: str
    description: str
    floor: int
    building: str
    capacity: int
    amenities: List[str]
    image_url: str
    availability_start: str
    availability_end: str
    x: int
    y: int
    requires_approval: bool
    active: bool
    policy: Optional[PolicyOut] = None


class BookingIn(BaseModel):
    resource_id: str
    title: str = Field(..., min_length=3, max_length=100)
    notes: str = ""
    start_time: datetime
    end_time: datetime
    capacity_requested: int = 1


class RecurringBookingIn(BookingIn):
    pattern: str = "daily"  # daily | weekly | weekday
    occurrences: int = 1    # total occurrences (including first)


class RecurringResult(BaseModel):
    created: List["BookingOut"] = []
    failed: List[dict] = []  # {start_time, end_time, errors:[...]}


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    resource_id: str
    title: str
    notes: str
    start_time: datetime
    end_time: datetime
    capacity_requested: int
    state: str
    check_in_code: str
    qr_token: str
    checked_in_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    approval_note: str
    created_at: datetime
    updated_at: datetime
    # Enriched
    user_name: Optional[str] = None
    resource_name: Optional[str] = None
    ai_priority: Optional[int] = None


class ValidationIssue(BaseModel):
    code: str
    message: str


class SuggestionOut(BaseModel):
    resource_id: str
    resource_name: str
    start_time: datetime
    end_time: datetime
    reason: str
    rank_score: float


class ValidateOut(BaseModel):
    ok: bool
    errors: List[ValidationIssue] = []
    warnings: List[ValidationIssue] = []
    suggestions: List[SuggestionOut] = []
    requires_approval: bool = False
    auto_approve: bool = False


class ApproveIn(BaseModel):
    note: str = ""


class RejectIn(BaseModel):
    note: str = ""


class CheckinIn(BaseModel):
    code: str


class ExtensionIn(BaseModel):
    new_end_time: datetime
    reason: str = ""


class ExtensionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    booking_id: str
    requested_end_time: datetime
    reason: str
    status: str
    reviewed_by: Optional[str] = None
    created_at: datetime


class MaintenanceIn(BaseModel):
    resource_id: str
    start_time: datetime
    end_time: datetime
    reason: str = ""


class MaintenanceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    resource_id: str
    start_time: datetime
    end_time: datetime
    reason: str
    created_by: str
    created_at: datetime


class MaintenanceImpact(BaseModel):
    affected_bookings: List[BookingOut]
    suggestions_by_booking: dict


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    type: str
    title: str
    message: str
    link: str
    read: bool
    created_at: datetime


class BookingEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    event_type: str
    from_state: str
    to_state: str
    message: str
    actor_id: Optional[str] = None
    created_at: datetime


class AnalyticsOverview(BaseModel):
    total_bookings: int
    active_bookings: int
    total_resources: int
    total_users: int
    no_show_rate: float
    avg_utilization: float
    utilization_by_resource: List[dict]
    bookings_by_department: List[dict]
    bookings_by_day: List[dict]
    peak_hours: List[dict]
    underutilized_resources: List[dict]


class FeedbackIn(BaseModel):
    booking_id: str
    content: str


class FeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    booking_id: str
    user_id: str
    resource_id: str
    content: str
    status: str
    manager_note: Optional[str] = None
    admin_note: Optional[str] = None
    created_at: datetime
    # Enriched
    user_name: Optional[str] = None
    resource_name: Optional[str] = None


class FeedbackEscalateIn(BaseModel):
    manager_note: str = ""


class FeedbackResolveIn(BaseModel):
    admin_note: str = ""
