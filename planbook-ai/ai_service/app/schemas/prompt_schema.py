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


class PromptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: str
    content: str
    version: int
    is_active: bool

