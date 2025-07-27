/**
 * 동적 콘텐츠 생성기 - 100% AI 기반 콘텐츠 생성
 * 모든 정적 요소를 동적 AI 생성으로 전환
 */

import { createHybridGenerator } from './hybrid-ai-generator.js';
import { shouldMockAIService } from './environment.js';

export class DynamicContentGenerator {
  constructor() {
    // AI 생성기 초기화를 지연 로딩으로 변경
    this.aiGenerator = null;
    this.usedNames = new Set(); // 중복 방지를 위한 사용된 이름 추적
    this.usedConcepts = new Set(); // 중복 방지를 위한 스토리 컨셉트 추적
    
    // AI 생성기 초기화 시도 (실패해도 괜찮음)
    try {
      this.aiGenerator = createHybridGenerator();
    } catch (error) {
      console.warn('⚠️ AI 생성기 초기화 실패 (모킹 모드로 진행):', error.message);
      this.aiGenerator = null;
    }
  }

  /**
   * 동적 캐릭터 이름 생성
   * AI가 완전히 새로운 이름을 생성하여 정적 이름 풀 제거
   */
  async generateCharacterNames(genre, worldSetting, concept) {
    if (shouldMockAIService() || !this.aiGenerator) {
      return this.generateMockCharacterNames();
    }

    try {
      const prompt = `로맨스 판타지 소설을 위한 독창적인 캐릭터 이름을 생성해주세요.

장르: ${genre}
세계관: ${worldSetting}
스토리 컨셉트: ${concept}

요구사항:
1. 여주인공과 남주인공 이름 각각 1개씩
2. 해당 세계관에 어울리는 이름
3. 발음하기 쉽고 기억하기 쉬운 이름
4. 기존 유명 작품과 겹치지 않는 독창적인 이름
5. 캐릭터의 성격이나 운명을 암시하는 의미 포함

JSON 형식으로 응답:
{
  "female": {
    "name": "이름",
    "meaning": "이름의 의미나 어원",
    "personality_hint": "이름이 암시하는 성격"
  },
  "male": {
    "name": "이름", 
    "meaning": "이름의 의미나 어원",
    "personality_hint": "이름이 암시하는 성격"
  }
}`;

      const response = await this.aiGenerator.generateContent({
        prompt,
        maxTokens: 1000,
        temperature: 0.9 // 창의성 높임
      });

      const result = this.parseJSONResponse(response.content);
      if (result && result.female && result.male) {
        // 중복 체크 및 추가
        const femaleKey = `${result.female.name}_female`;
        const maleKey = `${result.male.name}_male`;
        
        if (this.usedNames.has(femaleKey) || this.usedNames.has(maleKey)) {
          console.log('🔄 중복된 이름 감지, 재생성...');
          return await this.generateCharacterNames(genre, worldSetting, concept);
        }
        
        this.usedNames.add(femaleKey);
        this.usedNames.add(maleKey);
        
        return result;
      }
    } catch (error) {
      console.error('❌ 동적 캐릭터 이름 생성 실패:', error.message);
      console.error('🔧 디버그 정보:', {
        hasAIGenerator: !!this.aiGenerator,
        aiGeneratorType: this.aiGenerator?.constructor?.name,
        shouldMock: shouldMockAIService(),
        errorType: error.constructor.name
      });
    }

    // 폴백: 기본 생성
    return this.generateMockCharacterNames();
  }

