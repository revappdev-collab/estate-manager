import { uid } from "@/lib/format";
import type {
  Alert,
  Approval,
  AssigneeStatus,
  AuditEntry,
  AvailabilityBlock,
  Conversation,
  Data,
  Document,
  EstateEvent,
  Incident,
  InventoryItem,
  Issue,
  Notice,
  Person,
  ShoppingItem,
  ShoppingStatus,
  Task,
  Vendor,
  WorkStatus,
} from "@/mock/types";

export type Action =
  | { type: "add-person"; person: Person; actorId: string }
  | { type: "update-person"; id: string; patch: Partial<Person>; actorId: string }
  | { type: "revoke"; id: string; actorId: string }
  | { type: "create-task"; task: Task; actorId: string }
  | { type: "task-progress"; taskId: string; personId: string; status: AssigneeStatus; note?: string; photo?: string; actorId: string }
  | { type: "reassign"; taskId: string; assigneeIds: string[]; actorId: string }
  | { type: "toggle-check"; taskId: string; checkId: string; actorId: string }
  | { type: "comment"; taskId: string; authorId: string; body: string }
  | { type: "task-photo"; taskId: string; photo: string; actorId: string }
  | { type: "request-review"; taskId: string; actorId: string }
  | { type: "close-task"; taskId: string; actorId: string }
  | { type: "create-issue"; issue: Issue; actorId: string }
  | { type: "ack-issue"; issueId: string; actorId: string }
  | { type: "convert-issue"; issueId: string; assigneeIds: string[]; actorId: string }
  | { type: "decide-approval"; id: string; decision: "approved" | "rejected"; comment: string; actorId: string }
  | { type: "shopping-item"; listId: string; item: ShoppingItem; actorId: string }
  | { type: "shopping-status"; listId: string; itemId: string; status: ShoppingStatus; actorId: string }
  | { type: "approve-shopping"; listId: string; decision: "approved" | "rejected"; actorId: string }
  | { type: "receipt"; listId: string; photo: string; actorId: string }
  | { type: "create-alert"; alert: Alert; actorId: string }
  | { type: "ack-alert"; alertId: string; personId: string }
  | { type: "send-message"; conversationId: string; authorId: string; body: string; photo?: string }
  | { type: "start-conversation"; conversation: Conversation }
  | { type: "read-conversation"; conversationId: string; personId: string }
  | { type: "create-event"; event: EstateEvent; actorId: string }
  | { type: "adjust-stock"; itemId: string; delta: number; reason: string; actorId: string }
  | { type: "save-item"; item: InventoryItem; actorId: string }
  | { type: "save-vendor"; vendor: Vendor; actorId: string }
  | { type: "add-document"; doc: Document; actorId: string }
  | { type: "ack-sop"; sopId: string; personId: string }
  | { type: "sop-step"; sopId: string; stepId: string; actorId: string }
  | { type: "ack-manual"; personId: string }
  | { type: "incident"; incident: Incident }
  | { type: "read-notice"; id: string }
  | { type: "read-all"; personId: string }
  | { type: "availability"; block: AvailabilityBlock; actorId: string }
  | { type: "remove-availability"; id: string }
  | { type: "work-status"; id: string; status: WorkStatus; actorId: string };

function now() {
  return new Date().toISOString();
}

function audit(data: Data, entry: Omit<AuditEntry, "id" | "at">): Data {
  return { ...data, audit: [{ ...entry, id: uid("au"), at: now() }, ...data.audit] };
}

function notify(data: Data, notice: Omit<Notice, "id" | "read" | "at"> & { at?: string }): Data {
  return {
    ...data,
    notices: [{ ...notice, id: uid("n"), read: false, at: notice.at ?? now() }, ...data.notices],
  };
}

function mapTask(data: Data, id: string, fn: (task: Task) => Task): Data {
  return { ...data, tasks: data.tasks.map((t) => (t.id === id ? fn(t) : t)) };
}

