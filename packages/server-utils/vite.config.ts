import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'auth/index': resolve(__dirname, 'src/auth/index.ts'),
        'crypto/index': resolve(__dirname, 'src/crypto/index.ts'),
        'error/index': resolve(__dirname, 'src/error/index.ts'),
        'validation/index': resolve(__dirname, 'src/validation/index.ts'),
        'logging/index': resolve(__dirname, 'src/logging/index.ts'),
        'db/index': resolve(__dirname, 'src/db/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@myapp/types', 'crypto', 'util'],
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
