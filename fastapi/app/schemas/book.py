"""
Pydantic schemas for the Book resource.

Separating request/response schemas from ORM models keeps the API contract
independent of the database layer — a core principle of clean layered
architecture.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class BookSchema(BaseModel):
    """
    Schema returned by all Book endpoints.

    Mirrors the Book ORM model but is decoupled from it: the API can evolve
    independently of the database schema.
    """

    id: int = Field(..., description="Auto-incremented primary key")
    title: str = Field(..., description="Full title of the book")
    author: str = Field(..., description="Author name(s)")
    description: str = Field(..., description="Short synopsis")
    category: str = Field(..., description="Genre / subject area")
    year: int = Field(..., description="Year of first publication")
    isbn: Optional[str] = Field(None, description="ISBN-13 or ISBN-10")
    price: float = Field(..., description="Retail price in USD")

    # Enable ORM mode so SQLAlchemy model instances can be serialized directly.
    model_config = {"from_attributes": True}


class BooksPageResponse(BaseModel):
    """
    Paginated response envelope returned by GET /books.

    Carrying total + page metadata lets the frontend render pagination controls
    without a separate COUNT request.
    """

    items: List[BookSchema] = Field(..., description="Books on the current page")
    total: int = Field(..., description="Total number of matching books")
    page: int = Field(..., description="Current page number (1-based)")
    page_size: int = Field(..., description="Number of items per page")
    total_pages: int = Field(..., description="Total number of pages")
