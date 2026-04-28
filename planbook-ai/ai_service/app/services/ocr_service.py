import asyncio
import json
import re
from typing import Any, List

from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from sqlalchemy.orm import Session

from ai_service.app.core.config import settings
from ai_service.app.services.prompt_service import get_active_prompt_by_name


_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _extract_json_payload(text: str) -> Any:
    cleaned = (text or "").strip()

    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()

    return json.loads(cleaned)


def _get_ocr_prompt_template(db: Session) -> str:
    try:
        prompt = get_active_prompt_by_name(db, "ocr_extract_answers")
        return prompt.content
    except Exception:
        # Fallback prompt so OCR endpoint still works before prompt seed is created.
        return (
            "You are an OCR grading assistant. Read the uploaded answer-sheet image and extract only "
            "multiple-choice answers in order. Return strict JSON with this format: "
            "{\"detectedAnswers\": [\"A\", \"B\", \"C\"]}. "
            "Use only A, B, C, D values."
        )


def _normalize_detected_answer(value: str) -> str:
    raw = (value or "").strip().upper()
    if not raw:
        return ""

    if raw in {"A", "B", "C", "D"}:
        return raw

    if raw in {"1", "2", "3", "4"}:
        return chr(ord("A") + int(raw) - 1)

    match = re.match(r"^([ABCD])(?:[.)])?$", raw)
    if match:
        return match.group(1)

    return ""


async def extract_answers_from_image(
    db: Session,
    image_bytes: bytes,
    image_mime_type: str,
    expected_count: int,
) -> List[str]:
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    prompt_template = _get_ocr_prompt_template(db)
    prompt = f"{prompt_template}\nExpected answer count: {expected_count}."

    client = _get_client()
    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=settings.gemini_ocr_model,
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=image_mime_type),
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"),
        )
    except genai_errors.APIError as exc:
        raise RuntimeError(
            f"Gemini OCR model '{settings.gemini_ocr_model}' failed: {exc}"
        ) from exc

    payload = _extract_json_payload(response.text or "")
    if not isinstance(payload, dict):
        raise ValueError("Invalid OCR response: payload must be JSON object")

    raw_answers = payload.get("detectedAnswers", payload.get("answers", []))
    if not isinstance(raw_answers, list):
        raise ValueError(
            "Invalid OCR response: detectedAnswers must be a list")

    normalized = [_normalize_detected_answer(
        str(item)) for item in raw_answers]
    normalized = [item for item in normalized if item]

    if len(normalized) > expected_count:
        normalized = normalized[:expected_count]

    return normalized


def parse_answers(raw_answers: str) -> List[str]:
    data = (raw_answers or "").strip()
    if not data:
        raise ValueError("answer_key is required")

    if data.startswith("["):
        parsed = json.loads(data)
        if not isinstance(parsed, list):
            raise ValueError("answer_key JSON must be a list")
        answers = [str(item).strip().upper() for item in parsed]
    else:
        answers = [item.strip().upper()
                   for item in data.split(",") if item.strip()]

    if not answers:
        raise ValueError("answer_key must include at least one answer")

    return answers


def grade_submission(answer_key: List[str], detected_answers: List[str]):
    normalized_detected = [item.strip().upper() for item in detected_answers]
    total = len(answer_key)

    # Missing answers are treated as wrong.
    if len(normalized_detected) < total:
        normalized_detected.extend([""] * (total - len(normalized_detected)))

    wrong_question_ids = [
        idx + 1
        for idx, expected in enumerate(answer_key)
        if expected != normalized_detected[idx]
    ]
    correct_count = total - len(wrong_question_ids)
    score = round((correct_count / total) * 10, 2) if total else 0.0

    return {
        "totalQuestions": total,
        "correctCount": correct_count,
        "wrongQuestionIds": wrong_question_ids,
        "score": score,
        "message": "Grading completed",
    }
