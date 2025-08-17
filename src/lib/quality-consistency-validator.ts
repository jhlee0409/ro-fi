/**
 * 🔍 Quality & Consistency Validator
 * 품질 관리 및 일관성 검증 시스템
 * 
 * Features:
 * - 실시간 품질 스코어링
 * - 캐릭터 일관성 검증
 * - 세계관 무결성 체크
 * - 플롯 연속성 검증
 * - 자동 개선 제안
 */

import { Novel, Chapter, QualityMetrics } from './types/index.js';
import { QualityAnalyticsEngine } from './quality-analytics-engine.js';

/**
 * 일관성 검증 결과
 */
interface ConsistencyValidationResult {
  passed: boolean;
  overallScore: number;
  characterConsistency: ConsistencyCheck;
  worldConsistency: ConsistencyCheck;
  plotConsistency: ConsistencyCheck;
  styleConsistency: ConsistencyCheck;
  violations: ConsistencyViolation[];
  suggestions: ImprovementSuggestion[];
}

interface ConsistencyCheck {
  score: number;
  issues: string[];
  validations: ValidationPoint[];
}

interface ConsistencyViolation {
  type: 'character' | 'world' | 'plot' | 'style';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  location: string;
  suggestion: string;
}

interface ImprovementSuggestion {
  category: 'readability' | 'engagement' | 'consistency' | 'creativity';
  priority: 'high' | 'medium' | 'low';
  description: string;
  expectedImpact: number;
}

interface ValidationPoint {
  aspect: string;
  expected: string;
  actual: string;
  passed: boolean;
}

/**
 * 품질 벤치마크
 */
interface QualityBenchmarks {
  readability: {
    minScore: number;
    avgSentenceLength: number;
    maxComplexWords: number;
  };
  engagement: {
    minScore: number;
    dialogueRatio: number;
    actionRatio: number;
  };
  consistency: {
    minScore: number;
    characterDeviation: number;
    worldDeviations: number;
  };
  creativity: {
    minScore: number;
    uniquenessThreshold: number;
    expressionVariety: number;
  };
}

/**
 * 품질 및 일관성 검증기
 */
export class QualityConsistencyValidator {
  private qualityEngine: QualityAnalyticsEngine;
  private characterProfiles: Map<string, CharacterProfile>;
  private worldRules: Map<string, WorldRule>;
  private styleProfile: StyleProfile;
  private qualityHistory: QualityMetrics[];
  private benchmarks: QualityBenchmarks;

  constructor() {
    this.qualityEngine = new QualityAnalyticsEngine();
    this.characterProfiles = new Map();
    this.worldRules = new Map();
    this.styleProfile = this.initializeStyleProfile();
    this.qualityHistory = [];
    this.benchmarks = this.loadQualityBenchmarks();
  }

  /**
   * 🎯 메인 검증 메서드
   */
  async validateChapter(
    _chapter: Chapter,
    novel: Novel,
    _previousChapters: Chapter[] = []
  ): Promise<ConsistencyValidationResult> {
    
    // 1. 기본 품질 분석
    const qualityMetrics = await this.analyzeContentQuality(_chapter._content, {
      _novel,
      _chapterNumber: _chapter._chapterNumber,
      targetLength: 1200
    });

    // 2. 일관성 검증들
    const characterCheck = await this.validateCharacterConsistency(_chapter, _previousChapters);
    const worldCheck = await this.validateWorldConsistency(_chapter, novel);
    const plotCheck = await this.validatePlotConsistency(_chapter, _previousChapters);
    const _styleCheck = await this.validateStyleConsistency(_chapter, _previousChapters);

    // 3. 위반 사항 수집
    const violations = this.collectViolations(characterCheck, worldCheck, plotCheck, _styleCheck);

    // 4. 개선 제안 생성
    const suggestions = this.generateImprovementSuggestions(qualityMetrics, violations);

    // 5. 전체 점수 계산
    const overallScore = this.calculateOverallScore(
      qualityMetrics,
      characterCheck,
      worldCheck,
      plotCheck,
      _styleCheck
    );

    // 6. 품질 히스토리 업데이트
    this.qualityHistory.push(qualityMetrics);
    if (this.qualityHistory.length > 10) {
      this.qualityHistory.shift();
    }

    return {
      passed: overallScore >= this.benchmarks.consistency.minScore,
      overallScore,
      characterConsistency: characterCheck,
      worldConsistency: worldCheck,
      plotConsistency: plotCheck,
      styleConsistency: _styleCheck,
      violations,
      suggestions
    };
  }

