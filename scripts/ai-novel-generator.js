#!/usr/bin/env node

/**
 * 🌟 완전 새로운 Gemini API 기반 로맨스 판타지 자동 연재 시스템 v2.0
 * 
 * ✨ 특징:
 * - 100% Gemini API 직접 호출 (@google/generative-ai)
 * - GitHub Actions 완전 자동화
 * - 실제 프로덕션 품질의 로맨스 판타지 소설/챕터 생성
 * - 스마트 우선순위 로직 (완결 > 연재 > 신규)
 * - Git 자동 커밋/푸시
 * - 고품질 메타데이터 관리
 * - Gemini의 긴 컨텍스트와 빠른 응답 활용
 * 
 * 🚀 사용법:
 * node scripts/ai-novel-generator.js [--mode auto|new_novel|continue_chapter|complete_novel] [--creativity low|medium|high] [--dry-run] [--verbose] [--enable-continuity] [--disable-continuity]
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
// 🎯 연속성 시스템 통합 (v2.0)
import { GeneratorWrapper as _GeneratorWrapper } from '../src/lib/continuity-enhanced-generator.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// GENESIS AI 품질 엔진 통합
import { QualityAssuranceGateway } from '../src/lib/quality-engines/quality-assurance-gateway.js';
import { IntelligentDecisionEngine } from '../src/lib/intelligent-decision-engine.js';
import { PerformanceOptimizer } from '../src/lib/performance-optimizer.js';
import { WorldClassEnhancementEngine } from '../src/lib/world-class-enhancement-engine.js';

// 단순화된 프롬프트 시스템 (과적합 해소)
import { formatChapterTitle } from '../src/lib/config/prompt-config.js';
import { 
  SimplePromptBuilder,
  NOVEL_CREATION_TEMPLATE as _NOVEL_CREATION_TEMPLATE,
  CHAPTER_TEMPLATE as _CHAPTER_TEMPLATE
} from '../src/lib/config/simplified-prompt-templates.js';

// 연속성 관리 시스템 통합 (선택적)
let continuityIntegration = null;
try {
  const continuityModule = await import('../src/lib/continuity-integration.js');
  continuityIntegration = continuityModule.LegacyCompatibilityHelper;
} catch (_error) {
    // Intentionally unused error variable
  // console.log('연속성 시스템 로드 실패 (기존 방식으로 동작):', _error.message);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// 환경변수 로드 (GitHub Actions와 로컬 환경 모두 지원)
dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

// 🌟 중앙화된 품질 설정 사용
const { 
  QUALITY_THRESHOLDS: CENTRAL_THRESHOLDS, 
  IMPROVEMENT_STRATEGIES
} = await import('../src/lib/config/quality-config.js');

// GENESIS AI 세계급 품질 표준 (중앙 설정 기반)
const _WORLD_CLASS_STANDARDS = {
  overall: {
    minimumScore: CENTRAL_THRESHOLDS.minimum, // 7.0 (현실적 기준)
    targetScore: 9.7,
    excellenceThreshold: CENTRAL_THRESHOLDS.excellent, // 8.5
    worldClassThreshold: CENTRAL_THRESHOLDS.perfect, // 9.5
    masterworkThreshold: 9.8
  },
  plot: {
    progressionRate: IMPROVEMENT_STRATEGIES.plot.thresholds.progression, // 0.7
    noveltyScore: 0.7,
    engagementLevel: 0.85
  },
  character: {
    agencyLevel: IMPROVEMENT_STRATEGIES.character.thresholds.agency, // 0.6
    depthScore: 0.85,
    growthRate: IMPROVEMENT_STRATEGIES.character.thresholds.growth // 0.5
  },
  prose: {
    sophisticationLevel: 8.0,
    diversityScore: IMPROVEMENT_STRATEGIES.literary.thresholds.vocabulary, // 0.75
    literaryQuality: 8.5
  },
  romance: {
    chemistryScore: IMPROVEMENT_STRATEGIES.romance.thresholds.chemistry * 10, // 7.0
    progressionRate: IMPROVEMENT_STRATEGIES.romance.thresholds.progression, // 0.6
    emotionalDepth: IMPROVEMENT_STRATEGIES.romance.thresholds.emotionalDepth // 0.8
  }
};

// 설정
const CONFIG = {
  API_KEY: process.env.GEMINI_API_KEY,
  MODEL: 'gemini-2.5-pro',
  MAX_TOKENS: 8000,
  TEMPERATURE: 0.8,
  NOVEL_DIR: join(PROJECT_ROOT, 'src/content/novels'),
  CHAPTER_DIR: join(PROJECT_ROOT, 'src/content/chapters'),
  LOGS_DIR: join(PROJECT_ROOT, 'logs'),
  MIN_CHAPTER_WORDS: 4000,
  MAX_CHAPTER_WORDS: 6000,
  COMPLETION_CHAPTER_THRESHOLD: 50,
  MAX_ACTIVE_NOVELS: 2,
  UPDATE_THRESHOLD_DAYS: 3,
  // 중앙화된 품질 설정 사용
  QUALITY_ASSURANCE: {
    maxAttempts: 5,
    qualityThreshold: CENTRAL_THRESHOLDS.minimum, // 7.0 (현실적 기준)
    worldClassThreshold: CENTRAL_THRESHOLDS.perfect, // 9.5
    adaptiveImprovement: true,
    realTimeValidation: true,
    strictEnforcement: true,
    noCompromiseMode: true
  },
  PERFORMANCE: {
    parallelProcessing: true,
    intelligentCaching: true,
    adaptiveResourceManagement: true,
    realTimeOptimization: true
  }
};

// 로맨스 판타지 트로프와 장르 정의
const ROMANCE_TROPES = [
  'enemies-to-lovers', '계약연애', '정략결혼', '회귀', '빙의', '환생',
  '아카데미', '신분차이', '운명의상대', '소울메이트', '마법적연결',
  '복수와구원', '금지된사랑', '시간역행', '이계전이', '능력각성'
];

const NOVEL_THEMES = [
  '황실로맨스', '마법아카데미', '기사와귀족', '용족황제', '마도사학원',
  '엘프왕국', '시간여행자', '전생귀족영애', '마탑의마법사', '신전의성녀'
];

// 커스텀 에러 클래스 정의
class QualityThresholdError extends Error {
  constructor(message, score) {
    super(message);
    this.name = 'QualityThresholdError';
    this.score = score;
  
    // 🎯 연속성 시스템 초기화
    this._initializeContinuitySystem();
  }
}

class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
    this.logFile = join(CONFIG.LOGS_DIR, `ai-novel-${new Date().toISOString().split('T')[0]}.log`);
    this.ensureLogDir();
  }

  async ensureLogDir() {
    try {
      await fs.mkdir(CONFIG.LOGS_DIR, { recursive: true });
    } catch (_) {
      // 디렉토리가 이미 존재하는 경우 무시
    }
  }

  async log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}${data ? ` | ${JSON.stringify(data)}` : ''}\n`;

    if (this.verbose || level === 'ERROR') {
      console.log(logLine.trim());
    }

    try {
      await fs.appendFile(this.logFile, logLine);
    } catch (_error) {
    // Intentionally unused error variable
      // console.error('로그 파일 쓰기 실패:', _error);
    }
  }

  info(message, data) { return this.log('INFO', message, data); }
  warn(message, data) { return this.log('WARN', message, data); }
  error(message, data) { return this.log('ERROR', message, data); }
  success(message, data) { return this.log('SUCCESS', message, data); }
}

class ContentAnalyzer {
  constructor(logger) {
    this.logger = logger;
  }

  async analyzeCurrentState() {
    await this.logger.info('현재 연재 상황 분석 시작');

    const novels = await this.loadAllNovels();
    const chapters = await this.loadAllChapters();

    const analysis = {
      novels: novels.map(novel => ({
        ...novel,
        chapterCount: chapters.filter(ch => ch.novel === novel.slug).length,
        lastUpdate: this.getLastUpdateDate(novel.slug, chapters),
        daysSinceUpdate: this.getDaysSinceUpdate(novel.slug, chapters),
        canComplete: this.canCompleteNovel(novel.slug, chapters),
        needsUpdate: this.needsUpdate(novel.slug, chapters)
      })),
      totalNovels: novels.length,
      activeNovels: novels.filter(n => n.status === '연재 중').length,
      totalChapters: chapters.length,
      completableNovels: novels.filter(n => this.canCompleteNovel(n.slug, chapters)).length,
      updateNeededNovels: novels.filter(n => this.needsUpdate(n.slug, chapters)).length
    };

    await this.logger.info('분석 완료', analysis);
    return analysis;
  }

  async loadAllNovels() {
    try {
      const files = await fs.readdir(CONFIG.NOVEL_DIR);
      const novels = [];

      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(join(CONFIG.NOVEL_DIR, file), 'utf-8');
          const { data } = matter(content);
          novels.push({
            slug: file.replace('.md', ''),
            ...data
          });
        }
      }

      return novels;
    } catch (_error) {
    // Intentionally unused error variable
      await this.logger.warn('소설 파일 로드 실패', { error: _error.message });
      return [];
    }
  }

  async loadAllChapters() {
    try {
      const files = await fs.readdir(CONFIG.CHAPTER_DIR);
      const chapters = [];

      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(join(CONFIG.CHAPTER_DIR, file), 'utf-8');
          const { data } = matter(content);
          chapters.push({
            filename: file,
            ...data
          });
        }
      }

      return chapters.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));
    } catch (_error) {
    // Intentionally unused error variable
      await this.logger.warn('챕터 파일 로드 실패', { error: _error.message });
      return [];
    }
  }

  getLastUpdateDate(novelSlug, chapters) {
    const novelChapters = chapters.filter(ch => ch.novel === novelSlug);
    if (novelChapters.length === 0) return null;
    return novelChapters[0].publicationDate;
  }

  getDaysSinceUpdate(novelSlug, chapters) {
    const lastUpdate = this.getLastUpdateDate(novelSlug, chapters);
    if (!lastUpdate) return Infinity;
    
    const now = new Date();
    const lastUpdateDate = new Date(lastUpdate);
    return Math.floor((now - lastUpdateDate) / (1000 * 60 * 60 * 24));
  }

  canCompleteNovel(novelSlug, chapters) {
    const chapterCount = chapters.filter(ch => ch.novel === novelSlug).length;
    return chapterCount >= CONFIG.COMPLETION_CHAPTER_THRESHOLD;
  }

  needsUpdate(novelSlug, chapters) {
    const daysSince = this.getDaysSinceUpdate(novelSlug, chapters);
    return daysSince >= CONFIG.UPDATE_THRESHOLD_DAYS;
  }
}

class NovelGenerator {
  constructor(logger) {
    this.logger = logger;
    this.genAI = new GoogleGenerativeAI(CONFIG.API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: CONFIG.MODEL,
      generationConfig: {
        maxOutputTokens: CONFIG.MAX_TOKENS,
      }
    });
    
    // 🚀 GENESIS AI 세계급 시스템 초기화
    this.worldClassEngine = new WorldClassEnhancementEngine(logger);
    this.qualityGateway = new QualityAssuranceGateway(logger);
    this.decisionEngine = new IntelligentDecisionEngine(logger);
    this.performanceOptimizer = new PerformanceOptimizer(logger);
    
    this.qualityMode = true; // 품질 검증 활성화
    this.worldClassMode = true; // 세계급 모드 활성화
    this.generationStats = {
      totalGenerations: 0,
      qualityImprovements: 0,
      averageScore: 0,
      successRate: 0
    };
    
    // 지능형 프롬프트 캐싱
    this.promptCache = new Map();
    this.contextAnalysisCache = new Map();
  }

  /**
   * 🌟 GENESIS AI 세계급 컨텐츠 생성 엔진
   * - 다단계 품질 보장 워크플로우
   * - 지능형 프롬프트 시스템
   * - 실시간 성능 최적화
   * - 자동 에러 복구
   */
  async generateContent(prompt, creativity = 'high', storyContext = {}) {
    const operationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    try {
      await this.logger.info('🚀 GENESIS AI 세계급 생성 시작', { 
        operationId, 
        creativity, 
        contextType: storyContext.novelType,
        worldClassMode: this.worldClassMode
      });

      // Step 1: 지능형 컨텍스트 분석
      const contextAnalysis = await this.analyzeStoryContext(storyContext);
      
      // Step 2: 단순화된 프롬프트 생성 (과적합 해소)
      const simplifiedPrompt = await this.generateSimplifiedPrompt({
        basePrompt: prompt,
        storyContext: contextAnalysis,
        creativity
      });

      // Step 3: 품질 보장 생성 워크플로우
      const generationResult = await this.generateWithQualityAssurance({
        prompt: simplifiedPrompt,
        creativity,
        storyContext: contextAnalysis,
        operationId
      });

      // Step 4: 실시간 성능 메트릭 업데이트
      this.updateGenerationStats(generationResult, startTime);

      await this.logger.success('✨ GENESIS AI 세계급 생성 완료', {
        operationId,
        qualityScore: generationResult.qualityScore,
        duration: Date.now() - startTime,
        improvementCycles: generationResult.improvementCycles
      });

      return generationResult.content;

    } catch (_error) {
    // Intentionally unused error variable
      await this.logger.error(`콘텐츠 생성 실패: ${_error.message}`, { operationId, error: _error.stack });
      throw _error;
    }
  }

  /**
   * 🧠 지능형 스토리 컨텍스트 분석
   */
  async analyzeStoryContext(storyContext) {
    const cacheKey = JSON.stringify(storyContext);
    
    if (this.contextAnalysisCache.has(cacheKey)) {
      return this.contextAnalysisCache.get(cacheKey);
    }

    const analysis = {
      novelType: storyContext.novelType || 'unknown',
      complexity: this.calculateComplexity(storyContext),
      qualityRequirements: this.deriveQualityRequirements(storyContext),
      narrativeStage: this.identifyNarrativeStage(storyContext),
      characterProfiles: this.analyzeCharacterProfiles(storyContext),
      plotProgression: this.analyzePlotProgression(storyContext)
    };

    this.contextAnalysisCache.set(cacheKey, analysis);
    return analysis;
  }

  /**
   * 📝 단순화된 프롬프트 생성 시스템 (과적합 해소)
   */
  async generateSimplifiedPrompt({ basePrompt, storyContext: _storyContext, creativity }) {
    const promptKey = `${basePrompt.substring(0, 100)}_${creativity}_simplified`;
    
    if (this.promptCache.has(promptKey)) {
      return this.promptCache.get(promptKey);
    }

    // 단순화된 프롬프트 - 핵심만 남김
    const enhancedPrompt = basePrompt;

    this.promptCache.set(promptKey, enhancedPrompt);
    return enhancedPrompt;
  }

  /**
   * 🛡️ 품질 보장 생성 워크플로우
   */
  async generateWithQualityAssurance({ prompt, creativity, storyContext, operationId }) {
    const temperatureMap = { low: 0.4, medium: 0.7, high: 0.9 };
    let attempt = 1;
    let bestResult = null;
    let bestScore = 0;

    while (attempt <= CONFIG.QUALITY_ASSURANCE.maxAttempts) {
      try {
        await this.logger.info(`🔄 생성 시도 ${attempt}/${CONFIG.QUALITY_ASSURANCE.maxAttempts}`, { operationId });

        // Gemini API 호출
        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: temperatureMap[creativity] || 0.7,
            maxOutputTokens: CONFIG.MAX_TOKENS,
          }
        });

        const response = await result.response;
        let content = response.text();

        // 🌟 STEP 1: 세계급 컨텐츠 변환 (분석.md/개선.md 기반)
        if (this.worldClassMode) {
          await this.logger.info('세계급 컨텐츠 변환 적용', { operationId });
          const enhancementResult = await this.worldClassEngine.enhanceContent(
            content,
            { genre: ['romance', 'fantasy'], ...storyContext }
          );
          
          content = enhancementResult.content;
          
          await this.logger.info('세계급 변환 완료', {
            operationId,
            qualityScore: enhancementResult.qualityScore,
            enhancements: enhancementResult.enhancements
          });
        }

        // 🛡️ STEP 2: 품질 검증 및 추가 개선
        if (this.qualityMode) {
          const qualityResult = await this.qualityGateway.validateQualityThreshold(
            content,
            storyContext
          );

          const finalScore = qualityResult.qualityReport.overallScore;
          
          if (finalScore >= CONFIG.QUALITY_ASSURANCE.qualityThreshold) {
            // 품질 기준 달성
            return {
              content: qualityResult.improvedContent || content,
              qualityScore: finalScore,
              qualityReport: qualityResult.qualityReport,
              improvementCycles: qualityResult.attemptCount,
              attemptNumber: attempt
            };
          } else {
            // 세계급 기준 미달 - 재시도 필요
            await this.logger.warn(`품질 기준 미달 (${finalScore}/10, 최소 ${CONFIG.QUALITY_ASSURANCE.qualityThreshold} 필요)`, {
              operationId,
              attempt,
              score: finalScore,
              threshold: CONFIG.QUALITY_ASSURANCE.qualityThreshold
            });
            
            if (finalScore > bestScore) {
              bestResult = {
                content: qualityResult.improvedContent || content,
                qualityScore: finalScore,
                qualityReport: qualityResult.qualityReport,
                improvementCycles: qualityResult.attemptCount,
                attemptNumber: attempt
              };
              bestScore = finalScore;
            }
          }
        } else {
          // 품질 검증 비활성화 시 바로 반환
          return {
            content,
            qualityScore: 8.0, // 기본 점수
            improvementCycles: 0,
            attemptNumber: attempt
          };
        }

        attempt++;
      } catch (_error) {
    // Intentionally unused error variable
        await this.logger.warn(`생성 시도 ${attempt} 실패`, { operationId, attempt, error: _error.message });
        
        if (attempt === CONFIG.QUALITY_ASSURANCE.maxAttempts) {
          // 최종 시도도 실패한 경우
          if (bestResult) {
            await this.logger.warn('최고 품질 결과 반환', { 
              operationId, 
              score: bestScore,
              threshold: CONFIG.QUALITY_ASSURANCE.qualityThreshold
            });
            return bestResult;
          }
          throw _error;
        }
        attempt++;
      }
    }

    // 세계급 기준 엄격 적용 - 타협 불가
    if (bestResult && bestResult.qualityScore >= CONFIG.QUALITY_ASSURANCE.qualityThreshold) {
      await this.logger.success('지연된 품질 기준 달성', { 
        operationId, 
        score: bestScore,
        threshold: CONFIG.QUALITY_ASSURANCE.qualityThreshold
      });
      return bestResult;
    }

    // 품질 기준 미달 시 절대 반환하지 않음
    const errorMessage = `세계급 품질 기준 미달: 최고 점수 ${bestScore}/10 (최소 ${CONFIG.QUALITY_ASSURANCE.qualityThreshold} 필요). 독자 비판을 방지하기 위해 생성을 거부합니다.`;
    await this.logger.error(errorMessage, {
      operationId,
      bestScore,
      threshold: CONFIG.QUALITY_ASSURANCE.qualityThreshold,
      qualityReport: bestResult?.qualityReport
    });
    
    throw new QualityThresholdError(errorMessage, bestScore);
  }

  async createNewNovel(creativity = 'high') {
    await this.logger.info('새 소설 생성 시작');

    const theme = NOVEL_THEMES[Math.floor(Math.random() * NOVEL_THEMES.length)];
    const tropes = this.selectRandomTropes(3);

    // 🚀 Enhanced 프롬프트 시스템 적용
    const requirements = {
      theme,
      tropes,
      targetAudience: '20-30대 한국 여성 로맨스 판타지 마니아',
      goalViews: '일일 조회수 10만+ 달성'
    };

    const builder = new SimplePromptBuilder();
    const prompt = builder.addNovelCreation(requirements).build();

    const storyContext = { novelType: 'new', theme, tropes };
    const response = await this.generateContent(prompt, creativity, storyContext);
    return this.parseNovelResponse(response);
  }

  async continueNovel(novelSlug, existingChapters, creativity = 'medium') {
    await this.logger.info('소설 연재 계속', { novelSlug });

    // 기존 챕터들 읽기
    const lastChapters = existingChapters
      .filter(ch => ch.novel === novelSlug)
      .slice(0, 3) // 최근 3화
      .reverse(); // 시간순 정렬

    const nextChapterNumber = existingChapters.filter(ch => ch.novel === novelSlug).length + 1;

    const contextContent = await this.buildChapterContext(lastChapters);

    // 🚀 Enhanced 프롬프트 시스템 적용 - 과학적 챕터 생성
    const requirements = {
      wordCount: '4000-5000자',
      emotionalGoal: '설렘과 긴장감 동시 증폭',
      cliffhangerLevel: '9/10 (매우 강력함)',
      continuityContext: contextContent,
      novelSlug,
      nextChapterNumber
    };

    const builder = new SimplePromptBuilder();
    const prompt = builder.addChapterRequest(nextChapterNumber, requirements.previousSummary).build();

    const storyContext = { 
      novelType: 'continue', 
      novelSlug, 
      nextChapterNumber,
      previousChapters: lastChapters,
      totalChapters: existingChapters.filter(ch => ch.novel === novelSlug).length
    };
    const response = await this.generateContent(prompt, creativity, storyContext);
    return this.parseChapterResponse(response, novelSlug, nextChapterNumber);
  }

  async completeNovel(novelSlug, existingChapters, creativity = 'high') {
    await this.logger.info('소설 완결 처리', { novelSlug });

    const novelChapters = existingChapters.filter(ch => ch.novel === novelSlug);
    const lastChapters = novelChapters.slice(0, 5).reverse(); // 최근 5화 컨텍스트
    const nextChapterNumber = novelChapters.length + 1;

    const contextContent = await this.buildChapterContext(lastChapters);

    // 🚀 Enhanced 프롬프트 시스템 적용 - 마스터급 완결편 생성
    const prompt = new MasterPromptBuilder()
      .addMasterPersona()
      .addCustomSection(`
## 🏆 대망의 완결편 집필 미션 - 세계급 품질 보장

드디어 이 대작 로맨스 판타지 소설을 **문학사에 남을 최고의 피날레**로 완결시킬 시간이 왔습니다!
수많은 독자들이 기다려온 **전설적인 마무리**를 선사해주세요.

## 📚 전체 스토리 흐름 정리
${contextContent}

## 🎯 세계급 완결편 전략 (프롬프트 마스터 품질)

### ${nextChapterNumber}화 미션 - 감정적 카타르시스 극대화
- **독자 감동지수**: 95% 이상의 독자가 눈물을 흘릴 수 있는 완성도
- **플롯 해결도**: 모든 갈등과 복선의 100% 완벽한 해결
- **로맨스 만족도**: 두 주인공의 사랑이 절대적으로 확신되는 장면
- **문학적 가치**: 독자들이 오래도록 기억할 명문장과 상징적 장면

## 📋 출력 형식

=== COMPLETION CHAPTER ${nextChapterNumber} ===
${formatChapterTitle(nextChapterNumber, '[독자들의 심장을 뛰게 할 제목]')}
WORD_COUNT: [정확한 글자 수]
IS_FINAL: [이것이 최종화면 true, 아니면 false]

[4000-5000자의 완벽한 완결 챕터 본문]

## 🌟 마스터급 완결편 집필 원칙

### 감정적 완성도 (목표: 10/10)
- 지금까지 쌓인 모든 감정의 폭발적 해소
- 캐릭터들의 성장 여정이 명확히 드러나는 장면들
- 독자가 "정말 잘 끝났다"고 확신할 수 있는 절대적 만족감

### 문학적 예술성 (목표: 9.5/10)
- 처음부터 지금까지의 여정을 아우르는 서술
- 상징적이고 인상적인 마지막 장면
- 독자들의 가슴에 영원히 남을 명문장

이제 **한국 웹소설 역사에 남을 전설적인 완결편**을 창작해주세요! 🎊✨
      `)
      .build();

    const storyContext = { 
      novelType: 'complete', 
      novelSlug, 
      nextChapterNumber,
      previousChapters: lastChapters,
      totalChapters: novelChapters.length,
      isCompletion: true
    };
    const response = await this.generateContent(prompt, creativity, storyContext);
    return this.parseChapterResponse(response, novelSlug, nextChapterNumber, true);
  }

  async buildChapterContext(chapters) {
    if (chapters.length === 0) return '(기존 챕터 없음)';

    let context = '';
    for (const chapter of chapters) {
      try {
        const filePath = join(CONFIG.CHAPTER_DIR, chapter.filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const { content: chapterContent } = matter(content);
        
        context += `\n--- ${chapter.title} (${chapter.chapterNumber}화) ---\n`;
        context += chapterContent.substring(0, 1000) + '...\n';
      } catch (_) {
        await this.logger.warn('챕터 파일 읽기 실패', { filename: chapter.filename });
      }
    }

    return context;
  }

  selectRandomTropes(count) {
    const shuffled = [...ROMANCE_TROPES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  parseNovelResponse(response) {
    const metadataMatch = response.match(/=== METADATA ===([\s\S]*?)=== CHAPTER 1 ===/);
    const chapterMatch = response.match(/=== CHAPTER 1 ===([\s\S]*?)$/);

    if (!metadataMatch || !chapterMatch) {
      throw new Error('AI 응답 파싱 실패: 필요한 섹션을 찾을 수 없습니다');
    }

    const metadata = this.parseMetadata(metadataMatch[1]);
    const chapter = this.parseChapter(chapterMatch[1], metadata.slug, 1);

    return { metadata, chapter };
  }

  parseChapterResponse(response, novelSlug, chapterNumber, isCompletion = false) {
    const chapterMatch = response.match(/=== (?:CHAPTER|COMPLETION CHAPTER) \d+ ===([\s\S]*?)$/);
    
    if (!chapterMatch) {
      throw new Error('AI 응답 파싱 실패: 챕터 섹션을 찾을 수 없습니다');
    }

    return this.parseChapter(chapterMatch[1], novelSlug, chapterNumber, isCompletion);
  }

  parseMetadata(metadataText) {
    const lines = metadataText.trim().split('\n');
    const metadata = {};

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        const cleanKey = key.trim().toLowerCase();

        switch (cleanKey) {
          case 'title':
            metadata.title = value;
            break;
          case 'slug':
            metadata.slug = value;
            break;
          case 'summary':
            metadata.summary = value;
            break;
          case 'tropes':
            metadata.tropes = this.parseTropesArray(value);
            break;
        }
      }
    }

    // slug가 없거나 부적절한 경우 제목에서 자동 생성
    if (!metadata.slug || metadata.slug.startsWith('novel-')) {
      metadata.slug = this.generateSlugFromTitle(metadata.title);
    }

    // 품질 검증 및 기본값 설정
    metadata.title = metadata.title || '새로운 로맨스 판타지';
    metadata.summary = metadata.summary || '흥미진진한 로맨스 판타지 이야기가 펼쳐집니다.';
    metadata.tropes = metadata.tropes || ['로맨스', '판타지'];

    // 품질 검증
    this.validateMetadataQuality(metadata);

    return metadata;
  }

  validateMetadataQuality(metadata) {
    const issues = [];

    // 제목 품질 검증
    if (!metadata.title || metadata.title.length < 5) {
      issues.push('제목이 너무 짧습니다 (최소 5자)');
    }
    if (metadata.title === '새로운 로맨스 판타지' || metadata.title.includes('새로운')) {
      issues.push('제목이 너무 일반적입니다');
    }

    // 줄거리 품질 검증
    if (!metadata.summary || metadata.summary.length < 50) {
      issues.push('줄거리가 너무 짧습니다 (최소 50자)');
    }
    if (metadata.summary.includes('Gemini AI가 자동 생성한')) {
      issues.push('줄거리가 자동 생성 텍스트입니다');
    }

    // Slug 품질 검증
    if (!metadata.slug || metadata.slug.startsWith('novel-')) {
      issues.push('Slug가 자동 생성 형태입니다');
    }

    // 트로프 품질 검증
    if (!metadata.tropes || metadata.tropes.length < 2) {
      issues.push('트로프가 부족합니다 (최소 2개)');
    }
    const genericTropes = ['로맨스', '판타지'];
    if (metadata.tropes.every(trope => genericTropes.includes(trope))) {
      issues.push('트로프가 너무 일반적입니다');
    }

    if (issues.length > 0) {
      throw new Error(`메타데이터 품질 검증 실패: ${issues.join(', ')}`);
    }
  }

  generateSlugFromTitle(title) {
    if (!title) {
      // 랜덤 로맨스 판타지 slug 생성
      const themes = ['mystic-love', 'dragon-heart', 'magic-academy', 'royal-romance', 'time-traveler'];
      return themes[Math.floor(Math.random() * themes.length)] + '-' + Date.now().toString().slice(-6);
    }

    // 한글 제목 -> 영문 slug 변환 매핑
    const koreanToEnglish = {
      // 일반 단어
      '황제': 'emperor', '마녀': 'witch', '기사': 'knight', '공주': 'princess',
      '드래곤': 'dragon', '마법': 'magic', '사랑': 'love', '운명': 'destiny',
      '그림자': 'shadow', '꽃': 'flower', '달': 'moon', '별': 'star',
      '아카데미': 'academy', '학원': 'academy', '궁전': 'palace', '성': 'castle',
      
      // 색깔
      '황금': 'golden', '은빛': 'silver', '잿빛': 'ash', '푸른': 'blue',
      '붉은': 'red', '검은': 'black', '하얀': 'white',
      
      // 동작/상태
      '피어나는': 'blooming', '빛나는': 'shining', '숨겨진': 'hidden',
      '잃어버린': 'lost', '선택받은': 'chosen', '저주받은': 'cursed',
      
      // 관계
      '와': 'and', '의': 'of', '에서': 'in', '속에서': 'in', '로': 'to'
    };

    let slug = title.toLowerCase();
    
    // 한글 단어를 영문으로 변환
    for (const [korean, english] of Object.entries(koreanToEnglish)) {
      slug = slug.replace(new RegExp(korean, 'g'), english);
    }
    
    
    // 한글 자모 분해 및 변환 (단순화된 버전)
    slug = slug.replace(/[가-힣]/g, (char) => {
      // 간단한 한글 -> 영문 변환 (음성적 근사)
      const charCode = char.charCodeAt(0) - 44032;
      const jong = charCode % 28;
      const jung = (charCode - jong) / 28 % 21;
      const cho = ((charCode - jong) / 28 - jung) / 21;
      
      const choMap = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
      const jungMap = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','yi','i'];
      const jongMap = ['','g','kk','gs','n','nj','nh','d','r','rg','rm','rb','rs','rt','rp','rh','m','b','bs','s','ss','ng','j','ch','k','t','p','h'];
      
      return (choMap[cho] || '') + (jungMap[jung] || '') + (jongMap[jong] || '');
    });
    
    // 특수문자 제거 및 정규화
    slug = slug
      .replace(/[^a-z0-9\s-]/g, '') // 영문, 숫자, 공백, 하이픈만 남김
      .replace(/\s+/g, '-') // 공백을 하이픈으로
      .replace(/-+/g, '-') // 연속 하이픈 제거
      .replace(/^-|-$/g, ''); // 시작/끝 하이픈 제거
    
    // 빈 slug나 너무 짧은 경우 기본값 사용
    if (!slug || slug.length < 3) {
      slug = 'romance-fantasy-' + Date.now().toString().slice(-6);
    }
    
    return slug;
  }

  parseChapter(chapterText, novelSlug, chapterNumber, isCompletion = false) {
    const lines = chapterText.trim().split('\n');
    let title = '';
    const wordCount = 0;
    let isFinal = false;
    let content = '';
    let contentStarted = false;

    for (const line of lines) {
      if (line.startsWith('CHAPTER_TITLE:')) {
        title = line.replace('CHAPTER_TITLE:', '').trim();
      } else if (line.startsWith('WORD_COUNT:')) {
        const _wordCount = parseInt(line.replace('WORD_COUNT:', '').trim()) || 0;
      } else if (line.startsWith('IS_FINAL:')) {
        isFinal = line.replace('IS_FINAL:', '').trim() === 'true';
      } else if (line.trim() === '' && !contentStarted) {
        contentStarted = true;
      } else if (contentStarted) {
        content += line + '\n';
      }
    }

    // 메타데이터 누출 방지 필터링
    let cleanContent = content.trim();
    
    // 개발자 주석 제거
    cleanContent = cleanContent.replace(/\[.*?자.*?콘텐츠\]/g, '');
    
    // 예측 지표 섹션 제거
    cleanContent = cleanContent.replace(/\*\*대박 예측 지표\*\*:[\s\S]*?(\n\n|$)/g, '');
    
    // 목표 관련 문구 제거
    cleanContent = cleanContent.replace(/목표:.*?📈/g, '');
    
    // 기타 메타데이터 패턴 제거
    cleanContent = cleanContent.replace(/---\s*\n\n\*\*대박.*?$/gm, '');
    
    return {
      title: title || `${chapterNumber}화`,
      novel: novelSlug,
      chapterNumber,
      content: cleanContent,
      wordCount: cleanContent.replace(/\s/g, '').length, // 공백 제거 후 실제 글자 수
      isCompletion,
      isFinal
    };
  }

  parseTropesArray(tropesStr) {
    try {
      // 배열 형태로 파싱 시도
      if (tropesStr.startsWith('[') && tropesStr.endsWith(']')) {
        return JSON.parse(tropesStr);
      }
      // 콤마로 구분된 문자열 처리
      return tropesStr.split(',').map(t => t.trim());
    } catch (_) {
      return [tropesStr];
    }
  }

  /**
   * 스토리 복잡도 계산
   */
  calculateComplexity(storyContext) {
    let complexity = 0.5; // 기본 복잡도
    
    if (storyContext.novelType === 'new') complexity += 0.3;
    if (storyContext.novelType === 'complete') complexity += 0.2;
    if (storyContext.tropes && storyContext.tropes.length > 2) complexity += 0.1;
    if (storyContext.theme && storyContext.theme.includes('복잡')) complexity += 0.2;
    
    return Math.min(1.0, complexity);
  }

  /**
   * 품질 요구사항 도출
   */
  deriveQualityRequirements(storyContext) {
    return {
      emotionalDepth: storyContext.novelType === 'new' ? 8.5 : 7.5,
      plotCoherence: 8.0,
      characterDevelopment: 8.5,
      languageQuality: 8.0
    };
  }

  /**
   * 서사 단계 식별
   */
  identifyNarrativeStage(storyContext) {
    if (storyContext.novelType === 'new') return 'introduction';
    if (storyContext.novelType === 'continue') return 'development';
    if (storyContext.novelType === 'complete') return 'resolution';
    return 'unknown';
  }

  /**
   * 캐릭터 프로필 분석
   */
  analyzeCharacterProfiles(storyContext) {
    return {
      mainCharacters: storyContext.characters || [],
      archetypes: storyContext.tropes || [],
      relationships: storyContext.relationships || []
    };
  }

  /**
   * 플롯 진행 분석
   */
  analyzePlotProgression(storyContext) {
    return {
      currentArc: storyContext.currentArc || 'beginning',
      pacing: storyContext.pacing || 'medium',
      tensions: storyContext.tensions || []
    };
  }

  /**
   * 생성 통계 업데이트
   */
  updateGenerationStats(generationResult, startTime) {
    this.generationStats.totalGenerations++;
    
    if (generationResult.qualityScore) {
      const totalScore = this.generationStats.averageScore * (this.generationStats.totalGenerations - 1);
      this.generationStats.averageScore = (totalScore + generationResult.qualityScore) / this.generationStats.totalGenerations;
    }
    
    if (generationResult.improvementCycles > 0) {
      this.generationStats.qualityImprovements++;
    }
    
    this.generationStats.successRate = this.generationStats.totalGenerations > 0 ? 
      (this.generationStats.totalGenerations - this.generationStats.qualityImprovements) / this.generationStats.totalGenerations : 0;
    
    const duration = Date.now() - startTime;
    this.logger?.info('생성 통계 업데이트', {
      totalGenerations: this.generationStats.totalGenerations,
      averageScore: this.generationStats.averageScore.toFixed(2),
      duration: `${duration}ms`
    });
  }
}

