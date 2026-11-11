import { useState } from "react";
import {
  Avatar,
  Banner,
  Button,
  EmptyState,
  ErrorState,
  Field,
  Group,
  Page,
  Photo,
  PriorityChip,
  Row,
  SearchField,
  Section,
  Segmented,
  Sheet,
  SkeletonList,
  StatusChip,
  SwipeRow,
  Timeline,
  usePhase,
} from "@/components/ios/ui";
import { haptic } from "@/lib/haptic";
import { dayLabel, fullName, uid, usDateTime } from "@/lib/format";
import type { Priority, Task } from "@/mock/types";
import { useEstate } from "../useEstate";
import { useGo } from "@/components/ios/ui";

type Filter = "all" | "mine" | "overdue" | "blocked" | "review";

export function TaskListScreen() {
  const { data, me, taskStatus, property } = useEstate();
  const go = useGo();
  const phase = usePhase();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>(me?.role === "staff" ? "mine" : "all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priority, setPriority] = useState<Priority | "any">("any");
  if (!me) return null;
  const staff = me.role === "staff";
  let tasks = data.tasks.filter((t) => me.propertyIds.includes(t.propertyId));
  if (staff) tasks = tasks.filter((t) => t.assigneeIds.includes(me.id) && (filter !== "all" || t.assigneeIds.length > 1));
  if (!staff && filter === "mine") tasks = tasks.filter((t) => t.assigneeIds.includes(me.id));
  if (filter === "overdue") tasks = tasks.filter((t) => taskStatus(t) === "overdue");
  if (filter === "blocked") tasks = tasks.filter((t) => taskStatus(t) === "blocked");
  if (filter === "review") tasks = tasks.filter((t) => t.reviewRequested || (taskStatus(t) === "completed" && !t.closed));
  if (priority !== "any") tasks = tasks.filter((t) => t.priority === priority);
  if (q.trim()) tasks = tasks.filter((t) => `${t.title} ${t.room}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <Page large title={staff ? "My Tasks" : "Tasks"} subtitle="Hawthorne Estate" trailing={<button className="min-h-11 px-2 text-[17px] text-gold-text" onClick={() => setFiltersOpen(true)}>Filter</button>}>
      <SearchField value={q} onChange={setQ} placeholder="Search tasks" />
      <div className="mt-3">
        <Segmented
          label="Task groups"
          value={filter}
          onChange={setFilter}
          options={staff
            ? [
                { value: "mine", label: "Mine" },
                { value: "all", label: "Shared" },
                { value: "overdue", label: "Overdue" },
                { value: "blocked", label: "Blocked" },
              ]
            : [
                { value: "all", label: "All" },
                { value: "mine", label: "Mine" },
                { value: "overdue", label: "Overdue" },
                { value: "blocked", label: "Blocked" },
                { value: "review", label: "Review" },
              ]}
        />
      </div>
      <div className="mt-4">
        {phase.phase === "loading" && <SkeletonList />}
        {phase.phase === "error" && <ErrorState onRetry={phase.retry} />}
        {phase.phase === "ready" && tasks.length === 0 && (
          <EmptyState image="empty-tasks" title="Nothing in this view" body="Try another filter, or create the next piece of work." action={me.role === "manager" ? <Button onClick={() => go("/app/tasks/new")}>New task</Button> : undefined} />
        )}
        {phase.phase === "ready" &&
          tasks.map((t) => (
            <SwipeRow
              key={t.id}
              label={staff ? "Open" : "Review"}
              onAction={() => go(`/app/tasks/${t.id}`)}
            >
              <button onClick={() => go(`/app/tasks/${t.id}`)} className="block w-full rounded-[16px] bg-surface p-4 text-left">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[17px] font-semibold">{t.title}</span>
                  <StatusChip status={taskStatus(t)} />
                </span>
                <span className="mt-1 block text-[15px] text-soft">{property(t.propertyId)?.name} · {t.room}</span>
                <span className="mt-2 flex items-center justify-between">
                  <PriorityChip priority={t.priority} />
                  <span className="text-[13px] text-soft tabular">Due {dayLabel(t.due)}</span>
                </span>
              </button>
            </SwipeRow>
          ))}
      </div>
      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <p className="mb-2 text-[15px] text-soft">Priority</p>
        <div className="flex flex-wrap gap-2">
          {(["any", "low", "medium", "high", "urgent"] as const).map((p) => (
            <button key={p} onClick={() => setPriority(p)} className="min-h-11 rounded-full bg-fill px-4 text-[15px] capitalize">{p}</button>
          ))}
        </div>
        <div className="mt-4"><Button onClick={() => setFiltersOpen(false)}>Show tasks</Button></div>
      </Sheet>
    </Page>
  );
}

export function TaskCreateScreen() {
  const { data, me, dispatch, pushToast } = useEstate();
  const go = useGo();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Household");
  const [priority, setPriority] = useState<Priority>("medium");
  const [propertyId, setPropertyId] = useState(me?.propertyIds[0] ?? "main");
  const [room, setRoom] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [due, setDue] = useState("2026-11-13");
  const [checks, setChecks] = useState("Confirm access, Photograph the result");
  const [error, setError] = useState("");
  if (!me) return null;
  const staff = data.people.filter((p) => p.role === "staff" && !p.revoked && p.propertyIds.includes(propertyId));
  return (
    <Page back title="New task">
      <div className="space-y-3">
        <Field label="Title" value={title} onChange={setTitle} error={error || undefined} />
        <Field label="Description" value={description} onChange={setDescription} />
        <Field label="Category" value={category} onChange={setCategory} />
        <Field label="Room or asset" value={room} onChange={setRoom} />
        <label className="block text-[13px] text-soft">Property
          <select aria-label="Property" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-line bg-surface px-3 text-[17px]">
            {data.properties.filter((p) => me.propertyIds.includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="block text-[13px] text-soft">Priority
          <select aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="mt-1 h-12 w-full rounded-[14px] border border-line bg-surface px-3 text-[17px]">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="block text-[13px] text-soft">Due
          <input aria-label="Due date" type="date" value={due} onChange={(e) => setDue(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-line bg-surface px-3 text-[17px]" />
        </label>
        <p className="text-[15px] font-semibold">Assignees</p>
        <div className="space-y-2">
          {staff.map((p) => {
            const on = assignees.includes(p.id);
            const avail = data.availability.find((a) => a.personId === p.id && a.date === due);
            return (
              <button key={p.id} aria-pressed={on} onClick={() => setAssignees((list) => on ? list.filter((id) => id !== p.id) : [...list, p.id])} className="flex min-h-14 w-full items-center gap-3 rounded-[16px] bg-surface px-3 text-left">
                <Avatar name={fullName(p)} src={p.avatar} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px]">{fullName(p)}</span>
                  <span className="block text-[13px] text-soft">{avail ? `${avail.state} · ${avail.note}` : "No block on that day"}</span>
                </span>
                <span className="text-[15px] text-gold-text">{on ? "Added" : "Add"}</span>
              </button>
            );
          })}
        </div>
        <Field label="Checklist, comma separated" value={checks} onChange={setChecks} />
        <Button
          onClick={() => {
            if (title.trim().length < 3 || assignees.length === 0) {
              setError("Add a title and at least one assignee.");
              return;
            }
            const id = uid("task");
            const task: Task = {
              id,
              title: title.trim(),
              description: description.trim() || "Created from the house iPhone.",
              category,
              priority,
              propertyId,
              room: room || "General",
              assigneeIds: assignees,
              progress: assignees.map((personId) => ({ personId, status: "new", at: new Date().toISOString() })),
              due: new Date(`${due}T21:00:00.000Z`).toISOString(),
              start: new Date().toISOString(),
              checklist: checks.split(",").map((label) => label.trim()).filter(Boolean).map((label) => ({ id: uid("c"), label, done: false })),
              comments: [],
              photos: [],
              history: [{ id: uid("h"), at: new Date().toISOString(), actorId: me.id, text: "Task created." }],
              createdBy: me.id,
            };
            dispatch({ type: "create-task", task, actorId: me.id });
            haptic("success");
            pushToast("Task assigned", "Each person will acknowledge their own part.");
            go(`/app/tasks/${id}`);
          }}
        >
          Assign task
        </Button>
      </div>
    </Page>
  );
}

export function TaskDetailScreen({ id }: { id: string }) {
  const { data, me, dispatch, pushToast, name, person, property, taskStatus } = useEstate();
  const task = data.tasks.find((t) => t.id === id);
  const [comment, setComment] = useState("");
  const [reassign, setReassign] = useState(false);
  const [block, setBlock] = useState(false);
  const [reason, setReason] = useState("");
  const [picked, setPicked] = useState<string[]>(task?.assigneeIds ?? []);
  if (!me) return null;
  if (!task) {
    return (
      <Page back title="Task">
        <EmptyState image="empty-tasks" title="This task is gone" body="It may have been closed on another device." />
      </Page>
    );
  }
  const status = taskStatus(task);
  const mine = task.progress.find((p) => p.personId === me.id);
  const doneCount = task.checklist.filter((c) => c.done).length;
  const act = (statusName: "acknowledged" | "in_progress" | "blocked" | "completed", note?: string, photo?: string) => {
    dispatch({ type: "task-progress", taskId: task.id, personId: me.id, status: statusName, note, photo, actorId: me.id });
    haptic(statusName === "blocked" ? "warning" : "success");
    pushToast(statusName === "completed" ? "Your part is complete" : statusName === "acknowledged" ? "Acknowledged" : "Updated");
  };
  return (
    <Page back title="Task">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-soft">{property(task.propertyId)?.name} · {task.room}</p>
      <h1 className="mt-1 text-[28px] font-bold leading-tight">{task.title}</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusChip status={status} />
        <PriorityChip priority={task.priority} />
      </div>
      <p className="mt-3 text-[17px]">{task.description}</p>
      <p className="mt-2 text-[15px] text-soft">Due {usDateTime(task.due)}{task.recurring ? ` · ${task.recurring}` : ""}</p>
      {task.reviewRequested && <div className="mt-3"><Banner tone="warning">Review requested. Overall status stays open until you close it.</Banner></div>}
      {task.photos[0] && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {task.photos.slice(0, 4).map((p) => (
            <Photo key={p} name={p} alt="Task photo" className="h-28 w-full rounded-[16px]" />
          ))}
        </div>
      )}
      <Section title="People">
        <Group>
          {task.progress.map((p) => {
            const who = person(p.personId);
            return (
              <Row
                key={p.personId}
                leading={who ? <Avatar name={fullName(who)} src={who.avatar} /> : undefined}
                title={name(p.personId)}
                subtitle={p.note || usDateTime(p.at)}
                trailing={<StatusChip status={p.status === "new" ? "new" : p.status} />}
              />
            );
          })}
        </Group>
        <p className="mt-2 text-[13px] text-soft">Overall completes only when every assignee finishes, or when the manager closes it.</p>
      </Section>
      {me.role !== "owner" && mine && !task.closed && (
        <div className="mt-4 space-y-2">
          {mine.status === "new" && <Button onClick={() => act("acknowledged")}>Acknowledge</Button>}
          {(mine.status === "acknowledged" || mine.status === "new") && <Button tone="secondary" onClick={() => act("in_progress")}>Accept / In progress</Button>}
          {mine.status !== "completed" && mine.status !== "blocked" && <Button tone="secondary" onClick={() => setBlock(true)}>Mark blocked</Button>}
          {mine.status !== "completed" && <Button onClick={() => act("completed", "My work is complete.")}>Mark my work complete</Button>}
        </div>
      )}
      <Section title={`Checklist · ${doneCount} of ${task.checklist.length}`}>
        <Group>
          {task.checklist.length === 0 && <Row title="No checklist" />}
          {task.checklist.map((c) => (
            <button key={c.id} onClick={() => dispatch({ type: "toggle-check", taskId: task.id, checkId: c.id, actorId: me.id })} className="flex min-h-14 w-full items-center gap-3 border-b border-line px-4 text-left last:border-b-0">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${c.done ? "border-success bg-success text-white" : "border-line"}`}>{c.done ? "✓" : ""}</span>
              <span className={c.done ? "text-soft line-through" : ""}>{c.label}</span>
            </button>
          ))}
        </Group>
      </Section>
      <Section title="Comments">
        <Group>
          {task.comments.map((c) => (
            <Row key={c.id} title={name(c.authorId)} subtitle={c.body} />
          ))}
        </Group>
        <div className="mt-2 flex gap-2">
          <input aria-label="Comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a note, use @Maria" className="h-12 flex-1 rounded-[14px] border border-line bg-surface px-3 text-[17px]" />
          <button className="h-12 rounded-[14px] bg-navy px-4 font-semibold text-white dark:bg-gold dark:text-navy" onClick={() => { if (!comment.trim()) return; dispatch({ type: "comment", taskId: task.id, authorId: me.id, body: comment.trim() }); setComment(""); pushToast("Comment sent"); }}>Send</button>
        </div>
      </Section>
      <Section title="History">
        <Timeline items={task.history.map((h) => ({ title: h.text, detail: name(h.actorId), at: usDateTime(h.at), tone: "done" as const }))} />
      </Section>
      {me.role === "manager" && !task.closed && (
        <div className="mt-2 space-y-2">
          <Button tone="secondary" onClick={() => setReassign(true)}>Reassign</Button>
          <Button tone="secondary" onClick={() => { dispatch({ type: "request-review", taskId: task.id, actorId: me.id }); pushToast("Review requested"); }}>Request review</Button>
          <Button onClick={() => { dispatch({ type: "close-task", taskId: task.id, actorId: me.id }); haptic("success"); pushToast("Approved and closed"); }}>Approve & close</Button>
        </div>
      )}
      <Sheet open={block} onClose={() => setBlock(false)} title="Blocked">
        <Field label="Reason" value={reason} onChange={setReason} />
        <div className="mt-3">
          <Button onClick={() => { if (!reason.trim()) return; act("blocked", reason.trim(), "room-garden"); setBlock(false); }}>Save block</Button>
        </div>
      </Sheet>
      <Sheet open={reassign} onClose={() => setReassign(false)} title="Reassign" tall>
        {data.people.filter((p) => p.role === "staff").map((p) => (
          <button key={p.id} className="flex min-h-12 w-full items-center justify-between text-left" onClick={() => setPicked((list) => list.includes(p.id) ? list.filter((x) => x !== p.id) : [...list, p.id])}>
            <span className="text-[17px]">{fullName(p)}</span>
            <span className="text-[15px] text-gold-text">{picked.includes(p.id) ? "On" : "Off"}</span>
          </button>
        ))}
        <div className="mt-3"><Button onClick={() => { dispatch({ type: "reassign", taskId: task.id, assigneeIds: picked, actorId: me.id }); setReassign(false); pushToast("Reassigned"); }}>Save</Button></div>
      </Sheet>
    </Page>
  );
}