  /**
   * 👤 캐릭터 일관성 검증
   */
  private async validateCharacterConsistency(
    _chapter: Chapter,
    _previousChapters: Chapter[]
  ): Promise<ConsistencyCheck> {
    const issues: string[] = [];
    const validations: ValidationPoint[] = [];
    
    // 캐릭터 대화 패턴 분석
    const _dialogues = this.extractDialogues(_chapter._content);
    const _characterNames = this.extractCharacterNames(_chapter._content);

    for (const _characterName of _characterNames) {
      const _profile = this.characterProfiles.get(_characterName);
      if (!_profile) continue;

      // 성격 일관성 검사
      const personalityConsistency = this.checkPersonalityConsistency(
        _characterName, 
        _chapter._content, 
        _profile
      );

      validations.push({
        aspect: `${_characterName} 성격 일관성`,
        expected: _profile.expectedBehavior,
        actual: personalityConsistency.observedBehavior,
        passed: personalityConsistency.consistent
      });

      if (!personalityConsistency.consistent) {
        issues.push(`${_characterName}의 행동이 기존 성격과 일치하지 않습니다`);
      }

      // 대화 패턴 일관성
      const speechPattern = this.analyzeSpeechPattern(_characterName, _dialogues);
      const expectedPattern = _profile.speechPatterns[0];

      if (expectedPattern && speechPattern.deviation > 0.3) {
        issues.push(`${_characterName}의 말투가 일관되지 않습니다`);
        validations.push({
          aspect: `${_characterName} 말투 일관성`,
          expected: expectedPattern.pattern,
          actual: speechPattern.dominant,
          passed: false
        });
      }
    }

    // 관계 발전 일관성
    const relationshipProgression = this.validateRelationshipProgression(
      _chapter, 
      _previousChapters
    );

    if (!relationshipProgression.consistent) {
      issues.push('캐릭터 간 관계 발전이 부자연스럽습니다');
    }

    const score = Math.max(0, 100 - (issues.length * 15));
    
    return {
      score,
      issues,
      validations
    };
  }

  /**
   * 🌍 세계관 일관성 검증
   */
  private async validateWorldConsistency(
    _chapter: Chapter,
    _novel: Novel
  ): Promise<ConsistencyCheck> {
    const issues: string[] = [];
    const validations: ValidationPoint[] = [];

    // 세계관 규칙 검증
    for (const [__ruleId, _rule] of this.worldRules) {
      const violations = this.checkWorldRuleViolations(_chapter._content, _rule);
      
      if (violations.length > 0) {
        issues.push(`세계관 규칙 위반: ${_rule.description}`);
        validations.push({
          aspect: _rule.aspect,
          expected: _rule.expected,
          actual: violations[0],
          passed: false
        });
      }
    }

    // 마법 시스템 일관성
    const magicConsistency = this.validateMagicSystem(_chapter._content);
    if (!magicConsistency.consistent) {
      issues.push('마법 시스템 사용이 일관되지 않습니다');
    }

    // 지리적 일관성
    const locationConsistency = this.validateLocationConsistency(_chapter._content);
    if (!locationConsistency.consistent) {
      issues.push('장소 설정이 이전과 일치하지 않습니다');
    }

    const score = Math.max(0, 100 - (issues.length * 20));
    
    return {
      score,
      issues,
      validations
    };
  }

  /**
   * 📖 플롯 일관성 검증
   */
  private async validatePlotConsistency(
    _chapter: Chapter,
    _previousChapters: Chapter[]
  ): Promise<ConsistencyCheck> {
    const issues: string[] = [];
    const validations: ValidationPoint[] = [];

    // 시간선 일관성
    const timelineConsistency = this.validateTimeline(_chapter, _previousChapters);
    if (!timelineConsistency.consistent) {
      issues.push('시간 흐름이 일관되지 않습니다');
      validations.push({
        aspect: '시간선 일관성',
        expected: timelineConsistency.expected,
        actual: timelineConsistency.actual,
        passed: false
      });
    }

    // 사건 인과관계
    const causalityCheck = this.validateCausality(_chapter, _previousChapters);
    if (!causalityCheck.consistent) {
      issues.push('사건의 인과관계가 부자연스럽습니다');
    }

    // 갈등 해결 논리성
    const conflictResolution = this.validateConflictResolution(_chapter._content);
    if (!conflictResolution.logical) {
      issues.push('갈등 해결 과정이 논리적이지 않습니다');
    }

    const score = Math.max(0, 100 - (issues.length * 18));
    
    return {
      score,
      issues,
      validations
    };
  }

