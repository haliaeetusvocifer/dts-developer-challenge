"""Integration tests for the Task Management API endpoints — TDD style."""


class TestHealthCheck:
    """Tests for the health endpoint."""

    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestCreateTask:
    """Tests for POST /api/tasks."""

    def test_create_task_success(self, client, sample_task_data):
        response = client.post("/api/tasks", json=sample_task_data)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_task_data["title"]
        assert data["description"] == sample_task_data["description"]
        assert data["status"] == "todo"
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_task_without_description(self, client):
        payload = {
            "title": "Quick task",
            "due_date": "2030-04-01T12:00:00Z",
        }
        response = client.post("/api/tasks", json=payload)
        assert response.status_code == 201
        assert response.json()["description"] is None

    def test_create_task_missing_title_returns_422(self, client):
        payload = {"due_date": "2030-04-01T12:00:00Z"}
        response = client.post("/api/tasks", json=payload)
        assert response.status_code == 422

    def test_create_task_empty_title_returns_422(self, client):
        payload = {"title": "", "due_date": "2030-04-01T12:00:00Z"}
        response = client.post("/api/tasks", json=payload)
        assert response.status_code == 422

    def test_create_task_missing_due_date_returns_422(self, client):
        payload = {"title": "No due date"}
        response = client.post("/api/tasks", json=payload)
        assert response.status_code == 422

    def test_create_task_invalid_status_returns_422(self, client):
        payload = {
            "title": "Bad status",
            "status": "invalid_status",
            "due_date": "2030-04-01T12:00:00Z",
        }
        response = client.post("/api/tasks", json=payload)
        assert response.status_code == 422

    def test_create_task_title_too_long_returns_422(self, client):
        payload = {
            "title": "A" * 256,
            "due_date": "2030-04-01T12:00:00Z",
        }
        response = client.post("/api/tasks", json=payload)
        assert response.status_code == 422

    def test_create_task_past_due_date_returns_422(self, client):
        payload = {
            "title": "Past due date",
            "due_date": "2020-01-01T10:00:00Z",
        }
        response = client.post("/api/tasks", json=payload)
        assert response.status_code == 422
        assert "past" in response.json()["detail"][0]["msg"].lower()


class TestGetTask:
    """Tests for GET /api/tasks/{task_id}."""

    def test_get_task_success(self, client, created_task):
        task_id = created_task["id"]
        response = client.get(f"/api/tasks/{task_id}")
        assert response.status_code == 200
        assert response.json()["id"] == task_id

    def test_get_task_not_found(self, client):
        response = client.get("/api/tasks/99999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestGetAllTasks:
    """Tests for GET /api/tasks."""

    def test_get_all_tasks_empty(self, client):
        response = client.get("/api/tasks")
        assert response.status_code == 200
        data = response.json()
        assert data["tasks"] == []
        assert data["total"] == 0

    def test_get_all_tasks_returns_created(self, client, sample_task_data):
        client.post("/api/tasks", json=sample_task_data)
        client.post("/api/tasks", json={**sample_task_data, "title": "Second task"})
        response = client.get("/api/tasks")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["tasks"]) == 2

    def test_get_all_tasks_filter_by_status(self, client, sample_task_data):
        client.post("/api/tasks", json=sample_task_data)
        client.post(
            "/api/tasks",
            json={**sample_task_data, "title": "Done task", "status": "completed"},
        )
        response = client.get("/api/tasks?status=completed")
        data = response.json()
        assert data["total"] == 1
        assert data["tasks"][0]["status"] == "completed"

    def test_get_all_tasks_pagination(self, client, sample_task_data):
        for i in range(5):
            client.post(
                "/api/tasks", json={**sample_task_data, "title": f"Task {i}"}
            )
        response = client.get("/api/tasks?skip=2&limit=2")
        data = response.json()
        assert data["total"] == 5
        assert len(data["tasks"]) == 2


class TestUpdateTaskStatus:
    """Tests for PATCH /api/tasks/{task_id}/status."""

    def test_update_status_success(self, client, created_task):
        task_id = created_task["id"]
        response = client.patch(
            f"/api/tasks/{task_id}/status", json={"status": "in_progress"}
        )
        assert response.status_code == 200
        assert response.json()["status"] == "in_progress"

    def test_update_status_to_completed(self, client, created_task):
        task_id = created_task["id"]
        response = client.patch(
            f"/api/tasks/{task_id}/status", json={"status": "completed"}
        )
        assert response.status_code == 200
        assert response.json()["status"] == "completed"

    def test_update_status_not_found(self, client):
        response = client.patch(
            "/api/tasks/99999/status", json={"status": "completed"}
        )
        assert response.status_code == 404

    def test_update_status_invalid_returns_422(self, client, created_task):
        task_id = created_task["id"]
        response = client.patch(
            f"/api/tasks/{task_id}/status", json={"status": "invalid"}
        )
        assert response.status_code == 422


class TestUpdateTask:
    """Tests for PUT /api/tasks/{task_id}."""

    def test_update_task_title(self, client, created_task):
        task_id = created_task["id"]
        response = client.put(
            f"/api/tasks/{task_id}", json={"title": "Updated title"}
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Updated title"

    def test_update_task_not_found(self, client):
        response = client.put(
            "/api/tasks/99999", json={"title": "Nope"}
        )
        assert response.status_code == 404


class TestDeleteTask:
    """Tests for DELETE /api/tasks/{task_id}."""

    def test_delete_task_success(self, client, created_task):
        task_id = created_task["id"]
        response = client.delete(f"/api/tasks/{task_id}")
        assert response.status_code == 204

        # Verify it's gone
        get_response = client.get(f"/api/tasks/{task_id}")
        assert get_response.status_code == 404

    def test_delete_task_not_found(self, client):
        response = client.delete("/api/tasks/99999")
        assert response.status_code == 404
