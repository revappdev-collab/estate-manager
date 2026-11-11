import { useRouter } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState, useCallback, type ButtonHTMLAttributes, type ReactNode } from "react";
import logo from "@/img/logo.png";
import { useOverlay } from "@/components/AppShell";
import { fullName } from "@/lib/format";
import { haptic } from "@/lib/haptic";
import { media, mediaSet } from "@/lib/media";
import { useApp } from "@/lib/store";
import type { Priority, TaskStatus } from "@/mock/types";
import { asset, cn } from "@/lib/utils";

export function useGo() {
  const router = useRouter();
  return useCallback(
    (path: string) => {
      router.history.push(path);
    },
    [router],
  );
}

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <img
      src={logo}
      alt="Estate Manager"
      className={cn("h-10 w-auto object-contain", inverted && "brightness-0 invert", className)}
    />
  );
}

type ButtonTone = "primary" | "secondary" | "tertiary" | "destructive";

export function Button({
  tone = "primary",
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] px-4 text-[17px] font-semibold motion disabled:opacity-45",
        tone === "primary" && "bg-navy text-white dark:bg-gold dark:text-navy",
        tone === "secondary" && "border border-line bg-surface text-ink",
        tone === "tertiary" && "bg-transparent text-gold-text",
        tone === "destructive" && "bg-danger text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...props}
      aria-label={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full text-ink motion",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  helper,
  error,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  helper?: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [focus, setFocus] = useState(false);
  const lifted = focus || value.length > 0;
  return (
    <label className="block">
      <span className="relative block">
        <span
          className={cn(
            "pointer-events-none absolute left-3.5 transition-all",
            lifted ? "top-1.5 text-[12px] text-soft" : "top-3.5 text-[17px] text-soft",
          )}
        >
          {label}
        </span>
        <input
          aria-label={label}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          type={type}
          value={value}
          placeholder={lifted ? placeholder : ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className={cn(
            "h-14 w-full rounded-[14px] border bg-surface px-3.5 pt-4 text-[17px] outline-none",
            error ? "border-danger" : "border-line",
          )}
        />
      </span>
      {(error || helper) && (
        <span className={cn("mt-1 block px-1 text-[13px]", error ? "text-danger" : "text-soft")}>{error || helper}</span>
      )}
    </label>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-[12px] bg-fill px-3 text-[17px] outline-none placeholder:text-soft"
      />
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex rounded-[12px] bg-fill p-1">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={selected}
            onClick={() => {
              haptic("light");
              onChange(opt.value);
            }}
            className={cn(
              "min-h-9 flex-1 rounded-[10px] px-2 text-[13px] font-semibold",
              selected ? "bg-surface text-ink shadow-sm" : "text-soft",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const STATUS_META: Record<TaskStatus, { label: string; className: string; icon?: "eye" | "check" }> = {
  new: { label: "New", className: "bg-info/15 text-info" },
  acknowledged: { label: "Acknowledged", className: "border border-ink/30 bg-transparent text-ink", icon: "eye" },
  in_progress: { label: "In Progress", className: "bg-gold-soft text-gold-text" },
  blocked: { label: "Blocked", className: "bg-warning/15 text-warning" },
  completed: { label: "Completed", className: "bg-success/15 text-success", icon: "check" },
  closed: { label: "Closed", className: "bg-fill text-soft" },
  overdue: { label: "Overdue", className: "bg-danger/15 text-danger" },
};

export function StatusChip({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-semibold", meta.className)}>
      {meta.icon === "eye" && <Eye size={13} aria-hidden />}
      {meta.icon === "check" && <Check size={13} aria-hidden />}
      {meta.label}
    </span>
  );
}

const PRIORITY_META: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-fill text-soft" },
  medium: { label: "Medium", className: "bg-info/15 text-info" },
  high: { label: "High", className: "bg-warning/15 text-warning" },
  urgent: { label: "Urgent", className: "bg-danger/15 text-danger" },
};

export function PriorityChip({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[13px] font-semibold", meta.className)}>{meta.label}</span>;
}

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full px-3 text-[15px] font-medium",
        active ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-fill text-ink",
      )}
    >
      {children}
    </Comp>
  );
}

export function Avatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  const [ok, setOk] = useState(true);
  const letters = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  if (!src || !ok) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-navy text-[13px] font-semibold text-gold"
      >
        {letters}
      </span>
    );
  }
  return (
    <img
      src={media(src)}
      alt=""
      width={size}
      height={size}
      onError={() => setOk(false)}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export function AvatarStack({ people }: { people: { name: string; src?: string }[] }) {
  return (
    <span className="flex -space-x-2">
      {people.slice(0, 4).map((p) => (
        <span key={p.name} className="rounded-full ring-2 ring-surface">
          <Avatar name={p.name} src={p.src} size={28} />
        </span>
      ))}
    </span>
  );
}

export function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[12px] font-semibold tabular text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Photo({
  name,
  alt,
  className,
}: {
  name?: string;
  alt: string;
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  const src = name && !name.startsWith("data:") && !name.startsWith("blob:") && !name.startsWith("/") ? media(name) : name;
  if (!src || !ok) {
    return <div role="img" aria-label={alt} className={cn("bg-navy-700", className)} />;
  }
  return (
    <img
      src={src}
      srcSet={name && !name.startsWith("data:") ? mediaSet(name) : undefined}
      alt={alt}
      loading="lazy"
      onError={() => setOk(false)}
      className={cn("bg-navy-700 object-cover", className)}
    />
  );
}

export function Hero({
  name,
  alt,
  className,
  children,
}: {
  name: string;
  alt: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[16px]", className)}>
      <Photo name={name} alt={alt} className="h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E1B2B] via-[#0E1B2B]/35 to-transparent" />
      {children && <div className="absolute inset-x-0 bottom-0 p-4 text-white">{children}</div>}
    </div>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-end justify-between gap-3">
        <h2 className="text-[22px] font-semibold leading-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Group({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-[16px] bg-surface">{children}</div>;
}

export function Row({
  title,
  subtitle,
  leading,
  trailing,
  onClick,
  label,
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  label?: string;
}) {
  const inner = (
    <>
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px]">{title}</span>
        {subtitle && <span className="mt-0.5 block truncate text-[15px] text-soft">{subtitle}</span>}
      </span>
      {trailing}
      {onClick && <ChevronRight size={18} className="shrink-0 text-soft" aria-hidden />}
    </>
  );
  if (!onClick) {
    return <div className="flex min-h-14 items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">{inner}</div>;
  }
  return (
    <button
      aria-label={label ?? title}
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-b-0"
    >
      {inner}
    </button>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-fill" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Timeline({
  items,
}: {
  items: { title: string; detail?: string; at?: string; tone?: "done" | "now" | "wait" }[];
}) {
  return (
    <ol>
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`} className="flex gap-3">
          <span className="flex flex-col items-center">
            <span
              className={cn(
                "mt-1.5 h-3 w-3 rounded-full",
                item.tone === "wait" ? "border-2 border-line bg-surface" : item.tone === "now" ? "bg-gold" : "bg-success",
              )}
            />
            {i < items.length - 1 && <span className="w-px flex-1 bg-line" />}
          </span>
          <span className="pb-4">
            <span className="block text-[17px]">{item.title}</span>
            {item.detail && <span className="mt-0.5 block text-[15px] text-soft">{item.detail}</span>}
            {item.at && <span className="mt-0.5 block text-[13px] text-soft tabular">{item.at}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function EmptyState({
  image,
  title,
  body,
  action,
}: {
  image: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  const go = useGo();
  return (
    <div className="px-2 py-8 text-center">
      <Photo name={image} alt="" className="mx-auto h-36 w-36 rounded-[16px] object-cover" />
      <h2 className="mt-4 text-[22px] font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-[280px] text-[15px] text-soft">{body}</p>
      <div className="mx-auto mt-4 max-w-[240px] space-y-2">
        {action}
        {!action && (
          <Button tone="secondary" onClick={() => go("/app")}>
            Back to home
          </Button>
        )}
      </div>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const go = useGo();
  return (
    <div className="px-2 py-10 text-center">
      <h2 className="text-[22px] font-semibold">Couldn’t load this</h2>
      <p className="mx-auto mt-1 max-w-[280px] text-[15px] text-soft">The house network didn’t answer. Your records are still here.</p>
      <div className="mx-auto mt-4 max-w-[240px] space-y-2">
        <Button onClick={onRetry}>Try again</Button>
        <Button tone="secondary" onClick={() => go("/app")}>
          Back to home
        </Button>
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton h-20 rounded-[16px]" />
      ))}
    </div>
  );
}

export function usePhase() {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setPhase("ready"), reduceMotion ? 0 : 520);
    return () => window.clearTimeout(t);
  }, []);
  return {
    phase,
    retry: () => {
      setPhase("loading");
      window.setTimeout(() => setPhase(navigator.onLine ? "ready" : "error"), 400);
    },
    fail: () => setPhase("error"),
  };
}

export function Banner({ tone = "info", children }: { tone?: "info" | "warning" | "success"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[14px] px-4 py-3 text-[15px]",
        tone === "info" && "bg-info/10 text-ink",
        tone === "warning" && "bg-warning/15 text-ink",
        tone === "success" && "bg-success/15 text-ink",
      )}
    >
      {children}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-8 w-[52px] shrink-0 rounded-full transition-colors", checked ? "bg-success" : "bg-fill")}
    >
      <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform", checked ? "left-6" : "left-1")} />
    </button>
  );
}

export function Page({
  title,
  subtitle,
  large,
  back,
  trailing,
  onBack,
  children,
}: {
  title?: ReactNode;
  subtitle?: string;
  large?: boolean;
  back?: boolean;
  trailing?: ReactNode;
  onBack?: () => void;
  children: ReactNode;
}) {
  const router = useRouter();
  const go = useGo();
  const { user } = useApp();
  const leave = () => {
    if (onBack) {
      onBack();
      return;
    }
    const state = window.history.state as { idx?: number; __TSR_index?: number } | null;
    const idx = state?.__TSR_index ?? state?.idx;
    if (typeof idx === "number" ? idx > 0 : window.history.length > 1) router.history.back();
    else go("/app");
  };
  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/92 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        {back ? (
          <div className="relative flex h-11 items-center">
            <button onClick={leave} className="relative z-10 flex h-11 items-center gap-0.5 pl-1 pr-3 text-[17px] text-gold-text">
              <ChevronLeft size={28} strokeWidth={2.25} />
              Back
            </button>
            {title && <h1 className="pointer-events-none absolute inset-x-20 truncate text-center text-[17px] font-semibold">{title}</h1>}
            <div className="ml-auto flex h-11 min-w-11 items-center justify-end pr-3">{trailing}</div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-2.5">
            <img src={asset("/apple-touch-icon.png")} alt="" className="h-11 w-11 rounded-[14px] object-cover ring-1 ring-line" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-gold-text uppercase">Hawthorne</p>
              {title && <h1 className="truncate text-[22px] font-semibold leading-tight">{title}</h1>}
              {subtitle && <p className="truncate text-[14px] text-soft">{subtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {trailing}
              {user && (
                <button aria-label="Profile" onClick={() => go("/app/profile")} className="rounded-full">
                  <Avatar name={fullName(user)} src={user.avatar} size={40} />
                </button>
              )}
            </div>
          </div>
        )}
        {back && subtitle && <p className="-mt-1 px-4 pb-2 text-center text-[13px] text-soft">{subtitle}</p>}
      </header>
      <div className={cn("px-4", !back && "pt-4", back && subtitle && "pt-3", back && !subtitle && "pt-4")}>{children}</div>
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  tall,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  tall?: boolean;
}) {
  const overlay = useOverlay();
  if (!open || !overlay) return null;
  return createPortal(
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button aria-label="Dismiss" className="absolute inset-0 bg-navy/45" onClick={onClose} />
      <div className={cn("relative rounded-t-[20px] bg-surface px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3", tall ? "max-h-[88%] overflow-y-auto" : "max-h-[62%] overflow-y-auto")}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    overlay,
  );
}

export function ActionSheet({
  open,
  onClose,
  title,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  actions: { label: string; destructive?: boolean; onClick: () => void }[];
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="space-y-2">
        {actions.map((a) => (
          <Button
            key={a.label}
            tone={a.destructive ? "destructive" : "secondary"}
            onClick={() => {
              if (a.destructive) haptic("warning");
              a.onClick();
              onClose();
            }}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </Sheet>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  const overlay = useOverlay();
  if (!overlay || toasts.length === 0) return null;
  return createPortal(
    <div className="pointer-events-none absolute inset-x-4 top-[max(12px,env(safe-area-inset-top))] z-[60] space-y-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className="pointer-events-auto w-full rounded-[14px] bg-navy px-4 py-3 text-left text-white shadow-lg"
        >
          <span className="block text-[15px] font-semibold">{t.title}</span>
          {t.body && <span className="mt-0.5 block text-[13px] text-white/80">{t.body}</span>}
        </button>
      ))}
    </div>,
    overlay,
  );
}

export function ShareSheet({
  open,
  onClose,
  summary,
}: {
  open: boolean;
  onClose: () => void;
  summary: string;
}) {
  const { pushToast } = useApp();
  const share = async (label: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Estate Manager", text: summary });
      } catch {
        /* dismissed */
      }
    } else {
      await navigator.clipboard?.writeText(summary);
      pushToast(label, "Copied for this preview.");
    }
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title="Share">
      <div className="space-y-2">
        {["Messages", "Mail", "Copy", "Save to Files"].map((label) => (
          <Button key={label} tone="secondary" onClick={() => void share(label)}>
            {label}
          </Button>
        ))}
      </div>
    </Sheet>
  );
}

export function SwipeRow({
  children,
  label,
  onAction,
}: {
  children: ReactNode;
  label: string;
  onAction: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative mb-3 overflow-hidden rounded-[16px]">
      <button className="absolute inset-y-0 right-0 w-28 bg-navy text-[13px] font-semibold text-white" onClick={onAction}>
        {label}
      </button>
      <div
        className="relative motion"
        style={{ transform: open ? "translateX(-7rem)" : "translateX(0)" }}
        onTouchStart={(e) => {
          e.currentTarget.dataset.x = String(e.touches[0]?.clientX ?? 0);
        }}
        onTouchEnd={(e) => {
          const start = Number(e.currentTarget.dataset.x ?? 0);
          const dx = (e.changedTouches[0]?.clientX ?? start) - start;
          if (dx < -48) setOpen(true);
          if (dx > 48) setOpen(false);
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Locked({ title = "Not shared with your account" }: { title?: string }) {
  const go = useGo();
  return (
    <div className="rounded-[16px] bg-surface px-4 py-8 text-center">
      <p className="text-[17px] font-semibold">{title}</p>
      <p className="mt-1 text-[15px] text-soft">Ask James Carter if you need this record.</p>
      <div className="mx-auto mt-4 max-w-[220px]">
        <Button tone="secondary" onClick={() => go("/app")}>
          Back to home
        </Button>
      </div>
    </div>
  );
}
