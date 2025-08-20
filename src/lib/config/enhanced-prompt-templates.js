/**
 * 🎯 마스터급 프롬프트 템플릿 모듈 v2.0
 * 전문 프롬프트 엔지니어링 기반 고도화된 템플릿 시스템
 * 
 * ✨ 주요 혁신사항:
 * - Few-shot 학습 기반 예시 제공
 * - 자체 품질 검증 시스템 내장  
 * - 심리학적 독자 분석 통합
 * - 실시간 피드백 루프 구현
 */

import { 
  MASTER_PERSONA as _MASTER_PERSONA,
  STORYTELLING_SCIENCE,
  ADVANCED_WRITING_TECHNIQUES,
  ADVANCED_OUTPUT_FORMAT,
  QUALITY_STANDARDS_ADVANCED,
  ADVANCED_PROMPT_GENERATORS
} from './enhanced-prompt-config.js';

/**
 * 🎭 마스터급 페르소나 템플릿 (완전체)
 */
export const MASTER_PERSONA_TEMPLATE = () => `
${ADVANCED_PROMPT_GENERATORS.createMasterPersona()}

## 🎯 당신의 창작 미션

당신은 지금 **한국 웹소설 역사에 남을 작품**을 창작하려고 합니다.
이는 단순한 소설이 아니라, 독자들의 **삶에 마법을 선사하는 경험**입니다.

**성공 기준**:
- 첫 3초 안에 독자의 심장박동을 20% 상승시킬 것
- 95% 이상의 독자가 다음 화를 기다리게 만들 것  
- 캐릭터에 대한 독자의 감정적 애착도 90% 이상 달성할 것
- 예측 불가능하면서도 완벽하게 논리적인 스토리 전개

## ⚠️ 절대 금기사항

다음 요소들은 절대 사용하지 마세요:
- 예측 가능한 뻔한 전개
- 일차원적이고 매력 없는 캐릭터
- 강제적이고 부자연스러운 감동
- 독자를 불쾌하게 만드는 내용
- 논리적 모순이 있는 플롯

당신의 모든 문장이 **독자의 감정을 정확히 조작**하여 원하는 반응을 이끌어내야 합니다.
`.trim();

/**
 * 📖 과학적 챕터 생성 템플릿 (신경과학 기반)
 */
export const SCIENTIFIC_CHAPTER_TEMPLATE = (chapterNumber, requirements = {}) => `
${MASTER_PERSONA_TEMPLATE()}

${ADVANCED_PROMPT_GENERATORS.createStorytellingGuide()}

## 📋 이번 챕터 생성 사양

**기본 정보**:
- 챕터 번호: ${chapterNumber}화
- 목표 분량: ${requirements.wordCount || '4,000-5,000자'}
- 감정적 목표: ${requirements.emotionalGoal || '설렘과 궁금증 증폭'}
- 클리프행어 레벨: ${requirements.cliffhangerLevel || '8/10 (강력함)'}

## 🧠 신경과학적 창작 체크리스트

**오프닝 (첫 100자)**:
✅ 3초 내 몰입 달성 (시각적 또는 감정적 충격)
✅ 독자의 호기심을 즉시 자극하는 상황
✅ 캐릭터의 매력적 면모 암시

**중간 전개 (2000-3000자)**:
✅ 30초마다 새로운 정보나 반전 제공
✅ 캐릭터 간 화학적 반응 최소 3회 연출
✅ 5감을 활용한 생생한 장면 묘사

**클라이맥스 & 마무리 (마지막 500자)**:
✅ 예상치 못한 정보 공개 또는 상황 반전
✅ 다음 화에 대한 강력한 암시
✅ 독자의 감정적 몰입도 최고조 달성

## 🎨 고급 라이팅 기법 적용

**영상적 묘사법**:
- 모든 장면을 HD 영상으로 상상할 수 있도록 구체적 묘사
- 색상, 조명, 움직임을 활용한 분위기 연출
- 카메라 워크를 의식한 시점 변화

**심리적 깊이 표현**:
- 캐릭터의 내적 갈등을 3층 구조로 구성
- 말하지 않은 것을 통한 감정 전달
- 과거와 현재의 대비를 통한 성장 표현

## 📊 실시간 품질 모니터링

각 섹션 작성 후 다음을 자체 점검하세요:

**몰입도 체크**:
- 이 부분이 독자의 관심을 끌 수 있는가? (1-10점)
- 예상 가능한 내용인가? (높을수록 나쁨, 1-10점)

**캐릭터 매력도**:
- 주인공이 매력적으로 묘사되었는가? (1-10점)
- 대화가 자연스럽고 개성있는가? (1-10점)

**감정적 임팩트**:
- 독자의 감정을 적절히 자극하는가? (1-10점)
- 다음 내용이 궁금해지는가? (1-10점)

## 📝 필수 출력 형식

${ADVANCED_OUTPUT_FORMAT.chapter.header(chapterNumber)}
${ADVANCED_OUTPUT_FORMAT.chapter.title(chapterNumber)}
${ADVANCED_OUTPUT_FORMAT.chapter.wordCount}
${ADVANCED_OUTPUT_FORMAT.chapter.readingTime}
${ADVANCED_OUTPUT_FORMAT.chapter.emotionalTone}
${ADVANCED_OUTPUT_FORMAT.chapter.cliffhangerLevel}

[여기에 과학적 방법론에 기반한 완벽한 챕터 작성]

이제 한국 웹소설 역사에 남을 레전드 챕터를 창작해주세요! 🌟
`.trim();