class FileManager {
  constructor(logger) {
    this.logger = logger;
  }

  async saveNovel(metadata) {
    await this.logger.info('소설 메타데이터 저장', { title: metadata.title });

    const frontmatter = {
      title: metadata.title,
      slug: metadata.slug,
      author: 'Gemini AI',
      status: '연재 중',
      summary: metadata.summary,
      tropes: metadata.tropes || [],
      publishedDate: new Date().toISOString().split('T')[0],
      totalChapters: 1,
      rating: 0
    };

    const content = matter.stringify('', frontmatter);
    const filename = `${metadata.slug}.md`;
    const filepath = join(CONFIG.NOVEL_DIR, filename);

    await fs.writeFile(filepath, content, 'utf-8');
    await this.logger.success('소설 파일 저장 완료', { filepath });

    return filepath;
  }

  async saveChapter(chapter) {
    await this.logger.info('챕터 저장', { 
      novel: chapter.novel, 
      chapterNumber: chapter.chapterNumber 
    });

    // undefined 값 체크 및 제거
    const cleanFrontmatter = {};
    const rawFrontmatter = {
      title: chapter.title || `${chapter.chapterNumber}화`,
      novel: chapter.novel,
      chapterNumber: chapter.chapterNumber,
      publicationDate: new Date().toISOString().split('T')[0],
      wordCount: chapter.wordCount || 0,
      contentRating: '15+',
      emotionalTone: this.detectEmotionalTone(chapter.content) || '달콤한',
      keyEvents: this.extractKeyEvents(chapter.content) || ['스토리 진행'],
      characterDevelopment: '캐릭터 발전 사항'
    };

    // undefined 값 제거
    for (const [key, value] of Object.entries(rawFrontmatter)) {
      if (value !== undefined && value !== null) {
        cleanFrontmatter[key] = value;
      }
    }

    const content = matter.stringify(chapter.content || '', cleanFrontmatter);
    const filename = `${chapter.novel}-ch${chapter.chapterNumber}.md`;
    const filepath = join(CONFIG.CHAPTER_DIR, filename);

    await fs.writeFile(filepath, content, 'utf-8');
    await this.logger.success('챕터 파일 저장 완료', { filepath });

    // 소설 메타데이터의 totalChapters 업데이트
    await this.updateNovelChapterCount(chapter.novel, chapter.chapterNumber);

    return filepath;
  }

