"""
Ollama endpoints — /ollama

Proxies requests to a locally running Ollama instance, enabling the frontend
to use LLM capabilities (free-form chat, translation, analysis) through the
authenticated FastAPI gateway instead of calling Ollama directly.
"""

import logging

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

async def _call_ollama(prompt: str, timeout: float = 60.0) -> str:
    """
    Send a single prompt to the Ollama /api/generate endpoint and return the
    text response.  Raises HTTPException on any network or HTTP error.
    """
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.OLLAMA_URL}/api/generate",
                json=payload,
                timeout=timeout,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.error("Ollama HTTP error: %s", exc)
            # A 404 from Ollama almost always means the model hasn't been pulled.
            # Map it to 503 (Service Unavailable) so the frontend can show a
            # sensible "not ready yet" message rather than a misleading 404.
            if exc.response.status_code == 404:
                raise HTTPException(
                    status_code=503,
                    detail=(
                        f"Ollama model '{settings.OLLAMA_MODEL}' not found. "
                        f"Run: docker exec ollama ollama pull {settings.OLLAMA_MODEL}"
                    ),
                )
            raise HTTPException(
                status_code=503,
                detail=f"Ollama HTTP error {exc.response.status_code}: {exc}",
            )
        except Exception as exc:
            logger.error("Ollama connection error: %s", exc)
            raise HTTPException(
                status_code=503,
                detail=f"Could not reach Ollama at {settings.OLLAMA_URL}: {exc}",
            )

    return response.json().get("response", "").strip()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    """Free-form prompt to send to the LLM."""
    prompt: str = Field(..., min_length=1, description="The user's prompt text.")


class QueryResponse(BaseModel):
    """Raw LLM response."""
    response: str


class TranslateRequest(BaseModel):
    """Request body for the translation endpoint."""
    text: str = Field(..., min_length=1, description="Text to translate.")
    target_language: str = Field(
        ...,
        description="Target language name, e.g. 'English' or 'German'.",
    )


class TranslateResponse(BaseModel):
    """Translation result."""
    translation: str
    target_language: str


class ExplainRequest(BaseModel):
    """Request body for the literary explanation endpoint."""
    text: str = Field(..., min_length=1, description="Text to analyse and explain.")


class ExplainResponse(BaseModel):
    """Literary analysis result."""
    explanation: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/query",
    response_model=QueryResponse,
    summary="Send a free-form prompt to the local LLM",
)
async def query_ollama(request: QueryRequest) -> QueryResponse:
    """
    Forward an arbitrary prompt to the configured Ollama model and return
    the generated text.  Useful for the AI assistant chat panel.
    """
    text = await _call_ollama(request.prompt)
    return QueryResponse(response=text)


@router.post(
    "/translate",
    response_model=TranslateResponse,
    summary="Translate a piece of text using the local LLM",
)
async def translate_text(request: TranslateRequest) -> TranslateResponse:
    """
    Ask the LLM to translate `text` into `target_language`.

    The prompt is carefully worded to instruct the model to:
    - Preserve the original poetic or literary register.
    - Return **only** the translation — no preamble, no explanation.

    This endpoint powers the poem translation feature on the frontend.
    """
    prompt = (
        f"Translate the following text into {request.target_language}. "
        "Preserve the poetic style, rhythm, and imagery as much as possible. "
        "Return ONLY the translation — no introduction, no explanation, no comments.\n\n"
        f"{request.text}"
    )
    translation = await _call_ollama(prompt, timeout=90.0)
    return TranslateResponse(translation=translation, target_language=request.target_language)


@router.post(
    "/explain",
    response_model=ExplainResponse,
    summary="Literary analysis of a text using the local LLM",
)
async def explain_text(request: ExplainRequest) -> ExplainResponse:
    """
    Ask the LLM to produce a literary analysis of the given text.

    The model is prompted as a literary critic and asked to discuss themes,
    imagery, symbolism, and emotional impact.  This endpoint powers the
    'Explain' button in the Georges Castera poem section.
    """
    prompt = (
        "You are a literary critic and specialist in Francophone Caribbean poetry. "
        "Analyse the following poem, discussing its themes, imagery, symbolism, "
        "emotional impact, and cultural context in 3–4 rich paragraphs. "
        "Write in clear, accessible English.\n\n"
        f"{request.text}"
    )
    explanation = await _call_ollama(prompt, timeout=120.0)
    return ExplainResponse(explanation=explanation)
