/**
 * 🎯 고급 페이싱 제어 시스템 v1.0
 * 
 * 목적: AI의 급진전을 방지하고 자연스러운 스토리 진행 보장
 * 특징: 다층 검증, 실시간 제약, 감정 진행도 추적
 */

/**
 * 📊 다차원 진행도 추적
 */
export class MultiDimensionalProgressTracker {
  constructor() {
    this.dimensions = {
      physical: {
        meetingCount: 0,        // 만난 횟수
        privateTimeCount: 0,    // 둘만의 시간
        touchCount: 0,          // 신체 접촉 (악수, 부딪힘 등)
        intimateGestureCount: 0, // 친밀한 제스처
        progress: 0             // 0-100
      },
      emotional: {
        trustLevel: 0,          // 신뢰도 0-100
        intimacyLevel: 0,       // 친밀도 0-100
        vulnerabilityShared: 0, // 약점/비밀 공유 횟수
        emotionalSupport: 0,    // 정서적 지원 횟수
        progress: 0
      },
      social: {
        publicInteraction: 0,   // 공개적 상호작용
        familyMeeting: 0,       // 가족/친구 소개
        socialStatus: "strangers", // strangers -> acquaintances -> friends -> interested -> couple
        reputationRisk: 0,      // 관계로 인한 사회적 위험
        progress: 0
      },
      plotIntegration: {
        sharedGoals: 0,         // 공동 목표
        sharedSecrets: 0,       // 공유한 비밀
        sharedDangers: 0,       // 함께 겪은 위험
        mutualSacrifice: 0,     // 상호 희생
        progress: 0
      }
    };
  }

  /**
   * 콘텐츠에서 진행도 분석
   */
  analyzeProgressFromContent(content, previousDimensions) {
    const newDimensions = JSON.parse(JSON.stringify(previousDimensions || this.dimensions));
    
    // 물리적 차원 분석
    if (this.containsKeywords(content, ['만났', '마주쳤', '부딪혔', '만남', '처음', '첫'])) {
      newDimensions.physical.meetingCount++;
    }
    if (this.containsKeywords(content, ['둘만', '혼자', '단둘이', '비밀스럽게', '은밀하게'])) {
      newDimensions.physical.privateTimeCount++;
    }
    if (this.containsKeywords(content, ['손', '어깨', '팔', '만졌', '잡았', '접촉', '스쳤'])) {
      newDimensions.physical.touchCount++;
    }

    // 감정적 차원 분석
    if (this.containsKeywords(content, ['믿', '신뢰', '의지', '호기심', '관심', '궁금'])) {
      newDimensions.emotional.trustLevel = Math.min(100, newDimensions.emotional.trustLevel + 5);
    }
    if (this.containsKeywords(content, ['과거', '비밀', '상처', '고백'])) {
      newDimensions.emotional.vulnerabilityShared++;
    }

    // 사회적 차원 분석
    if (this.containsKeywords(content, ['모든 사람', '공개적', '소문', '대화', '이야기'])) {
      newDimensions.social.publicInteraction++;
    }

    // 플롯 통합 차원 분석
    if (this.containsKeywords(content, ['함께', '협력', '동맹', '같이', '서로'])) {
      newDimensions.plotIntegration.sharedGoals++;
    }
    if (this.containsKeywords(content, ['위험', '적', '죽음', '구했', '위기', '도움'])) {
      newDimensions.plotIntegration.sharedDangers++;
    }

    // 각 차원별 진행도 계산
    this.calculateDimensionProgress(newDimensions);
    
    return newDimensions;
  }

