from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from typing import Optional

from database import get_db
from models import Booking, BookingState, User, Resource
from auth import get_current_user
from services import enrich_booking

router = APIRouter(prefix="/calendar", tags=["calendar"])


def _parse(dt: Optional[str]) -> Optional[datetime]:
    if not dt:
        return None
    try:
        return datetime.fromisoformat(dt.replace("Z", "+00:00"))
    except Exception:
        return None


async def _range_bookings(db: AsyncSession, start: datetime, end: datetime, user_filter=None, resource_id=None):
    stmt = select(Booking).where(
        Booking.start_time < end, Booking.end_time > start,
        Booking.state.in_([BookingState.approved, BookingState.pending_approval,
                           BookingState.checked_in, BookingState.no_show_warning,
                           BookingState.extension_pending, BookingState.completed]),
    )
    if user_filter:
        stmt = stmt.where(Booking.user_id.in_(user_filter))
    if resource_id:
        stmt = stmt.where(Booking.resource_id == resource_id)
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.get("/employee")
async def employee_calendar(
    start: Optional[str] = None, end: Optional[str] = None,
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    s = _parse(start) or datetime.now(timezone.utc) - timedelta(days=7)
    e = _parse(end) or datetime.now(timezone.utc) + timedelta(days=30)
    bookings = await _range_bookings(db, s, e, user_filter=[user.id])
    return [await enrich_booking(db, b) for b in bookings]


@router.get("/team")
async def team_calendar(
    start: Optional[str] = None, end: Optional[str] = None,
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    s = _parse(start) or datetime.now(timezone.utc) - timedelta(days=7)
    e = _parse(end) or datetime.now(timezone.utc) + timedelta(days=30)
    ids = [user.id]
    if user.role.value == "manager":
        team = (await db.execute(select(User).where(User.manager_id == user.id))).scalars().all()
        ids = [u.id for u in team] + [user.id]
    elif user.role.value == "admin":
        all_users = (await db.execute(select(User))).scalars().all()
        ids = [u.id for u in all_users]
    bookings = await _range_bookings(db, s, e, user_filter=ids)
    return [await enrich_booking(db, b) for b in bookings]


@router.get("/resource/{resource_id}")
async def resource_calendar(
    resource_id: str,
    start: Optional[str] = None, end: Optional[str] = None,
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    s = _parse(start) or datetime.now(timezone.utc) - timedelta(days=7)
    e = _parse(end) or datetime.now(timezone.utc) + timedelta(days=30)
    bookings = await _range_bookings(db, s, e, resource_id=resource_id)
    return [await enrich_booking(db, b) for b in bookings]
