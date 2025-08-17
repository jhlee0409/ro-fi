/**
 * 📝 통합 프롬프트 템플릿 모듈
 * 모든 AI 생성 스크립트에서 사용하는 재사용 가능한 프롬프트 템플릿
 */

import { 
  UNIFIED_PERSONA, 
  OUTPUT_FORMAT, 
  QUALITY_STANDARDS,
  WRITING_GUIDELINES,
  GENRE_CHARACTERISTICS,
  CHAPTER_CONFIG,
  CREATIVITY_LEVELS
} from './prompt-config.js';

/**
 * 🎭 기본 페르소나 템플릿
 */
export const PERSONA_TEMPLATE = () => `
${UNIFIED_PERSONA.base}
${UNIFIED_PERSONA.enhanced}
${UNIFIED_PERSONA.platform}

당신의 목표는 ${QUALITY_STANDARDS.targetAudience}를 위한 
최고 품질의 로맨스 판타지 콘텐츠를 창작하는 것입니다.
`.trim();

/**
 * 📖 챕터 생성 템플릿
 */
export const CHAPTER_GENERATION_TEMPLATE = (chapterNumber, requirements = {}) => `
${PERSONA_TEMPLATE()}

**작품 정보:**
- 장르: 로맨스 판타지
- 챕터: ${chapterNumber}화
- 분량: ${requirements.wordCount || `${CHAPTER_CONFIG.wordCount.regularChapter.min}-${CHAPTER_CONFIG.wordCount.regularChapter.max}자`}

**집필 가이드라인:**
${WRITING_GUIDELINES.storytelling.map(guide => `- ${guide}`).join('\n')}

**문체 원칙:**
${WRITING_GUIDELINES.style.map(style => `- ${style}`).join('\n')}

**2025년 트렌드:**
${WRITING_GUIDELINES.trends2025.map(trend => `- ${trend}`).join('\n')}

**출력 형식:**
${OUTPUT_FORMAT.chapterTitle(chapterNumber)}
${OUTPUT_FORMAT.wordCount}

**챕터 내용:**
[여기에 챕터 내용 작성]
`.trim();

/**
 * 🔗 연속성 보장 템플릿
 */
export const CONTINUITY_TEMPLATE = (previousSituation, currentRequirements) => `
${PERSONA_TEMPLATE()}

**CRITICAL: 이전 챕터 마지막 상황 (절대 변경 금지)**

위치: ${previousSituation.location}
시간: ${previousSituation.time}
등장인물: ${previousSituation.charactersPresent?.join(', ') || '정보 없음'}
진행 중인 갈등: ${previousSituation.activeConflicts?.join(', ') || '없음'}
클리프행어: ${previousSituation.cliffhangers?.join(', ') || '없음'}

**생성 규칙:**
1. 위 상황을 정확히 이어받아 시작
2. 캐릭터 상태 변경 시 명확한 이유 제시
3. 클리프행어를 자연스럽게 해결
4. 새로운 긴장감 조성

${currentRequirements.additionalRequirements || ''}

**출력 형식:**
${OUTPUT_FORMAT.chapterTitle(currentRequirements.chapterNumber)}
${OUTPUT_FORMAT.wordCount}
`.trim();

/**
 * 🏆 품질 개선 템플릿
 */
export const QUALITY_IMPROVEMENT_TEMPLATE = (content, qualityIssues) => `
${PERSONA_TEMPLATE()}

**현재 콘텐츠 품질 문제:**
${qualityIssues.map(issue => `- ${issue.engine}: ${issue.issue} (점수: ${issue.score}/10)`).join('\n')}

**개선 목표:**
- 최소 품질 점수: ${QUALITY_STANDARDS.thresholds.minimum}/10
- 목표 품질 점수: ${QUALITY_STANDARDS.thresholds.good}/10

**개선 전략:**
${qualityIssues.map(issue => {
  switch(issue.engine) {
    case 'plot':
      return '- 플롯: 새로운 갈등 도입, 진전 요소 추가';
    case 'character':
      return '- 캐릭터: 능동성 강화, 대화 다양화';
    case 'literary':
      return '- 문체: 어휘 다양성, 감정 묘사 강화';
    case 'romance':
      return '- 로맨스: 긴장감 조성, 케미스트리 강화';
    default:
      return '';
  }
}).filter(Boolean).join('\n')}

**원본 콘텐츠:**
${content}

**개선된 콘텐츠를 작성하세요.**
`.trim();

/**
 * 🎯 소설 메타데이터 생성 템플릿
 */
export const NOVEL_METADATA_TEMPLATE = (requirements) => `
${PERSONA_TEMPLATE()}

**소설 생성 요구사항:**
- 트로프: ${requirements.tropes?.join(', ') || '자유 선택'}
- 대상 독자: ${QUALITY_STANDARDS.targetAudience}
- 분위기: ${requirements.mood || '달콤하고 설레는'}

${OUTPUT_FORMAT.metadata}
${OUTPUT_FORMAT.slug}
${OUTPUT_FORMAT.summary}
${OUTPUT_FORMAT.tropes}

**제목과 설정을 창작하세요.**
`.trim();

/**
 * 🔍 스토리 상태 분석 템플릿
 */
export const STORY_STATE_ANALYSIS_TEMPLATE = (chapterContent) => `
전문 스토리 분석가로서 다음 챕터를 분석하세요.

**챕터 내용:**
${chapterContent}

**분석 항목:**
LOCATION: [마지막 장면의 위치]
TIME: [시간대/시점]
CHARACTERS_PRESENT: [현재 장면에 있는 캐릭터들]
CHARACTER_STATES: [각 캐릭터의 현재 상태]
ACTIVE_CONFLICTS: [진행 중인 갈등들]
CLIFFHANGERS: [다음 화로 이어지는 긴장감]
PENDING_EVENTS: [예고된 사건들]
MYSTERIES: [미해결 의문점들]

정확하고 구체적으로 분석하세요.
`.trim();

