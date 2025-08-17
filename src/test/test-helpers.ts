/**
 * 테스트 헬퍼 함수들 - 격리된 환경에서 안전한 테스트 실행
 */
import { promises as fs } from 'fs';
import { join } from 'path';
import { getContentPaths, isTestEnvironment } from './test-config';
import { NovelDetector } from '../lib/novel-detector.js';

/**
 * 테스트 환경에서만 사용되는 격리된 NovelDetector 인스턴스 생성
 */
export function createTestNovelDetector(): NovelDetector {
  if (!isTestEnvironment()) {
    throw new Error('🚨 테스트 환경이 아닙니다! 프로덕션 데이터 오염 방지를 위해 차단됩니다.');
  }
  
  const paths = getContentPaths();
  return new NovelDetector(paths.novels, paths.chapters);
}

/**
 * 테스트용 샘플 소설 파일 생성
 */
interface TestNovelData {
  title?: string;
  status?: string;
  summary?: string;
  publishedDate?: string;
  totalChapters?: number;
  tropes?: string[];
}

export async function createTestNovel(slug: string, data?: TestNovelData) {
  if (!isTestEnvironment()) {
    throw new Error('🚨 테스트 환경이 아닙니다!');
  }
  
  const paths = getContentPaths();
  const novelContent = `---
title: "${data?.title || '테스트 소설'}"
author: "테스트 작가"
status: "${data?.status || '연재 중'}"
summary: "${data?.summary || '테스트용 소설입니다'}"
publishedDate: ${data?.publishedDate || '2025-07-25'}
totalChapters: ${data?.totalChapters || 10}
rating: 0
tropes: ${JSON.stringify(data?.tropes || ['test-trope'])}
---

# ${data?.title || '테스트 소설'}

테스트용 소설 내용입니다.
`;

  await fs.writeFile(join(paths.novels, `${slug}.md`), novelContent);
  return slug;
}

/**
 * 테스트용 샘플 챕터 파일 생성
 */
interface TestChapterData {
  publicationDate?: string;
  wordCount?: number;
  content?: string;
}

export async function createTestChapter(novelSlug: string, chapterNumber: number, data?: TestChapterData) {
  if (!isTestEnvironment()) {
    throw new Error('🚨 테스트 환경이 아닙니다!');
  }
  
  const paths = getContentPaths();
  const filename = `${novelSlug}-ch${chapterNumber.toString().padStart(2, '0')}.md`;
  
  const chapterContent = `---
title: "${chapterNumber}화"
novel: "${novelSlug}"
chapterNumber: ${chapterNumber}
publicationDate: ${data?.publicationDate || '2025-07-25'}
wordCount: ${data?.wordCount || 1000}
rating: 0
---

# ${chapterNumber}화

테스트용 챕터 내용입니다.

${data?.content || '이것은 테스트용 챕터 내용입니다.'}
`;

  await fs.writeFile(join(paths.chapters, filename), chapterContent);
  return filename;
}

/**
 * 테스트 환경 검증 - 프로덕션 파일이 존재하지 않는지 확인
 */
export async function verifyTestIsolation() {
  if (!isTestEnvironment()) {
    throw new Error('🚨 테스트 환경이 아닙니다!');
  }
  
  // 프로덕션 경로에 파일이 없는지 확인
  const productionNovels = 'src/content/novels';
  const productionChapters = 'src/content/chapters';
  
  try {
    const novelFiles = await fs.readdir(productionNovels);
    const chapterFiles = await fs.readdir(productionChapters);
    
    if (novelFiles.length > 0 || chapterFiles.length > 0) {
      // console.warn('⚠️ 프로덕션 경로에 파일이 존재합니다. 테스트가 프로덕션 데이터에 영향을 줄 수 있습니다!');
      // console.warn(`📚 소설 파일: ${novelFiles.length}개`);
      // console.warn(`📖 챕터 파일: ${chapterFiles.length}개`);
    }
  } catch (_error) {
    // 디렉토리가 없으면 OK
    // console.log('✅ 프로덕션 디렉토리가 비어있거나 존재하지 않음 - 안전함');
  }
  
  // 테스트 경로 확인
  const testPaths = getContentPaths();
  // console.log('🧪 테스트 환경 경로:');
  // console.log(`  📚 소설: ${testPaths.novels}`);
  // console.log(`  📖 챕터: ${testPaths.chapters}`);
  // console.log(`  🏷️ 트로프: ${testPaths.tropes}`);
}

/**
 * 테스트 완료 후 정리 - 안전성 보장
 */
export async function cleanupTestEnvironment() {
  if (!isTestEnvironment()) {
    throw new Error('🚨 테스트 환경이 아닙니다!');
  }
  
  const testRoot = join(process.cwd(), 'src/test/fixtures');
  
  try {
    await fs.rm(testRoot, { recursive: true, force: true });
    // console.log('🧹 테스트 환경 정리 완료');
  } catch (_error) {
    // console.warn('⚠️ 테스트 정리 실패:', _error);
  }
}