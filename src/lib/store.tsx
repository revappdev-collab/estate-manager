import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createSeed } from "@/mock/data";
import type { Data, Person, Role } from "@/mock/types";
import { reduce, type Action } from "./reducer";

export type ThemeMode = "light" | "dark" | "system";

export type Toast = { id: number; title: string; body?: string };

type Session = {
  userId: string | null;
  pendingMfaId: string | null;
  propertyChosen: boolean;
  activePropertyId: string;
  onboarded: boolean;
  theme: ThemeMode;
  faceId: boolean;
  timezone: string;
  notif: Record<string, boolean>;
  recentSearches: string[];
};

const KEY = "em-estate-v1";

const DEFAULT_NOTIF: Record<string, boolean> = {
  Assignments: true,
  Mentions: true,
  Acknowledgements: true,
  "Status changes": true,
  Completions: true,
  Alerts: true,
  "Low stock": true,
  Weather: true,
  Approvals: true,
};

const defaultSession = (): Session => ({
  userId: null,
  pendingMfaId: null,
  propertyChosen: false,
  activePropertyId: "main",
  onboarded: false,
  theme: "system",
  faceId: true,
  timezone: "America/New_York",
  notif: DEFAULT_NOTIF,
  recentSearches: ["Guest suite", "Summit HVAC", "Puligny"],
});

type Store = {
  data: Data;
  hydrated: boolean;
  user: Person | null;
  pendingMfa: Person | null;
  session: Session;
  toasts: Toast[];
  pushToast: (title: string, body?: string) => void;
  dismissToast: (id: number) => void;
  dispatch: (action: Action) => void;
  login: (email: string, password: string) => "invalid" | "revoked" | "mfa" | "ok";
  verifyMfa: (code: string) => boolean;
  logout: () => void;
  completePropertyPick: (propertyId: string) => void;
  markOnboarded: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleNotif: (key: string) => void;
  toggleFace: () => void;
  setTimezone: (timezone: string) => void;
  rememberSearch: (q: string) => void;
  resetPassword: (email: string, password: string) => boolean;
};

const Ctx = createContext<Store | null>(null);

function load(): { data: Data; session: Session } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: Data; session: Session };
    if (!parsed?.data?.people || !parsed.session) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(() => createSeed());
  const [session, setSession] = useState<Session>(defaultSession);
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const saved = load();
    if (saved) {
      setData(saved.data);
      setSession({ ...defaultSession(), ...saved.session, notif: { ...DEFAULT_NOTIF, ...saved.session.notif } });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ data, session }));
    localStorage.setItem("em-theme", session.theme);
  }, [data, session, hydrated]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (mode: ThemeMode) => {
      const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", dark);
    };
    apply(session.theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply(session.theme);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [session.theme]);

  const pushToast = (title: string, body?: string) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, title, body }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  };

  const value = useMemo<Store>(() => {
    const user = data.people.find((p) => p.id === session.userId && !p.revoked) ?? null;
    const pendingMfa = data.people.find((p) => p.id === session.pendingMfaId) ?? null;
    return {
      data,
      hydrated,
      user,
      pendingMfa,
      session,
      toasts,
      pushToast,
      dismissToast: (id) => setToasts((list) => list.filter((t) => t.id !== id)),
      dispatch: (action) => setData((current) => reduce(current, action)),
      login: (email, password) => {
        const found = data.people.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
        if (!found || found.password !== password) return "invalid";
        if (found.revoked) return "revoked";
        if (found.role === "manager") {
          setSession((s) => ({ ...s, pendingMfaId: found.id, userId: null, propertyChosen: false }));
          return "mfa";
        }
        setSession((s) => ({ ...s, userId: found.id, pendingMfaId: null, propertyChosen: false, onboarded: true }));
        return "ok";
      },
      verifyMfa: (code) => {
        if (code.trim() !== "482913" || !session.pendingMfaId) return false;
        const id = session.pendingMfaId;
        setSession((s) => ({ ...s, userId: id, pendingMfaId: null, propertyChosen: false, onboarded: true }));
        return true;
      },
      logout: () => setSession((s) => ({ ...s, userId: null, pendingMfaId: null, propertyChosen: false })),
      completePropertyPick: (propertyId) => setSession((s) => ({ ...s, activePropertyId: propertyId, propertyChosen: true })),
      markOnboarded: () => setSession((s) => ({ ...s, onboarded: true })),
      setTheme: (theme) => setSession((s) => ({ ...s, theme })),
      toggleNotif: (key) => setSession((s) => ({ ...s, notif: { ...s.notif, [key]: !s.notif[key] } })),
      toggleFace: () => setSession((s) => ({ ...s, faceId: !s.faceId })),
      setTimezone: (timezone) => setSession((s) => ({ ...s, timezone })),
      rememberSearch: (q) =>
        setSession((s) => ({ ...s, recentSearches: [q, ...s.recentSearches.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6) })),
      resetPassword: (email, password) => {
        const found = data.people.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
        if (!found) return false;
        setData((current) => reduce(current, { type: "update-person", id: found.id, patch: { password }, actorId: found.id }));
        return true;
      },
    };
  }, [data, hydrated, session, toasts]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function visibleProperties(user: Person, data: Data) {
  return data.properties.filter((p) => user.propertyIds.includes(p.id));
}

export function roleLabel(role: Role) {
  if (role === "manager") return "Estate Manager";
  if (role === "owner") return "Home Owner";
  return "Staff";
}
