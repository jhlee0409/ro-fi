import tseslint from 'typescript-eslint';
import globals from 'globals';
import astro from 'eslint-plugin-astro';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.vercel/',
      'coverage/',
      'test-results/',
      'playwright-report/',
      'src/content/_generated/', // Auto-generated content
    ],
  },

  // Astro config - applies to `.astro` files and script tags within them
  ...astro.configs['flat/recommended'],

  // Base config for all JS/TS files
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    // Inherit recommended rules from typescript-eslint
    ...tseslint.configs.strict,
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    // Custom rules
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
    },
  },

  // React specific config for JSX/TSX files
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Astro handles this automatically
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Prettier config to disable conflicting style rules
  prettierConfig
);
