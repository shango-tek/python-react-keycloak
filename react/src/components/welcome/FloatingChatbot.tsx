import { useEffect, useRef, useState } from "react";
import keycloak from "../../auth/keycloak";
import { useApi } from "../../context/ApiContext";
import { ChatMessage } from "../../types/chat";

const SUGGESTED_PROMPTS = [
  "What is Haitian Creole?",
  "Explain deep learning simply.",
  "Who was Jacques Roumain?",
  "Recommend a philosophy book.",
];

function TypingDots() {
  return (
    <div className="flex gap-[5px] items-center py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 animate-bounce"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

export function FloatingChatbot() {
  const api = useApi();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever a new message arrives
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading, open]);

  // Focus input and greet the user on first open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 320);
      if (history.length === 0) {
        const greetingName =
          (keycloak.tokenParsed?.given_name as string | undefined) ||
          (keycloak.tokenParsed?.preferred_username as string | undefined) ||
          "there";
        setHistory([
          {
            role: "assistant",
            content: `Hello, ${greetingName}! 👋 I'm Llama 3.2, running entirely on your local machine — no data leaves your computer.\n\nHow can I help you today?`,
          },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setHistory((h) => [...h, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post<{ response: string }>("/ollama/query", {
        prompt: trimmed,
      });
      setHistory((h) => [...h, { role: "assistant", content: data.response }]);
    } catch {
      setHistory((h) => [
        ...h,
        {
          role: "assistant",
          content:
            "⚠️ Ollama is unavailable right now. Make sure the model is pulled and the container is healthy.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const userInitial = (
    (keycloak.tokenParsed?.given_name as string | undefined) ||
    (keycloak.tokenParsed?.preferred_username as string | undefined) ||
    "U"
  )
    .charAt(0)
    .toUpperCase();

  return (
    <>
      {/* ── Toggle button ─────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400/30 pointer-events-none" />
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close chat" : "Open AI chat"}
          style={{
            boxShadow: open
              ? "0 4px 20px rgba(0,0,0,0.35)"
              : "0 0 0 3px rgba(139,92,246,0.25), 0 8px 32px rgba(99,102,241,0.5)",
          }}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
            open
              ? "bg-slate-800 rotate-90 scale-95"
              : "bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 hover:scale-110 hover:rotate-12"
          }`}
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* ── Chat panel ────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] flex flex-col overflow-hidden rounded-3xl transition-all duration-300 origin-bottom-right ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"
        }`}
        style={{
          height: "520px",
          background: "linear-gradient(145deg, #0f0f1a 0%, #13131f 60%, #0d0d18 100%)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
              }}
            >
              🦙
            </div>
            <div>
              <p className="text-white text-[13px] font-semibold leading-tight">Llama 3.2</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400 text-[10px] font-mono">local · private</span>
              </div>
            </div>
          </div>
          {history.length > 1 && (
            <button
              onClick={() => setHistory([])}
              className="text-[10px] font-mono uppercase tracking-widest text-slate-600 hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
            >
              clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.07) transparent" }}
        >
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.15)",
                }}
              >
                🦙
              </div>
              <p className="text-slate-300 text-sm font-semibold mb-1">How can I help?</p>
              <p className="text-slate-600 text-[11px] font-mono uppercase tracking-widest mb-6">
                powered by ollama · runs locally
              </p>
              <div className="w-full grid grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left px-3 py-2.5 rounded-xl text-[11px] text-slate-400 leading-snug transition-all hover:text-slate-200"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.06)";
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            history.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                {msg.role === "assistant" ? (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                  >
                    🦙
                  </div>
                ) : (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5 ring-1 ring-white/10"
                    style={{
                      background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                      boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
                    }}
                  >
                    {userInitial}
                  </div>
                )}
                {/* Bubble */}
                <div
                  className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                  }`}
                  style={
                    msg.role === "user"
                      ? {
                          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                          color: "#fff",
                          boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                        }
                      : {
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          color: "#cbd5e1",
                        }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5 flex-row">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                🦙
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-tl-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex-shrink-0 p-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(139,92,246,0.5)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)";
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask Llama anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-slate-200 outline-none disabled:opacity-40 placeholder-slate-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background:
                  input.trim() && !loading
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "rgba(255,255,255,0.08)",
                boxShadow:
                  input.trim() && !loading ? "0 4px 12px rgba(99,102,241,0.4)" : "none",
              }}
            >
              <svg className="w-4 h-4 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <p className="text-center text-[9px] font-mono text-slate-700 mt-2 tracking-widest uppercase">
            responses generated locally · not sent to the cloud
          </p>
        </form>
      </div>
    </>
  );
}
