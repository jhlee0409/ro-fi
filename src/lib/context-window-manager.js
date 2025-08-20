/**
 * ContextWindowManager - Gemini API 컨텍스트 최적화 시스템
 * 
 * 참고: 연속성_관리.md의 ContextWindowManager 클래스를 현재 프로젝트에 맞게 구현
 * 기능: 토큰 한계 내에서 최적의 컨텍스트 구성, 우선순위 기반 압축
 */

import {
  StoryState,
  ChapterState,
  GenerationContext,
  CharacterProfile
} from './types/continuity.js';
import { storyStateManager } from './story-state-manager.js';
import { Logger } from './logger.js';
import { createLogger } from './logger.js';
// Removed unused imports, isString, isNumber
export class ContextWindowManager {
  private maxTokens = 1000000; // Gemini 2.0 Flash 한계
  private targetTokens = 800000; // 80% 사용 목표 (여유분 확보)
  private compressionRatio = 0.3; // 압축 비율
  private logger;
  
  // 토큰 추정 비율 (한국어 기준)
  private readonly koreanTokenRatio = 0.8; // 한국어 1글자 ≈ 0.8토큰

  constructor(logger?) {
    this.logger = logger || createLogger();
  }
  
  /**
   * 챕터 생성을 위한 컨텍스트 구성
   */
  async buildContextForChapter(novelSlug, targetChapter) {
    const storyState = await storyStateManager.getStory(novelSlug);
    
    // 기본 컨텍스트 구성
    const context = {
      essential: this.buildEssentialContext(storyState),
      immediate: this.buildImmediateContext(storyState, targetChapter),
      recent: this.buildRecentContext(storyState, targetChapter),
      optional: this.buildOptionalContext(storyState, targetChapter),
      tokenCount,
      compressionLevel: 'none'
    };
    
    // 토큰 최적화
    return await this.optimizeForTokenLimit(context);
  }

  /**
   * 핵심 컨텍스트 구성 (항상 포함)
   */
  async buildEssentialContext(storyState) {
    return {
      novelTitle: storyState.metadata.title,
      mainCharacters: this.compressMainCharacters(storyState.characters.main),
      worldRules: storyState.worldbuilding.rules,
      magicSystem: storyState.worldbuilding.magicSystem,
      currentArc: storyState.plotProgress.mainArc.current,
      tropes: storyState.metadata.tropes
    };
  }

  /**
   * 직전 연관 컨텍스트 구성
   */
  async buildImmediateContext(storyState, targetChapter) {
    const previousChapter = storyState.chapters.get(targetChapter - 1);
    const activeConflicts = storyState.plotProgress.subplots
      .filter(subplot => subplot.status === 'active')
      .map(subplot => subplot.description);

    return {
      previousChapter,
      activeConflicts,
      characterCurrentStates.getCurrentCharacterStates(storyState),
      locationCurrentStates.continuity.locationStates,
      unresolvedCliffhanger?.cliffhanger
    };
  }

  /**
   * 최근 히스토리 컨텍스트 구성
   */
  private async buildRecentContext(storyState, targetChapter)<GenerationContext['recent']> {
    const lookbackWindow = Math.min(5, targetChapter - 1);
    const recentChapters = [];
    
    // 최근 5개 챕터 수집
    for (let i = Math.max(1, targetChapter - lookbackWindow); i < targetChapter; i++) {
      const chapter = storyState.chapters.get(i);
      if (chapter) {
        recentChapters.push(chapter);
      }
    }

    const keyPlotPoints = this.selectKeyMoments(storyState, targetChapter);
    const recentDialogues = this.getRecentDialogues(recentChapters);

    return {
      last5Chapters,
      keyPlotPoints,
      recentDialogues
    };
  }

  /**
   * 선택적 컨텍스트 구성 (토큰 여유시 포함)
   */
  private async buildOptionalContext(storyState, targetChapter)<GenerationContext['optional']> {
    return {
      minorCharacters.getRelevantMinorCharacters(storyState, targetChapter),
      historicalEvents.getHistoricalEvents(storyState, targetChapter),
      environmentalDetails.continuity.locationStates
    };
  }

