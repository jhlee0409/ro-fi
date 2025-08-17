/**
 * 🎭 Episode Generation Pipeline
 * 통합 에피소드 생성 파이프라인 - v2.1 창의성 모드 기반
 * 
 * Features:
 * - Enhanced Context Manager 통합
 * - Gemini API Wrapper 최적화
 * - Prompt Template Engine 활용
 * - 품질 검증 및 재생성 로직
 * - v2.1 창의성 모드 자동 활성화
 */

import { Novel, Chapter, QualityMetrics } from './types/index.js';
import { EnhancedContextManager } from './enhanced-context-manager.js';
import { EnhancedGeminiWrapper } from './enhanced-gemini-wrapper.js';
import { PromptTemplateEngine } from './prompt-template-engine.js';
import { QualityAnalyticsEngine } from './quality-analytics-engine.js';

/**
 * 에피소드 생성 설정
 */
interface EpisodeGenerationConfig {
  creativityMode?: 'auto' | 'standard' | 'high' | 'unlimited';
  qualityThreshold: number;
  maxRetries: number;
  enableFallback: boolean;
  templateStrategy: 'auto' | 'manual';
  targetWordCount?: number;
  emotionalTarget?: string;
}

/**
 * 생성 결과
 */
interface GenerationResult {
  success: boolean;
  episode?: Chapter;
  qualityMetrics?: QualityMetrics;
  creativityActivated: boolean;
  tokensUsed: number;
  generationTime: number;
  retryCount: number;
  error?: Error;
}

/**
 * 파이프라인 단계별 상태
 */
interface PipelineState {
  contextPrepared: boolean;
  templateSelected: boolean;
  contentGenerated: boolean;
  qualityValidated: boolean;
  creativityTriggered: boolean;
  currentAttempt: number;
}

/**
 * 통합 에피소드 생성 파이프라인
 */
export class EpisodeGenerationPipeline {
  private contextManager: EnhancedContextManager;
  private geminiWrapper: EnhancedGeminiWrapper;
  private templateEngine: PromptTemplateEngine;
  private qualityEngine: QualityAnalyticsEngine;
  private metrics: PipelineMetrics;

  constructor(geminiApiKey: string) {
    this.contextManager = new EnhancedContextManager();
    this.geminiWrapper = new EnhancedGeminiWrapper(geminiApiKey);
    this.templateEngine = new PromptTemplateEngine();
    this.qualityEngine = new QualityAnalyticsEngine();
    this.metrics = new PipelineMetrics();
  }

  /**
   * 🎯 메인 에피소드 생성 메서드
   */
  async generateEpisode(
    _novel: Novel,
    _chapterNumber: number,
    config: EpisodeGenerationConfig
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const state: PipelineState = {
      contextPrepared: false,
      templateSelected: false,
      contentGenerated: false,
      qualityValidated: false,
      creativityTriggered: false,
      currentAttempt: 0
    };

    let lastError: Error | null = null;

    // 최대 재시도 횟수만큼 시도
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      state.currentAttempt = attempt;
      
      try {
        const result = await this.executeGenerationAttempt(
          novel, 
          chapterNumber, 
          config, 
          state
        );

        if (result.success) {
          const totalTime = Date.now() - startTime;
          this.metrics.recordSuccess(result, totalTime, attempt);
          
          return {
            ...result,
            generationTime: totalTime,
            retryCount: attempt - 1
          };
        }

        lastError = result.error || new Error('Generation failed without specific error');
        
      } catch (error) {
        lastError = error as Error;
        this.metrics.recordAttempt(attempt, false, error as Error);
      }

      // 재시도 딜레이 (지수 백오프)
      if (attempt < config.maxRetries) {
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
        await this.delay(delay);
      }
    }

    // 모든 시도 실패
    const totalTime = Date.now() - startTime;
    this.metrics.recordFailure(lastError!, totalTime, config.maxRetries);
    
