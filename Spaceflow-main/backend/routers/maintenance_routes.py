from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from typing import List

from database import get_db
from models import MaintenanceBlock, Booking, BookingState, User, BookingEvent, NotificationType
from schemas import MaintenanceIn, MaintenanceOut, MaintenanceImpact, BookingOut
from auth import get_current_user, require_roles
from services import enrich_booking, smart_suggestions, notify
import email_service
import os


def _app_link(path: str) -> str:
    base = os.environ.get("APP_URL", "").rstrip("/")
    return f"{base}{path}" if base else path

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


@router.get("", response_model=List[MaintenanceOut])
async def list_maintenance(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    res = await db.execute(select(MaintenanceBlock).order_by(MaintenanceBlock.start_time.desc()))
    return [MaintenanceOut.model_validate(m) for m in res.scalars().all()]


@router.post("/preview")
async def preview_maintenance(
    body: MaintenanceIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles("admin")),
):
    # Find affected bookings
    stmt = select(Booking).where(
        Booking.resource_id == body.resource_id,
        Booking.start_time < body.end_time,
        Booking.end_time > body.start_time,
        Booking.state.in_([
            BookingState.approved, BookingState.pending_approval,
            BookingState.checked_in, BookingState.no_show_warning,
            BookingState.extension_pending,
        ]),
    )
    res = await db.execute(stmt)
    affected = list(res.scalars().all())
    affected_out = [BookingOut(**(await enrich_booking(db, b))) for b in affected]

    # Suggestions per booking
    suggestions_by_booking = {}
    from models import Resource
    for b in affected:
        r = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one_or_none()
        u = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one_or_none()
        if r and u:
            sugg = await smart_suggestions(db, u, r, b.start_time, b.end_time, b.capacity_requested)
            suggestions_by_booking[b.id] = [s.model_dump() for s in sugg]
    return {"affected_bookings": [a.model_dump() for a in affected_out],
            "suggestions_by_booking": suggestions_by_booking}


@router.post("", response_model=MaintenanceOut)
async def create_maintenance(
    body: MaintenanceIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles("admin")),
):
    m = MaintenanceBlock(**body.model_dump(), created_by=user.id)
    db.add(m)
    await db.flush()

    # Cancel affected bookings
    stmt = select(Booking).where(
        Booking.resource_id == body.resource_id,
        Booking.start_time < body.end_time,
        Booking.end_time > body.start_time,
        Booking.state.in_([
            BookingState.approved, BookingState.pending_approval,
            BookingState.checked_in, BookingState.no_show_warning,
            BookingState.extension_pending,
        ]),
    )
    res = await db.execute(stmt)
    for b in res.scalars().all():
        from_state = b.state.value
        b.state = BookingState.cancelled
        db.add(BookingEvent(
            booking_id=b.id, actor_id=user.id, event_type="cancelled_maintenance",
            from_state=from_state, to_state="cancelled",
            message=f"Cancelled due to maintenance: {body.reason}",
        ))
        from models import Resource as _R
        owner = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one_or_none()
        resource_name = (await db.execute(select(_R).where(_R.id == b.resource_id))).scalar_one().name
        ist_time = b.start_time + timedelta(hours=5, minutes=30)
        when_s = ist_time.strftime("%a %b %d, %Y %I:%M %p IST")
        subject, html = email_service.tpl_maintenance_impact(
            owner.name if owner else "there", resource_name, when_s, body.reason,
            _app_link("/browse"),
        )
        await notify(
            db, b.user_id, NotificationType.maintenance_impact,
            "Booking cancelled due to maintenance",
            body.reason or "Resource maintenance scheduled.",
            link=f"/bookings/{b.id}",
            email_subject=subject, email_html=html,
        )
    await db.commit()
    await db.refresh(m)
    return MaintenanceOut.model_validate(m)
