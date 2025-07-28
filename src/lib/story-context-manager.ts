/**
 * 완벽한 연재 컨텍스트 관리 시스템
 * 각 챕터 생성 시 이전 스토리 상황을 정확히 파악하고 연속성 보장
 */

export interface CharacterState {
  name: string;
  role: string;
  currentEmotionalState: string;
  magicLevel?: string;
  relationshipWithOthers?: Record<string, string>;
  keyTraits: string[];
  currentLocation: string;
  lastMajorEvent: string;
  emotionalArc: string;
  nextDevelopment: string;
}

export interface RelationshipProgress {
  currentLevel: string;
  progression: string;
  keyMoments: string[];
  nextMilestone: string;
  targetEndLevel: string;
}

export interface PlotProgress {
  mainArc: string;
  currentPhase: string;
  completedEvents: string[];
  upcomingEvents: string[];
  worldBuilding: {
    establishedElements: string[];
    needsExpansion: string[];
  };
}

export interface NovelContext {
  title: string;
  currentChapter: number;
  totalChapters: number;
  status: string;
  lastPublished: string;
  characterStates: Record<string, CharacterState>;
  relationshipMatrix: Record<string, RelationshipProgress>;
  plotProgress: PlotProgress;
  storyTones: {
    current: string;
    emotionalTone: string;
    conflictLevel: string;
    paceRating: string;
    nextChapterMood: string;
  };
  qualityMetrics: Record<string, any>;
}

export interface StoryTracker {
  storyTracker: {
    lastUpdated: string;
    version: string;
    description: string;
  };
  novels: Record<string, NovelContext>;
  globalSettings: {
    dailyChapterTarget: number;
    qualityThreshold: number;
    averageChapterLength: number;
    preferredTropes: string[];
    avoidedElements: string[];
  };
  generationHistory: Record<string, any>;
}

/**
 * 스토리 컨텍스트를 읽어서 다음 챕터 생성을 위한 완벽한 컨텍스트 제공
 */
export class StoryContextManager {
  private storyData: StoryTracker | null = null;

  /**
   * story-tracker.json을 읽어서 현재 스토리 상황 파악
   */
  async loadStoryContext(): Promise<StoryTracker> {
    try {
      // 실제 구현에서는 파일 시스템에서 읽어야 함
      // 여기서는 타입 정의만 제공
      throw new Error('This method should be implemented in the GitHub Action workflow');
    } catch (error) {
      throw new Error(`Failed to load story context: ${error}`);
    }
  }

  /**
   * 특정 소설의 다음 챕터 생성을 위한 완벽한 컨텍스트 요약 생성
   */
  generateChapterContext(novelSlug: string): string {
    if (!this.storyData) {
      throw new Error('Story context not loaded');
    }

    const novel = this.storyData.novels[novelSlug];
    if (!novel) {
      throw new Error(`Novel ${novelSlug} not found in story context`);
    }

    return `
## 📚 "${novel.title}" 연재 컨텍스트 (완벽 분석)

### 현재 상황:
- **현재 챕터**: ${novel.currentChapter}화 완료
- **다음 생성**: ${novel.currentChapter + 1}화
- **전체 계획**: ${novel.plotProgress.currentPhase}
- **감정 톤**: ${novel.storyTones.nextChapterMood}

### 주요 캐릭터 현재 상태:
${Object.entries(novel.characterStates)
  .map(
    ([key, char]) => `
**${char.name}** (${char.role}):
- 감정 상태: ${char.currentEmotionalState}
- 현재 위치: ${char.currentLocation}
- 마지막 사건: ${char.lastMajorEvent}
- 다음 발전: ${char.nextDevelopment}
`
  )
  .join('')}

### 관계 진행 상황:
${Object.entries(novel.relationshipMatrix)
  .map(
    ([pair, rel]) => `
**${pair}**: ${rel.currentLevel}
- 진행 경로: ${rel.progression}
- 다음 목표: ${rel.nextMilestone}
`
  )
  .join('')}

### 플롯 진행:
**주요 스토리 아크**: ${novel.plotProgress.mainArc}
**현재 단계**: ${novel.plotProgress.currentPhase}

**완료된 사건들**:
${novel.plotProgress.completedEvents.map(event => `- ${event}`).join('\n')}

**다음에 일어날 사건들**:
${novel.plotProgress.upcomingEvents.map(event => `- ${event}`).join('\n')}

### 세계관 현황:
**확립된 요소들**:
${novel.plotProgress.worldBuilding.establishedElements.map(el => `- ${el}`).join('\n')}

**확장 필요 요소들**:
${novel.plotProgress.worldBuilding.needsExpansion.map(el => `- ${el}`).join('\n')}

### 품질 기준:
- 이전 챕터 평균 점수: ${
      Object.values(novel.qualityMetrics).length > 0
        ? Object.values(novel.qualityMetrics).reduce(
            (sum: any, metrics: any) => sum + metrics.평균점수,
            0
          ) / Object.values(novel.qualityMetrics).length
        : 'N/A'
    }
- 목표 점수: ${this.storyData.globalSettings.qualityThreshold}/10 이상
- 목표 분량: ${this.storyData.globalSettings.averageChapterLength}자

### 연속성 요구사항:
1. 이전 챕터의 마지막 장면부터 자연스럽게 시작
2. 모든 캐릭터의 감정 상태와 관계 진전 반영
3. 기존 설정과 세계관 완벽 유지
4. 플롯 진행에 따른 적절한 사건 배치
5. 다음 챕터로의 자연스러운 연결점 제공
`;
  }

