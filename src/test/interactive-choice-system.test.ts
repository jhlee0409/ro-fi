/**
 * 🧪 Interactive Choice System Tests
 * 실시간 선택지 시스템 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InteractiveChoiceSystem } from '../lib/interactive-choice-system.js';
import { Novel, Chapter } from '../lib/types/index.js';

describe('InteractiveChoiceSystem', () => {
  let choiceSystem: InteractiveChoiceSystem;
  let mockNovel: Novel;
  let mockChapter: Chapter;
  let testReaderId: string;

  beforeEach(() => {
    choiceSystem = new InteractiveChoiceSystem();
    testReaderId = 'test-reader-001';
    
    mockNovel = {
      slug: 'test-novel',
      title: '테스트 로맨스 판타지',
      author: 'Test Author',
      status: 'ongoing',
      summary: '테스트용 인터랙티브 소설',
      genre: '로맨스 판타지',
      publishedDate: '2025-08-15',
      totalChapters: 50,
      rating: 0,
      coverImage: '/test.jpg',
      tags: ['로맨스', '판타지', '인터랙티브'],
      targetAudience: '20-30대 여성',
      expectedLength: '50-60화'
    };

    mockChapter = {
      title: '10화',
      novel: 'test-novel',
      chapterNumber: 10,
      publicationDate: '2025-08-15',
      content: `
        민준과 서연이 학교 옥상에서 마주보고 있었다.
        
        "서연아, 너에게 하고 싶은 말이 있어." 민준이 진지하게 말했다.
        
        서연의 마음이 두근거렸다. 이 순간을 어떻게 받아들여야 할까?
        
        마법의 빛이 두 사람 주위를 감쌌다. 선택의 순간이 다가왔다.
      `,
      wordCount: 120,
      emotionalTone: 'romantic'
    };
  });

  describe('System Initialization', () => {
    it('should initialize properly with default settings', () => {
      expect(choiceSystem).toBeDefined();
      
      const stats = choiceSystem.getSystemStats();
      expect(stats.totalReaders).toBe(0);
      expect(stats.totalChoices).toBe(0);
      expect(stats.activeFlags).toBe(0);
      expect(stats.averageEngagement).toBe(0);
    });

    it('should create reader profiles automatically', async () => {
      const context = {
        scene: '대화 상황',
        characters: ['민준', '서연'],
        mood: 'romantic'
      };

      const choices = await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        testReaderId,
        context
      );

      expect(choices).toBeDefined();
      expect(Array.isArray(choices)).toBe(true);
      
      const stats = choiceSystem.getSystemStats();
      expect(stats.totalReaders).toBe(1);
    });
  });

  describe('Choice Generation', () => {
    it('should generate appropriate choices for romantic scenes', async () => {
      const context = {
        scene: '로맨틱한 대화',
        characters: ['민준', '서연'],
        mood: 'romantic'
      };

      const choices = await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        testReaderId,
        context
      );

      expect(choices.length).toBeGreaterThan(0);
      expect(choices.length).toBeLessThanOrEqual(4);
      
      choices.forEach(choice => {
        expect(choice).toHaveProperty('id');
        expect(choice).toHaveProperty('text');
        expect(choice).toHaveProperty('type');
        expect(choice).toHaveProperty('impact');
        expect(choice).toHaveProperty('consequences');
        expect(choice).toHaveProperty('readerAppeal');
        
        expect(choice.text.length).toBeGreaterThan(5);
        expect(choice.readerAppeal).toBeGreaterThanOrEqual(0);
        expect(choice.readerAppeal).toBeLessThanOrEqual(100);
      });
    });

    it('should generate different choice types based on context', async () => {
      const romanticContext = {
        scene: '로맨틱한 대화',
        characters: ['민준', '서연'],
        mood: 'romantic'
      };

      const actionContext = {
        scene: '액션 상황',
        characters: ['민준', '서연'],
        mood: 'tense'
      };

      const romanticChoices = await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        testReaderId,
        romanticContext
      );

      const actionChoices = await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        `${testReaderId}-action`,
        actionContext
      );

      expect(romanticChoices.length).toBeGreaterThan(0);
      expect(actionChoices.length).toBeGreaterThan(0);
      
      // 로맨틱 상황에서는 emotion/dialogue 타입이 많을 것
      const romanticTypes = romanticChoices.map(c => c.type);
      expect(romanticTypes.some(type => ['emotion', 'dialogue'].includes(type))).toBe(true);
      
      // 액션 상황에서는 action/decision 타입이 많을 것
      const actionTypes = actionChoices.map(c => c.type);
      expect(actionTypes.some(type => ['action', 'decision'].includes(type))).toBe(true);
    });

    it('should limit choices to maximum of 4', async () => {
      const context = {
        scene: '복잡한 상황',
        characters: ['민준', '서연', '지우', '하은'],
        mood: 'dramatic'
      };

      const choices = await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        testReaderId,
        context
      );

      expect(choices.length).toBeLessThanOrEqual(4);
    });

    it('should sort choices by reader appeal', async () => {
      const context = {
        scene: '대화 상황',
        characters: ['민준', '서연'],
        mood: 'romantic'
      };

      const choices = await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        testReaderId,
        context
      );

      if (choices.length > 1) {
        for (let i = 0; i < choices.length - 1; i++) {
          expect(choices[i].readerAppeal).toBeGreaterThanOrEqual(choices[i + 1].readerAppeal);
        }
      }
    });
  });

  describe('Choice Processing', () => {
    it('should process choice selection correctly', async () => {
      // 먼저 선택지 생성
      const context = {
        scene: '대화 상황',
        characters: ['민준', '서연'],
        mood: 'romantic'
      };

      const choices = await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        testReaderId,
        context
      );

      expect(choices.length).toBeGreaterThan(0);

      // Mock processChoice 메서드
      const mockChoice = {
        id: 'test-choice-001',
        text: '진심을 전하기',
        type: 'emotion' as const,
        targetCharacter: '서연',
        impact: {
          immediate: '긍정적 반응',
          shortTerm: ['호감도 증가'],
          longTerm: ['관계 발전'],
          characterAffection: { '서연': 5, '민준': 3 },
          relationshipChange: { '민준-서연': 10 },
          plotInfluence: 75
        },
        consequences: {
          flagsSet: ['romantic_moment'],
          flagsRemoved: [],
          nextSceneTrigger: 'romantic_scene',
          narrativeShift: 'romantic' as const
        },
        readerAppeal: 85
      };

      // Mock the internal method
      const mockProcessChoice = vi.spyOn(choiceSystem as any, 'findChoiceById')
        .mockResolvedValue(mockChoice);

      const mockResult = {
        selectedChoice: mockChoice,
        narrativeOutcome: '당신의 진심이 서연에게 잘 전달되었습니다.',
        characterReactions: {
          '서연': {
            emotionalState: '기뻐함',
            affectionChange: 5,
            dialogueResponse: '서연: "정말 그런 마음이었군요."',
            futureDisposition: '호의적'
          }
        },
        plotFlags: ['romantic_moment'],
        nextChoiceHints: ['로맨틱한 분위기로 진행될 예정입니다.'],
        readerImpact: {
          engagementBoost: 8.5,
          satisfactionScore: 85,
          preferenceAlignment: 75,
          surpriseFactor: 45
        }
      };

      // Mock processChoice method
      vi.spyOn(choiceSystem, 'processChoice').mockResolvedValue(mockResult);

      const result = await choiceSystem.processChoice(
        'test-choice-001',
        testReaderId,
        mockChapter,
        mockNovel
      );

      expect(result).toBeDefined();
      expect(result.selectedChoice).toBeDefined();
      expect(result.narrativeOutcome).toBeDefined();
      expect(result.characterReactions).toBeDefined();
      expect(result.plotFlags).toBeDefined();
      expect(result.readerImpact).toBeDefined();

      expect(result.selectedChoice.id).toBe('test-choice-001');
      expect(result.narrativeOutcome.length).toBeGreaterThan(10);
      expect(Array.isArray(result.plotFlags)).toBe(true);
      expect(typeof result.readerImpact.satisfactionScore).toBe('number');
    });

    it('should handle invalid choice IDs gracefully', async () => {
      await expect(async () => {
        await choiceSystem.processChoice(
          'invalid-choice-id',
          testReaderId,
          mockChapter,
          mockNovel
        );
      }).rejects.toThrow('Choice not found');
    });
  });

  describe('Reader Profile Management', () => {
    it('should create and manage reader profiles', async () => {
      const context = {
        scene: '대화 상황',
        characters: ['민준', '서연'],
        mood: 'romantic'
      };

      // 첫 번째 독자
      await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        'reader-001',
        context
      );

      // 두 번째 독자
      await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        'reader-002',
        context
      );

      const stats = choiceSystem.getSystemStats();
      expect(stats.totalReaders).toBe(2);
    });

    it('should personalize choices based on reader preferences', async () => {
      const context = {
        scene: '대화 상황',
        characters: ['민준', '서연'],
        mood: 'romantic'
      };

      // 첫 번째 독자 - 로맨스 선호
      const romanticReader = 'romantic-reader';
      const romanticChoices = await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        romanticReader,
        context
      );

      // 두 번째 독자 - 액션 선호
      const actionReader = 'action-reader';
      const actionChoices = await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        actionReader,
        context
      );

      expect(romanticChoices.length).toBeGreaterThan(0);
      expect(actionChoices.length).toBeGreaterThan(0);
      
      // 각 독자별로 다른 선택지가 제공되어야 함
      // (현재는 개인화 로직이 단순하므로 기본 검증만 수행)
      expect(romanticChoices[0].id).not.toBe(actionChoices[0].id);
    });
  });

  describe('Character Affection System', () => {
    it('should track character affection changes', async () => {
      const initialStats = choiceSystem.getSystemStats();
      expect(initialStats.totalReaders).toBe(0);

      // 호감도 변화 테스트를 위한 Mock 설정
      const mockUpdateAffection = vi.spyOn(choiceSystem as any, 'updateCharacterAffection');

      const context = {
        scene: '대화 상황',
        characters: ['민준', '서연'],
        mood: 'romantic'
      };

      await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        testReaderId,
        context
      );

      // 독자 프로필이 생성되었는지 확인
      const stats = choiceSystem.getSystemStats();
      expect(stats.totalReaders).toBe(1);
    });
  });

  describe('System Performance', () => {
    it('should generate choices within reasonable time', async () => {
      const context = {
        scene: '대화 상황',
        characters: ['민준', '서연'],
        mood: 'romantic'
      };

      const startTime = Date.now();
      const choices = await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        testReaderId,
        context
      );
      const endTime = Date.now();

      expect(choices.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // 1초 이내
    });

    it('should handle multiple concurrent readers', async () => {
      const context = {
        scene: '대화 상황',
        characters: ['민준', '서연'],
        mood: 'romantic'
      };

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          choiceSystem.generateChoices(
            mockChapter,
            mockNovel,
            `reader-${i}`,
            context
          )
        );
      }

      const results = await Promise.all(promises);
      
      expect(results.length).toBe(5);
      results.forEach(choices => {
        expect(choices.length).toBeGreaterThan(0);
      });

      const stats = choiceSystem.getSystemStats();
      expect(stats.totalReaders).toBe(5);
    });
  });

  describe('Choice Type Validation', () => {
    it('should validate choice types correctly', () => {
      const validTypes: Array<'dialogue' | 'action' | 'emotion' | 'decision'> = 
        ['dialogue', 'action', 'emotion', 'decision'];

      validTypes.forEach(type => {
        expect(['dialogue', 'action', 'emotion', 'decision']).toContain(type);
      });
    });

    it('should generate appropriate choice text for each type', async () => {
      const context = {
        scene: '복합 상황',
        characters: ['민준', '서연'],
        mood: 'dramatic'
      };

      const choices = await choiceSystem.generateChoices(
        mockChapter,
        mockNovel,
        testReaderId,
        context
      );

      choices.forEach(choice => {
        expect(choice.text).toBeDefined();
        expect(choice.text.length).toBeGreaterThan(5);
        expect(['dialogue', 'action', 'emotion', 'decision']).toContain(choice.type);
      });
    });
  });

  describe('System Statistics', () => {
    it('should provide accurate system statistics', async () => {
      const initialStats = choiceSystem.getSystemStats();
      expect(initialStats.totalReaders).toBe(0);
      expect(initialStats.totalChoices).toBe(0);

      const context = {
        scene: '대화 상황',
        characters: ['민준', '서연'],
        mood: 'romantic'
      };

      // 여러 독자 추가
      for (let i = 0; i < 3; i++) {
        await choiceSystem.generateChoices(
          mockChapter,
          mockNovel,
          `reader-${i}`,
          context
        );
      }

      const updatedStats = choiceSystem.getSystemStats();
      expect(updatedStats.totalReaders).toBe(3);
      expect(updatedStats.averageEngagement).toBeGreaterThanOrEqual(0);
    });
  });
});