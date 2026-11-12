import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('./tremonix', import.meta.url)),
  plugins: [react(), {
    name: 'tremonix-entry',
    resolveId(id) {
      if (id === '/src/main-tremonix.tsx') {
        return fileURLToPath(new URL('./src/main-tremonix.tsx', import.meta.url));
      }
    },
  }],
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
});