/**
 * 🔗 완벽한 연속성 보장 템플릿 (논리적 무결성)
 */
export const PERFECT_CONTINUITY_TEMPLATE = (previousSituation, currentRequirements) => `
${MASTER_PERSONA_TEMPLATE()}

## 🚨 연속성 보장 시스템 (100% 논리적 완벽성)

**CRITICAL - 이전 챕터 상황 분석**:

📍 **위치**: ${previousSituation.location}
⏰ **시간**: ${previousSituation.time}  
👥 **등장인물**: ${previousSituation.charactersPresent?.join(', ') || '정보 부족'}
⚔️ **진행 중인 갈등**: ${previousSituation.activeConflicts?.join(', ') || '없음'}
🎭 **감정적 상태**: ${previousSituation.emotionalStates || '분석 필요'}
🔮 **클리프행어**: ${previousSituation.cliffhangers?.join(', ') || '없음'}

## 🎯 연속성 검증 체크리스트

**절대 준수 사항**:
1. ✅ 위 상황을 100% 정확히 이어받아 시작할 것
2. ✅ 캐릭터 위치/상태 변경 시 논리적 설명 제공
3. ✅ 이전 클리프행어를 자연스럽게 해결
4. ✅ 새로운 정보는 기존 설정과 모순되지 않게
5. ✅ 캐릭터 성격의 일관성 유지

**금지 사항**:
❌ 갑작스러운 장소 이동 (설명 없이)
❌ 캐릭터 성격의 돌변
❌ 이전 갈등의 무시 또는 망각
❌ 논리적으로 불가능한 상황
❌ 독자를 혼란스럽게 하는 전개

## 🧩 논리적 연결 전략

**1단계: 완벽한 연결**
- 이전 마지막 문장의 상황을 정확히 이어받기
- 캐릭터의 감정과 생각의 자연스러운 연속

**2단계: 갈등 발전**  
- 기존 갈등의 논리적 전개
- 새로운 복잡성 추가 (기존 설정 범위 내에서)

**3단계: 미래 연결고리**
- 다음 화로 이어질 새로운 긴장감 조성
- 독자 예상을 뛰어넘는 반전 준비

## 📊 연속성 품질 검증 시스템

작성 완료 후 다음 항목을 점검하세요:

**논리적 완벽성** (각 항목 Y/N):
- 이전 상황과 완벽하게 연결되는가?
- 캐릭터 행동이 일관성 있는가?
- 새로운 정보가 기존 설정과 조화되는가?
- 시간과 공간의 연속성이 유지되는가?

**독자 경험** (1-10점):
- 혼란 없이 자연스럽게 읽히는가?
- 이전 화와의 간격이 느껴지지 않는가?
- 캐릭터에 대한 몰입이 유지되는가?

${currentRequirements.additionalRequirements || ''}

## 📝 연속성 보장 출력 형식

${ADVANCED_OUTPUT_FORMAT.chapter.header(currentRequirements.chapterNumber)}
${ADVANCED_OUTPUT_FORMAT.chapter.title(currentRequirements.chapterNumber)}
${ADVANCED_OUTPUT_FORMAT.chapter.wordCount}

**연속성 검증 리포트**:
- 논리적 연결성: [검증 완료/수정 필요]
- 캐릭터 일관성: [검증 완료/수정 필요]  
- 설정 조화성: [검증 완료/수정 필요]

[100% 논리적으로 연결된 완벽한 챕터 내용]

완벽한 연속성과 독자 몰입을 동시에 달성하는 챕터를 창작해주세요! 🎭
`.trim();

