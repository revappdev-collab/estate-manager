import { useEffect, useMemo, useState } from "react";
import { Avatar, Button, EmptyState, ErrorState, Field, Group, Page, Row, SearchField, Section, Segmented, Sheet, SkeletonList, Switch, useGo, usePhase } from "@/components/ios/ui";
import { dayKey, dayLabel, ESTATE_MONTH, ESTATE_YEAR, fullName, monthMatrix, todayKey, uid, usDate, usTime } from "@/lib/format";
import { haptic } from "@/lib/haptic";
import type { EstateEvent, NoticeType } from "@/mock/types";
import { roleLabel } from "@/lib/store";
import { useEstate } from "../useEstate";
import { cn } from "@/lib/utils";

const NOTICE_LABEL: Record<NoticeType, string> = {
  assignment: "Assignment",
  mention: "Mention",
  acknowledged: "Acknowledged",
  status: "Status",
  completed: "Completed",
  alert: "Alert",
  low_stock: "Low stock",
  weather: "Weather",
  approval: "Approval",
};

export function InboxScreen() {
  const { data, me, dispatch } = useEstate();
  const go = useGo();
  const phase = usePhase();
  const [tab, setTab] = useState<"today" | "earlier" | "all">("all");
  const [kind, setKind] = useState<"all" | NoticeType>("all");
  if (!me) return null;
  let items = data.notices.filter((n) => n.recipientId === me.id);
  if (tab === "today") items = items.filter((n) => dayLabel(n.at) === "Today");
  if (tab === "earlier") items = items.filter((n) => dayLabel(n.at) !== "Today");
  if (kind !== "all") items = items.filter((n) => n.type === kind);
  const unread = data.notices.filter((n) => n.recipientId === me.id && !n.read).length;
  return (
    <Page large title="Inbox" subtitle={unread ? `${unread} unread` : "You’re caught up"} trailing={<button className="text-[15px] text-gold-text" onClick={() => dispatch({ type: "read-all", personId: me.id })}>Read all</button>}>
      <Segmented label="When" value={tab} onChange={setTab} options={[{ value: "all", label: "All" }, { value: "today", label: "Today" }, { value: "earlier", label: "Earlier" }]} />
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {(["all", "assignment", "mention", "alert", "approval", "weather"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={cn("min-h-9 shrink-0 rounded-full px-3 text-[13px]", kind === k ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-fill")}>{k === "all" ? "All types" : NOTICE_LABEL[k]}</button>
        ))}
      </div>
      <div className="mt-4">
        {phase.phase === "loading" && <SkeletonList />}
        {phase.phase === "error" && <ErrorState onRetry={phase.retry} />}
        {phase.phase === "ready" && items.length === 0 && <EmptyState image="empty-inbox" title="Nothing here" body="Alerts, mentions, and assignments will gather in this list." />}
        {phase.phase === "ready" && (
          <Group>
            {items.map((n) => (
              <Row
                key={n.id}
                title={n.title}
                subtitle={`${NOTICE_LABEL[n.type]} · ${n.body}`}
                trailing={!n.read ? <span className="h-2.5 w-2.5 rounded-full bg-gold" /> : undefined}
                onClick={() => {
                  dispatch({ type: "read-notice", id: n.id });
                  go(n.href);
                }}
              />
            ))}
          </Group>
        )}
      </div>
      <button className="mt-4 text-[17px] text-gold-text" onClick={() => go("/app/messages")}>Open messages</button>
    </Page>
  );
}

export function MessageListScreen() {
  const { data, me, name } = useEstate();
  const go = useGo();
  const [q, setQ] = useState("");
  if (!me) return null;
  const list = data.conversations.filter((c) => c.memberIds.includes(me.id) && c.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <Page large title="Messages" trailing={<button className="text-[17px] text-gold-text" onClick={() => go("/app/messages/new")}>New</button>}>
      <SearchField value={q} onChange={setQ} placeholder="Search conversations" />
      <div className="mt-3">
        {list.length === 0 && <EmptyState image="empty-inbox" title="No conversations" body="Direct, group, and task threads live here." />}
        <Group>
          {list.map((c) => {
            const last = c.messages[c.messages.length - 1];
            const unread = last && last.authorId !== me.id && (!c.readAt[me.id] || c.readAt[me.id] < last.at);
            return (
              <Row
                key={c.id}
                title={c.kind === "direct" ? name(c.memberIds.find((id) => id !== me.id)) : c.title}
                subtitle={last ? last.body : "No messages yet"}
                trailing={unread ? <span className="h-2.5 w-2.5 rounded-full bg-info" /> : <span className="text-[13px] text-soft">{c.kind}</span>}
                onClick={() => go(`/app/messages/${c.id}`)}
              />
            );
          })}
        </Group>
      </div>
    </Page>
  );
}

export function NewMessageScreen() {
  const { data, me, dispatch } = useEstate();
  const go = useGo();
  if (!me) return null;
  return (
    <Page back title="New message">
      <Group>
        {data.people.filter((p) => p.id !== me.id && !p.revoked).map((p) => (
          <Row
            key={p.id}
            leading={<Avatar name={fullName(p)} src={p.avatar} />}
            title={fullName(p)}
            subtitle={p.title}
            onClick={() => {
              const existing = data.conversations.find((c) => c.kind === "direct" && c.memberIds.length === 2 && c.memberIds.includes(me.id) && c.memberIds.includes(p.id));
              if (existing) {
                go(`/app/messages/${existing.id}`);
                return;
              }
              const id = uid("c");
              dispatch({
                type: "start-conversation",
                conversation: { id, title: fullName(p), kind: "direct", memberIds: [me.id, p.id], messages: [], readAt: {} },
              });
              go(`/app/messages/${id}`);
            }}
          />
        ))}
      </Group>
    </Page>
  );
}

export function ChatScreen({ id }: { id: string }) {
  const { data, me, dispatch, name, person, property } = useEstate();
  const go = useGo();
  const convo = data.conversations.find((c) => c.id === id);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    if (me && convo) dispatch({ type: "read-conversation", conversationId: convo.id, personId: me.id });
    const t = window.setTimeout(() => setTyping(false), 1600);
    return () => window.clearTimeout(t);
    // mark read once when the thread opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  if (!me || !convo) return <Page back title="Message"><EmptyState image="empty-inbox" title="Thread missing" body="This conversation is no longer on the device." /></Page>;
  const other = convo.memberIds.find((pid) => pid !== me.id);
  return (
    <Page back title={convo.kind === "direct" ? name(other) : convo.title}>
      <div className="mb-3 rounded-[14px] bg-gold-soft px-3 py-2 text-[13px]">
        {convo.taskId ? <button onClick={() => go(`/app/tasks/${convo.taskId}`)}>Linked task</button> : property(convo.propertyId)?.name || "Household"} · {convo.kind}
      </div>
      <div className="space-y-2">
        {convo.messages.map((m) => {
          const mine = m.authorId === me.id;
          const who = person(m.authorId);
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%] rounded-[16px] px-3 py-2", mine ? "bg-navy text-white" : "bg-surface")}>
                {!mine && <p className="text-[13px] text-gold-text">{who?.firstName}</p>}
                <p className="text-[17px]">{m.body}</p>
                <p className={cn("text-[12px] tabular", mine ? "text-white/70" : "text-soft")}>{usTime(m.at)} · Read</p>
              </div>
            </div>
          );
        })}
        {typing && <p className="text-[13px] text-soft">{name(other)} is typing…</p>}
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          dispatch({ type: "send-message", conversationId: convo.id, authorId: me.id, body: text.trim() });
          setText("");
        }}
      >
        <input aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" className="h-12 flex-1 rounded-[14px] bg-surface px-3 text-[17px]" />
        <button className="h-12 rounded-[14px] bg-navy px-4 font-semibold text-white dark:bg-gold dark:text-navy" type="submit">Send</button>
      </form>
    </Page>
  );
}

