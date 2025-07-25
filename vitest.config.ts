import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/tests/e2e/**', // Exclude Playwright tests from Vitest
      '**/*.spec.ts' // Exclude Playwright spec files
    ],
    // 환경별 타임아웃 설정
    testTimeout: process.env.NODE_ENV === 'test' ? 5000 : 15000,
    hookTimeout: process.env.NODE_ENV === 'test' ? 3000 : 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'tests/e2e/',
        '**/*.d.ts',
        'coverage/',
        'dist/',
        '**/*.config.*',
        '**/test-*',
        '**/*{.,-}test.*',
        '**/*{.,-}spec.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/test': resolve(__dirname, './src/test'),
      '@/lib': resolve(__dirname, './src/lib'),
    },
  },
});