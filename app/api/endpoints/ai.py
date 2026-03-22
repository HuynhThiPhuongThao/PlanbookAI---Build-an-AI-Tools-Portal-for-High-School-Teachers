from fastapi import APIRouter, HTTPException
from app.models.schemas import ExerciseRequest, ExerciseResponse
from app.services.gemini_service import generate_exercise

router = APIRouter(prefix="/api/ai", tags=["AI"])

@router.post(
    "/generate-exercise",
    response_model=ExerciseResponse,
    summary="Generate exercise using Gemini AI",
    description="Sinh bài tập dựa trên topic và độ khó"
)
async def generate(request: ExerciseRequest):
    try:
        result = await generate_exercise(request)
        return result
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")


