export type Role = "rbt" | "bcba" | "field_staff" | "admin";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  bacbNumber?: string;
};

export type Supervisor = {
  id: string;
  name: string;
  credential: string;
  initials: string;
};

export type FieldworkEntry = {
  id: string;
  date: string;
  activityType: string;
  client: string;
  startTime: string;
  endTime: string;
  hours: number;
  notes: string;
  status: "pending" | "approved";
};

export type SupervisionSession = {
  id: string;
  date: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  durationHours: number;
  sessionType: string;
  notes: string;
  topics?: string;
  supervisorId: string;
  status: "scheduled" | "requested" | "pending" | "approved";
};

export type ComplianceItem = {
  id: string;
  name: string;
  status: "current" | "due_soon" | "missing" | "expired";
  detail: string;
  expiresAt?: string;
  documentId?: string;
  remind: boolean;
  category: string;
};

export type AppDocument = {
  id: string;
  name: string;
  uploadedAt: string;
  status: "approved" | "pending" | "missing" | "expiring" | "rejected";
  category: string;
  expiresAt?: string;
  previewUrl?: string;
};

export type FormTemplate = {
  id: string;
  name: string;
  description: string;
  fields: { id: string; label: string; type: "text" | "textarea" | "date" | "select"; options?: string[] }[];
};

export type FormRecord = {
  id: string;
  templateId: string;
  name: string;
  description: string;
  status: "todo" | "pending" | "approved" | "rejected";
  submittedAt?: string;
  values: Record<string, string>;
  signature?: string;
  signedName?: string;
};

export type AppNotification = {
  id: string;
  type: "warning" | "info" | "error";
  text: string;
  time: string;
  read: boolean;
  href: string;
};

export type ActivityItem = {
  id: string;
  text: string;
  time: string;
  tone: "blue" | "orange";
};

export const FIELDWORK_REQUIRED = 80;
export const SUPERVISION_REQUIRED = 10;

export const ACTIVITY_TYPES = [
  "Direct client session",
  "Group supervision prep",
  "Program review",
  "Independent fieldwork",
  "Other",
] as const;

export const SESSION_TYPES = ["Individual", "Group", "Observation"] as const;

export const DOCUMENT_CATEGORIES = [
  { id: "cpr", label: "CPR certification" },
  { id: "rbt", label: "BACB RBT certification" },
  { id: "background", label: "Background check" },
  { id: "supervision-contract", label: "Supervision contract" },
  { id: "hipaa", label: "HIPAA training" },
  { id: "other", label: "Other" },
] as const;

export const seedUsers: User[] = [
  {
    id: "u1",
    firstName: "Maya",
    lastName: "Chen",
    email: "maya@ontopaba.com",
    phone: "(303) 555-0142",
    password: "Training1",
    role: "rbt",
    bacbNumber: "RBT-482913",
  },
  {
    id: "u2",
    firstName: "Rafael",
    lastName: "Alvarez",
    email: "rafael@ontopaba.com",
    phone: "(303) 555-0198",
    password: "Training1",
    role: "bcba",
    bacbNumber: "1-14-16220",
  },
  {
    id: "u3",
    firstName: "Jordan",
    lastName: "Lee",
    email: "jordan@ontopaba.com",
    phone: "(303) 555-0166",
    password: "Training1",
    role: "field_staff",
  },
  {
    id: "u-admin",
    firstName: "Avery",
    lastName: "Admin",
    email: "admin@ontopaba.com",
    phone: "(303) 555-0100",
    password: "Training1",
    role: "admin",
  },
];

export const seedSupervisor: Supervisor = {
  id: "sup1",
  name: "Dr. R. Alvarez",
  credential: "BCBA",
  initials: "RA",
};

