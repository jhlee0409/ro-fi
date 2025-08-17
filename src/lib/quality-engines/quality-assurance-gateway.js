/**
 * 🎯 Quality Assurance Gateway - 통합 품질 관리 시스템
 * 
 * GENESIS AI 설계 기반 통합 품질 검증 및 개선 시스템
 * - 4개 엔진 통합 품질 스코어링 (플롯, 캐릭터, 문체, 로맨스)
 * - 실시간 품질 검증 (최소 7.0/10 임계값)
 * - 자동 품질 개선 다단계 루프
 * - 품질 재검증 및 에러 처리
 */

import { PlotProgressionEngine } from './plot-progression-engine.js';
import { CharacterDevelopmentSystem } from './character-development-system.js';
import { LiteraryExcellenceEngine } from './literary-excellence-engine.js';
import { RomanceChemistryAnalyzer } from './romance-chemistry-analyzer.js';

export class QualityAssuranceGateway {
  constructor(logger) {
    this.logger = logger;
    
    // 품질 엔진 인스턴스 생성
    this.plotEngine = new PlotProgressionEngine(logger);
    this.characterEngine = new CharacterDevelopmentSystem(logger);
    this.literaryEngine = new LiteraryExcellenceEngine(logger);
    this.romanceEngine = new RomanceChemistryAnalyzer(logger);
    
    // 품질 임계값 및 가중치
    this.qualityThresholds = {
      minimum: 7.0,           // 최소 7.0/10 품질 요구
      excellent: 8.5,         // 8.5+ 우수 품질
      perfect: 9.5,           // 9.5+ 완벽 품질
      critical: 5.0           // 5.0 미만 심각한 품질 문제
    };
    
    // 엔진별 가중치 (총합 1.0)
    this.engineWeights = {
      plot: 0.30,       // 플롯 진전 30%
      character: 0.25,  // 캐릭터 발전 25%
      literary: 0.25,   // 문체 품질 25%
      romance: 0.20     // 로맨스 케미스트리 20%
    };
    
    // 품질 개선 전략
    this.improvementStrategies = {
      plot: {
        priority: 1,    // 최우선
        maxAttempts: 3,
        improvementMethods: ['enforceProgression', 'injectDramaticEvent']
      },
      character: {
        priority: 2,
        maxAttempts: 3,
        improvementMethods: ['enforceCharacterAgency', 'diversifyDialogue']
      },
      literary: {
        priority: 3,
        maxAttempts: 2,
        improvementMethods: ['enhanceVocabularyDiversity', 'enhanceEmotionalDescription']
      },
      romance: {
        priority: 4,
        maxAttempts: 2,
        improvementMethods: ['generateRomanticTension', 'enhanceDialogueChemistry']
      }
    };
    
    // 품질 히스토리 추적
    this.qualityHistory = [];
    this.improvementAttempts = 0;
    this.maxImprovementAttempts = 3;
  }

  /**
   * 🎯 실시간 품질 스코어링 (메인 검증 메서드)
   */
  async calculateQualityScore(content, storyContext = {}) {
    await this.logger.info('QualityAssuranceGateway: 통합 품질 분석 시작');
    
    try {
      // 1. 각 엔진별 분석 실행 (병렬 처리)
      const [plotAnalysis, characterAnalysis, literaryAnalysis, romanceAnalysis] = await Promise.all([
        this.plotEngine.validatePlotProgression({ content }, storyContext),
        this.characterEngine.analyzeCharacterDevelopment({ content }, storyContext),
        this.literaryEngine.analyzeLiteraryQuality(content),
        this.romanceEngine.analyzeRomanceChemistry({ content }, storyContext)
      ]);
      
      // 2. 개별 엔진 점수 추출
      const scores = {
        plotScore: plotAnalysis.overallQualityScore,
        characterScore: characterAnalysis.overallQualityScore,
        literaryScore: literaryAnalysis.overallQualityScore,
        romanceScore: romanceAnalysis.overallQualityScore
      };
      
      // 3. 가중평균으로 전체 점수 계산
      const overallScore = this.calculateWeightedScore(scores);
      
      // 4. 품질 등급 결정
      const qualityGrade = this.determineQualityGrade(overallScore);
      
      // 5. 상세 품질 지표 확인
      const qualityIndicators = this.checkQualityIndicators(
        plotAnalysis, characterAnalysis, literaryAnalysis, romanceAnalysis
      );
      
      // 6. 종합 품질 보고서 생성
      const qualityReport = {
        // 전체 점수 및 등급
        overallScore: overallScore,
        qualityGrade: qualityGrade,
        passThreshold: overallScore >= this.qualityThresholds.minimum,
        
        // 개별 엔진 점수
        scores: scores,
        
        // 상세 분석 결과
        detailedAnalysis: {
          plot: plotAnalysis,
          character: characterAnalysis,
          literary: literaryAnalysis,
          romance: romanceAnalysis
        },
        
        // 품질 지표
        qualityIndicators: qualityIndicators,
        
        // 문제점 및 권장사항
        issues: this.identifyQualityIssues(scores, qualityIndicators),
        recommendations: this.generateQualityRecommendations(scores, qualityIndicators),
        
        // 메타데이터
        analysisTimestamp: new Date().toISOString(),
        contentLength: content ? content.length : 0,
        improvementAttempt: this.improvementAttempts
      };
      
      // 7. 품질 히스토리 업데이트
      this.updateQualityHistory(qualityReport);
      
      await this.logger.info('QualityAssuranceGateway: 품질 분석 완료', {
        overallScore: overallScore,
        qualityGrade: qualityGrade,
        passThreshold: qualityReport.passThreshold
      });
      
      return qualityReport;
      
    } catch (_error) {
      await this.logger.error('QualityAssuranceGateway: 품질 분석 실패', { error: _error.message });
      throw new QualityAnalysisError('품질 분석 중 오류 발생', _error);
    }
  }

