/**
 * 👗 Character Appearance Customization System
 * 캐릭터 외모 및 스타일 커스터마이징 시스템
 * 
 * Features:
 * - 독자 선호도 기반 외모 조정
 * - 상황별 의상 및 스타일 변경
 * - 감정 상태에 따른 외모 표현 변화
 * - 계절 및 이벤트 기반 테마 적용
 * - AI 기반 외모 설명 생성
 */

import { Novel, Chapter } from './types/index.js';
import { CharacterCustomizationEngine } from './character-customization-engine.js';

/**
 * 외모 프로필 정의
 */
interface AppearanceProfile {
  characterId: string;
  baseAppearance: BaseAppearance;
  currentAppearance: CurrentAppearance;
  stylePreferences: StylePreferences;
  situationalVariations: Map<string, AppearanceVariation>;
  customizationHistory: AppearanceChange[];
  readerPreferences: ReaderAppearancePrefs;
}

interface BaseAppearance {
  // 기본 신체 특징
  physicalTraits: PhysicalTraits;
  facialFeatures: FacialFeatures;
  hairStyle: HairStyle;
  bodyType: BodyType;
  height: HeightCategory;
  skinTone: SkinTone;
  distinctiveFeatures: string[];
}

interface PhysicalTraits {
  eyeColor: EyeColor;
  eyeShape: EyeShape;
  eyebrowStyle: EyebrowStyle;
  noseShape: NoseShape;
  lipShape: LipShape;
  faceShape: FaceShape;
  bodyBuild: BodyBuild;
}

interface FacialFeatures {
  expressiveness: number; // 0-100, 표정 풍부함
  symmetry: number;       // 0-100, 대칭성
  softness: number;       // 0-100, 부드러움
  maturity: number;       // 0-100, 성숙함
  uniqueness: number;     // 0-100, 독특함
}

interface HairStyle {
  color: HairColor;
  length: HairLength;
  texture: HairTexture;
  style: HairStyleType;
  volume: number;         // 0-100
  shine: number;          // 0-100
  naturalness: number;    // 0-100
}

interface BodyType {
  build: BodyBuild;
  proportions: BodyProportions;
  posture: PostureType;
  grace: number;          // 0-100, 우아함
  athleticism: number;    // 0-100, 운동능력
}

/**
 * 현재 외모 상태
 */
interface CurrentAppearance {
  outfit: OutfitDescription;
  makeup: MakeupStyle;
  accessories: Accessory[];
  mood: MoodExpression;
  temporaryChanges: TemporaryChange[];
  magicalEffects?: MagicalEffect[];
}

interface OutfitDescription {
  category: OutfitCategory;
  style: ClothingStyle;
  colors: ColorPalette;
  materials: string[];
  formality: number;      // 0-100
  comfort: number;        // 0-100
  attractiveness: number; // 0-100
  uniqueness: number;     // 0-100
  description: string;
}

interface MakeupStyle {
  intensity: number;      // 0-100
  style: MakeupStyleType;
  eyeMakeup: EyeMakeupStyle;
  lipColor: LipColorType;
  blush: BlushStyle;
  naturalness: number;    // 0-100
}

interface Accessory {
  type: AccessoryType;
  description: string;
  significance: 'decorative' | 'sentimental' | 'magical' | 'practical';
  visibility: number;     // 0-100
}

interface MoodExpression {
  primaryEmotion: EmotionType;
  intensity: number;      // 0-100
  facialExpression: string;
  bodyLanguage: string;
  eyeExpression: string;
  overallAura: string;
}

/**
 * 외모 변형 및 커스터마이징
 */
interface AppearanceVariation {
  situationType: SituationType;
  changes: Partial<CurrentAppearance>;
  description: string;
  readerRating: number;   // 0-100
  usageFrequency: number; // 0-100
}

interface AppearanceChange {
  chapterNumber: number;
  timestamp: Date;
  changeType: ChangeType;
  beforeState: Partial<CurrentAppearance>;
  afterState: Partial<CurrentAppearance>;
  reason: string;
  readerFeedback?: number;
  visualDescription: string;
}

