/**
 * 스토리 연속성 관리를 위한 타입 정의
 * 
 * 참고: 연구결과.md와 연속성_관리.md 기반으로 현재 프로젝트에 맞게 설계
 */

// 캐릭터 프로필 정의
export interface CharacterProfile {
  name: string;
  description: string;
  abilities: string[];
  personality: string[];
  appearance: {
    hair?: string;
    eyes?: string;
    build?: string;
    distinctive?: string[];
  };
  background: {
    title?: string;
    origin?: string;
    trauma?: string;
    reputation?: string;
  };
  relationships: Map<string, string>;
  currentState: {
    location: string;
    emotionalState: string;
    powerLevel: number;
    health: string;
    motivations: string[];
  };
  characterArc: string;
}

// 세계관 설정
export interface WorldBuilding {
  magicSystem: {
    name: string;
    source: string;
    types: Record<string, { power: string; cost: string }>;
    limitations: string[];
    socialImpact: string;
  };
  geography: {
    locations: Map<string, LocationState>;
    regions: string[];
    politicalStructure: Record<string, any>;
  };
  socialHierarchy: {
    classes: string[];
    powerStructure: Record<string, any>;
    culturalRules: string[];
  };
  rules: string[]; // 불변 세계관 규칙들
}

// 위치 상태
export interface LocationState {
  name: string;
  description: string;
  currentCondition: string;
  significance: string;
  connectedLocations: string[];
}

// 플롯 진행 상태
export interface PlotProgress {
  mainArc: {
    current: string;
    completed: string[];
    upcoming: string[];
    climaxReached: boolean;
  };
  subplots: Array<{
    id: string;
    description: string;
    status: 'active' | 'resolved' | 'dormant';
    relatedCharacters: string[];
  }>;
  foreshadowing: Array<{
    id: string;
    content: string;
    planted: number; // 챕터 번호
    resolved: boolean;
    resolutionChapter?: number;
  }>;
  checkovGuns: Array<{
    id: string;
    item: string;
    introduced: number;
    fired: boolean;
    fireChapter?: number;
  }>;
}

// 챕터 상태
export interface ChapterState {
  chapterNumber: number;
  title: string;
  summary: string;
  keyEvents: string[];
  characterStates: Map<string, Partial<CharacterProfile['currentState']>>;
  newCharacters: string[];
  locationChanges: Map<string, LocationState>;
  emotionalTone: string;
  endingEmotionalState: string;
  cliffhanger?: string;
  plotProgression: {
    mainArcProgress: string;
    subplotChanges: string[];
    foreshadowingPlanted: string[];
    foreshadowingResolved: string[];
  };
  wordCount: number;
  contentRating: string;
  publishedDate: Date;
}

// 연속성 체크포인트
export interface ContinuityCheckpoint {
  timeline: Array<{
    chapterNumber: number;
    event: string;
    timestamp: string;
    participants: string[];
    significance: 'low' | 'medium' | 'high' | 'critical';
  }>;
  characterStates: Map<string, CharacterProfile>;
  locationStates: Map<string, LocationState>;
  activePromises: Array<{
    id: string;
    promiser: string;
    promisee: string;
    content: string;
    chapterMade: number;
    fulfilled: boolean;
    fulfillmentChapter?: number;
  }>;
  establishedFacts: Array<{
    fact: string;
    chapterEstablished: number;
    contradicted: boolean;
    contradictionChapter?: number;
  }>;
}

// 전체 스토리 상태
export interface StoryState {
  metadata: {
    novelSlug: string;
    title: string;
    author: string;
    genre: string;
    tropes: string[];
    currentChapter: number;
    totalChapters: number;
    status: 'ongoing' | 'completed' | 'hiatus';
    lastUpdated: Date;
    createdDate: Date;
  };
  
  // 불변 정보 (전체 연재 동안 유지)
  worldbuilding: WorldBuilding;
  
  // 캐릭터 진화 추적
  characters: {
    main: Map<string, CharacterProfile>;
    supporting: Map<string, CharacterProfile>;
    minor: Map<string, CharacterProfile>;
  };
  
  // 플롯 진행 상태
  plotProgress: PlotProgress;
  
  // 챕터별 정보
  chapters: Map<number, ChapterState>;
  
  // 연속성 체크포인트
  continuity: ContinuityCheckpoint;
  
  // 생성 설정
  generationConfig: {
    targetWordCount: number;
    emotionalIntensity: 'low' | 'medium' | 'high';
    pacingStyle: 'slow' | 'medium' | 'fast';
    romanceHeatLevel: number; // 1-5
    preferredTropes: string[];
    avoidedElements: string[];
  };
  
  // 독자 피드백 컨텍스트
  readerFeedbackContext?: {
    favoriteCharacters: string[];
    desiredPlotDirection: string[];
    pacingPreference: string;
    overallSentiment: number; // -1 to 1
  };
}

// 검증 결과
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  confidence: number; // 0-1
  aspectScores: {
    characterConsistency: number;
    worldConsistency: number;
    plotConsistency: number;
    emotionalFlow: number;
    timelineConsistency: number;
  };
}

export interface ValidationError {
  type: 'CHARACTER_NAME_CHANGED' | 'ABILITY_INCONSISTENCY' | 'WORLD_RULE_VIOLATION' | 
        'TIMELINE_CONTRADICTION' | 'EMOTIONAL_DISCONTINUITY' | 'PLOT_HOLE';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  chapterNumber: number;
  suggestedFix?: string;
  context: any;
}

export interface ValidationWarning {
  type: 'MINOR_INCONSISTENCY' | 'PACING_ISSUE' | 'CHARACTER_OOC' | 'FORESHADOWING_DELAY';
  description: string;
  chapterNumber: number;
  recommendation?: string;
}

// 생성 컨텍스트
export interface GenerationContext {
  essential: {
    novelTitle: string;
    mainCharacters: Map<string, CharacterProfile>;
    worldRules: string[];
    magicSystem: WorldBuilding['magicSystem'];
    currentArc: string;
    tropes: string[];
  };
  immediate: {
    previousChapter?: ChapterState;
    activeConflicts: string[];
    characterCurrentStates: Map<string, CharacterProfile['currentState']>;
    locationCurrentStates: Map<string, LocationState>;
    unresolvedCliffhanger?: string;
  };
  recent: {
    last5Chapters: ChapterState[];
    keyPlotPoints: Array<{
      event: string;
      chapter: number;
      impact: string;
    }>;
    recentDialogues: Array<{
      character: string;
      dialogue: string;
      chapter: number;
      context: string;
    }>;
  };
  optional: {
    minorCharacters: Map<string, CharacterProfile>;
    historicalEvents: Array<{
      event: string;
      chapter: number;
      significance: string;
    }>;
    environmentalDetails: Map<string, LocationState>;
  };
  tokenCount: number;
  compressionLevel: 'none' | 'light' | 'medium' | 'heavy';
}

// 수정 제안
export interface FixSuggestion {
  type: 'character_merge' | 'ability_integration' | 'plot_bridge' | 'timeline_adjust';
  description: string;
  targetChapters: number[];
  changes: Array<{
    file: string;
    oldContent: string;
    newContent: string;
    reason: string;
  }>;
  confidence: number;
}

// 스토리 생성 결과
export interface GenerationResult {
  chapter: ChapterState;
  metadata: {
    generationTime: number;
    tokensUsed: number;
    validationPassed: boolean;
    attempts: number;
  };
  context: GenerationContext;
  validationResult: ValidationResult;
}