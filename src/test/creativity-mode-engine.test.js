/**
 * 창의성 모드 엔진 테스트
 * v2.1 창의성 우선 모드 시스템 검증
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { CreativityModeEngine } from '../lib/creativity-mode-engine.js';

describe('CreativityModeEngine', () => {
  let creativityEngine;
  
  beforeEach(() => {
    creativityEngine = new CreativityModeEngine();
  });

  describe('창의성 모드 활성화 결정', () => {
    test('스토리 마일스톤에서 창의성 모드 활성화', () => {
      const novelState = { slug: 'test-novel', recentChapters: [] };
      const readerMetrics = { dropoutRate: 0.1, engagement: { score: 0.6 } };
      const chapterContext = {
        chapterNumber: 2,
        progressPercentage: 5,
        plotStage: 'introduction'
      };

      const result = creativityEngine.shouldActivateCreativityMode(
        novelState,
        readerMetrics,
        chapterContext
      );

      expect(result.activate).toBe(true);
      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].type).toBe('milestone');
      expect(result.triggers[0].reason).toContain('첫 만남');
    });

    test('독자 이탈률 높을 때 창의성 모드 활성화', () => {
      const novelState = { slug: 'test-novel', recentChapters: [] };
      const readerMetrics = { 
        dropoutRate: 0.25, // 25% 이탈률 (임계값 20% 초과)
        engagement: { score: 0.3 },
        engagementDrop: 0.4
      };
      const chapterContext = {
        chapterNumber: 10,
        progressPercentage: 30,
        plotStage: 'development'
      };

      const result = creativityEngine.shouldActivateCreativityMode(
        novelState,
        readerMetrics,
        chapterContext
      );

      expect(result.activate).toBe(true);
      expect(result.triggers.some(t => t.type === 'metrics')).toBe(true);
      expect(result.score).toBeGreaterThan(0.7);
    });

    test('감정 정체 상황에서 창의성 모드 활성화', () => {
      // 5화 연속 같은 감정 패턴
      const recentChapters = Array(5).fill({
        emotionalTone: 'neutral',
        plotType: 'development',
        characterFocus: 'both'
      });

      const novelState = { slug: 'test-novel', recentChapters };
      const readerMetrics = { dropoutRate: 0.15, engagement: { score: 0.5 } };
      const chapterContext = {
        chapterNumber: 20,
        progressPercentage: 40,
        plotStage: 'development'
      };

      const result = creativityEngine.shouldActivateCreativityMode(
        novelState,
        readerMetrics,
        chapterContext
      );

      expect(result.activate).toBe(true);
      expect(result.triggers.some(t => t.type === 'pattern')).toBe(true);
    });

    test('쿨다운 중일 때 창의성 모드 비활성화', () => {
      // 최근 창의성 모드 사용 기록 추가
      creativityEngine.recordModeActivation('test-novel', [
        { type: 'milestone', reason: 'test' }
      ]);

      const novelState = { slug: 'test-novel', recentChapters: [] };
      const readerMetrics = { dropoutRate: 0.3, engagement: { score: 0.2 } };
      const chapterContext = {
        chapterNumber: 2,
        progressPercentage: 5,
        plotStage: 'introduction'
      };

      const result = creativityEngine.shouldActivateCreativityMode(
        novelState,
        readerMetrics,
        chapterContext
      );

      expect(result.activate).toBe(false);
    });
  });

  describe('창의적 프롬프트 생성', () => {
    test('마일스톤 트리거에 대한 창의적 프롬프트 생성', () => {
      const context = {
        novel: { slug: 'test-novel' },
        chapter: 1,
        emotionalStage: 'attraction'
      };
      
      const triggers = [{
        type: 'milestone',
        reason: '첫 만남 - 강렬한 첫인상 필요'
      }];

      const prompt = creativityEngine.generateCreativePrompt(context, triggers);

      expect(prompt.mode).toBe('CREATIVITY_BOOST');
      expect(prompt.tokenLimit).toBe('UNLIMITED');
      expect(prompt.qualityTarget).toBe('MASTERPIECE');
      expect(prompt.directive).toContain('핵심 장면 창작');
      expect(prompt.emphasis).toContain('감정적 깊이');
      expect(prompt.techniques.length).toBeGreaterThan(0);
    });

    test('독자 이탈 방지를 위한 특별 지시 생성', () => {
      const context = {
        novel: { slug: 'test-novel' },
        chapter: 10,
        emotionalStage: 'conflict'
      };
      
      const triggers = [{
        type: 'metrics',
        reason: '독자 이탈률 25% - 긴급 개선 필요'
      }];

      const prompt = creativityEngine.generateCreativePrompt(context, triggers);

      expect(prompt.directive).toContain('독자 이탈 방지');
      expect(prompt.directive).toContain('클리프행어');
      expect(prompt.emphasis).toContain('기억에 남는 장면');
    });
  });

  describe('ROI 추적 및 학습', () => {
    test('창의성 투자 ROI 계산', () => {
      const investment = {
        tokens: 8000,
        mode: 'creativity',
        triggers: [{ type: 'milestone', reason: 'test' }],
        baseline: 0.5,
        baselineRating: 3.5
      };

      const outcome = {
        engagement: 0.8,
        rating: 4.2,
        shares: 50,
        comments: 30
      };

      const roi = creativityEngine.trackROI('test-novel', investment, outcome);

      expect(roi.score).toBeGreaterThan(1); // 100% 이상의 ROI
      expect(roi.novelSlug).toBe('test-novel');
      expect(roi.investment.tokens).toBe(8000);
      expect(roi.outcome.readerEngagement).toBe(0.8);
    });

    test('성공 패턴 학습', () => {
      // 여러 성공적인 창의성 투자 시뮬레이션
      for (let i = 0; i < 3; i++) {
        const investment = {
          tokens: 7000,
          mode: 'creativity',
          triggers: [{ type: 'milestone', reason: 'first_meeting' }]
        };

        const outcome = {
          engagement: 0.9,
          rating: 4.5,
          shares: 80,
          comments: 50
        };

        creativityEngine.trackROI('test-novel', investment, outcome);
      }

      const pattern = 'milestone_first_meeting';
      expect(creativityEngine.roiTracker.successPatterns.get(pattern)).toBe(3);
      expect(creativityEngine.roiTracker.averageROI).toBeGreaterThan(1.5);
    });
  });

  describe('성과 리포트 생성', () => {
    beforeEach(() => {
      // 테스트 데이터 설정
      creativityEngine.modeHistory = [
        {
          novelSlug: 'test-novel-1',
          timestamp: new Date(),
          mode: 'creativity',
          triggers: [{ type: 'milestone' }]
        },
        {
          novelSlug: 'test-novel-2',
          timestamp: new Date(),
          mode: 'creativity',
          triggers: [{ type: 'metrics' }]
        }
      ];

      creativityEngine.roiTracker.investments = [
        { score: 1.8, novelSlug: 'test-novel-1' },
        { score: 2.1, novelSlug: 'test-novel-2' }
      ];

      creativityEngine.roiTracker.successPatterns.set('milestone', 2);
      creativityEngine.roiTracker.successPatterns.set('metrics', 1);
    });

    test('성과 리포트 생성', () => {
      const report = creativityEngine.generatePerformanceReport();

      expect(report.totalActivations).toBe(2);
      expect(report.averageROI).toBeCloseTo(1.95); // (1.8 + 2.1) / 2
      expect(report.topSuccessPatterns).toHaveLength(2);
      expect(report.topSuccessPatterns[0][0]).toBe('milestone'); // 가장 성공적인 패턴
      expect(report.tokenSavings).toBeDefined();
      expect(report.qualityImprovements).toBe(2); // ROI > 1.5인 투자 수
    });

    test('토큰 절약량 계산', () => {
      creativityEngine.modeHistory = [
        { mode: 'creativity' },
        { mode: 'efficiency' },
        { mode: 'efficiency' }
      ];

      const savings = creativityEngine.calculateTokenSavings();

      expect(savings.totalSaved).toBeGreaterThan(0);
      expect(savings.percentageSaved).toBeGreaterThan(0);
      expect(savings.percentageSaved).toBeLessThan(100);
    });
  });

  describe('최적 모드 추천', () => {
    test('높은 창의성 필요도일 때 창의성 모드 추천', () => {
      const context = {
        novelState: { slug: 'test-novel', recentChapters: [] },
        readerMetrics: { 
          dropoutRate: 0.3,
          engagement: { score: 0.2 }
        },
        chapterContext: {
          chapterNumber: 1,
          progressPercentage: 2,
          plotStage: 'introduction'
        }
      };

      const recommendation = creativityEngine.recommendMode(context);

      expect(recommendation.mode).toBe('creativity');
      expect(recommendation.confidence).toBeGreaterThan(0.7);
      expect(recommendation.prompt).toBeDefined();
      expect(recommendation.prompt.mode).toBe('CREATIVITY_BOOST');
    });

    test('중간 수준 필요도일 때 균형 모드 추천', () => {
      const context = {
        novelState: { slug: 'test-novel', recentChapters: [] },
        readerMetrics: { 
          dropoutRate: 0.15,
          engagement: { score: 0.5 }
        },
        chapterContext: {
          chapterNumber: 10,
          progressPercentage: 25,
          plotStage: 'development'
        }
      };

      // 창의성 점수를 중간 범위로 설정
      vi.spyOn(creativityEngine, 'shouldActivateCreativityMode').mockReturnValue({
        activate: false,
        score: 0.5, // 0.4 ~ 0.7 범위
        triggers: []
      });

      const recommendation = creativityEngine.recommendMode(context);

      expect(recommendation.mode).toBe('balanced');
      expect(recommendation.confidence).toBeCloseTo(0.5);
      expect(recommendation.tokenStrategy).toBeDefined();
    });

    test('낮은 필요도일 때 효율 모드 추천', () => {
      const context = {
        novelState: { slug: 'test-novel', recentChapters: [] },
        readerMetrics: { 
          dropoutRate: 0.1,
          engagement: { score: 0.8 }
        },
        chapterContext: {
          chapterNumber: 15,
          progressPercentage: 35,
          plotStage: 'development'
        }
      };

      // 창의성 점수를 낮게 설정
      vi.spyOn(creativityEngine, 'shouldActivateCreativityMode').mockReturnValue({
        activate: false,
        score: 0.2,
        triggers: []
      });

      const recommendation = creativityEngine.recommendMode(context);

      expect(recommendation.mode).toBe('efficiency');
      expect(recommendation.confidence).toBeCloseTo(0.8); // 1 - 0.2
      expect(recommendation.tokenStrategy).toBeDefined();
    });
  });

  describe('유틸리티 메서드', () => {
    test('패턴 유사도 계산', () => {
      const patterns = [
        { emotionalTone: 'romance', plotType: 'development', characterFocus: 'both' },
        { emotionalTone: 'romance', plotType: 'development', characterFocus: 'both' },
        { emotionalTone: 'romance', plotType: 'conflict', characterFocus: 'male' }
      ];

      const similarity = creativityEngine.calculateSimilarity(patterns);

      expect(similarity).toBeGreaterThan(0.5); // 50% 이상 유사
      expect(similarity).toBeLessThan(1.0);
    });

    test('스토리 마일스톤 체크', () => {
      // 첫 만남 체크
      const firstMeeting = creativityEngine.checkStoryMilestones({
        chapterNumber: 2,
        progressPercentage: 5,
        plotStage: 'introduction'
      });

      expect(firstMeeting.triggered).toBe(true);
      expect(firstMeeting.reason).toContain('첫 만남');

      // 클라이맥스 체크
      const climax = creativityEngine.checkStoryMilestones({
        chapterNumber: 55,
        progressPercentage: 75,
        plotStage: 'climax'
      });

      expect(climax.triggered).toBe(true);
      expect(climax.reason).toContain('클라이맥스');
    });

    test('독자 메트릭스 위험도 평가', () => {
      // 높은 이탈률
      const highDropout = creativityEngine.checkReaderMetrics({
        dropoutRate: 0.35, // 35%
        engagementDrop: 0.1,
        emotionStagnation: 3
      });

      expect(highDropout.triggered).toBe(true);
      expect(highDropout.priority).toBe('critical');
      expect(highDropout.score).toBeGreaterThan(0.8);

      // 참여도 하락
      const lowEngagement = creativityEngine.checkReaderMetrics({
        dropoutRate: 0.15,
        engagementDrop: 0.4, // 40% 하락
        emotionStagnation: 2
      });

      expect(lowEngagement.triggered).toBe(true);
      expect(lowEngagement.priority).toBe('high');
    });
  });

  describe('에러 처리', () => {
    test('잘못된 입력값에 대한 방어적 처리', () => {
      expect(() => {
        creativityEngine.shouldActivateCreativityMode(null, null, null);
      }).not.toThrow();

      expect(() => {
        creativityEngine.generateCreativePrompt(null, []);
      }).not.toThrow();
    });

    test('빈 데이터에 대한 기본값 처리', () => {
      const result = creativityEngine.shouldActivateCreativityMode(
        { slug: 'test', recentChapters: [] },
        {},
        {}
      );

      expect(result).toBeDefined();
      expect(result.activate).toBeDefined();
      expect(result.triggers).toBeDefined();
      expect(result.score).toBeDefined();
    });
  });
});