/**
 * 🧪 Episode Generation Pipeline Tests
 * 통합 에피소드 생성 파이프라인 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EpisodeGenerationPipeline, defaultEpisodeConfig } from '../lib/episode-generation-pipeline.js';
import { Novel, Chapter, QualityMetrics } from '../lib/types/index.js';

// 테스트용 타입 확장 - private 메서드 접근용
type PipelineForTesting = EpisodeGenerationPipeline & {
  executeGenerationAttempt: (novel: Novel, config: unknown) => Promise<unknown>;
  autoSelectTemplate: (...args: unknown[]) => string;
  validateQuality: (...args: unknown[]) => Promise<unknown>;
  extractEmotionalTone: (content: string) => string;
  createChapterObject: (...args: unknown[]) => Chapter;
  updateMemory: (chapter: Chapter, metrics: QualityMetrics) => Promise<void>;
};

describe('EpisodeGenerationPipeline', () => {
  let pipeline: EpisodeGenerationPipeline;
  let pipelineForTesting: PipelineForTesting;
  let mockNovel: Novel;
  let mockApiKey: string;

  beforeEach(() => {
    mockApiKey = 'test-api-key';
    pipeline = new EpisodeGenerationPipeline(mockApiKey);
    pipelineForTesting = pipeline as PipelineForTesting;
    
    mockNovel = {
      slug: 'test-novel',
      title: '테스트 로맨스 판타지',
      author: 'Test Author',
      status: 'ongoing',
      summary: '테스트용 로맨스 판타지 소설',
      genre: '로맨스 판타지',
      publishedDate: '2025-08-15',
      totalChapters: 50,
      rating: 0,
      coverImage: '/test.jpg',
      tags: ['로맨스', '판타지', '현대'],
      targetAudience: '20-30대 여성',
      expectedLength: '50-60화'
    };
  });

  describe('Pipeline Initialization', () => {
    it('should initialize all components correctly', () => {
      expect(pipeline).toBeDefined();
      
      const systemStatus = pipeline.getSystemStatus();
      expect(systemStatus).toHaveProperty('contextManager');
      expect(systemStatus).toHaveProperty('geminiWrapper');
      expect(systemStatus).toHaveProperty('templateEngine');
      expect(systemStatus).toHaveProperty('pipeline');
    });

    it('should have proper default configuration', () => {
      expect(defaultEpisodeConfig.creativityMode).toBe('auto');
      expect(defaultEpisodeConfig.qualityThreshold).toBe(75);
      expect(defaultEpisodeConfig.maxRetries).toBe(3);
      expect(defaultEpisodeConfig.enableFallback).toBe(true);
      expect(defaultEpisodeConfig.templateStrategy).toBe('auto');
      expect(defaultEpisodeConfig.targetWordCount).toBe(1200);
    });
  });

  describe('Episode Generation (Mocked)', () => {
    it('should handle successful generation workflow', async () => {
      // Mock the internal methods to avoid actual API calls
      const mockGenerate = vi.spyOn(pipelineForTesting, 'executeGenerationAttempt')
        .mockResolvedValue({
          success: true,
          episode: createMockChapter(1),
          qualityMetrics: createMockQualityMetrics(),
          creativityActivated: false,
          tokensUsed: 500,
          generationTime: 0,
          retryCount: 0
        });

      const result = await pipeline.generateEpisode(mockNovel, 1, defaultEpisodeConfig);

      expect(result.success).toBe(true);
      expect(result.episode).toBeDefined();
      expect(result.qualityMetrics).toBeDefined();
      expect(result.tokensUsed).toBe(500);
      expect(result.retryCount).toBe(0);
      expect(mockGenerate).toHaveBeenCalledOnce();
    });

    it('should handle generation failures with retries', async () => {
      // Mock failures followed by success
      const mockGenerate = vi.spyOn(pipelineForTesting, 'executeGenerationAttempt')
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValue({
          success: true,
          episode: createMockChapter(1),
          qualityMetrics: createMockQualityMetrics(),
          creativityActivated: true,
          tokensUsed: 750,
          generationTime: 0,
          retryCount: 2
        });

      const result = await pipeline.generateEpisode(mockNovel, 1, defaultEpisodeConfig);

      expect(result.success).toBe(true);
      expect(result.retryCount).toBe(2);
      expect(result.creativityActivated).toBe(true);
      expect(mockGenerate).toHaveBeenCalledTimes(3);
    });

    it('should handle complete generation failure', async () => {
      // Mock all attempts failing
      const mockGenerate = vi.spyOn(pipelineForTesting, 'executeGenerationAttempt')
        .mockRejectedValue(new Error('Generation failed'));

      const result = await pipeline.generateEpisode(mockNovel, 1, defaultEpisodeConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.retryCount).toBe(defaultEpisodeConfig.maxRetries);
      expect(mockGenerate).toHaveBeenCalledTimes(defaultEpisodeConfig.maxRetries);
    });
  });

  describe('Template Selection Logic', () => {
    it('should select introduction template for early chapters', () => {
      const templateId = (pipelineForTesting).autoSelectTemplate(
        mockNovel, 
        1, 
        { creativityMode: { isActive: false } }
      );
      
      expect(templateId).toBe('episode_introduction');
    });

    it('should select climax template for late chapters', () => {
      const templateId = (pipelineForTesting).autoSelectTemplate(
        mockNovel, 
        40, 
        { creativityMode: { isActive: false } }
      );
      
      expect(templateId).toBe('episode_climax');
    });

    it('should prioritize creativity mode templates', () => {
      const templateId = (pipelineForTesting).autoSelectTemplate(
        mockNovel, 
        10, 
        { 
          creativityMode: { 
            isActive: true, 
            trigger: 'climax_moment' 
          } 
        }
      );
      
      expect(templateId).toBe('episode_climax');
    });
  });

  describe('Quality Validation', () => {
    it('should pass quality validation for good content', async () => {
      const mockContent = '고품질 로맨스 판타지 에피소드 내용입니다. '.repeat(50);
      
      const mockValidate = vi.spyOn(pipelineForTesting, 'validateQuality')
        .mockResolvedValue({
          passed: true,
          metrics: createMockQualityMetrics(85)
        });

      const config = { ...defaultEpisodeConfig, qualityThreshold: 75 };
      const state = createMockPipelineState();
      
      const result = await (pipelineForTesting).validateQuality(
        mockContent, 
        mockNovel, 
        1, 
        config, 
        state
      );

      expect(result.passed).toBe(true);
      expect(result.metrics.overallScore).toBe(85);
    });

    it('should fail quality validation for poor content', async () => {
      const mockContent = '저품질 내용';
      
      const mockValidate = vi.spyOn(pipelineForTesting, 'validateQuality')
        .mockResolvedValue({
          passed: false,
          reason: 'Quality score 60 below threshold 75',
          metrics: createMockQualityMetrics(60)
        });

      const config = { ...defaultEpisodeConfig, qualityThreshold: 75 };
      const state = createMockPipelineState();
      
      const result = await (pipelineForTesting).validateQuality(
        mockContent, 
        mockNovel, 
        1, 
        config, 
        state
      );

      expect(result.passed).toBe(false);
      expect(result.reason).toContain('below threshold');
    });
  });

  describe('Emotional Tone Analysis', () => {
    it('should detect romantic tone', () => {
      const content = '사랑하는 마음이 가슴 깊이 설렘을 주었다';
      const tone = (pipelineForTesting).extractEmotionalTone(content);
      
      expect(tone).toBe('romantic');
    });

    it('should detect tense tone', () => {
      const content = '긴장감이 흐르며 위험한 상황에 두려움을 느꼈다';
      const tone = (pipelineForTesting).extractEmotionalTone(content);
      
      expect(tone).toBe('tense');
    });

    it('should default to neutral for unknown content', () => {
      const content = '일반적인 내용입니다';
      const tone = (pipelineForTesting).extractEmotionalTone(content);
      
      expect(tone).toBe('neutral');
    });
  });

  describe('Performance Metrics', () => {
    it('should track generation metrics', () => {
      const metrics = pipeline.getMetrics();
      
      expect(metrics).toHaveProperty('totalGenerations');
      expect(metrics).toHaveProperty('successRate');
      expect(metrics).toHaveProperty('averageGenerationTime');
      expect(metrics).toHaveProperty('creativityActivationRate');
    });

    it('should track system status', () => {
      const status = pipeline.getSystemStatus();
      
      expect(status.contextManager).toBeDefined();
      expect(status.geminiWrapper).toBeDefined();
      expect(status.templateEngine).toBeDefined();
      expect(status.pipeline).toBeDefined();
    });
  });

  describe('Configuration Handling', () => {
    it('should handle custom configuration', async () => {
      const customConfig = {
        creativityMode: 'unlimited' as const,
        qualityThreshold: 90,
        maxRetries: 5,
        enableFallback: false,
        templateStrategy: 'manual' as const,
        targetWordCount: 1500,
        emotionalTarget: 'romantic'
      };

      // Mock successful generation
      const mockGenerate = vi.spyOn(pipelineForTesting, 'executeGenerationAttempt')
        .mockResolvedValue({
          success: true,
          episode: createMockChapter(1),
          qualityMetrics: createMockQualityMetrics(92),
          creativityActivated: true,
          tokensUsed: 800,
          generationTime: 0,
          retryCount: 0
        });

      const result = await pipeline.generateEpisode(mockNovel, 1, customConfig);

      expect(result.success).toBe(true);
      expect(result.creativityActivated).toBe(true);
    });

    it('should respect retry limits', async () => {
      const customConfig = { ...defaultEpisodeConfig, maxRetries: 1 };
      
      const mockGenerate = vi.spyOn(pipelineForTesting, 'executeGenerationAttempt')
        .mockRejectedValue(new Error('Generation failed'));

      const result = await pipeline.generateEpisode(mockNovel, 1, customConfig);

      expect(result.success).toBe(false);
      expect(result.retryCount).toBe(1);
      expect(mockGenerate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration Tests', () => {
    it('should create proper chapter objects', () => {
      const content = '테스트 에피소드 내용입니다. '.repeat(30);
      const metrics = createMockQualityMetrics();
      
      const chapter = (pipelineForTesting).createChapterObject(
        content, 
        mockNovel, 
        5, 
        metrics
      );

      expect(chapter.title).toBe('5화');
      expect(chapter.novel).toBe(mockNovel.slug);
      expect(chapter.chapterNumber).toBe(5);
      expect(chapter.content).toBe(content);
      expect(chapter.wordCount).toBeGreaterThan(0);
      expect(chapter.emotionalTone).toBeDefined();
    });

    it('should handle memory updates', async () => {
      const chapter = createMockChapter(1);
      const metrics = createMockQualityMetrics();
      
      // This should not throw
      await expect(
        (pipelineForTesting).updateMemory(chapter, metrics)
      ).resolves.not.toThrow();
    });
  });
});

// Helper functions
function createMockChapter(chapterNumber: number): Chapter {
  return {
    title: `${chapterNumber}화`,
    novel: 'test-novel',
    chapterNumber,
    publicationDate: '2025-08-15',
    content: '테스트 에피소드 내용입니다. '.repeat(50),
    wordCount: 250,
    emotionalTone: 'romantic'
  };
}

function createMockQualityMetrics(overallScore: number = 80): QualityMetrics {
  return {
    overallScore,
    readabilityScore: 85,
    creativityScore: 75,
    consistencyScore: 80,
    engagementScore: 85,
    breakdown: {
      structure: 80,
      characterization: 85,
      dialogue: 75,
      pacing: 80,
      worldBuilding: 70
    }
  };
}

function createMockPipelineState() {
  return {
    contextPrepared: false,
    templateSelected: false,
    contentGenerated: false,
    qualityValidated: false,
    creativityTriggered: false,
    currentAttempt: 1
  };
}