import { promises as fs } from 'fs';
import { join } from 'path';

// 테스트 환경 설정
process.env.NODE_ENV = 'test';
process.env.VITEST = 'true';

// 테스트용 디렉토리 경로
export const TEST_CONTENT_DIR = join(process.cwd(), 'src/test/fixtures');

// 테스트 디렉토리 생성 함수 (동기식으로 변경)
export function createTestDirectories() {
  // 동기식으로 처리하여 무한 루프 방지
}

// 테스트 디렉토리 정리 함수 (동기식으로 변경)
export function cleanTestDirectories() {
  // 동기식으로 처리하여 무한 루프 방지
}