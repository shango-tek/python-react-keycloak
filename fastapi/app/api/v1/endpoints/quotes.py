"""
quotes.py — Daily quote via Ollama.

GET /api/v1/quote
    Asks the local LLM to produce a short inspiring quote.  If Ollama is
    unavailable or the model isn't loaded yet the endpoint returns 503 so
    the frontend can show a graceful "unavailable" state rather than crashing.
"""

import httpx
from fastapi import APIRouter, HTTPException

from app.core.config import settings

router = APIRouter()


@router.get("/quote", summary="Generate a daily inspirational quote via Ollama")
async def get_daily_quote() -> dict:
    """
    Returns a JSON object ``{"quote": str, "author": str, "category": str}``.

    Raises:
        503 — Ollama service is not reachable or the model is not yet pulled.
        500 — Any other unexpected error.
    """
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": (
            "Give me a short, inspiring quote about happiness. "
            "Return ONLY the quote text and the author in this exact format: "
            "'Quote' - Author"
        ),
        "stream": False,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.OLLAMA_URL}/api/generate",
                json=payload,
                timeout=30.0,
            )
            response.raise_for_status()
        except httpx.ConnectError:
            raise HTTPException(
                status_code=503,
                detail="Ollama service is not reachable. Is the container running?",
            )
        except httpx.HTTPStatusError as e:
            # 404 from Ollama almost always means the model hasn't been pulled yet.
            status = e.response.status_code
            if status == 404:
                raise HTTPException(
                    status_code=503,
                    detail=(
                        f"Ollama model '{settings.OLLAMA_MODEL}' not found. "
                        f"Run: docker exec ollama ollama pull {settings.OLLAMA_MODEL}"
                    ),
                )
            raise HTTPException(status_code=503, detail=f"Ollama error {status}: {e}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

    result = response.json()
    quote_text: str = result.get("response", "").strip()

    if not quote_text:
        raise HTTPException(status_code=503, detail="Ollama returned an empty response.")

    if " - " in quote_text:
        parts = quote_text.rsplit(" - ", 1)
        return {
            "quote": parts[0].strip("'\" "),
            "author": parts[1].strip(),
            "category": "happiness",
        }

    return {"quote": quote_text, "author": "Unknown", "category": "happiness"}