interface StylePreferences {
  preferredColors: string[];
  preferredStyles: ClothingStyle[];
  comfortLevel: number;   // 0-100
  fashionSense: number;   // 0-100
  experimentalness: number; // 0-100
  formalityPreference: number; // 0-100
}

interface ReaderAppearancePrefs {
  preferredOutfitTypes: OutfitCategory[];
  likedHairStyles: HairStyleType[];
  favoriteColors: string[];
  makeupPreference: MakeupStyleType;
  accessoryPreference: AccessoryType[];
  overallRating: number; // 0-100
}

/**
 * 외모 생성 및 관리 시스템
 */
export class CharacterAppearanceSystem {
  private appearanceProfiles: Map<string, AppearanceProfile>;
  private situationalPresets: Map<string, AppearanceVariation>;
  private seasonalThemes: Map<string, SeasonalTheme>;
  private customizationEngine: CharacterCustomizationEngine;
  private descriptionTemplates: Map<string, DescriptionTemplate>;

  constructor() {
    this.appearanceProfiles = new Map();
    this.situationalPresets = new Map();
    this.seasonalThemes = new Map();
    this.customizationEngine = new CharacterCustomizationEngine();
    this.descriptionTemplates = new Map();
    
    this.initializeDefaultAppearances();
    this.initializeSituationalPresets();
    this.initializeSeasonalThemes();
    this.initializeDescriptionTemplates();
  }

  /**
   * 🎨 메인 외모 커스터마이징 메서드
   */
  async customizeAppearanceForScene(
    characterName: string,
    chapter: Chapter,
    novel: Novel,
    sceneContext: SceneContext,
    readerPreferences: ReaderAppearancePrefs
  ): Promise<AppearanceCustomizationResult> {
    
    const profile = this.appearanceProfiles.get(characterName);
    if (!profile) {
      throw new Error(`Appearance profile not found for: ${characterName}`);
    }

    // 1. 상황 분석
    const situationAnalysis = this.analyzeSceneRequirements(sceneContext, chapter);
    
    // 2. 독자 선호도 분석
    const preferenceAnalysis = this.analyzeReaderPreferences(readerPreferences, profile);
    
    // 3. 성격 기반 스타일 매칭
    const personalityStyle = await this.matchPersonalityToStyle(characterName, chapter);
    
    // 4. 최적 외모 계산
    const optimizedAppearance = this.calculateOptimalAppearance(
      profile,
      situationAnalysis,
      preferenceAnalysis,
      personalityStyle
    );
    
    // 5. 외모 설명 생성
    const visualDescription = await this.generateAppearanceDescription(
      optimizedAppearance,
      sceneContext,
      characterName
    );
    
    // 6. 외모 업데이트 적용
    await this.applyAppearanceChanges(profile, optimizedAppearance, chapter);
    
    return {
      character: characterName,
      newAppearance: optimizedAppearance,
      visualDescription,
      changeReason: this.generateChangeReason(situationAnalysis, preferenceAnalysis),
      readerImpact: this.assessReaderImpact(optimizedAppearance, readerPreferences),
      nextSuggestions: this.generateNextSuggestions(profile, sceneContext)
    };
  }

  /**
   * 🎭 상황별 외모 적용
   */
  async applySituationalAppearance(
    characterName: string,
    situationType: SituationType,
    customModifications?: Partial<CurrentAppearance>
  ): Promise<CurrentAppearance> {
    
    const profile = this.appearanceProfiles.get(characterName);
    if (!profile) {
      throw new Error(`Appearance profile not found: ${characterName}`);
    }

    // 상황별 프리셋 가져오기
    const preset = this.situationalPresets.get(situationType);
    if (!preset) {
      throw new Error(`Situational preset not found: ${situationType}`);
    }

    // 기본 외모에 상황별 변형 적용
    const situationalAppearance = this.applySituationalChanges(
      profile.currentAppearance,
      preset,
      customModifications
    );

    // 프로필 업데이트
    profile.currentAppearance = situationalAppearance;

    return situationalAppearance;
  }

