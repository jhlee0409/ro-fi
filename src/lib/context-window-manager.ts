/**
 * ContextWindowManager - Gemini API 컨텍스트 최적화 시스템
 * 
 * 참고: 연속성_관리.md의 ContextWindowManager 클래스를 현재 프로젝트에 맞게 구현
 * 기능: 토큰 한계 내에서 최적의 컨텍스트 구성, 우선순위 기반 압축
 */

import type {
  StoryState,
  ChapterState,
  GenerationContext,
  CharacterProfile
} from './types/continuity.js';
import { storyStateManager } from './story-state-manager.js';

export class ContextWindowManager {
  private maxTokens = 1000000; // Gemini 2.0 Flash 한계
  private targetTokens = 800000; // 80% 사용 목표 (여유분 확보)
  private compressionRatio = 0.3; // 압축 비율
  
  // 토큰 추정 비율 (한국어 기준)
  private readonly koreanTokenRatio = 0.8; // 한국어 1글자 ≈ 0.8토큰
  
  /**
   * 챕터 생성을 위한 컨텍스트 구성
   */
  async buildContextForChapter(novelSlug: string, targetChapter: number): Promise<GenerationContext> {
    const storyState = await storyStateManager.getStory(novelSlug);
    
    // 기본 컨텍스트 구성
    const context: GenerationContext = {
      essential: await this.buildEssentialContext(storyState),
      immediate: await this.buildImmediateContext(storyState, targetChapter),
      recent: await this.buildRecentContext(storyState, targetChapter),
      optional: await this.buildOptionalContext(storyState, targetChapter),
      tokenCount: 0,
      compressionLevel: 'none'
    };
    
    // 토큰 최적화
    return await this.optimizeForTokenLimit(context);
  }

  /**
   * 핵심 컨텍스트 구성 (항상 포함)
   */
  private async buildEssentialContext(storyState: StoryState): Promise<GenerationContext['essential']> {
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
  private async buildImmediateContext(storyState: StoryState, targetChapter: number): Promise<GenerationContext['immediate']> {
    const previousChapter = storyState.chapters.get(targetChapter - 1);
    const activeConflicts = storyState.plotProgress.subplots
      .filter(subplot => subplot.status === 'active')
      .map(subplot => subplot.description);

    return {
      previousChapter,
      activeConflicts,
      characterCurrentStates: this.getCurrentCharacterStates(storyState),
      locationCurrentStates: storyState.continuity.locationStates,
      unresolvedCliffhanger: previousChapter?.cliffhanger
    };
  }

  /**
   * 최근 히스토리 컨텍스트 구성
   */
  private async buildRecentContext(storyState: StoryState, targetChapter: number): Promise<GenerationContext['recent']> {
    const lookbackWindow = Math.min(5, targetChapter - 1);
    const recentChapters: ChapterState[] = [];
    
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
      last5Chapters: recentChapters,
      keyPlotPoints,
      recentDialogues
    };
  }

  /**
   * 선택적 컨텍스트 구성 (토큰 여유시 포함)
   */
  private async buildOptionalContext(storyState: StoryState, targetChapter: number): Promise<GenerationContext['optional']> {
    return {
      minorCharacters: this.getRelevantMinorCharacters(storyState, targetChapter),
      historicalEvents: this.getHistoricalEvents(storyState, targetChapter),
      environmentalDetails: storyState.continuity.locationStates
    };
  }

  /**
   * 토큰 한계에 맞춰 컨텍스트 최적화
   */
  private async optimizeForTokenLimit(context: GenerationContext): Promise<GenerationContext> {
    let currentTokens = this.estimateTokens(context);
    context.tokenCount = currentTokens;
    
    console.log(`초기 토큰 수: ${currentTokens.toLocaleString()}`);

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
      
      console.log(`압축 단계 ${i + 1} 후 토큰 수: ${currentTokens.toLocaleString()}`);
      
      if (currentTokens <= this.targetTokens) {
        break;
      }
    }

