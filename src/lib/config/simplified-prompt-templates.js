/**
 * 📝 단순화된 프롬프트 템플릿 v1.0
 * 한국 로맨스 판타지 장르에 최적화된 명확하고 간결한 템플릿
 * 
 * 핵심 원칙:
 * - 10개 이하의 핵심 지시사항
 * - 측정 가능한 구체적 목표
 * - 장르 특화 용어 사용
 * - 과도한 기술 용어 제거
 */

/**
 * 🎭 기본 페르소나 - 한국 로맨스 판타지 작가
 */
export const SIMPLE_PERSONA = `
당신은 한국 로맨스 판타지 웹소설 전문 작가입니다.

핵심 역량:
- 감정적 몰입도가 높은 로맨스 스토리
- 매력적인 캐릭터 관계 구축
- 자연스러운 한국어 대화체
- 독자가 공감할 수 있는 감정 묘사
`.trim();

/**
 * 📖 챕터 생성 템플릿
 */
export const CHAPTER_TEMPLATE = (chapterNumber, previousSummary = '') => `
${SIMPLE_PERSONA}

== 작성 지침 ==

이전 내용 요약:
${previousSummary || '첫 챕터입니다.'}

${chapterNumber}화를 작성해주세요.

필수 요소:
1. 분량: 3,000-4,000자
2. 시작: 독자의 호기심을 자극하는 첫 문장
3. 캐릭터: 주인공과 상대역의 감정 변화 포함
4. 전개: 자연스러운 사건 진행
5. 마무리: 다음 화를 기대하게 만드는 결말

작성 스타일:
- 독자가 상상하기 쉬운 구체적 묘사
- 캐릭터의 감정이 드러나는 대화
- 과도한 설명 없이 행동으로 보여주기
- 자연스러운 한국어 문체

장르 특징:
- 로맨스: 두 주인공 간의 감정선 발전
- 판타지: 마법이나 특별한 능력의 자연스러운 활용
- 갈등: 인물 간 긴장감 있는 관계

출력 형식:
=== CHAPTER ${chapterNumber} ===
CHAPTER_TITLE: ${chapterNumber}화: [제목]
WORD_COUNT: [글자수]

[챕터 내용]

이제 ${chapterNumber}화를 작성해주세요.
`.trim();

/**
 * 🔗 연속성 템플릿
 */
export const CONTINUITY_TEMPLATE = (previousState, chapterNumber) => `
${SIMPLE_PERSONA}

== 연속성 지침 ==

이전 챕터 상황:
- 장소: ${previousState.location || '미정'}
- 시간: ${previousState.time || '미정'}
- 등장인물: ${previousState.characters?.join(', ') || '미정'}
- 진행 중인 사건: ${previousState.events || '없음'}

${chapterNumber}화 작성 규칙:
1. 위 상황에서 자연스럽게 이어지기
2. 캐릭터 성격 일관성 유지
3. 시간과 공간의 논리적 연결
4. 이전 갈등의 자연스러운 해결 또는 발전

출력 형식:
=== CHAPTER ${chapterNumber} ===
CHAPTER_TITLE: ${chapterNumber}화: [제목]
WORD_COUNT: [글자수]

[챕터 내용]

${chapterNumber}화를 작성해주세요.
`.trim();

/**
 * 🏆 품질 개선 템플릿
 */
export const IMPROVEMENT_TEMPLATE = (content, issues) => `
${SIMPLE_PERSONA}

== 개선 요청 ==

원본 내용의 문제점:
${issues.map(issue => `- ${issue}`).join('\n')}

개선 방향:
1. 더 생생한 감정 묘사 추가
2. 대화를 통한 캐릭터 개성 강화
3. 불필요한 설명 제거
4. 독자 몰입도 향상

아래 내용을 개선해주세요:

---
${content}
---

개선된 버전을 작성해주세요.
`.trim();

/**
 * 🌟 신규 소설 템플릿
 */
