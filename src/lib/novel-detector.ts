import { promises as fs } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import type { Novel, Chapter, NovelState } from './types/index.ts';

interface NovelFile {
  slug: string;
  data: Novel;
}

export class NovelDetector {
  private novelsDir: string;
  private chaptersDir: string;

  constructor(novelsDir = 'src/content/novels', chaptersDir = 'src/content/chapters') {
    this.novelsDir = novelsDir;
    this.chaptersDir = chaptersDir;
  }

  async getActiveNovels(): Promise<NovelFile[]> {
    try {
      const files = await fs.readdir(this.novelsDir);
      const novels: NovelFile[] = [];

      for (const file of files) {
        if (file.endsWith('.md')) {
          try {
            const content = await fs.readFile(join(this.novelsDir, file), 'utf-8');
            const { data } = matter(content);

            if (data.status === '연재 중') {
              novels.push({
                slug: file.replace('.md', ''),
                data: data as Novel
              } as NovelFile);
            }
          } catch (parseError) {
            console.warn(`Skipping invalid file ${file}:`, (parseError as Error).message);
            // 잘못된 frontmatter가 있는 파일은 스킵
            continue;
          }
        }
      }

      return novels;
    } catch (error) {
      console.error('Failed to get active novels:', error);
      return [];
    }
  }

  async getNovelWithProgress(slug: string): Promise<NovelState | null> {
    try {
      // 소설 메타데이터 읽기
      const novelPath = join(this.novelsDir, `${slug}.md`);
      const novelContent = await fs.readFile(novelPath, 'utf-8');
      const { data: novelData } = matter(novelContent);
      const typedNovelData = novelData as Novel;

      // 챕터 파일들 확인
      const chapterFiles = await fs.readdir(this.chaptersDir);
      const novelChapters = chapterFiles
        .filter(file => file.startsWith(slug) && file.endsWith('.md'))
        .map(file => {
          const match = file.match(/-ch(\d+)\.md$/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0)
        .sort((a, b) => a - b);

      const latestChapter = novelChapters.length > 0 ? Math.max(...novelChapters) : 0;
      const totalChapters = novelData.totalChapters || 75;
      const progressPercentage = Math.floor((latestChapter / totalChapters) * 100);

      // 마지막 업데이트 시간 확인
      let lastUpdate: Date = new Date();
      if (novelChapters.length > 0) {
        const latestChapterFile = `${slug}-ch${latestChapter.toString().padStart(2, '0')}.md`;
        const latestChapterPath = join(this.chaptersDir, latestChapterFile);
        try {
          const stats = await fs.stat(latestChapterPath);
          lastUpdate = stats.mtime;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`Could not get stats for ${latestChapterPath}:`, errorMessage);
        }
      }

      return {
        ...typedNovelData,
        slug,
        currentChapter: (novelData as any).currentChapter || 0,
        lastUpdated: (novelData as any).lastUpdated || new Date().toISOString(),
        chaptersCount: novelChapters.length,
        latestChapter,
        progressPercentage,
        lastUpdate,
        completionAnalysis: {
          overallReadiness: progressPercentage >= 85,
        },
      };
    } catch (error) {
      console.error(`Failed to get novel progress for ${slug}:`, error);
      return null;
    }
  }

  async needsNewNovel() {
    try {
      const activeNovels = await this.getActiveNovels();
      return activeNovels.length < 3; // 최대 3개의 활성 소설
    } catch (error) {
      console.error('Failed to check if new novel is needed:', error);
      return true; // 오류 시 새 소설 생성 시도
    }
  }

  isNovelNearCompletion(novelProgress: any): boolean {
    return novelProgress.progressPercentage >= 85;
  }

  async getOldestUpdatedNovel() {
    try {
      const activeNovels = await this.getActiveNovels();
      let oldestNovel = null;
      let oldestDate = null;

      for (const novel of activeNovels) {
        const progress = await this.getNovelWithProgress(novel.slug);
        if (progress) {
          if (oldestDate === null || progress.lastUpdated < oldestDate) {
            oldestDate = progress.lastUpdated;
            oldestNovel = progress;
          }
        }
      }

      return oldestNovel;
    } catch (error) {
      console.error('Failed to get oldest updated novel:', error);
      return null;
    }
  }
}