  /**
   * 각 차원의 진행도 계산
   */
  calculateDimensionProgress(dimensions) {
    // 물리적 진행도 (만남과 접촉 기반)
    dimensions.physical.progress = Math.min(100, 
      (dimensions.physical.meetingCount * 5) + 
      (dimensions.physical.privateTimeCount * 10) + 
      (dimensions.physical.touchCount * 15)
    );

    // 감정적 진행도 (신뢰와 친밀감 기반)
    dimensions.emotional.progress = Math.min(100,
      dimensions.emotional.trustLevel * 0.5 + 
      (dimensions.emotional.vulnerabilityShared * 20)
    );

    // 사회적 진행도 (관계 공개성 기반)
    const statusScores = {
      strangers: 0,
      acquaintances: 20, 
      friends: 40,
      interested: 60,
      couple: 100
    };
    dimensions.social.progress = statusScores[dimensions.social.socialStatus] || 0;

    // 플롯 통합 진행도
    dimensions.plotIntegration.progress = Math.min(100,
      (dimensions.plotIntegration.sharedGoals * 15) +
      (dimensions.plotIntegration.sharedSecrets * 20) +
      (dimensions.plotIntegration.sharedDangers * 25)
    );
  }

  /**
   * 전체 진행도 계산 (균형적 접근법)
   */
  calculateOverallProgress(dimensions) {
    const scores = Object.values(dimensions).map(d => d.progress);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((a, b) => a + b) / scores.length;
    const nonZeroScores = scores.filter(s => s > 0);
    
    // 초기 단계에서는 어떤 차원이라도 진전이 있으면 허용
    if (nonZeroScores.length >= 2) {
      // 두 개 이상의 차원에서 진전이 있으면 평균 사용
      return avgScore;
    } else if (nonZeroScores.length === 1) {
      // 한 개 차원에서만 진전이 있으면 해당 값의 50%
      return maxScore * 0.5;
    } else {
      // 아무 진전이 없으면 0
      return 0;
    }
  }

  containsKeywords(content, keywords) {
    return keywords.some(keyword => content.includes(keyword));
  }
}

/**
 * 🚫 페이싱 제약 시스템
 */
export class PacingConstraintSystem {
  constructor() {
    this.prohibitedByProgress = {
      "0-15": ['결혼', '고백', '사랑한다', '키스', '연인', '사귀', '포옹'],
      "16-35": ['결혼', '사랑한다', '키스', '연인', '사귀'],
      "36-55": ['결혼', '사랑한다', '키스'],
      "56-75": ['결혼', '임신'],
      "76-90": ['임신', '이혼'],
      "91-100": [] // 마지막에는 모든 것 허용
    };

    this.timeJumpLimits = {
      "0-25": { max: 1, unit: 'days' },    // 최대 1일
      "26-50": { max: 3, unit: 'days' },   // 최대 3일  
      "51-75": { max: 1, unit: 'days' },   // 다시 세밀하게
      "76-100": { max: 7, unit: 'days' }   // 마지막에만 1주
    };

    this.emotionalJumpLimits = {
      "stranger": ['curious', 'wary'],
      "curious": ['interested', 'friendly', 'dismissive'],
      "interested": ['concerned', 'fond', 'confused'],
      "concerned": ['protective', 'caring', 'conflicted'],
      "caring": ['attracted', 'devoted', 'heartbroken'],
      "attracted": ['infatuated', 'in_love', 'rejected'],
      "in_love": ['committed', 'married', 'separated']
    };
  }

  /**
   * 생성된 콘텐츠 검증
   */
  validateContent(content, currentProgress) {
    const violations = [];

    // 1. 진행도별 금지 키워드 체크
    const keywordViolation = this.checkProhibitedKeywords(content, currentProgress);
    if (!keywordViolation.valid) {
      violations.push(keywordViolation);
    }

    // 2. 시간 점프 체크
    const timeViolation = this.checkTimeJumps(content, currentProgress);
    if (!timeViolation.valid) {
      violations.push(timeViolation);
    }

    // 3. 감정 진전 체크  
    const emotionViolation = this.checkEmotionalJumps(content, currentProgress);
    if (!emotionViolation.valid) {
      violations.push(emotionViolation);
    }

    return {
      valid: violations.length === 0,
      violations,
      suggestions: this.generatePacingSuggestions(violations, currentProgress)
    };
  }

