import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


class QueryRequest(BaseModel):
    prompt: str


class QueryResponse(BaseModel):
    response: str


@router.post("/query", response_model=QueryResponse)
async def query_ollama(request: QueryRequest):
    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "model": settings.OLLAMA_MODEL,
                "prompt": request.prompt,
                "stream": False
            }
            response = await client.post(
                f"{settings.OLLAMA_URL}/api/generate",
                json=payload,
                timeout=60.0
            )
            response.raise_for_status()
            result = response.json()
            
            return {"response": result.get("response", "").strip()}
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")
