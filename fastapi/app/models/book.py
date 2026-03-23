"""
Book ORM model.

Replaces the earlier Product model.  A book record holds bibliographic
information as well as a retail price so the frontend can display a catalogue.
"""

from typing import Optional

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class Book(Base):
    """
    Represents a single book in the library catalogue.

    Attributes:
        id:          Auto-incremented primary key.
        title:       Full title of the book (indexed for fast search).
        author:      Author name(s), e.g. "Jacques Roumain" or "Russell & Norvig".
        description: Short synopsis or back-cover blurb.
        category:    Genre / subject area (e.g. "Haitian Literature", "AI").
        year:        Year of first publication.
        isbn:        Optional ISBN-13 or ISBN-10 string.
        price:       Retail price in USD.
    """

    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    title: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
        comment="Full title of the book",
    )
    author: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
        comment="Author name(s)",
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Short synopsis",
    )
    category: Mapped[str] = mapped_column(
        String(100),
        index=True,
        nullable=False,
        comment="Genre or subject area",
    )
    year: Mapped[int] = mapped_column(
        nullable=False,
        comment="Year of first publication",
    )
    isbn: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="ISBN-13 or ISBN-10",
    )
    price: Mapped[float] = mapped_column(
        nullable=False,
        comment="Retail price in USD",
    )