  checkProhibitedKeywords(content, progress) {
    const range = this.getProgressRange(progress);
    const prohibited = this.prohibitedByProgress[range] || [];
    
    for (const keyword of prohibited) {
      if (content.includes(keyword)) {
        return {
          valid: false,
          type: 'keyword',
          message: `진행도 ${progress}%에서 "${keyword}"는 너무 이릅니다`,
          suggestion: `현재 단계에서는 감정의 발전보다는 상황과 대화에 집중하세요`
        };
      }
    }
    return { valid: true };
  }

  checkTimeJumps(content, progress) {
    const timePattern = /(\d+)\s*(년|달|주|일|시간)\s*후/g;
    const matches = content.match(timePattern);
    
    if (matches) {
      const range = this.getProgressRange(progress);
      const limit = this.timeJumpLimits[range];
      
      for (const match of matches) {
        const [number, unit] = this.parseTimeJump(match);
        if (this.exceedsTimeLimit(number, unit, limit)) {
          return {
            valid: false,
            type: 'time',
            message: `진행도 ${progress}%에서 "${match}"는 너무 큰 시간 점프입니다`,
            suggestion: `현재 단계에서는 ${limit.max}${this.translateUnit(limit.unit)} 이하로 제한하세요`
          };
        }
      }
    }
    return { valid: true };
  }

  checkEmotionalJumps(content, progress) {
    // 감정 관련 키워드 분석하여 급격한 변화 감지
    const strongEmotions = ['사랑', '열정', '갈망', '그리움', '절망'];
    const mildEmotions = ['관심', '호기심', '친근감', '신뢰'];
    
    if (progress < 50 && this.containsAny(content, strongEmotions)) {
      return {
        valid: false,
        type: 'emotion',
        message: `진행도 ${progress}%에서 강한 감정 표현은 너무 이릅니다`,
        suggestion: `현재는 ${mildEmotions.join(', ')} 정도의 미묘한 감정에 집중하세요`
      };
    }
    return { valid: true };
  }

  getProgressRange(progress) {
    if (progress <= 15) return "0-15";
    if (progress <= 35) return "16-35";
    if (progress <= 55) return "36-55";
    if (progress <= 75) return "56-75";
    if (progress <= 90) return "76-90";
    return "91-100";
  }

  parseTimeJump(match) {
    const regex = /(\d+)\s*(년|달|주|일|시간)/;
    const result = match.match(regex);
    return result ? [parseInt(result[1]), result[2]] : [0, ''];
  }

  exceedsTimeLimit(number, unit, limit) {
    const unitDays = { '시간': 1/24, '일': 1, '주': 7, '달': 30, '년': 365 };
    const jumpDays = number * (unitDays[unit] || 0);
    const limitDays = limit.max * (unitDays[limit.unit] || 0);
    return jumpDays > limitDays;
  }

  translateUnit(unit) {
    const translations = { days: '일', weeks: '주', months: '달', years: '년' };
    return translations[unit] || unit;
  }

  containsAny(content, keywords) {
    return keywords.some(keyword => content.includes(keyword));
  }

  generatePacingSuggestions(violations, _progress) {
    const suggestions = [];
    
    if (violations.some(v => v.type === 'keyword')) {
      suggestions.push("관계의 진전보다는 캐릭터 간의 대화와 상황에 집중하세요");
    }
    
    if (violations.some(v => v.type === 'time')) {
      suggestions.push("시간의 흐름을 더 세밀하게 그리고 점진적으로 표현하세요");
    }
    
    if (violations.some(v => v.type === 'emotion')) {
      suggestions.push("감정의 변화를 더 미묘하고 간접적으로 표현하세요");
    }

    return suggestions;
  }
}

/**
 * 🎭 관계 마일스톤 시스템
 */
