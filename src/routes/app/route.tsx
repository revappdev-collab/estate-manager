import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Fab, showTabs, TabBar } from "@/components/ios/nav";
import { Logo, Toasts } from "@/components/ios/ui";
import { haptic } from "@/lib/haptic";
import { useApp } from "@/lib/store";
import { useGo } from "@/components/ios/ui";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, hydrated, session, pushToast } = useApp();
  const go = useGo();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const scroller = useRef<HTMLDivElement>(null);
  const [pull, setPull] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) go("/welcome");
    else if (!session.propertyChosen) go("/select-property");
  }, [hydrated, user, session.propertyChosen, go]);

  useEffect(() => {
    scroller.current?.scrollTo(0, 0);
  }, [pathname]);

  if (!hydrated || !user || !session.propertyChosen) {
    return (
      <div className="flex h-full items-center justify-center bg-navy">
        <div className="rounded-[24px] bg-[#F7F5F0] px-5 py-4">
          <Logo className="h-16" />
        </div>
      </div>
    );
  }

  const tabs = showTabs(pathname, user.role);
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div
        ref={scroller}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        onTouchStart={(e) => {
          if (scroller.current && scroller.current.scrollTop <= 0) {
            scroller.current.dataset.pull = String(e.touches[0]?.clientY ?? 0);
          }
        }}
        onTouchEnd={(e) => {
          const start = Number(scroller.current?.dataset.pull ?? 0);
          const dy = (e.changedTouches[0]?.clientY ?? start) - start;
          if (start && dy > 70) {
            setPull(1);
            haptic("light");
            window.setTimeout(() => {
              setPull(0);
              pushToast(navigator.onLine ? "Updated" : "Couldn’t refresh", navigator.onLine ? "Hawthorne is current." : "Check the house network.");
            }, 700);
          }
        }}
      >
        {pull === 1 && <p className="py-3 text-center text-[13px] text-soft">Refreshing…</p>}
        <Outlet />
      </div>
      {tabs && <Fab />}
      {tabs && <TabBar />}
      <Toasts />
    </div>
  );
}
