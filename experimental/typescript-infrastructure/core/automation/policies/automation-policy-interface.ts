/**
 * 자동화 정책 엔진 인터페이스
 */

import type { 
  Result, 
  AutomationAction, 
  AutomationSituation, 
  NovelProgress 
} from '../../../shared/types';
import type { DomainError } from '../../../shared/errors';

export interface IAutomationPolicyEngine {
  /**
   * 현재 상황에 기반하여 액션 결정
   */
  decideAction(situation: AutomationSituation): Promise<Result<AutomationAction, DomainError>>;
  
  /**
   * 소설이 완결 준비되었는지 판단
   */
  isReadyForCompletion(novel: NovelProgress): boolean;
  
  /**
   * 새 소설이 필요한지 판단
   */
  needsNewNovel(activeNovels: NovelProgress[]): Promise<boolean>;
  
  /**
   * 다음 업데이트할 소설 선택
   */
  selectNovelForUpdate(activeNovels: NovelProgress[]): NovelProgress | null;
  
  /**
   * 자동화 설정 업데이트
   */
  updateConfiguration(config: Partial<AutomationConfiguration>): void;
}

export interface AutomationConfiguration {
  maxActiveNovels: number;
  minChapterGap: number; // 시간 (시간)
  qualityThreshold: number;
  autoComplete: boolean;
  autoCreateNew: boolean;
}