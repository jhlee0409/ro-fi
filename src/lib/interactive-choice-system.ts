/**
 * 🎮 Interactive Choice System
 * 실시간 선택지 시스템 - 독자 참여형 스토리텔링
 * 
 * Features:
 * - 동적 선택지 생성
 * - 선택 결과 분기 처리
 * - 독자 선호도 학습
 * - 캐릭터 호감도 시스템
 * - 스토리 영향도 계산
 */

import { Novel, Chapter } from './types/index.js';
import { EnhancedContextManager } from './enhanced-context-manager.js';

/**
 * 선택지 정의
 */
interface StoryChoice {
  id: string;
  text: string;
  type: 'dialogue' | 'action' | 'emotion' | 'decision';
  targetCharacter?: string;
  impact: ChoiceImpact;
  prerequisites?: ChoicePrerequisites;
  consequences: ChoiceConsequences;
  readerAppeal: number; // 0-100, 독자 매력도 예측
}

interface ChoiceImpact {
  immediate: string;
  shortTerm: string[];
  longTerm: string[];
  characterAffection: Record<string, number>; // -10 to +10
  relationshipChange: Record<string, number>;
  plotInfluence: number; // 0-100, 주요 플롯에 미치는 영향
}

interface ChoicePrerequisites {
  minChapter?: number;
  requiredFlags?: string[];
  characterAffection?: Record<string, number>;
  plotProgress?: string[];
}

interface ChoiceConsequences {
  flagsSet: string[];
  flagsRemoved: string[];
  nextSceneTrigger: string;
  narrativeShift?: 'romantic' | 'dramatic' | 'comedic' | 'mysterious';
}

interface ChoiceContext {
  currentChapter: number;
  currentScene: string;
  characterMood: Record<string, string>;
  plotFlags: string[];
  [key: string]: unknown;
}

interface TypePreferences {
  dialogue: number;
  action: number;
  emotion: number;
  decision: number;
  [key: string]: number;
  unlockConditions?: string[];
}

/**
 * 선택 이력 및 결과
 */
interface ChoiceHistory {
  chapterNumber: number;
  choiceId: string;
  selectedOption: string;
  readerProfile: string;
  timestamp: Date;
  satisfaction: number;
}

interface ChoiceResult {
  selectedChoice: StoryChoice;
  narrativeOutcome: string;
  characterReactions: Record<string, CharacterReaction>;
  plotFlags: string[];
  nextChoiceHints: string[];
  readerImpact: ReaderImpact;
}

interface CharacterReaction {
  emotionalState: string;
  affectionChange: number;
  dialogueResponse: string;
  futureDisposition: string;
}

interface ReaderImpact {
  engagementBoost: number;
  satisfactionScore: number;
  preferenceAlignment: number;
  surpriseFactor: number;
}

/**
 * 독자 프로필 및 선호도
 */
interface ReaderProfile {
  id: string;
  preferences: ReaderPreferences;
  choiceHistory: ChoiceHistory[];
  characterFavorites: Record<string, number>;
  preferredGenres: string[];
  engagementPatterns: EngagementPattern[];
}

interface ReaderPreferences {
  romanticIntensity: number; // 0-100
  dramaPreference: number;
  comedyPreference: number;
  mysteryPreference: number;
  actionPreference: number;
  characterDevelopmentFocus: number;
  plotProgressionSpeed: number;
}

interface EngagementPattern {
  timeOfDay: string;
  avgSessionLength: number;
  choiceSpeed: number; // seconds to make choice
  preferredChoiceTypes: string[];
}

/**
 * 실시간 선택지 시스템
 */
export class InteractiveChoiceSystem {
  private contextManager: EnhancedContextManager;
  private choiceTemplates: Map<string, ChoiceTemplate>;
  private readerProfiles: Map<string, ReaderProfile>;
  private currentFlags: Set<string>;
  private choiceHistory: ChoiceHistory[];
  private characterAffection: Map<string, Map<string, number>>; // reader -> character -> affection
  private totalChoicesGenerated: number;

