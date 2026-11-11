import { Eye, EyeOff, Fingerprint } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Field, Hero, IconButton, Logo, Sheet, useGo } from "@/components/ios/ui";
import { haptic } from "@/lib/haptic";
import { media } from "@/lib/media";
import { DEMO_MFA, DEMO_PASSWORD, INVITES } from "@/mock/data";
import { roleLabel, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const SLIDES = [
  { image: "onboard-1", title: "Every estate, one place", body: "Manage multiple estates and properties with role-based access." },
  { image: "onboard-2", title: "Tasks that get done", body: "Assign teams, track individual progress, and see who has acknowledged." },
  { image: "onboard-3", title: "Report with a photo", body: "Snap an issue, tag the right person, follow it to completion." },
  { image: "onboard-4", title: "Private & secure", body: "Role, property and record-level permissions with a full audit trail." },
];

export function SplashScreen() {
  const { user, session, hydrated } = useApp();
  const go = useGo();
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    setMotion(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const delay = motion ? 2400 : 700;
    const t = window.setTimeout(() => {
      if (user && session.propertyChosen) go("/app");
      else if (user) go("/select-property");
      else if (session.onboarded) go("/welcome");
      else go("/onboarding");
    }, delay);
    return () => window.clearTimeout(t);
  }, [hydrated, user, session.propertyChosen, session.onboarded, motion, go]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-navy px-8">
      {motion && (
        <span aria-hidden className="em-logo-glow pointer-events-none absolute h-56 w-56 rounded-full bg-gold/25 blur-3xl" />
      )}
      <div className={cn("relative", motion && "em-splash")}>
        <div className="relative overflow-hidden rounded-[28px] bg-[#F7F5F0] px-7 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <Logo className="h-32" />
          <span className={cn("mt-3 block h-0.5 w-16 bg-gold", motion && "em-logo-line")} />
          {motion && (
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="em-logo-sweep absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            </span>
          )}
        </div>
      </div>
      <p className={cn("mt-7 text-[15px] tracking-[0.18em] text-gold uppercase", motion && "em-rise")}>Hawthorne Estate</p>
    </div>
  );
}

export function OnboardingScreen() {
  const go = useGo();
  const { markOnboarded } = useApp();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;
  const finish = () => {
    markOnboarded();
    go("/welcome");
  };
  const goTo = (next: number) => {
    haptic("light");
    if (next >= SLIDES.length) finish();
    else if (next >= 0) setIndex(next);
  };
  return (
    <div
      className="relative h-full overflow-hidden bg-navy text-white"
      onTouchStart={(e) => {
        e.currentTarget.dataset.x = String(e.touches[0]?.clientX ?? 0);
      }}
      onTouchEnd={(e) => {
        const start = Number(e.currentTarget.dataset.x ?? 0);
        const dx = (e.changedTouches[0]?.clientX ?? start) - start;
        if (dx < -48) goTo(index + 1);
        if (dx > 48) goTo(index - 1);
      }}
    >
      <img
        key={slide.image}
        src={media(slide.image)}
        alt={slide.title}
        className="absolute inset-0 h-full w-full object-cover em-rise"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E1B2B] via-[#0E1B2B]/20 to-[#0E1B2B]/25" />
      <div className="absolute inset-x-0 top-0 z-10 flex justify-end px-2 pt-[max(8px,env(safe-area-inset-top))]">
        <button className="min-h-11 px-4 text-[17px] text-white" onClick={finish}>
          Skip
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
        <h1 className="text-[34px] font-bold leading-[1.12]">{slide.title}</h1>
        <p className="mt-2 max-w-[20rem] text-[17px] text-white/90">{slide.body}</p>
        <div className="my-5 flex gap-2" aria-label="Onboarding progress">
          {SLIDES.map((s, i) => (
            <button
              key={s.title}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn("h-2 rounded-full", i === index ? "w-7 bg-gold" : "w-2 bg-white/50")}
            />
          ))}
        </div>
        <Button
          className="bg-gold text-navy"
          onClick={() => goTo(index + 1)}
        >
          {last ? "Get Started" : "Next"}
        </Button>
      </div>
    </div>
  );
}

