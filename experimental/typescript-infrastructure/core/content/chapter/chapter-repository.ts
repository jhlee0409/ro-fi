/**
 * 챕터 저장소 구현체
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import type { IChapterRepository } from './chapter-repository-interface';
import type { IStorageRepository } from '../../../infrastructure/storage';
import type { Result, Chapter, ChapterMetadata } from '../../../shared/types';
import { ok, err } from '../../../shared/types';
import { 
  DomainError, 
  ChapterNotFoundError, 
  ValidationError 
} from '../../../shared/errors';

export class ChapterRepository implements IChapterRepository {
  constructor(
    private readonly storage: IStorageRepository,
    private readonly chaptersPath: string = 'src/content/chapters'
  ) {}

  async getChaptersByNovel(novelSlug: string): Promise<Result<ChapterMetadata[], DomainError>> {
    try {
      const listResult = await this.storage.listFiles(this.chaptersPath, `${novelSlug}-ch`);
      if (!listResult.success) {
        return err(new DomainError('STORAGE_ERROR', listResult.error.message));
      }

      const chapters: ChapterMetadata[] = [];
      
      for (const filename of listResult.data) {
        if (filename.startsWith(`${novelSlug}-ch`) && filename.endsWith('.md')) {
          const readResult = await this.storage.readFile(join(this.chaptersPath, filename));
          if (!readResult.success) continue;
          
          const { data: frontmatter } = matter(readResult.data);
          
          chapters.push({
            filename,
            novel: novelSlug,
            chapterNumber: frontmatter.chapterNumber,
            data: frontmatter as any
          });
        }
      }
      
      // 챕터 번호순으로 정렬
      chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
      
      return ok(chapters);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getChapter(novelSlug: string, chapterNumber: number): Promise<Result<Chapter, DomainError>> {
    try {
      const filename = `${novelSlug}-ch${chapterNumber.toString().padStart(2, '0')}.md`;
      const readResult = await this.storage.readFile(join(this.chaptersPath, filename));
      
      if (!readResult.success) {
        return err(new ChapterNotFoundError(novelSlug, chapterNumber));
      }
      
      const { data: frontmatter, content } = matter(readResult.data);
      
      const chapter: Chapter = {
        title: frontmatter.title,
        novel: novelSlug,
        chapterNumber,
        publicationDate: frontmatter.publicationDate,
        wordCount: frontmatter.wordCount || 0,
        rating: frontmatter.rating || 0,
        content: content.trim()
      };
      
      return ok(chapter);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async createChapter(chapter: Chapter): Promise<Result<string, DomainError>> {
    try {
      if (!chapter.title || !chapter.novel || !chapter.chapterNumber) {
        return err(new ValidationError('챕터 제목, 소설, 챕터 번호는 필수입니다'));
      }
      
      const filename = `${chapter.novel}-ch${chapter.chapterNumber.toString().padStart(2, '0')}.md`;
      
      // 중복 검사
      const existsResult = await this.storage.exists(join(this.chaptersPath, filename));
      if (existsResult.success && existsResult.data) {
        return err(new ValidationError(`챕터 '${chapter.novel} ${chapter.chapterNumber}'이 이미 존재합니다`));
      }
      
      const frontmatter = `---
title: "${chapter.title}"
novel: "${chapter.novel}"
chapterNumber: ${chapter.chapterNumber}
publicationDate: ${chapter.publicationDate || new Date().toISOString().split('T')[0]}
wordCount: ${chapter.wordCount || 0}
rating: ${chapter.rating || 0}
---

# ${chapter.title}

${chapter.content || ''}`;
      
      const writeResult = await this.storage.writeFile(
        join(this.chaptersPath, filename), 
        frontmatter
      );
      
      if (!writeResult.success) {
        return err(new DomainError('STORAGE_ERROR', writeResult.error.message));
      }
      
      return ok(filename);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async updateChapter(novelSlug: string, chapterNumber: number, updates: Partial<Chapter>): Promise<Result<void, DomainError>> {
    try {
      // 기존 챕터 조회
      const chapterResult = await this.getChapter(novelSlug, chapterNumber);
      if (!chapterResult.success) {
        return err(chapterResult.error);
      }
      
      const existingChapter = chapterResult.data;
      const updatedChapter = { ...existingChapter, ...updates };
      
      // 챕터 삭제 후 재생성
      const deleteResult = await this.deleteChapter(novelSlug, chapterNumber);
      if (!deleteResult.success) {
        return err(deleteResult.error);
      }
      
      const createResult = await this.createChapter(updatedChapter);
      if (!createResult.success) {
        return err(createResult.error);
      }
      
      return ok(undefined);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async deleteChapter(novelSlug: string, chapterNumber: number): Promise<Result<void, DomainError>> {
    try {
      const filename = `${novelSlug}-ch${chapterNumber.toString().padStart(2, '0')}.md`;
      const deleteResult = await this.storage.deleteFile(join(this.chaptersPath, filename));
      
      if (!deleteResult.success) {
        return err(new DomainError('STORAGE_ERROR', deleteResult.error.message));
      }
      
      return ok(undefined);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getLatestChapterNumber(novelSlug: string): Promise<Result<number, DomainError>> {
    try {
      const chaptersResult = await this.getChaptersByNovel(novelSlug);
      if (!chaptersResult.success) {
        return err(chaptersResult.error);
      }
      
      const chapters = chaptersResult.data;
      if (chapters.length === 0) {
        return ok(0);
      }
      
      const latestChapter = Math.max(...chapters.map(ch => ch.chapterNumber));
      return ok(latestChapter);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getChapterCount(novelSlug: string): Promise<Result<number, DomainError>> {
    try {
      const chaptersResult = await this.getChaptersByNovel(novelSlug);
      if (!chaptersResult.success) {
        return err(chaptersResult.error);
      }
      
      return ok(chaptersResult.data.length);
    } catch (error) {
      return err(new DomainError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}