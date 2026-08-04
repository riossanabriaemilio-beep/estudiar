import { Loader2 } from "lucide-react";

export function Btn({ children, onClick, variant = "primary", size = "md", disabled, className = "", type = "button" }) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tinta/40 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "text-sm px-3 py-1.5", md: "text-sm px-4 py-2.5", lg: "text-base px-5 py-3" };
  const variants = {
    primary: "bg-tinta text-white hover:bg-tinta/90 shadow-soft",
    oro: "bg-oro text-white hover:bg-oro/90 shadow-soft",
    ghost: "bg-transparent text-ink hover:bg-line/60",
    outline: "border border-line bg-panel text-ink hover:bg-line/40",
    danger: "bg-flojoSoft text-flojo hover:bg-flojo/15",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`bg-panel border border-line rounded-2xl shadow-soft ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "muted" }) {
  const tones = {
    muted: "bg-line/60 text-muted",
    tinta: "bg-tintaSoft text-tinta",
    oro: "bg-oroSoft text-oro",
    ok: "bg-okSoft text-ok",
    flojo: "bg-flojoSoft text-flojo",
  };
  return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${tones[tone]}`}>{children}</span>;
}

export function Spinner({ label }) {
  return (
    <div className="flex items-center gap-2 text-muted text-sm">
      <Loader2 size={16} className="animate-spin" /> {label || "Pensando…"}
    </div>
  );
}

export function Empty({ icon: Icon, title, hint, action }) {
  return (
    <div className="text-center py-14 px-6">
      {Icon && (
        <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-tintaSoft flex items-center justify-center text-tinta">
          <Icon size={22} />
        </div>
      )}
      <h3 className="font-display font-semibold text-ink">{title}</h3>
      {hint && <p className="text-muted text-sm mt-1 max-w-sm mx-auto">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
