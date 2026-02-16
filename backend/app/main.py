"""FastAPI application entry point for the HMCTS Task Management API."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HMCTS Task Management API",
    description=(
        "A RESTful API for HMCTS caseworkers to create, view, update, "
        "and delete tasks efficiently."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health", tags=["Health"], response_model=dict)
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
