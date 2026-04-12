from datetime import datetime
from sqlalchemy import String, Text, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from ai_service.app.database import Base


class Prompt(Base):
    __tablename__ = "prompts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # logical name: generate_exercise, generate_lesson_plan
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    # type: exercise / lesson_plan
    type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # prompt template
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # version control
    version: Mapped[int] = mapped_column(Integer, default=1)

    # chỉ 1 prompt active cho mỗi name
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # audit
    created_by: Mapped[str] = mapped_column(String(100), nullable=True)
    updated_by: Mapped[str] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )