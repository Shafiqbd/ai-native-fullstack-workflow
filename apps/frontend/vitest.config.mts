import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Unit tests for frontend logic (API client helpers, form parsing,
 * server-action error mapping). Runs in Node; the `@/` alias mirrors
 * tsconfig paths.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