  /**
   * 새 챕터 생성 후 컨텍스트 업데이트를 위한 지침 생성
   */
  generateUpdateInstructions(novelSlug: string, newChapterNumber: number): string {
    return `
## 📝 스토리 컨텍스트 업데이트 지침

### content/story-context/story-tracker.json 업데이트:

1. **기본 정보 업데이트**:
   - novels.${novelSlug}.currentChapter: ${newChapterNumber}
   - novels.${novelSlug}.totalChapters: ${newChapterNumber}
   - novels.${novelSlug}.lastPublished: "${new Date().toISOString().split('T')[0]}"

2. **캐릭터 상태 업데이트**:
   각 주요 캐릭터의:
   - currentEmotionalState: 이번 챕터에서의 감정 변화 반영
   - lastMajorEvent: 이번 챕터의 주요 사건
   - relationshipWithOthers: 관계 진전 상황
   - nextDevelopment: 다음 챕터에서의 예상 발전

3. **관계 매트릭스 업데이트**:
   - currentLevel: 이번 챕터에서의 관계 진전도
   - keyMoments: 새로운 중요 순간 추가
   - nextMilestone: 다음 관계 발전 목표

4. **플롯 진행 업데이트**:
   - completedEvents: 이번 챕터의 주요 사건 추가
   - upcomingEvents: 다음 챕터 예상 사건 업데이트
   - worldBuilding.establishedElements: 새로 확립된 설정 추가

5. **품질 메트릭 추가**:
   새 챕터의 자가 평가 점수 기록

### 예시 업데이트:
\`\`\`json
{
  "novels": {
    "${novelSlug}": {
      "currentChapter": ${newChapterNumber},
      "characterStates": {
        "character-name": {
          "currentEmotionalState": "새로운 감정 상태",
          "lastMajorEvent": "이번 챕터의 주요 사건",
          "nextDevelopment": "다음 챕터 예상 발전"
        }
      },
      "qualityMetrics": {
        "ch${newChapterNumber.toString().padStart(2, '0')}": {
          "로맨스몰입도": 점수,
          "판타지일관성": 점수,
          "캐릭터매력도": 점수,
          "문장가독성": 점수,
          "다음화기대감": 점수,
          "평균점수": 평균점수
        }
      }
    }
  }
}
\`\`\`
`;
  }
}

/**
 * GitHub Actions에서 사용할 수 있는 컨텍스트 생성 함수들
 */
export const contextHelpers = {
  /**
   * 소설별 완벽한 연재 컨텍스트 추출
   */
  extractChapterContext: (storyData: StoryTracker, novelSlug: string) => {
    const manager = new StoryContextManager();
    manager['storyData'] = storyData; // 직접 설정
    return manager.generateChapterContext(novelSlug);
  },

  /**
   * 업데이트 지침 생성
   */
  generateUpdateGuide: (novelSlug: string, chapterNumber: number) => {
    const manager = new StoryContextManager();
    return manager.generateUpdateInstructions(novelSlug, chapterNumber);
  },
};
