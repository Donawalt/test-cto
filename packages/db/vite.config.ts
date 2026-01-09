import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        '@myapp/types',
        'drizzle-orm',
        'better-sqlite3',
        'mysql2',
        'postgres',
      ],
    },
  },
});