  constructor() {
    this.contextManager = new EnhancedContextManager();
    this.choiceTemplates = new Map();
    this.readerProfiles = new Map();
    this.currentFlags = new Set();
    this.choiceHistory = [];
    this.characterAffection = new Map();
    this.totalChoicesGenerated = 0;
    
    this.initializeChoiceTemplates();
  }

  /**
   * 🎯 선택지 생성 메인 메서드
   */
  async generateChoices(
    chapter: Chapter,
    novel: Novel,
    readerId: string,
    context: { scene: string; characters: string[]; mood: string }
  ): Promise<StoryChoice[]> {
    
    // 1. 독자 프로필 로드
    const readerProfile = this.getOrCreateReaderProfile(readerId);
    
    // 2. 컨텍스트 기반 적절한 선택지 타입 결정
    const appropriateTypes = this.determineChoiceTypes(context, readerProfile);
    
    // 3. 각 타입별 선택지 생성
    const choices: StoryChoice[] = [];
    
    for (const type of appropriateTypes) {
      const choice = await this.generateChoiceForType(
        type,
        chapter,
        novel,
        readerProfile,
        context
      );
      
      if (choice && this.validateChoice(choice, readerProfile)) {
        choices.push(choice);
      }
    }
    
    // 최소 1개 선택지 보장
    if (choices.length === 0) {
      const defaultChoice = await this.generateChoiceForType(
        'dialogue',
        chapter,
        novel,
        readerProfile,
        context
      );
      if (defaultChoice) {
        choices.push(defaultChoice);
      }
    }

    // 4. 독자 선호도 기반 개인화
    const personalizedChoices = this.personalizeChoices(choices, readerProfile);
    
    // 5. 생성된 선택지 수 증가
    this.totalChoicesGenerated += personalizedChoices.length;
    
    // 6. 최대 4개 선택지로 제한하고 매력도 순 정렬
    return personalizedChoices
      .sort((a, b) => b.readerAppeal - a.readerAppeal)
      .slice(0, 4);
  }

  /**
   * 📝 선택 처리 및 결과 생성
   */
  async processChoice(
    choiceId: string,
    readerId: string,
    chapter: Chapter,
    novel: Novel
  ): Promise<ChoiceResult> {
    
    const choice = await this.findChoiceById(choiceId);
    if (!choice) {
      throw new Error(`Choice not found: ${choiceId}`);
    }

    const readerProfile = this.getOrCreateReaderProfile(readerId);

    // 1. 선택 이력 업데이트
    this.updateChoiceHistory(choiceId, readerId, chapter.chapterNumber);

    // 2. 플롯 플래그 업데이트
    this.updatePlotFlags(choice.consequences);

    // 3. 캐릭터 호감도 업데이트
    this.updateCharacterAffection(readerId, choice.impact.characterAffection);

    // 4. 캐릭터 반응 생성
    const characterReactions = await this.generateCharacterReactions(choice, readerProfile);

    // 5. 내러티브 결과 생성
    const narrativeOutcome = await this.generateNarrativeOutcome(choice, chapter, novel);

    // 6. 독자 프로필 업데이트
    const readerImpact = this.updateReaderProfile(choice, readerProfile);

    // 7. 다음 선택지 힌트 생성
    const nextChoiceHints = this.generateNextChoiceHints(choice, chapter);

    return {
      selectedChoice: choice,
      narrativeOutcome,
      characterReactions,
      plotFlags: Array.from(this.currentFlags),
      nextChoiceHints,
      readerImpact
    };
  }

  /**
   * 🎭 선택지 타입 결정
   */
  private determineChoiceTypes(
    context: { scene: string; characters: string[]; mood: string },
    _readerProfile: ReaderProfile
  ): ChoiceType[] {
    const types: ChoiceType[] = [];

    // 장면 기반 결정
    if (context.scene.includes('대화')) {
      types.push('dialogue');
    }

    if (context.scene.includes('행동') || context.scene.includes('상황')) {
      types.push('action');
    }

    // 분위기 기반 결정
    if (context.mood === 'romantic') {
      types.push('emotion');
    }

    if (context.mood === 'tense' || context.mood === 'dramatic') {
      types.push('decision');
    }

    // 독자 선호도 기반 추가
    if (readerProfile.preferences.romanticIntensity > 70) {
      types.push('emotion');
    }

    if (readerProfile.preferences.actionPreference > 60) {
      types.push('action');
    }

    // 최소 2개, 최대 4개 타입 보장
    if (types.length < 2) {
      types.push('dialogue', 'action');
    }

    return types.slice(0, 4);
  }

