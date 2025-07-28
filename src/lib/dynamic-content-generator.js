/**
 * 동적 콘텐츠 생성기 - 100% AI 기반 콘텐츠 생성
 * 모든 정적 요소를 동적 AI 생성으로 전환
 */

import { createUnifiedGenerator } from './ai-unified-generator.js';
import { shouldMockAIService } from './environment.js';

export class DynamicContentGenerator {
  constructor() {
    // AI 생성기 초기화를 지연 로딩으로 변경
    this.aiGenerator = null;
    this.usedNames = new Set(); // 중복 방지를 위한 사용된 이름 추적
    this.usedConcepts = new Set(); // 중복 방지를 위한 스토리 컨셉트 추적

    // 기존 소설에서 사용된 이름 로드
    this.loadExistingNames();

    // AI 생성기 초기화 시도 (실패해도 괜찮음)
    try {
      this.aiGenerator = createUnifiedGenerator();
    } catch (error) {
      console.warn('⚠️ AI 생성기 초기화 실패 (모킹 모드로 진행):', error.message);
      this.aiGenerator = null;
    }
  }

  /**
   * 기존 소설에서 사용된 캐릭터 이름 로드
   */
  async loadExistingNames() {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const novelsDir = path.join(process.cwd(), 'src/content/novels');

      const files = await fs.readdir(novelsDir).catch(() => []);

      for (const file of files) {
        if (file.endsWith('.md')) {
          try {
            const content = await fs.readFile(path.join(novelsDir, file), 'utf-8');
            const characterNamesMatch = content.match(/characterNames:\s*\[(.*?)\]/);

            if (characterNamesMatch) {
              const names = characterNamesMatch[1]
                .replace(/"/g, '')
                .split(',')
                .map(n => n.trim());

              if (names.length >= 2) {
                this.usedNames.add(`${names[0]}_female`);
                this.usedNames.add(`${names[1]}_male`);
              }
            }
          } catch {
            // 개별 파일 읽기 실패는 무시
          }
        }
      }

      console.log(`📚 기존 캐릭터 이름 ${this.usedNames.size}개 로드됨`);
    } catch {
      // 초기화 시점에는 파일 시스템 접근이 불가능할 수 있음
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
        temperature: 0.9, // 창의성 높임
      });

