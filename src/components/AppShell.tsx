import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const OverlayContext = createContext<HTMLElement | null>(null);

export function useOverlay() {
  return useContext(OverlayContext);
}

export function AppShell({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("em-theme");
    const dark =
      stored === "dark" ||
      (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  return (
    <div className="h-dvh bg-[#d7d0c4] dark:bg-[#05080d]">
      <div ref={setNode} className="relative mx-auto flex h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-bg text-ink">
        <OverlayContext.Provider value={node}>{children}</OverlayContext.Provider>
      </div>
    </div>
  );
}
