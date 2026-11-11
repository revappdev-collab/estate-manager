import { useState } from "react";
import { AddPropertySheet } from "@/components/AddPropertySheet";
import { Banner, Button, EmptyState, Field, Group, Hero, Locked, Page, Photo, PriorityChip, ProgressBar, Row, SearchField, Section, Segmented, ShareSheet, StatusChip, Timeline, useGo } from "@/components/ios/ui";
import { dayLabel, fullName, money, uid, usDate, usDateTime } from "@/lib/format";
import { haptic } from "@/lib/haptic";
import type { Document, InventoryItem, Priority, Vendor, WorkStatus } from "@/mock/types";
import { useEstate } from "../useEstate";

const WORK_FLOW: WorkStatus[] = ["requested", "contacted", "scheduled", "in_progress", "completed", "closed"];

export function PropertyListScreen() {
  const { data, me } = useEstate();
  const go = useGo();
  const [adding, setAdding] = useState(false);
  if (!me) return null;
  const list = data.properties.filter((p) => me.propertyIds.includes(p.id));
  return (
    <Page back large title="Properties" subtitle={me.role === "manager" ? "Houses you run for the estate" : "Houses shared with you"}>
      {me.role === "manager" && (
        <Button className="mb-3" onClick={() => setAdding(true)}>
          Add property
        </Button>
      )}
      <div className="space-y-3">
        {list.length === 0 && <EmptyState image="empty-docs" title="No properties yet" body="Add the first house to start the estate." action={me.role === "manager" ? <Button onClick={() => setAdding(true)}>Add property</Button> : undefined} />}
        {list.map((p) => (
          <button key={p.id} onClick={() => go(`/app/properties/${p.id}`)} className="block w-full text-left">
            <Hero name={p.image} alt={p.name} className="h-44">
              <p className="text-[13px] text-gold">{p.kind}</p>
              <p className="text-[22px] font-semibold">{p.name}</p>
              <p className="text-[15px] text-white/85">{p.address}</p>
            </Hero>
          </button>
        ))}
      </div>
      {me.role === "manager" && <AddPropertySheet open={adding} onClose={() => setAdding(false)} />}
    </Page>
  );
}

export function PropertyDetailScreen({ id }: { id: string }) {
  const { data, me, property, taskStatus } = useEstate();
  const go = useGo();
  const [tab, setTab] = useState<"Overview" | "Tasks" | "Maintenance" | "Inventory" | "Documents" | "Staff" | "Events">("Overview");
  const home = property(id);
  if (!me || !home || !me.propertyIds.includes(home.id)) {
    return <Page back title="Property"><Locked /></Page>;
  }
  const tasks = data.tasks.filter((t) => t.propertyId === id);
  return (
    <div className="pb-8">
      <Hero name={home.image} alt={home.name} className="h-64 rounded-none">
        <div className="mb-8 flex items-center justify-between">
          <button className="min-h-11 text-[17px]" onClick={() => go("/app/properties")}>Back</button>
          <button className="min-h-11 text-[17px] font-semibold text-gold" onClick={() => go("/app")}>Home</button>
        </div>
        <p className="text-[28px] font-bold">{home.name}</p>
        <p className="text-[15px]">{home.address}, {home.city}</p>
      </Hero>
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {(["Overview", "Tasks", "Maintenance", "Inventory", "Documents", "Staff", "Events"] as const).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`min-h-9 shrink-0 rounded-full px-3 text-[15px] ${tab === item ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-fill"}`}>{item}</button>
        ))}
      </div>
      <div className="px-4">
        {tab === "Overview" && (
          <>
            <p className="text-[17px]">{home.notes}</p>
            <Section title="Emergency">
              <Banner tone="warning">{home.emergency}</Banner>
            </Section>
            <Group>
              <Row title="Wi-Fi" subtitle={home.wifi} />
              <Row title="Open tasks" subtitle={String(tasks.filter((t) => !t.closed).length)} onClick={() => setTab("Tasks")} />
            </Group>
          </>
        )}
        {tab === "Tasks" && (
          <Group>
            {tasks.map((t) => <Row key={t.id} title={t.title} trailing={<StatusChip status={taskStatus(t)} />} onClick={() => go(`/app/tasks/${t.id}`)} />)}
          </Group>
        )}
        {tab === "Maintenance" && (
          <Group>
            {data.workOrders.filter((w) => w.propertyId === id).map((w) => <Row key={w.id} title={w.title} subtitle={w.status.replace("_", " ")} onClick={() => go(`/app/maintenance/${w.id}`)} />)}
          </Group>
        )}
        {tab === "Inventory" && (
          <Group>
            {data.inventory.filter((i) => i.propertyId === id).map((i) => <Row key={i.id} title={i.name} subtitle={`${i.qty} ${i.unit}`} onClick={() => go(`/app/inventory/${i.id}`)} />)}
          </Group>
        )}
        {tab === "Documents" && (
          <Group>
            {data.documents.filter((d) => d.propertyId === id).map((d) => <Row key={d.id} title={d.title} subtitle={d.access.includes(me.role) ? d.category : "Locked"} onClick={() => go(`/app/documents/${d.id}`)} />)}
          </Group>
        )}
        {tab === "Staff" && (
          <Group>
            {data.people.filter((p) => p.role === "staff" && p.propertyIds.includes(id)).map((p) => <Row key={p.id} title={fullName(p)} subtitle={p.title} onClick={() => go(`/app/team/${p.id}`)} />)}
          </Group>
        )}
        {tab === "Events" && (
          <Group>
            {data.events.filter((e) => e.propertyId === id).map((e) => <Row key={e.id} title={e.title} subtitle={dayLabel(e.start)} onClick={() => go(`/app/events/${e.id}`)} />)}
          </Group>
        )}
      </div>
    </div>
  );
}

export function ApprovalListScreen() {
  const { data, me } = useEstate();
  const go = useGo();
  if (!me || me.role !== "manager") return <Page back title="Approvals"><Locked title="Managers review these" /></Page>;
  return (
    <Page back large title="Approvals">
      <Group>
        {data.approvals.map((a) => (
          <Row key={a.id} title={a.title} subtitle={`${a.status}${a.amount ? ` · ${money(a.amount)}` : ""}`} onClick={() => go(`/app/approvals/${a.id}`)} />
        ))}
      </Group>
    </Page>
  );
}