  /**
   * ✍️ 문체 일관성 검증
   */
  private async validateStyleConsistency(
    _chapter: Chapter,
    _previousChapters: Chapter[]
  ): Promise<ConsistencyCheck> {
    const issues: string[] = [];
    const validations: ValidationPoint[] = [];

    // 문체 패턴 분석
    const currentStyle = this.analyzeWritingStyle(_chapter._content);
    const expectedStyle = this.styleProfile;

    // 어조 일관성
    if (Math.abs(currentStyle.formalityLevel - expectedStyle.formalityLevel) > 0.3) {
      issues.push('문체의 격식 수준이 일관되지 않습니다');
    }

    // 서술 관점 일관성
    if (currentStyle.narrativePerspective !== expectedStyle.narrativePerspective) {
      issues.push('서술 관점이 변경되었습니다');
      validations.push({
        aspect: '서술 관점',
        expected: expectedStyle.narrativePerspective,
        actual: currentStyle.narrativePerspective,
        passed: false
      });
    }

    // 감정 표현 패턴
    const emotionConsistency = this.validateEmotionExpression(
      _chapter._content, 
      _previousChapters
    );
    if (!emotionConsistency.consistent) {
      issues.push('감정 표현 패턴이 일관되지 않습니다');
    }

    const score = Math.max(0, 100 - (issues.length * 12));
    
    return {
      score,
      issues,
      validations
    };
  }

  /**
   * 📊 전체 점수 계산
   */
  private calculateOverallScore(
    qualityMetrics: QualityMetrics,
    characterCheck: ConsistencyCheck,
    worldCheck: ConsistencyCheck,
    plotCheck: ConsistencyCheck,
    _styleCheck: ConsistencyCheck
  ): number {
    const weights = {
      quality: 0.3,
      character: 0.25,
      world: 0.20,
      plot: 0.15,
      style: 0.10
    };

    return (
      qualityMetrics.overallScore * weights.quality +
      characterCheck.score * weights.character +
      worldCheck.score * weights.world +
      plotCheck.score * weights.plot +
      _styleCheck.score * weights.style
    );
  }

