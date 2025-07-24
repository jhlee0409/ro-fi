/**
 * 토큰 밸런싱 엔진 테스트
 * 비용 최적화와 품질 균형 검증
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { TokenBalancingEngine } from '../lib/token-balancing-engine.js';

describe('TokenBalancingEngine', () => {
  let tokenBalancer;
  
  beforeEach(() => {
    tokenBalancer = new TokenBalancingEngine();
    // 테스트를 위한 초기 예산 설정
    tokenBalancer.costTracking.sessionBudget = 100; // $100
    tokenBalancer.costTracking.totalCost = 0;
  });

  describe('전략 선택', () => {
    test('높은 창의성 필요도일 때 창의성 모드 선택', () => {
      const situationAnalysis = {
        creativityNeed: 0.8,
        urgency: 'high',
        readerEngagement: 0.3,
        dropoutRisk: 0.4
      };

      const budgetStatus = {
        status: 'healthy',
        pressure: 0.2,
        availableStrategies: ['efficiency', 'balanced', 'creativity', 'emergency']
      };

      const qualityRequirements = {
        overallNeed: 0.8,
        creativityNeed: 0.8,
        readerCrisis: false
      };

      const strategy = tokenBalancer.selectOptimalStrategy(
        situationAnalysis,
        budgetStatus,
        qualityRequirements
      );

      expect(strategy.name).toBe('창의성 모드');
      expect(strategy.reason).toBe('high_creativity_need');
      expect(strategy.costMultiplier).toBe(1.0);
      expect(strategy.tokenRange.min).toBe(5000);
    });

    test('예산 압박 상황에서 효율 모드 선택', () => {
      const situationAnalysis = {
        creativityNeed: 0.6,
        urgency: 'medium',
        readerEngagement: 0.5,
        dropoutRisk: 0.2
      };

      const budgetStatus = {
        status: 'critical',
        pressure: 0.9,
        availableStrategies: ['efficiency'] // 예산 부족으로 효율 모드만 가능
      };

      const qualityRequirements = {
        overallNeed: 0.6,
        creativityNeed: 0.6,
        readerCrisis: false
      };

      const strategy = tokenBalancer.selectOptimalStrategy(
        situationAnalysis,
        budgetStatus,
        qualityRequirements
      );

      expect(strategy.name).toBe('효율 모드');
      expect(strategy.reason).toBe('cost_optimization');
      expect(strategy.costMultiplier).toBe(0.25);
    });

    test('긴급 상황에서 응급 모드 선택', () => {
      const situationAnalysis = {
        creativityNeed: 0.9,
        urgency: 'critical',
        readerEngagement: 0.1,
        dropoutRisk: 0.6
      };

      const budgetStatus = {
        status: 'healthy',
        pressure: 0.3,
        availableStrategies: ['efficiency', 'balanced', 'creativity', 'emergency']
      };

      const qualityRequirements = {
        overallNeed: 0.9,
        creativityNeed: 0.9,
        readerCrisis: true
      };

      const strategy = tokenBalancer.selectOptimalStrategy(
        situationAnalysis,
        budgetStatus,
        qualityRequirements
      );

      expect(strategy.name).toBe('긴급 모드');
      expect(strategy.reason).toBe('emergency_intervention');
      expect(strategy.costMultiplier).toBe(1.5);
    });

    test('균형잡힌 상황에서 균형 모드 선택', () => {
      const situationAnalysis = {
        creativityNeed: 0.5,
        urgency: 'medium',
        readerEngagement: 0.6,
        dropoutRisk: 0.2
      };

      const budgetStatus = {
        status: 'healthy',
        pressure: 0.4,
        availableStrategies: ['efficiency', 'balanced', 'creativity']
      };

      const qualityRequirements = {
        overallNeed: 0.6,
        creativityNeed: 0.5,
        readerCrisis: false
      };

      const strategy = tokenBalancer.selectOptimalStrategy(
        situationAnalysis,
        budgetStatus,
        qualityRequirements
      );

      expect(strategy.name).toBe('균형 모드');
      expect(strategy.reason).toBe('balanced_approach');
      expect(strategy.costMultiplier).toBe(0.5);
    });
  });

  describe('예산 상태 체크', () => {
    test('건강한 예산 상태', () => {
      tokenBalancer.costTracking.totalCost = 30; // 30% 사용

      const budgetStatus = tokenBalancer.checkBudgetStatus();

      expect(budgetStatus.status).toBe('healthy');
      expect(budgetStatus.pressure).toBe(0.3);
      expect(budgetStatus.usedRatio).toBeCloseTo(0.3);
      expect(budgetStatus.remainingBudget).toBe(70);
      expect(budgetStatus.availableStrategies).toContain('creativity');
      expect(budgetStatus.recommendEfficiencyMode).toBe(false);
    });

    test('경고 수준 예산 상태', () => {
      tokenBalancer.costTracking.totalCost = 75; // 75% 사용

      const budgetStatus = tokenBalancer.checkBudgetStatus();

      expect(budgetStatus.status).toBe('warning');
      expect(budgetStatus.pressure).toBe(0.75);
      expect(budgetStatus.availableStrategies).toEqual(['efficiency', 'balanced']);
      expect(budgetStatus.recommendEfficiencyMode).toBe(true);
    });

    test('위험 수준 예산 상태', () => {
      tokenBalancer.costTracking.totalCost = 92; // 92% 사용

      const budgetStatus = tokenBalancer.checkBudgetStatus();

      expect(budgetStatus.status).toBe('critical');
      expect(budgetStatus.pressure).toBe(0.92);
      expect(budgetStatus.availableStrategies).toEqual(['efficiency']);
    });

    test('예산 고갈 임박', () => {
      tokenBalancer.costTracking.totalCost = 97; // 97% 사용

      const budgetStatus = tokenBalancer.checkBudgetStatus();

      expect(budgetStatus.status).toBe('emergency');
      expect(budgetStatus.pressure).toBe(1.0);
      expect(budgetStatus.availableStrategies).toEqual([]);
    });
  });

  describe('전략 미세 조정', () => {
    test('예산 압박 상황에서 토큰 범위 축소', () => {
      tokenBalancer.adaptiveSettings.budgetPressure = 0.8;

      const baseStrategy = {
        name: '균형 모드',
        tokenRange: { min: 2000, max: 3500, target: 2750 },
        creativity: 0.6
      };

      const context = {
        qualityRequirements: { overallNeed: 0.5 },
        readerMetrics: { dropout: { rate: 0.15 } }
      };

      const tunedStrategy = tokenBalancer.tuneStrategy(baseStrategy, context);

      expect(tunedStrategy.tokenRange.target).toBeLessThan(2750);
      expect(tunedStrategy.tokenRange.max).toBeLessThan(3500);
    });

    test('독자 위기 상황에서 창의성 부스트', () => {
      const baseStrategy = {
        name: '효율 모드',
        tokenRange: { min: 1200, max: 2000, target: 1500 },
        creativity: 0.3
      };

      const context = {
        qualityRequirements: { overallNeed: 0.7 },
        readerMetrics: { dropout: { rate: 0.45 } } // 45% 이탈률
      };

      const tunedStrategy = tokenBalancer.tuneStrategy(baseStrategy, context);

      expect(tunedStrategy.creativity).toBeGreaterThan(0.3);
      expect(tunedStrategy.tokenRange.target).toBeGreaterThan(1500);
    });
  });

  describe('최적 전략 결정', () => {
    test('전체 파이프라인 - 창의성 모드 필요', () => {
      const context = {
        creativityRecommendation: {
          score: 0.8,
          urgency: 'high'
        },
        readerMetrics: {
          engagement: { score: 0.2 },
          dropout: { rate: 0.35 }
        },
        chapterContext: {
          chapterNumber: 1,
          progressPercentage: 2
        },
        novelState: { slug: 'test-novel' }
      };

      const result = tokenBalancer.determineOptimalStrategy(context);

      expect(result.strategy.name).toBe('창의성 모드');
      expect(result.executionPlan.estimatedTokens).toBeGreaterThan(5000);
      expect(result.executionPlan.targetQuality).toBe('premium');
      expect(result.reasoning).toContain('창의성 필요도');
    });

    test('전체 파이프라인 - 효율 모드 선택', () => {
      // 예산 압박 상황 설정
      tokenBalancer.costTracking.totalCost = 85;

      const context = {
        creativityRecommendation: {
          score: 0.3,
          urgency: 'low'
        },
        readerMetrics: {
          engagement: { score: 0.7 },
          dropout: { rate: 0.1 }
        },
        chapterContext: {
          chapterNumber: 15,
          progressPercentage: 35
        }
      };

      const result = tokenBalancer.determineOptimalStrategy(context);

      expect(result.strategy.name).toBe('효율 모드');
      expect(result.executionPlan.estimatedTokens).toBeLessThan(2000);
      expect(result.reasoning).toContain('예산 압박');
    });

    test('폴백 옵션 생성', () => {
      const creativityStrategy = { name: '창의성 모드' };
      const fallbacks = tokenBalancer.prepareFallbackOptions(creativityStrategy);

      expect(fallbacks.length).toBeGreaterThan(0);
      expect(fallbacks[0].trigger).toBe('cost_overrun');
      expect(fallbacks[0].alternative).toBe('efficiency');
    });
  });

  describe('비용 추적', () => {
    test('비용 추적 및 절약 계산', () => {
      const strategy = {
        name: '효율 모드',
        costMultiplier: 0.25
      };

      const actualTokens = 1500;
      const result = tokenBalancer.trackCost(actualTokens, strategy);

      expect(result.actualCost).toBeCloseTo(1500 * 0.003 * 0.25);
      expect(result.savings).toBeGreaterThan(0);
      expect(result.efficiencyRate).toBeCloseTo(0.75); // 75% 절약
      expect(tokenBalancer.costTracking.totalTokensUsed).toBe(1500);
    });

    test('세션 통계 업데이트', () => {
      const strategy = { name: '창의성 모드', costMultiplier: 1.0 };
      
      tokenBalancer.trackCost(3000, strategy);
      tokenBalancer.trackCost(2000, strategy);

      expect(tokenBalancer.sessionStats.chaptersGenerated).toBe(2);
      expect(tokenBalancer.sessionStats.modesUsed.get('창의성 모드')).toBe(2);
      expect(tokenBalancer.sessionStats.totalSavings).toBeGreaterThanOrEqual(0);
    });

    test('예산 압박 업데이트', () => {
      const initialPressure = tokenBalancer.adaptiveSettings.budgetPressure;
      
      const strategy = { name: '창의성 모드', costMultiplier: 1.0 };
      tokenBalancer.trackCost(5000, strategy); // 큰 비용 발생

      expect(tokenBalancer.adaptiveSettings.budgetPressure).toBeGreaterThan(initialPressure);
    });
  });

  describe('성과 측정 및 학습', () => {
    test('성과 측정', () => {
      const strategy = { name: '창의성 모드', costMultiplier: 1.0 };
      const actualTokens = 4000;
      const qualityScore = 0.85;
      const readerResponse = {
        satisfaction: 0.9,
        engagement: 0.8
      };

      const performance = tokenBalancer.measurePerformance(
        strategy,
        actualTokens,
        qualityScore,
        readerResponse
      );

      expect(performance.strategy).toBe('창의성 모드');
      expect(performance.tokensUsed).toBe(4000);
      expect(performance.qualityAchieved).toBe(0.85);
      expect(performance.costEffectiveness).toBeGreaterThan(0);
      expect(performance.qualityPerDollar).toBeGreaterThan(0);
      expect(performance.roi).toBeGreaterThan(0);
    });

    test('적응형 설정 조정', () => {
      const lowQualityPerformance = {
        strategy: '효율 모드',
        qualityAchieved: 0.5, // 낮은 품질
        readerSatisfaction: 0.4
      };

      const initialThreshold = tokenBalancer.adaptiveSettings.qualityThreshold;
      tokenBalancer.adaptSettings(lowQualityPerformance);

      // 품질이 낮으면 임계값이 약간 상승해야 함
      expect(tokenBalancer.adaptiveSettings.qualityThreshold).toBeGreaterThan(initialThreshold);
    });

    test('전략별 성공률 추적', () => {
      // 여러 번의 성공적인 창의성 모드 사용
      for (let i = 0; i < 3; i++) {
        tokenBalancer.measurePerformance(
          { name: '창의성 모드', costMultiplier: 1.0 },
          4000,
          0.9, // 높은 품질
          { satisfaction: 0.85, engagement: 0.8 }
        );
      }

      const creativitySuccess = tokenBalancer.qualityMetrics.creativeSuccess.get('창의성 모드');
      expect(creativitySuccess.attempts).toBe(3);
      expect(creativitySuccess.successes).toBe(3);
      expect(creativitySuccess.avgQuality).toBeCloseTo(0.9);
    });
  });

  describe('최적화 리포트', () => {
    beforeEach(() => {
      // 테스트 데이터 설정
      tokenBalancer.sessionStats.chaptersGenerated = 5;
      tokenBalancer.sessionStats.modesUsed.set('효율 모드', 3);
      tokenBalancer.sessionStats.modesUsed.set('창의성 모드', 2);
      tokenBalancer.sessionStats.qualityScores = [0.7, 0.8, 0.6, 0.9, 0.75];
      tokenBalancer.costTracking.totalTokensUsed = 15000;
      tokenBalancer.costTracking.totalCost = 30;
      tokenBalancer.costTracking.savingsAchieved = 20;
    });

    test('최적화 리포트 생성', () => {
      const report = tokenBalancer.generateOptimizationReport();

      expect(report.session.chaptersGenerated).toBe(5);
      expect(report.session.totalCost).toBe(30);
      expect(report.session.totalSavings).toBe(20);
      
      expect(report.efficiency.averageTokensPerChapter).toBe(3000);
      expect(report.efficiency.averageCostPerChapter).toBe(6);
      expect(report.efficiency.savingsRate).toBeGreaterThan(0);
      
      expect(report.strategy.mostUsed.strategy).toBe('효율 모드');
      expect(report.strategy.mostUsed.count).toBe(3);
      
      expect(report.quality.averageQuality).toBeCloseTo(0.75);
    });

    test('품질 일관성 계산', () => {
      // 일관성 있는 품질 점수
      tokenBalancer.sessionStats.qualityScores = [0.8, 0.81, 0.79, 0.8, 0.82];
      const highConsistency = tokenBalancer.calculateQualityConsistency();
      expect(highConsistency).toBeGreaterThan(0.9);

      // 일관성 없는 품질 점수
      tokenBalancer.sessionStats.qualityScores = [0.3, 0.9, 0.4, 0.8, 0.2];
      const lowConsistency = tokenBalancer.calculateQualityConsistency();
      expect(lowConsistency).toBeLessThan(0.7);
    });

    test('품질 트렌드 분석', () => {
      // 향상 트렌드
      tokenBalancer.sessionStats.qualityScores = [0.5, 0.6, 0.7, 0.8, 0.85];
      expect(tokenBalancer.analyzeQualityTrend()).toBe('improving');

      // 하락 트렌드
      tokenBalancer.sessionStats.qualityScores = [0.9, 0.8, 0.7, 0.6, 0.5];
      expect(tokenBalancer.analyzeQualityTrend()).toBe('declining');

      // 안정적 트렌드
      tokenBalancer.sessionStats.qualityScores = [0.7, 0.71, 0.69, 0.7, 0.72];
      expect(tokenBalancer.analyzeQualityTrend()).toBe('stable');
    });

    test('전략 추천 생성', () => {
      // 예산 여유 상황
      tokenBalancer.adaptiveSettings.budgetPressure = 0.3;
      const recommendations = tokenBalancer.generateStrategyRecommendations();
      expect(recommendations.some(r => r.includes('창의성 모드 적극 활용'))).toBe(true);

      // 예산 압박 상황
      tokenBalancer.adaptiveSettings.budgetPressure = 0.85;
      const tightRecommendations = tokenBalancer.generateStrategyRecommendations();
      expect(tightRecommendations.some(r => r.includes('효율 모드 중심'))).toBe(true);
    });
  });

  describe('유틸리티 함수', () => {
    test('스타일-디테일 매핑', () => {
      expect(tokenBalancer.mapStyleToDetail('concise')).toBe(0.3);
      expect(tokenBalancer.mapStyleToDetail('detailed')).toBe(0.6);
      expect(tokenBalancer.mapStyleToDetail('elaborate')).toBe(0.9);
      expect(tokenBalancer.mapStyleToDetail('intensive')).toBe(1.0);
      expect(tokenBalancer.mapStyleToDetail('unknown')).toBe(0.5); // 기본값
    });

    test('품질 임계값 가져오기', () => {
      expect(tokenBalancer.getQualityThreshold({ name: '효율 모드' })).toBe(0.6);
      expect(tokenBalancer.getQualityThreshold({ name: '균형 모드' })).toBe(0.7);
      expect(tokenBalancer.getQualityThreshold({ name: '창의성 모드' })).toBe(0.8);
      expect(tokenBalancer.getQualityThreshold({ name: '긴급 모드' })).toBe(0.85);
    });

    test('가장 사용된 전략 찾기', () => {
      tokenBalancer.sessionStats.modesUsed.set('효율 모드', 5);
      tokenBalancer.sessionStats.modesUsed.set('창의성 모드', 2);
      tokenBalancer.sessionStats.modesUsed.set('균형 모드', 3);

      const mostUsed = tokenBalancer.getMostUsedStrategy();
      expect(mostUsed.strategy).toBe('효율 모드');
      expect(mostUsed.count).toBe(5);
    });

    test('가장 효과적인 전략 찾기', () => {
      tokenBalancer.qualityMetrics.creativeSuccess.set('효율 모드', {
        attempts: 10,
        successes: 6,
        avgQuality: 0.7
      });

      tokenBalancer.qualityMetrics.creativeSuccess.set('창의성 모드', {
        attempts: 5,
        successes: 5,
        avgQuality: 0.9
      });

      const mostEffective = tokenBalancer.getMostEffectiveStrategy();
      expect(mostEffective.strategy).toBe('창의성 모드');
      expect(mostEffective.effectiveness).toBeCloseTo(0.9); // 100% 성공률 * 0.9 품질
    });
  });

  describe('에러 처리', () => {
    test('예산 부족으로 전략 선택 불가', () => {
      const situationAnalysis = { creativityNeed: 0.8 };
      const budgetStatus = { availableStrategies: [] }; // 사용 가능한 전략 없음
      const qualityRequirements = { overallNeed: 0.8 };

      expect(() => {
        tokenBalancer.selectOptimalStrategy(situationAnalysis, budgetStatus, qualityRequirements);
      }).toThrow('예산 부족으로 생성 불가');
    });

    test('잘못된 입력값 방어', () => {
      expect(() => {
        tokenBalancer.checkBudgetStatus();
      }).not.toThrow();

      expect(() => {
        tokenBalancer.trackCost(null, { costMultiplier: 1.0 });
      }).not.toThrow();

      expect(() => {
        tokenBalancer.measurePerformance(null, 0, 0, {});
      }).not.toThrow();
    });

    test('빈 세션 데이터 처리', () => {
      const emptyBalancer = new TokenBalancingEngine();
      
      expect(() => {
        emptyBalancer.generateOptimizationReport();
      }).not.toThrow();

      const report = emptyBalancer.generateOptimizationReport();
      expect(report.session.chaptersGenerated).toBe(0);
    });
  });
});