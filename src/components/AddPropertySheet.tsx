import { useState } from "react";
import { Button, Field, Sheet } from "@/components/ios/ui";
import { uid } from "@/lib/format";
import { haptic } from "@/lib/haptic";
import { cn } from "@/lib/utils";
import { useEstate } from "@/screens/useEstate";

const KINDS = ["Residence", "Guest house", "Cabin", "Apartment"];

export function AddPropertySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me, dispatch, completePropertyPick, pushToast } = useEstate();
  const [form, setForm] = useState({ name: "", kind: "Residence", city: "", address: "" });

  const save = () => {
    if (!me) return;
    const name = form.name.trim() || "New property";
    const property = {
      id: uid("prop"),
      name,
      kind: form.kind,
      address: form.address.trim() || "Address to be confirmed",
      city: form.city.trim() || "New York",
      image: "property-1",
      emergency: "Call the estate manager for after-hours access.",
      wifi: "Network details will be added.",
      notes: "Added from the estate.",
    };
    dispatch({ type: "add-property", property, actorId: me.id });
    completePropertyPick(property.id);
    haptic("success");
    pushToast("Property added", `${name} is now on your list.`);
    setForm({ name: "", kind: "Residence", city: "", address: "" });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add property" tall>
      <div className="space-y-3">
        <p className="text-[15px] text-soft">The estate manager adds houses. Staff and the owner see a property after it is on their access list.</p>
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <div className="flex flex-wrap gap-2">
          {KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={form.kind === kind}
              onClick={() => setForm({ ...form, kind })}
              className={cn("min-h-9 rounded-full px-3 text-[15px]", form.kind === kind ? "bg-navy text-white dark:bg-gold dark:text-navy" : "bg-fill")}
            >
              {kind}
            </button>
          ))}
        </div>
        <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
        <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <Button onClick={save}>Save property</Button>
      </div>
    </Sheet>
  );
}