  /**
   * 🚀 자동 품질 개선 시스템
   */
  async improveContent(content, qualityIssues, storyContext = {}) {
    await this.logger.info('QualityAssuranceGateway: 자동 품질 개선 시작');
    
    try {
      if (this.improvementAttempts >= this.maxImprovementAttempts) {
        await this.logger.warn('QualityAssuranceGateway: 최대 개선 시도 횟수 초과');
        throw new QualityImprovementError('최대 개선 시도 횟수를 초과했습니다.');
      }
      
      this.improvementAttempts++;
      let improvedContent = content;
      
      // 1. 우선순위별 품질 문제 해결
      const sortedIssues = this.prioritizeQualityIssues(qualityIssues);
      
      for (const issue of sortedIssues) {
        try {
          improvedContent = await this.applyImprovementStrategy(
            improvedContent, 
            issue, 
            storyContext
          );
          
          await this.logger.info(`품질 개선 적용: ${issue.engine} - ${issue.method}`);
          
        } catch (improvementError) {
          await this.logger.warn(`품질 개선 실패: ${issue.engine}`, { 
            error: improvementError.message 
          });
          // 개별 개선 실패는 전체 프로세스를 중단하지 않음
        }
      }
      
      // 2. 개선 후 품질 재검증
      const improvedQuality = await this.calculateQualityScore(improvedContent, storyContext);
      
      // 3. 개선 효과 검증
      const improvementResult = this.validateImprovementResult(improvedQuality);
      
      await this.logger.success('QualityAssuranceGateway: 품질 개선 완료', {
        improvementAttempts: this.improvementAttempts,
        finalScore: improvedQuality.overallScore,
        improvementSuccess: improvementResult.success
      });
      
      return {
        improvedContent: improvedContent,
        qualityReport: improvedQuality,
        improvementResult: improvementResult,
        attemptCount: this.improvementAttempts
      };
      
    } catch (_error) {
      await this.logger.error('QualityAssuranceGateway: 품질 개선 실패', { error: _error.message });
      throw _error;
    }
  }

  /**
   * 🔍 품질 검증 게이트웨이 (임계값 체크)
   */
  async validateQualityThreshold(content, storyContext = {}) {
    await this.logger.info('QualityAssuranceGateway: 품질 임계값 검증');
    
    try {
      const qualityReport = await this.calculateQualityScore(content, storyContext);
      
      // 임계값 미달 시 자동 개선 시도
      if (!qualityReport.passThreshold) {
        await this.logger.warn('품질 임계값 미달, 자동 개선 시작', {
          currentScore: qualityReport.overallScore,
          threshold: this.qualityThresholds.minimum
        });
        
        const improvementResult = await this.improveContent(
          content, 
          qualityReport.issues, 
          storyContext
        );
        
        // 개선 후에도 임계값 미달 시 에러 발생
        if (!improvementResult.qualityReport.passThreshold) {
          throw new QualityThresholdError(
            `품질 개선 후에도 임계값 미달: ${improvementResult.qualityReport.overallScore}/10`
          );
        }
        
        return improvementResult;
      }
      
      // 임계값 통과
      await this.logger.success('품질 임계값 통과', {
        score: qualityReport.overallScore,
        grade: qualityReport.qualityGrade
      });
      
      return {
        improvedContent: content,
        qualityReport: qualityReport,
        improvementResult: { success: true, improvementNeeded: false },
        attemptCount: 0
      };
      
    } catch (_error) {
      await this.logger.error('품질 검증 실패', { error: _error.message });
      throw _error;
    }
  }

