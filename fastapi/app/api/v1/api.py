from fastapi import APIRouter
from app.api.v1.endpoints import quotes, ollama

api_router = APIRouter()
api_router.include_router(quotes.router, tags=["quotes"])
api_router.include_router(ollama.router, prefix="/ollama", tags=["ollama"])
