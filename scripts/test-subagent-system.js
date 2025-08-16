#!/usr/bin/env node

/**
 * 🧪 SubAgent System Test
 * 
 * 서브에이전트 시스템의 개별 구성 요소 테스트
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// 환경변수 로드
dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

class SubAgentSystemTester {
  constructor() {
    this.logger = {
      info: (msg, data) => console.log(`ℹ️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      success: (msg, data) => console.log(`✅ ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      error: (msg, data) => console.log(`❌ ${msg}`, data ? JSON.stringify(data, null, 2) : '')
    };
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  }

  /**
   * 🧪 전체 시스템 테스트
   */
  async testFullSystem() {
    console.log('🧪 SubAgent System 테스트 시작\n');
    
    try {
      // 1단계: BaseStory 테스트
      console.log('1️⃣ BaseStory 생성 테스트...');
      const baseStory = await this.testBaseStoryGeneration();
      console.log(`   📝 생성된 길이: ${baseStory.content.length}자`);
      
      // 2단계: ConflictAgent 테스트
      console.log('\\n2️⃣ ConflictAgent 테스트...');
      const conflictResult = await this.testConflictAgent(baseStory);
      const conflictScore = this.calculateConflictScore(conflictResult.content);
      console.log(`   🔥 갈등 점수: ${conflictScore.toFixed(1)}/10`);
      
      // 3단계: CharacterAgent 테스트
      console.log('\\n3️⃣ CharacterAgent 테스트...');
      const characterResult = await this.testCharacterAgent(baseStory);
      const characterScore = this.calculateCharacterScore(characterResult.content);
      console.log(`   🧠 캐릭터 점수: ${characterScore.toFixed(1)}/10`);
      
      // 4단계: RomanceAgent 테스트
      console.log('\\n4️⃣ RomanceAgent 테스트...');
      const romanceResult = await this.testRomanceAgent(conflictResult);
      const romanceScore = this.calculateRomanceScore(romanceResult.content);
      console.log(`   💕 로맨스 점수: ${romanceScore.toFixed(1)}/10`);
      
      // 5단계: TwistAgent 테스트
      console.log('\\n5️⃣ TwistAgent 테스트...');
      const twistResult = await this.testTwistAgent(romanceResult);
      const twistScore = this.calculateUnpredictabilityScore(twistResult.content);
      console.log(`   🎲 반전 점수: ${twistScore.toFixed(1)}/10`);
      
      // 최종 결과
      const overallScore = (conflictScore + characterScore + romanceScore + twistScore) / 4;
      console.log('\\n📊 최종 테스트 결과:');
      console.log(`   🔥 갈등: ${conflictScore.toFixed(1)}/10`);
      console.log(`   🧠 캐릭터: ${characterScore.toFixed(1)}/10`);
      console.log(`   💕 로맨스: ${romanceScore.toFixed(1)}/10`);
      console.log(`   🎲 반전: ${twistScore.toFixed(1)}/10`);
      console.log(`   ⭐ 전체: ${overallScore.toFixed(1)}/10`);
      
      const status = overallScore >= 7.0 ? '🎉 테스트 성공' : '⚠️ 개선 필요';
      console.log(`\\n${status}`);
      
      return {
        conflict: conflictScore,
        character: characterScore,
        romance: romanceScore,
        twist: twistScore,
        overall: overallScore,
        status: overallScore >= 7.0 ? 'PASS' : 'FAIL'
      };
      
    } catch (error) {
      this.logger.error('💥 테스트 실패:', error.message);
      throw error;
    }
  }

  /**
   * BaseStory 생성 테스트
   */
  async testBaseStoryGeneration() {
    const prompt = `
로맨스 판타지의 기본 스토리 구조를 생성하세요.

**설정:** 마법 학교를 배경으로 한 현대 판타지
**주인공:** 특별한 능력을 숨기고 있는 여학생
**상황:** 새로운 전학생과의 만남

**요구사항:**
- 2000자 내외의 기본 스토리
- 명확한 시작-중간-끝 구조
- 갈등, 캐릭터 복잡성, 로맨스, 반전은 배제

CONTENT:
[기본 스토리]
`;

    const result = await this.model.generateContent(prompt);
    return {
      content: result.response.text().replace('CONTENT:', '').trim(),
      type: 'base_story'
    };
  }

  /**
   * ConflictAgent 테스트
   */
  async testConflictAgent(baseStory) {
    const prompt = `
다음 기본 스토리에 갈등과 긴장감을 추가하세요.

**기본 스토리:**
${baseStory.content}

**갈등 요구사항:**
- 외적 갈등: 적대 세력, 시간 제한, 위험한 상황
- 내적 갈등: 윤리적 딜레마, 두려움, 죄책감
- 인간관계 갈등: 신뢰 문제, 이해관계 충돌

**금지사항:**
- "평화로운", "편안한", "순조로운" 표현
- 쉬운 해결책이나 편의주의적 전개

**필수사항:**
- 긴장감과 위기감 지속
- 예상치 못한 방해 요소
- 시간 압박과 갈등 상황

갈등이 강화된 스토리를 작성하세요.
`;

    const result = await this.model.generateContent(prompt);
    return {
      content: result.response.text(),
      type: 'conflict_enhanced'
    };
  }

  /**
   * CharacterAgent 테스트
   */
  async testCharacterAgent(baseStory) {
    const prompt = `
다음 기본 스토리의 캐릭터를 복잡하고 입체적으로 만드세요.

**기본 스토리:**
${baseStory.content}

**캐릭터 복잡성 요구사항:**
- 숨겨진 의도와 이중성
- 내적 갈등과 모순된 감정
- 예측 불가능한 행동과 반응

**금지사항:**
- 단순한 선악 구조
- 일차원적 캐릭터 반응
- 예측 가능한 행동 패턴

**필수사항:**
- 모든 캐릭터에 복잡한 동기
- 서로 상충하는 감정과 욕망
- 겉과 속이 다른 이중적 면모

캐릭터가 복잡해진 스토리를 작성하세요.
`;

    const result = await this.model.generateContent(prompt);
    return {
      content: result.response.text(),
      type: 'character_enhanced'
    };
  }

  /**
   * RomanceAgent 테스트
   */
  async testRomanceAgent(baseStory) {
    const prompt = `
다음 스토리에 필연적이고 깊이 있는 로맨스를 추가하세요.

**기본 스토리:**
${baseStory.content}

**로맨스 요구사항:**
- 감정적 필연성 (왜 이 사람이어야 하는가)
- 서로의 상처를 이해하고 치유
- 의미있는 장애물과 갈등

**금지사항:**
- "첫눈에 반한", "예뻐서", "잘생겨서"
- 물리적 접촉 중심 로맨스
- 우연적이고 편의주의적 만남

**필수사항:**
- 깊은 감정적 연결의 근거
- 복잡하고 갈등적인 감정
- 건강하면서도 긴장감 있는 관계

로맨스가 강화된 스토리를 작성하세요.
`;

    const result = await this.model.generateContent(prompt);
    return {
      content: result.response.text(),
      type: 'romance_enhanced'
    };
  }

  /**
   * TwistAgent 테스트
   */
  async testTwistAgent(baseStory) {
    const prompt = `
다음 스토리에 예측 불가능한 반전과 의외성을 추가하세요.

**기본 스토리:**
${baseStory.content}

**반전 요구사항:**
- 독자 기대를 뒤바꾸는 전개
- 캐릭터의 의외성과 이중성
- 플롯의 예상치 못한 방향 전환

**금지사항:**
- "당연히", "예상대로", "역시"
- 뻔한 결과나 클리셰적 해결
- 선형적이고 순조로운 진행

**필수사항:**
- 최소 1개 이상의 놀라운 반전
- 예상과 정반대의 전개
- 독자를 깜짝 놀라게 할 요소

반전이 강화된 스토리를 작성하세요.
`;

    const result = await this.model.generateContent(prompt);
    return {
      content: result.response.text(),
      type: 'twist_enhanced'
    };
  }

  /**
   * 개선된 품질 점수 계산
   */
  calculateConflictScore(content) {
    const conflictKeywords = ['갈등', '위기', '긴장', '대립', '충돌', '위험', '딜레마', '압박', '위협'];
    const peacefulKeywords = ['평화', '편안', '순조', '쉽게', '문제없이'];
    
    const conflictCount = this.countKeywords(content, conflictKeywords);
    const peacefulCount = this.countKeywords(content, peacefulKeywords);
    
    // 갈등 요소는 플러스, 평화로운 요소는 마이너스
    const rawScore = conflictCount * 0.8 - peacefulCount * 1.5;
    
    // 최소 2개 이상의 갈등 요소가 있어야 기본 점수
    const baseScore = conflictCount >= 2 ? 3 : 0;
    
    return Math.min(10, Math.max(0, baseScore + rawScore));
  }

  calculateCharacterScore(content) {
    const complexityKeywords = ['복잡한', '모순', '갈등', '숨겨진', '이중성', '혼란', '내면', '속마음'];
    const simpleKeywords = ['단순한', '명확한', '일관된', '뻔한'];
    
    const complexCount = this.countKeywords(content, complexityKeywords);
    const simpleCount = this.countKeywords(content, simpleKeywords);
    
    const rawScore = complexCount * 1.0 - simpleCount * 1.2;
    const baseScore = complexCount >= 2 ? 3 : 0;
    
    return Math.min(10, Math.max(0, baseScore + rawScore));
  }

  calculateRomanceScore(content) {
    const necessityKeywords = ['감정', '마음', '이해', '공감', '치유', '필연', '운명', '깊은'];
    const clicheKeywords = ['첫눈에', '예뻐서', '잘생겨서', '외모', '즉시', '바로'];
    
    const necessityCount = this.countKeywords(content, necessityKeywords);
    const clicheCount = this.countKeywords(content, clicheKeywords);
    
    const rawScore = necessityCount * 0.9 - clicheCount * 2.0;
    const baseScore = necessityCount >= 2 ? 3 : 0;
    
    return Math.min(10, Math.max(0, baseScore + rawScore));
  }

  calculateUnpredictabilityScore(content) {
    const unpredictableKeywords = ['예상치 못한', '갑자기', '뜻밖의', '놀랍게도', '반전', '의외로', '충격'];
    const predictableKeywords = ['당연히', '예상대로', '역시', '뻔한', '자연스럽게'];
    
    const unpredictableCount = this.countKeywords(content, unpredictableKeywords);
    const predictableCount = this.countKeywords(content, predictableKeywords);
    
    const rawScore = unpredictableCount * 1.5 - predictableCount * 1.8;
    const baseScore = unpredictableCount >= 1 ? 3 : 0;
    
    return Math.min(10, Math.max(0, baseScore + rawScore));
  }

  /**
   * 키워드 카운트 헬퍼
   */
  countKeywords(content, keywords) {
    let count = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex);
      count += matches ? matches.length : 0;
    });
    return count;
  }

  /**
   * 🔍 개별 에이전트 테스트
   */
  async testIndividualAgent(agentType) {
    console.log(`🔍 ${agentType} 개별 테스트`);
    
    const testStory = {
      content: `
마법학교의 새 학기가 시작되었다. 에밀리는 자신의 특별한 능력을 숨기며 평범한 학생인 척하고 있었다. 
그런데 전학생 데이먼이 나타나면서 상황이 복잡해지기 시작했다. 
그는 뭔가 평범하지 않은 아우라를 풍기고 있었고, 에밀리의 숨겨진 능력에 관심을 보이는 것 같았다.
수업 시간에 일어난 작은 사고로 인해 두 사람은 서로에 대해 더 알게 되었다.
      `.trim()
    };
    
    switch (agentType) {
      case 'conflict':
        return await this.testConflictAgent(testStory);
      case 'character':
        return await this.testCharacterAgent(testStory);
      case 'romance':
        return await this.testRomanceAgent(testStory);
      case 'twist':
        return await this.testTwistAgent(testStory);
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }
}

// CLI 실행
async function main() {
  try {
    const tester = new SubAgentSystemTester();
    
    if (process.argv[2] === 'individual') {
      const agentType = process.argv[3];
      if (!agentType) {
        console.log('사용법: node test-subagent-system.js individual [conflict|character|romance|twist]');
        process.exit(1);
      }
      
      const result = await tester.testIndividualAgent(agentType);
      console.log('\\n📄 결과:');
      console.log(result.content.substring(0, 500) + '...');
      
    } else {
      await tester.testFullSystem();
    }
    
  } catch (error) {
    console.error('\\n💥 테스트 실패:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SubAgentSystemTester };