/**
 * 🎨 창의성 레벨별 템플릿
 */
export const CREATIVITY_LEVEL_TEMPLATE = (level = 'medium') => {
  const config = CREATIVITY_LEVELS[level];
  return `
**창의성 설정:**
- 레벨: ${level}
- Temperature: ${config.temperature}
- 특징: ${config.description}

${level === 'high' ? '대담하고 예상치 못한 전개를 시도하세요.' : ''}
${level === 'low' ? '안정적이고 논리적인 전개를 유지하세요.' : ''}
${level === 'medium' ? '창의성과 일관성의 균형을 맞추세요.' : ''}
`.trim();
};

/**
 * 📊 품질 검증 템플릿
 */
export const QUALITY_VALIDATION_TEMPLATE = (content, standards) => `
다음 콘텐츠의 품질을 평가하세요.

**평가 기준:**
- 플롯 진행 (${standards.weights.plot * 100}%)
- 캐릭터 발전 (${standards.weights.character * 100}%)
- 문체 품질 (${standards.weights.literary * 100}%)
- 로맨스 케미스트리 (${standards.weights.romance * 100}%)

**콘텐츠:**
${content.substring(0, 1000)}...

**평가 척도:**
- 최소 기준: ${standards.thresholds.minimum}/10
- 우수 기준: ${standards.thresholds.excellent}/10

각 항목별 점수와 종합 점수를 제시하세요.
`.trim();

/**
 * 🔄 챕터 제목 정규화 템플릿
 */
export const CHAPTER_TITLE_NORMALIZATION_TEMPLATE = (chapterNumber, rawTitle) => {
  // 이미 올바른 형식인지 확인
  const pattern = new RegExp(`^${chapterNumber}화:`);
  if (pattern.test(rawTitle)) {
    return rawTitle;
  }
  
  // 숫자와 "화" 제거하고 제목만 추출
  const cleanTitle = rawTitle
    .replace(/^\d+화?[:：\s]*/, '')
    .replace(/^제?\d+화?[:：\s]*/, '')
    .replace(/^Chapter\s*\d+[:：\s]*/i, '')
    .trim();
  
  // 정규화된 형식으로 반환
  return OUTPUT_FORMAT.titleFormat(chapterNumber, cleanTitle);
};

/**
 * 🚀 프롬프트 빌더 헬퍼
 */
export class PromptBuilder {
  constructor() {
    this.sections = [];
  }
  
  addPersona() {
    this.sections.push(PERSONA_TEMPLATE());
    return this;
  }
  
  addGuidelines() {
    this.sections.push(`
**집필 가이드라인:**
${WRITING_GUIDELINES.storytelling.map(g => `- ${g}`).join('\n')}
    `.trim());
    return this;
  }
  
  addQualityStandards() {
    this.sections.push(`
**품질 기준:**
- 최소: ${QUALITY_STANDARDS.thresholds.minimum}/10
- 목표: ${QUALITY_STANDARDS.thresholds.good}/10
    `.trim());
    return this;
  }
  
  addOutputFormat(chapterNumber) {
    this.sections.push(`
**출력 형식:**
${OUTPUT_FORMAT.chapterTitle(chapterNumber)}
${OUTPUT_FORMAT.wordCount}
    `.trim());
    return this;
  }
  
  addCustomSection(section) {
    this.sections.push(section);
    return this;
  }
  
  build() {
    return this.sections.join('\n\n');
  }
}

/**
 * 📝 프롬프트 유틸리티
 */
export const PromptUtils = {
  // 제목 형식 통일
  normalizeTitle: (chapterNumber, title) => {
    return CHAPTER_TITLE_NORMALIZATION_TEMPLATE(chapterNumber, title);
  },
  
  // 품질 점수 계산
  calculateQualityScore: (scores) => {
    const weights = QUALITY_STANDARDS.weights;
    return (
      scores.plot * weights.plot +
      scores.character * weights.character +
      scores.literary * weights.literary +
      scores.romance * weights.romance
    );
  },
  
  // 창의성 레벨 선택
  selectCreativityLevel: (context) => {
    if (context.isClimax) return 'high';
    if (context.isTransition) return 'low';
    return 'medium';
  },
  
  // 장르 특성 체크
  validateGenreCharacteristics: (content) => {
    const essential = GENRE_CHARACTERISTICS.romanceFantasy.essentialElements;
    const avoid = GENRE_CHARACTERISTICS.romanceFantasy.avoidElements;
    
    return {
      hasEssentials: essential.map(element => ({
        element,
        present: content.includes(element)
      })),
      avoidsProblematic: avoid.map(element => ({
        element,
        avoided: !content.includes(element)
      }))
    };
  }
};

export default {
  PERSONA_TEMPLATE,
  CHAPTER_GENERATION_TEMPLATE,
  CONTINUITY_TEMPLATE,
  QUALITY_IMPROVEMENT_TEMPLATE,
  NOVEL_METADATA_TEMPLATE,
  STORY_STATE_ANALYSIS_TEMPLATE,
  CREATIVITY_LEVEL_TEMPLATE,
  QUALITY_VALIDATION_TEMPLATE,
  CHAPTER_TITLE_NORMALIZATION_TEMPLATE,
  PromptBuilder,
  PromptUtils
};