export const NOVEL_CREATION_TEMPLATE = (requirements) => `
${SIMPLE_PERSONA}

== 신규 소설 작성 ==

장르: 한국 로맨스 판타지
트로프: ${requirements.tropes?.join(', ') || '자유 선택'}

작품 구성:
1. 제목: 독자의 관심을 끄는 매력적인 제목
2. 줄거리: 2-3문장의 핵심 스토리
3. 주인공: 공감 가능한 매력적인 여주
4. 상대역: 매력적이면서 신비로운 남주
5. 배경: 판타지 요소가 있는 세계관

1화 작성 요구사항:
- 분량: 3,000-4,000자
- 주인공의 매력적인 등장
- 흥미로운 첫 만남 또는 사건
- 독자가 계속 읽고 싶게 만드는 마무리

출력 형식:
TITLE: [소설 제목]
SLUG: [영문 슬러그]
SUMMARY: [2-3문장 줄거리]
TROPES: [트로프1], [트로프2], [트로프3]

=== CHAPTER 1 ===
CHAPTER_TITLE: 1화: [제목]
WORD_COUNT: [글자수]

[1화 내용]

작품 정보와 1화를 작성해주세요.
`.trim();

/**
 * 🔍 스토리 분석 템플릿
 */
export const ANALYSIS_TEMPLATE = (chapterContent) => `
현재 챕터를 분석하여 다음 정보를 추출해주세요:

분석 대상:
${chapterContent.substring(0, 500)}...

추출 항목:
1. 현재 위치와 시간
2. 등장인물과 관계
3. 진행 중인 주요 사건
4. 감정적 분위기
5. 다음 화로 이어질 요소

간단명료하게 정리해주세요.
`.trim();

/**
 * 🎯 품질 체크 가이드라인
 */
export const QUALITY_GUIDELINES = {
  // 간단한 품질 기준
  minWordCount: 3000,
  maxWordCount: 4000,
  
  // 필수 포함 요소
  requiredElements: [
    '주인공의 감정 변화',
    '스토리 진전',
    '대화를 통한 관계 발전',
    '다음 화 기대감'
  ],
  
  // 피해야 할 요소
  avoidElements: [
    '과도한 설명',
    '어색한 대화',
    '논리적 오류',
    '지나친 클리셰'
  ],
  
  // 장르 특성
  genreFeatures: {
    romance: '감정선의 자연스러운 발전',
    fantasy: '세계관의 일관성',
    korean: '한국 독자 정서에 맞는 표현'
  }
};

/**
 * 💫 프롬프트 빌더 (단순화 버전)
 */
export class SimplePromptBuilder {
  constructor() {
    this.prompt = '';
  }
  
  setPersona() {
    this.prompt = SIMPLE_PERSONA;
    return this;
  }
  
  addChapterRequest(chapterNumber, previousSummary) {
    this.prompt = CHAPTER_TEMPLATE(chapterNumber, previousSummary);
    return this;
  }
  
  addContinuity(previousState, chapterNumber) {
    this.prompt = CONTINUITY_TEMPLATE(previousState, chapterNumber);
    return this;
  }
  
  addImprovement(content, issues) {
    this.prompt = IMPROVEMENT_TEMPLATE(content, issues);
    return this;
  }
  
  addNovelCreation(requirements) {
    this.prompt = NOVEL_CREATION_TEMPLATE(requirements);
    return this;
  }
  
  addAnalysis(chapterContent) {
    this.prompt = ANALYSIS_TEMPLATE(chapterContent);
    return this;
  }
  
  build() {
    return this.prompt;
  }
}

// 기본 내보내기
export default {
  SIMPLE_PERSONA,
  CHAPTER_TEMPLATE,
  CONTINUITY_TEMPLATE,
  IMPROVEMENT_TEMPLATE,
  NOVEL_CREATION_TEMPLATE,
  ANALYSIS_TEMPLATE,
  QUALITY_GUIDELINES,
  SimplePromptBuilder
};