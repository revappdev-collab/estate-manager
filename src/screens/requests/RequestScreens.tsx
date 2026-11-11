import { useState } from "react";
import { Avatar, Button, EmptyState, Field, Group, Page, Photo, PriorityChip, Row, Section, StatusChip, Timeline, useGo } from "@/components/ios/ui";
import { haptic } from "@/lib/haptic";
import { fullName, uid, usDateTime } from "@/lib/format";
import type { Issue, Priority } from "@/mock/types";
import { useEstate } from "../useEstate";

async function readFile(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function RequestListScreen() {
  const { data, me, taskStatus, property } = useEstate();
  const go = useGo();
  if (!me) return null;
  const mine = data.issues.filter((i) => (me.role === "owner" ? i.reporterId === me.id : me.propertyIds.includes(i.propertyId)));
  return (
    <Page large title={me.role === "owner" ? "Requests" : "Issues"} subtitle="Photo reports from the house">
      {mine.length === 0 && <EmptyState image="empty-tasks" title="No requests yet" body="A photo is the fastest way to start one." action={<Button onClick={() => go("/app/requests/new")}>Create request</Button>} />}
      <div className="space-y-3">
        {mine.map((i) => {
          const task = data.tasks.find((t) => t.id === i.taskId);
          const status = i.status === "closed" ? "closed" : task ? taskStatus(task) : i.status === "acknowledged" ? "acknowledged" : "new";
          return (
            <button key={i.id} onClick={() => go(me.role === "owner" ? `/app/requests/${i.id}` : `/app/issues/${i.id}`)} className="block w-full overflow-hidden rounded-[16px] bg-surface text-left">
              {i.photo && <Photo name={i.photo} alt="" className="h-36 w-full" />}
              <span className="block p-4">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[17px] font-semibold">{i.title}</span>
                  <StatusChip status={status} />
                </span>
                <span className="mt-1 block text-[15px] text-soft">{property(i.propertyId)?.name} · {i.room}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Page>
  );
}

export function RequestCreateScreen({ staff = false }: { staff?: boolean }) {
  const { data, me, dispatch, pushToast } = useEstate();
  const go = useGo();
  const [photo, setPhoto] = useState<string>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyId, setPropertyId] = useState("main");
  const [room, setRoom] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [due, setDue] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [done, setDone] = useState<string>();
  const [error, setError] = useState("");
  if (!me) return null;
  if (done) {
    return (
      <Page title="Sent">
        <h1 className="text-[34px] font-bold">James has the photo</h1>
        <p className="mt-2 text-[17px] text-soft">You’ll see acknowledgement, progress, and the close on the request itself.</p>
        <div className="mt-6"><Button onClick={() => go(`/app/requests/${done}`)}>View live status</Button></div>
      </Page>
    );
  }
  const taggable = data.people.filter((p) => p.id !== me.id && !p.revoked && (p.role !== "owner" || staff));
  return (
    <Page back title={staff ? "Report issue" : "New request"}>
      <label className="mb-4 flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-[16px] bg-navy text-center text-white">
        {photo ? <img src={photo} alt="Selected issue" className="h-full w-full object-cover" /> : <span className="px-6 text-[17px]">Take a photo or choose one</span>}
        <input
          aria-label="Add photo"
          className="sr-only"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) setPhoto(await readFile(file));
          }}
        />
      </label>
      <div className="space-y-3">
        <Field label="Title" value={title} onChange={setTitle} error={error || undefined} />
        <Field label="What should we know" value={description} onChange={setDescription} />
        <label className="block text-[13px] text-soft">Property
          <select aria-label="Property" className="mt-1 h-12 w-full rounded-[14px] bg-surface px-3 text-[17px]" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
            {data.properties.filter((p) => me.propertyIds.includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <Field label="Room or asset" value={room} onChange={setRoom} />
        <label className="block text-[13px] text-soft">Priority
          <select aria-label="Priority" className="mt-1 h-12 w-full rounded-[14px] bg-surface px-3 text-[17px]" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="block text-[13px] text-soft">Due, if it matters
          <input aria-label="Due date" type="date" value={due} onChange={(e) => setDue(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] bg-surface px-3 text-[17px]" />
        </label>
        <p className="text-[15px] font-semibold">Tag</p>
        <div className="flex flex-wrap gap-2">
          {taggable.map((p) => (
            <button key={p.id} aria-pressed={tags.includes(p.id)} onClick={() => setTags((list) => list.includes(p.id) ? list.filter((id) => id !== p.id) : [...list, p.id])} className="min-h-11 rounded-full bg-fill px-3 text-[15px]">
              {p.firstName} {tags.includes(p.id) ? "✓" : ""}
            </button>
          ))}
        </div>
        <Button
          onClick={() => {
            if (title.trim().length < 3) {
              setError("Give the request a short title.");
              return;
            }
            const issue: Issue = {
              id: uid("iss"),
              title: title.trim(),
              description: description.trim() || "Photo attached.",
              propertyId,
              room: room || "General",
              category: "Household",
              priority,
              reporterId: me.id,
              taggedIds: tags,
              status: "new",
              photo,
              due: due ? new Date(`${due}T21:00:00.000Z`).toISOString() : undefined,
              createdAt: new Date().toISOString(),
            };
            dispatch({ type: "create-issue", issue, actorId: me.id });
            haptic("success");
            pushToast("Request sent");
            setDone(issue.id);
          }}
        >
          Send
        </Button>
      </div>
    </Page>
  );
}

export function RequestDetailScreen({ id }: { id: string }) {
  const { data, me, taskStatus, name, person, property } = useEstate();
  const go = useGo();
  const issue = data.issues.find((i) => i.id === id);
  if (!issue || !me) {
    return <Page back title="Request"><EmptyState image="empty-tasks" title="Request not found" body="It may belong to another property." /></Page>;
  }
  const task = data.tasks.find((t) => t.id === issue.taskId);
  const status = issue.status === "closed" || task?.closed ? "closed" : task ? taskStatus(task) : issue.status === "acknowledged" ? "acknowledged" : "new";
  const steps = [
    { title: "New", tone: "done" as const, detail: `Reported by ${name(issue.reporterId)}`, at: usDateTime(issue.createdAt) },
    { title: "Acknowledged", tone: issue.status === "new" ? "wait" as const : "done" as const, detail: issue.status === "new" ? "Waiting on the estate manager" : "James has seen it" },
    { title: "In progress", tone: task && ["in_progress", "blocked", "completed", "closed", "overdue"].includes(taskStatus(task)) ? "now" as const : "wait" as const, detail: task ? task.progress.map((p) => `${name(p.personId)} · ${p.status.replace("_", " ")}`).join(" · ") : "Not assigned yet" },
    { title: "Completed", tone: task && (taskStatus(task) === "completed" || task.closed) ? "done" as const : "wait" as const },
    { title: "Closed", tone: task?.closed || issue.status === "closed" ? "done" as const : "wait" as const },
  ];
  return (
    <Page back title="Request">
      {issue.photo && <Photo name={issue.photo} alt={issue.title} className="mb-4 h-52 w-full rounded-[16px]" />}
      <div className="flex flex-wrap gap-2"><StatusChip status={status} /><PriorityChip priority={issue.priority} /></div>
      <h1 className="mt-3 text-[28px] font-bold leading-tight">{issue.title}</h1>
      <p className="mt-2 text-[17px]">{issue.description}</p>
      <p className="mt-2 text-[15px] text-soft">{property(issue.propertyId)?.name} · {issue.room}</p>
      <Section title="Status">
        <Timeline items={steps} />
      </Section>
      {task && (
        <Section title="Who has it">
          <Group>
            {task.progress.map((p) => {
              const who = person(p.personId);
              return <Row key={p.personId} leading={who ? <Avatar name={fullName(who)} src={who.avatar} /> : undefined} title={name(p.personId)} subtitle={p.note || p.status.replace("_", " ")} trailing={<StatusChip status={p.status === "blocked" ? "blocked" : p.status === "completed" ? "completed" : p.status === "acknowledged" ? "acknowledged" : p.status === "in_progress" ? "in_progress" : "new"} />} />;
            })}
          </Group>
          {me.role !== "owner" && <button className="mt-3 text-[17px] text-gold-text" onClick={() => go(`/app/tasks/${task.id}`)}>Open the task</button>}
        </Section>
      )}
      {task && task.photos.length > 0 && (
        <Section title="Photos">
          <div className="grid grid-cols-2 gap-2">
            {task.photos.map((p) => <Photo key={p} name={p} alt="Progress photo" className="h-28 rounded-[16px]" />)}
          </div>
        </Section>
      )}
    </Page>
  );
}

export function IssueInboxScreen() {
  const { data, me, dispatch, pushToast, name } = useEstate();
  const go = useGo();
  const [assignFor, setAssignFor] = useState<string>();
  const [picked, setPicked] = useState<string[]>(["maria"]);
  if (!me) return null;
  const issues = data.issues.filter((i) => i.status !== "closed");
  return (
    <Page back title="Issue inbox">
      {issues.length === 0 && <EmptyState image="empty-inbox" title="Inbox is clear" body="New photo reports from the family and staff land here." />}
      <div className="space-y-3">
        {issues.map((i) => (
          <article key={i.id} className="overflow-hidden rounded-[16px] bg-surface">
            {i.photo && <Photo name={i.photo} alt="" className="h-40 w-full" />}
            <div className="p-4">
              <p className="text-[17px] font-semibold">{i.title}</p>
              <p className="text-[15px] text-soft">{name(i.reporterId)} · {i.room}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {i.status === "new" && <button className="min-h-11 rounded-[14px] bg-navy px-3 text-[15px] font-semibold text-white" onClick={() => { dispatch({ type: "ack-issue", issueId: i.id, actorId: me.id }); haptic("success"); pushToast("Acknowledged"); }}>Acknowledge</button>}
                {i.status !== "converted" && <button className="min-h-11 rounded-[14px] bg-fill px-3 text-[15px] font-semibold" onClick={() => { setAssignFor(i.id); setPicked(["maria"]); }}>Assign</button>}
                <button className="min-h-11 px-2 text-[15px] text-gold-text" onClick={() => go(`/app/issues/${i.id}`)}>Details</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {assignFor && (
        <div className="mt-4 rounded-[16px] bg-surface p-4">
          <p className="text-[17px] font-semibold">Assign to</p>
          {data.people.filter((p) => p.role === "staff").map((p) => (
            <button key={p.id} className="flex min-h-11 w-full items-center justify-between" onClick={() => setPicked((list) => list.includes(p.id) ? list.filter((id) => id !== p.id) : [...list, p.id])}>
              <span>{fullName(p)}</span><span className="text-gold-text">{picked.includes(p.id) ? "Added" : "Add"}</span>
            </button>
          ))}
          <Button onClick={() => { dispatch({ type: "convert-issue", issueId: assignFor, assigneeIds: picked, actorId: me.id }); haptic("success"); pushToast("Assigned"); setAssignFor(undefined); }}>Create task</Button>
        </div>
      )}
    </Page>
  );
}

export function IssueDetailScreen({ id }: { id: string }) {
  return <RequestDetailScreen id={id} />;
}