  /**
   * 📊 가중 점수 계산
   */
  calculateWeightedScore(scores) {
    const weightedSum = 
      (scores.plotScore * this.engineWeights.plot) +
      (scores.characterScore * this.engineWeights.character) +
      (scores.literaryScore * this.engineWeights.literary) +
      (scores.romanceScore * this.engineWeights.romance);
    
    return parseFloat(Math.max(0, Math.min(10, weightedSum)).toFixed(1));
  }

  /**
   * 🏆 품질 등급 결정
   */
  determineQualityGrade(score) {
    if (score >= this.qualityThresholds.perfect) {
      return 'PERFECT';       // 9.5+ 완벽
    } else if (score >= this.qualityThresholds.excellent) {
      return 'EXCELLENT';     // 8.5-9.4 우수
    } else if (score >= this.qualityThresholds.minimum) {
      return 'GOOD';          // 7.0-8.4 양호
    } else if (score >= this.qualityThresholds.critical) {
      return 'POOR';          // 5.0-6.9 부족
    } else {
      return 'CRITICAL';      // <5.0 심각
    }
  }

  /**
   * ✅ 품질 지표 확인
   */
  checkQualityIndicators(plotAnalysis, characterAnalysis, literaryAnalysis, romanceAnalysis) {
    return {
      // 플롯 지표
      plotProgression: plotAnalysis.meetsProgressionThreshold,
      conflictEscalation: plotAnalysis.meetsConflictThreshold,
      plotRepetition: plotAnalysis.acceptableRepetition,
      
      // 캐릭터 지표
      characterAgency: characterAnalysis.meetsAgencyThreshold,
      speechDiversity: characterAnalysis.acceptableSpeechRepetition,
      characterPersonality: characterAnalysis.sufficientPersonality,
      characterGrowth: characterAnalysis.showsGrowth,
      
      // 문체 지표
      vocabularyLevel: literaryAnalysis.meetsVocabularyThreshold,
      sensoryRichness: literaryAnalysis.sufficientSensoryRichness,
      metaphorUsage: literaryAnalysis.adequateMetaphors,
      rhythmVariation: literaryAnalysis.goodRhythm,
      
      // 로맨스 지표
      romanceChemistry: romanceAnalysis.meetsChemistryThreshold,
      romanceProgression: romanceAnalysis.sufficientProgression,
      emotionalDepth: romanceAnalysis.adequateEmotionalDepth,
      romanticTension: romanceAnalysis.appropriateTension
    };
  }

  /**
   * 🚨 품질 문제점 식별
   */
  identifyQualityIssues(scores, qualityIndicators) {
    const issues = [];
    
    // 플롯 관련 문제
    if (scores.plotScore < this.qualityThresholds.minimum) {
      issues.push({
        engine: 'plot',
        severity: 'HIGH',
        issue: '플롯 진전 부족',
        score: scores.plotScore,
        indicators: {
          progression: qualityIndicators.plotProgression,
          conflict: qualityIndicators.conflictEscalation,
          repetition: qualityIndicators.plotRepetition
        }
      });
    }
    
    // 캐릭터 관련 문제
    if (scores.characterScore < this.qualityThresholds.minimum) {
      issues.push({
        engine: 'character',
        severity: 'HIGH',
        issue: '캐릭터 발전 부족',
        score: scores.characterScore,
        indicators: {
          agency: qualityIndicators.characterAgency,
          speech: qualityIndicators.speechDiversity,
          personality: qualityIndicators.characterPersonality,
          growth: qualityIndicators.characterGrowth
        }
      });
    }
    
    // 문체 관련 문제
    if (scores.literaryScore < this.qualityThresholds.minimum) {
      issues.push({
        engine: 'literary',
        severity: 'MEDIUM',
        issue: '문체 품질 부족',
        score: scores.literaryScore,
        indicators: {
          vocabulary: qualityIndicators.vocabularyLevel,
          sensory: qualityIndicators.sensoryRichness,
          metaphor: qualityIndicators.metaphorUsage,
          rhythm: qualityIndicators.rhythmVariation
        }
      });
    }
    
    // 로맨스 관련 문제
    if (scores.romanceScore < this.qualityThresholds.minimum) {
      issues.push({
        engine: 'romance',
        severity: 'MEDIUM',
        issue: '로맨스 케미스트리 부족',
        score: scores.romanceScore,
        indicators: {
          chemistry: qualityIndicators.romanceChemistry,
          progression: qualityIndicators.romanceProgression,
          emotion: qualityIndicators.emotionalDepth,
          tension: qualityIndicators.romanticTension
        }
      });
    }
    
    return issues;
  }

