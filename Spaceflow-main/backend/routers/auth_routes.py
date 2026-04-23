from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone, timedelta
import os

from database import get_db
from models import User, LoginAttempt, VerificationCode, UserRole, Notification, NotificationType
from schemas import LoginIn, TokenOut, UserOut, RegisterIn, SendVerificationCodeIn
from auth import verify_password, create_access_token, get_current_user, hash_password
from email_service import send_email
import random
import string

router = APIRouter(prefix="/auth", tags=["auth"])


def _max_attempts() -> int:
    try:
        return int(os.environ.get("LOGIN_MAX_ATTEMPTS", "5"))
    except Exception:
        return 5


def _lockout_minutes() -> int:
    try:
        return int(os.environ.get("LOGIN_LOCKOUT_MINUTES", "15"))
    except Exception:
        return 15


async def _recent_failures(db: AsyncSession, email: str) -> tuple[int, datetime | None]:
    """Count consecutive failed attempts after the most recent success within the lockout window."""
    window_start = datetime.now(timezone.utc) - timedelta(minutes=_lockout_minutes())
    stmt = (
        select(LoginAttempt)
        .where(LoginAttempt.email == email, LoginAttempt.created_at >= window_start)
        .order_by(LoginAttempt.created_at.desc())
    )
    rows = (await db.execute(stmt)).scalars().all()
    failures = 0
    earliest_fail: datetime | None = None
    for r in rows:
        if r.success:
            break
        failures += 1
        earliest_fail = r.created_at
    return failures, earliest_fail


@router.post("/login", response_model=TokenOut)
async def login(body: LoginIn, request: Request, db: AsyncSession = Depends(get_db)):
    email = body.email.lower().strip()

    # Brute-force lockout: check failed attempts in the window BEFORE verifying
    failures, earliest = await _recent_failures(db, email)
    if failures >= _max_attempts() and earliest:
        unlock_at = earliest + timedelta(minutes=_lockout_minutes())
        remaining = int((unlock_at - datetime.now(timezone.utc)).total_seconds() / 60) + 1
        if datetime.now(timezone.utc) < unlock_at:
            raise HTTPException(
                status_code=429,
                detail=f"Too many failed attempts. Try again in {max(1, remaining)} minute(s).",
            )

    res = await db.execute(select(User).where(User.email == email))
    user = res.scalar_one_or_none()
    
    if user and user.status != "approved":
        raise HTTPException(status_code=401, detail="Account pending approval or rejected.")
    success = bool(user and verify_password(body.password, user.password_hash))

    db.add(LoginAttempt(email=email, success=success))
    await db.commit()

    if not success:
        # Re-check after adding this failure — surface lockout immediately if this crosses threshold
        failures, earliest = await _recent_failures(db, email)
        if failures >= _max_attempts() and earliest:
            unlock_at = earliest + timedelta(minutes=_lockout_minutes())
            remaining = int((unlock_at - datetime.now(timezone.utc)).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=429,
                detail=f"Too many failed attempts. Try again in {max(1, remaining)} minute(s).",
            )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id, user.email, user.role.value)
    return TokenOut(
        access_token=token,
        user=UserOut(
            id=user.id, email=user.email, name=user.name, role=user.role.value,
            department=user.department, manager_id=user.manager_id,
            status=user.status, pending_manager_name=user.pending_manager_name,
            pending_manager_email=user.pending_manager_email,
            reliability_score=user.reliability_score, completed_count=user.completed_count,
            no_show_count=user.no_show_count, cancelled_count=user.cancelled_count,
        ),
    )


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return UserOut(
        id=user.id, email=user.email, name=user.name, role=user.role.value,
        department=user.department, manager_id=user.manager_id,
        status=user.status, pending_manager_name=user.pending_manager_name,
        pending_manager_email=user.pending_manager_email,
        reliability_score=user.reliability_score, completed_count=user.completed_count,
        no_show_count=user.no_show_count, cancelled_count=user.cancelled_count,
    )

@router.post("/send-verification-code")
async def send_verification_code(body: SendVerificationCodeIn, db: AsyncSession = Depends(get_db)):
    email = body.email.lower().strip()
    # Check if user already exists
    res = await db.execute(select(User).where(User.email == email))
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    code = ''.join(random.choices(string.digits, k=6))
    
    vc = VerificationCode(email=email, code=code)
    db.add(vc)
    await db.commit()
    
    html_content = f"Your verification code is: <strong>{code}</strong>"
    await send_email(to=email, subject="Spaceflow Registration Code", html=html_content, text=f"Your verification code is: {code}")
    
    # Print the code to the console for testing since RESEND_API_KEY is empty
    print(f"\n" + "="*50)
    print(f"🔑 VERIFICATION CODE FOR {email}: {code} 🔑")
    print("="*50 + "\n")
    
    return {"message": "Verification code sent successfully."}

@router.post("/register")
async def register(body: RegisterIn, db: AsyncSession = Depends(get_db)):
    email = body.email.lower().strip()
    
    # Verify code
    res = await db.execute(
        select(VerificationCode)
        .where(VerificationCode.email == email, VerificationCode.code == body.verification_code)
        .order_by(VerificationCode.created_at.desc())
    )
    vc = res.scalars().first()
    if not vc:
        raise HTTPException(status_code=400, detail="Invalid verification code")
        
    # Verify manager exists if employee
    role_enum = UserRole(body.role)
    if role_enum == UserRole.employee:
        if not body.pending_manager_email:
            raise HTTPException(status_code=400, detail="Manager email is required for employees")
        m_email = body.pending_manager_email.lower().strip()
        manager_res = await db.execute(select(User).where(User.email == m_email, User.role == UserRole.manager))
        manager = manager_res.scalar_one_or_none()
        if not manager:
            raise HTTPException(status_code=400, detail="No manager found with this email. Please verify details.")

    new_user = User(
        email=email,
        password_hash=hash_password(body.password),
        name=body.name,
        role=role_enum,
        status="pending",
        pending_manager_name=body.pending_manager_name,
        pending_manager_email=body.pending_manager_email.lower().strip() if body.pending_manager_email else None
    )
    db.add(new_user)
    
    # Notifications
    if role_enum == UserRole.manager:
        admins_res = await db.execute(select(User).where(User.role == UserRole.admin))
        for admin in admins_res.scalars().all():
            db.add(Notification(
                user_id=admin.id,
                type=NotificationType.approval_required,
                title="New Manager Registration",
                message=f"Manager {body.name} has registered and requires approval.",
                link="/admin"
            ))
    elif role_enum == UserRole.employee:
        m_email = body.pending_manager_email.lower().strip()
        manager_res = await db.execute(select(User).where(User.email == m_email))
        manager = manager_res.scalar_one_or_none()
        if manager:
            db.add(Notification(
                user_id=manager.id,
                type=NotificationType.approval_required,
                title="New Employee Registration",
                message=f"Employee {body.name} has registered and requires approval.",
                link="/manager/approvals"
            ))
            
    await db.commit()
    return {"message": "Registration successful. Pending approval."}