    return {
      success: false,
      creativityActivated: state.creativityTriggered,
      tokensUsed: 0,
      generationTime: totalTime,
      retryCount: config.maxRetries,
      error: lastError || new Error('Unknown generation error')
    };
  }

  /**
   * 🔄 단일 생성 시도 실행
   */
  private async executeGenerationAttempt(
    _novel: Novel,
    _chapterNumber: number,
    config: EpisodeGenerationConfig,
    state: PipelineState
  ): Promise<GenerationResult> {
    
    // 1단계: 컨텍스트 준비
    const enhancedContext = await this.prepareContext(novel, chapterNumber, state);
    
    // 2단계: 템플릿 선택
    const selectedTemplate = await this.selectTemplate(novel, chapterNumber, enhancedContext, config, state);
    
    // 3단계: 프롬프트 생성
    const prompt = this.templateEngine.generatePrompt(
      selectedTemplate.templateId,
      selectedTemplate.context,
      enhancedContext
    );

    // 4단계: 콘텐츠 생성
    const generationResult = await this.generateContent(prompt, enhancedContext, config, state);
    
    // 5단계: 품질 검증
    const qualityResult = await this.validateQuality(
      generationResult.content, 
      novel, 
      chapterNumber, 
      config, 
      state
    );

    if (!qualityResult.passed) {
      throw new Error(`Quality validation failed: ${qualityResult.reason}`);
    }

    // 6단계: 챕터 객체 생성
    const episode = this.createChapterObject(
      generationResult.content,
      novel,
      chapterNumber,
      qualityResult.metrics
    );

    // 7단계: 메모리 업데이트
    await this.updateMemory(episode, qualityResult.metrics);

    return {
      success: true,
      episode,
      qualityMetrics: qualityResult.metrics,
      creativityActivated: enhancedContext.creativityMode.isActive,
      tokensUsed: generationResult.tokensUsed,
      generationTime: 0, // 외부에서 계산됨
      retryCount: 0 // 외부에서 설정됨
    };
  }

  /**
   * 📋 1단계: 고도화된 컨텍스트 준비
   */
  private async prepareContext(
    _novel: Novel,
    _chapterNumber: number,
    state: PipelineState
  ) {
    const context = await this.contextManager.prepareContextForChapter(
      novel,
      chapterNumber,
      { forceRefresh: state.currentAttempt > 1 }
    );
    
    state.contextPrepared = true;
    state.creativityTriggered = context.creativityMode.isActive;
    
    return context;
  }

  /**
   * 🎨 2단계: 최적 템플릿 선택
   */
  private async selectTemplate(
    _novel: Novel,
    _chapterNumber: number,
    enhancedContext: unknown,
    config: EpisodeGenerationConfig,
    state: PipelineState
  ) {
    let templateId: string;
    
    if (config.templateStrategy === 'auto') {
      // 자동 템플릿 선택 로직
      templateId = this.autoSelectTemplate(novel, chapterNumber, enhancedContext);
    } else {
      // 기본 에피소드 템플릿
      templateId = 'episode_standard';
    }

    const templateContext = {
      novel,
      chapterNumber,
      targetWordCount: config.targetWordCount || 1200,
      emotionalTarget: config.emotionalTarget || 'balanced',
      previousChapters: enhancedContext.memoryLayers.episodic.recentChapters
    };

    state.templateSelected = true;
    
    return { templateId, context: templateContext };
  }

  /**
   * 🤖 3단계: Gemini를 통한 콘텐츠 생성
   */
  private async generateContent(
    prompt: string,
    enhancedContext: unknown,
    config: EpisodeGenerationConfig,
    state: PipelineState
  ) {
    const creativityMode = enhancedContext.creativityMode.isActive
      ? enhancedContext.creativityMode.investmentLevel
      : (config.creativityMode === 'auto' ? 'standard' : config.creativityMode);

    const apiConfig = {
      creativityMode: creativityMode as 'standard' | 'high' | 'unlimited',
      priority: 'high' as const,
      cacheStrategy: 'memory' as const,
      retryPolicy: {
        maxRetries: 2,
        baseDelayMs: 1000,
        exponentialBackoff: true,
        retryConditions: ['overloaded', '503', 'timeout']
      }
    };

    const result = await this.geminiWrapper.generateContent(prompt, apiConfig);
    
    if (!result.success) {
      throw new Error(`Content generation failed: ${result.error?.message}`);
    }

    state.contentGenerated = true;
    
    return {
      content: result.data!,
      tokensUsed: result.metadata.tokensUsed
    };
  }

  /**
   * ✅ 4단계: 품질 검증
   */
  private async validateQuality(
    _content: string,
    _novel: Novel,
    _chapterNumber: number,
    config: EpisodeGenerationConfig,
    state: PipelineState
  ) {
    const metrics = await this.qualityEngine.analyzeContent(content, {
      novel,
      chapterNumber,
      targetLength: config.targetWordCount || 1200
    });

    const passed = metrics.overallScore >= config.qualityThreshold;
    
    state.qualityValidated = passed;
    
    if (!passed) {
      return {
        passed: false,
        reason: `Quality score ${metrics.overallScore} below threshold ${config.qualityThreshold}`,
        metrics
      };
    }

    return {
      passed: true,
      metrics
    };
  }

  /**
   * 📝 5단계: 챕터 객체 생성
   */
  private createChapterObject(
    _content: string,
    _novel: Novel,
    _chapterNumber: number,
    _qualityMetrics: QualityMetrics
  ): Chapter {
    const wordCount = content.split(/\s+/).length;
    const emotionalTone = this.extractEmotionalTone(content);
    
    return {
      title: `${chapterNumber}화`,
      novel: novel.slug,
      chapterNumber,
      publicationDate: new Date().toISOString().split('T')[0],
      content,
      wordCount,
      emotionalTone
    };
  }

  /**
   * 🧠 6단계: 메모리 시스템 업데이트
   */
  private async updateMemory(episode: Chapter, metrics: QualityMetrics): Promise<void> {
    await this.contextManager.updateMemoryWithChapter(episode, metrics);
  }

  /**
   * 🎯 자동 템플릿 선택 로직
   */
  private autoSelectTemplate(_novel: Novel, _chapterNumber: number, context: { creativityMode: { isActive: boolean; trigger?: string } }): string {
    // 창의성 모드가 활성화된 경우
    if (context.creativityMode.isActive) {
      if (context.creativityMode.trigger === 'climax_moment') {
        return 'episode_climax';
      } else if (context.creativityMode.trigger === 'reader_engagement') {
        return 'episode_engaging';
      }
    }

    // 진행도에 따른 템플릿 선택
    const progress = chapterNumber / (novel.totalChapters || 50);
    
    if (progress < 0.2) {
      return 'episode_introduction';
    } else if (progress < 0.4) {
      return 'episode_development';
    } else if (progress < 0.7) {
      return 'episode_conflict';
    } else if (progress < 0.9) {
      return 'episode_climax';
    } else {
      return 'episode_resolution';
    }
  }

  /**
   * 감정 톤 추출
   */
  private extractEmotionalTone(_content: string): string {
    // 간단한 감정 분석 로직
    const emotionalWords = {
      romantic: ['사랑', '마음', '가슴', '설렘', '애정'],
      tense: ['긴장', '위험', '두려움', '불안', '초조'],
      dramatic: ['충격', '놀라', '갑자기', '순간', '폭발'],
      peaceful: ['평온', '조용', '차분', '안정', '편안']
    };

    const scores = Object.entries(emotionalWords).map(([emotion, words]) => ({
      emotion,
      score: words.reduce((sum, word) => 
        sum + (content.includes(word) ? 1 : 0), 0)
    }));

    const dominant = scores.reduce((max, current) => 
      current.score > max.score ? current : max);

    return dominant.score > 0 ? dominant.emotion : 'neutral';
  }

  /**
   * 유틸리티 메서드들
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 파이프라인 메트릭 조회
   */
  getMetrics(): unknown {
    return this.metrics.getReport();
  }

  /**
   * 시스템 상태 조회
   */
  getSystemStatus(): unknown {
    return {
      contextManager: this.contextManager.getMemoryReport(),
      geminiWrapper: this.geminiWrapper.getMetrics(),
      templateEngine: this.templateEngine.getStats(),
      pipeline: this.metrics.getReport()
    };
  }
}

