import { Quote } from "../../types/chat";
import { Reveal } from "../ui";

interface DailyQuoteProps {
  quote: Quote | null;
  loading: boolean;
  onRefresh: () => void;
}

/** Animated shimmer skeleton bar */
function Shimmer({ w = "w-full", delay = "0ms" }: { w?: string; delay?: string }) {
  return (
    <div
      className={`${w} h-[22px] rounded-full overflow-hidden relative`}
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.12) 40%, rgba(99,102,241,0.18) 60%, transparent 100%)",
          animation: "shimmer 1.8s infinite",
          animationDelay: delay,
        }}
      />
    </div>
  );
}

export function DailyQuote({ quote, loading, onRefresh }: DailyQuoteProps) {
  return (
    <section className="mb-24">
      {/* Shimmer keyframe — injected once */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Reveal delay={200}>
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(160deg, #0c0c18 0%, #11101e 45%, #0a0f1c 100%)",
            boxShadow:
              "0 40px 100px rgba(0,0,0,0.3), 0 0 0 1px rgba(139,92,246,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* ── Top accent stripe ──────────────────────────────────────── */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, #6366f1 25%, #8b5cf6 50%, #a78bfa 75%, transparent 100%)",
            }}
          />

          {/* ── Ambient glow orbs ──────────────────────────────────────── */}
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)" }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)" }}
          />

          {/* ── Noise/dot texture ──────────────────────────────────────── */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* ── Main content ───────────────────────────────────────────── */}
          <div className="relative px-10 py-12 sm:px-14 sm:py-14">

            {/* Header row */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                {/* Pulsing ring badge */}
                <div className="relative">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#8b5cf6", boxShadow: "0 0 0 4px rgba(139,92,246,0.2)" }}
                  />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: "rgba(139,92,246,0.7)" }}
                >
                  Daily Inspiration · Powered by Ollama
                </span>
              </div>

              {/* Refresh button */}
              <button
                onClick={onRefresh}
                disabled={loading}
                aria-label="Refresh quote"
                className="group flex items-center gap-2 text-[11px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)";
                }}
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-500 ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                New quote
              </button>
            </div>

            {/* ── Quote body ─────────────────────────────────────────────── */}
            {loading ? (
              /* Skeleton */
              <div className="space-y-4 py-4">
                <Shimmer w="w-full"   delay="0ms" />
                <Shimmer w="w-[88%]"  delay="80ms" />
                <Shimmer w="w-[72%]"  delay="160ms" />
                <Shimmer w="w-[58%]"  delay="240ms" />
                <div className="pt-6 flex items-center gap-3">
                  <div
                    className="h-px w-8 rounded-full"
                    style={{ background: "rgba(139,92,246,0.25)" }}
                  />
                  <Shimmer w="w-32" delay="320ms" />
                </div>
              </div>
            ) : quote ? (
              /* Quote */
              <div style={{ animation: "fadeUp 0.6s ease-out both" }}>
                {/* Opening quote mark SVG */}
                <svg
                  className="mb-5 opacity-40"
                  width="40"
                  height="30"
                  viewBox="0 0 40 30"
                  fill="none"
                >
                  <path
                    d="M0 30V18C0 8.4 5.6 2.4 16.8 0L18 3.6C12.4 5.2 9.6 8.4 9.6 13.2H16.8V30H0ZM23.2 30V18C23.2 8.4 28.8 2.4 40 0L41.2 3.6C35.6 5.2 32.8 8.4 32.8 13.2H40V30H23.2Z"
                    fill="url(#quoteGrad)"
                  />
                  <defs>
                    <linearGradient id="quoteGrad" x1="0" y1="0" x2="41" y2="30" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Quote text */}
                <p
                  className="leading-[1.65] mb-8"
                  style={{
                    fontFamily: "'Instrument Serif', Georgia, serif",
                    fontSize: "clamp(1.2rem, 2.5vw, 1.55rem)",
                    fontStyle: "italic",
                    color: "#dde1ea",
                    letterSpacing: "-0.01em",
                    textShadow: "0 2px 30px rgba(139,92,246,0.1)",
                  }}
                >
                  {quote.quote}
                </p>

                {/* Attribution */}
                <div className="flex items-center gap-4">
                  {/* Gradient line */}
                  <div
                    className="h-px w-12 flex-shrink-0"
                    style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, transparent)" }}
                  />
                  <div>
                    <p
                      className="text-sm font-semibold tracking-wide"
                      style={{ color: "#a78bfa" }}
                    >
                      {quote.author}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Error state */
              <div
                className="py-8 flex flex-col items-center text-center gap-4"
                style={{ animation: "fadeUp 0.5s ease-out both" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  }}
                >
                  🌙
                </div>
                <div>
                  <p className="font-semibold text-slate-300 text-sm mb-1">
                    No quote available
                  </p>
                  <p className="text-slate-600 text-xs max-w-xs leading-relaxed">
                    Ollama is still warming up. Try refreshing in a few seconds.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom bar ─────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-10 sm:px-14 py-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px]"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                🦙
              </div>
              <span className="text-[10px] font-mono text-slate-600 tracking-wider uppercase">
                llama 3.2 · local inference
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-mono text-slate-600 tracking-wider uppercase">
                private · on-device
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
