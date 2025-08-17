import tseslint from 'typescript-eslint';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default [
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
      '.astro/', // Astro generated files
      '**/*.astro', // Skip Astro files due to parser issues
      'src/env.d.ts', // Astro type declarations
    ],
  },

  // Astro config - applies to `.astro` files and script tags within them
  // Note: Disabled due to parsing issues with current astro-eslint-parser
  // ...astro.configs['flat/recommended'],

  // Base ESLint configuration for all JS/TS files
  ...tseslint.configs.recommended,

  // TypeScript configuration (excluding Astro files and auto-generated files)
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.astro', '.astro/**/*'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off', // Too strict for this project
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
    },
  },

  // JavaScript configuration - more relaxed for scripts
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_'
        }
      ],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Scripts directory - allow console statements
  {
    files: ['scripts/**/*.{js,ts}'],
    rules: {
      'no-console': 'off',
    },
  },

  // Test files - more relaxed rules
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', 'src/test/**/*'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // Config files - allow require imports
  {
    files: ['*.config.{js,ts,mjs}', 'tailwind.config.mjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // UI component files - relax interface rules
  {
    files: ['src/components/ui/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
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
      'react/react-in-jsx-scope': 'off', // Astro handles this automatically
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Prettier config to disable conflicting style rules
  prettierConfig,
];
