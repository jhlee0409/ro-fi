import { beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';

// 테스트용 임시 디렉토리 설정
const TEST_CONTENT_DIR = join(process.cwd(), 'src/test/fixtures');

beforeEach(async () => {
  // 테스트 전 임시 디렉토리 생성
  try {
    await fs.mkdir(TEST_CONTENT_DIR, { recursive: true });
    await fs.mkdir(join(TEST_CONTENT_DIR, 'novels'), { recursive: true });
    await fs.mkdir(join(TEST_CONTENT_DIR, 'chapters'), { recursive: true });
  } catch (error) {
    // 디렉토리가 이미 존재하거나 권한 문제가 있는 경우 무시
    console.warn('Test setup warning:', error);
  }
});

afterEach(async () => {
  // 테스트 후 정리
  try {
    await fs.rm(TEST_CONTENT_DIR, { recursive: true, force: true });
  } catch (error) {
    // 이미 삭제되었거나 존재하지 않는 경우 무시
  }
});

export { TEST_CONTENT_DIR };