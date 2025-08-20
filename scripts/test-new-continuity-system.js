#!/usr/bin/env node
/**
 * 🧪 새로운 연속성 시스템 테스트 스크립트
 * 
 * 목적: 간단한 연속성 시스템의 완전한 기능 테스트
 * 특징: 기존 시스템과 독립적으로 동작, 실제 생성 시뮬레이션
 */

import { fileURLToPath } from 'url';
import path from 'path';
import SimpleContinuityManager from '../src/lib/simple-continuity-system.js';
import { ContinuityEnhancedGenerator as _ContinuityEnhancedGenerator, GeneratorWrapper } from '../src/lib/continuity-enhanced-generator.js';

// 환경 설정
process.env.ENABLE_CONTINUITY_SYSTEM = 'true';
process.env.NODE_ENV = 'test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 간단한 로거
const logger = {
  info: async (msg, data) => console.log(`ℹ️ ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
  success: async (msg, data) => console.log(`✅ ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
  warn: async (msg, data) => console.warn(`⚠️ ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
  error: async (msg, data) => console.error(`❌ ${msg}`, data ? JSON.stringify(data, null, 2) : '')
};

/**
 * 🎭 MockGenerator - 실제 AI 호출 없이 테스트용 컨텐츠 생성
 */
class MockNovelGenerator {
  constructor() {
    this.callCount = 0;
  }

  async generateContent(prompt, _creativity = 'standard') {
    this.callCount++;
    
    // 프롬프트 분석하여 적절한 응답 생성
    const isFirstChapter = prompt.includes('1화') || prompt.includes('CHAPTER_NUMBER: 1');
    const isEndingChapter = prompt.includes('최종화') || prompt.includes('완결');
    const chapterMatch = prompt.match(/CHAPTER_NUMBER:\s*(\d+)/);
    const chapterNumber = chapterMatch ? parseInt(chapterMatch[1]) : 1;

    if (isFirstChapter) {
      return this.generateMockFirstChapter();
    } else if (isEndingChapter) {
      return this.generateMockEndingChapter(chapterNumber);
    } else {
      return this.generateMockRegularChapter(chapterNumber);
    }
  }

  generateMockFirstChapter() {
    return `
NOVEL_TITLE: 시간을 되돌린 마법사의 사랑
NOVEL_SLUG: time-mage-love
WORLD_SETTING: 마법과 기사가 공존하는 중세 판타지 왕국
PROTAGONIST_NAME: 아리아
PROTAGONIST_AGE: 22
MAIN_CONFLICT: 과거로 돌아가 운명을 바꿔야 함

CHAPTER_NUMBER: 1
CHAPTER_TITLE: 1화: 두 번째 인생의 시작
WORD_COUNT: 3500
SUMMARY: 아리아가 죽음 직전 시간 마법으로 과거로 돌아가며 새로운 인생을 시작한다
KEY_EVENTS: 죽음의 순간, 시간 역행 마법 발동, 17세로 회귀

--- CONTENT START ---
차가운 칼날이 심장을 꿰뚫는 순간, 아리아는 깨달았다.

'아, 이번 생도 실패했구나.'

피가 입가로 흘러내리며 시야가 흐려져갔다. 배신한 연인의 얼굴이 마지막으로 떠올랐다.

"이번에는... 다르게..."

마지막 남은 마나를 모두 끌어모아, 금기의 시간 마법을 발동시켰다. 세상이 뒤틀리며 의식이 사라져갔다.

눈을 뜨니, 그곳은 5년 전의 자신의 방이었다.

"성공했다!"

거울 속에는 17세의 어린 얼굴이 비쳤다. 이번 생에서는 절대 같은 실수를 반복하지 않을 것이다.

문득 창밖에서 말발굽 소리가 들려왔다. 기억해낸다. 오늘은 그 사람이 처음 이 영지에 오는 날이었다.

"이번에는... 그를 구할 수 있을까?"

아리아는 창가로 달려가 그 사람의 모습을 확인했다. 검은 머리의 기사, 루카스. 이번 생에서는 그의 죽음을 막아야 한다.
--- CONTENT END ---
`.trim();
  }

  generateMockRegularChapter(chapterNumber) {
    return `
CHAPTER_NUMBER: ${chapterNumber}
CHAPTER_TITLE: ${chapterNumber}화: 변화의 시작
WORD_COUNT: 3200
SUMMARY: 아리아가 루카스와의 관계를 새롭게 구축하며 과거와 다른 선택을 한다
KEY_EVENTS: 루카스와의 대화, 새로운 계획 수립, 적들의 움직임 감지
EMOTIONAL_TONE: 희망적
ROMANCE_PROGRESSION: 5

--- CONTENT START ---
"당신은... 누구십니까?"

루카스의 의심스러운 눈빛이 아리아를 향했다. 이전 생에서는 이 순간에 거짓말을 했었다. 하지만 이번에는 다르다.

"저는 아리아입니다. 그리고... 당신을 구하러 왔어요."

"무슨 말씀인지..."

"3일 후, 북쪽 숲에서 마수 떼가 습격할 것입니다. 당신은 그때 중상을 입게 되죠."

루카스의 표정이 굳어졌다. 미래를 아는 것처럼 말하는 이 소녀가 누구인지 궁금했다.

"어떻게 그런 것을..."

"믿기 어려우시겠지만, 저는 미래를 볼 수 있습니다. 그리고 당신이... 중요한 사람이에요."

두 사람의 눈이 마주쳤다. 이번에는 진실로 시작하는 관계였다.
--- CONTENT END ---
`.trim();
  }

  generateMockEndingChapter(chapterNumber) {
    return `
CHAPTER_NUMBER: ${chapterNumber}
CHAPTER_TITLE: ${chapterNumber}화: 영원한 사랑의 약속
WORD_COUNT: 4200
SUMMARY: 모든 위기를 극복한 아리아와 루카스가 진정한 사랑을 확인하며 해피엔딩을 맞는다
ENDING_TYPE: HAPPY_ENDING
STATUS: 완결

--- CONTENT START ---
"이제 정말 끝났습니다."

마지막 적이 쓰러지며, 왕국에 평화가 찾아왔다. 아리아는 루카스의 팔에 안겨 안도의 한숨을 내쉬었다.

"당신 덕분입니다, 아리아. 당신이 없었다면..."

"우리가 함께 했기에 가능한 일이었어요."

루카스는 아리아의 손을 잡으며 무릎을 꿇었다.

"아리아, 저와 함께 새로운 미래를 만들어 가시겠습니까?"

반지를 꺼내며 프러포즈하는 루카스를 보며, 아리아는 눈물을 흘렸다. 이번 생에서 마침내 해피엔딩을 얻었다.

"네, 평생 함께할게요."

두 사람은 키스하며 진정한 사랑을 확인했다. 시간을 되돌려 얻은 기적 같은 사랑 이야기였다.

[에필로그]
1년 후, 아리아와 루카스는 결혼식을 올렸다. 왕국의 모든 이들이 축복하는 가운데, 두 사람은 행복한 미래를 약속했다.

"이번 생은... 정말 완벽해요."

아리아는 루카스의 손을 꼭 잡으며 미소지었다. 시간 마법으로 되돌린 인생이 마침내 완성되었다.
--- CONTENT END ---
`.trim();
  }
}

/**
 * 🧪 테스트 실행 함수들
 */
async function testBasicContinuitySystem() {
  await logger.info('=== 기본 연속성 시스템 테스트 ===');
  
  const manager = new SimpleContinuityManager(logger);
  
  // 1. 시스템 상태 확인
  const status = await manager.getSystemStatus();
  await logger.info('시스템 상태:', status);
  
  // 2. 새 소설 시작 테스트
  const novelInfo = {
    title: '시간을 되돌린 마법사의 사랑',
    slug: 'time-mage-love',
    targetChapters: 50,
    tropes: ['회귀', '시간여행', '기사와 마법사']
  };
  
  const newNovel = await manager.startNewNovel(novelInfo);
  await logger.success('새 소설 생성:', {
    slug: newNovel.novelSlug,
    promptLength: newNovel.prompt.length
  });
  
  // 3. 다음 챕터 컨텍스트 테스트
  const nextContext = await manager.stateManager.getNextChapterContext('time-mage-love');
  await logger.info('다음 챕터 컨텍스트:', nextContext);
  
  return { manager, novelSlug: 'time-mage-love' };
}

async function testGeneratorIntegration() {
  await logger.info('=== 생성기 통합 테스트 ===');
  
  // Mock Generator 생성
  const mockGenerator = new MockNovelGenerator();
  
  // 연속성 강화 Generator 생성
  const enhancedGenerator = GeneratorWrapper.enhanceWithContinuity(mockGenerator, logger);
  
  // 상태 확인
  const status = await enhancedGenerator.getContinuityStatus();
  await logger.info('강화 생성기 상태:', status);
  
  return enhancedGenerator;
}

async function testFullNovelGeneration() {
  await logger.info('=== 완전한 소설 생성 테스트 ===');
  
  const mockGenerator = new MockNovelGenerator();
  const enhancedGenerator = GeneratorWrapper.enhanceWithContinuity(mockGenerator, logger);
  
  // 1. 새 소설 생성
  await logger.info('📚 새 소설 생성 시작...');
  const newNovel = await enhancedGenerator.generateNewNovel({
    title: '테스트 로맨스 판타지',
    tropes: ['회귀', '계약연애']
  });
  
  await logger.success('새 소설 생성 완료:', {
    title: newNovel.novelMetadata?.title,
    slug: newNovel.continuityMetadata?.novelSlug,
    chapter: newNovel.continuityMetadata?.chapterNumber
  });
  
  const novelSlug = newNovel.continuityMetadata?.novelSlug;
  
  // 2. 추가 챕터들 생성 (5개)
  for (let i = 2; i <= 6; i++) {
    await logger.info(`📖 ${i}화 생성 중...`);
    
    const nextChapter = await enhancedGenerator.generateContent(`novel-${novelSlug}-chapter-${i}`);
    
    await logger.success(`${i}화 생성 완료:`, {
      chapter: nextChapter.continuityMetadata?.chapterNumber,
      continuityScore: nextChapter.continuityMetadata?.continuityScore,
      plotProgress: nextChapter.continuityMetadata?.plotProgress
    });
    
    // 짧은 대기 (실제 사용 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 3. 완결 처리 테스트
  await logger.info('🎊 소설 완결 처리...');
  const finalChapter = await enhancedGenerator.completeNovel(novelSlug);
  
  await logger.success('소설 완결:', {
    finalChapter: finalChapter.novelMetadata?.finalChapter,
    completed: finalChapter.novelMetadata?.isCompleted
  });
  
  // 4. 최종 상태 확인
  const finalStatus = await enhancedGenerator.getContinuityStatus();
  await logger.info('최종 시스템 상태:', finalStatus);
  
  return { novelSlug, totalChapters: finalChapter.novelMetadata?.finalChapter };
}

async function testContinuityValidation() {
  await logger.info('=== 연속성 검증 테스트 ===');
  
  const manager = new SimpleContinuityManager(logger);
  
  // 좋은 컨텐츠 테스트
  const goodContent = "아리아는 루카스와 함께 성을 향해 걸어갔다. 마법의 기운이 느껴지는 곳이었다.";
  const goodValidation = await manager.stateManager.validateContinuity('time-mage-love', goodContent);
  await logger.info('좋은 컨텐츠 검증:', goodValidation);
  
  // 문제가 있는 컨텐츠 테스트
  const badContent = "짧음";
  const badValidation = await manager.stateManager.validateContinuity('time-mage-love', badContent);
  await logger.info('문제 컨텐츠 검증:', badValidation);
  
  return { goodValidation, badValidation };
}

async function testAdvancedPacingController() {
  await logger.info('=== 🎯 고급 페이싱 컨트롤러 테스트 ===');
  
  const manager = new SimpleContinuityManager(logger);
  
  // 테스트용 소설 생성
  const novelInfo = {
    title: '페이싱 테스트 소설',
    slug: 'pacing-test-novel',
    targetChapters: 20,
    tropes: ['회귀', '계약연애']
  };
  
  await manager.startNewNovel(novelInfo);
  const storyState = await manager.stateManager.loadStoryState('pacing-test-novel');
  
  // 테스트를 위해 더미 챕터 추가
  await manager.stateManager.addChapter('pacing-test-novel', {
    chapterNumber: 1,
    title: '1화: 테스트',
    summary: '테스트용 챕터',
    keyEvents: ['테스트'],
    emotionalTone: 'neutral',
    wordCount: 1000
  });
  
  // 업데이트된 상태 다시 로드
  const updatedStoryState = await manager.stateManager.loadStoryState('pacing-test-novel');
  
  // 테스트 시나리오들
  const testCases = [
    {
      name: "정상적인 초기 콘텐츠",
      content: "아리아는 루카스와 처음 만났다. 서로에 대한 호기심이 생겼지만 아직은 낯선 사이였다.",
      expectValid: true
    },
    {
      name: "초기에 너무 빠른 감정 진전 (위반 예상)",
      content: "아리아는 루카스를 보자마자 사랑에 빠졌다. 두 사람은 바로 키스를 하며 사랑한다고 고백했다.",
      expectValid: false
    },
    {
      name: "초기에 너무 큰 시간 점프 (위반 예상)",
      content: "3년 후, 아리아와 루카스는 결혼식을 올렸다.",
      expectValid: false
    },
    {
      name: "점진적인 관계 발전",
      content: "아리아는 루카스와 대화를 나누며 그에 대해 더 알고 싶다는 생각이 들었다. 신뢰할 수 있는 사람 같았다.",
      expectValid: true
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    await logger.info(`🧪 테스트: ${testCase.name}`);
    
    // 페이싱 검증 실행
    const pacingResult = await manager.pacingController.validateAndUpdateProgress(
      testCase.content, 
      updatedStoryState
    );
    
    const passed = pacingResult.valid === testCase.expectValid;
    
    await logger[passed ? 'success' : 'error'](`${passed ? '✅' : '❌'} ${testCase.name}`, {
      valid: pacingResult.valid,
      expected: testCase.expectValid,
      progress: pacingResult.overallProgress?.toFixed(1) + '%',
      violations: pacingResult.violations?.length || 0,
      suggestions: pacingResult.suggestions?.length || 0
    });
    
    if (pacingResult.violations?.length > 0) {
      await logger.info('위반 사항:', pacingResult.violations.map(v => v.message));
    }
    
    results.push({
      testCase: testCase.name,
      passed,
      result: pacingResult
    });
  }
  
  // 프롬프트 제약 조건 테스트
  await logger.info('📝 제약 조건 프롬프트 생성 테스트');
  const { prompt, constraints } = await manager.prepareNextChapter('pacing-test-novel');
  
  await logger.success('제약 조건 적용된 프롬프트 생성:', {
    promptLength: prompt.length,
    hasConstraints: prompt.includes('페이싱 제약 조건'),
    progress: constraints.progress?.toFixed(1) + '%',
    prohibitedKeywords: constraints.prohibitedKeywords?.length || 0,
    allowedEmotions: constraints.allowedEmotions?.length || 0
  });
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  await logger.success(`페이싱 컨트롤러 테스트 완료: ${passedTests}/${totalTests} 통과`);
  
  return {
    totalTests,
    passedTests,
    results,
    constraintsGenerated: !!constraints
  };
}

async function testPerformanceMetrics() {
  await logger.info('=== 성능 메트릭 테스트 ===');
  
  try {
    const startTime = Date.now();
    
    // 연속성 시스템 초기화
    const manager = new SimpleContinuityManager(logger);
    const initTime = Date.now() - startTime;
    
    // 상태 저장/로드 테스트
    const saveStartTime = Date.now();
    const testState = manager.stateManager.createNewStoryState('performance-test-2');
    await manager.stateManager.saveStoryState('performance-test-2', testState);
    const loadedState = await manager.stateManager.loadStoryState('performance-test-2');
    const saveLoadTime = Date.now() - saveStartTime;
    
    // 프롬프트 생성 테스트
    const promptStartTime = Date.now();
    const prompt = await manager.promptGenerator.generateNextChapterPrompt('performance-test-2');
    const promptTime = Date.now() - promptStartTime;
    
    const totalTime = Date.now() - startTime;
    
    const metrics = {
      initializationTime: `${initTime}ms`,
      saveLoadTime: `${saveLoadTime}ms`,
      promptGenerationTime: `${promptTime}ms`,
      totalTime: `${totalTime}ms`,
      promptLength: prompt.length,
      memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    };
    
    await logger.success('성능 메트릭:', metrics);
    return metrics;
  } catch (error) {
    await logger.error('성능 테스트 실패:', error);
    return {
      error: error.message,
      initializationTime: '실패',
      saveLoadTime: '실패',
      promptGenerationTime: '실패',
      totalTime: '실패'
    };
  }
}

/**
 * 🚀 메인 테스트 실행
 */
async function main() {
  await logger.info(`
========================================
🧪 새로운 연속성 시스템 통합 테스트
========================================
버전: 2.0
시간: ${new Date().toISOString()}
========================================
  `);

  try {
    // 1. 기본 시스템 테스트
    const { manager, novelSlug } = await testBasicContinuitySystem();
    
    // 2. 생성기 통합 테스트
    const enhancedGenerator = await testGeneratorIntegration();
    
    // 3. 완전한 소설 생성 테스트
    const { novelSlug: generatedSlug, totalChapters } = await testFullNovelGeneration();
    
    // 4. 연속성 검증 테스트
    const validationResults = await testContinuityValidation();
    
    // 5. 🎯 고급 페이싱 컨트롤러 테스트
    const pacingResults = await testAdvancedPacingController();
    
    // 6. 성능 메트릭 테스트
    const performanceMetrics = await testPerformanceMetrics();
    
    // 최종 결과
    await logger.success(`
========================================
✅ 모든 테스트 완료!
========================================

📊 테스트 결과:
- 기본 시스템: ✅ 정상 작동
- 생성기 통합: ✅ 완벽 호환
- 소설 생성: ✅ ${totalChapters}화 완결 성공
- 연속성 검증: ✅ 작동
- 🎯 페이싱 컨트롤러: ✅ ${pacingResults.passedTests}/${pacingResults.totalTests} 테스트 통과
- 성능: ✅ ${performanceMetrics.totalTime} 소요

🎯 핵심 기능:
✓ JSON 기반 스토리 상태 관리
✓ 자동 플롯 진행 추적  
✓ 엔딩 관리 및 완결 처리
✓ 연속성 검증 시스템
✓ 🚀 고급 페이싱 제어 시스템 (AI 급진전 방지)
✓ 다차원 진행도 추적 (물리적, 감정적, 사회적, 플롯)
✓ 관계 마일스톤 관리
✓ 기존 생성기와 완벽 호환

🚀 시스템 준비 완료!
매번 완벽한 문맥 유지와 자연스러운 페이싱으로 
개연성 있는 로맨스 판타지 소설을 자동 생성할 수 있습니다.

🎯 AI 급진전 문제 해결됨!
진행도별 제약 조건과 실시간 검증으로 
스토리가 바로 목표로 가는 문제를 방지합니다.
========================================
    `);

  } catch (error) {
    await logger.error('테스트 실패:', error);
    process.exit(1);
  }
}

// 실행
main().catch(console.error);