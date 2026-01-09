import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'db/index': resolve(__dirname, 'src/db/index.ts'),
        'api/index': resolve(__dirname, 'src/api/index.ts'),
        'ui/index': resolve(__dirname, 'src/ui/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['zod'],
    },
  },
});