  /**
   * 🌸 계절 테마 적용
   */
  async applySeasonalTheme(
    characterName: string,
    season: SeasonType,
    event?: EventType
  ): Promise<AppearanceCustomizationResult> {
    
    const profile = this.appearanceProfiles.get(characterName);
    if (!profile) {
      throw new Error(`Appearance profile not found: ${characterName}`);
    }

    const seasonalTheme = this.seasonalThemes.get(season);
    if (!seasonalTheme) {
      throw new Error(`Seasonal theme not found: ${season}`);
    }

    // 계절 테마 적용
    const themedAppearance = this.applySeasonalChanges(
      profile.currentAppearance,
      seasonalTheme,
      event
    );

    // 설명 생성
    const description = await this.generateSeasonalDescription(
      characterName,
      themedAppearance,
      season,
      event
    );

    return {
      character: characterName,
      newAppearance: themedAppearance,
      visualDescription: description,
      changeReason: `${season} 계절 테마 적용${event ? ` (${event} 이벤트)` : ''}`,
      readerImpact: this.assessSeasonalImpact(themedAppearance, season),
      nextSuggestions: []
    };
  }

  /**
   * 💄 감정 상태별 외모 조정
   */
  adjustAppearanceForEmotion(
    characterName: string,
    emotionalState: EmotionalState,
    intensity: number = 50
  ): MoodExpression {
    
    const profile = this.appearanceProfiles.get(characterName);
    if (!profile) {
      throw new Error(`Appearance profile not found: ${characterName}`);
    }

    // 감정 상태에 따른 외모 변화 계산
    const moodExpression = this.calculateEmotionalExpression(
      emotionalState,
      intensity,
      profile.baseAppearance
    );

    // 현재 외모에 적용
    profile.currentAppearance.mood = moodExpression;

    return moodExpression;
  }

  /**
   * 📝 외모 설명 생성
   */
  private async generateAppearanceDescription(
    appearance: CurrentAppearance,
    context: SceneContext,
    characterName: string
  ): Promise<string> {
    
    const template = this.selectDescriptionTemplate(context.sceneType, context.focusLevel);
    
    // 템플릿 기반 설명 생성
    let description = template.baseTemplate;
    
    // 의상 설명
    description = description.replace('{outfit}', this.generateOutfitDescription(appearance.outfit));
    
    // 헤어 스타일 설명
    description = description.replace('{hair}', this.generateHairDescription(appearance));
    
    // 메이크업 설명
    description = description.replace('{makeup}', this.generateMakeupDescription(appearance.makeup));
    
    // 액세서리 설명
    description = description.replace('{accessories}', this.generateAccessoriesDescription(appearance.accessories));
    
    // 분위기 설명
    description = description.replace('{mood}', this.generateMoodDescription(appearance.mood));
    
    // 마법적 효과 (있는 경우)
    if (appearance.magicalEffects && appearance.magicalEffects.length > 0) {
      description += ' ' + this.generateMagicalEffectsDescription(appearance.magicalEffects);
    }
    
    return description;
  }