  async updateNovelStatus(novelSlug, status) {
    const novelPath = join(CONFIG.NOVEL_DIR, `${novelSlug}.md`);
    
    try {
      const content = await fs.readFile(novelPath, 'utf-8');
      const { data, content: novelContent } = matter(content);
      
      data.status = status;
      if (status === '완결') {
        data.completedDate = new Date().toISOString().split('T')[0];
      }

      const updatedContent = matter.stringify(novelContent, data);
      await fs.writeFile(novelPath, updatedContent, 'utf-8');
      
      await this.logger.success('소설 상태 업데이트', { novelSlug, status });
    } catch (_error) {
    // Intentionally unused error variable
      await this.logger.error('소설 상태 업데이트 실패', { _, _error: _error.message });
    }
  }

  async updateNovelChapterCount(novelSlug, chapterNumber) {
    const novelPath = join(CONFIG.NOVEL_DIR, `${novelSlug}.md`);
    
    try {
      const content = await fs.readFile(novelPath, 'utf-8');
      const { data, content: novelContent } = matter(content);
      
      data.totalChapters = Math.max(data.totalChapters || 0, chapterNumber);

      const updatedContent = matter.stringify(novelContent, data);
      await fs.writeFile(novelPath, updatedContent, 'utf-8');
      
    } catch (_error) {
    // Intentionally unused error variable
      await this.logger.warn('소설 챕터 수 업데이트 실패', { error: _error.message });
    }
  }

