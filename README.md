# HMCTS Task Management System

A full-stack task management system for HMCTS caseworkers to create, view, update, and delete tasks efficiently.

## Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Backend  | Python 3.13 · FastAPI · SQLAlchemy |
| Database | SQLite (file-based, zero config)  |
| Frontend | Next.js 16 · React 19 · Tailwind CSS |
| Testing  | pytest (backend) · Jest + RTL (frontend) |

## Project Structure

```
dts-developer-challenge/
├── backend/               # FastAPI REST API
│   ├── app/
│   │   ├── main.py        # Application entry point
│   │   ├── database.py    # Database config & session
│   │   ├── models.py      # SQLAlchemy ORM models
│   │   ├── schemas.py     # Pydantic request/response schemas
│   │   ├── crud.py        # CRUD operations
│   │   └── routes.py      # API route handlers
│   ├── tests/
│   │   ├── conftest.py    # Shared test fixtures
│   │   ├── test_api.py    # API integration tests
│   │   ├── test_crud.py   # CRUD unit tests
│   │   └── test_schemas.py # Schema validation tests
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # API client & utilities
│   │   ├── types/         # TypeScript type definitions
│   │   └── __tests__/     # Jest unit tests
│   ├── jest.config.js
│   └── package.json
└── README.md
```

## Prerequisites

- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)

## Getting Started

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate   # macOS/Linux
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --reload --port 8000
```

The API is now available at **http://localhost:8000**.

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend is now available at **http://localhost:3000**.

## Running Tests

### Backend Tests (53 tests, 97% coverage)

```bash
cd backend
source venv/bin/activate
python -m pytest              # Run all tests
python -m pytest -v           # Verbose output
python -m pytest --cov=app    # With coverage report
```

### Frontend Tests (35 tests)

```bash
cd frontend
npm test                      # Run all tests
npm run test:watch            # Watch mode
npm run test:coverage         # With coverage
```

## API Documentation

### Endpoints

| Method   | Endpoint                    | Description              |
| -------- | --------------------------- | ------------------------ |
| `GET`    | `/health`                   | Health check             |
| `POST`   | `/api/tasks`                | Create a new task        |
| `GET`    | `/api/tasks`                | Retrieve all tasks       |
| `GET`    | `/api/tasks/{id}`           | Retrieve a task by ID    |
| `PATCH`  | `/api/tasks/{id}/status`    | Update a task's status   |
| `PUT`    | `/api/tasks/{id}`           | Update a task            |
| `DELETE` | `/api/tasks/{id}`           | Delete a task            |

### Task Model

```json
{
  "id": 1,
  "title": "Review case file #12345",
  "description": "Review all documents before the hearing.",
  "status": "todo",
  "due_date": "2026-03-01T10:00:00Z",
  "created_at": "2026-02-16T09:00:00Z",
  "updated_at": "2026-02-16T09:00:00Z"
}
```

### Task Statuses

| Status         | Description                    |
| -------------- | ------------------------------ |
| `todo`         | Task has not been started      |
| `in_progress`  | Task is currently being worked on |
| `completed`    | Task has been completed        |

### Query Parameters (GET /api/tasks)

| Parameter | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| `status`  | string | Filter by status (todo, in_progress, completed) |
| `skip`    | int    | Number of records to skip (default: 0) |
| `limit`   | int    | Max records to return (default: 100, max: 500) |

### Example Requests

**Create a task:**
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review case file #12345",
    "description": "Check all evidence documents",
    "status": "todo",
    "due_date": "2026-03-01T10:00:00Z"
  }'
```

**Update task status:**
```bash
curl -X PATCH http://localhost:8000/api/tasks/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Delete a task:**
```bash
curl -X DELETE http://localhost:8000/api/tasks/1
```

## Validation & Error Handling

- **Title**: Required, 1–255 characters
- **Description**: Optional, max 2000 characters
- **Status**: Must be one of `todo`, `in_progress`, `completed`
- **Due date**: Required, valid ISO 8601 datetime, must not be in the past
- **404**: Returned when a task is not found
- **422**: Returned for validation errors with detailed messages

## Design Decisions

- **SQLite**: Zero-configuration database, perfect for this use case with no external DB dependency
- **TDD approach**: Tests written alongside code — 53 backend + 35 frontend tests
- **In-memory test DB**: Tests use SQLite in-memory for fast, isolated test runs
- **Pydantic validation**: Strong request/response validation with clear error messages
- **Pagination**: Built-in pagination support for the task list endpoint
- **CORS**: Configured to allow the Next.js frontend to communicate with the API