  /**
   * 동적 세계관 설정 생성
   * AI가 완전히 새로운 세계관을 창조
   */
  async generateWorldSetting(baseGenre) {
    if (shouldMockAIService() || !this.aiGenerator) {
      return this.generateMockWorldSetting(baseGenre);
    }

    try {
      const prompt = `"${baseGenre}" 장르를 기반으로 독창적인 판타지 세계관을 창조해주세요.

요구사항:
1. 기존 작품과 차별화되는 독특한 설정
2. 로맨스가 자연스럽게 발생할 수 있는 환경
3. 갈등과 긴장감을 만들어내는 사회/정치 구조
4. 마법이나 초자연적 요소의 체계적 설명
5. 독자가 몰입할 수 있는 생생한 묘사

JSON 형식으로 응답:
{
  "world_name": "세계 이름",
  "setting_description": "세계관 상세 설명 (300자 이내)",
  "magic_system": "마법 시스템 설명",
  "social_structure": "사회 구조 및 계급",
  "key_locations": ["주요 장소1", "주요 장소2", "주요 장소3"],
  "unique_elements": ["독특한 요소1", "독특한 요소2"],
  "romance_catalyst": "로맨스 발생 요인"
}`;

      const response = await this.aiGenerator.generateContent({
        prompt,
        maxTokens: 2000,
        temperature: 0.8
      });

      const result = this.parseJSONResponse(response.content);
      if (result && result.world_name) {
        return result;
      }
    } catch (error) {
      console.error('❌ 동적 세계관 생성 실패:', error.message);
      console.error('🔧 디버그 정보:', {
        hasAIGenerator: !!this.aiGenerator,
        aiGeneratorType: this.aiGenerator?.constructor?.name,
        shouldMock: shouldMockAIService(),
        errorType: error.constructor.name
      });
    }

    return this.generateMockWorldSetting(baseGenre);
  }

  /**
   * 동적 트로프 조합 생성
   * AI가 독창적인 트로프 조합을 생성
   */
  async generateTropeCombination(existingNovels = []) {
    if (shouldMockAIService() || !this.aiGenerator) {
      return this.generateMockTropeCombination();
    }

    try {
      const usedTropes = existingNovels.map(n => n.tropes).flat();
      const tropesContext = usedTropes.length > 0 
        ? `기존 사용된 트로프들 (피해야 할 조합): ${usedTropes.join(', ')}`
        : '첫 번째 작품입니다.';

      const prompt = `로맨스 판타지를 위한 독창적인 트로프 조합을 생성해주세요.

${tropesContext}

요구사항:
1. 주트로프 1개 + 보조트로프 2개 조합
2. 기존 조합과 차별화되는 독특함
3. 로맨스와 판타지 요소의 완벽한 융합
4. 독자가 흥미를 느낄 수 있는 신선함
5. 스토리 전개에 자연스러운 갈등 요소 포함

JSON 형식으로 응답:
{
  "main_trope": "주요 트로프",
  "sub_tropes": ["보조트로프1", "보조트로프2"],
  "conflict_driver": "주요 갈등 요소",
  "romance_tension": "로맨틱 긴장감 요소",
  "unique_twist": "독창적 반전 요소",
  "combination_description": "트로프 조합 설명"
}`;

      const response = await this.aiGenerator.generateContent({
        prompt,
        maxTokens: 1500,
        temperature: 0.9
      });

      const result = this.parseJSONResponse(response.content);
      if (result && result.main_trope) {
        const conceptKey = `${result.main_trope}_${result.sub_tropes?.join('_')}`;
        
        if (this.usedConcepts.has(conceptKey)) {
          console.log('🔄 중복된 트로프 조합 감지, 재생성...');
          return await this.generateTropeCombination(existingNovels);
        }
        
        this.usedConcepts.add(conceptKey);
        return result;
      }
    } catch (error) {
      console.error('❌ 동적 트로프 생성 실패:', error.message);
      console.error('🔧 디버그 정보:', {
        hasAIGenerator: !!this.aiGenerator,
        aiGeneratorType: this.aiGenerator?.constructor?.name,
        shouldMock: shouldMockAIService(),
        errorType: error.constructor.name
      });
    }

    return this.generateMockTropeCombination();
  }

