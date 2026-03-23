"""
app/core/seeder.py — Book catalogue and startup seed helper.

This module lives inside the app package so it is included in the Docker image
and importable by main.py's lifespan hook.

The CLI seed script (seed_db.py, excluded from the image via .dockerignore) imports
CATALOGUE and seed_if_empty from here so the data is defined in exactly one place.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from app.models.book import Book

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncEngine

# ---------------------------------------------------------------------------
# Book catalogue (20 titles)
# ---------------------------------------------------------------------------

CATALOGUE: list[Book] = [

    # ── IT / Artificial Intelligence ─────────────────────────────────────────
    Book(
        title="Clean Code: A Handbook of Agile Software Craftsmanship",
        author="Robert C. Martin",
        description=(
            "A must-read for every programmer. Martin distills decades of "
            "experience into practical rules for writing readable, maintainable "
            "code. Covers naming, functions, comments, formatting, error handling, "
            "and refactoring with concrete Java examples."
        ),
        category="IT",
        year=2008,
        isbn="978-0132350884",
        price=39.99,
    ),
    Book(
        title="The Pragmatic Programmer: Your Journey to Mastery",
        author="David Thomas, Andrew Hunt",
        description=(
            "A timeless guide for software engineers. Topics range from "
            "DRY principles and orthogonality to debugging, metaprogramming, "
            "and the importance of caring about your craft. Updated 20th "
            "anniversary edition adds modern topics like DevOps and CI/CD."
        ),
        category="IT",
        year=1999,
        isbn="978-0135957059",
        price=44.99,
    ),
    Book(
        title="Designing Data-Intensive Applications",
        author="Martin Kleppmann",
        description=(
            "The definitive guide to the principles behind reliable, scalable, "
            "and maintainable systems. Covers data models, storage engines, "
            "distributed systems, stream processing, and consistency guarantees "
            "in depth — essential reading for backend and data engineers."
        ),
        category="IT",
        year=2017,
        isbn="978-1449373320",
        price=59.99,
    ),
    Book(
        title="Artificial Intelligence: A Modern Approach",
        author="Stuart Russell, Peter Norvig",
        description=(
            "The standard textbook for AI courses worldwide. The fourth edition "
            "covers search, knowledge representation, reasoning under uncertainty, "
            "machine learning, deep learning, natural language processing, "
            "robotics, and the philosophical and ethical dimensions of AI."
        ),
        category="AI",
        year=2020,
        isbn="978-0134610993",
        price=89.99,
    ),
    Book(
        title="Deep Learning",
        author="Ian Goodfellow, Yoshua Bengio, Aaron Courville",
        description=(
            "The authoritative reference for the theory and practice of deep "
            "neural networks. Written by three of the field's pioneers, it covers "
            "feedforward networks, regularisation, optimisation, CNNs, RNNs, "
            "autoencoders, generative models, and the mathematical prerequisites."
        ),
        category="AI",
        year=2016,
        isbn="978-0262035613",
        price=72.99,
    ),

    # ── Philosophy & Literature ───────────────────────────────────────────────
    Book(
        title="Thus Spoke Zarathustra",
        author="Friedrich Nietzsche",
        description=(
            "Nietzsche's most celebrated work, written in a dense, poetic prose. "
            "Through the wanderings of the prophet Zarathustra, it introduces the "
            "Übermensch, the will to power, and the eternal recurrence — ideas that "
            "would profoundly influence 20th-century thought, literature, and art."
        ),
        category="Philosophy",
        year=1883,
        isbn="978-0140441185",
        price=14.99,
    ),
    Book(
        title="Being and Time",
        author="Martin Heidegger",
        description=(
            "One of the most influential — and demanding — works in Western "
            "philosophy. Heidegger interrogates the meaning of Being, introduces "
            "Dasein (being-in-the-world), temporality, and authenticity, laying "
            "the groundwork for existentialism and hermeneutic phenomenology."
        ),
        category="Philosophy",
        year=1927,
        isbn="978-0061575594",
        price=24.99,
    ),
    Book(
        title="The Stranger",
        author="Albert Camus",
        description=(
            "Meursault, an ordinary Algerian clerk, kills an Arab on a beach and "
            "faces trial — not for the murder but for his emotional detachment. "
            "Camus's spare, cool prose makes this short novel the defining text "
            "of absurdism: the universe is indifferent, meaning is ours to make."
        ),
        category="Literature",
        year=1942,
        isbn="978-0679720201",
        price=12.99,
    ),
    Book(
        title="One Hundred Years of Solitude",
        author="Gabriel García Márquez",
        description=(
            "The founding masterpiece of magical realism. Seven generations of the "
            "Buendía family inhabit the mythical town of Macondo. History, myth, "
            "and the supernatural interweave in prose of extraordinary richness, "
            "making this the defining Latin American novel of the 20th century."
        ),
        category="Literature",
        year=1967,
        isbn="978-0060883287",
        price=16.99,
    ),
    Book(
        title="Critique of Pure Reason",
        author="Immanuel Kant",
        description=(
            "Kant's monumental synthesis attempts to resolve the conflict between "
            "rationalism and empiricism. He argues that the mind actively structures "
            "experience through categories of understanding, drawing a crucial "
            "distinction between phenomena (what we can know) and noumena (things "
            "in themselves). A cornerstone of modern Western philosophy."
        ),
        category="Philosophy",
        year=1781,
        isbn="978-0521657297",
        price=34.99,
    ),

    # ── Haitian Literature ────────────────────────────────────────────────────
    Book(
        title="Gouverneurs de la Rosée",
        author="Jacques Roumain",
        description=(
            "Often called the greatest Haitian novel. Manuel returns to his drought-"
            "stricken village and fights to reconcile feuding families and bring "
            "water back to the land. Written in a lyrical French infused with Creole "
            "rhythms, it is a hymn to peasant life, solidarity, and the Haitian soil."
        ),
        category="Haitian Literature",
        year=1944,
        isbn="978-2070374113",
        price=17.99,
    ),
    Book(
        title="Pays sans chapeau",
        author="Dany Laferrière",
        description=(
            "After two decades in Montreal, the narrator returns to Port-au-Prince "
            "and navigates the visible world of poverty and heat and the invisible "
            "world of voodoo and the dead. Laferrière's blend of memoir, fiction, "
            "and cultural commentary made him a key voice of the Haitian diaspora."
        ),
        category="Haitian Literature",
        year=1996,
        isbn="978-2764600204",
        price=18.99,
    ),
    Book(
        title="Ainsi parla l'oncle",
        author="Jean Price-Mars",
        description=(
            "The foundational text of Haitian indigenism (indigénisme). Price-Mars "
            "urges Haitian intellectuals to embrace African cultural roots, Vodou, "
            "and Creole folklore rather than imitating French models. Its influence "
            "on subsequent Caribbean and African literature is immeasurable."
        ),
        category="Haitian Literature",
        year=1928,
        isbn="978-2912934062",
        price=22.99,
    ),
    Book(
        title="L'espace d'un cillement",
        author="Jacques-Stéphen Alexis",
        description=(
            "Set in a Port-au-Prince brothel, this extraordinary novel follows the "
            "Haitian-Cuban dancer La Niña Estrellita. Alexis's concept of 'marvellous "
            "realism' saturates the narrative with folklore, music, and the sensory "
            "intensity of Caribbean life — a counterpart to Latin American magical realism."
        ),
        category="Haitian Literature",
        year=1959,
        isbn="978-2070384822",
        price=19.99,
    ),
    Book(
        title="Viejo & Kasekò",
        author="Georges Castera",
        description=(
            "A bilingual French-Creole poetry collection by one of Haiti's most "
            "celebrated poets. Castera's verse is incantatory and percussive — "
            "rooted in the rhythms of Vodou drums, the Haitian landscape, and a "
            "fierce commitment to those crushed by history and silence."
        ),
        category="Haitian Literature",
        year=1983,
        price=15.99,
    ),

    # ── Free Choice ───────────────────────────────────────────────────────────
    Book(
        title="Dune",
        author="Frank Herbert",
        description=(
            "Set in a distant future where interstellar travel depends on the spice "
            "mélange found only on the desert planet Arrakis, Herbert's epic weaves "
            "ecology, religion, politics, and prophecy into one of the richest world-"
            "building achievements in science fiction."
        ),
        category="Science Fiction",
        year=1965,
        isbn="978-0441013593",
        price=14.99,
    ),
    Book(
        title="Sapiens: A Brief History of Humankind",
        author="Yuval Noah Harari",
        description=(
            "A sweeping history of the human species from the Stone Age to the 21st "
            "century. Harari argues that Homo sapiens' dominance rests on our unique "
            "ability to believe in shared fictions — money, nations, corporations, "
            "human rights — and explores where this power may take us next."
        ),
        category="History",
        year=2011,
        isbn="978-0062316097",
        price=17.99,
    ),
    Book(
        title="1984",
        author="George Orwell",
        description=(
            "Winston Smith lives in Airstrip One, a province of the superstate "
            "Oceania, where Big Brother watches every citizen. Orwell's dystopia "
            "gave language its most chilling political vocabulary: doublethink, "
            "Newspeak, Room 101. Written in 1948, it has never felt more urgent."
        ),
        category="Classic Fiction",
        year=1949,
        isbn="978-0451524935",
        price=13.99,
    ),
    Book(
        title="The Art of War",
        author="Sun Tzu",
        description=(
            "Attributed to the Chinese military strategist Sun Tzu, this ancient "
            "treatise distils the essence of warfare into 13 short chapters. Its "
            "insights into strategy, deception, adaptability, and knowing both "
            "yourself and your enemy have influenced military, business, and "
            "competitive sport for over two millennia."
        ),
        category="Strategy",
        year=500,
        isbn="978-1599869773",
        price=8.99,
    ),
    Book(
        title="The Great Gatsby",
        author="F. Scott Fitzgerald",
        description=(
            "Nick Carraway narrates the doomed pursuit of Jay Gatsby — self-made "
            "millionaire, mysterious host, and hopeless romantic — of his lost love "
            "Daisy Buchanan across the glittering, hollow social world of 1920s "
            "Long Island. The definitive American novel of aspiration and illusion."
        ),
        category="Classic Fiction",
        year=1925,
        isbn="978-0743273565",
        price=9.99,
    ),
]


# ---------------------------------------------------------------------------
# Seed helper (called from main.py lifespan — safe to run in production)
# ---------------------------------------------------------------------------

async def seed_if_empty(engine: "AsyncEngine") -> None:
    """
    Insert the book catalogue if the books table is empty.

    This is idempotent: subsequent calls after the first boot do a single
    COUNT(*) query, find rows already present, and return immediately.

    Args:
        engine: The application's async SQLAlchemy engine (already created).
    """
    from sqlalchemy import select, func as sa_func
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with session_factory() as session:
        count: int = (
            await session.execute(select(sa_func.count()).select_from(Book))
        ).scalar_one()

    if count > 0:
        print(f"[seeder] Books table already has {count} rows — skipping seed.")
        return

    print(f"[seeder] Books table is empty — inserting {len(CATALOGUE)} books …")

    # Build fresh ORM instances so they are not attached to a stale identity map
    fresh = [
        Book(
            title=b.title,
            author=b.author,
            description=b.description,
            category=b.category,
            year=b.year,
            isbn=b.isbn,
            price=b.price,
        )
        for b in CATALOGUE
    ]

    async with session_factory() as session:
        session.add_all(fresh)
        await session.commit()

    print(f"[seeder] ✓ {len(CATALOGUE)} books inserted.")