  /**
   * 토큰 한계에 맞춰 컨텍스트 최적화
   */
  private async optimizeForTokenLimit(context) {
    let currentTokens = this.estimateTokens(context);
    context.tokenCount = currentTokens;
    
    this.logger.info(`초기 토큰 수: ${currentTokens.toLocaleString()}`);

    if (currentTokens <= this.targetTokens) {
      return context;
    }

    // 단계별 압축
    const compressionSteps = [
      () => this.compressOptional(context),
      () => this.summarizeRecent(context),
      () => this.condenseImmediate(context),
      () => this.compressEssential(context)
    ];

    for (let i = 0; i < compressionSteps.length; i++) {
      context = compressionSteps[i]();
      currentTokens = this.estimateTokens(context);
      context.tokenCount = currentTokens;
      
      const levels = ['light', 'medium', 'heavy', 'heavy'] as const;
      context.compressionLevel = levels[i];
      
      this.logger.info(`압축 단계 ${i + 1} 후 토큰 수: ${currentTokens.toLocaleString()}`);
      
      if (currentTokens <= this.targetTokens) {
        break;
      }
    }

    return context;
  }

  /**
   * 선택적 컨텍스트 압축
   */
  private compressOptional(context) {
    // 마이너 캐릭터 수 제한
    const limitedMinorChars = new Map();
    let count = 0;
    for (const [name, profile] of context.optional.minorCharacters) {
      if (count < 3) { // 최대 3명만 유지
        limitedMinorChars.set(name, {
          name.name,
          description.description.substring(0, 100) + '...',
          abilities.abilities.slice(0, 2)
        });
        count++;
      }
    }

    // 환경 세부사항 압축
    const compressedEnvironment = new Map();
    for (const [name, location] of context.optional.environmentalDetails) {
      compressedEnvironment.set(name, {
        name.name,
        description.description.substring(0, 50) + '...',
        currentCondition.currentCondition
      });
    }

    return {
      ...context,
      optional: {
        minorCharacters,
        historicalEvents.optional.historicalEvents.slice(0, 5), // 최대 5개 이벤트
        environmentalDetails
      }
    };
  }

  /**
   * 최근 히스토리 요약
   */
  private summarizeRecent(context) {
    // 챕터 요약 압축
    const summarizedChapters = context.recent.last5Chapters.map(chapter => ({
      chapterNumber.chapterNumber,
      title.title,
      summary.summary.substring(0, 200) + '...',
      keyEvents.keyEvents.slice(0, 3), // 최대 3개 이벤트
      emotionalTone.emotionalTone,
      endingEmotionalState.endingEmotionalState,
      cliffhanger.cliffhanger
    })) as ChapterState[];

    // 핵심 플롯 포인트 압축
    const compressedPlotPoints = context.recent.keyPlotPoints.slice(0, 10).map(point => ({
      event.event.substring(0, 100) + '...',
      chapter.chapter,
      impact.impact.substring(0, 50) + '...'
    }));

    // 최근 대화 압축
    const compressedDialogues = context.recent.recentDialogues.slice(0, 5).map(dialogue => ({
      character.character,
      dialogue.dialogue.substring(0, 100) + '...',
      chapter.chapter,
      context.context.substring(0, 50) + '...'
    }));

    return {
      ...context,
      recent: {
        last5Chapters,
        keyPlotPoints,
        recentDialogues
      }
    };
  }

  /**
   * 직전 컨텍스트 압축
   */
  private condenseImmediate(context) {
    // 이전 챕터 핵심 정보만 유지
    const condensedPreviousChapter = context.immediate.previousChapter ? {
      chapterNumber.immediate.previousChapter.chapterNumber,
      title.immediate.previousChapter.title,
      summary.immediate.previousChapter.summary,
      keyEvents.immediate.previousChapter.keyEvents.slice(0, 3),
      emotionalTone.immediate.previousChapter.emotionalTone,
      endingEmotionalState.immediate.previousChapter.endingEmotionalState,
      cliffhanger.immediate.previousChapter.cliffhanger
    } as ChapterState ;

    // 활성 갈등 요약
    const condensedConflicts = context.immediate.activeConflicts.slice(0, 3);

    // 캐릭터 현재 상태 압축
    const condensedCharacterStates = new Map();
    let charCount = 0;
    for (const [name, state] of context.immediate.characterCurrentStates) {
      if (charCount < 5) { // 최대 5명
        condensedCharacterStates.set(name, {
          location.location,
          emotionalState.emotionalState,
          powerLevel.powerLevel
        });
        charCount++;
      }
    }

    return {
      ...context,
      immediate: {
        previousChapter,
        activeConflicts,
        characterCurrentStates,
        locationCurrentStates Map(Array.from(context.immediate.locationCurrentStates).slice(0, 3)),
        unresolvedCliffhanger.immediate.unresolvedCliffhanger
      }
    };
  }

