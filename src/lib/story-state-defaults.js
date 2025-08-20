/**
 * 🔧 Story State 기본값 제공 시스템
 * 
 * 목적: 빈 데이터 문제 해결 및 일관성 있는 기본값 제공
 */

/**
 * 기본 캐릭터 프로필 생성
 */
export function createDefaultCharacter(name = '', role = 'protagonist') {
  return {
    name: name || `${role === 'protagonist' ? '주인공' : '조연'}`,
    age: role === 'protagonist' ? 20 : 25,
    appearance: '',
    personality: role === 'protagonist' 
      ? ['호기심 많은', '용감한'] 
      : ['신비로운', '매력적인'],
    abilities: [],
    goals: role === 'protagonist' 
      ? ['진실 발견하기', '사랑 찾기'] 
      : ['주인공 보호하기'],
    currentEmotionalState: 'neutral',
    relationshipStatus: 'single'
  };
}

/**
 * 기본 세계관 설정 생성
 */
export function createDefaultWorldState() {
  return {
    setting: '마법이 존재하는 판타지 세계',
    timeframe: '중세 판타지 시대',
    magicSystem: '원소 마법 시스템',
    politicalStructure: '왕정제',
    importantLocations: ['왕궁', '마법학원', '숲속 마을']
  };
}

/**
 * 기본 플롯 구조 생성
 */
export function createDefaultPlot() {
  return {
    mainConflict: '운명에 맞서는 사랑',
    subplots: ['가족의 비밀', '마법 능력 각성'],
    resolvedPlots: [],
    foreshadowing: ['예언의 등장', '신비한 표식'],
    unresolvedMysteries: ['주인공의 출생 비밀'],
    romanceProgression: 0,
    tensionLevel: 5
  };
}

/**
 * 완전한 기본 Story State 생성
 */
export function createDefaultStoryState(novelSlug, title, author = '하이브리드 AI (Gemini)') {
  return {
    novelSlug,
    metadata: {
      title,
      author,
      genre: '로맨스 판타지',
      status: '연재 중',
      createdAt: new Date().toISOString(),
      totalChapters: 0,
      completionTarget: 20,
      currentArc: 'introduction',
      plotProgress: 0
    },
    worldState: createDefaultWorldState(),
    characters: {
      protagonist: createDefaultCharacter('', 'protagonist'),
      mainLead: createDefaultCharacter('', 'mainLead'),
      supportingCharacters: [],
      antagonists: []
    },
    plot: createDefaultPlot(),
    chapters: [],
    continuityNotes: [],
    qualityMetrics: {
      averageWordCount: 0,
      averageRating: 0,
      consistencyScore: 100,
      engagementScore: 0
    },
    lastUpdated: new Date().toISOString()
  };
}

/**
 * 기존 Story State에 누락된 기본값 보충
 */
export function enrichStoryState(existingState) {
  const defaultState = createDefaultStoryState(
    existingState.novelSlug,
    existingState.metadata?.title || '제목 미정'
  );

  // 깊은 병합 함수
  function deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else if (target[key] === '' || target[key] === 0 || target[key] === null || target[key] === undefined) {
        result[key] = source[key];
      } else {
        result[key] = target[key];
      }
    }
    
    return result;
  }

  return deepMerge(existingState, defaultState);
}

/**
 * Story State 유효성 검증
 */
export function validateStoryState(storyState) {
  const errors = [];
  const warnings = [];

  // 필수 필드 검증
  if (!storyState.novelSlug) errors.push('novelSlug is required');
  if (!storyState.metadata?.title) errors.push('title is required');
  
  // 캐릭터 검증
  if (!storyState.characters?.protagonist?.name) {
    warnings.push('protagonist name is empty');
  }
  
  // 세계관 검증
  if (!storyState.worldState?.setting) {
    warnings.push('world setting is empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - (errors.length * 25) - (warnings.length * 5))
  };
}