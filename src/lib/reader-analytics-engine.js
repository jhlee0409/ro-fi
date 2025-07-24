/**
 * 독자 분석 엔진
 * 독자의 행동 패턴과 참여도를 분석하여 창의성 모드 활성화를 위한 데이터 제공
 */

export class ReaderAnalyticsEngine {
  constructor() {
    // 분석 메트릭스 초기화
    this.metrics = {
      readingTime: new Map(),      // 챕터별 평균 읽기 시간
      completionRate: new Map(),   // 챕터별 완독률
      dropoutPoints: new Map(),    // 이탈 지점 분석
      emotionTracking: new Map(),  // 감정 반응 추적
      engagementScore: new Map()   // 참여도 점수
    };
    
    // 분석 설정
    this.config = {
      // 경고 임계값
      thresholds: {
        criticalDropout: 0.3,     // 30% 이상 이탈시 경고
        lowEngagement: 0.4,       // 40% 이하 참여도시 경고
        slowReading: 300,         // 300초 이상 걸리면 느린 읽기
        fastReading: 30,          // 30초 이하면 빠른 읽기 (스킵)
        emotionStagnation: 5      // 5화 연속 같은 감정
      },
      
      // 가중치 설정
      weights: {
        completionRate: 0.3,
        readingTime: 0.2,
        emotionVariety: 0.25,
        returnRate: 0.15,
        shareActivity: 0.1
      },
      
      // 분석 기간
      analysisWindow: 10  // 최근 10챕터 기준
    };
    
    // 가상 독자 데이터 (실제로는 외부 분석 도구 연동)
    this.mockReaderData = this.initializeMockData();
    
    // 감정 상태 추적
    this.emotionHistory = [];
    
    // 트렌드 분석 캐시
    this.trendCache = new Map();
    this.cacheExpiry = 1000 * 60 * 30; // 30분 캐시
  }

  /**
   * 가상 독자 데이터 초기화 (실제 구현시에는 제거)
   */
  initializeMockData() {
    return {
      totalReaders: 1000,
      activeReaders: 750,
      demographics: {
        ageGroups: { '18-25': 0.4, '26-35': 0.35, '36-45': 0.2, '46+': 0.05 },
        gender: { 'female': 0.85, 'male': 0.15 },
        readingHabits: { 'daily': 0.3, 'weekly': 0.5, 'occasional': 0.2 }
      }
    };
  }

  /**
   * 메인 메트릭스 수집 및 분석
   */
  async analyzeReaderMetrics(novelSlug, chapterNumber) {
    console.log(`📊 독자 분석 시작: ${novelSlug} - ${chapterNumber}화`);
    
    // 1. 기본 메트릭스 수집
    const basicMetrics = await this.collectBasicMetrics(novelSlug, chapterNumber);
    
    // 2. 참여도 분석
    const engagementAnalysis = this.analyzeEngagement(basicMetrics);
    
    // 3. 감정 반응 분석
    const emotionAnalysis = this.analyzeEmotionResponse(novelSlug, chapterNumber);
    
    // 4. 이탈 패턴 분석
    const dropoutAnalysis = this.analyzeDropoutPatterns(basicMetrics);
    
    // 5. 트렌드 분석
    const trendAnalysis = await this.analyzeTrends(novelSlug);
    
    // 종합 분석 결과
    const comprehensiveMetrics = {
      ...basicMetrics,
      engagement: engagementAnalysis,
      emotion: emotionAnalysis,
      dropout: dropoutAnalysis,
      trends: trendAnalysis,
      
      // 핵심 지표
      overallHealth: this.calculateOverallHealth({
        basicMetrics,
        engagementAnalysis,
        emotionAnalysis,
        dropoutAnalysis
      }),
      
      // 창의성 모드 추천
      creativityRecommendation: this.generateCreativityRecommendation({
        basicMetrics,
        engagementAnalysis,
        emotionAnalysis,
        dropoutAnalysis
      })
    };
    
    // 캐시 업데이트
    this.updateCache(novelSlug, comprehensiveMetrics);
    
    return comprehensiveMetrics;
  }

