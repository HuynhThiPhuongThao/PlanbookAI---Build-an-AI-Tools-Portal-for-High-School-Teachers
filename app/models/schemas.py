from pydantic import BaseModel, Field

class ExerciseRequest(BaseModel):
    topic: str = Field(..., example="Quadratic equations")
    difficulty: str = Field(..., example="easy")

class ExerciseResponse(BaseModel):
    question: str
    answer: str