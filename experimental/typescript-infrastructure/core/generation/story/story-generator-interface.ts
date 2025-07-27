/**
 * 스토리 생성 엔진 인터페이스
 */

import type { 
  Result, 
  Novel, 
  Chapter, 
  StoryConcept,
  GenerationOptions 
} from '../../../shared/types';
import type { DomainError } from '../../../shared/errors';

export interface IStoryGenerator {
  /**
   * 새 소설 생성
   */
  generateNewNovel(options?: GenerationOptions): Promise<Result<NewNovelResult, DomainError>>;
  
  /**
   * 다음 챕터 생성
   */
  generateNextChapter(novelSlug: string, options?: GenerationOptions): Promise<Result<NextChapterResult, DomainError>>;
  
  /**
   * 소설 완결
   */
  completeNovel(novelSlug: string, options?: GenerationOptions): Promise<Result<CompletionResult, DomainError>>;
  
  /**
   * 스토리 컨셉 생성
   */
  generateStoryConcept(existingConcepts?: StoryConcept[]): Promise<Result<StoryConcept, DomainError>>;
  
  /**
   * 캠릭터 생성
   */
  generateCharacters(concept: StoryConcept): Promise<Result<Character[], DomainError>>;
}

export interface NewNovelResult {
  novel: Novel;
  concept: StoryConcept;
  firstChapter?: Chapter;
}

export interface NextChapterResult {
  chapter: Chapter;
  chapterNumber: number;
  emotionStage: string;
}

export interface CompletionResult {
  finalChapters: number[];
  epilogue?: Chapter;
  endingType: string;
}

export interface Character {
  name: string;
  role: 'protagonist' | 'male_lead' | 'supporting' | 'antagonist';
  archetype: string;
  personality: string;
  background: string;
  growthArc?: number;
}