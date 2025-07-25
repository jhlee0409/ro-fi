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

// 기본 팩토리 함수
export function createMockAIGenerator() {
  return new MockAIGenerator();
}

// Vitest용 모킹 팩토리
export function createVitestMockAIGenerator() {
  const mock = new MockAIGenerator();
  
  // Vitest 스파이 기능 추가
  if (typeof vi !== 'undefined') {
    mock.generateChapter = vi.fn(mock.generateChapter.bind(mock));
    mock.improveChapter = vi.fn(mock.improveChapter.bind(mock));
  }
  
  return mock;
}