export function ApprovalDetailScreen({ id }: { id: string }) {
  const { data, me, dispatch, pushToast, property } = useEstate();
  const [comment, setComment] = useState("");
  const item = data.approvals.find((a) => a.id === id);
  if (!me || me.role !== "manager") return <Page back title="Approval"><Locked /></Page>;
  if (!item) return <Page back title="Approval"><EmptyState image="empty-docs" title="Already handled" body="This approval is no longer in the queue." /></Page>;
  return (
    <Page back title="Approval">
      <h1 className="text-[28px] font-bold">{item.title}</h1>
      <p className="mt-2 text-[17px]">{item.detail}</p>
      <p className="mt-2 text-[15px] text-soft">{property(item.propertyId)?.name}{item.amount ? ` · ${money(item.amount)}` : ""}</p>
      <p className="mt-2 text-[15px]">Status: {item.status}</p>
      {item.comment && <p className="mt-2 text-[15px] text-soft">{item.comment}</p>}
      {item.status === "pending" && (
        <div className="mt-4 space-y-3">
          <Field label="Comment" value={comment} onChange={setComment} />
          <Button onClick={() => { dispatch({ type: "decide-approval", id, decision: "approved", comment: comment || "Approved.", actorId: me.id }); haptic("success"); pushToast("Approved"); }}>Approve</Button>
          <Button tone="destructive" onClick={() => { dispatch({ type: "decide-approval", id, decision: "rejected", comment: comment || "Not approved.", actorId: me.id }); haptic("warning"); pushToast("Sent back"); }}>Reject</Button>
        </div>
      )}
    </Page>
  );
}

export function MaintenanceListScreen() {
  const { data, me } = useEstate();
  const go = useGo();
  if (!me) return null;
  return (
    <Page back large title="Maintenance">
      <Group>
        {data.workOrders.filter((w) => me.propertyIds.includes(w.propertyId)).map((w) => (
          <Row key={w.id} title={w.title} subtitle={`${w.status.replaceAll("_", " ")} · ${money(w.cost)}`} onClick={() => go(`/app/maintenance/${w.id}`)} />
        ))}
      </Group>
    </Page>
  );
}

export function WorkOrderScreen({ id }: { id: string }) {
  const { data, me, dispatch, pushToast } = useEstate();
  const go = useGo();
  const order = data.workOrders.find((w) => w.id === id);
  const vendor = data.vendors.find((v) => v.id === order?.vendorId);
  if (!order) return <Page back title="Work order"><EmptyState image="empty-tasks" title="Work order missing" body="It may have been filed under another property." /></Page>;
  return (
    <Page back title="Work order">
      <h1 className="text-[28px] font-bold">{order.title}</h1>
      <p className="mt-1 text-[15px] text-soft">{order.asset} · {vendor?.name}</p>
      <div className="mt-3"><StatusChip status={order.status === "completed" ? "completed" : order.status === "closed" ? "closed" : order.status === "in_progress" ? "in_progress" : "acknowledged"} /></div>
      <p className="mt-3 text-[17px]">{order.notes}</p>
      <p className="mt-2 text-[17px] tabular">{money(order.cost)}</p>
      {order.invoice && <p className="text-[15px] text-soft">{order.invoice}</p>}
      {order.warranty && <p className="text-[15px] text-soft">{order.warranty}</p>}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {order.beforePhoto && <Photo name={order.beforePhoto} alt="Before the repair" className="h-28 rounded-[16px]" />}
        {order.afterPhoto && <Photo name={order.afterPhoto} alt="After the repair" className="h-28 rounded-[16px]" />}
      </div>
      <Section title="Lifecycle">
        <Timeline items={WORK_FLOW.map((s) => ({ title: s.replaceAll("_", " "), tone: WORK_FLOW.indexOf(s) <= WORK_FLOW.indexOf(order.status) ? "done" as const : "wait" as const }))} />
      </Section>
      {me?.role === "manager" && order.status !== "closed" && (
        <Button onClick={() => {
          const next = WORK_FLOW[Math.min(WORK_FLOW.indexOf(order.status) + 1, WORK_FLOW.length - 1)];
          dispatch({ type: "work-status", id: order.id, status: next, actorId: me.id });
          pushToast("Work order updated");
        }}>Advance status</Button>
      )}
      {vendor && me && <button className="mt-3 text-[17px] text-gold-text" onClick={() => go(`/app/vendors/${vendor.id}`)}>Vendor record</button>}
    </Page>
  );
}

export function InventoryListScreen() {
  const { data, me } = useEstate();
  const go = useGo();
  const [q, setQ] = useState("");
  if (!me) return null;
  const canEdit = me.role === "manager" || me.role === "staff";
  const items = data.inventory.filter((i) => me.propertyIds.includes(i.propertyId) && i.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Page back large title="Inventory" trailing={me.role === "manager" ? <button className="text-[17px] text-gold-text" onClick={() => go("/app/inventory/new")}>Add</button> : undefined}>
      <SearchField value={q} onChange={setQ} placeholder="Search stock" />
      <div className="mt-3">
        {items.length === 0 && <EmptyState image="empty-docs" title="No stock matches" body="Clear the search or add an item." />}
        <Group>
          {items.map((i) => (
            <Row key={i.id} title={i.name} subtitle={`${i.qty} ${i.unit} · min ${i.min}${i.qty < i.min ? " · Low" : ""}`} onClick={() => go(`/app/inventory/${i.id}`)} />
          ))}
        </Group>
      </div>
      {!canEdit && <p className="mt-3 text-[13px] text-soft">You can view stock shared with your role.</p>}
    </Page>
  );
}

