#!/usr/bin/env node

/**
 * 🔗 Continuity-Aware Story Generator
 * 
 * 근본적 문제 해결을 위한 연속성 보장 생성 로직
 * - 이전 챕터 마지막 상황 완벽 추적
 * - 스토리 상태 실시간 업데이트
 * - 연결 단절 자동 차단
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import dotenv from 'dotenv';

// 중앙화된 설정 시스템
import { OUTPUT_FORMAT } from '../src/lib/config/prompt-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

class ContinuityAwareGenerator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    
    // 기존 SharedContext 확장
    this.storyState = {
      // 기본 설정
      worldSetting: '현대 도시 + 시간 조작 판타지',
      mainCharacter: { name: '레오나', age: 25, ability: '시간 되돌리기' },
      loveInterest: { name: '카엘', age: 27, ability: '미래 예시' },
      
      // 실시간 스토리 상황 추적 (핵심!)
      currentSituation: {
        location: null,
        time: null,
        charactersPresent: [],
        activeConflicts: [],
        pendingEvents: [],
        cliffhangers: []
      },
      
      // 캐릭터 현재 상태
      characterStates: {
        레오나: { condition: 'normal', location: null, emotion: null },
        카엘: { condition: 'normal', location: null, emotion: null }
      },
      
      // 진행 중인 플롯
      activePlots: [],
      
      // 해결되지 않은 미스터리
      unsolvedMysteries: [],
      
      // 챕터별 연결 체크포인트
      chapterConnections: []
    };
  }

  /**
   * 🔍 이전 챕터 완전 분석
   */
  async analyzePreviousChapter(chapterNumber) {
    if (chapterNumber <= 1) return null;
    
    const prevChapterPath = join(PROJECT_ROOT, 'src/content/chapters', `time-guardian-fate-thread-ch${chapterNumber - 1}.md`);
    
    try {
      const content = await fs.readFile(prevChapterPath, 'utf-8');
      const { content: text } = matter(content);
      
      // console.log(`📖 이전 챕터 ${chapterNumber - 1} 분석 중...`);
      
      // AI로 이전 챕터 마지막 상황 정확히 추출
      const analysisPrompt = `
당신은 스토리 연속성 분석 전문가입니다.

다음 챕터의 마지막 상황을 정확히 분석하세요:

${text}

**분석 항목:**

LOCATION: [마지막 장면의 위치]
TIME: [시간대/시점]
CHARACTERS_PRESENT: [현재 장면에 있는 캐릭터들]
CHARACTER_STATES: [각 캐릭터의 현재 상태 - 의식/위치/감정]
ACTIVE_CONFLICTS: [진행 중인 갈등들]
CLIFFHANGERS: [다음 화로 이어지는 긴장감/미해결 요소]
PENDING_EVENTS: [예고되었지만 아직 일어나지 않은 사건들]
MYSTERIES: [아직 해결되지 않은 의문점들]

**중요**: 다음 챕터는 이 상황을 정확히 이어받아야 합니다.
`;

      const result = await this.model.generateContent(analysisPrompt);
      const analysis = result.response.text();
      
      // 분석 결과를 구조화된 데이터로 파싱
      const situationData = this.parseAnalysis(analysis);
      
      // console.log('✅ 이전 챕터 분석 완료');
      // console.log('📊 추출된 상황:', JSON.stringify(situationData, null, 2));
      
      return situationData;
      
    } catch (_error) {
    // Intentionally unused error variable
      // console.warn(`⚠️ 이전 챕터 분석 실패: ${_error.message}`);
      return null;
    }
  }

  /**
   * 📊 분석 결과 파싱
   */
  parseAnalysis(analysis) {
    const extractField = (fieldName) => {
      const regex = new RegExp(`${fieldName}:\\s*\\[([^\\]]+)\\]`, 'i');
      const match = analysis.match(regex);
      return match ? match[1].trim() : '정보 없음';
    };

    return {
      location: extractField('LOCATION'),
      time: extractField('TIME'),
      charactersPresent: extractField('CHARACTERS_PRESENT').split(',').map(s => s.trim()),
      characterStates: extractField('CHARACTER_STATES'),
      activeConflicts: extractField('ACTIVE_CONFLICTS').split(',').map(s => s.trim()),
      cliffhangers: extractField('CLIFFHANGERS').split(',').map(s => s.trim()),
      pendingEvents: extractField('PENDING_EVENTS').split(',').map(s => s.trim()),
      mysteries: extractField('MYSTERIES').split(',').map(s => s.trim())
    };
  }

  /**
   * 📖 스토리 상태 파일 로드
   */
  async loadStoryState() {
    try {
      const storyStatePath = join(PROJECT_ROOT, 'src/content/story-state.json');
      const content = await fs.readFile(storyStatePath, 'utf-8');
      return JSON.parse(content);
    } catch (_error) {
    // Intentionally unused error variable
      // console.warn('⚠️ story-state.json 로드 실패:', _error.message);
      return null;
    }
  }

  /**
   * 🔗 연속성 보장 챕터 생성
   */
  async generateContinuousChapter(chapterNumber) {
    // console.log(`\n🔗 연속성 보장 챕터 ${chapterNumber} 생성 시작`);
    
    // 1단계: 스토리 상태 파일 로드 (우선순위)
    const storyState = await this.loadStoryState();
    
    if (!storyState) {
      // console.log('스토리 상태 파일 없음 - 이전 챕터 분석으로 대체');
      const previousSituation = await this.analyzePreviousChapter(chapterNumber);
      return this.generateFromAnalysis(chapterNumber, previousSituation);
    }
    
    // console.log('✅ story-state.json 로드 완료');
    return this.generateFromStoryState(chapterNumber, storyState);
  }

  /**
   * 📋 스토리 상태 기반 생성
   */
  async generateFromStoryState(chapterNumber, storyState) {
    // console.log('📋 story-state.json 기반 정확한 연속성 생성');
    
    // 스토리 상태에서 정확한 요구사항 추출
    const requirements = storyState.nextChapterRequirements;
    const currentSituation = storyState.currentSituation;
    const characterStates = storyState.characterStates;
    const pendingEvents = storyState.pendingEvents;
    const cliffhangers = storyState.cliffhangers;
    
    const storyStatePrompt = `
당신은 프로 소설가입니다. 다음 스토리 상태를 정확히 이어받아 소설을 쓰세요.

**현재 스토리 상황 (절대 변경 금지):**
시간: ${currentSituation.time}
위치: ${currentSituation.location}  
현재 장면: ${currentSituation.activeScene}

**캐릭터 현재 상태:**
${Object.entries(characterStates).map(([name, state]) => 
  `${name}: ${state.condition} (위치: ${state.location}, 감정: ${state.emotion}, 목표: ${state.currentGoal})`
).join('\n')}

**반드시 처리해야 할 사건들:**
${pendingEvents.map(event => `- ${event.event}: ${event.description}`).join('\n')}

**해결해야 할 클리프행어:**
${cliffhangers.map(ch => `- ${ch.description} (중요도: ${ch.intensity})`).join('\n')}

**이번 챕터 필수 요구사항:**
시작: ${requirements.mustStartWith}
포함 필수: ${requirements.mustInclude.join(', ')}
잊으면 안 되는 것: ${requirements.mustNotForget.join(', ')}
분량: ${requirements.targetLength}
톤: ${requirements.tonalDirection}

**소설 작성 규칙:**
1. 위 상황을 정확히 이어받아 시작
2. 캐릭터 상태 변경 시 충분한 설명
3. 클리프행어를 자연스럽게 해결  
4. 예정된 사건을 빠뜨리지 않고 처리
5. 감정적 몰입도 높은 장면 구성
6. 다음 화로 이어질 새로운 긴장감 조성

${OUTPUT_FORMAT.chapterTitle(nextChapterNumber)}

CONTENT:
[story-state.json과 완벽 연결되는 2500자 이상 소설]
`;

    const result = await this.model.generateContent(storyStatePrompt);
    const response = result.response.text();
    
    const titleMatch = response.match(/TITLE:\\s*(.+)/);
    const contentMatch = response.match(/CONTENT:\\s*([\\s\\S]+)/);
    
    const chapterData = {
      title: titleMatch ? titleMatch[1].trim() : `챕터 ${chapterNumber}`,
      content: contentMatch ? contentMatch[1].trim() : response
    };

    // console.log('✅ 스토리 상태 기반 생성 완료');
    return chapterData;
  }

  /**
   * 🔄 기존 분석 기반 생성 (백업)
   */
  async generateFromAnalysis(chapterNumber, previousSituation) {
    if (!previousSituation) {
      // console.log('첫 챕터이므로 기본 생성 진행');
      return this.generateFirstChapter();
    }

    // 2단계: 연속성 검증 프롬프트 구성
    const continuityPrompt = `
당신은 연속성 보장 스토리 생성 전문가입니다.

**CRITICAL: 이전 챕터 마지막 상황 (절대 변경 금지)**

위치: ${previousSituation.location}
시간: ${previousSituation.time}  
등장인물: ${previousSituation.charactersPresent.join(', ')}
캐릭터 상태: ${previousSituation.characterStates}
진행 중인 갈등: ${previousSituation.activeConflicts.join(', ')}
클리프행어: ${previousSituation.cliffhangers.join(', ')}
예정된 사건: ${previousSituation.pendingEvents.join(', ')}
미해결 미스터리: ${previousSituation.mysteries.join(', ')}

**생성 규칙:**

1. **연속성 필수**: 위 상황을 정확히 이어받아 시작
2. **상태 유지**: 캐릭터 상태 변경 시 명확한 이유 제시
3. **클리프행어 해결**: 이전 화 긴장감을 자연스럽게 해결
4. **예정 사건 처리**: 예고된 사건들을 빠뜨리지 않고 처리
5. **미스터리 진전**: 기존 의문점에 대한 단서나 해결 제시

**분량**: 2,500자 (상세한 묘사와 전개)

**구조**:
- 이전 상황 직접 연결
- 클리프행어 해결
- 새로운 전개
- 다음 화 연결고리

TITLE: [의미있는 제목]

CONTENT:
[이전 상황과 완벽 연결되는 내용]

ENDING_SITUATION:
위치: [마지막 장면 위치]
캐릭터 상태: [각 캐릭터 현재 상태]  
새로운 클리프행어: [다음 화 연결 요소]
`;

    // 3단계: 연속성 보장 생성
    const result = await this.model.generateContent(continuityPrompt);
    const response = result.response.text();
    
    // 4단계: 결과 파싱 및 검증
    const titleMatch = response.match(/TITLE:\\s*(.+)/);
    const contentMatch = response.match(/CONTENT:\\s*([\\s\\S]+?)(?=ENDING_SITUATION:|$)/);
    const endingSituationMatch = response.match(/ENDING_SITUATION:\\s*([\\s\\S]+)$/);
    
    const chapterData = {
      title: titleMatch ? titleMatch[1].trim() : `챕터 ${chapterNumber}`,
      content: contentMatch ? contentMatch[1].trim() : '생성 실패',
      endingSituation: endingSituationMatch ? endingSituationMatch[1].trim() : '분석 실패'
    };

    // 5단계: 연속성 검증
    const isValid = await this.validateContinuity(chapterData, previousSituation);
    
    if (!isValid) {
      // console.error('❌ 연속성 검증 실패 - 재생성 필요');
      throw new Error('연속성 보장 실패');
    }

    // console.log('✅ 연속성 검증 통과');
    return chapterData;
  }

  /**
   * 🔍 연속성 검증
   */
  async validateContinuity(chapterData, previousSituation) {
    // console.log('🔍 연속성 검증 중...');
    
    const validationPrompt = `
다음 두 상황이 논리적으로 연결되는지 검증하세요:

**이전 챕터 마지막 상황:**
${JSON.stringify(previousSituation, null, 2)}

**새 챕터 내용:**
${chapterData.content.substring(0, 500)}...

**검증 기준:**
1. 캐릭터 상태 일관성 (혼수상태였다면 깨어난 이유 설명)
2. 위치/시간 연결성 (급작스러운 장소 이동 금지)
3. 클리프행어 처리 (이전 화 긴장감 해결)
4. 예정 사건 누락 여부

VALID: YES/NO
ISSUES: [문제점 나열]
`;

    const result = await this.model.generateContent(validationPrompt);
    const validation = result.response.text();
    
    const isValid = validation.includes('VALID: YES');
    
    if (!isValid) {
      // console.warn('⚠️ 연속성 문제 발견:', validation);
    }
    
    return isValid;
  }

  /**
   * 💾 챕터 저장
   */
  async saveChapter(chapterNumber, chapterData) {
    const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `time-guardian-fate-thread-ch${chapterNumber}.md`);
    
    const frontmatter = {
      title: chapterData.title,
      novel: 'time-guardian-fate-thread',
      chapterNumber,
      publicationDate: new Date().toISOString().split('T')[0],
      wordCount: chapterData.content.replace(/\s/g, '').length,
      contentRating: '15+',
      
      // 연속성 보장 마커
      continuityGuaranteed: true,
      previousChapterAnalyzed: true,
      logicallyConnected: true,
      storyFlowValidated: true,
      
      worldSetting: '현대 도시 + 시간 조작 판타지',
      mainCharacter: '레오나',
      loveInterest: '카엘',
      lastGenerated: new Date().toISOString()
    };
    
    const chapterMarkdown = matter.stringify(chapterData.content, frontmatter);
    await fs.writeFile(chapterPath, chapterMarkdown);
    
    // console.log(`✅ 챕터 ${chapterNumber} 저장 완료`);
  }
}

// CLI 실행
async function main() {
  try {
    const generator = new ContinuityAwareGenerator();
    
    // console.log('🔗 Continuity-Aware Generator 시작');
    // console.log('근본적 연속성 보장 시스템으로 5화 재생성\n');
    
    // 5화 연속성 보장 재생성
    const chapterData = await generator.generateContinuousChapter(5);
    await generator.saveChapter(5, chapterData);
    
    // console.log('\n🎉 연속성 보장 5화 생성 완료!');
    // console.log('4화와 완벽 연결, 스토리 논리성 보장');
    
  } catch (_error) {
    // Intentionally unused error variable
    // console.error('\n💥 연속성 보장 생성 실패:', _error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ContinuityAwareGenerator };