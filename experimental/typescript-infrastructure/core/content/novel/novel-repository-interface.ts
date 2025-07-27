/**
 * 소설 저장소 인터페이스
 */

import type { Result, Novel, NovelProgress, NovelMetadata } from '../../../shared/types';
import type { DomainError } from '../../../shared/errors';

export interface INovelRepository {
  /**
   * 활성 상태의 소설들을 조회
   */
  getActiveNovels(): Promise<Result<NovelMetadata[], DomainError>>;
  
  /**
   * 특정 소설의 진행도 정보 조회
   */
  getNovelProgress(slug: string): Promise<Result<NovelProgress, DomainError>>;
  
  /**
   * 소설 메타데이터 조회
   */
  getNovelMetadata(slug: string): Promise<Result<NovelMetadata, DomainError>>;
  
  /**
   * 새 소설 생성
   */
  createNovel(novel: Novel): Promise<Result<string, DomainError>>;
  
  /**
   * 소설 상태 업데이트
   */
  updateNovelStatus(slug: string, status: string): Promise<Result<void, DomainError>>;
  
  /**
   * 소설 삭제
   */
  deleteNovel(slug: string): Promise<Result<void, DomainError>>;
  
  /**
   * 가장 오래 업데이트된 소설 조회
   */
  getOldestUpdatedNovel(): Promise<Result<NovelProgress, DomainError>>;
}