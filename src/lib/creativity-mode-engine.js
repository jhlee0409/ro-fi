/**
 * 창의성 모드 엔진
 * AI 로판 작품의 품질과 효율성을 동적으로 조절하는 지능형 시스템
 */

export class CreativityModeEngine {
  constructor() {
    // 창의성 트리거 설정
    this.creativityTriggers = {
      // 스토리 마일스톤 (핵심 장면)
      storyMilestones: [
        'first_meeting',      // 첫 만남
        'first_kiss',         // 첫 키스
        'confession',         // 고백
        'major_twist',        // 주요 반전
        'climax',            // 클라이맥스
        'season_start',       // 시즌 시작
        'season_end',        // 시즌 종료
        'emotional_peak'      // 감정적 정점
      ],

      // 독자 메트릭스 임계값
      readerMetrics: {
        dropoutRate: 0.2,           // 이탈률 20% 초과
        emotionStagnation: 5,       // 감정 정체 5화
        similarityThreshold: 3,     // 3화 연속 유사 전개
        engagementDrop: 0.3        // 참여도 30% 하락
      },

      // 외부 요인
      externalFactors: {
        competitionAlert: true,     // 경쟁작 대응
        trendingGenre: true,       // 트렌드 장르 변화
        seasonalEvent: true        // 시즌 이벤트
      }
    };

    // 토큰 전략 설정
    this.tokenStrategy = {
      efficiency: {
        min: 2000,
        max: 3000,
        avgTokens: 2500,
        costReduction: 0.5,
        quality: 'enhanced'
      },
      creativity: {
        min: null,              // 무제한
        max: null,              // 무제한
        avgTokens: 15000,       // 대폭 증가
        costReduction: 0,
        quality: 'masterpiece'
      },
      balanced: {
        min: 2000,
        max: 3500,
        avgTokens: 2750,
        costReduction: 0.5,
        quality: 'enhanced'
      }
    };

    // 창의성 ROI 추적
    this.roiTracker = {
      investments: [],
      outcomes: [],
      successPatterns: new Map(),
      averageROI: 0
    };

    // 모드 전환 히스토리
    this.modeHistory = [];

    // 창의성 부스트 쿨다운 (남용 방지)
    this.cooldownPeriod = 2; // 챕터
    this.lastCreativityBoost = null;
  }

  /**
   * 창의성 모드 활성화 여부 결정
   */
  shouldActivateCreativityMode(novelState, readerMetrics, chapterContext) {
    console.log('🤔 창의성 모드 필요성 분석 중...');

    // null 입력값 방어 처리
    if (!novelState || !chapterContext) {
      return {
        activate: false,
        triggers: [],
        score: 0,
        recommendedTokens: this.tokenStrategy.efficiency,
        reason: 'Invalid input parameters'
      };
    }

    // 쿨다운 체크
    if (this.isInCooldown(novelState.slug)) {
      console.log('⏳ 창의성 모드 쿨다운 중');
      return {
        activate: false,
        triggers: [],
        score: 0,
        recommendedTokens: this.tokenStrategy.efficiency,
        reason: 'Cooldown period active'
      };
    }

    const triggers = [];

    // 1. 스토리 마일스톤 체크
    const milestoneCheck = this.checkStoryMilestones(chapterContext);
    if (milestoneCheck.triggered) {
      triggers.push({
        type: 'milestone',
        reason: milestoneCheck.reason,
        priority: 'high',
        score: 0.9
      });
    }

    // 2. 독자 메트릭스 체크
    const metricsCheck = this.checkReaderMetrics(readerMetrics);
    if (metricsCheck.triggered) {
      triggers.push({
        type: 'metrics',
        reason: metricsCheck.reason,
        priority: metricsCheck.priority,
        score: metricsCheck.score
      });
    }

    // 3. 패턴 반복 체크
    const patternCheck = this.checkRepetitivePatterns(novelState);
    if (patternCheck.triggered) {
      triggers.push({
        type: 'pattern',
        reason: patternCheck.reason,
        priority: 'medium',
        score: 0.6
      });
    }

    // 4. 외부 요인 체크
    const externalCheck = this.checkExternalFactors();
    if (externalCheck.triggered) {
      triggers.push({
        type: 'external',
        reason: externalCheck.reason,
        priority: 'medium',
        score: 0.5
      });
    }

    // 종합 점수 계산
    const totalScore = triggers.reduce((sum, t) => sum + t.score, 0);
    const shouldActivate = totalScore >= 0.7;

    if (shouldActivate) {
      console.log('🎨 창의성 모드 활성화 결정!');
      console.log('📊 트리거:', triggers);
      this.recordModeActivation(novelState.slug, triggers);
    }

    return {
      activate: shouldActivate,
      triggers,
      score: totalScore,
      recommendedTokens: shouldActivate ? this.tokenStrategy.creativity : this.tokenStrategy.efficiency
    };
  }