export function InventoryDetailScreen({ id }: { id: string }) {
  const { data, me } = useEstate();
  const go = useGo();
  const item = data.inventory.find((i) => i.id === id);
  if (!item || !me || !me.propertyIds.includes(item.propertyId)) return <Page back title="Item"><Locked /></Page>;
  return (
    <Page back title="Item">
      <Photo name={item.image} alt={item.name} className="h-40 w-full rounded-[16px]" />
      <h1 className="mt-3 text-[28px] font-bold">{item.name}</h1>
      <p className="text-[17px] text-soft">{item.location} · {item.category}</p>
      <p className="mt-2 text-[28px] font-bold tabular">{item.qty} <span className="text-[17px] font-normal text-soft">{item.unit}</span></p>
      {item.qty < item.min && <div className="mt-2"><Banner tone="warning">Below the minimum of {item.min}. A low-stock alert is with the manager.</Banner></div>}
      <p className="mt-3 text-[17px]">{item.notes}</p>
      {(me.role === "manager" || me.role === "staff") && (
        <div className="mt-4 space-y-2">
          <Button onClick={() => go(`/app/adjust/${item.id}`)}>Adjust stock</Button>
          {me.role === "manager" && <Button tone="secondary" onClick={() => go(`/app/inventory/new?id=${item.id}`)}>Edit item</Button>}
        </div>
      )}
    </Page>
  );
}

export function InventoryFormScreen() {
  const { data, me, dispatch, pushToast } = useEstate();
  const go = useGo();
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const existing = data.inventory.find((i) => i.id === params.get("id"));
  const [name, setName] = useState(existing?.name ?? "");
  const [location, setLocation] = useState(existing?.location ?? "");
  const [qty, setQty] = useState(String(existing?.qty ?? 1));
  const [min, setMin] = useState(String(existing?.min ?? 1));
  if (!me || me.role === "owner") return <Page back title="Item"><Locked /></Page>;
  return (
    <Page back title={existing ? "Edit item" : "Add item"}>
      <div className="space-y-3">
        <Field label="Name" value={name} onChange={setName} />
        <Field label="Location" value={location} onChange={setLocation} />
        <Field label="Quantity" value={qty} onChange={setQty} />
        <Field label="Minimum" value={min} onChange={setMin} />
        <Button onClick={() => {
          const item: InventoryItem = {
            id: existing?.id ?? uid("inv"),
            name: name || "Untitled item",
            category: existing?.category ?? "Household",
            propertyId: existing?.propertyId ?? "main",
            location: location || "Pantry",
            qty: Number(qty) || 0,
            min: Number(min) || 0,
            unit: existing?.unit ?? "each",
            image: existing?.image ?? "room-kitchen",
            notes: existing?.notes ?? "Added in the house app.",
          };
          dispatch({ type: "save-item", item, actorId: me.id });
          pushToast("Item saved");
          go(`/app/inventory/${item.id}`);
        }}>Save</Button>
      </div>
    </Page>
  );
}

export function StockAdjustScreen({ id }: { id: string }) {
  const { data, me, dispatch, pushToast } = useEstate();
  const go = useGo();
  const item = data.inventory.find((i) => i.id === id);
  const [delta, setDelta] = useState("1");
  const [reason, setReason] = useState("Received");
  if (!item || !me || me.role === "owner") return <Page back title="Adjust"><Locked /></Page>;
  return (
    <Page back title="Stock adjustment">
      <h1 className="text-[28px] font-bold">{item.name}</h1>
      <p className="text-[17px] text-soft">On hand {item.qty} {item.unit}</p>
      <div className="mt-4 space-y-3">
        <Field label="Change, use a minus to remove" value={delta} onChange={setDelta} />
        <Field label="Reason" value={reason} onChange={setReason} />
        <Button onClick={() => { dispatch({ type: "adjust-stock", itemId: item.id, delta: Number(delta) || 0, reason, actorId: me.id }); haptic("success"); pushToast("Stock updated"); go(`/app/inventory/${item.id}`); }}>Save adjustment</Button>
      </div>
    </Page>
  );
}

export function CellarListScreen() {
  const { data, me } = useEstate();
  const go = useGo();
  if (!me) return null;
  if (!me.cellarAccess) return <Page back title="Cellar"><Locked title="Cellar is not shared with your account" /></Page>;
  return (
    <Page back large title="Cellar">
      <Banner>CellarTracker sync is marked Coming in Phase 4.</Banner>
      <div className="mt-3">
        <Group>
          {data.cellar.map((w) => (
            <Row key={w.id} title={`${w.vintage} ${w.name}`} subtitle={`${w.qty} bottles · Bin ${w.bin}`} onClick={() => go(`/app/cellar/${w.id}`)} />
          ))}
        </Group>
      </div>
    </Page>
  );
}

export function CellarDetailScreen({ id }: { id: string }) {
  const { data, me } = useEstate();
  const wine = data.cellar.find((w) => w.id === id);
  if (!me?.cellarAccess || !wine) return <Page back title="Bottle"><Locked title="Cellar is not shared with your account" /></Page>;
  return (
    <Page back title="Bottle">
      <Photo name={wine.image} alt={wine.name} className="h-48 w-full rounded-[16px]" />
      <h1 className="mt-3 text-[28px] font-bold">{wine.name}</h1>
      <p className="text-[17px] text-soft">{wine.vintage} · {wine.region}</p>
      <p className="mt-2 text-[17px] tabular">{wine.qty} bottles in bin {wine.bin}</p>
      <p className="mt-2 text-[17px]">{wine.notes}</p>
      <div className="mt-4"><Banner>CellarTracker · Coming in Phase 4</Banner></div>
    </Page>
  );
}

export function ShoppingListScreen() {
  const { data, me } = useEstate();
  const go = useGo();
  if (!me) return null;
  const lists = data.shopping.filter((s) => me.propertyIds.includes(s.propertyId) && (me.role !== "staff" || s.assigneeId === me.id || me.role === "staff"));
  return (
    <Page back large title="Shopping">
      <Group>
        {lists.map((s) => (
          <Row key={s.id} title={s.title} subtitle={`${s.approval === "pending" ? "Needs approval · " : ""}${s.items.length} items`} onClick={() => go(`/app/shopping/${s.id}`)} />
        ))}
      </Group>
    </Page>
  );
}

