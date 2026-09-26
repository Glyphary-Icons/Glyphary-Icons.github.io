import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const port = Number(process.env.PORT) || 5173;

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port,
    strictPort: true,
    // Freebuff requires HMR to stay disabled.
    hmr: false,
  },
  preview: {
    host: "0.0.0.0",
    port,
    strictPort: true,
  },
});
