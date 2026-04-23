import secrets
import string
import io
import os
import asyncio
import base64
import logging
import qrcode
from datetime import datetime, timezone, timedelta
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func

from models import (
    Booking, Resource, ResourcePolicy, MaintenanceBlock, Notification,
    NotificationType, BookingState, User,
)
from schemas import ValidationIssue, SuggestionOut
import email_service

_email_log = logging.getLogger("email-dispatch")


def _app_link(path: str) -> str:
    base = os.environ.get("APP_URL", "").rstrip("/")
    return f"{base}{path}" if base else path


# ------------------------ QR / codes ------------------------
def gen_check_in_code() -> str:
    return "".join(secrets.choice(string.digits) for _ in range(6))


def gen_qr_token() -> str:
    return secrets.token_urlsafe(24)


def qr_png_base64(payload: str) -> str:
    img = qrcode.make(payload)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")


# ------------------------ State machine ------------------------
ALLOWED_TRANSITIONS = {
    BookingState.draft: {BookingState.pending_approval, BookingState.cancelled},
    BookingState.pending_approval: {BookingState.approved, BookingState.rejected, BookingState.cancelled},
    BookingState.approved: {
        BookingState.checked_in, BookingState.no_show_warning, BookingState.cancelled,
        BookingState.extension_pending, BookingState.completed, BookingState.no_show,
    },
    BookingState.checked_in: {BookingState.completed, BookingState.extension_pending, BookingState.cancelled},
    BookingState.no_show_warning: {BookingState.no_show, BookingState.checked_in, BookingState.cancelled},
    BookingState.extension_pending: {BookingState.approved, BookingState.checked_in, BookingState.completed, BookingState.cancelled},
    BookingState.no_show: set(),
    BookingState.rejected: set(),
    BookingState.cancelled: set(),
    BookingState.completed: set(),
}


def can_transition(from_s: BookingState, to_s: BookingState) -> bool:
    return to_s in ALLOWED_TRANSITIONS.get(from_s, set())


# ------------------------ Overlap / availability ------------------------
async def overlapping_bookings(
    db: AsyncSession,
    resource_id: str,
    start: datetime,
    end: datetime,
    exclude_booking_id: str | None = None,
) -> List[Booking]:
    stmt = select(Booking).where(
        Booking.resource_id == resource_id,
        Booking.start_time < end,
        Booking.end_time > start,
        Booking.state.in_([
            BookingState.approved, BookingState.pending_approval,
            BookingState.checked_in, BookingState.no_show_warning,
            BookingState.extension_pending,
        ]),
    )
    if exclude_booking_id:
        stmt = stmt.where(Booking.id != exclude_booking_id)
    res = await db.execute(stmt)
    return list(res.scalars().all())


async def maintenance_overlap(
    db: AsyncSession, resource_id: str, start: datetime, end: datetime
) -> List[MaintenanceBlock]:
    stmt = select(MaintenanceBlock).where(
        MaintenanceBlock.resource_id == resource_id,
        MaintenanceBlock.start_time < end,
        MaintenanceBlock.end_time > start,
    )
    res = await db.execute(stmt)
    return list(res.scalars().all())


def _parse_hhmm(s: str) -> Tuple[int, int]:
    try:
        parts = s.split(":")
        return int(parts[0]), int(parts[1])
    except Exception:
        return 0, 0


def _within_availability(resource: Resource, start: datetime, end: datetime) -> bool:
    sh, sm = _parse_hhmm(resource.availability_start)
    eh, em = _parse_hhmm(resource.availability_end)
    s_local = start.astimezone() if start.tzinfo else start
    e_local = end.astimezone() if end.tzinfo else end
    start_min = s_local.hour * 60 + s_local.minute
    end_min = e_local.hour * 60 + e_local.minute
    avail_start = sh * 60 + sm
    avail_end = eh * 60 + em
    # Allow across same day only
    if s_local.date() != e_local.date():
        return False
    return start_min >= avail_start and end_min <= avail_end


