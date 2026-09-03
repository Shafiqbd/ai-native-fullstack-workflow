import { defineConfig } from 'vitest/config';

/**
 * Unit test configuration.
 *
 * Vitest is used instead of Jest because NestJS 12 packages are
 * ESM-only; Vitest runs them natively (the officially scaffolded
 * runner for Nest 12 ESM projects). `globals: true` matches the
 * conventions documented in AGENTS.md (describe/it/expect available
 * without imports); types come from "vitest/globals" in tsconfig.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
