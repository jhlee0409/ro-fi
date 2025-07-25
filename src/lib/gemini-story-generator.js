import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini 2.5 Pro 기반 스토리 생성기
 * 복잡한 세계관 구축, 논리적 일관성, 설정 관리에 특화
 */
export class GeminiStoryGenerator {
  constructor(apiKey, config = {}) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // 환경 변수 또는 설정에서 모델 정보 가져오기
    const modelName = config.modelName || process.env.GEMINI_MODEL || "gemini-2.0-pro-exp";
    const generationConfig = {
      temperature: config.temperature || parseFloat(process.env.GEMINI_TEMPERATURE) || 0.9,
      topK: config.topK || parseInt(process.env.GEMINI_TOP_K) || 40,
      topP: config.topP || parseFloat(process.env.GEMINI_TOP_P) || 0.95,
      maxOutputTokens: config.maxOutputTokens || parseInt(process.env.GEMINI_MAX_TOKENS) || 8192,
      ...config.generationConfig
    };
    
    this.model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig,
    });
    
    // 설정 저장 (디버깅 및 로깅용)
    this.config = {
      modelName,
      generationConfig
    };
  }

  /**
   * 세계관 및 설정 구축 (Gemini의 강점)
   */
  async generateWorldBuilding(title, tropes, existingSettings = {}) {
    const prompt = `당신은 로맨스 판타지 세계관 설계 전문가입니다.

소설 제목: "${title}"
주요 트로프: ${tropes.join(', ')}
기존 설정: ${JSON.stringify(existingSettings, null, 2)}

다음을 체계적으로 설계해주세요:

1. 세계관 기초 설정
   - 시대적 배경과 문명 수준
   - 정치 체제와 권력 구조
   - 경제 시스템과 화폐
   - 사회 계층과 신분제

2. 마법/판타지 시스템
   - 마법의 원리와 제약
   - 능력자의 등급과 희귀성
   - 마법과 일반인의 관계
   - 금기시되는 마법이나 능력

3. 지리적 설정
   - 주요 지역과 특징
   - 각 지역의 문화적 차이
   - 중요 장소들의 의미

4. 역사적 배경
   - 중요한 과거 사건들
   - 현재에 미치는 영향
   - 숨겨진 비밀이나 예언

5. 종교와 신화
   - 주요 신앙 체계
   - 신화와 전설
   - 종교가 사회에 미치는 영향

각 설정은 서로 유기적으로 연결되어야 하며, 스토리 전개에 활용할 수 있는 갈등 요소를 포함해주세요.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini 세계관 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 복잡한 플롯 구조 설계 (Gemini의 강점)
   */
  async generateComplexPlotStructure(worldSettings, characters, totalChapters = 75) {
    const prompt = `당신은 복잡한 플롯 구조를 설계하는 전문가입니다.

세계관: ${worldSettings}
주요 인물: ${JSON.stringify(characters, null, 2)}
총 챕터 수: ${totalChapters}

다음을 포함한 치밀한 플롯 구조를 설계해주세요:

1. 메인 플롯 라인
   - 주요 갈등과 해결 과정
   - 각 단계별 전환점
   - 클라이맥스 구성

2. 서브 플롯들
   - 최소 3개의 서브 플롯
   - 메인 플롯과의 연결점
   - 각각의 해결 시점

3. 복선과 회수
   - 초반에 설치할 복선들
   - 중반 반전을 위한 준비
   - 후반 복선 회수 계획

4. 캐릭터 아크
   - 각 주요 인물의 성장 곡선
   - 관계 변화의 전환점
   - 내적 갈등의 해결 과정

5. 챕터별 구성
   - 1-10화: 도입부 구성
   - 11-30화: 갈등 심화
   - 31-50화: 중간 클라이맥스
   - 51-65화: 최종 갈등
   - 66-75화: 해결과 에필로그

각 요소가 논리적으로 연결되고, 독자가 예측하지 못할 반전을 포함해주세요.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini 플롯 설계 실패:', error);
      throw error;
    }
  }

  /**
   * 설정 일관성 검증 (Gemini의 강점)
   */
  async validateConsistency(fullNovelContent, newChapterContent) {
    const prompt = `당신은 소설의 논리적 일관성을 검증하는 전문가입니다.

기존 소설 내용: ${fullNovelContent}
새 챕터 내용: ${newChapterContent}

다음을 검증해주세요:

1. 설정 충돌 확인
   - 세계관 설정과의 일치 여부
   - 캐릭터 설정 일관성
   - 시간대와 장소의 논리성

2. 플롯 일관성
   - 이전 사건들과의 인과관계
   - 복선과의 정합성
   - 캐릭터 행동의 개연성

3. 발견된 문제점
   - 구체적인 모순 지적
   - 수정 제안 사항
   - 주의해야 할 부분

4. 개선 제안
   - 더 나은 전개 방향
   - 놓친 기회들
   - 강화할 수 있는 요소

JSON 형식으로 구조화하여 응답해주세요.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // JSON 파싱 시도
      try {
        return JSON.parse(text);
      } catch {
        // JSON 파싱 실패시 텍스트 그대로 반환
        return { rawText: text };
      }
    } catch (error) {
      console.error('Gemini 일관성 검증 실패:', error);
      throw error;
    }
  }

  /**
   * 챕터 생성 (3500자 이상)
   */
  async generateChapter(options) {
    const {
      title,
      tropes = [],
      chapterNumber = 1,
      previousContext = '',
      characterContext = '',
      plotOutline = '',
      worldSettings = ''
    } = options;

    const prompt = `당신은 로맨스 판타지 전문 작가입니다.

소설 제목: "${title}"
적용 트로프: ${tropes.join(', ')}
챕터 번호: ${chapterNumber}

플롯 개요: ${plotOutline}
이전 챕터 요약: ${previousContext}
캐릭터 설정: ${characterContext}
세계관 설정: ${worldSettings}

🚨 **절대 분량 요구사항**: 정확히 3,500~4,000자 (공백 제외) 작성

📚 **상세 구조 지침**:
1. **장면 구성**: 7개 장면 × 500자 = 3,500자
   - 도입부 (500자): 상황 설정 + 감정 묘사
   - 전개부 5장면 (각 500자): 갈등 발전 + 대화 + 심리
   - 마무리 (500자): 감정 변화 + 다음 화 연결

2. **대화 요구사항**: 
   - 장면당 최소 3회 대화 교환 (총 21회 이상)
   - 대화마다 행동/표정 묘사 필수 (50자 이상)

3. **내적 독백**: 
   - 장면당 최소 2회 심리 묘사 (총 14회 이상)
   - 각 내적 독백 최소 30자 이상

4. **환경/감각 묘사**:
   - 5감 활용한 배경 서술
   - 장면당 최소 100자 환경 묘사

5. **설정 일관성**:
   - 기존 설정과 모순 없이
   - 세계관 설정 자연스럽게 활용

✍️ **작성 전략**:
- 각 문장을 풍부하게 확장
- 감정 변화를 세밀하게 표현
- 긴장감과 로맨틱 요소 균형 유지
- 시간의 흐름과 장소 변화 상세 묘사

🎯 **품질 기준**: 3,500자 이상 + 7장면 + 21회 대화 + 14회 심리묘사

**출력 형식**:
**챕터 제목:** [제목]
**본문:** [3,500자 이상 풍부한 마크다운 스토리]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const fullResponse = response.text();

      // 제목과 본문 분리
      const titleMatch = fullResponse.match(/\*\*챕터 제목:\*\*\s*(.+)/);
      const contentMatch = fullResponse.match(/\*\*본문:\*\*\s*([\s\S]+)/);

      return {
        title: titleMatch ? titleMatch[1].trim() : `${chapterNumber}화`,
        content: contentMatch ? contentMatch[1].trim() : fullResponse
      };
    } catch (error) {
      console.error('Gemini 챕터 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 복잡한 캐릭터 관계도 생성
   */
  async generateCharacterRelationships(characters, worldSettings) {
    const prompt = `복잡한 인물 관계도를 설계해주세요.

등장인물: ${JSON.stringify(characters, null, 2)}
세계관: ${worldSettings}

각 인물 간의:
1. 공식적 관계 (신분, 직책)
2. 실제 관계 (감정, 비밀)
3. 과거의 연결고리
4. 미래의 변화 가능성
5. 갈등 요소

관계의 복잡성과 깊이를 고려하여 흥미로운 다이나믹을 만들어주세요.`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini 관계도 생성 실패:', error);
      throw error;
    }
  }
}

/**
 * Gemini API 헬퍼 함수
 */
export function createGeminiGenerator(config = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found in environment variables');
    return null;
  }
  
  return new GeminiStoryGenerator(apiKey, config);
}