import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@uny/design-system'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:21114',
      '/health': 'http://127.0.0.1:21114',
    },
  },
});
