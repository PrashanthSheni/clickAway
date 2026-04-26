from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env", override=True)

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from database import engine, Base, AsyncSessionLocal
import models  # noqa: F401 — register models
from seed import seed_data
from scheduler import start_scheduler

from routers.auth_routes import router as auth_router
from routers.resources_routes import router as resources_router
from routers.bookings_routes import router as bookings_router
from routers.notifications_routes import router as notifications_router
from routers.maintenance_routes import router as maintenance_router
from routers.analytics_routes import router as analytics_router
from routers.calendar_routes import router as calendar_router
from routers.users_routes import router as users_router
from routers.feedback_routes import router as feedback_router


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("app")


# BYPASS SETTINGS (Set to False to use real database/auth)
BYPASS_DATABASE = True

@asynccontextmanager
async def lifespan(app: FastAPI):
    if not BYPASS_DATABASE:
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        # Seed initial data
        async with AsyncSessionLocal() as db:
            await seed_data(db)
        # Start scheduler
        app.state.scheduler = start_scheduler()
        logger.info("App ready.")
    else:
        logger.info("BYPASS MODE: Database and Scheduler skipped.")
    yield
    if not BYPASS_DATABASE:
        try:
            app.state.scheduler.shutdown(wait=False)
        except Exception:
            pass
    await engine.dispose()


app = FastAPI(title="Smart Resource Booking (Bypass Mode)", lifespan=lifespan)

# CORS configuration — Must be before routers
origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

if BYPASS_DATABASE:
    @api_router.post("/auth/login")
    async def mock_login():
        return {
            "access_token": "mock_token",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "email": "admin@example.com",
                "name": "Mock Admin",
                "is_admin": True,
                "role": "admin"
            }
        }

    @api_router.post("/auth/register")
    async def mock_register():
        return {"message": "User created (Mock)"}

    @api_router.get("/auth/me")
    async def mock_me():
        return {
            "id": 1,
            "email": "admin@example.com",
            "name": "Mock Admin",
            "is_admin": True,
            "role": "admin"
        }

    @api_router.get("/resources")
    async def mock_resources():
        return [
            {"id": 1, "name": "Conference Room A", "type": "room", "capacity": 10},
            {"id": 2, "name": "Projector B", "type": "equipment", "capacity": 1}
        ]

    @api_router.get("/bookings")
    async def mock_bookings():
        return []

    @api_router.get("/analytics/overview")
    async def mock_analytics():
        return {"total_bookings": 10, "active_resources": 5}
    
    # Add other mock routes as needed...
else:
    api_router.include_router(auth_router)
    api_router.include_router(resources_router)
    api_router.include_router(bookings_router)
    api_router.include_router(notifications_router)
    api_router.include_router(maintenance_router)
    api_router.include_router(analytics_router)
    api_router.include_router(calendar_router)
    api_router.include_router(users_router)
    api_router.include_router(feedback_router)

app.include_router(api_router)

# Ensure uploads directory exists
UPLOAD_DIR = ROOT_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files for images
app.mount("/static", StaticFiles(directory=ROOT_DIR / "static"), name="static")
