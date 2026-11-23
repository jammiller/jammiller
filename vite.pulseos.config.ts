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
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL('./pulseos/index.html', import.meta.url)),
        'course-builder': fileURLToPath(new URL('./pulseos/course-builder/index.html', import.meta.url)),
        'competency-library': fileURLToPath(new URL('./pulseos/competency-library/index.html', import.meta.url)),
        'role-builder': fileURLToPath(new URL('./pulseos/role-builder/index.html', import.meta.url)),
        'ojt-compliance': fileURLToPath(new URL('./pulseos/ojt-compliance/index.html', import.meta.url)),
        program: fileURLToPath(new URL('./pulseos/construction-workforce-readiness/index.html', import.meta.url)),
      },
    },
  },
});
