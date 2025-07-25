/**
 * 토큰 밸런싱 엔진
 * AI 생성 비용과 품질을 최적화하여 효율성과 창의성의 균형을 자동 조절
 */

export class TokenBalancingEngine {
  constructor() {
    // 토큰 사용 전략 정의
    this.strategies = {
      efficiency: {
        name: '효율 모드',
        description: '표준 품질로 비용 최적화',
        tokenRange: { min: 1200, max: 2000, target: 1500 },
        costMultiplier: 0.25, // 75% 절감
        qualityLevel: 'standard',
        useCase: '일반적인 스토리 전개',
        promptStyle: 'concise',
        creativity: 0.3
      },
      
      balanced: {
        name: '균형 모드',
        description: '품질과 비용의 조화',
        tokenRange: { min: 2000, max: 3500, target: 2750 },
        costMultiplier: 0.5, // 50% 절감
        qualityLevel: 'enhanced',
        useCase: '중요한 스토리 포인트',
        promptStyle: 'detailed',
        creativity: 0.6
      },
      
      creativity: {
        name: '창의성 모드',
        description: '최고 품질, 비용 무제한',
        tokenRange: { min: 5000, max: null, target: 8000 },
        costMultiplier: 1.0, // 비용 제한 없음
        qualityLevel: 'premium',
        useCase: '핵심 장면, 감동 포인트',
        promptStyle: 'elaborate',
        creativity: 1.0
      },
      
      emergency: {
        name: '긴급 모드',
        description: '독자 이탈 방지 최우선',
        tokenRange: { min: 7000, max: null, target: 10000 },
        costMultiplier: 1.5, // 150% 투자
        qualityLevel: 'masterpiece',
        useCase: '위기 상황 대응',
        promptStyle: 'intensive',
        creativity: 1.2
      }
    };
    
    // 비용 추적
    this.costTracking = {
      totalTokensUsed: 0,
      totalCost: 0,
      sessionBudget: 1000, // 기본 세션 예산 (달러)
      costPerToken: 0.003, // Claude 기준 (실제로는 동적으로 조회)
      savingsAchieved: 0,
      efficiency: []
    };
    
    // 품질 메트릭스
    this.qualityMetrics = {
      averageRating: 0,
      readerSatisfaction: 0,
      creativeSuccess: new Map(),
      costEffectiveness: new Map()
    };
    
    // 동적 조정 설정
    this.adaptiveSettings = {
      budgetPressure: 0, // 0-1, 예산 압박 정도
      qualityThreshold: 0.7, // 최소 품질 요구사항
      emergencyThreshold: 0.8, // 긴급 모드 활성화 임계값
      learningRate: 0.1, // 적응 학습 속도
      
      // 자동 조정 플래그
      enableBudgetOptimization: true,
      enableQualityAdaptation: true,
      enableEmergencyMode: true
    };
    
    // 세션 통계
    this.sessionStats = {
      chaptersGenerated: 0,
      modesUsed: new Map(),
      totalSavings: 0,
      qualityScores: [],
      startTime: new Date()
    };
    
    // 예산 경고 설정
    this.budgetAlerts = {
      warning: 0.7,    // 70% 사용시 경고
      critical: 0.9,   // 90% 사용시 강제 효율 모드
      emergency: 0.95  // 95% 사용시 생성 중단
    };
  }

  /**
   * 최적 토큰 전략 결정 (메인 진입점)
   */
  determineOptimalStrategy(context) {
    console.log('⚖️ 토큰 밸런싱 분석 시작...');
    
    // 1. 현재 상황 분석
    const situationAnalysis = this.analyzeSituation(context);
    
    // 2. 예산 상태 체크
    const budgetStatus = this.checkBudgetStatus();
    
    // 3. 품질 요구사항 평가
    const qualityRequirements = this.assessQualityRequirements(context);
    
    // 4. 최적 전략 선택
    const optimalStrategy = this.selectOptimalStrategy(
      situationAnalysis,
      budgetStatus,
      qualityRequirements
    );
    
    // 5. 전략 미세 조정
    const tunedStrategy = this.tuneStrategy(optimalStrategy, context);
    
    // 6. 실행 계획 생성
    const executionPlan = this.createExecutionPlan(tunedStrategy, context);
    
    console.log(`🎯 선택된 전략: ${tunedStrategy.name}`);
    console.log(`💰 예상 비용: $${executionPlan.estimatedCost.toFixed(3)}`);
    
    return {
      strategy: tunedStrategy,
      executionPlan: executionPlan,
      reasoning: this.explainStrategicChoice(situationAnalysis, budgetStatus, qualityRequirements),
      fallbackOptions: this.prepareFallbackOptions(tunedStrategy)
    };
  }

