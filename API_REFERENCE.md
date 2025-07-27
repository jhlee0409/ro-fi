# RO-FAN API Reference

**Complete API Documentation for AI Automation Engines**

---

## Table of Contents

1. [Master Automation Engine](#master-automation-engine)
2. [AI Generation Engines](#ai-generation-engines)
3. [Quality & Analytics Engines](#quality--analytics-engines)
4. [Platform & Configuration](#platform--configuration)
5. [Utility Engines](#utility-engines)
6. [Type Definitions](#type-definitions)
7. [Error Handling](#error-handling)

---

## Master Automation Engine

### MasterAutomationEngine

Central orchestration engine that coordinates all AI automation operations.

#### Constructor

```javascript
import { MasterAutomationEngine } from './src/lib/master-automation-engine.js';

const engine = new MasterAutomationEngine((contentDir = 'src/content'), (dependencies = {}));
```

**Parameters:**

- `contentDir` (string): Directory for content storage (default: 'src/content')
- `dependencies` (object): Dependency injection for testing

#### Core Methods

##### runFullAutomation()

```javascript
const result = await engine.runFullAutomation();
```

**Returns:** `Promise<AutomationResult>`

- Executes complete automation cycle
- Analyzes current state and makes intelligent decisions
- Prioritizes novel completion > creation > continuation

##### createNewNovel(options)

```javascript
const novel = await engine.createNewNovel({
  platform: 'naver',
  creativity: true,
  budget: 100,
  genre: 'enemies-to-lovers',
});
```

**Parameters:**

- `platform` (string): Target platform ('default', 'naver', 'munpia', 'ridibooks')
- `creativity` (boolean): Enable creativity mode for higher quality
- `budget` (number): Budget limit in USD for creativity mode
- `genre` (string): Preferred romance trope

**Returns:** `Promise<NovelCreationResult>`

##### continueNovel(novelSlug, options)

```javascript
const chapter = await engine.continueNovel('novel-slug', {
  targetLength: 2800,
  emotionalTone: 'intense',
  creativity: false,
});
```

**Parameters:**

- `novelSlug` (string): Novel identifier
- `options.targetLength` (number): Target character count
- `options.emotionalTone` (string): Desired emotional intensity
- `options.creativity` (boolean): Use creativity mode

**Returns:** `Promise<ChapterResult>`

##### completeNovel(novelSlug)

```javascript
const completion = await engine.completeNovel('novel-slug');
```

**Parameters:**

- `novelSlug` (string): Novel to complete

**Returns:** `Promise<CompletionResult>`

#### Configuration Properties

```javascript
engine.automationConfig = {
  maxActiveNovels: 3,
  minChapterGap: 1,
  qualityThreshold: 80,
  dailyChapterLimit: 2,
  creativityMode: {
    enabled: true,
    autoActivation: true,
    budgetLimit: 1000,
    qualityPriority: true,
  },
};
```

---

## AI Generation Engines

### HybridAIGenerator

Intelligent coordination between Claude and Gemini for optimal content generation.

```javascript
import { createHybridGenerator } from './src/lib/hybrid-ai-generator.js';

const generator = createHybridGenerator();
```

#### generateChapter(context, options)

```javascript
const chapter = await generator.generateChapter({
  novel: novelMetadata,
  chapterNumber: 5,
  previousChapters: [...],
  characters: [...],
  plotContext: '...'
}, {
  platform: 'naver',
  targetLength: 2800,
  creativity: true,
  style: 'emotional'
});
```

**Returns:** `Promise<GeneratedChapter>`

### AIStoryGenerator (Claude)

Claude-specific content generation optimized for emotional storytelling.

```javascript
import { createStoryGenerator } from './src/lib/ai-story-generator.js';

const claudeGenerator = createStoryGenerator();
```

#### generateNovel(concept, options)

```javascript
const novel = await claudeGenerator.generateNovel(
  {
    title: '운명의 계약',
    concept: 'enemies-to-lovers',
    setting: '현대 판타지',
    characters: ['강인한 여주인공', '냉정한 남주인공'],
  },
  {
    platform: 'naver',
    chapters: 50,
    creativity: true,
  }
);
```

### GeminiStoryGenerator

Gemini-specific generation for world-building and logical consistency.

```javascript
import { createGeminiGenerator } from './src/lib/gemini-story-generator.js';

const geminiGenerator = createGeminiGenerator();
```

#### generateWorldBuilding(concept)

```javascript
const worldData = await geminiGenerator.generateWorldBuilding({
  genre: 'urban-fantasy',
  magicSystem: '계약 마법',
  setting: '현대 한국',
});
```

---

## Quality & Analytics Engines

### QualityAssuranceEngine

Comprehensive content quality validation and improvement.

```javascript
import { QualityAssuranceEngine } from './src/lib/quality-assurance-engine.js';

const qa = new QualityAssuranceEngine((platform = 'default'));
```

#### evaluateQuality(content, options)

```javascript
const evaluation = await qa.evaluateQuality(content, {
  targetLength: 2800,
  platform: 'naver',
  strictMode: true,
});
```

**Returns:** `QualityEvaluation`

```javascript
{
  score: 85,                    // Overall quality score (0-100)
  status: 'good',              // 'excellent', 'good', 'needs_improvement', 'needs_major_improvement'
  wordCount: 2750,
  issues: [                    // Array of identified issues
    'dialogue_ratio_low',
    'emotional_depth_insufficient'
  ],
  suggestions: [               // Improvement suggestions
    '대화 비율을 30% 이상으로 증가',
    '감정적 깊이 강화 필요'
  ],
  metrics: {
    dialogueRatio: 0.25,
    emotionalScore: 0.7,
    pacing: 0.8,
    characterConsistency: 0.9
  }
}
```

#### validateFormat(content)

```javascript
const validation = qa.validateFormat(content);
```

**Returns:** `FormatValidation`

```javascript
{
  valid: true,
  errors: [],                  // Critical format errors
  warnings: [],                // Minor format issues
  suggestions: []              // Format improvement suggestions
}
```

### TokenBalancingEngine

Cost optimization and strategy selection for AI operations.

```javascript
import { TokenBalancingEngine } from './src/lib/token-balancing-engine.js';

const balancer = new TokenBalancingEngine();
```

#### selectOptimalStrategy(context)

```javascript
const strategy = await balancer.selectOptimalStrategy({
  novelSlug: 'novel-slug',
  chapterNumber: 5,
  qualityTarget: 85,
  budget: 50,
  deadline: new Date(),
  readerMetrics: {...}
});
```

**Returns:** `OptimalStrategy`

```javascript
{
  mode: 'creativity',          // 'efficiency' or 'creativity'
  aiProvider: 'claude',        // 'claude', 'gemini', or 'hybrid'
  estimatedCost: 24.50,        // USD
  estimatedTokens: 15000,
  qualityExpectation: 90,
  reasoning: 'High reader engagement requires creativity mode'
}
```

#### trackUsage(operation, tokens, cost)

```javascript
balancer.trackUsage('chapter_generation', 12500, 18.75);
```

### ReaderAnalyticsEngine

Reader engagement analysis and content optimization recommendations.

```javascript
import { ReaderAnalyticsEngine } from './src/lib/reader-analytics-engine.js';

const analytics = new ReaderAnalyticsEngine();
```

#### analyzeEngagement(novelSlug, options)

```javascript
const engagement = await analytics.analyzeEngagement('novel-slug', {
  timeWindow: '30d',
  includeDropoff: true,
  includeEmotional: true,
});
```

**Returns:** `EngagementAnalysis`

```javascript
{
  overallScore: 0.82,          // 0-1 engagement score
  readingRate: 0.85,           // Chapter completion rate
  retentionRate: 0.78,         // Reader return rate
  dropoffPoints: [3, 7, 12],   // Chapters with high dropout
  emotionalResponse: 'positive', // 'positive', 'neutral', 'negative'
  peakEngagement: 15,          // Chapter with highest engagement
  trends: {
    improving: true,
    velocity: 0.05             // Rate of improvement
  },
  recommendations: [
    'Strengthen emotional arc in chapters 3-7',
    'Add tension in chapter 12'
  ]
}
```

#### getContentRecommendations(metrics)

```javascript
const recommendations = analytics.getContentRecommendations(engagementMetrics);
```

### CreativityModeEngine

Dynamic quality enhancement based on reader metrics and story milestones.

```javascript
import { CreativityModeEngine } from './src/lib/creativity-mode-engine.js';

const creativity = new CreativityModeEngine();
```

#### shouldActivateCreativity(context)

```javascript
const decision = await creativity.shouldActivateCreativity({
  novelSlug: 'novel-slug',
  chapterNumber: 10,
  readerMetrics: {...},
  storyMilestone: 'first_kiss',
  lastActivation: new Date(),
  budget: 500
});
```

**Returns:** `CreativityDecision`

```javascript
{
  activate: true,
  confidence: 0.9,
  triggers: [
    {
      type: 'milestone',
      reason: '첫 키스 - 강렬한 첫인상 필요',
      priority: 'high',
      score: 0.9
    },
    {
      type: 'metrics',
      reason: '독자 이탈률 25% - 긴급 개선 필요',
      priority: 'critical',
      score: 0.9
    }
  ],
  budgetImpact: 50,
  expectedQualityBoost: 15
}
```

#### generateCreativePrompt(context, triggers)

```javascript
const prompt = creativity.generateCreativePrompt(context, triggers);
```

---

## Platform & Configuration

### PlatformConfigEngine

Multi-platform optimization for different web novel platforms.

```javascript
import { PlatformConfigEngine } from './src/lib/platform-config-engine.js';

const platform = new PlatformConfigEngine();
```

#### setPlatform(platformKey)

```javascript
platform.setPlatform('naver'); // 'default', 'naver', 'munpia', 'ridibooks'
```

#### getCurrentConfig()

```javascript
const config = platform.getCurrentConfig();
```

**Returns:** `PlatformConfig`

```javascript
{
  name: "네이버 시리즈",
  targetWordCount: 2800,
  qualityThreshold: 80,
  dialogueRatio: 30,           // Percentage
  styleGuidelines: [
    "감정적 몰입도 중시",
    "다음 화 기대감 조성"
  ],
  optimization: {
    tokenIncrease: 60,         // Percentage increase for quality
    focusAreas: ['emotion', 'pacing'],
    restrictions: ['explicit_content']
  }
}
```

#### getOptimizationSettings()

```javascript
const settings = platform.getOptimizationSettings();
```

#### printPlatformSummary()

```javascript
platform.printPlatformSummary(); // Console output of current platform settings
```

---

## Utility Engines

### EmotionalDepthEngine

Emotional storytelling and relationship progression management.

```javascript
import { EmotionalDepthEngine } from './src/lib/emotional-depth-engine.js';

const emotion = new EmotionalDepthEngine();
```

#### enhanceEmotionalExpression(content, context)

```javascript
const enhanced = emotion.enhanceEmotionalExpression(content, {
  relationshipStage: 'attraction', // 'tension', 'attraction', 'conflict', 'resolution'
  emotionalTone: 'conflicted',
  characters: ['리아', '카이런'],
  targetDepth: 0.8,
});
```

#### analyzeRelationshipProgression(chapters)

```javascript
const progression = emotion.analyzeRelationshipProgression(chapterArray);
```

### StoryDiversityEngine

Unique story concept generation and anti-repetition measures.

```javascript
import { StoryDiversityEngine } from './src/lib/story-diversity-engine.js';

const diversity = new StoryDiversityEngine();
```

#### generateUniqueStory(existingNovels)

```javascript
const concept = await diversity.generateUniqueStory(existingNovelArray);
```

**Returns:** `StoryConcept`

```javascript
{
  title: "얼음 영지의 계약자",
  concept: {
    main: 'enemies-to-lovers',
    sub: 'power-struggle',
    conflict: 'family-secrets',
    world: '얼음 마법이 지배하는 북방 왕국',
    mainConflict: '고대 저주의 부활',
    magicSystem: '계약 마법',
    genre: '정치 로맨스'
  },
  diversityScore: 95,          // 0-100 uniqueness score
  protagonist: '얼음 마법사 공작 영애'
}
```

#### checkUniqueness(newConcept, existing)

```javascript
const uniqueness = diversity.checkUniqueness(newConcept, existingConcepts);
```

### CompletionCriteriaEngine

Story completion analysis and recommendation engine.

```javascript
import { CompletionCriteriaEngine } from './src/lib/completion-criteria-engine.js';

const completion = new CompletionCriteriaEngine();
```

#### evaluateCompletionReadiness(novel, chapters)

```javascript
const evaluation = completion.evaluateCompletionReadiness(novelData, chapterArray);
```

**Returns:** `CompletionEvaluation`

```javascript
{
  ready: true,
  confidence: 0.85,
  storyArcProgress: 0.90,      // 0-1 story completion
  relationshipProgress: 0.75,  // 0-1 relationship development
  subplotsResolved: 0.80,      // 0-1 subplot resolution
  recommendedAction: 'Begin ending sequence',
  estimatedChaptersToEnd: 3,
  completionType: 'enemies-to-lovers',
  epilogueNeeded: false
}
```

### CharacterVoiceEngine

Character consistency and voice management across chapters.

```javascript
import { CharacterVoiceEngine } from './src/lib/character-voice-engine.js';

const voice = new CharacterVoiceEngine();
```

#### analyzeCharacterConsistency(chapters, character)

```javascript
const consistency = voice.analyzeCharacterConsistency(chapterArray, 'character-name');
```

#### generateVoiceGuidelines(character, context)

```javascript
const guidelines = voice.generateVoiceGuidelines(characterData, storyContext);
```

### NovelDetector

Content analysis and novel classification utility.

```javascript
import { NovelDetector } from './src/lib/novel-detector.js';

const detector = new NovelDetector(novelsDir, chaptersDir);
```

#### detectActiveNovels()

```javascript
const novels = await detector.detectActiveNovels();
```

#### findCompletionCandidates()

```javascript
const candidates = await detector.findCompletionCandidates();
```

#### getNovelProgress(novelSlug)

```javascript
const progress = await detector.getNovelProgress('novel-slug');
```

---

## Type Definitions

### Core Types

```typescript
interface AutomationResult {
  success: boolean;
  action: 'CREATE_NEW_NOVEL' | 'CONTINUE_CHAPTER' | 'COMPLETE_NOVEL' | 'NO_ACTION';
  data: {
    novelTitle?: string;
    novelSlug?: string;
    chapterTitle?: string;
    chapterNumber?: number;
    wordCount: number;
    qualityScore: number;
    platform: string;
  };
  metrics: {
    tokensUsed: number;
    costUSD: number;
    generationTime: number;
    efficiencyMode: boolean;
  };
  errors?: string[];
  warnings?: string[];
}

interface NovelMetadata {
  title: string;
  slug: string;
  author: '하이브리드 AI (Claude + Gemini)' | '클로드 소네트 AI';
  status: '연재 중' | '완결' | '휴재';
  summary: string;
  tropes: string[];
  totalChapters: number;
  publishedDate: string;
  rating: number;
  platform?: string;
  targetWordCount?: number;
}

interface ChapterContent {
  title: string;
  novel: string;
  chapterNumber: number;
  publicationDate: string;
  content: string;
  wordCount: number;
  emotionalTone: string;
  qualityScore?: number;
  platform?: string;
}

interface QualityEvaluation {
  score: number; // 0-100
  status: 'excellent' | 'good' | 'needs_improvement' | 'needs_major_improvement';
  wordCount: number;
  issues: string[];
  suggestions: string[];
  metrics: {
    dialogueRatio: number; // 0-1
    emotionalScore: number; // 0-1
    pacing: number; // 0-1
    characterConsistency: number; // 0-1
    formatCompliance: number; // 0-1
  };
}

interface PlatformConfig {
  name: string;
  targetWordCount: number;
  qualityThreshold: number;
  dialogueRatio: number; // Percentage
  styleGuidelines: string[];
  optimization: {
    tokenIncrease: number; // Percentage
    focusAreas: string[];
    restrictions: string[];
  };
}

interface EngagementAnalysis {
  overallScore: number; // 0-1
  readingRate: number; // 0-1
  retentionRate: number; // 0-1
  dropoffPoints: number[]; // Chapter numbers
  emotionalResponse: 'positive' | 'neutral' | 'negative';
  peakEngagement: number; // Chapter number
  trends: {
    improving: boolean;
    velocity: number; // Rate of change
  };
  recommendations: string[];
}
```

### Engine-Specific Types

```typescript
interface GenerationContext {
  novel: NovelMetadata;
  chapterNumber: number;
  previousChapters: ChapterContent[];
  characters: Character[];
  plotContext: string;
  platform: string;
}

interface GenerationOptions {
  platform: string;
  targetLength: number;
  creativity: boolean;
  style: 'emotional' | 'action' | 'dialogue' | 'descriptive';
  budget?: number;
  deadline?: Date;
}

interface OptimalStrategy {
  mode: 'efficiency' | 'creativity';
  aiProvider: 'claude' | 'gemini' | 'hybrid';
  estimatedCost: number;
  estimatedTokens: number;
  qualityExpectation: number;
  reasoning: string;
}

interface CreativityDecision {
  activate: boolean;
  confidence: number; // 0-1
  triggers: CreativityTrigger[];
  budgetImpact: number; // USD
  expectedQualityBoost: number; // Points
}

interface CreativityTrigger {
  type: 'milestone' | 'metrics' | 'pattern' | 'budget';
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-1
}
```

---

## Error Handling

### Common Error Types

```javascript
// API Connection Errors
class APIConnectionError extends Error {
  constructor(provider, details) {
    super(`${provider} API connection failed: ${details}`);
    this.name = 'APIConnectionError';
    this.provider = provider;
  }
}

// Content Generation Errors
class ContentGenerationError extends Error {
  constructor(stage, details) {
    super(`Content generation failed at ${stage}: ${details}`);
    this.name = 'ContentGenerationError';
    this.stage = stage;
  }
}

// Quality Validation Errors
class QualityValidationError extends Error {
  constructor(score, issues) {
    super(`Quality validation failed: score ${score}`);
    this.name = 'QualityValidationError';
    this.score = score;
    this.issues = issues;
  }
}
```

### Error Handling Patterns

```javascript
try {
  const result = await engine.runFullAutomation();
  return result;
} catch (error) {
  if (error instanceof APIConnectionError) {
    console.error(`API Error (${error.provider}):`, error.message);
    // Implement fallback strategy
    return await engine.runWithFallback();
  } else if (error instanceof QualityValidationError) {
    console.error(`Quality Error (${error.score}):`, error.issues);
    // Retry with creativity mode
    return await engine.retryWithCreativity();
  } else {
    console.error('Unexpected error:', error);
    throw error;
  }
}
```

### Graceful Degradation

```javascript
// Automatic fallback when primary AI fails
const generator = createHybridGenerator({
  fallbackStrategy: 'claude-only',
  retryAttempts: 3,
  qualityThreshold: 70,
  emergencyMode: true,
});

// Platform-specific fallbacks
const platformConfig = new PlatformConfigEngine({
  fallbackPlatform: 'default',
  adaptiveSettings: true,
});
```

---

**RO-FAN API Reference v3.1 - Complete documentation for AI automation engines**
