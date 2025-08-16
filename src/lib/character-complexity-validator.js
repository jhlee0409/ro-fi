#!/usr/bin/env node

/**
 * 🧠 Character Complexity Validator
 * 
 * 독자 피드백 기반 캐릭터 복잡성 검증 시스템
 * - 평면적 캐릭터 탐지 및 개선
 * - 내적 갈등과 성장 아크 검증
 * - 캐릭터 간 관계 복잡성 분석
 * - 숨겨진 의도와 이중성 확인
 */

export class CharacterComplexityValidator {
  constructor(logger) {
    this.logger = logger;
    
    // 캐릭터 복잡성 지표
    this.complexityMetrics = {
      // 내적 갈등 지표
      internalConflict: {
        keywords: ['고민', '갈등', '혼란', '딜레마', '후회', '죄책감', '두려움', '불안', '의심'],
        minScore: 3,
        weight: 0.25
      },
      
      // 성장 아크 지표
      growthArc: {
        keywords: ['깨달음', '변화', '성장', '발전', '극복', '배움', '이해', '받아들임'],
        minScore: 2,
        weight: 0.20
      },
      
      // 숨겨진 의도 지표
      hiddenMotives: {
        keywords: ['숨긴', '비밀', '감춘', '속내', '진심', '실제로는', '사실은', '겉으로는'],
        minScore: 2,
        weight: 0.20
      },
      
      // 감정 복잡성 지표
      emotionalComplexity: {
        keywords: ['복잡한', '애매한', '미묘한', '상반된', '모순된', '엇갈린', '혼재된'],
        minScore: 2,
        weight: 0.15
      },
      
      // 관계 역학 지표
      relationshipDynamics: {
        keywords: ['신뢰', '의심', '배신', '이해', '오해', '갈등', '화해', '긴장'],
        minScore: 3,
        weight: 0.20
      }
    };
    
    // 평면적 캐릭터 징후
    this.flatCharacterSigns = {
      oneNote: ['항상', '언제나', '절대', '결코', '당연히'],
      noGrowth: ['처음부터', '변함없이', '여전히', '그대로'],
      noConflict: ['편안한', '평화로운', '문제없는', '순조로운'],
      predictable: ['예상대로', '역시', '당연히', '뻔한']
    };
    
    // 캐릭터 발전 단계
    this.developmentStages = {
      introduction: {
        requirements: ['명확한 특징', '초기 동기', '갈등 씨앗'],
        redFlags: ['완벽한 캐릭터', '갈등 없는 상태']
      },
      development: {
        requirements: ['내적 갈등', '관계 변화', '도전 직면'],
        redFlags: ['정체된 상태', '변화 없음']
      },
      transformation: {
        requirements: ['성장 증거', '변화된 행동', '새로운 이해'],
        redFlags: ['급작스런 변화', '설득력 없는 성장']
      }
    };
  }

  /**
   * 캐릭터 복잡성 종합 검증
   */
  async validateCharacterComplexity(content, storyContext) {
    this.logger.info('🧠 캐릭터 복잡성 검증 시작');
    
    try {
      // 1단계: 복잡성 지표 분석
      const complexityScores = this.analyzeComplexityMetrics(content);
      
      // 2단계: 평면적 캐릭터 징후 탐지
      const flatCharacterDetection = this.detectFlatCharacters(content);
      
      // 3단계: 캐릭터 발전 단계 평가
      const developmentAssessment = this.assessCharacterDevelopment(content, storyContext);
      
      // 4단계: 관계 복잡성 분석
      const relationshipAnalysis = this.analyzeRelationships(content);
      
      // 5단계: 종합 점수 계산
      const overallScore = this.calculateOverallComplexity(
        complexityScores,
        flatCharacterDetection,
        developmentAssessment,
        relationshipAnalysis
      );
      
      // 6단계: 개선 방안 제시
      const improvements = this.generateImprovements(overallScore, complexityScores);
      
      const result = {
        overallScore: overallScore.total,
        complexityStatus: this.getComplexityStatus(overallScore.total),
        detailedScores: complexityScores,
        flatCharacterIssues: flatCharacterDetection,
        developmentStatus: developmentAssessment,
        relationshipQuality: relationshipAnalysis,
        recommendations: improvements
      };
      
      this.logger.success('✅ 캐릭터 복잡성 검증 완료', {
        score: overallScore.total,
        status: result.complexityStatus
      });
      
      return result;
      
    } catch (error) {
      this.logger.error('❌ 캐릭터 복잡성 검증 실패:', error.message);
      throw error;
    }
  }

