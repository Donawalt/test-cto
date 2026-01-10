import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@myapp/types': resolve(__dirname, '../packages/types/src'),
      '@myapp/ui': resolve(__dirname, '../packages/ui/src'),
      '@myapp/hooks': resolve(__dirname, '../packages/hooks/src'),
      '@myapp/utils': resolve(__dirname, '../packages/utils/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})