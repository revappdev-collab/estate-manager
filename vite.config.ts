import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/** Served from the domain root on Vercel. */
const PRODUCTION_BASE = "/";

export default defineConfig({
  // Nitro compiles the TanStack Start server for Vercel Functions.
  // A Lovable sandbox build still pins its own preset and ignores this.
  nitro: {
    preset: "vercel",
  },
  vite: {
    base: PRODUCTION_BASE,
    server: {
      allowedHosts: ["localhost", "127.0.0.1"],
    },
    preview: {
      allowedHosts: ["localhost", "127.0.0.1"],
    },
  },
});
