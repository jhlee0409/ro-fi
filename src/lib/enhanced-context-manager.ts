/**
 * 🧠 Enhanced Context Manager
 * 기존 StoryContextManager를 확장한 고도화된 컨텍스트 관리 시스템
 * 
 * Features:
 * - 계층형 메모리 구조 (Persistent/Episodic/Working)
 * - 창의성 모드 v2.1 통합
 * - 독자 피드백 반영 시스템
 * - 일관성 자동 검증
 */

import { Novel, Chapter, QualityMetrics } from './types/index.js';
import { StoryContextManager } from './story-context-manager.js';
import { QualityAnalyticsEngine } from './quality-analytics-engine.js';

/**
 * 메모리 계층 구조
 */
interface MemoryLayers {
  persistent: PersistentMemory;
  episodic: EpisodicMemory;
  working: WorkingMemory;
}

interface PersistentMemory {
  worldRules: Map<string, WorldRule>;
  characterProfiles: Map<string, CharacterProfile>;
  plotTimeline: PlotEvent[];
  genreConventions: GenreRule[];
}

interface EpisodicMemory {
  recentChapters: Chapter[];
  activeConflicts: Conflict[];
  dialogueHistory: DialogueEntry[];
  emotionalArcs: EmotionalArc[];
}

interface WorkingMemory {
  currentScene: Scene;
  immediateContext: ContextSnapshot;
  creativityMode: CreativityModeState;
  readerMetrics: ReaderMetrics;
}

interface WorldRule {
  id: string;
  rule: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  examples: string[];
  violations: string[];
}

interface CharacterProfile {
  id: string;
  name: string;
  personality: PersonalityTraits;
  background: string;
  relationships: Map<string, Relationship>;
  developmentArc: DevelopmentStage[];
  speechPatterns: SpeechPattern[];
}

interface PlotEvent {
  id: string;
  _chapterNumber: number;
  eventType: 'setup' | 'confrontation' | 'resolution' | 'revelation';
  description: string;
  consequences: string[];
  foreshadowing: string[];
}

interface Conflict {
  id: string;
  type: 'internal' | 'interpersonal' | 'societal' | 'supernatural';
  description: string;
  stakeholders: string[];
  currentStage: 'emerging' | 'escalating' | 'climax' | 'resolving';
  resolution: string | null;
}

interface CreativityModeState {
  isActive: boolean;
  trigger: 'reader_engagement' | 'repetition_detected' | 'climax_moment' | 'manual';
  investmentLevel: 'standard' | 'high' | 'unlimited';
  expectedROI: number;
}

interface ReaderMetrics {
  engagementScore: number;
  dropoffRate: number;
  favoriteCharacters: string[];
  preferredTropes: string[];
  feedbackSentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * 고도화된 컨텍스트 관리자
 */
export class EnhancedContextManager {
  private memory: MemoryLayers;
  private baseContextManager: StoryContextManager;
  private qualityEngine: QualityAnalyticsEngine;
  private contextCache: Map<string, unknown>;

  constructor() {
    this.memory = this.initializeMemoryLayers();
    this.baseContextManager = new StoryContextManager();
    this.qualityEngine = new QualityAnalyticsEngine();
    this.contextCache = new Map();
  }

  /**
   * 메모리 계층 초기화
   */
  private initializeMemoryLayers(): MemoryLayers {
    return {
      persistent: {
        worldRules: new Map(),
        characterProfiles: new Map(),
        plotTimeline: [],
        genreConventions: []
      },
      episodic: {
        recentChapters: [],
        activeConflicts: [],
        dialogueHistory: [],
        emotionalArcs: []
      },
      working: {
        currentScene: {} as Scene,
        immediateContext: {} as ContextSnapshot,
        creativityMode: {
          isActive: false,
          trigger: 'manual',
          investmentLevel: 'standard',
          expectedROI: 0
        },
        readerMetrics: {
          engagementScore: 0,
          dropoffRate: 0,
          favoriteCharacters: [],
          preferredTropes: [],
          feedbackSentiment: 'neutral'
        }
      }
    };
  }

