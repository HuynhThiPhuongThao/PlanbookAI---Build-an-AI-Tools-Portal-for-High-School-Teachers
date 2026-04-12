from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ai_service.app.dependencies import get_db
from ai_service.app.models.prompt_model import Prompt
from ai_service.app.schemas.prompt_schema import (
    PromptCreate,
    PromptResponse,
    PromptUpdate,
)

router = APIRouter(prefix="/api/ai/prompts", tags=["Prompts"])


# =========================
# CREATE
# =========================
@router.post("", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
def create_prompt(payload: PromptCreate, db: Session = Depends(get_db)):
    # nếu tạo prompt active → tắt các prompt cùng name
    if payload:
        db.query(Prompt).filter(
            Prompt.name == payload.name,
            Prompt.is_active == True
        ).update({"is_active": False})

    prompt = Prompt(
        name=payload.name,
        type=payload.type,
        content=payload.content,
        version=1,
        is_active=True,
        created_by="admin",  # tạm hardcode
    )

    db.add(prompt)
    db.commit()
    db.refresh(prompt)

    return prompt


# =========================
# GET ALL
# =========================
@router.get("", response_model=list[PromptResponse])
def get_all_prompts(db: Session = Depends(get_db)):
    return db.query(Prompt).order_by(Prompt.id.desc()).all()


# =========================
# GET ACTIVE BY NAME
# =========================
@router.get("/active/{name}", response_model=PromptResponse)
def get_active_prompt(name: str, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(
        Prompt.name == name,
        Prompt.is_active == True
    ).first()

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active prompt not found"
        )

    return prompt


# =========================
# UPDATE
# =========================
@router.put("/{prompt_id}", response_model=PromptResponse)
def update_prompt(prompt_id: int, payload: PromptUpdate, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found"
        )

    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided"
        )

    # update content → tăng version
    if "content" in update_data:
        prompt.content = update_data["content"]
        prompt.version += 1

    # update active → tắt các prompt khác cùng name
    if "is_active" in update_data and update_data["is_active"]:
        db.query(Prompt).filter(
            Prompt.name == prompt.name,
            Prompt.id != prompt.id
        ).update({"is_active": False})

        prompt.is_active = True

    db.commit()
    db.refresh(prompt)

    return prompt


# =========================
# DELETE
# =========================
@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found"
        )

    db.delete(prompt)
    db.commit()

    return None