# ------------------------ Validation ------------------------
async def validate_booking(
    db: AsyncSession, user: User, resource_id: str, start: datetime,
    end: datetime, capacity_requested: int = 1, exclude_booking_id: str | None = None,
):
    errors: List[ValidationIssue] = []
    warnings: List[ValidationIssue] = []
    suggestions: List[SuggestionOut] = []

    if end <= start:
        errors.append(ValidationIssue(code="time_order", message="End time must be after start time."))

    resource = (await db.execute(select(Resource).where(Resource.id == resource_id))).scalar_one_or_none()
    if not resource:
        errors.append(ValidationIssue(code="resource_missing", message="Resource not found."))
        return errors, warnings, suggestions, False

    if not resource.active:
        errors.append(ValidationIssue(code="resource_inactive", message="Resource is currently inactive."))

    if not _within_availability(resource, start, end):
        def fmt_12(ts: str) -> str:
            try:
                h, m = map(int, ts.split(":"))
                suffix = "AM" if h < 12 else "PM"
                h = h % 12 or 12
                return f"{h}:{m:02d} {suffix}"
            except Exception:
                return ts
        errors.append(ValidationIssue(
            code="outside_hours",
            message=f"Outside availability hours ({fmt_12(resource.availability_start)}–{fmt_12(resource.availability_end)}).",
        ))

    # Policy checks
    policy_res = await db.execute(select(ResourcePolicy).where(ResourcePolicy.resource_id == resource.id))
    policy = policy_res.scalar_one_or_none()

    duration_min = max(0, int((end - start).total_seconds() // 60))
    now = datetime.now(timezone.utc)
    advance_min = int((start - now).total_seconds() // 60)

    if policy:
        if policy.max_duration_minutes and duration_min > policy.max_duration_minutes:
            errors.append(ValidationIssue(
                code="max_duration",
                message=f"Duration exceeds policy max of {policy.max_duration_minutes} minutes.",
            ))
        if policy.min_advance_minutes and advance_min < policy.min_advance_minutes:
            errors.append(ValidationIssue(
                code="min_advance",
                message=f"Must book at least {policy.min_advance_minutes} minutes in advance.",
            ))
        if policy.max_advance_days:
            max_advance_min = policy.max_advance_days * 24 * 60
            if advance_min > max_advance_min:
                errors.append(ValidationIssue(
                    code="max_advance",
                    message=f"Cannot book more than {policy.max_advance_days} days in advance.",
                ))
        if policy.allowed_departments and user.department not in policy.allowed_departments:
            errors.append(ValidationIssue(
                code="department_not_allowed",
                message=f"Department '{user.department}' is not allowed for this resource.",
            ))
        if policy.allowed_roles and user.role.value not in policy.allowed_roles:
            errors.append(ValidationIssue(
                code="role_not_allowed",
                message=f"Role '{user.role.value}' is not allowed for this resource.",
            ))

    # Maintenance
    mblocks = await maintenance_overlap(db, resource.id, start, end)
    if mblocks:
        errors.append(ValidationIssue(
            code="maintenance",
            message="Resource is under maintenance during the selected window.",
        ))

    # Overlap / capacity
    overlaps = await overlapping_bookings(db, resource.id, start, end, exclude_booking_id)
    if resource.type.value == "parking":
        used = sum(b.capacity_requested for b in overlaps)
        if used + capacity_requested > resource.capacity:
            errors.append(ValidationIssue(
                code="capacity_full",
                message=f"Capacity full: {used}/{resource.capacity} spots used.",
            ))
        elif used + capacity_requested > resource.capacity * 0.8:
            warnings.append(ValidationIssue(
                code="capacity_warn",
                message=f"Almost full: {used + capacity_requested}/{resource.capacity} after booking.",
            ))
    else:
        if overlaps:
            errors.append(ValidationIssue(
                code="overlap",
                message="Another booking exists for this resource in the selected window.",
            ))

    # Soft warning: low reliability
    if user.reliability_score < 70:
        warnings.append(ValidationIssue(
            code="low_reliability",
            message=f"Your reliability score is {int(user.reliability_score)}; booking will require approval.",
        ))

    # Suggestions when errors exist (overlap/capacity/maintenance)
    if errors:
        suggestions = await smart_suggestions(db, user, resource, start, end, capacity_requested)

    requires_approval = bool(resource.requires_approval) or user.reliability_score < 70
    auto_approve = (not bool(resource.requires_approval)) and user.reliability_score >= 70 and not errors

    return errors, warnings, suggestions, requires_approval, auto_approve


# ------------------------ Smart Suggestions ------------------------
async def smart_suggestions(
    db: AsyncSession, user: User, resource: Resource,
    start: datetime, end: datetime, capacity: int
) -> List[SuggestionOut]:
    duration = end - start
    out: List[SuggestionOut] = []

    # 1. Same resource, next slot (try +30 min, +1h, +2h)
    for delta_min in (30, 60, 120, 180):
        ns, ne = start + timedelta(minutes=delta_min), end + timedelta(minutes=delta_min)
        if not _within_availability(resource, ns, ne):
            continue
        overlaps = await overlapping_bookings(db, resource.id, ns, ne)
        m = await maintenance_overlap(db, resource.id, ns, ne)
        if not overlaps and not m:
            out.append(SuggestionOut(
                resource_id=resource.id, resource_name=resource.name,
                start_time=ns, end_time=ne,
                reason=f"Same resource, +{delta_min} min",
                rank_score=100 - delta_min * 0.1,
            ))
            break

    # 2. Same time, next day
    ns, ne = start + timedelta(days=1), end + timedelta(days=1)
    if _within_availability(resource, ns, ne):
        overlaps = await overlapping_bookings(db, resource.id, ns, ne)
        m = await maintenance_overlap(db, resource.id, ns, ne)
        if not overlaps and not m:
            out.append(SuggestionOut(
                resource_id=resource.id, resource_name=resource.name,
                start_time=ns, end_time=ne,
                reason="Same time, next day",
                rank_score=70.0,
            ))

    # 3. Different resource, same time
    alt_res = await db.execute(
        select(Resource).where(
            Resource.id != resource.id,
            Resource.type == resource.type,
            Resource.active == True,  # noqa
            Resource.capacity >= capacity,
        )
    )
    for alt in alt_res.scalars().all():
        if not _within_availability(alt, start, end):
            continue
        overlaps = await overlapping_bookings(db, alt.id, start, end)
        m = await maintenance_overlap(db, alt.id, start, end)
        if overlaps or m:
            continue
        floor_match = 10.0 if alt.floor == resource.floor else 0.0
        cap_match = max(0, 10 - abs(alt.capacity - capacity))
        out.append(SuggestionOut(
            resource_id=alt.id, resource_name=alt.name,
            start_time=start, end_time=end,
            reason=f"Alternative {alt.type.value} on floor {alt.floor}",
            rank_score=80 + floor_match + cap_match,
        ))
        if len(out) >= 6:
            break

    out.sort(key=lambda s: s.rank_score, reverse=True)
    return out[:5]


# ------------------------ Behavioral Reliability Score ------------------------
def compute_brs(completed: int, no_shows: int, cancelled: int) -> float:
    total = completed + no_shows + cancelled
    if total == 0:
        return 100.0
    no_show_penalty = (no_shows / total) * 60
    cancel_penalty = (cancelled / total) * 20
    score = 100.0 - no_show_penalty - cancel_penalty
    return max(0.0, min(100.0, round(score, 1)))


async def recompute_user_score(db: AsyncSession, user: User) -> float:
    user.reliability_score = compute_brs(user.completed_count, user.no_show_count, user.cancelled_count)
    await db.flush()
    return user.reliability_score


# ------------------------ Notifications ------------------------
async def notify(
    db: AsyncSession, user_id: str, ntype: NotificationType,
    title: str, message: str = "", link: str = "",
    email_subject: str | None = None, email_html: str | None = None,
):
    n = Notification(user_id=user_id, type=ntype, title=title, message=message, link=link)
    db.add(n)
    await db.flush()
    # Optional: send email in background
    if email_subject and email_html:
        user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
        if user and user.email:
            try:
                asyncio.create_task(email_service.send_email(user.email, email_subject, email_html))
            except Exception as e:
                _email_log.warning(f"email dispatch failed: {e}")
    return n


# ------------------------ Booking enrichment ------------------------
async def enrich_booking(db: AsyncSession, b: Booking) -> dict:
    user_res = await db.execute(select(User).where(User.id == b.user_id))
    u = user_res.scalar_one_or_none()
    res_res = await db.execute(select(Resource).where(Resource.id == b.resource_id))
    r = res_res.scalar_one_or_none()
    data = {
        "id": b.id, "user_id": b.user_id, "resource_id": b.resource_id,
        "title": b.title, "notes": b.notes, "start_time": b.start_time,
        "end_time": b.end_time, "capacity_requested": b.capacity_requested,
        "state": b.state.value, "check_in_code": b.check_in_code,
        "qr_token": b.qr_token, "checked_in_at": b.checked_in_at,
        "approved_by": b.approved_by, "approval_note": b.approval_note,
        "created_at": b.created_at, "updated_at": b.updated_at,
        "user_name": u.name if u else None,
        "resource_name": r.name if r else None,
    }
    return data