  /**
   * 캐시 업데이트
   */
  updateCache(novelSlug, data) {
    const cacheKey = `${novelSlug}_analysis`;
    this.trendCache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * 기본 메트릭스 수집
   */
  async collectBasicMetrics(novelSlug, chapterNumber) {
    // 실제로는 데이터베이스나 분석 API에서 가져와야 함
    // 여기서는 시뮬레이션 데이터 생성
    
    const mockData = this.generateMockChapterData(novelSlug, chapterNumber);
    
    return {
      chapterNumber,
      timestamp: new Date(),
      
      // 읽기 관련
      totalViews: mockData.views,
      uniqueReaders: mockData.uniqueReaders,
      completionRate: mockData.completionRate,
      averageReadingTime: mockData.readingTime,
      
      // 참여 관련
      likes: mockData.likes,
      comments: mockData.comments,
      shares: mockData.shares,
      bookmarks: mockData.bookmarks,
      
      // 이탈 관련
      dropoutRate: mockData.dropoutRate,
      dropoutPoints: mockData.dropoutPoints,
      
      // 반복 독자
      returnReaders: mockData.returnReaders,
      newReaders: mockData.newReaders
    };
  }

  /**
   * 참여도 분석
   */
  analyzeEngagement(metrics) {
    // null 체크
    if (!metrics) {
      return {
        score: 0,
        level: 'critical',
        trend: 'insufficient_data',
        strongPoints: [],
        weakPoints: ['데이터 없음'],
        recommendations: ['데이터 수집 필요']
      };
    }

    // 참여도 점수 계산 (0-1 스케일)
    const engagementScore = (
      (metrics.completionRate * this.config.weights.completionRate) +
      (this.normalizeReadingTime(metrics.averageReadingTime) * this.config.weights.readingTime) +
      (this.normalizeInteractionRate(metrics) * this.config.weights.shareActivity) +
      (metrics.returnReaders / metrics.uniqueReaders * this.config.weights.returnRate)
    );
    
    // 참여도 트렌드 분석
    const recentChapters = this.getRecentChapterMetrics(5);
    const trend = this.calculateEngagementTrend(recentChapters);
    
    return {
      score: Math.min(1, engagementScore),
      level: this.categorizeEngagement(engagementScore),
      trend: trend,
      strongPoints: this.identifyStrongEngagementPoints(metrics),
      weakPoints: this.identifyWeakEngagementPoints(metrics),
      recommendations: this.generateEngagementRecommendations(engagementScore, trend)
    };
  }

  /**
   * 감정 반응 분석
   */
  analyzeEmotionResponse(novelSlug, chapterNumber) {
    // null 체크
    if (!novelSlug || chapterNumber == null) {
      return {
        variety: 0,
        intensity: 0,
        dominantEmotion: 'unknown',
        progression: 'flat',
        stagnation: { isStagnant: true, duration: 0 },
        recommendations: ['데이터 수집 필요']
      };
    }

    // 가상 감정 데이터 (실제로는 댓글 감정 분석, 리액션 등에서 추출)
    const mockEmotionData = this.generateMockEmotionData(chapterNumber);
    
    // 감정 다양성 계산
    const emotionVariety = this.calculateEmotionVariety(mockEmotionData);
    
    // 감정 강도 계산
    const emotionIntensity = this.calculateEmotionIntensity(mockEmotionData);
    
    // 감정 진행 분석
    const emotionProgression = this.analyzeEmotionProgression(novelSlug, mockEmotionData);
    
    // 감정 정체 체크
    const stagnationCheck = this.checkEmotionStagnation(novelSlug, chapterNumber);
    
    return {
      dominantEmotion: mockEmotionData.dominant,
      emotionDistribution: mockEmotionData.distribution,
      variety: emotionVariety,
      intensity: emotionIntensity,
      progression: emotionProgression,
      stagnation: stagnationCheck,
      
      // 감정 기반 추천
      recommendations: this.generateEmotionRecommendations(mockEmotionData, stagnationCheck)
    };
  }

  /**
   * 이탈 패턴 분석
   */
  analyzeDropoutPatterns(metrics) {
    // null 체크
    if (!metrics) {
      return {
        rate: 1.0,
        severity: 'critical',
        criticalPoints: [],
        causes: ['데이터 없음'],
        recommendations: ['데이터 수집 필요']
      };
    }

    const dropoutRate = metrics.dropoutRate;
    const dropoutPoints = metrics.dropoutPoints;
    
    // 이탈률 심각도 평가
    const severity = this.assessDropoutSeverity(dropoutRate);
    
    // 이탈 지점 분석
    const criticalPoints = this.identifyCriticalDropoutPoints(dropoutPoints);
    
    // 이탈 원인 추정
    const causes = this.estimateDropoutCauses(metrics);
    
    return {
      rate: dropoutRate,
      severity: severity,
      criticalPoints: criticalPoints,
      estimatedCauses: causes,
      
      // 개선 제안
      interventions: this.suggestDropoutInterventions(dropoutRate, criticalPoints)
    };
  }

  /**
   * 트렌드 분석
   */
  async analyzeTrends(novelSlug) {
    // 캐시 체크
    const cacheKey = `trends_${novelSlug}`;
    const cached = this.trendCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.data;
    }
    
    // 최근 트렌드 분석
    const recentMetrics = this.getRecentChapterMetrics(this.config.analysisWindow);
    
    const trends = {
      engagement: this.calculateEngagementTrend(recentMetrics),
      readership: this.calculateReadershipTrend(recentMetrics),
      retention: this.calculateRetentionTrend(recentMetrics),
      
      // 예측
      prediction: this.predictNextChapterPerformance(recentMetrics),
      
      // 경쟁 분석 (가상)
      competitive: this.analyzeCompetitiveLandscape()
    };
    
    // 캐시 업데이트
    this.trendCache.set(cacheKey, {
      data: trends,
      timestamp: Date.now()
    });
    
    return trends;
  }

