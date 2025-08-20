/**
 * 🎭 Prompt Template Engine
 * 체계적인 프롬프트 관리 및 생성 시스템
 * 
 * Features:
 * - 장르별/상황별 프롬프트 템플릿
 * - 동적 컨텍스트 주입
 * - 캐릭터별 대화 패턴
 * - 감정 상태 기반 조정
 * - 창의성 모드 연동
 */

import { EnhancedContext } from './enhanced-context-manager.js';
import type { Novel, Chapter } from './types/index.js';

/**
 * 프롬프트 템플릿 카테고리
 */
interface PromptTemplates {
  episode: EpisodeTemplates;
  dialogue: DialogueTemplates;
  description: DescriptionTemplates;
  emotion: EmotionTemplates;
  transition: TransitionTemplates;
  special: SpecialTemplates;
}

interface EpisodeTemplates {
  opening: PromptTemplate;
  development: PromptTemplate;
  climax: PromptTemplate;
  resolution: PromptTemplate;
  cliffhanger: PromptTemplate;
}

interface DialogueTemplates {
  confession: PromptTemplate;
  conflict: PromptTemplate;
  reconciliation: PromptTemplate;
  flirting: PromptTemplate;
  heartbreak: PromptTemplate;
}

interface DescriptionTemplates {
  character: PromptTemplate;
  setting: PromptTemplate;
  action: PromptTemplate;
  magic: PromptTemplate;
  emotion: PromptTemplate;
}

interface EmotionTemplates {
  love: PromptTemplate;
  anger: PromptTemplate;
  sadness: PromptTemplate;
  joy: PromptTemplate;
  fear: PromptTemplate;
  hope: PromptTemplate;
}

interface TransitionTemplates {
  timeSkip: PromptTemplate;
  sceneChange: PromptTemplate;
  povShift: PromptTemplate;
  flashback: PromptTemplate;
}

interface SpecialTemplates {
  firstMeeting: PromptTemplate;
  firstKiss: PromptTemplate;
  separation: PromptTemplate;
  reunion: PromptTemplate;
  ending: PromptTemplate;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  system: string;
  context: (state: unknown) => string;
  instruction: string;
  examples?: string[];
  variables: string[];
  creativityLevel: 'standard' | 'high' | 'unlimited';
  priority: number;
}

interface TemplateContext {
  novel: Novel;
  chapter: number;
  characters: CharacterInfo[];
  relationships: RelationshipInfo[];
  currentMood: string;
  plotPoint: string;
  previousEvents: string[];
  nextGoals: string[];
  worldState: WorldInfo;
  readerPreferences: ReaderPreferences;
}

interface CharacterInfo {
  name: string;
  role: 'protagonist' | 'love_interest' | 'antagonist' | 'supporting';
  personality: string[];
  currentEmotion: string;
  speechPattern: string;
  background: string;
}

interface RelationshipInfo {
  characters: [string, string];
  _type: 'romantic' | 'friendship' | 'rivalry' | 'family';
  level: number; // 0-100
  status: string;
  tension: number;
}

interface WorldInfo {
  setting: string;
  timeOfDay: string;
  weather: string;
  magicLevel: string;
  socialContext: string;
}

interface ReaderPreferences {
  favoriteCharacters: string[];
  preferredTropes: string[];
  emotionalPreference: string;
  pacePreference: string;
}

/**
 * 프롬프트 템플릿 엔진
 */
export class PromptTemplateEngine {
  private templates: PromptTemplates;
  private customTemplates: Map<string, PromptTemplate>;
  private templateCache: Map<string, string>;

  constructor() {
    this.templates = this.initializeTemplates();
    this.customTemplates = new Map();
    this.templateCache = new Map();
  }

