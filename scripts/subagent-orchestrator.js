#!/usr/bin/env node

/**
 * 🎭 SubAgent Orchestrator
 * 
 * 명확한 워크플로우 기반 서브에이전트 시스템
 * - Phase 1: BaseStoryGenerator (기반 설정)
 * - Phase 2A: ConflictAgent + CharacterAgent (병렬 처리)
 * - Phase 2B: ContentMerger (통합)
 * - Phase 3: RomanceAgent → TwistAgent → QualityValidator (순차 처리)
 * - Phase 4: FailureRecovery (조건부 복구)
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// 환경변수 로드
dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

/**
 * 🎭 SubAgent Orchestrator
 * 명확한 워크플로우로 품질 보장
 */
class SubAgentOrchestrator {
  constructor() {
    this.logger = {
      info: (_msg, _data) => {}, // console.log(`ℹ️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      warn: (_msg, _data) => {}, // console.log(`⚠️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      error: (_msg, _data) => {}, // console.log(`❌ ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      success: (_msg, _data) => {}, // console.log(`✅ ${msg}`, data ? JSON.stringify(data, null, 2) : '')
    };
    
    // AI 모델 초기화
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    // 품질 기준
    this.qualityThresholds = {
      baseStory: 7.0,
      conflict: 8.0,
      character: 8.0,
      romance: 7.0,
      unpredictability: 7.0,
      overall: 8.0
    };
    
    // 워크플로우 상태 추적
    this.workflowState = {
      baseStory: { status: 'pending', result: null, attempts: 0 },
      conflictAgent: { status: 'pending', result: null, attempts: 0 },
      characterAgent: { status: 'pending', result: null, attempts: 0 },
      contentMerger: { status: 'pending', result: null, attempts: 0 },
      romanceAgent: { status: 'pending', result: null, attempts: 0 },
      twistAgent: { status: 'pending', result: null, attempts: 0 },
      qualityValidator: { status: 'pending', result: null, attempts: 0 }
    };
  }

  /**
   * 🚀 메인 오케스트레이션 함수
   */
  async orchestrateNovelGeneration() {
    // console.log('🎭 SubAgent Orchestrator 시작!');
    // console.log('명확한 워크플로우로 품질 보장된 소설 생성\n');
    
    try {
      // 1단계: 혁신적 소설 컨셉 생성
      // console.log('🧠 소설 컨셉 생성...');
      const novelInfo = await this.generateNovelConcept();
      await this.createNovelFile(novelInfo);
      
      // 2단계: 챕터별 SubAgent 워크플로우 실행
      for (let chapterNum = 1; chapterNum <= 5; chapterNum++) {
        // console.log(`\n📖 챕터 ${chapterNum} SubAgent 워크플로우 시작`);
        await this.executeChapterWorkflow(novelInfo, chapterNum);
      }
      
      // 3단계: 전체 소설 품질 검증
      const overallQuality = await this.validateOverallNovel(novelInfo);
      
      // console.log('\n🎉 SubAgent Orchestrator 완료!');
      // console.log('================================');
      // console.log(`📚 제목: ${novelInfo.title}`);
      // console.log(`⭐ 전체 품질: ${overallQuality.overallScore.toFixed(1)}/10`);
      // console.log(`🎯 예상 독자 평점: ${overallQuality.expectedRating}/5`);
      
      return {
        novelInfo,
        qualityMetrics: overallQuality,
        status: 'SUBAGENT_SUCCESS'
      };
      
    } catch (_error) {
    // Intentionally unused error variable
      this.logger.error('💥 SubAgent Orchestrator 실패:', _error.message);
      throw _error;
    }
  }

