/**
 * 연속성 관리 시스템과 기존 AI 생성 스크립트 통합 모듈
 * 
 * 기능:
 * - 기존 ai-novel-generator.js와 연속성 시스템 연동
 * - 호환성 유지하면서 점진적 적용
 * - ES6 모듈과 TypeScript 시스템 연결
 */

// TypeScript 모듈들을 동적으로 import하여 호환성 확보
let storyStateManager, _, _contextWindowManager, continuityAwareGenerator;

// 연속성 모듈 동적 로딩
async function loadContinuityModules() {
  try {
    const storyModule = await import('./story-state-manager.js');
    const continuityModule = await import('./episode-continuity-engine.js');
    const contextModule = await import('./context-window-manager.js');
    const generatorModule = await import('./continuity-aware-generator.js');
    
    storyStateManager = storyModule.storyStateManager;
    episodeContinuityEngine = continuityModule.episodeContinuityEngine;
    _contextWindowManager = contextModule._contextWindowManager;
    continuityAwareGenerator = generatorModule.continuityAwareGenerator;
    
    return true;
  } catch (_error) {
    // console.warn('연속성 모듈 로드 실패:', _error.message);
    return false;
  }
}

// 모듈 로딩 상태
let modulesLoaded = false;

/**
 * 기존 NovelGenerator와 연속성 시스템 통합 클래스
 */
export class ContinuityIntegrationManager {
  constructor(logger) {
    this.logger = logger;
    this.continuityEnabled = process.env.ENABLE_CONTINUITY_SYSTEM === 'true';
  }

  /**
   * 연속성 모듈들이 로드되었는지 확인하고 필요시 로드
   */
  async ensureModulesLoaded() {
    if (!modulesLoaded && this.continuityEnabled) {
      if (this.logger) {
        await this.logger.info('연속성 모듈 로딩 시도 중...');
      }
      modulesLoaded = await loadContinuityModules();
      
      if (!modulesLoaded) {
        if (this.logger) {
          await this.logger.warn('연속성 모듈 로드 실패, 기존 방식으로 폴백');
        }
        this.continuityEnabled = false;
      } else if (this.logger) {
        await this.logger.success('연속성 모듈 로드 성공');
      }
    }
    return modulesLoaded;
  }

  /**
   * 기존 생성 함수를 연속성 강화 버전으로 래핑
   */
  async generateWithContinuity(originalGenerateFunction, novelSlug, _options = {}) {
    const startTime = Date.now();
    
    try {
      // 연속성 시스템이 비활성화된 경우 기존 함수 호출
      if (!this.continuityEnabled) {
        await this.logger.info('연속성 시스템 비활성화됨, 기존 방식으로 생성');
        return await originalGenerateFunction();
      }

      // 연속성 모듈들이 로드되었는지 확인
      const modulesReady = await this.ensureModulesLoaded();
      if (!modulesReady) {
        await this.logger.warn('연속성 모듈 사용 불가, 기존 방식으로 폴백');
        return await originalGenerateFunction();
      }

      await this.logger.info('연속성 강화 생성 시작', { novelSlug });

      // 1. 스토리 상태 확인 및 초기화
      let _storyState;
      try {
        _storyState = await storyStateManager.getStory(novelSlug);
        await this.logger.info('기존 스토리 상태 로드됨');
      } catch (_error) {
        await this.logger.warn('스토리 상태 없음, 기존 컨텐츠 분석하여 초기화', { error: _error.message });
        
        try {
          _storyState = await storyStateManager.analyzeExistingContent(novelSlug);
          await this.logger.success('스토리 상태 분석 및 초기화 완료');
        } catch (analysisError) {
          await this.logger.error('스토리 상태 분석 실패, 기존 방식 사용', { error: analysisError.message });
          return await originalGenerateFunction();
        }
      }

      // 2. 연속성 강화 생성 시도
      try {
        const result = await continuityAwareGenerator.generateNextChapter(novelSlug);
        
        await this.logger.success('연속성 강화 생성 성공', {
          chapterNumber: result.chapter.chapterNumber,
          wordCount: result.chapter.wordCount,
          validationPassed: result.validationResult.valid,
          confidence: result.validationResult.confidence,
          generationTime: Date.now() - startTime
        });

        return this.convertToLegacyFormat(result);
      } catch (continuityError) {
        await this.logger.warn('연속성 강화 생성 실패, 기존 방식으로 폴백', { 
          error: continuityError.message 
        });
        
        // 폴백: 기존 방식으로 생성 후 검증만 수행
        const legacyResult = await originalGenerateFunction();
        await this.validateLegacyGeneration(legacyResult, novelSlug);
        return legacyResult;
      }

    } catch (_error) {
      await this.logger.error('통합 생성 프로세스 실패', { error: _error.message });
      throw _error;
    }
  }

