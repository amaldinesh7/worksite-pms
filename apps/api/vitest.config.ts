import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Run tests sequentially to avoid database conflicts
    fileParallelism: false,
    // Setup file configures test database isolation
    setupFiles: ['./src/tests/setup.ts'],
    // Increase timeout for database operations
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/tests/**'],
    },
  },
});
