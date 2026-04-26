from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone, timedelta
from collections import defaultdict

from database import get_db
from models import Booking, BookingState, Resource, User
from auth import get_current_user, require_roles

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/overview")
async def overview(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("admin", "manager")),
):
    total = (await db.execute(select(func.count(Booking.id)))).scalar() or 0
    active = (await db.execute(select(func.count(Booking.id)).where(
        Booking.state.in_([BookingState.approved, BookingState.checked_in, BookingState.pending_approval])
    ))).scalar() or 0
    total_res = (await db.execute(select(func.count(Resource.id)).where(Resource.active == True))).scalar() or 0  # noqa
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0

    no_show = (await db.execute(select(func.count(Booking.id)).where(Booking.state == BookingState.no_show))).scalar() or 0
    completed = (await db.execute(select(func.count(Booking.id)).where(Booking.state == BookingState.completed))).scalar() or 0
    relevant = no_show + completed
    no_show_rate = round((no_show / relevant * 100) if relevant > 0 else 0, 1)

    # Utilization by resource (last 30 days) — sum booked hours / available hours
    since = datetime.now(timezone.utc) - timedelta(days=30)
    bookings = (await db.execute(
        select(Booking).where(Booking.start_time >= since,
                              Booking.state.in_([BookingState.approved, BookingState.checked_in,
                                                 BookingState.completed, BookingState.no_show_warning,
                                                 BookingState.extension_pending]))
    )).scalars().all()

    hours_by_resource = defaultdict(float)
    for b in bookings:
        hrs = max(0, (b.end_time - b.start_time).total_seconds() / 3600)
        hours_by_resource[b.resource_id] += hrs

    resources = (await db.execute(select(Resource).where(Resource.active == True))).scalars().all()  # noqa
    util_rows = []
    under_rows = []
    total_util = 0.0
    for r in resources:
        try:
            sh = int(r.availability_start.split(":")[0])
            eh = int(r.availability_end.split(":")[0])
            daily = max(1, eh - sh)
        except Exception:
            daily = 10
        available_hours = daily * 30 * max(1, r.capacity if r.type.value == "parking" else 1)
        util = min(100.0, round((hours_by_resource[r.id] / available_hours) * 100, 1)) if available_hours else 0
        util_rows.append({"resource_id": r.id, "name": r.name, "type": r.type.value,
                          "utilization": util, "hours": round(hours_by_resource[r.id], 1)})
        total_util += util
        if util < 15:
            under_rows.append({"resource_id": r.id, "name": r.name, "utilization": util})
    avg_util = round(total_util / len(resources), 1) if resources else 0

    # Bookings by department
    dept_count = defaultdict(int)
    for b in bookings:
        u = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one_or_none()
        if u:
            dept_count[u.department] += 1
    dept_rows = [{"department": k, "count": v} for k, v in dept_count.items()]

    # Bookings by day (last 14 days)
    by_day = defaultdict(int)
    for i in range(14):
        d = (datetime.now(timezone.utc) - timedelta(days=13 - i)).date().isoformat()
        by_day[d] = 0
    for b in bookings:
        key = b.start_time.date().isoformat()
        if key in by_day:
            by_day[key] += 1
    day_rows = [{"date": k, "count": v} for k, v in sorted(by_day.items())]

    # Peak hours heatmap (0-23)
    hour_count = [0] * 24
    for b in bookings:
        hour_count[b.start_time.hour] += 1
    peak_rows = [{"hour": i, "count": c} for i, c in enumerate(hour_count)]

    return {
        "total_bookings": total, "active_bookings": active,
        "total_resources": total_res, "total_users": total_users,
        "no_show_rate": no_show_rate, "avg_utilization": avg_util,
        "utilization_by_resource": util_rows,
        "bookings_by_department": dept_rows,
        "bookings_by_day": day_rows,
        "peak_hours": peak_rows,
        "underutilized_resources": under_rows,
    }
