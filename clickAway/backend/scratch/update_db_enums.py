import asyncio
import os
from sqlalchemy import text
from dotenv import load_dotenv

# Load .env first
load_dotenv()

from database import engine

async def update_enums():
    async with engine.begin() as conn:
        print("Adding release_pending to bookingstate...")
        try:
            # We use ALTER TYPE and check for existence
            # Note: IF NOT EXISTS for ADD VALUE is only supported in PG 12+
            # If it fails with syntax error, we just catch the exception
            await conn.execute(text("ALTER TYPE bookingstate ADD VALUE 'release_pending'"))
            print("Successfully added release_pending")
        except Exception as e:
            print(f"Skipping or failed release_pending: {e}")

        print("Adding release_requested to notificationtype...")
        try:
            await conn.execute(text("ALTER TYPE notificationtype ADD VALUE 'release_requested'"))
            print("Successfully added release_requested")
        except Exception as e:
            print(f"Skipping or failed release_requested: {e}")

if __name__ == "__main__":
    asyncio.run(update_enums())
