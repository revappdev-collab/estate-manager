import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Field, inputClass } from "@/components/kit";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  showBack = true,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  showBack?: boolean;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return (
    <div className="relative min-h-dvh bg-background px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      {showBack && (
        <button
          type="button"
          aria-label="Go back"
          onClick={() => (canGoBack ? router.history.back() : router.navigate({ to: "/" }))}
          className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
      )}

      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
      {footer}
    </div>
  );
}

export function AuthInput({
  icon,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      )}
      <input {...props} className={cn(inputClass, icon && "pl-10", className)} />
    </div>
  );
}

export function PasswordField({
  label,
  error,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; error?: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} error={error}>
      <div className="relative">
        <AuthInput
          {...props}
          type={show ? "text" : "password"}
          icon={<Lock size={16} strokeWidth={2} />}
          className="pr-11"
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground"
        >
          {show ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
        </button>
      </div>
    </Field>
  );
}

export function SocialAuth({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or continue with
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <GoogleMark />
          Google
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <AppleMark />
          Apple
        </button>
      </div>
    </>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.97 10.97 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.59 6.59 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 17" fill="currentColor" aria-hidden>
      <path d="M11.46 8.84c.02 2.2 1.93 2.93 1.95 2.94-.02.05-.3 1.05-1 2.06-.6.87-1.23 1.73-2.21 1.75-.96.02-1.27-.57-2.37-.57-1.1 0-1.44.55-2.35.59-.94.04-1.66-.94-2.27-1.8C1.92 12.02.7 8.9 2.02 6.78c.65-1.05 1.82-1.72 3.09-1.74.96-.02 1.87.65 2.37.65.5 0 1.61-.8 2.72-.68.46.02 1.76.19 2.59 1.41-.07.04-1.55.9-1.33 2.42ZM9.7 2.7c.52-.63.87-1.5.77-2.37-.75.03-1.65.5-2.19 1.13-.48.55-.9 1.44-.79 2.28.83.06 1.69-.42 2.21-1.04Z" />
    </svg>
  );
}
