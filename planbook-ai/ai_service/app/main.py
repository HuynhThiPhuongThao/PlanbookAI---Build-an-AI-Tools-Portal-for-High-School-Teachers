from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_service.app.api.endpoints import ai
from ai_service.app.core.config import settings
from ai_service.app.database import Base, engine
from ai_service.app.models.prompt_model import Prompt
from ai_service.app.routes import prompt_routes

app = FastAPI(
    title=settings.app_name,
    description="API sinh nội dung AI cho PlanbookAI",
    version=settings.version,
    docs_url="/docs",        # Swagger UI
    redoc_url="/redoc",      # ReDoc
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
app.include_router(prompt_routes.router)


@app.on_event("startup")
def create_database_tables() -> None:
    # Equivalent to: Base.metadata.create_all(bind=engine)
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "AI Service is running"}