export const seedFieldwork: FieldworkEntry[] = [
  {
    id: "fw1",
    date: "2026-08-24",
    activityType: "Direct client session",
    client: "Client J.M.",
    startTime: "09:00",
    endTime: "12:00",
    hours: 3,
    notes: "Manding and intraverbal targets. Two new mands independently.",
    status: "approved",
  },
  {
    id: "fw2",
    date: "2026-08-22",
    activityType: "Program review",
    client: "Client A.R.",
    startTime: "13:00",
    endTime: "15:00",
    hours: 2,
    notes: "Updated probe data and revised prompt fading steps.",
    status: "approved",
  },
  {
    id: "fw3",
    date: "2026-08-20",
    activityType: "Independent fieldwork",
    client: "Module 4",
    startTime: "18:00",
    endTime: "19:30",
    hours: 1.5,
    notes: "Reviewed measurement and graphing modules.",
    status: "pending",
  },
  {
    id: "fw4",
    date: "2026-08-18",
    activityType: "Direct client session",
    client: "Client J.M.",
    startTime: "09:30",
    endTime: "12:30",
    hours: 3,
    notes: "NET in playroom; high rates of independent requests.",
    status: "approved",
  },
];

export const seedSupervision: SupervisionSession[] = [
  {
    id: "sv-next",
    date: "2026-08-29",
    time: "14:00",
    durationHours: 1,
    sessionType: "Individual",
    notes: "Monthly restricted-hours review",
    supervisorId: "sup1",
    status: "scheduled",
  },
  {
    id: "sv1",
    date: "2026-08-15",
    startTime: "14:00",
    endTime: "15:30",
    durationHours: 1.5,
    sessionType: "Individual",
    topics: "Graphing, feedback on session notes",
    notes: "",
    supervisorId: "sup1",
    status: "approved",
  },
  {
    id: "sv2",
    date: "2026-08-08",
    startTime: "10:00",
    endTime: "11:30",
    durationHours: 1.5,
    sessionType: "Observation",
    topics: "Live observation of Client J.M.",
    notes: "",
    supervisorId: "sup1",
    status: "approved",
  },
  {
    id: "sv3",
    date: "2026-08-01",
    startTime: "13:00",
    endTime: "15:00",
    durationHours: 2,
    sessionType: "Individual",
    topics: "Ethics and documentation",
    notes: "",
    supervisorId: "sup1",
    status: "approved",
  },
  {
    id: "sv4",
    date: "2026-07-25",
    startTime: "14:00",
    endTime: "16:00",
    durationHours: 2,
    sessionType: "Group",
    topics: "Group case review",
    notes: "",
    supervisorId: "sup1",
    status: "approved",
  },
];

export const seedDocuments: AppDocument[] = [
  {
    id: "doc1",
    name: "CPR_card_2025.pdf",
    uploadedAt: "2026-03-12",
    status: "expiring",
    category: "cpr",
    expiresAt: "2026-09-07",
  },
  {
    id: "doc2",
    name: "RBT_certificate.pdf",
    uploadedAt: "2026-01-08",
    status: "approved",
    category: "rbt",
    expiresAt: "2027-01-08",
  },
  {
    id: "doc3",
    name: "Background_check.pdf",
    uploadedAt: "2026-08-20",
    status: "pending",
    category: "background",
  },
];

export const seedCompliance: ComplianceItem[] = [
  {
    id: "c1",
    name: "CPR certification",
    status: "due_soon",
    detail: "Expires in 12 days",
    expiresAt: "2026-09-07",
    documentId: "doc1",
    remind: true,
    category: "cpr",
  },
  {
    id: "c2",
    name: "BACB RBT certification",
    status: "current",
    detail: "Active",
    expiresAt: "2027-01-08",
    documentId: "doc2",
    remind: true,
    category: "rbt",
  },
  {
    id: "c3",
    name: "Background check",
    status: "current",
    detail: "Active — pending latest upload",
    documentId: "doc3",
    remind: true,
    category: "background",
  },
  {
    id: "c4",
    name: "Supervision contract",
    status: "missing",
    detail: "Missing document",
    remind: true,
    category: "supervision-contract",
  },
  {
    id: "c5",
    name: "HIPAA training",
    status: "current",
    detail: "Active",
    expiresAt: "2027-02-01",
    remind: false,
    category: "hipaa",
  },
];