export class RelationshipMilestoneSystem {
  constructor() {
    this.milestones = [
      {
        name: "first_encounter",
        requirement: "첫 만남과 첫인상 형성",
        minimumChapters: 1,
        requiredElements: ["주인공과 상대역의 만남", "첫인상이나 감정 묘사"],
        allowedEmotions: ["curiosity", "wariness", "surprise", "indifference"]
      },
      {
        name: "repeated_interactions", 
        requirement: "반복적 만남과 점진적 관심",
        minimumChapters: 2,
        requiredElements: ["최소 3번의 상호작용", "서로에 대한 관심이나 궁금증"],
        allowedEmotions: ["interest", "concern", "confusion", "amusement"]
      },
      {
        name: "trust_building",
        requirement: "신뢰 관계 형성",
        minimumChapters: 3,
        requiredElements: ["서로에 대한 이해", "신뢰할 수 있는 행동", "개인적 정보 공유"],
        allowedEmotions: ["trust", "respect", "fondness", "protectiveness"]
      },
      {
        name: "emotional_awareness",
        requirement: "감정적 자각",
        minimumChapters: 2,
        requiredElements: ["특별한 감정 인식", "상대를 향한 관심 증가"],
        allowedEmotions: ["attraction", "longing", "confusion_about_feelings"]
      },
      {
        name: "conflict_and_resolution",
        requirement: "갈등과 해결",
        minimumChapters: 2,
        requiredElements: ["중요한 갈등이나 오해", "갈등 해결 과정"],
        allowedEmotions: ["pain", "regret", "determination", "relief"]
      },
      {
        name: "commitment",
        requirement: "관계 확정",
        minimumChapters: 1,
        requiredElements: ["서로에 대한 확신", "미래에 대한 약속"],
        allowedEmotions: ["love", "devotion", "happiness", "security"]
      }
    ];
    
    this.currentMilestone = 0;
    this.completedMilestones = [];
  }

  /**
   * 현재 마일스톤 달성 여부 확인
   */
  checkMilestoneCompletion(storyState, generatedContent) {
    if (this.currentMilestone >= this.milestones.length) {
      return { completed: true, canProgress: true };
    }

    const milestone = this.milestones[this.currentMilestone];
    const chapterCount = storyState.chapters.length;
    
    // 최소 챕터 수 체크
    if (chapterCount < milestone.minimumChapters) {
      return {
        completed: false,
        canProgress: false,
        reason: `${milestone.name}는 최소 ${milestone.minimumChapters}챕터가 필요합니다`
      };
    }

    // 필수 요소 체크
    const hasRequiredElements = this.checkRequiredElements(
      storyState, 
      generatedContent, 
      milestone.requiredElements
    );

    if (hasRequiredElements) {
      this.completedMilestones.push(milestone);
      this.currentMilestone++;
      return { completed: true, canProgress: true };
    }

    return {
      completed: false,
      canProgress: true,
      suggestion: `다음 요소를 포함하세요: ${milestone.requiredElements.join(', ')}`
    };
  }

  checkRequiredElements(storyState, content, requiredElements) {
    // 간단한 키워드 매칭으로 시작 (향후 더 정교한 NLP 적용 가능)
    const allContent = storyState.chapters.map(ch => ch.summary).join(' ') + content;
    
    return requiredElements.every(element => {
      // 요소별 키워드 매칭 로직
      if (element.includes('만남')) {
        return /만났|마주쳤|처음|첫/.test(allContent);
      }
      if (element.includes('첫인상') || element.includes('감정')) {
        return /호기심|관심|궁금|느낌|인상|감정|생각|마음/.test(allContent);
      }
      if (element.includes('상호작용')) {
        return /대화|말|이야기|함께/.test(allContent);
      }
      if (element.includes('신뢰')) {
        return /믿|신뢰|의지|도움/.test(allContent);
      }
      if (element.includes('갈등')) {
        return /갈등|오해|문제|위기/.test(allContent);
      }
      return true; // 기본적으로 통과
    });
  }

