/**
 * 통합 품질 & 분석 엔진
 * 7개 품질/분석 관련 파일을 2개로 통합하는 핵심 컴포넌트
 *
 * 통합 대상:
 * - quality-assurance-engine.js (핵심 유지)
 * - reader-analytics-engine.js ✓
 * - completion-criteria-engine.js ✓
 * - creativity-mode-engine.js ✓
 * - emotional-depth-engine.js ✓
 * - story-pacing-engine.js ✓
 * - token-balancing-engine.js ✓
 */

import { PlatformConfigEngine } from './platform-config-engine.js';

/**
 * 통합 품질 보증 및 분석 엔진
 */
export class QualityAnalyticsEngine {
  constructor(platform = null) {
    // 플랫폼 설정
    this.platformConfig = new PlatformConfigEngine();
    if (platform) {
      this.platformConfig.setPlatform(platform);
    }

    this.qualityStandards = this.platformConfig.getQualityStandards();

    // =================
    // 품질 보증 설정
    // =================
    this.qualityPatterns = {
      excellentEmotions: [
        '가슴속에서',
        '마음속에서',
        '눈동자에',
        '목소리에',
        '표정에',
        '설렘',
        '두근거림',
        '떨림',
        '간절함',
        '그리움',
        '안타까움',
      ],
      excellentDescriptions: [
        '생생하게',
        '선명하게',
        '구체적으로',
        '세밀하게',
        '정교하게',
        '달빛이',
        '별빛이',
        '황금빛이',
        '은빛이',
        '신비로운 빛이',
      ],
      excellentDialogue: [
        '속삭임으로',
        '떨리는 목소리로',
        '진심을 담아',
        '간절히',
        '조심스럽게',
        '단호하게',
        '부드럽게',
        '따뜻하게',
        '차가운 목소리로',
      ],
      excellentTransitions: [
        '그 순간',
        '갑자기',
        '문득',
        '잠시 후',
        '그러나',
        '하지만',
        '동시에',
        '이윽고',
        '마침내',
        '결국',
        '그제서야',
      ],
      poorPatterns: [
        '갑자기',
        '그때',
        '그러면',
        '그리고',
        '그래서',
        '매우',
        '정말',
        '진짜',
        '완전',
        '엄청',
      ],
      clichePatterns: [
        '운명적인 만남',
        '첫눈에 반했다',
        '심장이 멈췄다',
        '완벽한 남자',
        '천사같은 미소',
        '악마같은 매력',
      ],
    };

    // =================
    // 독자 분석 설정
    // =================
    this.readerMetrics = {
      readingTime: new Map(),
      completionRate: new Map(),
      dropoutPoints: new Map(),
      emotionTracking: new Map(),
      engagementScore: new Map(),
    };

    this.analyticsConfig = {
      thresholds: {
        criticalDropout: 0.3,
        lowEngagement: 0.4,
        slowReading: 300,
        fastReading: 30,
        emotionStagnation: 5,
      },
      weights: {
        completionRate: 0.3,
        readingTime: 0.2,
        emotionVariety: 0.25,
        returnRate: 0.15,
        shareActivity: 0.1,
      },
      analysisWindow: 10,
    };

    // =================
    // 완결 기준 설정
    // =================
    this.completionCriteria = {
      minimumChapters: 50,
      maximumChapters: 100,
      idealChapters: 75,

      storyArcStages: {
        exposition: { weight: 10, keywords: ['시작', '소개', '설정'] },
        risingAction: { weight: 30, keywords: ['발전', '갈등', '상승'] },
        climax: { weight: 20, keywords: ['절정', '클라이맥스', '최고조'] },
        fallingAction: { weight: 25, keywords: ['해결', '정리', '수습'] },
        resolution: { weight: 15, keywords: ['결말', '마무리', '완결'] },
      },

      relationshipStages: {
        hostility: { progress: 0, description: '적대적 관계' },
        tension: { progress: 25, description: '긴장과 갈등' },
        attraction: { progress: 50, description: '서로에 대한 끌림' },
        confession: { progress: 75, description: '고백과 감정 확인' },
        union: { progress: 100, description: '결합과 완성' },
      },
    };

    // =================
    // 창의성 모드 설정
    // =================
    this.creativityConfig = {
      modes: {
        efficiency: { budget: 'low', focus: 'speed', quality: 'acceptable' },
        balanced: { budget: 'medium', focus: 'balance', quality: 'good' },
        creativity: { budget: 'unlimited', focus: 'quality', quality: 'excellent' },
      },

      triggers: {
        readerDropout: 0.3,
        lowEngagement: 0.4,
        qualityDrop: 0.6,
        competitiveThreats: true,
        keyMoments: ['first_meeting', 'confession', 'climax', 'resolution'],
      },

      strategicMoments: [
        { type: 'first_meeting', chapters: [1, 2], priority: 'high' },
        { type: 'first_conflict', chapters: [3, 5], priority: 'medium' },
        { type: 'turning_point', chapters: [15, 25], priority: 'high' },
        { type: 'confession', chapters: [45, 55], priority: 'critical' },
        { type: 'climax', chapters: [60, 65], priority: 'critical' },
        { type: 'resolution', chapters: [70, 75], priority: 'high' },
      ],
    };

    // =================
    // 감정 깊이 설정
    // =================
    this.emotionalConfig = {
      emotionTypes: {
        love: { intensity: [1, 10], keywords: ['사랑', '애정', '그리움'] },
        tension: { intensity: [1, 10], keywords: ['긴장', '불안', '초조'] },
        passion: { intensity: [1, 10], keywords: ['열정', '욕망', '간절함'] },
        conflict: { intensity: [1, 10], keywords: ['갈등', '분노', '좌절'] },
        resolution: { intensity: [1, 10], keywords: ['해결', '안도', '만족'] },
      },

      emotionalArcPatterns: {
        'enemies-to-lovers': [
          { chapters: [1, 15], primary: 'conflict', secondary: 'tension' },
          { chapters: [16, 30], primary: 'tension', secondary: 'attraction' },
          { chapters: [31, 45], primary: 'passion', secondary: 'conflict' },
          { chapters: [46, 60], primary: 'love', secondary: 'resolution' },
          { chapters: [61, 75], primary: 'resolution', secondary: 'love' },
        ],
      },
    };

    // =================
    // 스토리 페이싱 설정
    // =================
    this.pacingConfig = {
      paceTypes: {
        slow: { wordsPerChapter: [1500, 2500], intensity: 'low' },
        medium: { wordsPerChapter: [2500, 3500], intensity: 'medium' },
        fast: { wordsPerChapter: [3500, 5000], intensity: 'high' },
      },

      storyRhythm: {
        introduction: 'slow',
        development: 'medium',
        climax: 'fast',
        resolution: 'medium',
      },

      tensionCurve: {
        peaks: [15, 30, 45, 60], // 긴장이 최고조에 달하는 챕터들
        valleys: [10, 25, 40, 55], // 휴식 구간
        crescendo: [55, 60, 65], // 최종 클라이맥스 구간
      },
    };

    // =================
    // 토큰 밸런싱 설정
    // =================
    this.tokenConfig = {
      budgetLevels: {
        efficiency: { dailyLimit: 100000, perChapter: 8000 },
        balanced: { dailyLimit: 200000, perChapter: 15000 },
        creativity: { dailyLimit: 500000, perChapter: 30000 },
      },

      costOptimization: {
        cacheHitReduction: 0.3,
        templateReuse: 0.2,
        incrementalImprovement: 0.15,
      },

      priorityAllocation: {
        newNovel: 0.4,
        keyChapters: 0.3,
        qualityImprovement: 0.2,
        maintenance: 0.1,
      },
    };

    // 통합 캐시 시스템
    this.cache = {
      qualityScores: new Map(),
      readerAnalytics: new Map(),
      emotionHistory: new Map(),
      tokenUsage: new Map(),
      trendCache: new Map(),
    };

    // 모니터링 데이터
    this.currentMode = 'balanced';
    this.dailyTokenUsage = 0;
    this.qualityTrend = [];
    this.readerFeedback = [];
  }

