import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET =
  process.env.VITE_API_URL ||
  "https://apifestajunina-ayd4h6eabvg2dqhm.brazilsouth-01.azurewebsites.net";

export default defineConfig({
  base: "/admin/",
  plugins: [react()],
  build: {
    outDir: "../dist/admin",
    emptyOutDir: false,
  },
  server: {
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