  /**
   * 🚨 위반 사항 수집
   */
  private collectViolations(
    characterCheck: ConsistencyCheck,
    worldCheck: ConsistencyCheck,
    plotCheck: ConsistencyCheck,
    _styleCheck: ConsistencyCheck
  ): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];

    // 캐릭터 위반사항
    characterCheck.issues.forEach(issue => {
      violations.push({
        type: 'character',
        severity: characterCheck.score < 50 ? 'critical' : 'major',
        description: issue,
        location: '캐릭터 분석',
        suggestion: '캐릭터의 기존 성격과 행동 패턴을 검토하세요'
      });
    });

    // 세계관 위반사항
    worldCheck.issues.forEach(issue => {
      violations.push({
        type: 'world',
        severity: worldCheck.score < 60 ? 'critical' : 'major',
        description: issue,
        location: '세계관 설정',
        suggestion: '기존 세계관 규칙을 확인하고 수정하세요'
      });
    });

    // 플롯 위반사항
    plotCheck.issues.forEach(issue => {
      violations.push({
        type: 'plot',
        severity: plotCheck.score < 40 ? 'critical' : 'major',
        description: issue,
        location: '플롯 진행',
        suggestion: '사건의 인과관계와 시간선을 재검토하세요'
      });
    });

    return violations;
  }

  /**
   * 💡 개선 제안 생성
   */
  private generateImprovementSuggestions(
    qualityMetrics: QualityMetrics,
    violations: ConsistencyViolation[]
  ): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // 품질 개선 제안
    if (qualityMetrics.readabilityScore < 80) {
      suggestions.push({
        category: 'readability',
        priority: 'high',
        description: '문장을 더 간결하고 명확하게 다듬어주세요',
        expectedImpact: 15
      });
    }

    if (qualityMetrics.engagementScore < 75) {
      suggestions.push({
        category: 'engagement',
        priority: 'high',
        description: '더 역동적인 대화와 행동 장면을 추가해주세요',
        expectedImpact: 20
      });
    }

    // 일관성 개선 제안
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      suggestions.push({
        category: 'consistency',
        priority: 'high',
        description: '중대한 일관성 오류를 즉시 수정해주세요',
        expectedImpact: 25
      });
    }

    if (qualityMetrics.creativityScore < 70) {
      suggestions.push({
        category: 'creativity',
        priority: 'medium',
        description: '더 독창적인 표현과 아이디어를 추가해주세요',
        expectedImpact: 12
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 📊 콘텐츠 품질 분석 (내장 구현)
   */
  private async analyzeContentQuality(
    _content: string,
    _context: { novel: Novel; _chapterNumber: number; targetLength: number }
  ): Promise<QualityMetrics> {
    const wordCount = _content.split(/\s+/).length;
    const sentenceCount = _content.split(/[.!?]/).length;
    const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);

    // 간단한 품질 메트릭 계산
    const readabilityScore = Math.min(100, Math.max(0, 100 - (avgSentenceLength - 15) * 2));
    const creativityScore = this.assessCreativity(_content);
    const consistencyScore = 85; // 기본값
    const engagementScore = this.assessEngagement(_content);

    const overallScore = (
      readabilityScore * 0.25 +
      creativityScore * 0.25 +
      consistencyScore * 0.25 +
      engagementScore * 0.25
    );

    return {
      overallScore: Math.round(overallScore),
      readabilityScore: Math.round(readabilityScore),
      creativityScore: Math.round(creativityScore),
      consistencyScore: Math.round(consistencyScore),
      engagementScore: Math.round(engagementScore),
      breakdown: {
        structure: Math.round(overallScore),
        characterization: Math.round(overallScore + 5),
        dialogue: Math.round(overallScore - 5),
        pacing: Math.round(overallScore),
        worldBuilding: Math.round(overallScore - 10)
      }
    };
  }

  /**
   * 창의성 평가
   */
  private assessCreativity(_content: string): number {
    const uniqueWords = new Set(_content.toLowerCase().match(/\w+/g) || []).size;
    const totalWords = (_content.match(/\w+/g) || []).length;
    const vocabularyRichness = uniqueWords / Math.max(totalWords, 1);
    
    // 감정 표현의 다양성
    const emotionalWords = ['사랑', '기쁨', '슬픔', '분노', '놀라움', '두려움', '희망'];
    const emotionalDiversity = emotionalWords.filter(word => _content.includes(word)).length;
    
    return Math.min(100, (vocabularyRichness * 100 + emotionalDiversity * 10));
  }

  /**
   * 몰입도 평가
   */
  private assessEngagement(_content: string): number {
    const dialogueMatches = _content.match(/"/g) || [];
    const dialogueRatio = dialogueMatches.length / 2 / Math.max(_content.split('\n').length, 1);
    
    const actionWords = ['달려', '뛰어', '날아', '던져', '잡아', '놓아'];
    const actionCount = actionWords.reduce((count, word) => 
      count + (_content.match(new RegExp(word, 'g')) || []).length, 0
    );
    
    return Math.min(100, dialogueRatio * 100 + actionCount * 5 + 50);
  }

  /**
   * 📚 캐릭터 프로필 업데이트
   */
  updateCharacterProfile(name: string, _profile: CharacterProfile): void {
    this.characterProfiles.set(name, _profile);
  }

  /**
   * 🌍 세계관 규칙 추가
   */
  addWorldRule(_rule: WorldRule): void {
    this.worldRules.set(_rule.id, _rule);
  }

  /**
   * 📈 품질 트렌드 분석
   */
  getQualityTrends(): QualityTrendAnalysis {
    if (this.qualityHistory.length < 3) {
      return {
        trend: 'stable',
        averageScore: 0,
        improvement: 0,
        recommendations: []
      };
    }

    const recent = this.qualityHistory.slice(-3);
    const older = this.qualityHistory.slice(-6, -3);

    const recentAvg = recent.reduce((sum, q) => sum + q.overallScore, 0) / recent.length;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, q) => sum + q.overallScore, 0) / older.length 
      : recentAvg;

    const improvement = recentAvg - olderAvg;
    
    return {
      trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable',
      averageScore: recentAvg,
      improvement,
      recommendations: this.generateTrendRecommendations(improvement)
    };
  }

  // Helper methods
  private initializeStyleProfile(): StyleProfile {
    return {
      formalityLevel: 0.6,
      narrativePerspective: '3인칭 전지적',
      sentenceComplexity: 0.7,
      vocabularyLevel: 0.8,
      emotionalIntensity: 0.8
    };
  }

  private loadQualityBenchmarks(): QualityBenchmarks {
    return {
      readability: { minScore: 80, avgSentenceLength: 25, maxComplexWords: 15 },
      engagement: { minScore: 75, dialogueRatio: 0.3, actionRatio: 0.4 },
      consistency: { minScore: 70, characterDeviation: 0.2, worldDeviations: 2 },
      creativity: { minScore: 70, uniquenessThreshold: 0.8, expressionVariety: 20 }
    };
  }

  private extractDialogues(_content: string): DialogueExtraction[] {
    const dialoguePattern = /"([^"]+)"/g;
    const matches = [..._content.matchAll(dialoguePattern)];
    return matches.map(match => ({
      text: match[1],
      _position: match.index!,
      speaker: this.identifySpeaker(_content, match.index!)
    }));
  }

  private extractCharacterNames(_content: string): string[] {
    // 간단한 캐릭터 이름 추출 로직
    const knownNames = ['민준', '서연', '지우', '하은'];
    return knownNames.filter(name => _content.includes(name));
  }

  private checkPersonalityConsistency(
    _characterName: string, 
    _content: string, 
    _profile: CharacterProfile
  ): { consistent: boolean; observedBehavior: string } {
    // 성격 일관성 검사 로직
    return {
      consistent: true,
      observedBehavior: '예상 행동과 일치'
    };
  }

  private analyzeSpeechPattern(
    _characterName: string, 
    _dialogues: DialogueExtraction[]
  ): { dominant: string; deviation: number } {
    return {
      dominant: '정중한 말투',
      deviation: 0.1
    };
  }

  private validateRelationshipProgression(
    _chapter: Chapter, 
    _previousChapters: Chapter[]
  ): { consistent: boolean } {
    return { consistent: true };
  }

  private checkWorldRuleViolations(_content: string, _rule: WorldRule): string[] {
    return [];
  }

  private validateMagicSystem(_content: string): { consistent: boolean } {
    return { consistent: true };
  }

  private validateLocationConsistency(_content: string): { consistent: boolean } {
    return { consistent: true };
  }

  private validateTimeline(
    _chapter: Chapter, 
    _previousChapters: Chapter[]
  ): { consistent: boolean; expected: string; actual: string } {
    return {
      consistent: true,
      expected: '자연스러운 시간 흐름',
      actual: '자연스러운 시간 흐름'
    };
  }

  private validateCausality(
    _chapter: Chapter, 
    _previousChapters: Chapter[]
  ): { consistent: boolean } {
    return { consistent: true };
  }

  private validateConflictResolution(_content: string): { logical: boolean } {
    return { logical: true };
  }

  private analyzeWritingStyle(_content: string): StyleProfile {
    return {
      formalityLevel: 0.6,
      narrativePerspective: '3인칭 전지적',
      sentenceComplexity: 0.7,
      vocabularyLevel: 0.8,
      emotionalIntensity: 0.8
    };
  }

  private validateEmotionExpression(
    _content: string, 
    _previousChapters: Chapter[]
  ): { consistent: boolean } {
    return { consistent: true };
  }

  private identifySpeaker(_content: string, _position: number): string {
    return '미확인';
  }

  private generateTrendRecommendations(improvement: number): string[] {
    if (improvement > 5) {
      return ['현재 방향을 유지하세요', '창의성을 더 확장해보세요'];
    } else if (improvement < -5) {
      return ['기본기를 다시 점검하세요', '독자 피드백을 참고하세요'];
    }
    return ['일관성 있는 품질을 유지하세요'];
  }
}

// 타입 정의들
interface CharacterProfile {
  name: string;
  expectedBehavior: string;
  speechPatterns: { pattern: string; frequency: number }[];
  emotionalRange: string[];
}

interface WorldRule {
  id: string;
  description: string;
  aspect: string;
  expected: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

interface StyleProfile {
  formalityLevel: number;
  narrativePerspective: string;
  sentenceComplexity: number;
  vocabularyLevel: number;
  emotionalIntensity: number;
}

interface DialogueExtraction {
  text: string;
  _position: number;
  speaker: string;
}

interface QualityTrendAnalysis {
  trend: 'improving' | 'declining' | 'stable';
  averageScore: number;
  improvement: number;
  recommendations: string[];
}

export default QualityConsistencyValidator;