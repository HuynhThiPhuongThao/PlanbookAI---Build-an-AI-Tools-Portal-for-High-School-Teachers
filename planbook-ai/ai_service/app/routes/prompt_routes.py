from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ai_service.app.dependencies import get_db
from ai_service.app.models.prompt_model import Prompt
from ai_service.app.schemas.prompt_schema import (
    PromptCreate,
    PromptResponse,
    PromptReview,
    PromptUpdate,
)
from ai_service.app.services.firebase_notification_service import (
    notify_managers_prompt_submitted,
    notify_staff_prompt_reviewed,
)

router = APIRouter(prefix="/api/ai/prompts", tags=["Prompts"])

PENDING_REVIEW = "PENDING_REVIEW"
APPROVED = "APPROVED"
REJECTED = "REJECTED"


@router.post("", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
def create_prompt(payload: PromptCreate, request: Request, db: Session = Depends(get_db)):
    staff_id = request.headers.get("X-User-Id") or "staff"
    prompt = Prompt(
        name=payload.name,
        type=payload.type,
        content=payload.content,
        version=_next_version(db, payload.name),
        is_active=False,
        approval_status=PENDING_REVIEW,
        created_by=str(staff_id),
    )

    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    notify_managers_prompt_submitted(prompt.id, prompt.name)
    return prompt


@router.get("", response_model=list[PromptResponse])
def get_all_prompts(db: Session = Depends(get_db)):
    return db.query(Prompt).order_by(Prompt.id.desc()).all()


@router.get("/pending", response_model=list[PromptResponse])
def get_pending_prompts(db: Session = Depends(get_db)):
    return db.query(Prompt).filter(
        Prompt.approval_status == PENDING_REVIEW
    ).order_by(Prompt.id.desc()).all()


@router.get("/active/{name}", response_model=PromptResponse)
def get_active_prompt(name: str, db: Session = Depends(get_db)):
    prompt = db.query(Prompt).filter(
        Prompt.name == name,
        Prompt.is_active == True,
        Prompt.approval_status == APPROVED,
    ).first()

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active prompt not found",
        )

    return prompt


@router.put("/{prompt_id}", response_model=PromptResponse)
def update_prompt(prompt_id: int, payload: PromptUpdate, request: Request, db: Session = Depends(get_db)):
    prompt = _get_prompt_or_404(db, prompt_id)
    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided",
        )

    if "content" in update_data:
        staff_id = request.headers.get("X-User-Id") or prompt.created_by
        new_prompt = Prompt(
            name=prompt.name,
            type=prompt.type,
            content=update_data["content"],
            version=_next_version(db, prompt.name),
            is_active=False,
            approval_status=PENDING_REVIEW,
            created_by=str(staff_id),
            updated_by=str(staff_id),
        )
        db.add(new_prompt)
        db.commit()
        db.refresh(new_prompt)
        notify_managers_prompt_submitted(new_prompt.id, new_prompt.name)
        return new_prompt

    if "is_active" in update_data and update_data["is_active"]:
        if prompt.approval_status != APPROVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only approved prompts can be activated",
            )

        db.query(Prompt).filter(
            Prompt.name == prompt.name,
            Prompt.id != prompt.id,
        ).update({"is_active": False})
        prompt.is_active = True

    db.commit()
    db.refresh(prompt)
    notify_staff_prompt_reviewed(prompt.created_by, prompt.id, prompt.name, True, prompt.review_note or "")
    return prompt


@router.put("/{prompt_id}/approve", response_model=PromptResponse)
def approve_prompt(prompt_id: int, payload: PromptReview | None = None, db: Session = Depends(get_db)):
    prompt = _get_prompt_or_404(db, prompt_id)

    db.query(Prompt).filter(
        Prompt.name == prompt.name,
        Prompt.id != prompt.id,
    ).update({"is_active": False})

    prompt.approval_status = APPROVED
    prompt.is_active = True
    prompt.review_note = payload.review_note if payload else None
    prompt.reviewed_by = payload.reviewed_by if payload else "manager"
    prompt.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(prompt)
    notify_staff_prompt_reviewed(prompt.created_by, prompt.id, prompt.name, False, prompt.review_note or "")
    return prompt


@router.put("/{prompt_id}/reject", response_model=PromptResponse)
def reject_prompt(prompt_id: int, payload: PromptReview | None = None, db: Session = Depends(get_db)):
    prompt = _get_prompt_or_404(db, prompt_id)

    prompt.approval_status = REJECTED
    prompt.is_active = False
    prompt.review_note = payload.review_note if payload else None
    prompt.reviewed_by = payload.reviewed_by if payload else "manager"
    prompt.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(prompt)
    return prompt


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = _get_prompt_or_404(db, prompt_id)

    db.delete(prompt)
    db.commit()
    return None


def _get_prompt_or_404(db: Session, prompt_id: int) -> Prompt:
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()

    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )

    return prompt


def _next_version(db: Session, name: str) -> int:
    latest = db.query(Prompt).filter(Prompt.name == name).order_by(Prompt.version.desc()).first()
    return (latest.version + 1) if latest else 1