  /**
   * 스토리 마일스톤 체크
   */
  checkStoryMilestones(chapterContext) {
    // 챕터 번호와 진행도를 기반으로 마일스톤 예측
    const { chapterNumber, progressPercentage, plotStage } = chapterContext;

    // 첫 만남 (1-3화)
    if (chapterNumber <= 3 && plotStage === 'introduction') {
      return {
        triggered: true,
        reason: '첫 만남 - 강렬한 첫인상 필요'
      };
    }

    // 감정적 전환점 (30-40% 진행)
    if (progressPercentage >= 30 && progressPercentage <= 40) {
      return {
        triggered: true,
        reason: '감정 전환점 - 관계 변화의 핵심 순간'
      };
    }

    // 클라이맥스 (70-80% 진행)
    if (progressPercentage >= 70 && progressPercentage <= 80) {
      return {
        triggered: true,
        reason: '클라이맥스 - 스토리의 정점'
      };
    }

    // 시즌 종료 (90% 이상)
    if (progressPercentage >= 90) {
      return {
        triggered: true,
        reason: '시즌 피날레 - 감동적인 마무리 필요'
      };
    }

    return { triggered: false };
  }

  /**
   * 독자 메트릭스 체크
   */
  checkReaderMetrics(metrics) {
    if (!metrics) return { triggered: false };

    // 이탈률 체크
    if (metrics.dropoutRate > this.creativityTriggers.readerMetrics.dropoutRate) {
      return {
        triggered: true,
        reason: `독자 이탈률 ${(metrics.dropoutRate * 100).toFixed(1)}% - 긴급 개선 필요`,
        priority: 'critical',
        score: 0.9
      };
    }

    // 참여도 하락 체크
    if (metrics.engagementDrop > this.creativityTriggers.readerMetrics.engagementDrop) {
      return {
        triggered: true,
        reason: '독자 참여도 급락 - 흥미 유발 필요',
        priority: 'high',
        score: 0.8
      };
    }

    // 감정 정체 체크
    if (metrics.emotionStagnation >= this.creativityTriggers.readerMetrics.emotionStagnation) {
      return {
        triggered: true,
        reason: `${metrics.emotionStagnation}화 연속 감정 변화 없음`,
        priority: 'medium',
        score: 0.7
      };
    }

    return { triggered: false };
  }

  /**
   * 반복 패턴 체크
   */
  checkRepetitivePatterns(novelState) {
    // 최근 3화의 패턴 분석
    const recentChapters = novelState.recentChapters || [];

    if (recentChapters.length >= 3) {
      // 간단한 유사도 체크 (실제로는 더 정교한 알고리즘 필요)
      const patterns = this.extractPatterns(recentChapters);
      const similarity = this.calculateSimilarity(patterns);

      if (similarity > 0.7) {
        return {
          triggered: true,
          reason: '최근 3화 유사한 전개 - 변화 필요'
        };
      }
    }

    return { triggered: false };
  }

  /**
   * 외부 요인 체크
   */
  checkExternalFactors() {
    // 실제로는 외부 API나 데이터베이스에서 정보를 가져와야 함
    const mockCompetitionAlert = Math.random() > 0.9; // 10% 확률로 경쟁작 알림

    if (mockCompetitionAlert) {
      return {
        triggered: true,
        reason: '경쟁작 대히트 - 차별화 전략 필요'
      };
    }

    return { triggered: false };
  }

