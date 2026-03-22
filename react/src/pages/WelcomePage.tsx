/**
 * WelcomePage.tsx
 * ────────────────────────────────────────────────────────────────
 * Drop into src/pages/WelcomePage.tsx
 * Requires: Tailwind CSS, keycloak-js, axios (via useApi hook)
 * Fonts added via Google Fonts import in index.html or index.css:
 *   @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');
 * ────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState, useCallback } from "react";
import keycloak from "../auth/keycloak";
import { useApi } from "../context/ApiContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TechItem {
  name: string;
  description: string;
  icon: string | React.ReactNode;
  glow: string;
  tag: string;
}

interface SecurePayload {
  message: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TECH_STACK: TechItem[] = [
  {
    name: "React",
    description: "UI Library",
    icon: "/react.svg",
    glow: "group-hover:shadow-[0_8px_30px_rgba(97,218,251,0.35)]",
    tag: "18.3",
  },
  {
    name: "Tailwind",
    description: "Utility CSS",
    icon: (
        <svg viewBox="0 0 54 33" className="w-full h-full" fill="none">
          <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M27 0C19.8 0 15.3 3.6 13.5 10.8C16.2 7.2 19.35 5.85 22.95 6.75C25.004 7.263 26.472 8.754 28.097 10.403C30.744 13.09 33.808 16.2 40.5 16.2C47.7 16.2 52.2 12.6 54 5.4C51.3 9 48.15 10.35 44.55 9.45C42.496 8.937 41.028 7.446 39.403 5.797C36.756 3.11 33.692 0 27 0ZM13.5 16.2C6.3 16.2 1.8 19.8 0 27C2.7 23.4 5.85 22.05 9.45 22.95C11.504 23.464 12.972 24.954 14.597 26.603C17.244 29.29 20.308 32.4 27 32.4C34.2 32.4 38.7 28.8 40.5 21.6C37.8 25.2 34.65 26.55 31.05 25.65C28.996 25.137 27.528 23.646 25.903 21.997C23.256 19.31 20.192 16.2 13.5 16.2Z"
              fill="#38BDF8"
          />
        </svg>
    ),
    glow: "group-hover:shadow-[0_8px_30px_rgba(56,189,248,0.35)]",
    tag: "3.4",
  },
  {
    name: "Axios",
    description: "HTTP Client",
    icon: "/axios.svg",
    glow: "group-hover:shadow-[0_8px_30px_rgba(104,64,254,0.35)]",
    tag: "1.7",
  },
  {
    name: "FastAPI",
    description: "Backend",
    icon: "/fastapi.png",
    glow: "group-hover:shadow-[0_8px_30px_rgba(5,150,105,0.35)]",
    tag: "0.115",
  },
  {
    name: "Keycloak",
    description: "Auth & IAM",
    icon: "/keycloak.svg",
    glow: "group-hover:shadow-[0_8px_30px_rgba(220,38,38,0.3)]",
    tag: "25",
  },
];

// ─── Small reusable pieces ────────────────────────────────────────────────────

/** Animated entrance wrapper — staggered by `delay` ms */
function Reveal({
                  children,
                  delay = 0,
                  className = "",
                }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
      <div
          className={`transition-all duration-700 ease-out ${
              show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          } ${className}`}
      >
        {children}
      </div>
  );
}

