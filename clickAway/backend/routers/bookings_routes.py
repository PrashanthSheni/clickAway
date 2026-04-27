from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import HTMLResponse
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
            
            # Also notify the employee that their request is pending
            resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
            req_subject, req_html = email_service.tpl_booking_requested(
                user.name, resource_name, _fmt_when(b), _app_link("/bookings")
            )
            await notify(
                db, user.id, NotificationType.approval_required, # Using approval_required as a generic type here
                "Booking request pending",
                f"Your request for {resource_name} is pending approval.",
                link="/bookings",
                email_subject=req_subject, email_html=req_html,
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
            Booking.state == BookingState.release_pending,
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
            Booking.state == BookingState.release_pending,
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
    
    # Auto-generate code if within 10 min window and missing
    now = datetime.now(timezone.utc)
    if b.state in (BookingState.approved, BookingState.no_show_warning):
        if not b.check_in_code and (b.start_time - now) <= timedelta(minutes=10):
            from services import gen_check_in_code
            b.check_in_code = gen_check_in_code()
            db.add(BookingEvent(
                booking_id=b.id, event_type="code_generated",
                from_state=b.state.value, to_state=b.state.value,
                message="Code generated on QR request (within 10m window).",
            ))
            await db.commit()
            # Note: We don't send email here to avoid double-emailing if scheduler also runs,
            # but usually the scheduler handles the email.
    
    payload = b.check_in_code if b.check_in_code else "CHECK-IN NOT OPEN"
    
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
    b.checked_in_at = datetime.now(timezone.utc)
    db.add(BookingEvent(
        booking_id=b.id, actor_id=user.id, event_type="checked_in",
        from_state=from_state, to_state="checked_in", message="User checked in with code.",
    ))
    
    # Notify employee with confirmation email
    resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
    subject, html = email_service.tpl_check_in_confirmation(user.name, resource_name, _fmt_when(b))
    await notify(
        db, user.id, NotificationType.booking_approved,
        "Check-in Successful",
        f"You have successfully checked in for {resource_name}.",
        link=f"/bookings/{b.id}",
        email_subject=subject, email_html=html,
    )
    
    await db.commit()
    
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


@router.get("/public-scan/{qr_token}")
async def public_scan(qr_token: str, db: AsyncSession = Depends(get_db)):
    """
    Public endpoint for QR scanners. 
    Triggers the 6-digit check-in code dispatch to the user's email.
    """
    b = (await db.execute(select(Booking).where(Booking.qr_token == qr_token))).scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Invalid or expired QR token.")
    
    if b.state == BookingState.checked_in:
        return {"status": "info", "message": "You are already checked in.", "booking_id": b.id}
        
    if b.state not in (BookingState.approved, BookingState.no_show_warning):
        raise HTTPException(status_code=400, detail=f"Check-in not available for booking in state '{b.state.value}'.")

    now = datetime.now(timezone.utc)
    # Check 10 min window
    if now < b.start_time - timedelta(minutes=10):
        diff = b.start_time - timedelta(minutes=10) - now
        mins = int(diff.total_seconds() / 60) + 1
        raise HTTPException(status_code=400, detail=f"Check-in window opens in {mins} minute(s).")
    
    if now > b.end_time:
        raise HTTPException(status_code=400, detail="This booking slot has already expired.")

    # Generate code if needed
    if not b.check_in_code:
        b.check_in_code = gen_check_in_code()
        db.add(BookingEvent(
            booking_id=b.id, actor_id="system:qr_scanner", event_type="code_generated",
            from_state=b.state.value, to_state=b.state.value, message="Check-in code triggered via QR Scan.",
        ))
    
    # Fetch user and resource for email
    owner = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one()
    resource = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one()
    
    # Send Email
    subject, html = email_service.tpl_check_in_code_delivered(owner.name, resource.name, b.check_in_code)
    await notify(db, b.user_id, NotificationType.booking_approved, "Check-in code ready",
                 f"Your check-in code for {resource.name} is {b.check_in_code}",
                 link=f"/bookings/{b.id}", email_subject=subject, email_html=html)

    await db.commit()
    
    return HTMLResponse(content=f"""
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Inter', sans-serif; background: #0F172A; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }}
        .card {{ background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 24px; max-width: 400px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }}
        .icon {{ font-size: 48px; margin-bottom: 20px; }}
        h1 {{ font-weight: 900; letter-spacing: -0.02em; margin: 0 0 10px 0; font-size: 24px; }}
        p {{ color: #94A3B8; line-height: 1.6; font-size: 15px; margin-bottom: 20px; }}
        .code-box {{ background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); padding: 20px; border-radius: 16px; margin-bottom: 30px; }}
        .code-label {{ font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #38BDF8; font-weight: 900; margin-bottom: 8px; }}
        .code {{ font-size: 32px; font-weight: 900; letter-spacing: 0.3em; color: white; font-family: monospace; }}
        .btn {{ background: #2563EB; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; display: inline-block; transition: all 0.3s; font-size: 14px; }}
        .btn:hover {{ background: #3B82F6; transform: translateY(-2px); }}
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">🔐</div>
        <h1>Security Identity</h1>
        <p>Access authorized for <strong>{resource.name}</strong>.</p>
        
        <div class="code-box">
            <div class="code-label">Check-in Code</div>
            <div class="code">{b.check_in_code}</div>
        </div>

        <p style="font-size: 12px; margin-bottom: 24px;">This code was also dispatched to your registered email.</p>
        <a href="{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/checkin" class="btn">Return to Dashboard</a>
    </div>
</body>
</html>
    """)


@router.post("/{booking_id}/request-release", response_model=BookingOut)
async def request_early_release(
    booking_id: str,
    db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user),
):
    """Employee signals they are finished early."""
    res = await db.execute(select(Booking).where(Booking.id == booking_id))
    b = res.scalar_one_or_none()
    if not b or b.user_id != user.id:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if b.state != BookingState.checked_in:
        raise HTTPException(status_code=400, detail="Only checked-in bookings can be released early.")

    b.state = BookingState.release_pending
    db.add(BookingEvent(
        booking_id=b.id, actor_id=user.id, event_type="release_requested",
        from_state="checked_in", to_state="release_pending", message="Employee requested early release.",
    ))
    
    # Notify manager
    if user.manager_id:
        try:
            resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
            subject, html = email_service.tpl_early_release_request(user.name, resource_name, _fmt_when(b))
            await notify(
                db, user.manager_id, NotificationType.release_requested,
                "Early Release Request",
                f"{user.name} is finished with {resource_name} early. Click to free up the resource.",
                link="/manager/approvals",
                email_subject=subject, email_html=html
            )
        except Exception as e:
            # Silently log notification failures so they don't block the actual release request
            import logging
            logging.getLogger("uvicorn.error").error(f"Early Release Notification failed: {e}")
    
    await db.commit()
    return BookingOut(**(await enrich_booking(db, b)))


