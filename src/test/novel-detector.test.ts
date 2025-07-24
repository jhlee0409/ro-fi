import { describe, test, expect, beforeEach } from 'vitest';
import { NovelDetector } from '../lib/novel-detector';
import { promises as fs } from 'fs';
import { join } from 'path';
import { TEST_CONTENT_DIR } from '../test/setup';

describe('NovelDetector', () => {
  let detector: NovelDetector;
  let testContentDir: string;
  let testNovelsDir: string;
  let testChaptersDir: string;
  
  beforeEach(() => {
    // 각 테스트마다 고유한 디렉토리 사용하여 완전한 격리 보장
    const testId = Math.random().toString(36).substring(7);
    testContentDir = join(process.cwd(), `src/test/fixtures/novel-detector-${testId}`);
    testNovelsDir = join(testContentDir, 'novels');
    testChaptersDir = join(testContentDir, 'chapters');
  });

  beforeEach(async () => {
    // 이전 테스트의 영향을 제거하기 위해 디렉토리 초기화
    try {
      await fs.rm(testContentDir, { recursive: true, force: true });
    } catch {
      // 디렉토리가 없으면 무시
    }
    
    // 디렉토리 다시 생성
    await fs.mkdir(testContentDir, { recursive: true });
    await fs.mkdir(testNovelsDir, { recursive: true });
    await fs.mkdir(testChaptersDir, { recursive: true });
    
    detector = new NovelDetector(testNovelsDir, testChaptersDir);
    
    // 테스트용 소설 파일 생성
    await fs.writeFile(
      join(testNovelsDir, 'active-novel.md'),
      `---
title: "진행 중인 소설"
status: "연재 중"
author: "테스트 작가"
publishedDate: 2024-01-01
totalChapters: 10
rating: 0
tropes: ["enemies-to-lovers"]
---

# 진행 중인 소설
내용입니다.`
    );

    await fs.writeFile(
      join(testNovelsDir, 'completed-novel.md'),
      `---
title: "완결된 소설"
status: "완결"
author: "테스트 작가"
publishedDate: 2024-01-01
totalChapters: 50
rating: 0
tropes: ["second-chance"]
---

# 완결된 소설
내용입니다.`
    );

    // 테스트용 챕터 파일들 생성 (올바른 파일명 형식 사용)
    for (let i = 1; i <= 5; i++) {
      await fs.writeFile(
        join(testChaptersDir, `active-novel-ch${i.toString().padStart(2, '0')}.md`),
        `---
title: "챕터 ${i}"
novel: "active-novel"
chapterNumber: ${i}
publicationDate: 2024-01-${i.toString().padStart(2, '0')}
wordCount: 1000
rating: 0
---

# 챕터 ${i}
챕터 내용입니다.`
      );
    }
  });

  afterEach(async () => {
    // 테스트 후 정리
    try {
      await fs.rm(testContentDir, { recursive: true, force: true });
    } catch {
      // 정리 실패해도 무시
    }
  });

  test('연재 중인 소설들을 정확히 감지해야 함', async () => {
    const activeNovels = await detector.getActiveNovels();
    
    expect(activeNovels).toHaveLength(1);
    expect(activeNovels[0].slug).toBe('active-novel');
    expect(activeNovels[0].data.status).toBe('연재 중');
  });

  test('각 소설의 진행도를 정확히 계산해야 함', async () => {
    const novelWithProgress = await detector.getNovelWithProgress('active-novel');
    
    expect(novelWithProgress).toBeDefined();
    expect(novelWithProgress!.chaptersCount).toBe(5);
    expect(novelWithProgress!.latestChapter).toBe(5);
    expect(novelWithProgress!.progressPercentage).toBe(50); // 5/10 * 100
  });

  test('완결이 가까운 소설을 식별해야 함', async () => {
    // 기본 소설과 챕터들이 beforeEach에서 이미 생성되었는지 확인
    try {
      await fs.access(join(testNovelsDir, 'active-novel.md'));
    } catch {
      // 없으면 다시 생성
      await fs.writeFile(
        join(testNovelsDir, 'active-novel.md'),
        `---
title: "진행 중인 소설"
status: "연재 중"
author: "테스트 작가"
publishedDate: 2024-01-01
totalChapters: 10
rating: 0
tropes: ["enemies-to-lovers"]
---

# 진행 중인 소설
내용입니다.`
      );

      // 기본 챕터들 생성 (1-5)
      for (let i = 1; i <= 5; i++) {
        await fs.writeFile(
          join(testChaptersDir, `active-novel-ch${i.toString().padStart(2, '0')}.md`),
          `---
title: "챕터 ${i}"
novel: "active-novel"
chapterNumber: ${i}
publicationDate: 2024-01-${i.toString().padStart(2, '0')}
wordCount: 1000
rating: 0
---

# 챕터 ${i}
챕터 내용입니다.`
        );
      }
    }

    // 4개 챕터 추가로 생성 (총 9개, 목표 10개의 90%)
    for (let i = 6; i <= 9; i++) {
      await fs.writeFile(
        join(testChaptersDir, `active-novel-ch${i.toString().padStart(2, '0')}.md`),
        `---
title: "챕터 ${i}"
novel: "active-novel"
chapterNumber: ${i}
publicationDate: 2024-01-${i.toString().padStart(2, '0')}
wordCount: 1000
rating: 0
---

# 챕터 ${i}
챕터 내용입니다.`
      );
    }

    const novelWithProgress = await detector.getNovelWithProgress('active-novel');
    
    expect(novelWithProgress).toBeDefined();
    expect(novelWithProgress).not.toBeNull();
    
    if (novelWithProgress) {
      const isNearCompletion = detector.isNovelNearCompletion(novelWithProgress);
      expect(isNearCompletion).toBe(true);
    }
  });

  test('새 소설이 필요한지 판단해야 함', async () => {
    // 기본 소설과 챕터들이 beforeEach에서 이미 생성되었는지 확인
    try {
      await fs.access(join(testNovelsDir, 'active-novel.md'));
    } catch {
      // 없으면 다시 생성
      await fs.writeFile(
        join(testNovelsDir, 'active-novel.md'),
        `---
title: "진행 중인 소설"
status: "연재 중"
author: "테스트 작가"
publishedDate: 2024-01-01
totalChapters: 10
rating: 0
tropes: ["enemies-to-lovers"]
---

# 진행 중인 소설
내용입니다.`
      );

      // 기본 챕터들 생성 (1-5)
      for (let i = 1; i <= 5; i++) {
        await fs.writeFile(
          join(testChaptersDir, `active-novel-ch${i.toString().padStart(2, '0')}.md`),
          `---
title: "챕터 ${i}"
novel: "active-novel"
chapterNumber: ${i}
publicationDate: 2024-01-${i.toString().padStart(2, '0')}
wordCount: 1000
rating: 0
---

# 챕터 ${i}
챕터 내용입니다.`
        );
      }
    }

    const needsNewNovel = await detector.needsNewNovel();
    
    // 활성 소설이 1개뿐이므로 새 소설이 필요함
    expect(needsNewNovel).toBe(true);
  });

  test('마크다운 frontmatter 파싱이 정확해야 함', async () => {
    const novelWithProgress = await detector.getNovelWithProgress('active-novel');
    
    expect(novelWithProgress).toBeDefined();
    expect(novelWithProgress!.novel.data.title).toBe('진행 중인 소설');
    expect(novelWithProgress!.novel.data.status).toBe('연재 중');
    expect(novelWithProgress!.novel.data.author).toBe('테스트 작가');
    expect(novelWithProgress!.novel.data.totalChapters).toBe(10);
    expect(novelWithProgress!.novel.data.tropes).toEqual(['enemies-to-lovers']);
    
    // Content should not include frontmatter
    expect(novelWithProgress!.novel.content).toContain('# 진행 중인 소설');
    expect(novelWithProgress!.novel.content).not.toContain('---');
    expect(novelWithProgress!.novel.content).not.toContain('title:');
  });

  test('챕터 파일의 frontmatter 파싱이 정확해야 함', async () => {
    const novelWithProgress = await detector.getNovelWithProgress('active-novel');
    
    expect(novelWithProgress).toBeDefined();
    expect(novelWithProgress!.chaptersCount).toBe(5);
    
    // 챕터 파일 이름 규칙 확인 (active-novel-ch01.md 등)
    const expectedChapterFiles = [
      'active-novel-ch01.md',
      'active-novel-ch02.md', 
      'active-novel-ch03.md',
      'active-novel-ch04.md',
      'active-novel-ch05.md'
    ];
    
    for (const filename of expectedChapterFiles) {
      const filepath = join(testChaptersDir, filename);
      try {
        await fs.access(filepath);
      } catch {
        throw new Error(`Expected chapter file ${filename} not found`);
      }
    }
  });

  test('잘못된 frontmatter가 있는 파일을 적절히 처리해야 함', async () => {
    // 잘못된 frontmatter를 가진 소설 파일 생성
    await fs.writeFile(
      join(testNovelsDir, 'invalid-novel.md'),
      `---
title: "잘못된 소설"
status: "연재 중"
invalidField: malformed yaml: [unclosed bracket
totalChapters: not_a_number
---

# 잘못된 소설
내용입니다.`
    );

    // 시스템이 이를 적절히 처리하는지 확인
    const activeNovels = await detector.getActiveNovels();
    
    // 유효한 소설만 반환되어야 함
    expect(activeNovels).toHaveLength(1);
    expect(activeNovels[0].slug).toBe('active-novel');
  });

  test('가장 오래된 업데이트 소설을 선택해야 함', async () => {
    // 기본 소설과 챕터들이 beforeEach에서 이미 생성되었는지 확인
    try {
      await fs.access(join(testNovelsDir, 'active-novel.md'));
    } catch {
      // 없으면 다시 생성
      await fs.writeFile(
        join(testNovelsDir, 'active-novel.md'),
        `---
title: "진행 중인 소설"
status: "연재 중"
author: "테스트 작가"
publishedDate: 2024-01-01
totalChapters: 10
rating: 0
tropes: ["enemies-to-lovers"]
---

# 진행 중인 소설
내용입니다.`
      );

      // 기본 챕터들 생성 (1-5)
      for (let i = 1; i <= 5; i++) {
        await fs.writeFile(
          join(testChaptersDir, `active-novel-ch${i.toString().padStart(2, '0')}.md`),
          `---
title: "챕터 ${i}"
novel: "active-novel"
chapterNumber: ${i}
publicationDate: 2024-01-${i.toString().padStart(2, '0')}
wordCount: 1000
rating: 0
---

# 챕터 ${i}
챕터 내용입니다.`
        );
      }
    }
    
    // 두 번째 활성 소설 추가
    await fs.writeFile(
      join(testNovelsDir, 'newer-novel.md'),
      `---
title: "최근 소설"
status: "연재 중"
author: "테스트 작가"
publishedDate: 2024-02-01
totalChapters: 10
rating: 0
tropes: ["academy"]
---

# 최근 소설
내용입니다.`
    );

    await fs.writeFile(
      join(testChaptersDir, 'newer-novel-ch01.md'),
      `---
title: "최근 챕터"
novel: "newer-novel"
chapterNumber: 1
publicationDate: 2024-02-01
wordCount: 1000
rating: 0
---

# 최근 챕터
내용입니다.`
    );

    const oldestNovel = await detector.getOldestUpdatedNovel();
    
    expect(oldestNovel.slug).toBe('active-novel'); // 더 오래된 것
  });
});