  /**
   * 기존 생성 결과를 연속성 시스템 형식으로 변환
   */
  convertToLegacyFormat(continuityResult) {
    const { chapter, validationResult, metadata } = continuityResult;
    
    return {
      title: chapter.title,
      content: chapter.content || this.generateContentFromChapter(chapter),
      summary: chapter.summary,
      keyEvents: chapter.keyEvents,
      wordCount: chapter.wordCount,
      emotionalTone: chapter.emotionalTone,
      cliffhanger: chapter.cliffhanger,
      // 메타데이터 추가
      continuityMetadata: {
        validationPassed: validationResult.valid,
        confidence: validationResult.confidence,
        generationTime: metadata.generationTime,
        tokensUsed: metadata.tokensUsed,
        attempts: metadata.attempts
      }
    };
  }

  /**
   * 기존 방식으로 생성된 결과 검증
   */
  async validateLegacyGeneration(legacyResult, novelSlug) {
    try {
      await this.logger.info('기존 생성 결과 연속성 검증 시작');
      
      const _storyState = await storyStateManager.getStory(novelSlug);
      const chapterState = this.convertLegacyToChapterState(legacyResult, storyState);
      
      const validationResult = await episodeContinuityEngine.validateAllAspects(storyState, chapterState);
      
      await this.logger.info('검증 완료', {
        valid: validationResult.valid,
        confidence: validationResult.confidence,
        errors: validationResult.errors.length,
        warnings: validationResult.warnings.length
      });

      // 심각한 연속성 문제가 있는 경우 경고
      const criticalErrors = validationResult.errors.filter(e => e.severity === 'critical');
      if (criticalErrors.length > 0) {
        await this.logger.warn('심각한 연속성 문제 감지', {
          criticalErrors: criticalErrors.map(e => e.description)
        });
      }

      // 검증 결과를 legacyResult에 추가
      legacyResult.continuityValidation = validationResult;

    } catch (_error) {
      await this.logger.error('기존 생성 결과 검증 실패', { error: _error.message });
    }
  }

  /**
   * 기존 형식을 ChapterState로 변환
   */
  convertLegacyToChapterState(legacyResult, storyState) {
    const nextChapterNum = storyState.metadata.currentChapter + 1;
    
    return {
      chapterNumber: nextChapterNum,
      title: legacyResult.title || `${nextChapterNum}화`,
      summary: legacyResult.summary || '',
      keyEvents: legacyResult.keyEvents || [],
      characterStates: new Map(),
      newCharacters: [],
      locationChanges: new Map(),
      emotionalTone: legacyResult.emotionalTone || 'neutral',
      endingEmotionalState: legacyResult.emotionalTone || 'neutral',
      cliffhanger: legacyResult.cliffhanger,
      plotProgression: {
        mainArcProgress: '',
        subplotChanges: [],
        foreshadowingPlanted: [],
        foreshadowingResolved: []
      },
      wordCount: legacyResult.wordCount || (legacyResult.content || '').length,
      contentRating: '15+',
      publishedDate: new Date()
    };
  }

  /**
   * ChapterState에서 컨텐츠 생성 (역방향 변환)
   */
  generateContentFromChapter(chapter) {
    // 실제 구현에서는 마크다운 파일에서 컨텐츠를 읽어와야 함
    // 여기서는 임시로 요약과 이벤트를 조합
    return `
# ${chapter.title}

${chapter.summary}

## 주요 사건들
${chapter.keyEvents.map(event => `- ${event}`).join('\n')}

${chapter.cliffhanger ? `\n**다음 화 예고**: ${chapter.cliffhanger}` : ''}
`.trim();
  }

  /**
   * 연속성 시스템 활성화/비활성화
   */
  async toggleContinuitySystem(enabled) {
    this.continuityEnabled = enabled;
    await this.logger.info(`연속성 시스템 ${enabled ? '활성화' : '비활성화'}됨`);
  }

