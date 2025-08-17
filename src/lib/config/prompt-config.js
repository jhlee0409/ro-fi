/**
 * 📝 통합 프롬프트 설정 모듈
 * 모든 AI 생성 스크립트에서 사용하는 공통 프롬프트 설정
 */

/**
 * 🎭 통합 작가 페르소나
 */
export const UNIFIED_PERSONA = {
  base: "당신은 한국 최고의 로맨스 판타지 작가입니다.",
  enhanced: "AI 기술로 강화된 창의성과 깊이 있는 감성을 가지고 있으며, 수백만 독자들이 열광하는 작품을 창작합니다.",
  platform: "한국의 주요 웹소설 플랫폼에서 베스트셀러 작가로 활동 중입니다."
};

/**
 * 📋 통합 출력 형식
 */
export const OUTPUT_FORMAT = {
  // 메타데이터 섹션
  metadata: "=== METADATA ===",
  
  // 챕터 섹션
  chapter: (num) => `=== CHAPTER ${num} ===`,
  completionChapter: (num) => `=== COMPLETION CHAPTER ${num} ===`,
  
  // 제목 형식 (일관성 보장)
  chapterTitle: (num) => `CHAPTER_TITLE: ${num}화: [제목]`,
  titleFormat: (num, title) => `${num}화: ${title}`,
  
  // 기타 필드
  wordCount: "WORD_COUNT: [정확한 글자 수]",
  isFinal: "IS_FINAL: [true/false]",
  slug: "SLUG: [영문-소문자-하이픈]",
  summary: "SUMMARY: [200자 이상 줄거리]",
  tropes: "TROPES: [트로프 목록]"
};

/**
 * 🎯 품질 기준 설정
 */
export const QUALITY_STANDARDS = {
  // 품질 임계값
  thresholds: {
    minimum: 7.0,      // 최소 품질
    good: 7.5,         // 양호
    excellent: 8.5,    // 우수
    perfect: 9.5,      // 완벽
    critical: 5.0      // 임계점
  },
  
  // 엔진별 가중치
  weights: {
    plot: 0.30,        // 플롯 진행
    character: 0.25,   // 캐릭터 발전
    literary: 0.25,    // 문체 품질
    romance: 0.20      // 로맨스 케미스트리
  },
  
  // 개선 시도 횟수
  maxImprovementAttempts: 3,
  
  // 타겟 독자층
  targetAudience: "20-30대 한국 여성 로맨스 판타지 마니아"
};

/**
 * 📝 공통 집필 가이드라인
 */
export const WRITING_GUIDELINES = {
  // 스토리텔링 원칙
  storytelling: [
    "첫 문장부터 강력한 임팩트 - 독자가 스크롤을 멈추게 하는 오프닝",
    "주인공의 매력 어필 - 독자가 감정이입할 수 있는 캐릭터",
    "남주의 신비로운 등장 - 호기심과 설렘을 동시에 자극",
    "세계관의 자연스러운 소개 - 정보 덤핑 없이 몰입감 있게",
    "갈등과 긴장감 조성 - 다음 화가 궁금해지는 구조"
  ],
  
  // 문체 및 표현
  style: [
    "감정 몰입형 3인칭 시점 사용",
    "생생한 묘사와 섬세한 심리 표현",
    "독자가 상황을 그림으로 그릴 수 있을 정도의 구체적 묘사",
    "로맨스 판타지 특유의 달콤하고 몽환적인 분위기",
    "적절한 긴장감과 설렘 포인트 배치"
  ],
  
  // 2025년 트렌드
  trends2025: [
    "독립적이고 주체적인 여주인공",
    "과도한 갑질 없는 매력적인 남주",
    "건강한 관계 dynamics",
    "현대적 감수성이 담긴 대화와 상황",
    "다양성과 포용성을 반영한 캐릭터 설정"
  ]
};

/**
 * 📚 장르별 특성
 */
export const GENRE_CHARACTERISTICS = {
  romanceFantasy: {
    essentialElements: [
      "운명적 만남",
      "감정선의 점진적 발전",
      "판타지 세계관",
      "매력적인 남녀 주인공",
      "해피엔딩 지향"
    ],
    
    avoidElements: [
      "과도한 폭력",
      "불필요한 갈등",
      "비현실적인 감정 전개",
      "클리셰 남용",
      "독자를 불편하게 하는 전개"
    ]
  }
};

/**
 * 🔧 챕터별 설정
 */
export const CHAPTER_CONFIG = {
  // 분량 설정
  wordCount: {
    firstChapter: { min: 5000, max: 6000 },
    regularChapter: { min: 4000, max: 5000 },
    finalChapter: { min: 4500, max: 5500 }
  },
  
  // 구성 요소
  structure: {
    opening: "흥미로운 도입부",
    development: "갈등과 전개",
    climax: "긴장감 최고조",
    resolution: "적절한 마무리",
    cliffhanger: "다음 화 기대감"
  }
};

/**
 * 🎨 창의성 레벨 설정
 */
export const CREATIVITY_LEVELS = {
  low: {
    temperature: 0.7,
    description: "안정적이고 예측 가능한 전개"
  },
  medium: {
    temperature: 0.85,
    description: "균형 잡힌 창의성과 일관성"
  },
  high: {
    temperature: 1.0,
    description: "대담하고 창의적인 전개"
  }
};

/**
 * 📊 평가 메트릭
 */
export const EVALUATION_METRICS = {
  // 독자 몰입도
  readerEngagement: {
    dialogueRatio: 0.3,    // 대화 비율
    actionRatio: 0.4,      // 액션 비율
    descriptionRatio: 0.3  // 묘사 비율
  },
  
  // 감정 깊이
  emotionalDepth: {
    variety: ["사랑", "기쁨", "슬픔", "분노", "놀라움", "두려움", "희망"],
    minEmotions: 3
  }
};

/**
 * 🚀 프롬프트 생성 헬퍼
 */
export function createBasePrompt(_type = 'default') {
  const persona = `${UNIFIED_PERSONA.base} ${UNIFIED_PERSONA.enhanced} ${UNIFIED_PERSONA.platform}`;
  
  return {
    persona,
    guidelines: WRITING_GUIDELINES,
    standards: QUALITY_STANDARDS,
    format: OUTPUT_FORMAT
  };
}

/**
 * 📝 챕터 제목 포맷터
 */
export function formatChapterTitle(chapterNumber, title) {
  return OUTPUT_FORMAT.titleFormat(chapterNumber, title);
}

/**
 * 🎯 품질 체크 헬퍼
 */
export function checkQuality(score) {
  const { thresholds } = QUALITY_STANDARDS;
  
  if (score >= thresholds.perfect) return 'perfect';
  if (score >= thresholds.excellent) return 'excellent';
  if (score >= thresholds.good) return 'good';
  if (score >= thresholds.minimum) return 'acceptable';
  if (score >= thresholds.critical) return 'needs_improvement';
  return 'unacceptable';
}

export default {
  UNIFIED_PERSONA,
  OUTPUT_FORMAT,
  QUALITY_STANDARDS,
  WRITING_GUIDELINES,
  GENRE_CHARACTERISTICS,
  CHAPTER_CONFIG,
  CREATIVITY_LEVELS,
  EVALUATION_METRICS,
  createBasePrompt,
  formatChapterTitle,
  checkQuality
};