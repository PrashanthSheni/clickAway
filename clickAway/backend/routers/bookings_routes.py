from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from database import get_db
from models import (
    Booking, BookingState, BookingEvent, Resource, User, UserRole,
    NotificationType, ExtensionRequest,
)
from schemas import (
    BookingIn, BookingOut, ValidateOut, ValidationIssue, SuggestionOut,
    ApproveIn, RejectIn, CheckinIn, ExtensionIn, ExtensionOut,
    BookingEventOut, RecurringBookingIn, RecurringResult,
)
from auth import get_current_user, require_roles
from services import (
    validate_booking, gen_check_in_code, gen_qr_token, qr_png_base64,
    can_transition, notify, recompute_user_score, enrich_booking,
)
from ai_service import prioritize_bookings
import email_service
import os


def _app_link(path: str) -> str:
    base = os.environ.get("APP_URL", "").rstrip("/")
    return f"{base}{path}" if base else path


def _fmt_when(b: Booking) -> str:
    # Convert UTC to IST (UTC + 5:30)
    ist_time = b.start_time + timedelta(hours=5, minutes=30)
    return ist_time.strftime("%a %b %d, %Y %I:%M %p IST")

router = APIRouter(prefix="/bookings", tags=["bookings"])


async def _list_enriched(db: AsyncSession, bookings: List[Booking]) -> List[dict]:
    return [await enrich_booking(db, b) for b in bookings]


