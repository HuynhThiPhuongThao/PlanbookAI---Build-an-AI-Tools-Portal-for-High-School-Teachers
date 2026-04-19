import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from ai_service.app.api.endpoints import ai
from ai_service.app.api.endpoints import ocr
from ai_service.app.core.config import settings
from ai_service.app.core.logging_config import configure_logging
from ai_service.app.database import engine
from ai_service.app.routes import prompt_routes


configure_logging(settings.log_level)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    description="AI Service for PlanbookAI",
    version=settings.version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Versioning
app.include_router(ai.router, prefix="/v1")
app.include_router(ocr.router, prefix="/v1")
app.include_router(prompt_routes.router)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000

    response.headers["x-request-id"] = request_id
    logger.info(
        "request_id=%s method=%s path=%s status=%s duration_ms=%.2f",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.get("/")
def root():
    return {"message": "AI Service is running"}


@app.get("/health/live")
def liveness_probe():
    return {"status": "alive", "service": settings.app_name}


@app.get("/health/ready")
def readiness_probe():
    db_ok = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception as exc:
        logger.exception("Readiness DB check failed: %s", exc)

    ready = db_ok and bool(settings.gemini_api_key)
    status_text = "ready" if ready else "not_ready"

    payload = {
        "status": status_text,
        "service": settings.app_name,
        "checks": {
            "database": db_ok,
            "gemini_api_key_configured": bool(settings.gemini_api_key),
        },
    }

    if ready:
        return payload

    return JSONResponse(status_code=503, content=payload)
