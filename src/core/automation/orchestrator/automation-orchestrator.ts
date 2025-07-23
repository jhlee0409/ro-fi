/**
 * 자동화 오케스트레이터 - 전체 자동화 워크플로우 조정
 */

import type { 
  Result, 
  AutomationResult, 
  AutomationAction, 
  AutomationSituation,
  GenerationOptions 
} from '../../../shared/types';
import { ok, err } from '../../../shared/types';
import { AutomationExecutionError } from '../../../shared/errors';
import type { INovelRepository } from '../../content/novel/novel-repository-interface';
import type { IChapterRepository } from '../../content/chapter/chapter-repository-interface';
import type { IAutomationPolicyEngine } from '../policies/automation-policy-interface';
import type { IStoryGenerator } from '../../generation/story/story-generator-interface';
import type { ILogger } from '../../../infrastructure/monitoring/logger-interface';

export class AutomationOrchestrator {
  constructor(
    private readonly novelRepository: INovelRepository,
    private readonly chapterRepository: IChapterRepository,
    private readonly policyEngine: IAutomationPolicyEngine,
    private readonly storyGenerator: IStoryGenerator,
    private readonly logger: ILogger
  ) {}

  /**
   * 메인 자동화 실행 함수
   */
  async executeAutomation(options: GenerationOptions = {}): Promise<Result<AutomationResult, AutomationExecutionError>> {
    const startTime = Date.now();
    
    try {
      this.logger.info('🚀 자동화 오케스트레이터 시작', { options });
      
      // 1단계: 현재 상황 분석
      const situationResult = await this.analyzeSituation();
      if (!situationResult.success) {
        return err(new AutomationExecutionError('ANALYZE_SITUATION', situationResult.error.message));
      }
      
      const situation = situationResult.data;
      this.logger.info('📊 상황 분석 완료', { situation });
      
      // 2단계: 액션 결정
      const actionResult = await this.policyEngine.decideAction(situation);
      if (!actionResult.success) {
        return err(new AutomationExecutionError('DECIDE_ACTION', actionResult.error.message));
      }
      
      const action = actionResult.data;
      this.logger.info('🎯 액션 결정됨', { action });
      
      // 3단계: 액션 실행
      const executionResult = await this.executeAction(action, situation, options);
      if (!executionResult.success) {
        return err(new AutomationExecutionError('EXECUTE_ACTION', executionResult.error.message));
      }
      
      const result: AutomationResult = {
        success: true,
        action,
        result: executionResult.data,
        situation,
      };
      
      const duration = Date.now() - startTime;
      this.logger.info('✅ 자동화 완료', { result, duration });
      
      return ok(result);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('❌ 자동화 실행 실패', { error, duration });
      return err(new AutomationExecutionError('UNKNOWN', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * 현재 상황 분석
   */
  private async analyzeSituation(): Promise<Result<AutomationSituation, Error>> {
    try {
      // 활성 소설들 조회
      const activeNovelsResult = await this.novelRepository.getActiveNovels();
      if (!activeNovelsResult.success) {
        return err(new Error(`Failed to get active novels: ${activeNovelsResult.error.message}`));
      }
      
      const activeNovels = activeNovelsResult.data;
      
      // 각 소설의 진행도 분석
      const novelProgressList = [];
      for (const novel of activeNovels) {
        const progressResult = await this.novelRepository.getNovelProgress(novel.slug);
        if (progressResult.success) {
          novelProgressList.push(progressResult.data);
        }
      }
      
      // 완결 준비된 소설들 찾기
      const readyForCompletion = novelProgressList.filter(novel => 
        this.policyEngine.isReadyForCompletion(novel)
      );
      
      // 새 소설 필요 여부 판단
      const needsNewNovel = await this.policyEngine.needsNewNovel(novelProgressList);
      
      // 가장 오래된 업데이트 시간
      const oldestUpdate = novelProgressList.length > 0 
        ? Math.min(...novelProgressList.map(n => n.lastUpdate.getTime()))
        : Date.now();
      
      const situation: AutomationSituation = {
        activeNovels: novelProgressList,
        totalActiveCount: novelProgressList.length,
        needsNewNovel,
        readyForCompletion,
        oldestUpdate,
      };
      
      return ok(situation);
      
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error in analyzeSituation'));
    }
  }

  /**
   * 액션 실행
   */
  private async executeAction(
    action: AutomationAction, 
    situation: AutomationSituation,
    options: GenerationOptions
  ): Promise<Result<any, Error>> {
    switch (action) {
      case 'CREATE_NEW_NOVEL':
        return this.executeCreateNewNovel(options);
        
      case 'CONTINUE_CHAPTER':
        return this.executeContinueChapter(situation, options);
        
      case 'COMPLETE_NOVEL':
        return this.executeCompleteNovel(situation, options);
        
      case 'NO_ACTION':
        return ok({ message: 'No action required' });
        
      default:
        return err(new Error(`Unknown action: ${action}`));
    }
  }

  /**
   * 새 소설 생성 실행
   */
  private async executeCreateNewNovel(options: GenerationOptions): Promise<Result<any, Error>> {
    this.logger.info('🆕 새 소설 생성 시작');
    
    try {
      const createResult = await this.storyGenerator.generateNewNovel(options);
      if (!createResult.success) {
        return err(new Error(`Failed to generate new novel: ${createResult.error.message}`));
      }
      
      return ok({
        newNovel: createResult.data.novel.slug,
        title: createResult.data.novel.title,
        concept: createResult.data.concept,
        firstChapter: createResult.data.firstChapter?.chapterNumber,
      });
      
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error in executeCreateNewNovel'));
    }
  }

  /**
   * 챕터 계속 실행
   */
  private async executeContinueChapter(situation: AutomationSituation, options: GenerationOptions): Promise<Result<any, Error>> {
    this.logger.info('📝 챕터 계속 시작');
    
    try {
      // 가장 오래된 업데이트 소설 선택
      const targetNovel = situation.activeNovels
        .filter(novel => !this.policyEngine.isReadyForCompletion(novel))
        .sort((a, b) => a.lastUpdate.getTime() - b.lastUpdate.getTime())[0];
      
      if (!targetNovel) {
        return err(new Error('No novel available for chapter continuation'));
      }
      
      const continueResult = await this.storyGenerator.generateNextChapter(targetNovel.novel.slug, options);
      if (!continueResult.success) {
        return err(new Error(`Failed to generate next chapter: ${continueResult.error.message}`));
      }
      
      return ok({
        continuedNovel: targetNovel.novel.slug,
        newChapter: continueResult.data.chapterNumber,
        emotionStage: continueResult.data.emotionStage,
      });
      
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error in executeContinueChapter'));
    }
  }

  /**
   * 소설 완결 실행
   */
  private async executeCompleteNovel(situation: AutomationSituation, options: GenerationOptions): Promise<Result<any, Error>> {
    this.logger.info('🏁 소설 완결 시작');
    
    try {
      const readyNovel = situation.readyForCompletion[0];
      if (!readyNovel) {
        return err(new Error('No novel ready for completion'));
      }
      
      const completeResult = await this.storyGenerator.completeNovel(readyNovel.novel.slug, options);
      if (!completeResult.success) {
        return err(new Error(`Failed to complete novel: ${completeResult.error.message}`));
      }
      
      return ok({
        completedNovel: readyNovel.novel.slug,
        finalChapters: completeResult.data.finalChapters,
        epilogue: completeResult.data.epilogue,
      });
      
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Unknown error in executeCompleteNovel'));
    }
  }
}