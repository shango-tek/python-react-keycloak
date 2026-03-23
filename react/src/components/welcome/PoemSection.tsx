import { useState } from "react";
import { useApi } from "../../context/ApiContext";
import {
  PoemLang,
  CASTERA_POEM,
  POEM_BUTTONS,
  LANG_LABEL,
  POEM_LANG_MAP,
} from "../../constants/poem";
import { Reveal, Eyebrow, Spinner } from "../ui";

export function PoemSection() {
  const api = useApi();
  const [activeLang, setActiveLang] = useState<PoemLang | null>(null);
  const [poemResult, setPoemResult] = useState<string>("");
  const [poemLoading, setPoemLoading] = useState(false);

  const handlePoemAction = async (lang: PoemLang) => {
    // Toggle off if already showing this lang
    if (activeLang === lang && poemResult) {
      setActiveLang(null);
      setPoemResult("");
      return;
    }

    setActiveLang(lang);
    setPoemResult("");
    setPoemLoading(true);

    try {
      if (lang === "explain") {
        const { data } = await api.post<{ explanation: string }>("/ollama/explain", {
          text: CASTERA_POEM,
        });
        setPoemResult(data.explanation);
      } else {
        const { data } = await api.post<{ translation: string }>("/ollama/translate", {
          text: CASTERA_POEM,
          target_language: POEM_LANG_MAP[lang],
        });
        setPoemResult(data.translation);
      }
    } catch {
      setPoemResult("Ollama is not available. Make sure the model is pulled.");
    } finally {
      setPoemLoading(false);
    }
  };

  return (
    <section className="mb-24">
      <Reveal delay={200}>
        <Eyebrow>Poésie · Haïtienne</Eyebrow>
        <h2
          className="text-3xl font-semibold tracking-tight text-slate-900 mb-8"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Certitude.
        </h2>
      </Reveal>

      <Reveal delay={300}>
        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-900/5">

          {/* Poem text */}
          <div className="bg-slate-900 px-10 py-12 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            <div className="absolute top-8 right-10 text-slate-700 text-8xl font-serif leading-none select-none">
              "
            </div>
            <div className="relative max-w-xl">
              {CASTERA_POEM.split("\n\n").map((stanza, si) => (
                <div key={si} className={si > 0 ? "mt-7" : ""}>
                  {stanza.split("\n").map((line, li) => (
                    <p
                      key={li}
                      className="text-slate-200 text-xl leading-[1.85] tracking-wide"
                      style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic" }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="w-8 h-px bg-emerald-500" />
              <div>
                <p className="text-emerald-400 font-semibold text-sm tracking-wider">
                  Georges Castera
                </p>
                <p className="text-slate-500 text-xs font-mono mt-0.5">
                  Poète haïtien · Port-au-Prince
                </p>
              </div>
            </div>
          </div>

          {/* Translation / analysis buttons */}
          <div className="bg-white border-t border-slate-100 px-8 py-5 flex flex-wrap gap-2 items-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mr-2">
              Ollama →
            </p>
            {POEM_BUTTONS.map(({ id, flag, label }) => (
              <button
                key={id}
                onClick={() => handlePoemAction(id)}
                disabled={poemLoading && activeLang !== id}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  activeLang === id && poemResult
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-200"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300"
                } disabled:opacity-40`}
              >
                {poemLoading && activeLang === id ? (
                  <>
                    <Spinner size="w-3 h-3" />
                    <span>…</span>
                  </>
                ) : (
                  <>
                    <span>{flag}</span>
                    <span>{label}</span>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Result panel */}
          {(poemLoading || poemResult) && (
            <div className="bg-slate-50 border-t border-slate-100 px-8 py-7">
              {poemLoading && !poemResult ? (
                <div className="flex items-center gap-3">
                  <Spinner />
                  <span className="text-slate-400 text-sm">
                    {activeLang === "explain" ? "Analysing…" : "Translating…"}
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-[9px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-400 mb-4">
                    {activeLang ? LANG_LABEL[activeLang] : ""}
                  </p>
                  <div
                    className={`text-slate-700 leading-[1.9] whitespace-pre-wrap ${
                      activeLang === "explain" ? "text-sm" : "text-base italic"
                    }`}
                    style={
                      activeLang !== "explain"
                        ? { fontFamily: "'Instrument Serif', Georgia, serif" }
                        : {}
                    }
                  >
                    {poemResult}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