      const result = this.parseJSONResponse(response.content);
      if (result && result.female && result.male) {
        // 중복 체크 및 추가
        const femaleKey = `${result.female.name}_female`;
        const maleKey = `${result.male.name}_male`;

        // 정확한 중복 체크
        if (this.usedNames.has(femaleKey) || this.usedNames.has(maleKey)) {
          console.log(`🔄 중복된 이름 감지: ${result.female.name}, ${result.male.name}`);
          console.log(`📋 현재 사용중인 이름: ${Array.from(this.usedNames).join(', ')}`);

          // 재시도 횟수 제한
          const retryCount = this._nameRetryCount || 0;
          if (retryCount >= 5) {
            console.warn('⚠️ 이름 생성 재시도 한계 도달, 변형 이름 사용');
            result.female.name = `${result.female.name}${Math.floor(Math.random() * 100)}`;
            result.male.name = `${result.male.name}${Math.floor(Math.random() * 100)}`;
          } else {
            this._nameRetryCount = retryCount + 1;
            return await this.generateCharacterNames(genre, worldSetting, concept);
          }
        }

        // 유사 이름 체크 (편집 거리)
        const similarFemaleNames = this.findSimilarNames(result.female.name, 'female');
        const similarMaleNames = this.findSimilarNames(result.male.name, 'male');

        if (similarFemaleNames.length > 0 || similarMaleNames.length > 0) {
          console.log(`⚠️ 유사한 이름 발견:`);
          if (similarFemaleNames.length > 0)
            console.log(`  여주: ${result.female.name} ≈ ${similarFemaleNames.join(', ')}`);
          if (similarMaleNames.length > 0)
            console.log(`  남주: ${result.male.name} ≈ ${similarMaleNames.join(', ')}`);

          // 프롬프트에 기존 이름 정보 추가하여 재생성
          const existingNamesInfo = `\n\n기존 사용된 이름들 (피해주세요): ${this.getExistingNamesList()}`;
          return await this.generateCharacterNamesWithExclusion(
            genre,
            worldSetting,
            concept,
            existingNamesInfo
          );
        }

        this._nameRetryCount = 0; // 성공시 리셋
        this.usedNames.add(femaleKey);
        this.usedNames.add(maleKey);

        console.log(
          `✅ 새로운 캐릭터 이름 생성: ${result.female.name}(여), ${result.male.name}(남)`
        );

        return result;
      }
    } catch (error) {
      console.error('❌ 동적 캐릭터 이름 생성 실패:', error.message);
      console.error('🔧 디버그 정보:', {
        hasAIGenerator: !!this.aiGenerator,
        aiGeneratorType: this.aiGenerator?.constructor?.name,
        shouldMock: shouldMockAIService(),
        errorType: error.constructor.name,
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
        temperature: 0.8,
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
        errorType: error.constructor.name,
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
      const tropesContext =
        usedTropes.length > 0
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
        temperature: 0.9,
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
        errorType: error.constructor.name,
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
        temperature: 0.7,
      });

      return this.parseJSONResponse(response.content);
    } catch (error) {
      console.error('❌ 동적 플롯 구조 생성 실패:', error.message);
      console.error('🔧 디버그 정보:', {
        hasAIGenerator: !!this.aiGenerator,
        aiGeneratorType: this.aiGenerator?.constructor?.name,
        shouldMock: shouldMockAIService(),
        errorType: error.constructor.name,
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
        temperature: 0.8,
      });

      return this.parseJSONResponse(response.content);
    } catch (error) {
      console.error('❌ 동적 메타데이터 생성 실패:', error.message);
      console.error('🔧 디버그 정보:', {
        hasAIGenerator: !!this.aiGenerator,
        aiGeneratorType: this.aiGenerator?.constructor?.name,
        shouldMock: shouldMockAIService(),
        errorType: error.constructor.name,
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
        temperature: 0.8,
      });

      const title = response.content.trim().replace(/["""]/g, '');
      return title || `${chapterNumber}화`;
    } catch (error) {
      console.error('❌ 동적 챕터 제목 생성 실패:', error.message);
      console.error('🔧 디버그 정보:', {
        hasAIGenerator: !!this.aiGenerator,
        aiGeneratorType: this.aiGenerator?.constructor?.name,
        shouldMock: shouldMockAIService(),
        errorType: error.constructor.name,
      });
      return `${chapterNumber}화`;
    }
  }

  /**
   * 유사한 이름 찾기 (레벤슈타인 거리 사용)
   */
  findSimilarNames(newName, gender) {
    const similarNames = [];
    const threshold = 2; // 최대 2글자 차이까지 유사하다고 판단

    for (const key of this.usedNames) {
      if (key.endsWith(`_${gender}`)) {
        const existingName = key.replace(`_${gender}`, '');
        const distance = this.levenshteinDistance(newName, existingName);

        if (distance <= threshold && distance > 0) {
          similarNames.push(existingName);
        }
      }
    }

    return similarNames;
  }

  /**
   * 레벤슈타인 거리 계산
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 기존 이름 목록 가져오기
   */
  getExistingNamesList() {
    const femaleNames = [];
    const maleNames = [];

    for (const key of this.usedNames) {
      if (key.endsWith('_female')) {
        femaleNames.push(key.replace('_female', ''));
      } else if (key.endsWith('_male')) {
        maleNames.push(key.replace('_male', ''));
      }
    }

    return `여주: ${femaleNames.join(', ') || '없음'}, 남주: ${maleNames.join(', ') || '없음'}`;
  }

  /**
   * 기존 이름 제외하고 생성
   */
  async generateCharacterNamesWithExclusion(genre, worldSetting, concept, exclusionInfo) {
    if (shouldMockAIService() || !this.aiGenerator) {
      return this.generateMockCharacterNames();
    }

    const enhancedPrompt = `로맨스 판타지 소설을 위한 독창적인 캐릭터 이름을 생성해주세요.

장르: ${genre}
세계관: ${worldSetting}
스토리 컨셉트: ${concept}

요구사항:
1. 여주인공과 남주인공 이름 각각 1개씩
2. 해당 세계관에 어울리는 이름
3. 발음하기 쉽고 기억하기 쉬운 이름
4. 기존 유명 작품과 겹치지 않는 독창적인 이름
5. 캐릭터의 성격이나 운명을 암시하는 의미 포함

${exclusionInfo}

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
      prompt: enhancedPrompt,
      maxTokens: 1000,
      temperature: 0.95, // 더 높은 창의성
    });

    return this.parseJSONResponse(response.content);
  }

  // ========== 유틸리티 메서드 ==========

  parseJSONResponse(content) {
    try {
      // JSON 블록 추출
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);

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

  async generateMockCharacterNames() {
    console.log('🎲 100% 동적 캐릭터 이름 생성 (Mock 모드)...');

    // 완전 동적 생성을 위한 seed 요소들
    const prefixes = ['아', '엘', '세', '이', '비', '다', '라', '알'];
    const middles = ['리', '라', '미', '델', '사', '렉', '파', '드'];
    const suffixes = ['핀', '시아', '린', '벨라', '안', '엘', '리안', '스'];

    // 동적 조합으로 고유한 이름 생성
    const generateUniqueName = gender => {
      const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
      const mid = middles[Math.floor(Math.random() * middles.length)];
      const suf = suffixes[Math.floor(Math.random() * suffixes.length)];

      // 성별에 따른 음향 조정
      if (gender === 'female') {
        return pre + mid + (suf.endsWith('아') || suf.endsWith('라') ? suf : suf + '아');
      } else {
        return pre + mid + (suf.endsWith('안') || suf.endsWith('엘') ? suf : suf + '안');
      }
    };

    // 동적 의미 생성
    const meanings = {
      female: ['빛나는 별', '새벽의 여신', '고귀한 영혼', '달의 수호자', '영원한 사랑'],
      male: ['태양의 전사', '운명의 인도자', '불멸의 수호자', '별의 왕자', '시간의 지배자'],
    };

    const personalities = {
      female: ['강인하면서도 따뜻한', '지혜롭고 우아한', '용감하고 자비로운', '신비롭고 매혹적인'],
      male: ['카리스마 넘치는', '냉철하지만 따뜻한', '강력하고 정의로운', '신비로우면서 매력적인'],
    };

    const femaleName = generateUniqueName('female');
    const maleName = generateUniqueName('male');

    // 중복 체크 (기존 usedNames와 비교)
    let finalFemaleName = femaleName;
    let finalMaleName = maleName;
    let attempts = 0;

    while (
      (this.usedNames.has(`${finalFemaleName}_female`) ||
        this.usedNames.has(`${finalMaleName}_male`)) &&
      attempts < 10
    ) {
      finalFemaleName = generateUniqueName('female');
      finalMaleName = generateUniqueName('male');
      attempts++;
    }

    // 날짜/시간 기반 변형으로 완전한 고유성 보장
    if (attempts >= 10) {
      const timestamp = Date.now().toString().slice(-3);
      finalFemaleName += timestamp;
      finalMaleName += timestamp;
    }

    const result = {
      female: {
        name: finalFemaleName,
        meaning: meanings.female[Math.floor(Math.random() * meanings.female.length)],
        personality_hint:
          personalities.female[Math.floor(Math.random() * personalities.female.length)],
      },
      male: {
        name: finalMaleName,
        meaning: meanings.male[Math.floor(Math.random() * meanings.male.length)],
        personality_hint: personalities.male[Math.floor(Math.random() * personalities.male.length)],
      },
    };

    // 생성된 이름 등록
    this.usedNames.add(`${finalFemaleName}_female`);
    this.usedNames.add(`${finalMaleName}_male`);

    console.log(`✅ 동적 생성 완료: ${finalFemaleName}(여), ${finalMaleName}(남)`);
    return result;
  }

  async generateMockWorldSetting(genre) {
    console.log(`🌍 100% 동적 세계관 생성 (Mock 모드): ${genre}...`);

    // 동적 세계 이름 생성 시스템
    const worldPrefixes = ['아르', '엘드', '바엘', '카이', '루나', '아스트', '베이', '솔'];
    const worldSuffixes = ['리아', '가르드', '텔라', '로스', '미라', '리온', '토르', '덴'];
    const worldTypes = ['왕국', '제국', '공화국', '연방', '성역', '대륙', '차원', '세계'];

    const worldName =
      worldPrefixes[Math.floor(Math.random() * worldPrefixes.length)] +
      worldSuffixes[Math.floor(Math.random() * worldSuffixes.length)] +
      ' ' +
      worldTypes[Math.floor(Math.random() * worldTypes.length)];

    // 동적 설정 요소들
    const magicSystems = {
      base: ['엘레멘탈', '루닉', '크리스탈', '정령', '별자리', '생명력', '영혼', '시공간'],
      type: ['마법', '술법', '능력', '힘', '시스템', '기술', '예술', '과학'],
    };

    const socialStructures = [
      '마법사 의회와 기사단',
      '왕정제와 마법사 길드',
      '귀족 연합과 상인 조합',
      '신전 세력과 마법 학원',
      '용족 계약자들의 연맹',
      '고대 혈족들의 협의체',
    ];

    const locationSets = [
      ['왕궁', '마법 아카데미', '고대 유적', '용의 골짜기'],
      ['성도', '마법사 탑', '비밀 도서관', '차원 관문'],
      ['천공 도시', '지하 신전', '크리스탈 광산', '영혼의 숲'],
      ['시간의 신전', '별빛 정원', '마법 연구소', '고대 전장터'],
    ];

    const uniqueElementSets = [
      ['마법 계약', '엘레멘탈 정령', '고대 룬문자'],
      ['시공간 균열', '드래곤 혈약', '별의 축복'],
      ['생명의 나무', '마나 크리스탈', '영혼 공명'],
      ['운명의 실', '마법 문양', '차원 이동술'],
    ];

    const romanceCatalysts = [
      '운명적 마법 계약',
      '고대 예언의 인연',
      '별자리 운명 공명',
      '마법적 영혼 결속',
      '운명의 실 얽힘',
      '드래곤 혈약 공유',
    ];

    // 장르 기반 조정
    const genreModifiers = {
      회귀: {
        timeElement: '시간 조작 마법',
        uniqueAdd: '시간 되돌리기',
      },
      빙의: {
        possessionElement: '영혼 전이 마법',
        uniqueAdd: '의식 교환',
      },
      환생: {
        rebirthElement: '영혼 환생 시스템',
        uniqueAdd: '전생 기억',
      },
    };

    // 랜덤 선택
    const selectedMagicBase =
      magicSystems.base[Math.floor(Math.random() * magicSystems.base.length)];
    const selectedMagicType =
      magicSystems.type[Math.floor(Math.random() * magicSystems.type.length)];
    const magicSystem = `${selectedMagicBase} ${selectedMagicType} 시스템`;

    const socialStructure = socialStructures[Math.floor(Math.random() * socialStructures.length)];
    const keyLocations = locationSets[Math.floor(Math.random() * locationSets.length)];
    const uniqueElements = [
      ...uniqueElementSets[Math.floor(Math.random() * uniqueElementSets.length)],
    ];
    const romanceCatalyst = romanceCatalysts[Math.floor(Math.random() * romanceCatalysts.length)];

    // 장르별 특수 요소 추가
    if (genre && genreModifiers[genre]) {
      const modifier = genreModifiers[genre];
      if (modifier.timeElement && genre === '회귀') {
        uniqueElements.push(modifier.uniqueAdd);
      } else if (modifier.possessionElement && genre === '빙의') {
        uniqueElements.push(modifier.uniqueAdd);
      } else if (modifier.rebirthElement && genre === '환생') {
        uniqueElements.push(modifier.uniqueAdd);
      }
    }

    // 설정 설명 동적 생성
    const settingDescriptions = [
      `마법과 과학이 조화롭게 공존하는 신비로운 세계`,
      `고대 마법 문명의 유산이 살아 숨쉬는 환상적인 대륙`,
      `용족과 인간이 공존하며 마법이 일상인 신비한 왕국`,
      `별의 힘을 다루는 마법사들이 지배하는 경이로운 세계`,
      `시간과 공간을 넘나드는 마법이 존재하는 무한한 차원`,
    ];

    const settingDescription =
      settingDescriptions[Math.floor(Math.random() * settingDescriptions.length)];

    const result = {
      world_name: worldName,
      setting_description: settingDescription,
      magic_system: magicSystem,
      social_structure: socialStructure,
      key_locations: keyLocations,
      unique_elements: uniqueElements,
      romance_catalyst: romanceCatalyst,
    };

    console.log(`✅ 동적 세계관 생성 완료: ${worldName}`);
    console.log(`   📍 마법 시스템: ${magicSystem}`);
    console.log(`   💕 로맨스 촉매: ${romanceCatalyst}`);

    return result;
  }

  async generateMockTropeCombination() {
    console.log('🎭 100% 동적 트로프 조합 생성 (Mock 모드)...');

    // 동적 트로프 요소들
    const mainTropes = [
      'enemies-to-lovers',
      'forced-proximity',
      'fake-relationship',
      'second-chance-romance',
      'forbidden-love',
      'love-triangle',
      'time-travel-romance',
      'supernatural-bond',
      'arranged-marriage',
      'bodyguard-romance',
    ];

    const subTropeCategories = {
      magical: [
        'magical-bond',
        'soul-mate-mark',
        'power-sharing',
        'curse-breaking',
        'prophecy-lovers',
      ],
      identity: [
        'hidden-identity',
        'secret-royalty',
        'memory-loss',
        'dual-personality',
        'disguised-gender',
      ],
      conflict: [
        'rival-families',
        'class-difference',
        'political-enemies',
        'competing-goals',
        'moral-conflict',
      ],
      supernatural: ['vampire-human', 'fae-mortal', 'demon-angel', 'werewolf-pack', 'dragon-rider'],
    };

    const conflictDrivers = [
      '고대의 저주',
      '운명의 예언',
      '정치적 음모',
      '마족의 침입',
      '금지된 마법',
      '왕위 계승 전쟁',
      '차원의 균열',
      '신들의 게임',
      '시간의 역설',
      '영혼의 계약',
    ];

    const romanceTensions = [
      '마법적 연결',
      '운명적 끌림',
      '금지된 감정',
      '위험한 유혹',
      '숙명적 대립',
      '비밀스러운 매력',
      '복수와 사랑',
      '힘의 균형',
      '시간을 초월한 사랑',
      '영혼의 공명',
    ];

    const uniqueTwists = [
      '기억 교환',
      '감정 공유',
      '시간 역행',
      '영혼 바뀜',
      '운명 바꾸기',
      '마법 반전',
      '정체성 혼재',
      '능력 전이',
      '차원 이동',
      '예언 뒤틀림',
    ];

    // 랜덤 선택
    const mainTrope = mainTropes[Math.floor(Math.random() * mainTropes.length)];

    // 서브 트로프는 2개 카테고리에서 하나씩
    const categories = Object.keys(subTropeCategories);
    const selectedCategories = [];
    while (selectedCategories.length < 2) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      if (!selectedCategories.includes(category)) {
        selectedCategories.push(category);
      }
    }

    const subTropes = selectedCategories.map(category => {
      const options = subTropeCategories[category];
      return options[Math.floor(Math.random() * options.length)];
    });

    const conflictDriver = conflictDrivers[Math.floor(Math.random() * conflictDrivers.length)];
    const romanceTension = romanceTensions[Math.floor(Math.random() * romanceTensions.length)];
    const uniqueTwist = uniqueTwists[Math.floor(Math.random() * uniqueTwists.length)];

    // 조합 설명 동적 생성
    const mainTropeDescriptions = {
      'enemies-to-lovers': '적대적 관계에서 시작되는 운명적 사랑',
      'forced-proximity': '어쩔 수 없이 가까워진 두 사람의 로맨스',
      'fake-relationship': '가짜 연인에서 진짜 사랑으로',
      'second-chance-romance': '다시 만난 첫사랑과의 재회',
      'forbidden-love': '금지된 사랑을 향한 위험한 도전',
      'love-triangle': '복잡한 삼각관계 속 진정한 사랑',
      'time-travel-romance': '시공을 초월한 운명적 만남',
      'supernatural-bond': '초자연적 힘으로 연결된 두 영혼',
      'arranged-marriage': '정략결혼에서 피어나는 진실한 사랑',
      'bodyguard-romance': '보호자와 피보호자 사이의 금기된 감정',
    };

    const combinationDescription = mainTropeDescriptions[mainTrope] || '독특한 로맨스 조합';

    const result = {
      main_trope: mainTrope,
      sub_tropes: subTropes,
      conflict_driver: conflictDriver,
      romance_tension: romanceTension,
      unique_twist: uniqueTwist,
      combination_description: combinationDescription,
    };

    console.log(`✅ 동적 트로프 조합 생성 완료:`);
    console.log(`   🎯 주 트로프: ${mainTrope}`);
    console.log(`   🔗 보조 트로프: ${subTropes.join(', ')}`);
    console.log(`   ⚡ 갈등 요소: ${conflictDriver}`);
    console.log(`   💫 반전 요소: ${uniqueTwist}`);

    return result;
  }

  async generateMockPlotStructure() {
    console.log('📖 100% 동적 플롯 구조 생성 (Mock 모드)...');

    // 동적 주요 사건 풀
    const eventCategories = {
      introduction: {
        meetings: ['운명적 첫 만남', '우연한 조우', '충격적 재회', '적대적 첫 조우', '마법적 만남'],
        conflicts: ['신분 차이 발각', '오해와 편견', '경쟁 관계', '가문 갈등', '정치적 대립'],
        worldBuilding: [
          '마법 시스템 탐험',
          '세계관 비밀',
          '고대 유적 발견',
          '예언 발견',
          '숨겨진 진실',
        ],
      },
      development: {
        cooperation: ['어쩔 수 없는 협력', '공동의 적', '비밀 동맹', '임시 휴전', '목표 일치'],
        emotion: ['미묘한 감정 변화', '질투와 혼란', '보호 본능', '신뢰 형성', '내적 갈등'],
        danger: ['외부 위협 증가', '음모 발각', '배신자 등장', '위험한 미션', '능력 각성'],
      },
      climax: {
        crisis: ['최대 위기 순간', '생사의 갈림길', '선택의 순간', '희생의 결단', '운명의 대결'],
        revelation: ['숨겨진 진실 폭로', '정체성 공개', '배신자 정체', '예언 성취', '과거 비밀'],
      },
      resolution: {
        resolution: ['갈등의 완전 해결', '화해와 용서', '진실의 승리', '평화 회복', '새로운 질서'],
        romance: ['사랑 고백', '결합 의식', '영원한 약속', '운명 수용', '해피엔딩'],
      },
    };

    // 관계 단계 진행
    const relationshipStages = {
      introduction: ['적대적 관계', '냉담한 관계', '경계하는 사이', '서먹한 관계', '호기심 단계'],
      development: ['복잡한 감정', '혼란스러운 마음', '은밀한 끌림', '서로를 의식', '미묘한 긴장'],
      climax: ['사랑 인정', '감정 폭발', '마음 확인', '운명 받아들임', '진실한 고백'],
      resolution: ['완전한 사랑', '영원한 결속', '운명적 결합', '완벽한 조화', '행복한 결말'],
    };

    // 세계관 구축 초점
    const worldBuildingFocus = [
      '마법 시스템 소개',
      '정치 구조 설명',
      '고대 역사 탐험',
      '종족 관계 정립',
      '예언과 운명',
      '차원과 공간',
      '신화와 전설',
    ];

    // 갈등 확대 방향
    const conflictEscalations = [
      '외부 위협 증가',
      '내부 배신 발각',
      '정치적 음모 심화',
      '마법적 재앙',
      '과거 비밀 폭로',
      '운명의 장애물',
      '선택의 딜레마',
    ];

    // 주요 위기 상황
    const majorCrises = [
      '세계의 위기',
      '생명의 위험',
      '사랑하는 이의 위험',
      '마법 폭주',
      '시간의 역설',
      '차원의 붕괴',
      '운명의 시험',
    ];

    // 결말 유형
    const endingTypes = [
      '해피엔딩',
      '완벽한 결합',
      '새로운 시작',
      '영원한 사랑',
      '운명의 성취',
      '평화로운 결말',
      '미래에 대한 희망',
    ];

    // 랜덤 선택으로 구조 생성
    const selectRandom = array => array[Math.floor(Math.random() * array.length)];
    const selectMultiple = (category, count = 3) => {
      const items = Object.values(category).flat();
      const selected = [];
      while (selected.length < count && items.length > 0) {
        const item = items.splice(Math.floor(Math.random() * items.length), 1)[0];
        selected.push(item);
      }
      return selected;
    };

    const result = {
      introduction: {
        chapters: '1-15',
        key_events: [
          selectRandom(eventCategories.introduction.meetings),
          selectRandom(eventCategories.introduction.conflicts),
          selectRandom(eventCategories.introduction.worldBuilding),
        ],
        relationship_stage: selectRandom(relationshipStages.introduction),
        world_building_focus: selectRandom(worldBuildingFocus),
      },
      development: {
        chapters: '16-45',
        key_events: [
          selectRandom(eventCategories.development.cooperation),
          selectRandom(eventCategories.development.emotion),
          selectRandom(eventCategories.development.danger),
        ],
        relationship_stage: selectRandom(relationshipStages.development),
        conflict_escalation: selectRandom(conflictEscalations),
      },
      climax: {
        chapters: '46-60',
        key_events: [
          selectRandom(eventCategories.climax.crisis),
          selectRandom(eventCategories.climax.revelation),
        ],
        relationship_stage: selectRandom(relationshipStages.climax),
        major_crisis: selectRandom(majorCrises),
      },
      resolution: {
        chapters: '61-75',
        key_events: [
          selectRandom(eventCategories.resolution.resolution),
          selectRandom(eventCategories.resolution.romance),
        ],
        relationship_stage: selectRandom(relationshipStages.resolution),
        ending_type: selectRandom(endingTypes),
      },
    };

    console.log('✅ 동적 플롯 구조 생성 완료:');
    console.log(`   📚 도입부: ${result.introduction.relationship_stage}`);
    console.log(`   🔥 전개부: ${result.development.relationship_stage}`);
    console.log(`   ⚡ 절정부: ${result.climax.relationship_stage}`);
    console.log(`   💕 결말부: ${result.resolution.relationship_stage}`);

    return result;
  }

  async generateMockMetadata(characters) {
    console.log('📚 100% 동적 메타데이터 생성 (Mock 모드)...');

    // 동적 제목 생성 시스템
    const titleElements = {
      prefixes: ['운명의', '별빛', '마법의', '비밀의', '금지된', '영원한', '잃어버린', '숨겨진'],
      subjects: ['마법사', '기사', '황제', '공주', '마녀', '용사', '예언자', '왕자'],
      connectors: ['와', '의', '그리고', '과', '를'],
      themes: ['사랑', '인연', '계약', '맹세', '운명', '비밀', '약속', '저주'],
    };

    // 캐릭터 기반 제목 생성 (전달된 characters 객체 활용)
    let titleBase;
    if (characters && characters.female && characters.male) {
      const femalePrefix = characters.female.name.charAt(0);
      const malePrefix = characters.male.name.charAt(0);

      // 이름 첫 글자를 활용한 특별한 제목
      const nameBasedTitles = [
        `${femalePrefix}와 ${malePrefix}의 운명`,
        `${characters.female.name}의 비밀`,
        `${characters.male.name}과의 계약`,
        `${femalePrefix}${malePrefix} 마법 연대기`,
      ];

      titleBase = nameBasedTitles[Math.floor(Math.random() * nameBasedTitles.length)];
    } else {
      // 기본 동적 제목
      const prefix =
        titleElements.prefixes[Math.floor(Math.random() * titleElements.prefixes.length)];
      const subject =
        titleElements.subjects[Math.floor(Math.random() * titleElements.subjects.length)];
      titleBase = `${prefix} ${subject}`;
    }

    // 대안 제목들
    const alternativeTitleSets = [
      ['마법의 인연', '별빛 계약', '운명의 실'],
      ['금지된 사랑', '비밀의 맹세', '영원한 약속'],
      ['시간의 마법사', '차원의 연인', '예언의 아이들'],
      ['드래곤의 계약', '정령의 선택', '별의 수호자'],
    ];

    const alternativeTitles =
      alternativeTitleSets[Math.floor(Math.random() * alternativeTitleSets.length)];

    // 동적 요약 생성
    const summaryTemplates = [
      '적이었던 두 {}가 운명적 사랑에 빠지는 이야기',
      '{}와 {}가 만나 펼치는 환상적인 로맨스',
      '마법과 운명이 얽힌 두 {}의 사랑 이야기',
      '{}의 저주를 풀기 위해 만난 두 사람의 로맨스',
      '시공을 초월한 {}와 {}의 운명적 만남',
    ];

    const characterTypes = ['마법사', '기사', '왕자', '공주', '용사', '마녀', '현자', '전사'];
    const selectedType1 = characterTypes[Math.floor(Math.random() * characterTypes.length)];
    const selectedType2 = characterTypes[Math.floor(Math.random() * characterTypes.length)];
    const summaryTemplate = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)];

    const summary = summaryTemplate.replace('{}', selectedType1).replace('{}', selectedType2);

    // 동적 훅 생성
    const hookTemplates = [
      '적인가, 연인인가? 마법이 만든 운명적 사랑',
      '시간을 넘나든 사랑, 그 놀라운 이야기가 시작된다',
      '운명이 정한 두 사람, 사랑은 모든 것을 바꾼다',
      '마법보다 강한 것은 사랑이었다',
      '예언된 사랑, 금지된 감정의 끝은?',
      '두 개의 영혼, 하나의 운명',
      '마법의 세계에서 피어난 불가능한 사랑',
    ];

    const hook = hookTemplates[Math.floor(Math.random() * hookTemplates.length)];

    // 동적 키워드 생성
    const keywordPools = {
      magic: ['마법', '술법', '주문', '마나', '크리스탈'],
      romance: ['로맨스', '사랑', '운명', '인연', '감정'],
      fantasy: ['판타지', '환상', '모험', '전설', '신화'],
      theme: ['복수', '성장', '우정', '배신', '희생'],
    };

    const generateKeywords = () => {
      const result = [];
      Object.values(keywordPools).forEach(pool => {
        const keyword = pool[Math.floor(Math.random() * pool.length)];
        result.push(keyword);
      });
      return result;
    };

    // 동적 타겟 독자층
    const targetAudiences = [
      '로맨스 판타지 독자',
      '마법 소설 애호가',
      '판타지 로맨스 팬',
      '웹소설 독자',
      '환상 소설 마니아',
      '로맨스 소설 애독자',
    ];

    const targetAudience = targetAudiences[Math.floor(Math.random() * targetAudiences.length)];

    const result = {
      title: titleBase,
      alternative_titles: alternativeTitles,
      summary: summary,
      hook: hook,
      keywords: generateKeywords(),
      target_audience: targetAudience,
    };

    console.log('✅ 동적 메타데이터 생성 완료:');
    console.log(`   📖 제목: ${result.title}`);
    console.log(`   💭 훅: ${result.hook}`);
    console.log(`   🔑 키워드: ${result.keywords.join(', ')}`);
    console.log(`   👥 타겟: ${result.target_audience}`);

    return result;
  }

  /**
   * 챕터 연재를 위한 소설 상태 관리 시스템
   */
  async saveNovelState(novelSlug, novelData) {
    console.log(`💾 소설 상태 저장: ${novelSlug}`);

    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const stateDir = path.join(process.cwd(), 'src/data/novel-states');

      // 상태 디렉토리 생성
      await fs.mkdir(stateDir, { recursive: true });

      const stateFile = path.join(stateDir, `${novelSlug}-state.json`);
      const stateData = {
        ...novelData,
        lastUpdated: new Date().toISOString(),
        currentChapter: novelData.currentChapter || 1,
        totalChapters: novelData.totalChapters || 75,
        seriesStatus: novelData.status || '연재 중',
        generationHistory: novelData.generationHistory || [],
        characterConsistency: {
          female: novelData.characters?.female || null,
          male: novelData.characters?.male || null,
        },
        plotProgress: {
          currentStage: this.determinePlotStage(novelData.currentChapter || 1),
          completedEvents: novelData.completedEvents || [],
          upcomingEvents: novelData.upcomingEvents || [],
        },
      };

      await fs.writeFile(stateFile, JSON.stringify(stateData, null, 2));
      console.log(`✅ 소설 상태 저장 완료: ${stateFile}`);

      return stateData;
    } catch (error) {
      console.error(`❌ 소설 상태 저장 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 저장된 소설 상태 로드
   */
  async loadNovelState(novelSlug) {
    console.log(`📖 소설 상태 로드: ${novelSlug}`);

    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const stateFile = path.join(
        process.cwd(),
        'src/data/novel-states',
        `${novelSlug}-state.json`
      );

      const stateContent = await fs.readFile(stateFile, 'utf-8');
      const stateData = JSON.parse(stateContent);

      console.log(`✅ 소설 상태 로드 완료: ${novelSlug}`);
      console.log(`   📊 현재 챕터: ${stateData.currentChapter}/${stateData.totalChapters}`);
      console.log(`   📈 플롯 단계: ${stateData.plotProgress?.currentStage}`);
      console.log(
        `   👥 캐릭터: ${stateData.characterConsistency?.female?.name}, ${stateData.characterConsistency?.male?.name}`
      );

      return stateData;
    } catch (error) {
      console.warn(`⚠️ 소설 상태 로드 실패: ${error.message}`);
      return null;
    }
  }

  /**
   * 챕터 연재를 위한 컨텍스트 업데이트
   */
  async updateNovelProgress(novelSlug, chapterNumber, chapterData) {
    console.log(`🔄 소설 진행상황 업데이트: ${novelSlug} ${chapterNumber}화`);

    try {
      const currentState = await this.loadNovelState(novelSlug);
      if (!currentState) {
        console.warn(`⚠️ 기존 상태를 찾을 수 없음: ${novelSlug}`);
        return null;
      }

      // 진행상황 업데이트
      const updatedState = {
        ...currentState,
        currentChapter: Math.max(currentState.currentChapter, chapterNumber),
        lastUpdated: new Date().toISOString(),
        generationHistory: [
          ...currentState.generationHistory,
          {
            chapterNumber,
            title: chapterData.title,
            generatedAt: new Date().toISOString(),
            wordCount: chapterData.wordCount || 0,
            qualityScore: chapterData.qualityScore || 0,
          },
        ].slice(-10), // 최근 10개만 유지
        plotProgress: {
          ...currentState.plotProgress,
          currentStage: this.determinePlotStage(chapterNumber),
          completedEvents: [
            ...currentState.plotProgress.completedEvents,
            `${chapterNumber}화: ${chapterData.title}`,
          ],
        },
      };

      // 완결 체크
      if (chapterNumber >= (currentState.totalChapters || 75)) {
        updatedState.seriesStatus = '완결';
        updatedState.completedAt = new Date().toISOString();
        console.log(`🎉 소설 완결: ${novelSlug}`);
      }

      await this.saveNovelState(novelSlug, updatedState);
      return updatedState;
    } catch (error) {
      console.error(`❌ 소설 진행상황 업데이트 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 연재 가능한 소설 목록 조회
   */
  async getActiveNovels() {
    console.log(`📚 연재 가능한 소설 목록 조회`);

    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const stateDir = path.join(process.cwd(), 'src/data/novel-states');

      // 상태 디렉토리가 없으면 빈 배열 반환
      try {
        await fs.access(stateDir);
      } catch {
        console.log(`📁 상태 디렉토리 없음, 빈 목록 반환`);
        return [];
      }

      const stateFiles = await fs.readdir(stateDir);
      const activeNovels = [];

      for (const file of stateFiles) {
        if (file.endsWith('-state.json')) {
          try {
            const stateContent = await fs.readFile(path.join(stateDir, file), 'utf-8');
            const state = JSON.parse(stateContent);

            if (
              state.seriesStatus === '연재 중' &&
              state.currentChapter < (state.totalChapters || 75)
            ) {
              activeNovels.push({
                slug: file.replace('-state.json', ''),
                title: state.title,
                currentChapter: state.currentChapter,
                totalChapters: state.totalChapters,
                lastUpdated: state.lastUpdated,
                plotStage: state.plotProgress?.currentStage,
              });
            }
          } catch (error) {
            console.warn(`⚠️ 상태 파일 읽기 실패: ${file} - ${error.message}`);
          }
        }
      }

      console.log(`✅ 연재 가능한 소설 ${activeNovels.length}개 발견`);
      return activeNovels.sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated));
    } catch (error) {
      console.error(`❌ 연재 소설 목록 조회 실패: ${error.message}`);
      return [];
    }
  }

  /**
   * 플롯 단계 결정 로직
   */
  determinePlotStage(chapterNumber) {
    if (chapterNumber <= 15) return 'introduction';
    if (chapterNumber <= 45) return 'development';
    if (chapterNumber <= 60) return 'climax';
    return 'resolution';
  }

  /**
   * 연재 소설의 다음 챕터 생성 준비
   */
  async prepareNextChapter(novelSlug) {
    console.log(`📝 다음 챕터 준비: ${novelSlug}`);

    try {
      const novelState = await this.loadNovelState(novelSlug);
      if (!novelState) {
        throw new Error(`소설 상태를 찾을 수 없습니다: ${novelSlug}`);
      }

      const nextChapterNumber = novelState.currentChapter + 1;

      // 완결 체크
      if (nextChapterNumber > novelState.totalChapters) {
        console.log(`📚 이미 완결된 소설: ${novelSlug}`);
        return {
          status: 'completed',
          message: '이미 완결된 소설입니다.',
          novelState,
        };
      }

      // 다음 챕터 컨텍스트 생성
      const chapterContext = {
        novelSlug,
        chapterNumber: nextChapterNumber,
        title: novelState.title,
        characters: novelState.characterConsistency,
        characterNames: [
          novelState.characterConsistency?.female?.name || '세라핀',
          novelState.characterConsistency?.male?.name || '다미안',
        ],
        worldSetting: novelState.worldSetting,
        tropeCombination: novelState.tropeCombination,
        plotStructure: novelState.plotStructure,
        plotStage: this.determinePlotStage(nextChapterNumber),
        previousEvents: novelState.plotProgress?.completedEvents?.slice(-3) || [],
        currentStage: novelState.plotProgress?.currentStage,
      };

      // 동적 챕터 제목 생성
      const upcomingEvents = this.predictUpcomingEvents(
        chapterContext.plotStage,
        nextChapterNumber
      );
      const chapterTitle = await this.generateChapterTitle(
        nextChapterNumber,
        chapterContext.plotStage,
        chapterContext.previousEvents.join(', '),
        upcomingEvents
      );

      console.log(`✅ 다음 챕터 준비 완료: ${nextChapterNumber}화 - "${chapterTitle}"`);
      console.log(`   📊 플롯 단계: ${chapterContext.plotStage}`);
      console.log(`   👥 캐릭터: ${chapterContext.characterNames.join(', ')}`);

      return {
        status: 'ready',
        chapterNumber: nextChapterNumber,
        chapterTitle,
        context: chapterContext,
        novelState,
      };
    } catch (error) {
      console.error(`❌ 다음 챕터 준비 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 다음 사건 예측 (플롯 단계 기반)
   */
  predictUpcomingEvents(plotStage, chapterNumber) {
    const predictions = {
      introduction: ['캐릭터 소개', '세계관 탐험', '첫 갈등'],
      development: ['관계 발전', '갈등 심화', '감정 변화'],
      climax: ['최대 위기', '진실 폭로', '결정적 순간'],
      resolution: ['갈등 해결', '관계 완성', '해피엔딩'],
    };

    return predictions[plotStage]?.join(', ') || '스토리 전개';
  }

  /**
   * 연재 소설 완결 처리
   */
  async completeNovel(novelSlug) {
    console.log(`🎉 소설 완결 처리: ${novelSlug}`);

    try {
      const novelState = await this.loadNovelState(novelSlug);
      if (!novelState) {
        throw new Error(`소설 상태를 찾을 수 없습니다: ${novelSlug}`);
      }

      const completedState = {
        ...novelState,
        seriesStatus: '완결',
        completedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        finalStatistics: {
          totalChapters: novelState.currentChapter,
          totalGenerations: novelState.generationHistory?.length || 0,
          averageQuality: this.calculateAverageQuality(novelState.generationHistory || []),
          seriesDuration: this.calculateSeriesDuration(
            novelState.publishedDate,
            new Date().toISOString()
          ),
        },
      };

      await this.saveNovelState(novelSlug, completedState);

      console.log(`✅ 소설 완결 처리 완료: ${novelSlug}`);
      console.log(`   📊 총 챕터: ${completedState.finalStatistics.totalChapters}화`);
      console.log(`   📈 평균 품질: ${completedState.finalStatistics.averageQuality}점`);
      console.log(`   📅 연재 기간: ${completedState.finalStatistics.seriesDuration}일`);

      return completedState;
    } catch (error) {
      console.error(`❌ 소설 완결 처리 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 평균 품질 점수 계산
   */
  calculateAverageQuality(generationHistory) {
    if (!generationHistory || generationHistory.length === 0) return 0;

    const totalScore = generationHistory.reduce((sum, entry) => sum + (entry.qualityScore || 0), 0);
    return Math.round(totalScore / generationHistory.length);
  }

  /**
   * 연재 기간 계산 (일 단위)
   */
  calculateSeriesDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
