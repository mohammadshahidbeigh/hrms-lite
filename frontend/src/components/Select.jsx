export function Select({ label, error, className = "", children, ...props }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select
        className={`rounded-md border px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
          error ? "border-rose-500" : "border-slate-300"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  );
}

