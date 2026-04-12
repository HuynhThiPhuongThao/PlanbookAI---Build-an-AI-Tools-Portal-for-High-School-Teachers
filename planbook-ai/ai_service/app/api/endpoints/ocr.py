from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ai_service.app.dependencies import get_db
from ai_service.app.models.schemas import OcrGradeResponse
from ai_service.app.services.ocr_service import (
    extract_answers_from_image,
    grade_submission,
    parse_answers,
)


router = APIRouter(prefix="/api/ai", tags=["OCR"])


@router.post(
    "/ocr-grade",
    response_model=OcrGradeResponse,
    summary="Grade a submission image against answer key",
)
async def ocr_grade(
    image: UploadFile = File(...),
    answer_key: str = Form(...),
    detected_answers: str = Form(default=""),
    db: Session = Depends(get_db),
):
    try:
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(
                status_code=400, detail="Uploaded image is empty")

        expected_answers = parse_answers(answer_key)
        mime_type = image.content_type or "image/jpeg"

        # Main flow: detect answers from image via Gemini Vision.
        # detected_answers is kept for backward compatibility and ignored in this flow.
        _ = detected_answers
        detected_from_image = await extract_answers_from_image(
            db=db,
            image_bytes=image_bytes,
            image_mime_type=mime_type,
            expected_count=len(expected_answers),
        )

        result = grade_submission(expected_answers, detected_from_image)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
