import { Book } from "../../../types/book";
import { getCategoryColor, getSpineGradient } from "../../../constants/categories";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="group relative flex h-52 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-indigo-100/60 transition-all duration-300 hover:-translate-y-1.5 cursor-default">

      {/* Coloured spine on the left */}
      <div
        className={`w-10 flex-shrink-0 bg-gradient-to-b ${getSpineGradient(book.category)} flex items-center justify-center relative`}
      >
        <p
          className="text-white text-[9px] font-bold uppercase tracking-[0.18em] whitespace-nowrap select-none"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {book.author.split(",")[0]}
        </p>
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
      </div>

      {/* Book body */}
      <div className="flex flex-col flex-1 bg-white border border-slate-100 border-l-0 rounded-r-2xl p-5 overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <span
            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${getCategoryColor(book.category)}`}
          >
            {book.category}
          </span>
          <span className="text-slate-400 font-semibold text-xs font-mono">
            ${book.price.toFixed(2)}
          </span>
        </div>

        <h5 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
          {book.title}
        </h5>
        <p className="text-[11px] text-slate-400 font-medium mb-2 truncate">
          {book.author} · {book.year}
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 flex-1">
          {book.description}
        </p>

        {book.isbn && (
          <p className="mt-2 text-[9px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            ISBN {book.isbn}
          </p>
        )}
      </div>
    </div>
  );
}
