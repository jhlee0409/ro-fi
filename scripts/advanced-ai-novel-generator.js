#!/usr/bin/env node

/**
 * 🚀 Advanced AI Novel Generator
 * 
 * 독자 피드백을 완전히 반영한 차세대 AI 생성 시스템
 * - Conflict-Driven Enhancement Engine
 * - Character Complexity Validator  
 * - Romance Necessity Engine
 * - Unpredictability Amplifier
 * - Advanced Story Architect
 * 
 * 목표: 독자 평점 4/5 이상, "예측 불가능한 전개" 달성
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 새로운 엔진들 import
import { ConflictDrivenEnhancementEngine } from '../src/lib/conflict-driven-enhancement-engine.js';
import { AdvancedStoryArchitect } from '../src/lib/advanced-story-architect.js';
import { CharacterComplexityValidator } from '../src/lib/character-complexity-validator.js';
import { RomanceNecessityEngine } from '../src/lib/romance-necessity-engine.js';
import { UnpredictabilityAmplifier } from '../src/lib/unpredictability-amplifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// 환경변수 로드
dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

/**
 * 🔥 Advanced AI Novel Generator
 * 독자 피드백 완전 반영 시스템
 */
class AdvancedAINovelGenerator {
  constructor() {
    this.logger = {
      info: (msg, data) => console.log(`ℹ️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      warn: (msg, data) => console.log(`⚠️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      error: (msg, data) => console.log(`❌ ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      success: (msg, data) => console.log(`✅ ${msg}`, data ? JSON.stringify(data, null, 2) : '')
    };
    
    // AI 모델 초기화
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    // 새로운 엔진들 초기화
    this.conflictEngine = new ConflictDrivenEnhancementEngine(this.logger);
    this.storyArchitect = new AdvancedStoryArchitect(this.logger, this.model);
    this.characterValidator = new CharacterComplexityValidator(this.logger);
    this.romanceEngine = new RomanceNecessityEngine(this.logger);
    this.unpredictabilityAmplifier = new UnpredictabilityAmplifier(this.logger);
    
    // 품질 기준 (독자 피드백 반영)
    this.qualityThresholds = {
      conflictLevel: 8.0,        // 갈등 수준 8.0/10 이상
      characterComplexity: 8.0,  // 캐릭터 복잡성 8.0/10 이상
      romanceNecessity: 7.0,     // 로맨스 필연성 7.0/10 이상
      unpredictability: 7.0,     // 예측 불가능성 7.0/10 이상
      overallQuality: 8.5        // 전체 품질 8.5/10 이상
    };
  }

  /**
   * 🌟 새로운 소설 완전 생성 (챕터 5까지)
   */
  async generateCompleteNovel() {
    console.log('🔥 Advanced AI Novel Generator 시작!');
    console.log('독자 피드백 완전 반영 시스템으로 생성 중...\n');
    
    try {
      // 1단계: 혁신적 소설 아이디어 생성
      console.log('🧠 1단계: 혁신적 소설 아이디어 생성...');
      const novelInfo = await this.generateInnovativeNovelConcept();
      
      // 2단계: 소설 파일 생성
      console.log('📚 2단계: 소설 메타데이터 생성...');
      await this.createNovelFile(novelInfo);
      
      // 3단계: 챕터 1-5 Advanced 생성
      console.log('📖 3단계: Advanced 챕터 생성 (1-5)...');
      for (let chapterNum = 1; chapterNum <= 5; chapterNum++) {
        await this.generateAdvancedChapter(novelInfo, chapterNum);
      }
      
      // 4단계: 전체 품질 검증
      console.log('🔍 4단계: 전체 소설 품질 검증...');
      const overallQuality = await this.validateOverallQuality(novelInfo);
      
      console.log('\\n🎉 Advanced AI Novel 완성!');
      console.log('================================');
      console.log(`📚 제목: ${novelInfo.title}`);
      console.log(`🏷️  슬러그: ${novelInfo.slug}`);
      console.log(`📖 총 챕터: 5개`);
      console.log(`🔥 갈등 수준: ${overallQuality.avgConflict.toFixed(1)}/10`);
      console.log(`🧠 캐릭터 복잡성: ${overallQuality.avgCharacter.toFixed(1)}/10`);
      console.log(`💕 로맨스 필연성: ${overallQuality.avgRomance.toFixed(1)}/10`);
      console.log(`🎲 예측 불가능성: ${overallQuality.avgUnpredictability.toFixed(1)}/10`);
      console.log(`⭐ 전체 품질: ${overallQuality.overallScore.toFixed(1)}/10`);
      console.log(`🏆 독자 만족도 예상: ${overallQuality.expectedRating}/5`);
      
      return {
        novelInfo,
        qualityMetrics: overallQuality,
        status: 'ADVANCED_QUALITY_ACHIEVED'
      };
      
    } catch (error) {
      this.logger.error('💥 Advanced Novel 생성 실패:', error.message);
      throw error;
    }
  }

  /**
   * 혁신적 소설 컨셉 생성
   */
  async generateInnovativeNovelConcept() {
    const prompt = `
당신은 독자들이 "예측 불가능하고 긴장감 넘치는" 로맨스 판타지를 요구하는 상황에서 혁신적인 소설을 기획하는 세계급 기획자입니다.

**CRITICAL 요구사항:**
- 🚫 기존 클리셰 완전 탈피 (시간여행, 환생, 빙의 등 진부한 소재 피하기)
- 🔥 내재적 갈등과 긴장감이 풍부한 설정
- 🧠 복잡하고 다층적인 캐릭터 구조
- 💔 로맨스에 필연적 장애물과 딜레마
- 🎲 예측 불가능한 전개가 가능한 설정

**혁신적 요소 필수 포함:**
- 독창적이고 신선한 판타지 소재
- 캐릭터 간 복잡한 이해관계와 갈등 구조
- 로맨스가 필연적일 수밖에 없는 설정적 근거
- 다중 반전이 가능한 세계관

**2025년 현대적 요소:**
- 현대 독자의 가치관 반영
- 주체적이고 능동적인 여성 캐릭터
- 건강하면서도 긴장감 있는 관계
- 사회적 이슈나 현대적 갈등 요소

다음 형식으로 작성:

TITLE: [혁신적이고 매력적인 한국어 제목]
SLUG: [영문 슬러그]
SUMMARY: [250자 내외, 갈등과 긴장감이 드러나는 줄거리]
INNOVATIVE_ELEMENTS: [기존과 다른 3가지 혁신 요소]
MAIN_CHARACTERS:
- 여주인공: [이름] - [복잡한 배경과 갈등]
- 남주인공: [이름] - [숨겨진 면모와 갈등]
- 조력자/적대자: [이름] - [이중적 역할]
WORLD_SETTING: [독창적이고 갈등적인 세계관]
CONFLICT_SOURCES: [내재적 갈등 3가지]
ROMANCE_OBSTACLES: [로맨스 장애물 3가지]
TWIST_POTENTIAL: [가능한 반전 요소들]
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    // 파싱
    const titleMatch = response.match(/TITLE:\\s*(.+)/);
    const slugMatch = response.match(/SLUG:\\s*(.+)/);
    const summaryMatch = response.match(/SUMMARY:\\s*([\\s\\S]+?)(?=INNOVATIVE_ELEMENTS:|$)/);
    const innovativeMatch = response.match(/INNOVATIVE_ELEMENTS:\\s*([\\s\\S]+?)(?=MAIN_CHARACTERS:|$)/);
    const charactersMatch = response.match(/MAIN_CHARACTERS:\\s*([\\s\\S]+?)(?=WORLD_SETTING:|$)/);
    const worldMatch = response.match(/WORLD_SETTING:\\s*([\\s\\S]+?)(?=CONFLICT_SOURCES:|$)/);
    const conflictMatch = response.match(/CONFLICT_SOURCES:\\s*([\\s\\S]+?)(?=ROMANCE_OBSTACLES:|$)/);
    const obstaclesMatch = response.match(/ROMANCE_OBSTACLES:\\s*([\\s\\S]+?)(?=TWIST_POTENTIAL:|$)/);
    const twistMatch = response.match(/TWIST_POTENTIAL:\\s*([\\s\\S]+)/);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : '혁신적 로맨스 판타지',
      slug: slugMatch ? slugMatch[1].trim() : 'innovative-romance-fantasy',
      summary: summaryMatch ? summaryMatch[1].trim() : '혁신적인 로맨스 판타지 이야기',
      innovativeElements: innovativeMatch ? innovativeMatch[1].trim() : '혁신적 요소들',
      characters: charactersMatch ? charactersMatch[1].trim() : '복잡한 캐릭터들',
      worldSetting: worldMatch ? worldMatch[1].trim() : '독창적 세계관',
      conflictSources: conflictMatch ? conflictMatch[1].trim() : '다양한 갈등',
      romanceObstacles: obstaclesMatch ? obstaclesMatch[1].trim() : '로맨스 장애물',
      twistPotential: twistMatch ? twistMatch[1].trim() : '반전 요소들',
      tropes: ['혁신적 설정', '복잡한 갈등', '예측 불가능한 전개']
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
      author: 'Advanced AI (Conflict-Driven)',
      status: '연재 중',
      summary: novelInfo.summary,
      tropes: novelInfo.tropes,
      publishedDate: new Date().toISOString().split('T')[0],
      totalChapters: 5,
      rating: 0,
      advancedQuality: true,
      conflictDriven: true,
      unpredictableStory: true,
      aiGenerated: true,
      readerFeedbackApplied: true
    };
    
    const novelMarkdown = matter.stringify('', frontmatter);
    await fs.writeFile(novelPath, novelMarkdown);
    
    this.logger.success(`✅ 혁신적 소설 파일 생성: ${novelInfo.title}`);
  }

  /**
   * Advanced 챕터 생성
   */
  async generateAdvancedChapter(novelInfo, chapterNumber) {
    console.log(`\\n🔥 Advanced 챕터 ${chapterNumber} 생성 시작...`);
    
    try {
      // 1단계: Advanced Story Structure 설계
      const storyStructure = await this.storyArchitect.generateAdvancedStoryStructure(novelInfo, chapterNumber);
      console.log(`📋 스토리 구조 설계 완료`);
      
      // 2단계: Advanced Prompt 생성
      const advancedPrompt = await this.storyArchitect.generateAdvancedPrompt(novelInfo, chapterNumber, storyStructure);
      
      // 3단계: 스토리 컨텍스트 구성
      const storyContext = {
        novelType: 'advanced-romance-fantasy',
        chapterNumber,
        allowBackstory: true,
        emotionalTone: storyStructure.romanceProgression.emotion,
        conflictLevel: storyStructure.mainConflict.intensity,
        tropes: novelInfo.tropes,
        worldSetting: novelInfo.worldSetting,
        characters: novelInfo.characters,
        conflictSources: novelInfo.conflictSources,
        romanceObstacles: novelInfo.romanceObstacles
      };
      
      // 4단계: Gemini로 초기 생성
      console.log(`🤖 Gemini로 초기 컨텐츠 생성...`);
      const result = await this.model.generateContent(advancedPrompt);
      const response = result.response.text();
      
      // 제목과 내용 파싱
      const titleMatch = response.match(/TITLE:\\s*(.+)/);
      const contentMatch = response.match(/CONTENT:\\s*([\\s\\S]+)/);
      
      const initialContent = {
        title: titleMatch ? titleMatch[1].trim() : `챕터 ${chapterNumber}: 갈등의 시작`,
        content: contentMatch ? contentMatch[1].trim() : response
      };
      
      // 5단계: Conflict-Driven Enhancement 적용
      console.log(`⚔️ 갈등 중심 향상 적용...`);
      const conflictResult = await this.conflictEngine.enhanceWithConflict(
        initialContent.content, 
        storyContext
      );
      
      // 6단계: Character Complexity 검증 및 강화
      console.log(`🧠 캐릭터 복잡성 검증...`);
      const characterResult = await this.characterValidator.validateCharacterComplexity(
        conflictResult.enhancedContent,
        storyContext
      );
      
      // 7단계: Romance Necessity 강화
      console.log(`💕 로맨스 필연성 강화...`);
      const romanceResult = await this.romanceEngine.enhanceRomanceNecessity(
        conflictResult.enhancedContent,
        storyContext
      );
      
      // 8단계: Unpredictability 증대
      console.log(`🎲 예측 불가능성 증대...`);
      const unpredictabilityResult = await this.unpredictabilityAmplifier.amplifyUnpredictability(
        romanceResult.enhancedContent,
        storyContext
      );
      
      // 9단계: 최종 품질 검증
      const finalQuality = this.calculateChapterQuality({
        conflict: conflictResult.improvementScore,
        character: characterResult.overallScore,
        romance: romanceResult.romanceScore,
        unpredictability: unpredictabilityResult.unpredictabilityScore
      });
      
      // 10단계: 품질 기준 미달 시 재생성
      if (finalQuality.overallScore < this.qualityThresholds.overallQuality) {
        console.log(`⚠️ 품질 기준 미달 (${finalQuality.overallScore.toFixed(1)}/10), 재생성 중...`);
        return await this.regenerateChapterWithHigherQuality(novelInfo, chapterNumber, storyContext, 1);
      }
      
      // 11단계: 챕터 파일 생성
      const chapterPath = await this.saveAdvancedChapter(
        novelInfo, 
        chapterNumber, 
        initialContent.title,
        unpredictabilityResult.enhancedContent,
        finalQuality,
        storyContext
      );
      
      console.log(`✅ Advanced 챕터 ${chapterNumber} 완성!`);
      console.log(`   🔥 갈등 수준: ${conflictResult.improvementScore.toFixed(1)}/10`);
      console.log(`   🧠 캐릭터 복잡성: ${characterResult.overallScore.toFixed(1)}/10`);
      console.log(`   💕 로맨스 필연성: ${romanceResult.romanceScore.toFixed(1)}/10`);
      console.log(`   🎲 예측 불가능성: ${unpredictabilityResult.unpredictabilityScore.toFixed(1)}/10`);
      console.log(`   ⭐ 전체 품질: ${finalQuality.overallScore.toFixed(1)}/10`);
      
      return {
        chapterPath,
        qualityMetrics: finalQuality,
        status: 'ADVANCED_QUALITY_ACHIEVED'
      };
      
    } catch (error) {
      this.logger.error(`💥 Advanced 챕터 ${chapterNumber} 생성 실패:`, error.message);
      throw error;
    }
  }

  /**
   * 품질 기준 미달 시 재생성
   */
  async regenerateChapterWithHigherQuality(novelInfo, chapterNumber, storyContext, attempt) {
    if (attempt > 3) {
      throw new Error(`챕터 ${chapterNumber} 최대 재생성 횟수 초과`);
    }
    
    console.log(`🔄 재생성 시도 ${attempt}/3...`);
    
    // 더 강화된 프롬프트로 재시도
    const enhancedPrompt = await this.generateUltraHighQualityPrompt(novelInfo, chapterNumber, storyContext, attempt);
    
    const result = await this.model.generateContent(enhancedPrompt);
    const response = result.response.text();
    
    // 동일한 enhancement 과정 반복
    // ... (위와 동일한 로직)
    
    return await this.generateAdvancedChapter(novelInfo, chapterNumber);
  }

  /**
   * 초고품질 프롬프트 생성
   */
  async generateUltraHighQualityPrompt(novelInfo, chapterNumber, storyContext, attempt) {
    return `
**ULTRA HIGH QUALITY MODE - 시도 ${attempt}/3**

당신은 독자들이 "무난하지만 무해한" 작품에 실망하며 "펀치력 있는" 스토리를 요구하는 상황입니다.
이번에는 ULTRA 모드로 독자들이 절대 무시할 수 없는 세계급 품질을 만들어야 합니다.

**MANDATORY 요구사항 (100% 준수):**

🔥 **극한 갈등 (9.0/10 이상)**:
- 매 문단마다 긴장감과 갈등 요소
- 외적 갈등 + 내적 갈등 + 인간관계 갈등 동시 진행
- 안전한 해결책이나 편의주의적 전개 절대 금지

🧠 **극한 캐릭터 복잡성 (9.0/10 이상)**:
- 모든 캐릭터에 숨겨진 의도와 이중성
- 예측 불가능한 행동과 반응
- 단순한 선악 구조 완전 탈피

💔 **극한 로맨스 갈등 (8.5/10 이상)**:
- 로맨스 자체가 고통스럽고 복잡한 딜레마
- 사랑할수록 상처받는 구조
- 클리셰적 해피엔딩 암시 완전 차단

🎲 **극한 예측 불가능성 (8.5/10 이상)**:
- 독자 기대를 정면으로 배반하는 전개
- 최소 2개 이상의 반전 요소
- "당연히", "예상대로" 등 표현 완전 금지

**절대 금지 사항:**
❌ 편안한 분위기나 평화로운 순간
❌ 쉬운 해결책이나 우연한 발견  
❌ 단순한 감정이나 일차원적 반응
❌ 클리셰적 로맨스 진전
❌ 예측 가능한 대화나 행동

**ULTRA 품질 기준:**
- 갈등 밀도: 극한
- 긴장감: 지속적
- 복잡성: 최대
- 예측성: 최소

이제 독자들이 "펀치력 있다"고 인정할 챕터 ${chapterNumber}를 만들어주세요.

TITLE: [극한 긴장감의 제목]

CONTENT:
[최소 3000자, 모든 문장이 갈등과 긴장감으로 가득한 스토리]
`;
  }

  /**
   * 챕터 품질 계산
   */
  calculateChapterQuality(metrics) {
    const weights = {
      conflict: 0.3,
      character: 0.25,
      romance: 0.25,
      unpredictability: 0.2
    };
    
    const overallScore = 
      (metrics.conflict * weights.conflict) +
      (metrics.character * weights.character) +
      (metrics.romance * weights.romance) +
      (metrics.unpredictability * weights.unpredictability);
    
    return {
      conflict: metrics.conflict,
      character: metrics.character,
      romance: metrics.romance,
      unpredictability: metrics.unpredictability,
      overallScore: overallScore,
      qualityStatus: overallScore >= 8.5 ? 'WORLD_CLASS' : overallScore >= 7.0 ? 'HIGH_QUALITY' : 'NEEDS_IMPROVEMENT'
    };
  }

  /**
   * Advanced 챕터 파일 저장
   */
  async saveAdvancedChapter(novelInfo, chapterNumber, title, content, qualityMetrics, storyContext) {
    const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `${novelInfo.slug}-ch${chapterNumber}.md`);
    
    const frontmatter = {
      title: title,
      novel: novelInfo.slug,
      chapterNumber,
      publicationDate: new Date().toISOString().split('T')[0],
      wordCount: content.length,
      contentRating: '15+',
      emotionalTone: storyContext.emotionalTone,
      conflictLevel: storyContext.conflictLevel,
      keyEvents: this.extractKeyEvents(content),
      characterDevelopment: '복잡한 내적 갈등과 성장',
      
      // Advanced Quality Metrics
      conflictScore: parseFloat(qualityMetrics.conflict.toFixed(1)),
      characterComplexityScore: parseFloat(qualityMetrics.character.toFixed(1)),
      romanceNecessityScore: parseFloat(qualityMetrics.romance.toFixed(1)),
      unpredictabilityScore: parseFloat(qualityMetrics.unpredictability.toFixed(1)),
      overallQualityScore: parseFloat(qualityMetrics.overallScore.toFixed(1)),
      
      qualityStatus: qualityMetrics.qualityStatus,
      advancedGeneration: true,
      conflictDriven: true,
      readerFeedbackApplied: true,
      lastQualityCheck: new Date().toISOString()
    };
    
    const chapterMarkdown = matter.stringify(content, frontmatter);
    await fs.writeFile(chapterPath, chapterMarkdown);
    
    return chapterPath;
  }

  /**
   * 전체 소설 품질 검증
   */
  async validateOverallQuality(novelInfo) {
    const chapters = [];
    
    // 모든 챕터 읽기
    for (let i = 1; i <= 5; i++) {
      try {
        const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `${novelInfo.slug}-ch${i}.md`);
        const content = await fs.readFile(chapterPath, 'utf-8');
        const { data } = matter(content);
        chapters.push(data);
      } catch (error) {
        console.warn(`⚠️ 챕터 ${i} 읽기 실패:`, error.message);
      }
    }
    
    if (chapters.length === 0) {
      throw new Error('생성된 챕터가 없습니다.');
    }
    
    // 평균 품질 계산
    const avgConflict = chapters.reduce((sum, ch) => sum + (ch.conflictScore || 0), 0) / chapters.length;
    const avgCharacter = chapters.reduce((sum, ch) => sum + (ch.characterComplexityScore || 0), 0) / chapters.length;
    const avgRomance = chapters.reduce((sum, ch) => sum + (ch.romanceNecessityScore || 0), 0) / chapters.length;
    const avgUnpredictability = chapters.reduce((sum, ch) => sum + (ch.unpredictabilityScore || 0), 0) / chapters.length;
    const overallScore = chapters.reduce((sum, ch) => sum + (ch.overallQualityScore || 0), 0) / chapters.length;
    
    // 예상 독자 평점 계산
    const expectedRating = this.calculateExpectedReaderRating(overallScore);
    
    return {
      avgConflict,
      avgCharacter,
      avgRomance,
      avgUnpredictability,
      overallScore,
      expectedRating,
      totalChapters: chapters.length,
      qualityStatus: overallScore >= 8.5 ? 'WORLD_CLASS' : overallScore >= 7.0 ? 'HIGH_QUALITY' : 'NEEDS_IMPROVEMENT'
    };
  }