  /**
   * 기본 템플릿 초기화
   */
  private initializeTemplates(): PromptTemplates {
    return {
      episode: {
        opening: {
          id: 'episode.opening',
          name: '챕터 오프닝',
          description: '새로운 챕터의 매력적인 시작 생성',
          system: `당신은 최고의 로맨스 판타지 전문 작가입니다. 독자의 마음을 사로잡는 강력한 오프닝을 만들어주세요.`,
          context: (state: TemplateContext) => `
현재 상황: ${state.novel.title} ${state.chapter}화
이전 챕터 마지막: ${state.previousEvents.slice(-1)[0] || '새로운 시작'}
주요 인물: ${state.characters.map(c => `${c.name}(${c.currentEmotion})`).join(', ')}
현재 배경: ${state.worldState.setting} - ${state.worldState.timeOfDay}
`,
          instruction: `
다음 요구사항에 따라 매력적인 챕터 오프닝을 작성해주세요:

1. 독자의 호기심을 즉시 자극하는 첫 문장
2. 이전 챕터와의 자연스러운 연결
3. 주요 인물의 현재 감정 상태 반영
4. 로맨스 판타지 장르의 매력 강조
5. 다음 전개에 대한 기대감 조성

분량: 800-1,200자
`,
          variables: ['novel.title', 'chapter', 'previousEvents', 'characters', 'worldState'],
          creativityLevel: 'high',
          priority: 10
        },
        development: {
          id: 'episode.development',
          name: '스토리 전개',
          description: '중간 부분의 자연스러운 스토리 진행',
          system: `로맨스 판타지의 정교한 플롯 전개를 위한 전문 작가로서 활동해주세요.`,
          context: (state: TemplateContext) => `
현재 진행: ${state.plotPoint}
캐릭터 관계: ${state.relationships.map(r => `${r.characters.join('-')}: ${r.status} (${r.level}%)`).join(', ')}
감정 분위기: ${state.currentMood}
`,
          instruction: `
스토리의 중간 전개 부분을 작성해주세요:

1. 캐릭터 간의 관계 발전
2. 갈등 또는 로맨스 요소 심화
3. 세계관 확장 및 배경 정보
4. 감정적 몰입도 유지
5. 다음 장면으로의 자연스러운 이어짐

분량: 1,500-2,000자
`,
          variables: ['plotPoint', 'relationships', 'currentMood'],
          creativityLevel: 'standard',
          priority: 5
        },
        climax: {
          id: 'episode.climax',
          name: '클라이맥스',
          description: '긴장감 넘치는 절정 순간',
          system: `독자의 심장을 뛰게 만드는 강렬한 클라이맥스 전문 작가입니다.`,
          context: (state: TemplateContext) => `
절정 상황: ${state.plotPoint}
핵심 갈등: ${state.relationships.filter(r => r.tension > 70).map(r => r.characters.join(' vs ')).join(', ')}
감정 절정: ${state.currentMood}
`,
          instruction: `
숨막히는 클라이맥스를 작성해주세요:

1. 최고조의 긴장감과 감정
2. 예상치 못한 반전 또는 깨달음
3. 캐릭터의 진정한 감정 폭발
4. 강렬한 액션 또는 로맨스 장면
5. 독자가 숨을 멈출 만한 순간

분량: 1,200-1,800자
`,
          variables: ['plotPoint', 'relationships', 'currentMood'],
          creativityLevel: 'unlimited',
          priority: 10
        },
        resolution: {
          id: 'episode.resolution',
          name: '갈등 해결',
          description: '만족스러운 갈등 해결과 정리',
          system: `따뜻하고 만족스러운 해결책을 제시하는 작가입니다.`,
          context: (state: TemplateContext) => `
해결해야 할 갈등: ${state.plotPoint}
캐릭터 성장: ${state.characters.map(c => `${c.name}의 변화`).join(', ')}
새로운 균형: ${state.currentMood}
`,
          instruction: `
갈등의 만족스러운 해결을 작성해주세요:

1. 갈등의 자연스러운 해결
2. 캐릭터의 성장과 깨달음
3. 관계의 발전 또는 회복
4. 감정적 만족감 제공
5. 다음 에피소드에 대한 기대

분량: 1,000-1,500자
`,
          variables: ['plotPoint', 'characters', 'currentMood'],
          creativityLevel: 'standard',
          priority: 7
        },
        cliffhanger: {
          id: 'episode.cliffhanger',
          name: '절벽 매달리기',
          description: '다음 화가 궁금한 강력한 마무리',
          system: `독자를 다음 화까지 기다리게 만드는 클리프행어 전문가입니다.`,
          context: (state: TemplateContext) => `
현재까지의 진행: ${state.plotPoint}
다음 화 예고: ${state.nextGoals.slice(0, 2).join(', ')}
독자 관심사: ${state.readerPreferences.preferredTropes.join(', ')}
`,
          instruction: `
강력한 클리프행어로 마무리해주세요:

1. 충격적인 반전 또는 새로운 정보
2. 주요 인물의 위기 상황
3. 미해결 로맨스 또는 갈등
4. 다음 화에 대한 강한 궁금증
5. 독자의 예상을 뒤엎는 결말

분량: 500-800자
`,
          variables: ['plotPoint', 'nextGoals', 'readerPreferences'],
          creativityLevel: 'high',
          priority: 9
        }
      },
      dialogue: {
        confession: {
          id: 'dialogue.confession',
          name: '고백 장면',
          description: '가슴 설레는 고백 대화',
          system: `감동적이고 진정성 있는 고백 장면을 만드는 전문가입니다.`,
          context: (state: TemplateContext) => `
고백하는 인물: ${state.characters.find(c => c.role === 'protagonist')?.name}
상대방: ${state.characters.find(c => c.role === 'love_interest')?.name}
감정 상태: ${state.currentMood}
관계 진행도: ${state.relationships.find(r => r._type === 'romantic')?.level || 0}%
`,
          instruction: `
마음에 와닿는 고백 장면을 작성해주세요:

1. 진정성 있고 자연스러운 대화
2. 캐릭터별 고유한 말투 반영
3. 감정의 점진적 상승
4. 독자의 감정 이입 유도
5. 기억에 남을 명대사 포함

형식: 대화와 행동 묘사 혼합
분량: 800-1,200자
`,
          variables: ['characters', 'currentMood', 'relationships'],
          creativityLevel: 'unlimited',
          priority: 10
        },
        conflict: {
          id: 'dialogue.conflict',
          name: '갈등 대화',
          description: '긴장감 있는 갈등 장면',
          system: `치열하고 감정적인 갈등 상황을 표현하는 작가입니다.`,
          context: (state: TemplateContext) => `
갈등 당사자: ${state.characters.filter(c => c.currentEmotion.includes('분노')).map(c => c.name).join(' vs ')}
갈등 원인: ${state.plotPoint}
긴장도: ${Math.max(...state.relationships.map(r => r.tension))}%
`,
          instruction: `
팽팽한 갈등 대화를 작성해주세요:

1. 각자의 입장과 감정 명확히 표현
2. 점점 고조되는 긴장감
3. 캐릭터의 진정한 속마음 드러내기
4. 예상치 못한 말의 칼날
5. 갈등의 핵심 쟁점 부각

분량: 1,000-1,500자
`,
          variables: ['characters', 'plotPoint', 'relationships'],
          creativityLevel: 'high',
          priority: 8
        },
        reconciliation: {
          id: 'dialogue.reconciliation',
          name: '화해 장면',
          description: '따뜻한 화해와 용서의 대화',
          system: `진정한 화해와 용서의 가치를 전달하는 작가입니다.`,
          context: (state: TemplateContext) => `
화해 대상: ${state.characters.slice(0, 2).map(c => c.name).join('과 ')}
이전 갈등: ${state.previousEvents.filter(e => e.includes('갈등')).slice(-1)[0]}
현재 감정: ${state.currentMood}
`,
          instruction: `
감동적인 화해 장면을 작성해주세요:

1. 서로의 마음을 이해하는 과정
2. 진심 어린 사과와 용서
3. 관계의 새로운 출발점
4. 따뜻하고 감동적인 분위기
5. 미래에 대한 희망적 전망

분량: 800-1,200자
`,
          variables: ['characters', 'previousEvents', 'currentMood'],
          creativityLevel: 'standard',
          priority: 6
        },
        flirting: {
          id: 'dialogue.flirting',
          name: '설렘 대화',
          description: '귀엽고 설레는 밀당 대화',
          system: `설레고 유쾌한 로맨스 대화를 만드는 전문가입니다.`,
          context: (state: TemplateContext) => `
주인공들: ${state.characters.filter(c => ['protagonist', 'love_interest'].includes(c.role)).map(c => c.name).join('과 ')}
관계 단계: ${state.relationships.find(r => r._type === 'romantic')?.status || '초기'}
분위기: ${state.worldState.setting}에서 ${state.worldState.timeOfDay}
`,
          instruction: `
설레는 밀당 대화를 작성해주세요:

1. 귀엽고 유쾌한 티격태격
2. 은근한 관심과 애정 표현
3. 독자가 미소 짓게 만드는 순간
4. 캐릭터별 매력 포인트 부각
5. 로맨스 진행의 달콤함

분량: 600-1,000자
`,
          variables: ['characters', 'relationships', 'worldState'],
          creativityLevel: 'high',
          priority: 7
        },
        heartbreak: {
          id: 'dialogue.heartbreak',
          name: '이별 장면',
          description: '가슴 아픈 이별과 상처의 대화',
          system: `깊은 감정과 상처를 섬세하게 표현하는 작가입니다.`,
          context: (state: TemplateContext) => `
이별 상황: ${state.plotPoint}
아픈 마음: ${state.characters.filter(c => c.currentEmotion.includes('슬픔')).map(c => c.name).join(', ')}
이별 원인: ${state.previousEvents.slice(-1)[0]}
`,
          instruction: `
마음 아픈 이별 장면을 작성해주세요:

1. 깊은 슬픔과 아픔의 표현
2. 헤어져야 하는 이유의 절실함
3. 서로에 대한 마지막 마음
4. 독자의 눈물을 자아내는 순간
5. 희망 또는 체념의 감정

분량: 1,000-1,500자
`,
          variables: ['plotPoint', 'characters', 'previousEvents'],
          creativityLevel: 'high',
          priority: 8
        }
      },
      description: {
        character: {
          id: 'description.character',
          name: '인물 묘사',
          description: '매력적인 캐릭터 외모와 성격 묘사',
          system: `생생하고 매력적인 인물 묘사의 전문가입니다.`,
          context: (state: TemplateContext) => `
묘사 대상: ${state.characters[0]?.name} (${state.characters[0]?.role})
성격: ${state.characters[0]?.personality.join(', ')}
현재 상황: ${state.currentMood}
`,
          instruction: `
인물을 생생하게 묘사해주세요:

1. 독특하고 기억에 남는 외모
2. 성격이 드러나는 표정과 몸짓
3. 매력적인 개성과 특징
4. 현재 감정 상태 반영
5. 독자의 호감을 끄는 요소

분량: 400-600자
`,
          variables: ['characters', 'currentMood'],
          creativityLevel: 'standard',
          priority: 4
        },
        setting: {
          id: 'description.setting',
          name: '배경 묘사',
          description: '몰입감 있는 장소와 환경 묘사',
          system: `환상적이고 몰입감 있는 배경 묘사를 만드는 작가입니다.`,
          context: (state: TemplateContext) => `
장소: ${state.worldState.setting}
시간: ${state.worldState.timeOfDay}
날씨: ${state.worldState.weather}
분위기: ${state.currentMood}
`,
          instruction: `
몰입감 있는 배경을 묘사해주세요:

1. 다섯 감각을 자극하는 묘사
2. 판타지 세계의 신비로움
3. 현재 분위기와 어울리는 환경
4. 생생하고 구체적인 디테일
5. 스토리와 연결되는 상징성

분량: 300-500자
`,
          variables: ['worldState', 'currentMood'],
          creativityLevel: 'standard',
          priority: 3
        },
        action: {
          id: 'description.action',
          name: '액션 묘사',
          description: '역동적이고 생생한 액션 장면',
          system: `박진감 넘치는 액션과 전투 장면을 생생하게 그려내는 작가입니다.`,
          context: (state: TemplateContext) => `
액션 상황: ${state.plotPoint}
참여자: ${state.characters.map(c => `${c.name}(${c.role})`).join(', ')}
마법 수준: ${state.worldState.magicLevel}
`,
          instruction: `
박진감 넘치는 액션을 묘사해주세요:

1. 빠른 템포와 역동성
2. 마법과 검술의 화려함
3. 긴장감과 스릴 조성
4. 캐릭터의 능력과 전략
5. 시각적 임팩트가 강한 장면

분량: 800-1,200자
`,
          variables: ['plotPoint', 'characters', 'worldState'],
          creativityLevel: 'high',
          priority: 7
        },
        magic: {
          id: 'description.magic',
          name: '마법 묘사',
          description: '신비롭고 화려한 마법 장면',
          system: `환상적이고 신비로운 마법 세계를 창조하는 전문가입니다.`,
          context: (state: TemplateContext) => `
마법 상황: ${state.plotPoint}
시전자: ${state.characters.find(c => c.role === 'protagonist')?.name}
마법 레벨: ${state.worldState.magicLevel}
`,
          instruction: `
환상적인 마법 장면을 묘사해주세요:

1. 신비롭고 아름다운 마법 현상
2. 마력의 흐름과 에너지
3. 시각적으로 화려한 효과
4. 마법의 원리와 철학
5. 감정과 연결된 마법의 발현

분량: 600-900자
`,
          variables: ['plotPoint', 'characters', 'worldState'],
          creativityLevel: 'high',
          priority: 6
        },
        emotion: {
          id: 'description.emotion',
          name: '감정 묘사',
          description: '섬세하고 깊이 있는 내면 묘사',
          system: `인간의 복잡하고 섬세한 감정을 깊이 있게 표현하는 작가입니다.`,
          context: (state: TemplateContext) => `
주요 감정: ${state.currentMood}
감정 주체: ${state.characters[0]?.name}
감정 원인: ${state.plotPoint}
`,
          instruction: `
깊이 있는 감정을 묘사해주세요:

1. 복잡하고 미묘한 감정의 층위
2. 내면의 갈등과 고민
3. 감정의 변화 과정
4. 몸과 마음의 반응
5. 독자의 공감을 이끄는 표현

분량: 500-800자
`,
          variables: ['currentMood', 'characters', 'plotPoint'],
          creativityLevel: 'standard',
          priority: 5
        }
      },
      emotion: {
        love: {
          id: 'emotion.love',
          name: '사랑의 감정',
          description: '따뜻하고 설레는 사랑의 감정 표현',
          system: `순수하고 아름다운 사랑의 감정을 표현하는 전문가입니다.`,
          context: (state: TemplateContext) => `
사랑하는 이: ${state.characters.find(c => c.role === 'love_interest')?.name}
사랑의 단계: ${state.relationships.find(r => r._type === 'romantic')?.level || 0}%
현재 상황: ${state.plotPoint}
`,
          instruction: `
아름다운 사랑의 감정을 표현해주세요:

1. 설레는 마음의 떨림
2. 상대방에 대한 소중함
3. 함께하고 싶은 마음
4. 미래에 대한 꿈과 희망
5. 사랑의 순수하고 따뜻한 면

분량: 400-600자
`,
          variables: ['characters', 'relationships', 'plotPoint'],
          creativityLevel: 'high',
          priority: 8
        },
        anger: {
          id: 'emotion.anger',
          name: '분노의 감정',
          description: '강렬하고 정당한 분노의 표현',
          system: `정당한 분노와 억울함을 강렬하게 표현하는 작가입니다.`,
          context: (state: TemplateContext) => `
분노 원인: ${state.plotPoint}
분노 대상: ${state.characters.filter(c => c.currentEmotion.includes('분노')).map(c => c.name).join(', ')}
분노 강도: ${Math.max(...state.relationships.map(r => r.tension))}%
`,
          instruction: `
강렬한 분노의 감정을 표현해주세요:

1. 억울함과 정당한 분노
2. 끓어오르는 감정의 격류
3. 분노의 구체적인 원인
4. 복수심 또는 정의감
5. 분노 뒤에 숨은 상처

분량: 400-600자
`,
          variables: ['plotPoint', 'characters', 'relationships'],
          creativityLevel: 'standard',
          priority: 6
        },
        sadness: {
          id: 'emotion.sadness',
          name: '슬픔의 감정',
          description: '깊고 애틋한 슬픔의 표현',
          system: `깊은 슬픔과 아픔을 섬세하게 표현하는 작가입니다.`,
          context: (state: TemplateContext) => `
슬픔 원인: ${state.plotPoint}
슬픔 주체: ${state.characters.filter(c => c.currentEmotion.includes('슬픔')).map(c => c.name).join(', ')}
상실감: ${state.previousEvents.filter(e => e.includes('잃음')).slice(-1)[0] || '알 수 없는 상실'}
`,
          instruction: `
깊은 슬픔의 감정을 표현해주세요:

1. 가슴 깊이 스며드는 아픔
2. 상실감과 허무함
3. 눈물과 한숨의 표현
4. 슬픔 속에 숨은 그리움
5. 위로가 필요한 마음

분량: 400-600자
`,
          variables: ['plotPoint', 'characters', 'previousEvents'],
          creativityLevel: 'standard',
          priority: 6
        },
        joy: {
          id: 'emotion.joy',
          name: '기쁨의 감정',
          description: '밝고 따뜻한 기쁨과 행복의 표현',
          system: `순수한 기쁨과 행복을 밝게 표현하는 작가입니다.`,
          context: (state: TemplateContext) => `
기쁨 원인: ${state.plotPoint}
행복한 인물: ${state.characters.filter(c => c.currentEmotion.includes('기쁨')).map(c => c.name).join(', ')}
기쁨 상황: ${state.currentMood}
`,
          instruction: `
밝은 기쁨의 감정을 표현해주세요:

1. 마음 가득한 행복감
2. 밝은 미소와 웃음
3. 희망찬 미래에 대한 기대
4. 감사하고 소중한 마음
5. 다른 이와 나누고 싶은 기쁨

분량: 400-600자
`,
          variables: ['plotPoint', 'characters', 'currentMood'],
          creativityLevel: 'standard',
          priority: 5
        },
        fear: {
          id: 'emotion.fear',
          name: '두려움의 감정',
          description: '긴장감 있는 두려움과 불안의 표현',
          system: `긴장감 넘치는 두려움과 공포를 표현하는 작가입니다.`,
          context: (state: TemplateContext) => `
두려움 대상: ${state.plotPoint}
불안한 인물: ${state.characters.filter(c => c.currentEmotion.includes('두려움')).map(c => c.name).join(', ')}
위험 수준: ${Math.max(...state.relationships.map(r => r.tension))}%
`,
          instruction: `
긴장감 있는 두려움을 표현해주세요:

1. 심장 뛰는 긴장감
2. 알 수 없는 불안과 공포
3. 위험에 대한 본능적 반응
4. 보호하고 싶은 대상에 대한 걱정
5. 두려움을 극복하려는 의지

분량: 400-600자
`,
          variables: ['plotPoint', 'characters', 'relationships'],
          creativityLevel: 'standard',
          priority: 6
        },
        hope: {
          id: 'emotion.hope',
          name: '희망의 감정',
          description: '따뜻하고 밝은 희망과 꿈의 표현',
          system: `따뜻한 희망과 꿈을 아름답게 표현하는 작가입니다.`,
          context: (state: TemplateContext) => `
희망 내용: ${state.nextGoals.slice(0, 2).join(', ')}
희망을 품는 인물: ${state.characters[0]?.name}
현재 상황: ${state.plotPoint}
`,
          instruction: `
따뜻한 희망의 감정을 표현해주세요:

1. 밝은 미래에 대한 기대
2. 꿈과 이상향에 대한 그리움
3. 포기하지 않는 의지
4. 사랑하는 이와 함께할 미래
5. 희망이 주는 힘과 용기

분량: 400-600자
`,
          variables: ['nextGoals', 'characters', 'plotPoint'],
          creativityLevel: 'standard',
          priority: 7
        }
      },
      transition: {
        timeSkip: {
          id: 'transition.timeSkip',
          name: '시간 이동',
          description: '자연스러운 시간 흐름 표현',
          system: `자연스럽고 부드러운 시간 전환을 표현하는 작가입니다.`,
          context: (state: TemplateContext) => `
시간 변화: ${state.plotPoint}
주요 변화: ${state.nextGoals.slice(0, 1)[0]}
새로운 상황: ${state.currentMood}
`,
          instruction: `
자연스러운 시간 전환을 표현해주세요:

1. 시간의 흐름을 느낄 수 있는 묘사
2. 변화된 상황과 분위기
3. 캐릭터의 성장이나 변화
4. 새로운 단계로의 진입
5. 독자의 이해를 돕는 설명

분량: 300-500자
`,
          variables: ['plotPoint', 'nextGoals', 'currentMood'],
          creativityLevel: 'standard',
          priority: 3
        },
        sceneChange: {
          id: 'transition.sceneChange',
          name: '장면 전환',
          description: '부드러운 장면 변화',
          system: `매끄러운 장면 전환을 만드는 전문가입니다.`,
          context: (state: TemplateContext) => `
이전 장면: ${state.previousEvents.slice(-1)[0]}
새로운 장면: ${state.worldState.setting}
분위기 변화: ${state.currentMood}
`,
          instruction: `
부드러운 장면 전환을 작성해주세요:

1. 이전 장면과의 자연스러운 연결
2. 새로운 배경과 분위기
3. 캐릭터의 위치와 상태 설명
4. 독자의 몰입 유지
5. 다음 전개를 위한 준비

분량: 200-400자
`,
          variables: ['previousEvents', 'worldState', 'currentMood'],
          creativityLevel: 'standard',
          priority: 2
        },
        povShift: {
          id: 'transition.povShift',
          name: '시점 변화',
          description: '다른 캐릭터 시점으로 전환',
          system: `다양한 캐릭터 시점을 자연스럽게 전환하는 작가입니다.`,
          context: (state: TemplateContext) => `
이전 시점: ${state.characters[0]?.name}
새로운 시점: ${state.characters[1]?.name}
상황: ${state.plotPoint}
`,
          instruction: `
자연스러운 시점 전환을 작성해주세요:

1. 새로운 캐릭터의 관점 제시
2. 상황에 대한 다른 해석
3. 캐릭터 고유의 생각과 감정
4. 독자에게 새로운 정보 제공
5. 스토리의 깊이감 증대

분량: 300-500자
`,
          variables: ['characters', 'plotPoint'],
          creativityLevel: 'standard',
          priority: 4
        },
        flashback: {
          id: 'transition.flashback',
          name: '회상 장면',
          description: '과거 장면으로의 자연스러운 이동',
          system: `과거와 현재를 아름답게 연결하는 회상 전문가입니다.`,
          context: (state: TemplateContext) => `
회상 트리거: ${state.plotPoint}
과거 사건: ${state.previousEvents.slice(-3, -1).join(', ')}
회상 주체: ${state.characters[0]?.name}
`,
          instruction: `
자연스러운 회상 전환을 작성해주세요:

1. 현재에서 과거로 넘어가는 자연스러운 연결
2. 과거 사건의 중요성과 의미
3. 캐릭터의 감정과 기억
4. 현재 상황과의 연관성
5. 과거에서 현재로 돌아오는 마무리

분량: 400-600자
`,
          variables: ['plotPoint', 'previousEvents', 'characters'],
          creativityLevel: 'standard',
          priority: 5
        }
      },
      special: {
        firstMeeting: {
          id: 'special.firstMeeting',
          name: '첫 만남',
          description: '운명적인 첫 만남 장면',
          system: `운명적이고 로맨틱한 첫 만남을 만드는 전문가입니다.`,
          context: (state: TemplateContext) => `
만나는 인물들: ${state.characters.filter(c => ['protagonist', 'love_interest'].includes(c.role)).map(c => c.name).join('과 ')}
만남의 장소: ${state.worldState.setting}
만남의 상황: ${state.plotPoint}
`,
          instruction: `
운명적인 첫 만남을 작성해주세요:

1. 강렬하고 인상적인 첫 등장
2. 서로에게 남긴 첫인상
3. 운명적인 느낌과 특별함
4. 미래 관계의 암시
5. 독자의 설렘과 기대감 조성

분량: 1,000-1,500자
`,
          variables: ['characters', 'worldState', 'plotPoint'],
          creativityLevel: 'unlimited',
          priority: 10
        },
        firstKiss: {
          id: 'special.firstKiss',
          name: '첫 키스',
          description: '감동적인 첫 키스 장면',
          system: `가슴 설레는 첫 키스의 순간을 아름답게 그려내는 작가입니다.`,
          context: (state: TemplateContext) => `
키스 상황: ${state.plotPoint}
관계 진전도: ${state.relationships.find(r => r._type === 'romantic')?.level || 0}%
분위기: ${state.worldState.setting}에서 ${state.currentMood}
`,
          instruction: `
설레는 첫 키스 장면을 작성해주세요:

1. 키스 직전의 떨리는 순간
2. 서로의 감정과 마음
3. 아름답고 로맨틱한 분위기
4. 키스 순간의 섬세한 묘사
5. 키스 후의 여운과 변화

분량: 800-1,200자
`,
          variables: ['plotPoint', 'relationships', 'worldState', 'currentMood'],
          creativityLevel: 'unlimited',
          priority: 10
        },
        separation: {
          id: 'special.separation',
          name: '이별 순간',
          description: '가슴 아픈 이별의 순간',
          system: `깊은 감동과 아픔을 전달하는 이별 장면 전문가입니다.`,
          context: (state: TemplateContext) => `
이별 상황: ${state.plotPoint}
이별하는 인물들: ${state.characters.slice(0, 2).map(c => c.name).join('과 ')}
이별 원인: ${state.previousEvents.slice(-1)[0]}
`,
          instruction: `
가슴 아픈 이별 장면을 작성해주세요:

1. 이별의 불가피함과 아픔
2. 서로에 대한 마지막 마음
3. 헤어지는 순간의 절절함
4. 미래에 대한 불안과 그리움
5. 독자의 눈물을 자아내는 감동

분량: 1,000-1,500자
`,
          variables: ['plotPoint', 'characters', 'previousEvents'],
          creativityLevel: 'high',
          priority: 9
        },
        reunion: {
          id: 'special.reunion',
          name: '재회 순간',
          description: '감동적인 재회의 순간',
          system: `따뜻하고 감동적인 재회 장면을 만드는 전문가입니다.`,
          context: (state: TemplateContext) => `
재회 상황: ${state.plotPoint}
재회하는 인물들: ${state.characters.slice(0, 2).map(c => c.name).join('과 ')}
이별 기간: ${state.previousEvents.filter(e => e.includes('이별')).length > 0 ? '오랜 시간' : '잠시'}
`,
          instruction: `
감동적인 재회 장면을 작성해주세요:

1. 재회의 놀라움과 기쁨
2. 서로를 그리워했던 마음
3. 변하지 않은 사랑의 확인
4. 행복한 미래에 대한 약속
5. 독자의 마음을 따뜻하게 하는 감동

분량: 1,000-1,500자
`,
          variables: ['plotPoint', 'characters', 'previousEvents'],
          creativityLevel: 'high',
          priority: 9
        },
        ending: {
          id: 'special.ending',
          name: '해피 엔딩',
          description: '완벽한 해피 엔딩',
          system: `완벽하고 만족스러운 해피 엔딩을 만드는 전문가입니다.`,
          context: (state: TemplateContext) => `
최종 상황: ${state.plotPoint}
주인공들: ${state.characters.filter(c => ['protagonist', 'love_interest'].includes(c.role)).map(c => c.name).join('과 ')}
완성된 관계: ${state.relationships.find(r => r._type === 'romantic')?.level || 100}%
`,
          instruction: `
완벽한 해피 엔딩을 작성해주세요:

1. 모든 갈등의 완전한 해결
2. 주인공들의 행복한 결합
3. 밝고 희망찬 미래
4. 독자의 만족감과 감동
5. 모든 캐릭터의 행복한 결말

분량: 1,500-2,000자
`,
          variables: ['plotPoint', 'characters', 'relationships'],
          creativityLevel: 'unlimited',
          priority: 10
        }
      }
    };
  }