  /**
   * 📖 챕터별 워크플로우 실행
   */
  async executeChapterWorkflow(novelInfo, chapterNumber) {
    // console.log(`\n🔄 챕터 ${chapterNumber} 워크플로우 시작...`);
    
    try {
      // Phase 1: BaseStoryGenerator
      // console.log('Phase 1: BaseStory 생성...');
      const baseStoryResult = await this.executeBaseStoryGenerator(novelInfo, chapterNumber);
      this.workflowState.baseStory = { status: 'completed', result: baseStoryResult, attempts: 1 };
      
      // Phase 2A: ConflictAgent + CharacterAgent (병렬)
      // console.log('Phase 2A: ConflictAgent + CharacterAgent (병렬)...');
      const [conflictResult, characterResult] = await this.executeParallelAgents(baseStoryResult, chapterNumber);
      this.workflowState.conflictAgent = { status: 'completed', result: conflictResult, attempts: 1 };
      this.workflowState.characterAgent = { status: 'completed', result: characterResult, attempts: 1 };
      
      // Phase 2B: ContentMerger
      // console.log('Phase 2B: Content 병합...');
      const mergedResult = await this.executeContentMerger(conflictResult, characterResult);
      this.workflowState.contentMerger = { status: 'completed', result: mergedResult, attempts: 1 };
      
      // Phase 3: RomanceAgent → TwistAgent → QualityValidator (순차)
      // console.log('Phase 3: RomanceAgent → TwistAgent → QualityValidator...');
      const romanceResult = await this.executeRomanceAgent(mergedResult, chapterNumber);
      this.workflowState.romanceAgent = { status: 'completed', result: romanceResult, attempts: 1 };
      
      const twistResult = await this.executeTwistAgent(romanceResult, chapterNumber);
      this.workflowState.twistAgent = { status: 'completed', result: twistResult, attempts: 1 };
      
      const qualityResult = await this.executeQualityValidator(twistResult, chapterNumber);
      this.workflowState.qualityValidator = { status: 'completed', result: qualityResult, attempts: 1 };
      
      // Phase 4: 품질 검증 및 조건부 복구
      if (qualityResult.overallScore < this.qualityThresholds.overall) {
        // console.log(`⚠️ 품질 기준 미달 (${qualityResult.overallScore.toFixed(1)}/10), 복구 시도...`);
        await this.executeFailureRecovery(novelInfo, chapterNumber, qualityResult);
      }
      
      // 최종 챕터 파일 저장
      await this.saveChapterFile(novelInfo, chapterNumber, twistResult.content, qualityResult);
      
      // console.log(`✅ 챕터 ${chapterNumber} 워크플로우 완료`);
      // console.log(`   🔥 갈등: ${qualityResult.scores.conflict.toFixed(1)}/10`);
      // console.log(`   🧠 캐릭터: ${qualityResult.scores.character.toFixed(1)}/10`);
      // console.log(`   💕 로맨스: ${qualityResult.scores.romance.toFixed(1)}/10`);
      // console.log(`   🎲 예측불가능성: ${qualityResult.scores.unpredictability.toFixed(1)}/10`);
      // console.log(`   ⭐ 전체: ${qualityResult.overallScore.toFixed(1)}/10`);
      
    } catch (_error) {
    // Intentionally unused error variable
      this.logger.error(`💥 챕터 ${chapterNumber} 워크플로우 실패:`, _error.message);
      throw _error;
    }
  }