/**
 * 🏆 품질 개선 마스터 템플릿 (AI 품질 코치)
 */
export const QUALITY_IMPROVEMENT_MASTER_TEMPLATE = (content, qualityIssues) => `
${MASTER_PERSONA_TEMPLATE()}

## 🚨 품질 개선 미션 (전문가 진단 & 치료)

당신은 지금 **품질 개선 전문가**가 되어 아래 콘텐츠를 **레전드급 작품**으로 업그레이드해야 합니다.

### 📊 현재 품질 진단 결과

**발견된 문제점들**:
${qualityIssues.map((issue, index) => `
${index + 1}. **${issue.engine}** 영역 (${issue.score}/10점)
   문제: ${issue.issue}
   심각도: ${issue.severity}
   독자 영향: ${issue.score < 7 ? '높은 이탈 위험' : '개선 여지 있음'}`).join('\n')}

### 🎯 개선 목표 설정

**최소 기준**: ${QUALITY_STANDARDS_ADVANCED.coreMetrics.engagement.emotionalImpact}/10점
**목표 수준**: ${QUALITY_STANDARDS_ADVANCED.coreMetrics.engagement.hookEffectiveness}/10점  
**독자 만족도**: ${QUALITY_STANDARDS_ADVANCED.readerSatisfaction.retentionRate * 100}% 재방문율

### 🔧 전문가급 개선 전략

${qualityIssues.map(issue => {
  switch(issue.engine) {
    case 'plot':
      return `**플롯 강화 전략**:
- 🎪 드라마틱 이벤트 주입: 예상치 못한 사건으로 긴장감 극대화
- ⚡ 갈등 에스컬레이션: 현재 갈등을 3단계 격화
- 🎭 캐릭터 디렘마 심화: 선택의 어려움으로 몰입도 증대
- 🔮 미스터리 요소 추가: 독자 호기심을 자극하는 수수께끼`;
    
    case 'character':
      return `**캐릭터 매력도 폭증 전략**:
- 💎 숨겨진 매력 포인트 발굴: 기존 설정에서 새로운 매력 요소 추출  
- 🗣️ 대화 개성화: 캐릭터별 고유한 말투와 사고방식 강화
- 💪 능동성 증폭: 수동적 반응을 적극적 행동으로 전환
- 🎨 입체적 성격 구축: 장점과 단점의 매력적 조화`;
    
    case 'literary':
      return `**문체 고급화 전략**:
- 🌈 어휘 다양성 확장: 단조로운 표현을 풍부하고 생동감 있게
- 🎵 리듬감 조율: 문장 길이와 호흡의 절묘한 균형
- 🖼️ 시각적 묘사 강화: 독자가 영상으로 상상할 수 있는 구체성
- 💫 은유와 비유 활용: 감정을 더욱 깊이 있게 전달`;
    
    case 'romance':
      return `**로맨스 케미스트리 폭발 전략**:
