export type Role = "manager" | "staff" | "owner";

export type Priority = "low" | "medium" | "high" | "urgent";

export type TaskStatus =
  | "new"
  | "acknowledged"
  | "in_progress"
  | "blocked"
  | "completed"
  | "closed"
  | "overdue";

export type AssigneeStatus = "new" | "acknowledged" | "in_progress" | "blocked" | "completed";

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  title: string;
  propertyIds: string[];
  avatar: string;
  cellarAccess: boolean;
  revoked?: boolean;
};

export type Property = {
  id: string;
  name: string;
  kind: string;
  address: string;
  city: string;
  image: string;
  emergency: string;
  wifi: string;
  notes: string;
};

export type Progress = {
  personId: string;
  status: AssigneeStatus;
  note?: string;
  photo?: string;
  at: string;
};

export type ChecklistItem = { id: string; label: string; done: boolean };

export type Comment = { id: string; authorId: string; body: string; at: string };

export type HistoryItem = { id: string; at: string; actorId: string; text: string };

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  propertyId: string;
  room: string;
  assigneeIds: string[];
  progress: Progress[];
  due: string;
  start: string;
  reminder?: string;
  recurring?: string;
  checklist: ChecklistItem[];
  comments: Comment[];
  photos: string[];
  history: HistoryItem[];
  createdBy: string;
  closed?: boolean;
  issueId?: string;
  reviewRequested?: boolean;
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  propertyId: string;
  room: string;
  category: string;
  priority: Priority;
  reporterId: string;
  taggedIds: string[];
  status: "new" | "acknowledged" | "converted" | "closed";
  photo?: string;
  taskId?: string;
  due?: string;
  createdAt: string;
};

export type WorkStatus =
  | "requested"
  | "contacted"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "closed";

export type WorkOrder = {
  id: string;
  title: string;
  propertyId: string;
  vendorId: string;
  asset: string;
  status: WorkStatus;
  cost: number;
  scheduled?: string;
  beforePhoto?: string;
  afterPhoto?: string;
  invoice?: string;
  warranty?: string;
  notes: string;
  history: HistoryItem[];
};

export type Approval = {
  id: string;
  title: string;
  detail: string;
  amount?: number;
  propertyId: string;
  requesterId: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
  related?: string;
  createdAt: string;
};

export type ShoppingStatus = "to_buy" | "purchased" | "unavailable" | "received";

export type ShoppingItem = {
  id: string;
  name: string;
  qty: number;
  unit: string;
  status: ShoppingStatus;
  requestedBy: string;
  inventoryId?: string;
  note?: string;
};

export type ShoppingList = {
  id: string;
  title: string;
  propertyId: string;
  assigneeId?: string;
  approval: "not_required" | "pending" | "approved" | "rejected";
  items: ShoppingItem[];
  receipt?: string;
  createdAt: string;
};

export type Alert = {
  id: string;
  title: string;
  message: string;
  propertyId: string;
  priority: Priority;
  senderId: string;
  starts: string;
  ends: string;
  recipientIds: string[];
  acks: Record<string, string>;
  attachment?: string;
};

export type NoticeType =
  | "assignment"
  | "mention"
  | "acknowledged"
  | "status"
  | "completed"
  | "alert"
  | "low_stock"
  | "weather"
  | "approval";

export type Notice = {
  id: string;
  type: NoticeType;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href: string;
  recipientId: string;
};

export type ChatMessage = {
  id: string;
  authorId: string;
  body: string;
  at: string;
  photo?: string;
};

export type Conversation = {
  id: string;
  title: string;
  kind: "direct" | "group" | "task";
  memberIds: string[];
  propertyId?: string;
  taskId?: string;
  messages: ChatMessage[];
  readAt: Record<string, string>;
};

export type EstateEvent = {
  id: string;
  title: string;
  detail: string;
  propertyId: string;
  location: string;
  start: string;
  end: string;
  type: "household" | "maintenance" | "vendor" | "staff" | "visit";
  recipientIds: string[];
  taskId?: string;
  reminder?: string;
  createdBy: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  propertyId: string;
  location: string;
  qty: number;
  min: number;
  unit: string;
  image: string;
  notes: string;
};

export type WineBottle = {
  id: string;
  name: string;
  vintage: number;
  region: string;
  qty: number;
  bin: string;
  propertyId: string;
  notes: string;
  image: string;
};

export type Vendor = {
  id: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  propertyIds: string[];
  image: string;
  notes: string;
  coiExpires: string;
  license: string;
  history: string[];
};

export type Document = {
  id: string;
  title: string;
  category: string;
  propertyId: string;
  source: "Native" | "SharePoint";
  access: Role[];
  expires?: string;
  updated: string;
  version: string;
  versions: { version: string; at: string; note: string }[];
  summary: string;
};

export type Sop = {
  id: string;
  title: string;
  propertyId: string;
  version: string;
  summary: string;
  steps: ChecklistItem[];
  acknowledgedBy: Record<string, string>;
  versions: { version: string; at: string; note: string }[];
};

export type ManualSection = {
  id: string;
  title: string;
  propertyId: string;
  body: string;
};

export type AvailabilityBlock = {
  id: string;
  personId: string;
  date: string;
  state: "available" | "busy" | "unavailable";
  note: string;
};

export type AuditEntry = {
  id: string;
  at: string;
  actorId: string;
  action: string;
  detail: string;
};

export type Incident = {
  id: string;
  title: string;
  propertyId: string;
  reporterId: string;
  at: string;
  detail: string;
};

export type Inspection = {
  id: string;
  name: string;
  propertyId: string;
  due: string;
  status: "current" | "due" | "overdue";
};

export type Data = {
  people: Person[];
  properties: Property[];
  tasks: Task[];
  issues: Issue[];
  workOrders: WorkOrder[];
  approvals: Approval[];
  shopping: ShoppingList[];
  alerts: Alert[];
  notices: Notice[];
  conversations: Conversation[];
  events: EstateEvent[];
  inventory: InventoryItem[];
  cellar: WineBottle[];
  vendors: Vendor[];
  documents: Document[];
  sops: Sop[];
  manual: ManualSection[];
  manualVersion: string;
  manualAcks: Record<string, string>;
  availability: AvailabilityBlock[];
  audit: AuditEntry[];
  incidents: Incident[];
  inspections: Inspection[];
};
