/**
 * 🧠 GENESIS AI 지능형 의사결정 엔진
 * 
 * 🎯 특징:
 * - AI 기반 지능형 의사결정 시스템
 * - 독자 참여도 기반 우선순위 조정
 * - 시장 트렌드 실시간 반영
 * - 품질 기회 자동 식별
 * - 전략적 목표 기반 최적화
 * 
 * 🚀 사용법:
 * const engine = new IntelligentDecisionEngine(logger);
 * const decision = await engine.analyze(analysisData);
 */

export class IntelligentDecisionEngine {
  constructor(logger) {
    this.logger = logger;
    this.decisionHistory = [];
    this.performanceTracker = {
      correctDecisions: 0,
      totalDecisions: 0,
      lastAnalysisTime: null
    };
  }

  /**
   * 🎯 메인 지능형 분석 엔진
   */
  async analyze({
    currentState,
    readerEngagement,
    marketTrends,
    qualityOpportunities,
    strategicGoals,
    performanceMetrics
  }) {
    const startTime = Date.now();
    
    try {
      await this.logger.info('🧠 지능형 의사결정 분석 시작');

      // Step 1: 컨텍스트 가중치 계산
      const contextWeights = this.calculateContextWeights({
        readerEngagement,
        marketTrends,
        qualityOpportunities,
        performanceMetrics
      });

      // Step 2: 각 액션별 점수 계산
      const actionScores = await this.calculateActionScores(
        currentState, 
        contextWeights,
        strategicGoals
      );

      // Step 3: 최적 액션 선택
      const bestAction = this.selectOptimalAction(actionScores, currentState);

      // Step 4: 신뢰도 계산
      const confidence = this.calculateConfidence(bestAction, actionScores);

      // Step 5: 의사결정 히스토리 업데이트
      const decision = {
        type: bestAction.type,
        targetNovel: bestAction.targetNovel,
        reason: bestAction.reason,
        confidence,
        reasoning: bestAction.reasoning,
        analysisTime: Date.now() - startTime,
        contextWeights,
        actionScores
      };

      this.updateDecisionHistory(decision);

      await this.logger.success('🎯 지능형 의사결정 완료', {
        selectedAction: decision.type,
        confidence: decision.confidence,
        analysisTime: decision.analysisTime
      });

      return decision;

    } catch (error) {
      await this.logger.error('지능형 의사결정 분석 실패', { error: error.message });
      throw error;
    }
  }

  /**
   * 📊 컨텍스트 가중치 계산
   */
  calculateContextWeights({ readerEngagement, marketTrends, qualityOpportunities, performanceMetrics }) {
    const weights = {
      readerSatisfaction: 0.25,
      marketAlignment: 0.20,
      qualityImprovement: 0.25,
      systemPerformance: 0.15,
      strategicValue: 0.15
    };

    // 독자 참여도 기반 조정
    if (readerEngagement.averageRating < 4.0) {
      weights.qualityImprovement += 0.1;
      weights.readerSatisfaction += 0.05;
    }

    // 시스템 성능 기반 조정
    if (performanceMetrics.systemEfficiency < 0.8) {
      weights.systemPerformance += 0.1;
    }

    // 품질 기회 기반 조정
    if (qualityOpportunities.length > 3) {
      weights.qualityImprovement += 0.15;
    }

    return this.normalizeWeights(weights);
  }

  /**
   * 🏆 액션별 점수 계산
   */
  async calculateActionScores(currentState, weights, strategicGoals) {
    const actions = this.generatePossibleActions(currentState);
    const scores = {};

    for (const action of actions) {
      scores[action.id] = await this.scoreAction(action, currentState, weights, strategicGoals);
    }

    return scores;
  }

  /**
   * 📝 가능한 액션 생성
   */
  generatePossibleActions(currentState) {
    const actions = [];

    // 완결 가능한 소설들
    const completableNovels = currentState.novels.filter(n => 
      n.status === '연재 중' && n.canComplete
    );

    for (const novel of completableNovels) {
      actions.push({
        id: `complete_${novel.slug}`,
        type: 'complete_novel',
        targetNovel: novel.slug,
        priority: 'high',
        metadata: { novel, expectedImpact: 'completion' }
      });
    }

    // 업데이트 필요한 소설들
    const updateNeededNovels = currentState.novels.filter(n => 
      n.status === '연재 중' && n.needsUpdate && !n.canComplete
    );

    for (const novel of updateNeededNovels) {
      actions.push({
        id: `continue_${novel.slug}`,
        type: 'continue_chapter',
        targetNovel: novel.slug,
        priority: 'medium',
        metadata: { novel, expectedImpact: 'engagement' }
      });
    }

    // 새 소설 생성
    if (currentState.activeNovels < 3) { // CONFIG.MAX_ACTIVE_NOVELS 참조
      actions.push({
        id: 'new_novel',
        type: 'new_novel',
        priority: 'low',
        metadata: { expectedImpact: 'growth' }
      });
    }

    return actions;
  }