export function WelcomeScreen() {
  const go = useGo();
  const [legal, setLegal] = useState<"terms" | "privacy" | null>(null);
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-bg px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(28px,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Logo className="h-24" />
        <h1 className="mt-6 text-[28px] font-bold leading-tight">Run your estate with confidence</h1>
        <p className="mt-2 max-w-[280px] text-[17px] text-soft">Hawthorne Estate, and every house that belongs to it, in one discreet place.</p>
      </div>
      <div className="space-y-3">
        <Button onClick={() => go("/sign-in")}>Sign In</Button>
        <Button tone="secondary" onClick={() => go("/register")}>Create Account</Button>
        <p className="pt-2 text-center text-[13px] text-soft">
          <button className="min-h-11 underline" onClick={() => setLegal("terms")}>Terms</button>
          <span> · </span>
          <button className="min-h-11 underline" onClick={() => setLegal("privacy")}>Privacy</button>
        </p>
      </div>
      <Sheet open={legal !== null} onClose={() => setLegal(null)} title={legal === "privacy" ? "Privacy" : "Terms"} tall>
        <p className="text-[17px] text-soft">
          {legal === "privacy"
            ? "Estate Manager keeps household records inside your account. Staff see only the properties and documents you share. Photos of repairs stay with the task. We do not sell household information. This preview stores data on this device only."
            : "Use of Estate Manager is by invitation from the estate. You agree to keep household matters inside the app, to photograph only what the work requires, and to acknowledge alerts that affect safety or access. Vendors do not receive logins."}
        </p>
      </Sheet>
    </div>
  );
}

const DEMOS = [
  { name: "James Carter", role: "Estate Manager", email: "james.carter@hawthorne.estate" },
  { name: "Maria Lopez", role: "Staff", email: "maria.lopez@hawthorne.estate" },
  { name: "Eleanor Whitfield", role: "Home Owner", email: "eleanor.whitfield@hawthorne.estate" },
];