  /**
   * 연속성 시스템 상태 확인
   */
  async getSystemStatus() {
    const modulesReady = await this.ensureModulesLoaded();
    
    if (!modulesReady) {
      return {
        continuityEnabled: false,
        error: '연속성 모듈 로드 실패',
        activeStories: 0,
        storyList: [],
        lastUpdate: new Date().toISOString()
      };
    }

    const activeStories = await storyStateManager.getActiveStories();
    
    return {
      continuityEnabled: this.continuityEnabled,
      activeStories: activeStories.length,
      storyList: activeStories,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * 연속성 문제 일괄 수정 (실험적)
   */
  async batchFixContinuityIssues(novelSlug) {
    await this.logger.info('연속성 문제 일괄 수정 시작', { novelSlug });
    
    try {
      const _storyState = await storyStateManager.getStory(novelSlug);
      const chapters = Array.from(storyState.chapters.values());
      
      let totalIssues = 0;
      let fixedIssues = 0;
      
      for (let i = 1; i < chapters.length; i++) {
        const validationResult = await episodeContinuityEngine.validateAllAspects(storyState, chapters[i]);
        
        if (!validationResult.valid) {
          totalIssues += validationResult.errors.length;
          
          const suggestions = await continuityAwareGenerator.autoFixContinuityIssues(
            novelSlug, 
            validationResult.errors
          );
          
          await this.logger.info(`챕터 ${chapters[i].chapterNumber} 수정 제안`, {
            errors: validationResult.errors.length,
            suggestions: suggestions.length
          });
          
          // 자동 수정은 위험하므로 로그만 남기고 실제 적용은 하지 않음
          fixedIssues += suggestions.length;
        }
      }
      
      await this.logger.success('일괄 수정 분석 완료', {
        totalIssues,
        fixableIssues: fixedIssues,
        note: '실제 수정은 수동으로 검토 후 적용 필요'
      });
      
      return { totalIssues, fixableIssues };
      
    } catch (_error) {
      await this.logger.error('일괄 수정 실패', { error: _error.message });
      throw _error;
    }
  }

  /**
   * 연속성 통계 생성
   */
  async generateContinuityReport(novelSlug) {
    try {
      const stats = await continuityAwareGenerator.getGenerationStats(novelSlug);
      const systemStatus = await this.getSystemStatus();
      
      const report = {
        novel: novelSlug,
        timestamp: new Date().toISOString(),
        systemStatus,
        generationStats: stats,
        recommendations: []
      };
      
      // 권장사항 생성
      if (stats.continuityScore < 0.8) {
        report.recommendations.push('연속성 점수가 낮습니다. 캐릭터/세계관 일관성 검토가 필요합니다.');
      }
      
      if (stats.avgWordCount < 2000) {
        report.recommendations.push('평균 글자 수가 부족합니다. 더 풍부한 내용 생성을 고려하세요.');
      }
      
      if (stats.validationSuccessRate < 0.9) {
        report.recommendations.push('검증 성공률이 낮습니다. 생성 프롬프트 개선이 필요합니다.');
      }
      
      await this.logger.info('연속성 보고서 생성 완료', report);
      return report;
      
    } catch (_error) {
      await this.logger.error('보고서 생성 실패', { error: _error.message });
      throw _error;
    }
  }
}

/**
 * 기존 스크립트에서 사용할 수 있는 헬퍼 함수들
 */
export class LegacyCompatibilityHelper {
  /**
   * 기존 NovelGenerator.generateContent 메서드 래핑
   */
  static wrapGenerateContent(originalMethod, logger) {
    const integrationManager = new ContinuityIntegrationManager(logger);
    
    return async function(...args) {
      const [prompt, creativity] = args;
      
      // 연속성 시스템이 활성화되어 있고, novelSlug를 추출할 수 있는 경우
      const novelSlugMatch = prompt.match(/novel-([a-z0-9-]+)/);
      if (novelSlugMatch) {
        const novelSlug = novelSlugMatch[1];
        
        return await integrationManager.generateWithContinuity(
          () => originalMethod.apply(this, args),
          novelSlug,
          { creativity }
        );
      }
      
      // 그렇지 않으면 기존 방식 사용
      return await originalMethod.apply(this, args);
    };
  }

  /**
   * 환경 변수 기반 연속성 시스템 활성화 확인
   */
  static isContinuityEnabled() {
    return process.env.ENABLE_CONTINUITY_SYSTEM === 'true';
  }

  /**
   * 기존 스크립트에 연속성 시스템 통합
   */
  static async integrateContinuitySystem(novelGenerator, logger) {
    if (!LegacyCompatibilityHelper.isContinuityEnabled()) {
      await logger.info('연속성 시스템 비활성화됨 (ENABLE_CONTINUITY_SYSTEM=false)');
      return novelGenerator;
    }

    await logger.info('연속성 시스템 통합 시작');
    
    // 기존 메서드 백업
    const originalGenerateContent = novelGenerator.generateContent.bind(novelGenerator);
    
    // 연속성 강화 메서드로 교체
    novelGenerator.generateContent = LegacyCompatibilityHelper.wrapGenerateContent(
      originalGenerateContent, 
      logger
    );
    
    // 연속성 관련 메서드 추가
    novelGenerator.continuityManager = new ContinuityIntegrationManager(logger);
    
    await logger.success('연속성 시스템 통합 완료');
    return novelGenerator;
  }
}

/**
 * 환경 설정 기본값
 */
export const CONTINUITY_CONFIG = {
  ENABLE_CONTINUITY_SYSTEM: process.env.ENABLE_CONTINUITY_SYSTEM || 'false',
  CONTINUITY_LOG_LEVEL: process.env.CONTINUITY_LOG_LEVEL || 'info',
  CONTINUITY_VALIDATION_THRESHOLD: parseFloat(process.env.CONTINUITY_VALIDATION_THRESHOLD) || 0.7,
  CONTINUITY_MAX_ATTEMPTS: parseInt(process.env.CONTINUITY_MAX_ATTEMPTS) || 3
};