  detectEmotionalTone(content) {
    const tones = {
      '달콤한': ['사랑', '따뜻', '행복', '미소', '설렘'],
      '긴장감있는': ['위험', '긴급', '놀란', '충격', '갈등'],
      '감동적인': ['눈물', '감동', '그리움', '이별', '만남'],
      '스릴있는': ['흥미진진', '모험', '추격', '비밀', '수상한']
    };

    let maxScore = 0;
    let detectedTone = '달콤한';

    for (const [tone, keywords] of Object.entries(tones)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (content.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        detectedTone = tone;
      }
    }

    return detectedTone;
  }

  extractKeyEvents(content) {
    // 간단한 키워드 기반 이벤트 추출
    const events = [];
    
    if (content && typeof content === 'string') {
      if (content.includes('만남') || content.includes('첫')) {
        events.push('첫 만남');
      }
      if (content.includes('갈등') || content.includes('오해')) {
        events.push('갈등 발생');
      }
      if (content.includes('고백') || content.includes('사랑')) {
        events.push('감정 표현');
      }
      if (content.includes('위기') || content.includes('위험')) {
        events.push('위기 상황');
      }
    }

    return events.length > 0 ? events : ['스토리 진행'];
  }
}

class AutomationEngine {
  constructor(options = {}) {
    this.options = {
      mode: 'auto',
      creativity: 'high',
      dryRun: false,
      verbose: false,
      ...options
    };

    this.logger = new Logger(this.options.verbose);
    this.analyzer = new ContentAnalyzer(this.logger);
    this.generator = new NovelGenerator(this.logger);
    this.fileManager = new FileManager(this.logger);
    
    // 연속성 시스템 통합 (비동기 초기화)
    this.continuityEnabled = false;
    this.initializeContinuitySystem();
  }
  
