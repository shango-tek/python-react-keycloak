import React from "react";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
      {children}
    </p>
  );
}