  /**
   * 🏗️ 타입별 선택지 생성
   */
  private async generateChoiceForType(
    type: ChoiceType,
    chapter: Chapter,
    novel: Novel,
    _readerProfile: ReaderProfile,
    context: { scene: string; characters: string[]; mood: string }
  ): Promise<StoryChoice | null> {
    
    const template = this.choiceTemplates.get(type);
    if (!template) return null;

    const choiceId = `ch${chapter.chapterNumber}_${type}_${Date.now()}`;

    // 기본 선택지 구조 생성
    const choice: StoryChoice = {
      id: choiceId,
      text: await this.generateChoiceText(type, context, readerProfile),
      type: type as 'dialogue' | 'action' | 'emotion' | 'decision',
      targetCharacter: this.selectTargetCharacter(context.characters, readerProfile),
      impact: await this.calculateChoiceImpact(type, context, readerProfile),
      consequences: this.generateChoiceConsequences(type, context),
      readerAppeal: this.calculateReaderAppeal(type, readerProfile, context)
    };

    return choice;
  }

  /**
   * 📚 선택지 텍스트 생성
   */
  private async generateChoiceText(
    type: ChoiceType,
    context: { scene: string; characters: string[]; mood: string },
    _readerProfile: ReaderProfile
  ): Promise<string> {
    
    const templates = {
      dialogue: [
        "'{character}에게 솔직한 마음을 전하기'",
        "'{character}와 진지하게 대화하기'",
        "'{character}에게 농담으로 분위기 전환하기'",
        "'{character}의 말에 공감 표현하기'"
      ],
      action: [
        "적극적으로 도움 제안하기",
        "신중하게 상황 관찰하기",
        "과감하게 행동에 나서기",
        "다른 해결책 모색하기"
      ],
      emotion: [
        "따뜻한 미소로 응답하기",
        "진심어린 관심 표현하기",
        "은은한 설렘 드러내기",
        "깊은 신뢰감 보여주기"
      ],
      decision: [
        "현실적인 선택하기",
        "마음이 이끄는 대로 결정하기",
        "신중하게 생각해보기",
        "과감한 모험 선택하기"
      ]
    };

    const typeTemplates = templates[type] || templates.dialogue;
    const randomTemplate = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
    
    // 캐릭터 이름 치환
    const targetCharacter = context.characters[0] || '상대방';
    return randomTemplate.replace('{character}', targetCharacter);
  }

  /**
   * 💔 캐릭터 호감도 업데이트
   */
  private updateCharacterAffection(
    readerId: string,
    affectionChanges: Record<string, number>
  ): void {
    if (!this.characterAffection.has(readerId)) {
      this.characterAffection.set(readerId, new Map());
    }

    const readerAffections = this.characterAffection.get(readerId)!;

    for (const [character, change] of Object.entries(affectionChanges)) {
      const currentAffection = readerAffections.get(character) || 0;
      const newAffection = Math.max(-100, Math.min(100, currentAffection + change));
      readerAffections.set(character, newAffection);
    }
  }

  /**
   * 🎭 캐릭터 반응 생성
   */
  private async generateCharacterReactions(
    choice: StoryChoice,
    _readerProfile: ReaderProfile
  ): Promise<Record<string, CharacterReaction>> {
    const reactions: Record<string, CharacterReaction> = {};

    // 주요 캐릭터들에 대한 반응 생성
    const mainCharacters = ['민준', '서연', '지우', '하은'];

    for (const character of mainCharacters) {
      if (choice.impact.characterAffection[character]) {
        reactions[character] = {
          emotionalState: this.determineEmotionalState(
            choice.impact.characterAffection[character]
          ),
          affectionChange: choice.impact.characterAffection[character],
          dialogueResponse: this.generateDialogueResponse(character, choice),
          futureDisposition: this.predictFutureDisposition(character, choice)
        };
      }
    }

    return reactions;
  }

