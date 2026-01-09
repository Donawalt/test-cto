import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'dom/index': resolve(__dirname, 'src/dom/index.ts'),
        'string/index': resolve(__dirname, 'src/string/index.ts'),
        'events/index': resolve(__dirname, 'src/events/index.ts'),
        'storage/index': resolve(__dirname, 'src/storage/index.ts'),
        'validation/index': resolve(__dirname, 'src/validation/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
