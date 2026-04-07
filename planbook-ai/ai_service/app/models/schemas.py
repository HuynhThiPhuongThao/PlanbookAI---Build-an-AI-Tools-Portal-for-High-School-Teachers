from typing import List

from pydantic import BaseModel, Field


class ExerciseRequest(BaseModel):
    topic: str
    difficulty: str = Field(default="medium")
    number_of_questions: int = Field(default=5, alias="numberOfQuestions", ge=1, le=20)
    grade: str = Field(default="10")


class ExerciseItem(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: str = Field(alias="correctAnswer")
    explanation: str


class ExerciseResponse(BaseModel):
    questions: List[ExerciseItem]


class LessonPlanRequest(BaseModel):
    topic: str
    grade: str = Field(default="10")
    duration_minutes: int = Field(default=45, alias="durationMinutes", ge=15, le=180)


class LessonActivity(BaseModel):
    time: str
    activity: str


class LessonPlanResponse(BaseModel):
    title: str
    topic: str
    grade: str
    duration_minutes: int = Field(alias="durationMinutes")
    objectives: List[str]
    activities: List[LessonActivity]
    assessment: str


