/**
 * NovelDetector 어댑터 - 기존 테스트와 새 아키텍처 연결
 */

import { FileSystemRepository } from '../infrastructure/storage/filesystem-repository';
import { NovelRepository } from '../core/content/novel/novel-repository';
import { ChapterRepository } from '../core/content/chapter/chapter-repository';
import type { NovelProgress } from '../shared/types';

export class NovelDetector {
  private readonly novelRepository: NovelRepository;
  
  constructor(
    private readonly novelsDir: string,
    private readonly chaptersDir: string
  ) {
    const storage = new FileSystemRepository();
    const chapterRepository = new ChapterRepository(storage, chaptersDir);
    this.novelRepository = new NovelRepository(
      storage,
      chapterRepository,
      novelsDir,
      chaptersDir
    );
  }
  
  async getActiveNovels() {
    const result = await this.novelRepository.getActiveNovels();
    if (!result.success) {
      throw new Error(result.error.message);
    }
    return result.data;
  }
  
  async getNovelWithProgress(slug: string): Promise<NovelProgress | null> {
    const result = await this.novelRepository.getNovelProgress(slug);
    if (!result.success) {
      console.warn(`Failed to get novel progress for ${slug}:`, result.error.message);
      return null;
    }
    return result.data;
  }
  
  isNovelNearCompletion(novelProgress: NovelProgress): boolean {
    return this.novelRepository.isNovelNearCompletion(novelProgress);
  }
  
  async needsNewNovel(): Promise<boolean> {
    return this.novelRepository.needsNewNovel();
  }
  
  async getOldestUpdatedNovel() {
    const result = await this.novelRepository.getOldestUpdatedNovel();
    if (!result.success) {
      throw new Error(result.error.message);
    }
    return result.data.novel;
  }
}