  // =================
  // 품질 평가 메서드
  // =================

  /**
   * 통합 품질 평가
   */
  async assessQuality(content, context = {}) {
    console.log('📊 통합 품질 평가 시작...');

    const scores = {
      emotional: this.assessEmotionalQuality(content),
      technical: this.assessTechnicalQuality(content),
      engagement: this.assessEngagement(content),
      pacing: this.assessPacing(content, context),
      character: this.assessCharacterVoice(content),
      narrative: this.assessNarrativeFlow(content),
    };

    const totalScore = this.calculateWeightedScore(scores);
    const improvements = this.generateImprovementSuggestions(scores);

    // 캐시에 저장
    if (context.chapterNumber) {
      this.cache.qualityScores.set(context.chapterNumber, {
        scores,
        totalScore,
        timestamp: Date.now(),
      });
    }

    return {
      score: Math.round(totalScore),
      breakdown: scores,
      improvements,
      grade: this.getQualityGrade(totalScore),
    };
  }

  /**
   * 감정 품질 평가
   */
  assessEmotionalQuality(content) {
    let score = 50;

    // 우수 감정 표현 검사
    this.qualityPatterns.excellentEmotions.forEach(pattern => {
      if (content.includes(pattern)) score += 5;
    });

    // 클리셰 패턴 검사
    this.qualityPatterns.clichePatterns.forEach(pattern => {
      if (content.includes(pattern)) score -= 10;
    });

    // 감정 변화의 자연스러움
    const emotionWords = ['슬픔', '기쁨', '분노', '사랑', '두려움'];
    const foundEmotions = emotionWords.filter(emotion => content.includes(emotion));
    if (foundEmotions.length > 2) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 기술적 품질 평가
   */
  assessTechnicalQuality(content) {
    let score = 60;

    // 문장 구조 다양성
    const sentences = content.split(/[.!?]/);
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    if (avgLength > 20 && avgLength < 60) score += 10;

    // 반복 표현 검사
    const words = content.split(/\s+/);
    const wordFreq = new Map();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    const maxFreq = Math.max(...wordFreq.values());
    if (maxFreq > words.length * 0.1) score -= 20; // 10% 이상 반복시 감점

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 독자 참여도 평가
   */
  assessEngagement(content) {
    let score = 55;

    // 대화의 비율
    const dialogueMatches = content.match(/"[^"]*"/g) || [];
    const dialogueRatio = dialogueMatches.join('').length / content.length;
    if (dialogueRatio > 0.2 && dialogueRatio < 0.6) score += 15;

    // 액션/긴장감 키워드
    const tensionKeywords = ['갑자기', '순간', '놀라', '충격', '위험'];
    tensionKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 3;
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 페이싱 평가
   */
  assessPacing(content, context) {
    const wordCount = content.split(/\s+/).length;
    const chapterNumber = context.chapterNumber || 1;

    let expectedPace = 'medium';
    if (chapterNumber <= 15) expectedPace = 'slow';
    else if (chapterNumber >= 46 && chapterNumber <= 60) expectedPace = 'fast';

    const paceRange = this.pacingConfig.paceTypes[expectedPace].wordsPerChapter;

    if (wordCount >= paceRange[0] && wordCount <= paceRange[1]) {
      return 85; // 적절한 페이싱
    } else if (wordCount < paceRange[0]) {
      return 60; // 너무 짧음
    } else {
      return 70; // 너무 길음
    }
  }

  /**
   * 캐릭터 목소리 평가
   */
  assessCharacterVoice(content) {
    // 캐릭터 목소리 일관성 평가 (간단한 구현)
    let score = 60;

    // 대화 태그 일관성 체크
    const dialogueTags = content.match(/"[^"]*"/g) || [];
    if (dialogueTags.length > 0) {
      score += 15; // 대화가 있으면 가점
    }

    // 캐릭터별 말투 차이 (임시 구현)
    const characterNames = ['아린델', '케이런', '아이라린', '케이든', '아리엔'];
    const foundCharacters = characterNames.filter(name => content.includes(name));
    if (foundCharacters.length >= 2) {
      score += 10; // 여러 캐릭터가 등장하면 가점
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 서사 흐름 평가
   */
  assessNarrativeFlow(content) {
    let score = 60;

    // 전환어 사용
    this.qualityPatterns.excellentTransitions.forEach(transition => {
      if (content.includes(transition)) score += 3;
    });

    // 단락 구성
    const paragraphs = content.split('\n\n');
    if (paragraphs.length >= 3 && paragraphs.length <= 8) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  // =================
  // 독자 분석 메서드
  // =================

  /**
   * 독자 참여도 분석
   */
  analyzeReaderEngagement(novelSlug, chapterNumber) {
    // 가상 데이터 (실제로는 외부 분석 도구에서 수집)
    const mockData = {
      readingTime: 180 + Math.random() * 120, // 180-300초
      completionRate: 0.7 + Math.random() * 0.25, // 70-95%
      dropoutPoint: Math.random(),
      emotionReaction: Math.random() * 10,
      returnRate: 0.8 + Math.random() * 0.15,
    };

    // 분석 결과 계산
    const engagementScore = this.calculateEngagementScore(mockData);
    const trend = this.analyzeEngagementTrend(novelSlug, chapterNumber);
    const alerts = this.checkEngagementAlerts(mockData);

    return {
      score: engagementScore,
      trend,
      alerts,
      recommendations: this.generateEngagementRecommendations(mockData),
    };
  }

  /**
   * 참여도 점수 계산
   */
  calculateEngagementScore(data) {
    const weights = this.analyticsConfig.weights;

    let score = 0;
    score += (data.completionRate || 0) * weights.completionRate * 100;
    score += this.normalizeReadingTime(data.readingTime) * weights.readingTime * 100;
    score += (data.emotionReaction || 0) * weights.emotionVariety * 10;
    score += (data.returnRate || 0) * weights.returnRate * 100;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * 읽기 시간 정규화
   */
  normalizeReadingTime(time) {
    const { fastReading, slowReading } = this.analyticsConfig.thresholds;
    if (time < fastReading) return 0.3; // 너무 빠름 (스킵)
    if (time > slowReading) return 0.5; // 너무 느림 (지루함)
    return 1.0; // 적절함
  }

  // =================
  // 완결 기준 메서드
  // =================

  /**
   * 소설 완결 가능성 체크
   */
  checkStoryCompletion(novel) {
    const criteria = {
      minChaptersMet: novel.currentChapter >= this.completionCriteria.minimumChapters,
      mainConflictResolved: this.checkMainConflictResolution(novel),
      relationshipFinalized: this.checkRelationshipCompletion(novel),
      subplotsWrapped: this.checkSubplotCompletion(novel),
      characterArcsComplete: this.checkCharacterGrowthCompletion(novel),
    };

    const readyCount = Object.values(criteria).filter(Boolean).length;
    const totalCriteria = Object.keys(criteria).length;

    return {
      ready: readyCount === totalCriteria,
      completionPercentage: Math.round((readyCount / totalCriteria) * 100),
      criteria,
      estimatedChaptersToCompletion: this.estimateRemainingChapters(novel, criteria),
    };
  }

  /**
   * 메인 갈등 해결 체크
   */
  checkMainConflictResolution(novel) {
    return novel.currentChapter >= this.completionCriteria.minimumChapters * 0.8;
  }

  /**
   * 관계 완성도 체크
   */
  checkRelationshipCompletion(novel) {
    return novel.relationshipStage === 'union' || novel.currentChapter >= 70;
  }

  /**
   * 서브플롯 완성도 체크
   */
  checkSubplotCompletion(novel) {
    return !novel.openThreads || novel.openThreads.length === 0;
  }

  /**
   * 캐릭터 성장 완성도 체크
   */
  checkCharacterGrowthCompletion(novel) {
    if (!novel.characters) return true;
    return novel.characters.every(char => char.growthArc >= 80);
  }

  /**
   * 남은 챕터 수 추정
   */
  estimateRemainingChapters(novel, criteria) {
    const completionRate =
      Object.values(criteria).filter(Boolean).length / Object.keys(criteria).length;
    const targetChapters = this.completionCriteria.idealChapters;

    if (completionRate >= 0.8) {
      return Math.max(0, targetChapters - novel.currentChapter);
    } else {
      return Math.round((targetChapters - novel.currentChapter) * (1 - completionRate + 0.5));
    }
  }

  // =================
  // 창의성 모드 메서드
  // =================

  /**
   * 창의성 모드 결정
   */
  determineCreativityMode(context) {
    const { chapterNumber, readerData, qualityHistory } = context;

    // 전략적 순간 체크
    const isStrategicMoment = this.creativityConfig.strategicMoments.some(
      moment => chapterNumber >= moment.chapters[0] && chapterNumber <= moment.chapters[1]
    );

    // 독자 이탈 체크
    const hasReaderIssues =
      readerData &&
      (readerData.dropoutRate > this.creativityConfig.triggers.readerDropout ||
        readerData.engagement < this.creativityConfig.triggers.lowEngagement);

    // 품질 하락 체크
    const hasQualityIssues = qualityHistory && qualityHistory.slice(-3).every(score => score < 70);

    if (isStrategicMoment || hasReaderIssues || hasQualityIssues) {
      return 'creativity';
    } else if (chapterNumber <= 10 || chapterNumber >= 65) {
      return 'balanced';
    } else {
      return 'efficiency';
    }
  }

  // =================
  // 토큰 밸런싱 메서드
  // =================

  /**
   * 토큰 예산 계산
   */
  calculateTokenBudget(mode, chapterType) {
    const budget = this.tokenConfig.budgetLevels[mode];
    const allocation = this.tokenConfig.priorityAllocation;

    let baseAllocation = budget.perChapter;

    // 챕터 타입별 조정
    if (chapterType === 'new_novel') {
      baseAllocation *= 1 + allocation.newNovel;
    } else if (chapterType === 'key_chapter') {
      baseAllocation *= 1 + allocation.keyChapters;
    } else if (chapterType === 'quality_improvement') {
      baseAllocation *= 1 + allocation.qualityImprovement;
    }

    return Math.round(baseAllocation);
  }

  /**
   * 토큰 사용량 모니터링
   */
  trackTokenUsage(amount, operation) {
    this.dailyTokenUsage += amount;

    console.log(`💰 토큰 사용: ${amount} (총 ${this.dailyTokenUsage})`);

    // 예산 초과 경고
    const currentBudget = this.tokenConfig.budgetLevels[this.currentMode].dailyLimit;
    if (this.dailyTokenUsage > currentBudget * 0.8) {
      console.warn('⚠️ 일일 토큰 예산의 80% 사용됨');
    }

    return {
      used: amount,
      total: this.dailyTokenUsage,
      remaining: currentBudget - this.dailyTokenUsage,
      percentage: (this.dailyTokenUsage / currentBudget) * 100,
    };
  }

  // =================
  // 헬퍼 메서드들
  // =================

  calculateWeightedScore(scores) {
    const weights = {
      emotional: 0.25,
      technical: 0.2,
      engagement: 0.2,
      pacing: 0.15,
      character: 0.1,
      narrative: 0.1,
    };

    return Object.entries(scores).reduce(
      (total, [key, score]) => total + score * (weights[key] || 0),
      0
    );
  }

  getQualityGrade(score) {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  generateImprovementSuggestions(scores) {
    const suggestions = [];

    if (scores.emotional < 70) {
      suggestions.push('감정 표현을 더 섬세하고 구체적으로 작성하세요');
    }
    if (scores.technical < 70) {
      suggestions.push('문장 구조를 다양화하고 반복 표현을 줄이세요');
    }
    if (scores.engagement < 70) {
      suggestions.push('대화와 액션의 비율을 조정하여 긴장감을 높이세요');
    }

    return suggestions;
  }

  // 상태 관리
  resetDailyUsage() {
    this.dailyTokenUsage = 0;
    console.log('🔄 일일 토큰 사용량 리셋');
  }

  setMode(mode) {
    if (this.creativityConfig.modes[mode]) {
      this.currentMode = mode;
      console.log(`🎯 창의성 모드 변경: ${mode}`);
    }
  }
}

// 편의 함수들
export function createQualityEngine(platform) {
  return new QualityAnalyticsEngine(platform);
}

export const qualityAnalyticsEngine = new QualityAnalyticsEngine();
