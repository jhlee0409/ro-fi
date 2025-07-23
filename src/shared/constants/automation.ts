/**
 * 자동화 시스템 상수 정의
 */

export const AUTOMATION_CONFIG = {
  // 자동화 실행 설정
  MAX_ACTIVE_NOVELS: 3,
  MIN_CHAPTER_GAP_HOURS: 1,
  QUALITY_THRESHOLD: 80,
  AUTO_COMPLETE_ENABLED: true,
  AUTO_CREATE_NEW_ENABLED: true,
  
  // 소설 완결 기준
  COMPLETION_THRESHOLDS: {
    PROGRESS_PERCENTAGE: 90,
    PLOT_READINESS: 85,
    CHARACTER_DEVELOPMENT: 80,
    RELATIONSHIP_PROGRESS: 85,
    WORLD_BUILDING: 75,
  },
  
  // 챕터 생성 설정
  CHAPTER_GENERATION: {
    MIN_WORD_COUNT: 800,
    MAX_WORD_COUNT: 2000,
    TARGET_WORD_COUNT: 1500,
    MAX_RETRIES: 3,
  },
  
  // 다양성 보장 설정
  DIVERSITY_SETTINGS: {
    MIN_DIVERSITY_SCORE: 70,
    TROPE_COOLDOWN_CHAPTERS: 10,
    WORLD_COOLDOWN_CHAPTERS: 15,
    GENRE_COOLDOWN_CHAPTERS: 20,
  },
} as const;

export const EMOTION_STAGES = [
  '첫 만남',
  '적대적 긴장', 
  '호감의 시작',
  '감정의 혼란',
  '갈등과 오해',
  '진실의 순간',
  '감정의 폭발',
  '화해와 이해',
  '사랑의 확신',
  '운명적 결합',
] as const;

export const DEFAULT_NOVEL_SETTINGS = {
  TOTAL_CHAPTERS: 75,
  RATING: 0,
  AUTHOR: 'Claude Sonnet AI',
} as const;