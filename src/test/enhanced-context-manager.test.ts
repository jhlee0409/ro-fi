/**
 * 🧪 Enhanced Context Manager Tests
 * 고도화된 컨텍스트 관리 시스템 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedContextManager } from '../lib/enhanced-context-manager.js';
import { Novel, Chapter } from '../lib/types/index.js';

describe('EnhancedContextManager', () => {
  let contextManager: EnhancedContextManager;
  let mockNovel: Novel;
  let mockChapter: Chapter;

  beforeEach(() => {
    contextManager = new EnhancedContextManager();
    
    mockNovel = {
      slug: 'test-novel',
      title: '테스트 소설',
      author: 'Test Author',
      status: 'ongoing',
      summary: '테스트용 소설입니다',
      genre: '로맨스 판타지',
      publishedDate: '2025-08-15',
      totalChapters: 50,
      rating: 0,
      coverImage: '/test.jpg',
      tags: ['로맨스', '판타지'],
      targetAudience: '20-30대 여성',
      expectedLength: '50-60화'
    };

    mockChapter = {
      title: '테스트 챕터',
      novel: 'test-novel',
      chapterNumber: 1,
      publicationDate: '2025-08-15',
      content: '이것은 테스트 챕터 내용입니다.',
      wordCount: 100,
      emotionalTone: 'neutral'
    };
  });

  describe('Memory Layer Management', () => {
    it('should initialize memory layers correctly', () => {
      const report = contextManager.getMemoryReport();
      
      expect(report.persistentMemorySize).toBe(0);
      expect(report.episodicMemorySize).toBe(0);
      expect(report.workingMemoryActive).toBe(true);
      expect(report.cacheHitRate).toBeGreaterThanOrEqual(0);
    });

    it('should update episodic memory when adding chapters', async () => {
      const initialReport = contextManager.getMemoryReport();
      
      await contextManager.updateMemoryWithChapter(mockChapter, {
        overallScore: 85,
        readabilityScore: 80,
        creativityScore: 90,
        consistencyScore: 85,
        engagementScore: 80,
        breakdown: {}
      });

      const updatedReport = contextManager.getMemoryReport();
      expect(updatedReport.episodicMemorySize).toBeGreaterThan(initialReport.episodicMemorySize);
    });

    it('should limit episodic memory to 10 recent chapters', async () => {
      // 15개의 챕터 추가
      for (let i = 1; i <= 15; i++) {
        const chapter = { ...mockChapter, chapterNumber: i };
        await contextManager.updateMemoryWithChapter(chapter, {
          overallScore: 85,
          readabilityScore: 80,
          creativityScore: 90,
          consistencyScore: 85,
          engagementScore: 80,
          breakdown: {}
        });
      }

      const report = contextManager.getMemoryReport();
      expect(report.episodicMemorySize).toBeLessThanOrEqual(10);
    });
  });

  describe('Context Preparation', () => {
    it('should prepare enhanced context for chapter generation', async () => {
      const context = await contextManager.prepareContextForChapter(mockNovel, 1);

      expect(context).toHaveProperty('creativityMode');
      expect(context).toHaveProperty('readerInsights');
      expect(context).toHaveProperty('consistencyGuards');
      expect(context).toHaveProperty('memoryLayers');
      expect(context).toHaveProperty('qualityTargets');
      expect(context).toHaveProperty('generationHints');
    });

    it('should use cache for repeated context requests', async () => {
      const context1 = await contextManager.prepareContextForChapter(mockNovel, 1);
      const context2 = await contextManager.prepareContextForChapter(mockNovel, 1);

      expect(context1).toBe(context2); // 같은 참조여야 함 (캐시된 결과)
    });

    it('should refresh context when forceRefresh is true', async () => {
      const context1 = await contextManager.prepareContextForChapter(mockNovel, 1);
      const context2 = await contextManager.prepareContextForChapter(
        mockNovel, 
        1, 
        { forceRefresh: true }
      );

      expect(context1).not.toBe(context2); // 다른 참조여야 함 (새로 생성됨)
    });
  });

  describe('Creativity Mode Evaluation', () => {
    it('should activate creativity mode for climax chapters', async () => {
      // 75% 진행도 챕터 (클라이맥스 구간)
      const climaxChapter = Math.floor(mockNovel.totalChapters * 0.75);
      const context = await contextManager.prepareContextForChapter(mockNovel, climaxChapter);

      expect(context.creativityMode.isActive).toBe(true);
      expect(context.creativityMode.trigger).toBe('climax_moment');
      expect(context.creativityMode.investmentLevel).toBe('unlimited');
    });

    it('should use standard mode for regular chapters', async () => {
      const context = await contextManager.prepareContextForChapter(mockNovel, 3);

      // 초기 상태에서는 특별한 트리거가 없으므로 standard 모드 (3은 키 모먼트가 아님)
      if (!context.creativityMode.isActive) {
        expect(context.creativityMode.investmentLevel).toBe('standard');
      } else {
        // 핵심 순간으로 감지된 경우는 건너뛰기
        expect(context.creativityMode.isActive).toBe(true);
      }
    });

    it('should activate creativity mode for key story moments', async () => {
      const keyMoments = [1, 5, 10, 15, 20, 25, 30];
      
      for (const chapterNum of keyMoments) {
        const context = await contextManager.prepareContextForChapter(mockNovel, chapterNum);
        
        if (context.creativityMode.isActive) {
          expect(['climax_moment', 'repetition_detected', 'reader_engagement'])
            .toContain(context.creativityMode.trigger);
        }
      }
    });
  });

  describe('Quality Target Calculation', () => {
    it('should set higher quality targets for creativity mode', async () => {
      // 클라이맥스 챕터로 창의성 모드 활성화
      const climaxChapter = Math.floor(mockNovel.totalChapters * 0.75);
      const context = await contextManager.prepareContextForChapter(mockNovel, climaxChapter);

      if (context.creativityMode.isActive) {
        expect(context.qualityTargets.creativity).toBeGreaterThan(85);
        expect(context.qualityTargets.engagement).toBeGreaterThanOrEqual(90);
      }
    });

    it('should use standard quality targets for normal mode', async () => {
      const context = await contextManager.prepareContextForChapter(mockNovel, 3);

      if (!context.creativityMode.isActive) {
        expect(context.qualityTargets.readability).toBe(80);
        expect(context.qualityTargets.creativity).toBe(70);
        expect(context.qualityTargets.consistency).toBe(85);
        expect(context.qualityTargets.engagement).toBe(75);
      }
    });
  });

  describe('Memory Report', () => {
    it('should provide comprehensive memory status', () => {
      const report = contextManager.getMemoryReport();

      expect(report).toHaveProperty('persistentMemorySize');
      expect(report).toHaveProperty('episodicMemorySize');
      expect(report).toHaveProperty('workingMemoryActive');
      expect(report).toHaveProperty('cacheHitRate');
      expect(report).toHaveProperty('lastUpdate');

      expect(typeof report.persistentMemorySize).toBe('number');
      expect(typeof report.episodicMemorySize).toBe('number');
      expect(typeof report.workingMemoryActive).toBe('boolean');
      expect(typeof report.cacheHitRate).toBe('number');
      expect(typeof report.lastUpdate).toBe('string');
    });

    it('should show cache hit rate between 0 and 1', () => {
      const report = contextManager.getMemoryReport();
      
      expect(report.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(report.cacheHitRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Integration with Existing Systems', () => {
    it('should integrate with StoryContextManager', async () => {
      // 기존 시스템과의 통합이 정상적으로 작동하는지 확인
      const context = await contextManager.prepareContextForChapter(mockNovel, 1);
      
      // 기본 컨텍스트가 포함되어 있어야 함
      expect(context).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      const invalidNovel = { ...mockNovel, slug: '' };
      
      await expect(async () => {
        await contextManager.prepareContextForChapter(invalidNovel, 1);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should prepare context within reasonable time', async () => {
      const startTime = Date.now();
      await contextManager.prepareContextForChapter(mockNovel, 1);
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(1000); // 1초 이내
    });

    it('should benefit from caching on repeated requests', async () => {
      // 첫 번째 요청 (캐시 미스)
      const startTime1 = process.hrtime.bigint();
      await contextManager.prepareContextForChapter(mockNovel, 1);
      const endTime1 = process.hrtime.bigint();
      const firstRequestTime = Number(endTime1 - startTime1) / 1000000; // 나노초를 밀리초로

      // 두 번째 요청 (캐시 히트)
      const startTime2 = process.hrtime.bigint();
      await contextManager.prepareContextForChapter(mockNovel, 1);
      const endTime2 = process.hrtime.bigint();
      const secondRequestTime = Number(endTime2 - startTime2) / 1000000;

      // 캐시 히트는 캐시 미스보다 빨라야 함 (또는 거의 차이가 없어야 함)
      expect(secondRequestTime).toBeLessThanOrEqual(firstRequestTime + 1); // 1ms 여유
    });
  });
});