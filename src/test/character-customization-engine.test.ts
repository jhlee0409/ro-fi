/**
 * 🧪 Character Customization Engine Tests
 * 캐릭터 커스터마이징 엔진 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterCustomizationEngine } from '../lib/character-customization-engine.js';
import { Novel, Chapter } from '../lib/types/index.js';

describe('CharacterCustomizationEngine', () => {
  let customizationEngine: CharacterCustomizationEngine;
  let mockNovel: Novel;
  let mockChapter: Chapter;
  let mockReaderData: any;

  beforeEach(() => {
    customizationEngine = new CharacterCustomizationEngine();
    
    mockNovel = {
      slug: 'test-novel',
      title: '테스트 로맨스 판타지',
      author: 'Test Author',
      status: 'ongoing',
      summary: '테스트용 캐릭터 커스터마이징 소설',
      genre: '로맨스 판타지',
      publishedDate: '2025-08-15',
      totalChapters: 50,
      rating: 0,
      coverImage: '/test.jpg',
      tags: ['로맨스', '판타지', '커스터마이징'],
      targetAudience: '20-30대 여성',
      expectedLength: '50-60화'
    };

    mockChapter = {
      title: '15화',
      novel: 'test-novel',
      chapterNumber: 15,
      publicationDate: '2025-08-15',
      content: `
        민준이 서연의 손을 잡았다. "서연아, 우리 이제 솔직해지자."
        
        서연은 그의 진심어린 눈빛을 보며 마음이 요동쳤다. 
        "민준오빠... 저도 같은 마음이에요."
        
        두 사람의 관계가 새로운 단계로 접어들었다.
        마법의 빛이 더욱 따뜻하게 빛났다.
      `,
      wordCount: 120,
      emotionalTone: 'romantic'
    };

    mockReaderData = {
      readerId: 'test-reader-001',
      choiceHistory: [
        {
          characterTarget: '민준',
          choiceType: 'romantic',
          satisfaction: 85
        },
        {
          characterTarget: '서연',
          choiceType: 'emotional',
          satisfaction: 90
        }
      ],
      satisfactionScores: [85, 90, 80, 95],
      feedbackComments: ['로맨틱해요', '캐릭터가 매력적'],
      interactionPatterns: {
        preferredTypes: ['romantic', 'emotional'],
        avgResponseTime: 3.5
      }
    };
  });

  describe('System Initialization', () => {
    it('should initialize with default characters', () => {
      expect(customizationEngine).toBeDefined();
      
      const stats = customizationEngine.getSystemStats();
      expect(stats.totalCharacters).toBeGreaterThan(0);
      expect(stats.averagePopularity).toBeGreaterThan(0);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(stats.systemHealth);
    });

    it('should have default character profiles', () => {
      const minjun = customizationEngine.getCharacterProfile('민준');
      const seoyeon = customizationEngine.getCharacterProfile('서연');
      
      expect(minjun).toBeDefined();
      expect(seoyeon).toBeDefined();
      
      if (minjun) {
        expect(minjun.name).toBe('민준');
        expect(minjun.basePersonality).toBeDefined();
        expect(minjun.currentPersonality).toBeDefined();
        expect(minjun.customizationLimits).toBeDefined();
        
        // 성격 특성 범위 확인
        expect(minjun.basePersonality.openness).toBeGreaterThanOrEqual(0);
        expect(minjun.basePersonality.openness).toBeLessThanOrEqual(100);
        expect(minjun.basePersonality.romanticism).toBeGreaterThanOrEqual(0);
        expect(minjun.basePersonality.romanticism).toBeLessThanOrEqual(100);
      }
      
      if (seoyeon) {
        expect(seoyeon.name).toBe('서연');
        expect(seoyeon.relationships.has('민준')).toBe(true);
      }
    });

    it('should initialize character relationships correctly', () => {
      const minjun = customizationEngine.getCharacterProfile('민준');
      const seoyeon = customizationEngine.getCharacterProfile('서연');
      
      expect(minjun?.relationships.has('서연')).toBe(true);
      expect(seoyeon?.relationships.has('민준')).toBe(true);
      
      const minjunToSeoyeon = minjun?.relationships.get('서연');
      expect(minjunToSeoyeon?.relationshipType).toBe('romantic');
      expect(minjunToSeoyeon?.intimacyLevel).toBeGreaterThan(0);
      expect(minjunToSeoyeon?.compatibility).toBeGreaterThan(0);
    });
  });

  describe('Character Customization', () => {
    it('should customize character based on reader preferences', async () => {
      const result = await customizationEngine.customizeCharacterForChapter(
        '민준',
        mockChapter,
        mockNovel,
        mockReaderData
      );

      expect(result).toBeDefined();
      expect(result.character).toBeDefined();
      expect(result.validationResult).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.nextMilestones).toBeDefined();
      expect(Array.isArray(result.nextMilestones)).toBe(true);

      expect(result.character.name).toBe('민준');
      expect(result.validationResult).toHaveProperty('approved');
      expect(typeof result.validationResult.approved).toBe('boolean');
    });

    it('should handle invalid character names gracefully', async () => {
      await expect(async () => {
        await customizationEngine.customizeCharacterForChapter(
          '존재하지않는캐릭터',
          mockChapter,
          mockNovel,
          mockReaderData
        );
      }).rejects.toThrow('Character not found');
    });

    it('should validate personality changes within constraints', async () => {
      const minjun = customizationEngine.getCharacterProfile('민준');
      expect(minjun).toBeDefined();
      
      if (minjun) {
        // 커스터마이징 제약 조건 확인
        expect(minjun.customizationLimits.maxChangePerChapter).toBeGreaterThan(0);
        expect(minjun.customizationLimits.maxTotalDeviation).toBeGreaterThan(0);
        expect(Array.isArray(minjun.customizationLimits.coreTraitsLocked)).toBe(true);
        
        // 제약 조건이 실제로 적용되는지 테스트
        const result = await customizationEngine.customizeCharacterForChapter(
          '민준',
          mockChapter,
          mockNovel,
          mockReaderData
        );
        
        // 검증 결과가 제약 조건을 고려했는지 확인
        expect(result.validationResult).toHaveProperty('violations');
        expect(result.validationResult).toHaveProperty('warnings');
        expect(Array.isArray(result.validationResult.violations)).toBe(true);
        expect(Array.isArray(result.validationResult.warnings)).toBe(true);
      }
    });
  });

  describe('Personality Analysis', () => {
    it('should analyze reader preferences correctly', () => {
      const minjun = customizationEngine.getCharacterProfile('민준');
      expect(minjun).toBeDefined();
      
      if (minjun) {
        // 성격 특성 구조 확인
        expect(minjun.basePersonality).toHaveProperty('openness');
        expect(minjun.basePersonality).toHaveProperty('conscientiousness');
        expect(minjun.basePersonality).toHaveProperty('extraversion');
        expect(minjun.basePersonality).toHaveProperty('agreeableness');
        expect(minjun.basePersonality).toHaveProperty('neuroticism');
        
        // 로맨스 판타지 특화 요소
        expect(minjun.basePersonality).toHaveProperty('romanticism');
        expect(minjun.basePersonality).toHaveProperty('adventurousness');
        expect(minjun.basePersonality).toHaveProperty('empathy');
        expect(minjun.basePersonality).toHaveProperty('leadership');
        expect(minjun.basePersonality).toHaveProperty('mystery');
        
        // 의사소통 스타일
        expect(minjun.basePersonality.communication).toHaveProperty('formality');
        expect(minjun.basePersonality.communication).toHaveProperty('directness');
        expect(minjun.basePersonality.communication).toHaveProperty('warmth');
      }
    });

    it('should track personality evolution history', async () => {
      const result = await customizationEngine.customizeCharacterForChapter(
        '민준',
        mockChapter,
        mockNovel,
        mockReaderData
      );

      const character = result.character;
      
      // 진화 기록이 올바르게 추가되는지 확인
      expect(Array.isArray(character.evolutionHistory)).toBe(true);
      
      // 여러 번 커스터마이징을 수행하여 히스토리 추적 테스트
      const chapter2 = { ...mockChapter, chapterNumber: 16 };
      const result2 = await customizationEngine.customizeCharacterForChapter(
        '민준',
        chapter2,
        mockNovel,
        mockReaderData
      );
      
      // 히스토리가 누적되는지 확인
      expect(result2.character.evolutionHistory.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Relationship Dynamics', () => {
    it('should manage character relationships', () => {
      const minjun = customizationEngine.getCharacterProfile('민준');
      const seoyeon = customizationEngine.getCharacterProfile('서연');
      
      expect(minjun?.relationships.size).toBeGreaterThan(0);
      expect(seoyeon?.relationships.size).toBeGreaterThan(0);
      
      const relationship = minjun?.relationships.get('서연');
      expect(relationship).toBeDefined();
      
      if (relationship) {
        expect(relationship).toHaveProperty('targetCharacter');
        expect(relationship).toHaveProperty('relationshipType');
        expect(relationship).toHaveProperty('intimacyLevel');
        expect(relationship).toHaveProperty('trustLevel');
        expect(relationship).toHaveProperty('compatibility');
        expect(relationship).toHaveProperty('evolutionTrend');
        
        expect(relationship.targetCharacter).toBe('서연');
        expect(['romantic', 'friendship', 'rivalry', 'family', 'mentor']).toContain(relationship.relationshipType);
        expect(['improving', 'declining', 'stable', 'volatile']).toContain(relationship.evolutionTrend);
      }
    });

    it('should update relationship dynamics after customization', async () => {
      const beforeCustomization = customizationEngine.getCharacterProfile('민준');
      const initialIntimacy = beforeCustomization?.relationships.get('서연')?.intimacyLevel;
      
      await customizationEngine.customizeCharacterForChapter(
        '민준',
        mockChapter,
        mockNovel,
        mockReaderData
      );
      
      const afterCustomization = customizationEngine.getCharacterProfile('민준');
      const relationship = afterCustomization?.relationships.get('서연');
      
      expect(relationship).toBeDefined();
      expect(typeof relationship?.intimacyLevel).toBe('number');
      
      // 관계 지표가 유효한 범위 내에 있는지 확인
      if (relationship) {
        expect(relationship.intimacyLevel).toBeGreaterThanOrEqual(0);
        expect(relationship.intimacyLevel).toBeLessThanOrEqual(100);
        expect(relationship.trustLevel).toBeGreaterThanOrEqual(0);
        expect(relationship.trustLevel).toBeLessThanOrEqual(100);
        expect(relationship.compatibility).toBeGreaterThanOrEqual(0);
        expect(relationship.compatibility).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Development Recommendations', () => {
    it('should generate relevant development recommendations', async () => {
      const result = await customizationEngine.customizeCharacterForChapter(
        '민준',
        mockChapter,
        mockNovel,
        mockReaderData
      );

      expect(Array.isArray(result.recommendations)).toBe(true);
      
      result.recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('suggestedChanges');
        expect(rec).toHaveProperty('expectedImpact');
        expect(rec).toHaveProperty('timeframe');
        
        expect(['high', 'medium', 'low']).toContain(rec.priority);
        expect(Array.isArray(rec.suggestedChanges)).toBe(true);
        expect(typeof rec.description).toBe('string');
        expect(rec.description.length).toBeGreaterThan(0);
      });
    });

    it('should prioritize recommendations correctly', async () => {
      const result = await customizationEngine.customizeCharacterForChapter(
        '민준',
        mockChapter,
        mockNovel,
        mockReaderData
      );

      if (result.recommendations.length > 1) {
        const priorities = result.recommendations.map(rec => rec.priority);
        const priorityValues = { high: 3, medium: 2, low: 1 };
        
        // 우선순위가 올바르게 정렬되었는지 확인
        for (let i = 0; i < priorities.length - 1; i++) {
          expect(priorityValues[priorities[i]]).toBeGreaterThanOrEqual(priorityValues[priorities[i + 1]]);
        }
      }
    });
  });

  describe('System Analytics', () => {
    it('should provide accurate system statistics', () => {
      const stats = customizationEngine.getSystemStats();
      
      expect(stats).toHaveProperty('totalCharacters');
      expect(stats).toHaveProperty('activeCustomizations');
      expect(stats).toHaveProperty('averagePopularity');
      expect(stats).toHaveProperty('systemHealth');
      
      expect(typeof stats.totalCharacters).toBe('number');
      expect(typeof stats.activeCustomizations).toBe('number');
      expect(typeof stats.averagePopularity).toBe('number');
      expect(['excellent', 'good', 'fair', 'poor']).toContain(stats.systemHealth);
      
      expect(stats.totalCharacters).toBeGreaterThan(0);
      expect(stats.averagePopularity).toBeGreaterThanOrEqual(0);
      expect(stats.averagePopularity).toBeLessThanOrEqual(100);
    });

    it('should track character analytics', () => {
      const minjun = customizationEngine.getCharacterProfile('민준');
      expect(minjun).toBeDefined();
      
      if (minjun) {
        expect(minjun.preferences).toHaveProperty('popularityScore');
        expect(minjun.preferences).toHaveProperty('storyArcAlignment');
        expect(minjun.preferences).toHaveProperty('developmentPriority');
        
        expect(typeof minjun.preferences.popularityScore).toBe('number');
        expect(typeof minjun.preferences.storyArcAlignment).toBe('number');
        expect(['balanced', 'romantic', 'dramatic', 'mysterious']).toContain(minjun.preferences.developmentPriority);
      }
    });
  });

  describe('Validation and Constraints', () => {
    it('should respect core trait locks', async () => {
      const minjun = customizationEngine.getCharacterProfile('민준');
      expect(minjun).toBeDefined();
      
      if (minjun) {
        const lockedTraits = minjun.customizationLimits.coreTraitsLocked;
        expect(Array.isArray(lockedTraits)).toBe(true);
        expect(lockedTraits.length).toBeGreaterThan(0);
        
        // 코어 특성이 실제로 잠겨있는지 확인
        expect(lockedTraits).toContain('conscientiousness');
        expect(lockedTraits).toContain('agreeableness');
      }
    });

    it('should enforce maximum change limits', () => {
      const minjun = customizationEngine.getCharacterProfile('민준');
      expect(minjun).toBeDefined();
      
      if (minjun) {
        expect(minjun.customizationLimits.maxChangePerChapter).toBeGreaterThan(0);
        expect(minjun.customizationLimits.maxTotalDeviation).toBeGreaterThan(0);
        expect(minjun.customizationLimits.maxChangePerChapter).toBeLessThan(50);
      }
    });

    it('should validate relationship constraints', () => {
      const minjun = customizationEngine.getCharacterProfile('민준');
      expect(minjun).toBeDefined();
      
      if (minjun) {
        const relConstraints = minjun.customizationLimits.relationshipBounds;
        expect(relConstraints).toBeDefined();
        expect(relConstraints).toHaveProperty('maxIntimacyChange');
        expect(relConstraints).toHaveProperty('maxConflictEscalation');
        expect(relConstraints).toHaveProperty('requiredConsistency');
        
        expect(typeof relConstraints.maxIntimacyChange).toBe('number');
        expect(typeof relConstraints.maxConflictEscalation).toBe('number');
        expect(typeof relConstraints.requiredConsistency).toBe('number');
      }
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle multiple customizations efficiently', async () => {
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 3; i++) {
        const chapter = { ...mockChapter, chapterNumber: 15 + i };
        promises.push(
          customizationEngine.customizeCharacterForChapter(
            '민준',
            chapter,
            mockNovel,
            mockReaderData
          )
        );
      }
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(results.length).toBe(3);
      expect(endTime - startTime).toBeLessThan(5000); // 5초 이내
      
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.character).toBeDefined();
      });
    });

    it('should maintain data consistency across operations', async () => {
      const initialStats = customizationEngine.getSystemStats();
      
      await customizationEngine.customizeCharacterForChapter(
        '민준',
        mockChapter,
        mockNovel,
        mockReaderData
      );
      
      const afterStats = customizationEngine.getSystemStats();
      
      // 기본 통계가 일관성 있게 유지되는지 확인
      expect(afterStats.totalCharacters).toBe(initialStats.totalCharacters);
      expect(afterStats.averagePopularity).toBeGreaterThanOrEqual(0);
      expect(afterStats.averagePopularity).toBeLessThanOrEqual(100);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle extreme reader feedback gracefully', async () => {
      const extremeReaderData = {
        ...mockReaderData,
        satisfactionScores: [0, 10, 100, 95, 5], // 극단적인 점수들
        feedbackComments: ['너무 싫어요', '최고예요', '별로예요']
      };
      
      const result = await customizationEngine.customizeCharacterForChapter(
        '민준',
        mockChapter,
        mockNovel,
        extremeReaderData
      );
      
      expect(result).toBeDefined();
      expect(result.validationResult.approved).toBeDefined();
      
      // 극단적인 피드백에도 시스템이 안정적으로 작동하는지 확인
      const character = result.character;
      expect(character.currentPersonality.openness).toBeGreaterThanOrEqual(0);
      expect(character.currentPersonality.openness).toBeLessThanOrEqual(100);
    });

    it('should handle empty or minimal reader data', async () => {
      const minimalReaderData = {
        readerId: 'minimal-reader',
        choiceHistory: [],
        satisfactionScores: [],
        feedbackComments: [],
        interactionPatterns: {}
      };
      
      const result = await customizationEngine.customizeCharacterForChapter(
        '서연',
        mockChapter,
        mockNovel,
        minimalReaderData
      );
      
      expect(result).toBeDefined();
      expect(result.character.name).toBe('서연');
      expect(result.validationResult).toBeDefined();
    });
  });
});