import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@myapp/ui': resolve(__dirname, '../ui/src'),
      '@myapp/ui/button': resolve(__dirname, '../ui/src/button/index.tsx'),
      '@myapp/ui/card': resolve(__dirname, '../ui/src/card/index.tsx'),
      '@myapp/ui/input': resolve(__dirname, '../ui/src/input/index.tsx'),
      '@myapp/ui/layout': resolve(__dirname, '../ui/src/layout/index.tsx'),

      '@myapp/hooks': resolve(__dirname, '../hooks/src'),
      '@myapp/types': resolve(__dirname, '../types/src'),
      '@myapp/utils': resolve(__dirname, '../utils/src'),
      '@myapp/lib': resolve(__dirname, '../lib/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