  async initializeContinuitySystem() {
    try {
      if (continuityIntegration && continuityIntegration.isContinuityEnabled()) {
        await this.logger.info('연속성 관리 시스템 통합 시작');
        this.generator = await continuityIntegration.integrateContinuitySystem(
          this.generator, 
          this.logger
        );
        this.continuityEnabled = true;
        await this.logger.success('연속성 관리 시스템 통합 완료');
      } else {
        await this.logger.info('연속성 관리 시스템 비활성화 (ENABLE_CONTINUITY_SYSTEM=false)');
      }
    } catch (_error) {
    // Intentionally unused error variable
      await this.logger.warn('연속성 시스템 통합 실패, 기존 방식으로 동작', { error: _error.message });
      this.continuityEnabled = false;
    }
  }

  async run() {
    try {
      await this.logger.info('🌟 로맨스 판타지 자동 연재 시스템 시작', this.options);

      // 연속성 시스템 초기화 완료 대기
      await this.initializeContinuitySystem();

      // API 키 확인
      await this.logger.info('환경변수 확인', { 
        hasApiKey: !!CONFIG.API_KEY,
        apiKeyLength: CONFIG.API_KEY ? CONFIG.API_KEY.length : 0,
        nodeEnv: process.env.NODE_ENV
      });
      
      if (!CONFIG.API_KEY) {
        throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다. GitHub Secrets에 GEMINI_API_KEY가 올바르게 설정되어 있는지 확인해주세요.');
      }

      // 디렉토리 확인 및 생성
      await this.ensureDirectories();

      // 현재 상황 분석
      const analysis = await this.analyzer.analyzeCurrentState();

      // 실행할 액션 결정
      const action = this.decideAction(analysis);
      await this.logger.info('결정된 액션', action);

      if (this.options.dryRun) {
        await this.logger.info('🔍 DRY RUN 모드: 실제 실행하지 않고 종료');
        return { success: true, action, dryRun: true };
      }

      // 액션 실행
      const result = await this.executeAction(action, analysis);

      // Git 커밋 및 푸시
      if (result.filesCreated && result.filesCreated.length > 0) {
        await this.gitCommitAndPush(action, result);
      }

      // GENESIS AI 품질 메트릭 로깅
      await this.logQualityMetrics(result);

      await this.logger.success('🎉 GENESIS AI 자동 연재 시스템 완료', result);
      return { success: true, action, result };

    } catch (_error) {
    // Intentionally unused error variable
      await this.logger.error('❌ 자동 연재 시스템 실패', { 
        error: _error.message,
        stack: _error.stack 
      });
      throw _error;
    }
  }

