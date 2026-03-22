from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.schemas import (
    ExerciseRequest,
    ExerciseResponse,
    LessonPlanRequest,
    LessonPlanResponse,
    OcrGradeResponse,
)
from app.services.gemini_service import generate_exercise, generate_lesson_plan

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


@router.post(
    "/ocr-grade",
    response_model=OcrGradeResponse,
    summary="Temporary OCR grading contract endpoint",
    description="Endpoint tam thoi de giu contract truoc khi tach ocr-grading-service"
)
async def ocr_grade(
    image: UploadFile = File(...),
    answer_key: str = Form(...),
):
    _ = image
    _ = answer_key
    return {
        "totalQuestions": 0,
        "correctCount": 0,
        "wrongQuestionIds": [],
        "score": 0.0,
        "message": "OCR grading will be served by ocr-grading-service (port 8088).",
    }


