import { Reveal } from "../ui";

interface HeroProps {
  firstName: string;
}

export function Hero({ firstName }: HeroProps) {
  return (
    <section className="mb-24">
      <Reveal delay={160}>
        <h1
          className="text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[1.08] tracking-[-0.03em] mb-5"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Welcome back,{" "}
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 pr-2">
            {firstName}.
          </span>
        </h1>
      </Reveal>
      <Reveal delay={260}>
        <p className="text-[17px] text-slate-500 max-w-xl leading-[1.7]">
          Your session is authenticated. Browse the library, explore Haitian
          poetry with AI-powered translations, or chat with the local LLM.
        </p>
      </Reveal>
    </section>
  );
}