  /**
   * 템플릿 기반 프롬프트 생성
   */
  generatePrompt(
    templateId: string,
    context: TemplateContext,
    enhancedContext?: EnhancedContext
  ): string {
    const template = this.findTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // 캐시 확인
    const cacheKey = this.generateCacheKey(templateId, context);
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    // 프롬프트 구성
    const prompt = this.buildPrompt(template, _context, enhancedContext);

    // 캐시 저장
    this.templateCache.set(cacheKey, prompt);

    return prompt;
  }

  /**
   * 프롬프트 구성
   */
  private buildPrompt(
    template: PromptTemplate,
    context: TemplateContext,
    enhancedContext?: EnhancedContext
  ): string {
    let prompt = `${template.system}\n\n`;

    // 컨텍스트 추가
    prompt += template.context(context) + '\n\n';

    // Enhanced Context 정보 추가
    if (enhancedContext) {
      prompt += this.addEnhancedContextInfo(enhancedContext);
    }

    // 지시사항 추가
    prompt += template.instruction + '\n';

    // 창의성 모드에 따른 조정
    if (enhancedContext?.creativityMode.isActive) {
      prompt = this.enhanceForCreativity(prompt, enhancedContext.creativityMode);
    }

    return prompt;
  }

  /**
   * Enhanced Context 정보 추가
   */
  private addEnhancedContextInfo(enhancedContext: EnhancedContext): string {
    const info = [];

    // 창의성 모드 정보
    if (enhancedContext.creativityMode.isActive) {
      info.push(`🎨 창의성 모드: ${enhancedContext.creativityMode.investmentLevel} (${enhancedContext.creativityMode.trigger})`);
    }

    // 품질 목표
    info.push(`📊 품질 목표: 창의성 ${enhancedContext.qualityTargets.creativity}%, 몰입도 ${enhancedContext.qualityTargets.engagement}%`);

    // 독자 인사이트
    if (enhancedContext.readerInsights.preferredElements.length > 0) {
      info.push(`👥 독자 선호: ${enhancedContext.readerInsights.preferredElements.slice(0, 3).join(', ')}`);
    }

    return info.length > 0 ? info.join('\n') + '\n\n' : '';
  }

