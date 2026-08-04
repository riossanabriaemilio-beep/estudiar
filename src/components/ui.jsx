// Primitivas de UI compartidas: botones, modal, confirmación, inputs, badges.
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinta focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-paper disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };
  const variants = {
    primary: "bg-tinta text-white hover:bg-tinta/90 shadow-soft",
    secondary: "bg-white text-ink border border-line hover:bg-paper",
    ghost: "text-ink hover:bg-tintaSoft",
    danger: "bg-white text-sinver border border-sinver/30 hover:bg-sinverSoft",
    dangerSolid: "bg-sinver text-white hover:bg-sinver/90 shadow-soft",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {Icon ? <Icon size={16} strokeWidth={2.25} /> : null}
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, label, className = "", ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={
        "inline-flex items-center justify-center rounded-lg p-2 text-muted transition-colors " +
        "hover:bg-tintaSoft hover:text-tinta focus-visible:outline-none focus-visible:ring-2 " +
        "focus-visible:ring-tinta focus-visible:ring-offset-1 disabled:opacity-40 " +
        className
      }
      {...props}
    >
      <Icon size={17} strokeWidth={2.25} />
    </button>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl2 bg-panel border border-line shadow-soft ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-paper text-muted border border-line",
    tinta: "bg-tintaSoft text-tinta",
    oro: "bg-oroSoft text-oro",
    ok: "bg-okSoft text-ok",
    repasar: "bg-repasarSoft text-repasar",
    sinver: "bg-sinverSoft text-sinver",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={
        "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinta " +
        className
      }
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={
        "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinta " +
        className
      }
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={
        "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinta " +
        className
      }
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Modal({ open, onClose, title, children, footer, width = "max-w-lg" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.15 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`w-full ${width} rounded-xl2 bg-panel shadow-soft border border-line max-h-[90vh] flex flex-col`}
            initial={{ opacity: 0, y: reduce ? 0 : 12, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 8, scale: reduce ? 1 : 0.98 }}
            transition={{ duration: reduce ? 0 : 0.16 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
              <IconButton icon={X} label="Cerrar" onClick={onClose} />
            </div>
            <div className="overflow-y-auto px-5 py-4">{children}</div>
            {footer ? (
              <div className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  description,
  confirmLabel = "Confirmar",
  danger = true,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={danger ? "dangerSolid" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">{description}</p>
    </Modal>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      {Icon ? <Icon size={28} className="text-muted" strokeWidth={1.75} /> : null}
      <div>
        <p className="font-display font-medium text-ink">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
