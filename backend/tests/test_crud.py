"""Unit tests for task CRUD operations — TDD style."""

from datetime import datetime, timezone

from app import crud
from app.models import Task, TaskStatus
from app.schemas import TaskCreate, TaskUpdate, TaskUpdateStatus


class TestCreateTask:
    """Tests for creating a task."""

    def test_create_task_with_all_fields(self, db_session):
        task_data = TaskCreate(
            title="Prepare hearing bundle",
            description="Compile all documents for the hearing.",
            status=TaskStatus.TODO,
            due_date=datetime(2030, 3, 15, 9, 0, tzinfo=timezone.utc),
        )
        task = crud.create_task(db_session, task_data)

        assert task.id is not None
        assert task.title == "Prepare hearing bundle"
        assert task.description == "Compile all documents for the hearing."
        assert task.status == TaskStatus.TODO
        assert task.created_at is not None

    def test_create_task_without_description(self, db_session):
        task_data = TaskCreate(
            title="Send notification",
            due_date=datetime(2030, 4, 1, 14, 0, tzinfo=timezone.utc),
        )
        task = crud.create_task(db_session, task_data)

        assert task.id is not None
        assert task.description is None
        assert task.status == TaskStatus.TODO

    def test_create_task_with_in_progress_status(self, db_session):
        task_data = TaskCreate(
            title="Draft order",
            status=TaskStatus.IN_PROGRESS,
            due_date=datetime(2030, 5, 1, 12, 0, tzinfo=timezone.utc),
        )
        task = crud.create_task(db_session, task_data)
        assert task.status == TaskStatus.IN_PROGRESS


class TestGetTask:
    """Tests for retrieving a task by ID."""

    def test_get_existing_task(self, db_session):
        task_data = TaskCreate(
            title="Existing task",
            due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
        )
        created = crud.create_task(db_session, task_data)
        found = crud.get_task(db_session, created.id)

        assert found is not None
        assert found.id == created.id
        assert found.title == "Existing task"

    def test_get_nonexistent_task_returns_none(self, db_session):
        result = crud.get_task(db_session, 99999)
        assert result is None


class TestGetAllTasks:
    """Tests for retrieving all tasks."""

    def test_get_all_tasks_empty(self, db_session):
        tasks, total = crud.get_all_tasks(db_session)
        assert tasks == []
        assert total == 0

    def test_get_all_tasks_returns_all(self, db_session):
        for i in range(3):
            crud.create_task(
                db_session,
                TaskCreate(
                    title=f"Task {i}",
                    due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
                ),
            )
        tasks, total = crud.get_all_tasks(db_session)
        assert total == 3
        assert len(tasks) == 3

    def test_get_all_tasks_filter_by_status(self, db_session):
        crud.create_task(
            db_session,
            TaskCreate(
                title="Todo task",
                status=TaskStatus.TODO,
                due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
            ),
        )
        crud.create_task(
            db_session,
            TaskCreate(
                title="Completed task",
                status=TaskStatus.COMPLETED,
                due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
            ),
        )
        tasks, total = crud.get_all_tasks(db_session, status=TaskStatus.COMPLETED)
        assert total == 1
        assert tasks[0].title == "Completed task"

    def test_get_all_tasks_pagination(self, db_session):
        for i in range(5):
            crud.create_task(
                db_session,
                TaskCreate(
                    title=f"Task {i}",
                    due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
                ),
            )
        tasks, total = crud.get_all_tasks(db_session, skip=2, limit=2)
        assert total == 5
        assert len(tasks) == 2


class TestUpdateTaskStatus:
    """Tests for updating a task's status."""

    def test_update_status_to_completed(self, db_session):
        task = crud.create_task(
            db_session,
            TaskCreate(
                title="Update me",
                due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
            ),
        )
        updated = crud.update_task_status(
            db_session, task, TaskUpdateStatus(status=TaskStatus.COMPLETED)
        )
        assert updated.status == TaskStatus.COMPLETED

    def test_update_status_to_in_progress(self, db_session):
        task = crud.create_task(
            db_session,
            TaskCreate(
                title="Start me",
                due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
            ),
        )
        updated = crud.update_task_status(
            db_session, task, TaskUpdateStatus(status=TaskStatus.IN_PROGRESS)
        )
        assert updated.status == TaskStatus.IN_PROGRESS


class TestUpdateTask:
    """Tests for updating task fields."""

    def test_update_title(self, db_session):
        task = crud.create_task(
            db_session,
            TaskCreate(
                title="Old title",
                due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
            ),
        )
        updated = crud.update_task(
            db_session, task, TaskUpdate(title="New title")
        )
        assert updated.title == "New title"

    def test_update_multiple_fields(self, db_session):
        task = crud.create_task(
            db_session,
            TaskCreate(
                title="Original",
                due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
            ),
        )
        new_due = datetime(2030, 6, 1, 10, 0, tzinfo=timezone.utc)
        updated = crud.update_task(
            db_session,
            task,
            TaskUpdate(title="Updated", description="Added desc", due_date=new_due),
        )
        assert updated.title == "Updated"
        assert updated.description == "Added desc"
        # SQLite may strip timezone info; compare naive values
        assert updated.due_date.replace(tzinfo=None) == new_due.replace(tzinfo=None)


class TestDeleteTask:
    """Tests for deleting a task."""

    def test_delete_task(self, db_session):
        task = crud.create_task(
            db_session,
            TaskCreate(
                title="Delete me",
                due_date=datetime(2030, 3, 1, 10, 0, tzinfo=timezone.utc),
            ),
        )
        task_id = task.id
        crud.delete_task(db_session, task)
        assert crud.get_task(db_session, task_id) is None
