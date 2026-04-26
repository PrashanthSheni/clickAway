import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), "backend", ".env"))

from models import Base, User, Booking, Resource, ResourceType, BookingState, Notification
from services import gen_qr_token, gen_check_in_code

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+asyncpg://postgres:1234@localhost:5432/booking_db")

async def verify():
    engine = create_async_engine(DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        # 1. Setup: Find manager and employee
        manager = (await db.execute(select(User).where(User.email == "manager@company.com"))).scalar_one()
        employee = (await db.execute(select(User).where(User.email == "employee@company.com"))).scalar_one()
        resource = (await db.execute(select(Resource).where(Resource.name == "Aurora Conference Room"))).scalar_one()
        
        # 2. Create a booking for 5 mins from now
        start = datetime.now(timezone.utc) + timedelta(minutes=5)
        end = start + timedelta(hours=1)
        
        booking = Booking(
            user_id=employee.id,
            resource_id=resource.id,
            title="Verification Booking",
            start_time=start,
            end_time=end,
            state=BookingState.pending_approval
        )
        db.add(booking)
        await db.commit()
        await db.refresh(booking)
        print(f"Created booking {booking.id} in state {booking.state}")
        
        # 3. Simulate manager approval (revised flow)
        booking.state = BookingState.approved
        booking.qr_token = gen_qr_token()
        booking.check_in_code = "" # Ensure it's empty as per new flow
        booking.approved_by = manager.id
        await db.commit()
        print(f"Approved booking. check_in_code='{booking.check_in_code}'")
        
        # 4. Trigger code (simulated scan)
        # In the route, we check: if now < b.start_time - 10 mins: error
        # Our booking is in 5 mins, so it should work.
        if not booking.check_in_code:
            booking.check_in_code = "123456" # Simulate gen_check_in_code()
            print(f"Triggered code generation: {booking.check_in_code}")
            await db.commit()
            
        # 5. Check in with code
        if booking.check_in_code == "123456":
            booking.state = BookingState.checked_in
            booking.checked_in_at = datetime.now(timezone.utc)
            print("Checked in successfully.")
            
            # Verify manager notification logic (manual check of what would be in the route)
            if employee.manager_id:
                print(f"Notifying manager {manager.name} about {employee.name}'s check-in.")
                n = Notification(
                    user_id=manager.id,
                    type="check_in_warning",
                    title=f"Check-in: {employee.name}",
                    message=f"{employee.name} checked in to {resource.name}"
                )
                db.add(n)
                await db.commit()
                print("Notification created.")

        # Cleanup: delete the verification booking and notification
        await db.delete(booking)
        # find notification
        res = await db.execute(select(Notification).where(Notification.user_id == manager.id).order_by(Notification.created_at.desc()))
        notif = res.scalars().first()
        if notif and "Check-in: Jordan Lee" in notif.title:
            await db.delete(notif)
        await db.commit()
        print("Cleanup done.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify())
