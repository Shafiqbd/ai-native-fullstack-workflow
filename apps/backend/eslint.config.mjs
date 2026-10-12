import sharedConfig from '@ai-workflow/eslint-config';

/**
 * ESLint configuration for the NestJS backend.
 * Rules shared across the monorepo live in @ai-workflow/eslint-config
 * and encode the AGENTS.md TypeScript rules.
 *
 * The decorator parser options let `consistent-type-imports` see that
 * classes referenced in decorated signatures (injected services,
 * @Body() DTOs) are needed at runtime for design:paramtypes metadata,
 * so it no longer demands `import type` for them.
 */
export default [
  ...sharedConfig,
  {
    languageOptions: {
      parserOptions: {
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
    },
  },
];