  /**
   * 🏗️ 기본 외모 초기화
   */
  private initializeDefaultAppearances(): void {
    // 민준 외모 프로필
    const minjunAppearance: AppearanceProfile = {
      characterId: 'minjun',
      baseAppearance: {
        physicalTraits: {
          eyeColor: 'dark_brown',
          eyeShape: 'almond',
          eyebrowStyle: 'straight',
          noseShape: 'straight',
          lipShape: 'medium',
          faceShape: 'oval',
          bodyBuild: 'athletic'
        },
        facialFeatures: {
          expressiveness: 75,
          symmetry: 85,
          softness: 60,
          maturity: 80,
          uniqueness: 70
        },
        hairStyle: {
          color: 'black',
          length: 'medium',
          texture: 'straight',
          style: 'modern_casual',
          volume: 70,
          shine: 60,
          naturalness: 80
        },
        bodyType: {
          build: 'athletic',
          proportions: 'balanced',
          posture: 'confident',
          grace: 75,
          athleticism: 85
        },
        height: 'tall',
        skinTone: 'warm_medium',
        distinctiveFeatures: ['날카로운 턱선', '깊은 눈동자', '자신감 있는 미소']
      },
      currentAppearance: {} as CurrentAppearance,
      stylePreferences: {
        preferredColors: ['navy', 'black', 'white', 'gray'],
        preferredStyles: ['casual', 'smart_casual', 'formal'],
        comfortLevel: 70,
        fashionSense: 75,
        experimentalness: 40,
        formalityPreference: 60
      },
      situationalVariations: new Map(),
      customizationHistory: [],
      readerPreferences: {
        preferredOutfitTypes: ['casual', 'formal'],
        likedHairStyles: ['modern_casual'],
        favoriteColors: ['navy', 'black'],
        makeupPreference: 'natural',
        accessoryPreference: ['watch', 'simple_jewelry'],
        overallRating: 85
      }
    };
    
    // 현재 외모 초기화
    minjunAppearance.currentAppearance = {
      outfit: {
        category: 'casual',
        style: 'modern',
        colors: { primary: 'navy', secondary: 'white', accent: 'silver' },
        materials: ['cotton', 'denim'],
        formality: 40,
        comfort: 80,
        attractiveness: 75,
        uniqueness: 50,
        description: '네이비 니트 스웨터와 진 바지'
      },
      makeup: {
        intensity: 0,
        style: 'none',
        eyeMakeup: 'none',
        lipColor: 'natural',
        blush: 'none',
        naturalness: 100
      },
      accessories: [
        {
          type: 'watch',
          description: '심플한 실버 시계',
          significance: 'practical',
          visibility: 70
        }
      ],
      mood: {
        primaryEmotion: 'confident',
        intensity: 75,
        facialExpression: '자신감 있는 미소',
        bodyLanguage: '당당한 자세',
        eyeExpression: '따뜻하고 집중된 눈빛',
        overallAura: '신뢰할 수 있는 분위기'
      },
      temporaryChanges: []
    };
    
    this.appearanceProfiles.set('민준', minjunAppearance);
    
    // 서연 외모 프로필
    const seoyeonAppearance: AppearanceProfile = {
      characterId: 'seoyeon',
      baseAppearance: {
        physicalTraits: {
          eyeColor: 'dark_brown',
          eyeShape: 'round',
          eyebrowStyle: 'arched',
          noseShape: 'small',
          lipShape: 'heart',
          faceShape: 'heart',
          bodyBuild: 'petite'
        },
        facialFeatures: {
          expressiveness: 90,
          symmetry: 80,
          softness: 85,
          maturity: 70,
          uniqueness: 75
        },
        hairStyle: {
          color: 'dark_brown',
          length: 'long',
          texture: 'wavy',
          style: 'feminine_elegant',
          volume: 80,
          shine: 85,
          naturalness: 90
        },
        bodyType: {
          build: 'petite',
          proportions: 'delicate',
          posture: 'graceful',
          grace: 90,
          athleticism: 60
        },
        height: 'medium',
        skinTone: 'fair_cool',
        distinctiveFeatures: ['큰 눈', '부드러운 미소', '우아한 손동작']
      },
      currentAppearance: {} as CurrentAppearance,
      stylePreferences: {
        preferredColors: ['pastel_pink', 'white', 'soft_blue', 'lavender'],
        preferredStyles: ['feminine', 'elegant', 'cute'],
        comfortLevel: 80,
        fashionSense: 85,
        experimentalness: 60,
        formalityPreference: 70
      },
      situationalVariations: new Map(),
      customizationHistory: [],
      readerPreferences: {
        preferredOutfitTypes: ['feminine', 'cute', 'elegant'],
        likedHairStyles: ['feminine_elegant', 'cute_ponytail'],
        favoriteColors: ['pastel_pink', 'white', 'soft_blue'],
        makeupPreference: 'natural_cute',
        accessoryPreference: ['earrings', 'necklace', 'hair_accessories'],
        overallRating: 90
      }
    };
    
    // 서연 현재 외모 초기화
    seoyeonAppearance.currentAppearance = {
      outfit: {
        category: 'feminine',
        style: 'cute',
        colors: { primary: 'pastel_pink', secondary: 'white', accent: 'gold' },
        materials: ['silk', 'cotton'],
        formality: 60,
        comfort: 85,
        attractiveness: 85,
        uniqueness: 70,
        description: '파스텔 핑크 블라우스와 화이트 스커트'
      },
      makeup: {
        intensity: 40,
        style: 'natural_cute',
        eyeMakeup: 'subtle',
        lipColor: 'light_pink',
        blush: 'soft_pink',
        naturalness: 80
      },
      accessories: [
        {
          type: 'earrings',
          description: '작은 진주 귀걸이',
          significance: 'decorative',
          visibility: 60
        },
        {
          type: 'necklace',
          description: '섬세한 금목걸이',
          significance: 'sentimental',
          visibility: 50
        }
      ],
      mood: {
        primaryEmotion: 'gentle',
        intensity: 70,
        facialExpression: '부드러운 미소',
        bodyLanguage: '우아한 자세',
        eyeExpression: '따뜻하고 수줍은 눈빛',
        overallAura: '상냥하고 신비로운 분위기'
      },
      temporaryChanges: []
    };
    
    this.appearanceProfiles.set('서연', seoyeonAppearance);
  }

