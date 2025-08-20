/**
 * QualityThresholdAgent 테스트
 * 동적 임계값 조정 시스템의 올바른 동작 검증
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QualityThresholdAgent } from '../lib/quality-engines/quality-threshold-agent.js';

// 모킹된 로거
const mockLogger = {
  info: async (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  success: async (msg, data) => console.log(`[SUCCESS] ${msg}`, data || ''),
  warn: async (msg, data) => console.log(`[WARN] ${msg}`, data || ''),
  error: async (msg, data) => console.log(`[ERROR] ${msg}`, data || ''),
};

describe('QualityThresholdAgent', () => {
  let agent;

  beforeEach(() => {
    agent = new QualityThresholdAgent(mockLogger);
  });

  describe('컨텐츠 특성 분석', () => {
    it('기본 한국어 로맨스 판타지 컨텐츠를 올바르게 분석해야 함', async () => {
      const testContent = `
        마법사 엘리아는 처음 그를 만났을 때부터 심장이 두근거렸다.
        그의 깊은 눈빛이 자신을 바라볼 때마다 설렘을 감출 수 없었다.
        "당신을 지키고 싶어요." 그가 말했을 때, 그녀의 마음은 완전히 그에게 기울어졌다.
        하지만 그들 사이에는 운명이라는 큰 벽이 가로막고 있었다.
        마법의 힘이 점점 강해져가고, 위험한 상황이 계속 이어졌다.
        그럼에도 불구하고 서로에 대한 사랑은 더욱 깊어져만 갔다.
      `;

      const storyContext = {
        currentChapter: 5,
        characters: ['엘리아', '남주인공'],
        plotPoints: ['첫만남', '마법각성', '위기상황']
      };

      const analysis = await agent.analyzeContentCharacteristics(testContent, storyContext);

      expect(analysis).toHaveProperty('linguistic');
      expect(analysis).toHaveProperty('genre');
      expect(analysis).toHaveProperty('emotional');
      expect(analysis).toHaveProperty('structural');
      expect(analysis).toHaveProperty('contextual');
      expect(analysis).toHaveProperty('overallCharacteristics');

      // 언어적 특성
      expect(analysis.linguistic.overallScore).toBeGreaterThan(0.3);
      expect(analysis.linguistic.vocabularyDiversity).toBeGreaterThan(0);
      expect(analysis.linguistic.emotionalFrequency).toBeGreaterThan(0);

      // 장르적 특성
      expect(analysis.genre.overallScore).toBeGreaterThan(0.1);
      expect(analysis.genre.fantasyIntensity).toBeGreaterThan(0);
      expect(analysis.genre.romanceProgression).toBeGreaterThan(0);

      // 감정적 특성
      expect(analysis.emotional.overallScore).toBeGreaterThan(0.1);
      expect(analysis.emotional.romanticIntensity).toBeGreaterThan(0);
      expect(analysis.emotional.emotionalIntensity).toBeGreaterThan(0);
    });

    it('감정 표현이 부족한 컨텐츠를 올바르게 식별해야 함', async () => {
      const testContent = `
        그는 집에 갔다. 책을 읽었다. 잠을 잤다.
        다음 날 일어나서 아침을 먹었다.
        학교에 가서 수업을 들었다.
      `;

      const analysis = await agent.analyzeContentCharacteristics(testContent);

      expect(analysis.emotional.romanticIntensity).toBeLessThan(0.2);
      expect(analysis.emotional.emotionalIntensity).toBeLessThan(0.3);
      expect(analysis.genre.romanceProgression).toBeLessThan(0.2);
    });
  });

  describe('동적 임계값 계산', () => {
    it('낮은 품질 컨텐츠에 대해 임계값을 완화해야 함', async () => {
      const lowQualityContent = `
        그는 갔다. 왔다. 또 갔다. 
        같은 일이 반복되었다. 변함없이 계속되었다.
      `;

      const contentCharacteristics = await agent.analyzeContentCharacteristics(lowQualityContent);
      const dynamicThresholds = await agent.calculateDynamicThresholds(contentCharacteristics);

      expect(dynamicThresholds.minimum).toBeLessThan(7.0); // 기본 임계값보다 낮아야 함
      expect(dynamicThresholds.minimum).toBeGreaterThan(4.0); // 최소 안전값 유지
    });

    it('높은 품질 컨텐츠에 대해 임계값을 상향 조정해야 함', async () => {
      const highQualityContent = `
        마법사 엘리아의 아름다운 눈빛이 그를 사로잡았다. 
        그녀의 신비로운 힘과 우아한 움직임, 그리고 따뜻한 미소가
        그의 마음 깊숙이 스며들어 영원한 사랑의 불꽃을 피워올렸다.
        운명적인 만남이 그들의 인생을 완전히 바꿔놓았고,
        서로를 향한 간절한 그리움이 모든 시련을 이겨낼 힘이 되었다.
      `;

      const contentCharacteristics = await agent.analyzeContentCharacteristics(highQualityContent);
      const dynamicThresholds = await agent.calculateDynamicThresholds(contentCharacteristics);

      // 높은 품질이므로 임계값이 상향되거나 유지되어야 함
      expect(dynamicThresholds.minimum).toBeGreaterThanOrEqual(6.5);
    });
  });

  describe('엔진별 가중치 조정', () => {
    it('로맨스 강도가 높은 경우 로맨스 가중치를 증가시켜야 함', async () => {
      const romanticContent = `
        그의 뜨거운 시선이 나를 바라볼 때마다 심장이 미친 듯 뛰었다.
        사랑한다는 그 한 마디에 온 세상이 아름다워 보였다.
        설레는 마음을 감출 수 없어 얼굴이 빨갛게 달아올랐다.
        그리움과 애틋함이 교차하는 이 감정을 어떻게 표현해야 할까.
      `;

      const contentCharacteristics = await agent.analyzeContentCharacteristics(romanticContent);
      const adjustedWeights = await agent.adjustEngineWeights(contentCharacteristics);

      expect(adjustedWeights.romance).toBeGreaterThanOrEqual(0.20); // 기본값과 같거나 높아야 함
      
      // 가중치 합이 1.0이어야 함
      const sum = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
      expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
    });

    it('대화가 많은 경우 캐릭터 가중치를 증가시켜야 함', async () => {
      const dialogueHeavyContent = `
        "안녕하세요." 그녀가 말했다.
        "반갑습니다." 그가 대답했다.
        "날씨가 좋네요." 그녀가 웃으며 말했다.
        "그러게요. 산책하기 좋은 날이에요." 그도 미소를 지었다.
        "함께 걸어볼까요?" 그녀가 제안했다.
        "좋은 생각이네요." 그가 동의했다.
      `;

      const contentCharacteristics = await agent.analyzeContentCharacteristics(dialogueHeavyContent);
      const adjustedWeights = await agent.adjustEngineWeights(contentCharacteristics);

      expect(adjustedWeights.character).toBeGreaterThanOrEqual(0.25); // 기본값과 같거나 높아야 함
      
      // 가중치 합이 1.0이어야 함
      const sum = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
      expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
    });
  });

  describe('한국어 로맨스 판타지 최적화', () => {
    it('PlotProgressionEngine 설정을 적절히 조정해야 함', async () => {
      const testContent = `
        마법사 학교의 첫날, 엘리아는 긴장한 마음으로 교실에 들어섰다.
        그곳에서 운명적으로 만난 그는 신비로운 아우라를 풍기고 있었다.
      `;

      const contentCharacteristics = await agent.analyzeContentCharacteristics(testContent);
      const optimization = await agent.optimizeForKoreanRomanceFantasy(contentCharacteristics, {
        plot: { progressionScore: 0 } // 문제가 있는 상황 시뮬레이션
      });

      expect(optimization).toHaveProperty('engineConfigs');
      expect(optimization.engineConfigs).toHaveProperty('plot');
      expect(optimization.engineConfigs.plot.thresholds.progression).toBeLessThan(0.6); // 완화되어야 함
    });

    it('RomanceChemistryAnalyzer 설정을 한국어 특성에 맞게 조정해야 함', async () => {
      const testContent = `
        조용한 침묵이 흐르는 가운데, 두 사람의 시선이 마주쳤다.
        말없는 소통이 이어지고, 서로의 마음을 이해하게 되었다.
      `;

      const contentCharacteristics = await agent.analyzeContentCharacteristics(testContent);
      const optimization = await agent.optimizeForKoreanRomanceFantasy(contentCharacteristics, {
        romance: { tensionLevel: 0.005 } // 매우 낮은 텐션 레벨
      });

      expect(optimization.engineConfigs).toHaveProperty('romance');
      expect(optimization.engineConfigs.romance.thresholds.tension).toBeLessThanOrEqual(0.65); // 완화되거나 같아야 함
    });
  });

  describe('통합 진단 및 최적화', () => {
    it('전체 시스템이 올바르게 작동해야 함', async () => {
      const testContent = `
        어둠의 마법사 발드론이 왕국을 위협하고 있었다.
        엘리아는 자신의 빛의 마법으로 맞서 싸우기로 결심했다.
        그 과정에서 기사 레오와의 운명적인 만남이 있었고,
        서로에게 점점 끌리게 되었다.
        하지만 위험한 전투가 계속되면서 둘의 사랑은 시련을 겪게 된다.
      `;

      const storyContext = {
        currentChapter: 8,
        characters: ['엘리아', '레오', '발드론'],
        plotPoints: ['마법각성', '첫만남', '위기', '고백']
      };

      const mockQualityAnalysis = {
        scores: {
          plotScore: 4.9,
          characterScore: 7.7,
          literaryScore: 7.0,
          romanceScore: 4.7
        }
      };

      const result = await agent.diagnoseAndOptimize(testContent, storyContext, mockQualityAnalysis);

      expect(result).toHaveProperty('contentCharacteristics');
      expect(result).toHaveProperty('optimizedThresholds');
      expect(result).toHaveProperty('optimizedWeights');
      expect(result).toHaveProperty('koreanOptimization');
      expect(result).toHaveProperty('optimizationSummary');

      // 최적화된 임계값이 기본값과 다르거나 같아야 함
      expect(result.optimizedThresholds.minimum).toBeGreaterThan(0);
      expect(result.optimizedThresholds.minimum).toBeLessThanOrEqual(8.0);

      // 권장사항이 생성되어야 함
      expect(Array.isArray(result.koreanOptimization.recommendations)).toBe(true);

      // 최적화 요약이 포함되어야 함
      expect(result.optimizationSummary).toHaveProperty('majorAdjustments');
      expect(result.optimizationSummary).toHaveProperty('expectedImprovements');
      expect(result.optimizationSummary).toHaveProperty('riskFactors');
    });
  });

  describe('에러 처리', () => {
    it('빈 컨텐츠에 대해 적절히 처리해야 함', async () => {
      const analysis = await agent.analyzeContentCharacteristics('');
      
      expect(analysis.linguistic.overallScore).toBe(0.5);
      expect(analysis.genre.overallScore).toBe(0.5);
      expect(analysis.emotional.overallScore).toBe(0.5);
    });

    it('null 컨텐츠에 대해 적절히 처리해야 함', async () => {
      const analysis = await agent.analyzeContentCharacteristics(null);
      
      expect(analysis.linguistic.overallScore).toBe(0.5);
      expect(analysis.genre.overallScore).toBe(0.5);
      expect(analysis.emotional.overallScore).toBe(0.5);
    });
  });
});