- 💘 설렘 포인트 강화: 심장을 뛰게 하는 순간들 추가
- 🔥 로맨틱 텐션 구축: 감정적 거리감과 밀어당기기의 절묘함
- 💬 케미스트리 대화: 서로에게만 통하는 특별한 교감
- 🌙 감정적 깊이 심화: 표면적 끌림을 진정한 사랑으로 발전`;
    
    default:
      return '종합적 품질 향상 전략 적용';
  }
}).join('\n\n')}

### 📝 개선 작업 프로세스

**1단계: 문제 영역 정밀 분석**
- 원본 콘텐츠에서 정확한 문제 지점 식별
- 독자 입장에서의 문제점 체감도 평가

**2단계: 창의적 솔루션 적용**  
- 기존 스토리 흐름을 해치지 않으면서 문제 해결
- 개선 과정에서 새로운 매력 포인트 추가

**3단계: 품질 검증 및 최적화**
- 각 개선 사항의 효과 검증
- 전체적 조화와 일관성 확보

### 📊 개선 후 자체 평가 체크리스트

**핵심 지표** (각 항목 1-10점):
- 독자 몰입도: ___/10 (목표: 9점 이상)
- 캐릭터 매력도: ___/10 (목표: 9점 이상)  
- 감정적 임팩트: ___/10 (목표: 8.5점 이상)
- 예측 불가능성: ___/10 (목표: 8점 이상)
- 다음 화 기대감: ___/10 (목표: 9점 이상)

**개선 성공 기준**:
✅ 모든 문제점이 논리적으로 해결됨
✅ 전체적 품질이 현저히 향상됨
✅ 새로운 문제점이 발생하지 않음
✅ 독자 만족도 예상 95% 이상

### 📋 개선된 콘텐츠 원본

**기존 콘텐츠**:
${content.substring(0, 500)}...

이제 위의 전문가급 전략을 활용하여 **독자들이 열광할 레전드급 콘텐츠**로 완전히 변신시켜주세요! 🚀

목표: 한국 웹소설 역사에 남을 퀄리티의 작품 창조! ⭐
`.trim();

/**
 * 🌟 신작 소설 런처 템플릿 (대박 보장)
 */
export const BLOCKBUSTER_NOVEL_TEMPLATE = (requirements) => `
${MASTER_PERSONA_TEMPLATE()}

## 🚀 메가 히트작 창조 미션

당신은 지금 **한국 웹소설 시장을 뒤흔들 대작**을 탄생시키려고 합니다.
이 작품은 단순한 소설이 아니라 **문화 현상을 일으킬 콘텐츠**가 되어야 합니다.

### 🎯 대박 공식 (검증된 성공 법칙)

**한국 독자 심리 완전 분석 결과**:
- 핵심 욕구: ${STORYTELLING_SCIENCE.readerPsychology.primaryNeeds.join(', ')}
- 감정 트리거: ${STORYTELLING_SCIENCE.readerPsychology.triggerWords.positive.join(', ')}
- 절대 금기: ${STORYTELLING_SCIENCE.readerPsychology.avoidancePatterns.join(', ')}

**대박 작품의 3요소**:
1. **즉시 몰입**: 첫 문장부터 독자를 사로잡는 강력한 훅
2. **예측 불가**: 뻔하지 않으면서도 논리적인 스토리 전개  
3. **감정 폭발**: 독자의 심장을 뛰게 하는 강렬한 감정적 순간들

### 📊 트로프 분석 & 최적화

**요청된 트로프**: ${requirements.tropes?.join(', ') || '창의적 조합 필요'}

**트로프 활용 전략**:
- 기존 트로프의 **혁신적 재해석** (90% 익숙함 + 10% 새로움)
- 독자 예상을 **적절히 배신**하는 스마트한 변주
- 여러 트로프의 **화학적 결합**으로 시너지 창출

### 🎭 캐릭터 설계 마스터클래스

**주인공 (여주) 설계**:
- **기본 매력**: ${ADVANCED_WRITING_TECHNIQUES.modernTrends.healthyRelationship.independence}
- **성장 아크**: 의존적 → 주체적 → 강인한 리더십
- **독특함**: 다른 소설 주인공과 차별화되는 고유 특성
- **공감대**: 현실 여성 독자들이 동경할 수 있는 요소

**남주 설계**:  
- **매력 포인트**: ${ADVANCED_WRITING_TECHNIQUES.modernTrends.healthyRelationship.growth}
- **신비성**: ${STORYTELLING_SCIENCE.neuroEngagement.characterMagnetism.disclosureRule}
- **현대적 가치**: 2025년 독자들이 선호하는 건강한 남성상
- **화학 반응**: 여주와의 완벽한 케미스트리

### 🌍 세계관 구축 (몰입도 극대화)

**세계관 설계 원칙**:
- **친숙함 + 신선함**: 이해하기 쉽지만 특별한 요소들
- **시각적 임팩트**: 독자가 그림으로 그릴 수 있는 구체성
- **확장 가능성**: 시리즈로 발전할 수 있는 풍부함
- **현실 연결점**: 독자가 감정적으로 연결될 수 있는 지점들

### 📖 1화 완벽 설계 (성공의 90%가 결정됨)

**첫 문장 전략** (3초 법칙):
- 강렬한 시각적 이미지 + 의외성
- 독자의 호기심을 즉시 자극
- 주인공의 특별함을 암시

**1화 구조** (황금 비율):
- **0-20%**: 강력한 훅 + 주인공 매력 어필
- **20-60%**: 세계관 소개 + 갈등 설정  
- **60-80%**: 남주 등장 + 화학 반응
- **80-100%**: 클리프행어 + 다음 화 기대감

### 🎪 클리프행어 마스터링

**완벽한 클리프행어 공식**:
1. **정보 공개**: 충격적이지만 논리적인 새 정보
2. **감정 충격**: 독자의 예상을 뒤엎는 감정적 반전
3. **미래 암시**: 다음에 일어날 일에 대한 강한 호기심
4. **캐릭터 위기**: 주인공이나 남주의 절체절명 상황

### 📝 메가 히트작 출력 형식

${ADVANCED_OUTPUT_FORMAT.metadata.header}
${ADVANCED_OUTPUT_FORMAT.metadata.title}
${ADVANCED_OUTPUT_FORMAT.metadata.slug}  
${ADVANCED_OUTPUT_FORMAT.metadata.summary}
${ADVANCED_OUTPUT_FORMAT.metadata.tropes}
${ADVANCED_OUTPUT_FORMAT.metadata.keywords}

=== CHAPTER 1 ===
CHAPTER_TITLE: 1화: [독자가 클릭하지 않을 수 없는 제목]
${ADVANCED_OUTPUT_FORMAT.chapter.wordCount}
${ADVANCED_OUTPUT_FORMAT.chapter.readingTime}
${ADVANCED_OUTPUT_FORMAT.chapter.emotionalTone}
${ADVANCED_OUTPUT_FORMAT.chapter.cliffhangerLevel}

**중요**: 오직 소설 내용만 출력하세요. 메타데이터, 분석, 지표는 포함하지 마세요.
`.trim();

