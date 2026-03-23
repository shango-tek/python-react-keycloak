"""
API v1 router aggregator.

All versioned routers are mounted here and then included in main.py under
the /api/v1 prefix.  Adding a new feature means:
  1. Create app/api/v1/endpoints/<feature>.py
  2. Add an include_router() call below.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import books, ollama, quotes, system

api_router = APIRouter()

# Books catalogue — GET /api/v1/books
api_router.include_router(books.router, prefix="/books", tags=["books"])

# Daily quote via Ollama — GET /api/v1/quote
api_router.include_router(quotes.router, tags=["quotes"])

# Ollama LLM proxy — POST /api/v1/ollama/query|translate|explain
api_router.include_router(ollama.router, prefix="/ollama", tags=["ollama"])

# System telemetry — GET /api/v1/system/health | system-data
api_router.include_router(system.router, prefix="/system", tags=["system"])
