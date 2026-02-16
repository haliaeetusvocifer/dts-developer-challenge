"""Tests for Pydantic schema validation — TDD style."""

import pytest
from datetime import datetime, timezone
from pydantic import ValidationError

from app.schemas import TaskCreate, TaskUpdateStatus, TaskUpdate


class TestTaskCreateSchema:
    """Validation tests for TaskCreate."""

    def test_valid_task_create(self):
        task = TaskCreate(
            title="Valid task",
            due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
        )
        assert task.title == "Valid task"
        assert task.status.value == "todo"  # default
        assert task.description is None

    def test_title_required(self):
        with pytest.raises(ValidationError):
            TaskCreate(due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc))

    def test_title_min_length(self):
        with pytest.raises(ValidationError):
            TaskCreate(
                title="",
                due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
            )

    def test_title_max_length(self):
        with pytest.raises(ValidationError):
            TaskCreate(
                title="A" * 256,
                due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
            )

    def test_due_date_required(self):
        with pytest.raises(ValidationError):
            TaskCreate(title="Missing due date")

    def test_invalid_status(self):
        with pytest.raises(ValidationError):
            TaskCreate(
                title="Bad status",
                status="not_a_status",
                due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
            )

    def test_description_max_length(self):
        with pytest.raises(ValidationError):
            TaskCreate(
                title="Long desc",
                description="A" * 2001,
                due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
            )

    def test_due_date_in_past_rejected(self):
        with pytest.raises(ValidationError, match="Due date cannot be in the past"):
            TaskCreate(
                title="Past task",
                due_date=datetime(2020, 1, 1, 10, 0, tzinfo=timezone.utc),
            )

    def test_due_date_in_future_accepted(self):
        task = TaskCreate(
            title="Future task",
            due_date=datetime(2030, 6, 1, 10, 0, tzinfo=timezone.utc),
        )
        assert task.title == "Future task"


class TestTaskUpdateStatusSchema:
    """Validation tests for TaskUpdateStatus."""

    def test_valid_update_status(self):
        update = TaskUpdateStatus(status="completed")
        assert update.status.value == "completed"

    def test_invalid_status(self):
        with pytest.raises(ValidationError):
            TaskUpdateStatus(status="invalid")

    def test_status_required(self):
        with pytest.raises(ValidationError):
            TaskUpdateStatus()


class TestTaskUpdateSchema:
    """Validation tests for TaskUpdate."""

    def test_partial_update_title_only(self):
        update = TaskUpdate(title="New title")
        assert update.title == "New title"
        assert update.description is None
        assert update.status is None

    def test_empty_title_rejected(self):
        with pytest.raises(ValidationError):
            TaskUpdate(title="")

    def test_due_date_in_past_rejected(self):
        with pytest.raises(ValidationError, match="Due date cannot be in the past"):
            TaskUpdate(
                due_date=datetime(2020, 1, 1, 10, 0, tzinfo=timezone.utc),
            )

    def test_due_date_in_future_accepted(self):
        update = TaskUpdate(
            due_date=datetime(2030, 6, 1, 10, 0, tzinfo=timezone.utc),
        )
        assert update.due_date is not None
