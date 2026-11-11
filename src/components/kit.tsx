import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Screen({
  children,
  className,
  dark,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-h-dvh",
        dark ? "bg-ink text-white" : "bg-background text-foreground",
        padded && "px-4 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Header({
  title,
  subtitle,
  back = true,
  right,
  dark,
  fallbackTo = "/",
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  dark?: boolean;
  fallbackTo?: string;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <header
      className={cn(
        "sticky top-0 z-30 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3",
        dark ? "bg-ink text-white" : "bg-background text-foreground",
      )}
    >
      <div className="flex items-center gap-3">
        {back && (
          <button
            aria-label="Go back"
            onClick={() => (canGoBack ? router.history.back() : router.navigate({ to: fallbackTo as "/" }))}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border transition-colors",
              dark
                ? "border-white/25 text-white hover:bg-white/10"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className={cn("truncate text-xs", dark ? "text-white/70" : "text-muted-foreground")}>{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function Button({
  children,
  variant = "primary",
  full,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "dark" | "danger" | "ghost" | "light";
  full?: boolean;
}) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-dark",
    outline: "border border-border bg-card text-foreground hover:bg-muted",
    light: "border border-white/40 bg-transparent text-white hover:bg-white/10",
    dark: "bg-ink text-white hover:bg-primary-dark",
    danger: "bg-danger text-white hover:opacity-90",
    ghost: "text-primary hover:bg-primary/10",
  }[variant];
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold tracking-tight transition-colors disabled:opacity-50",
        styles,
        full && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  params,
  children,
  variant = "primary",
  full,
  className,
}: {
  to: string;
  params?: Record<string, string>;
  children: ReactNode;
  variant?: "primary" | "outline" | "dark" | "danger" | "light";
  full?: boolean;
  className?: string;
}) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-dark",
    outline: "border border-border bg-card text-foreground hover:bg-muted",
    light: "border border-white/40 text-white hover:bg-white/10",
    dark: "bg-ink text-white hover:bg-primary-dark",
    danger: "bg-danger text-white hover:opacity-90",
  }[variant];
  return (
    <Link
      to={to as "/"}
      params={params}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-semibold tracking-tight transition-colors",
        styles,
        full && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        onClick && "cursor-pointer transition-colors hover:border-foreground/20",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-end justify-between first:mt-0">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{children}</h2>
      {action}
    </div>
  );
}

const chipTone: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  neutral: "bg-ink text-white",
  muted: "border border-border bg-muted text-muted-foreground",
};

export function Chip({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof chipTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
        chipTone[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof chipTone {
  if (["Completed", "Paid", "Approved", "Active", "Confirmed"].includes(status)) return "success";
  if (["Pending", "Submitted", "ExpiringSoon", "Unpaid", "Soon"].includes(status)) return "warning";
  if (["Overdue", "Cancelled", "Rejected", "Expired", "Emergency"].includes(status)) return "danger";
  return "primary";
}

export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-danger">{error}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputClass, "min-h-28", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputClass, props.className)} />;
}

export function Row({
  icon,
  label,
  value,
  to,
  params,
  onClick,
}: {
  icon?: ReactNode;
  label: string;
  value?: ReactNode;
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
}) {
  const inner = (
    <>
      {icon && <span className="text-primary">{icon}</span>}
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      <ChevronRight size={16} className="text-muted-foreground" />
    </>
  );
  const cls =
    "flex w-full items-center gap-3 border-b border-border bg-card px-4 py-4 text-left transition-colors hover:bg-muted";
  return to ? (
    <Link to={to as "/"} params={params} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {steps.map((s, i) => (
        <div key={s} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                i <= current ? "bg-primary text-primary-foreground" : "border border-border bg-muted text-muted-foreground",
              )}
            >
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("w-px flex-1", i < current ? "bg-primary" : "bg-border")} />
            )}
          </div>
          <div className={cn("pb-5 text-sm", i <= current ? "font-semibold text-foreground" : "text-muted-foreground")}>
            {s}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-t-2xl border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
          <button aria-label="Close" onClick={onClose} className="p-1 text-muted-foreground">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
      <span className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            style={{ width: size, height: size }}
            className={cn("mr-0.5 inline-block rounded-sm", i < Math.round(rating) ? "bg-primary" : "bg-border")}
          />
        ))}
      </span>
      {rating.toFixed(1)}
    </span>
  );
}