export const seedTemplates: FormTemplate[] = [
  {
    id: "ft1",
    name: "Monthly fieldwork attestation",
    description: "Confirm restricted and unrestricted hours for the month.",
    fields: [
      { id: "month", label: "Month", type: "text" },
      { id: "restricted", label: "Restricted hours", type: "text" },
      { id: "unrestricted", label: "Unrestricted hours", type: "text" },
      { id: "notes", label: "Notes", type: "textarea" },
    ],
  },
  {
    id: "ft2",
    name: "Incident report",
    description: "Document a session incident for supervisor review.",
    fields: [
      { id: "date", label: "Date", type: "date" },
      { id: "client", label: "Client / context", type: "text" },
      {
        id: "severity",
        label: "Severity",
        type: "select",
        options: ["Low", "Moderate", "High"],
      },
      { id: "summary", label: "What happened", type: "textarea" },
    ],
  },
  {
    id: "ft3",
    name: "Supervision agreement",
    description: "Acknowledge your supervision contract terms.",
    fields: [
      { id: "supervisor", label: "Supervisor name", type: "text" },
      { id: "start", label: "Start date", type: "date" },
    ],
  },
];

export const seedForms: FormRecord[] = [
  {
    id: "f-todo",
    templateId: "ft1",
    name: "Monthly fieldwork attestation",
    description: "Confirm restricted and unrestricted hours for the month.",
    status: "todo",
    values: {},
  },
  {
    id: "f1",
    templateId: "ft3",
    name: "Supervision agreement",
    description: "Acknowledge your supervision contract terms.",
    status: "approved",
    submittedAt: "2026-07-02",
    values: { supervisor: "Dr. R. Alvarez", start: "2026-07-01" },
    signedName: "Maya Chen",
  },
  {
    id: "f2",
    templateId: "ft2",
    name: "Incident report",
    description: "Document a session incident for supervisor review.",
    status: "pending",
    submittedAt: "2026-08-19",
    values: {
      date: "2026-08-18",
      client: "Client J.M.",
      severity: "Low",
      summary: "Client dropped materials; redirected successfully.",
    },
    signedName: "Maya Chen",
  },
];

export const seedNotifications: AppNotification[] = [
  {
    id: "n1",
    type: "warning",
    text: "CPR certification expires in 12 days",
    time: "2 hours ago",
    read: false,
    href: "/compliance/c1",
  },
  {
    id: "n2",
    type: "info",
    text: "Supervision session Friday at 2:00 PM",
    time: "Yesterday",
    read: false,
    href: "/supervision",
  },
  {
    id: "n3",
    type: "info",
    text: "Session note approved",
    time: "2 hours ago",
    read: true,
    href: "/fieldwork/fw1",
  },
  {
    id: "n4",
    type: "error",
    text: "Supervision contract is missing",
    time: "3 days ago",
    read: false,
    href: "/compliance/c4",
  },
];

export const seedActivity: ActivityItem[] = [
  { id: "a1", text: "Session note approved", time: "2 hours ago", tone: "blue" },
  { id: "a2", text: "Fieldwork logged — 3.0 hrs", time: "Yesterday", tone: "orange" },
  { id: "a3", text: "Supervision signed off", time: "3 days ago", tone: "blue" },
];

export const ONBOARDING = [
  {
    title: "Log fieldwork in seconds",
    body: "Track session hours, activity details, and your progress toward BACB certification requirements — all from your phone.",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80",
    alt: "Clinician working with a child during a session",
  },
  {
    title: "Never miss a supervision session",
    body: "See your assigned supervisor, schedule sessions, and track supervision hours with built-in sign-off approval.",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1600&q=80",
    alt: "Supervisor reviewing notes with a colleague",
  },
  {
    title: "Compliance made simple",
    body: "Get reminders before certifications expire and know exactly what's missing — no more last-minute scrambling.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80",
    alt: "Organized certification documents on a desk",
  },
  {
    title: "Your entire ABA career, organized",
    body: "Documents, forms, e-signatures, and reports — everything BACB certification requires, always within reach.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
    alt: "Professional using a phone to stay organized",
  },
] as const;

export function roleLabel(role: Role) {
  if (role === "rbt") return "RBT";
  if (role === "bcba") return "BCBA / Supervisor";
  if (role === "field_staff") return "Field staff";
  return "Admin";
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function todayIso() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export function categoryLabel(id: string) {
  return DOCUMENT_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
