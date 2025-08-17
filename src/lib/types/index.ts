// Type definitions for ro-fan AI novel platform

export interface Novel {
  title: string;
  slug: string;
  author: string;
  description: string;
  genre: string[];
  status: '연재 중' | '완결' | '휴재';
  totalChapters: number;
  publishedDate: string;
  contentRating: string;
  tags: string[];
  currentChapter?: number;
  lastUpdated?: string;
}

export interface Chapter {
  title: string;
  novel: string;
  chapterNumber: number;
  publishedDate: string;
  contentRating: string;
  wordCount: number;
  content: string;
}

export interface NovelState extends Novel {
  slug: string;
  currentChapter: number;
  lastUpdated: string;
  chaptersCount: number;
  latestChapter: number;
  progressPercentage: number;
  lastUpdate: Date;
  completionAnalysis: {
    overallReadiness: boolean;
  };
}

// Quality Analytics Types
export interface QualityStandards {
  minWordCount: number;
  maxWordCount: number;
  requiredElements: string[];
  qualityThreshold: number;
}

export interface QualityPatterns {
  emotionalDepth: number;
  characterDevelopment: number;
  plotCoherence: number;
  styleConsistency: number;
}

export interface ContentAnalysis {
  wordCount: number;
  readabilityScore: number;
  emotionalTone: string;
  keyThemes: string[];
}

export interface ReaderMetrics {
  engagementScore: number;
  retentionRate: number;
  averageReadingTime: number;
  completionRate: number;
}

export interface CompletionCriteria {
  minChapters: number;
  plotResolution: boolean;
  characterArcs: boolean;
  satisfyingEnding: boolean;
}

export interface CreativityMode {
  enabled: boolean;
  level: 'standard' | 'enhanced' | 'maximum';
  budget: number;
}

export interface EmotionalDepth {
  intensity: number;
  variety: number;
  authenticity: number;
  progression: number;
}

export interface StoryPacing {
  tempo: 'slow' | 'medium' | 'fast';
  tension: number;
  climaxPositioning: number;
  resolutionLength: number;
}

export interface TokenBalancing {
  efficiency: number;
  costPerChapter: number;
  qualityRatio: number;
  optimization: boolean;
}

export interface ProcessingResult {
  success: boolean;
  output?: string;
  error?: string;
  metrics?: unknown;
}

export interface QualityMetrics {
  score: number;
  threshold: number;
  aspects: Record<string, number>;
  passed: boolean;
  overallScore?: number;
  readabilityScore?: number;
  creativityScore?: number;
  consistencyScore?: number;
  engagementScore?: number;
  breakdown?: {
    structure: number;
    characterization: number;
    dialogue: number;
    pacing: number;
    worldBuilding: number;
  };
}

export interface PerformanceRecord {
  timestamp: Date;
  operation: string;
  duration: number;
  success: boolean;
  resourceUsage: number;
}

export interface Platform {
  name: string;
  version: string;
  capabilities: string[];
  limits: {
    maxTokens: number;
    maxRequests: number;
    maxConcurrency: number;
  };
}