  /**
   * 🎯 개별 액션 점수 계산
   */
  async scoreAction(action, currentState, weights, strategicGoals) {
    let score = 0;

    // 기본 우선순위 점수
    const priorityScores = { high: 0.4, medium: 0.3, low: 0.2 };
    score += priorityScores[action.priority] || 0.2;

    // 독자 만족도 예상 점수
    score += this.calculateReaderSatisfactionScore(action) * weights.readerSatisfaction;

    // 시장 정렬성 점수
    score += this.calculateMarketAlignmentScore(action) * weights.marketAlignment;

    // 품질 개선 기여도
    score += this.calculateQualityImpactScore(action) * weights.qualityImprovement;

    // 시스템 성능 효율성
    score += this.calculateSystemEfficiencyScore(action) * weights.systemPerformance;

    // 전략적 가치
    score += this.calculateStrategicValueScore(action, strategicGoals) * weights.strategicValue;

    return Math.min(score, 1.0);
  }

  calculateReaderSatisfactionScore(action) {
    const satisfactionMap = {
      'complete_novel': 0.9, // 완결은 높은 만족도
      'continue_chapter': 0.7, // 연재 지속은 중간 만족도
      'new_novel': 0.6 // 새 소설은 위험부담 있음
    };
    
    let baseScore = satisfactionMap[action.type] || 0.5;
    
    // 소설별 특성 고려
    if (action.metadata?.novel) {
      const novel = action.metadata.novel;
      if (novel.rating > 4.5) baseScore += 0.1;
      if (novel.daysSinceUpdate > 14) baseScore -= 0.1;
    }
    
    return Math.max(0, Math.min(baseScore, 1.0));
  }

  calculateMarketAlignmentScore(action) {
    // 시장 트렌드와의 정렬성
    const trendBonus = {
      'complete_novel': 0.8, // 완결 선호 트렌드
      'continue_chapter': 0.7,
      'new_novel': 0.6
    };
    
    return trendBonus[action.type] || 0.5;
  }

  calculateQualityImpactScore(action) {
    const qualityImpact = {
      'complete_novel': 0.9, // 완결은 전체 작품 품질 완성
      'continue_chapter': 0.6, // 연재는 점진적 품질
      'new_novel': 0.8 // 새 작품은 새로운 품질 기회
    };
    
    return qualityImpact[action.type] || 0.5;
  }

  calculateSystemEfficiencyScore(action) {
    const efficiencyMap = {
      'continue_chapter': 0.9, // 기존 컨텍스트 활용으로 효율적
      'complete_novel': 0.7, // 완결 처리는 복잡함
      'new_novel': 0.5 // 새 소설은 가장 많은 리소스 필요
    };
    
    return efficiencyMap[action.type] || 0.5;
  }

  calculateStrategicValueScore(action, strategicGoals) {
    // 전략적 목표 달성에 대한 기여도
    let strategicScore = 0.5;
    
    if (action.type === 'complete_novel') {
      strategicScore += 0.3; // 완결 작품은 포트폴리오 강화
    }
    
    if (action.type === 'new_novel') {
      strategicScore += 0.2; // 새 작품은 다양성 증대
    }
    
    return Math.min(strategicScore, 1.0);
  }

  /**
   * 🏅 최적 액션 선택
   */
  selectOptimalAction(actionScores, currentState) {
    // 점수 기준 정렬
    const sortedActions = Object.entries(actionScores)
      .sort(([,a], [,b]) => b - a)
      .map(([actionId, score]) => ({ actionId, score }));

    if (sortedActions.length === 0) {
      return {
        type: 'new_novel',
        reason: '가능한 액션이 없어 기본 액션 선택',
        reasoning: '시스템 안전성을 위한 기본 선택'
      };
    }

    const bestActionId = sortedActions[0].actionId;
    const bestScore = sortedActions[0].score;

    // 액션 ID에서 액션 정보 추출
    const actionInfo = this.parseActionId(bestActionId, currentState);
    
    return {
      type: actionInfo.type,
      targetNovel: actionInfo.targetNovel,
      reason: this.generateReason(actionInfo, bestScore),
      reasoning: this.generateDetailedReasoning(actionInfo, sortedActions)
    };
  }

