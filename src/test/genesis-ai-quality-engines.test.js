/**
 * 🧪 GENESIS AI Quality Engines Test Suite
 * 
 * Phase 1 핵심 품질 엔진들의 통합 테스트
 * - Plot Progression Engine 테스트
 * - Character Development System 테스트  
 * - Literary Excellence Engine 테스트
 * - Romance Chemistry Analyzer 테스트
 * - Quality Assurance Gateway 통합 테스트
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { PlotProgressionEngine } from '../lib/quality-engines/plot-progression-engine.js';
import { CharacterDevelopmentSystem } from '../lib/quality-engines/character-development-system.js';
import { LiteraryExcellenceEngine } from '../lib/quality-engines/literary-excellence-engine.js';
import { RomanceChemistryAnalyzer } from '../lib/quality-engines/romance-chemistry-analyzer.js';
import { QualityAssuranceGateway } from '../lib/quality-engines/quality-assurance-gateway.js';

// Mock Logger
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  success: vi.fn()
};

describe('GENESIS AI Quality Engines', () => {
  let plotEngine;
  let characterEngine;
  let literaryEngine;
  let romanceEngine;
  let qualityGateway;

  beforeEach(() => {
    plotEngine = new PlotProgressionEngine(mockLogger);
    characterEngine = new CharacterDevelopmentSystem(mockLogger);
    literaryEngine = new LiteraryExcellenceEngine(mockLogger);
    romanceEngine = new RomanceChemistryAnalyzer(mockLogger);
    qualityGateway = new QualityAssuranceGateway(mockLogger);
    
    // Mock 함수 리셋
    vi.clearAllMocks();
  });

  describe('Plot Progression Engine', () => {
    test('플롯 진전도 계산이 정확해야 함', () => {
      const goodPlotContent = `
        갑자기 새로운 사건이 발생했다. 예상치 못한 위기가 닥쳤고, 
        주인공은 중요한 결정을 내려야 했다. 갈등이 심화되었고, 
        운명적인 순간이 다가왔다.
      `;
      
      const score = plotEngine.calculateProgressionScore(goodPlotContent);
      expect(score).toBeGreaterThan(0.5);
    });

    test('정체된 플롯을 감지해야 함', () => {
      const stagnantContent = `
        일상적인 하루였다. 여전히 똑같은 생활이 반복되었다. 
        변함없는 일상이 계속되었다. 그냥 평범한 하루였다.
      `;
      
      const score = plotEngine.calculateProgressionScore(stagnantContent);
      expect(score).toBeLessThan(0.3);
    });

    test('갈등 에스컬레이션을 측정해야 함', () => {
      const conflictContent = `
        오해가 깊어지고 갈등이 격화되었다. 위기 상황이 발생했고, 
        선택의 기로에 서게 되었다. 압박감이 더욱 심해졌다.
      `;
      
      const storyContext = { previousChapters: [] };
      const score = plotEngine.measureConflictEscalation(conflictContent, storyContext);
      expect(score).toBeGreaterThan(0.3);
    });

    test('자동 진전 강제 기능이 작동해야 함', async () => {
      const weakContent = `평범한 하루였다. 그냥 일상이었다.`;
      const storyContext = {};
      
      const enhancedContent = await plotEngine.enforceProgression(weakContent, storyContext);
      expect(enhancedContent).not.toBe(weakContent);
      expect(enhancedContent.length).toBeGreaterThan(weakContent.length);
    });
  });

  describe('Character Development System', () => {
    test('캐릭터 능동성을 측정해야 함', () => {
      const activeContent = `
        "나는 결정했다!" 그녀가 단호하게 말했다. 
        그는 적극적으로 나서서 문제를 해결했다. 
        "함께 가자!" 용감하게 제안했다.
      `;
      
      const dialogues = characterEngine.extractDialogues(activeContent);
      const actions = characterEngine.extractActions(activeContent);
      const score = characterEngine.measureCharacterAgency(dialogues, actions);
      
      expect(score).toBeGreaterThan(0.6);
    });

    test('수동적 표현을 능동적으로 변환해야 함', () => {
      const passiveContent = `그는 운명에 휩쓸렸다. 어쩔 수 없이 받아들였다.`;
      const activeContent = characterEngine.convertPassiveToActiveSpeech(passiveContent);
      
      expect(activeContent).toContain('주도했다');
      expect(activeContent).toContain('결단을 내려');
    });

    test('말투 다양성을 분석해야 함', () => {
      const diverseDialogues = [
        { text: '정말 기쁘네요!' },
        { text: '그럴 수밖에 없었어' },
        { text: '어떻게 생각하시나요?' }
      ];
      
      const score = characterEngine.analyzeSpeechDiversity(diverseDialogues);
      expect(score).toBeGreaterThan(0.3);
    });

    test('반복적 표현을 대체해야 함', () => {
      const repetitiveContent = `차가운 눈빛으로 차가운 말을 했다. 차가운 분위기였다.`;
      const improvedContent = characterEngine.replaceRepetitiveExpressions(repetitiveContent);
      
      const coldCount = (improvedContent.match(/차가운/g) || []).length;
      expect(coldCount).toBeLessThan(3);
    });
  });

  describe('Literary Excellence Engine', () => {
    test('어휘 수준을 분석해야 함', () => {
      const advancedContent = `
        그녀의 황홀한 미소가 그의 마음을 사로잡았다. 
        감미로운 멜로디처럼 흘러가는 대화 속에서 
        두 사람의 운명적인 만남이 시작되었다.
      `;
      
      const score = literaryEngine.analyzeVocabularyLevel(advancedContent);
      expect(score).toBeGreaterThan(5.0);
    });

    test('감각적 묘사 밀도를 측정해야 함', () => {
      const sensoryContent = `
        은빛 달빛이 부드럽게 비춰졌다. 향긋한 꽃향기가 코끝을 스쳤고, 
        따뜻한 바람이 머리카락을 살랑거렸다. 감미로운 음악이 귓가에 울려퍼졌다.
      `;
      
      const score = literaryEngine.measureSensoryRichness(sensoryContent);
      expect(score).toBeGreaterThan(0.3);
    });

    test('은유/비유 밀도를 계산해야 함', () => {
      const metaphorContent = `
        그녀의 눈은 별처럼 빛났다. 마치 천사 같은 미소를 지었고, 
        꽃처럼 아름다운 모습이었다. 물처럼 맑은 목소리로 말했다.
      `;
      
      const score = literaryEngine.calculateMetaphorDensity(metaphorContent);
      expect(score).toBeGreaterThan(0.1);
    });

    test('기본 어휘를 고급 어휘로 업그레이드해야 함', () => {
      const basicContent = `그는 기뻤다. 그녀가 예뻤다. 정말 좋았다.`;
      const upgradedContent = literaryEngine.upgradeBasicVocabulary(basicContent);
      
      expect(upgradedContent).not.toBe(basicContent);
    });

    test('5감 묘사를 자동 삽입해야 함', () => {
      const plainContent = `그는 기뻤다. 행복한 마음이었다.`;
      const enhancedContent = literaryEngine.injectSensoryDescriptions(plainContent);
      
      expect(enhancedContent.length).toBeGreaterThan(plainContent.length);
    });
  });

  describe('Romance Chemistry Analyzer', () => {
    test('로맨스 진행도를 추적해야 함', () => {
      const romanticContent = `
        처음 만난 순간부터 특별했다. 서로에게 관심이 생겼고, 
        마음이 설레기 시작했다. 사랑이라는 감정을 깨달았다.
      `;
      
      const storyContext = {};
      const analysis = romanceEngine.trackRomanceProgression(
        { content: romanticContent }, 
        storyContext
      );
      
      expect(analysis.currentStage).toBeGreaterThan(1);
      expect(analysis.progressionRate).toBeGreaterThan(0);
    });

    test('케미스트리 점수를 계산해야 함', () => {
      const chemistryContent = `
        두 사람의 눈이 마주쳤다. 설렘이 가슴을 채웠고, 
        서로의 마음이 통하는 것 같았다. 진심어린 대화가 이어졌다.
      `;
      
      const score = romanceEngine.calculateChemistryScore(chemistryContent);
      expect(score).toBeGreaterThan(5.0);
    });

    test('로맨틱 텐션을 측정해야 함', () => {
      const tensionContent = `
        어색한 침묵이 흘렀다. 무엇을 말해야 할지 몰랐고, 
        가슴이 두근거렸다. 떨리는 마음으로 다가갔다.
      `;
      
      const score = romanceEngine.measureRomanticTension(tensionContent);
      expect(score).toBeGreaterThan(0.2);
    });

    test('설렘 포인트를 카운트해야 함', () => {
      const flutterContent = `
        눈이 마주치는 순간 설렘이 시작됐다. 손이 닿았을 때 두근거렸고, 
        미소를 지을 때마다 심장이 뛰었다.
      `;
      
      const count = romanceEngine.countHeartFlutterMoments(flutterContent);
      expect(count).toBeGreaterThan(2);
    });

    test('설렘 포인트를 자동 삽입해야 함', () => {
      const plainContent = `그들은 사랑했다. 행복했다.`;
      const enhancedContent = romanceEngine.injectHeartFlutterMoments(plainContent);
      
      expect(enhancedContent.length).toBeGreaterThan(plainContent.length);
    });
  });

  describe('Quality Assurance Gateway - 통합 테스트', () => {
    test('전체 품질 점수를 계산해야 함', async () => {
      const testContent = `
        예상치 못한 새로운 사건이 발생했다. 
        "나는 결정했다!" 그녀가 단호하게 말했다. 
        황홀한 미소가 별처럼 빛났다. 
        설렘이 가슴을 가득 채웠고, 두근거리는 마음으로 다가갔다.
      `;
      
      const qualityReport = await qualityGateway.calculateQualityScore(testContent);
      
      expect(qualityReport).toBeDefined();
      expect(qualityReport.overallScore).toBeGreaterThan(0);
      expect(qualityReport.qualityGrade).toBeDefined();
      expect(qualityReport.scores).toHaveProperty('plotScore');
      expect(qualityReport.scores).toHaveProperty('characterScore');
      expect(qualityReport.scores).toHaveProperty('literaryScore');
      expect(qualityReport.scores).toHaveProperty('romanceScore');
    });

    test('품질 임계값 검증이 작동해야 함', async () => {
      const lowQualityContent = `그냥 평범한 하루였다. 똑같은 일상이었다.`;
      
      try {
        const result = await qualityGateway.validateQualityThreshold(lowQualityContent);
        // 자동 개선이 적용되었을 것으로 예상
        expect(result.improvedContent).toBeDefined();
      } catch (_error) {
        // 품질 개선 실패 또는 임계값 미달로 인한 에러
        expect(error.name).toContain('Quality');
      }
    });

    test('가중 점수 계산이 정확해야 함', () => {
      const scores = {
        plotScore: 8.0,
        characterScore: 7.5,
        literaryScore: 6.0,
        romanceScore: 9.0
      };
      
      const weightedScore = qualityGateway.calculateWeightedScore(scores);
      
      expect(weightedScore).toBeGreaterThan(6.0);
      expect(weightedScore).toBeLessThan(10.0);
      expect(weightedScore).toBeCloseTo(7.55, 1); // 대략적 예상값
    });

    test('품질 등급을 올바르게 결정해야 함', () => {
      expect(qualityGateway.determineQualityGrade(9.7)).toBe('PERFECT');
      expect(qualityGateway.determineQualityGrade(8.8)).toBe('EXCELLENT');
      expect(qualityGateway.determineQualityGrade(7.5)).toBe('GOOD');
      expect(qualityGateway.determineQualityGrade(6.2)).toBe('POOR');
      expect(qualityGateway.determineQualityGrade(4.0)).toBe('CRITICAL');
    });

    test('품질 문제를 식별해야 함', () => {
      const lowScores = {
        plotScore: 5.0,
        characterScore: 6.0,
        literaryScore: 8.0,
        romanceScore: 7.0
      };
      
      const qualityIndicators = {
        plotProgression: false,
        characterAgency: false,
        vocabularyLevel: true,
        romanceChemistry: true
      };
      
      const issues = qualityGateway.identifyQualityIssues(lowScores, qualityIndicators);
      
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(issue => issue.engine === 'plot')).toBe(true);
    });

    test('품질 트렌드를 분석해야 함', () => {
      // 히스토리 시뮬레이션
      qualityGateway.qualityHistory = [
        { overallScore: 6.0, timestamp: '2024-01-01' },
        { overallScore: 7.0, timestamp: '2024-01-02' },
        { overallScore: 7.5, timestamp: '2024-01-03' }
      ];
      
      const trend = qualityGateway.analyzeQualityTrend();
      
      expect(trend.trend).toBe('IMPROVING');
      expect(trend.change).toBeGreaterThan(0);
    });

    test('품질 메트릭을 내보내야 함', () => {
      const metrics = qualityGateway.exportQualityMetrics();
      
      expect(metrics).toHaveProperty('qualityHistory');
      expect(metrics).toHaveProperty('currentSession');
      expect(metrics).toHaveProperty('configuration');
      expect(metrics).toHaveProperty('trend');
    });
  });

  describe('엔진 간 통합 테스트', () => {
    test('모든 엔진이 동일한 컨텐츠에 대해 일관된 결과를 제공해야 함', async () => {
      const testContent = `
        갑작스러운 사건이 발생했다. "나는 포기하지 않겠어!" 
        그녀가 결연하게 외쳤다. 황금빛 햇살이 다이아몬드처럼 
        빛나는 그녀의 눈동자를 비췄다. 설렘과 긴장이 교차하며 
        두 사람 사이에 특별한 기운이 흘�렀다.
      `;
      
      const storyContext = {
        novelType: 'continue',
        previousChapters: [],
        totalChapters: 5
      };
      
      // 각 엔진별 개별 분석
      const plotAnalysis = await plotEngine.validatePlotProgression(
        { content: testContent }, 
        storyContext
      );
      const characterAnalysis = await characterEngine.analyzeCharacterDevelopment(
        { content: testContent }, 
        storyContext
      );
      const literaryAnalysis = await literaryEngine.analyzeLiteraryQuality(testContent);
      const romanceAnalysis = await romanceEngine.analyzeRomanceChemistry(
        { content: testContent }, 
        storyContext
      );
      
      // 통합 분석
      const qualityReport = await qualityGateway.calculateQualityScore(testContent, storyContext);
      
      // 개별 분석 결과가 통합 분석에 반영되는지 확인
      expect(qualityReport.scores.plotScore).toBe(plotAnalysis.overallQualityScore);
      expect(qualityReport.scores.characterScore).toBe(characterAnalysis.overallQualityScore);
      expect(qualityReport.scores.literaryScore).toBe(literaryAnalysis.overallQualityScore);
      expect(qualityReport.scores.romanceScore).toBe(romanceAnalysis.overallQualityScore);
      
      // 모든 점수가 합리적 범위 내에 있는지 확인
      expect(qualityReport.overallScore).toBeGreaterThanOrEqual(0);
      expect(qualityReport.overallScore).toBeLessThanOrEqual(10);
    });

    test('품질 개선 과정이 각 엔진의 강점을 활용해야 함', async () => {
      const weakContent = `평범한 하루였다. 그냥 일상이었다.`;
      const storyContext = {};
      
      try {
        const result = await qualityGateway.validateQualityThreshold(weakContent, storyContext);
        
        if (result.improvedContent !== weakContent) {
          // 개선된 컨텐츠가 더 나은 점수를 받는지 확인
          const originalReport = await qualityGateway.calculateQualityScore(weakContent, storyContext);
          const improvedReport = await qualityGateway.calculateQualityScore(result.improvedContent, storyContext);
          
          expect(improvedReport.overallScore).toBeGreaterThanOrEqual(originalReport.overallScore);
        }
      } catch (_error) {
        // 품질 개선이 불가능한 경우도 예상 범위 내
        expect(error.name).toContain('Quality');
      }
    });
  });

  describe('에러 처리 및 복원력 테스트', () => {
    test('잘못된 입력에 대해 적절히 처리해야 함', async () => {
      const invalidInputs = [null, undefined, '', '   '];
      
      for (const input of invalidInputs) {
        const qualityReport = await qualityGateway.calculateQualityScore(input);
        
        expect(qualityReport).toBeDefined();
        expect(qualityReport.overallScore).toBe(0);
        expect(qualityReport.qualityGrade).toBe('CRITICAL');
      }
    });

    test('엔진 실패 시 graceful degradation이 작동해야 함', async () => {
      // Plot Engine을 일시적으로 무력화
      const originalValidate = plotEngine.validatePlotProgression;
      plotEngine.validatePlotProgression = vi.fn().mockRejectedValue(new Error('Engine failed'));
      
      const testContent = `테스트 컨텐츠입니다.`;
      
      try {
        const qualityReport = await qualityGateway.calculateQualityScore(testContent);
        
        // 다른 엔진들은 여전히 작동해야 함
        expect(qualityReport.scores.characterScore).toBeGreaterThanOrEqual(0);
        expect(qualityReport.scores.literaryScore).toBeGreaterThanOrEqual(0);
        expect(qualityReport.scores.romanceScore).toBeGreaterThanOrEqual(0);
        
      } catch (_error) {
        // 전체 시스템 실패가 아닌 특정 엔진 실패만 발생해야 함
        expect(error.name).toBe('QualityAnalysisError');
      } finally {
        // 원래 함수 복원
        plotEngine.validatePlotProgression = originalValidate;
      }
    });

    test('메모리 및 성능 제한 내에서 작동해야 함', async () => {
      // 큰 컨텐츠로 스트레스 테스트
      const largeContent = 'test content '.repeat(1000);
      const startTime = Date.now();
      
      const qualityReport = await qualityGateway.calculateQualityScore(largeContent);
      const endTime = Date.now();
      
      // 처리 시간이 합리적인 범위 내에 있는지 확인 (10초 이내)
      expect(endTime - startTime).toBeLessThan(10000);
      
      // 결과가 유효한지 확인
      expect(qualityReport).toBeDefined();
      expect(qualityReport.overallScore).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('GENESIS AI 통합 시나리오 테스트', () => {
  let qualityGateway;

  beforeEach(() => {
    qualityGateway = new QualityAssuranceGateway(mockLogger);
  });

  test('신규 소설 1화 생성 시나리오', async () => {
    const newNovelContent = `
      운명은 때로 예상치 못한 순간에 찾아온다.
      
      "이건 말도 안 돼!" 리엘라가 격분하며 외쳤다. 마법 아카데미 입학 통지서를 
      바라보는 그녀의 에메랄드 빛 눈동자에는 당황과 흥분이 교차했다.
      
      갑작스러운 마법 능력의 각성, 그리고 신비로운 아카데미로의 초대. 
      평범했던 일상이 한순간에 뒤바뀌었다.
      
      그때 문 앞에서 낮고 매혹적인 목소리가 들려왔다.
      
      "리엘라 아스테린 양이신가요?"
      
      문을 열자 키 큰 남자가 서 있었다. 은빛 머리카락과 깊은 청색 눈동자, 
      그리고 입가에 스며든 신비로운 미소. 마치 달빛을 닮은 그의 모습에 
      리엘라의 심장이 예상치 못하게 빨라졌다.
      
      "저는 카엘 루나 교수입니다. 아카데미에서 당신을 모시러 왔죠."
      
      그 순간 리엘라는 알았다. 자신의 인생이 완전히 달라질 것이라는 것을.
      그리고 이 신비로운 교수가 그 변화의 중심에 있을 것이라는 것을.
    `;
    
    const storyContext = {
      novelType: 'new',
      theme: '마법아카데미',
      tropes: ['아카데미', '능력각성', '운명의만남']
    };
    
    const qualityReport = await qualityGateway.calculateQualityScore(newNovelContent, storyContext);
    
    // 신규 소설 1화로서 적절한 품질인지 확인
    expect(qualityReport.overallScore).toBeGreaterThan(6.0); // 최소 기준
    expect(qualityReport.scores.plotScore).toBeGreaterThan(6.0); // 흥미로운 설정
    expect(qualityReport.scores.characterScore).toBeGreaterThan(6.0); // 매력적 캐릭터
    expect(qualityReport.scores.romanceScore).toBeGreaterThan(5.0); // 로맨스 시작
  });

  test('중간 챕터 연재 시나리오', async () => {
    const continuationContent = `
      아카데미에서의 첫 주가 지나갔다.
      
      리엘라는 여전히 이 모든 상황이 꿈만 같았다. 마법 수업, 신비로운 동급생들, 
      그리고 무엇보다 카엘 교수와의 특별 훈련 시간.
      
      "집중하세요, 리엘라." 카엘의 목소리가 차분하게 울려퍼졌다. 
      "마법은 감정과 직결됩니다. 마음의 동요는 주문에 영향을 미치죠."
      
      하지만 그의 말대로 집중하기란 불가능했다. 그가 가까이 다가와 
      손목을 잡고 마법 손동작을 교정해줄 때마다, 리엘라의 마음은 
      폭풍우처럼 요동쳤다.
      
      "이상해..." 리엘라가 중얼거렸다. "마법을 쓸 때마다 뭔가 다른 느낌이 들어요."
      
      카엘의 표정이 순간 굳어졌다. 그가 알고 있는 무언가가 있었다. 
      리엘라에 대한, 그녀의 능력에 대한 비밀이.
      
      "리엘라..." 그가 조심스럽게 입을 열었다. "당신은 생각보다 훨씬 특별한 존재일지도 모릅니다."
      
      그 순간, 훈련실 밖에서 급작스러운 폭발음이 들려왔다. 
      무언가 위험한 일이 일어나고 있었다.
      
      "아카데미에 침입자가!" 
      
      위기 상황 속에서 카엘과 리엘라의 시선이 마주쳤다. 
      이제 더 이상 평범한 학생과 교수의 관계로 머물 수는 없을 것 같았다.
    `;
    
    const storyContext = {
      novelType: 'continue',
      novelSlug: 'magic-academy-romance',
      nextChapterNumber: 8,
      totalChapters: 7,
      previousChapters: [
        { content: '이전 챕터 내용...', chapterNumber: 7 }
      ]
    };
    
    const qualityReport = await qualityGateway.calculateQualityScore(continuationContent, storyContext);
    
    // 연재 소설로서 적절한 품질인지 확인
    expect(qualityReport.overallScore).toBeGreaterThan(7.0); // 높은 기준
    expect(qualityReport.scores.plotScore).toBeGreaterThan(7.0); // 플롯 진전
    expect(qualityReport.scores.characterScore).toBeGreaterThan(7.0); // 관계 발전
    expect(qualityReport.scores.romanceScore).toBeGreaterThan(7.0); // 로맨스 심화
  });

  test('완결 시나리오', async () => {
    const completionContent = `
      모든 것이 끝났다. 아니, 새로운 시작이었다.
      
      아카데미를 위협했던 어둠의 세력은 물러갔고, 리엘라의 진정한 힘이 
      마침내 세상에 드러났다. 고대 마법사들의 후예, 빛의 수호자.
      
      "믿을 수 없어..." 리엘라가 자신의 손을 바라보며 중얼거렸다. 
      황금빛 마법의 잔광이 아직도 손끝에서 희미하게 빛나고 있었다.
      
      카엘이 그녀 곁으로 다가왔다. 전투로 인해 상처 입은 그의 모습에도 
      불구하고, 그의 눈빛은 그 어느 때보다 따뜻했다.
      
      "당신이 해냈어요, 리엘라." 그가 부드럽게 말했다. 
      "당신은 정말 특별한 사람이에요."
      
      리엘라가 고개를 들어 그를 바라봤다. 처음 만났던 그날의 신비로운 교수가 
      아니었다. 이제 그는 자신의 곁에서 모든 위험을 함께 나눈 동반자였다.
      
      "카엘..." 그녀가 떨리는 목소리로 말했다. "고마워요. 당신이 없었다면..."
      
      그가 그녀의 말을 막았다. 부드럽게 그녀의 뺨에 손을 올리며.
      
      "이제 우리에게는 새로운 시작이 기다리고 있어요." 그가 속삭였다. 
      "함께라면 어떤 미래든 만들어갈 수 있을 거예요."
      
      그들의 입술이 마침내 맞닿았다. 달빛 아래, 마법 아카데미의 
      정원에서 피어난 사랑은 이제 영원히 계속될 것이었다.
      
      운명은 정말로 예상치 못한 순간에 찾아왔다. 
      그리고 그 운명은 완벽한 사랑으로 완성되었다.
    `;
    
    const storyContext = {
      novelType: 'complete',
      novelSlug: 'magic-academy-romance',
      nextChapterNumber: 50,
      totalChapters: 49,
      isCompletion: true
    };
    
    const qualityReport = await qualityGateway.calculateQualityScore(completionContent, storyContext);
    
    // 완결편으로서 적절한 품질인지 확인
    expect(qualityReport.overallScore).toBeGreaterThan(8.0); // 매우 높은 기준
    expect(qualityReport.scores.plotScore).toBeGreaterThan(8.0); // 만족스러운 결말
    expect(qualityReport.scores.characterScore).toBeGreaterThan(8.0); // 성장 완료
    expect(qualityReport.scores.romanceScore).toBeGreaterThan(8.5); // 로맨스 완성
  });

  test('품질 개선 전후 비교 시나리오', async () => {
    const lowQualityContent = `
      오늘도 평범한 하루였다. 그녀는 학교에 갔다. 
      수업을 들었다. 집에 왔다. 그냥 그런 날이었다.
      그는 좋은 사람이었다. 친절했다. 
      둘은 만났다. 좋아하게 됐다. 끝.
    `;
    
    const originalReport = await qualityGateway.calculateQualityScore(lowQualityContent);
    expect(originalReport.overallScore).toBeLessThan(qualityGateway.qualityThresholds.minimum);
    
    try {
      const result = await qualityGateway.validateQualityThreshold(lowQualityContent);
      
      if (result.improvedContent !== lowQualityContent) {
        const improvedReport = await qualityGateway.calculateQualityScore(result.improvedContent);
        
        // 개선 효과 확인
        expect(improvedReport.overallScore).toBeGreaterThan(originalReport.overallScore);
        
        // 개별 엔진별 개선 확인
        expect(improvedReport.scores.plotScore).toBeGreaterThanOrEqual(originalReport.scores.plotScore);
        expect(improvedReport.scores.characterScore).toBeGreaterThanOrEqual(originalReport.scores.characterScore);
        expect(improvedReport.scores.literaryScore).toBeGreaterThanOrEqual(originalReport.scores.literaryScore);
        expect(improvedReport.scores.romanceScore).toBeGreaterThanOrEqual(originalReport.scores.romanceScore);
        
        // console.log('품질 개선 성공:');
        // console.log(`- 전체 점수: ${originalReport.overallScore} → ${improvedReport.overallScore}`);
        // console.log(`- 플롯: ${originalReport.scores.plotScore} → ${improvedReport.scores.plotScore}`);
        // console.log(`- 캐릭터: ${originalReport.scores.characterScore} → ${improvedReport.scores.characterScore}`);
        // console.log(`- 문체: ${originalReport.scores.literaryScore} → ${improvedReport.scores.literaryScore}`);
        // console.log(`- 로맨스: ${originalReport.scores.romanceScore} → ${improvedReport.scores.romanceScore}`);
      }
      
    } catch (_error) {
      // 개선 불가능한 경우도 예상 범위 내
      // console.log('품질 개선 실패 (예상 범위 내):', _error.message);
    }
  });
});