  /**
   * 상황 분석
   */
  analyzeSituation(context) {
    const { creativityRecommendation, readerMetrics, chapterContext } = context;
    
    return {
      // 창의성 필요도
      creativityNeed: creativityRecommendation?.score || 0,
      urgency: creativityRecommendation?.urgency || 'low',
      
      // 독자 상태
      readerEngagement: readerMetrics?.engagement?.score || 0.5,
      dropoutRisk: readerMetrics?.dropout?.rate || 0.2,
      
      // 스토리 컨텍스트
      storyImportance: this.assessStoryImportance(chapterContext),
      plotStage: chapterContext?.plotStage || 'development',
      
      // 시간적 요소
      seasonality: this.checkSeasonality(),
      competition: this.assessCompetition()
    };
  }

  /**
   * 예산 상태 체크
   */
  checkBudgetStatus() {
    const usedRatio = this.costTracking.totalCost / this.costTracking.sessionBudget;
    const remainingBudget = this.costTracking.sessionBudget - this.costTracking.totalCost;
    
    let status, pressure, availableStrategies;
    
    if (usedRatio >= this.budgetAlerts.emergency) {
      status = 'emergency';
      pressure = 1.0;
      availableStrategies = []; // 생성 중단
    } else if (usedRatio >= this.budgetAlerts.critical) {
      status = 'critical';
      pressure = 0.9;
      availableStrategies = ['efficiency'];
    } else if (usedRatio >= this.budgetAlerts.warning) {
      status = 'warning';
      pressure = 0.7;
      availableStrategies = ['efficiency', 'balanced'];
    } else {
      status = 'healthy';
      pressure = usedRatio;
      availableStrategies = Object.keys(this.strategies);
    }
    
    return {
      status,
      pressure,
      usedRatio,
      remainingBudget,
      availableStrategies,
      recommendEfficiencyMode: pressure > 0.6
    };
  }

  /**
   * 품질 요구사항 평가
   */
  assessQualityRequirements(context) {
    const { creativityRecommendation, chapterContext } = context;
    
    // 기본 품질 요구사항
    let baseQualityNeed = 0.5;
    
    // 스토리 중요도에 따른 조정
    const storyImportance = this.assessStoryImportance(chapterContext);
    baseQualityNeed += storyImportance * 0.3;
    
    // 창의성 필요도 반영
    const creativityNeed = creativityRecommendation?.score || 0;
    baseQualityNeed += creativityNeed * 0.4;
    
    // 독자 상태 반영
    const readerCrisis = context.readerMetrics?.dropout?.rate > 0.3;
    if (readerCrisis) baseQualityNeed += 0.2;
    
    return {
      overallNeed: Math.min(1, baseQualityNeed),
      storyImportance,
      creativityNeed,
      readerCrisis,
      minQualityLevel: this.adaptiveSettings.qualityThreshold,
      targetQualityLevel: Math.max(this.adaptiveSettings.qualityThreshold, baseQualityNeed)
    };
  }

