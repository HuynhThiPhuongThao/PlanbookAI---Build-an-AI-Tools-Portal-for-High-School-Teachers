from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from ai_service.app.models.prompt_model import Prompt


def get_active_prompt_by_name(db: Session, name: str) -> Prompt:
    prompt = db.query(Prompt).filter(
        Prompt.name == name,
        Prompt.is_active == True
    ).first()

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active prompt not found for name: {name}"
        )

    return prompt





