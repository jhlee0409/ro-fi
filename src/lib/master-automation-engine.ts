// import { promises as fs } from 'fs';
// import { join } from 'path';
// import matter from 'gray-matter';
// import type { Novel, Chapter, NovelState } from './types/index.ts';
import { NovelDetector } from './novel-detector.ts';
import { QualityAnalyticsEngine } from './quality-analytics-engine.ts';

export interface AutomationDecision {
  action: 'complete' | 'continue' | 'new' | 'skip';
  novel?: NovelState;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  estimatedCost: number;
}

export interface AutomationConfig {
  maxActiveNovels: number;
  completionThreshold: number;
  qualityThreshold: number;
  costBudget: number;
}

/**
 * 마스터 자동화 엔진
 * 소설 연재 전체 프로세스를 관리하고 조율하는 핵심 엔진
 */
export class MasterAutomationEngine {
  private novelDetector: NovelDetector;
  private qualityEngine: QualityAnalyticsEngine;
  private config: AutomationConfig;

  constructor(config?: Partial<AutomationConfig>) {
    this.novelDetector = new NovelDetector();
    this.qualityEngine = new QualityAnalyticsEngine();
    this.config = {
      maxActiveNovels: 3,
      completionThreshold: 85,
      qualityThreshold: 75,
      costBudget: 1000,
      ...config,
    };
  }

  /**
   * 자동화 결정을 내리는 메인 메서드
   */
  async makeAutomationDecision(): Promise<AutomationDecision> {
    try {
      // 1. 현재 상황 분석
      const activeNovels = await this.novelDetector.getActiveNovels();
      const novelStates = await Promise.all(
        activeNovels.map(novel => this.novelDetector.getNovelWithProgress(novel.slug))
      );
      const validStates = novelStates.filter(state => state !== null) as NovelState[];

      // 2. 완결 우선순위 체크
      const completableNovels = validStates.filter(novel => 
        novel.progressPercentage >= this.config.completionThreshold
      );

      if (completableNovels.length > 0) {
        const novel = completableNovels[0];
        return {
          action: 'complete',
          novel,
          priority: 'high',
          reasoning: `소설 "${novel.title}"이 ${novel.progressPercentage}% 진행되어 완결 준비됨`,
          estimatedCost: 200,
        };
      }

      // 3. 새 소설 필요성 체크
      const needsNewNovel = await this.novelDetector.needsNewNovel();
      if (needsNewNovel) {
        return {
          action: 'new',
          priority: 'medium',
          reasoning: `현재 활성 소설 ${validStates.length}편으로 새 소설 필요`,
          estimatedCost: 300,
        };
      }

      // 4. 연재 계속할 소설 선택
      const oldestNovel = await this.novelDetector.getOldestUpdatedNovel();
      if (oldestNovel) {
        return {
          action: 'continue',
          novel: oldestNovel,
          priority: 'medium',
          reasoning: `가장 오래된 업데이트 소설 "${oldestNovel.title}" 연재 계속`,
          estimatedCost: 150,
        };
      }

      // 5. 기본값: 스킵
      return {
        action: 'skip',
        priority: 'low',
        reasoning: '현재 액션이 필요하지 않음',
        estimatedCost: 0,
      };

    } catch (_error) {
      // console.error('Automation decision error:', _error);
      return {
        action: 'skip',
        priority: 'low',
        reasoning: `오류로 인한 스킵: ${error.message}`,
        estimatedCost: 0,
      };
    }
  }

  /**
   * 자동화 실행 전 검증
   */
  async validateDecision(decision: AutomationDecision): Promise<boolean> {
    // 비용 예산 체크
    if (decision.estimatedCost > this.config.costBudget) {
      // console.warn(`Budget exceeded: ${decision.estimatedCost} > ${this.config.costBudget}`);
      return false;
    }

    // 소설별 검증
    if (decision.novel) {
      const qualityCheck = await this.qualityEngine.assessQuality(
        decision.novel.title + ' ' + decision.novel.description
      );
      
      if (qualityCheck.overall < this.config.qualityThreshold) {
        // console.warn(`Quality threshold not met: ${qualityCheck.overall} < ${this.config.qualityThreshold}`);
        return false;
      }
    }

    return true;
  }

  /**
   * 자동화 프로세스 전체 실행
   */
  async executeAutomation(): Promise<{success: boolean, decision: AutomationDecision, result?: unknown}> {
    // console.log('🤖 Master Automation Engine 시작');
    
    try {
      // 1. 결정 생성
      const decision = await this.makeAutomationDecision();
      // console.log(`📊 결정: ${decision.action} (우선순위: ${decision.priority})`);
      // console.log(`💭 이유: ${decision.reasoning}`);

      // 2. 결정 검증
      const isValid = await this.validateDecision(decision);
      if (!isValid) {
        // console.log('❌ 결정 검증 실패');
        return { success: false, decision };
      }

      // 3. 실행 (실제 구현에서는 AI 생성 엔진 호출)
      // console.log(`🚀 액션 실행: ${decision.action}`);
      
      return {
        success: true,
        decision,
        result: {
          message: `${decision.action} 액션 실행 완료`,
          cost: decision.estimatedCost,
        },
      };

    } catch (_error) {
      // console.error('❌ Automation execution failed:', _error);
      return {
        success: false,
        decision: {
          action: 'skip',
          priority: 'low',
          reasoning: `실행 오류: ${error.message}`,
          estimatedCost: 0,
        },
      };
    }
  }

  /**
   * 엔진 상태 확인
   */
  async getEngineStatus() {
    const activeNovels = await this.novelDetector.getActiveNovels();
    
    return {
      timestamp: new Date().toISOString(),
      activeNovels: activeNovels.length,
      maxActiveNovels: this.config.maxActiveNovels,
      qualityThreshold: this.config.qualityThreshold,
      costBudget: this.config.costBudget,
      status: 'operational',
    };
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<AutomationConfig>) {
    this.config = { ...this.config, ...newConfig };
    // console.log('🔧 Master Automation Engine 설정 업데이트됨');
  }
}

// 편의 함수
export function createMasterEngine(config?: Partial<AutomationConfig>): MasterAutomationEngine {
  return new MasterAutomationEngine(config);
}

// 기본 인스턴스
export const masterAutomationEngine = new MasterAutomationEngine();