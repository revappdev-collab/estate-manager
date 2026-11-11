import { useState, type ReactNode } from "react";
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
  ProgressBar,
  Row,
  SearchField,
  Section,
  Sheet,
  SkeletonList,
  StatusChip,
  Timeline,
  usePhase,
} from "@/components/ios/ui";
import { haptic } from "@/lib/haptic";
import { dayLabel, fullName, todayKey, uid, usDate, usDateTime } from "@/lib/format";
import type { Priority, Task } from "@/mock/types";
import { cn } from "@/lib/utils";
import { useEstate } from "../useEstate";
import { useGo } from "@/components/ios/ui";

type Filter = "all" | "mine" | "overdue" | "blocked" | "review";

const PRIORITY_BAR: Record<Priority, string> = {
  low: "bg-fill",
  medium: "bg-info",
  high: "bg-warning",
  urgent: "bg-danger",
};

export function TaskListScreen() {
  const { data, me, taskStatus, property, person } = useEstate();
  const go = useGo();
  const phase = usePhase();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>(me?.role === "staff" ? "mine" : "all");
  const [priority, setPriority] = useState<Priority | "any">("any");
  if (!me) return null;
  const staff = me.role === "staff";
  const scoped = data.tasks.filter((t) => me.propertyIds.includes(t.propertyId) && (!staff || t.assigneeIds.includes(me.id)));
  const count = (kind: Filter) =>
    scoped.filter((t) => {
      if (kind === "mine") return t.assigneeIds.includes(me.id);
      if (kind === "all") return staff ? t.assigneeIds.length > 1 : true;
      if (kind === "overdue") return taskStatus(t) === "overdue";
      if (kind === "blocked") return taskStatus(t) === "blocked";
      return Boolean(t.reviewRequested || (taskStatus(t) === "completed" && !t.closed));
    }).length;
  const groups: { value: Filter; label: string }[] = staff
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
      ];
  let tasks = scoped.filter((t) => {
    if (staff && filter === "all") return t.assigneeIds.length > 1;
    if (!staff && filter === "mine") return t.assigneeIds.includes(me.id);
    if (filter === "overdue") return taskStatus(t) === "overdue";
    if (filter === "blocked") return taskStatus(t) === "blocked";
    if (filter === "review") return Boolean(t.reviewRequested || (taskStatus(t) === "completed" && !t.closed));
    return true;
  });
  if (priority !== "any") tasks = tasks.filter((t) => t.priority === priority);
  if (q.trim()) tasks = tasks.filter((t) => `${t.title} ${t.room} ${property(t.propertyId)?.name ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  const open = scoped.filter((t) => !t.closed && taskStatus(t) !== "completed").length;
  const overdue = scoped.filter((t) => taskStatus(t) === "overdue").length;

  return (
    <Page large title={staff ? "My Tasks" : "Tasks"} subtitle={staff ? "Work assigned to you" : `${open} open · ${overdue} overdue`}>
      <SearchField value={q} onChange={setQ} placeholder="Search title, room, or house" />
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {groups.map((item) => {
          const on = filter === item.value;
          return (
            <button
              key={item.value}
              aria-pressed={on}
              onClick={() => setFilter(item.value)}
              className={cn("inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold", on ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-surface ring-1 ring-line")}
            >
              {item.label}
              <span className={cn("tabular", on ? "text-white/70 dark:text-navy/70" : "text-soft")}>{count(item.value)}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(["any", "low", "medium", "high", "urgent"] as const).map((item) => (
          <button
            key={item}
            aria-pressed={priority === item}
            onClick={() => setPriority(item)}
            className={cn("h-8 rounded-full px-3 text-[13px] font-semibold capitalize", priority === item ? "bg-gold-soft text-gold-text" : "text-soft")}
          >
            {item === "any" ? "Any priority" : item}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {phase.phase === "loading" && <SkeletonList />}
        {phase.phase === "error" && <ErrorState onRetry={phase.retry} />}
        {phase.phase === "ready" && tasks.length === 0 && (
          <EmptyState image="empty-tasks" title="Nothing in this view" body="Try another filter, or create the next piece of work." action={me.role === "manager" ? <Button onClick={() => go("/app/tasks/new")}>New task</Button> : undefined} />
        )}
        {phase.phase === "ready" &&
          tasks.map((t) => {
            const status = taskStatus(t);
            const people = t.assigneeIds.map((id) => person(id)).filter(Boolean);
            return (
              <button
                key={t.id}
                onClick={() => go(`/app/tasks/${t.id}`)}
                className="flex w-full overflow-hidden rounded-[16px] bg-surface text-left ring-1 ring-line"
              >
                <span className={cn("w-1 shrink-0", PRIORITY_BAR[t.priority])} />
                <span className="min-w-0 flex-1 px-3.5 py-3">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-[17px] font-semibold leading-snug">{t.title}</span>
                    <StatusChip status={status} />
                  </span>
                  <span className="mt-1 block truncate text-[14px] text-soft">
                    {property(t.propertyId)?.name} · {t.room}
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex -space-x-2">
                        {people.slice(0, 3).map((p) => (
                          <span key={p!.id} className="rounded-full ring-2 ring-surface">
                            <Avatar name={fullName(p!)} src={p!.avatar} size={24} />
                          </span>
                        ))}
                      </span>
                      <PriorityChip priority={t.priority} />
                    </span>
                    <span className={cn("shrink-0 text-[13px] font-semibold tabular", status === "overdue" ? "text-danger" : "text-soft")}>
                      {status === "overdue" ? "Overdue" : `Due ${dayLabel(t.due)}`}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
      </div>
    </Page>
  );
}

const TASK_STEPS = ["What", "Where", "Who", "Review"] as const;
const CATEGORIES = ["Household", "Maintenance", "Grounds", "Kitchen", "Guest ready", "Safety"];
const ROOMS = ["General", "Kitchen", "Library", "Guest suite", "Pool", "Grounds"];
const CHECK_IDEAS = ["Confirm access", "Photograph the result", "Tell the family when done"];

function shiftDay(key: string, days: number) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function Choice({ on, children, onClick }: { on: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn("min-h-11 rounded-full px-4 text-[15px] font-semibold", on ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-surface")}
    >
      {children}
    </button>
  );
}

export function TaskCreateScreen() {
  const { data, me, dispatch, pushToast, name, property } = useEstate();
  const go = useGo();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Household");
  const [priority, setPriority] = useState<Priority>("medium");
  const [propertyId, setPropertyId] = useState(me?.propertyIds[0] ?? "main");
  const [room, setRoom] = useState("General");
  const [assignees, setAssignees] = useState<string[]>([]);
  const today = todayKey();
  const [due, setDue] = useState(shiftDay(today, 1));
  const [checks, setChecks] = useState<string[]>(["Confirm access", "Photograph the result"]);
  const [draft, setDraft] = useState("");
  if (!me) return null;

  const houses = data.properties.filter((p) => me.propertyIds.includes(p.id));
  const staff = data.people.filter((p) => p.role === "staff" && !p.revoked && p.propertyIds.includes(propertyId));
  const dueChoices = [
    { label: "Today", value: today },
    { label: "Tomorrow", value: shiftDay(today, 1) },
    { label: "In 3 days", value: shiftDay(today, 3) },
  ];
  const assign = () => {
    const id = uid("task");
    const dueDate = new Date(`${due}T21:00:00.000Z`);
    const task: Task = {
      id,
      title: title.trim() || "Untitled task",
      description: description.trim() || "Created from the house iPhone.",
      category,
      priority,
      propertyId,
      room: room || "General",
      assigneeIds: assignees,
      progress: assignees.map((personId) => ({ personId, status: "new", at: new Date().toISOString() })),
      due: Number.isNaN(dueDate.getTime()) ? new Date().toISOString() : dueDate.toISOString(),
      start: new Date().toISOString(),
      checklist: checks.map((label) => ({ id: uid("c"), label, done: false })),
      comments: [],
      photos: [],
      history: [{ id: uid("h"), at: new Date().toISOString(), actorId: me.id, text: "Task created." }],
      createdBy: me.id,
    };
    dispatch({ type: "create-task", task, actorId: me.id });
    haptic("success");
    pushToast("Task assigned", "Each person will acknowledge their own part.");
    go(`/app/tasks/${id}`);
  };

  return (
    <Page
      back
      title={TASK_STEPS[step]}
      subtitle={`New task · ${step + 1} of ${TASK_STEPS.length}`}
      onBack={() => (step === 0 ? go("/app/tasks") : setStep((n) => n - 1))}
    >
      <div className="mb-4 flex gap-1.5" aria-label="Progress">
        {TASK_STEPS.map((label, i) => (
          <span key={label} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-gold" : "bg-fill")} />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <Field label="What needs doing?" value={title} onChange={setTitle} />
          <Field label="Details" value={description} onChange={setDescription} helper="Optional. A sentence is enough." />
          <div>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-soft">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((item) => (
                <Choice key={item} on={category === item} onClick={() => setCategory(item)}>{item}</Choice>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-soft">Priority</p>
            <div className="grid grid-cols-2 gap-2">
              {(["low", "medium", "high", "urgent"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={priority === item}
                  onClick={() => setPriority(item)}
                  className={cn("min-h-14 rounded-[16px] text-[17px] font-semibold capitalize", priority === item ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-surface")}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-[15px] text-soft">Choose the house, then the room.</p>
          <div className="space-y-2">
            {houses.map((p) => {
              const on = propertyId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setPropertyId(p.id);
                    setAssignees([]);
                  }}
                  className={cn("flex min-h-16 w-full items-center gap-3 rounded-[16px] px-3 text-left", on ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-surface")}
                >
                  <Photo name={p.image} alt="" className="h-12 w-12 rounded-[12px]" />
                  <span className="min-w-0">
                    <span className="block text-[17px] font-semibold">{p.name}</span>
                    <span className={cn("block text-[13px]", on ? "text-white/75 dark:text-navy/70" : "text-soft")}>{p.city}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-soft">Room</p>
            <div className="flex flex-wrap gap-2">
              {ROOMS.map((item) => (
                <Choice key={item} on={room === item} onClick={() => setRoom(item)}>{item}</Choice>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-[15px] text-soft">The task stays open until every person finishes, or you close it.</p>
          {staff.length === 0 && <p className="rounded-[16px] bg-surface px-4 py-4 text-[15px]">No staff are assigned to this house yet.</p>}
          {staff.map((p) => {
            const on = assignees.includes(p.id);
            const avail = data.availability.find((a) => a.personId === p.id && a.date === due);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => setAssignees((list) => (on ? list.filter((id) => id !== p.id) : [...list, p.id]))}
                className={cn("flex min-h-16 w-full items-center gap-3 rounded-[16px] px-3 text-left", on ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-surface")}
              >
                <Avatar name={fullName(p)} src={p.avatar} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-semibold">{fullName(p)}</span>
                  <span className={cn("block text-[13px]", on ? "text-white/75 dark:text-navy/70" : "text-soft")}>{p.title}{avail ? ` · ${avail.state}` : ""}</span>
                </span>
                <span className="text-[15px] font-semibold">{on ? "Added" : "Add"}</span>
              </button>
            );
          })}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-soft">Due</p>
            <div className="flex flex-wrap gap-2">
              {dueChoices.map((item) => (
                <Choice key={item.label} on={due === item.value} onClick={() => setDue(item.value)}>{item.label}</Choice>
              ))}
            </div>
            <label className="mt-3 block text-[13px] text-soft">
              Or pick a date
              <input aria-label="Due date" type="date" value={due} onChange={(e) => setDue(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] border border-line bg-surface px-3 text-[17px] text-ink" />
            </label>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-soft">Checklist</p>
            <div className="flex flex-wrap gap-2">
              {CHECK_IDEAS.map((item) => (
                <Choice
                  key={item}
                  on={checks.includes(item)}
                  onClick={() => setChecks((list) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]))}
                >
                  {item}
                </Choice>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <div className="min-w-0 flex-1">
                <Field label="Add a step" value={draft} onChange={setDraft} />
              </div>
              <button
                type="button"
                className="mt-3 h-12 shrink-0 rounded-[14px] bg-navy px-4 text-[15px] font-semibold text-white dark:bg-gold dark:text-navy"
                onClick={() => {
                  const next = draft.trim() || "Step";
                  setChecks((list) => (list.includes(next) ? list : [...list, next]));
                  setDraft("");
                }}
              >
                Add
              </button>
            </div>
          </div>
          <Group>
            <Row title={title.trim() || "Untitled"} subtitle={`${category} · ${priority}`} />
            <Row title={property(propertyId)?.name ?? "House"} subtitle={room} />
            <Row title={assignees.length ? assignees.map((id) => name(id).split(" ")[0]).join(", ") : "No one yet"} subtitle={`Due ${usDate(`${due}T16:00:00.000Z`)}`} />
            <Row title={checks.length ? `${checks.length} checklist steps` : "No checklist"} subtitle={checks.slice(0, 2).join(" · ")} />
          </Group>
        </div>
      )}

      <div className="mt-6">
        {step < 3 ? (
          <Button onClick={() => setStep((n) => n + 1)}>Continue</Button>
        ) : (
          <Button onClick={assign}>Assign task</Button>
        )}
      </div>
    </Page>
  );
}

const SEED_GALLERY: Record<string, string[]> = {
  "t-gate": ["vendor-security", "property-1", "maint-before-2"],
  "t-bulb": ["maint-before-1", "vendor-electric", "maint-after-1"],
};

const WORK_FLOW = [
  { id: "new", label: "New" },
  { id: "acknowledged", label: "Seen" },
  { id: "in_progress", label: "Doing" },
  { id: "completed", label: "Done" },
] as const;

export function TaskDetailScreen({ id }: { id: string }) {
  const { data, me, dispatch, pushToast, name, person, property, taskStatus } = useEstate();
  const go = useGo();
  const task = data.tasks.find((t) => t.id === id);
  const [comment, setComment] = useState("");
  const [reassign, setReassign] = useState(false);
  const [block, setBlock] = useState(false);
  const [reason, setReason] = useState("");
  const [picked, setPicked] = useState<string[]>(task?.assigneeIds ?? []);
  const [shot, setShot] = useState(0);
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
  const nextCheck = task.checklist.findIndex((c) => !c.done);
  const storedPhotos = task.photos ?? [];
  const gallery = storedPhotos.length > 1 ? storedPhotos : SEED_GALLERY[task.id] ?? storedPhotos;
  const photos = gallery;
  const photoIndex = photos.length === 0 ? 0 : Math.min(shot, photos.length - 1);
  const flowKey = status === "closed" ? "completed" : status === "overdue" || status === "blocked" ? "in_progress" : status;
  const flowIndex = Math.max(0, WORK_FLOW.findIndex((s) => s.id === flowKey));
  const act = (statusName: "acknowledged" | "in_progress" | "blocked" | "completed", note?: string, photo?: string) => {
    dispatch({ type: "task-progress", taskId: task.id, personId: me.id, status: statusName, note, photo, actorId: me.id });
    haptic(statusName === "blocked" ? "warning" : "success");
    pushToast(statusName === "completed" ? "Your part is complete" : statusName === "acknowledged" ? "Acknowledged" : "Updated");
  };
  const nextStep =
    mine?.status === "new"
      ? { label: "Acknowledge", hint: "Let the house know you have seen this.", run: () => act("acknowledged") }
      : mine?.status === "acknowledged"
        ? { label: "Start work", hint: "Move this to in progress when you are on site.", run: () => act("in_progress") }
        : mine?.status === "blocked"
          ? { label: "Resume work", hint: "The block is recorded. Continue when you can.", run: () => act("in_progress") }
          : mine?.status === "in_progress"
            ? { label: "Mark my work complete", hint: "The task stays open until everyone assigned is done.", run: () => act("completed", "My work is complete.") }
            : null;

  return (
    <Page back title="Task">
      <p className="text-[13px] font-semibold tracking-wide text-soft uppercase">{property(task.propertyId)?.name} · {task.room}</p>
      <h1 className="mt-1 text-[28px] font-bold leading-tight">{task.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusChip status={status} />
        <PriorityChip priority={task.priority} />
        <span className="text-[14px] text-soft">Due {usDateTime(task.due)}{task.recurring ? ` · ${task.recurring}` : ""}</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1.5" aria-label="Work flow">
        {WORK_FLOW.map((step, i) => (
          <div key={step.id}>
            <div className={cn("h-1.5 rounded-full", i <= flowIndex ? "bg-gold" : "bg-fill")} />
            <p className={cn("mt-1 text-center text-[11px] font-semibold", i === flowIndex ? "text-ink" : "text-soft")}>{step.label}</p>
          </div>
        ))}
      </div>
      {status === "blocked" && <div className="mt-3"><Banner tone="warning">This work is blocked. The reason is on the person who marked it.</Banner></div>}
      {task.reviewRequested && <div className="mt-3"><Banner tone="warning">Review requested. It stays open until you close it.</Banner></div>}

      <div className="mt-4">
        {photos.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-[16px] ring-1 ring-line">
              <Photo name={photos[photoIndex]} alt={`${task.title}, photo ${photoIndex + 1}`} className="h-56 w-full" />
            </div>
            <p className="mt-2 text-[13px] text-soft">Photo {photoIndex + 1} of {photos.length}</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {photos.map((p, i) => (
                <button
                  key={`${p}-${i}`}
                  aria-label={`Show photo ${i + 1}`}
                  aria-pressed={i === photoIndex}
                  onClick={() => setShot(i)}
                  className={cn("h-16 w-16 shrink-0 overflow-hidden rounded-[12px] ring-2", i === photoIndex ? "ring-gold" : "ring-transparent")}
                >
                  <Photo name={p} alt="" className="h-full w-full" />
                </button>
              ))}
              {me.role !== "owner" && (
                <label className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-[12px] bg-surface text-[12px] font-semibold text-gold-text ring-1 ring-line">
                  Add
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        dispatch({ type: "task-photo", taskId: task.id, photo: String(reader.result), actorId: me.id });
                        setShot(0);
                        pushToast("Photo added");
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              )}
            </div>
          </>
        ) : (
          me.role !== "owner" && <p className="text-[15px] text-soft">No photos yet.</p>
        )}
      </div>

      <p className="mt-4 text-[17px] leading-snug">{task.description}</p>
      {task.issueId && (
        <button className="mt-3 text-[15px] font-semibold text-gold-text" onClick={() => go(`/app/issues/${task.issueId}`)}>
          Open the original report
        </button>
      )}

      {nextStep && me.role !== "owner" && !task.closed && (
        <div className="mt-4 rounded-[16px] bg-surface p-4 ring-1 ring-line">
          <p className="text-[13px] font-semibold tracking-wide text-soft uppercase">Your step</p>
          <p className="mt-1 text-[15px] text-soft">{nextStep.hint}</p>
          <div className="mt-3 space-y-2">
            <Button onClick={nextStep.run}>{nextStep.label}</Button>
            {mine && mine.status !== "completed" && mine.status !== "blocked" && (
              <Button tone="secondary" onClick={() => setBlock(true)}>Mark blocked</Button>
            )}
          </div>
        </div>
      )}

      <Section title={task.checklist.length ? `Checklist · ${doneCount} of ${task.checklist.length}` : "Checklist"}>
        {task.checklist.length > 0 && <ProgressBar value={task.checklist.length ? (doneCount / task.checklist.length) * 100 : 0} />}
        <div className="mt-3 overflow-hidden rounded-[16px] bg-surface ring-1 ring-line">
          {task.checklist.length === 0 && <p className="px-4 py-4 text-[15px] text-soft">No steps on this task.</p>}
          {task.checklist.map((c, i) => {
            const current = i === nextCheck;
            return (
              <button
                key={c.id}
                onClick={() => dispatch({ type: "toggle-check", taskId: task.id, checkId: c.id, actorId: me.id })}
                className={cn("flex min-h-16 w-full items-center gap-3 border-b border-line px-4 text-left last:border-b-0", current && "bg-gold-soft/60")}
              >
                <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold", c.done ? "bg-success text-white" : current ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-fill text-soft")}>
                  {c.done ? "✓" : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[17px]", c.done && "text-soft line-through")}>{c.label}</span>
                  {current && <span className="block text-[13px] text-gold-text">Up next</span>}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

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
                trailing={<StatusChip status={p.status} />}
              />
            );
          })}
        </Group>
        <p className="mt-2 text-[13px] text-soft">It closes when every person finishes, or when the manager closes it.</p>
      </Section>

      <Section title="Comments">
        <Group>
          {task.comments.length === 0 && <Row title="No notes yet" subtitle="Use @ and a first name to tag someone." />}
          {task.comments.map((c) => (
            <Row key={c.id} title={name(c.authorId)} subtitle={c.body} />
          ))}
        </Group>
        <div className="mt-2 flex gap-2">
          <input aria-label="Comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a note, use @Maria" className="h-12 min-w-0 flex-1 rounded-[14px] border border-line bg-surface px-3 text-[17px]" />
          <button className="h-12 rounded-[14px] bg-navy px-4 font-semibold text-white dark:bg-gold dark:text-navy" onClick={() => { dispatch({ type: "comment", taskId: task.id, authorId: me.id, body: comment.trim() || "Note" }); setComment(""); pushToast("Comment sent"); }}>Send</button>
        </div>
      </Section>

      <Section title="History">
        <Timeline items={[...task.history].sort((a, b) => a.at.localeCompare(b.at)).map((h) => ({ title: h.text, detail: name(h.actorId), at: usDateTime(h.at), tone: "done" as const }))} />
      </Section>

      {me.role === "manager" && !task.closed && (
        <div className="mt-2 space-y-2">
          <Button tone="secondary" onClick={() => setReassign(true)}>Reassign</Button>
          <Button tone="secondary" onClick={() => { dispatch({ type: "request-review", taskId: task.id, actorId: me.id }); pushToast("Review requested"); }}>Request review</Button>
          <Button onClick={() => { dispatch({ type: "close-task", taskId: task.id, actorId: me.id }); haptic("success"); pushToast("Approved and closed"); }}>Approve and close</Button>
        </div>
      )}

      <Sheet open={block} onClose={() => setBlock(false)} title="Blocked">
        <Field label="Reason" value={reason} onChange={setReason} />
        <div className="mt-3">
          <Button onClick={() => { act("blocked", reason.trim() || "Blocked"); setBlock(false); }}>Save block</Button>
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