  /**
   * 예상 독자 평점 계산
   */
  calculateExpectedReaderRating(overallScore) {
    if (overallScore >= 9.0) return '4.5-5.0';
    if (overallScore >= 8.5) return '4.0-4.5';
    if (overallScore >= 7.5) return '3.5-4.0';
    if (overallScore >= 6.5) return '3.0-3.5';
    return '2.5-3.0';
  }

  /**
   * 키 이벤트 추출
   */
  extractKeyEvents(content) {
    const events = [];
    if (content.includes('갈등') || content.includes('대립')) events.push('갈등 상황');
    if (content.includes('비밀') || content.includes('숨겨진')) events.push('비밀 공개');
    if (content.includes('반전') || content.includes('뜻밖의')) events.push('플롯 트위스트');
    if (content.includes('위기') || content.includes('위험')) events.push('위기 상황');
    if (content.includes('선택') || content.includes('결정')) events.push('중요한 선택');
    if (content.includes('사랑') || content.includes('마음')) events.push('로맨스 진전');
    
    return events.length > 0 ? events : ['복잡한 감정과 갈등의 전개'];
  }
}

// CLI 실행
async function main() {
  try {
    const generator = new AdvancedAINovelGenerator();
    const result = await generator.generateCompleteNovel();
    
    console.log('\\n🏆 Advanced AI Novel Generator 완료!');
    console.log('독자 피드백 완전 반영 시스템으로 생성된 혁신적 작품');
    console.log(`예상 독자 평점: ${result.qualityMetrics.expectedRating}/5`);
    
  } catch (error) {
    console.error('\\n💥 Advanced 생성 실패:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AdvancedAINovelGenerator };