/** Pulsing live indicator dot */
function LiveDot({ color = "bg-emerald-400" }: { color?: string }) {
  return (
      <span className="relative flex h-2.5 w-2.5">
      <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`}
      />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}

/** Section label / eyebrow text */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
      <p
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3"
          style={{ fontFamily: "'Geist Mono', monospace" }}
      >
        {children}
      </p>
  );
}

// ─── TechCard ─────────────────────────────────────────────────────────────────

function TechCard({ tech, index }: { tech: TechItem; index: number }) {
  return (
      <Reveal delay={300 + index * 70}>
        <div
            className={`
          group relative flex flex-col items-center text-center
          p-6 rounded-2xl border border-slate-100 bg-white
          transition-all duration-300 cursor-default
          hover:-translate-y-1.5 hover:border-slate-200
          ${tech.glow} hover:shadow-lg
        `}
        >
          {/* Version tag */}
          <span
              className="absolute top-3 right-3 text-[9px] font-mono font-semibold text-slate-400
                     bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-full"
              style={{ fontFamily: "'Geist Mono', monospace" }}
          >
          v{tech.tag}
        </span>

          {/* Icon */}
          <div
              className="w-16 h-16 mb-4 flex items-center justify-center rounded-2xl
                     bg-slate-50 group-hover:bg-white transition-colors duration-300
                     group-hover:scale-110 transform"
          >
            {typeof tech.icon === "string" ? (
                <img
                    src={tech.icon}
                    alt={tech.name}
                    className="w-10 h-10 object-contain"
                />
            ) : (
                <div className="w-10 h-10">{tech.icon}</div>
            )}
          </div>

          <h3
              className="font-semibold text-sm text-slate-800 mb-0.5 tracking-tight"
              style={{ fontFamily: "'Geist', sans-serif" }}
          >
            {tech.name}
          </h3>
          <p
              className="text-[11px] text-slate-400 font-medium"
              style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            {tech.description}
          </p>
        </div>
      </Reveal>
  );
}

// ─── Secure Data Panel ────────────────────────────────────────────────────────

function SecurePanel({
                       loading,
                       error,
                       data,
                       onRetry,
                     }: {
  loading: boolean;
  error: string | null;
  data: SecurePayload | null;
  onRetry: () => void;
}) {
  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          {/* Spinner */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
            <div className="absolute inset-0 rounded-full border-[3px] border-indigo-500 border-t-transparent animate-spin" />
          </div>
          <p
              className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-400 animate-pulse"
              style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            Authenticating request…
          </p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-8 text-center">
          <div
              className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center
                        justify-center mx-auto mb-4 text-lg font-bold"
          >
            !
          </div>
          <p
              className="font-semibold text-rose-800 mb-1 text-sm"
              style={{ fontFamily: "'Geist', sans-serif" }}
          >
            Connection failed
          </p>
          <p
              className="text-xs text-rose-600/80 max-w-sm mx-auto mb-5 leading-relaxed"
              style={{ fontFamily: "'Geist', sans-serif" }}
          >
            {error}
          </p>
          <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold
                     bg-white border border-rose-200 text-rose-700 rounded-xl
                     hover:bg-rose-50 transition-colors duration-200"
              style={{ fontFamily: "'Geist', sans-serif" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
    );
  }

  return (
      <div className="space-y-5">
        {/* Main response card */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-100">
          {/* Gradient top strip */}
          <div className="h-0.5 w-full bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400" />
          <div className="p-7 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p
                  className="text-[9px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-400 mb-2"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Decrypted response
              </p>
              <p
                  className="text-xl font-semibold text-slate-900 leading-snug"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic" }}
              >
                "{data?.message}"
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500 text-white text-[10px] font-mono font-bold uppercase tracking-widest px-4 py-2 rounded-full whitespace-nowrap self-start sm:self-auto shadow-sm shadow-emerald-200">
              <LiveDot color="bg-white" />
              Authorized
            </div>
          </div>
        </div>

        {/* Two detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Verification checks */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
            <p
                className="text-[9px] font-mono font-semibold uppercase tracking-[0.2em] text-slate-400 mb-5"
                style={{ fontFamily: "'Geist Mono', monospace" }}
            >
              Identity checks
            </p>
            <ul className="space-y-3.5">
              {[
                "JWT signature valid",
                "Realm verified",
                "Token not expired",
                "CSRF token matched",
              ].map((check) => (
                  <li
                      key={check}
                      className="flex items-center gap-3 text-sm font-medium text-slate-700"
                      style={{ fontFamily: "'Geist', sans-serif" }}
                  >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                    {check}
                  </li>
              ))}
            </ul>
          </div>

          {/* Session control */}
          <div className="rounded-2xl bg-slate-900 p-6 flex flex-col justify-between gap-6">
            <div>
              <p
                  className="text-[9px] font-mono font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Session info
              </p>
              <div className="space-y-2">
                {[
                  { label: "User", value: keycloak.tokenParsed?.preferred_username ?? "—" },
                  { label: "Realm", value: keycloak.realm ?? "—" },
                  { label: "Client", value: keycloak.clientId ?? "—" },
                ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                  <span
                      className="text-xs text-slate-500 font-mono"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                    {label}
                  </span>
                      <span
                          className="text-xs text-slate-300 font-mono truncate max-w-[140px] text-right"
                          style={{ fontFamily: "'Geist Mono', monospace" }}
                      >
                    {value}
                  </span>
                    </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button
                onClick={() => keycloak.logout()}
                className="group flex items-center justify-between w-full bg-white/5 hover:bg-white
                       text-white hover:text-slate-900 px-5 py-3.5 rounded-xl font-semibold
                       text-sm transition-all duration-250 border border-white/10 hover:border-white"
                style={{ fontFamily: "'Geist', sans-serif" }}
            >
              Sign out
              <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const WelcomePage: React.FC = () => {
  const api = useApi();
  const [secureData, setSecureData] = useState<SecurePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstName =
      keycloak.tokenParsed?.given_name ||
      keycloak.tokenParsed?.preferred_username ||
      "there";

  const fetchSecureData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get<SecurePayload>("/secure");
      setSecureData(data);
    } catch (err) {
      console.error("Secure fetch failed", err);
      setError(
          "Could not reach the secure endpoint. Make sure the FastAPI server is running and CORS is configured."
      );
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchSecureData();
  }, [fetchSecureData]);

  return (
      <div
          className="min-h-screen bg-[#fafafa] text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900"
          style={{ fontFamily: "'Geist', sans-serif" }}
      >
        {/* ── Ambient background ── */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-[100px]" />
          <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-violet-100/40 blur-[120px]" />
          <div className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] rounded-full bg-sky-100/30 blur-[100px]" />
          {/* Subtle dot grid */}
          <div
              className="absolute inset-0 opacity-[0.4]"
              style={{
                backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 lg:py-20">

          {/* ── Navbar ── */}
          <Reveal>
            <nav className="flex items-center justify-between mb-20">
              {/* Left — logo + name */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs">
                  ✦
                </div>
                <span
                    className="font-semibold text-[15px] text-slate-800 tracking-tight"
                    style={{ fontFamily: "'Geist', sans-serif" }}
                >
                Demo Portal
              </span>

                {/* Vite + React inline logos */}
                <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200">
                  <a href="https://vite.dev" target="_blank" rel="noreferrer" className="group">
                    <img
                        src="/vite.svg"
                        alt="Vite"
                        className="h-7 w-7 group-hover:drop-shadow-[0_0_8px_rgba(100,108,255,0.7)] transition-all duration-300"
                    />
                  </a>
                  <a href="https://react.dev" target="_blank" rel="noreferrer" className="group">
                    <img
                        src="/react.svg"
                        alt="React"
                        className="h-7 w-7 group-hover:drop-shadow-[0_0_8px_rgba(97,218,251,0.7)] transition-all duration-300 animate-[spin_22s_linear_infinite]"
                    />
                  </a>
                </div>
              </div>

              {/* Right — status */}
              <div className="flex items-center gap-3">
                <div
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full
                              border border-emerald-200 bg-emerald-50/80 text-emerald-700
                              text-[11px] font-semibold"
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  <LiveDot />
                  Keycloak
                </div>
              </div>
            </nav>
          </Reveal>

          {/* ── Hero ── */}
          <section className="mb-24">
            {/* Greeting */}
            <Reveal delay={160}>
              <h1
                  className="text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] mb-5"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                Welcome back,{" "}
                <span
                    className="italic text-transparent bg-clip-text bg-gradient-to-r
                             from-indigo-500 via-violet-500 to-fuchsia-500"
                >
                {firstName}.
              </span>
              </h1>
            </Reveal>

            <Reveal delay={260}>
              <p
                  className="text-[17px] text-slate-500 max-w-xl leading-[1.7] font-normal mb-8"
                  style={{ fontFamily: "'Geist', sans-serif" }}
              >
                Your authentication is verified and your session is live. This page
                confirms end-to-end connectivity between React, Keycloak, and FastAPI.
              </p>
            </Reveal>

            {/* Quick stats row */}
            <Reveal delay={340}>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { label: "Auth", value: "Keycloak JWT" },
                  { label: "API", value: "FastAPI / Python" },
                  { label: "Build", value: "Vite + TS" },
                ].map(({ label, value }) => (
                    <div
                        key={label}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl
                             border border-slate-100 shadow-sm text-sm"
                    >
                  <span
                      className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                    {label}
                  </span>
                      <span className="w-px h-3 bg-slate-200" />
                      <span
                          className="text-slate-700 font-medium text-xs"
                          style={{ fontFamily: "'Geist', sans-serif" }}
                      >
                    {value}
                  </span>
                    </div>
                ))}
              </div>
            </Reveal>
          </section>

          {/* ── Tech Stack ── */}
          <section className="mb-24">
            <Reveal delay={200}>
              <Eyebrow>Core Stack</Eyebrow>
              <h2
                  className="text-2xl font-semibold tracking-tight text-slate-900 mb-8"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                Built with intention.
              </h2>
            </Reveal>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {TECH_STACK.map((tech, i) => (
                  <TechCard key={tech.name} tech={tech} index={i} />
              ))}
            </div>
          </section>

          {/* ── Secure Data ── */}
          <section className="mb-24">
            <Reveal delay={200}>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <div>
                  <Eyebrow>Protected Endpoint</Eyebrow>
                  <h2
                      className="text-2xl font-semibold tracking-tight text-slate-900"
                      style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    Secure backend data.
                  </h2>
                </div>

                {/* Status badge */}
                <div
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px]
                              font-mono font-semibold border transition-all duration-500
                              ${
                        loading
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : error
                                ? "bg-rose-50 border-rose-200 text-rose-700"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}
                    style={{ fontFamily: "'Geist Mono', monospace" }}
                >
                  {loading ? (
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  ) : error ? (
                      <div className="w-2 h-2 rounded-full bg-rose-400" />
                  ) : (
                      <LiveDot color="bg-emerald-400" />
                  )}
                  {loading ? "Fetching…" : error ? "Error" : "200 OK"}
                </div>
              </div>
            </Reveal>

            {/* Panel */}
            <Reveal delay={280}>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Panel header bar */}
                <div
                    className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/70"
                >
                  {/* macOS dots */}
                  <div className="flex gap-1.5">
                    {["bg-rose-400", "bg-amber-400", "bg-emerald-400"].map((c, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />
                    ))}
                  </div>
                  <span
                      className="text-[10px] font-mono font-medium text-slate-400"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                  GET /secure
                </span>
                  <span
                      className="text-[10px] font-mono font-medium text-slate-400"
                      style={{ fontFamily: "'Geist Mono', monospace" }}
                  >
                  axios · bearer token
                </span>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                  <SecurePanel
                      loading={loading}
                      error={error}
                      data={secureData}
                      onRetry={fetchSecureData}
                  />
                </div>
              </div>
            </Reveal>
          </section>

          {/* ── Footer ── */}
          <Reveal delay={100}>
            <footer className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p
                  className="text-xs text-slate-400 font-medium"
                  style={{ fontFamily: "'Geist', sans-serif" }}
              >
                © {new Date().getFullYear()} Demo Portal
              </p>
              <p
                  className="text-[10px] font-mono text-slate-300"
                  style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                React + Vite + Keycloak + FastAPI
              </p>
            </footer>
          </Reveal>
        </div>
      </div>
  );
};

export default WelcomePage;