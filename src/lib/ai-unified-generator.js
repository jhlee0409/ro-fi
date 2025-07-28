/**
 * 통합 AI 생성 시스템
 * Claude + Gemini + Hybrid + Dynamic 로직 통합
 * 28개 파일에서 6개로 통합하는 핵심 컴포넌트
 */

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QualityAnalyticsEngine } from './quality-analytics-engine.js';
import { PlatformConfigEngine } from './platform-config-engine.js';
import { promises as fs } from 'fs';
import { join } from 'path';

// 통합된 트로프 프롬프트 매트릭스
const UNIFIED_TROPE_PROMPTS = {
  'enemies-to-lovers': {
    conflict: '이념적/개인적 경쟁 관계',
    keyScenes: ['강제적인 협력 상황', '증오에도 불구하고 서로를 구출', '공통의 약점 발견'],
    motivationA: '우월함 증명, 목표 달성',
    motivationB: '경쟁자 타도, 자신을 보호'
  },
  'fated-mates': {
    conflict: '둘을 갈라놓으려는 외부 세력',
    keyScenes: ['예언의 발견', '거부할 수 없는 마법적 이끌림', '꿈의 공유'],
    motivationA: '처음에는 운명을 거부, 이후 숙명을 받아들임',
    motivationB: '운명을 받아들이고 짝을 보호'
  },
  'regression': {
    conflict: '비극적 미래에 대한 지식 vs 모든 것을 바꿀 수 없는 한계',
    keyScenes: ['핵심적인 실패의 재경험', '미래 지식을 이용한 힘/동맹 확보', '특정 인물의 죽음 방지'],
    motivationA: '속죄, 복수, 사랑하는 사람 구하기',
    motivationB: '(회귀 사실을 모르므로) 기존 행동 패턴 반복'
  }
};

/**
 * 통합 재시도 헬퍼 - Claude와 Gemini 공통 사용
 */
async function unifiedRetry(fn, retries = 3, delay = 2000, isAnthropicCall = false) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Anthropic 529 에러 처리
      if (isAnthropicCall && (error.status === 529 || error.message?.includes('overloaded'))) {
        const anthropicBackoff = 15000 * Math.pow(2, i); // 15s → 30s → 60s
        console.warn(`🔄 Anthropic 529 에러. ${anthropicBackoff}ms 후 재시도... (${i + 1}/${retries})`);
        await new Promise(res => setTimeout(res, anthropicBackoff));
        continue;
      }
      
      // Gemini 5xx 에러 처리
      if (!isAnthropicCall && error.status && error.status >= 500 && error.status < 600) {
        const geminiBackoff = delay * Math.pow(2, i);
        console.warn(`🔄 Gemini 5xx 에러. ${geminiBackoff}ms 후 재시도... (${i + 1}/${retries})`);
        await new Promise(res => setTimeout(res, geminiBackoff));
        continue;
      }
      
      // 다른 에러는 즉시 throw
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * 통합 AI 생성기 - 모든 AI 로직 통합
 */
