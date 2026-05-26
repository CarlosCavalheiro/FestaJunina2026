import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/pesquisa/",
  build: {
    outDir: "../dist/pesquisa",
    emptyOutDir: false,
  },
});