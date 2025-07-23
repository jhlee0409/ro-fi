/**
 * 도메인 엔티티 타입 정의
 */

// 소설 관련 타입
export interface Novel {
  readonly title: string;
  readonly slug: string;
  readonly author?: string;
  readonly status?: string;
  readonly publishedDate?: string;
  readonly totalChapters?: number;
  readonly rating?: number;
  readonly tropes?: string[];
  readonly summary?: string;
  readonly content?: string;
}

export interface NovelCharacters {
  readonly protagonist: Character;
  readonly male_lead: Character;
  readonly supporting?: Character[];
}

export interface Character {
  readonly name: string;
  readonly background: string;
  readonly personality: string;
  readonly archetype: string;
  readonly growthArc?: number; // 0-100 진행도
}

export interface Chapter {
  readonly title: string;
  readonly novel: string;
  readonly chapterNumber: number;
  readonly publicationDate: string;
  readonly wordCount: number;
  readonly rating: number;
  readonly content: string;
}

export interface NovelMetadata {
  readonly slug: string;
  readonly data: any;
  readonly filename: string;
}

export interface ChapterMetadata {
  readonly filename: string;
  readonly novel: string;
  readonly chapterNumber: number;
  readonly data: any;
}

export interface NovelProgress {
  readonly novel: NovelMetadata;
  readonly chaptersCount: number;
  readonly latestChapter: number;
  readonly progressPercentage: number;
  readonly lastUpdate: Date;
}

// 트로프 관련 타입
export interface Trope {
  readonly id: TropeId;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly category: TropeCategory;
  readonly compatibleTropes: TropeId[];
  readonly incompatibleTropes: TropeId[];
}

// 스토리 생성 관련 타입
export interface StoryConcept {
  readonly main: TropeId;
  readonly sub: TropeId;
  readonly conflict: ConflictType;
  readonly world: string;
  readonly mainConflict: string;
  readonly magicSystem: string;
  readonly genre: GenreType;
}

export interface EmotionalElements {
  readonly internalConflict: string;
  readonly microExpression: string;
  readonly sensoryDetail: string;
  readonly emotionStage: EmotionStage;
}

export interface CompletionAnalysis {
  readonly plotReadiness: number; // 0-100
  readonly characterDevelopment: number; // 0-100
  readonly relationshipProgress: number; // 0-100
  readonly worldBuilding: number; // 0-100
  readonly overallReadiness: boolean;
  readonly recommendation: string;
}

// 자동화 관련 타입
export interface AutomationResult {
  readonly success: boolean;
  readonly action: AutomationAction;
  readonly result?: any;
  readonly error?: string;
  readonly situation: AutomationSituation;
}

export interface AutomationSituation {
  readonly activeNovels: NovelProgress[];
  readonly totalActiveCount: number;
  readonly needsNewNovel: boolean;
  readonly readyForCompletion: NovelProgress[];
  readonly oldestUpdate: number;
}

// 열거형 타입들
export type NovelStatus = 'planning' | '연재 중' | '완결' | 'hiatus';

export type GenreType = 
  | '궁중 로맨스'
  | '아카데미 판타지'
  | '기사단 로맨스'
  | '마법사 학원'
  | '용족 판타지'
  | '신화 재해석'
  | '이세계 전생'
  | '회귀 복수극'
  | '계약 결혼';

export type TropeId =
  | 'enemies-to-lovers'
  | 'second-chance'
  | 'fake-relationship'
  | 'arranged-marriage'
  | 'bodyguard-romance'
  | 'master-servant'
  | 'rival-to-lover'
  | 'forbidden-love'
  | 'memory-loss'
  | 'time-loop'
  | 'power-struggle'
  | 'hidden-identity'
  | 'prophecy-bound'
  | 'transmigration'
  | 'regression'
  | 'parallel-world';

export type TropeCategory = 'relationship' | 'plot' | 'world' | 'character';

export type ConflictType =
  | 'political-intrigue'
  | 'ancient-curse'
  | 'dark-prophecy'
  | 'family-secrets'
  | 'war-brewing'
  | 'forbidden-power'
  | 'magical-awakening'
  | 'divine-intervention';

export type EmotionStage =
  | '첫 만남'
  | '적대적 긴장'
  | '호감의 시작'
  | '감정의 혼란'
  | '갈등과 오해'
  | '진실의 순간'

// 자동화 관련 타입
export type AutomationAction = 
  | 'CREATE_NEW_NOVEL'
  | 'CONTINUE_CHAPTER'
  | 'COMPLETE_NOVEL'
  | 'NO_ACTION';

export interface AutomationSituation {
  readonly activeNovels: NovelProgress[];
  readonly totalActiveCount: number;
  readonly needsNewNovel: boolean;
  readonly readyForCompletion: NovelProgress[];
  readonly oldestUpdate: number;
}

export interface AutomationResult {
  readonly success: boolean;
  readonly action: AutomationAction;
  readonly result: any;
  readonly situation: AutomationSituation;
}

export interface GenerationOptions {
  readonly dryRun?: boolean;
  readonly quality?: 'draft' | 'standard' | 'premium';
  readonly style?: 'romantic' | 'dramatic' | 'comedic';
}

// 저장소 관련 타입
export interface FileMetadata {
  readonly path: string;
  readonly size: number;
  readonly created: Date;
  readonly modified: Date;
  readonly isDirectory: boolean;
}

export interface ChapterGenerationContext {
  readonly novel: Novel;
  readonly chapterNumber: number;
  readonly previousChapters: Chapter[];
  readonly targetEmotionStage: EmotionStage;
  readonly storyArc: StoryConcept;
}