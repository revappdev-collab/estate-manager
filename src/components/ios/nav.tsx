import { useRouterState } from "@tanstack/react-router";
import {
  Calendar,
  Camera,
  Ellipsis,
  Inbox,
  ListChecks,
  MessageCircle,
  Plus,
  Sun,
  Home,
} from "lucide-react";
import { useState } from "react";
import { haptic } from "@/lib/haptic";
import { useApp } from "@/lib/store";
import type { Role } from "@/mock/types";
import { CountBadge, useGo } from "./ui";
import { cn } from "@/lib/utils";

const ICONS = {
  home: Home,
  today: Sun,
  tasks: ListChecks,
  calendar: Calendar,
  inbox: Inbox,
  messages: MessageCircle,
  requests: Camera,
  more: Ellipsis,
};

type Tab = { to: string; label: string; icon: keyof typeof ICONS };

export function tabsFor(role: Role): Tab[] {
  if (role === "owner") {
    return [
      { to: "/app", label: "Home", icon: "home" },
      { to: "/app/requests", label: "Requests", icon: "requests" },
      { to: "/app/calendar", label: "Calendar", icon: "calendar" },
      { to: "/app/messages", label: "Messages", icon: "messages" },
      { to: "/app/more", label: "More", icon: "more" },
    ];
  }
  if (role === "staff") {
    return [
      { to: "/app", label: "Today", icon: "today" },
      { to: "/app/tasks", label: "My Tasks", icon: "tasks" },
      { to: "/app/calendar", label: "Calendar", icon: "calendar" },
      { to: "/app/inbox", label: "Inbox", icon: "inbox" },
      { to: "/app/more", label: "More", icon: "more" },
    ];
  }
  return [
    { to: "/app", label: "Home", icon: "home" },
    { to: "/app/tasks", label: "Tasks", icon: "tasks" },
    { to: "/app/calendar", label: "Calendar", icon: "calendar" },
    { to: "/app/inbox", label: "Inbox", icon: "inbox" },
    { to: "/app/more", label: "More", icon: "more" },
  ];
}

function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function TabBar() {
  const { user, data } = useApp();
  const go = useGo();
  const pathname = normalize(useRouterState({ select: (s) => s.location.pathname }));
  if (!user) return null;
  const unread = data.notices.filter((n) => n.recipientId === user.id && !n.read).length;
  const unreadMsg = data.conversations.filter((c) => {
    if (!c.memberIds.includes(user.id)) return false;
    const last = c.messages[c.messages.length - 1];
    if (!last || last.authorId === user.id) return false;
    return !c.readAt[user.id] || c.readAt[user.id] < last.at;
  }).length;
  return (
    <nav aria-label="Sections" className="flex border-t border-line bg-surface/95 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur-xl">
      {tabsFor(user.role).map((tab) => {
        const Icon = ICONS[tab.icon];
        const active = pathname === tab.to;
        const badge = tab.icon === "inbox" ? unread : tab.icon === "messages" ? unreadMsg : 0;
        return (
          <button
            key={tab.to}
            aria-label={tab.label}
            aria-current={active ? "page" : undefined}
            onClick={() => {
              haptic("light");
              go(tab.to);
            }}
            className={cn("flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[12px]", active ? "text-gold-text" : "text-soft")}
          >
            <span className="relative">
              <Icon size={22} strokeWidth={active ? 2.4 : 1.75} fill={active ? "currentColor" : "none"} />
              {badge > 0 && (
                <span className="absolute -right-2 -top-1">
                  <CountBadge count={badge} />
                </span>
              )}
            </span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export function Fab() {
  const { user } = useApp();
  const go = useGo();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const items = [
    user.role === "manager" ? { label: "New Task", path: "/app/tasks/new" } : null,
    { label: user.role === "owner" ? "New Request" : "Report Issue", path: user.role === "owner" ? "/app/requests/new" : "/app/report-issue" },
    { label: "Add Photo", path: "/app/report-issue" },
    { label: "New Alert", path: "/app/alerts/new" },
    { label: "Shopping Item", path: "/app/shopping" },
    { label: "Event", path: "/app/events/new" },
  ].filter(Boolean) as { label: string; path: string }[];
  return (
    <>
      {open && (
        <button aria-label="Close quick actions" className="absolute inset-0 z-30 bg-navy/30" onClick={() => setOpen(false)} />
      )}
      {open && (
        <div role="menu" aria-label="Quick actions" className="absolute bottom-28 right-4 z-40 w-56 overflow-hidden rounded-[16px] bg-surface shadow-xl">
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              className="flex min-h-11 w-full items-center px-4 text-left text-[17px]"
              onClick={() => {
                haptic("light");
                setOpen(false);
                go(item.path);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <button
        aria-label="Quick actions"
        aria-expanded={open}
        onClick={() => {
          haptic("light");
          setOpen((v) => !v);
        }}
        className="absolute bottom-[4.75rem] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-lg dark:bg-gold dark:text-navy"
      >
        <Plus />
      </button>
    </>
  );
}

export function showTabs(pathname: string, role: Role) {
  const path = normalize(pathname);
  return tabsFor(role).some((t) => t.to === path);
}