  /**
   * 동적 플롯 구조 생성
   * AI가 스토리 전체 구조를 동적으로 설계
   */
  async generatePlotStructure(characters, worldSetting, tropes) {
    if (shouldMockAIService() || !this.aiGenerator) {
      return this.generateMockPlotStructure();
    }

    try {
      const prompt = `다음 요소들을 기반으로 로맨스 판타지 소설의 플롯 구조를 설계해주세요.

캐릭터:
- 여주: ${characters.female.name} (${characters.female.personality_hint})
- 남주: ${characters.male.name} (${characters.male.personality_hint})

세계관: ${worldSetting.setting_description}
주요 트로프: ${tropes.main_trope}
보조 트로프: ${tropes.sub_tropes.join(', ')}

플롯을 4단계로 구성해주세요:
1. 도입부 (1-15화): 세계관 소개, 캐릭터 등장, 첫 만남
2. 전개부 (16-45화): 갈등 심화, 관계 발전, 서브플롯
3. 절정부 (46-60화): 최대 위기, 감정적 클라이막스
4. 결말부 (61-75화): 갈등 해결, 로맨스 완성, 에필로그

JSON 형식으로 응답:
{
  "introduction": {
    "chapters": "1-15",
    "key_events": ["주요 사건1", "주요 사건2", "주요 사건3"],
    "relationship_stage": "관계 단계",
    "world_building_focus": "세계관 구축 중점"
  },
  "development": {
    "chapters": "16-45", 
    "key_events": ["주요 사건1", "주요 사건2", "주요 사건3"],
    "relationship_stage": "관계 단계",
    "conflict_escalation": "갈등 확대 방향"
  },
  "climax": {
    "chapters": "46-60",
    "key_events": ["주요 사건1", "주요 사건2"],
    "relationship_stage": "관계 단계", 
    "major_crisis": "주요 위기 상황"
  },
  "resolution": {
    "chapters": "61-75",
    "key_events": ["주요 사건1", "주요 사건2"],
    "relationship_stage": "관계 단계",
    "ending_type": "결말 유형"
  }
}`;

      const response = await this.aiGenerator.generateContent({
        prompt,
        maxTokens: 2500,
        temperature: 0.7
      });

      return this.parseJSONResponse(response.content);
    } catch (error) {
      console.error('❌ 동적 플롯 구조 생성 실패:', error.message);
      console.error('🔧 디버그 정보:', {
        hasAIGenerator: !!this.aiGenerator,
        aiGeneratorType: this.aiGenerator?.constructor?.name,
        shouldMock: shouldMockAIService(),
        errorType: error.constructor.name
      });
      return this.generateMockPlotStructure();
    }
  }

  /**
   * 동적 소설 메타데이터 생성
   */
  async generateNovelMetadata(characters, worldSetting, tropes, plotStructure) {
    if (shouldMockAIService() || !this.aiGenerator) {
      return this.generateMockMetadata(characters);
    }

    try {
      const prompt = `다음 요소들을 기반으로 매력적인 소설 제목과 요약을 생성해주세요.

캐릭터: ${characters.female.name}(여주), ${characters.male.name}(남주)
세계관: ${worldSetting.world_name} - ${worldSetting.setting_description}
트로프: ${tropes.main_trope}, ${tropes.sub_tropes.join(', ')}

요구사항:
1. 독자의 관심을 끄는 매력적인 제목
2. 스포일러 없이 흥미를 유발하는 요약
3. 검색 친화적이고 기억하기 쉬운 제목
4. 장르의 특성을 잘 드러내는 요약

JSON 형식으로 응답:
{
  "title": "소설 제목",
  "alternative_titles": ["대안 제목1", "대안 제목2"],
  "summary": "소설 요약 (200자 이내)",
  "hook": "독자를 끌어들이는 한 줄 소개",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "target_audience": "주요 독자층"
}`;

      const response = await this.aiGenerator.generateContent({
        prompt,
        maxTokens: 1500,
        temperature: 0.8
      });

      return this.parseJSONResponse(response.content);
    } catch (error) {
      console.error('❌ 동적 메타데이터 생성 실패:', error.message);
      console.error('🔧 디버그 정보:', {
        hasAIGenerator: !!this.aiGenerator,
        aiGeneratorType: this.aiGenerator?.constructor?.name,
        shouldMock: shouldMockAIService(),
        errorType: error.constructor.name
      });
      return this.generateMockMetadata(characters);
    }
  }