  /**
   * 창의적 프롬프트 생성
   */
  generateCreativePrompt(context, triggers) {
    // null 체크
    if (!context || !triggers || triggers.length === 0) {
      return {
        mode: 'EFFICIENCY',
        tokenLimit: 'LIMITED',
        qualityTarget: 'STANDARD',
        directive: '기본 품질로 작성',
        emphasis: [],
        techniques: []
      };
    }

    const { novel, chapter, emotionalStage } = context;
    const primaryTrigger = triggers[0]; // 가장 중요한 트리거

    let creativeDirective = '';

    switch (primaryTrigger.type) {
      case 'milestone':
        creativeDirective = `
🎯 핵심 장면 창작 지시:
- 이 장면은 독자들이 영원히 기억할 명장면이 되어야 합니다
- 감각적 묘사를 극대화하여 독자가 현장에 있는 듯한 몰입감 제공
- 캐릭터의 미세한 감정 변화를 섬세하게 포착
- 예상을 뛰어넘는 창의적인 전개로 독자를 놀라게 하세요
- 아름다운 문체와 시적인 표현을 아끼지 마세요`;
        break;

      case 'metrics':
        creativeDirective = `
🚨 독자 이탈 방지 특별 지시:
- 첫 문장부터 강렬한 훅으로 독자를 사로잡으세요
- 예측 불가능한 반전이나 충격적인 사건 전개
- 감정의 롤러코스터를 만들어 독자가 손에서 놓을 수 없게 하세요
- 클리프행어는 필수 - 다음 화를 안 볼 수 없게 만드세요
- 독자 리뷰에서 "미쳤다"는 반응이 나올 정도의 임팩트`;
        break;

      case 'pattern':
        creativeDirective = `
🔄 패턴 탈피 창의성 지시:
- 기존 전개 방식을 완전히 뒤집어 주세요
- 새로운 캐릭터나 설정을 과감하게 도입
- 장르의 클리셰를 깨는 혁신적인 시도
- 독자의 예상을 완전히 벗어나는 전개
- 신선하고 독창적인 아이디어를 마음껏 펼치세요`;
        break;

      case 'external':
        creativeDirective = `
🏆 경쟁작 대응 특별 창작:
- 이 작품만의 독특한 매력을 극대화
- 차별화된 스토리텔링과 캐릭터 매력 부각
- 독자들이 SNS에 공유하고 싶은 명대사 창조
- 팬아트를 그리고 싶게 만드는 비주얼적인 장면
- 다른 작품과 비교 불가한 유니크한 요소 강조`;
        break;
    }

    return {
      mode: 'CREATIVITY_BOOST',
      tokenLimit: 'UNLIMITED',
      qualityTarget: 'MASTERPIECE',
      directive: creativeDirective,
      emphasis: [
        '감정적 깊이',
        '독창성',
        '몰입감',
        '예술성',
        '기억에 남는 장면'
      ],
      techniques: [
        '감각적 묘사 극대화',
        '내면 독백 심화',
        '시적 은유와 상징',
        '미세한 감정 포착',
        '영화적 장면 연출'
      ]
    };
  }

  /**
   * ROI 추적 및 학습
   */
  trackROI(novelSlug, investment, outcome) {
    const roi = {
      novelSlug,
      timestamp: new Date(),
      investment: {
        tokens: investment.tokens,
        mode: investment.mode,
        triggers: investment.triggers
      },
      outcome: {
        readerEngagement: outcome.engagement,
        chapterRating: outcome.rating,
        shareCount: outcome.shares,
        commentCount: outcome.comments
      },
      score: this.calculateROIScore(investment, outcome)
    };

    this.roiTracker.investments.push(roi);

    // 성공 패턴 학습
    if (roi.score > 1.5) { // 150% 이상의 ROI
      const pattern = investment.triggers && investment.triggers.length > 0
        ? `${investment.triggers[0].type}_${investment.triggers[0].reason.replace(/\s+/g, '_')}`
        : 'unknown_pattern';
      this.roiTracker.successPatterns.set(
        pattern,
        (this.roiTracker.successPatterns.get(pattern) || 0) + 1
      );
    }

    // 평균 ROI 업데이트
    this.updateAverageROI();

    return roi;
  }

  /**
   * ROI 점수 계산
   */
  calculateROIScore(investment, outcome) {
    // 투자 대비 성과 계산
    const engagementBoost = outcome.engagement / (investment.baseline || 1);
    const ratingBoost = outcome.rating / (investment.baselineRating || 3.5);
    const viralScore = (outcome.shares + outcome.comments) / 100;

    return (engagementBoost + ratingBoost + viralScore) / 3;
  }

  /**
   * 평균 ROI 업데이트
   */
  updateAverageROI() {
    if (this.roiTracker.investments.length === 0) return;

    const totalScore = this.roiTracker.investments.reduce(
      (sum, inv) => sum + inv.score,
      0
    );

    this.roiTracker.averageROI = totalScore / this.roiTracker.investments.length;
  }