  decideAction(analysis) {
    const { mode } = this.options;

    // 강제 모드가 설정된 경우
    if (mode !== 'auto') {
      return {
        type: mode,
        reason: `사용자 지정 모드: ${mode}`
      };
    }

    // 자동 우선순위 로직
    
    // 1. 완결 처리 (최우선)
    const completableNovels = analysis.novels.filter(n => 
      n.status === '연재 중' && n.canComplete
    );

    if (completableNovels.length > 0) {
      const novel = completableNovels[0];
      return {
        type: 'complete_novel',
        targetNovel: novel.slug,
        reason: `완결 가능한 소설 발견: ${novel.title} (${novel.chapterCount}화)`
      };
    }

    // 2. 기존 소설 연재 (높은 우선순위)
    const updateNeededNovels = analysis.novels.filter(n => 
      n.status === '연재 중' && n.needsUpdate && !n.canComplete
    );

    if (updateNeededNovels.length > 0) {
      // 가장 오래된 업데이트가 필요한 소설 선택
      const novel = updateNeededNovels.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate)[0];
      return {
        type: 'continue_chapter',
        targetNovel: novel.slug,
        reason: `업데이트 필요: ${novel.title} (${novel.daysSinceUpdate}일 전 마지막 업데이트)`
      };
    }