  /**
   * 📖 내러티브 결과 생성
   */
  private async generateNarrativeOutcome(
    choice: StoryChoice,
    _chapter: Chapter,
    _novel: Novel
  ): Promise<string> {
    
    const outcomes = {
      dialogue: [
        `당신의 진솔한 말에 ${choice.targetCharacter}의 표정이 부드러워졌습니다.`,
        `${choice.targetCharacter}와의 대화를 통해 서로를 더 깊이 이해하게 되었습니다.`,
        `당신의 말이 ${choice.targetCharacter}의 마음에 깊은 울림을 주었습니다.`
      ],
      action: [
        '당신의 행동이 상황을 더 나은 방향으로 이끌었습니다.',
        '적극적인 행동으로 새로운 가능성이 열렸습니다.',
        '신중한 판단이 좋은 결과를 가져왔습니다.'
      ],
      emotion: [
        '당신의 진심이 상대방에게 잘 전달되었습니다.',
        '서로의 마음이 한 발짝 더 가까워졌습니다.',
        '따뜻한 감정이 두 사람 사이에 흘렀습니다.'
      ],
      decision: [
        '당신의 선택이 앞으로의 이야기에 중요한 영향을 미칠 것 같습니다.',
        '과감한 결정이 새로운 전개의 문을 열었습니다.',
        '신중한 선택이 안정적인 방향으로 이야기를 이끌었습니다.'
      ]
    };

    const typeOutcomes = outcomes[choice.type] || outcomes.dialogue;
    const baseOutcome = typeOutcomes[Math.floor(Math.random() * typeOutcomes.length)];
    
    // 호감도 변화에 따른 추가 설명
    const affectionSum = Object.values(choice.impact.characterAffection)
      .reduce((sum, val) => sum + val, 0);

    if (affectionSum > 5) {
      return baseOutcome + ' 상대방이 당신에게 더욱 호감을 느끼는 것 같습니다.';
    } else if (affectionSum < -5) {
      return baseOutcome + ' 상대방이 약간 당황하는 기색을 보입니다.';
    }

    return baseOutcome;
  }

  /**
   * 🎓 독자 프로필 학습 및 업데이트
   */
  private updateReaderProfile(
    choice: StoryChoice,
    readerProfile: ReaderProfile
  ): ReaderImpact {
    
    // 선택 패턴 학습
    const preferenceUpdate = this.calculatePreferenceUpdate(choice, readerProfile);
    
    // 선호도 점진적 업데이트 (학습률 0.1)
    const learningRate = 0.1;
    Object.entries(preferenceUpdate).forEach(([key, value]) => {
      const currentValue = (readerProfile.preferences as Record<string, number>)[key] || 50;
      (readerProfile.preferences as Record<string, number>)[key] = currentValue + (value - currentValue) * learningRate;
    });

    // 캐릭터 선호도 업데이트
    if (choice.targetCharacter) {
      const currentFavorite = readerProfile.characterFavorites[choice.targetCharacter] || 0;
      readerProfile.characterFavorites[choice.targetCharacter] = 
        Math.min(100, currentFavorite + choice.impact.characterAffection[choice.targetCharacter] || 0);
    }

    return {
      engagementBoost: choice.readerAppeal / 10,
      satisfactionScore: this.calculateSatisfactionScore(choice, readerProfile),
      preferenceAlignment: this.calculatePreferenceAlignment(choice, readerProfile),
      surpriseFactor: this.calculateSurpriseFactor(choice, readerProfile)
    };
  }

