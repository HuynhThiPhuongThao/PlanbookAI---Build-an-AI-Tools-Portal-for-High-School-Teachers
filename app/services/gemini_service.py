import asyncio
import json

from google import genai
from google.genai import types

from app.core.config import settings
from app.models.schemas import ExerciseRequest

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client

async def generate_exercise(request: ExerciseRequest):
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    client = _get_client()

    prompt = f"""
    You are a teacher.

    Create a {request.difficulty} exercise about {request.topic}.

    Return in JSON format:
    {{
      "question": "...",
      "answer": "..."
    }}
    """

    response = await asyncio.to_thread(
        client.models.generate_content,
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    response_text = (response.text or "").strip()
    if response_text.startswith("```"):
        response_text = response_text.strip("`")
        if response_text.lower().startswith("json"):
            response_text = response_text[4:].strip()

    data = json.loads(response_text)

    return data