  /**
   * 전체 건강도 계산
   */
  calculateOverallHealth(analysisResults) {
    const { basicMetrics, engagementAnalysis, emotionAnalysis, dropoutAnalysis } = analysisResults;
    
    // 각 영역별 점수
    const scores = {
      readership: Math.min(1, basicMetrics.uniqueReaders / 1000), // 1000명 기준
      engagement: engagementAnalysis.score,
      emotion: emotionAnalysis.variety * emotionAnalysis.intensity,
      retention: 1 - dropoutAnalysis.rate
    };
    
    // 가중 평균
    const overallScore = (
      scores.readership * 0.25 +
      scores.engagement * 0.35 +
      scores.emotion * 0.25 +
      scores.retention * 0.15
    );
    
    return {
      score: overallScore,
      grade: this.getHealthGrade(overallScore),
      breakdown: scores,
      status: this.getHealthStatus(overallScore),
      criticalIssues: this.identifyCriticalIssues(analysisResults)
    };
  }

  /**
   * 창의성 모드 추천 생성
   */
  generateCreativityRecommendation(analysisResults) {
    const { basicMetrics, engagementAnalysis, emotionAnalysis, dropoutAnalysis } = analysisResults;
    
    let creativityScore = 0;
    const reasons = [];
    
    // 참여도 하락
    if (engagementAnalysis.score < this.config.thresholds.lowEngagement) {
      creativityScore += 0.3;
      reasons.push(`참여도 낮음 (${(engagementAnalysis.score * 100).toFixed(1)}%)`);
    }
    
    // 높은 이탈률
    if (dropoutAnalysis.rate > this.config.thresholds.criticalDropout) {
      creativityScore += 0.4;
      reasons.push(`높은 이탈률 (${(dropoutAnalysis.rate * 100).toFixed(1)}%)`);
    }
    
    // 감정 정체
    if (emotionAnalysis.stagnation.isStagnant) {
      creativityScore += 0.2;
      reasons.push(`감정 정체 (${emotionAnalysis.stagnation.duration}화)`);
    }
    
    // 트렌드 하락
    if (engagementAnalysis.trend === 'declining') {
      creativityScore += 0.1;
      reasons.push('참여도 하락 트렌드');
    }
    
    return {
      shouldActivate: creativityScore >= 0.3,
      score: creativityScore,
      confidence: Math.min(1, creativityScore / 0.7),
      reasons: reasons,
      urgency: creativityScore >= 0.6 ? 'high' : creativityScore >= 0.3 ? 'medium' : 'low',
      
      // 구체적 제안
      suggestions: this.generateSpecificSuggestions(analysisResults, creativityScore)
    };
  }

  /**
   * 가상 챕터 데이터 생성 (실제 구현시 제거)
   */
  generateMockChapterData(novelSlug, chapterNumber) {
    // 챕터별 성과에 약간의 변동성 추가
    const basePerformance = 0.7 + (Math.sin(chapterNumber * 0.3) * 0.2);
    const randomFactor = 0.8 + (Math.random() * 0.4);
    const performance = basePerformance * randomFactor;
    
    return {
      views: Math.floor(1000 * performance),
      uniqueReaders: Math.floor(800 * performance),
      completionRate: Math.max(0.3, Math.min(0.95, performance)),
      readingTime: 120 + (Math.random() * 180), // 2-5분
      likes: Math.floor(100 * performance),
      comments: Math.floor(30 * performance),
      shares: Math.floor(10 * performance),
      bookmarks: Math.floor(50 * performance),
      dropoutRate: Math.max(0.05, Math.min(0.4, 1 - performance)),
      dropoutPoints: this.generateDropoutPoints(),
      returnReaders: Math.floor(600 * performance),
      newReaders: Math.floor(200 * performance)
    };
  }

