/**
 * 소설 저장소 구현체 - NovelDetector 기능 포함
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import type { INovelRepository } from './novel-repository-interface';
import type { IChapterRepository } from '../chapter/chapter-repository-interface';
import type { IStorageRepository } from '../../../infrastructure/storage';
import type { Result, Novel, NovelProgress, NovelMetadata } from '../../../shared/types';
import { ok, err } from '../../../shared/types';
import { 
  DomainError, 
  NovelNotFoundError, 
  ValidationError 
} from '../../../shared/errors';

export class NovelRepository implements INovelRepository {
  constructor(
    private readonly storage: IStorageRepository,
    private readonly chapterRepository: IChapterRepository,
    private readonly novelsPath: string = 'src/content/novels',
    private readonly chaptersPath: string = 'src/content/chapters'
  ) {}

  async getActiveNovels(): Promise<Result<NovelMetadata[], DomainError>> {
    try {
      const listResult = await this.storage.listFiles(this.novelsPath, '.md');
      if (!listResult.success) {
        return err(new DomainError('STORAGE_ERROR', listResult.error.message));
      }

      const activeNovels: NovelMetadata[] = [];
      
      for (const filename of listResult.data) {
        const readResult = await this.storage.readFile(join(this.novelsPath, filename));
        if (!readResult.success) continue;
        
        const { data: frontmatter } = matter(readResult.data);
        
        if (frontmatter.status === '연재 중') {
          const slug = filename.replace('.md', '');
          activeNovels.push({
            slug,
            data: frontmatter as any,
            filename
          });
        }
      }
      
      return ok(activeNovels);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getNovelProgress(slug: string): Promise<Result<NovelProgress, DomainError>> {
    try {
      // 소설 메타데이터 조회
      const novelResult = await this.getNovelMetadata(slug);
      if (!novelResult.success) {
        return err(novelResult.error);
      }
      
      const novel = novelResult.data;
      
      // 챕터 수 조회
      const chapterCountResult = await this.chapterRepository.getChapterCount(slug);
      if (!chapterCountResult.success) {
        return err(chapterCountResult.error);
      }
      
      const chaptersCount = chapterCountResult.data;
      
      // 최신 챕터 번호 조회
      const latestChapterResult = await this.chapterRepository.getLatestChapterNumber(slug);
      const latestChapter = latestChapterResult.success ? latestChapterResult.data : 0;
      
      // 진행률 계산
      const totalChapters = novel.data.totalChapters || 75;
      const progressPercentage = Math.round((chaptersCount / totalChapters) * 100);
      
      // 마지막 업데이트 시간 (예시로 최신 챕터의 게시일)
      let lastUpdate = new Date(novel.data.publishedDate);
      if (latestChapter > 0) {
        const latestChapterResult = await this.chapterRepository.getChapter(slug, latestChapter);
        if (latestChapterResult.success) {
          lastUpdate = new Date(latestChapterResult.data.publicationDate);
        }
      }
      
      const progress: NovelProgress = {
        novel,
        chaptersCount,
        latestChapter,
        progressPercentage,
        lastUpdate
      };
      
      return ok(progress);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getNovelMetadata(slug: string): Promise<Result<NovelMetadata, DomainError>> {
    try {
      const filename = `${slug}.md`;
      const readResult = await this.storage.readFile(join(this.novelsPath, filename));
      
      if (!readResult.success) {
        return err(new NovelNotFoundError(slug));
      }
      
      const { data: frontmatter } = matter(readResult.data);
      
      const metadata: NovelMetadata = {
        slug,
        data: frontmatter as any,
        filename
      };
      
      return ok(metadata);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async createNovel(novel: Novel): Promise<Result<string, DomainError>> {
    try {
      if (!novel.title || !novel.slug) {
        return err(new ValidationError('소설 제목과 슬러그는 필수입니다'));
      }
      
      const slug = novel.slug;
      const filename = `${slug}.md`;
      
      // 중복 검사
      const existsResult = await this.storage.exists(join(this.novelsPath, filename));
      if (existsResult.success && existsResult.data) {
        return err(new ValidationError(`소설 '${slug}'이 이미 존재합니다`));
      }
      
      const frontmatter = `---
title: "${novel.title}"
author: "${novel.author || '클로드 소네트 AI'}"
status: "${novel.status || '연재 중'}"
summary: "${novel.summary || ''}"
publishedDate: ${novel.publishedDate || new Date().toISOString().split('T')[0]}
totalChapters: ${novel.totalChapters || 75}
rating: ${novel.rating || 0}
tropes: ${JSON.stringify(novel.tropes || [])}
---

# ${novel.title}

${novel.content || novel.summary || '소설 내용이 여기에 들어갑니다.'}`;
      
      const writeResult = await this.storage.writeFile(
        join(this.novelsPath, filename), 
        frontmatter
      );
      
      if (!writeResult.success) {
        return err(new DomainError('STORAGE_ERROR', writeResult.error.message));
      }
      
      return ok(slug);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async updateNovelStatus(slug: string, status: string): Promise<Result<void, DomainError>> {
    try {
      const filename = `${slug}.md`;
      const filePath = join(this.novelsPath, filename);
      
      const readResult = await this.storage.readFile(filePath);
      if (!readResult.success) {
        return err(new NovelNotFoundError(slug));
      }
      
      const content = readResult.data;
      const updatedContent = content.replace(
        /status: "[^"]*"/,
        `status: "${status}"`
      );
      
      const writeResult = await this.storage.writeFile(filePath, updatedContent);
      if (!writeResult.success) {
        return err(new DomainError('STORAGE_ERROR', writeResult.error.message));
      }
      
      return ok(undefined);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async deleteNovel(slug: string): Promise<Result<void, DomainError>> {
    try {
      const filename = `${slug}.md`;
      const deleteResult = await this.storage.deleteFile(join(this.novelsPath, filename));
      
      if (!deleteResult.success) {
        return err(new DomainError('STORAGE_ERROR', deleteResult.error.message));
      }
      
      return ok(undefined);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getOldestUpdatedNovel(): Promise<Result<NovelProgress, DomainError>> {
    try {
      const activeNovelsResult = await this.getActiveNovels();
      if (!activeNovelsResult.success) {
        return err(activeNovelsResult.error);
      }
      
      const activeNovels = activeNovelsResult.data;
      if (activeNovels.length === 0) {
        return err(new NovelNotFoundError('활성 소설이 없습니다'));
      }
      
      let oldestNovel: NovelProgress | null = null;
      let oldestTime = Date.now();
      
      for (const novel of activeNovels) {
        const progressResult = await this.getNovelProgress(novel.slug);
        if (progressResult.success) {
          const progress = progressResult.data;
          if (progress.lastUpdate.getTime() < oldestTime) {
            oldestTime = progress.lastUpdate.getTime();
            oldestNovel = progress;
          }
        }
      }
      
      if (!oldestNovel) {
        return err(new NovelNotFoundError('진행도를 조회할 수 있는 소설이 없습니다'));
      }
      
      return ok(oldestNovel);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Legacy NovelDetector methods for compatibility
  async needsNewNovel(): Promise<boolean> {
    const activeNovelsResult = await this.getActiveNovels();
    if (!activeNovelsResult.success) return true;
    
    return activeNovelsResult.data.length < 3; // maxActiveNovels
  }

  isNovelNearCompletion(novelProgress: NovelProgress): boolean {
    return novelProgress.progressPercentage >= 85;
  }
}