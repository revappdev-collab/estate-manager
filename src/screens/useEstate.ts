import { fullName } from "@/lib/format";
import { taskStatus } from "@/mock/data";
import { useApp } from "@/lib/store";

export function useEstate() {
  const app = useApp();
  const person = (id?: string) => app.data.people.find((p) => p.id === id);
  const property = (id?: string) => app.data.properties.find((p) => p.id === id);
  const name = (id?: string) => {
    const p = person(id);
    return p ? fullName(p) : "Someone";
  };
  return { ...app, person, property, name, me: app.user, taskStatus };
}
