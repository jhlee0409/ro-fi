/**
 * 테스트 환경 설정 및 격리 시스템
 */
import { join } from 'path';

export const TEST_CONFIG = {
  // 테스트 환경에서만 사용되는 격리된 경로
  CONTENT_DIRS: {
    novels: join(process.cwd(), 'src/test/fixtures/novels'),
    chapters: join(process.cwd(), 'src/test/fixtures/chapters'),
    tropes: join(process.cwd(), 'src/test/fixtures/tropes')
  },
  
  // 프로덕션 환경 경로
  PRODUCTION_DIRS: {
    novels: 'src/content/novels',
    chapters: 'src/content/chapters', 
    tropes: 'src/content/tropes'
  }
};

/**
 * 현재 환경에 맞는 경로 반환
 */
export function getContentPaths() {
  const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  
  return isTest ? TEST_CONFIG.CONTENT_DIRS : TEST_CONFIG.PRODUCTION_DIRS;
}

/**
 * 테스트 격리 확인
 */
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
}

/**
 * 테스트 실행 전 안전성 검사
 */
export function validateTestIsolation() {
  if (!isTestEnvironment()) {
    throw new Error('테스트는 반드시 격리된 환경에서만 실행되어야 합니다!');
  }
  
  const paths = getContentPaths();
  const testFixturePattern = /src\/test\/fixtures/;
  
  Object.values(paths).forEach(path => {
    if (!testFixturePattern.test(path)) {
      throw new Error(`테스트 경로가 격리되지 않음: ${path}`);
    }
  });
  
  console.log('✅ 테스트 환경 격리 확인됨');
}