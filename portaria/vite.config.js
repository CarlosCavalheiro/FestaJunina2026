import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/Portaria/",
  build: {
    outDir: "../dist/Portaria",
    emptyOutDir: false,
  },
})