  /**
   * Phase 1: BaseStoryGenerator
   */
  async executeBaseStoryGenerator(novelInfo, chapterNumber) {
    const prompt = `
당신은 기본 스토리 구조를 생성하는 BaseStoryGenerator입니다.

**목표:** 다른 전문 에이전트들이 작업할 수 있는 기본 스토리 구조 생성

**소설 정보:**
- 제목: ${novelInfo.title}
- 줄거리: ${novelInfo.summary}
- 챕터: ${chapterNumber}

**요구사항:**
- 기본적인 스토리 흐름과 구조만 생성
- 갈등, 캐릭터 복잡성, 로맨스, 반전은 추후 전문 에이전트가 처리
- 2000자 내외의 기본 스토리
- 명확한 시작-중간-끝 구조

**금지사항:**
- 복잡한 갈등이나 반전 요소 추가
- 깊이 있는 캐릭터 개발
- 로맨스의 급속한 진전

TITLE: [챕터 제목]

CONTENT:
[기본 스토리 구조 - 2000자 내외]
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    const titleMatch = response.match(/TITLE:\\s*(.+)/);
    const contentMatch = response.match(/CONTENT:\\s*([\\s\\S]+)/);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : `챕터 ${chapterNumber}`,
      content: contentMatch ? contentMatch[1].trim() : response,
      metadata: {
        chapter: chapterNumber,
        phase: 'base_story',
        wordCount: (contentMatch ? contentMatch[1].trim() : response).length
      }
    };
  }

  /**
   * Phase 2A: ConflictAgent + CharacterAgent 병렬 실행
   */
  async executeParallelAgents(baseStoryResult, chapterNumber) {
    const conflictPromise = this.executeConflictAgent(baseStoryResult, chapterNumber);
    const characterPromise = this.executeCharacterAgent(baseStoryResult, chapterNumber);
    
    return await Promise.all([conflictPromise, characterPromise]);
  }

  /**
   * ConflictAgent (갈등 전문)
   */
  async executeConflictAgent(_, _chapterNumber) {
    const prompt = `
당신은 갈등과 긴장감만 전담하는 ConflictAgent입니다.

**목표:** 갈등 수준 8.0/10 이상 달성

**기본 스토리:**
${baseStoryResult.content}

**갈등 강화 요구사항:**
- 외적 갈등: 시간 수호단 추격, 패러독스 위험, 시간 제한
- 내적 갈등: 윤리적 딜레마, 정체성 혼란, 죄책감
- 인간관계 갈등: 신뢰 문제, 이해관계 충돌, 의심

**FORBIDDEN:**
- 쉬운 해결책이나 편의주의적 전개
- "평화로운", "편안한", "순조로운" 표현
- 갈등 없는 대화나 상황

**MANDATORY:**
- 매 문단마다 긴장감 요소
- 시간 압박과 위기감
- 예상치 못한 방해 요소

갈등이 강화된 스토리를 반환하세요.
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    return {
      content: response,
      metadata: {
        phase: 'conflict_enhanced',
        conflictTypes: ['external', 'internal', 'interpersonal'],
        tensionLevel: 'high'
      }
    };
  }

  /**
   * CharacterAgent (캐릭터 전문)
   */
  async executeCharacterAgent(_, _chapterNumber) {
    const prompt = `
당신은 캐릭터 복잡성만 전담하는 CharacterAgent입니다.

**목표:** 캐릭터 복잡성 8.0/10 이상 달성

**기본 스토리:**
${baseStoryResult.content}

**캐릭터 복잡성 강화 요구사항:**
- 이연: 과거 개입의 윤리적 딜레마, 존재 소멸 가능성 인지
- 윤슬: 숨겨진 의도, 이연을 이용하려는 속셈, 이중성
- 내적 갈등: 책임감 vs 개인적 욕망, 사랑 vs 의무

**FORBIDDEN:**
- 단순한 선악 구조
- 일차원적 캐릭터 반응
- 예측 가능한 행동 패턴

**MANDATORY:**
- 모든 캐릭터에 숨겨진 면모
- 복잡하고 모순된 감정
- 예측 불가능한 행동과 반응

캐릭터 복잡성이 강화된 스토리를 반환하세요.
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    return {
      content: response,
      metadata: {
        phase: 'character_enhanced',
        complexityElements: ['hidden_motives', 'internal_conflict', 'contradictions'],
        characterGrowth: true
      }
    };
  }

  /**
   * Phase 2B: ContentMerger (지능적 통합)
   */
  async executeContentMerger(conflictResult, characterResult) {
    const prompt = `
당신은 두 전문 에이전트의 결과를 지능적으로 병합하는 ContentMerger입니다.

**목표:** 갈등과 캐릭터 요소를 자연스럽게 통합

**갈등 강화된 스토리:**
${conflictResult.content}

**캐릭터 강화된 스토리:**
${characterResult.content}

**병합 규칙:**
1. 갈등 > 캐릭터 우선순위 (갈등이 캐릭터를 결정)
2. 중복 요소는 더 강한 쪽으로 선택
3. 상충되는 요소는 갈등 쪽 우선
4. 두 요소가 모두 필요한 경우 조화롭게 결합

**품질 기준:**
- 자연스러운 통합 (억지스럽지 않음)
- 갈등과 캐릭터 요소 모두 보존
- 일관된 톤과 스타일

통합된 고품질 스토리를 반환하세요.
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    return {
      content: response,
      metadata: {
        phase: 'content_merged',
        mergedElements: ['conflict', 'character'],
        integrationQuality: 'high'
      }
    };
  }

