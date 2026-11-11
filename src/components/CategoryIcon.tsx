import { CircleHelp, type LucideIcon } from "lucide-react";

const MAP: Record<string, LucideIcon> = {};

export function CategoryIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = MAP[name] ?? CircleHelp;
  return <Icon size={size} strokeWidth={2} />;
}
