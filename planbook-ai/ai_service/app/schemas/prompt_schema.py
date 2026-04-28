from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

class PromptCreate(BaseModel):
    name: str
    type: str
    content: str


class PromptUpdate(BaseModel):
    content: str | None = None
    is_active: bool | None = None


class PromptReview(BaseModel):
    review_note: Optional[str] = None
    reviewed_by: Optional[str] = None


class PromptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: str
    content: str
    version: int
    is_active: bool
    approval_status: str = "APPROVED"
    review_note: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None