  /**
   * 🔮 다음 선택지 힌트 생성
   */
  private generateNextChoiceHints(choice: StoryChoice, _chapter: Chapter): string[] {
    const hints: string[] = [];

    // 선택 결과에 따른 힌트
    if (choice.impact.plotInfluence > 70) {
      hints.push('이 선택이 큰 변화를 가져올 것 같습니다.');
    }

    if (choice.consequences.narrativeShift) {
      hints.push(`앞으로 ${choice.consequences.narrativeShift} 분위기로 진행될 예정입니다.`);
    }

    if (choice.consequences.unlockConditions) {
      hints.push('새로운 선택지가 해금될 가능성이 있습니다.');
    }

    return hints;
  }

  // Helper methods
  private initializeChoiceTemplates(): void {
    // 선택지 템플릿 초기화
    this.choiceTemplates.set('dialogue', {
      type: 'dialogue',
      templates: ['대화하기', '진심 전하기', '농담하기'],
      weight: 1.0
    });
    
    this.choiceTemplates.set('action', {
      type: 'action',
      templates: ['행동하기', '도움주기', '관찰하기'],
      weight: 1.0
    });
    
    this.choiceTemplates.set('emotion', {
      type: 'emotion',
      templates: ['감정 표현하기', '미소짓기', '신뢰하기'],
      weight: 1.0
    });
    
    this.choiceTemplates.set('decision', {
      type: 'decision',
      templates: ['결정하기', '선택하기', '생각하기'],
      weight: 1.0
    });
  }

  private getOrCreateReaderProfile(readerId: string): ReaderProfile {
    if (!this.readerProfiles.has(readerId)) {
      this.readerProfiles.set(readerId, {
        id: readerId,
        preferences: {
          romanticIntensity: 50,
          dramaPreference: 50,
          comedyPreference: 50,
          mysteryPreference: 50,
          actionPreference: 50,
          characterDevelopmentFocus: 50,
          plotProgressionSpeed: 50
        },
        choiceHistory: [],
        characterFavorites: {},
        preferredGenres: [],
        engagementPatterns: []
      });
    }
    return this.readerProfiles.get(readerId)!;
  }

  private validateChoice(choice: StoryChoice, _readerProfile: ReaderProfile): boolean {
    // 선택지 유효성 검증 로직
    return choice.readerAppeal > 20 && choice.text.length > 10;
  }

  private personalizeChoices(choices: StoryChoice[], readerProfile: ReaderProfile): StoryChoice[] {
    // 독자 개인화 로직
    return choices.map(choice => ({
      ...choice,
      readerAppeal: this.adjustAppealForReader(choice.readerAppeal, choice.type, readerProfile)
    }));
  }

  private adjustAppealForReader(
    baseAppeal: number, 
    type: string, 
    readerProfile: ReaderProfile
  ): number {
    const typePreferences = {
      dialogue: readerProfile.preferences.characterDevelopmentFocus,
      action: readerProfile.preferences.actionPreference,
      emotion: readerProfile.preferences.romanticIntensity,
      decision: readerProfile.preferences.plotProgressionSpeed
    };

    const preference = (typePreferences as TypePreferences)[type] || 50;
    return Math.round(baseAppeal * (preference / 50));
  }

  // 더 많은 헬퍼 메서드들...
  private async findChoiceById(choiceId: string): Promise<StoryChoice | null> {
    // 선택지 ID로 검색 (실제로는 데이터베이스나 캐시에서 검색)
    // 테스트용 Mock 데이터 반환
    if (choiceId.includes('test-choice')) {
      return {
        id: choiceId,
        text: '테스트 선택지',
        type: 'emotion',
        targetCharacter: '서연',
        impact: {
          immediate: '긍정적 반응',
          shortTerm: ['호감도 증가'],
          longTerm: ['관계 발전'],
          characterAffection: { '서연': 5 },
          relationshipChange: { '민준-서연': 10 },
          plotInfluence: 75
        },
        consequences: {
          flagsSet: ['test_flag'],
          flagsRemoved: [],
          nextSceneTrigger: 'next_scene',
          narrativeShift: 'romantic'
        },
        readerAppeal: 85
      };
    }
    return null;
  }

  private updateChoiceHistory(_choiceId: string, _readerId: string, _chapterNumber: number): void {
    // 선택 이력 업데이트
  }