  /**
   * 최적 전략 선택
   */
  selectOptimalStrategy(situationAnalysis, budgetStatus, qualityRequirements) {
    const { availableStrategies } = budgetStatus;
    
    // 예산 제약으로 사용 불가한 경우
    if (availableStrategies.length === 0) {
      throw new Error('예산 부족으로 생성 불가');
    }
    
    // 긴급 상황 체크
    if (this.adaptiveSettings.enableEmergencyMode && 
        situationAnalysis.urgency === 'critical' && 
        qualityRequirements.readerCrisis) {
      
      if (availableStrategies.includes('emergency')) {
        return { ...this.strategies.emergency, reason: 'emergency_intervention' };
      }
    }
    
    // 창의성 모드 체크
    if (qualityRequirements.creativityNeed >= 0.7 && 
        availableStrategies.includes('creativity')) {
      return { ...this.strategies.creativity, reason: 'high_creativity_need' };
    }
    
    // 균형 모드 체크
    if (qualityRequirements.overallNeed >= 0.5 && 
        qualityRequirements.overallNeed < 0.7 && 
        availableStrategies.includes('balanced')) {
      return { ...this.strategies.balanced, reason: 'balanced_approach' };
    }
    
    // 기본값: 효율 모드
    return { ...this.strategies.efficiency, reason: 'cost_optimization' };
  }

  /**
   * 전략 미세 조정
   */
  tuneStrategy(baseStrategy, context) {
    const tunedStrategy = { ...baseStrategy };
    
    // 예산 압박 상황에서 토큰 범위 조정
    if (this.adaptiveSettings.budgetPressure > 0.6) {
      tunedStrategy.tokenRange.target *= (1 - this.adaptiveSettings.budgetPressure * 0.2);
      tunedStrategy.tokenRange.max = Math.min(
        tunedStrategy.tokenRange.max || Infinity,
        tunedStrategy.tokenRange.target * 1.3
      );
    }
    
    // 품질 요구사항에 따른 창의성 레벨 조정
    const qualityBoost = context.qualityRequirements?.overallNeed || 0;
    tunedStrategy.creativity = Math.min(1.2, tunedStrategy.creativity * (1 + qualityBoost * 0.3));
    
    // 독자 위기 상황에서 특별 조정
    if (context.readerMetrics?.dropout?.rate > 0.4) {
      tunedStrategy.creativity *= 1.2; // 20% 창의성 부스트
      tunedStrategy.tokenRange.target *= 1.1; // 10% 토큰 증가
    }
    
    return tunedStrategy;
  }

  /**
   * 실행 계획 생성
   */
  createExecutionPlan(strategy, context) {
    const estimatedTokens = strategy.tokenRange.target;
    const estimatedCost = estimatedTokens * this.costTracking.costPerToken * strategy.costMultiplier;
    
    return {
      strategy: strategy.name,
      estimatedTokens,
      estimatedCost,
      targetQuality: strategy.qualityLevel,
      
      // 프롬프트 설정
      promptConfig: {
        style: strategy.promptStyle,
        creativity: strategy.creativity,
        detail: this.mapStyleToDetail(strategy.promptStyle),
        constraints: this.generateConstraints(strategy, context)
      },
      
      // 검증 기준
      validationCriteria: {
        minTokens: strategy.tokenRange.min,
        maxTokens: strategy.tokenRange.max,
        qualityThreshold: this.getQualityThreshold(strategy),
        costLimit: estimatedCost * 1.2 // 20% 여유
      },
      
      // 성과 측정
      successMetrics: this.defineSuccessMetrics(strategy, context)
    };
  }

  /**
   * 비용 추적 및 업데이트
   */
  trackCost(actualTokensUsed, strategy) {
    const actualCost = actualTokensUsed * this.costTracking.costPerToken * strategy.costMultiplier;
    
    // 전체 비용 업데이트
    this.costTracking.totalTokensUsed += actualTokensUsed;
    this.costTracking.totalCost += actualCost;
    
    // 절약액 계산 (창의성 모드 대비)
    const fullCostEquivalent = actualTokensUsed * this.costTracking.costPerToken;
    const savings = fullCostEquivalent - actualCost;
    this.costTracking.savingsAchieved += savings;
    
    // 효율성 기록
    this.costTracking.efficiency.push({
      timestamp: new Date(),
      strategy: strategy.name,
      tokensUsed: actualTokensUsed,
      cost: actualCost,
      savings: savings,
      efficiency: savings / fullCostEquivalent
    });
    
    // 세션 통계 업데이트
    this.updateSessionStats(strategy, actualTokensUsed, actualCost);
    
    // 예산 압박 업데이트
    this.adaptiveSettings.budgetPressure = 
      this.costTracking.totalCost / this.costTracking.sessionBudget;
    
    return {
      actualCost,
      savings,
      totalCost: this.costTracking.totalCost,
      budgetRemaining: this.costTracking.sessionBudget - this.costTracking.totalCost,
      efficiencyRate: savings / fullCostEquivalent
    };
  }