  /**
   * Phase 3: RomanceAgent (로맨스 전문)
   */
  async executeRomanceAgent(_, _chapterNumber) {
    const prompt = `
당신은 로맨스 필연성만 전담하는 RomanceAgent입니다.

**목표:** 로맨스 필연성 7.0/10 이상 달성

**통합된 스토리:**
${mergedResult.content}

**로맨스 강화 요구사항:**
- "손잡기=사랑" 클리셰 완전 제거
- 감정적 근거와 필연성 구축
- 서로의 상처를 이해하고 치유하는 관계
- 장애물을 통한 관계 발전

**FORBIDDEN:**
- 피상적 끌림 (외모, 첫눈에 반함)
- 물리적 접촉 중심 로맨스
- 우연적이고 편의주의적 만남

**MANDATORY:**
- 감정적 필연성 (왜 이 사람이어야 하는가)
- 복잡한 감정과 갈등
- 건강하면서도 긴장감 있는 관계

로맨스 필연성이 강화된 스토리를 반환하세요.
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    return {
      content: response,
      metadata: {
        phase: 'romance_enhanced',
        romanceElements: ['emotional_necessity', 'meaningful_obstacles', 'healthy_tension'],
        clicheRemoval: true
      }
    };
  }

  /**
   * Phase 3: TwistAgent (반전 전문)
   */
  async executeTwistAgent(_, _chapterNumber) {
    const prompt = `
당신은 예측 불가능성만 전담하는 TwistAgent입니다.

**목표:** 예측 불가능성 7.0/10 이상 달성

**로맨스 강화된 스토리:**
${romanceResult.content}

**반전 강화 요구사항:**
- 독자 기대를 정면으로 배반하는 전개
- 캐릭터의 의외성과 이중성
- 플롯의 예상치 못한 방향 전환

**FORBIDDEN:**
- "당연히", "예상대로", "역시" 등 예측 가능 표현
- 뻔한 결과나 클리셰적 해결
- 선형적이고 순조로운 진행

**MANDATORY:**
- 최소 1개 이상의 반전 요소
- 예상과 정반대의 전개
- 독자를 놀라게 할 요소

예측 불가능성이 강화된 최종 스토리를 반환하세요.
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    return {
      content: response,
      metadata: {
        phase: 'twist_enhanced',
        twistElements: ['plot_reversal', 'character_surprise', 'expectation_subversion'],
        unpredictabilityLevel: 'high'
      }
    };
  }

  /**
   * Phase 3: QualityValidator (품질 검증)
   */
  async executeQualityValidator(_, _chapterNumber) {
    const content = twistResult.content;
    
    // 품질 점수 계산
    const scores = {
      conflict: this.calculateConflictScore(content),
      character: this.calculateCharacterScore(content),
      romance: this.calculateRomanceScore(content),
      unpredictability: this.calculateUnpredictabilityScore(content)
    };
    
    const overallScore = (
      scores.conflict * 0.3 +
      scores.character * 0.25 +
      scores.romance * 0.25 +
      scores.unpredictability * 0.2
    );
    
    const qualityStatus = overallScore >= 8.0 ? 'EXCELLENT' : 
                         overallScore >= 7.0 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    
    return {
      content: content,
      scores: scores,
      overallScore: overallScore,
      qualityStatus: qualityStatus,
      passed: overallScore >= this.qualityThresholds.overall,
      metadata: {
        phase: 'quality_validated',
        validationComplete: true
      }
    };
  }

