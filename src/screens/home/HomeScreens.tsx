import { useEffect, useState } from "react";
import { Banner, Chip, Group, Hero, Page, Photo, ProgressBar, Row, Section, StatusChip, useGo } from "@/components/ios/ui";
import { dayLabel, money, usTime } from "@/lib/format";
import { useEstate } from "../useEstate";

function Greeting() {
  const [text, setText] = useState("Hello");
  useEffect(() => {
    const h = new Date().getHours();
    setText(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  return <>{text}</>;
}

function PropertyChips() {
  const { data, me, session, completePropertyPick } = useEstate();
  if (!me) return null;
  const mine = data.properties.filter((p) => me.propertyIds.includes(p.id));
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {mine.map((p) => {
        const active = session.activePropertyId === p.id;
        return (
          <button key={p.id} aria-pressed={active} onClick={() => completePropertyPick(p.id)} className="w-36 shrink-0 text-left">
            <span className="relative block h-20 overflow-hidden rounded-[16px]">
              <Photo name={p.image} alt={p.name} className="h-full w-full" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#0E1B2B]/80 to-transparent" />
              <span className="absolute inset-x-2 bottom-2 text-[13px] font-semibold text-white">{p.name}</span>
              {active && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-gold" />}
            </span>
          </button>
        );
      })}
    </div>
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
  const { data, me, session, name, property, taskStatus } = useEstate();
  const go = useGo();
  if (!me) return null;
  const pid = session.activePropertyId;
  const tasks = data.tasks.filter((t) => t.propertyId === pid);
  const pending = tasks.filter((t) => !t.closed && taskStatus(t) !== "completed").length;
  const overdue = tasks.filter((t) => taskStatus(t) === "overdue").length;
  const approvals = data.approvals.filter((a) => a.status === "pending" && a.propertyId === pid).length;
  const low = data.inventory.filter((i) => i.propertyId === pid && i.qty < i.min).length;
  const attention = [
    ...data.issues.filter((i) => i.propertyId === pid && i.status === "new").map((i) => ({ id: i.id, title: i.title, meta: "New issue", href: `/app/issues/${i.id}` })),
    ...data.approvals.filter((a) => a.status === "pending" && a.propertyId === pid).map((a) => ({ id: a.id, title: a.title, meta: a.amount ? money(a.amount) : "Approval", href: `/app/approvals/${a.id}` })),
    ...tasks.filter((t) => taskStatus(t) === "blocked").map((t) => ({ id: t.id, title: t.title, meta: "Blocked", href: `/app/tasks/${t.id}` })),
  ];
  const today = data.events.filter((e) => e.propertyId === pid && dayLabel(e.start) === "Today");
  const weather = pid === "city" ? "48°" : pid === "lake" ? "41°" : "46°";
  return (
    <Page large title={<Greeting />} subtitle={`${me.firstName} · Hawthorne Estate`}>
      <PropertyChips />
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          ["Pending", pending, "/app/tasks"],
          ["Overdue", overdue, "/app/tasks"],
          ["Approvals", approvals, "/app/approvals"],
          ["Low stock", low, "/app/inventory"],
        ].map(([label, value, href]) => (
          <button key={String(label)} onClick={() => go(String(href))} className="rounded-[16px] bg-surface p-4 text-left">
            <span className="block text-[28px] font-bold tabular leading-none">{value}</span>
            <span className="mt-1 block text-[15px] text-soft">{label}</span>
          </button>
        ))}
      </div>
      <Section title="Needs your attention">
        <Group>
          {attention.length === 0 && <Row title="Nothing urgent" subtitle="The house is quiet." />}
          {attention.map((item) => (
            <Row key={item.id} title={item.title} subtitle={item.meta} onClick={() => go(item.href)} />
          ))}
        </Group>
      </Section>
      <Section title="Today" action={<button className="text-[15px] text-gold-text" onClick={() => go("/app/calendar")}>Calendar</button>}>
        <Group>
          {today.length === 0 && <Row title="No events" subtitle="The day is open." />}
          {today.map((e) => (
            <Row key={e.id} title={e.title} subtitle={`${usTime(e.start)} · ${e.location}`} onClick={() => go(`/app/events/${e.id}`)} />
          ))}
        </Group>
      </Section>
      <button onClick={() => go("/app/weather")} className="mt-4 flex w-full items-center justify-between rounded-[16px] bg-navy px-4 py-4 text-left text-white">
        <span>
          <span className="block text-[13px] text-gold">Millbrook · Tomorrow.io in Phase 4</span>
          <span className="block text-[22px] font-semibold">{weather} Partly cloudy</span>
          <span className="block text-[15px] text-white/80">Frost possible overnight near 30°F</span>
        </span>
      </button>
      <Section title="Recent activity">
        <Group>
          {data.audit.slice(0, 4).map((a) => (
            <Row key={a.id} title={a.detail} subtitle={`${name(a.actorId)} · ${dayLabel(a.at)} ${usTime(a.at)}`} onClick={() => go("/app/audit")} />
          ))}
        </Group>
      </Section>
      <div className="mt-4 flex gap-2 overflow-x-auto">
        <Chip onClick={() => go("/app/tasks/new")}>New task</Chip>
        <Chip onClick={() => go("/app/issues")}>Issue inbox</Chip>
        <Chip onClick={() => go("/app/alerts/new")}>Broadcast</Chip>
      </div>
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
  return (
    <Page large title="Today" subtitle={`${me.firstName} · ${me.title}`}>
      <Section title="On the schedule">
        <Group>
          {data.events
            .filter((e) => e.recipientIds.includes(me.id) && dayLabel(e.start) === "Today")
            .map((e) => (
              <Row key={e.id} title={e.title} subtitle={`${usTime(e.start)} · ${property(e.propertyId)?.name}`} onClick={() => go(`/app/events/${e.id}`)} />
            ))}
        </Group>
      </Section>
      <Section title="Due for me">
        <Group>
          {due.length === 0 && <Row title="Nothing due today" subtitle="Check shared work below." />}
          {due.map((t) => (
            <Row key={t.id} title={t.title} subtitle={property(t.propertyId)?.name} trailing={<StatusChip status={taskStatus(t)} />} onClick={() => go(`/app/tasks/${t.id}`)} />
          ))}
        </Group>
      </Section>
      {blocked.length > 0 && (
        <div className="mt-4">
          <Banner tone="warning">{blocked.length} blocked item{blocked.length > 1 ? "s" : ""}. James can see the reason.</Banner>
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
        {shared.map((t) => {
          const done = t.progress.filter((p) => p.status === "completed").length;
          return (
            <button key={t.id} onClick={() => go(`/app/tasks/${t.id}`)} className="mb-3 block w-full rounded-[16px] bg-surface p-4 text-left">
              <span className="text-[17px] font-semibold">{t.title}</span>
              <span className="mt-2 block">
                <ProgressBar value={(done / t.assigneeIds.length) * 100} />
              </span>
              <span className="mt-2 block text-[13px] text-soft tabular">{done} of {t.assigneeIds.length} finished · {t.progress.map((p) => name(p.personId).split(" ")[0]).join(", ")}</span>
            </button>
          );
        })}
      </Section>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button className="min-h-14 rounded-[16px] bg-navy px-3 text-[15px] font-semibold text-white dark:bg-gold dark:text-navy" onClick={() => go("/app/report-issue")}>Report issue</button>
        <button className="min-h-14 rounded-[16px] bg-surface px-3 text-[15px] font-semibold" onClick={() => go("/app/availability")}>Update availability</button>
      </div>
    </Page>
  );
}

function OwnerHome() {
  const { data, me, taskStatus, property } = useEstate();
  const go = useGo();
  if (!me) return null;
  const mine = data.issues.filter((i) => i.reporterId === me.id);
  const open = mine.filter((i) => i.status !== "closed");
  return (
    <Page large title={<Greeting />} subtitle="Hawthorne Estate">
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4">
        {data.properties.filter((p) => me.propertyIds.includes(p.id)).map((p) => (
          <button key={p.id} onClick={() => go(`/app/properties/${p.id}`)} className="w-64 shrink-0 text-left">
            <Hero name={p.image} alt={p.name} className="h-36">
              <p className="text-[20px] font-semibold">{p.name}</p>
              <p className="text-[13px] text-white/85">{p.city}</p>
            </Hero>
          </button>
        ))}
      </div>
      <Section title="Open requests" action={<button className="text-[15px] text-gold-text" onClick={() => go("/app/requests/new")}>New</button>}>
        <Group>
          {open.length === 0 && <Row title="No open requests" subtitle="The house has nothing waiting on you." />}
          {open.map((i) => {
            const task = data.tasks.find((t) => t.id === i.taskId);
            const status = task ? taskStatus(task) : i.status === "acknowledged" ? "acknowledged" : "new";
            return <Row key={i.id} title={i.title} subtitle={property(i.propertyId)?.name} trailing={<StatusChip status={status} />} onClick={() => go(`/app/requests/${i.id}`)} />;
          })}
        </Group>
      </Section>
      <Section title="Staff today">
        <Group>
          {data.events.filter((e) => dayLabel(e.start) === "Today" && (e.type === "staff" || e.type === "maintenance")).map((e) => (
            <Row key={e.id} title={e.title} subtitle={`${usTime(e.start)} · ${property(e.propertyId)?.name}`} onClick={() => go(`/app/events/${e.id}`)} />
          ))}
        </Group>
      </Section>
      <Section title="Alerts">
        <Group>
          {data.alerts.filter((a) => a.senderId === me.id || a.recipientIds.includes(me.id)).slice(0, 3).map((a) => (
            <Row key={a.id} title={a.title} subtitle={`${Object.keys(a.acks).length} of ${a.recipientIds.length} acknowledged`} onClick={() => go(`/app/alerts/${a.id}`)} />
          ))}
        </Group>
      </Section>
      <Section title="Shopping">
        <Group>
          {data.shopping.map((s) => (
            <Row key={s.id} title={s.title} subtitle={`${s.items.filter((i) => i.status === "received" || i.status === "purchased").length} of ${s.items.length} moving`} onClick={() => go(`/app/shopping/${s.id}`)} />
          ))}
        </Group>
      </Section>
    </Page>
  );
}
