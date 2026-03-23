interface SpinnerProps {
  size?: string;
}

export function Spinner({ size = "w-5 h-5" }: SpinnerProps) {
  return (
    <div
      className={`${size} border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin`}
    />
  );
}
