/**
 * 🧪 Quality & Consistency Validator Tests
 * 품질 관리 및 일관성 검증 시스템 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QualityConsistencyValidator } from '../lib/quality-consistency-validator.js';
import { Novel, Chapter, QualityMetrics } from '../lib/types/index.js';

describe('QualityConsistencyValidator', () => {
  let validator: QualityConsistencyValidator;
  let mockNovel: Novel;
  let mockChapter: Chapter;
  let previousChapters: Chapter[];

  beforeEach(() => {
    validator = new QualityConsistencyValidator();
    
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
      tags: ['로맨스', '판타지'],
      targetAudience: '20-30대 여성',
      expectedLength: '50-60화'
    };

    mockChapter = {
      title: '5화',
      novel: 'test-novel',
      chapterNumber: 5,
      publicationDate: '2025-08-15',
      content: `
        "안녕하세요, 민준님." 서연이 정중하게 인사했다.
        
        민준은 그녀의 말투에서 변화를 느꼈다. 예전보다 훨씬 자신감 있어 보였다.
        
        "서연아, 오늘 좀 다르네? 무슨 일이야?"
        
        서연은 미소를 지으며 대답했다. "특별한 일은 없어요. 그냥... 기분이 좋아서요."
        
        마법의 빛이 그녀 주위를 둘러쌌다. 평소와 같은 따뜻한 금빛이었다.
        
        두 사람은 학교 옥상에서 석양을 바라보며 조용히 서 있었다.
      `,
      wordCount: 150,
      emotionalTone: 'romantic'
    };

    previousChapters = [
      {
        title: '1화',
        novel: 'test-novel',
        chapterNumber: 1,
        publicationDate: '2025-08-11',
        content: '민준과 서연의 첫 만남. 서연은 수줍어하며 인사했다.',
        wordCount: 200,
        emotionalTone: 'neutral'
      },
      {
        title: '2화',
        novel: 'test-novel',
        chapterNumber: 2,
        publicationDate: '2025-08-12',
        content: '마법 수업에서 서연의 금빛 마법이 처음 발현되었다.',
        wordCount: 180,
        emotionalTone: 'dramatic'
      }
    ];
  });

  describe('Validator Initialization', () => {
    it('should initialize properly with default settings', () => {
      expect(validator).toBeDefined();
      
      const trends = validator.getQualityTrends();
      expect(trends.trend).toBe('stable');
      expect(trends.averageScore).toBe(0);
    });

    it('should allow character profile management', () => {
      const profile = {
        name: '서연',
        expectedBehavior: '내성적이고 정중한 성격',
        speechPatterns: [
          { pattern: '정중한 말투', frequency: 0.8 },
          { pattern: '존댓말 사용', frequency: 0.9 }
        ],
        emotionalRange: ['수줍음', '기쁨', '놀라움']
      };

      expect(() => {
        validator.updateCharacterProfile('서연', profile);
      }).not.toThrow();
    });

    it('should allow world rule management', () => {
      const worldRule = {
        id: 'magic-consistency',
        description: '마법의 색깔은 항상 일정해야 함',
        aspect: '마법 시스템',
        expected: '개인별 고유 색상 유지',
        importance: 'high' as const
      };

      expect(() => {
        validator.addWorldRule(worldRule);
      }).not.toThrow();
    });
  });

  describe('Chapter Validation (Mocked)', () => {
    it('should perform comprehensive validation', async () => {
      // Mock the internal quality analysis method
      const mockAnalyze = vi.spyOn(validator as any, 'analyzeContentQuality')
        .mockResolvedValue(createMockQualityMetrics(85));

      const result = await validator.validateChapter(mockChapter, mockNovel, previousChapters);

      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('characterConsistency');
      expect(result).toHaveProperty('worldConsistency');
      expect(result).toHaveProperty('plotConsistency');
      expect(result).toHaveProperty('styleConsistency');
      expect(result).toHaveProperty('violations');
      expect(result).toHaveProperty('suggestions');

      expect(typeof result.overallScore).toBe('number');
      expect(Array.isArray(result.violations)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should pass validation for high-quality content', async () => {
      // Mock all validation methods to return good results
      vi.spyOn(validator as any, 'validateCharacterConsistency')
        .mockResolvedValue({
          score: 90,
          issues: [],
          validations: []
        });

      vi.spyOn(validator as any, 'validateWorldConsistency')
        .mockResolvedValue({
          score: 95,
          issues: [],
          validations: []
        });

      vi.spyOn(validator as any, 'validatePlotConsistency')
        .mockResolvedValue({
          score: 88,
          issues: [],
          validations: []
        });

      vi.spyOn(validator as any, 'validateStyleConsistency')
        .mockResolvedValue({
          score: 92,
          issues: [],
          validations: []
        });

      const result = await validator.validateChapter(mockChapter, mockNovel, previousChapters);

      expect(result.passed).toBe(true);
      expect(result.overallScore).toBeGreaterThan(80);
      expect(result.violations.length).toBe(0);
    });

    it('should fail validation for poor-quality content', async () => {
      // Mock validation methods to return poor results
      vi.spyOn(validator as any, 'validateCharacterConsistency')
        .mockResolvedValue({
          score: 40,
          issues: ['캐릭터 성격 불일치', '말투 변화'],
          validations: []
        });

      vi.spyOn(validator as any, 'validateWorldConsistency')
        .mockResolvedValue({
          score: 35,
          issues: ['마법 시스템 위반'],
          validations: []
        });

      const result = await validator.validateChapter(mockChapter, mockNovel, previousChapters);

      expect(result.passed).toBe(false);
      expect(result.overallScore).toBeLessThan(70);
      expect(result.violations.length).toBeGreaterThan(0);
    });
  });

  describe('Character Consistency Validation', () => {
    it('should validate character behavior patterns', async () => {
      const profile = {
        name: '서연',
        expectedBehavior: '내성적이고 정중한 성격',
        speechPatterns: [
          { pattern: '정중한 말투', frequency: 0.8 }
        ],
        emotionalRange: ['수줍음', '기쁨']
      };

      validator.updateCharacterProfile('서연', profile);

      const check = await (validator as any).validateCharacterConsistency(
        mockChapter, 
        previousChapters
      );

      expect(check).toHaveProperty('score');
      expect(check).toHaveProperty('issues');
      expect(check).toHaveProperty('validations');
      expect(typeof check.score).toBe('number');
      expect(Array.isArray(check.issues)).toBe(true);
    });

    it('should detect speech pattern inconsistencies', () => {
      const dialogues = [
        { text: '안녕하세요', position: 10, speaker: '서연' },
        { text: '어떻게 지내세요?', position: 50, speaker: '서연' }
      ];

      const pattern = (validator as any).analyzeSpeechPattern('서연', dialogues);
      
      expect(pattern).toHaveProperty('dominant');
      expect(pattern).toHaveProperty('deviation');
      expect(typeof pattern.deviation).toBe('number');
    });
  });

  describe('World Consistency Validation', () => {
    it('should validate world building rules', async () => {
      const worldRule = {
        id: 'magic-colors',
        description: '마법은 개인별 고유 색상',
        aspect: '마법 시스템',
        expected: '일관된 색상 유지',
        importance: 'high' as const
      };

      validator.addWorldRule(worldRule);

      const check = await (validator as any).validateWorldConsistency(
        mockChapter, 
        mockNovel
      );

      expect(check).toHaveProperty('score');
      expect(check).toHaveProperty('issues');
      expect(typeof check.score).toBe('number');
    });

    it('should validate magic system consistency', () => {
      const magicConsistency = (validator as any).validateMagicSystem(mockChapter.content);
      
      expect(magicConsistency).toHaveProperty('consistent');
      expect(typeof magicConsistency.consistent).toBe('boolean');
    });

    it('should validate location consistency', () => {
      const locationConsistency = (validator as any).validateLocationConsistency(mockChapter.content);
      
      expect(locationConsistency).toHaveProperty('consistent');
      expect(typeof locationConsistency.consistent).toBe('boolean');
    });
  });

  describe('Plot Consistency Validation', () => {
    it('should validate timeline consistency', () => {
      const timelineCheck = (validator as any).validateTimeline(mockChapter, previousChapters);
      
      expect(timelineCheck).toHaveProperty('consistent');
      expect(timelineCheck).toHaveProperty('expected');
      expect(timelineCheck).toHaveProperty('actual');
    });

    it('should validate causality relationships', () => {
      const causalityCheck = (validator as any).validateCausality(mockChapter, previousChapters);
      
      expect(causalityCheck).toHaveProperty('consistent');
      expect(typeof causalityCheck.consistent).toBe('boolean');
    });

    it('should validate conflict resolution logic', () => {
      const conflictCheck = (validator as any).validateConflictResolution(mockChapter.content);
      
      expect(conflictCheck).toHaveProperty('logical');
      expect(typeof conflictCheck.logical).toBe('boolean');
    });
  });

  describe('Style Consistency Validation', () => {
    it('should analyze writing style patterns', () => {
      const style = (validator as any).analyzeWritingStyle(mockChapter.content);
      
      expect(style).toHaveProperty('formalityLevel');
      expect(style).toHaveProperty('narrativePerspective');
      expect(style).toHaveProperty('sentenceComplexity');
      expect(style).toHaveProperty('vocabularyLevel');
      expect(style).toHaveProperty('emotionalIntensity');
    });

    it('should validate emotion expression consistency', () => {
      const emotionCheck = (validator as any).validateEmotionExpression(
        mockChapter.content, 
        previousChapters
      );
      
      expect(emotionCheck).toHaveProperty('consistent');
      expect(typeof emotionCheck.consistent).toBe('boolean');
    });
  });

  describe('Improvement Suggestions', () => {
    it('should generate relevant improvement suggestions', () => {
      const qualityMetrics = createMockQualityMetrics(60);
      const violations = [
        {
          type: 'character' as const,
          severity: 'major' as const,
          description: '캐릭터 일관성 문제',
          location: '캐릭터 분석',
          suggestion: '성격 설정 재검토'
        }
      ];

      const suggestions = (validator as any).generateImprovementSuggestions(
        qualityMetrics, 
        violations
      );

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      
      suggestions.forEach((suggestion: any) => {
        expect(suggestion).toHaveProperty('category');
        expect(suggestion).toHaveProperty('priority');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('expectedImpact');
      });
    });

    it('should prioritize suggestions correctly', () => {
      const qualityMetrics = createMockQualityMetrics(50);
      const violations = [
        {
          type: 'character' as const,
          severity: 'critical' as const,
          description: '중대한 문제',
          location: '캐릭터',
          suggestion: '즉시 수정'
        }
      ];

      const suggestions = (validator as any).generateImprovementSuggestions(
        qualityMetrics, 
        violations
      );

      const highPriority = suggestions.filter((s: any) => s.priority === 'high');
      expect(highPriority.length).toBeGreaterThan(0);
    });
  });

  describe('Quality Trends Analysis', () => {
    it('should analyze quality trends with insufficient data', () => {
      const trends = validator.getQualityTrends();
      
      expect(trends.trend).toBe('stable');
      expect(trends.averageScore).toBe(0);
      expect(trends.improvement).toBe(0);
      expect(Array.isArray(trends.recommendations)).toBe(true);
    });

    it('should detect improving trends', async () => {
      // Add quality history to simulate improving trend
      for (let i = 0; i < 6; i++) {
        const mockQuality = createMockQualityMetrics(70 + i * 5);
        (validator as any).qualityHistory.push(mockQuality);
      }

      const trends = validator.getQualityTrends();
      
      expect(trends.trend).toBe('improving');
      expect(trends.improvement).toBeGreaterThan(5);
      expect(trends.recommendations).toContain('현재 방향을 유지하세요');
    });

    it('should detect declining trends', async () => {
      // Add quality history to simulate declining trend
      for (let i = 0; i < 6; i++) {
        const mockQuality = createMockQualityMetrics(90 - i * 5);
        (validator as any).qualityHistory.push(mockQuality);
      }

      const trends = validator.getQualityTrends();
      
      expect(trends.trend).toBe('declining');
      expect(trends.improvement).toBeLessThan(-5);
      expect(trends.recommendations).toContain('기본기를 다시 점검하세요');
    });
  });

  describe('Utility Functions', () => {
    it('should extract dialogues correctly', () => {
      const content = '"안녕하세요" 그녀가 말했다. "오늘 날씨가 좋네요"';
      const dialogues = (validator as any).extractDialogues(content);
      
      expect(Array.isArray(dialogues)).toBe(true);
      expect(dialogues.length).toBe(2);
      expect(dialogues[0].text).toBe('안녕하세요');
      expect(dialogues[1].text).toBe('오늘 날씨가 좋네요');
    });

    it('should extract character names', () => {
      const content = '민준이 서연에게 말했다. 지우도 함께 있었다.';
      const names = (validator as any).extractCharacterNames(content);
      
      expect(Array.isArray(names)).toBe(true);
      expect(names).toContain('민준');
      expect(names).toContain('서연');
      expect(names).toContain('지우');
    });

    it('should calculate overall score correctly', () => {
      const qualityMetrics = createMockQualityMetrics(80);
      const characterCheck = { score: 85, issues: [], validations: [] };
      const worldCheck = { score: 90, issues: [], validations: [] };
      const plotCheck = { score: 75, issues: [], validations: [] };
      const styleCheck = { score: 88, issues: [], validations: [] };

      const overallScore = (validator as any).calculateOverallScore(
        qualityMetrics,
        characterCheck,
        worldCheck,
        plotCheck,
        styleCheck
      );

      expect(typeof overallScore).toBe('number');
      expect(overallScore).toBeGreaterThan(70);
      expect(overallScore).toBeLessThanOrEqual(100);
    });
  });
});

// Helper functions
function createMockQualityMetrics(overallScore: number = 80): QualityMetrics {
  return {
    overallScore,
    readabilityScore: overallScore - 5,
    creativityScore: overallScore - 10,
    consistencyScore: overallScore + 5,
    engagementScore: overallScore,
    breakdown: {
      structure: overallScore,
      characterization: overallScore + 5,
      dialogue: overallScore - 5,
      pacing: overallScore,
      worldBuilding: overallScore - 10
    }
  };
}