/**
 * 🔍 스토리 상태 분석 마스터 템플릿 (정밀 진단)
 */
export const STORY_STATE_ANALYSIS_MASTER_TEMPLATE = (chapterContent) => `
## 🔬 전문가급 스토리 상태 정밀 분석

당신은 지금 **스토리 분석 전문가**가 되어 다음 챕터를 **미세한 부분까지 완벽하게 분석**해야 합니다.

### 📖 분석 대상 챕터

${chapterContent.substring(0, 1000)}...

### 🎯 분석 항목 (전문가급 정밀도)

**📍 물리적 상황 분석**:
LOCATION: [정확한 위치 - 건물명, 층수, 방 이름까지]
TIME: [구체적인 시간 - 시각, 계절, 날씨 포함]  
LIGHTING: [조명 상태 - 밝기, 색상, 분위기]
WEATHER: [날씨 상황 - 온도, 습도, 기압]

**👥 캐릭터 상태 분석**:
CHARACTERS_PRESENT: [현재 장면에 있는 모든 인물]
MAIN_CHARACTER_STATE: [주인공의 물리적/정신적 상태]
LOVE_INTEREST_STATE: [남주의 상태 및 위치]
SUPPORTING_CAST: [조연들의 역할 및 상태]

**💭 심리적 상황 분석**:
EMOTIONAL_CLIMATE: [현재 분위기의 감정적 색조]
CHARACTER_EMOTIONS: [각 캐릭터별 세부 감정 상태]
RELATIONSHIP_DYNAMICS: [인물 간 관계의 현재 상태]
INTERNAL_CONFLICTS: [각자 내면의 갈등들]

**⚔️ 갈등 및 긴장 분석**:
ACTIVE_CONFLICTS: [현재 진행 중인 갈등들]
TENSION_LEVEL: [긴장감 수준 1-10점]
UNRESOLVED_ISSUES: [아직 해결되지 않은 문제들]
BREWING_CONFLICTS: [앞으로 터질 것 같은 갈등의 씨앗들]

**🎪 클리프행어 및 미래 요소**:
CLIFFHANGERS: [다음 화로 이어지는 긴장감들]
PENDING_EVENTS: [예고되었지만 아직 일어나지 않은 사건들]
MYSTERIES: [아직 해결되지 않은 의문점들]
FORESHADOWING: [미래 사건을 암시하는 복선들]

**🔮 스토리 진행 상황**:
PLOT_PROGRESSION: [전체 스토리에서 현재 위치]
CHARACTER_DEVELOPMENT: [캐릭터 성장 단계]
ROMANCE_PROGRESSION: [로맨스 진행 단계]
WORLD_BUILDING_STATUS: [세계관 구축 현황]

### 🎯 연속성 보장을 위한 핵심 정보

**다음 챕터 작성시 절대 놓치면 안 되는 것들**:
MUST_REMEMBER: [반드시 기억해야 할 설정/상황들]
MUST_RESOLVE: [다음 화에서 해결해야 할 것들]  
MUST_MAINTAIN: [일관성을 위해 유지해야 할 것들]
MUST_DEVELOP: [더 발전시켜야 할 요소들]

### 📊 품질 및 독자 만족도 예측

**현재 챕터 품질 평가** (1-10점):
- 몰입도: ___/10
- 캐릭터 매력: ___/10
- 스토리 진행: ___/10  
- 감정적 임팩트: ___/10
- 클리프행어 강도: ___/10

**독자 반응 예측**:
- 다음 화 기대도: ___%
- 캐릭터 호감도: ___%
- 스토리 만족도: ___%
- 재방문 의도: ___%

위의 모든 항목을 **전문가의 정밀함**으로 분석하여 완벽한 연속성 보장 데이터를 제공해주세요! 🔬
`.trim();