  /**
   * 창의성 향상
   */
  private enhanceForCreativity(prompt: string, creativityMode: { isActive: boolean; investmentLevel: string; trigger: string }): string {
    if (creativityMode.investmentLevel === 'unlimited') {
      return `🚀 UNLIMITED CREATIVITY MODE
비용 신경쓰지 말고 독자를 완전히 놀라게 하세요!
역대급 반전과 감동의 명장면을 만들어주세요.

${prompt}

🎨 창의성 추가 지시사항:
- 예측 불가능한 서술 기법과 혁신적 표현 사용
- 감정의 깊이를 극한까지 파고드는 심리 묘사
- 시적이고 영화적인 장면 연출
- 독자가 "이 작품은 진짜 다르다"고 느낄 만한 독창성
`;
    } else if (creativityMode.investmentLevel === 'high') {
      return `⭐ HIGH CREATIVITY MODE
특별한 순간입니다. 평소보다 더 창의적이고 감동적으로 작성해주세요.

${prompt}

💫 향상 지시사항:
- 더욱 감정적이고 몰입감 있는 표현
- 독창적인 아이디어와 반전 요소
- 독자의 기대를 뛰어넘는 품질
`;
    }

    return prompt;
  }

  /**
   * 템플릿 찾기
   */
  private findTemplate(templateId: string): PromptTemplate | null {
    const parts = templateId.split('.');
    if (parts.length !== 2) return null;

    const [category, name] = parts;
    const categoryTemplates = (this.templates as Record<string, Record<string, PromptTemplate>>)[category];
    
    if (!categoryTemplates) return null;

    return categoryTemplates[name] || null;
  }

