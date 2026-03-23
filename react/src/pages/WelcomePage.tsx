/**
 * WelcomePage.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Thin orchestrator — owns data-fetching state and delegates rendering to
 * focused sub-components.
 *
 * Component tree:
 *   WelcomePage
 *   ├── FloatingChatbot          (fixed bottom-right)
 *   ├── Navbar
 *   ├── Hero
 *   ├── DailyQuote
 *   ├── Library
 *   ├── PoemSection
 *   └── Footer (inline — too small to warrant its own file)
 */

import React, { useCallback, useEffect, useState } from "react";
import keycloak from "../auth/keycloak";
import { useApi } from "../context/ApiContext";
import { BooksPage } from "../types/book";
import { Quote } from "../types/chat";
import { PAGE_SIZE } from "../constants/categories";

import { LiveDot, Reveal } from "../components/ui";
import { FloatingChatbot } from "../components/welcome/FloatingChatbot";
import { Navbar }          from "../components/welcome/Navbar";
import { Hero }            from "../components/welcome/Hero";
import { DailyQuote }      from "../components/welcome/DailyQuote";
import { Library }         from "../components/welcome/Library/Library";
import { PoemSection }     from "../components/welcome/PoemSection";

const WelcomePage: React.FC = () => {
  const api = useApi();

  const firstName =
    (keycloak.tokenParsed?.given_name as string | undefined) ||
    (keycloak.tokenParsed?.preferred_username as string | undefined) ||
    "there";

  // ── Quote state ────────────────────────────────────────────────────────────
  const [quote, setQuote]               = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);

  // ── Library state ──────────────────────────────────────────────────────────
  const [booksPage, setBooksPage]       = useState<BooksPage | null>(null);
  const [booksLoading, setBooksLoading] = useState(true);
  const [bookSearch, setBookSearch]     = useState("");
  const [bookCategory, setBookCategory] = useState("");
  const [currentPage, setCurrentPage]   = useState(1);

  // ── Fetchers ───────────────────────────────────────────────────────────────

  const fetchQuote = useCallback(async () => {
    try {
      setQuoteLoading(true);
      const { data } = await api.get<Quote>("/quote");
      setQuote(data);
    } catch {
      // Non-critical — Ollama may still be warming up
    } finally {
      setQuoteLoading(false);
    }
  }, [api]);

  const fetchBooks = useCallback(
    async (page: number, q: string, category: string) => {
      try {
        setBooksLoading(true);
        const params = new URLSearchParams({
          page:      String(page),
          page_size: String(PAGE_SIZE),
        });
        if (q.trim())  params.set("q", q.trim());
        if (category)  params.set("category", category);
        const { data } = await api.get<BooksPage>(`/books/?${params}`);
        setBooksPage(data);
      } catch {
        // Handled via empty-state UI in Library
      } finally {
        setBooksLoading(false);
      }
    },
    [api],
  );

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  // Debounced books fetch on filter / page change
  useEffect(() => {
    const t = setTimeout(() => fetchBooks(currentPage, bookSearch, bookCategory), 300);
    return () => clearTimeout(t);
  }, [currentPage, bookSearch, bookCategory, fetchBooks]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [bookSearch, bookCategory]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-[#fafafa] text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900"
      style={{ fontFamily: "'Geist', sans-serif" }}
    >
      {/* Ambient background blobs + dot grid */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-200/40 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-violet-200/30 blur-[120px]" />
        <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full bg-sky-200/30 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Fixed chatbot — outside the scrolling content flow */}
      <FloatingChatbot />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 lg:py-20 relative z-10">
        <Navbar />

        <Hero firstName={firstName} />

        <DailyQuote
          quote={quote}
          loading={quoteLoading}
          onRefresh={fetchQuote}
        />

        <Library
          booksPage={booksPage}
          loading={booksLoading}
          search={bookSearch}
          category={bookCategory}
          currentPage={currentPage}
          onSearchChange={setBookSearch}
          onCategoryChange={setBookCategory}
          onPageChange={setCurrentPage}
        />

        <PoemSection />

        {/* Footer */}
        <Reveal delay={200}>
          <footer className="border-t border-slate-200/80 pt-10 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[8px]">
                ✦
              </div>
              <span className="font-medium">Demo Portal</span>
              <span className="text-slate-300">·</span>
              <span>React · FastAPI · Keycloak · Ollama · PostgreSQL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LiveDot color="bg-emerald-400" />
              <span>All systems operational</span>
            </div>
          </footer>
        </Reveal>
      </div>
    </div>
  );
};

export default WelcomePage;
