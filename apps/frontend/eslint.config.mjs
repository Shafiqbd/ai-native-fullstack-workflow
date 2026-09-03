import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import sharedConfig from '@ai-workflow/eslint-config';

/**
 * ESLint configuration for the Next.js frontend.
 *
 * - `eslint-config-next` v16 ships native flat config presets:
 *   core-web-vitals (React/Next rules) and typescript (TS rules).
 * - The shared monorepo config (@ai-workflow/eslint-config) is spread
 *   last so the AGENTS.md rules (no `any`, explicit return types,
 *   type-only imports) take precedence.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...sharedConfig,
];

export default eslintConfig;