  /**
   * 성과 측정 및 학습
   */
  measurePerformance(strategyUsed, actualTokens, qualityScore, readerResponse) {
    const performance = {
      strategy: strategyUsed.name,
      tokensUsed: actualTokens,
      qualityAchieved: qualityScore,
      readerSatisfaction: readerResponse.satisfaction,
      engagement: readerResponse.engagement,
      
      // 효율성 계산
      costEffectiveness: qualityScore / (actualTokens * strategyUsed.costMultiplier),
      qualityPerDollar: qualityScore / (actualTokens * this.costTracking.costPerToken * strategyUsed.costMultiplier),
      
      // ROI 계산
      roi: this.calculateROI(qualityScore, readerResponse, actualTokens * strategyUsed.costMultiplier)
    };
    
    // 학습 데이터 업데이트
    this.updateLearningData(performance);
    
    // 적응형 조정
    this.adaptSettings(performance);
    
    return performance;
  }

  /**
   * 적응형 설정 조정
   */
  adaptSettings(performance) {
    const learningRate = this.adaptiveSettings.learningRate;
    
    // 품질 임계값 조정
    if (performance.qualityAchieved < this.adaptiveSettings.qualityThreshold) {
      // 품질이 부족하면 임계값을 약간 높임
      this.adaptiveSettings.qualityThreshold += 
        (this.adaptiveSettings.qualityThreshold - performance.qualityAchieved) * learningRate * 0.1;
    }
    
    // 전략별 성공률 업데이트
    const strategySuccess = this.qualityMetrics.creativeSuccess.get(performance.strategy) || 
      { attempts: 0, successes: 0, avgQuality: 0 };
    
    strategySuccess.attempts++;
    if (performance.qualityAchieved >= this.adaptiveSettings.qualityThreshold) {
      strategySuccess.successes++;
    }
    strategySuccess.avgQuality = 
      (strategySuccess.avgQuality * (strategySuccess.attempts - 1) + performance.qualityAchieved) / 
      strategySuccess.attempts;
    
    this.qualityMetrics.creativeSuccess.set(performance.strategy, strategySuccess);
  }

  /**
   * 비용 최적화 보고서 생성
   */
  generateOptimizationReport() {
    const report = {
      session: {
        duration: Date.now() - this.sessionStats.startTime.getTime(),
        chaptersGenerated: this.sessionStats.chaptersGenerated,
        totalCost: this.costTracking.totalCost,
        totalSavings: this.costTracking.savingsAchieved,
        budgetUtilization: this.costTracking.totalCost / this.costTracking.sessionBudget
      },
      
      efficiency: {
        averageTokensPerChapter: this.costTracking.totalTokensUsed / this.sessionStats.chaptersGenerated,
        averageCostPerChapter: this.costTracking.totalCost / this.sessionStats.chaptersGenerated,
        savingsRate: this.costTracking.savingsAchieved / 
          (this.costTracking.totalTokensUsed * this.costTracking.costPerToken),
        costEffectiveness: this.calculateOverallCostEffectiveness()
      },
      
      strategy: {
        mostUsed: this.getMostUsedStrategy(),
        mostEffective: this.getMostEffectiveStrategy(),
        recommendations: this.generateStrategyRecommendations()
      },
      
      quality: {
        averageQuality: this.sessionStats.qualityScores.reduce((sum, q) => sum + q, 0) / 
          this.sessionStats.qualityScores.length,
        qualityConsistency: this.calculateQualityConsistency(),
        qualityTrend: this.analyzeQualityTrend()
      }
    };
    
    return report;
  }

