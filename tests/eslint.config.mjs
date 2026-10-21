import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules/', 'test-results/', 'playwright-report/', 'blob-report/', 'docs/'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },

  {
    files: ['e2e/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-raw-locators': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-skipped-test': ['error', { allowConditional: true }],
      'playwright/require-annotation-reason': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/prefer-lowercase-title': 'off',
    },
  },

  {
    files: ['e2e/specs/**/*.spec.ts'],
    rules: {
      'playwright/require-tags': 'error',
      'playwright/require-top-level-describe': 'error',
    },
  },

  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' },
    },
  },
);