  /**
   * 🎬 상황별 프리셋 초기화
   */
  private initializeSituationalPresets(): void {
    // 데이트 상황
    this.situationalPresets.set('date', {
      situationType: 'date',
      changes: {
        outfit: {
          category: 'formal_casual',
          style: 'attractive',
          colors: { primary: 'romantic', secondary: 'complementary', accent: 'elegant' },
          materials: ['silk', 'wool', 'cotton'],
          formality: 70,
          comfort: 75,
          attractiveness: 90,
          uniqueness: 80,
          description: '데이트를 위한 특별한 옷차림'
        },
        makeup: {
          intensity: 60,
          style: 'romantic',
          eyeMakeup: 'enhanced',
          lipColor: 'romantic',
          blush: 'natural',
          naturalness: 70
        }
      },
      description: '로맨틱한 데이트룩',
      readerRating: 85,
      usageFrequency: 70
    });
    
    // 학교 상황
    this.situationalPresets.set('school', {
      situationType: 'school',
      changes: {
        outfit: {
          category: 'school_uniform',
          style: 'neat',
          colors: { primary: 'navy', secondary: 'white', accent: 'school_color' },
          materials: ['polyester', 'cotton'],
          formality: 80,
          comfort: 70,
          attractiveness: 70,
          uniqueness: 30,
          description: '단정한 교복 차림'
        },
        makeup: {
          intensity: 20,
          style: 'natural',
          eyeMakeup: 'minimal',
          lipColor: 'natural',
          blush: 'none',
          naturalness: 95
        }
      },
      description: '학교에서의 단정한 모습',
      readerRating: 75,
      usageFrequency: 90
    });
  }

  /**
   * 🌺 계절 테마 초기화
   */
  private initializeSeasonalThemes(): void {
    this.seasonalThemes.set('spring', {
      season: 'spring',
      colorPalette: ['pastel_pink', 'soft_green', 'lavender', 'cream'],
      outfitStyles: ['light', 'floral', 'fresh'],
      accessories: ['flower_hair_clip', 'light_scarf'],
      mood: 'fresh_and_hopeful',
      description: '봄의 신선함과 희망을 담은 스타일'
    });
    
    this.seasonalThemes.set('summer', {
      season: 'summer',
      colorPalette: ['white', 'sky_blue', 'coral', 'yellow'],
      outfitStyles: ['light', 'breezy', 'casual'],
      accessories: ['sun_hat', 'light_jewelry'],
      mood: 'bright_and_energetic',
      description: '여름의 밝고 활기찬 스타일'
    });
  }

