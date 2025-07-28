/**
 * AI 통합 생성기 테스트
 * v3.1 하이브리드 AI 시스템 검증 (Claude + Gemini)
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { UnifiedAIGenerator } from '../lib/ai-unified-generator.js';

describe('UnifiedAIGenerator - 하이브리드 AI 시스템', () => {
  let unifiedGenerator;
  const mockConfig = {
    anthropicApiKey: 'test-claude-key',
    geminiApiKey: 'test-gemini-key'
  };

  beforeEach(() => {
    unifiedGenerator = new UnifiedAIGenerator(mockConfig);
    
    // API 호출 모킹
    vi.spyOn(unifiedGenerator, 'callClaude').mockImplementation(async (prompt) => {
      return {
        content: `Claude response for: ${prompt.substring(0, 50)}...`,
        usage: { tokens: 1000 }
      };
    });

    vi.spyOn(unifiedGenerator, 'callGemini').mockImplementation(async (prompt) => {
      return {
        content: `Gemini response for: ${prompt.substring(0, 50)}...`,
        usage: { tokens: 800 }
      };
    });
  });

  describe('API 클라이언트 초기화', () => {
    test('Claude와 Gemini 클라이언트 초기화', () => {
      expect(unifiedGenerator.anthropic).toBeDefined();
      expect(unifiedGenerator.genAI).toBeDefined();
      expect(unifiedGenerator.claudeModel).toBeDefined();
      expect(unifiedGenerator.geminiModel).toBeDefined();
    });

    test('API 키 없을 때 graceful handling', () => {
      const noKeyGenerator = new UnifiedAIGenerator({});
      
      expect(noKeyGenerator.anthropic).toBeNull();
      expect(noKeyGenerator.genAI).toBeNull();
    });
  });

  describe('하이브리드 워크플로우', () => {
    test('3단계 하이브리드 생성 프로세스', async () => {
      const context = {
        novel: 'test-novel',
        chapter: 1,
        characters: ['카이런', '에이라'],
        worldSettings: { genre: 'fantasy', setting: 'modern' }
      };

      const result = await unifiedGenerator.generateHybridContent(context, {
        targetLength: 2000,
        emotionalTone: 'romantic'
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.aiModels).toContain('hybrid');
    });

    test('AI 모델별 전문 영역 라우팅', async () => {
      // Claude 전문 영역 (감정적 장면)
      const emotionalContext = {
        type: 'emotional_scene',
        characters: ['카이런', '에이라'],
        emotion: 'confession'
      };

      const claudeResult = await unifiedGenerator.routeToOptimalAI(emotionalContext, 'test prompt');
      expect(claudeResult.preferredModel).toBe('claude');

      // Gemini 전문 영역 (세계관 구축)
      const worldContext = {
        type: 'world_building',
        elements: ['magic_system', 'politics', 'geography']
      };

      const geminiResult = await unifiedGenerator.routeToOptimalAI(worldContext, 'test prompt');
      expect(geminiResult.preferredModel).toBe('gemini');
    });
  });

  describe('동적 캐릭터 생성', () => {
    test('캐릭터 이름 중복 방지', async () => {
      const existingCharacters = ['카이런', '에이라', '마르코'];
      
      const newCharacter = await unifiedGenerator.generateUniqueCharacter(
        existingCharacters,
        { role: 'supporting', gender: 'male' }
      );

      expect(newCharacter.name).toBeDefined();
      expect(existingCharacters).not.toContain(newCharacter.name);
      expect(newCharacter.profile).toBeDefined();
    });

    test('캐릭터 관계 동적 생성', async () => {
      const characters = [
        { name: '카이런', role: 'male_lead', traits: ['intelligent', 'reserved'] },
        { name: '에이라', role: 'female_lead', traits: ['brave', 'curious'] }
      ];

      const relationships = await unifiedGenerator.generateCharacterRelations(characters);

      expect(relationships).toBeDefined();
      expect(relationships.mainCouple).toBeDefined();
      expect(relationships.dynamics).toHaveLength.greaterThan(0);
    });
  });

  describe('캐시 시스템', () => {
    test('세계관 설정 캐싱', async () => {
      const worldKey = 'fantasy-modern-academy';
      const worldSettings = {
        genre: 'fantasy',
        setting: 'modern_academy',
        magicSystem: 'elemental'
      };

      unifiedGenerator.cacheWorldSettings(worldKey, worldSettings);
      const cached = unifiedGenerator.getCachedWorldSettings(worldKey);

      expect(cached).toEqual(worldSettings);
    });

    test('플롯 구조 캐싱', async () => {
      const plotKey = 'enemies-to-lovers-academy';
      const plotStructure = {
        trope: 'enemies_to_lovers',
        stages: ['antagonism', 'forced_cooperation', 'understanding', 'attraction', 'love']
      };

      unifiedGenerator.cachePlotStructure(plotKey, plotStructure);
      const cached = unifiedGenerator.getCachedPlotStructure(plotKey);

      expect(cached).toEqual(plotStructure);
    });

    test('캐시 만료 및 갱신', () => {
      const key = 'test-cache';
      const data = { test: 'data' };

      unifiedGenerator.cacheWorldSettings(key, data);
      
      // 캐시 강제 만료
      unifiedGenerator.cache.worldSettings.set(key, {
        data,
        timestamp: Date.now() - (2 * 60 * 60 * 1000) // 2시간 전
      });

      const expired = unifiedGenerator.getCachedWorldSettings(key);
      expect(expired).toBeNull();
    });
  });

  describe('통합 재시도 로직', () => {
    test('Claude 529 에러 지수적 백오프', async () => {
      const error529 = new Error('API request failed');
      error529.status = 529;

      vi.spyOn(unifiedGenerator, 'callClaude')
        .mockRejectedValueOnce(error529)
        .mockRejectedValueOnce(error529)
        .mockResolvedValueOnce({ content: 'Success after retries', usage: { tokens: 1000 } });

      const result = await unifiedGenerator.unifiedRetry(
        () => unifiedGenerator.callClaude('test prompt'),
        'claude'
      );

      expect(result.content).toBe('Success after retries');
    });

    test('Gemini 5xx 에러 재시도', async () => {
      const error500 = new Error('Server error');
      error500.status = 500;

      vi.spyOn(unifiedGenerator, 'callGemini')
        .mockRejectedValueOnce(error500)
        .mockResolvedValueOnce({ content: 'Success', usage: { tokens: 800 } });

      const result = await unifiedGenerator.unifiedRetry(
        () => unifiedGenerator.callGemini('test prompt'),
        'gemini'
      );

      expect(result.content).toBe('Success');
    });

    test('최대 재시도 초과 시 에러 처리', async () => {
      const persistentError = new Error('Persistent failure');
      persistentError.status = 529;

      vi.spyOn(unifiedGenerator, 'callClaude').mockRejectedValue(persistentError);

      await expect(unifiedGenerator.unifiedRetry(
        () => unifiedGenerator.callClaude('test prompt'),
        'claude'
      )).rejects.toThrow('Persistent failure');
    });
  });

  describe('폴백 메커니즘', () => {
    test('Claude 장애 시 Gemini 폴백', async () => {
      vi.spyOn(unifiedGenerator, 'callClaude').mockRejectedValue(new Error('Claude unavailable'));
      vi.spyOn(unifiedGenerator, 'callGemini').mockResolvedValue({
        content: 'Gemini fallback response',
        usage: { tokens: 900 }
      });

      const result = await unifiedGenerator.generateWithFallback('test prompt', {
        preferred: 'claude',
        fallback: 'gemini'
      });

      expect(result.content).toBe('Gemini fallback response');
      expect(result.metadata.aiModel).toBe('gemini');
      expect(result.metadata.fallbackUsed).toBe(true);
    });

    test('양쪽 AI 모두 장애 시 에러 처리', async () => {
      vi.spyOn(unifiedGenerator, 'callClaude').mockRejectedValue(new Error('Claude down'));
      vi.spyOn(unifiedGenerator, 'callGemini').mockRejectedValue(new Error('Gemini down'));

      await expect(unifiedGenerator.generateWithFallback('test prompt', {
        preferred: 'claude',
        fallback: 'gemini'
      })).rejects.toThrow('All AI services unavailable');
    });
  });

  describe('토큰 사용량 추적', () => {
    test('모델별 토큰 사용량 집계', async () => {
      // 여러 요청 시뮬레이션
      await unifiedGenerator.callClaude('test 1');
      await unifiedGenerator.callGemini('test 2');
      await unifiedGenerator.callClaude('test 3');

      const usage = unifiedGenerator.getTokenUsage();

      expect(usage.claude).toBe(2000); // 2 * 1000
      expect(usage.gemini).toBe(800);   // 1 * 800
      expect(usage.total).toBe(2800);
    });

    test('일일 토큰 예산 모니터링', () => {
      unifiedGenerator.setDailyBudget(10000);
      unifiedGenerator.tokenUsage.total = 8500;

      const status = unifiedGenerator.getBudgetStatus();

      expect(status.used).toBe(8500);
      expect(status.remaining).toBe(1500);
      expect(status.percentage).toBe(85);
      expect(status.nearLimit).toBe(true);
    });
  });

  describe('품질 검증', () => {
    test('생성된 콘텐츠 마크다운 형식 검증', async () => {
      const mockResponse = {
        content: `
> "안녕하세요. 저는 카이런입니다."

> *'드디어 만났구나... 운명의 그 사람을.'*

> [에이라가 놀란 듯 뒤돌아본다]

**에이라**는 신비로운 미소를 지었다.
        `,
        usage: { tokens: 1200 }
      };

      vi.spyOn(unifiedGenerator, 'callClaude').mockResolvedValue(mockResponse);

      const result = await unifiedGenerator.generateChapterContent({
        novel: 'test',
        chapter: 1,
        targetLength: 2000
      });

      expect(result.content).toMatch(/> ".*"/); // 대화 형식
      expect(result.content).toMatch(/> \*'.*'\*/); // 내적 독백
      expect(result.content).toMatch(/> \[.*\]/); // 액션
      expect(result.content).toMatch(/\*\*.*\*\*/); // 강조
    });

    test('캐릭터 일관성 검증', async () => {
      const characters = [
        { name: '카이런', traits: ['지적', '내성적', '신중함'] },
        { name: '에이라', traits: ['활발', '호기심', '용감함'] }
      ];

      const content = await unifiedGenerator.generateChapterContent({
        novel: 'test',
        chapter: 5,
        characters,
        previousContext: '카이런은 도서관에서 조용히 책을 읽고 있었다.'
      });

      expect(content.characterConsistency).toBeDefined();
      expect(content.characterConsistency.score).toBeGreaterThan(0.7);
    });
  });

  describe('에러 처리 및 로깅', () => {
    test('API 호출 실패 로깅', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.spyOn(unifiedGenerator, 'callClaude').mockRejectedValue(new Error('API Error'));

      try {
        await unifiedGenerator.generateContent('test prompt', { model: 'claude' });
      } catch (error) {
        // 에러가 예상됨
      }

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('잘못된 설정값 처리', () => {
      expect(() => {
        new UnifiedAIGenerator({ invalidKey: 'invalid' });
      }).not.toThrow();
    });
  });

  describe('성능 최적화', () => {
    test('동시 요청 처리', async () => {
      const promises = [
        unifiedGenerator.generateContent('prompt 1'),
        unifiedGenerator.generateContent('prompt 2'),
        unifiedGenerator.generateContent('prompt 3')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      });
    });

    test('응답 시간 측정', async () => {
      const startTime = Date.now();
      
      await unifiedGenerator.generateContent('test prompt');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(5000); // 5초 이내
    });
  });
});