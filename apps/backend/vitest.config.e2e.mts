import { defineConfig } from 'vitest/config';

/**
 * End-to-end test configuration: boots the real Nest application
 * (AppModule) and exercises it over HTTP with supertest.
 *
 * The setup file pins DATABASE_URL to empty, so this run always
 * exercises the database-less boot path and passes on any machine.
 * Integration tests that require PostgreSQL live in
 * vitest.config.e2e-db.mts (`yarn test:e2e:db`).
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    // Database suites run only via vitest.config.e2e-db.mts.
    exclude: ['test/db/**', '**/node_modules/**'],
    setupFiles: ['test/setup/no-db.ts'],
    // E2E suites share one application instance per file; run files
    // sequentially to keep database-independent tests deterministic.
    fileParallelism: false,
    // Booting the Nest application takes longer than the 10s default.
    hookTimeout: 30_000,
    testTimeout: 15_000,
  },
});