  /**
   * 📖 설명 템플릿 초기화
   */
  private initializeDescriptionTemplates(): void {
    this.descriptionTemplates.set('detailed_scene', {
      name: 'detailed_scene',
      baseTemplate: '{outfit}을 입은 그녀는 {hair}로 스타일링하고, {makeup}을 했다. {accessories}이 그녀의 매력을 더했고, {mood}가 전체적인 분위기를 완성했다.',
      focusAreas: ['outfit', 'hair', 'makeup', 'accessories', 'mood'],
      length: 'detailed'
    });
    
    this.descriptionTemplates.set('brief_mention', {
      name: 'brief_mention',
      baseTemplate: '{outfit}을 입고 {mood}한 모습이었다.',
      focusAreas: ['outfit', 'mood'],
      length: 'brief'
    });
  }

  // Helper methods (스텁 구현)
  private analyzeSceneRequirements(context: SceneContext, chapter: Chapter): SituationAnalysis {
    return {
      requiredFormality: 50,
      emotionalTone: 'romantic',
      settingType: 'indoor',
      timeOfDay: 'afternoon',
      specialRequirements: []
    };
  }

  private analyzeReaderPreferences(prefs: ReaderAppearancePrefs, profile: AppearanceProfile): PreferenceAnalysis {
    return {
      alignmentScore: 85,
      suggestedAdjustments: [],
      satisfactionPrediction: 80
    };
  }

  private async matchPersonalityToStyle(characterName: string, chapter: Chapter): Promise<PersonalityStyleMatch> {
    return {
      recommendedStyle: 'confident_casual',
      styleReasoning: '캐릭터의 자신감 있는 성격에 맞는 스타일',
      compatibilityScore: 85
    };
  }

  private calculateOptimalAppearance(
    profile: AppearanceProfile,
    situation: SituationAnalysis,
    preferences: PreferenceAnalysis,
    personality: PersonalityStyleMatch
  ): CurrentAppearance {
    // 현재 외모를 기반으로 최적화된 외모 계산
    return { ...profile.currentAppearance };
  }

  private generateChangeReason(situation: SituationAnalysis, preferences: PreferenceAnalysis): string {
    return '상황과 독자 선호도를 고려한 외모 조정';
  }

  private assessReaderImpact(appearance: CurrentAppearance, prefs: ReaderAppearancePrefs): ReaderImpactAssessment {
    return {
      satisfactionIncrease: 15,
      engagementBoost: 10,
      preferenceAlignment: 85
    };
  }

  private generateNextSuggestions(profile: AppearanceProfile, context: SceneContext): string[] {
    return ['다음 장면을 위한 액세서리 변경 제안', '계절감을 살린 의상 조정'];
  }

  private applySituationalChanges(
    currentAppearance: CurrentAppearance,
    preset: AppearanceVariation,
    customMods?: Partial<CurrentAppearance>
  ): CurrentAppearance {
    const result = { ...currentAppearance };
    
    // 프리셋 적용
    if (preset.changes.outfit) {
      result.outfit = { ...result.outfit, ...preset.changes.outfit };
    }
    if (preset.changes.makeup) {
      result.makeup = { ...result.makeup, ...preset.changes.makeup };
    }
    
    // 커스텀 수정사항 적용
    if (customMods) {
      Object.assign(result, customMods);
    }
    
    return result;
  }

  private applySeasonalChanges(
    currentAppearance: CurrentAppearance,
    theme: SeasonalTheme,
    event?: EventType
  ): CurrentAppearance {
    const result = { ...currentAppearance };
    
    // 계절 색상 적용
    result.outfit.colors.primary = theme.colorPalette[0];
    result.outfit.colors.secondary = theme.colorPalette[1];
    
    return result;
  }

  private async generateSeasonalDescription(
    characterName: string,
    appearance: CurrentAppearance,
    season: SeasonType,
    event?: EventType
  ): Promise<string> {
    return `${season} 테마를 적용한 ${characterName}의 새로운 모습`;
  }

  private assessSeasonalImpact(appearance: CurrentAppearance, season: SeasonType): ReaderImpactAssessment {
    return {
      satisfactionIncrease: 12,
      engagementBoost: 8,
      preferenceAlignment: 80
    };
  }