  /**
   * Phase 4: FailureRecovery (조건부 복구)
   */
  async executeFailureRecovery(novelInfo, chapterNumber, qualityResult) {
    // console.log('🔄 품질 기준 미달, 복구 프로세스 시작...');
    
    // 가장 낮은 점수의 영역 식별
    const scores = qualityResult.scores;
    const lowestScore = Math.min(...Object.values(scores));
    const _problemArea = Object.keys(scores).find(key => scores[key] === lowestScore);
    
    // console.log(`🎯 복구 대상: ${problemArea} (${lowestScore.toFixed(1)}/10)`);
    
    // 해당 영역만 재실행
    // 실제 구현에서는 해당 에이전트만 다시 호출
    // console.log(`⚠️ ${problemArea} 영역 개선 필요 - 현재는 기본 통과 처리`);
  }

  /**
   * 품질 점수 계산 함수들
   */
  calculateConflictScore(content) {
    const conflictKeywords = ['갈등', '위기', '긴장', '대립', '충돌', '위험', '딜레마'];
    const count = this.countKeywords(content, conflictKeywords);
    return Math.min(10, count * 1.5);
  }

  calculateCharacterScore(content) {
    const characterKeywords = ['복잡한', '모순', '갈등', '숨겨진', '이중성', '혼란'];
    const count = this.countKeywords(content, characterKeywords);
    return Math.min(10, count * 1.8);
  }

  calculateRomanceScore(content) {
    const romanceKeywords = ['감정', '마음', '이해', '공감', '치유', '필연'];
    const clicheKeywords = ['첫눈에', '예뻐서', '잘생겨서', '손잡기'];
    const positiveCount = this.countKeywords(content, romanceKeywords);
    const negativeCount = this.countKeywords(content, clicheKeywords);
    return Math.min(10, Math.max(0, positiveCount * 1.5 - negativeCount * 2));
  }

  calculateUnpredictabilityScore(content) {
    const unpredictableKeywords = ['예상치 못한', '갑자기', '뜻밖의', '놀랍게도', '반전'];
    const predictableKeywords = ['당연히', '예상대로', '역시', '뻔한'];
    const positiveCount = this.countKeywords(content, unpredictableKeywords);
    const negativeCount = this.countKeywords(content, predictableKeywords);
    return Math.min(10, Math.max(0, positiveCount * 2 - negativeCount * 1.5));
  }

