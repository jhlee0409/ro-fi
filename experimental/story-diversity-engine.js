/**
 * @deprecated StoryDiversityEngine은 더 이상 사용되지 않습니다.
 * 100% AI 동적 생성을 위해 DynamicContentGenerator를 사용하세요.
 * 
 * 이 클래스는 v3.1에서 정적 템플릿 방식으로 작동했지만,
 * v3.2부터는 완전한 AI 생성으로 전환되었습니다.
 * 
 * 마이그레이션:
 * - StoryDiversityEngine.generateUniqueNovelConcept() → DynamicContentGenerator.generateTropeCombination()
 * - StoryDiversityEngine.generateCatchyTitle() → DynamicContentGenerator.generateNovelMetadata()
 * - StoryDiversityEngine.designMemorableCharacters() → DynamicContentGenerator.generateCharacterNames()
 */
export class StoryDiversityEngine {
  constructor() {
    this.genres = [
      '아카데미 판타지',
      '회귀 복수극',
      '계약 결혼',
      '이세계 전생',
      '현대 판타지',
      '궁중 로맨스',
      '마법사 학원',
      '기사단 로맨스',
      '용족 판타지',
      '신화 재해석',
    ];

    this.primaryTropes = [
      'enemies-to-lovers',
      'fake-relationship',
      'second-chance',
      'forbidden-love',
      'arranged-marriage',
      'bodyguard-romance',
      'master-servant',
      'rival-to-lover',
    ];

    this.secondaryTropes = [
      'regression',
      'transmigration',
      'hidden-identity',
      'power-struggle',
      'time-loop',
      'parallel-world',
      'memory-loss',
      'prophecy-bound',
    ];

    this.conflictTypes = [
      'ancient-curse',
      'political-intrigue',
      'magical-awakening',
      'forbidden-power',
      'divine-intervention',
      'family-secrets',
      'war-brewing',
      'dark-prophecy',
    ];

    this.worldSettings = [
      '마법과 과학이 공존하는 세계',
      '신들의 게임판이 된 현실',
      '감정이 마법력이 되는 왕국',
      '시간이 거꾸로 흐르는 탑',
      '꿈과 현실의 경계가 모호한 도시',
      '별들이 운명을 결정하는 제국',
      '기억을 매매하는 상인들의 세계',
      '색깔별로 계급이 나뉜 마법 왕국',
      '죽은 자와 대화할 수 있는 학원',
      '계절이 감정에 따라 바뀌는 땅',
    ];

    this.mainConflicts = [
      '세력 간 균형을 깨뜨리는 예언',
      '금지된 힘의 각성',
      '평행세계의 충돌',
      '고대 저주의 부활',
      '운명을 거스르는 선택',
      '잃어버린 왕위 계승권',
      '마법의 근원을 둘러싼 전쟁',
      '차원의 균열과 침입자들',
      '신들의 분노와 심판',
      '시간 조작자들의 음모',
    ];

    this.magicSystems = [
      '감정 기반 마법',
      '계약 소환술',
      '원소 조화술',
      '시간 조작술',
      '기억 편집술',
      '운명 직조술',
      '생명력 전이술',
      '공간 절곡술',
      '정신 연결술',
      '에너지 변환술',
    ];

    this.titlePatterns = [
      '{형용사} {명사}의 {관계}',
      '{색깔} {마법용어}와 {감정}',
      '{시간} {장소}에서 만난 {관계}',
      '{상태} {직업}의 {비밀}',
      '{마법} {왕위}와 {운명}',
    ];

    this.titleComponents = {
      형용사: [
        '잃어버린',
        '금지된',
        '숨겨진',
        '저주받은',
        '축복받은',
        '운명의',
        '영원한',
        '비밀의',
      ],
      명사: ['왕자', '공작', '기사', '마법사', '암살자', '용족', '신관', '예언자'],
      관계: ['약혼자', '수호자', '적', '스승', '계약자', '동맹', '라이벌', '동반자'],
      색깔: ['붉은', '푸른', '검은', '은빛', '황금', '자주빛', '초록', '하얀'],
      마법용어: ['검', '왕관', '반지', '목걸이', '지팡이', '책', '거울', '열쇠'],
      감정: ['복수', '사랑', '증오', '질투', '희망', '절망', '욕망', '용서'],
      시간: ['한밤중', '새벽', '황혼', '정오', '자정', '일몰', '일출', '달밤'],
      장소: ['도서관', '무도회장', '정원', '탑', '지하감옥', '성당', '연못', '숲'],
      상태: ['유배당한', '추방된', '가면을 쓴', '기억을 잃은', '저주받은', '선택받은'],
      직업: ['황제', '공작부인', '궁정마법사', '기사단장', '대신관', '암살단주'],
      비밀: ['정체', '과거', '힘', '미션', '계약', '저주', '예언', '운명'],
      마법: ['불꽃', '얼음', '바람', '대지', '빛', '어둠', '시간', '공간'],
      왕위: ['제국', '왕국', '공국', '영지', '마탑', '신전', '길드', '조직'],
      운명: ['선택', '만남', '이별', '결투', '계약', '맹세', '예언', '심판'],
    };

    // 고유한 캐릭터 이름 생성을 위한 이름 풀
    this.characterNames = {
      // 여성 주인공 이름 (각 작품마다 고유하게 사용)
      femaleNames: [
        '세라핀',
        '엘리시아',
        '아델린',
        '이사벨라',
        '비비안',
        '로잘린',
        '셀레스틴',
        '아멜리아',
        '에바나',
        '루시아나',
        '미라벨',
        '아리아델',
        '레오니아',
        '카밀라',
        '에스텔라',
        '발레리아',
        '클라리사',
        '디아나',
        '플로라',
        '헬레나',
        '이레네',
        '줄리아나',
        '카타리나',
        '리디아',
        '마리안느',
        '나탈리아',
        '오필리아',
        '페넬로페',
        '로사린드',
        '세라피나',
        '테레사',
        '비올레타',
        '알렉산드라',
        '베아트리체',
        '코델리아',
        '에밀리아',
        '프란체스카',
        '지네브라',
        '이사도라',
        '레티시아',
      ],

      // 남성 주인공 이름 (각 작품마다 고유하게 사용)
      maleNames: [
        '드라코',
        '루시안',
        '아드리안',
        '세바스찬',
        '다미안',
        '레오나르드',
        '막시밀리안',
        '알렉산더',
        '니콜라스',
        '도미닉',
        '에드워드',
        '가브리엘',
        '헨리',
        '이반',
        '줄리안',
        '케이든',
        '로렌조',
        '마르쿠스',
        '나타니엘',
        '올리비에',
        '필립',
        '퀸튼',
        '라파엘',
        '시몬',
        '테오도르',
        '발렌틴',
        '윌리엄',
        '자비에르',
        '이사크',
        '제이든',
        '카스퍼',
        '레오폴드',
        '미카엘',
        '노엘',
        '오스카',
        '파스칼',
        '퀸시',
        '로드릭',
        '스테판',
        '트리스탄',
      ],

      // 조연 캐릭터 이름
      supportingNames: [
        '아델',
        '베라',
        '클레어',
        '다프네',
        '에바',
        '페이',
        '그레이스',
        '하젤',
        '아이비',
        '제이드',
        '키라',
        '루나',
        '마야',
        '니나',
        '오라',
        '페이지',
        '퀸',
        '루비',
        '스카이',
        '테사',
        '아담',
        '브라이스',
        '콜린',
        '딘',
        '에단',
        '펠릭스',
        '그레이',
        '휴고',
        '이안',
        '제이크',
        '카일',
        '루크',
        '마일로',
        '노아',
        '오웬',
        '파커',
        '퀸',
        '라이언',
        '샘',
        '타일러',
      ],
    };

    // 사용된 이름 추적 (중복 방지)
    this.usedNames = new Set();
  }

