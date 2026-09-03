/**
 * Shared ESLint flat configuration for ai-native-fullstack-workflow.
 *
 * This config encodes the TypeScript rules from AGENTS.md so they are
 * enforced by tooling instead of by convention:
 * - `any` is forbidden (use `unknown` and narrow).
 * - Explicit return types are required on exported functions.
 * - Type-only imports must use `import type`.
 * - Unused variables are errors (except `_`-prefixed).
 * - Prettier handles formatting; eslint-config-prettier disables
 *   stylistic rules that would conflict.
 *
 * Usage (in an application's eslint.config.mjs):
 *   import sharedConfig from '@ai-workflow/eslint-config';
 *   export default [...sharedConfig];
 */

const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/next-env.d.ts',
    ],
  },
  tseslint.configs.recommended,
  {
    rules: {
      // AGENTS.md: "Never use any - use unknown if the type is truly
      // unknown, then narrow the type."
      '@typescript-eslint/no-explicit-any': 'error',

      // AGENTS.md: "All variables, parameters, and return types must be
      // explicitly typed." allowExpressions keeps JSX/inline callbacks sane.
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],

      // AGENTS.md: "Use type-only imports when possible."
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],

      // Unused code is dead code; prefix intentionally unused
      // parameters with `_`.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Prettier is the single source of truth for formatting.
  prettierConfig,
);
