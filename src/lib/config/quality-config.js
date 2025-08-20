/**
 * 🎯 통합 품질 설정 모듈
 * 모든 품질 엔진에서 사용하는 통일된 품질 기준과 설정
 */

/**
 * 📊 품질 임계값 설정
 */
export const QUALITY_THRESHOLDS = {
  minimum: 7.0,      // 최소 품질 (통과 기준)
  good: 7.5,         // 양호
  excellent: 8.5,    // 우수
  perfect: 9.5,      // 완벽
  critical: 5.0      // 임계점 (심각한 문제)
};

/**
 * ⚖️ 엔진별 가중치
 */
export const ENGINE_WEIGHTS = {
  plot: 0.30,        // 플롯 진행 30%
  character: 0.25,   // 캐릭터 발전 25%
  literary: 0.25,    // 문체 품질 25%
  romance: 0.20      // 로맨스 케미스트리 20%
};

/**
 * 🔧 개선 전략 설정
 */
export const IMPROVEMENT_STRATEGIES = {
  plot: {
    priority: 1,    // 최우선
    maxAttempts: 3,
    methods: ['enforceProgression', 'injectDramaticEvent', 'escalateConflict'],
    thresholds: {
      progression: 0.7,    // 플롯 진전 최소 비율
      conflict: 0.6,       // 갈등 강도 최소값
      repetition: 0.3      // 반복 허용 최대치
    }
  },
  character: {
    priority: 2,
    maxAttempts: 3,
    methods: ['enforceCharacterAgency', 'diversifyDialogue', 'developPersonality'],
    thresholds: {
      agency: 0.6,         // 능동성 최소 비율
      speechVariety: 0.7,  // 대화 다양성
      personality: 0.8,    // 개성 표현
      growth: 0.5         // 성장 지표
    }
  },
  literary: {
    priority: 3,
    maxAttempts: 2,
    methods: ['enhanceVocabularyDiversity', 'enhanceEmotionalDescription', 'improveRhythm'],
    thresholds: {
      vocabulary: 0.75,    // 어휘 다양성
      sensoryRichness: 0.6, // 감각적 묘사
      metaphorUsage: 0.4,  // 은유 사용
      rhythmVariation: 0.7 // 리듬 변화
    }
  },
  romance: {
    priority: 4,
    maxAttempts: 2,
    methods: ['generateRomanticTension', 'enhanceDialogueChemistry', 'deepenEmotionalConnection'],
    thresholds: {
      chemistry: 0.7,      // 케미스트리 강도
      progression: 0.6,    // 관계 진전
      emotionalDepth: 0.8, // 감정적 깊이
      tension: 0.65       // 로맨틱 텐션
    }
  }
};

/**
 * 📈 평가 메트릭
 */
export const EVALUATION_METRICS = {
  // 텍스트 구성 비율
  textComposition: {
    dialogueRatio: { min: 0.25, max: 0.45, optimal: 0.35 },
    actionRatio: { min: 0.30, max: 0.50, optimal: 0.40 },
    descriptionRatio: { min: 0.20, max: 0.40, optimal: 0.25 }
  },
  
  // 감정적 깊이
  emotionalDepth: {
    requiredEmotions: ['사랑', '기쁨', '놀라움', '두려움', '희망'],
    minEmotionVariety: 3,
    emotionalIntensity: { min: 0.6, max: 1.0 }
  },
  
  // 어휘 다양성
  vocabularyDiversity: {
    uniqueWordRatio: { min: 0.65, optimal: 0.75 },
    complexWordUsage: { min: 0.15, max: 0.35 },
    repetitionThreshold: 0.05
  },
  
  // 로맨스 요소
  romanceElements: {
    romanticMoments: { min: 1, optimal: 3 },
    tensionBuilding: { min: 0.6, optimal: 0.8 },
    chemistryIndicators: ['시선 교환', '우연한 접촉', '대화의 여운', '내적 동요']
  }
};

/**
 * 🚨 품질 문제 심각도 분류
 */
export const SEVERITY_LEVELS = {
  CRITICAL: {
    score: 0,
    threshold: 5.0,
    action: 'immediate_fix',
    description: '심각한 품질 문제 - 즉시 수정 필요'
  },
  HIGH: {
    score: 1,
    threshold: 7.0,
    action: 'priority_improvement',
    description: '높은 우선순위 개선 필요'
  },
  MEDIUM: {
    score: 2,
    threshold: 8.0,
    action: 'suggested_improvement',
    description: '개선 권장'
  },
  LOW: {
    score: 3,
    threshold: 8.5,
    action: 'optional_enhancement',
    description: '선택적 향상'
  },
  NONE: {
    score: 4,
    threshold: 10.0,
    action: 'maintain_quality',
    description: '품질 문제 없음'
  }
};

/**
 * 🎭 장르별 품질 기준
 */
export const GENRE_QUALITY_STANDARDS = {
  romanceFantasy: {
    essentialElements: {
      romanticTension: { weight: 0.25, minScore: 7.0 },
      fantasyWorldBuilding: { weight: 0.20, minScore: 6.5 },
      characterChemistry: { weight: 0.25, minScore: 7.5 },
      emotionalEngagement: { weight: 0.30, minScore: 8.0 }
    },
    
    qualityIndicators: {
      // 필수 포함 요소
      mustHave: [
        '감정적 몰입',
        '캐릭터 간 케미스트리',
        '판타지 요소',
        '로맨틱 텐션'
      ],
      
      // 피해야 할 요소
      mustAvoid: [
        '과도한 폭력',
        '불쾌한 내용',
        '논리적 오류',
        '캐릭터 붕괴'
      ]
    }
  }
};

/**
 * 📊 품질 등급 시스템
 */
