/**
 * 테스트용 Mock AI Generator
 * 실제 API 호출 없이 일관된 테스트 데이터 제공
 */

export class MockAIGenerator {
  constructor() {
    this.callCount = 0;
    this.generatedContent = new Map();
  }

  async generateChapter(options) {
    this.callCount++;
    const { chapterNumber, tropes = ['enemies-to-lovers'], title = '테스트 소설' } = options;
    
    // 일관된 테스트 데이터 생성
    const content = this.createTestChapterContent(chapterNumber, tropes, title);
    
    // 생성 기록 저장
    const contentKey = `${title}-ch${chapterNumber}`;
    this.generatedContent.set(contentKey, content);
    
    return {
      title: `${chapterNumber}화`,
      content
    };
  }

  async improveChapter(content, criteria = []) {
    this.callCount++;
    
    // 개선 시뮬레이션
    const improvements = [
      '감정적 깊이 강화',
      '대화의 자연스러움 개선', 
      '장면 묘사 생생함 추가',
      '캐릭터 개성 부각'
    ];
    
    const appliedImprovements = criteria.length > 0 ? criteria : improvements.slice(0, 2);
    
    return `${content}\n\n> [품질 개선 적용: ${appliedImprovements.join(', ')}]`;
  }

  createTestChapterContent(chapterNumber, tropes, title) {
    const tropeTemplates = {
      'enemies-to-lovers': {
        conflict: '이념적 대립',
        emotion: '적대감 속 숨겨진 매력',
        scene: '강제적 협력 상황'
      },
      'fated-mates': {
        conflict: '운명 거부',
        emotion: '거부할 수 없는 이끌림',
        scene: '예언의 징조 발견'
      },
      'bodyguard-romance': {
        conflict: '직업적 경계',
        emotion: '금지된 감정',
        scene: '위험 상황에서의 보호'
      },
      'regression': {
        conflict: '과거와 현재의 딜레마',
        emotion: '후회와 희망',
        scene: '중요한 선택의 순간'
      }
    };

    const mainTrope = tropes[0] || 'enemies-to-lovers';
    const template = tropeTemplates[mainTrope] || tropeTemplates['enemies-to-lovers'];
    
    return `# ${chapterNumber}화

## ${template.scene}

**${title}**의 ${chapterNumber}번째 이야기가 시작됩니다.

### 상황 전개

${template.conflict}으로 인해 두 주인공 사이에 긴장이 흐릅니다.

> "테스트 환경에서 생성된 대화입니다."

주인공은 복잡한 감정을 느끼고 있었습니다. ${template.emotion}이 마음 속에서 꿈틀거렸습니다.

### 감정의 변화  

${mainTrope} 트롭에 따른 자연스러운 감정 진행이 이어집니다.

> [${template.scene}이 펼쳐지며 두 사람의 관계에 변화가 생깁니다]

**테스트 생성 정보**:
- 트롭: ${tropes.join(', ')}
- 챕터: ${chapterNumber}
- 워드카운트: 약 800자
- 생성 시간: ${new Date().toISOString()}

이것은 안정적인 테스트를 위한 모킹된 콘텐츠입니다.`;
  }

  // 테스트 유틸리티 메서드들
  getCallCount() {
    return this.callCount;
  }

  getGeneratedContent(title, chapterNumber) {
    return this.generatedContent.get(`${title}-ch${chapterNumber}`);
  }

  reset() {
    this.callCount = 0;
    this.generatedContent.clear();
  }

  // 에러 시뮬레이션 (테스트용)
  simulateError(shouldError = true) {
    this.shouldError = shouldError;
  }

  async generateChapterWithError(options) {
    if (this.shouldError) {
      throw new Error('Mock AI Generator Error for Testing');
    }
    return this.generateChapter(options);
  }
}