  private calculateEmotionalExpression(
    emotional: EmotionalState,
    intensity: number,
    baseAppearance: BaseAppearance
  ): MoodExpression {
    return {
      primaryEmotion: emotional.primary,
      intensity,
      facialExpression: `${emotional.primary}한 표정`,
      bodyLanguage: `${emotional.primary}한 몸짓`,
      eyeExpression: `${emotional.primary}한 눈빛`,
      overallAura: `${emotional.primary}한 분위기`
    };
  }

  private selectDescriptionTemplate(sceneType: string, focusLevel: string): DescriptionTemplate {
    return this.descriptionTemplates.get('detailed_scene') || {
      name: 'default',
      baseTemplate: '기본 외모 설명',
      focusAreas: ['outfit'],
      length: 'brief'
    };
  }

  private generateOutfitDescription(outfit: OutfitDescription): string {
    return outfit.description;
  }

  private generateHairDescription(appearance: CurrentAppearance): string {
    return '스타일링된 헤어';
  }

  private generateMakeupDescription(makeup: MakeupStyle): string {
    return makeup.style === 'none' ? '자연스러운 메이크업' : `${makeup.style} 메이크업`;
  }

  private generateAccessoriesDescription(accessories: Accessory[]): string {
    return accessories.map(acc => acc.description).join(', ');
  }

  private generateMoodDescription(mood: MoodExpression): string {
    return mood.overallAura;
  }

  private generateMagicalEffectsDescription(effects: MagicalEffect[]): string {
    return effects.map(effect => effect.description).join(', ');
  }

  private async applyAppearanceChanges(
    profile: AppearanceProfile,
    optimized: CurrentAppearance,
    chapter: Chapter
  ): Promise<void> {
    // 변경사항 기록
    const change: AppearanceChange = {
      chapterNumber: chapter.chapterNumber,
      timestamp: new Date(),
      changeType: 'optimization',
      beforeState: profile.currentAppearance,
      afterState: optimized,
      reason: 'Scene optimization',
      visualDescription: await this.generateAppearanceDescription(optimized, { sceneType: 'general', focusLevel: 'medium' }, profile.characterId)
    };
    
    profile.customizationHistory.push(change);
    profile.currentAppearance = optimized;
  }

  /**
   * 📊 외모 프로필 조회
   */
  getAppearanceProfile(characterName: string): AppearanceProfile | undefined {
    return this.appearanceProfiles.get(characterName);
  }

  /**
   * 🎨 현재 외모 조회
   */
  getCurrentAppearance(characterName: string): CurrentAppearance | undefined {
    return this.appearanceProfiles.get(characterName)?.currentAppearance;
  }

  /**
   * 📈 시스템 통계
   */
  getSystemStats(): AppearanceSystemStats {
    return {
      totalCharacters: this.appearanceProfiles.size,
      totalCustomizations: this.getTotalCustomizations(),
      averageRating: this.calculateAverageRating(),
      popularOutfitCategory: this.getMostPopularOutfitCategory()
    };
  }

  private getTotalCustomizations(): number {
    return Array.from(this.appearanceProfiles.values())
      .reduce((total, profile) => total + profile.customizationHistory.length, 0);
  }

  private calculateAverageRating(): number {
    const profiles = Array.from(this.appearanceProfiles.values());
    if (profiles.length === 0) return 0;
    
    const totalRating = profiles.reduce((sum, profile) => sum + profile.readerPreferences.overallRating, 0);
    return totalRating / profiles.length;
  }

  private getMostPopularOutfitCategory(): OutfitCategory {
    return 'casual'; // 임시값
  }
}

// 타입 정의들
type EyeColor = 'brown' | 'dark_brown' | 'black' | 'blue' | 'green' | 'hazel';
type EyeShape = 'almond' | 'round' | 'monolid' | 'hooded' | 'upturned';
type EyebrowStyle = 'straight' | 'arched' | 'thick' | 'thin' | 'natural';
type NoseShape = 'straight' | 'small' | 'button' | 'aquiline' | 'wide';
type LipShape = 'thin' | 'medium' | 'full' | 'heart' | 'bow';
type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'long';
type BodyBuild = 'petite' | 'slim' | 'athletic' | 'curvy' | 'plus';