export const QUALITY_GRADES = {
  PERFECT: {
    range: [9.5, 10.0],
    description: '완벽한 품질',
    color: '#4CAF50',
    emoji: '🏆'
  },
  EXCELLENT: {
    range: [8.5, 9.4],
    description: '우수한 품질',
    color: '#8BC34A',
    emoji: '⭐'
  },
  GOOD: {
    range: [7.0, 8.4],
    description: '양호한 품질',
    color: '#FFC107',
    emoji: '👍'
  },
  POOR: {
    range: [5.0, 6.9],
    description: '부족한 품질',
    color: '#FF9800',
    emoji: '⚠️'
  },
  CRITICAL: {
    range: [0.0, 4.9],
    description: '심각한 문제',
    color: '#F44336',
    emoji: '🚨'
  }
};

/**
 * 🔄 개선 시도 설정
 */
export const IMPROVEMENT_CONFIG = {
  maxAttempts: 3,          // 최대 개선 시도 횟수
  minImprovement: 0.3,     // 최소 개선 폭
  timeoutMs: 30000,        // 개선 시도 타임아웃
  
  // 개선 전략별 우선순위
  strategyPriority: [
    'plot_progression',
    'character_agency', 
    'emotional_depth',
    'romantic_tension',
    'vocabulary_diversity'
  ],
  
  // 개선 성공 기준
  successCriteria: {
    scoreImprovement: 0.5,   // 점수 향상 최소값
    thresholdPass: true,     // 임계값 통과 필수
    noRegression: true       // 다른 항목 점수 하락 방지
  }
};

/**
 * 📈 품질 트렌드 분석 설정
 */
export const TREND_ANALYSIS = {
  historySize: 10,         // 품질 히스토리 보관 개수
  trendThreshold: 0.5,     // 트렌드 판정 임계값
  
  trendTypes: {
    IMPROVING: { threshold: 0.5, description: '품질 향상 중' },
    STABLE: { threshold: 0.5, description: '품질 안정' },
    DECLINING: { threshold: -0.5, description: '품질 하락' },
    INSUFFICIENT_DATA: { threshold: null, description: '데이터 부족' }
  }
};

/**
 * 🎯 품질 헬퍼 함수들
 */
export const QualityHelpers = {
  // 점수를 등급으로 변환
  scoreToGrade: (score) => {
    for (const [grade, config] of Object.entries(QUALITY_GRADES)) {
      if (score >= config.range[0] && score <= config.range[1]) {
        return grade;
      }
    }
    return 'UNKNOWN';
  },
  
  // 심각도 결정
  determineSeverity: (score) => {
    for (const [level, config] of Object.entries(SEVERITY_LEVELS)) {
      if (score >= config.threshold) {
        return level;
      }
    }
    return 'CRITICAL';
  },
  
  // 가중 평균 계산
  calculateWeightedScore: (scores) => {
    const plotScore = scores.plotScore || scores.plot || 0;
    const characterScore = scores.characterScore || scores.character || 0;
    const literaryScore = scores.literaryScore || scores.literary || 0;
    const romanceScore = scores.romanceScore || scores.romance || 0;
    
    return parseFloat((
      plotScore * ENGINE_WEIGHTS.plot +
      characterScore * ENGINE_WEIGHTS.character +
      literaryScore * ENGINE_WEIGHTS.literary +
      romanceScore * ENGINE_WEIGHTS.romance
    ).toFixed(1));
  },
  
  // 임계값 통과 여부 확인
  passesThreshold: (score) => {
    return score >= QUALITY_THRESHOLDS.minimum;
  },
  
  // 개선 필요 여부 확인
  needsImprovement: (score) => {
    return score < QUALITY_THRESHOLDS.good;
  },
  
  // 품질 리포트 생성
  generateQualityReport: (scores, analysis) => {
    const overallScore = QualityHelpers.calculateWeightedScore(scores);
    const grade = QualityHelpers.scoreToGrade(overallScore);
    const severity = QualityHelpers.determineSeverity(overallScore);
    
    return {
      overallScore: parseFloat(overallScore.toFixed(1)),
      grade,
      severity,
      passThreshold: QualityHelpers.passesThreshold(overallScore),
      needsImprovement: QualityHelpers.needsImprovement(overallScore),
      scores,
      analysis,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * 🔧 설정 검증 함수
 */
export const validateConfig = () => {
  // 가중치 합이 1.0인지 확인
  const weightSum = Object.values(ENGINE_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  if (Math.abs(weightSum - 1.0) > 0.001) {
    throw new Error(`ENGINE_WEIGHTS 합이 1.0이 아닙니다: ${weightSum}`);
  }
  
  // 임계값이 올바른 순서인지 확인
  const thresholds = QUALITY_THRESHOLDS;
  if (thresholds.critical >= thresholds.minimum ||
      thresholds.minimum >= thresholds.good ||
      thresholds.good >= thresholds.excellent ||
      thresholds.excellent >= thresholds.perfect) {
    throw new Error('QUALITY_THRESHOLDS 순서가 올바르지 않습니다');
  }
  
  return true;
};

// 초기화 시 설정 검증
try {
  validateConfig();
} catch (error) {
  console.error('품질 설정 검증 실패:', error.message);
  throw error;
}

export default {
  QUALITY_THRESHOLDS,
  ENGINE_WEIGHTS,
  IMPROVEMENT_STRATEGIES,
  EVALUATION_METRICS,
  SEVERITY_LEVELS,
  GENRE_QUALITY_STANDARDS,
  QUALITY_GRADES,
  IMPROVEMENT_CONFIG,
  TREND_ANALYSIS,
  QualityHelpers,
  validateConfig
};