@router.post("/validate", response_model=ValidateOut)
async def validate(body: BookingIn, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    errors, warnings, suggestions, requires_approval, auto_approve = await validate_booking(
        db, user, body.resource_id, body.start_time, body.end_time, body.capacity_requested,
        title=body.title
    )
    return ValidateOut(
        ok=len(errors) == 0, errors=errors, warnings=warnings,
        suggestions=suggestions, requires_approval=requires_approval,
        auto_approve=auto_approve,
    )


@router.post("", response_model=BookingOut)
async def create_booking(body: BookingIn, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    errors, warnings, suggestions, requires_approval, auto_approve = await validate_booking(
        db, user, body.resource_id, body.start_time, body.end_time, body.capacity_requested,
        title=body.title
    )
    if errors:
        raise HTTPException(status_code=400, detail={"message": "Validation failed", "errors": [e.model_dump() for e in errors]})

    initial_state = BookingState.approved if auto_approve else BookingState.pending_approval
    b = Booking(
        user_id=user.id, resource_id=body.resource_id, title=body.title, notes=body.notes,
        start_time=body.start_time, end_time=body.end_time,
        capacity_requested=body.capacity_requested, state=initial_state,
        check_in_code=gen_check_in_code() if auto_approve else "",
        qr_token=gen_qr_token() if auto_approve else "",
        approved_by="system" if auto_approve else None,
        approval_note="Auto-approved based on reliability." if auto_approve else "",
    )
    db.add(b)
    await db.flush()
    db.add(BookingEvent(
        booking_id=b.id, actor_id=user.id, event_type="created",
        from_state="", to_state=initial_state.value,
        message="Auto-approved (BRS)" if auto_approve else "Pending approval",
    ))

    if initial_state == BookingState.pending_approval:
        # Notify manager or admin
        approver = None
        if user.manager_id:
            approver = (await db.execute(select(User).where(User.id == user.manager_id))).scalar_one_or_none()
        if not approver:
            approver = (await db.execute(select(User).where(User.role == UserRole.admin))).scalars().first()
        if approver:
            subject, html = email_service.tpl_approval_required(
                approver.name, user.name,
                (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name,
                _fmt_when(b), _app_link("/manager/approvals"),
            )
            await notify(
                db, approver.id, NotificationType.approval_required,
                "New booking approval required",
                f"{user.name} requested a booking on a restricted resource.",
                link="/manager/approvals",
                email_subject=subject, email_html=html,
            )
    else:
        resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
        subject, html = email_service.tpl_booking_approved(
            user.name, resource_name, _fmt_when(b), b.check_in_code or "—",
            _app_link(f"/bookings/{b.id}"),
        )
        await notify(
            db, user.id, NotificationType.booking_approved,
            "Booking auto-approved",
            f"Your booking starting {b.start_time.isoformat()} was auto-approved.",
            link=f"/bookings/{b.id}",
            email_subject=subject, email_html=html,
        )

    await db.commit()
    return BookingOut(**(await enrich_booking(db, b)))


@router.get("", response_model=List[BookingOut])
async def list_bookings(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    scope: str = Query("mine", description="mine|team|all"),
    state: Optional[str] = None,
    resource_id: Optional[str] = None,
):
    stmt = select(Booking)
    if scope == "mine":
        stmt = stmt.where(Booking.user_id == user.id)
    elif scope == "team":
        if user.role.value == "manager":
            team = (await db.execute(select(User).where(User.manager_id == user.id))).scalars().all()
            ids = [u.id for u in team] + [user.id]
            stmt = stmt.where(Booking.user_id.in_(ids))
        elif user.role.value == "admin":
            pass  # all
        else:
            stmt = stmt.where(Booking.user_id == user.id)
    elif scope == "all":
        if user.role.value not in ("admin", "manager"):
            stmt = stmt.where(Booking.user_id == user.id)

    if state:
        stmt = stmt.where(Booking.state == BookingState(state))
    if resource_id:
        stmt = stmt.where(Booking.resource_id == resource_id)

    stmt = stmt.order_by(Booking.start_time.desc()).limit(500)
    res = await db.execute(stmt)
    bookings = list(res.scalars().all())
    enriched = await _list_enriched(db, bookings)
    return [BookingOut(**e) for e in enriched]


@router.get("/approvals", response_model=List[BookingOut])
async def pending_approvals(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles("manager", "admin")),
):
    stmt = select(Booking).where(
        or_(
            Booking.state == BookingState.pending_approval,
            Booking.state == BookingState.extension_pending,
        )
    )
    if user.role.value == "manager":
        team = (await db.execute(select(User).where(User.manager_id == user.id))).scalars().all()
        ids = [u.id for u in team]
        stmt = stmt.where(Booking.user_id.in_(ids)) if ids else stmt.where(Booking.user_id == "__none__")
    stmt = stmt.order_by(Booking.created_at.asc())
    res = await db.execute(stmt)
    bookings = list(res.scalars().all())
    enriched = await _list_enriched(db, bookings)
    return [BookingOut(**e) for e in enriched]


@router.post("/prioritize", response_model=List[BookingOut])
async def prioritize_queue(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles("manager", "admin")),
):
    # Get the pending queue
    stmt = select(Booking).where(
        or_(
            Booking.state == BookingState.pending_approval,
            Booking.state == BookingState.extension_pending,
        )
    )
    if user.role.value == "manager":
        team = (await db.execute(select(User).where(User.manager_id == user.id))).scalars().all()
        ids = [u.id for u in team]
        stmt = stmt.where(Booking.user_id.in_(ids)) if ids else stmt.where(Booking.user_id == "__none__")
    
    res = await db.execute(stmt)
    bookings = list(res.scalars().all())
    if not bookings:
        return []

    # Enrich bookings
    enriched = await _list_enriched(db, bookings)
    
    # Run through AI prioritization
    prioritized = await prioritize_bookings(enriched)
    
    return [BookingOut(**e) for e in prioritized]


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(booking_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    b = (await db.execute(select(Booking).where(Booking.id == booking_id))).scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if user.role.value == "employee" and b.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return BookingOut(**(await enrich_booking(db, b)))


@router.get("/{booking_id}/events", response_model=List[BookingEventOut])
async def booking_events(booking_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    b = (await db.execute(select(Booking).where(Booking.id == booking_id))).scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if user.role.value == "employee" and b.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    events = (await db.execute(
        select(BookingEvent).where(BookingEvent.booking_id == booking_id).order_by(BookingEvent.created_at.asc())
    )).scalars().all()
    return [BookingEventOut.model_validate(e) for e in events]


@router.get("/{booking_id}/qr")
async def booking_qr(booking_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    b = (await db.execute(select(Booking).where(Booking.id == booking_id))).scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if user.role.value == "employee" and b.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if not b.qr_token:
        raise HTTPException(status_code=400, detail="QR not available until booking is approved.")
    payload = f"BOOKING:{b.id}:T:{b.qr_token}"
    return {"qr_image": qr_png_base64(payload), "code": b.check_in_code, "token": b.qr_token}


@router.post("/{booking_id}/trigger-code", response_model=BookingOut)
async def trigger_check_in_code(booking_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    b = (await db.execute(select(Booking).where(Booking.id == booking_id))).scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if b.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if b.state not in (BookingState.approved, BookingState.no_show_warning):
        raise HTTPException(status_code=400, detail=f"Cannot trigger code for booking in state '{b.state.value}'.")
    
    now = datetime.now(timezone.utc)
    # Allow 10 mins before start
    if now < b.start_time - timedelta(minutes=10):
        raise HTTPException(status_code=400, detail="Code generation opens 10 minutes before start time.")

    if not b.check_in_code:
        b.check_in_code = gen_check_in_code()
        db.add(BookingEvent(
            booking_id=b.id, actor_id=user.id, event_type="code_generated",
            from_state=b.state.value, to_state=b.state.value, message="Check-in code generated via QR/dashboard.",
        ))
        
        resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
        subject, html = email_service.tpl_check_in_code_delivered(user.name, resource_name, b.check_in_code)
        await notify(db, b.user_id, NotificationType.booking_approved, "Check-in code ready",
                     f"Your check-in code for {resource_name} is {b.check_in_code}",
                     link=f"/bookings/{b.id}", email_subject=subject, email_html=html)
        
        await db.commit()
    
    return BookingOut(**(await enrich_booking(db, b)))


@router.post("/{booking_id}/approve", response_model=BookingOut)
async def approve_booking(
    booking_id: str, body: ApproveIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles("manager", "admin")),
):
    b = (await db.execute(select(Booking).where(Booking.id == booking_id))).scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if b.state not in (BookingState.pending_approval, BookingState.extension_pending):
        raise HTTPException(status_code=400, detail=f"Cannot approve from state '{b.state.value}'.")

    from services import overlapping_bookings
    overlaps = await overlapping_bookings(db, b.resource_id, b.start_time, b.end_time, exclude_booking_id=b.id)
    if overlaps:
        # Check if it's a parking spot (which can have multiple overlaps)
        resource = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one()
        if resource.type.value != "parking":
            raise HTTPException(status_code=400, detail="Another booking was approved for this slot while this request was pending.")
        else:
            # For parking, check total capacity
            used = sum(o.capacity_requested for o in overlaps)
            if used + b.capacity_requested > resource.capacity:
                raise HTTPException(status_code=400, detail=f"Resource capacity reached ({used}/{resource.capacity} used).")

    from_state = b.state.value
    if b.state == BookingState.extension_pending:
        ext = (await db.execute(
            select(ExtensionRequest).where(ExtensionRequest.booking_id == b.id, ExtensionRequest.status == "pending")
            .order_by(ExtensionRequest.created_at.desc())
        )).scalars().first()
        if ext:
            b.end_time = ext.requested_end_time
            ext.status = "approved"
            ext.reviewed_by = user.id
        b.state = BookingState.approved
        resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
        subject, html = email_service.tpl_extension_update(
            (await db.execute(select(User).where(User.id == b.user_id))).scalar_one().name,
            resource_name, True, _app_link(f"/bookings/{b.id}"),
        )
        await notify(db, b.user_id, NotificationType.extension_update, "Extension approved",
                     "Your extension was approved.", link=f"/bookings/{b.id}",
                     email_subject=subject, email_html=html)
    else:
        b.state = BookingState.approved
        b.qr_token = gen_qr_token()
        owner = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one()
        resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
        subject, html = email_service.tpl_booking_approved(
            owner.name, resource_name, _fmt_when(b), "",
            _app_link(f"/bookings/{b.id}"),
        )
        await notify(db, b.user_id, NotificationType.booking_approved, "Booking approved",
                     "Your booking has been approved. Check your dashboard for the QR check-in code 10 minutes before your slot.",
                     link=f"/bookings/{b.id}",
                     email_subject=subject, email_html=html)

    b.approved_by = user.id
    b.approval_note = body.note
    db.add(BookingEvent(
        booking_id=b.id, actor_id=user.id, event_type="approved",
        from_state=from_state, to_state=b.state.value, message=body.note,
    ))
    await db.commit()
    return BookingOut(**(await enrich_booking(db, b)))


@router.post("/{booking_id}/reject", response_model=BookingOut)
async def reject_booking(
    booking_id: str, body: RejectIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_roles("manager", "admin")),
):
    b = (await db.execute(select(Booking).where(Booking.id == booking_id))).scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if b.state not in (BookingState.pending_approval, BookingState.extension_pending):
        raise HTTPException(status_code=400, detail=f"Cannot reject from state '{b.state.value}'.")
    from_state = b.state.value
    if b.state == BookingState.extension_pending:
        ext = (await db.execute(
            select(ExtensionRequest).where(ExtensionRequest.booking_id == b.id, ExtensionRequest.status == "pending")
            .order_by(ExtensionRequest.created_at.desc())
        )).scalars().first()
        if ext:
            ext.status = "rejected"
            ext.reviewed_by = user.id
        b.state = BookingState.approved  # back to approved
        resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
        owner = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one()
        subject, html = email_service.tpl_extension_update(
            owner.name, resource_name, False, _app_link(f"/bookings/{b.id}"),
        )
        await notify(db, b.user_id, NotificationType.extension_update, "Extension rejected",
                     body.note or "Extension request rejected.", link=f"/bookings/{b.id}",
                     email_subject=subject, email_html=html)
    else:
        b.state = BookingState.rejected
        resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
        owner = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one()
        subject, html = email_service.tpl_booking_rejected(
            owner.name, resource_name, _fmt_when(b), body.note, _app_link("/browse"),
        )
        await notify(db, b.user_id, NotificationType.booking_rejected, "Booking rejected",
                     body.note or "Your booking was rejected.", link=f"/bookings/{b.id}",
                     email_subject=subject, email_html=html)

    b.approval_note = body.note
    db.add(BookingEvent(
        booking_id=b.id, actor_id=user.id, event_type="rejected",
        from_state=from_state, to_state=b.state.value, message=body.note,
    ))
    await db.commit()
    return BookingOut(**(await enrich_booking(db, b)))


@router.post("/{booking_id}/cancel", response_model=BookingOut)
async def cancel_booking(booking_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    b = (await db.execute(select(Booking).where(Booking.id == booking_id))).scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    is_admin = user.role.value == "admin"
    is_owner = b.user_id == user.id
    if not is_owner and not is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    if not can_transition(b.state, BookingState.cancelled):
        raise HTTPException(status_code=400, detail=f"Cannot cancel from state '{b.state.value}'.")
    from_state = b.state.value
    b.state = BookingState.cancelled
    owner = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one_or_none()
    if owner and is_owner:
        owner.cancelled_count += 1
        await recompute_user_score(db, owner)
    db.add(BookingEvent(
        booking_id=b.id, actor_id=user.id, event_type="cancelled",
        from_state=from_state, to_state="cancelled",
        message="Force-cancelled by admin" if (is_admin and not is_owner) else "Cancelled by user",
    ))
    await db.commit()
    return BookingOut(**(await enrich_booking(db, b)))


@router.post("/{booking_id}/checkin", response_model=BookingOut)
async def checkin_booking(
    booking_id: str, body: CheckinIn,
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    b = (await db.execute(select(Booking).where(Booking.id == booking_id))).scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if b.user_id != user.id and user.role.value not in ("admin",):
        raise HTTPException(status_code=403, detail="Forbidden")
    if b.state not in (BookingState.approved, BookingState.no_show_warning):
        raise HTTPException(status_code=400, detail=f"Cannot check in from state '{b.state.value}'.")

    now = datetime.now(timezone.utc)
    window_start = b.start_time - timedelta(minutes=10)
    window_end = b.start_time + timedelta(minutes=15)
    if now < window_start:
        raise HTTPException(status_code=400, detail="Check-in opens 10 minutes before start time.")
    if now > window_end:
        raise HTTPException(status_code=400, detail="Check-in window has closed (15 min after start).")
    if (body.code or "").strip() != b.check_in_code:
        raise HTTPException(status_code=400, detail="Invalid check-in code.")

    from_state = b.state.value
    b.state = BookingState.checked_in
    b.checked_in_at = now
    db.add(BookingEvent(
        booking_id=b.id, actor_id=user.id, event_type="checked_in",
        from_state=from_state, to_state="checked_in", message="Checked in.",
    ))
    
    # Notify manager
    owner = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one_or_none()
    if owner and owner.manager_id:
        manager = (await db.execute(select(User).where(User.id == owner.manager_id))).scalar_one_or_none()
        if manager:
            resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
            subject, html = email_service.tpl_check_in_notification_to_manager(
                manager.name, owner.name, resource_name, _fmt_when(b)
            )
            await notify(
                db, manager.id, NotificationType.check_in_warning, # Reusing a type or can add a new one
                f"Check-in: {owner.name}",
                f"{owner.name} checked in to {resource_name} for the slot starting {_fmt_when(b)}",
                email_subject=subject, email_html=html
            )

    await db.commit()
    return BookingOut(**(await enrich_booking(db, b)))


@router.post("/{booking_id}/extend", response_model=ExtensionOut)
async def extend_booking(
    booking_id: str, body: ExtensionIn,
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    b = (await db.execute(select(Booking).where(Booking.id == booking_id))).scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if b.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if b.state not in (BookingState.approved, BookingState.checked_in):
        raise HTTPException(status_code=400, detail="Extensions allowed only for approved/checked-in bookings.")
    if body.new_end_time <= b.end_time:
        raise HTTPException(status_code=400, detail="New end time must be after current end.")

    # Check overlap with other bookings on same resource for the extension window
    from services import overlapping_bookings
    overlaps = await overlapping_bookings(db, b.resource_id, b.end_time, body.new_end_time, exclude_booking_id=b.id)
    if overlaps:
        raise HTTPException(status_code=400, detail="Extension conflicts with another booking.")

    ext = ExtensionRequest(
        booking_id=b.id, requested_end_time=body.new_end_time, reason=body.reason, status="pending",
    )
    db.add(ext)
    from_state = b.state.value
    b.state = BookingState.extension_pending
    db.add(BookingEvent(
        booking_id=b.id, actor_id=user.id, event_type="extension_requested",
        from_state=from_state, to_state="extension_pending", message=body.reason,
    ))
    # Notify approver
    approver = None
    owner = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one_or_none()
    if owner and owner.manager_id:
        approver = (await db.execute(select(User).where(User.id == owner.manager_id))).scalar_one_or_none()
    if not approver:
        approver = (await db.execute(select(User).where(User.role == UserRole.admin))).scalars().first()
    if approver:
        requester_name = owner.name if owner else "A user"
        resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
        subject, html = email_service.tpl_approval_required(
            approver.name, requester_name, resource_name, _fmt_when(b),
            _app_link("/manager/approvals"),
        )
        await notify(db, approver.id, NotificationType.approval_required,
                     "Extension approval required",
                     f"{requester_name} requested an extension.",
                     link="/manager/approvals",
                     email_subject=subject, email_html=html)
    await db.commit()
    await db.refresh(ext)
    return ExtensionOut.model_validate(ext)



@router.post("/recurring", response_model=RecurringResult)
async def create_recurring(
    body: RecurringBookingIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if body.occurrences < 1 or body.occurrences > 30:
        raise HTTPException(status_code=400, detail="Occurrences must be between 1 and 30.")
    if body.pattern not in ("daily", "weekly", "weekday"):
        raise HTTPException(status_code=400, detail="Pattern must be daily, weekly, or weekday.")

    created: list[dict] = []
    failed: list[dict] = []
    start = body.start_time
    end = body.end_time

    def advance(s, e, step_days: int):
        return s + timedelta(days=step_days), e + timedelta(days=step_days)

    generated = 0
    cur_start, cur_end = start, end
    while generated < body.occurrences:
        # Skip weekends for "weekday"
        if body.pattern == "weekday" and cur_start.weekday() >= 5:
            cur_start, cur_end = advance(cur_start, cur_end, 1)
            continue

        errors, _warnings, _sugg, requires_approval, auto_approve = await validate_booking(
            db, user, body.resource_id, cur_start, cur_end, body.capacity_requested,
            title=body.title
        )
        if errors:
            failed.append({
                "start_time": cur_start.isoformat(),
                "end_time": cur_end.isoformat(),
                "errors": [e.model_dump() for e in errors],
            })
        else:
            state = BookingState.approved if auto_approve else BookingState.pending_approval
            b = Booking(
                user_id=user.id, resource_id=body.resource_id,
                title=body.title, notes=body.notes,
                start_time=cur_start, end_time=cur_end,
                capacity_requested=body.capacity_requested, state=state,
                check_in_code=gen_check_in_code() if auto_approve else "",
                qr_token=gen_qr_token() if auto_approve else "",
                approved_by="system" if auto_approve else None,
                approval_note="Auto-approved (recurring series)." if auto_approve else "",
            )
            db.add(b)
            await db.flush()
            db.add(BookingEvent(
                booking_id=b.id, actor_id=user.id, event_type="created",
                from_state="", to_state=state.value,
                message=f"Recurring ({body.pattern}) · occurrence {generated + 1}",
            ))
            created.append(await enrich_booking(db, b))

        generated += 1
        step = 7 if body.pattern == "weekly" else 1
        cur_start, cur_end = advance(cur_start, cur_end, step)

    await db.commit()
    return RecurringResult(
        created=[BookingOut(**c) for c in created],
        failed=failed,
    )
