import keycloak from "../../auth/keycloak";
import { Reveal, LiveDot } from "../ui";

export function Navbar() {
  return (
    <Reveal>
      <nav className="flex items-center justify-between mb-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm shadow-lg shadow-indigo-200">
            ✦
          </div>
          <span className="font-semibold text-[16px] text-slate-800 tracking-tight">
            Demo Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 text-emerald-700 text-[11px] font-semibold tracking-wide shadow-sm">
            <LiveDot />
            {keycloak.tokenParsed?.preferred_username ?? "Session active"}
          </div>
          <button
            onClick={() => keycloak.logout()}
            className="px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-500 text-[11px] font-semibold hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all"
          >
            Sign out
          </button>
        </div>
      </nav>
    </Reveal>
  );
}
