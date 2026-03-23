export const PAGE_SIZE = 6;

export const BOOK_CATEGORIES = [
  "IT",
  "AI",
  "Philosophy",
  "Literature",
  "Haitian Literature",
  "Science Fiction",
  "Classic Fiction",
  "History",
  "Strategy",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "IT":                 "bg-sky-100    text-sky-700",
  "AI":                 "bg-violet-100 text-violet-700",
  "Philosophy":         "bg-amber-100  text-amber-700",
  "Literature":         "bg-rose-100   text-rose-700",
  "Haitian Literature": "bg-emerald-100 text-emerald-700",
  "Science Fiction":    "bg-indigo-100 text-indigo-700",
  "Classic Fiction":    "bg-pink-100   text-pink-700",
  "History":            "bg-orange-100 text-orange-700",
  "Strategy":           "bg-teal-100   text-teal-700",
};

export const CATEGORY_ACTIVE_COLORS: Record<string, string> = {
  "IT":                 "bg-sky-500    border-sky-500    text-white",
  "AI":                 "bg-violet-500 border-violet-500 text-white",
  "Philosophy":         "bg-amber-500  border-amber-500  text-white",
  "Literature":         "bg-rose-500   border-rose-500   text-white",
  "Haitian Literature": "bg-emerald-500 border-emerald-500 text-white",
  "Science Fiction":    "bg-indigo-500 border-indigo-500 text-white",
  "Classic Fiction":    "bg-pink-500   border-pink-500   text-white",
  "History":            "bg-orange-500 border-orange-500 text-white",
  "Strategy":           "bg-teal-500   border-teal-500   text-white",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "bg-slate-100 text-slate-600";
}

/** Returns a Tailwind gradient class pair for the book spine. */
export function getSpineGradient(category: string): string {
  const map: Record<string, string> = {
    "IT":                 "from-sky-400 to-blue-600",
    "AI":                 "from-violet-400 to-purple-700",
    "Philosophy":         "from-amber-400 to-orange-600",
    "Literature":         "from-rose-400 to-pink-600",
    "Haitian Literature": "from-emerald-400 to-teal-600",
    "Science Fiction":    "from-indigo-400 to-blue-700",
    "Classic Fiction":    "from-pink-400 to-fuchsia-600",
    "History":            "from-orange-400 to-red-600",
    "Strategy":           "from-teal-400 to-cyan-600",
  };
  return map[category] ?? "from-slate-400 to-slate-600";
}
