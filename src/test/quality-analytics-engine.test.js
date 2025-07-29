/**
 * 품질 분석 엔진 통합 테스트
 * v3.1 통합 아키텍처 - 7개 엔진 통합 검증
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { QualityAnalyticsEngine } from '../lib/quality-analytics-engine.js';

describe('QualityAnalyticsEngine - 통합 테스트', () => {
  let qualityEngine;

  beforeEach(() => {
    qualityEngine = new QualityAnalyticsEngine();
  });

  describe('품질 평가 시스템', () => {
    test('6차원 품질 평가 수행', () => {
      const content = `
        **카이런**은 도서관에서 **에이라**를 처음 보았다.

        > "안녕하세요. 혹시 고대 마법에 관한 책을 찾고 계신가요?"

        > *'왜 내 마음이 이렇게 뛰는 걸까... 처음 보는 사람인데.'*

        > [카이런이 조심스럽게 다가간다]

        **에이라**는 놀란 듯 고개를 들었다.
      `;

      const quality = qualityEngine.evaluateQuality(content, {
        novel: 'test-novel',
        chapter: 1,
        emotionalStage: 'introduction'
      });

      expect(quality.overall).toBeGreaterThan(0);
      expect(quality.dimensions).toHaveProperty('emotional');
      expect(quality.dimensions).toHaveProperty('technical');
      expect(quality.dimensions).toHaveProperty('engagement');
      expect(quality.dimensions).toHaveProperty('pacing');
      expect(quality.dimensions).toHaveProperty('character');
      expect(quality.dimensions).toHaveProperty('narrative');
    });

    test('마크다운 형식 검증', () => {
      const validContent = `
        > "정확한 대화 형식"
        > *'내적 독백 형식'*
        > [액션 서술]
        **강조 텍스트**
      `;

      const invalidContent = `
        > '잘못된 대화 형식
        > "내적독백 형식 오류"
        > (액션 형식 오류)
      `;

      const validQuality = qualityEngine.evaluateQuality(validContent, {});
      const invalidQuality = qualityEngine.evaluateQuality(invalidContent, {});

      expect(validQuality.dimensions.technical).toBeGreaterThan(invalidQuality.dimensions.technical);
    });
  });

  describe('독자 분석 시스템', () => {
    test('독자 메트릭스 추적', () => {
      const novelState = {
        slug: 'test-novel',
        chapters: [
          { readingTime: 300, completionRate: 0.95 },
          { readingTime: 280, completionRate: 0.88 },
          { readingTime: 320, completionRate: 0.92 }
        ]
      };

      const metrics = qualityEngine.analyzeReaderMetrics(novelState);

      expect(metrics.averageReadingTime).toBeCloseTo(300);
      expect(metrics.averageCompletionRate).toBeCloseTo(0.916, 2);
      expect(metrics.dropoutRate).toBeLessThan(0.2);
      expect(metrics.engagement.score).toBeGreaterThan(0);
    });

    test('이탈 지점 분석', () => {
      const chapterData = [
        { position: 0.1, completions: 100 },
        { position: 0.3, completions: 85 },
        { position: 0.6, completions: 70 },
        { position: 0.9, completions: 68 }
      ];

      const analysis = qualityEngine.analyzeDropoutPoints(chapterData);

      expect(analysis.criticalPoints).toBeDefined();
      expect(analysis.overallDropoutRate).toBeCloseTo(0.32);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('완결 기준 시스템', () => {
    test('스토리 완결 조건 검사', () => {
      const completeNovel = {
        currentChapter: 55,
        plotProgress: ['시작', '발전', '절정', '해결'],
        relationshipStage: 'union',
        openThreads: [],
        characters: [
          { name: '주인공', growthArc: 90 },
          { name: '남주', growthArc: 85 }
        ]
      };

      const incompleteNovel = {
        currentChapter: 30,
        plotProgress: ['시작', '발전'],
        relationshipStage: 'attraction',
        openThreads: ['마법 수련', '과거의 비밀'],
        characters: [
          { name: '주인공', growthArc: 60 },
          { name: '남주', growthArc: 50 }
        ]
      };

      expect(qualityEngine.checkStoryCompletion(completeNovel)).toBe(true);
      expect(qualityEngine.checkStoryCompletion(incompleteNovel)).toBe(false);
    });

    test('완결 보고서 생성', () => {
      const novel = {
        currentChapter: 50,
        plotProgress: ['시작', '발전', '절정'],
        relationshipStage: 'confession',
        openThreads: ['마법의 근원'],
        characters: [
          { name: '주인공', growthArc: 85 },
          { name: '남주', growthArc: 80 }
        ]
      };

      const report = qualityEngine.generateCompletionReport(novel);

      expect(report.overallReadiness).toBeDefined();
      expect(report.criteria).toHaveProperty('minChapters');
      expect(report.criteria).toHaveProperty('plotCompletion');
      expect(report.criteria).toHaveProperty('relationshipResolution');
      expect(report.recommendation).toBeDefined();
    });
  });

  describe('창의성 모드 시스템', () => {
    test('창의성 모드 활성화 결정', () => {
      const criticalScenario = {
        novelState: { slug: 'test', recentChapters: [] },
        readerMetrics: { dropoutRate: 0.3, engagement: { score: 0.2 } },
        chapterContext: { chapterNumber: 1, progressPercentage: 2, plotStage: 'introduction' }
      };

      const routine = qualityEngine.shouldActivateCreativityMode(
        criticalScenario.novelState,
        criticalScenario.readerMetrics,
        criticalScenario.chapterContext
      );

      expect(routine.activate).toBe(true);
      expect(routine.triggers.length).toBeGreaterThan(0);
      expect(routine.score).toBeGreaterThan(0.5);
    });

    test('창의적 프롬프트 생성', () => {
      const context = {
        novel: { slug: 'test' },
        chapter: 1,
        emotionalStage: 'attraction'
      };

      const triggers = [{
        type: 'milestone',
        reason: '첫 만남 - 강렬한 첫인상 필요'
      }];

      const prompt = qualityEngine.generateCreativePrompt(context, triggers);

      expect(prompt.mode).toBe('CREATIVITY_BOOST');
      expect(prompt.tokenLimit).toBe('UNLIMITED');
      expect(prompt.qualityTarget).toBe('MASTERPIECE');
      expect(prompt.directive).toBeDefined();
    });
  });

  describe('토큰 밸런싱 시스템', () => {
    test('토큰 예산 계산', () => {
      const budget = qualityEngine.calculateTokenBudget('efficiency', {
        chapterLength: 2000,
        complexity: 0.6,
        qualityTarget: 0.8
      });

      expect(budget.total).toBeGreaterThan(0);
      expect(budget.breakdown).toHaveProperty('base');
      expect(budget.breakdown).toHaveProperty('quality');
      expect(budget.breakdown).toHaveProperty('complexity');
      expect(budget.mode).toBe('efficiency');
    });

    test('비용 최적화 전략', () => {
      const usage = {
        tokensUsed: 15000,
        mode: 'creativity',
        qualityScore: 0.85,
        readerEngagement: 0.7
      };

      const optimization = qualityEngine.optimizeCosts(usage);

      expect(optimization.efficiency).toBeGreaterThan(0);
      expect(optimization.recommendation).toBeDefined();
      expect(optimization.nextMode).toBeDefined();
    });
  });

  describe('감정 깊이 시스템', () => {
    test('내적 갈등 생성', () => {
      const conflict = qualityEngine.generateInternalConflict('자존심과 사랑', '에이라');
      
      expect(typeof conflict).toBe('string');
      expect(conflict.length).toBeGreaterThan(20);
      expect(conflict).toContain('에이라');
    });

    test('감각적 묘사 생성', () => {
      const description = qualityEngine.generateSensoryDescription('설렘', '도서관');
      
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(20);
    });

    test('미세 표현 생성', () => {
      const expression = qualityEngine.generateMicroExpression('nervousness', '카이런');
      
      expect(typeof expression).toBe('string');
      expect(expression.length).toBeGreaterThan(10);
    });
  });

  describe('스토리 페이싱 시스템', () => {
    test('서사 리듬 분석', () => {
      const chapters = [
        { emotionalIntensity: 0.3, plotAdvancement: 0.2, pacing: 'slow' },
        { emotionalIntensity: 0.7, plotAdvancement: 0.5, pacing: 'medium' },
        { emotionalIntensity: 0.9, plotAdvancement: 0.8, pacing: 'fast' }
      ];

      const rhythm = qualityEngine.analyzeNarrativeRhythm(chapters);

      expect(rhythm.overallPacing).toBeDefined();
      expect(rhythm.climaxBuildup).toBeDefined();
      expect(rhythm.emotionalArcs).toBeDefined();
      expect(rhythm.recommendations.length).toBeGreaterThan(0);
    });

    test('다음 챕터 페이싱 권장', () => {
      const currentState = {
        recentIntensity: [0.6, 0.7, 0.8],
        plotStage: 'climax',
        readerFatigue: 0.3
      };

      const recommendation = qualityEngine.recommendNextPacing(currentState);

      expect(recommendation.suggestedPacing).toBeDefined();
      expect(recommendation.intensityTarget).toBeDefined();
      expect(recommendation.techniques.length).toBeGreaterThan(0);
    });
  });

  describe('통합 품질 리포트', () => {
    test('종합 성능 리포트 생성', () => {
      // 테스트 데이터 설정
      qualityEngine.performanceHistory = [
        { novelSlug: 'test-1', qualityScore: 0.8, readerMetrics: { engagement: 0.7 } },
        { novelSlug: 'test-2', qualityScore: 0.85, readerMetrics: { engagement: 0.75 } }
      ];

      const report = qualityEngine.generatePerformanceReport();

      expect(report.totalNovels).toBe(2);
      expect(report.averageQuality).toBeCloseTo(0.825);
      expect(report.averageEngagement).toBeCloseTo(0.725);
      expect(report.topPerformers).toBeDefined();
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('에러 처리 및 방어 코드', () => {
    test('잘못된 입력값 처리', () => {
      expect(() => {
        qualityEngine.evaluateQuality(null, {});
      }).not.toThrow();

      expect(() => {
        qualityEngine.analyzeReaderMetrics(null);
      }).not.toThrow();

      expect(() => {
        qualityEngine.checkStoryCompletion({});
      }).not.toThrow();
    });

    test('빈 데이터 기본값 처리', () => {
      const emptyQuality = qualityEngine.evaluateQuality('', {});
      const emptyMetrics = qualityEngine.analyzeReaderMetrics({ slug: 'empty', chapters: [] });

      expect(emptyQuality).toBeDefined();
      expect(emptyQuality.overall).toBeDefined();
      expect(emptyMetrics).toBeDefined();
      expect(emptyMetrics.engagement).toBeDefined();
    });
  });
});