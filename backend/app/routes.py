"""API route handlers for task management."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.models import TaskStatus
from app.schemas import (
    TaskCreate,
    TaskListResponse,
    TaskResponse,
    TaskUpdate,
    TaskUpdateStatus,
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Create a new task with a title, optional description, status, and due date.",
)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """Create a new caseworker task."""
    return crud.create_task(db, task_data)


@router.get(
    "",
    response_model=TaskListResponse,
    summary="Retrieve all tasks",
    description="Retrieve all tasks with optional status filtering and pagination.",
)
def get_all_tasks(
    status_filter: Optional[TaskStatus] = Query(
        None, alias="status", description="Filter by task status"
    ),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """Retrieve all tasks, optionally filtered by status."""
    tasks, total = crud.get_all_tasks(db, status=status_filter, skip=skip, limit=limit)
    return TaskListResponse(
        tasks=[TaskResponse.model_validate(t) for t in tasks],
        total=total,
    )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Retrieve a task by ID",
    description="Retrieve a single task by its unique identifier.",
)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Retrieve a task by ID."""
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )
    return task


@router.patch(
    "/{task_id}/status",
    response_model=TaskResponse,
    summary="Update a task's status",
    description="Update only the status field of an existing task.",
)
def update_task_status(
    task_id: int, status_data: TaskUpdateStatus, db: Session = Depends(get_db)
):
    """Update the status of an existing task."""
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )
    return crud.update_task_status(db, task, status_data)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
    description="Update any fields of an existing task.",
)
def update_task(
    task_id: int, task_data: TaskUpdate, db: Session = Depends(get_db)
):
    """Update an existing task."""
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )
    return crud.update_task(db, task, task_data)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
    description="Delete a task by its unique identifier.",
)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task."""
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )
    crud.delete_task(db, task)
