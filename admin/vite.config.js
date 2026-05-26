import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Admin/",
  plugins: [react()],
  build: {
    outDir: "../dist/Admin",
    emptyOutDir: false,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://10.90.132.4",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
