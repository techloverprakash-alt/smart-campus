import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_embeddings import router as embeddings_router
from app.api.routes_engine import router as engine_router
from app.api.routes_items import router as items_router
from app.api.routes_matching import router as matching_router
from app.modules.lost_and_found.router import router as lost_and_found_router
from app.modules.auth.router import auth_router, profile_router
from app.modules.attendance.router import attendance_router, timetable_router
from app.modules.academic.seeder import seed_academic_csvs
from app.modules.auth.service import AuthService
from app.config import settings
from app.database import Base, SessionLocal, engine as db_engine
import app.modules.auth.models  # Register Tables 1-7 (users, roles, profiles, refresh_tokens)
import app.modules.academic.models  # Register Tables 8-15 (departments, batches, sections, locations)
import app.modules.attendance.models  # Register Tables 16-20 (subjects, offerings, timetable, attendance)
import app.modules.core.models  # Register core models
import app.modules.lost_and_found.models  # Register Tables 34-41 models
from app.modules.lost_and_found.models import ItemCategory
from app.modules.core.models import Location
from app.schemas import HealthResponse
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service

logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("smart_campus")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager:
    1. Initializes relational database tables (Tables 34-41: item_categories, lost_reports, found_reports,
       report_media, item_matches, match_verifications, item_claims, item_handovers).
    2. Seeds standard campus categories and zones if table is empty.
    3. Loads the MobileCLIP model once into memory on startup (CUDA/CPU).
    4. Connects to local Qdrant container and ensures the collection exists.
    5. Cleans up resources on shutdown.
    """
    logger.info("=== Starting Smart Campus Automated Matching Service ===")
    
    # 1. Initialize relational database tables
    try:
        Base.metadata.create_all(bind=db_engine)
        logger.info("Relational database tables (Lost & Found Tables 34-41) initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}", exc_info=True)

    # 2. Seed initial categories and campus locations if empty
    db = SessionLocal()
    try:
        if db.query(ItemCategory).count() == 0:
            categories = [
                ItemCategory(name="Electronics", description="Laptops, calculators, chargers, headphones, smartwatches"),
                ItemCategory(name="Accessories", description="Water bottles, umbrellas, glasses, keys, ID card holders"),
                ItemCategory(name="Wallets & Cards", description="Wallets, smart cards, hostel mess passes, driver licenses"),
                ItemCategory(name="Study Materials", description="Textbooks, lecture note binders, scientific drawing instruments"),
                ItemCategory(name="Clothing & Bags", description="Jackets, lab coats, backpacks, gym pouches"),
                ItemCategory(name="Sports & Fitness", description="Sports gear, gym gloves, fitness trackers"),
            ]
            db.add_all(categories)
            db.commit()
            logger.info("Seeded default Lost and Found item categories.")

        if db.query(Location).count() == 0:
            locations = [
                Location(name="Central Library", zone="Central Digital Library Complex", building="Library Quad"),
                Location(name="Main Canteen Quad 2", zone="Main Canteen / Food Court", building="Food Court"),
                Location(name="Academic Block B - 302", zone="Science Quad - Academic Block B", building="Block B"),
                Location(name="Sports Complex Gym", zone="Sports Complex & Gymnasium", building="Sports Complex"),
                Location(name="AI Lab-1", zone="Science Quad - Academic Block B", building="Block B"),
                Location(name="Administrative Complex", zone="Administrative Wing", building="Admin Block"),
            ]
            db.add_all(locations)
            db.commit()
            logger.info("Seeded default campus locations.")

        # Seed default auth data (Roles, 23 Users, Profiles, Refresh Tokens)
        try:
            auth_service = AuthService(db)
            auth_service.seed_default_data()
        except Exception as e:
            logger.warning(f"Auth seeder notice: {e}")

        # Seed academic & attendance CSV data (Tables 08 through 20)
        try:
            seed_academic_csvs(db)
        except Exception as e:
            logger.warning(f"Academic seeder notice: {e}")
    except Exception as e:
        logger.warning(f"Initial seed notice: {e}")
        db.rollback()
    finally:
        db.close()

    # 3. Initialize Embedding Service (Loads MobileCLIP once)
    try:
        embedding_service.initialize()
        logger.info(f"Embedding service initialized. Device: {embedding_service.device}, Dimension: {embedding_service.embedding_dim}")
    except Exception as e:
        logger.error(f"Failed to initialize embedding service: {e}", exc_info=True)

    # 4. Initialize Qdrant Collection
    try:
        qdrant_service.ensure_collection(
            collection_name=settings.qdrant_collection_name,
            vector_dim=embedding_service.embedding_dim
        )
        logger.info(f"Qdrant collection '{settings.qdrant_collection_name}' ready on {settings.qdrant_host}")
    except Exception as e:
        logger.error(f"Failed to initialize Qdrant collection: {e}", exc_info=True)

    yield

    logger.info("=== Shutting down Smart Campus Service ===")
    if qdrant_service.client is not None:
        try:
            qdrant_service.client.close()
        except Exception:
            pass


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Automated Lost-and-Found Matching Engine using MobileCLIP, Qdrant, "
        "and multi-signal ranking with complete lifecycle custody tracking."
    ),
    lifespan=lifespan
)

# CORS Configuration - permits frontend at localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
# Mount auth and profile routers under both /api/v1 and /api for seamless frontend client compatibility
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication (v1)"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile_router, prefix="/api/v1/profiles", tags=["Profiles & Management (v1)"])
app.include_router(profile_router, prefix="/api/profiles", tags=["Profiles & Management"])
app.include_router(lost_and_found_router, prefix="/api/v1/lost-found", tags=["Lost & Found (v1 Frontend)"])
app.include_router(lost_and_found_router, prefix="/api/lost-found", tags=["Lost & Found System"])
app.include_router(attendance_router, prefix="/api/v1/attendance", tags=["Attendance Management (v1)"])
app.include_router(attendance_router, prefix="/api/attendance", tags=["Attendance Management"])
app.include_router(timetable_router, prefix="/api/v1/timetable", tags=["Timetable Management (v1)"])
app.include_router(timetable_router, prefix="/api/timetable", tags=["Timetable Management"])
app.include_router(engine_router)
app.include_router(embeddings_router)
app.include_router(matching_router)
app.include_router(items_router)


from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

STATIC_DIR = Path(__file__).resolve().parent / "static"
IMAGES_DIR = Path(__file__).resolve().parent.parent / "image"
DEMO_HTML = STATIC_DIR / "demo.html"

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

if IMAGES_DIR.exists():
    app.mount("/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")

@app.get("/demo", tags=["General"])
async def demo_ui():
    """Serves the interactive Image-to-Image similarity comparison web interface."""
    return FileResponse(DEMO_HTML)


@app.get("/", tags=["General"])
async def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "model": settings.model_name,
        "documentation": "/docs",
        "demo_ui": "/demo",
        "health": "/api/health"
    }


@app.get("/api/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """
    Reports system health, model status, Qdrant connectivity, and collection vector counts.
    """
    qdrant_connected = False
    total_vectors = 0
    try:
        if qdrant_service.client is not None:
            total_vectors = qdrant_service.get_collection_count()
            qdrant_connected = True
    except Exception:
        qdrant_connected = False

    return HealthResponse(
        status="healthy" if (embedding_service.is_loaded and qdrant_connected) else "degraded",
        app_name=settings.app_name,
        model_name=settings.model_name,
        embedding_dimension=embedding_service.embedding_dim,
        device=embedding_service.device,
        model_loaded=embedding_service.is_loaded,
        qdrant_connected=qdrant_connected,
        collection_name=settings.qdrant_collection_name,
        total_vectors_in_collection=total_vectors
    )
