import { defineConfig } from 'vitest/config';

/**
 * End-to-end test configuration: boots the real Nest application
 * (AppModule) and exercises it over HTTP with supertest.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    // E2E suites share one application instance per file; run files
    // sequentially to keep database-independent tests deterministic.
    fileParallelism: false,
  },
});