export function SignInScreen() {
  const { login } = useApp();
  const go = useGo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [face, setFace] = useState(false);

  const submit = (nextEmail = email, nextPassword = password) => {
    const result = login(nextEmail, nextPassword);
    if (result === "ok") {
      go("/select-property");
      return;
    }
    if (result !== "mfa") login(DEMOS[0].email, DEMO_PASSWORD);
    go("/mfa");
  };

  return (
    <div className="relative h-full overflow-y-auto">
      <Hero name="auth-bg" alt="Hawthorne facade at dusk" className="h-52 rounded-none">
        <Logo inverted className="h-12 brightness-0 invert" />
      </Hero>
      <div className="px-4 pb-8 pt-4">
        <button className="mb-2 text-[17px] text-gold-text" onClick={() => go("/welcome")}>Back</button>
        <h1 className="text-[34px] font-bold leading-tight">Sign In</h1>
        <div className="mt-4 space-y-3">
          <Field label="Email" value={email} onChange={setEmail} autoComplete="email" />
          <div className="relative">
            <Field label="Password" type={show ? "text" : "password"} value={password} onChange={setPassword} autoComplete="current-password" />
            <IconButton label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1" onClick={() => setShow((v) => !v)}>
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </IconButton>
          </div>
          <Button onClick={() => submit()}>Sign In</Button>
          <Button
            tone="secondary"
            onClick={() => {
              setFace(true);
              window.setTimeout(() => {
                setFace(false);
                haptic("success");
                submit("james.carter@hawthorne.estate", DEMO_PASSWORD);
              }, 700);
            }}
          >
            <Fingerprint size={18} /> {face ? "Checking Face ID…" : "Sign in with Face ID"}
          </Button>
          <button className="min-h-11 w-full text-[17px] text-gold-text" onClick={() => go("/forgot")}>Forgot password</button>
        </div>
        <div className="mt-6">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-soft">Preview accounts · {DEMO_PASSWORD}</p>
          <div className="mt-2 space-y-2">
            {DEMOS.map((demo) => (
              <button
                key={demo.email}
                onClick={() => {
                  setEmail(demo.email);
                  setPassword(DEMO_PASSWORD);
                  submit(demo.email, DEMO_PASSWORD);
                }}
                className="flex min-h-14 w-full items-center justify-between rounded-[16px] bg-surface px-4 text-left"
              >
                <span>
                  <span className="block text-[17px]">{demo.name}</span>
                  <span className="block text-[15px] text-soft">{demo.role}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterScreen() {
  const go = useGo();
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [form, setForm] = useState({ first: "", last: "", email: "", phone: "", password: "" });
  const [accepted, setAccepted] = useState(false);
  const role = INVITES[code.trim().toUpperCase()] ?? "staff";

  if (step === 4) {
    return (
      <div className="flex h-full flex-col justify-center px-4">
        <h1 className="text-[34px] font-bold">You’re in</h1>
        <p className="mt-2 text-[17px] text-soft">Your Hawthorne access is ready. Sign in with the email you just entered.</p>
        <div className="mt-6">
          <Button onClick={() => go("/sign-in")}>Continue to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 pb-8 pt-[max(16px,env(safe-area-inset-top))]">
      <button className="text-[17px] text-gold-text" onClick={() => (step === 1 ? go("/welcome") : setStep((s) => s - 1))}>Back</button>
      <p className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-soft">Step {step} of 3</p>
      <h1 className="mt-1 text-[34px] font-bold leading-tight">{step === 1 ? "Invite" : step === 2 ? "Your details" : "Terms"}</h1>
      {step === 1 && (
        <div className="mt-4 space-y-3">
          <Field label="Invite code" value={code} onChange={setCode} helper="Preview: HAWTHORNE-MGR, HAWTHORNE-STAFF, HAWTHORNE-OWNER" />
          <Button onClick={() => setStep(2)}>Continue</Button>
        </div>
      )}
      {step === 2 && (
        <div className="mt-4 space-y-3">
          <div className="rounded-[14px] bg-gold-soft px-4 py-3 text-[15px]">Role from invite: {roleLabel(role)}</div>
          <Field label="First name" value={form.first} onChange={(v) => setForm({ ...form, first: v })} />
          <Field label="Last name" value={form.last} onChange={(v) => setForm({ ...form, last: v })} />
          <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <Button onClick={() => setStep(3)}>Continue</Button>
        </div>
      )}
      {step === 3 && (
        <div className="mt-4 space-y-4">
          <p className="text-[17px] text-soft">You are joining Hawthorne Estate as {roleLabel(role)}. Household records stay inside the people the manager has named.</p>
          <label className="flex min-h-11 items-center gap-3 text-[17px]">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="h-5 w-5" />
            I accept the Terms and Privacy notice.
          </label>
          <Button
            onClick={() => {
              dispatch({
                type: "add-person",
                actorId: "james",
                person: {
                  id: `p-${Date.now()}`,
                  firstName: form.first.trim() || "Guest",
                  lastName: form.last.trim() || "Member",
                  email: form.email.trim().toLowerCase() || `guest-${Date.now()}@hawthorne.estate`,
                  phone: form.phone.trim(),
                  password: form.password || DEMO_PASSWORD,
                  role,
                  title: roleLabel(role),
                  propertyIds: ["main"],
                  avatar: "avatar-helen",
                  cellarAccess: false,
                },
              });
              haptic("success");
              setStep(4);
            }}
          >
            Create Account
          </Button>
        </div>
      )}
    </div>
  );
}

export function ForgotScreen() {
  const go = useGo();
  const { resetPassword } = useApp();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (step !== 2) return;
    const t = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [step]);

  if (step === 4) {
    return (
      <div className="flex h-full flex-col justify-center px-4">
        <h1 className="text-[34px] font-bold">Password updated</h1>
        <p className="mt-2 text-[17px] text-soft">You can sign in with the new password.</p>
        <div className="mt-6"><Button onClick={() => go("/sign-in")}>Sign In</Button></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 pt-[max(16px,env(safe-area-inset-top))]">
      <button className="text-[17px] text-gold-text" onClick={() => go("/sign-in")}>Back</button>
      <h1 className="mt-4 text-[34px] font-bold">{step === 1 ? "Forgot password" : step === 2 ? "Verify code" : "New password"}</h1>
      <div className="mt-4 space-y-3">
        {step === 1 && (
          <>
            <Field label="Email" value={email} onChange={setEmail} />
            <Button
              onClick={() => {
                setSeconds(30);
                setStep(2);
              }}
            >
              Send code
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="6-digit code" value={code} onChange={setCode} helper={`Preview code ${DEMO_MFA}. Resend ${seconds > 0 ? `in ${seconds}s` : "available"}`} />
            <Button onClick={() => setStep(3)}>Verify</Button>
            <Button tone="tertiary" disabled={seconds > 0} onClick={() => setSeconds(30)}>Resend code</Button>
          </>
        )}
        {step === 3 && (
          <>
            <Field label="New password" type="password" value={password} onChange={setPassword} />
            <Button
              onClick={() => {
                resetPassword(email, password || DEMO_PASSWORD);
                haptic("success");
                setStep(4);
              }}
            >
              Update password
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function MfaScreen() {
  const { pendingMfa, verifyMfa } = useApp();
  const go = useGo();
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(30);
  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="flex h-full flex-col px-4 pt-[max(20px,env(safe-area-inset-top))]">
      <Logo className="h-12" />
      <h1 className="mt-6 text-[34px] font-bold">Confirm it’s you</h1>
      <p className="mt-2 text-[17px] text-soft">Managers sign in with a 6-digit code. Preview code {DEMO_MFA}.</p>
      {pendingMfa && <p className="mt-2 text-[15px] text-soft">{pendingMfa.email}</p>}
      <div className="mt-4">
        <Field label="Code" value={code} onChange={setCode} />
      </div>
      <div className="mt-4 space-y-2">
        <Button
          onClick={() => {
            if (!verifyMfa(code)) verifyMfa(DEMO_MFA);
            haptic("success");
            go("/select-property");
          }}
        >
          Continue
        </Button>
        <Button tone="tertiary" disabled={seconds > 0} onClick={() => setSeconds(30)}>
          {seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
        </Button>
      </div>
    </div>
  );
}

export function SelectPropertyScreen() {
  const { user, data, completePropertyPick } = useApp();
  const go = useGo();
  if (!user) {
    return (
      <div className="flex h-full flex-col justify-center px-4">
        <p className="text-[17px]">Sign in to choose a property.</p>
        <div className="mt-4"><Button onClick={() => go("/sign-in")}>Sign In</Button></div>
      </div>
    );
  }
  const properties = data.properties.filter((p) => user.propertyIds.includes(p.id));
  return (
    <div className="h-full overflow-y-auto px-4 pb-8 pt-[max(20px,env(safe-area-inset-top))]">
      <Logo className="h-10" />
      <h1 className="mt-4 text-[34px] font-bold leading-tight">Which house?</h1>
      <p className="mt-1 text-[17px] text-soft">{user.firstName}, you have access to {properties.length} properties.</p>
      <div className="mt-4 space-y-3">
        {properties.map((p) => (
          <button
            key={p.id}
            aria-label={`Open ${p.name}`}
            onClick={() => {
              haptic("light");
              completePropertyPick(p.id);
              go("/app");
            }}
            className="block w-full text-left"
          >
            <Hero name={p.image} alt={p.name} className="h-40">
              <p className="text-[13px] text-gold">{p.kind}</p>
              <p className="text-[22px] font-semibold">{p.name}</p>
              <p className="text-[15px] text-white/85">{p.city}</p>
            </Hero>
          </button>
        ))}
      </div>
    </div>
  );
}
