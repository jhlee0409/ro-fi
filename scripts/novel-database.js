/**
 * 📚 간단한 소설 데이터베이스
 * 
 * 파일시스템 기반의 단순한 소설 상태 관리
 * 복잡한 DB 없이 .md 파일들을 직접 스캔
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export class NovelDatabase {
  constructor() {
    this.novelsDir = path.join(process.cwd(), 'src/content/novels');
    this.chaptersDir = path.join(process.cwd(), 'src/content/chapters');
  }

  /**
   * 활성 연재 소설 목록 가져오기
   */
  async getActiveNovels() {
    try {
      const novelFiles = await fs.readdir(this.novelsDir);
      const novels = [];

      for (const file of novelFiles) {
        if (!file.endsWith('.md')) continue;

        const filepath = path.join(this.novelsDir, file);
        const content = await fs.readFile(filepath, 'utf-8');
        const { data } = matter(content);

        // 연재 중인 소설만 선택
        if (data.status === '연재 중') {
          const slug = file.replace('.md', '');
          const lastChapter = await this.getLastChapterNumber(slug);
          const lastUpdated = await this.getLastUpdateTime(slug);

          novels.push({
            slug,
            title: data.title,
            status: data.status,
            lastChapter,
            lastUpdated,
            recentSummary: await this.getRecentSummary(slug, lastChapter)
          });
        }
      }

      return novels;
    } catch (error) {
      console.error('소설 목록 로드 실패:', error.message);
      return [];
    }
  }

  /**
   * 특정 소설의 마지막 챕터 번호 확인
   */
  async getLastChapterNumber(novelSlug) {
    try {
      const chapterFiles = await fs.readdir(this.chaptersDir);
      const novelChapters = chapterFiles
        .filter(file => file.startsWith(novelSlug + '-ch') && file.endsWith('.md'))
        .map(file => {
          const match = file.match(/-ch(\d+)\.md$/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);

      return novelChapters.length > 0 ? Math.max(...novelChapters) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 마지막 업데이트 시간 확인
   */
  async getLastUpdateTime(novelSlug) {
    try {
      const chapterFiles = await fs.readdir(this.chaptersDir);
      const novelChapters = chapterFiles
        .filter(file => file.startsWith(novelSlug + '-ch') && file.endsWith('.md'));

      if (novelChapters.length === 0) return null;

      // 가장 최근 파일의 수정 시간
      let latestTime = null;
      for (const file of novelChapters) {
        const filepath = path.join(this.chaptersDir, file);
        const stats = await fs.stat(filepath);
        if (!latestTime || stats.mtime > latestTime) {
          latestTime = stats.mtime;
        }
      }

      return latestTime;
    } catch (error) {
      return null;
    }
  }

  /**
   * 최근 스토리 요약 생성
   */
  async getRecentSummary(novelSlug, lastChapter) {
    if (lastChapter === 0) {
      return '첫 번째 챕터입니다.';
    }

    try {
      // 최근 2-3개 챕터의 제목으로 간단한 요약 생성
      const summaries = [];
      const startChapter = Math.max(1, lastChapter - 2);

      for (let i = startChapter; i <= lastChapter; i++) {
        const filename = `${novelSlug}-ch${i}.md`;
        const filepath = path.join(this.chaptersDir, filename);
        
        try {
          const content = await fs.readFile(filepath, 'utf-8');
          const { data } = matter(content);
          summaries.push(`${i}화: ${data.title}`);
        } catch {
          // 파일이 없으면 스킵
        }
      }

      return summaries.length > 0 ? summaries.join('\n') : '이전 챕터 정보 없음';
    } catch (error) {
      return '이전 스토리 요약 생성 실패';
    }
  }

  /**
   * 소설의 마지막 챕터 번호 업데이트
   */
  async updateLastChapter(novelSlug, chapterNumber) {
    // 실제로는 파일시스템에서 자동으로 감지되므로 
    // 여기서는 로그만 남김
    console.log(`📝 ${novelSlug} 마지막 챕터: ${chapterNumber}화`);
  }

  /**
   * 소설 완결 처리
   */
  async markCompleted(novelSlug) {
    try {
      const filepath = path.join(this.novelsDir, `${novelSlug}.md`);
      const content = await fs.readFile(filepath, 'utf-8');
      const { data, content: bodyContent } = matter(content);

      // 상태를 완결로 변경
      data.status = '완결';
      data.completedDate = new Date().toISOString().split('T')[0];

      const newContent = matter.stringify(bodyContent, data);
      await fs.writeFile(filepath, newContent);

      console.log(`🎊 ${novelSlug} 완결 처리 완료`);
    } catch (error) {
      console.error(`완결 처리 실패: ${error.message}`);
    }
  }

  /**
   * 소설 정보 조회
   */
  async getNovelInfo(novelSlug) {
    try {
      const filepath = path.join(this.novelsDir, `${novelSlug}.md`);
      const content = await fs.readFile(filepath, 'utf-8');
      const { data } = matter(content);
      
      return {
        slug: novelSlug,
        ...data,
        lastChapter: await this.getLastChapterNumber(novelSlug),
        lastUpdated: await this.getLastUpdateTime(novelSlug)
      };
    } catch (error) {
      return null;
    }
  }
}