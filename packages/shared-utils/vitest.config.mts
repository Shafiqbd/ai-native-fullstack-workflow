import { defineConfig } from 'vitest/config';

/**
 * Unit test configuration for shared utilities.
 * Vitest is the single test runner across the monorepo.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