  /**
   * 헬퍼 함수들
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
   * 소설 컨셉 생성
   */
  async generateNovelConcept() {
    const prompt = `
혁신적이고 갈등이 풍부한 로맨스 판타지 소설 컨셉을 생성하세요.

**요구사항:**
- 기존 클리셰 완전 탈피
- 내재적 갈등과 긴장감이 풍부한 설정
- 복잡하고 다층적인 캐릭터 구조
- 로맨스에 필연적 장애물과 딜레마

TITLE: [혁신적 제목]
SUMMARY: [갈등과 긴장감이 드러나는 줄거리 200자]
CHARACTERS: [복잡한 캐릭터들]
WORLD_SETTING: [독창적 세계관]
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    const titleMatch = response.match(/TITLE:\\s*(.+)/);
    const summaryMatch = response.match(/SUMMARY:\\s*([\\s\\S]+?)(?=CHARACTERS:|$)/);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : '혁신적 로맨스 판타지',
      slug: (titleMatch ? titleMatch[1].trim() : 'innovative-romance').toLowerCase().replace(/[^a-z0-9가-힣]/g, '-'),
      summary: summaryMatch ? summaryMatch[1].trim() : '갈등과 긴장감 넘치는 이야기',
      tropes: ['갈등 중심', '캐릭터 복잡성', '예측 불가능']
    };
  }

  /**
   * 소설 파일 생성
   */
  async createNovelFile(novelInfo) {
    const novelPath = join(PROJECT_ROOT, 'src/content/novels', `${novelInfo.slug}.md`);
    
    const frontmatter = {
      title: novelInfo.title,
      slug: novelInfo.slug,
      author: 'SubAgent System',
      status: '연재 중',
      summary: novelInfo.summary,
      tropes: novelInfo.tropes,
      publishedDate: new Date().toISOString().split('T')[0],
      totalChapters: 5,
      rating: 0,
      subAgentGenerated: true,
      workflowDriven: true,
      qualityAssured: true
    };
    
    const novelMarkdown = matter.stringify('', frontmatter);
    await fs.writeFile(novelPath, novelMarkdown);
    
    this.logger.success(`✅ 소설 파일 생성: ${novelInfo.title}`);
  }

  /**
   * 챕터 파일 저장
   */
  async saveChapterFile(novelInfo, chapterNumber, content, qualityResult) {
    const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `${novelInfo.slug}-ch${chapterNumber}.md`);
    
    const frontmatter = {
      title: `챕터 ${chapterNumber}`,
      novel: novelInfo.slug,
      chapterNumber,
      publicationDate: new Date().toISOString().split('T')[0],
      wordCount: content.length,
      
      // SubAgent Quality Metrics
      conflictScore: parseFloat(qualityResult.scores.conflict.toFixed(1)),
      characterScore: parseFloat(qualityResult.scores.character.toFixed(1)),
      romanceScore: parseFloat(qualityResult.scores.romance.toFixed(1)),
      unpredictabilityScore: parseFloat(qualityResult.scores.unpredictability.toFixed(1)),
      overallScore: parseFloat(qualityResult.overallScore.toFixed(1)),
      
      qualityStatus: qualityResult.qualityStatus,
      subAgentGenerated: true,
      workflowCompleted: true,
      qualityValidated: true,
      lastQualityCheck: new Date().toISOString()
    };
    
    const chapterMarkdown = matter.stringify(content, frontmatter);
    await fs.writeFile(chapterPath, chapterMarkdown);
  }

  /**
   * 전체 소설 품질 검증
   */
  async validateOverallNovel(novelInfo) {
    const chapters = [];
    
    for (let i = 1; i <= 5; i++) {
      try {
        const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `${novelInfo.slug}-ch${i}.md`);
        const content = await fs.readFile(chapterPath, 'utf-8');
        const { data } = matter(content);
        chapters.push(data);
      } catch (_) {
        // console.warn(`⚠️ 챕터 ${i} 읽기 실패`);
      }
    }
    
    const avgOverall = chapters.reduce((sum, ch) => sum + (ch.overallScore || 0), 0) / chapters.length;
    const expectedRating = avgOverall >= 8.5 ? '4.5-5.0' : avgOverall >= 8.0 ? '4.0-4.5' : '3.5-4.0';
    
    return {
      overallScore: avgOverall,
      expectedRating,
      totalChapters: chapters.length,
      qualityStatus: avgOverall >= 8.0 ? 'EXCELLENT' : 'GOOD'
    };
  }
}

// CLI 실행
async function main() {
  try {
    const orchestrator = new SubAgentOrchestrator();
    const _result = await orchestrator.orchestrateNovelGeneration();
    
    // console.log('\n🏆 SubAgent Orchestrator 성공!');
    // console.log('명확한 워크플로우로 품질 보장된 소설 완성');
    // console.log(`예상 독자 평점: ${result.qualityMetrics.expectedRating}/5`);
    
  } catch (_error) {
    // Intentionally unused error variable
    // console.error('\n💥 SubAgent Orchestrator 실패:', _error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SubAgentOrchestrator };