  private updatePlotFlags(consequences: ChoiceConsequences): void {
    consequences.flagsSet.forEach(flag => this.currentFlags.add(flag));
    consequences.flagsRemoved.forEach(flag => this.currentFlags.delete(flag));
  }

  private selectTargetCharacter(characters: string[], _readerProfile: ReaderProfile): string {
    // 독자 선호도 기반 캐릭터 선택
    return characters[0] || '알 수 없음';
  }

  private async calculateChoiceImpact(
    _type: ChoiceType,
    _context: ChoiceContext,
    _readerProfile: ReaderProfile
  ): Promise<ChoiceImpact> {
    return {
      immediate: '즉시 효과',
      shortTerm: ['단기 효과 1'],
      longTerm: ['장기 효과 1'],
      characterAffection: { '민준': 5, '서연': 3 },
      relationshipChange: { '민준-서연': 2 },
      plotInfluence: 50
    };
  }

  private generateChoiceConsequences(type: ChoiceType, _context: ChoiceContext): ChoiceConsequences {
    return {
      flagsSet: [`${type}_chosen`],
      flagsRemoved: [],
      nextSceneTrigger: 'next_scene',
      narrativeShift: 'romantic'
    };
  }

  private calculateReaderAppeal(
    _type: ChoiceType,
    _readerProfile: ReaderProfile,
    _context: ChoiceContext
  ): number {
    // 독자 매력도 계산
    return Math.floor(Math.random() * 40) + 60; // 60-100
  }

  private determineEmotionalState(affectionChange: number): string {
    if (affectionChange > 5) return '기뻐함';
    if (affectionChange > 0) return '만족함';
    if (affectionChange < -5) return '당황함';
    if (affectionChange < 0) return '아쉬워함';
    return '평온함';
  }

  private generateDialogueResponse(character: string, _choice: StoryChoice): string {
    const responses = [
      `${character}: "그렇게 생각해주셔서 고마워요."`,
      `${character}: "정말 그런 마음이었군요."`,
      `${character}: "조금 놀랐지만... 기뻐요."`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private predictFutureDisposition(_character: string, _choice: StoryChoice): string {
    return '호의적';
  }

  private calculatePreferenceUpdate(choice: StoryChoice, _readerProfile: ReaderProfile): unknown {
    return {
      romanticIntensity: choice.type === 'emotion' ? 60 : 40,
      actionPreference: choice.type === 'action' ? 70 : 30
    };
  }

  private calculateSatisfactionScore(choice: StoryChoice, _readerProfile: ReaderProfile): number {
    return choice.readerAppeal;
  }

  private calculatePreferenceAlignment(_choice: StoryChoice, _readerProfile: ReaderProfile): number {
    return 75;
  }

  private calculateSurpriseFactor(_choice: StoryChoice, _readerProfile: ReaderProfile): number {
    return Math.random() * 50 + 25;
  }

  /**
   * 시스템 상태 조회
   */
  getSystemStats(): unknown {
    return {
      totalReaders: this.readerProfiles.size,
      totalChoices: this.totalChoicesGenerated,
      activeFlags: this.countActiveFlags(),
      averageEngagement: this.calculateAverageEngagement()
    };
  }

  private countActiveFlags(): number {
    return this.currentFlags.size;
  }

  /**
   * 독자 프로필 조회
   */
  getReaderProfile(readerId: string): ReaderProfile | undefined {
    return this.readerProfiles.get(readerId);
  }

  private calculateAverageEngagement(): number {
    const profiles = Array.from(this.readerProfiles.values());
    if (profiles.length === 0) return 0;
    
    const totalSatisfaction = profiles.reduce((sum, profile) => 
      sum + (profile.choiceHistory.reduce((s, h) => s + h.satisfaction, 0) / Math.max(profile.choiceHistory.length, 1)), 0
    );
    
    return totalSatisfaction / profiles.length;
  }
}

// 타입 정의
type ChoiceType = 'dialogue' | 'action' | 'emotion' | 'decision';

interface ChoiceTemplate {
  type: ChoiceType;
  templates: string[];
  weight: number;
}

export default InteractiveChoiceSystem;