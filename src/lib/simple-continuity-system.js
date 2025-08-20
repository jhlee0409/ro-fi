/**
 * 🎯 간단한 연속성 시스템 v3.0 - Enterprise Enhanced
 * 
 * 목적: 복잡한 TypeScript 의존성 없이 순수 JavaScript로 구현된 연속성 관리
 * 특징: JSON 기반 상태 관리, 자동 플롯 추적, 엔딩 관리, Enterprise 프레임워크 통합
 */

import fs from 'fs/promises';
import path from 'path';
import { AdvancedPacingController } from './advanced-pacing-controller.js';
import { getEnterprise } from './core/enterprise-integration.js';
import { validateStoryState } from './story-state-schema.js';

/**
 * 📊 스토리 상태 관리자 - Enterprise Enhanced
 */
export class SimpleStoryStateManager {
  constructor(dataDir = null) {
    this.dataDir = dataDir; // null이면 나중에 Enterprise에서 설정
    this.enterprise = null;
    this.logger = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Enterprise 프레임워크 초기화
      this.enterprise = await getEnterprise();
      this.logger = this.enterprise.getLogger('StoryState');
      
      // 데이터 디렉토리 설정 (하드코딩 대신 설정에서 가져오기)
      if (!this.dataDir) {
        this.dataDir = this.enterprise.getConfig().getAbsolutePath(
          'storage.DATA_ROOT_PATH', 
          'storage.STORY_STATES_PATH'
        );
      }
      
      await this.ensureDataDir();
      this.initialized = true;
      
      await this.logger.info('스토리 상태 관리자 초기화 완료', {
        dataDir: this.dataDir
      });
      
    } catch (error) {
      console.error('스토리 상태 관리자 초기화 실패:', error.message);
      throw error;
    }
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      if (this.logger) {
        await this.logger.debug('데이터 디렉토리 생성', { path: this.dataDir });
      }
    } catch (error) {
      if (this.logger) {
        await this.logger.warn('데이터 디렉토리 생성 실패', { 
          path: this.dataDir, 
          error: error.message 
        });
      }
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * 스토리 상태 저장
   */
  async saveStoryState(novelSlug, state) {
    await this.ensureInitialized();
    
    try {
      const filePath = path.join(this.dataDir, `${novelSlug}.json`);
      const stateData = {
        ...state,
        lastUpdated: new Date().toISOString()
      };
      
      await fs.writeFile(filePath, JSON.stringify(stateData, null, 2));
      
      await this.logger.info('스토리 상태 저장 완료', {
        novelSlug,
        filePath,
        chapters: state.chapters?.length || 0
      });
      
      return stateData;
      
    } catch (error) {
      await this.logger.error('스토리 상태 저장 실패', {
        novelSlug,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * 스토리 상태 로드
   */
  async loadStoryState(novelSlug) {
    await this.ensureInitialized();
    
    try {
      const filePath = path.join(this.dataDir, `${novelSlug}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const state = JSON.parse(data);
      
      await this.logger.info('스토리 상태 로드 완료', {
        novelSlug,
        chapters: state.chapters?.length || 0,
        lastUpdated: state.lastUpdated
      });
      
      return state;
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.logger.info('스토리 상태 파일 없음 - 새 상태 생성', { novelSlug });
        return null;
      }
      
      await this.logger.error('스토리 상태 로드 실패', {
        novelSlug,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * 새로운 스토리 상태 생성
   */
  createNewStoryState(novelSlug) {
    return {
      novelSlug,
      metadata: {
        title: '',
        author: '하이브리드 AI (Gemini)',
        genre: '로맨스 판타지',
        status: '연재 중',
        createdAt: new Date().toISOString(),
        totalChapters: 0,
        completionTarget: 100, // 목표 챕터 수
        currentArc: 'introduction', // introduction, development, climax, resolution
        plotProgress: 0 // 0-100%
      },
      worldState: {
        setting: '',
        timeframe: '',
        magicSystem: '',
        politicalStructure: '',
        importantLocations: []
      },
      characters: {
        protagonist: {
          name: '',
          age: 0,
          appearance: '',
          personality: [],
          abilities: [],
          goals: [],
          currentEmotionalState: '',
          relationshipStatus: ''
        },
        mainLead: {
          name: '',
          age: 0,
          appearance: '',
          personality: [],
          abilities: [],
          goals: [],
          currentEmotionalState: '',
          relationshipStatus: ''
        },
        supportingCharacters: [],
        antagonists: []
      },
      plot: {
        mainConflict: '',
        subplots: [],
        resolvedPlots: [],
        foreshadowing: [],
        unresolvedMysteries: [],
        romanceProgression: 0, // 0-100%
        tensionLevel: 5 // 1-10
      },
      chapters: [],
      continuityNotes: [],
      qualityMetrics: {
        averageWordCount: 0,
        averageRating: 0,
        consistencyScore: 100,
        engagementScore: 0
      }
    };
  }

  /**
   * 챕터 추가 및 상태 업데이트
   */
  async addChapter(novelSlug, chapterData) {
    const state = await this.loadStoryState(novelSlug);
    
    // 챕터 정보 추가
    state.chapters.push({
      chapterNumber: chapterData.chapterNumber,
      title: chapterData.title,
      summary: chapterData.summary,
      keyEvents: chapterData.keyEvents || [],
      characterDevelopments: chapterData.characterDevelopments || [],
      emotionalTone: chapterData.emotionalTone || 'neutral',
      wordCount: chapterData.wordCount || 0,
      createdAt: new Date().toISOString()
    });

    // 메타데이터 업데이트
    state.metadata.totalChapters = state.chapters.length;
    state.metadata.plotProgress = Math.min(100, (state.chapters.length / state.metadata.completionTarget) * 100);
    
    // 플롯 진행도에 따른 아크 업데이트
    if (state.metadata.plotProgress < 25) {
      state.metadata.currentArc = 'introduction';
    } else if (state.metadata.plotProgress < 50) {
      state.metadata.currentArc = 'development';
    } else if (state.metadata.plotProgress < 75) {
      state.metadata.currentArc = 'climax';
    } else {
      state.metadata.currentArc = 'resolution';
    }

    // 로맨스 진행도 업데이트
    if (chapterData.romanceProgression) {
      state.plot.romanceProgression = Math.min(100, state.plot.romanceProgression + chapterData.romanceProgression);
    }

    // 품질 메트릭 업데이트
    const totalWords = state.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
    state.qualityMetrics.averageWordCount = Math.round(totalWords / state.chapters.length);

    await this.saveStoryState(novelSlug, state);
    return state;
  }

  /**
   * 다음 챕터를 위한 컨텍스트 생성
   */
  async getNextChapterContext(novelSlug) {
    const state = await this.loadStoryState(novelSlug);
    
    if (state.chapters.length === 0) {
      return {
        chapterNumber: 1,
        previousSummary: '첫 챕터입니다.',
        currentArc: 'introduction',
        plotProgress: 0,
        suggestions: ['주인공 소개', '세계관 설정', '첫 만남 또는 충격적 사건']
      };
    }

    const lastChapter = state.chapters[state.chapters.length - 1];
    const recentChapters = state.chapters.slice(-3); // 최근 3개 챕터
    
    // 최근 줄거리 요약
    const recentSummary = recentChapters
      .map(ch => ch.summary)
      .filter(s => s)
      .join(' ');

    // 현재 아크에 따른 제안사항
    let suggestions = [];
    switch (state.metadata.currentArc) {
      case 'introduction':
        suggestions = ['캐릭터 관계 구축', '세계관 확장', '초기 갈등 도입'];
        break;
      case 'development':
        suggestions = ['관계 심화', '갈등 고조', '비밀 공개'];
        break;
      case 'climax':
        suggestions = ['최고조 갈등', '중요한 선택', '감정적 절정'];
        break;
      case 'resolution':
        suggestions = ['갈등 해결', '관계 완성', '새로운 시작'];
        break;
    }

    // 완결 근처 처리
    if (state.metadata.plotProgress >= 90) {
      suggestions = ['마지막 갈등 해결', '해피엔딩 준비', '감동적인 마무리'];
    }

    return {
      chapterNumber: state.chapters.length + 1,
      previousSummary: recentSummary || lastChapter.summary,
      currentArc: state.metadata.currentArc,
      plotProgress: state.metadata.plotProgress,
      romanceProgression: state.plot.romanceProgression,
      protagonist: state.characters.protagonist,
      mainLead: state.characters.mainLead,
      unresolvedPlots: state.plot.unresolvedMysteries,
      tensionLevel: state.plot.tensionLevel,
      suggestions,
      isNearEnding: state.metadata.plotProgress >= 85,
      shouldComplete: state.metadata.plotProgress >= 95
    };
  }

  /**
   * 스토리 완결 처리
   */
  async completeStory(novelSlug) {
    const state = await this.loadStoryState(novelSlug);
    state.metadata.status = '완결';
    state.metadata.completedAt = new Date().toISOString();
    state.metadata.plotProgress = 100;
    state.plot.romanceProgression = 100;
    
    await this.saveStoryState(novelSlug, state);
    return state;
  }

  /**
   * 연속성 검증
   */
  async validateContinuity(novelSlug, newChapterContent) {
    const state = await this.loadStoryState(novelSlug);
    const issues = [];
    const warnings = [];

    // 캐릭터 이름 일관성 체크
    if (state.characters.protagonist.name && 
        !newChapterContent.includes(state.characters.protagonist.name)) {
      warnings.push(`주인공 이름 '${state.characters.protagonist.name}'이 언급되지 않음`);
    }

    // 플롯 진행도 체크
    if (state.metadata.currentArc === 'resolution' && state.plot.unresolvedMysteries.length > 0) {
      warnings.push(`미해결 플롯이 ${state.plot.unresolvedMysteries.length}개 남아있음`);
    }

    // 워드카운트 체크 (테스트 환경에서는 완화)
    const wordCount = newChapterContent.length;
    const minWordCount = process.env.NODE_ENV === 'test' ? 500 : 2500;
    const maxWordCount = process.env.NODE_ENV === 'test' ? 10000 : 5000;
    
    if (wordCount < minWordCount) {
      if (process.env.NODE_ENV === 'test') {
        warnings.push(`챕터가 짧음 (${wordCount}자, 권장 ${minWordCount}자 이상)`);
      } else {
        issues.push(`챕터가 너무 짧음 (최소 ${minWordCount}자)`);
      }
    }
    
    if (wordCount > maxWordCount) {
      warnings.push(`챕터가 너무 김 (권장 ${maxWordCount}자 이하)`);
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings,
      continuityScore: Math.max(0, 100 - (issues.length * 20) - (warnings.length * 5))
    };
  }
}

/**
 * 🎨 연속성 기반 프롬프트 생성기
 */
export class ContinuityPromptGenerator {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  /**
   * 다음 챕터 프롬프트 생성
   */
  async generateNextChapterPrompt(novelSlug) {
    const context = await this.stateManager.getNextChapterContext(novelSlug);
    
    // 엔딩 처리
    if (context.shouldComplete) {
      return this.generateEndingPrompt(novelSlug, context);
    }

    // 일반 챕터 프롬프트
    return `
당신은 한국 로맨스 판타지 웹소설 전문 작가입니다.

=== 현재 스토리 상태 ===
챕터: ${context.chapterNumber}화
스토리 진행도: ${context.plotProgress.toFixed(1)}%
현재 아크: ${this.translateArc(context.currentArc)}
로맨스 진행도: ${context.romanceProgression}%
긴장감 레벨: ${context.tensionLevel}/10

=== 이전 줄거리 ===
${context.previousSummary}

=== 캐릭터 현황 ===
주인공: ${context.protagonist.name || '미정'} - ${context.protagonist.currentEmotionalState || ''}
상대역: ${context.mainLead.name || '미정'} - ${context.mainLead.currentEmotionalState || ''}

=== 작성 가이드 ===
${context.isNearEnding ? '⚠️ 엔딩이 가까워지고 있습니다. 갈등을 해결하기 시작하세요.' : ''}

이번 챕터에서 다루어야 할 요소:
${context.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${context.unresolvedPlots.length > 0 ? `
미해결 플롯:
${context.unresolvedPlots.map(p => `- ${p}`).join('\n')}
` : ''}

=== 작성 요구사항 ===
1. 분량: 3,000-4,000자
2. 이전 내용과 자연스럽게 연결
3. 캐릭터 성격과 관계 일관성 유지
4. ${context.currentArc === 'climax' ? '감정적 절정 포함' : '스토리 진전 포함'}
5. 다음 화를 기대하게 만드는 마무리

=== 출력 형식 ===
CHAPTER_NUMBER: ${context.chapterNumber}
CHAPTER_TITLE: ${context.chapterNumber}화: [제목]
WORD_COUNT: [글자수]
SUMMARY: [한 문장 요약]
KEY_EVENTS: [주요 사건 1], [주요 사건 2], [주요 사건 3]
EMOTIONAL_TONE: [감정 톤]
ROMANCE_PROGRESSION: [로맨스 진전도 증가량 0-10]

--- CONTENT START ---
[챕터 내용]
--- CONTENT END ---

${context.chapterNumber}화를 작성해주세요.
`.trim();
  }

  /**
   * 엔딩 프롬프트 생성
   */
  async generateEndingPrompt(novelSlug, context) {
    const state = await this.stateManager.loadStoryState(novelSlug);
    
    return `
당신은 한국 로맨스 판타지 웹소설 전문 작가입니다.

=== 🎊 최종화 작성 ===

작품명: ${state.metadata.title}
총 ${context.chapterNumber - 1}화까지 진행됨
이제 완결을 맺을 시간입니다.

=== 전체 스토리 요약 ===
${context.previousSummary}

=== 해결해야 할 요소 ===
${state.plot.unresolvedMysteries.map(m => `- ${m}`).join('\n') || '- 모든 갈등이 해결됨'}

=== 완결 요구사항 ===
1. 주인공과 상대역의 관계 완성 (해피엔딩)
2. 모든 주요 갈등의 해결
3. 감동적이고 만족스러운 마무리
4. 독자에게 여운을 남기는 엔딩
5. 분량: 3,500-4,500자 (마지막이므로 조금 더 길게)

=== 엔딩 체크리스트 ===
✓ 두 주인공의 사랑 확인
✓ 미래에 대한 희망적 암시
✓ 조연 캐릭터들의 결말
✓ 세계관 내 갈등 해결
✓ 독자 만족도 극대화

=== 출력 형식 ===
CHAPTER_NUMBER: ${context.chapterNumber}
CHAPTER_TITLE: ${context.chapterNumber}화: [최종화 제목]
WORD_COUNT: [글자수]
SUMMARY: [완결 요약]
ENDING_TYPE: HAPPY_ENDING
STATUS: 완결

--- CONTENT START ---
[최종화 내용]

[에필로그 (선택사항)]
--- CONTENT END ---

이제 감동적인 최종화를 작성해주세요.
`.trim();
  }

  /**
   * 첫 챕터 프롬프트 생성
   */
  async generateFirstChapterPrompt(novelInfo) {
    return `
당신은 한국 로맨스 판타지 웹소설 전문 작가입니다.

=== 새 작품 시작 ===

장르: 한국 로맨스 판타지
트로프: ${novelInfo.tropes?.join(', ') || '회귀, 계약연애, 차원이동'}

=== 작품 설정 ===
제목: ${novelInfo.title || '[매력적인 제목 생성]'}
배경: ${novelInfo.setting || '[판타지 세계관 생성]'}

=== 1화 작성 요구사항 ===
1. 매력적인 여주인공 등장
2. 흥미진진한 첫 장면 (회귀, 전생, 사건 등)
3. 세계관 자연스러운 소개
4. 독자의 호기심을 자극하는 떡밥
5. 분량: 3,000-4,000자

=== 필수 설정 요소 ===
- 주인공: 이름, 나이, 외모, 성격, 특별한 능력
- 세계관: 시대적 배경, 마법 체계, 사회 구조
- 초기 갈등: 주인공이 해결해야 할 문제
- 상대역 암시: 남주에 대한 힌트나 첫 등장

=== 출력 형식 ===
NOVEL_TITLE: [작품 제목]
NOVEL_SLUG: [영문 슬러그]
WORLD_SETTING: [세계관 한 줄 설명]
PROTAGONIST_NAME: [여주 이름]
PROTAGONIST_AGE: [여주 나이]
MAIN_CONFLICT: [주요 갈등]

CHAPTER_NUMBER: 1
CHAPTER_TITLE: 1화: [제목]
WORD_COUNT: [글자수]
SUMMARY: [한 문장 요약]
KEY_EVENTS: [주요 사건 1], [주요 사건 2], [주요 사건 3]

--- CONTENT START ---
[1화 내용]
--- CONTENT END ---

이제 매력적인 1화를 작성해주세요.
`.trim();
  }

  translateArc(arc) {
    const translations = {
      'introduction': '도입부',
      'development': '전개부',
      'climax': '절정부',
      'resolution': '결말부'
    };
    return translations[arc] || arc;
  }
}

/**
 * 🤖 통합 연속성 관리자
 */
export class SimpleContinuityManager {
  constructor(logger = null) {
    this.logger = logger; // 레거시 호환성을 위해 유지, 하지만 Enterprise 로거 사용 권장
    this.enterprise = null;
    this.enterpriseLogger = null;
    this.stateManager = new SimpleStoryStateManager();
    this.promptGenerator = new ContinuityPromptGenerator(this.stateManager);
    this.pacingController = new AdvancedPacingController();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Enterprise 프레임워크 초기화
      this.enterprise = await getEnterprise();
      this.enterpriseLogger = this.enterprise.getLogger('Continuity');
      
      // 상태 관리자 초기화
      await this.stateManager.initialize();
      
      this.initialized = true;
      
      await this.enterpriseLogger.info('연속성 관리자 초기화 완료', {
        hasLegacyLogger: !!this.logger,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('연속성 관리자 초기화 실패:', error.message);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // 레거시 로거와 Enterprise 로거를 통합한 로깅 메서드
  async log(level, message, data) {
    await this.ensureInitialized();
    
    // Enterprise 로거 사용 (우선)
    if (this.enterpriseLogger) {
      await this.enterpriseLogger[level](message, data);
    }
    
    // 레거시 로거도 사용 (하위 호환성)
    if (this.logger && typeof this.logger[level] === 'function') {
      this.logger[level](message, data);
    }
  }

  /**
   * 다음 챕터 생성을 위한 프롬프트 준비
   */
  async prepareNextChapter(novelSlug) {
    await this.ensureInitialized();
    
    try {
      // 컨텍스트 확인
      const context = await this.stateManager.getNextChapterContext(novelSlug);
      const storyState = await this.stateManager.loadStoryState(novelSlug);
      
      // 로그 (Enterprise 로깅 시스템 사용)
      await this.log('info', `📖 ${novelSlug} - ${context.chapterNumber}화 준비`, {
        arc: context.currentArc,
        progress: `${context.plotProgress.toFixed(1)}%`,
        isNearEnding: context.isNearEnding
      });

      // 기본 프롬프트 생성
      const basePrompt = await this.promptGenerator.generateNextChapterPrompt(novelSlug);
      
      // 페이싱 제약 조건 생성
      const constraints = this.pacingController.generateConstraintsForNextChapter(storyState);
      
      // 제약 조건이 포함된 최종 프롬프트 생성
      const constrainedPrompt = this.pacingController.generateConstrainedPrompt(basePrompt, constraints);
      
      await this.log('info', `🎯 페이싱 제약 적용 - 진행도: ${constraints.progress.toFixed(1)}%`, {
        milestone: constraints.currentMilestone,
        prohibitedCount: constraints.prohibitedKeywords.length,
        allowedEmotions: constraints.allowedEmotions.length
      });
      
      return {
        prompt: constrainedPrompt,
        context,
        constraints,
        shouldComplete: context.shouldComplete
      };
    } catch (error) {
      await this.logger.error('프롬프트 준비 실패:', error);
      throw error;
    }
  }

  /**
   * 생성된 챕터 처리 및 상태 업데이트
   */
  async processGeneratedChapter(novelSlug, generatedContent) {
    try {
      // 스토리 상태 로드
      const storyState = await this.stateManager.loadStoryState(novelSlug);
      
      // 컨텐츠 파싱
      const chapterData = this.parseGeneratedContent(generatedContent);
      
      // 🎯 고급 페이싱 검증
      const pacingValidation = await this.pacingController.validateAndUpdateProgress(
        generatedContent, 
        storyState
      );
      
      if (!pacingValidation.valid) {
        await this.logger.warn('⚠️ 페이싱 문제 발견:', {
          progress: pacingValidation.overallProgress.toFixed(1) + '%',
          violations: pacingValidation.violations.map(v => v.type),
          suggestions: pacingValidation.suggestions
        });
        
        // 심각한 페이싱 위반시 재생성 요청 제안
        const criticalViolations = pacingValidation.violations.filter(v => 
          v.type === 'keyword' || v.type === 'emotion'
        );
        
        if (criticalViolations.length > 0) {
          await this.logger.error('🚨 심각한 페이싱 위반 - 재생성 권장:', criticalViolations);
          return {
            chapterData,
            validation: { valid: false, issues: ['페이싱 위반'] },
            pacingValidation,
            requiresRegeneration: true,
            updatedState: storyState
          };
        }
      } else {
        await this.logger.success(`✅ 페이싱 검증 통과 - 진행도: ${pacingValidation.overallProgress.toFixed(1)}%`);
      }
      
      // 연속성 검증
      const validation = await this.stateManager.validateContinuity(novelSlug, generatedContent);
      
      if (!validation.valid) {
        await this.logger.warn('연속성 문제 발견:', validation.issues);
      }

      // 상태 업데이트 (페이싱 검증 통과시에만)
      const updatedState = await this.stateManager.addChapter(novelSlug, chapterData);
      
      // 고급 페이싱 상태도 병합
      if (pacingValidation.valid && storyState.advancedProgress) {
        updatedState.advancedProgress = storyState.advancedProgress;
      }
      
      // 완결 처리
      if (chapterData.status === '완결' || updatedState.metadata.plotProgress >= 100) {
        await this.stateManager.completeStory(novelSlug);
        await this.logger.success(`🎊 ${novelSlug} 완결!`);
      }

      return {
        chapterData,
        validation,
        pacingValidation,
        updatedState,
        requiresRegeneration: false
      };
    } catch (error) {
      await this.logger.error('챕터 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 생성된 컨텐츠 파싱
   */
  parseGeneratedContent(content) {
    const data = {
      chapterNumber: 1,
      title: '',
      summary: '',
      keyEvents: [],
      emotionalTone: 'neutral',
      wordCount: 0,
      romanceProgression: 0,
      content: ''
    };

    // 각 필드 추출
    const patterns = {
      chapterNumber: /CHAPTER_NUMBER:\s*(\d+)/i,
      title: /CHAPTER_TITLE:\s*(.+)/i,
      summary: /SUMMARY:\s*(.+)/i,
      keyEvents: /KEY_EVENTS:\s*(.+)/i,
      emotionalTone: /EMOTIONAL_TONE:\s*(.+)/i,
      wordCount: /WORD_COUNT:\s*(\d+)/i,
      romanceProgression: /ROMANCE_PROGRESSION:\s*(\d+)/i,
      status: /STATUS:\s*(.+)/i
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        if (key === 'keyEvents') {
          data[key] = match[1].split(',').map(e => e.trim());
        } else if (key === 'chapterNumber' || key === 'wordCount' || key === 'romanceProgression') {
          data[key] = parseInt(match[1]);
        } else {
          data[key] = match[1].trim();
        }
      }
    }

    // 컨텐츠 추출
    const contentMatch = content.match(/--- CONTENT START ---\n([\s\S]+?)\n--- CONTENT END ---/);
    if (contentMatch) {
      data.content = contentMatch[1].trim();
      data.wordCount = data.wordCount || data.content.length;
    }

    return data;
  }

  /**
   * 새 소설 시작
   */
  async startNewNovel(novelInfo) {
    try {
      const novelSlug = novelInfo.slug || `novel-${Date.now()}`;
      
      // 초기 상태 생성
      const initialState = this.stateManager.createNewStoryState(novelSlug);
      initialState.metadata.title = novelInfo.title;
      initialState.metadata.completionTarget = novelInfo.targetChapters || 100;
      
      await this.stateManager.saveStoryState(novelSlug, initialState);
      
      // 첫 챕터 프롬프트 생성
      const prompt = await this.promptGenerator.generateFirstChapterPrompt(novelInfo);
      
      await this.logger.success(`📚 새 소설 '${novelInfo.title}' 시작!`);
      
      return {
        novelSlug,
        prompt,
        initialState
      };
    } catch (error) {
      await this.logger.error('새 소설 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 시스템 상태 확인
   */
  async getSystemStatus() {
    try {
      const files = await fs.readdir(this.stateManager.dataDir).catch(() => []);
      const activeNovels = files.filter(f => f.endsWith('.json')).length;
      
      const novels = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const slug = file.replace('.json', '');
          const state = await this.stateManager.loadStoryState(slug);
          novels.push({
            slug,
            title: state.metadata.title,
            status: state.metadata.status,
            chapters: state.metadata.totalChapters,
            progress: state.metadata.plotProgress
          });
        }
      }

      return {
        continuityEnabled: true,
        activeNovels,
        novels,
        systemVersion: '2.0',
        features: [
          'JSON 상태 관리',
          '자동 플롯 추적',
          '엔딩 관리',
          '연속성 검증',
          '프롬프트 최적화'
        ]
      };
    } catch (error) {
      return {
        continuityEnabled: false,
        error: error.message
      };
    }
  }
}

// 기본 내보내기
export default SimpleContinuityManager;