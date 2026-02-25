export function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
  const variants = {
    primary:
      "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500 focus:ring-offset-slate-50",
    subtle:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 focus:ring-offset-slate-50",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 focus:ring-offset-slate-50",
  };

  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

