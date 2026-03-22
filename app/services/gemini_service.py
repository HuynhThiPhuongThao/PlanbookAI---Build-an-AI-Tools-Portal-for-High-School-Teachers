import asyncio
import json
from typing import Any, Dict

from google import genai
from google.genai import types

from app.core.config import settings
from app.models.schemas import ExerciseRequest, LessonPlanRequest

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _extract_json_payload(text: str) -> Dict[str, Any]:
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

async def generate_exercise(request: ExerciseRequest):
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    client = _get_client()

    prompt = f"""
    You are a teacher assistant.
    Generate {request.number_of_questions} multiple-choice questions for grade {request.grade}
    about topic: {request.topic}. Difficulty: {request.difficulty}.

    Return ONLY valid JSON with this exact structure:
    {{
      "questions": [
        {{
          "id": "q1",
          "question": "...",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "correctAnswer": "A",
          "explanation": "..."
        }}
      ]
    }}
    """

    response = await asyncio.to_thread(
        client.models.generate_content,
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    data = _extract_json_payload(response.text or "")

    if "questions" not in data or not isinstance(data["questions"], list):
        raise ValueError("Gemini response missing 'questions' list")

    return data


async def generate_lesson_plan(request: LessonPlanRequest):
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    client = _get_client()

    prompt = f"""
    You are an experienced teacher.
    Build a concise lesson plan for grade {request.grade}, topic: {request.topic},
    duration: {request.duration_minutes} minutes.

    Return ONLY valid JSON with this exact structure:
    {{
      "title": "...",
      "topic": "...",
      "grade": "...",
      "durationMinutes": {request.duration_minutes},
      "objectives": ["...", "..."],
      "activities": [
        {{"time": "10 phút", "activity": "..."}}
      ],
      "assessment": "..."
    }}
    """

    response = await asyncio.to_thread(
        client.models.generate_content,
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    data = _extract_json_payload(response.text or "")

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
        raise ValueError("Gemini response missing lesson-plan fields")

    return data