@router.post("/{booking_id}/approve-release", response_model=BookingOut)
async def approve_early_release(
    booking_id: str,
    db: AsyncSession = Depends(get_db), user: User = Depends(require_roles("manager", "admin")),
):
    """Manager approves early release, making resource available immediately."""
    res = await db.execute(select(Booking).where(Booking.id == booking_id))
    b = res.scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    if b.state != BookingState.release_pending:
        raise HTTPException(status_code=400, detail="No early release request found for this booking.")

    from_state = b.state.value
    b.state = BookingState.completed
    # Adjust end time to now so others can book immediately
    b.end_time = datetime.now(timezone.utc)
    
    db.add(BookingEvent(
        booking_id=b.id, actor_id=user.id, event_type="release_approved",
        from_state=from_state, to_state="completed", message="Manager approved early release.",
    ))
    
    # Update employee stats
    owner = (await db.execute(select(User).where(User.id == b.user_id))).scalar_one_or_none()
    if owner:
        owner.completed_count += 1
        await recompute_user_score(db, owner)
        
        # Send confirmation to employee
        resource_name = (await db.execute(select(Resource).where(Resource.id == b.resource_id))).scalar_one().name
        await notify(
            db, owner.id, NotificationType.booking_approved,
            "Early Release Approved",
            f"Your early release for {resource_name} was approved. Thank you for freeing up the resource!",
            link=f"/bookings/{b.id}"
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
