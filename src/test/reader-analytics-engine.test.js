/**
 * 독자 분석 엔진 테스트
 * 독자 행동 패턴 분석 및 창의성 모드 트리거 검증
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ReaderAnalyticsEngine } from '../lib/reader-analytics-engine.js';

describe('ReaderAnalyticsEngine', () => {
  let analyticsEngine;
  
  beforeEach(() => {
    analyticsEngine = new ReaderAnalyticsEngine();
  });

  describe('기본 메트릭스 수집', () => {
    test('챕터별 기본 메트릭스 생성', async () => {
      const metrics = await analyticsEngine.collectBasicMetrics('test-novel', 5);

      expect(metrics).toBeDefined();
      expect(metrics.chapterNumber).toBe(5);
      expect(metrics.totalViews).toBeGreaterThan(0);
      expect(metrics.uniqueReaders).toBeGreaterThan(0);
      expect(metrics.completionRate).toBeGreaterThan(0);
      expect(metrics.completionRate).toBeLessThanOrEqual(1);
      expect(metrics.averageReadingTime).toBeGreaterThan(0);
      expect(metrics.dropoutRate).toBeGreaterThanOrEqual(0);
      expect(metrics.dropoutRate).toBeLessThan(1);
    });

    test('메트릭스 데이터 구조 검증', async () => {
      const metrics = await analyticsEngine.collectBasicMetrics('test-novel', 10);

      // 필수 필드 존재 확인
      expect(metrics).toHaveProperty('totalViews');
      expect(metrics).toHaveProperty('uniqueReaders');
      expect(metrics).toHaveProperty('completionRate');
      expect(metrics).toHaveProperty('averageReadingTime');
      expect(metrics).toHaveProperty('likes');
      expect(metrics).toHaveProperty('comments');
      expect(metrics).toHaveProperty('shares');
      expect(metrics).toHaveProperty('dropoutRate');
      expect(metrics).toHaveProperty('returnReaders');
      expect(metrics).toHaveProperty('newReaders');
    });
  });

  describe('참여도 분석', () => {
    test('높은 참여도 시나리오', () => {
      const mockMetrics = {
        completionRate: 0.9,
        averageReadingTime: 180, // 3분 (최적)
        likes: 100,
        comments: 50,
        shares: 20,
        uniqueReaders: 1000,
        returnReaders: 800,
        newReaders: 200
      };

      const engagement = analyticsEngine.analyzeEngagement(mockMetrics);

      expect(engagement.score).toBeGreaterThan(0.7);
      expect(engagement.level).toBe('excellent');
      expect(engagement.strongPoints).toContain('높은 완독률');
      expect(engagement.recommendations).toHaveLength(0); // 문제없으면 추천사항 없음
    });

    test('낮은 참여도 시나리오', () => {
      const mockMetrics = {
        completionRate: 0.3, // 낮은 완독률
        averageReadingTime: 45, // 너무 빠른 읽기 (스킵)
        likes: 10,
        comments: 2,
        shares: 0,
        uniqueReaders: 500,
        returnReaders: 100,
        newReaders: 400
      };

      const engagement = analyticsEngine.analyzeEngagement(mockMetrics);

      expect(engagement.score).toBeLessThan(0.5);
      expect(engagement.level).toBe('poor');
      expect(engagement.weakPoints).toContain('낮은 완독률');
      expect(engagement.recommendations.length).toBeGreaterThan(0);
    });

    test('읽기 시간 정규화', () => {
      // 최적 읽기 시간 (180초)
      expect(analyticsEngine.normalizeReadingTime(180)).toBeCloseTo(1);
      
      // 너무 빠른 읽기 (30초)
      expect(analyticsEngine.normalizeReadingTime(30)).toBeLessThan(0.5);
      
      // 너무 느린 읽기 (600초)
      expect(analyticsEngine.normalizeReadingTime(600)).toBeLessThan(0.5);
    });

    test('상호작용률 정규화', () => {
      const highInteraction = {
        likes: 200,
        comments: 100,
        shares: 50,
        uniqueReaders: 1000
      };

      const normalizedHigh = analyticsEngine.normalizeInteractionRate(highInteraction);
      expect(normalizedHigh).toBeGreaterThan(0.8);

      const lowInteraction = {
        likes: 5,
        comments: 1,
        shares: 0,
        uniqueReaders: 1000
      };

      const normalizedLow = analyticsEngine.normalizeInteractionRate(lowInteraction);
      expect(normalizedLow).toBeLessThan(0.1);
    });
  });

  describe('감정 반응 분석', () => {
    test('감정 데이터 생성 및 분석', () => {
      const emotionAnalysis = analyticsEngine.analyzeEmotionResponse('test-novel', 7);

      expect(emotionAnalysis.dominantEmotion).toBeDefined();
      expect(emotionAnalysis.emotionDistribution).toBeDefined();
      expect(emotionAnalysis.variety).toBeGreaterThanOrEqual(0);
      expect(emotionAnalysis.variety).toBeLessThanOrEqual(1);
      expect(emotionAnalysis.intensity).toBeGreaterThanOrEqual(0);
      expect(emotionAnalysis.intensity).toBeLessThanOrEqual(1);
    });

    test('감정 다양성 계산', () => {
      // 높은 다양성 (고르게 분포)
      const diverseEmotions = {
        distribution: {
          excitement: 0.2,
          romance: 0.2,
          tension: 0.2,
          sadness: 0.2,
          anger: 0.1,
          curiosity: 0.1
        }
      };

      const highVariety = analyticsEngine.calculateEmotionVariety(diverseEmotions);
      expect(highVariety).toBeGreaterThan(0.8);

      // 낮은 다양성 (한 감정 집중)
      const focusedEmotions = {
        distribution: {
          excitement: 0.8,
          romance: 0.1,
          tension: 0.05,
          sadness: 0.03,
          anger: 0.01,
          curiosity: 0.01
        }
      };

      const lowVariety = analyticsEngine.calculateEmotionVariety(focusedEmotions);
      expect(lowVariety).toBeLessThan(0.5);
    });

    test('감정 강도 계산', () => {
      const strongEmotion = {
        distribution: {
          excitement: 0.7, // 강한 주도 감정
          romance: 0.2,
          tension: 0.1
        }
      };

      const intensity = analyticsEngine.calculateEmotionIntensity(strongEmotion);
      expect(intensity).toBeCloseTo(0.7);
    });

    test('감정 정체 체크', () => {
      // 5화 연속 같은 감정으로 설정
      analyticsEngine.emotionHistory = [
        { dominant: 'romance' },
        { dominant: 'romance' },
        { dominant: 'romance' },
        { dominant: 'excitement' }, // 약간 다름
        { dominant: 'romance' }
      ];

      const stagnationCheck = analyticsEngine.checkEmotionStagnation('test-novel', 15);

      expect(stagnationCheck.isStagnant).toBe(true);
      expect(stagnationCheck.duration).toBe(5);
      expect(stagnationCheck.pattern).toHaveLength(5);
    });
  });

  describe('이탈 패턴 분석', () => {
    test('심각한 이탈률 분석', () => {
      const highDropoutMetrics = {
        dropoutRate: 0.45, // 45% 이탈
        dropoutPoints: [
          { position: '10%', rate: 0.1 },
          { position: '30%', rate: 0.15 },
          { position: '60%', rate: 0.2 } // critical point
        ]
      };

      const dropoutAnalysis = analyticsEngine.analyzeDropoutPatterns(highDropoutMetrics);

      expect(dropoutAnalysis.rate).toBe(0.45);
      expect(dropoutAnalysis.severity).toBe('critical');
      expect(dropoutAnalysis.criticalPoints.length).toBeGreaterThan(0);
      expect(dropoutAnalysis.interventions.length).toBeGreaterThan(0);
    });

    test('이탈 심각도 평가', () => {
      expect(analyticsEngine.assessDropoutSeverity(0.5)).toBe('critical');
      expect(analyticsEngine.assessDropoutSeverity(0.3)).toBe('high');
      expect(analyticsEngine.assessDropoutSeverity(0.2)).toBe('moderate');
      expect(analyticsEngine.assessDropoutSeverity(0.1)).toBe('low');
    });

    test('중요 이탈 지점 식별', () => {
      const dropoutPoints = [
        { position: '10%', rate: 0.05 }, // 낮음
        { position: '30%', rate: 0.15 }, // 높음 - 중요
        { position: '60%', rate: 0.08 }, // 낮음
        { position: '80%', rate: 0.12 }  // 높음 - 중요
      ];

      const criticalPoints = analyticsEngine.identifyCriticalDropoutPoints(dropoutPoints);

      expect(criticalPoints).toHaveLength(2);
      expect(criticalPoints[0].rate).toBe(0.15);
      expect(criticalPoints[1].rate).toBe(0.12);
    });
  });

  describe('전체 건강도 계산', () => {
    test('우수한 건강도 시나리오', () => {
      const excellentAnalysis = {
        basicMetrics: { uniqueReaders: 1200 },
        engagementAnalysis: { score: 0.9 },
        emotionAnalysis: { variety: 0.8, intensity: 0.7 },
        dropoutAnalysis: { rate: 0.1 }
      };

      const health = analyticsEngine.calculateOverallHealth(excellentAnalysis);

      expect(health.score).toBeGreaterThan(0.8);
      expect(health.grade).toMatch(/A/);
      expect(health.status).toBe('healthy');
      expect(health.criticalIssues).toHaveLength(0);
    });

    test('문제있는 건강도 시나리오', () => {
      const poorAnalysis = {
        basicMetrics: { uniqueReaders: 200 },
        engagementAnalysis: { score: 0.3 },
        emotionAnalysis: { variety: 0.4, intensity: 0.3 },
        dropoutAnalysis: { rate: 0.5 }
      };

      const health = analyticsEngine.calculateOverallHealth(poorAnalysis);

      expect(health.score).toBeLessThan(0.5);
      expect(health.grade).toMatch(/[CD]/);
      expect(health.status).toBe('critical');
    });

    test('건강도 등급 매핑', () => {
      expect(analyticsEngine.getHealthGrade(0.95)).toBe('A+');
      expect(analyticsEngine.getHealthGrade(0.85)).toBe('A');
      expect(analyticsEngine.getHealthGrade(0.75)).toBe('B');
      expect(analyticsEngine.getHealthGrade(0.65)).toBe('C');
      expect(analyticsEngine.getHealthGrade(0.55)).toBe('D');
      expect(analyticsEngine.getHealthGrade(0.45)).toBe('F');
    });
  });

  describe('창의성 모드 추천', () => {
    test('창의성 모드 필요 상황 감지', () => {
      const criticalAnalysis = {
        basicMetrics: { uniqueReaders: 500 },
        engagementAnalysis: { score: 0.3, trend: 'declining' },
        emotionAnalysis: { 
          variety: 0.4, 
          intensity: 0.3,
          stagnation: { isStagnant: true, duration: 5 }
        },
        dropoutAnalysis: { rate: 0.35 }
      };

      const recommendation = analyticsEngine.generateCreativityRecommendation(criticalAnalysis);

      expect(recommendation.shouldActivate).toBe(true);
      expect(recommendation.score).toBeGreaterThan(0.3);
      expect(recommendation.urgency).toBe('high');
      expect(recommendation.reasons.length).toBeGreaterThan(1);
      expect(recommendation.suggestions.length).toBeGreaterThan(0);
    });

    test('창의성 모드 불필요 상황', () => {
      const healthyAnalysis = {
        basicMetrics: { uniqueReaders: 1000 },
        engagementAnalysis: { score: 0.8, trend: 'stable' },
        emotionAnalysis: { 
          variety: 0.7, 
          intensity: 0.6,
          stagnation: { isStagnant: false, duration: 0 }
        },
        dropoutAnalysis: { rate: 0.1 }
      };

      const recommendation = analyticsEngine.generateCreativityRecommendation(healthyAnalysis);

      expect(recommendation.shouldActivate).toBe(false);
      expect(recommendation.score).toBeLessThan(0.3);
      expect(recommendation.urgency).toBe('low');
    });

    test('구체적 제안 생성', () => {
      const problematicAnalysis = {
        basicMetrics: { uniqueReaders: 400 },
        engagementAnalysis: { score: 0.25 },
        emotionAnalysis: { stagnation: { isStagnant: true, duration: 6 } },
        dropoutAnalysis: { rate: 0.4 }
      };

      const suggestions = analyticsEngine.generateSpecificSuggestions(problematicAnalysis, 0.7);

      expect(suggestions.length).toBeGreaterThan(2);
      expect(suggestions.some(s => s.type === 'content')).toBe(true);
      expect(suggestions.some(s => s.type === 'emotion')).toBe(true);
      expect(suggestions.some(s => s.type === 'retention')).toBe(true);
      expect(suggestions.some(s => s.priority === 'critical')).toBe(true);
    });
  });

  describe('트렌드 분석', () => {
    test('참여도 트렌드 계산', () => {
      // 상승 트렌드
      const improvingMetrics = [
        { engagementScore: 0.8 }, // 최근
        { engagementScore: 0.7 },
        { engagementScore: 0.6 }, // 과거
        { engagementScore: 0.5 },
        { engagementScore: 0.4 }
      ];

      const improvingTrend = analyticsEngine.calculateEngagementTrend(improvingMetrics);
      expect(improvingTrend).toBe('improving');

      // 하락 트렌드
      const decliningMetrics = [
        { engagementScore: 0.4 }, // 최근
        { engagementScore: 0.5 },
        { engagementScore: 0.6 }, // 과거
        { engagementScore: 0.7 },
        { engagementScore: 0.8 }
      ];

      const decliningTrend = analyticsEngine.calculateEngagementTrend(decliningMetrics);
      expect(decliningTrend).toBe('declining');

      // 안정적 트렌드
      const stableMetrics = [
        { engagementScore: 0.6 },
        { engagementScore: 0.61 },
        { engagementScore: 0.59 },
        { engagementScore: 0.6 },
        { engagementScore: 0.62 }
      ];

      const stableTrend = analyticsEngine.calculateEngagementTrend(stableMetrics);
      expect(stableTrend).toBe('stable');
    });

    test('트렌드 분석 데이터 부족', () => {
      const insufficientData = [
        { engagementScore: 0.7 },
        { engagementScore: 0.6 }
      ];

      const trend = analyticsEngine.calculateEngagementTrend(insufficientData);
      expect(trend).toBe('insufficient_data');
    });
  });

  describe('통합 분석', () => {
    test('전체 메트릭스 분석 파이프라인', async () => {
      const comprehensiveMetrics = await analyticsEngine.analyzeReaderMetrics('test-novel', 10);

      // 모든 주요 분석 구성요소 확인
      expect(comprehensiveMetrics).toHaveProperty('totalViews');
      expect(comprehensiveMetrics).toHaveProperty('engagement');
      expect(comprehensiveMetrics).toHaveProperty('emotion');
      expect(comprehensiveMetrics).toHaveProperty('dropout');
      expect(comprehensiveMetrics).toHaveProperty('trends');
      expect(comprehensiveMetrics).toHaveProperty('overallHealth');
      expect(comprehensiveMetrics).toHaveProperty('creativityRecommendation');

      // 각 구성요소의 하위 속성 확인
      expect(comprehensiveMetrics.engagement).toHaveProperty('score');
      expect(comprehensiveMetrics.emotion).toHaveProperty('variety');
      expect(comprehensiveMetrics.dropout).toHaveProperty('severity');
      expect(comprehensiveMetrics.overallHealth).toHaveProperty('grade');
      expect(comprehensiveMetrics.creativityRecommendation).toHaveProperty('shouldActivate');
    });

    test('캐시 시스템 동작', async () => {
      const novelSlug = 'cache-test-novel';

      // 첫 번째 호출
      const firstResult = await analyticsEngine.analyzeTrends(novelSlug);
      expect(firstResult).toBeDefined();

      // 캐시에서 가져오는지 확인 (동일한 결과)
      const secondResult = await analyticsEngine.analyzeTrends(novelSlug);
      expect(secondResult).toEqual(firstResult);

      // 캐시 엔트리 확인
      expect(analyticsEngine.trendCache.has(`trends_${novelSlug}`)).toBe(true);
    });
  });

  describe('에러 처리 및 방어적 프로그래밍', () => {
    test('null/undefined 입력 처리', () => {
      expect(() => {
        analyticsEngine.analyzeEngagement(null);
      }).not.toThrow();

      expect(() => {
        analyticsEngine.analyzeEmotionResponse(null, null);
      }).not.toThrow();

      expect(() => {
        analyticsEngine.analyzeDropoutPatterns(null);
      }).not.toThrow();
    });

    test('빈 배열 입력 처리', () => {
      const emptyTrend = analyticsEngine.calculateEngagementTrend([]);
      expect(emptyTrend).toBe('insufficient_data');

      const emptyStagnation = analyticsEngine.checkEmotionStagnation('test', 1);
      expect(emptyStagnation.isStagnant).toBe(false);
    });

    test('경계값 처리', () => {
      // 0% 완독률
      const zeroCompletion = analyticsEngine.analyzeEngagement({ 
        completionRate: 0,
        averageReadingTime: 60,
        likes: 0,
        comments: 0,
        shares: 0,
        uniqueReaders: 100,
        returnReaders: 0,
        newReaders: 100
      });

      expect(zeroCompletion.score).toBeGreaterThanOrEqual(0);
      expect(zeroCompletion.level).toBeDefined();

      // 100% 완독률
      const perfectCompletion = analyticsEngine.analyzeEngagement({ 
        completionRate: 1.0,
        averageReadingTime: 180,
        likes: 1000,
        comments: 500,
        shares: 200,
        uniqueReaders: 1000,
        returnReaders: 1000,
        newReaders: 0
      });

      expect(perfectCompletion.score).toBeLessThanOrEqual(1);
      expect(perfectCompletion.level).toBe('excellent');
    });
  });
});