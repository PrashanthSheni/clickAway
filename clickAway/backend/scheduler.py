import os
import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import AsyncSessionLocal
from models import Booking, BookingState, BookingEvent, User, NotificationType, Resource
from services import notify, recompute_user_score
import email_service


def _app_link(path: str) -> str:
    base = os.environ.get("APP_URL", "").rstrip("/")
    return f"{base}{path}" if base else path


def _fmt_when(b: Booking) -> str:
    # Convert UTC to IST (UTC + 5:30)
    ist_time = b.start_time + timedelta(hours=5, minutes=30)
    return ist_time.strftime("%a %b %d, %Y %I:%M %p IST")


CHECK_IN_EARLY_MIN = 10
WARNING_GRACE_MIN = 10  # warning at +10 after start
NO_SHOW_GRACE_MIN = 15  # auto-cancel at +15 after start (user gets 5 min warning)
APPROVAL_ESCALATION_HOURS = 24


async def _add_event(db: AsyncSession, b: Booking, event_type: str, from_state: str, to_state: str, message: str = ""):
    db.add(BookingEvent(
        booking_id=b.id, event_type=event_type,
        from_state=from_state, to_state=to_state, message=message,
    ))


async def job_no_show_warning():
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        threshold = now - timedelta(minutes=WARNING_GRACE_MIN)
        res = await db.execute(
            select(Booking).where(
                Booking.state == BookingState.approved,
                Booking.start_time <= threshold,
                Booking.end_time > now,
            )
        )
        bookings = list(res.scalars().all())
        for b in bookings:
            b.state = BookingState.no_show_warning
            await _add_event(db, b, "no_show_warning", "approved", "no_show_warning",
                             "Auto warning: booking not checked in within 10 min grace.")
            owner = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one_or_none()
            resource = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one_or_none()
            subject, html = email_service.tpl_check_in_warning(
                owner.name if owner else "there",
                resource.name if resource else "your booking",
                _fmt_when(b), _app_link(f"/bookings/{b.id}"),
            )
            await notify(
                db, b.user_id, NotificationType.check_in_warning,
                "Check-in warning",
                f"You haven't checked in for booking '{b.title or b.id[:8]}'. Check in soon.",
                link=f"/bookings/{b.id}",
                email_subject=subject, email_html=html,
            )
        if bookings:
            await db.commit()


async def job_auto_no_show():
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        threshold = now - timedelta(minutes=NO_SHOW_GRACE_MIN)
        res = await db.execute(
            select(Booking).where(
                Booking.state.in_([BookingState.no_show_warning, BookingState.approved]),
                Booking.start_time <= threshold,
            )
        )
        bookings = list(res.scalars().all())
        for b in bookings:
            from_state = b.state.value
            b.state = BookingState.no_show
            await _add_event(db, b, "no_show", from_state, "no_show", "Auto no-show after 20 min grace.")
            # Update user stats + BRS
            user = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one_or_none()
            if user:
                user.no_show_count += 1
                await recompute_user_score(db, user)
            resource = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one_or_none()
            subject, html = email_service.tpl_no_show(
                user.name if user else "there",
                resource.name if resource else "your booking",
                _fmt_when(b), _app_link(f"/bookings/{b.id}"),
            )
            await notify(
                db, b.user_id, NotificationType.no_show, "Marked as no-show",
                f"Booking '{b.title or b.id[:8]}' was marked as no-show.",
                link=f"/bookings/{b.id}",
                email_subject=subject, email_html=html,
            )
        if bookings:
            await db.commit()


async def job_complete_bookings():
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        res = await db.execute(
            select(Booking).where(
                Booking.state == BookingState.checked_in,
                Booking.end_time <= now,
            )
        )
        bookings = list(res.scalars().all())
        for b in bookings:
            b.state = BookingState.completed
            await _add_event(db, b, "completed", "checked_in", "completed", "Booking completed.")
            user = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one_or_none()
            if user:
                user.completed_count += 1
                await recompute_user_score(db, user)
        if bookings:
            await db.commit()


async def job_escalate_approvals():
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        threshold = now - timedelta(hours=APPROVAL_ESCALATION_HOURS)
        res = await db.execute(
            select(Booking).where(
                Booking.state == BookingState.pending_approval,
                Booking.created_at <= threshold,
            )
        )
        bookings = list(res.scalars().all())
        for b in bookings:
            # Notify all admins
            admins = (await db.execute(select(User).where(User.role == "admin"))).scalars().all()
            for a in admins:
                await notify(
                    db, a.id, NotificationType.approval_required,
                    "Escalated approval",
                    f"Booking {b.id[:8]} pending > {APPROVAL_ESCALATION_HOURS}h. Needs admin action.",
                    link=f"/admin/bookings",
                )
            await _add_event(db, b, "escalation", "pending_approval", "pending_approval",
                             "Escalated to admin after timeout.")
        if bookings:
            await db.commit()


async def job_auto_send_codes():
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        # Find bookings starting in the next 10-11 minutes that are approved but have no code yet
        lower = now + timedelta(minutes=9)
        upper = now + timedelta(minutes=11)
        
        res = await db.execute(
            select(Booking).where(
                Booking.state == BookingState.approved,
                Booking.start_time >= lower,
                Booking.start_time <= upper,
                Booking.check_in_code == "",
            )
        )
        bookings = list(res.scalars().all())
        from services import gen_check_in_code
        
        for b in bookings:
            b.check_in_code = gen_check_in_code()
            db.add(BookingEvent(
                booking_id=b.id, event_type="code_generated",
                from_state=b.state.value, to_state=b.state.value,
                message="Auto-generated code dispatched 10min before start.",
            ))
            
            user = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one_or_none()
            resource = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one_or_none()
            
            if user and resource:
                subject, html = email_service.tpl_check_in_code_delivered(user.name, resource.name, b.check_in_code)
                await notify(
                    db, b.user_id, NotificationType.booking_approved,
                    "Your check-in code is ready",
                    f"Check-in code for {resource.name}: {b.check_in_code}",
                    link=f"/bookings/{b.id}",
                    email_subject=subject, email_html=html,
                )
        
        if bookings:
            await db.commit()


def start_scheduler():
    from apscheduler.schedulers.asyncio import AsyncIOScheduler

    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(job_no_show_warning, "interval", minutes=1, id="no_show_warning")
    scheduler.add_job(job_auto_no_show, "interval", minutes=1, id="auto_no_show")
    scheduler.add_job(job_complete_bookings, "interval", minutes=1, id="complete_bookings")
    scheduler.add_job(job_auto_send_codes, "interval", minutes=1, id="auto_send_codes")
    scheduler.add_job(job_escalate_approvals, "interval", minutes=10, id="escalate_approvals")
    scheduler.start()
    return scheduler
