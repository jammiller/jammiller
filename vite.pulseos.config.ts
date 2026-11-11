import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('./pulseos', import.meta.url)),
  plugins: [
    react(),
    {
      name: 'pulseos-entry',
      resolveId(id) {
        if (id === '/src/main-pulseos.tsx') {
          return fileURLToPath(new URL('./src/main-pulseos.tsx', import.meta.url));
        }
      },
    },
  ],
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
});
