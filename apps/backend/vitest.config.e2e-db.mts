import { defineConfig } from 'vitest/config';

/**
 * Integration e2e configuration: exercises CRUD flows against a real
 * PostgreSQL database.
 *
 * Unlike vitest.config.e2e.mts there is no setup file, so DATABASE_URL
 * from .env is used. Each suite preflights the database and skips
 * itself with a clear message when it is unreachable, so this command
 * never fails just because no database is running:
 *
 *   yarn test:e2e:db
 *
 * In CI (Phase 5) a postgres service container will be attached and
 * this config becomes a hard, non-skippable gate.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/db/**/*.e2e-spec.ts'],
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 15_000,
  },
});
