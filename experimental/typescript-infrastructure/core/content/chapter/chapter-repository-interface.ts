/**
 * 챕터 저장소 인터페이스
 */

import type { Result, Chapter, ChapterMetadata } from '../../../shared/types';
import type { DomainError } from '../../../shared/errors';

export interface IChapterRepository {
  /**
   * 특정 소설의 모든 챕터 조회
   */
  getChaptersByNovel(novelSlug: string): Promise<Result<ChapterMetadata[], DomainError>>;
  
  /**
   * 특정 챕터 조회
   */
  getChapter(novelSlug: string, chapterNumber: number): Promise<Result<Chapter, DomainError>>;
  
  /**
   * 새 챕터 생성
   */
  createChapter(chapter: Chapter): Promise<Result<string, DomainError>>;
  
  /**
   * 챕터 업데이트
   */
  updateChapter(novelSlug: string, chapterNumber: number, chapter: Partial<Chapter>): Promise<Result<void, DomainError>>;
  
  /**
   * 챕터 삭제
   */
  deleteChapter(novelSlug: string, chapterNumber: number): Promise<Result<void, DomainError>>;
  
  /**
   * 소설의 최신 챕터 번호 조회
   */
  getLatestChapterNumber(novelSlug: string): Promise<Result<number, DomainError>>;
  
  /**
   * 소설의 총 챕터 수 조회
   */
  getChapterCount(novelSlug: string): Promise<Result<number, DomainError>>;
}