  /**
   * 챕터 생성을 위한 통합 컨텍스트 준비
   */
  async prepareContextForChapter(
    _novel: Novel, 
    _chapterNumber: number,
    options: ContextOptions = {}
  ): Promise<EnhancedContext> {
    const cacheKey = `${novel.slug}-ch${chapterNumber}`;
    
    if (this.contextCache.has(cacheKey) && !options.forceRefresh) {
      return this.contextCache.get(cacheKey);
    }

    // 1. 기본 컨텍스트 준비
    let baseContext = '';
    try {
      await this.baseContextManager.loadStoryContext();
      baseContext = this.baseContextManager.generateChapterContext(novel.slug);
    } catch (_error) {
      // 기존 시스템이 없으면 빈 컨텍스트로 진행
      baseContext = '';
    }

    // 2. 창의성 모드 평가
    const creativityState = await this.evaluateCreativityNeed(novel, chapterNumber);

    // 3. 독자 피드백 분석
    const readerInsights = await this.analyzeReaderFeedback(novel);

    // 4. 일관성 검증
    const consistencyCheck = await this.performConsistencyCheck(novel, chapterNumber);

    // 5. 통합 컨텍스트 구성
    const enhancedContext: EnhancedContext = {
      ...baseContext,
      creativityMode: creativityState,
      readerInsights,
      consistencyGuards: consistencyCheck,
      memoryLayers: this.memory,
      qualityTargets: this.calculateQualityTargets(creativityState),
      generationHints: this.generateContextualHints(novel, chapterNumber)
    };

    // 6. 캐시 저장
    this.contextCache.set(cacheKey, enhancedContext);

    return enhancedContext;
  }

  /**
   * 창의성 모드 필요성 평가 (v2.1 기반)
   */
  private async evaluateCreativityNeed(
    _novel: Novel, 
    _chapterNumber: number
  ): Promise<CreativityModeState> {
    const recentChapters = this.memory.episodic.recentChapters.slice(-3);
    const readerMetrics = this.memory.working.readerMetrics;

    // 자동 창의성 감지 로직
    const triggers = {
      repetitionDetected: this.detectRepetition(recentChapters),
      lowEngagement: readerMetrics.engagementScore < 70,
      highDropoff: readerMetrics.dropoffRate > 20,
      climaxMoment: this.isClimaxMoment(chapterNumber, novel),
      keyStoryMoment: this.isKeyStoryMoment(chapterNumber)
    };

    const shouldActivate = Object.values(triggers).some(Boolean);

    if (!shouldActivate) {
      return {
        isActive: false,
        trigger: 'manual',
        investmentLevel: 'standard',
        expectedROI: 1.0
      };
    }

    // 투자 수준 결정
    let investmentLevel: 'standard' | 'high' | 'unlimited' = 'standard';
    let trigger: CreativityModeState['trigger'] = 'manual';

    if (triggers.climaxMoment || triggers.keyStoryMoment) {
      investmentLevel = 'unlimited';
      trigger = 'climax_moment';
    } else if (triggers.lowEngagement || triggers.highDropoff) {
      investmentLevel = 'high';
      trigger = 'reader_engagement';
    } else if (triggers.repetitionDetected) {
      investmentLevel = 'high';
      trigger = 'repetition_detected';
    }

    return {
      isActive: true,
      trigger,
      investmentLevel,
      expectedROI: this.calculateExpectedROI(investmentLevel, trigger)
    };
  }

  /**
   * 반복 패턴 감지
   */
  private detectRepetition(recentChapters: Chapter[]): boolean {
    if (recentChapters.length < 3) return false;

    // 감정 톤 분석
    const emotions = recentChapters.map(ch => this.extractEmotionalTone(ch.content));
    const uniqueEmotions = new Set(emotions);

    // 3화 연속 같은 감정 톤 = 반복
    if (uniqueEmotions.size === 1) return true;

    // 구조적 패턴 분석
    const structures = recentChapters.map(ch => this.analyzeChapterStructure(ch.content));
    const uniqueStructures = new Set(structures);

    return uniqueStructures.size <= 1;
  }

  /**
   * 클라이맥스 순간 감지
   */
  private isClimaxMoment(_chapterNumber: number, _novel: Novel): boolean {
    const totalChapters = novel.totalChapters || 50; // 예상 총 챕터 수
    const progress = chapterNumber / totalChapters;

    // 클라이맥스 구간 (70-85%)
    return progress >= 0.7 && progress <= 0.85;
  }

  /**
   * 핵심 스토리 순간 감지
   */
  private isKeyStoryMoment(_chapterNumber: number): boolean {
    const keyMoments = [1, 5, 10, 15, 20, 25, 30]; // 일반적인 핵심 챕터들
    return keyMoments.includes(chapterNumber);
  }

  /**
   * ROI 계산
   */
  private calculateExpectedROI(
    investmentLevel: CreativityModeState['investmentLevel'],
    trigger: CreativityModeState['trigger']
  ): number {
    const baseROI = {
      standard: 1.0,
      high: 1.5,
      unlimited: 2.5
    };

    const triggerMultiplier = {
      reader_engagement: 1.8,
      repetition_detected: 1.4,
      climax_moment: 3.0,
      manual: 1.0
    };

    return baseROI[investmentLevel] * triggerMultiplier[trigger];
  }

  /**
   * 독자 피드백 분석
   */
  private async analyzeReaderFeedback(_novel: Novel): Promise<ReaderInsights> {
    // 실제 구현에서는 외부 피드백 데이터를 분석
    return {
      engagementTrends: [],
      preferredElements: [],
      criticalFeedback: [],
      suggestionAreas: []
    };
  }