  /**
   * 💡 품질 개선 권장사항 생성
   */
  generateQualityRecommendations(scores, qualityIndicators) {
    const recommendations = [];
    
    // 우선순위별 권장사항 생성
    const priorityIssues = [
      { score: scores.plotScore, engine: 'plot', name: '플롯' },
      { score: scores.characterScore, engine: 'character', name: '캐릭터' },
      { score: scores.literaryScore, engine: 'literary', name: '문체' },
      { score: scores.romanceScore, engine: 'romance', name: '로맨스' }
    ].sort((a, b) => a.score - b.score);
    
    for (const issue of priorityIssues) {
      if (issue.score < this.qualityThresholds.minimum) {
        recommendations.push({
          priority: 'HIGH',
          engine: issue.engine,
          recommendation: `${issue.name} 품질을 우선적으로 개선하세요 (현재 ${issue.score}/10)`
        });
      } else if (issue.score < this.qualityThresholds.excellent) {
        recommendations.push({
          priority: 'MEDIUM',
          engine: issue.engine,
          recommendation: `${issue.name} 품질을 더욱 향상시킬 수 있습니다 (현재 ${issue.score}/10)`
        });
      }
    }
    
    // 구체적 개선 제안
    if (!qualityIndicators.plotProgression) {
      recommendations.push({
        priority: 'HIGH',
        engine: 'plot',
        recommendation: '플롯 진전 요소를 추가하세요. 새로운 사건이나 갈등을 도입해보세요.'
      });
    }
    
    if (!qualityIndicators.characterAgency) {
      recommendations.push({
        priority: 'HIGH',
        engine: 'character',
        recommendation: '캐릭터의 능동성을 높이세요. 수동적 표현을 능동적으로 바꿔보세요.'
      });
    }
    
    return recommendations;
  }

  /**
   * 🎯 품질 문제 우선순위 정렬
   */
  prioritizeQualityIssues(issues) {
    return issues
      .map(issue => ({
        ...issue,
        priority: this.improvementStrategies[issue.engine]?.priority || 5,
        methods: this.improvementStrategies[issue.engine]?.improvementMethods || []
      }))
      .sort((a, b) => a.priority - b.priority)
      .flatMap(issue => 
        issue.methods.map(method => ({
          engine: issue.engine,
          method: method,
          severity: issue.severity,
          score: issue.score
        }))
      );
  }

  /**
   * 🛠️ 개선 전략 적용
   */
  async applyImprovementStrategy(content, issue, storyContext) {
    const { engine, method } = issue;
    
    try {
      switch (engine) {
        case 'plot':
          if (method === 'enforceProgression') {
            return await this.plotEngine.enforceProgression(content, storyContext);
          }
          break;
          
        case 'character':
          if (method === 'enforceCharacterAgency') {
            return await this.characterEngine.enforceCharacterAgency(content, storyContext);
          } else if (method === 'diversifyDialogue') {
            return await this.characterEngine.diversifyDialogue(content);
          }
          break;
          
        case 'literary':
          if (method === 'enhanceVocabularyDiversity') {
            return await this.literaryEngine.enhanceVocabularyDiversity(content);
          } else if (method === 'enhanceEmotionalDescription') {
            return await this.literaryEngine.enhanceEmotionalDescription(content);
          }
          break;
          
        case 'romance':
          if (method === 'generateRomanticTension') {
            return await this.romanceEngine.generateRomanticTension(content);
          } else if (method === 'enhanceDialogueChemistry') {
            return await this.romanceEngine.enhanceDialogueChemistry(content);
          }
          break;
          
        default:
          await this.logger.warn(`알 수 없는 개선 엔진: ${engine}`);
          return content;
      }
      
      return content;
      
    } catch (_error) {
      await this.logger.error(`개선 전략 적용 실패: ${engine}.${method}`, { 
        error: _error.message 
      });
      return content; // 실패 시 원본 반환
    }
  }

