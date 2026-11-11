export function haptic(kind: "light" | "success" | "warning") {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const pattern = kind === "light" ? [10] : kind === "success" ? [12, 40, 18] : [24, 36, 24];
  navigator.vibrate?.(pattern);
}
