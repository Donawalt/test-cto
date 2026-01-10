import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';

export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: {
    alias: {
      '@myapp/ui': resolve(__dirname, '../ui/src'),
      '@myapp/hooks': resolve(__dirname, '../hooks/src'),
      '@myapp/types': resolve(__dirname, '../types/src'),
      '@myapp/utils': resolve(__dirname, '../utils/src'),
      '@myapp/lib': resolve(__dirname, '../lib/src'),
      '@myapp/tokens': resolve(__dirname, '../tokens/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: false,
    },
  },
  clearScreen: false,
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