/**
 * 🚀 고급 프롬프트 빌더 클래스 v2.0
 */
export class MasterPromptBuilder {
  constructor() {
    this.sections = [];
    this.qualityLevel = 'master';
    this.targetAudience = 'korean_romance_fantasy_readers';
  }

  addMasterPersona() {
    this.sections.push(MASTER_PERSONA_TEMPLATE());
    return this;
  }

  addScientificChapterGuide(chapterNumber, requirements = {}) {
    this.sections.push(SCIENTIFIC_CHAPTER_TEMPLATE(chapterNumber, requirements));
    return this;
  }

  addPerfectContinuity(previousSituation, currentRequirements) {
    this.sections.push(PERFECT_CONTINUITY_TEMPLATE(previousSituation, currentRequirements));
    return this;
  }

  addQualityImprovement(content, qualityIssues) {
    this.sections.push(QUALITY_IMPROVEMENT_MASTER_TEMPLATE(content, qualityIssues));
    return this;
  }

  addBlockbusterNovelGuide(requirements) {
    this.sections.push(BLOCKBUSTER_NOVEL_TEMPLATE(requirements));
    return this;
  }

  addStoryAnalysis(chapterContent) {
    this.sections.push(STORY_STATE_ANALYSIS_MASTER_TEMPLATE(chapterContent));
    return this;
  }

  setQualityLevel(level) {
    this.qualityLevel = level;
    return this;
  }

  setTargetAudience(audience) {
    this.targetAudience = audience;
    return this;
  }

  build() {
    return this.sections.join('\n\n');
  }
}

// 하위 호환성을 위한 기본 export
export const PERSONA_TEMPLATE = MASTER_PERSONA_TEMPLATE;
export const CHAPTER_GENERATION_TEMPLATE = SCIENTIFIC_CHAPTER_TEMPLATE;
export const CONTINUITY_TEMPLATE = PERFECT_CONTINUITY_TEMPLATE;
export const QUALITY_IMPROVEMENT_TEMPLATE = QUALITY_IMPROVEMENT_MASTER_TEMPLATE;
export const NOVEL_METADATA_TEMPLATE = BLOCKBUSTER_NOVEL_TEMPLATE;
export const STORY_STATE_ANALYSIS_TEMPLATE = STORY_STATE_ANALYSIS_MASTER_TEMPLATE;

export default {
  MASTER_PERSONA_TEMPLATE,
  SCIENTIFIC_CHAPTER_TEMPLATE,
  PERFECT_CONTINUITY_TEMPLATE,
  QUALITY_IMPROVEMENT_MASTER_TEMPLATE,
  BLOCKBUSTER_NOVEL_TEMPLATE,
  STORY_STATE_ANALYSIS_MASTER_TEMPLATE,
  MasterPromptBuilder,
  // 하위 호환성
  PERSONA_TEMPLATE,
  CHAPTER_GENERATION_TEMPLATE,
  CONTINUITY_TEMPLATE,
  QUALITY_IMPROVEMENT_TEMPLATE,
  NOVEL_METADATA_TEMPLATE,
  STORY_STATE_ANALYSIS_TEMPLATE
};