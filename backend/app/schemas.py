"""Pydantic schemas for request/response validation."""

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models import TaskStatus


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str = Field(
        ..., min_length=1, max_length=255, description="Title of the task"
    )
    description: Optional[str] = Field(
        None, max_length=2000, description="Optional description of the task"
    )
    status: TaskStatus = Field(
        default=TaskStatus.TODO, description="Current status of the task"
    )
    due_date: datetime = Field(..., description="Due date and time for the task")

    @field_validator("due_date")
    @classmethod
    def due_date_must_not_be_in_past(cls, v: datetime) -> datetime:
        now = datetime.now(timezone.utc)
        # Make naive datetimes UTC-aware for comparison
        check = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
        if check < now:
            raise ValueError("Due date cannot be in the past")
        return v


class TaskUpdateStatus(BaseModel):
    """Schema for updating only the status of a task."""

    status: TaskStatus = Field(..., description="New status for the task")


class TaskUpdate(BaseModel):
    """Schema for updating any fields of a task."""

    title: Optional[str] = Field(
        None, min_length=1, max_length=255, description="Updated title"
    )
    description: Optional[str] = Field(
        None, max_length=2000, description="Updated description"
    )
    status: Optional[TaskStatus] = Field(None, description="Updated status")
    due_date: Optional[datetime] = Field(None, description="Updated due date")

    @field_validator("due_date")
    @classmethod
    def due_date_must_not_be_in_past(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is None:
            return v
        now = datetime.now(timezone.utc)
        check = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
        if check < now:
            raise ValueError("Due date cannot be in the past")
        return v


class TaskResponse(BaseModel):
    """Schema for task response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    due_date: datetime
    created_at: datetime
    updated_at: datetime


class TaskListResponse(BaseModel):
    """Schema for a list of tasks response."""

    tasks: list[TaskResponse]
    total: int
