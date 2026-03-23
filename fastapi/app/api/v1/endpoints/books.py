"""
Books endpoint — GET /books

Provides a paginated, searchable catalogue of books stored in PostgreSQL.
Authentication is NOT required for this endpoint so unauthenticated users can
browse the catalogue (authentication is enforced at the nginx / Keycloak level
before the page is even rendered in the browser).
"""

import math
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.book import Book
from app.schemas import BookSchema, BooksPageResponse

router = APIRouter()


@router.get(
    "/",
    response_model=BooksPageResponse,
    summary="List books with pagination and optional search",
)
async def list_books(
    q: Optional[str] = Query(
        None,
        description="Full-text search term matched against title, author, and description (case-insensitive).",
    ),
    category: Optional[str] = Query(
        None,
        description="Filter by exact category name, e.g. 'Haitian Literature' or 'AI'.",
    ),
    page: int = Query(1, ge=1, description="Page number, 1-based."),
    page_size: int = Query(6, ge=1, le=50, description="Items per page (max 50)."),
    db: AsyncSession = Depends(get_db),
) -> BooksPageResponse:
    """
    Return a paginated list of books.

    Supports:
    - **q**: searches title, author, and description with ILIKE (case-insensitive).
    - **category**: exact match on the category column.
    - **page** / **page_size**: standard offset-based pagination.

    The response envelope includes `total`, `total_pages`, and the current
    `page` and `page_size` so the frontend can render pagination controls
    without an extra round-trip.
    """

    # ------------------------------------------------------------------
    # Build base query and apply optional filters
    # ------------------------------------------------------------------
    base_query = select(Book)

    if q:
        search_term = f"%{q}%"
        base_query = base_query.where(
            or_(
                Book.title.ilike(search_term),
                Book.author.ilike(search_term),
                Book.description.ilike(search_term),
            )
        )

    if category:
        base_query = base_query.where(Book.category == category)

    # ------------------------------------------------------------------
    # COUNT — run before applying OFFSET/LIMIT so we know the total
    # ------------------------------------------------------------------
    count_query = select(func.count()).select_from(base_query.subquery())
    total: int = (await db.execute(count_query)).scalar_one()

    # ------------------------------------------------------------------
    # Fetch the requested page (ordered by id for stable pagination)
    # ------------------------------------------------------------------
    offset = (page - 1) * page_size
    items_query = base_query.order_by(Book.id).offset(offset).limit(page_size)
    result = await db.execute(items_query)
    items = result.scalars().all()

    # ------------------------------------------------------------------
    # Build response envelope
    # ------------------------------------------------------------------
    total_pages = max(1, math.ceil(total / page_size))

    return BooksPageResponse(
        items=[BookSchema.model_validate(book) for book in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{book_id}",
    response_model=BookSchema,
    summary="Get a single book by ID",
)
async def get_book(
    book_id: int,
    db: AsyncSession = Depends(get_db),
) -> BookSchema:
    """
    Return a single book by its primary key.

    Raises **404** if no book with the given ID exists.
    """
    from fastapi import HTTPException

    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()

    if book is None:
        raise HTTPException(status_code=404, detail=f"Book {book_id} not found.")

    return BookSchema.model_validate(book)