  generateTropeCombination() {
    const main = this.getRandomElement(this.primaryTropes);
    const sub = this.getRandomElement(this.secondaryTropes);
    const conflict = this.getRandomElement(this.conflictTypes);

    return { main, sub, conflict };
  }

  generateUniqueSetting() {
    const world = this.getRandomElement(this.worldSettings);
    const mainConflict = this.getRandomElement(this.mainConflicts);
    const magicSystem = this.getRandomElement(this.magicSystems);

    return { world, mainConflict, magicSystem };
  }

  generateUniqueNovelConcept(existingCombinations = []) {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const concept = {
        ...this.generateTropeCombination(),
        ...this.generateUniqueSetting(),
        genre: this.getRandomElement(this.genres),
      };

      // 기존 조합과 겹치는지 확인
      const isDuplicate = existingCombinations.some(
        existing =>
          existing.main === concept.main &&
          existing.sub === concept.sub &&
          existing.conflict === concept.conflict
      );

      if (!isDuplicate) {
        return concept;
      }

      attempts++;
    }

    // 최대 시도 후에도 고유하지 않으면 강제로 변형
    const baseConcept = {
      ...this.generateTropeCombination(),
      ...this.generateUniqueSetting(),
      genre: this.getRandomElement(this.genres),
    };

