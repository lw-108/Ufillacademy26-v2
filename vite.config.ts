import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    hmr: {
      protocol: "ws",
      host: "localhost",
      overlay: false,
    },
    fs: {
      allow: [
        path.resolve(import.meta.dirname),
      ],
    },
  },
})