export function reduce(data: Data, action: Action): Data {
  switch (action.type) {
    case "add-person":
      return audit({ ...data, people: [...data.people, action.person] }, { actorId: action.actorId, action: "Invite", detail: `Invited ${action.person.firstName} ${action.person.lastName}.` });
    case "update-person":
      return { ...data, people: data.people.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)) };
    case "revoke":
      return audit(
        { ...data, people: data.people.map((p) => (p.id === action.id ? { ...p, revoked: true } : p)) },
        { actorId: action.actorId, action: "Access", detail: "Access revoked." },
      );
    case "create-task": {
      let next = { ...data, tasks: [action.task, ...data.tasks] };
      next = audit(next, { actorId: action.actorId, action: "Task", detail: `Created “${action.task.title}”.` });
      for (const id of action.task.assigneeIds) {
        if (id !== action.actorId) {
          next = notify(next, { type: "assignment", title: "New task", body: action.task.title, href: `/app/tasks/${action.task.id}`, recipientId: id });
        }
      }
      return next;
    }
    case "task-progress": {
      const task = data.tasks.find((t) => t.id === action.taskId);
      if (!task) return data;
      const progress = task.progress.some((p) => p.personId === action.personId)
        ? task.progress.map((p) => (p.personId === action.personId ? { ...p, status: action.status, note: action.note ?? p.note, photo: action.photo ?? p.photo, at: now() } : p))
        : [...task.progress, { personId: action.personId, status: action.status, note: action.note, photo: action.photo, at: now() }];
      const label =
        action.status === "acknowledged" ? "Acknowledged" : action.status === "in_progress" ? "In progress" : action.status === "blocked" ? "Blocked" : action.status === "completed" ? "Completed their work" : "Updated";
      let next = mapTask(data, action.taskId, (t) => ({
        ...t,
        progress,
        photos: action.photo && !action.photo.startsWith("data:") && !t.photos.includes(action.photo) ? [...t.photos, action.photo] : action.photo?.startsWith("data:") ? [action.photo, ...t.photos] : t.photos,
        history: [{ id: uid("h"), at: now(), actorId: action.actorId, text: `${label}${action.note ? `: ${action.note}` : "."}` }, ...t.history],
      }));
      const updated = next.tasks.find((t) => t.id === action.taskId)!;
      const allDone = updated.progress.length > 0 && updated.progress.every((p) => p.status === "completed");
      const manager = data.people.find((p) => p.role === "manager" && !p.revoked);
      if (manager && manager.id !== action.actorId) {
        next = notify(next, {
          type: action.status === "completed" ? "completed" : action.status === "acknowledged" ? "acknowledged" : "status",
          title: allDone ? "Ready to close" : label,
          body: updated.title,
          href: `/app/tasks/${updated.id}`,
          recipientId: manager.id,
        });
      }
      if (allDone && updated.issueId) {
        const issue = data.issues.find((i) => i.id === updated.issueId);
        if (issue) {
          next = notify(next, { type: "completed", title: "Work finished", body: `${updated.title} is ready for the manager to close.`, href: `/app/requests/${issue.id}`, recipientId: issue.reporterId });
        }
      }
      return audit(next, { actorId: action.actorId, action: "Status", detail: `${label} on ${updated.title}.` });
    }
    case "reassign": {
      const task = data.tasks.find((t) => t.id === action.taskId);
      if (!task) return data;
      const progress = action.assigneeIds.map((id) => task.progress.find((p) => p.personId === id) ?? { personId: id, status: "new" as const, at: now() });
      let next = mapTask(data, action.taskId, (t) => ({
        ...t,
        assigneeIds: action.assigneeIds,
        progress,
        history: [{ id: uid("h"), at: now(), actorId: action.actorId, text: "Reassigned." }, ...t.history],
      }));
      for (const id of action.assigneeIds) {
        if (!task.assigneeIds.includes(id)) {
          next = notify(next, { type: "assignment", title: "Assigned to you", body: task.title, href: `/app/tasks/${task.id}`, recipientId: id });
        }
      }
      return audit(next, { actorId: action.actorId, action: "Assign", detail: `Reassigned ${task.title}.` });
    }
    case "toggle-check":
      return mapTask(data, action.taskId, (t) => ({
        ...t,
        checklist: t.checklist.map((c) => (c.id === action.checkId ? { ...c, done: !c.done } : c)),
      }));
    case "comment": {
      const task = data.tasks.find((t) => t.id === action.taskId);
      if (!task) return data;
      let next = mapTask(data, action.taskId, (t) => ({
        ...t,
        comments: [...t.comments, { id: uid("cm"), authorId: action.authorId, body: action.body, at: now() }],
      }));
      for (const person of data.people) {
        if (action.body.toLowerCase().includes(`@${person.firstName.toLowerCase()}`) && person.id !== action.authorId) {
          next = notify(next, { type: "mention", title: "You were mentioned", body: action.body, href: `/app/tasks/${task.id}`, recipientId: person.id });
        }
      }
      return next;
    }
    case "task-photo":
      return mapTask(data, action.taskId, (t) => ({
        ...t,
        photos: [action.photo, ...t.photos],
        history: [{ id: uid("h"), at: now(), actorId: action.actorId, text: "Added a photo." }, ...t.history],
      }));
    case "request-review":
      return audit(
        mapTask(notify(data, { type: "approval", title: "Review requested", body: data.tasks.find((t) => t.id === action.taskId)?.title ?? "Task", href: `/app/tasks/${action.taskId}`, recipientId: data.people.find((p) => p.role === "manager")?.id ?? "james" }), action.taskId, (t) => ({
          ...t,
          reviewRequested: true,
          history: [{ id: uid("h"), at: now(), actorId: action.actorId, text: "Requested review." }, ...t.history],
        })),
        { actorId: action.actorId, action: "Review", detail: "Requested review." },
      );
    case "close-task": {
      const task = data.tasks.find((t) => t.id === action.taskId);
      if (!task) return data;
      let next = mapTask(data, action.taskId, (t) => ({
        ...t,
        closed: true,
        reviewRequested: false,
        history: [{ id: uid("h"), at: now(), actorId: action.actorId, text: "Approved and closed." }, ...t.history],
      }));
      if (task.issueId) {
        next = { ...next, issues: next.issues.map((i) => (i.id === task.issueId ? { ...i, status: "closed" } : i)) };
        const issue = data.issues.find((i) => i.id === task.issueId);
        if (issue) {
          next = notify(next, { type: "completed", title: "Request closed", body: task.title, href: `/app/requests/${issue.id}`, recipientId: issue.reporterId });
        }
      }
      for (const id of task.assigneeIds) {
        next = notify(next, { type: "completed", title: "Task closed", body: task.title, href: `/app/tasks/${task.id}`, recipientId: id });
      }
      return audit(next, { actorId: action.actorId, action: "Close", detail: `Closed ${task.title}.` });
    }
    case "create-issue": {
      let next: Data = { ...data, issues: [action.issue, ...data.issues] };
      const managers = data.people.filter((p) => p.role === "manager" && !p.revoked);
      for (const m of managers) {
        next = notify(next, { type: "assignment", title: "New issue", body: action.issue.title, href: `/app/issues/${action.issue.id}`, recipientId: m.id });
      }
      for (const id of action.issue.taggedIds) {
        next = notify(next, { type: "mention", title: "You were tagged", body: action.issue.title, href: `/app/issues/${action.issue.id}`, recipientId: id });
      }
      return audit(next, { actorId: action.actorId, action: "Issue", detail: `Reported “${action.issue.title}”.` });
    }
    case "ack-issue": {
      const issue = data.issues.find((i) => i.id === action.issueId);
      if (!issue) return data;
      let next: Data = { ...data, issues: data.issues.map((i) => (i.id === action.issueId ? { ...i, status: i.status === "new" ? "acknowledged" : i.status } : i)) };
      next = notify(next, { type: "acknowledged", title: "Issue acknowledged", body: issue.title, href: `/app/requests/${issue.id}`, recipientId: issue.reporterId });
      return audit(next, { actorId: action.actorId, action: "Acknowledged", detail: `Acknowledged ${issue.title}.` });
    }
    case "convert-issue": {
      const issue = data.issues.find((i) => i.id === action.issueId);
      if (!issue) return data;
      const taskId = uid("task");
      const task: Task = {
        id: taskId,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        priority: issue.priority,
        propertyId: issue.propertyId,
        room: issue.room,
        assigneeIds: action.assigneeIds,
        progress: action.assigneeIds.map((id) => ({ personId: id, status: "new", at: now() })),
        due: issue.due ?? now(),
        start: now(),
        checklist: [],
        comments: [],
        photos: issue.photo ? [issue.photo] : [],
        history: [{ id: uid("h"), at: now(), actorId: action.actorId, text: "Converted from a reported issue." }],
        createdBy: action.actorId,
        issueId: issue.id,
      };
      let next: Data = {
        ...data,
        tasks: [task, ...data.tasks],
        issues: data.issues.map((i) => (i.id === issue.id ? { ...i, status: "converted", taskId } : i)),
      };
      for (const id of action.assigneeIds) {
        next = notify(next, { type: "assignment", title: "Issue assigned to you", body: issue.title, href: `/app/tasks/${taskId}`, recipientId: id });
      }
      next = notify(next, { type: "status", title: "Request assigned", body: `${issue.title} is now with the team.`, href: `/app/requests/${issue.id}`, recipientId: issue.reporterId });
      return audit(next, { actorId: action.actorId, action: "Assign", detail: `Converted “${issue.title}” to a task.` });
    }
    case "decide-approval": {
      const approval = data.approvals.find((a) => a.id === action.id);
      if (!approval) return data;
      let next: Data = {
        ...data,
        approvals: data.approvals.map((a) => (a.id === action.id ? { ...a, status: action.decision, comment: action.comment } : a)),
      };
      if (approval.related?.startsWith("shop-")) {
        next = {
          ...next,
          shopping: next.shopping.map((s) => (s.id === approval.related ? { ...s, approval: action.decision } : s)),
        };
      }
      next = notify(next, {
        type: "approval",
        title: action.decision === "approved" ? "Approved" : "Not approved",
        body: `${approval.title}${action.comment ? ` — ${action.comment}` : ""}`,
        href: `/app/approvals/${approval.id}`,
        recipientId: approval.requesterId,
      });
      return audit(next, { actorId: action.actorId, action: "Approval", detail: `${action.decision === "approved" ? "Approved" : "Rejected"} ${approval.title}.` });
    }
    case "shopping-item":
      return {
        ...data,
        shopping: data.shopping.map((s) => (s.id === action.listId ? { ...s, items: [...s.items, action.item] } : s)),
      };
    case "shopping-status": {
      let next: Data = {
        ...data,
        shopping: data.shopping.map((s) =>
          s.id === action.listId ? { ...s, items: s.items.map((i) => (i.id === action.itemId ? { ...i, status: action.status } : i)) } : s,
        ),
      };
      const list = next.shopping.find((s) => s.id === action.listId);
      const item = list?.items.find((i) => i.id === action.itemId);
      if (action.status === "received" && item?.inventoryId) {
        next = {
          ...next,
          inventory: next.inventory.map((inv) => (inv.id === item.inventoryId ? { ...inv, qty: inv.qty + item.qty } : inv)),
        };
      }
      return audit(next, { actorId: action.actorId, action: "Shopping", detail: `${item?.name ?? "Item"} marked ${action.status.replace("_", " ")}.` });
    }
    case "approve-shopping": {
      const list = data.shopping.find((s) => s.id === action.listId);
      if (!list) return data;
      let next: Data = { ...data, shopping: data.shopping.map((s) => (s.id === list.id ? { ...s, approval: action.decision } : s)) };
      next = {
        ...next,
        approvals: next.approvals.map((a) => (a.related === list.id ? { ...a, status: action.decision, comment: action.decision === "approved" ? "Approved from the list." : "Rejected from the list." } : a)),
      };
      if (list.assigneeId) {
        next = notify(next, {
          type: "approval",
          title: action.decision === "approved" ? "Shopping approved" : "Shopping not approved",
          body: list.title,
          href: `/app/shopping/${list.id}`,
          recipientId: list.assigneeId,
        });
      }
      return audit(next, { actorId: action.actorId, action: "Approval", detail: `${action.decision} ${list.title}.` });
    }
    case "receipt":
      return audit(
        { ...data, shopping: data.shopping.map((s) => (s.id === action.listId ? { ...s, receipt: action.photo } : s)) },
        { actorId: action.actorId, action: "Receipt", detail: "Receipt added to a shopping list." },
      );
    case "create-alert": {
      let next: Data = { ...data, alerts: [action.alert, ...data.alerts] };
      for (const id of action.alert.recipientIds) {
        next = notify(next, { type: "alert", title: action.alert.title, body: action.alert.message, href: `/app/alerts/${action.alert.id}`, recipientId: id });
      }
      return audit(next, { actorId: action.actorId, action: "Alert", detail: `Sent “${action.alert.title}”.` });
    }
    case "ack-alert": {
      const alert = data.alerts.find((a) => a.id === action.alertId);
      if (!alert) return data;
      let next: Data = {
        ...data,
        alerts: data.alerts.map((a) => (a.id === alert.id ? { ...a, acks: { ...a.acks, [action.personId]: now() } } : a)),
      };
      next = notify(next, { type: "acknowledged", title: "Alert acknowledged", body: alert.title, href: `/app/alerts/${alert.id}`, recipientId: alert.senderId });
      return next;
    }
    case "send-message": {
      return {
        ...data,
        conversations: data.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, messages: [...c.messages, { id: uid("m"), authorId: action.authorId, body: action.body, at: now(), photo: action.photo }], readAt: { ...c.readAt, [action.authorId]: now() } }
            : c,
        ),
      };
    }
    case "start-conversation":
      return { ...data, conversations: [action.conversation, ...data.conversations] };
    case "read-conversation":
      return {
        ...data,
        conversations: data.conversations.map((c) => (c.id === action.conversationId ? { ...c, readAt: { ...c.readAt, [action.personId]: now() } } : c)),
      };
    case "create-event": {
      let next: Data = { ...data, events: [action.event, ...data.events] };
      for (const id of action.event.recipientIds) {
        if (id !== action.actorId) next = notify(next, { type: "status", title: action.event.title, body: "Added to the calendar.", href: `/app/events/${action.event.id}`, recipientId: id });
      }
      return audit(next, { actorId: action.actorId, action: "Event", detail: `Created ${action.event.title}.` });
    }
    case "adjust-stock": {
      const item = data.inventory.find((i) => i.id === action.itemId);
      if (!item) return data;
      const qty = Math.max(0, item.qty + action.delta);
      let next: Data = { ...data, inventory: data.inventory.map((i) => (i.id === item.id ? { ...i, qty } : i)) };
      if (qty < item.min) {
        const manager = data.people.find((p) => p.role === "manager");
        if (manager) next = notify(next, { type: "low_stock", title: "Low stock", body: `${item.name} is at ${qty} ${item.unit}.`, href: `/app/inventory/${item.id}`, recipientId: manager.id });
      }
      return audit(next, { actorId: action.actorId, action: "Inventory", detail: `${item.name} ${action.delta > 0 ? "increased" : "decreased"} (${action.reason}).` });
    }
    case "save-item": {
      const exists = data.inventory.some((i) => i.id === action.item.id);
      const inventory = exists ? data.inventory.map((i) => (i.id === action.item.id ? action.item : i)) : [action.item, ...data.inventory];
      return audit({ ...data, inventory }, { actorId: action.actorId, action: "Inventory", detail: `Saved ${action.item.name}.` });
    }
    case "save-vendor": {
      const exists = data.vendors.some((v) => v.id === action.vendor.id);
      const vendors = exists ? data.vendors.map((v) => (v.id === action.vendor.id ? action.vendor : v)) : [action.vendor, ...data.vendors];
      return audit({ ...data, vendors }, { actorId: action.actorId, action: "Vendor", detail: `Saved ${action.vendor.name}.` });
    }
    case "add-document":
      return audit({ ...data, documents: [action.doc, ...data.documents] }, { actorId: action.actorId, action: "Document", detail: `Uploaded ${action.doc.title}.` });
    case "ack-sop":
      return {
        ...data,
        sops: data.sops.map((s) => (s.id === action.sopId ? { ...s, acknowledgedBy: { ...s.acknowledgedBy, [action.personId]: now() } } : s)),
      };
    case "sop-step":
      return {
        ...data,
        sops: data.sops.map((s) => (s.id === action.sopId ? { ...s, steps: s.steps.map((st) => (st.id === action.stepId ? { ...st, done: !st.done } : st)) } : s)),
      };
    case "ack-manual":
      return { ...data, manualAcks: { ...data.manualAcks, [action.personId]: now() } };
    case "incident":
      return audit({ ...data, incidents: [action.incident, ...data.incidents] }, { actorId: action.incident.reporterId, action: "Incident", detail: action.incident.title });
    case "read-notice":
      return { ...data, notices: data.notices.map((n) => (n.id === action.id ? { ...n, read: true } : n)) };
    case "read-all":
      return { ...data, notices: data.notices.map((n) => (n.recipientId === action.personId ? { ...n, read: true } : n)) };
    case "availability":
      return audit(
        { ...data, availability: [action.block, ...data.availability.filter((a) => !(a.personId === action.block.personId && a.date === action.block.date))] },
        { actorId: action.actorId, action: "Availability", detail: `${action.block.date} marked ${action.block.state}.` },
      );
    case "remove-availability":
      return { ...data, availability: data.availability.filter((a) => a.id !== action.id) };
    case "work-status": {
      const order = data.workOrders.find((w) => w.id === action.id);
      if (!order) return data;
      return audit(
        {
          ...data,
          workOrders: data.workOrders.map((w) =>
            w.id === action.id ? { ...w, status: action.status, history: [{ id: uid("h"), at: now(), actorId: action.actorId, text: `Moved to ${action.status.replace("_", " ")}.` }, ...w.history] } : w,
          ),
        },
        { actorId: action.actorId, action: "Work order", detail: `${order.title} → ${action.status}.` },
      );
    }
    default:
      return data;
  }
}

export function approvalOf(data: Data, id: string): Approval | undefined {
  return data.approvals.find((a) => a.id === id);
}