  // 유틸리티 메서드들
  assessStoryImportance(chapterContext) {
    if (!chapterContext) return 0.3;
    
    // 플롯 단계별 중요도
    const plotImportance = {
      'introduction': 0.7,    // 첫인상 중요
      'development': 0.3,     // 일반적 전개
      'climax': 0.9,         // 절정
      'resolution': 0.8       // 결말
    };
    
    let importance = plotImportance[chapterContext.plotStage] || 0.3;
    
    // 특별한 이벤트
    if (chapterContext.isSpecialEvent) importance += 0.2;
    if (chapterContext.characterMilestone) importance += 0.15;
    
    return Math.min(1, importance);
  }

  checkSeasonality() {
    // 계절, 휴일 등을 고려한 독자 활동 패턴
    const month = new Date().getMonth();
    
    // 연말연시, 여름휴가철 등은 독자 활동이 높아짐
    if ([11, 0, 1, 6, 7].includes(month)) {
      return { active: true, factor: 1.2 };
    }
    
    return { active: false, factor: 1.0 };
  }

  assessCompetition() {
    // 실제로는 외부 API나 크롤링 데이터 사용
    return {
      level: 'moderate',
      newReleases: Math.floor(Math.random() * 5),
      trendingGenres: ['regression', 'villainess'],
      threat: 0.3
    };
  }

  mapStyleToDetail(style) {
    const mapping = {
      'concise': 0.3,
      'detailed': 0.6,
      'elaborate': 0.9,
      'intensive': 1.0
    };
    return mapping[style] || 0.5;
  }

  generateConstraints(strategy, context) {
    const constraints = [];
    
    if (strategy.tokenRange.max) {
      constraints.push(`최대 ${strategy.tokenRange.max} 토큰`);
    }
    
    if (context.timeConstraints) {
      constraints.push('빠른 생성 우선');
    }
    
    if (strategy.name === 'efficiency') {
      constraints.push('간결하고 효율적인 표현');
    }
    
    return constraints;
  }

  getQualityThreshold(strategy) {
    const thresholds = {
      'efficiency': 0.6,
      'balanced': 0.7,
      'creativity': 0.8,
      'emergency': 0.85
    };
    return thresholds[strategy.name] || 0.6;
  }

  defineSuccessMetrics(strategy, context) {
    return {
      minQualityScore: this.getQualityThreshold(strategy),
      targetEngagement: strategy.creativity,
      maxCostOverrun: 0.2, // 20% 초과 허용
      readerSatisfactionTarget: 0.7
    };
  }

  updateSessionStats(strategy, tokens, cost) {
    this.sessionStats.chaptersGenerated++;
    
    const currentCount = this.sessionStats.modesUsed.get(strategy.name) || 0;
    this.sessionStats.modesUsed.set(strategy.name, currentCount + 1);
    
    this.sessionStats.totalSavings += 
      (tokens * this.costTracking.costPerToken) - cost;
  }

  calculateROI(qualityScore, readerResponse, cost) {
    // 품질과 독자 반응을 기반으로 ROI 계산 (단순화된 모델)
    const valueCreated = (qualityScore * 0.6) + (readerResponse.engagement * 0.4);
    return valueCreated / cost * 100; // 백분율로 변환
  }

  updateLearningData(performance) {
    // 성과 데이터를 기반으로 향후 전략 선택을 개선
    this.qualityMetrics.averageRating = 
      (this.qualityMetrics.averageRating * 0.9) + (performance.qualityAchieved * 0.1);
    
    this.qualityMetrics.readerSatisfaction = 
      (this.qualityMetrics.readerSatisfaction * 0.9) + (performance.readerSatisfaction * 0.1);
  }

  calculateOverallCostEffectiveness() {
    if (this.costTracking.efficiency.length === 0) return 0;
    
    return this.costTracking.efficiency.reduce((sum, e) => sum + e.efficiency, 0) / 
           this.costTracking.efficiency.length;
  }

