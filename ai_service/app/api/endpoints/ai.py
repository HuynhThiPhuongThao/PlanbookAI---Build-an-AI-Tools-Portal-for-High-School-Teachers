from fastapi import APIRouter, HTTPException

from ai_service.app.models.schemas import (
    ExerciseRequest,
    ExerciseResponse,
    LessonPlanRequest,
    LessonPlanResponse,
)
from ai_service.app.services.gemini_service import generate_exercise, generate_lesson_plan

router = APIRouter(prefix="/api/ai", tags=["AI"])

@router.post(
    "/generate-exercise",
    response_model=ExerciseResponse,
    summary="Generate exercise using Gemini AI",
    description="Sinh bài tập dựa trên chủ đề và độ khó"
)
async def generate(request: ExerciseRequest):
    try:
        result = await generate_exercise(request)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post(
    "/generate-lesson-plan",
    response_model=LessonPlanResponse,
    summary="Generate lesson plan using Gemini AI",
    description="Sinh dàn ý giáo án theo chủ đề và khối lớp"
)
async def generate_lesson_plan_api(request: LessonPlanRequest):
    try:
        result = await generate_lesson_plan(request)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")
