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


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed initial data
    async with AsyncSessionLocal() as db:
        await seed_data(db)
    # Start scheduler
    app.state.scheduler = start_scheduler()
    logger.info("App ready.")
    yield
    try:
        app.state.scheduler.shutdown(wait=False)
    except Exception:
        pass
    await engine.dispose()


app = FastAPI(title="Smart Resource Booking", lifespan=lifespan)

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Smart Resource Booking API", "status": "ok"}


@api_router.get("/health")
async def health():
    return {"ok": True}


api_router.include_router(auth_router)
api_router.include_router(resources_router)
api_router.include_router(bookings_router)
api_router.include_router(notifications_router)
api_router.include_router(maintenance_router)
api_router.include_router(analytics_router)
api_router.include_router(calendar_router)
api_router.include_router(users_router)

app.include_router(api_router)

# Ensure uploads directory exists
UPLOAD_DIR = ROOT_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files for images
app.mount("/static", StaticFiles(directory=ROOT_DIR / "static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
