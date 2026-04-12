from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ai_service.app.models.schemas import (
    ExerciseRequest,
    ExerciseResponse,
    LessonPlanRequest,
    LessonPlanResponse,
)
from ai_service.app.services import gemini_service
from ai_service.app.dependencies import get_db


router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post(
    "/generate-exercise",
    response_model=ExerciseResponse,
    summary="Generate exercise using Gemini AI",
)
async def generate_exercise_api(
    request: ExerciseRequest,
    db: Session = Depends(get_db),
):
    try:
        return await gemini_service.generate_exercise(request, db)
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
)
async def generate_lesson_plan_api(
    request: LessonPlanRequest,
    db: Session = Depends(get_db),
):
    try:
        return await gemini_service.generate_lesson_plan(request, db)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception:
        raise HTTPException(status_code=500, detail="Internal Server Error")