  getMostUsedStrategy() {
    let mostUsed = '';
    let maxCount = 0;
    
    for (const [strategy, count] of this.sessionStats.modesUsed) {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = strategy;
      }
    }
    
    return { strategy: mostUsed, count: maxCount };
  }

  getMostEffectiveStrategy() {
    let mostEffective = '';
    let maxEffectiveness = 0;
    
    for (const [strategy, data] of this.qualityMetrics.creativeSuccess) {
      const effectiveness = data.successes / data.attempts * data.avgQuality;
      if (effectiveness > maxEffectiveness) {
        maxEffectiveness = effectiveness;
        mostEffective = strategy;
      }
    }
    
    return { strategy: mostEffective, effectiveness: maxEffectiveness };
  }

  generateStrategyRecommendations() {
    const recommendations = [];
    
    // 예산 활용도 기반 추천
    if (this.adaptiveSettings.budgetPressure < 0.5) {
      recommendations.push('예산 여유 있음 - 창의성 모드 적극 활용 가능');
    } else if (this.adaptiveSettings.budgetPressure > 0.8) {
      recommendations.push('예산 압박 - 효율 모드 중심 운영 필요');
    }
    
    // 품질 트렌드 기반 추천
    const qualityTrend = this.analyzeQualityTrend();
    if (qualityTrend === 'declining') {
      recommendations.push('품질 하락 추세 - 균형 모드 이상 사용 증대 필요');
    }
    
    return recommendations;
  }

  calculateQualityConsistency() {
    if (this.sessionStats.qualityScores.length < 2) return 1;
    
    const mean = this.sessionStats.qualityScores.reduce((sum, q) => sum + q, 0) / 
                 this.sessionStats.qualityScores.length;
    
    const variance = this.sessionStats.qualityScores.reduce((sum, q) => sum + Math.pow(q - mean, 2), 0) / 
                     this.sessionStats.qualityScores.length;
    
    return 1 - Math.sqrt(variance); // 표준편차가 작을수록 일관성 높음
  }

  analyzeQualityTrend() {
    if (this.sessionStats.qualityScores.length < 3) return 'insufficient_data';
    
    const recent = this.sessionStats.qualityScores.slice(-3);
    const older = this.sessionStats.qualityScores.slice(0, -3);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, q) => sum + q, 0) / recent.length;
    const olderAvg = older.reduce((sum, q) => sum + q, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  explainStrategicChoice(situationAnalysis, budgetStatus, qualityRequirements) {
    const reasoning = [];
    
    reasoning.push(`창의성 필요도: ${(situationAnalysis.creativityNeed * 100).toFixed(1)}%`);
    reasoning.push(`예산 상태: ${budgetStatus.status} (${(budgetStatus.usedRatio * 100).toFixed(1)}% 사용)`);
    reasoning.push(`품질 요구사항: ${(qualityRequirements.overallNeed * 100).toFixed(1)}%`);
    
    if (situationAnalysis.urgency === 'critical') {
      reasoning.push('긴급 상황으로 품질 우선');
    }
    
    if (budgetStatus.recommendEfficiencyMode) {
      reasoning.push('예산 압박으로 효율성 중시');
    }
    
    return reasoning;
  }

  prepareFallbackOptions(primaryStrategy) {
    const fallbacks = [];
    
    // 비용 초과시 대안
    if (primaryStrategy.name !== 'efficiency') {
      fallbacks.push({
        trigger: 'cost_overrun',
        alternative: 'efficiency',
        reason: '비용 초과시 효율 모드로 전환'
      });
    }
    
    // 품질 미달시 대안
    if (primaryStrategy.name === 'efficiency') {
      fallbacks.push({
        trigger: 'quality_insufficient',
        alternative: 'balanced',
        reason: '품질 미달시 균형 모드로 승격'
      });
    }
    
    return fallbacks;
  }

  /**
   * 토큰 사용량 계산
   */
  calculateTokenUsage(prompt, strategy = 'balanced') {
    const strategyConfig = this.strategies[strategy];
    if (!strategyConfig) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }

    // 프롬프트 길이 기반 토큰 추정 (대략 4자당 1토큰)
    const baseTokens = Math.ceil(prompt.length / 4);
    
    // 전략별 토큰 승수 적용
    const targetTokens = strategyConfig.tokenRange.target;
    const estimatedTokens = Math.max(baseTokens, targetTokens * 0.8);

    return {
      inputTokens: baseTokens,
      estimatedOutputTokens: estimatedTokens,
      totalEstimated: baseTokens + estimatedTokens,
      strategy: strategy,
      cost: (baseTokens + estimatedTokens) * this.costTracking.costPerToken * strategyConfig.costMultiplier
    };
  }

  /**
   * 효율성 모드 활성화 체크
   */
  shouldActivateEfficiencyMode(context) {
    const budgetStatus = this.checkBudgetStatus();
    
    // 예산 압박이 높으면 효율성 모드 활성화
    if (budgetStatus.pressure >= 0.7) {
      return true;
    }
    
    // 품질 요구사항이 낮으면 효율성 모드
    if (context && context.qualityTarget === 'standard') {
      return true;
    }
    
    return false;
  }

  /**
   * 비용 절약 계산
   */
  calculateCostSavings(actualStrategy, alternativeStrategy = 'creativity') {
    const actualCost = this.strategies[actualStrategy].costMultiplier;
    const alternativeCost = this.strategies[alternativeStrategy].costMultiplier;
    
    const savingsPercentage = ((alternativeCost - actualCost) / alternativeCost) * 100;
    const absoluteSavings = alternativeCost - actualCost;
    
    return {
      percentage: Math.max(0, savingsPercentage),
      absolute: Math.max(0, absoluteSavings),
      comparedTo: alternativeStrategy
    };
  }

  /**
   * 전략 추천
   */
  recommendStrategy(context) {
    const analysis = this.analyzeSituation(context);
    const budgetStatus = this.checkBudgetStatus();
    
    let recommendedStrategy = 'balanced';
    let confidence = 0.5;
    const reasoning = [];
    
    // 예산 상태에 따른 추천
    if (budgetStatus.pressure >= 0.8) {
      recommendedStrategy = 'efficiency';
      confidence = 0.9;
      reasoning.push('높은 예산 압박으로 효율성 모드 추천');
    } else if (analysis.urgency === 'high') {
      recommendedStrategy = 'creativity';
      confidence = 0.8;
      reasoning.push('높은 긴급도로 창의성 모드 추천');
    } else if (analysis.importance === 'high') {
      recommendedStrategy = 'creativity';
      confidence = 0.7;
      reasoning.push('높은 중요도로 창의성 모드 추천');
    }
    
    return {
      strategy: recommendedStrategy,
      confidence,
      reasoning,
      alternatives: this.getAlternativeStrategies(recommendedStrategy),
      estimatedCost: this.strategies[recommendedStrategy].costMultiplier
    };
  }

  /**
   * 대안 전략 목록
   */
  getAlternativeStrategies(primaryStrategy) {
    const all = Object.keys(this.strategies);
    return all.filter(s => s !== primaryStrategy);
  }

  /**
   * 성능 메트릭 추적
   */
  trackPerformanceMetrics(strategy, outcome) {
    const metrics = {
      strategy,
      timestamp: new Date(),
      cost: outcome.cost || 0,
      quality: outcome.quality || 0,
      userSatisfaction: outcome.satisfaction || 0,
      efficiency: outcome.efficiency || 0
    };
    
    // 세션 통계 업데이트
    this.sessionStats.qualityScores.push(metrics.quality);
    this.sessionStats.modesUsed.set(strategy, (this.sessionStats.modesUsed.get(strategy) || 0) + 1);
    
    // 비용 추적 업데이트
    this.costTracking.totalCost += metrics.cost;
    this.costTracking.totalTokensUsed += outcome.tokensUsed || 0;
    
    return metrics;
  }
}

// 싱글톤 인스턴스 export
export const tokenBalancingEngine = new TokenBalancingEngine();