import os
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import hash_password, verify_password
from models import User, UserRole, Resource, ResourceType, ResourcePolicy


async def seed_data(db: AsyncSession):
    """Idempotent seed: create admin/manager/employee + demo resources."""
    # --- Users ---
    specs = [
        (os.environ.get("ADMIN_EMAIL", "admin@company.com"),
         os.environ.get("ADMIN_PASSWORD", "admin123"),
         "Alex Chen", UserRole.admin, "Operations"),
        (os.environ.get("MANAGER_EMAIL", "manager@company.com"),
         os.environ.get("MANAGER_PASSWORD", "manager123"),
         "Priya Sharma", UserRole.manager, "Engineering"),
        (os.environ.get("EMPLOYEE_EMAIL", "employee@company.com"),
         os.environ.get("EMPLOYEE_PASSWORD", "employee123"),
         "Jordan Lee", UserRole.employee, "Engineering"),
        ("employee2@company.com", "employee123", "Sam Rivera", UserRole.employee, "Design"),
        ("employee3@company.com", "employee123", "Taylor Kim", UserRole.employee, "Marketing"),
    ]

    manager_id = None
    user_map = {}
    for email, pwd, name, role, dept in specs:
        existing = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
        if existing is None:
            u = User(
                email=email, password_hash=hash_password(pwd), name=name,
                role=role, department=dept,
            )
            db.add(u)
            await db.flush()
            user_map[email] = u
        else:
            if not verify_password(pwd, existing.password_hash):
                existing.password_hash = hash_password(pwd)
            user_map[email] = existing

    await db.flush()

    # Assign manager
    manager = user_map.get(os.environ.get("MANAGER_EMAIL", "manager@company.com"))
    if manager:
        for email in ("employee@company.com", "employee2@company.com", "employee3@company.com"):
            u = user_map.get(email)
            if u and not u.manager_id:
                u.manager_id = manager.id

    # --- Resources ---
    resources = [
        {
            "name": "Aurora Conference Room",
            "type": ResourceType.room,
            "description": "Large boardroom with 4K display, whiteboard, and teleconferencing.",
            "floor": 3, "building": "HQ", "capacity": 12,
            "amenities": ["4K Display", "Whiteboard", "Teleconference", "Coffee"],
            "image_url": "https://images.unsplash.com/photo-1628017974725-18928e8e8211?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBvZmZpY2UlMjBtZWV0aW5nJTIwcm9vbXxlbnwwfHx8fDE3NzY4MzU3Mjd8MA&ixlib=rb-4.1.0&q=85",
            "availability_start": "08:00", "availability_end": "20:00",
            "x": 20, "y": 30, "requires_approval": True,
            "policy": {"max_duration_minutes": 240, "min_advance_minutes": 30,
                       "max_advance_days": 60, "allowed_departments": [],
                       "allowed_roles": []},
        },
        {
            "name": "Nova Meeting Pod",
            "type": ResourceType.room,
            "description": "Compact 4-person pod for quick syncs.",
            "floor": 2, "building": "HQ", "capacity": 4,
            "amenities": ["TV", "Whiteboard"],
            "image_url": "https://images.pexels.com/photos/5511124/pexels-photo-5511124.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "availability_start": "08:00", "availability_end": "20:00",
            "x": 50, "y": 25, "requires_approval": False,
            "policy": {"max_duration_minutes": 120, "min_advance_minutes": 0,
                       "max_advance_days": 14, "allowed_departments": [],
                       "allowed_roles": []},
        },
        {
            "name": "Hot Desk A-12",
            "type": ResourceType.desk,
            "description": "Window seat, dual monitor setup.",
            "floor": 2, "building": "HQ", "capacity": 1,
            "amenities": ["Dual Monitor", "Standing Desk"],
            "image_url": "",
            "availability_start": "07:00", "availability_end": "22:00",
            "x": 75, "y": 55, "requires_approval": False,
            "policy": {"max_duration_minutes": 600, "min_advance_minutes": 0,
                       "max_advance_days": 30, "allowed_departments": [],
                       "allowed_roles": []},
        },
        {
            "name": "Hot Desk B-04",
            "type": ResourceType.desk,
            "description": "Quiet zone corner desk.",
            "floor": 4, "building": "HQ", "capacity": 1,
            "amenities": ["Ergonomic Chair"],
            "image_url": "",
            "availability_start": "07:00", "availability_end": "22:00",
            "x": 30, "y": 70, "requires_approval": False,
            "policy": {"max_duration_minutes": 600, "min_advance_minutes": 0,
                       "max_advance_days": 30, "allowed_departments": [],
                       "allowed_roles": []},
        },
        {
            "name": "Garage Parking (Level B1)",
            "type": ResourceType.parking,
            "description": "Covered parking spots with EV charging.",
            "floor": -1, "building": "HQ", "capacity": 20,
            "amenities": ["EV Charging", "Covered"],
            "image_url": "",
            "availability_start": "00:00", "availability_end": "23:59",
            "x": 10, "y": 85, "requires_approval": False,
            "policy": {"max_duration_minutes": 720, "min_advance_minutes": 0,
                       "max_advance_days": 14, "allowed_departments": [],
                       "allowed_roles": []},
        },
        {
            "name": "Helix Video Studio",
            "type": ResourceType.equipment,
            "description": "Broadcast-ready studio with lighting, camera and mic.",
            "floor": 5, "building": "HQ", "capacity": 6,
            "amenities": ["Camera", "Lighting", "Mics", "Green Screen"],
            "image_url": "",
            "availability_start": "09:00", "availability_end": "19:00",
            "x": 65, "y": 20, "requires_approval": True,
            "policy": {"max_duration_minutes": 180, "min_advance_minutes": 60,
                       "max_advance_days": 30, "allowed_departments": [],
                       "allowed_roles": ["manager", "admin", "employee"]},
        },
    ]

    for spec in resources:
        existing = (await db.execute(select(Resource).where(Resource.name == spec["name"]))).scalar_one_or_none()
        if existing:
            continue
        policy_spec = spec.pop("policy", None)
        r = Resource(**spec)
        db.add(r)
        await db.flush()
        if policy_spec:
            p = ResourcePolicy(resource_id=r.id, **policy_spec)
            db.add(p)

    await db.commit()
