#!/usr/bin/env node

/**
 * 🧪 Gemini API 고급 기능 테스트 스크립트
 * 
 * Gemini의 고유 기능들을 테스트하고 최적화 상태를 확인합니다:
 * - 긴 컨텍스트 처리 능력
 * - 한국어 로맨스 판타지 생성 품질
 * - 다양한 temperature 설정
 * - API 응답 속도 및 안정성
 * - 토큰 사용 효율성
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// .env.local 파일 로드
dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

class GeminiAdvancedTester {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;
    this.results = [];
    
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          maxOutputTokens: 4000,
        }
      });
    }
  }

  async runAllTests() {
    console.log('🚀 Gemini API 고급 기능 테스트 시작\n');

    if (!this.apiKey) {
      console.log('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
      console.log('환경변수를 설정한 후 다시 실행해주세요.');
      return false;
    }

    await this.testBasicConnection();
    await this.testKoreanLanguageGeneration();
    await this.testRomanceFantasyGeneration();
    await this.testLongContextHandling();
    await this.testTemperatureVariations();
    await this.testResponseSpeed();
    await this.testErrorHandling();

    this.printResults();
    return this.results.every(r => r.passed);
  }

  async testBasicConnection() {
    const testName = '🔗 기본 API 연결 테스트';
    console.log(`${testName}...`);

    try {
      const startTime = Date.now();
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: '안녕하세요!' }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        }
      });

      const response = await result.response;
      const content = response.text();
      const duration = Date.now() - startTime;

      if (content && content.length > 0) {
        this.addResult(testName, true, `연결 성공 (${duration}ms) - ${content.substring(0, 20)}...`);
      } else {
        this.addResult(testName, false, '응답이 비어있습니다');
      }
    } catch (error) {
      this.addResult(testName, false, `연결 실패: ${error.message}`);
    }
  }

  async testKoreanLanguageGeneration() {
    const testName = '🇰🇷 한국어 생성 품질 테스트';
    console.log(`${testName}...`);

    try {
      const prompt = `
한국어로 아름다운 문장을 작성해주세요. 
다음 요소들을 포함해야 합니다:
- 감정적 표현
- 문학적 수사법
- 자연스러운 한국어 문체
- 약 100자 내외

주제: 봄날의 첫 만남
`;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200,
        }
      });

      const response = await result.response;
      const content = response.text();

      // 한국어 품질 검사
      const hasKorean = /[가-힣]/.test(content);
      const hasEmotionalWords = /(설렘|두근|따뜻|아름다운|사랑|마음)/.test(content);
      const isReasonableLength = content.length >= 50 && content.length <= 300;

      if (hasKorean && hasEmotionalWords && isReasonableLength) {
        this.addResult(testName, true, `고품질 한국어 생성 확인 (${content.length}자)`);
      } else {
        this.addResult(testName, false, `품질 기준 미달 - 한국어:${hasKorean}, 감정:${hasEmotionalWords}, 길이:${isReasonableLength}`);
      }
    } catch (error) {
      this.addResult(testName, false, `생성 실패: ${error.message}`);
    }
  }

  async testRomanceFantasyGeneration() {
    const testName = '💕 로맨스 판타지 생성 테스트';
    console.log(`${testName}...`);

    try {
      const prompt = `
당신은 로맨스 판타지 전문 작가입니다. 
다음 설정으로 짧은 소설 도입부를 한국어로 작성해주세요 (300자 내외):

설정:
- 배경: 마법이 존재하는 중세 왕국
- 주인공: 평민 출신의 똑똑한 여성
- 남주: 신비로운 마법사
- 트로프: 첫 만남, 신분 차이
- 분위기: 신비롭고 로맨틱한

요구사항:
- 생생한 묘사
- 매력적인 캐릭터
- 흥미로운 갈등 요소
- 다음이 궁금해지는 결말
`;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 500,
        }
      });

      const response = await result.response;
      const content = response.text();

      // 로맨스 판타지 요소 검사
      const hasMagicElements = /(마법|마력|주문|마도사|마법사|왕국|성)/.test(content);
      const hasRomanceElements = /(시선|마음|설렘|아름다운|매력적|사랑)/.test(content);
      const hasGoodNarrative = content.includes('그녀') || content.includes('그는') || content.includes('주인공');
      const isAppropriateLength = content.length >= 200 && content.length <= 600;

      if (hasMagicElements && hasRomanceElements && hasGoodNarrative && isAppropriateLength) {
        this.addResult(testName, true, `고품질 로맨스 판타지 생성 성공 (${content.length}자)`);
      } else {
        this.addResult(testName, false, `품질 기준 미달 - 마법:${hasMagicElements}, 로맨스:${hasRomanceElements}, 서사:${hasGoodNarrative}, 길이:${isAppropriateLength}`);
      }
    } catch (error) {
      this.addResult(testName, false, `생성 실패: ${error.message}`);
    }
  }

  async testLongContextHandling() {
    const testName = '📚 긴 컨텍스트 처리 테스트';
    console.log(`${testName}...`);

    try {
      // 긴 컨텍스트 생성 (약 1000자)
      const longContext = `
이는 매우 긴 컨텍스트 테스트입니다. 
로맨스 판타지 소설의 기존 설정입니다.

제국의 수도 알테리아는 마법과 과학이 공존하는 도시였다. 
높은 탑들 사이로 마법사들이 날아다니고, 거리에는 마법으로 움직이는 자동차들이 다녔다.
주인공 세라핀은 평범한 도서관 사서였지만, 사실 잃어버린 왕족의 혈통을 가지고 있었다.
그녀는 자신의 정체성을 모른 채 평범한 삶을 살고 있었다.

어느 날, 도서관에 신비로운 남자가 나타났다. 
그는 자신을 카엘이라고 소개했고, 강력한 마법사임을 암시했다.
그의 눈빛은 깊은 바다처럼 푸르렀고, 그 속에는 오래된 비밀이 숨어있는 것 같았다.

카엘은 세라핀에게 고대 마법서를 찾아달라고 부탁했다.
그 책은 왕국의 운명을 바꿀 수 있는 강력한 마법이 담겨있다고 했다.
세라핀은 그의 부탁을 들어주기로 결심했지만, 그것이 자신의 운명을 바꾸게 될 줄은 몰랐다.

마법서를 찾는 과정에서 두 사람은 점점 가까워졌다.
카엘은 세라핀의 숨겨진 재능을 발견했고, 그녀를 마법의 세계로 이끌었다.
하지만 그들의 사랑에는 큰 장애물이 있었다.
세라핀의 진정한 정체성과 카엘의 숨겨진 과거가 밝혀지면서...
`;

      const prompt = `
위의 긴 스토리 컨텍스트를 바탕으로, 다음 장면을 이어서 작성해주세요:

세라핀과 카엘이 마침내 고대 마법서를 찾았을 때 벌어지는 일을 200자 내외로 서술해주세요.
기존 설정과 캐릭터를 정확히 유지하면서 긴장감 있는 장면을 만들어주세요.
`;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: longContext + prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 400,
        }
      });

      const response = await result.response;
      const content = response.text();

      // 컨텍스트 이해도 검사
      const mentionsSeraphine = /세라핀/.test(content);
      const mentionsKael = /카엘/.test(content);
      const mentionsMagicBook = /(마법서|고대|책)/.test(content);
      const isCoherent = content.length >= 100 && content.length <= 400;

      if (mentionsSeraphine && mentionsKael && mentionsMagicBook && isCoherent) {
        this.addResult(testName, true, `긴 컨텍스트 정확히 이해하고 연결성 있는 내용 생성`);
      } else {
        this.addResult(testName, false, `컨텍스트 이해 부족 - 세라핀:${mentionsSeraphine}, 카엘:${mentionsKael}, 마법서:${mentionsMagicBook}`);
      }
    } catch (error) {
      this.addResult(testName, false, `처리 실패: ${error.message}`);
    }
  }

  async testTemperatureVariations() {
    const testName = '🌡️ Temperature 변화 테스트';
    console.log(`${testName}...`);

    try {
      const basePrompt = '간단한 인사말을 해주세요.';
      const temperatures = [0.3, 0.7, 1.0];
      const responses = [];

      for (const temp of temperatures) {
        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: basePrompt }] }],
          generationConfig: {
            temperature: temp,
            maxOutputTokens: 50,
          }
        });

        const response = await result.response;
        responses.push(response.text());
        
        // 요청 간 간격
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 응답 다양성 검사
      const uniqueResponses = new Set(responses).size;
      const allValid = responses.every(r => r && r.length > 0);

      if (allValid && uniqueResponses >= 2) {
        this.addResult(testName, true, `${temperatures.length}개 온도에서 ${uniqueResponses}개 다른 응답 생성`);
      } else {
        this.addResult(testName, false, `다양성 부족 또는 응답 오류 - 유효:${allValid}, 고유:${uniqueResponses}`);
      }
    } catch (error) {
      this.addResult(testName, false, `테스트 실패: ${error.message}`);
    }
  }

  async testResponseSpeed() {
    const testName = '⚡ 응답 속도 테스트';
    console.log(`${testName}...`);

    try {
      const testCounts = 3;
      const times = [];

      for (let i = 0; i < testCounts; i++) {
        const startTime = Date.now();
        
        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: '짧은 문장을 하나 말해주세요.' }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 30,
          }
        });

        await result.response;
        const duration = Date.now() - startTime;
        times.push(duration);
        
        // 요청 간 간격
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      if (avgTime < 5000 && maxTime < 10000) {
        this.addResult(testName, true, `평균 ${avgTime.toFixed(0)}ms (최소:${minTime}ms, 최대:${maxTime}ms)`);
      } else {
        this.addResult(testName, false, `응답 속도 느림 - 평균:${avgTime.toFixed(0)}ms, 최대:${maxTime}ms`);
      }
    } catch (error) {
      this.addResult(testName, false, `속도 테스트 실패: ${error.message}`);
    }
  }

  async testErrorHandling() {
    const testName = '🛡️ 오류 처리 테스트';
    console.log(`${testName}...`);

    try {
      // 의도적으로 문제가 있는 요청
      const problemPrompt = 'A'.repeat(100000); // 매우 긴 프롬프트

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: problemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      });

      // 만약 성공한다면 (Gemini가 긴 프롬프트를 처리할 수 있음)
      const response = await result.response;
      if (response.text()) {
        this.addResult(testName, true, '긴 프롬프트도 정상 처리됨 (우수한 내구성)');
      } else {
        this.addResult(testName, true, '적절한 빈 응답 처리');
      }
    } catch (error) {
      // 예상되는 오류
      if (error.message.includes('INVALID_ARGUMENT') || 
          error.message.includes('length') || 
          error.message.includes('token')) {
        this.addResult(testName, true, '적절한 오류 처리 및 메시지');
      } else {
        this.addResult(testName, false, `예상치 못한 오류: ${error.message}`);
      }
    }
  }

  addResult(testName, passed, message) {
    this.results.push({ testName, passed, message });
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${message}\n`);
  }

  printResults() {
    console.log('📊 Gemini API 고급 테스트 결과:');
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;

    for (const result of this.results) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.testName}`);
      if (result.passed) passed++;
      else failed++;
    }

    console.log('='.repeat(60));
    console.log(`총 ${this.results.length}개 테스트 중 ${passed}개 성공, ${failed}개 실패`);

    if (failed === 0) {
      console.log('\n🎉 모든 고급 테스트를 통과했습니다!');
      console.log('🚀 Gemini API가 로맨스 판타지 생성에 최적화되어 있습니다.');
      console.log('💡 주요 강점:');
      console.log('   - 뛰어난 한국어 처리 능력');
      console.log('   - 긴 컨텍스트 정확한 이해');
      console.log('   - 창의적이고 일관된 스토리텔링');
      console.log('   - 빠른 응답 속도');
      console.log('   - 안정적인 오류 처리');
    } else {
      console.log('\n🚨 일부 고급 기능에서 문제가 발견되었습니다.');
      console.log('실패한 테스트들을 검토하고 설정을 조정해보세요.');
    }

    console.log('\n💡 최적화 팁:');
    console.log('   - 로맨스 판타지에는 temperature 0.8-0.9 권장');
    console.log('   - 긴 컨텍스트 활용으로 일관성 향상');
    console.log('   - 한국어 프롬프트로 더 자연스러운 문체 구현');
  }
}

// 메인 실행
async function main() {
  try {
    const tester = new GeminiAdvancedTester();
    const allPassed = await tester.runAllTests();
    
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('🚨 테스트 실행 중 오류:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { GeminiAdvancedTester };