from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_service.app.api.endpoints import ai
from ai_service.app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    description="API sinh nội dung AI cho PlanbookAI",
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

@app.get("/")
def root():
    return {"message": "AI Service is running"}