    // 3. 새 소설 생성 (낮은 우선순위)
    if (analysis.activeNovels < CONFIG.MAX_ACTIVE_NOVELS) {
      return {
        type: 'new_novel',
        reason: `활성 소설 부족 (${analysis.activeNovels}/${CONFIG.MAX_ACTIVE_NOVELS})`
      };
    }

    // 4. 기본값: 가장 최근 소설에 챕터 추가
    const recentNovels = analysis.novels.filter(n => n.status === '연재 중');
    if (recentNovels.length > 0) {
      const novel = recentNovels.sort((a, b) => 
        new Date(b.lastUpdate || 0) - new Date(a.lastUpdate || 0)
      )[0];

      return {
        type: 'continue_chapter',
        targetNovel: novel.slug,
        reason: `기본 연재: ${novel.title}`
      };
    }

    // 5. 최후의 수단: 새 소설 생성
    return {
      type: 'new_novel',
      reason: '연재 중인 소설이 없음'
    };
  }

  async executeAction(action, analysis) {
    switch (action.type) {
      case 'new_novel':
        return await this.executeNewNovel();
      
      case 'continue_chapter':
        return await this.executeContinueChapter(action.targetNovel, analysis);
      
      case 'complete_novel':
        return await this.executeCompleteNovel(action.targetNovel, analysis);
      
      default:
        throw new Error(`알 수 없는 액션 타입: ${action.type}`);
    }
  }

  async executeNewNovel() {
    await this.logger.info('새 소설 생성 실행');

    const { metadata, chapter } = await this.generator.createNewNovel(this.options.creativity);
    
    const novelFile = await this.fileManager.saveNovel(metadata);
    const chapterFile = await this.fileManager.saveChapter(chapter);

    return {
      type: 'new_novel',
      novel: metadata,
      chapter: chapter,
      filesCreated: [novelFile, chapterFile]
    };
  }

  async executeContinueChapter(novelSlug) {
    await this.logger.info('챕터 연재 실행', { novelSlug });

    const existingChapters = await this.analyzer.loadAllChapters();
    const chapter = await this.generator.continueNovel(
      novelSlug, 
      existingChapters, 
      this.options.creativity
    );
    
    const chapterFile = await this.fileManager.saveChapter(chapter);

    return {
      type: 'continue_chapter',
      novelSlug,
      chapter,
      filesCreated: [chapterFile]
    };
  }

  async executeCompleteNovel(novelSlug) {
    await this.logger.info('소설 완결 실행', { novelSlug });

    const existingChapters = await this.analyzer.loadAllChapters();
    const chapter = await this.generator.completeNovel(
      novelSlug, 
      existingChapters, 
      this.options.creativity
    );
    
    const chapterFile = await this.fileManager.saveChapter(chapter);

    // 완결인 경우 소설 상태 업데이트
    if (chapter.isFinal) {
      await this.fileManager.updateNovelStatus(novelSlug, '완결');
    }

    return {
      type: 'complete_novel',
      novelSlug,
      chapter,
      isCompleted: chapter.isFinal,
      filesCreated: [chapterFile]
    };
  }

  async ensureDirectories() {
    const dirs = [CONFIG.NOVEL_DIR, CONFIG.CHAPTER_DIR, CONFIG.LOGS_DIR];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (_) {
        // 디렉토리가 이미 존재하는 경우 무시
      }
    }
  }

  async gitCommitAndPush(action, result) {
    try {
      await this.logger.info('Git 커밋 및 푸시 시작');

      // Git 사용자 설정
      execSync('git config --global user.name "로판 자동화 봇 🤖"', { stdio: 'inherit' });
      execSync('git config --global user.email "action@github.com"', { stdio: 'inherit' });

      // 파일 추가
      execSync('git add src/content/novels/ src/content/chapters/', { stdio: 'inherit' });

      // 커밋 메시지 생성
      const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      const actionTypeKorean = {
        'new_novel': '새 소설 생성',
        'continue_chapter': '챕터 연재',
        'complete_novel': '소설 완결'
      }[action.type] || action.type;

      const commitMessage = `Gemini AI 자동 연재: ${actionTypeKorean} - ${timestamp}

생성 정보:
- 액션: ${action.type}
- 이유: ${action.reason}
- 창의성: ${this.options.creativity}
- 생성 파일: ${result.filesCreated.length}개

품질 보장: Gemini API 직접 호출
로맨스 판타지 전문 시스템 v2.0

Co-Authored-By: Gemini AI <noreply@google.com>`;

      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });

      await this.logger.success('Git 푸시 완료');

    } catch (err) {
      await this.logger.error('Git 작업 실패', { error: err.message });
      // Git 실패는 전체 프로세스를 중단하지 않음
    }
  }

  /**
   * 📊 GENESIS AI 품질 메트릭 로깅
   */
  async logQualityMetrics(result) {
    try {
      const metricsLog = {
        timestamp: new Date().toISOString(),
        actionType: result.type,
        
        // 품질 관련 정보 추출
        qualityInfo: this.generator.qualityGateway ? 
          this.generator.qualityGateway.exportQualityMetrics() : null,
        
        // 생성 결과 메타데이터
        resultMetadata: {
          filesCreated: result.filesCreated?.length || 0,
          novelSlug: result.novelSlug || result.novel?.slug,
          chapterNumber: result.chapter?.chapterNumber,
          wordCount: result.chapter?.wordCount || result.novel?.totalChapters
        }
      };

      // 품질 메트릭 로그 파일에 저장
      const metricsFile = join(CONFIG.LOGS_DIR, `quality-metrics-${new Date().toISOString().split('T')[0]}.log`);
      await fs.appendFile(metricsFile, JSON.stringify(metricsLog) + '\n');
      
      await this.logger.info('GENESIS AI 품질 메트릭 로깅 완료', {
        qualityScore: metricsLog.qualityInfo?.trend?.averageScore,
        trend: metricsLog.qualityInfo?.trend?.trend
      });

    } catch (_error) {
    // Intentionally unused error variable
      await this.logger.warn('품질 메트릭 로깅 실패', { error: _error.message });
    }
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // 명령행 인수 파싱
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--mode' && args[i + 1]) {
      options.mode = args[++i];
    } else if (arg === '--creativity' && args[i + 1]) {
      options.creativity = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--enable-continuity' || arg === '--continuity') {
      process.env.ENABLE_CONTINUITY_SYSTEM = 'true';
    } else if (arg === '--disable-continuity') {
      process.env.ENABLE_CONTINUITY_SYSTEM = 'false';
    }
  }

  try {
    const engine = new AutomationEngine(options);
    const _result = await engine.run();
    
    // console.log('\n🎉 자동 연재 시스템 실행 완료!');
    // console.log('📊 결과:', JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (_error) {
    // Intentionally unused error variable
    // console.error('\n❌ 오류 발생:', _error.message);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (import.meta.url === `file://${fileURLToPath(import.meta.url)}`) {
  main();
}

export { AutomationEngine, CONFIG };

// 개선된 novelSlug 추출 로직은 continuity-enhanced-generator.js로 이동됨