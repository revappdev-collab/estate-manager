import { useEffect, useState } from "react";
import { AddPropertySheet } from "@/components/AddPropertySheet";
import { Banner, Group, Page, Photo, ProgressBar, Row, Section, StatusChip, useGo } from "@/components/ios/ui";
import { dayLabel, money, usTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useEstate } from "../useEstate";

function Greeting() {
  const [text, setText] = useState("Hello");
  useEffect(() => {
    const h = new Date().getHours();
    setText(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return <>{text}</>;
}

function Stat({ label, value, href, warn }: { label: string; value: number; href: string; warn?: boolean }) {
  const go = useGo();
  return (
    <button onClick={() => go(href)} className="bg-surface px-4 py-3.5 text-left">
      <span className={cn("block text-[26px] font-bold tabular leading-none", warn && value > 0 && "text-danger")}>{value}</span>
      <span className="mt-1 block text-[13px] text-soft">{label}</span>
    </button>
  );
}

export function HomeScreen() {
  const { me } = useEstate();
  if (!me) return null;
  if (me.role === "staff") return <StaffHome />;
  if (me.role === "owner") return <OwnerHome />;
  return <ManagerHome />;
}

function ManagerHome() {
  const { data, me, session, name, property, taskStatus, completePropertyPick } = useEstate();
  const go = useGo();
  const [adding, setAdding] = useState(false);
  if (!me) return null;
  const pid = session.activePropertyId;
  const mine = data.properties.filter((p) => me.propertyIds.includes(p.id));
  const active = property(pid) ?? mine[0];
  const tasks = data.tasks.filter((t) => t.propertyId === active?.id);
  const pending = tasks.filter((t) => !t.closed && taskStatus(t) !== "completed").length;
  const overdue = tasks.filter((t) => taskStatus(t) === "overdue").length;
  const approvals = data.approvals.filter((a) => a.status === "pending" && a.propertyId === active?.id).length;
  const low = data.inventory.filter((i) => i.propertyId === active?.id && i.qty < i.min).length;
  const attention = [
    ...data.issues.filter((i) => i.propertyId === active?.id && i.status === "new").map((i) => ({ id: i.id, title: i.title, meta: "New issue", href: `/app/issues/${i.id}` })),
    ...data.approvals.filter((a) => a.status === "pending" && a.propertyId === active?.id).map((a) => ({ id: a.id, title: a.title, meta: a.amount ? money(a.amount) : "Approval", href: `/app/approvals/${a.id}` })),
    ...tasks.filter((t) => taskStatus(t) === "blocked").map((t) => ({ id: t.id, title: t.title, meta: "Blocked", href: `/app/tasks/${t.id}` })),
  ].slice(0, 4);
  const today = data.events.filter((e) => e.propertyId === active?.id && dayLabel(e.start) === "Today");
  const weather = active?.id === "city" ? "48°" : active?.id === "lake" ? "41°" : "46°";

  return (
    <Page large title={<Greeting />} subtitle={`${me.firstName} ${me.lastName} · Estate Manager`}>
      {active && (
        <button onClick={() => go(`/app/properties/${active.id}`)} className="block w-full overflow-hidden rounded-[16px] text-left">
          <span className="relative block h-40">
            <Photo name={active.image} alt={active.name} className="h-full w-full" />
            <span className="absolute inset-0 bg-gradient-to-t from-[#0E1B2B] via-[#0E1B2B]/25 to-transparent" />
            <span className="absolute inset-x-4 bottom-3 text-white">
              <span className="block text-[13px] tracking-wide text-gold uppercase">{active.kind}</span>
              <span className="block text-[22px] font-semibold leading-tight">{active.name}</span>
              <span className="block text-[15px] text-white/80">{active.city}</span>
            </span>
          </span>
        </button>
      )}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {mine.map((p) => {
          const on = p.id === active?.id;
          return (
            <button
              key={p.id}
              aria-pressed={on}
              onClick={() => completePropertyPick(p.id)}
              className={cn("min-h-9 shrink-0 rounded-full px-3 text-[15px]", on ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-surface")}
            >
              {p.name}
            </button>
          );
        })}
        <button onClick={() => setAdding(true)} className="min-h-9 shrink-0 rounded-full border border-dashed border-gold px-3 text-[15px] font-semibold text-gold-text">
          Add property
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-[16px] bg-line">
        <Stat label="Open work" value={pending} href="/app/tasks" />
        <Stat label="Overdue" value={overdue} href="/app/tasks" warn />
        <Stat label="Approvals" value={approvals} href="/app/approvals" />
        <Stat label="Low stock" value={low} href="/app/inventory" />
      </div>

      <Section title="Needs you">
        <Group>
          {attention.length === 0 && <Row title="Nothing waiting" subtitle="Approvals, new issues, and blocked work will show here." />}
          {attention.map((item) => (
            <Row key={item.id} title={item.title} subtitle={item.meta} onClick={() => go(item.href)} />
          ))}
        </Group>
      </Section>

      <Section title="Today" action={<button className="min-h-11 text-[15px] text-gold-text" onClick={() => go("/app/calendar")}>Calendar</button>}>
        <Group>
          {today.length === 0 && <Row title="The day is clear" subtitle="No visits or staff blocks on this house." />}
          {today.map((e) => (
            <Row key={e.id} title={e.title} subtitle={`${usTime(e.start)} · ${e.location}`} onClick={() => go(`/app/events/${e.id}`)} />
          ))}
        </Group>
      </Section>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          ["New task", "/app/tasks/new"],
          ["Issue inbox", "/app/issues"],
          ["Broadcast", "/app/alerts/new"],
          ["Properties", "/app/properties"],
        ].map(([label, href]) => (
          <button key={label} onClick={() => go(href)} className="min-h-14 rounded-[16px] bg-surface px-3 text-left text-[15px] font-semibold">
            {label}
          </button>
        ))}
      </div>

      <button onClick={() => go("/app/weather")} className="mt-4 flex w-full items-center justify-between rounded-[16px] bg-surface px-4 py-3 text-left">
        <span>
          <span className="block text-[13px] text-soft">{active?.city ?? "Hawthorne"}</span>
          <span className="block text-[17px] font-semibold">{weather} · Partly cloudy</span>
        </span>
        <span className="text-[15px] text-gold-text">Weather</span>
      </button>

      <Section title="Recent">
        <Group>
          {data.audit.slice(0, 3).map((a) => (
            <Row key={a.id} title={a.detail} subtitle={`${name(a.actorId)} · ${dayLabel(a.at)} ${usTime(a.at)}`} onClick={() => go("/app/audit")} />
          ))}
        </Group>
      </Section>
      <AddPropertySheet open={adding} onClose={() => setAdding(false)} />
    </Page>
  );
}

function StaffHome() {
  const { data, me, taskStatus, name, property } = useEstate();
  const go = useGo();
  if (!me) return null;
  const mine = data.tasks.filter((t) => t.assigneeIds.includes(me.id) && !t.closed);
  const due = mine.filter((t) => dayLabel(t.due) === "Today" || taskStatus(t) === "overdue");
  const blocked = mine.filter((t) => taskStatus(t) === "blocked");
  const mentions = data.notices.filter((n) => n.recipientId === me.id && n.type === "mention" && !n.read);
  const shared = data.tasks.filter((t) => t.assigneeIds.length > 1 && t.assigneeIds.includes(me.id));
  const schedule = data.events.filter((e) => e.recipientIds.includes(me.id) && dayLabel(e.start) === "Today");

  return (
    <Page large title="Today" subtitle={`${me.firstName} ${me.lastName} · ${me.title}`}>
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[16px] bg-line">
        <button onClick={() => go("/app/tasks")} className="bg-surface px-3 py-3 text-left">
          <span className="block text-[22px] font-bold tabular">{due.length}</span>
          <span className="block text-[13px] text-soft">Due</span>
        </button>
        <button onClick={() => go("/app/tasks")} className="bg-surface px-3 py-3 text-left">
          <span className={cn("block text-[22px] font-bold tabular", blocked.length > 0 && "text-danger")}>{blocked.length}</span>
          <span className="block text-[13px] text-soft">Blocked</span>
        </button>
        <button onClick={() => go("/app/tasks")} className="bg-surface px-3 py-3 text-left">
          <span className="block text-[22px] font-bold tabular">{shared.length}</span>
          <span className="block text-[13px] text-soft">Shared</span>
        </button>
      </div>

      <Section title="On the schedule">
        <Group>
          {schedule.length === 0 && <Row title="No visit today" subtitle="Your day is open unless a task is due." />}
          {schedule.map((e) => (
            <Row key={e.id} title={e.title} subtitle={`${usTime(e.start)} · ${property(e.propertyId)?.name}`} onClick={() => go(`/app/events/${e.id}`)} />
          ))}
        </Group>
      </Section>

      <Section title="Due for me">
        <Group>
          {due.length === 0 && <Row title="Nothing due today" subtitle="Shared work is listed below." />}
          {due.map((t) => (
            <Row key={t.id} title={t.title} subtitle={property(t.propertyId)?.name} trailing={<StatusChip status={taskStatus(t)} />} onClick={() => go(`/app/tasks/${t.id}`)} />
          ))}
        </Group>
      </Section>

      {blocked.length > 0 && (
        <div className="mt-4">
          <Banner tone="warning">{blocked.length} blocked. The manager can see the reason.</Banner>
        </div>
      )}

      {mentions.length > 0 && (
        <Section title="New tags">
          <Group>
            {mentions.map((n) => (
              <Row key={n.id} title={n.title} subtitle={n.body} onClick={() => go(n.href)} />
            ))}
          </Group>
        </Section>
      )}

      <Section title="Shared progress">
        {shared.length === 0 && (
          <Group>
            <Row title="No shared tasks" subtitle="Work with more than one person will appear here." />
          </Group>
        )}
        {shared.map((t) => {
          const done = t.progress.filter((p) => p.status === "completed").length;
          return (
            <button key={t.id} onClick={() => go(`/app/tasks/${t.id}`)} className="mb-3 block w-full rounded-[16px] bg-surface p-4 text-left">
              <span className="text-[17px] font-semibold">{t.title}</span>
              <span className="mt-2 block">
                <ProgressBar value={(done / t.assigneeIds.length) * 100} />
              </span>
              <span className="mt-2 block text-[13px] text-soft tabular">
                {done} of {t.assigneeIds.length} finished · {t.progress.map((p) => name(p.personId).split(" ")[0]).join(", ")}
              </span>
            </button>
          );
        })}
      </Section>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button className="min-h-14 rounded-[16px] bg-navy px-3 text-[15px] font-semibold text-white dark:bg-gold dark:text-navy" onClick={() => go("/app/report-issue")}>
          Report issue
        </button>
        <button className="min-h-14 rounded-[16px] bg-surface px-3 text-[15px] font-semibold" onClick={() => go("/app/availability")}>
          Availability
        </button>
      </div>
    </Page>
  );
}

function OwnerHome() {
  const { data, me, taskStatus, property } = useEstate();
  const go = useGo();
  if (!me) return null;
  const houses = data.properties.filter((p) => me.propertyIds.includes(p.id));
  const open = data.issues.filter((i) => i.reporterId === me.id && i.status !== "closed");
  const staffToday = data.events.filter((e) => dayLabel(e.start) === "Today" && (e.type === "staff" || e.type === "maintenance"));
  const alerts = data.alerts.filter((a) => a.senderId === me.id || a.recipientIds.includes(me.id)).slice(0, 3);

  return (
    <Page large title={<Greeting />} subtitle="Hawthorne Estate">
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {houses.map((p) => (
          <button key={p.id} onClick={() => go(`/app/properties/${p.id}`)} className="w-64 shrink-0 overflow-hidden rounded-[16px] text-left">
            <span className="relative block h-36">
              <Photo name={p.image} alt={p.name} className="h-full w-full" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#0E1B2B]/85 to-transparent" />
              <span className="absolute inset-x-3 bottom-3 text-white">
                <span className="block text-[18px] font-semibold">{p.name}</span>
                <span className="block text-[13px] text-white/80">{p.city}</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      <Section title="Open requests" action={<button className="min-h-11 text-[15px] text-gold-text" onClick={() => go("/app/requests/new")}>New request</button>}>
        <Group>
          {open.length === 0 && <Row title="No open requests" subtitle="A photo request is the fastest way to start one." onClick={() => go("/app/requests/new")} />}
          {open.map((i) => {
            const task = data.tasks.find((t) => t.id === i.taskId);
            const status = task ? taskStatus(task) : i.status === "acknowledged" ? "acknowledged" : "new";
            return <Row key={i.id} title={i.title} subtitle={property(i.propertyId)?.name} trailing={<StatusChip status={status} />} onClick={() => go(`/app/requests/${i.id}`)} />;
          })}
        </Group>
      </Section>

      <Section title="Staff today">
        <Group>
          {staffToday.length === 0 && <Row title="No staff on site" subtitle="Visits and maintenance for today will show here." onClick={() => go("/app/calendar")} />}
          {staffToday.map((e) => (
            <Row key={e.id} title={e.title} subtitle={`${usTime(e.start)} · ${property(e.propertyId)?.name}`} onClick={() => go(`/app/events/${e.id}`)} />
          ))}
        </Group>
      </Section>

      <Section title="Alerts">
        <Group>
          {alerts.length === 0 && <Row title="No active alerts" subtitle="Household notices appear here." onClick={() => go("/app/inbox")} />}
          {alerts.map((a) => (
            <Row key={a.id} title={a.title} subtitle={`${Object.keys(a.acks).length} of ${a.recipientIds.length} acknowledged`} onClick={() => go(`/app/alerts/${a.id}`)} />
          ))}
        </Group>
      </Section>

      <Section title="Shopping" action={<button className="min-h-11 text-[15px] text-gold-text" onClick={() => go("/app/shopping")}>All lists</button>}>
        <Group>
          {data.shopping.length === 0 && <Row title="No shopping lists" subtitle="Approved lists show their progress here." />}
          {data.shopping.map((s) => (
            <Row key={s.id} title={s.title} subtitle={`${s.items.filter((i) => i.status === "received" || i.status === "purchased").length} of ${s.items.length} moving`} onClick={() => go(`/app/shopping/${s.id}`)} />
          ))}
        </Group>
      </Section>
    </Page>
  );
}