    return context;
  }

  /**
   * 선택적 컨텍스트 압축
   */
  private compressOptional(context: GenerationContext): GenerationContext {
    // 마이너 캐릭터 수 제한
    const limitedMinorChars = new Map();
    let count = 0;
    for (const [name, profile] of context.optional.minorCharacters) {
      if (count < 3) { // 최대 3명만 유지
        limitedMinorChars.set(name, {
          name: profile.name,
          description: profile.description.substring(0, 100) + '...',
          abilities: profile.abilities.slice(0, 2)
        });
        count++;
      }
    }

    // 환경 세부사항 압축
    const compressedEnvironment = new Map();
    for (const [name, location] of context.optional.environmentalDetails) {
      compressedEnvironment.set(name, {
        name: location.name,
        description: location.description.substring(0, 50) + '...',
        currentCondition: location.currentCondition
      });
    }

    return {
      ...context,
      optional: {
        minorCharacters: limitedMinorChars,
        historicalEvents: context.optional.historicalEvents.slice(0, 5), // 최대 5개 이벤트
        environmentalDetails: compressedEnvironment
      }
    };
  }

  /**
   * 최근 히스토리 요약
   */
  private summarizeRecent(context: GenerationContext): GenerationContext {
    // 챕터 요약 압축
    const summarizedChapters = context.recent.last5Chapters.map(chapter => ({
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      summary: chapter.summary.substring(0, 200) + '...',
      keyEvents: chapter.keyEvents.slice(0, 3), // 최대 3개 이벤트
      emotionalTone: chapter.emotionalTone,
      endingEmotionalState: chapter.endingEmotionalState,
      cliffhanger: chapter.cliffhanger
    })) as ChapterState[];

    // 핵심 플롯 포인트 압축
    const compressedPlotPoints = context.recent.keyPlotPoints.slice(0, 10).map(point => ({
      event: point.event.substring(0, 100) + '...',
      chapter: point.chapter,
      impact: point.impact.substring(0, 50) + '...'
    }));

    // 최근 대화 압축
    const compressedDialogues = context.recent.recentDialogues.slice(0, 5).map(dialogue => ({
      character: dialogue.character,
      dialogue: dialogue.dialogue.substring(0, 100) + '...',
      chapter: dialogue.chapter,
      context: dialogue.context.substring(0, 50) + '...'
    }));

    return {
      ...context,
      recent: {
        last5Chapters: summarizedChapters,
        keyPlotPoints: compressedPlotPoints,
        recentDialogues: compressedDialogues
      }
    };
  }

  /**
   * 직전 컨텍스트 압축
   */
  private condenseImmediate(context: GenerationContext): GenerationContext {
    // 이전 챕터 핵심 정보만 유지
    const condensedPreviousChapter = context.immediate.previousChapter ? {
      chapterNumber: context.immediate.previousChapter.chapterNumber,
      title: context.immediate.previousChapter.title,
      summary: context.immediate.previousChapter.summary,
      keyEvents: context.immediate.previousChapter.keyEvents.slice(0, 3),
      emotionalTone: context.immediate.previousChapter.emotionalTone,
      endingEmotionalState: context.immediate.previousChapter.endingEmotionalState,
      cliffhanger: context.immediate.previousChapter.cliffhanger
    } as ChapterState : undefined;

    // 활성 갈등 요약
    const condensedConflicts = context.immediate.activeConflicts.slice(0, 3);

    // 캐릭터 현재 상태 압축
    const condensedCharacterStates = new Map();
    let charCount = 0;
    for (const [name, state] of context.immediate.characterCurrentStates) {
      if (charCount < 5) { // 최대 5명
        condensedCharacterStates.set(name, {
          location: state.location,
          emotionalState: state.emotionalState,
          powerLevel: state.powerLevel
        });
        charCount++;
      }
    }

    return {
      ...context,
      immediate: {
        previousChapter: condensedPreviousChapter,
        activeConflicts: condensedConflicts,
        characterCurrentStates: condensedCharacterStates,
        locationCurrentStates: new Map(Array.from(context.immediate.locationCurrentStates).slice(0, 3)),
        unresolvedCliffhanger: context.immediate.unresolvedCliffhanger
      }
    };
  }

  /**
   * 핵심 컨텍스트 압축 (최후 수단)
   */
  private compressEssential(context: GenerationContext): GenerationContext {
    // 세계관 규칙 압축
    const compressedRules = context.essential.worldRules.slice(0, 5);

    // 마법 시스템 압축
    const compressedMagicSystem = {
      name: context.essential.magicSystem.name,
      source: context.essential.magicSystem.source,
      types: Object.fromEntries(
        Object.entries(context.essential.magicSystem.types).slice(0, 3)
      ),
      limitations: context.essential.magicSystem.limitations.slice(0, 3),
      socialImpact: context.essential.magicSystem.socialImpact.substring(0, 100) + '...'
    };

    // 주요 캐릭터 압축
    const compressedMainCharacters = new Map();
    let mainCharCount = 0;
    for (const [name, profile] of context.essential.mainCharacters) {
      if (mainCharCount < 3) { // 최대 3명의 주요 캐릭터
        compressedMainCharacters.set(name, {
          name: profile.name,
          description: profile.description.substring(0, 100) + '...',
          abilities: profile.abilities.slice(0, 2),
          personality: profile.personality.slice(0, 3),
          currentState: profile.currentState
        });
        mainCharCount++;
      }
    }

    return {
      ...context,
      essential: {
        novelTitle: context.essential.novelTitle,
        mainCharacters: compressedMainCharacters,
        worldRules: compressedRules,
        magicSystem: compressedMagicSystem,
        currentArc: context.essential.currentArc,
        tropes: context.essential.tropes.slice(0, 5)
      }
    };
  }

  /**
   * 토큰 수 추정
   */
  private estimateTokens(context: GenerationContext): number {
    const jsonString = JSON.stringify(context, this.mapReplacer);
    return Math.ceil(jsonString.length * this.koreanTokenRatio);
  }

  /**
   * JSON.stringify용 Map 처리
   */
  private mapReplacer(key: string, value: any): any {
    if (value instanceof Map) {
      return Object.fromEntries(value);
    }
    return value;
  }

  // === 헬퍼 메서드들 ===

  /**
   * 주요 캐릭터 압축
   */
  private compressMainCharacters(mainCharacters: Map<string, CharacterProfile>): Map<string, CharacterProfile> {
    const compressed = new Map();
    
    for (const [name, profile] of mainCharacters) {
      compressed.set(name, {
        name: profile.name,
        description: profile.description,
        abilities: profile.abilities,
        personality: profile.personality.slice(0, 5), // 성격 특성 제한
        appearance: {
          hair: profile.appearance.hair,
          eyes: profile.appearance.eyes,
          build: profile.appearance.build
        },
        background: {
          title: profile.background.title,
          origin: profile.background.origin
        },
        relationships: new Map(Array.from(profile.relationships).slice(0, 5)),
        currentState: profile.currentState,
        characterArc: profile.characterArc
      } as CharacterProfile);
    }
    
    return compressed;
  }

  /**
   * 현재 캐릭터 상태 추출
   */
  private getCurrentCharacterStates(storyState: StoryState): Map<string, CharacterProfile['currentState']> {
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
  private selectKeyMoments(storyState: StoryState, targetChapter: number): Array<{event: string, chapter: number, impact: string}> {
    const keyMoments: Array<{event: string, chapter: number, impact: string}> = [];
    
    // 연속성 타임라인에서 중요 이벤트 추출
    const significantEvents = storyState.continuity.timeline
      .filter(event => event.significance === 'high' || event.significance === 'critical')
      .filter(event => event.chapterNumber < targetChapter)
      .slice(-10); // 최근 10개 중요 이벤트

    for (const event of significantEvents) {
      keyMoments.push({
        event: event.event,
        chapter: event.chapterNumber,
        impact: event.significance === 'critical' ? '중대한 전환점' : '중요한 진전'
      });
    }

    // 복선 심기/회수 이벤트
    const foreshadowingEvents = storyState.plotProgress.foreshadowing
      .filter(f => f.planted < targetChapter)
      .slice(-5); // 최근 5개 복선

    for (const foreshadow of foreshadowingEvents) {
      keyMoments.push({
        event: `복선: ${foreshadow.content}`,
        chapter: foreshadow.planted,
        impact: foreshadow.resolved ? '해결됨' : '미해결'
      });
    }

    return keyMoments.slice(0, 15); // 최대 15개 핵심 포인트
  }

  /**
   * 최근 대화 추출
   */
  private getRecentDialogues(recentChapters: ChapterState[]): Array<{character: string, dialogue: string, chapter: number, context: string}> {
    const dialogues: Array<{character: string, dialogue: string, chapter: number, context: string}> = [];
    
    // 간단한 대화 추출 (실제로는 더 정교한 NLP 필요)
    for (const chapter of recentChapters.slice(-3)) { // 최근 3개 챕터
      const events = chapter.keyEvents;
      for (const event of events) {
        if (event.includes('말했다') || event.includes('소리쳤다') || event.includes('속삭였다')) {
          dialogues.push({
            character: '주인공', // 임시 - 실제로는 화자 식별 필요
            dialogue: event.substring(0, 100),
            chapter: chapter.chapterNumber,
            context: chapter.emotionalTone
          });
        }
      }
    }
    
    return dialogues.slice(0, 10); // 최대 10개 대화
  }

  /**
   * 관련 마이너 캐릭터 추출
   */
  private getRelevantMinorCharacters(storyState: StoryState, targetChapter: number): Map<string, CharacterProfile> {
    const relevant = new Map();
    
    // 최근 등장한 마이너 캐릭터들
    const recentChapters = Array.from(storyState.chapters.values())
      .filter(c => c.chapterNumber >= Math.max(1, targetChapter - 5))
      .filter(c => c.chapterNumber < targetChapter);

    const recentCharacters = new Set<string>();
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
  private getHistoricalEvents(storyState: StoryState, targetChapter: number): Array<{event: string, chapter: number, significance: string}> {
    const events: Array<{event: string, chapter: number, significance: string}> = [];
    
    // 완료된 서브플롯
    const resolvedSubplots = storyState.plotProgress.subplots
      .filter(subplot => subplot.status === 'resolved');

    for (const subplot of resolvedSubplots) {
      events.push({
        event: `서브플롯 해결: ${subplot.description}`,
        chapter: 0, // 임시 - 실제로는 해결 챕터 추적 필요
        significance: '중간'
      });
    }

    // 체코프의 총 발사
    const firedGuns = storyState.plotProgress.checkovGuns
      .filter(gun => gun.fired && gun.fireChapter && gun.fireChapter < targetChapter);

    for (const gun of firedGuns) {
      events.push({
        event: `복선 회수: ${gun.item}`,
        chapter: gun.fireChapter!,
        significance: '높음'
      });
    }

    return events.slice(0, 10); // 최대 10개 히스토리컬 이벤트
  }

  /**
   * 컨텍스트 요약 출력 (디버깅용)
   */
  generateContextSummary(context: GenerationContext): string {
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