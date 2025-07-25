import { beforeEach, afterEach, beforeAll } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { validateTestIsolation, getContentPaths, isTestEnvironment } from './test-config';

// 테스트 환경 강제 설정
process.env.NODE_ENV = 'test';
process.env.VITEST = 'true';

beforeAll(() => {
  // 테스트 격리 안전성 검사
  validateTestIsolation();
});

beforeEach(async () => {
  // 격리된 테스트 환경 확인
  if (!isTestEnvironment()) {
    throw new Error('🚨 테스트는 반드시 격리된 환경에서만 실행되어야 합니다!');
  }
  
  const paths = getContentPaths();
  
  // 테스트용 디렉토리 생성
  try {
    await fs.mkdir(join(process.cwd(), 'src/test'), { recursive: true });
    await fs.mkdir(paths.novels, { recursive: true });
    await fs.mkdir(paths.chapters, { recursive: true });
    await fs.mkdir(paths.tropes, { recursive: true });
    
    console.log('✅ 테스트 격리 환경 준비 완료');
  } catch (error) {
    console.warn('⚠️ 테스트 디렉토리 생성 경고:', error);
  }
});

afterEach(async () => {
  // 테스트 후 완전 정리 - 격리된 경로만 삭제
  const paths = getContentPaths();
  
  try {
    // 안전성 재검증 - 프로덕션 경로 삭제 방지
    const testFixturePattern = /src\/test\/fixtures/;
    Object.values(paths).forEach(path => {
      if (!testFixturePattern.test(path)) {
        throw new Error(`🚨 위험: 프로덕션 경로 삭제 시도 차단됨: ${path}`);
      }
    });
    
    // 격리된 테스트 파일들만 삭제
    await fs.rm(join(process.cwd(), 'src/test/fixtures'), { recursive: true, force: true });
    
    console.log('🧹 테스트 격리 환경 정리 완료');
  } catch (error) {
    console.warn('⚠️ 테스트 정리 경고:', error);
  }
});

// 테스트용 헬퍼 함수들
export function getTestContentPaths() {
  return getContentPaths();
}

// Legacy 호환성
export const TEST_CONTENT_DIR = join(process.cwd(), 'src/test/fixtures');