export function ShoppingDetailScreen({ id }: { id: string }) {
  const { data, me, dispatch, pushToast, name } = useEstate();
  const list = data.shopping.find((s) => s.id === id);
  const [item, setItem] = useState("");
  const [share, setShare] = useState(false);
  if (!list || !me) return <Page back title="List"><EmptyState image="empty-docs" title="List not found" body="It may have been archived." /></Page>;
  const blocked = list.approval === "pending" || list.approval === "rejected";
  return (
    <Page back title="Shopping list">
      <h1 className="text-[28px] font-bold">{list.title}</h1>
      <p className="text-[15px] text-soft">Assignee {list.assigneeId ? name(list.assigneeId) : "Unassigned"} · {list.approval.replace("_", " ")}</p>
      {list.approval === "pending" && <div className="mt-3"><Banner tone="warning">Manager approval is required before this list is purchased.</Banner></div>}
      {me.role === "manager" && list.approval === "pending" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button onClick={() => { dispatch({ type: "approve-shopping", listId: list.id, decision: "approved", actorId: me.id }); haptic("success"); pushToast("List approved"); }}>Approve</Button>
          <Button tone="destructive" onClick={() => { dispatch({ type: "approve-shopping", listId: list.id, decision: "rejected", actorId: me.id }); haptic("warning"); }}>Reject</Button>
        </div>
      )}
      <div className="mt-4">
        <Group>
          {list.items.map((it) => (
            <div key={it.id} className="border-b border-line px-4 py-3 last:border-b-0">
              <p className="text-[17px]">{it.name}</p>
              <p className="text-[15px] text-soft tabular">{it.qty} {it.unit} · {it.status.replace("_", " ")} · {name(it.requestedBy)}</p>
              {it.note && <p className="text-[13px] text-soft">{it.note}</p>}
              {me.role !== "owner" && !blocked && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["to_buy", "purchased", "unavailable", "received"] as const).map((status) => (
                    <button key={status} className="min-h-9 rounded-full bg-fill px-3 text-[13px]" onClick={() => { dispatch({ type: "shopping-status", listId: list.id, itemId: it.id, status, actorId: me.id }); if (status === "received") pushToast("Received", "Linked inventory was updated."); }}>{status.replace("_", " ")}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Group>
      </div>
      <div className="mt-3 flex gap-2">
        <input aria-label="Add item" value={item} onChange={(e) => setItem(e.target.value)} placeholder="Add an item" className="h-12 flex-1 rounded-[14px] bg-surface px-3" />
        <button className="h-12 rounded-[14px] bg-navy px-4 text-white dark:bg-gold dark:text-navy" onClick={() => { dispatch({ type: "shopping-item", listId: list.id, actorId: me.id, item: { id: uid("si"), name: item.trim() || "Item", qty: 1, unit: "each", status: "to_buy", requestedBy: me.id } }); setItem(""); }}>Add</button>
      </div>
      <div className="mt-3">
        <label className="flex min-h-12 items-center justify-center rounded-[14px] bg-surface text-[17px]">
          Upload receipt
          <input aria-label="Receipt" type="file" accept="image/*" className="sr-only" onChange={() => { dispatch({ type: "receipt", listId: list.id, photo: "empty-docs", actorId: me.id }); pushToast("Receipt saved"); }} />
        </label>
        {list.receipt && <p className="mt-2 text-[15px] text-soft">Receipt is on file.</p>}
      </div>
      <button className="mt-3 text-[17px] text-gold-text" onClick={() => setShare(true)}>Share list</button>
      <ShareSheet open={share} onClose={() => setShare(false)} summary={list.items.map((i) => `${i.qty} ${i.name}`).join(", ")} />
    </Page>
  );
}

export function DocumentListScreen() {
  const { data, me } = useEstate();
  const go = useGo();
  const [q, setQ] = useState("");
  if (!me) return null;
  const docs = data.documents.filter((d) => me.propertyIds.includes(d.propertyId) && d.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <Page back large title="Documents" trailing={me.role === "manager" ? <button className="text-[17px] text-gold-text" onClick={() => go("/app/documents/new")}>Add</button> : undefined}>
      <SearchField value={q} onChange={setQ} placeholder="Search files" />
      <div className="mt-3">
        <Group>
          {docs.map((d) => (
            <Row key={d.id} title={d.title} subtitle={d.access.includes(me.role) ? `${d.category} · ${d.source}` : "Not shared with your account"} onClick={() => go(`/app/documents/${d.id}`)} />
          ))}
        </Group>
      </div>
    </Page>
  );
}

export function DocumentDetailScreen({ id }: { id: string }) {
  const { data, me } = useEstate();
  const doc = data.documents.find((d) => d.id === id);
  if (!doc || !me) return <Page back title="Document"><EmptyState image="empty-docs" title="File missing" body="It may have moved to SharePoint." /></Page>;
  if (!doc.access.includes(me.role)) return <Page back title="Document"><Locked /></Page>;
  return (
    <Page back title="Document">
      <p className="text-[13px] uppercase tracking-wide text-gold-text">{doc.source} · {doc.category}</p>
      <h1 className="mt-1 text-[28px] font-bold">{doc.title}</h1>
      <p className="mt-2 text-[17px]">{doc.summary}</p>
      <p className="mt-2 text-[15px] text-soft">Version {doc.version} · Updated {usDate(doc.updated)}{doc.expires ? ` · Expires ${usDate(doc.expires)}` : ""}</p>
      {doc.expires && <div className="mt-3"><Banner tone="warning">Expiry reminder is on for this file.</Banner></div>}
      <Section title="Versions">
        <Group>
          {doc.versions.map((v) => <Row key={v.version} title={v.version} subtitle={`${usDate(v.at)} · ${v.note}`} />)}
        </Group>
      </Section>
    </Page>
  );
}

export function DocumentUploadScreen() {
  const { me, dispatch, pushToast } = useEstate();
  const go = useGo();
  const [title, setTitle] = useState("");
  if (!me || me.role !== "manager") return <Page back title="Upload"><Locked /></Page>;
  return (
    <Page back title="Upload">
      <Field label="Title" value={title} onChange={setTitle} />
      <div className="mt-3">
        <Button onClick={() => {
          const doc: Document = { id: uid("doc"), title: title || "Untitled file", category: "House", propertyId: "main", source: "Native", access: ["manager", "owner"], updated: new Date().toISOString(), version: "1.0", versions: [{ version: "1.0", at: new Date().toISOString(), note: "Uploaded from the phone" }], summary: "Stored natively in Estate Manager." };
          dispatch({ type: "add-document", doc, actorId: me.id });
          pushToast("File added");
          go(`/app/documents/${doc.id}`);
        }}>Save document</Button>
      </div>
    </Page>
  );
}

export function VendorListScreen() {
  const { data, me } = useEstate();
  const go = useGo();
  const [cat, setCat] = useState("All");
  if (!me) return null;
  const cats = ["All", ...new Set(data.vendors.map((v) => v.category))];
  const list = data.vendors.filter((v) => cat === "All" || v.category === cat);
  return (
    <Page back large title="Vendor log" subtitle={me.role === "manager" ? "Internal directory" : "Read only"} trailing={me.role === "manager" ? <button className="text-[17px] text-gold-text" onClick={() => go("/app/vendors/new")}>Add</button> : undefined}>
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`min-h-9 shrink-0 rounded-full px-3 text-[15px] ${cat === c ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-fill"}`}>{c}</button>)}
      </div>
      <div className="space-y-3">
        {list.map((v) => (
          <button key={v.id} onClick={() => go(`/app/vendors/${v.id}`)} className="block w-full overflow-hidden rounded-[16px] bg-surface text-left">
            <Photo name={v.image} alt="" className="h-28 w-full" />
            <span className="block p-4">
              <span className="block text-[17px] font-semibold">{v.name}</span>
              <span className="block text-[15px] text-soft">{v.category} · {v.contact}</span>
            </span>
          </button>
        ))}
      </div>
    </Page>
  );
}

export function VendorDetailScreen({ id }: { id: string }) {
  const { data, me } = useEstate();
  const go = useGo();
  const vendor = data.vendors.find((v) => v.id === id);
  if (!vendor) return <Page back title="Vendor"><EmptyState image="empty-docs" title="Vendor removed" body="The directory no longer lists this firm." /></Page>;
  return (
    <Page back title="Vendor" trailing={me?.role === "manager" ? <button className="text-[17px] text-gold-text" onClick={() => go(`/app/vendors/new?id=${vendor.id}`)}>Edit</button> : undefined}>
      <Photo name={vendor.image} alt={vendor.name} className="h-40 w-full rounded-[16px]" />
      <h1 className="mt-3 text-[28px] font-bold">{vendor.name}</h1>
      <p className="text-[17px] text-soft">{vendor.category}</p>
      {me?.role !== "manager" && <p className="mt-2 text-[13px] text-gold-text">Read only · vendors do not have logins</p>}
      <div className="mt-3">
        <Group>
          <Row title={vendor.contact} subtitle="Primary contact" />
          <a className="flex min-h-14 items-center border-b border-line px-4 text-[17px]" href={`tel:${vendor.phone}`}>{vendor.phone}</a>
          <a className="flex min-h-14 items-center justify-between border-b border-line px-4" href={`mailto:${vendor.email}`}>
            <span>
              <span className="block text-[17px]">{vendor.email}</span>
              <span className="block text-[15px] text-soft">Email</span>
            </span>
          </a>
          <Row title="COI" subtitle={`Expires ${vendor.coiExpires}`} />
          <Row title="License" subtitle={vendor.license} />
        </Group>
      </div>
      <Section title="Properties">{vendor.propertyIds.map((pid) => data.properties.find((p) => p.id === pid)?.name).join(", ")}</Section>
      <p className="text-[17px]">{vendor.notes}</p>
      <Section title="Service history">
        <Group>{vendor.history.map((h) => <Row key={h} title={h} />)}</Group>
      </Section>
    </Page>
  );
}

export function VendorFormScreen() {
  const { data, me, dispatch, pushToast } = useEstate();
  const go = useGo();
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const existing = data.vendors.find((v) => v.id === params.get("id"));
  const [name, setName] = useState(existing?.name ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  if (!me || me.role !== "manager") return <Page back title="Vendor"><Locked title="Only the estate manager edits vendors" /></Page>;
  return (
    <Page back title={existing ? "Edit vendor" : "Add vendor"}>
      <div className="space-y-3">
        <Field label="Company" value={name} onChange={setName} />
        <Field label="Phone" value={phone} onChange={setPhone} />
        <Button onClick={() => {
          const vendor: Vendor = existing ? { ...existing, name, phone } : { id: uid("v"), name: name || "New vendor", category: "Household", contact: "Office", phone, email: "office@vendor.example", propertyIds: ["main"], image: "vendor-hvac", notes: "Added from the directory.", coiExpires: "2027-01-01", license: "Pending", history: ["Created in Estate Manager."] };
          dispatch({ type: "save-vendor", vendor, actorId: me.id });
          pushToast("Vendor saved");
          go(`/app/vendors/${vendor.id}`);
        }}>Save</Button>
      </div>
    </Page>
  );
}

export function TeamListScreen() {
  const { data, me } = useEstate();
  const go = useGo();
  if (!me || me.role === "owner") return <Page back title="Team"><Locked /></Page>;
  return (
    <Page back large title="Staff & team">
      <Group>
        {data.people.filter((p) => p.role === "staff" && !p.revoked).map((p) => (
          <Row key={p.id} title={fullName(p)} subtitle={p.title} onClick={() => go(`/app/team/${p.id}`)} />
        ))}
      </Group>
    </Page>
  );
}

export function TeamDetailScreen({ id }: { id: string }) {
  const { data, me, person } = useEstate();
  const go = useGo();
  const who = person(id);
  if (!who || !me || me.role === "owner") return <Page back title="Staff"><Locked /></Page>;
  const blocks = data.availability.filter((a) => a.personId === id);
  const tasks = data.tasks.filter((t) => t.assigneeIds.includes(id) && !t.closed);
  return (
    <Page back title="Staff">
      <h1 className="text-[28px] font-bold">{fullName(who)}</h1>
      <p className="text-[17px] text-soft">{who.title}</p>
      <a className="mt-2 block text-[17px] text-gold-text" href={`tel:${who.phone}`}>{who.phone}</a>
      <Section title="Properties">
        <p className="text-[17px]">{who.propertyIds.map((pid) => data.properties.find((p) => p.id === pid)?.name).join(", ")}</p>
      </Section>
      <Section title="Open work">
        <Group>{tasks.map((t) => <Row key={t.id} title={t.title} onClick={() => go(`/app/tasks/${t.id}`)} />)}</Group>
      </Section>
      <Section title="Availability">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 14 }).map((_, i) => {
            const day = 11 + i - 3;
            const key = `2026-11-${String(day).padStart(2, "0")}`;
            const block = blocks.find((b) => b.date === key);
            const tone = block?.state === "unavailable" ? "bg-danger/70" : block?.state === "busy" ? "bg-warning/80" : "bg-success/70";
            return <div key={key} title={block?.note || "Available"} className={`h-8 rounded-[6px] ${block ? tone : "bg-fill"}`} />;
          })}
        </div>
        <p className="mt-2 text-[13px] text-soft">Green is available, gold is busy, red is off.</p>
      </Section>
    </Page>
  );
}