  /**
   * 복잡성 지표 분석
   */
  analyzeComplexityMetrics(content) {
    const scores = {};
    
    Object.entries(this.complexityMetrics).forEach(([metric, config]) => {
      const keywordCount = this.countKeywords(content, config.keywords);
      const score = Math.min(10, (keywordCount / config.minScore) * 10);
      
      scores[metric] = {
        rawCount: keywordCount,
        score: score,
        weight: config.weight,
        weightedScore: score * config.weight,
        status: score >= 7 ? 'GOOD' : score >= 5 ? 'ADEQUATE' : 'POOR'
      };
    });
    
    return scores;
  }

  /**
   * 평면적 캐릭터 징후 탐지
   */
  detectFlatCharacters(content) {
    const issues = {};
    
    Object.entries(this.flatCharacterSigns).forEach(([issue, keywords]) => {
      const count = this.countKeywords(content, keywords);
      issues[issue] = {
        count: count,
        severity: count > 5 ? 'HIGH' : count > 2 ? 'MEDIUM' : 'LOW',
        description: this.getFlatCharacterDescription(issue)
      };
    });
    
    return issues;
  }

  /**
   * 캐릭터 발전 단계 평가
   */
  assessCharacterDevelopment(content, storyContext) {
    const chapterNumber = storyContext.chapterNumber || 1;
    const expectedStage = this.getExpectedDevelopmentStage(chapterNumber);
    
    const stageAnalysis = {
      expectedStage: expectedStage,
      requirements: this.developmentStages[expectedStage].requirements,
      redFlags: this.developmentStages[expectedStage].redFlags,
      fulfillment: {}
    };
    
    // 요구사항 충족도 검사
    stageAnalysis.requirements.forEach(requirement => {
      stageAnalysis.fulfillment[requirement] = this.checkRequirement(content, requirement);
    });
    
    // 경고 신호 검사
    stageAnalysis.redFlagDetection = {};
    stageAnalysis.redFlags.forEach(redFlag => {
      stageAnalysis.redFlagDetection[redFlag] = this.checkRedFlag(content, redFlag);
    });
    
    return stageAnalysis;
  }

  /**
   * 관계 복잡성 분석
   */
  analyzeRelationships(content) {
    const relationshipElements = {
      trust_issues: ['신뢰', '의심', '믿음', '불신'],
      emotional_barriers: ['벽', '거리', '장벽', '방어'],
      communication_problems: ['오해', '침묵', '말하지 못한', '전하지 못한'],
      power_dynamics: ['주도권', '의존', '지배', '영향력'],
      growth_together: ['함께', '서로', '상호', '공통']
    };
    
    const analysis = {};
    Object.entries(relationshipElements).forEach(([aspect, keywords]) => {
      const count = this.countKeywords(content, keywords);
      analysis[aspect] = {
        count: count,
        strength: count > 3 ? 'STRONG' : count > 1 ? 'MODERATE' : 'WEAK'
      };
    });
    
    return analysis;
  }

  /**
   * 종합 복잡성 점수 계산
   */
  calculateOverallComplexity(complexityScores, flatCharacterDetection, developmentAssessment, relationshipAnalysis) {
    // 복잡성 점수 (가중평균)
    const complexityTotal = Object.values(complexityScores).reduce((sum, metric) => {
      return sum + metric.weightedScore;
    }, 0);
    
    // 평면적 캐릭터 패널티
    const flatCharacterPenalty = Object.values(flatCharacterDetection).reduce((penalty, issue) => {
      return penalty + (issue.severity === 'HIGH' ? 2 : issue.severity === 'MEDIUM' ? 1 : 0);
    }, 0);
    
    // 발전 단계 보너스
    const developmentBonus = Object.values(developmentAssessment.fulfillment).filter(
      fulfilled => fulfilled
    ).length * 0.5;
    
    // 관계 복잡성 보너스
    const relationshipBonus = Object.values(relationshipAnalysis).filter(
      aspect => aspect.strength === 'STRONG'
    ).length * 0.3;
    
    const total = Math.max(0, Math.min(10, 
      (complexityTotal * 10) - flatCharacterPenalty + developmentBonus + relationshipBonus
    ));
    
    return {
      total: total,
      complexityBase: complexityTotal * 10,
      flatCharacterPenalty: flatCharacterPenalty,
      developmentBonus: developmentBonus,
      relationshipBonus: relationshipBonus
    };
  }