  /**
   * ✅ 개선 결과 검증
   */
  validateImprovementResult(improvedQuality) {
    const currentScore = improvedQuality.overallScore;
    const previousScore = this.qualityHistory.length > 0 ? 
      this.qualityHistory[this.qualityHistory.length - 1].overallScore : 0;
    
    const improvementAmount = currentScore - previousScore;
    const passesThreshold = currentScore >= this.qualityThresholds.minimum;
    
    return {
      success: passesThreshold,
      improvementAmount: parseFloat(improvementAmount.toFixed(1)),
      finalScore: currentScore,
      passesThreshold: passesThreshold,
      qualityGrade: improvedQuality.qualityGrade,
      improvementNeeded: !passesThreshold,
      canImproveMore: this.improvementAttempts < this.maxImprovementAttempts
    };
  }

  /**
   * 📈 품질 히스토리 업데이트
   */
  updateQualityHistory(qualityReport) {
    this.qualityHistory.push({
      timestamp: qualityReport.analysisTimestamp,
      overallScore: qualityReport.overallScore,
      qualityGrade: qualityReport.qualityGrade,
      scores: qualityReport.scores,
      improvementAttempt: qualityReport.improvementAttempt
    });
    
    // 히스토리 크기 제한 (최근 10개만 유지)
    if (this.qualityHistory.length > 10) {
      this.qualityHistory = this.qualityHistory.slice(-10);
    }
  }

  /**
   * 📊 품질 트렌드 분석
   */
  analyzeQualityTrend() {
    if (this.qualityHistory.length < 2) {
      return { trend: 'INSUFFICIENT_DATA', change: 0 };
    }
    
    const recent = this.qualityHistory.slice(-3); // 최근 3개
    const scores = recent.map(h => h.overallScore);
    
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const change = lastScore - firstScore;
    
    let trend;
    if (change > 0.5) {
      trend = 'IMPROVING';
    } else if (change < -0.5) {
      trend = 'DECLINING';
    } else {
      trend = 'STABLE';
    }
    
    return {
      trend: trend,
      change: parseFloat(change.toFixed(1)),
      recentScores: scores,
      averageScore: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
    };
  }

  /**
   * 📋 품질 보고서 요약 생성
   */
  generateQualitySummary(qualityReport) {
    const trend = this.analyzeQualityTrend();
    
    return {
      summary: `전체 품질 ${qualityReport.overallScore}/10 (${qualityReport.qualityGrade})`,
      status: qualityReport.passThreshold ? 'PASS' : 'FAIL',
      
      engineSummary: {
        plot: `플롯 ${qualityReport.scores.plotScore}/10`,
        character: `캐릭터 ${qualityReport.scores.characterScore}/10`,
        literary: `문체 ${qualityReport.scores.literaryScore}/10`,
        romance: `로맨스 ${qualityReport.scores.romanceScore}/10`
      },
      
      qualityTrend: trend,
      
      keyIssues: qualityReport.issues.map(issue => issue.issue),
      
      topRecommendations: qualityReport.recommendations
        .filter(rec => rec.priority === 'HIGH')
        .slice(0, 3)
        .map(rec => rec.recommendation),
      
      metadata: {
        analysisTime: qualityReport.analysisTimestamp,
        contentLength: qualityReport.contentLength,
        improvementAttempts: qualityReport.improvementAttempt
      }
    };
  }

  /**
   * 🔄 품질 상태 리셋
   */
  resetQualityState() {
    this.qualityHistory = [];
    this.improvementAttempts = 0;
    
    this.logger.info('QualityAssuranceGateway: 품질 상태 리셋 완료');
  }

  /**
   * 📈 품질 메트릭 내보내기
   */
  exportQualityMetrics() {
    return {
      qualityHistory: this.qualityHistory,
      currentSession: {
        improvementAttempts: this.improvementAttempts,
        maxAttempts: this.maxImprovementAttempts
      },
      configuration: {
        thresholds: this.qualityThresholds,
        weights: this.engineWeights,
        strategies: this.improvementStrategies
      },
      trend: this.analyzeQualityTrend()
    };
  }
}

/**
 * 커스텀 에러 클래스들
 */
export class QualityThresholdError extends Error {
  constructor(message, qualityScore = null) {
    super(message);
    this.name = 'QualityThresholdError';
    this.qualityScore = qualityScore;
  }
}

export class QualityAnalysisError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'QualityAnalysisError';
    this.originalError = originalError;
  }
}

export class QualityImprovementError extends Error {
  constructor(message, attemptCount = null) {
    super(message);
    this.name = 'QualityImprovementError';
    this.attemptCount = attemptCount;
  }
}