  /**
   * 쿨다운 체크
   */
  isInCooldown(novelSlug) {
    const lastBoost = this.modeHistory
      .filter(h => h.novelSlug === novelSlug && h.mode === 'creativity')
      .pop();

    if (!lastBoost) return false;

    // 마지막 창의성 모드 사용 이후 기록된 총 챕터 수 계산
    const chaptersSinceBoost = this.modeHistory
      .filter(h => h.novelSlug === novelSlug && h.timestamp > lastBoost.timestamp)
      .length;

    return chaptersSinceBoost < this.cooldownPeriod;
  }

  /**
   * 모드 활성화 기록
   */
  recordModeActivation(novelSlug, triggers) {
    this.modeHistory.push({
      novelSlug,
      timestamp: new Date(),
      mode: 'creativity',
      triggers
    });

    // 히스토리 크기 제한 (최근 100개만 유지)
    if (this.modeHistory.length > 100) {
      this.modeHistory = this.modeHistory.slice(-100);
    }
  }

  /**
   * 패턴 추출 (간단한 구현)
   */
  extractPatterns(chapters) {
    return chapters.map(ch => ({
      emotionalTone: ch.emotionalTone || 'neutral',
      plotType: ch.plotType || 'development',
      characterFocus: ch.characterFocus || 'both'
    }));
  }

  /**
   * 유사도 계산 (간단한 구현)
   */
  calculateSimilarity(patterns) {
    if (patterns.length < 2) return 0;

    let similarityScore = 0;
    const compareFields = ['emotionalTone', 'plotType', 'characterFocus'];

    for (let i = 1; i < patterns.length; i++) {
      let matches = 0;
      compareFields.forEach(field => {
        if (patterns[i][field] === patterns[i-1][field]) {
          matches++;
        }
      });
      similarityScore += matches / compareFields.length;
    }

    return similarityScore / (patterns.length - 1);
  }

  /**
   * 최적 모드 추천
   */
  recommendMode(context) {
    const creativityCheck = this.shouldActivateCreativityMode(
      context.novelState,
      context.readerMetrics,
      context.chapterContext
    );

    if (creativityCheck.activate) {
      return {
        mode: 'creativity',
        confidence: creativityCheck.score,
        reasoning: creativityCheck.triggers,
        prompt: this.generateCreativePrompt(context, creativityCheck.triggers)
      };
    }

    // 밸런스 모드 체크 (중간 수준의 창의성)
    if (creativityCheck.score >= 0.4 && creativityCheck.score < 0.7) {
      return {
        mode: 'balanced',
        confidence: creativityCheck.score,
        reasoning: '적당한 창의성 필요',
        tokenStrategy: this.tokenStrategy.balanced
      };
    }

    // 효율 모드
    return {
      mode: 'efficiency',
      confidence: 1 - creativityCheck.score,
      reasoning: '표준 품질로 충분',
      tokenStrategy: this.tokenStrategy.efficiency
    };
  }

  /**
   * 성과 리포트 생성
   */
  generatePerformanceReport() {
    const report = {
      totalActivations: this.modeHistory.filter(h => h.mode === 'creativity').length,
      averageROI: this.roiTracker.averageROI,
      topSuccessPatterns: Array.from(this.roiTracker.successPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      tokenSavings: this.calculateTokenSavings(),
      qualityImprovements: this.roiTracker.investments
        .filter(inv => inv.score > 1.5)
        .length
    };

    return report;
  }

  /**
   * 토큰 절약량 계산
   */
  calculateTokenSavings() {
    const totalChapters = this.modeHistory.length;
    const creativityChapters = this.modeHistory.filter(h => h.mode === 'creativity').length;
    const efficiencyChapters = totalChapters - creativityChapters;

    const savedTokens = efficiencyChapters *
      (this.tokenStrategy.creativity.avgTokens - this.tokenStrategy.efficiency.avgTokens) *
      this.tokenStrategy.efficiency.costReduction;

    return {
      totalSaved: Math.round(savedTokens),
      percentageSaved: Math.round((savedTokens / (totalChapters * this.tokenStrategy.creativity.avgTokens)) * 100)
    };
  }
}

// 싱글톤 인스턴스 export
export const creativityModeEngine = new CreativityModeEngine();