  /**
   * 개선 방안 생성
   */
  generateImprovements(overallScore, complexityScores) {
    const improvements = [];
    
    // 낮은 점수 지표에 대한 개선사항
    Object.entries(complexityScores).forEach(([metric, data]) => {
      if (data.score < 5) {
        improvements.push({
          area: metric,
          priority: 'HIGH',
          suggestion: this.getImprovementSuggestion(metric),
          currentScore: data.score
        });
      }
    });
    
    // 전체 점수에 따른 일반 개선사항
    if (overallScore.total < 6) {
      improvements.push({
        area: 'overall',
        priority: 'CRITICAL',
        suggestion: '캐릭터에 더 많은 내적 갈등과 복잡성을 부여하세요',
        currentScore: overallScore.total
      });
    }
    
    return improvements;
  }

  /**
   * 헬퍼 메서드들
   */
  countKeywords(content, keywords) {
    let count = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex);
      count += matches ? matches.length : 0;
    });
    return count;
  }

  getComplexityStatus(score) {
    if (score >= 8) return 'HIGHLY_COMPLEX';
    if (score >= 6) return 'MODERATELY_COMPLEX';
    if (score >= 4) return 'SIMPLE';
    return 'FLAT';
  }

  getExpectedDevelopmentStage(chapterNumber) {
    if (chapterNumber <= 2) return 'introduction';
    if (chapterNumber <= 4) return 'development';
    return 'transformation';
  }

  getFlatCharacterDescription(issue) {
    const descriptions = {
      oneNote: '캐릭터가 한 가지 특성만 보임',
      noGrowth: '캐릭터에 성장이나 변화가 없음',
      noConflict: '캐릭터에 갈등이나 고민이 없음',
      predictable: '캐릭터의 행동이 너무 예측 가능함'
    };
    return descriptions[issue] || '알 수 없는 문제';
  }

  checkRequirement(content, requirement) {
    const requirementKeywords = {
      '명확한 특징': ['특징', '성격', '개성', '특성'],
      '초기 동기': ['목적', '이유', '동기', '목표'],
      '갈등 씨앗': ['갈등', '문제', '어려움', '고민'],
      '내적 갈등': ['갈등', '고민', '혼란', '딜레마'],
      '관계 변화': ['변화', '달라진', '바뀐', '발전'],
      '도전 직면': ['도전', '시련', '어려움', '위기'],
      '성장 증거': ['성장', '발전', '깨달음', '변화'],
      '변화된 행동': ['달라진', '바뀐', '새로운', '다른'],
      '새로운 이해': ['이해', '깨달음', '알게 된', '느낀']
    };
    
    const keywords = requirementKeywords[requirement] || [];
    return this.countKeywords(content, keywords) > 0;
  }

  checkRedFlag(content, redFlag) {
    const redFlagKeywords = {
      '완벽한 캐릭터': ['완벽한', '흠 없는', '문제없는'],
      '갈등 없는 상태': ['평화로운', '편안한', '문제없는'],
      '정체된 상태': ['그대로', '변함없이', '여전히'],
      '변화 없음': ['변화 없이', '그대로', '똑같이'],
      '급작스런 변화': ['갑자기', '순식간에', '즉시'],
      '설득력 없는 성장': ['이유 없이', '별다른 이유 없이', '저절로']
    };
    
    const keywords = redFlagKeywords[redFlag] || [];
    return this.countKeywords(content, keywords) > 0;
  }

  getImprovementSuggestion(metric) {
    const suggestions = {
      internalConflict: '캐릭터의 내적 갈등과 고민을 더 구체적으로 묘사하세요',
      growthArc: '캐릭터의 성장과 변화 과정을 보여주는 장면을 추가하세요',
      hiddenMotives: '캐릭터의 숨겨진 의도나 비밀을 암시하세요',
      emotionalComplexity: '복잡하고 모순된 감정을 표현하세요',
      relationshipDynamics: '캐릭터 간의 복잡한 관계 역학을 발전시키세요'
    };
    return suggestions[metric] || '캐릭터를 더 복잡하고 입체적으로 만드세요';
  }
}

export default CharacterComplexityValidator;