export function CalendarScreen() {
  const { data, me, property, session } = useEstate();
  const go = useGo();
  const [mode, setMode] = useState<"month" | "week" | "agenda">("month");
  const [propertyId, setPropertyId] = useState(session.activePropertyId);
  const [selected, setSelected] = useState(todayKey());
  if (!me) return null;
  const cells = monthMatrix(ESTATE_YEAR, ESTATE_MONTH);
  const events = data.events.filter((e) => (propertyId === "all" || e.propertyId === propertyId) && (me.role === "manager" || e.recipientIds.includes(me.id) || e.createdBy === me.id));
  const weekKeys = ["2026-11-08", "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14"];
  const shown = mode === "week" ? events.filter((e) => weekKeys.includes(dayKey(e.start))) : mode === "agenda" ? events : events.filter((e) => dayKey(e.start) === selected);
  return (
    <Page large title="Calendar" trailing={<button className="text-[17px] text-gold-text" onClick={() => go("/app/events/new")}>Add</button>}>
      <Segmented label="Calendar mode" value={mode} onChange={setMode} options={[{ value: "month", label: "Month" }, { value: "week", label: "Week" }, { value: "agenda", label: "Agenda" }]} />
      <label className="mt-3 block text-[13px] text-soft">Property
        <select aria-label="Property filter" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="mt-1 h-11 w-full rounded-[12px] bg-surface px-3 text-[17px]">
          <option value="all">All properties</option>
          {data.properties.filter((p) => me.propertyIds.includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      {mode === "month" && (
        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={`${d}${i}`} className="text-[13px] text-soft">{d}</span>)}
          {cells.map((cell, i) => {
            const dots = cell ? events.filter((e) => dayKey(e.start) === cell.key).length : 0;
            return (
              <button key={i} disabled={!cell} onClick={() => cell && setSelected(cell.key)} className={cn("h-11 rounded-[10px] text-[15px] tabular", cell?.key === selected && "bg-navy text-white dark:bg-gold dark:text-navy", cell?.key === todayKey() && cell.key !== selected && "text-gold-text")}>
                {cell?.day}
                {dots > 0 && <span className="mx-auto mt-0.5 block h-1 w-1 rounded-full bg-gold" />}
              </button>
            );
          })}
        </div>
      )}
      {mode === "week" && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {weekKeys.map((key) => (
            <button key={key} onClick={() => setSelected(key)} className={cn("min-h-14 min-w-14 rounded-[14px] px-2", selected === key ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-surface")}>
              <span className="block text-[13px]">{key.slice(8)}</span>
              <span className="block text-[12px]">{events.filter((e) => dayKey(e.start) === key).length}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-4">
        <Group>
          {(mode === "week" ? events.filter((e) => weekKeys.includes(dayKey(e.start))) : shown).length === 0 && <Row title="No events" subtitle="Add a household visit or a vendor arrival." />}
          {(mode === "week" ? events.filter((e) => weekKeys.includes(dayKey(e.start))) : shown).map((e) => (
            <Row key={e.id} title={e.title} subtitle={`${dayLabel(e.start)} ${usTime(e.start)} · ${property(e.propertyId)?.name}`} onClick={() => go(`/app/events/${e.id}`)} />
          ))}
        </Group>
      </div>
    </Page>
  );
}

export function EventDetailScreen({ id }: { id: string }) {
  const { data, property, name } = useEstate();
  const event = data.events.find((e) => e.id === id);
  if (!event) return <Page back title="Event"><EmptyState image="empty-tasks" title="Event removed" body="It is no longer on the calendar." /></Page>;
  return (
    <Page back title="Event">
      <p className="text-[13px] uppercase tracking-wide text-gold-text">{event.type}</p>
      <h1 className="mt-1 text-[28px] font-bold">{event.title}</h1>
      <p className="mt-2 text-[17px]">{event.detail}</p>
      <Group>
        <Row title={property(event.propertyId)?.name ?? "Property"} subtitle={event.location} />
        <Row title={usDate(event.start)} subtitle={`${usTime(event.start)} – ${usTime(event.end)}`} />
        <Row title="Reminder" subtitle={event.reminder ?? "None"} />
        <Row title="Created by" subtitle={name(event.createdBy)} />
      </Group>
      <Section title="Notified">
        <p className="text-[15px] text-soft">{event.recipientIds.map((id) => name(id)).join(", ")}</p>
      </Section>
    </Page>
  );
}

export function EventFormScreen() {
  const { data, me, dispatch, pushToast } = useEstate();
  const go = useGo();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [propertyId, setPropertyId] = useState(me?.propertyIds[0] ?? "main");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("2026-11-14");
  const [time, setTime] = useState("15:00");
  const [recipients, setRecipients] = useState<string[]>(["james"]);
  if (!me) return null;
  return (
    <Page back title="New event">
      <div className="space-y-3">
        <Field label="Title" value={title} onChange={setTitle} />
        <Field label="Details" value={detail} onChange={setDetail} />
        <Field label="Location" value={location} onChange={setLocation} />
        <label className="block text-[13px] text-soft">Date
          <input aria-label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] bg-surface px-3 text-[17px]" />
        </label>
        <label className="block text-[13px] text-soft">Time
          <input aria-label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] bg-surface px-3 text-[17px]" />
        </label>
        <label className="block text-[13px] text-soft">Property
          <select aria-label="Property" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] bg-surface px-3 text-[17px]">
            {data.properties.filter((p) => me.propertyIds.includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {data.people.filter((p) => !p.revoked).map((p) => (
            <button key={p.id} onClick={() => setRecipients((list) => list.includes(p.id) ? list.filter((id) => id !== p.id) : [...list, p.id])} className="min-h-11 rounded-full bg-fill px-3 text-[15px]">{p.firstName}{recipients.includes(p.id) ? " ✓" : ""}</button>
          ))}
        </div>
        <Button
          onClick={() => {
            if (title.trim().length < 2) return;
            const [hh, mm] = time.split(":").map(Number);
            const start = new Date(Date.UTC(2026, 10, Number(date.slice(8)), (hh || 9) + 5, mm || 0)).toISOString();
            const event: EstateEvent = {
              id: uid("ev"),
              title: title.trim(),
              detail: detail.trim() || "Added from the calendar.",
              propertyId,
              location: location || "On property",
              start,
              end: start,
              type: me.role === "owner" ? "household" : "staff",
              recipientIds: recipients,
              createdBy: me.id,
              reminder: "1 hour before",
            };
            dispatch({ type: "create-event", event, actorId: me.id });
            haptic("success");
            pushToast("Event added", "The people you chose were notified.");
            go(`/app/events/${event.id}`);
          }}
        >
          Save event
        </Button>
      </div>
    </Page>
  );
}

const MORE: Record<string, { label: string; href: string; note?: string }[]> = {
  manager: [
    { label: "Estates & properties", href: "/app/properties" },
    { label: "Issue inbox", href: "/app/issues" },
    { label: "Approvals", href: "/app/approvals" },
    { label: "Maintenance", href: "/app/maintenance" },
    { label: "Inventory", href: "/app/inventory" },
    { label: "Cellar", href: "/app/cellar" },
    { label: "Shopping lists", href: "/app/shopping" },
    { label: "Documents", href: "/app/documents" },
    { label: "Vendor log", href: "/app/vendors" },
    { label: "Staff & team", href: "/app/team" },
    { label: "SOPs & checklists", href: "/app/sops" },
    { label: "House manual", href: "/app/manual" },
    { label: "Safety & emergency", href: "/app/safety" },
    { label: "Reports", href: "/app/reports" },
    { label: "Broadcast alert", href: "/app/alerts/new" },
    { label: "Weather", href: "/app/weather" },
    { label: "Audit history", href: "/app/audit" },
    { label: "Users & access", href: "/app/users" },
    { label: "Search", href: "/app/search" },
    { label: "Profile & settings", href: "/app/profile" },
  ],
  staff: [
    { label: "Report an issue", href: "/app/report-issue" },
    { label: "My availability", href: "/app/availability" },
    { label: "SOPs to acknowledge", href: "/app/sops" },
    { label: "Shopping assignments", href: "/app/shopping" },
    { label: "Inventory", href: "/app/inventory" },
    { label: "Vendor log", href: "/app/vendors", note: "Read only" },
    { label: "Documents", href: "/app/documents" },
    { label: "House manual", href: "/app/manual" },
    { label: "Safety", href: "/app/safety" },
    { label: "Messages", href: "/app/messages" },
    { label: "Notifications", href: "/app/inbox" },
    { label: "Profile", href: "/app/profile" },
  ],
  owner: [
    { label: "Properties", href: "/app/properties" },
    { label: "Shopping lists", href: "/app/shopping" },
    { label: "Household alert", href: "/app/alerts/new" },
    { label: "Documents", href: "/app/documents" },
    { label: "Notification history", href: "/app/inbox" },
    { label: "Search", href: "/app/search" },
    { label: "Profile", href: "/app/profile" },
  ],
};

export function MoreScreen() {
  const { me } = useEstate();
  const go = useGo();
  if (!me) return null;
  const items = MORE[me.role];
  return (
    <Page large title="More" subtitle={roleLabel(me.role)}>
      <Group>
        {items.map((item) => (
          <Row key={item.href + item.label} title={item.label} subtitle={item.note} onClick={() => go(item.href)} />
        ))}
      </Group>
    </Page>
  );
}

export function ProfileScreen() {
  const { me, data, session, logout, setTheme, toggleNotif, toggleFace, setTimezone, dispatch } = useEstate();
  const go = useGo();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [help, setHelp] = useState(false);
  if (!me) return null;
  const homes = data.properties.filter((p) => me.propertyIds.includes(p.id));
  return (
    <Page back title="Profile">
      <div className="flex items-center gap-3">
        <Avatar name={fullName(me)} src={me.avatar} size={72} />
        <div>
          <p className="text-[22px] font-semibold">{fullName(me)}</p>
          <p className="text-[15px] text-gold-text">{roleLabel(me.role)}</p>
          <p className="text-[15px] text-soft">{me.email}</p>
        </div>
      </div>
      <Section title="Properties">
        <p className="text-[15px]">{homes.map((h) => h.name).join(", ")}</p>
      </Section>
      <Section title="Appearance">
        <Segmented label="Theme" value={session.theme} onChange={setTheme} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }]} />
      </Section>
      <Section title="Security">
        <Group>
          <div className="flex min-h-14 items-center justify-between px-4">
            <span className="text-[17px]">Face ID</span>
            <Switch checked={session.faceId} label="Face ID" onChange={() => toggleFace()} />
          </div>
        </Group>
      </Section>
      <Section title="Notifications">
        <Group>
          {Object.entries(session.notif).map(([key, on]) => (
            <div key={key} className="flex min-h-14 items-center justify-between border-b border-line px-4 last:border-b-0">
              <span className="text-[17px]">{key}</span>
              <Switch checked={on} label={key} onChange={() => toggleNotif(key)} />
            </div>
          ))}
        </Group>
      </Section>
      <Section title="Region">
        <Group>
          <Row title="Language" subtitle="English" />
          <label className="flex min-h-14 items-center justify-between px-4 text-[17px]">
            Time zone
            <select aria-label="Time zone" value={session.timezone} onChange={(e) => setTimezone(e.target.value)} className="bg-transparent text-[15px]">
              <option value="America/New_York">Eastern</option>
              <option value="America/Chicago">Central</option>
              <option value="America/Los_Angeles">Pacific</option>
            </select>
          </label>
        </Group>
      </Section>
      <div className="mt-4 space-y-2">
        <Button tone="secondary" onClick={() => setHelp(true)}>Help</Button>
        <Button tone="secondary" onClick={() => { logout(); go("/sign-in"); }}>Sign out</Button>
        <Button tone="destructive" onClick={() => setDeleteOpen(true)}>Delete account</Button>
      </div>
      <Sheet open={help} onClose={() => setHelp(false)} title="Help">
        <p className="text-[17px]">Call James Carter at (845) 555-0148 or write james.carter@hawthorne.estate. For a gate or medical emergency, use Safety.</p>
        <div className="mt-3"><Button onClick={() => go("/app/safety")}>Open safety</Button></div>
      </Sheet>
      <Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account">
        <p className="text-[17px]">This removes your sign-in on this device. Hawthorne keeps the household record.</p>
        <div className="mt-3 space-y-2">
          <Button tone="destructive" onClick={() => { if (me.id.startsWith("p-")) dispatch({ type: "revoke", id: me.id, actorId: me.id }); logout(); go("/sign-in"); }}>Delete and sign out</Button>
          <Button tone="secondary" onClick={() => setDeleteOpen(false)}>Keep my account</Button>
        </div>
      </Sheet>
    </Page>
  );
}

export function SearchScreen() {
  const { data, me, session, rememberSearch, taskStatus } = useEstate();
  const go = useGo();
  const phase = usePhase();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "tasks" | "properties" | "documents" | "vendors" | "inventory">("all");
  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!me || query.length < 2) return [];
    const rows: { title: string; meta: string; href: string }[] = [];
    if (kind === "all" || kind === "tasks") {
      data.tasks.filter((t) => t.title.toLowerCase().includes(query)).forEach((t) => rows.push({ title: t.title, meta: `Task · ${taskStatus(t)}`, href: `/app/tasks/${t.id}` }));
    }
    if (kind === "all" || kind === "properties") {
      data.properties.filter((p) => me.propertyIds.includes(p.id) && p.name.toLowerCase().includes(query)).forEach((p) => rows.push({ title: p.name, meta: "Property", href: `/app/properties/${p.id}` }));
    }
    if (kind === "all" || kind === "documents") {
      data.documents.filter((d) => d.title.toLowerCase().includes(query)).forEach((d) => rows.push({ title: d.title, meta: "Document", href: `/app/documents/${d.id}` }));
    }
    if (kind === "all" || kind === "vendors") {
      data.vendors.filter((v) => v.name.toLowerCase().includes(query)).forEach((v) => rows.push({ title: v.name, meta: "Vendor", href: `/app/vendors/${v.id}` }));
    }
    if (kind === "all" || kind === "inventory") {
      data.inventory.filter((i) => i.name.toLowerCase().includes(query)).forEach((i) => rows.push({ title: i.name, meta: "Inventory", href: `/app/inventory/${i.id}` }));
    }
    return rows;
  }, [data, kind, me, query, taskStatus]);
  return (
    <Page back large title="Search">
      <SearchField value={q} onChange={setQ} placeholder="Tasks, houses, documents" />
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {(["all", "tasks", "properties", "documents", "vendors", "inventory"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={cn("min-h-9 shrink-0 rounded-full px-3 text-[15px] capitalize", kind === k ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-fill")}>{k}</button>
        ))}
      </div>
      {phase.phase === "loading" && <div className="mt-4"><SkeletonList /></div>}
      {phase.phase === "error" && <ErrorState onRetry={phase.retry} />}
      {query.length < 2 && (
        <Section title="Recent">
          <div className="flex flex-wrap gap-2">
            {session.recentSearches.map((s) => (
              <button key={s} className="min-h-11 rounded-full bg-surface px-3 text-[15px]" onClick={() => { setQ(s); }}>{s}</button>
            ))}
          </div>
        </Section>
      )}
      {query.length >= 2 && results.length === 0 && <EmptyState image="empty-docs" title="No matches" body="Try a vendor, a room, or a wine name." />}
      {results.length > 0 && (
        <div className="mt-4">
          <Group>
            {results.map((r) => (
              <Row key={r.href + r.title} title={r.title} subtitle={r.meta} onClick={() => { rememberSearch(q.trim()); go(r.href); }} />
            ))}
          </Group>
        </div>
      )}
    </Page>
  );
}
