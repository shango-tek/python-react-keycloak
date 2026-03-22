import httpx
from fastapi import APIRouter, HTTPException

from app.core.config import settings

router = APIRouter()

@router.get("/quote")
async def get_daily_quote():
    async with httpx.AsyncClient() as client:
        try:
            # Simple prompt for generating a short, inspiring quote
            payload = {
                "model": settings.OLLAMA_MODEL,
                "prompt": "Give me a short, inspiring quote about happiness. Return ONLY the quote text and the author in this format: 'Quote' - Author",
                "stream": False
            }
            response = await client.post(
                f"{settings.OLLAMA_URL}/api/generate",
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            result = response.json()
            
            quote_text = result.get("response", "").strip()
            
            if quote_text:
                # API Ninjas response format was: {"quote": "...", "author": "...", "category": "..."}
                # We'll try to parse our generated text or just return it as a string
                # To maintain compatibility if needed, let's try to split
                if " - " in quote_text:
                    parts = quote_text.rsplit(" - ", 1)
                    return {"quote": parts[0].strip("'\" "), "author": parts[1].strip(), "category": "happiness"}
                
                return {"quote": quote_text, "author": "Unknown", "category": "happiness"}
            else:
                raise HTTPException(status_code=404, detail="No quote generated")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")