  /**
   * 상황별 최적 템플릿 추천
   */
  recommendTemplate(
    context: TemplateContext,
    intent: 'opening' | 'development' | 'climax' | 'resolution' | 'dialogue' | 'description'
  ): string {
    switch (intent) {
      case 'opening':
        return 'episode.opening';
      case 'development':
        return context.relationships.some(r => r.tension > 70) ? 'dialogue.conflict' : 'episode.development';
      case 'climax':
        return 'episode.climax';
      case 'resolution':
        return 'episode.resolution';
      case 'dialogue':
        const romanticLevel = context.relationships.find(r => r._type === 'romantic')?.level || 0;
        if (romanticLevel > 80) return 'dialogue.confession';
        if (romanticLevel > 40) return 'dialogue.flirting';
        return 'dialogue.conflict';
      case 'description':
        return context.worldState.magicLevel === 'high' ? 'description.magic' : 'description.setting';
      default:
        return 'episode.development';
    }
  }

  /**
   * 커스텀 템플릿 추가
   */
  addCustomTemplate(template: PromptTemplate): void {
    this.customTemplates.set(template.id, template);
  }

  /**
   * 템플릿 성능 분석
   */
  analyzeTemplatePerformance(): unknown {
    return {
      totalTemplates: Object.keys(this.templates).length,
      cacheSize: this.templateCache.size,
      mostUsed: this.getMostUsedTemplates(),
      averageLength: this.getAveragePromptLength()
    };
  }

  /**
   * 유틸리티 메서드들
   */
  private generateCacheKey(templateId: string, context: TemplateContext): string {
    const contextHash = this.hashObject({
      novel: context.novel.slug,
      chapter: context.chapter,
      mood: context.currentMood,
      plotPoint: context.plotPoint
    });
    return `${templateId}-${contextHash}`;
  }

  private hashObject(obj: unknown): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private getMostUsedTemplates(): string[] {
    // 실제 구현에서는 사용 통계를 추적
    return ['episode.opening', 'dialogue.confession', 'episode.climax'];
  }

  private getAveragePromptLength(): number {
    // 실제 구현에서는 생성된 프롬프트 길이 평균 계산
    return 1500;
  }

  /**
   * 시스템 상태 통계 (파이프라인 호환성)
   */
  getStats(): unknown {
    return this.analyzeTemplatePerformance();
  }
}

export default PromptTemplateEngine;