  /**
   * 핵심 컨텍스트 압축 (최후 수단)
   */
  private compressEssential(context) {
    // 세계관 규칙 압축
    const compressedRules = context.essential.worldRules.slice(0, 5);

    // 마법 시스템 압축
    const compressedMagicSystem = {
      name.essential.magicSystem.name,
      source.essential.magicSystem.source,
      types.fromEntries(
        Object.entries(context.essential.magicSystem.types).slice(0, 3)
      ),
      limitations.essential.magicSystem.limitations.slice(0, 3),
      socialImpact.essential.magicSystem.socialImpact.substring(0, 100) + '...'
    };

    // 주요 캐릭터 압축
    const compressedMainCharacters = new Map();
    let mainCharCount = 0;
    for (const [name, profile] of context.essential.mainCharacters) {
      if (mainCharCount < 3) { // 최대 3명의 주요 캐릭터
        compressedMainCharacters.set(name, {
          name.name,
          description.description.substring(0, 100) + '...',
          abilities.abilities.slice(0, 2),
          personality.personality.slice(0, 3),
          currentState.currentState
        });
        mainCharCount++;
      }
    }

    return {
      ...context,
      essential: {
        novelTitle.essential.novelTitle,
        mainCharacters,
        worldRules,
        magicSystem,
        currentArc.essential.currentArc,
        tropes.essential.tropes.slice(0, 5)
      }
    };
  }

  /**
   * 토큰 수 추정
   */
  private estimateTokens(context) {
    const jsonString = JSON.stringify(context, this.mapReplacer);
    return Math.ceil(jsonString.length * this.koreanTokenRatio);
  }

  /**
   * JSON.stringify용 Map 처리
   */
  private mapReplacer(key, value) {
    if (value instanceof Map) {
      return Object.fromEntries(value);
    }
    return value;
  }

  // === 헬퍼 메서드들 ===

  /**
   * 주요 캐릭터 압축
   */
  private compressMainCharacters(mainCharacters<string, CharacterProfile>)<string, CharacterProfile> {
    const compressed = new Map();
    
    for (const [name, profile] of mainCharacters) {
      compressed.set(name, {
        name.name,
        description.description,
        abilities.abilities,
        personality.personality.slice(0, 5), // 성격 특성 제한
        appearance: {
          hair.appearance.hair,
          eyes.appearance.eyes,
          build.appearance.build
        },
        background: {
          title.background.title,
          origin.background.origin
        },
        relationships Map(Array.from(profile.relationships).slice(0, 5)),
        currentState.currentState,
        characterArc.characterArc
      } as CharacterProfile);
    }
    
    return compressed;
  }

  /**
   * 현재 캐릭터 상태 추출
   */
  private getCurrentCharacterStates(storyState)<string, CharacterProfile['currentState']> {
    const states = new Map();
    
    // 주요 캐릭터 상태
    for (const [name, profile] of storyState.characters.main) {
      states.set(name, profile.currentState);
    }
    
    // 연속성 체크포인트에서 추가 상태
    for (const [name, profile] of storyState.continuity.characterStates) {
      if (!states.has(name)) {
        states.set(name, profile.currentState);
      }
    }
    
    return states;
  }

