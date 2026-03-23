"""
seed_db.py — CLI script to (re-)populate the books table.

This file is intentionally excluded from the Docker image (.dockerignore) because
it is a destructive dev tool.  All actual book data and the non-destructive
seed_if_empty() helper live in app/core/seeder.py, which IS part of the image and
is called automatically by the FastAPI lifespan on first boot.

Usage (from the fastapi/ directory, with the venv active or inside the container):

    python seed_db.py          # drops + recreates + re-inserts all books

⚠️  DESTRUCTIVE — this drops and recreates all tables.
    Run only in development / staging, never against production data.
"""

import asyncio
import sys

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.db import Base
from app.core.seeder import CATALOGUE
from app.models.book import Book  # noqa: F401 — registers the table with Base


async def seed() -> None:
    """Drop, recreate, and fully re-populate the books table."""

    # Safety guard: refuse to run against a remote / non-local host.
    if settings.POSTGRES_HOST not in ("localhost", "127.0.0.1", "postgres"):
        print(
            f"ERROR: Refusing to seed against host '{settings.POSTGRES_HOST}'.\n"
            "       Run seed_db.py only against a local or Docker Compose database."
        )
        sys.exit(1)

    engine = create_async_engine(settings.database_url, echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    print("→ Dropping existing tables …")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    print("→ Creating tables …")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    fresh = [
        Book(
            title=b.title, author=b.author, description=b.description,
            category=b.category, year=b.year, isbn=b.isbn, price=b.price,
        )
        for b in CATALOGUE
    ]

    print(f"→ Inserting {len(fresh)} books …")
    async with session_factory() as session:
        session.add_all(fresh)
        await session.commit()

    await engine.dispose()
    print(f"✓ Database seeded with {len(fresh)} books.")


if __name__ == "__main__":
    asyncio.run(seed())