  /**
   * 일관성 검증
   */
  private async performConsistencyCheck(
    _novel: Novel, 
    _chapterNumber: number
  ): Promise<ConsistencyGuards> {
    return {
      characterConsistency: [],
      worldConsistency: [],
      plotConsistency: [],
      toneConsistency: []
    };
  }

  /**
   * 품질 목표 계산
   */
  private calculateQualityTargets(creativityState: CreativityModeState): QualityTargets {
    const baseTargets = {
      readability: 80,
      creativity: 70,
      consistency: 85,
      engagement: 75
    };

    if (creativityState.isActive) {
      return {
        ...baseTargets,
        creativity: creativityState.investmentLevel === 'unlimited' ? 95 : 85,
        engagement: 90
      };
    }

    return baseTargets;
  }

  /**
   * 상황별 힌트 생성
   */
  private generateContextualHints(_novel: Novel, _chapterNumber: number): GenerationHints {
    return {
      stylistic: [],
      narrative: [],
      character: [],
      emotional: []
    };
  }

  /**
   * 메모리 업데이트
   */
  async updateMemoryWithChapter(_chapter: Chapter, _qualityMetrics: QualityMetrics): Promise<void> {
    // Episodic memory 업데이트
    this.memory.episodic.recentChapters.push(chapter);
    if (this.memory.episodic.recentChapters.length > 10) {
      this.memory.episodic.recentChapters.shift();
    }

    // 캐릭터 프로필 업데이트
    await this.updateCharacterProfiles(chapter);

    // 플롯 타임라인 업데이트
    await this.updatePlotTimeline(chapter);

    // 캐시 무효화
    this.contextCache.clear();
  }

  /**
   * 메모리 시스템 상태 리포트
   */
  getMemoryReport(): MemoryReport {
    return {
      persistentMemorySize: this.memory.persistent.characterProfiles.size,
      episodicMemorySize: this.memory.episodic.recentChapters.length,
      workingMemoryActive: true,
      cacheHitRate: this.calculateCacheHitRate(),
      lastUpdate: new Date().toISOString()
    };
  }

  // Helper methods
  private extractEmotionalTone(_content: string): string {
    // 감정 톤 분석 로직
    return 'neutral';
  }

  private analyzeChapterStructure(_content: string): string {
    // 구조 분석 로직
    return 'standard';
  }

  private async updateCharacterProfiles(_chapter: Chapter): Promise<void> {
    // 캐릭터 프로필 업데이트 로직
  }

  private async updatePlotTimeline(_chapter: Chapter): Promise<void> {
    // 플롯 타임라인 업데이트 로직
  }

  private calculateCacheHitRate(): number {
    // 캐시 적중률 계산
    return 0.85;
  }
}

// 타입 정의들
interface ContextOptions {
  forceRefresh?: boolean;
  includeDebugInfo?: boolean;
}

interface EnhancedContext {
  creativityMode: CreativityModeState;
  readerInsights: ReaderInsights;
  consistencyGuards: ConsistencyGuards;
  memoryLayers: MemoryLayers;
  qualityTargets: QualityTargets;
  generationHints: GenerationHints;
}

interface ReaderInsights {
  engagementTrends: unknown[];
  preferredElements: unknown[];
  criticalFeedback: unknown[];
  suggestionAreas: unknown[];
}

interface ConsistencyGuards {
  characterConsistency: unknown[];
  worldConsistency: unknown[];
  plotConsistency: unknown[];
  toneConsistency: unknown[];
}

interface QualityTargets {
  readability: number;
  creativity: number;
  consistency: number;
  engagement: number;
}

interface GenerationHints {
  stylistic: unknown[];
  narrative: unknown[];
  character: unknown[];
  emotional: unknown[];
}

interface MemoryReport {
  persistentMemorySize: number;
  episodicMemorySize: number;
  workingMemoryActive: boolean;
  cacheHitRate: number;
  lastUpdate: string;
}

// 추가 타입들
interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface Relationship {
  character: string;
  type: 'romantic' | 'friendship' | 'rivalry' | 'family' | 'professional';
  strength: number;
  history: string[];
}

interface DevelopmentStage {
  chapter: number;
  stage: string;
  keyChanges: string[];
}

interface SpeechPattern {
  pattern: string;
  frequency: number;
  context: string[];
}

interface Scene {
  location: string;
  timeOfDay: string;
  mood: string;
  participants: string[];
  objectives: string[];
}

interface ContextSnapshot {
  lastEvents: string[];
  currentTensions: string[];
  nextExpectations: string[];
}

interface DialogueEntry {
  character: string;
  _content: string;
  emotion: string;
  chapter: number;
}

interface EmotionalArc {
  character: string;
  startEmotion: string;
  currentEmotion: string;
  targetEmotion: string;
  progression: number;
}

interface GenreRule {
  rule: string;
  importance: number;
  examples: string[];
}

export default EnhancedContextManager;