export function SopListScreen() {
  const { data, me } = useEstate();
  const go = useGo();
  if (!me) return null;
  return (
    <Page back large title="SOPs">
      <Group>
        {data.sops.map((s) => (
          <Row key={s.id} title={s.title} subtitle={s.acknowledgedBy[me.id] ? `Acknowledged ${usDate(s.acknowledgedBy[me.id])}` : `Version ${s.version} · Needs acknowledgement`} onClick={() => go(`/app/sops/${s.id}`)} />
        ))}
      </Group>
    </Page>
  );
}

export function SopDetailScreen({ id }: { id: string }) {
  const { data, me, dispatch, pushToast } = useEstate();
  const go = useGo();
  const sop = data.sops.find((s) => s.id === id);
  if (!sop || !me) return <Page back title="SOP"><EmptyState image="empty-docs" title="SOP missing" body="The library may have a newer version." /></Page>;
  const done = sop.steps.filter((s) => s.done).length;
  return (
    <Page back title="SOP">
      <p className="text-[13px] text-gold-text">Version {sop.version}</p>
      <h1 className="text-[28px] font-bold">{sop.title}</h1>
      <p className="mt-2 text-[17px]">{sop.summary}</p>
      <div className="mt-3"><ProgressBar value={(done / sop.steps.length) * 100} /></div>
      {!sop.acknowledgedBy[me.id] && <div className="mt-3"><Button onClick={() => { dispatch({ type: "ack-sop", sopId: sop.id, personId: me.id }); haptic("success"); pushToast("SOP acknowledged"); }}>Acknowledge this version</Button></div>}
      <div className="mt-3"><Button tone="secondary" onClick={() => go(`/app/checklist/${sop.id}`)}>Run checklist</Button></div>
      <Section title="Earlier versions">
        <Group>{sop.versions.map((v) => <Row key={v.version} title={v.version} subtitle={`${usDate(v.at)} · ${v.note}`} />)}</Group>
      </Section>
    </Page>
  );
}

