import { BooksPage } from "../../../types/book";
import { BOOK_CATEGORIES, CATEGORY_ACTIVE_COLORS } from "../../../constants/categories";
import { Reveal, Eyebrow, Spinner } from "../../ui";
import { BookCard } from "./BookCard";

interface LibraryProps {
  booksPage: BooksPage | null;
  loading: boolean;
  search: string;
  category: string;
  currentPage: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export function Library({
  booksPage,
  loading,
  search,
  category,
  currentPage,
  onSearchChange,
  onCategoryChange,
  onPageChange,
}: LibraryProps) {

  return (
    <section className="mb-24">
      <Reveal delay={200}>
        {/* Section heading */}
        <Eyebrow>Bibliothèque · Live from PostgreSQL</Eyebrow>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <h2
            className="text-3xl font-semibold tracking-tight text-slate-900"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            The library.
          </h2>
          {booksPage && (
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {booksPage.total} book{booksPage.total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Search bar ────────────────────────────────────────────────── */}
        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by title, author, or description…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-11 text-sm text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all shadow-sm placeholder-slate-400"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all text-[10px]"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Category pills ────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => onCategoryChange("")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
              category === ""
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
            }`}
          >
            All
          </button>
          {BOOK_CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(active ? "" : cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border shadow-sm ${
                  active
                    ? CATEGORY_ACTIVE_COLORS[cat] ?? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ── Book grid ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-4">
            <Spinner size="w-8 h-8" />
            <span className="text-slate-400 text-sm">Loading catalogue…</span>
          </div>
        ) : booksPage && booksPage.items.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {booksPage.items.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination */}
            {booksPage.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {Array.from({ length: booksPage.total_pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      p === currentPage
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:border-indigo-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => onPageChange(Math.min(booksPage.total_pages, currentPage + 1))}
                  disabled={currentPage === booksPage.total_pages}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-2xl">
              📚
            </div>
            <p className="text-slate-400 text-sm font-medium">
              {search || category
                ? "No books match your search."
                : "No books yet — the catalogue will appear here once the database is seeded."}
            </p>
            {(search || category) && (
              <button
                onClick={() => {
                  onSearchChange("");
                  onCategoryChange("");
                }}
                className="mt-3 text-indigo-500 text-xs font-bold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </Reveal>
    </section>
  );
}
