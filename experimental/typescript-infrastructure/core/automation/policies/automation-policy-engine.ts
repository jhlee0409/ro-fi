/**
 * 자동화 정책 엔진 구현체
 */

import type { 
  IAutomationPolicyEngine, 
  AutomationConfiguration 
} from './automation-policy-interface';
import type { 
  Result, 
  AutomationAction, 
  AutomationSituation, 
  NovelProgress 
} from '../../../shared/types';
import { ok, err } from '../../../shared/types';
import { DomainError } from '../../../shared/errors';

export class AutomationPolicyEngine implements IAutomationPolicyEngine {
  private config: AutomationConfiguration = {
    maxActiveNovels: 3,
    minChapterGap: 1, // 시간
    qualityThreshold: 80,
    autoComplete: true,
    autoCreateNew: true
  };

  async decideAction(situation: AutomationSituation): Promise<Result<AutomationAction, DomainError>> {
    try {
      // 우선순위 기반 의사결정
      
      // 1. 완결 가능한 소설이 있으면 완결 처리
      if (situation.readyForCompletion.length > 0) {
        return ok('COMPLETE_NOVEL');
      }
      
      // 2. 새 소설이 필요하면 생성
      if (situation.needsNewNovel) {
        return ok('CREATE_NEW_NOVEL');
      }
      
      // 3. 기존 소설 연재 계속
      if (situation.activeNovels.length > 0) {
        const shouldContinue = this.shouldContinueChapter(situation);
        if (shouldContinue) {
          return ok('CONTINUE_CHAPTER');
        }
      }
      
      // 4. 최후의 수단: 새 소설 생성
      if (this.config.autoCreateNew) {
        return ok('CREATE_NEW_NOVEL');
      }
      
      return ok('NO_ACTION');
      
    } catch (error) {
      return err(new DomainError('POLICY_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  isReadyForCompletion(novel: NovelProgress): boolean {
    // 85% 이상 진행된 소설을 완결 준비로 판단
    return novel.progressPercentage >= 85;
  }

  async needsNewNovel(activeNovels: NovelProgress[]): Promise<boolean> {
    // 활성 소설 수가 최대치보다 적으면 새 소설 필요
    return activeNovels.length < this.config.maxActiveNovels;
  }

  selectNovelForUpdate(activeNovels: NovelProgress[]): NovelProgress | null {
    if (activeNovels.length === 0) return null;
    
    // 완결 준비되지 않은 소설들 중에서 가장 오래된 업데이트 소설 선택
    const candidateNovels = activeNovels.filter(novel => !this.isReadyForCompletion(novel));
    
    if (candidateNovels.length === 0) {
      return activeNovels[0]; // 모든 소설이 완결 준비되었다면 첫 번째 선택
    }
    
    return candidateNovels.reduce((oldest, current) => 
      current.lastUpdate.getTime() < oldest.lastUpdate.getTime() ? current : oldest
    );
  }

  updateConfiguration(config: Partial<AutomationConfiguration>): void {
    this.config = { ...this.config, ...config };
  }

  private shouldContinueChapter(situation: AutomationSituation): boolean {
    // 가장 오래된 업데이트가 최소 간격보다 오래되었는지 확인
    const now = Date.now();
    const minGapMs = this.config.minChapterGap * 60 * 60 * 1000; // 시간을 밀리초로 변환
    
    return (now - situation.oldestUpdate) >= minGapMs;
  }
}