// 기본 팩토리 함수 (v3.1 통합 아키텍처 지원)
export function createMockAIGenerator() {
  const mock = new MockAIGenerator();
  
  // v3.1 통합 시스템용 추가 메서드들
  mock.generateHybridContent = async (context, options) => {
    return {
      content: mock.createTestChapterContent(context.chapter || 1, context.tropes || ['enemies-to-lovers'], context.novel || 'test-novel'),
      metadata: {
        aiModels: 'hybrid',
        tokensUsed: 1500,
        generationTime: 2.0,
        qualityScore: 0.85
      }
    };
  };

  mock.generateTropeCombination = async (existingTropes) => {
    return {
      main_trope: 'enemies_to_lovers',
      sub_tropes: ['academic_rivals', 'forced_proximity'],
      emotional_arc: 'antagonism → understanding → attraction → love',
      key_moments: ['첫 대결', '협력 상황', '진심 발견', '고백']
    };
  };

  mock.generateUniqueCharacter = async (existingCharacters, options) => {
    const names = ['다니엘', '레오', '세바스찬', '소피아', '이사벨라'];
    const availableName = names.find(name => !existingCharacters.includes(name)) || '새캐릭터';
    
    return {
      name: availableName,
      profile: {
        age: 22,
        role: options.role || 'supporting',
        traits: ['intelligent', 'mysterious'],
        background: `${availableName}는 특별한 능력을 가진 캐릭터입니다.`
      }
    };
  };

  mock.generateCharacterRelations = async (characters) => {
    return {
      mainCouple: {
        male_lead: characters[0]?.name || '카이런',
        female_lead: characters[1]?.name || '에이라',
        relationship_type: 'enemies_to_lovers'
      },
      dynamics: [
        { type: 'initial_tension', description: '첫 만남에서의 강한 대립' }
      ]
    };
  };

  mock.routeToOptimalAI = async (context, prompt) => {
    return {
      preferredModel: context.type === 'emotional_scene' ? 'claude' : 'gemini',
      confidence: 0.85,
      reasoning: 'Mock routing decision'
    };
  };

  mock.generateWithFallback = async (prompt, options) => {
    // 테스트를 위해 에러 시뮬레이션 가능
    if (!options || (!options.claude && !options.gemini)) {
      throw new Error('All AI services unavailable');
    }
    
    return {
      content: `Mock AI content for: ${prompt.substring(0, 30)}...`,
      metadata: {
        aiModel: options.preferred || 'claude',
        tokensUsed: 600
      }
    };
  };

  mock.generateContent = async (prompt, options) => {
    return {
      content: `Mock generated content for: ${prompt.substring(0, 50)}...`,
      metadata: {
        aiModel: 'mock',
        tokensUsed: 800,
        generationTime: 1.5
      }
    };
  };

  mock.generateChapterContent = async (context) => {
    return {
      content: mock.createTestChapterContent(
        context.chapter || 1, 
        context.tropes || ['enemies-to-lovers'], 
        context.novel || 'test-novel'
      ),
      characterConsistency: {
        score: 0.9,
        issues: []
      },
      metadata: {
        wordsCount: 800,
        readingTime: 4,
        emotionalTone: 'romantic'
      }
    };
  };

  return mock;
}

// Vitest용 모킹 팩토리 (최적화된 스파이)
export function createVitestMockAIGenerator() {
  const mock = createMockAIGenerator(); // v3.1 메서드 포함
  
  // Vitest 스파이 기능 추가 (성능 최적화)
  if (typeof vi !== 'undefined') {
    // 기본 메서드들
    mock.generateChapter = vi.fn(mock.generateChapter.bind(mock));
    mock.improveChapter = vi.fn(mock.improveChapter.bind(mock));
    
    // v3.1 추가 메서드들
    mock.generateHybridContent = vi.fn(mock.generateHybridContent.bind(mock));
    mock.generateTropeCombination = vi.fn(mock.generateTropeCombination.bind(mock));
    mock.generateUniqueCharacter = vi.fn(mock.generateUniqueCharacter.bind(mock));
    mock.generateCharacterRelations = vi.fn(mock.generateCharacterRelations.bind(mock));
    mock.routeToOptimalAI = vi.fn(mock.routeToOptimalAI.bind(mock));
    mock.generateWithFallback = vi.fn(mock.generateWithFallback.bind(mock));
    mock.generateContent = vi.fn(mock.generateContent.bind(mock));
    mock.generateChapterContent = vi.fn(mock.generateChapterContent.bind(mock));
  }
  
  return mock;
}

// 고속 테스트용 간소화 모킹 (성능 최적화)
export function createFastMockAIGenerator() {
  return {
    generateHybridContent: () => Promise.resolve({
      content: '빠른 테스트 콘텐츠',
      metadata: { aiModels: 'hybrid', tokensUsed: 100 }
    }),
    generateTropeCombination: () => Promise.resolve({
      main_trope: 'test_trope',
      sub_tropes: ['sub1']
    }),
    generateUniqueCharacter: () => Promise.resolve({
      name: '테스트캐릭터',
      profile: { age: 20, role: 'test' }
    }),
    generateCharacterRelations: () => Promise.resolve({
      mainCouple: { male_lead: '남주', female_lead: '여주' }
    }),
    routeToOptimalAI: () => Promise.resolve({
      preferredModel: 'claude',
      confidence: 0.8
    }),
    generateWithFallback: () => Promise.resolve({
      content: 'AI 생성 콘텐츠',
      metadata: { aiModel: 'claude' }
    }),
    generateContent: () => Promise.resolve({
      content: '기본 콘텐츠'
    }),
    generateChapterContent: () => Promise.resolve({
      content: '챕터 콘텐츠',
      characterConsistency: { score: 0.9 }
    })
  };
}