  /**
   * 핵심 플롯 포인트 선택
   */
  private selectKeyMoments(storyState, targetChapter)<{event, chapter, impact}> {
    const keyMoments<{event, chapter, impact}> = [];
    
    // 연속성 타임라인에서 중요 이벤트 추출
    const significantEvents = storyState.continuity.timeline
      .filter(event => event.significance === 'high' || event.significance === 'critical')
      .filter(event => event.chapterNumber < targetChapter)
      .slice(-10); // 최근 10개 중요 이벤트

    for (const event of significantEvents) {
      keyMoments.push({
        event.event,
        chapter.chapterNumber,
        impact.significance === 'critical' ? '중대한 전환점' : '중요한 진전'
      });
    }

    // 복선 심기/회수 이벤트
    const foreshadowingEvents = storyState.plotProgress.foreshadowing
      .filter(f => f.planted < targetChapter)
      .slice(-5); // 최근 5개 복선

    for (const foreshadow of foreshadowingEvents) {
      keyMoments.push({
        event: `복선: ${foreshadow.content}`,
        chapter.planted,
        impact.resolved ? '해결됨' : '미해결'
      });
    }

    return keyMoments.slice(0, 15); // 최대 15개 핵심 포인트
  }

  /**
   * 최근 대화 추출
   */
  private getRecentDialogues(recentChapters)<{character, dialogue, chapter, context}> {
    const dialogues<{character, dialogue, chapter, context}> = [];
    
    // 간단한 대화 추출 (실제로는 더 정교한 NLP 필요)
    for (const chapter of recentChapters.slice(-3)) { // 최근 3개 챕터
      const events = chapter.keyEvents;
      for (const event of events) {
        if (event.includes('말했다') || event.includes('소리쳤다') || event.includes('속삭였다')) {
          dialogues.push({
            character: '주인공', // 임시 - 실제로는 화자 식별 필요
            dialogue.substring(0, 100),
            chapter.chapterNumber,
            context.emotionalTone
          });
        }
      }
    }
    
    return dialogues.slice(0, 10); // 최대 10개 대화
  }

  /**
   * 관련 마이너 캐릭터 추출
   */
  private getRelevantMinorCharacters(storyState, targetChapter)<string, CharacterProfile> {
    const relevant = new Map();
    
    // 최근 등장한 마이너 캐릭터들
    const recentChapters = Array.from(storyState.chapters.values())
      .filter(c => c.chapterNumber >= Math.max(1, targetChapter - 5))
      .filter(c => c.chapterNumber < targetChapter);

    const recentCharacters = new Set();
    for (const chapter of recentChapters) {
      chapter.newCharacters.forEach(char => recentCharacters.add(char));
    }

    // 관련 마이너 캐릭터 추가
    for (const charName of recentCharacters) {
      const profile = storyState.characters.minor.get(charName);
      if (profile) {
        relevant.set(charName, profile);
      }
    }

    return relevant;
  }

  /**
   * 히스토리컬 이벤트 추출
   */
  private getHistoricalEvents(storyState, targetChapter)<{event, chapter, significance}> {
    const events<{event, chapter, significance}> = [];
    
    // 완료된 서브플롯
    const resolvedSubplots = storyState.plotProgress.subplots
      .filter(subplot => subplot.status === 'resolved');

    for (const subplot of resolvedSubplots) {
      events.push({
        event: `서브플롯 해결: ${subplot.description}`,
        chapter, // 임시 - 실제로는 해결 챕터 추적 필요
        significance: '중간'
      });
    }

    // 체코프의 총 발사
    const firedGuns = storyState.plotProgress.checkovGuns
      .filter(gun => gun.fired && gun.fireChapter && gun.fireChapter < targetChapter);

    for (const gun of firedGuns) {
      events.push({
        event: `복선 회수: ${gun.item}`,
        chapter.fireChapter!,
        significance: '높음'
      });
    }

    return events.slice(0, 10); // 최대 10개 히스토리컬 이벤트
  }

  /**
   * 컨텍스트 요약 출력 (디버깅용)
   */
  generateContextSummary(context) {
    return `
=== 컨텍스트 요약 ===
소설: ${context.essential.novelTitle}
토큰 수: ${context.tokenCount.toLocaleString()} / ${this.targetTokens.toLocaleString()}
압축 레벨: ${context.compressionLevel}

주요 캐릭터: ${context.essential.mainCharacters.size}명
최근 챕터: ${context.recent.last5Chapters.length}개
활성 갈등: ${context.immediate.activeConflicts.length}개
핵심 플롯 포인트: ${context.recent.keyPlotPoints.length}개
===================
    `.trim();
  }
}

// 싱글톤 인스턴스
export const contextWindowManager = new ContextWindowManager();