export function ChecklistScreen({ id }: { id: string }) {
  const { data, me, dispatch } = useEstate();
  const sop = data.sops.find((s) => s.id === id);
  if (!sop || !me) return <Page back title="Checklist"><EmptyState image="empty-tasks" title="Checklist missing" body="Open the SOP library to pick another." /></Page>;
  const done = sop.steps.every((s) => s.done);
  return (
    <Page back title="Checklist">
      <h1 className="text-[28px] font-bold">{sop.title}</h1>
      <div className="mt-4">
        <Group>
          {sop.steps.map((step) => (
            <button key={step.id} onClick={() => dispatch({ type: "sop-step", sopId: sop.id, stepId: step.id, actorId: me.id })} className="flex min-h-14 w-full items-center gap-3 border-b border-line px-4 text-left last:border-b-0">
              <span className={`h-6 w-6 rounded-full border ${step.done ? "border-success bg-success" : "border-line"}`} />
              <span className="text-[17px]">{step.label}</span>
            </button>
          ))}
        </Group>
      </div>
      {done && <div className="mt-4"><Banner tone="success">Completion recorded for {fullName(me)}.</Banner></div>}
    </Page>
  );
}

export function ManualScreen() {
  const { data, me, dispatch, pushToast, session } = useEstate();
  const [propertyId, setPropertyId] = useState(session.activePropertyId);
  if (!me) return null;
  const sections = data.manual.filter((m) => m.propertyId === propertyId);
  return (
    <Page back large title="House manual" subtitle={`Version ${data.manualVersion}`}>
      <select aria-label="Property" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="h-12 w-full rounded-[14px] bg-surface px-3 text-[17px]">
        {data.properties.filter((p) => me.propertyIds.includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <div className="mt-4 space-y-3">
        {sections.map((s) => (
          <article key={s.id} className="rounded-[16px] bg-surface p-4">
            <h2 className="text-[20px] font-semibold">{s.title}</h2>
            <p className="mt-1 text-[17px]">{s.body}</p>
          </article>
        ))}
        {sections.length === 0 && <EmptyState image="empty-docs" title="No sections yet" body="This property uses the main house manual." />}
      </div>
      <div className="mt-4">
        {data.manualAcks[me.id] ? <Banner tone="success">You acknowledged version {data.manualVersion}.</Banner> : <Button onClick={() => { dispatch({ type: "ack-manual", personId: me.id }); haptic("success"); pushToast("Manual acknowledged"); }}>Acknowledge update</Button>}
      </div>
    </Page>
  );
}

export function SafetyScreen() {
  const { data, me, dispatch, pushToast } = useEstate();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  if (!me) return null;
  const contacts = [
    { name: "James Carter", phone: "(845) 555-0148" },
    { name: "Millbrook Fire", phone: "911" },
    { name: "Poison Control", phone: "(800) 222-1222" },
    { name: "Vassar Brothers", phone: "(845) 454-8500" },
  ];
  return (
    <Page back large title="Safety">
      <Section title="Call">
        <Group>
          {contacts.map((c) => (
            <a key={c.name} href={`tel:${c.phone}`} className="flex min-h-14 items-center justify-between border-b border-line px-4 last:border-b-0">
              <span className="text-[17px]">{c.name}</span>
              <span className="text-[15px] text-gold-text">{c.phone}</span>
            </a>
          ))}
        </Group>
      </Section>
      <Section title="Evacuation">
        <p className="text-[17px]">Leave by the service court if the main stair is blocked. Meet at the oak on Hawthorne Lane. The lake cabin meeting point is the end of the dock.</p>
      </Section>
      <Section title="Equipment">
        <Group>
          {data.inspections.map((i) => <Row key={i.id} title={i.name} subtitle={`${i.status} · due ${i.due}`} />)}
        </Group>
      </Section>
      <Section title="Incident report">
        <div className="space-y-3">
          <Field label="What happened" value={title} onChange={setTitle} />
          <Field label="Details" value={detail} onChange={setDetail} />
          <Button onClick={() => { dispatch({ type: "incident", incident: { id: uid("inc"), title: title.trim() || "Incident", propertyId: "main", reporterId: me.id, at: new Date().toISOString(), detail } }); setTitle(""); setDetail(""); pushToast("Incident saved"); }}>Submit report</Button>
        </div>
        {data.incidents.length > 0 && <Group>{data.incidents.map((i) => <Row key={i.id} title={i.title} subtitle={usDateTime(i.at)} />)}</Group>}
      </Section>
    </Page>
  );
}

export function ReportsScreen() {
  const { data, taskStatus } = useEstate();
  const [share, setShare] = useState(false);
  const done = data.tasks.filter((t) => taskStatus(t) === "completed" || t.closed).length;
  const summary = `Hawthorne week of Nov 11, 2026. Completed or closed tasks: ${done}. Open approvals: ${data.approvals.filter((a) => a.status === "pending").length}. Low stock: ${data.inventory.filter((i) => i.qty < i.min).length}.`;
  return (
    <Page back large title="Reports">
      <article className="rounded-[16px] bg-surface p-4">
        <h2 className="text-[20px] font-semibold">This week</h2>
        <p className="mt-2 text-[17px]">{summary}</p>
        <p className="mt-2 text-[15px] text-soft tabular">Maintenance spend on file {money(data.workOrders.reduce((s, w) => s + w.cost, 0))}</p>
      </article>
      <div className="mt-4"><Button onClick={() => setShare(true)}>Export PDF, CSV, or XLSX</Button></div>
      <Section title="Archive">
        <Group>
          <Row title="Week of Nov 4" subtitle="Filed" />
          <Row title="Week of Oct 28" subtitle="Filed" />
        </Group>
      </Section>
      <Section title="Schedule">
        <Group>
          <Row title="Weekly summary" subtitle="Monday 7:00 AM to James and Eleanor" />
        </Group>
      </Section>
      <ShareSheet open={share} onClose={() => setShare(false)} summary={summary} />
    </Page>
  );
}

export function AlertComposeScreen() {
  const { data, me, dispatch, pushToast } = useEstate();
  const go = useGo();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [propertyId, setPropertyId] = useState("main");
  const [all, setAll] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  if (!me) return null;
  const people = data.people.filter((p) => !p.revoked && p.id !== me.id && p.propertyIds.includes(propertyId));
  return (
    <Page back title={me.role === "owner" ? "Household alert" : "Broadcast"}>
      <div className="space-y-3">
        <Field label="Title" value={title} onChange={setTitle} />
        <Field label="Message" value={message} onChange={setMessage} />
        <label className="block text-[13px] text-soft">Priority
          <select aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="mt-1 h-12 w-full rounded-[14px] bg-surface px-3 text-[17px]">
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="block text-[13px] text-soft">Property
          <select aria-label="Property" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] bg-surface px-3 text-[17px]">
            {data.properties.filter((p) => me.propertyIds.includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <Segmented label="Recipients" value={all ? "all" : "some"} onChange={(v) => setAll(v === "all")} options={[{ value: "all", label: "Everyone" }, { value: "some", label: "Selected" }]} />
        {!all && people.map((p) => (
          <button key={p.id} className="flex min-h-11 w-full items-center justify-between" onClick={() => setPicked((list) => list.includes(p.id) ? list.filter((id) => id !== p.id) : [...list, p.id])}>
            <span>{fullName(p)}</span><span className="text-gold-text">{picked.includes(p.id) ? "Added" : "Add"}</span>
          </button>
        ))}
        <Button onClick={() => {
          const id = uid("al");
          const recipientIds = all ? people.map((p) => p.id) : picked;
          const alertTitle = title.trim() || "Alert";
          dispatch({
            type: "create-alert",
            actorId: me.id,
            alert: { id, title: alertTitle, message: message.trim() || alertTitle, propertyId, priority, senderId: me.id, starts: new Date().toISOString(), ends: new Date(Date.UTC(2026, 10, 14, 21)).toISOString(), recipientIds, acks: {} },
          });
          haptic("success");
          pushToast("Alert sent");
          go(`/app/alerts/${id}`);
        }}>Send alert</Button>
      </div>
    </Page>
  );
}

export function AlertDetailScreen({ id }: { id: string }) {
  const { data, me, dispatch, pushToast, name } = useEstate();
  const alert = data.alerts.find((a) => a.id === id);
  if (!alert || !me) return <Page back title="Alert"><EmptyState image="empty-inbox" title="Alert ended" body="It is no longer in the active window." /></Page>;
  const acked = alert.acks[me.id];
  return (
    <Page back title="Alert">
      <PriorityChip priority={alert.priority} />
      <h1 className="mt-2 text-[28px] font-bold">{alert.title}</h1>
      <p className="mt-2 text-[17px]">{alert.message}</p>
      <p className="mt-2 text-[15px] text-soft">From {name(alert.senderId)} · {usDateTime(alert.starts)} to {usDateTime(alert.ends)}</p>
      {!acked && alert.recipientIds.includes(me.id) && <div className="mt-4"><Button onClick={() => { dispatch({ type: "ack-alert", alertId: alert.id, personId: me.id }); haptic("success"); pushToast("Acknowledged"); }}>Acknowledge</Button></div>}
      {(me.id === alert.senderId || me.role === "manager") && (
        <Section title="Acknowledgements">
          <Group>
            {alert.recipientIds.map((pid) => (
              <Row key={pid} title={name(pid)} subtitle={alert.acks[pid] ? `Acknowledged ${usDateTime(alert.acks[pid])}` : "Waiting"} trailing={alert.acks[pid] ? <StatusChip status="acknowledged" /> : <StatusChip status="new" />} />
            ))}
          </Group>
        </Section>
      )}
    </Page>
  );
}

export function WeatherScreen() {
  const { session, property } = useEstate();
  const home = property(session.activePropertyId);
  const days = [
    { d: "Wed", t: "46°" },
    { d: "Thu", t: "44°" },
    { d: "Fri", t: "41°" },
    { d: "Sat", t: "49°" },
    { d: "Sun", t: "52°" },
  ];
  return (
    <Page back large title="Weather" subtitle={home?.name}>
      <div className="rounded-[16px] bg-navy p-4 text-white">
        <p className="text-[13px] text-gold">Tomorrow.io · Phase 4 integration</p>
        <p className="text-[40px] font-bold tabular leading-none">46°</p>
        <p className="text-[17px]">Partly cloudy · High 51° · Low 30°</p>
      </div>
      <div className="mt-3"><Banner tone="warning">Frost advisory overnight. Cover the citrus pots.</Banner></div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {days.map((d) => (
          <div key={d.d} className="rounded-[14px] bg-surface py-3 text-center">
            <p className="text-[13px] text-soft">{d.d}</p>
            <p className="text-[17px] font-semibold tabular">{d.t}</p>
          </div>
        ))}
      </div>
      <Section title="Thresholds">
        <Group>
          <Row title="Frost alert" subtitle="Below 32°F" />
          <Row title="Wind" subtitle="Above 40 mph" />
          <Row title="Source" subtitle="Labeled Phase 4 · Tomorrow.io" />
        </Group>
      </Section>
    </Page>
  );
}

export function AuditScreen() {
  const { data, me, name } = useEstate();
  const [who, setWho] = useState("all");
  const [action, setAction] = useState("all");
  if (!me || me.role !== "manager") return <Page back title="Audit"><Locked /></Page>;
  const rows = data.audit.filter((a) => (who === "all" || a.actorId === who) && (action === "all" || a.action === action));
  const actions = ["all", ...new Set(data.audit.map((a) => a.action))];
  return (
    <Page back large title="Audit">
      <div className="mb-3 flex gap-2">
        <select aria-label="Person" value={who} onChange={(e) => setWho(e.target.value)} className="h-11 flex-1 rounded-[12px] bg-surface px-2 text-[15px]">
          <option value="all">Everyone</option>
          {data.people.map((p) => <option key={p.id} value={p.id}>{p.firstName}</option>)}
        </select>
        <select aria-label="Action" value={action} onChange={(e) => setAction(e.target.value)} className="h-11 flex-1 rounded-[12px] bg-surface px-2 text-[15px]">
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <Group>
        {rows.map((a) => <Row key={a.id} title={a.detail} subtitle={`${name(a.actorId)} · ${a.action} · ${usDateTime(a.at)}`} />)}
      </Group>
      {rows.length === 0 && <EmptyState image="empty-docs" title="No matching history" body="Widen the person or action filter." />}
    </Page>
  );
}

export function UsersScreen() {
  const { data, me, dispatch, pushToast } = useEstate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "owner" | "manager">("staff");
  if (!me || me.role !== "manager") return <Page back title="Access"><Locked /></Page>;
  return (
    <Page back large title="Users & access" trailing={<button className="text-[17px] text-gold-text" onClick={() => setOpen(true)}>Invite</button>}>
      <Group>
        {data.people.map((p) => (
          <div key={p.id} className="flex min-h-14 items-center justify-between border-b border-line px-4 last:border-b-0">
            <span>
              <span className="block text-[17px]">{fullName(p)}{p.revoked ? " · revoked" : ""}</span>
              <span className="block text-[13px] text-soft">{p.role} · {p.propertyIds.length} properties</span>
            </span>
            {p.role !== "manager" && !p.revoked && (
              <button className="min-h-11 text-[15px] text-danger" onClick={() => { dispatch({ type: "revoke", id: p.id, actorId: me.id }); haptic("warning"); pushToast("Access revoked"); }}>Revoke</button>
            )}
          </div>
        ))}
      </Group>
      {open && (
        <div className="mt-4 space-y-3 rounded-[16px] bg-surface p-4">
          <Field label="Email" value={email} onChange={setEmail} />
          <select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="h-12 w-full rounded-[14px] bg-fill px-3">
            <option value="staff">Staff</option>
            <option value="owner">Home Owner</option>
            <option value="manager">Estate Manager</option>
          </select>
          <Button onClick={() => {
            dispatch({
              type: "add-person",
              actorId: me.id,
              person: { id: uid("p"), firstName: "Invited", lastName: "Guest", email: email || "guest@hawthorne.estate", phone: "(845) 555-0100", password: "Estate1848", role, title: role, propertyIds: ["main"], avatar: "avatar-owen", cellarAccess: false },
            });
            setOpen(false);
            pushToast("Invite ready", "They can register with HAWTHORNE-STAFF or the role code you share.");
          }}>Send invite</Button>
        </div>
      )}
    </Page>
  );
}

export function AvailabilityScreen() {
  const { data, me, dispatch, pushToast } = useEstate();
  const [date, setDate] = useState("2026-11-16");
  const [state, setState] = useState<"available" | "busy" | "unavailable">("unavailable");
  const [note, setNote] = useState("");
  if (!me) return null;
  const mine = data.availability.filter((a) => a.personId === me.id);
  return (
    <Page back large title="Availability">
      <div className="space-y-3">
        <label className="block text-[13px] text-soft">Date
          <input aria-label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-12 w-full rounded-[14px] bg-surface px-3 text-[17px]" />
        </label>
        <Segmented label="State" value={state} onChange={setState} options={[{ value: "available", label: "Available" }, { value: "busy", label: "Busy" }, { value: "unavailable", label: "Off" }]} />
        <Field label="Note" value={note} onChange={setNote} />
        <Button onClick={() => { dispatch({ type: "availability", actorId: me.id, block: { id: uid("av"), personId: me.id, date, state, note: note || state } }); pushToast("Availability saved"); }}>Save block</Button>
      </div>
      <Section title="History">
        <Group>
          {mine.map((a) => (
            <Row key={a.id} title={a.date} subtitle={`${a.state} · ${a.note}`} trailing={<button className="text-[15px] text-danger" onClick={() => dispatch({ type: "remove-availability", id: a.id })}>Remove</button>} />
          ))}
        </Group>
      </Section>
    </Page>
  );
}