  /**
   * 가상 감정 데이터 생성
   */
  generateMockEmotionData(chapterNumber) {
    const emotions = ['excitement', 'romance', 'tension', 'sadness', 'anger', 'curiosity'];
    const distribution = {};
    
    // 챕터별로 다른 감정 패턴
    let dominantEmotion;
    if (chapterNumber % 5 === 1) dominantEmotion = 'excitement';
    else if (chapterNumber % 5 === 2) dominantEmotion = 'romance';
    else if (chapterNumber % 5 === 3) dominantEmotion = 'tension';
    else if (chapterNumber % 5 === 4) dominantEmotion = 'curiosity';
    else dominantEmotion = 'romance';
    
    emotions.forEach(emotion => {
      if (emotion === dominantEmotion) {
        distribution[emotion] = 0.4 + (Math.random() * 0.3);
      } else {
        distribution[emotion] = Math.random() * 0.2;
      }
    });
    
    // 정규화
    const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
    Object.keys(distribution).forEach(key => {
      distribution[key] = distribution[key] / total;
    });
    
    return {
      dominant: dominantEmotion,
      distribution: distribution
    };
  }

  /**
   * 감정 다양성 계산
   */
  calculateEmotionVariety(emotionData) {
    const distribution = emotionData.distribution;
    const values = Object.values(distribution);
    
    // Shannon diversity index 사용
    const entropy = -values.reduce((sum, p) => {
      return sum + (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
    
    const maxEntropy = Math.log2(Object.keys(distribution).length);
    return entropy / maxEntropy; // 0-1로 정규화
  }

  /**
   * 감정 강도 계산
   */
  calculateEmotionIntensity(emotionData) {
    const distribution = emotionData.distribution;
    
    // 가장 강한 감정의 비중을 강도로 사용
    const maxIntensity = Math.max(...Object.values(distribution));
    
    return maxIntensity;
  }

  /**
   * 최근 챕터 메트릭스 조회
   */
  getRecentChapterMetrics(count) {
    // 실제로는 데이터베이스에서 조회
    // 여기서는 가상 데이터 반환
    return Array.from({ length: count }, (_, i) => ({
      chapterNumber: count - i,
      engagementScore: 0.5 + (Math.random() * 0.4),
      readership: 700 + (Math.random() * 300),
      completionRate: 0.6 + (Math.random() * 0.3)
    }));
  }

  /**
   * 구체적 제안 생성
   */
  generateSpecificSuggestions(analysisResults, creativityScore) {
    const suggestions = [];
    
    if (creativityScore >= 0.5) {
      suggestions.push({
        type: 'content',
        priority: 'high',
        action: '충격적인 반전이나 예상치 못한 사건 도입',
        reasoning: '독자 관심도가 심각하게 떨어진 상태'
      });
    }
    
    if (analysisResults.emotionAnalysis.stagnation.isStagnant) {
      suggestions.push({
        type: 'emotion',
        priority: 'high',
        action: '새로운 감정적 요소나 갈등 추가',
        reasoning: `${analysisResults.emotionAnalysis.stagnation.duration}화 동안 감정 변화 없음`
      });
    }
    
    if (analysisResults.dropoutAnalysis.rate > 0.3) {
      suggestions.push({
        type: 'retention',
        priority: 'critical',
        action: '첫 문단에 강력한 훅 배치, 클리프행어 강화',
        reasoning: '높은 이탈률로 인한 독자 손실 위험'
      });
    }
    
    return suggestions;
  }

  // 유틸리티 메서드들
  normalizeReadingTime(time) {
    // 2-5분을 적정 시간으로 보고 정규화
    if (time < 60) return 0.3; // 너무 빠름 (스킵)
    if (time > 300) return 0.3; // 너무 느림 (지루함)
    return 1 - Math.abs(time - 180) / 180; // 3분을 최적으로
  }

  normalizeInteractionRate(metrics) {
    const interactionRate = (metrics.likes + metrics.comments + metrics.shares) / metrics.uniqueReaders;
    return Math.min(1, interactionRate / 0.2); // 20%를 최대 참여율로
  }

  categorizeEngagement(score) {
    if (score >= 0.7) return 'excellent';  // 0.7에서 excellent로 변경
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'average';
    if (score >= 0.3) return 'poor';        // 0.2에서 0.3으로 조정
    return 'critical';
  }

  getHealthGrade(score) {
    if (score >= 0.9) return 'A+';
    if (score >= 0.8) return 'A';
    if (score >= 0.7) return 'B';
    if (score >= 0.5) return 'C';  // 0.6에서 0.5로 조정
    if (score >= 0.4) return 'D';  // 0.5에서 0.4로 조정
    return 'F';
  }

  getHealthStatus(score) {
    if (score >= 0.8) return 'healthy';
    if (score >= 0.6) return 'stable';
    if (score >= 0.4) return 'concerning';
    return 'critical';
  }

  identifyStrongEngagementPoints(metrics) {
    const points = [];
    if (metrics.completionRate > 0.8) points.push('높은 완독률');
    if (metrics.comments / metrics.uniqueReaders > 0.1) points.push('활발한 댓글 활동');
    if (metrics.shares > 20) points.push('좋은 공유율');
    return points;
  }

  identifyWeakEngagementPoints(metrics) {
    const points = [];
    if (metrics.completionRate < 0.5) points.push('낮은 완독률');
    if (metrics.dropoutRate > 0.3) points.push('높은 이탈률');
    if (metrics.comments / metrics.uniqueReaders < 0.02) points.push('저조한 댓글 참여');
    return points;
  }

  generateEngagementRecommendations(score, trend) {
    const recommendations = [];
    
    if (score < 0.4) {
      recommendations.push('긴급: 창의성 모드 활성화 필요');
      recommendations.push('첫 문단 강화로 독자 관심 즉시 유도');
    }
    
    if (trend === 'declining') {
      recommendations.push('하락 트렌드 반전을 위한 새로운 스토리 요소 필요');
    }
    
    return recommendations;
  }

  checkEmotionStagnation(novelSlug, chapterNumber) {
    // 최근 5화의 감정 패턴 체크
    const recentEmotions = this.emotionHistory.slice(-5);
    
    if (recentEmotions.length < 5) {
      return { isStagnant: false, duration: 0 };
    }
    
    const dominantEmotions = recentEmotions.map(e => e.dominant);
    const uniqueEmotions = new Set(dominantEmotions);
    
    return {
      isStagnant: uniqueEmotions.size <= 2,
      duration: uniqueEmotions.size <= 2 ? 5 : 0,
      pattern: dominantEmotions
    };
  }

  generateDropoutPoints() {
    // 가상의 이탈 지점 (실제로는 스크롤 추적 등으로 수집)
    return [
      { position: '10%', rate: 0.05 },
      { position: '30%', rate: 0.12 },
      { position: '50%', rate: 0.08 },
      { position: '80%', rate: 0.15 }
    ];
  }

  assessDropoutSeverity(rate) {
    if (rate > 0.4) return 'critical';
    if (rate > 0.25) return 'high';
    if (rate > 0.15) return 'moderate';
    return 'low';
  }

  calculateEngagementTrend(recentMetrics) {
    if (recentMetrics.length < 3) return 'insufficient_data';
    
    const recent = recentMetrics.slice(0, 3).map(m => m.engagementScore);
    const older = recentMetrics.slice(-3).map(m => m.engagementScore);
    
    const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  // 추가 분석 메서드들...
  calculateReadershipTrend(recentMetrics) { return 'stable'; }
  calculateRetentionTrend(recentMetrics) { return 'stable'; }
  predictNextChapterPerformance(recentMetrics) { return { score: 0.7, confidence: 0.6 }; }
  analyzeCompetitiveLandscape() { return { position: 'strong', threats: [] }; }
  analyzeEmotionProgression(novelSlug, emotionData) { return { direction: 'positive' }; }
  generateEmotionRecommendations(emotionData, stagnationCheck) { return []; }
  identifyCriticalDropoutPoints(dropoutPoints) { return dropoutPoints.filter(p => p.rate > 0.1); }
  estimateDropoutCauses(metrics) { return ['pacing_issues', 'lack_of_tension']; }
  suggestDropoutInterventions(rate, points) { return ['improve_opening', 'add_cliffhanger']; }
  identifyCriticalIssues(analysisResults) { return []; }
}

// 싱글톤 인스턴스 export
export const readerAnalyticsEngine = new ReaderAnalyticsEngine();