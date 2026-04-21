import asyncio
import json
import re
from typing import Any, Dict

from sqlalchemy.orm import Session
from google import genai
from google.genai import types

from ai_service.app.core.config import settings
from ai_service.app.models.schemas import ExerciseRequest, LessonPlanRequest
from ai_service.app.services.prompt_service import get_active_prompt_by_name


_client = None
_PLACEHOLDER_PATTERN = re.compile(r"{([a-zA-Z_][a-zA-Z0-9_]*)}")


# =========================
# Gemini client
# =========================
def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


# =========================
# Extract JSON
# =========================
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

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid AI response: not valid JSON") from exc


def _normalize_correct_answer(correct_answer: Any, options: list[str]) -> str:
    if correct_answer is None:
        raise ValueError("Missing correct answer")

    raw = str(correct_answer).strip()
    if not raw:
        raise ValueError("Missing correct answer")

    # Accept A-D format (A, B., C), then map to option text.
    match = re.fullmatch(r"([A-Da-d])(?:[.)])?", raw)
    if match:
        return options[ord(match.group(1).upper()) - ord("A")]

    # Accept numeric index 1-4, then map to option text.
    if raw.isdigit() and 1 <= int(raw) <= 4:
        return options[int(raw) - 1]

    # Accept exact option text (case-insensitive compare, return canonical option).
    lowered = raw.casefold()
    for option in options:
        if option.casefold() == lowered:
            return option

    raise ValueError(
        "correctAnswer must be one of the 4 options or use A-D/1-4 format")


# =========================
# Build prompt from DB
# =========================
def _build_prompt(db: Session, name: str, variables: Dict[str, Any]) -> str:
    prompt_entity = get_active_prompt_by_name(db, name)

    missing_vars = set()

    # Replace only {variable_name} tokens and keep JSON braces untouched.
    def _replace(match: re.Match[str]) -> str:
        key = match.group(1)
        if key in variables:
            return str(variables[key])
        missing_vars.add(key)
        return match.group(0)

    rendered = _PLACEHOLDER_PATTERN.sub(_replace, prompt_entity.content)

    if missing_vars:
        missing_list = ", ".join(sorted(missing_vars))
        raise ValueError(f"Missing variable in prompt: {missing_list}")

    return rendered


# =========================
# Call Gemini
# =========================
async def _call_gemini(prompt: str) -> Dict[str, Any]:

    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    client = _get_client()

    response = await asyncio.to_thread(
        client.models.generate_content,
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        ),
    )

    return _extract_json_payload(response.text or "")


# =========================
# Generate Exercise
# =========================
async def generate_exercise(request: ExerciseRequest, db: Session):
    prompt = _build_prompt(
        db,
        "generate_exercise",
        {
            "topic": request.topic,
            "grade": request.grade,
            "number_of_questions": request.number_of_questions,
            "difficulty": request.difficulty,
        },
    )

    data = await _call_gemini(prompt)

    if isinstance(data, list):
        data = {"questions": data}

    questions = data.get("questions") if isinstance(data, dict) else None
    if not isinstance(questions, list):
        raise ValueError("Invalid AI response: missing 'questions'")

    normalized_questions = []
    for idx, q in enumerate(questions, start=1):
        if not isinstance(q, dict):
            raise ValueError("Invalid question format")

        question = q.get("question")
        raw_options = q.get("options")
        correct_answer = q.get("correctAnswer", q.get("answer"))

        if not question:
            raise ValueError("Invalid question format")
        if not isinstance(raw_options, list) or len(raw_options) != 4:
            raise ValueError("Each question must have 4 options")

        options = [str(opt).strip() for opt in raw_options]
        if any(not opt for opt in options):
            raise ValueError("Options cannot be empty")

        if len({opt.casefold() for opt in options}) != 4:
            raise ValueError("Options must be distinct")

        normalized_correct_answer = _normalize_correct_answer(
            correct_answer, options)

        normalized_questions.append(
            {
                "id": f"q{idx}",
                "question": str(question).strip(),
                "options": options,
                "correctAnswer": normalized_correct_answer,
                "explanation": str(q.get("explanation") or ""),
            }
        )

    return {"questions": normalized_questions}


# =========================
# Generate Lesson Plan
# =========================
async def generate_lesson_plan(request: LessonPlanRequest, db: Session):
    prompt = _build_prompt(
        db,
        "generate_lesson_plan",
        {
            "topic": request.topic,
            "grade": request.grade,
            "duration_minutes": request.duration_minutes,
        },
    )

    data = await _call_gemini(prompt)

    required_keys = {
        "title",
        "topic",
        "grade",
        "durationMinutes",
        "objectives",
        "activities",
        "assessment",
    }

    if not required_keys.issubset(data.keys()):
        raise ValueError("Invalid lesson plan structure")

    if not isinstance(data["activities"], list):
        raise ValueError("Activities must be list")

    for act in data["activities"]:
        if not isinstance(act.get("time"), int):
            raise ValueError("Activity time must be number")
