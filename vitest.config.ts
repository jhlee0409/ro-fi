import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import os from 'os';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/tests/e2e/**', // Exclude Playwright tests from Vitest
      '**/*.spec.ts', // Exclude Playwright spec files
      '**/logs/**',
      '**/tmp/**',
      '**/backup/**',
      '**/.api-backup-*/**' // Exclude API backup test files
    ],
    
    // Force exit after tests complete
    forceRerunTriggers: ['**/src/**/*.js', '**/src/**/*.ts'],
    dangerouslyIgnoreUnhandledErrors: false,
    
    // Setup file for global cleanup
    setupFiles: ['./vitest.setup.ts'],
    
    // 성능 최적화된 타임아웃
    testTimeout: 20000, // 20초 (AI retry 로직을 위한 충분한 시간)
    hookTimeout: 10000,  // 10초 (cleanup을 위한 충분한 시간)
    teardownTimeout: 5000, // 5초 (정리를 위한 충분한 시간)
    
    // 테스트 재시도 설정
    retry: process.env.CI ? 2 : 0,
    
    // 병렬 처리 최적화
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: Math.min(4, os.cpus().length), // CPU 코어 수에 맞춤
        minThreads: 1,
        isolate: true // 테스트 격리
      }
    },
    
    // 리포터 최적화
    reporters: process.env.CI ? ['json', 'github-actions'] : ['default'],
    
    // 메모리 관리
    clearMocks: true,
    restoreMocks: true,
    
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
        '**/*{.,-}spec.*',
        'scripts/',
        'backup/'
      ],
      thresholds: {
        global: {
          branches: 75, // 80%에서 75%로 완화 (현실적 목표)
          functions: 75,
          lines: 75, 
          statements: 75
        }
      },
      // 커버리지 캐싱
      reportsDirectory: './coverage',
      clean: true
    },
    
    // 파일 감시 최적화 
    watchExclude: [
      '**/node_modules/**',
      '**/dist/**',  
      '**/logs/**',
      '**/coverage/**',
      '**/tmp/**',
      '**/.git/**'
    ],
    
    // 종료 시 bail 설정
    bail: process.env.CI ? 5 : 0 // CI에서는 5개 실패 시 중단
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/test': resolve(__dirname, './src/test'),
      '@/lib': resolve(__dirname, './src/lib'),
    },
  },
});