  /**
   * 다음 마일스톤으로 진행 가능한지 확인
   */
  canProgressToNext(currentProgress) {
    const milestone = this.milestones[this.currentMilestone];
    if (!milestone) return true;

    // 진행도가 마일스톤 요구사항에 맞는지 확인
    const requiredProgress = (this.currentMilestone / this.milestones.length) * 100;
    return currentProgress >= requiredProgress * 0.8; // 80% 이상이면 진행 허용
  }
}

/**
 * 🎯 통합 고급 페이싱 컨트롤러
 */
export class AdvancedPacingController {
  constructor() {
    this.progressTracker = new MultiDimensionalProgressTracker();
    this.constraintSystem = new PacingConstraintSystem();
    this.milestoneSystem = new RelationshipMilestoneSystem();
  }

  /**
   * 생성된 콘텐츠의 페이싱 검증 및 진행도 업데이트
   */
  async validateAndUpdateProgress(content, storyState) {
    // 1. 다차원 진행도 분석
    const newDimensions = this.progressTracker.analyzeProgressFromContent(
      content, 
      storyState.advancedProgress?.dimensions
    );

    // 2. 전체 진행도 계산
    const overallProgress = this.progressTracker.calculateOverallProgress(newDimensions);

    // 3. 제약 검증
    const constraintValidation = this.constraintSystem.validateContent(content, overallProgress);

    // 4. 마일스톤 체크
    const milestoneCheck = this.milestoneSystem.checkMilestoneCompletion(storyState, content);

    // 5. 결과 종합
    const result = {
      valid: constraintValidation.valid && milestoneCheck.canProgress,
      overallProgress,
      dimensions: newDimensions,
      violations: constraintValidation.violations,
      milestoneStatus: milestoneCheck,
      suggestions: [
        ...constraintValidation.suggestions,
        ...(milestoneCheck.suggestion ? [milestoneCheck.suggestion] : [])
      ]
    };

    // 6. 스토리 상태 업데이트
    if (result.valid) {
      storyState.advancedProgress = {
        dimensions: newDimensions,
        overallProgress,
        currentMilestone: this.milestoneSystem.currentMilestone,
        completedMilestones: this.milestoneSystem.completedMilestones
      };
    }

    return result;
  }

  /**
   * 다음 챕터를 위한 제약 조건 생성
   */
  generateConstraintsForNextChapter(storyState) {
    const progress = storyState.advancedProgress?.overallProgress || 0;
    const currentMilestone = this.milestoneSystem.milestones[this.milestoneSystem.currentMilestone];
    
    const constraints = {
      progress,
      allowedEmotions: currentMilestone?.allowedEmotions || [],
      prohibitedKeywords: this.constraintSystem.prohibitedByProgress[
        this.constraintSystem.getProgressRange(progress)
      ] || [],
      currentMilestone: currentMilestone?.name || 'unknown',
      requiredElements: currentMilestone?.requiredElements || [],
      timeLimit: this.constraintSystem.timeJumpLimits[
        this.constraintSystem.getProgressRange(progress)
      ] || { max: 1, unit: 'days' }
    };

    return constraints;
  }

  /**
   * 제약 조건을 포함한 프롬프트 생성
   */
  generateConstrainedPrompt(basePrompt, constraints) {
    return `${basePrompt}

=== 📏 페이싱 제약 조건 ===
현재 진행도: ${constraints.progress.toFixed(1)}%
현재 단계: ${constraints.currentMilestone}

✅ 허용되는 감정: ${constraints.allowedEmotions.join(', ')}
❌ 금지된 표현: ${constraints.prohibitedKeywords.join(', ')}
⏰ 시간 제한: 최대 ${constraints.timeLimit.max}${this.constraintSystem.translateUnit(constraints.timeLimit.unit)}

🎯 이번 챕터 목표: ${constraints.requiredElements.join(', ')}

⚠️ 중요: 위 제약 조건을 엄격히 준수하여 자연스럽고 점진적인 관계 발전을 그려주세요.
급진전은 절대 금지하며, 감정의 변화는 미묘하고 현실적이어야 합니다.`;
  }
}

export default AdvancedPacingController;