/**
 * 파이프라인 메트릭 관리
 */
class PipelineMetrics {
  private attempts: unknown[] = [];
  private successes: unknown[] = [];
  private failures: unknown[] = [];

  recordAttempt(attemptNumber: number, success: boolean, error?: Error): void {
    this.attempts.push({
      timestamp: Date.now(),
      attemptNumber,
      success,
      error: error?.message
    });
  }

  recordSuccess(_result: unknown, totalTime: number, attempts: number): void {
    const resultObj = result as { 
      tokensUsed?: number; 
      creativityActivated?: boolean; 
      qualityMetrics?: { overallScore?: number } 
    };
    
    this.successes.push({
      timestamp: Date.now(),
      totalTime,
      attempts,
      tokensUsed: resultObj.tokensUsed || 0,
      creativityActivated: resultObj.creativityActivated || false,
      qualityScore: resultObj.qualityMetrics?.overallScore || 0
    });
  }

  recordFailure(error: Error, totalTime: number, attempts: number): void {
    this.failures.push({
      timestamp: Date.now(),
      error: error.message,
      totalTime,
      attempts
    });
  }

  getReport(): unknown {
    const total = this.successes.length + this.failures.length;
    const successRate = total > 0 ? this.successes.length / total : 0;
    
    const avgTime = this.successes.length > 0 
      ? this.successes.reduce((sum, s) => sum + s.totalTime, 0) / this.successes.length
      : 0;

    const avgAttempts = this.successes.length > 0
      ? this.successes.reduce((sum, s) => sum + s.attempts, 0) / this.successes.length
      : 0;

    return {
      totalGenerations: total,
      successRate,
      averageGenerationTime: avgTime,
      averageAttemptsToSuccess: avgAttempts,
      creativityActivationRate: this.successes.length > 0
        ? this.successes.filter(s => s.creativityActivated).length / this.successes.length
        : 0,
      recentPerformance: this.getRecentPerformance()
    };
  }

  private getRecentPerformance(): unknown {
    const recent = [...this.successes, ...this.failures]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return {
      recentSuccessRate: recent.filter(r => !r.error).length / Math.max(recent.length, 1),
      recentAverageTime: recent.length > 0 
        ? recent.reduce((sum, r) => sum + (r.totalTime || 0), 0) / recent.length
        : 0
    };
  }
}

/**
 * 파이프라인 기본 설정
 */
export const defaultEpisodeConfig: EpisodeGenerationConfig = {
  creativityMode: 'auto',
  qualityThreshold: 75,
  maxRetries: 3,
  enableFallback: true,
  templateStrategy: 'auto',
  targetWordCount: 1200,
  emotionalTarget: 'balanced'
};

export default EpisodeGenerationPipeline;