type HairColor = 'black' | 'dark_brown' | 'brown' | 'blonde' | 'red' | 'gray' | 'unusual';
type HairLength = 'very_short' | 'short' | 'medium' | 'long' | 'very_long';
type HairTexture = 'straight' | 'wavy' | 'curly' | 'coily';
type HairStyleType = 'modern_casual' | 'feminine_elegant' | 'cute_ponytail' | 'sophisticated' | 'playful';

type BodyProportions = 'balanced' | 'delicate' | 'athletic' | 'curvy';
type PostureType = 'confident' | 'graceful' | 'relaxed' | 'shy';
type HeightCategory = 'petite' | 'medium' | 'tall' | 'very_tall';
type SkinTone = 'fair_cool' | 'fair_warm' | 'medium_cool' | 'medium_warm' | 'warm_medium' | 'deep';

type OutfitCategory = 'casual' | 'formal' | 'feminine' | 'cute' | 'elegant' | 'sporty' | 'school_uniform' | 'formal_casual';
type ClothingStyle = 'modern' | 'classic' | 'trendy' | 'cute' | 'elegant' | 'casual' | 'formal' | 'smart_casual';
type MakeupStyleType = 'none' | 'natural' | 'natural_cute' | 'romantic' | 'dramatic' | 'avant_garde';
type EyeMakeupStyle = 'none' | 'minimal' | 'subtle' | 'enhanced' | 'dramatic';
type LipColorType = 'natural' | 'light_pink' | 'romantic' | 'bold' | 'neutral';
type BlushStyle = 'none' | 'soft_pink' | 'natural' | 'coral' | 'peach';

type AccessoryType = 'earrings' | 'necklace' | 'bracelet' | 'ring' | 'watch' | 'hair_accessories' | 'scarf' | 'bag' | 'simple_jewelry';
type EmotionType = 'happy' | 'sad' | 'angry' | 'surprised' | 'confident' | 'shy' | 'gentle' | 'excited' | 'nervous' | 'romantic';
type SituationType = 'date' | 'school' | 'formal_event' | 'casual_outing' | 'home' | 'work' | 'party' | 'outdoor_activity';
type ChangeType = 'optimization' | 'situational' | 'seasonal' | 'emotional' | 'reader_request';
type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
type EventType = 'birthday' | 'holiday' | 'special_occasion' | 'festival' | 'graduation';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
}

interface TemporaryChange {
  type: string;
  description: string;
  duration: number;
}

interface MagicalEffect {
  type: string;
  description: string;
  intensity: number;
}

interface SceneContext {
  sceneType: string;
  focusLevel: string;
  emotionalTone?: string;
  setting?: string;
}

interface EmotionalState {
  primary: EmotionType;
  secondary?: EmotionType;
  intensity: number;
}

interface SeasonalTheme {
  season: SeasonType;
  colorPalette: string[];
  outfitStyles: string[];
  accessories: string[];
  mood: string;
  description: string;
}

interface DescriptionTemplate {
  name: string;
  baseTemplate: string;
  focusAreas: string[];
  length: 'brief' | 'medium' | 'detailed';
}

interface SituationAnalysis {
  requiredFormality: number;
  emotionalTone: string;
  settingType: string;
  timeOfDay: string;
  specialRequirements: string[];
}

interface PreferenceAnalysis {
  alignmentScore: number;
  suggestedAdjustments: string[];
  satisfactionPrediction: number;
}

interface PersonalityStyleMatch {
  recommendedStyle: string;
  styleReasoning: string;
  compatibilityScore: number;
}

interface ReaderImpactAssessment {
  satisfactionIncrease: number;
  engagementBoost: number;
  preferenceAlignment: number;
}

interface AppearanceCustomizationResult {
  character: string;
  newAppearance: CurrentAppearance;
  visualDescription: string;
  changeReason: string;
  readerImpact: ReaderImpactAssessment;
  nextSuggestions: string[];
}

interface AppearanceSystemStats {
  totalCharacters: number;
  totalCustomizations: number;
  averageRating: number;
  popularOutfitCategory: OutfitCategory;
}

export default CharacterAppearanceSystem;