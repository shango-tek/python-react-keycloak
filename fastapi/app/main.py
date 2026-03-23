"""
FastAPI application entry point.

Bootstraps the app, registers middleware, and mounts all versioned routers.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.db import Base, engine


# ---------------------------------------------------------------------------
# Lifespan — runs once on startup and once on shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    """
    On startup:
      1. Create all database tables (idempotent — existing data is never dropped).
      2. Seed the books catalogue if the table is empty (first boot only).

    This means the app is fully self-contained: start the containers and
    everything — schema + sample data — is ready automatically.
    """
    # Step 1 — ensure schema exists
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Step 2 — seed sample data on the first boot (no-op if rows already exist)
    from app.core.seeder import seed_if_empty
    await seed_if_empty(engine)

    yield
    # Nothing to clean up on shutdown for this demo.

# ---------------------------------------------------------------------------
# Application instance
# ---------------------------------------------------------------------------
app = FastAPI(
    lifespan=lifespan,
    title="React-Keycloak API",
    description=(
        "Demo backend that showcases Keycloak JWT authentication, "
        "PostgresSQL via async SQLAlchemy, and local LLM inference through Ollama."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS middleware
# ---------------------------------------------------------------------------
# Allow the React dev server (and any origins listed in CORS_ORIGINS) to
# call the API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Root health check
# ---------------------------------------------------------------------------
# Placed at the application root, so container orchestrators (Docker, K8s)
# can probe /health without knowledge of the versioned API prefix.
@app.get("/health", tags=["health"], summary="Liveness probe")
async def health() -> dict:
    """Returns 200 OK if the process is alive."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Dev entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=True,
    )