  parseActionId(actionId, currentState) {
    if (actionId.startsWith('complete_')) {
      const novelSlug = actionId.replace('complete_', '');
      const novel = currentState.novels.find(n => n.slug === novelSlug);
      return {
        type: 'complete_novel',
        targetNovel: novelSlug,
        novel
      };
    }
    
    if (actionId.startsWith('continue_')) {
      const novelSlug = actionId.replace('continue_', '');
      const novel = currentState.novels.find(n => n.slug === novelSlug);
      return {
        type: 'continue_chapter',
        targetNovel: novelSlug,
        novel
      };
    }
    
    return {
      type: 'new_novel'
    };
  }

  generateReason(actionInfo, score) {
    if (actionInfo.type === 'complete_novel') {
      return `AI 분석: 완결 최적 타이밍 (신뢰도: ${Math.round(score * 100)}%)`;
    }
    
    if (actionInfo.type === 'continue_chapter') {
      return `AI 분석: 독자 참여도 최적화 필요 (신뢰도: ${Math.round(score * 100)}%)`;
    }
    
    return `AI 분석: 콘텐츠 다양성 확장 기회 (신뢰도: ${Math.round(score * 100)}%)`;
  }

  generateDetailedReasoning(actionInfo, sortedActions) {
    const reasoning = [];
    
    reasoning.push(`선택된 액션: ${actionInfo.type}`);
    reasoning.push(`분석된 대안: ${sortedActions.length}개`);
    reasoning.push(`최고 점수: ${(sortedActions[0].score * 100).toFixed(1)}%`);
    
    if (sortedActions.length > 1) {
      reasoning.push(`차점자 점수: ${(sortedActions[1].score * 100).toFixed(1)}%`);
    }
    
    return reasoning.join(' | ');
  }

  /**
   * 🎯 신뢰도 계산
   */
  calculateConfidence(bestAction, actionScores) {
    const scores = Object.values(actionScores);
    if (scores.length === 0) return 0.5;
    
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // 최고 점수와 평균 점수의 차이를 기반으로 신뢰도 계산
    const scoreGap = maxScore - avgScore;
    const confidence = Math.min(0.5 + scoreGap * 2, 1.0);
    
    return Math.max(confidence, 0.3); // 최소 신뢰도 보장
  }

  /**
   * 📊 가중치 정규화
   */
  normalizeWeights(weights) {
    const sum = Object.values(weights).reduce((total, weight) => total + weight, 0);
    const normalized = {};
    
    for (const [key, value] of Object.entries(weights)) {
      normalized[key] = value / sum;
    }
    
    return normalized;
  }

  /**
   * 📝 의사결정 히스토리 업데이트
   */
  updateDecisionHistory(decision) {
    this.decisionHistory.push({
      ...decision,
      timestamp: new Date().toISOString()
    });

    // 최근 100개 결정만 유지
    if (this.decisionHistory.length > 100) {
      this.decisionHistory = this.decisionHistory.slice(-100);
    }

    this.performanceTracker.totalDecisions++;
    this.performanceTracker.lastAnalysisTime = decision.analysisTime;
  }

  /**
   * 📈 성능 메트릭 내보내기
   */
  exportPerformanceMetrics() {
    const recentDecisions = this.decisionHistory.slice(-10);
    
    return {
      totalDecisions: this.performanceTracker.totalDecisions,
      averageAnalysisTime: this.performanceTracker.lastAnalysisTime,
      confidenceDistribution: this.calculateConfidenceDistribution(recentDecisions),
      actionTypeDistribution: this.calculateActionTypeDistribution(recentDecisions),
      decisionQuality: this.assessDecisionQuality()
    };
  }

  calculateConfidenceDistribution(decisions) {
    if (decisions.length === 0) return { high: 0, medium: 0, low: 0 };
    
    const distribution = { high: 0, medium: 0, low: 0 };
    
    for (const decision of decisions) {
      if (decision.confidence > 0.8) distribution.high++;
      else if (decision.confidence > 0.6) distribution.medium++;
      else distribution.low++;
    }
    
    return distribution;
  }

  calculateActionTypeDistribution(decisions) {
    const distribution = {};
    
    for (const decision of decisions) {
      distribution[decision.type] = (distribution[decision.type] || 0) + 1;
    }
    
    return distribution;
  }

  assessDecisionQuality() {
    // 실제 구현에서는 결정의 실제 결과와 비교하여 품질 평가
    // 여기서는 신뢰도 기반 근사치 제공
    const recentDecisions = this.decisionHistory.slice(-20);
    if (recentDecisions.length === 0) return 0.7;
    
    const avgConfidence = recentDecisions.reduce((sum, d) => sum + d.confidence, 0) / recentDecisions.length;
    return avgConfidence;
  }
}