    return {
      ...baseConcept,
      uniqueModifier: 'variant-' + Date.now(), // 고유성 보장
    };
  }

  generateCatchyTitle(concept) {
    // null/undefined 체크
    if (!concept) {
      concept = {};
    }

    const pattern = this.getRandomElement(this.titlePatterns);
    let title = pattern;

    // 패턴의 플레이스홀더를 실제 단어로 교체
    for (const [key, values] of Object.entries(this.titleComponents)) {
      const placeholder = `{${key}}`;
      if (title.includes(placeholder)) {
        title = title.replace(placeholder, this.getRandomElement(values));
      }
    }

    // 컨셉에 맞는 추가 수정
    if (concept.main === 'enemies-to-lovers') {
      title = title.replace(/사랑/g, '적대').replace(/동반자/g, '라이벌');
    }
    if (concept.sub === 'regression') {
      title = `다시 돌아온 ${title}`;
    }

    return title;
  }

  designMemorableCharacters(concept) {
    // null/undefined 체크
    if (!concept) {
      concept = {};
    }

    // 각 작품마다 고유한 이름 생성
    const uniqueNames = this.generateUniqueCharacterNames();

    const characterTypes = {
      protagonist: this.generateProtagonist(concept, uniqueNames.female),
      male_lead: this.generateMaleLead(concept, uniqueNames.male),
      supporting: this.generateSupportingCharacters(concept, uniqueNames.supporting),
    };

    return characterTypes;
  }

  // 고유한 캐릭터 이름 생성 (중복 방지)
  generateUniqueCharacterNames() {
    // 사용 가능한 이름 필터링 (이미 사용된 이름 제외)
    const availableFemaleNames = this.characterNames.femaleNames.filter(
      name => !this.usedNames.has(name)
    );
    const availableMaleNames = this.characterNames.maleNames.filter(
      name => !this.usedNames.has(name)
    );
    const availableSupportingNames = this.characterNames.supportingNames.filter(
      name => !this.usedNames.has(name)
    );

    // 사용 가능한 이름이 부족하면 리셋 (극히 드문 경우)
    if (availableFemaleNames.length < 1) {
      console.log('🔄 여성 이름 풀 리셋');
      this.usedNames.clear();
      return this.generateUniqueCharacterNames();
    }

    // 고유한 이름 선택
    const selectedNames = {
      female: this.getRandomElement(availableFemaleNames),
      male: this.getRandomElement(
        availableMaleNames.length > 0 ? availableMaleNames : this.characterNames.maleNames
      ),
      supporting: this.getRandomElements(
        availableSupportingNames.length >= 3
          ? availableSupportingNames
          : this.characterNames.supportingNames,
        3
      ),
    };

    // 사용된 이름 기록
    this.usedNames.add(selectedNames.female);
    this.usedNames.add(selectedNames.male);
    selectedNames.supporting.forEach(name => this.usedNames.add(name));

    console.log(`✨ 새로운 캐릭터 이름 생성: ${selectedNames.female} & ${selectedNames.male}`);

    return selectedNames;
  }

  // 배열에서 여러 요소를 랜덤하게 선택
  getRandomElements(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  generateProtagonist(concept, uniqueName) {
    const backgrounds = [
      '몰락한 공작가의 딸',
      '기억을 잃은 신관',
      '저주받은 마법사',
      '가면을 쓴 암살자',
      '예언에 나타난 선택받은 자',
      '시간을 되돌린 복수자',
      '다른 세계에서 온 이방인',
      '숨겨진 왕족의 후예',
    ];

    const personalities = [
      '차갑지만 내면이 따뜻한',
      '강하고 독립적인',
      '신중하고 지적인',
      '열정적이고 용감한',
      '신비롭고 매혹적인',
    ];

    return {
      name: uniqueName,
      background: this.getRandomElement(backgrounds),
      personality: this.getRandomElement(personalities),
      specialAbility: concept.magicSystem,
      motivation: this.getMotivationFromConcept(concept),
    };
  }

  generateMaleLead(concept, uniqueName) {
    const archetypes = [
      '냉혹한 황제',
      '고독한 기사단장',
      '수수께끼의 마법사',
      '위험한 암살자',
      '자존심 강한 공작',
      '상처받은 용족',
      '운명에 맞서는 왕자',
      '금지된 사랑에 빠진 신관',
    ];

    const traits = [
      '강력하지만 외로운',
      '완벽해 보이지만 상처가 많은',
      '무뚝뚝하지만 따뜻한 마음을 가진',
      '위험하지만 보호 욕구가 강한',
      '자신감 넘치지만 내면의 불안을 숨기는',
    ];

    return {
      name: uniqueName,
      archetype: this.getRandomElement(archetypes),
      personality: this.getRandomElement(traits),
      relationship: concept.main,
      innerConflict: this.getInnerConflictFromConcept(concept),
    };
  }

  generateSupportingCharacters(concept, uniqueNames) {
    return [
      {
        name: uniqueNames[0],
        role: '주인공을 이끄는 현명한 조언자',
        relationship: '스승 또는 보호자',
      },
      {
        name: uniqueNames[1],
        role: '주인공과 경쟁하는 존재',
        relationship: '연적 또는 정치적 라이벌',
      },
      {
        name: uniqueNames[2],
        role: '주인공을 끝까지 믿고 지지하는 동반자',
        relationship: '절친 또는 측근',
      },
    ];
  }

  getMotivationFromConcept(concept) {
    const motivations = {
      'enemies-to-lovers': '증오했던 상대에게서 예상치 못한 면을 발견',
      'fake-relationship': '가짜 관계를 통해 진짜 감정을 깨달음',
      'second-chance': '과거의 실수를 바로잡고 새로운 사랑을 찾음',
      'forbidden-love': '금지된 사랑을 위해 모든 것을 걸음',
      regression: '과거의 경험을 바탕으로 더 나은 미래를 만듦',
    };

    return motivations[concept.main] || '자신의 운명을 개척하고 진정한 사랑을 찾음';
  }

  getInnerConflictFromConcept(concept) {
    const conflicts = {
      'ancient-curse': '저주와 맞서 싸우면서도 사랑하는 사람을 보호해야 하는 딜레마',
      'political-intrigue': '권력과 사랑 사이에서의 선택',
      'forbidden-power': '위험한 힘을 사용할지 말지의 갈등',
      'divine-intervention': '신의 뜻과 개인의 감정 사이의 충돌',
    };

    return conflicts[concept.conflict] || '의무와 감정 사이에서의 갈등';
  }

  calculateDiversityScore(concept, existingCombinations) {
    let score = 100;

    // 기존 조합과의 유사도 체크
    if (existingCombinations) {
      for (const existing of existingCombinations) {
        if (existing.main === concept.main) score -= 15;
        if (existing.sub === concept.sub) score -= 10;
        if (existing.conflict === concept.conflict) score -= 10;
        if (existing.genre === concept.genre) score -= 5;
      }
    }

    // 트로프 조합의 신선함 점수
    const uncommonCombinations = [
      ['enemies-to-lovers', 'time-loop'],
      ['fake-relationship', 'parallel-world'],
      ['forbidden-love', 'memory-loss'],
    ];

    if (
      uncommonCombinations.some(
        combo => combo.includes(concept.main) && combo.includes(concept.sub)
      )
    ) {
      score += 20;
    }

    return Math.max(0, score); // 상한 제거하여 120점 가능하도록
  }

  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}
