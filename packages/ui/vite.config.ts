import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'button/index': resolve(__dirname, 'src/button/index.tsx'),
        'card/index': resolve(__dirname, 'src/card/index.tsx'),
        'input/index': resolve(__dirname, 'src/input/index.tsx'),
        'layout/index': resolve(__dirname, 'src/layout/index.tsx'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', '@myapp/hooks', '@myapp/tokens', '@myapp/types'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
