"""CRUD operations for tasks."""

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models import Task, TaskStatus
from app.schemas import TaskCreate, TaskUpdate, TaskUpdateStatus


def create_task(db: Session, task_data: TaskCreate) -> Task:
    """Create a new task."""
    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        due_date=task_data.due_date,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task(db: Session, task_id: int) -> Optional[Task]:
    """Retrieve a single task by ID."""
    return db.query(Task).filter(Task.id == task_id).first()


def get_all_tasks(
    db: Session,
    status: Optional[TaskStatus] = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple[list[Task], int]:
    """Retrieve all tasks with optional filtering and pagination."""
    query = db.query(Task)
    if status:
        query = query.filter(Task.status == status)
    total = query.count()
    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    return tasks, total


def update_task_status(db: Session, task: Task, status_data: TaskUpdateStatus) -> Task:
    """Update only the status of a task."""
    task.status = status_data.status
    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task: Task, task_data: TaskUpdate) -> Task:
    """Update any fields of a task."""
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    """Delete a task."""
    db.delete(task)
    db.commit()