export class UnifiedAIGenerator {
  constructor(config = {}) {
    // API 클라이언트 초기화
    this.anthropic = config.anthropicApiKey ? new Anthropic({
      apiKey: config.anthropicApiKey,
    }) : null;
    
    this.genAI = config.geminiApiKey ? new GoogleGenerativeAI(config.geminiApiKey) : null;
    
    // Gemini 모델 설정
    if (this.genAI) {
      const modelName = config.geminiModel || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const generationConfig = {
        temperature: config.temperature || 0.9,
        topK: config.topK || 40,
        topP: config.topP || 0.95,
        maxOutputTokens: config.maxOutputTokens || 8192,
      };
      
      this.geminiModel = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig,
      });
    }
    
    // 플랫폼 및 엔진 초기화
    this.platformConfig = new PlatformConfigEngine();
    if (config.platform) {
      this.platformConfig.setPlatform(config.platform);
    }
    
    this.qualityEngine = new QualityAnalyticsEngine(config.platform);
    
    // 하이브리드 설정
    this.hybridConfig = {
      claudeForEmotionalScenes: true,
      claudeForDialogue: true,
      claudeForInternalMonologue: true,
      geminiForWorldBuilding: true,
      geminiForPlotStructure: true,
      geminiForLogicalConsistency: true,
      collaborativeMode: 'sequential',
      ...config.hybrid
    };
    
    // 캐시 시스템
    this.cache = {
      worldSettings: new Map(),
      plotStructures: new Map(),
      characterRelations: new Map(),
      improvementCache: new Map()
    };
    
    // 사용량 모니터링
    this.dailyUsage = {
      claude: { requests: 0, errors: 0, lastReset: new Date().toDateString() },
      gemini: { requests: 0, errors: 0, lastReset: new Date().toDateString() }
    };
    
    // 동적 생성 설정
    this.contentDir = config.contentDir || 'src/content';
    this.novelsDir = join(this.contentDir, 'novels');
    this.chaptersDir = join(this.contentDir, 'chapters');
    this.dryRun = config.dryRun || false;
    
    // 상태 관리 디렉터리
    this.stateDir = join(process.cwd(), 'src/data/novel-states');
  }

  // =================
  // Claude API 메서드
  // =================
  
  /**
   * Claude API 호출 (재시도 포함)
   */
  async callClaude(params) {
    if (!this.anthropic) {
      throw new Error('Anthropic API 키가 설정되지 않았습니다.');
    }
    
    // 일일 사용량 리셋
    const today = new Date().toDateString();
    if (this.dailyUsage.claude.lastReset !== today) {
      this.dailyUsage.claude = { requests: 0, errors: 0, lastReset: today };
    }
    
    return unifiedRetry(async () => {
      this.dailyUsage.claude.requests++;
      console.log(`🤖 Claude API 호출 (일일 ${this.dailyUsage.claude.requests}회)...`);
      
      const response = await this.anthropic.messages.create(params);
      return response;
    }, 5, 15000, true);
  }
  
  /**
   * 감성적 장면 생성 (Claude 전담)
   */
  async generateEmotionalScene(context) {
    if (!this.anthropic) {
      console.warn('⚠️ Claude 없음, 기본 감성 장면 생성');
      return this.generateFallbackEmotionalScene(context);
    }
    
    const prompt = `당신은 로맨스 판타지 감성 장면 전문가입니다.

캐릭터: ${context.characters || '주인공들'}
상황: ${context.situation || '감정적 순간'}
분위기: ${context.mood || '긴장감 있는 로맨틱'}

다음 요소들을 포함한 감성적인 장면을 작성해주세요:
- 내적 독백과 감정 변화
- 미묘한 몸짓과 표정 묘사
- 감정적 텐션과 설렘
- 자연스러운 대화와 침묵의 활용

2000-3000자 분량으로 작성해주세요.`;

    const response = await this.callClaude({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }]
    });
    
    return response.content[0].text;
  }

  // =================
  // Gemini API 메서드
  // =================
  
  /**
   * Gemini API 호출 (재시도 포함)
   */
  async callGemini(prompt) {
    if (!this.geminiModel) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }
    
    // 일일 사용량 리셋
    const today = new Date().toDateString();
    if (this.dailyUsage.gemini.lastReset !== today) {
      this.dailyUsage.gemini = { requests: 0, errors: 0, lastReset: today };
    }
    
    return unifiedRetry(async () => {
      this.dailyUsage.gemini.requests++;
      console.log(`🧠 Gemini API 호출 (일일 ${this.dailyUsage.gemini.requests}회)...`);
      
      const result = await this.geminiModel.generateContent(prompt);
      return result.response;
    }, 3, 2000, false);
  }
  
  /**
   * 세계관 구축 (Gemini 전담)
   */
  async generateWorldBuilding(title, tropes, existingSettings = {}) {
    if (!this.geminiModel) {
      console.warn('⚠️ Gemini 없음, 기본 세계관 생성');
      return this.generateFallbackWorldBuilding(title, tropes);
    }
    
    const prompt = `당신은 로맨스 판타지 세계관 설계 전문가입니다.

소설 제목: "${title}"
주요 트로프: ${tropes.join(', ')}
기존 설정: ${JSON.stringify(existingSettings, null, 2)}

다음을 체계적으로 설계해주세요:

1. 세계관 기초 설정
   - 시대적 배경과 문명 수준
   - 정치 체제와 권력 구조
   - 경제 시스템과 화폐

2. 마법/판타지 시스템
   - 마법의 원리와 제약
   - 능력자의 등급과 희귀성
   - 마법과 일반인의 관계

3. 지리적 설정
   - 주요 지역과 특징
   - 각 지역의 문화적 차이

JSON 형태로 정리해서 답변해주세요.`;

    const response = await this.callGemini(prompt);
    
    try {
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : this.parseWorldBuildingText(text);
    } catch (error) {
      console.warn('⚠️ Gemini 세계관 파싱 실패, 텍스트 파싱 시도');
      return this.parseWorldBuildingText(response.text());
    }
  }

  // =================
  // 하이브리드 협업 메서드
  // =================
  
  /**
   * 하이브리드 소설 초기화 - 3단계 워크플로우
   */
  async initializeNovel(title, tropes, concept) {
    console.log('🤝 하이브리드 소설 초기화 시작...');
    
    if (!this.geminiModel && !this.anthropic) {
      throw new Error('Claude 또는 Gemini 중 하나는 필요합니다.');
    }
    
    // Gemini 우선 시도, 실패시 Claude로 대체
    let worldSettings, plotStructure;
    
    if (this.geminiModel) {
      try {
        console.log('🌍 1단계: Gemini로 세계관 설계...');
        [worldSettings, plotStructure] = await Promise.all([
          this.generateWorldBuilding(title, tropes),
          this.generateComplexPlotStructure(title, tropes, 75)
        ]);
      } catch (error) {
        console.warn('⚠️ Gemini 실패, Claude로 대체:', error.message);
        worldSettings = await this.generateFallbackWorldBuilding(title, tropes);
        plotStructure = await this.generateFallbackPlotStructure();
      }
    } else {
      worldSettings = await this.generateFallbackWorldBuilding(title, tropes);
      plotStructure = await this.generateFallbackPlotStructure();
    }
    
    // Claude로 감성적 캐릭터 생성
    let characters;
    if (this.anthropic) {
      try {
        console.log('💖 2단계: Claude로 캐릭터 생성...');
        characters = await this.generateCharacterProfiles(title, tropes);
      } catch (error) {
        console.warn('⚠️ Claude 실패, 기본 캐릭터 생성:', error.message);
        characters = this.generateFallbackCharacters();
      }
    } else {
      characters = this.generateFallbackCharacters();
    }
    
    // 결과 캐시
    const novelKey = title.replace(/\s+/g, '-').toLowerCase();
    this.cache.worldSettings.set(novelKey, worldSettings);
    this.cache.plotStructures.set(novelKey, plotStructure);
    
    console.log('✅ 하이브리드 초기화 완료');
    
    return {
      worldSettings,
      characters,
      plotStructure
    };
  }
  
  /**
   * 하이브리드 챕터 생성
   */
  async generateChapter(options) {
    const {
      title,
      tropes = [],
      chapterNumber,
      chapterTitle,
      previousContext,
      characterContext,
      plotOutline,
      worldSetting,
      isDynamic = false
    } = options;
    
    console.log(`📖 하이브리드 챕터 생성: ${chapterNumber}화 "${chapterTitle}"`);
    
    // 플롯 단계 결정
    const plotStage = this.determinePlotStage(chapterNumber);
    
    // 감성적 장면인지 판단
    const isEmotionalScene = this.isEmotionalPlotStage(plotStage);
    
    let content;
    
    if (isEmotionalScene && this.anthropic) {
      // Claude로 감성적 장면 생성
      console.log('💝 Claude로 감성 장면 생성...');
      content = await this.generateEmotionalChapterContent({
        title, tropes, chapterNumber, chapterTitle,
        previousContext, characterContext, plotOutline, worldSetting
      });
    } else if (this.geminiModel) {
      // Gemini로 논리적 장면 생성
      console.log('🧠 Gemini로 논리적 장면 생성...');
      content = await this.generateLogicalChapterContent({
        title, tropes, chapterNumber, chapterTitle,
        previousContext, characterContext, plotOutline, worldSetting
      });
    } else {
      // 폴백: 기본 생성
      content = await this.generateFallbackChapter(options);
    }
    
    return {
      content,
      metadata: {
        generatedBy: isEmotionalScene ? 'claude' : 'gemini',
        plotStage,
        isEmotional: isEmotionalScene,
        isDynamic
      }
    };
  }

  // =================
  // 동적 콘텐츠 생성 메서드
  // =================
  
  /**
   * 100% 동적 캐릭터 이름 생성
   */
  async generateDynamicCharacterNames() {
    console.log('🎲 100% 동적 캐릭터 이름 생성...');
    
    const prefixes = ['아', '엘', '세', '이', '비', '다', '라', '알'];
    const middles = ['리', '라', '미', '델', '사', '렉', '파', '드'];
    const suffixes = ['핀', '시아', '린', '벨라', '안', '엘', '리안', '스'];
    
    // 완전 랜덤 조합
    const generateName = () => {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const middle = middles[Math.floor(Math.random() * middles.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      return prefix + middle + suffix;
    };
    
    // 중복 방지 로직
    const usedNames = new Set();
    const names = [];
    
    while (names.length < 2) {
      const name = generateName();
      if (!usedNames.has(name)) {
        usedNames.add(name);
        names.push(name);
      }
    }
    
    return {
      female: { name: names[0], meaning: '아름다운 의미', personality_hint: '강인하고 지혜로운' },
      male: { name: names[1], meaning: '강력한 의미', personality_hint: '신비롭고 카리스마 있는' }
    };
  }
  
  /**
   * 소설 상태 저장
   */
  async saveNovelState(novelSlug, novelData) {
    if (this.dryRun) {
      console.log(`🔄 [DRY-RUN] 소설 상태 저장 시뮬레이션: ${novelSlug}`);
      return;
    }
    
    await fs.mkdir(this.stateDir, { recursive: true });
    const stateFile = join(this.stateDir, `${novelSlug}-state.json`);
    
    const stateData = {
      slug: novelSlug,
      ...novelData,
      lastUpdated: new Date().toISOString(),
      totalChapters: novelData.totalChapters || 75,
      currentChapter: 1,
      status: 'active'
    };
    
    await fs.writeFile(stateFile, JSON.stringify(stateData, null, 2), 'utf-8');
    console.log(`💾 소설 상태 저장: ${stateFile}`);
  }

  // =================
  // 헬퍼 메서드들
  // =================
  
  /**
   * 플롯 단계 결정
   */
  determinePlotStage(chapterNumber) {
    if (chapterNumber <= 15) return 'introduction';
    if (chapterNumber <= 45) return 'development';
    if (chapterNumber <= 60) return 'climax';
    return 'resolution';
  }
  
  /**
   * 감성적 장면 판단
   */
  isEmotionalPlotStage(plotStage) {
    return ['climax', 'resolution'].includes(plotStage);
  }
  
  /**
   * 폴백 메서드들
   */
  generateFallbackEmotionalScene(context) {
    return `감성적인 장면이 펼쳐집니다.\n\n${context.characters}의 마음이 요동치는 순간...`;
  }
  
  generateFallbackWorldBuilding(title, tropes) {
    return {
      world_name: `${title}의 세계`,
      setting_description: '마법과 로맨스가 어우러진 환상적인 세계',
      magic_system: '엘레멘탈 마법 시스템',
      social_structure: '계급 사회',
      key_locations: ['수도', '마법 학교', '고대 유적'],
      unique_elements: ['마법적 계약', '운명의 인연', '고대의 예언']
    };
  }
  
  generateFallbackCharacters() {
    return {
      female: { name: '세라핀', meaning: '천사의 이름', personality_hint: '강인하고 지혜로운' },
      male: { name: '다미안', meaning: '정복자', personality_hint: '신비롭고 카리스마 있는' }
    };
  }
  
  async generateFallbackChapter(options) {
    return `${options.chapterTitle}\n\n이야기가 계속됩니다...`;
  }
  
  parseWorldBuildingText(text) {
    // 텍스트에서 기본 정보 추출
    return {
      world_name: text.match(/세계.*?[:\n]/)?.[0] || '판타지 세계',
      setting_description: text.substring(0, 200) + '...',
      magic_system: '마법 시스템',
      social_structure: '사회 구조',
      key_locations: ['주요 장소1', '주요 장소2'],
      unique_elements: ['독특한 요소1', '독특한 요소2']
    };
  }
}

// 편의 함수들
export function createUnifiedGenerator(config = {}) {
  return new UnifiedAIGenerator(config);
}

export function createStoryGenerator(apiKey) {
  return new UnifiedAIGenerator({ anthropicApiKey: apiKey });
}

export function createGeminiGenerator(config = {}) {
  return new UnifiedAIGenerator({ geminiApiKey: config.apiKey, ...config });
}

export function createHybridGenerator(config = {}) {
  return new UnifiedAIGenerator(config);
}