  /**
   * 동적 챕터 제목 생성
   */
  async generateChapterTitle(chapterNumber, plotStage, previousEvents, upcomingEvents) {
    if (shouldMockAIService() || !this.aiGenerator) {
      return `${chapterNumber}화`;
    }

    try {
      const prompt = `${chapterNumber}화의 매력적인 제목을 생성해주세요.

현재 단계: ${plotStage}
이전 사건들: ${previousEvents}
예정된 사건들: ${upcomingEvents}

요구사항:
1. 스포일러 없이 호기심 유발
2. 감정적 임팩트가 있는 제목
3. 15자 이내의 간결함
4. 다음 화가 궁금해지는 요소

단순히 제목만 반환해주세요:`;

      const response = await this.aiGenerator.generateContent({
        prompt,
        maxTokens: 200,
        temperature: 0.8
      });

      const title = response.content.trim().replace(/["""]/g, '');
      return title || `${chapterNumber}화`;
    } catch (error) {
      console.error('❌ 동적 챕터 제목 생성 실패:', error.message);
      console.error('🔧 디버그 정보:', {
        hasAIGenerator: !!this.aiGenerator,
        aiGeneratorType: this.aiGenerator?.constructor?.name,
        shouldMock: shouldMockAIService(),
        errorType: error.constructor.name
      });
      return `${chapterNumber}화`;
    }
  }

  // ========== 유틸리티 메서드 ==========

  parseJSONResponse(content) {
    try {
      // JSON 블록 추출
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      // 직접 JSON 파싱 시도
      return JSON.parse(content);
    } catch (error) {
      console.warn('JSON 파싱 실패:', error.message);
      return null;
    }
  }

  // ========== Mock 메서드들 (테스트/개발용) ==========

  generateMockCharacterNames() {
    const femaleNames = ['세라핀', '엘리시아', '아델린', '이사벨라', '비비안'];
    const maleNames = ['다미안', '세바스찬', '알렉산더', '라파엘', '아드리안'];
    
    const female = femaleNames[Math.floor(Math.random() * femaleNames.length)];
    const male = maleNames[Math.floor(Math.random() * maleNames.length)];
    
    return {
      female: {
        name: female,
        meaning: '아름다운 의미',
        personality_hint: '강인하고 지혜로운'
      },
      male: {
        name: male,
        meaning: '강력한 의미',
        personality_hint: '신비롭고 카리스마 있는'
      }
    };
  }

  generateMockWorldSetting(genre) {
    return {
      world_name: '아르케인 왕국',
      setting_description: '마법과 과학이 공존하는 환상적인 세계',
      magic_system: '엘레멘탈 마법 시스템',
      social_structure: '왕정제와 마법사 길드',
      key_locations: ['왕궁', '마법 아카데미', '고대 유적'],
      unique_elements: ['마법 계약', '엘레멘탈 정령'],
      romance_catalyst: '운명적 마법 계약'
    };
  }

  generateMockTropeCombination() {
    return {
      main_trope: 'enemies-to-lovers',
      sub_tropes: ['magical-bond', 'hidden-identity'],
      conflict_driver: '고대의 저주',
      romance_tension: '마법적 연결',
      unique_twist: '기억 교환',
      combination_description: '적대적 관계에서 시작되는 운명적 사랑'
    };
  }

  generateMockPlotStructure() {
    return {
      introduction: {
        chapters: '1-15',
        key_events: ['첫 만남', '갈등 시작', '세계관 탐험'],
        relationship_stage: '적대적 관계',
        world_building_focus: '마법 시스템 소개'
      },
      development: {
        chapters: '16-45',
        key_events: ['협력 시작', '감정 변화', '위험 증가'],
        relationship_stage: '복잡한 감정',
        conflict_escalation: '외부 위협 증가'
      },
      climax: {
        chapters: '46-60',
        key_events: ['최대 위기', '진실 폭로'],
        relationship_stage: '사랑 인정',
        major_crisis: '세계의 위기'
      },
      resolution: {
        chapters: '61-75',
        key_events: ['갈등 해결', '해피엔딩'],
        relationship_stage: '완전한 사랑',
        ending_type: '해피엔딩'
      }
    };
  }

  generateMockMetadata(characters) {
    return {
      title: '운명의 마법사',
      alternative_titles: ['마법의 인연', '별빛 계약'],
      summary: '적이었던 두 마법사가 운명적 사랑에 빠지는 이야기',
      hook: '적인가, 연인인가? 마법이 만든 운명적 사랑',
      keywords: ['마법', '로맨스', '판타지'],
      target_audience: '로맨스 판타지 독자'
    };
  }
}