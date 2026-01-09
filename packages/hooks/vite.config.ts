import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'scroll/index': resolve(__dirname, 'src/scroll/index.ts'),
        'state/index': resolve(__dirname, 'src/state/index.ts'),
        'dom/index': resolve(__dirname, 'src/dom/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', '@studio-freight/lenis'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
