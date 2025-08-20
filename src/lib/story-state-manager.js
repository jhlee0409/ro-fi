/**
 * StoryStateManager - 소설별 상태 관리 시스템
 *
 * 참고: 연속성_관리.md의 StoryStateManager 클래스를 현재 프로젝트에 맞게 구현
 * 기능: 소설별 상태 관리, 캐릭터 일관성, 세계관 유지, 플롯 진행 추적
 */

import fs from 'fs/promises';
import path from 'path';
import { getCollection, type CollectionEntry } from 'astro:content';
import {
  StoryState,
  CharacterProfile,
  ChapterState,
  LocationState,
} from './types/continuity.js';

export class StoryStateManager {
  constructor() {
    this.stories = new Map();
    this.stateDirectory = './data/story-states/';
    this.initialized = false;
    this.ensureDirectoryExists();
  }

  /**
   * 스토리 상태 디렉토리 확인 및 생성
   */
  private async ensureDirectoryExists() {
    try {
      await fs.access(this.stateDirectory);
    } catch {
      await fs.mkdir(this.stateDirectory, { recursive });
    }
  }

  /**
   * 새 소설 초기화
   */
  async initializeStory(
    novelSlug,
    config: {
      title;
      author;
      genre;
      tropes;
    }
  ) {
    const storyState = {
      metadata: {
        novelSlug,
        title: title,
        author: author,
        genre: genre,
        tropes: tropes,
        currentChapter,
        totalChapters,
        status: 'ongoing',
        lastUpdated: new Date(),
        createdDate: new Date(),
      },

      // 기본 세계관 설정 (로맨스 판타지 기준)
      worldbuilding: {
        magicSystem: {
          name: '감정 마법 시스템',
          source: '인간의 감정 에너지',
          types: {
            love: { power: '치유와 보호', cost: '감정 소모' },
            anger: { power: '파괴와 강화', cost: '이성 상실 위험' },
            sorrow: { power: '정화와 정신 조작', cost: '우울증 위험' },
          },
          limitations: ['하루 사용 횟수 제한', '감정 진정성 필요', '상성 관계 존재'],
          socialImpact: '감정 마법사는 귀족 계급 형성',
        },
        geography: {
          locations Map(),
          regions: ['북부 공작령', '중앙 제국', '남부 상업 지역'],
          politicalStructure: {
            emperor: '황제',
            nobles: ['공작', '후작', '백작'],
            commonRanks: ['기사', '평민', '농민'],
          },
        },
        socialHierarchy: {
          classes: ['황족', '대귀족', '소귀족', '기사', '상인', '농민'],
          powerStructure: {
            political: '황제 중심 제정',
            magical: '능력자 우대',
            economic: '영지 기반 경제',
          },
          culturalRules: [
            '귀족은 마법 능력을 갖춰야 함',
            '결혼은 정치적 동맹의 수단',
            '검술과 마법은 필수 교양',
          ],
        },
        rules: [
          '마법은 감정의 진정성에 기반함',
          '강력한 마법일수록 부작용이 큼',
          '혈통이 마법 능력을 좌우함',
          '예언은 운명이지만 해석에 따라 바뀔 수 있음',
        ],
      },

      // 캐릭터 초기화 (빈 상태)
      characters: {
        main Map(),
        supporting Map(),
        minor Map(),
      },

      // 플롯 초기화
      plotProgress: {
        mainArc: {
          current: '세계관 소개 및 캐릭터 등장',
          completed: [],
          upcoming: ['첫 만남', '갈등 발생', '관계 발전', '위기', '해결', '결말'],
          climaxReached,
        },
        subplots: [],
        foreshadowing: [],
        checkovGuns: [],
      },

      // 챕터 기록
      chapters Map(),

      // 연속성 체크포인트
      continuity: {
        timeline: [],
        characterStates Map(),
        locationStates Map(),
        activePromises: [],
        establishedFacts: [],
      },

      // 생성 설정
      generationConfig: {
        targetWordCount,
        emotionalIntensity: 'medium',
        pacingStyle: 'medium',
        romanceHeatLevel,
        preferredTropes.tropes,
        avoidedElements: ['과도한 폭력', '불필요한 비극'],
      },
    };

    this.stories.set(novelSlug, storyState);
    await this.saveStoryState(novelSlug);
    return storyState;
  }

  /**
   * 스토리 상태 로드
   */
  async getStory(novelSlug) {
    // 메모리에서 확인
    if (this.stories.has(novelSlug)) {
      return this.stories.get(novelSlug)!;
    }

    // 파일에서 로드
    try {
      const filePath = path.join(this.stateDirectory, `${novelSlug}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const storyState = JSON.parse(data) as StoryState;

      // Map 객체들 복원
      storyState.characters.main = new Map(
        storyState.characters.main as unknown as [string, CharacterProfile][]
      );
      storyState.characters.supporting = new Map(
        storyState.characters.supporting as unknown as [string, CharacterProfile][]
      );
      storyState.characters.minor = new Map(
        storyState.characters.minor as unknown as [string, CharacterProfile][]
      );
      storyState.chapters = new Map(storyState.chapters as unknown as [number, ChapterState][]);
      storyState.continuity.characterStates = new Map(
        storyState.continuity.characterStates as unknown as [string, CharacterProfile][]
      );
      storyState.continuity.locationStates = new Map(
        storyState.continuity.locationStates as unknown as [string, LocationState][]
      );
      storyState.worldbuilding.geography.locations = new Map(
        storyState.worldbuilding.geography.locations as unknown as [string, LocationState][]
      );

      this.stories.set(novelSlug, storyState);
      return storyState;
    } catch {
      // console.warn(`스토리 상태 로드 실패: ${novelSlug}, 새로 초기화합니다.`);

      // Astro 컨텐츠에서 소설 정보 가져와서 초기화
      try {
        const novels = await getCollection('novels');
        const novel = novels.find(n => n.slug === novelSlug);

        if (novel) {
          return await this.initializeStory(novelSlug, {
            title.data.title,
            author.data.author,
            genre: 'romance-fantasy',
            tropes.data.tropes || [],
          });
        }
      } catch {
        // console.error('Astro 컨텐츠 로드 실패:', astroError);
      }

      throw new Error(`스토리 상태를 로드할 수 없습니다: ${novelSlug}`);
    }
  }

  /**
   * 스토리 상태 저장
   */
  async saveStoryState(novelSlug) {
    const storyState = this.stories.get(novelSlug);
    if (!storyState) {
      throw new Error(`스토리 상태가 존재하지 않습니다: ${novelSlug}`);
    }

    const filePath = path.join(this.stateDirectory, `${novelSlug}.json`);

    // Map 객체들을 직렬화 가능한 형태로 변환
    const serializableState = {
      ...storyState,
      characters: {
        main.from(storyState.characters.main.entries()),
        supporting.from(storyState.characters.supporting.entries()),
        minor.from(storyState.characters.minor.entries()),
      },
      chapters.from(storyState.chapters.entries()),
      continuity: {
        ...storyState.continuity,
        characterStates.from(storyState.continuity.characterStates.entries()),
        locationStates.from(storyState.continuity.locationStates.entries()),
      },
      worldbuilding: {
        ...storyState.worldbuilding,
        geography: {
          ...storyState.worldbuilding.geography,
          locations.from(storyState.worldbuilding.geography.locations.entries()),
        },
      },
    };

    await fs.writeFile(filePath, JSON.stringify(serializableState, null, 2));
    storyState.metadata.lastUpdated = new Date();
  }

  /**
   * 캐릭터 추가/업데이트
   */
  async addOrUpdateCharacter(
    novelSlug,
    characterName,
    profile,
    type: 'main' | 'supporting' | 'minor' = 'supporting'
  ) {
    const story = await this.getStory(novelSlug);
    story.characters[type].set(characterName, profile);
    story.continuity.characterStates.set(characterName, profile);
    await this.saveStoryState(novelSlug);
  }

  /**
   * 챕터 추가 후 상태 업데이트
   */
  async updateAfterChapter(novelSlug, chapterState) {
    const story = await this.getStory(novelSlug);

    // 챕터 기록
    story.chapters.set(chapterState.chapterNumber, chapterState);
    story.metadata.currentChapter = Math.max(
      story.metadata.currentChapter,
      chapterState.chapterNumber
    );

    // 캐릭터 상태 업데이트
    for (const [charName, state] of chapterState.characterStates) {
      const existingChar = story.continuity.characterStates.get(charName);
      if (existingChar) {
        Object.assign(existingChar.currentState, state);
      }
    }

    // 위치 상태 업데이트
    for (const [locationName, state] of chapterState.locationChanges) {
      story.continuity.locationStates.set(locationName, state);
    }

    // 타임라인 이벤트 추가
    for (const event of chapterState.keyEvents) {
      story.continuity.timeline.push({
        chapterNumber.chapterNumber,
        event,
        timestamp Date().toISOString(),
        participants.from(chapterState.characterStates.keys()),
        significance: 'medium',
      });
    }

    // 복선 처리
    for (const foreshadowing of chapterState.plotProgression.foreshadowingPlanted) {
      story.plotProgress.foreshadowing.push({
        id: `foreshadow_${story.plotProgress.foreshadowing.length + 1}`,
        content,
        planted.chapterNumber,
        resolved,
      });
    }

    for (const resolved of chapterState.plotProgression.foreshadowingResolved) {
      const foreshadow = story.plotProgress.foreshadowing.find(f => f.content.includes(resolved));
      if (foreshadow) {
        foreshadow.resolved = true;
        foreshadow.resolutionChapter = chapterState.chapterNumber;
      }
    }

    await this.saveStoryState(novelSlug);
  }

  /**
   * 기존 컨텐츠에서 스토리 상태 분석 및 초기화
   */
  async analyzeExistingContent(novelSlug) {
    try {
      // 챕터 컨텐츠 로드
      const chapters = await getCollection('chapters');
      const novelChapters = chapters
        .filter(c => c.data.novel === novelSlug)
        .sort((a, b) => a.data.chapterNumber - b.data.chapterNumber);

      if (novelChapters.length === 0) {
        throw new Error(`${novelSlug}에 대한 챕터를 찾을 수 없습니다.`);
      }

      // 소설 메타데이터 로드
      const novels = await getCollection('novels');
      const novel = novels.find(n => n.slug === novelSlug);

      if (!novel) {
        throw new Error(`${novelSlug}에 대한 소설 메타데이터를 찾을 수 없습니다.`);
      }

      // 스토리 상태 초기화
      const story = await this.initializeStory(novelSlug, {
        title.data.title,
        author.data.author,
        genre: 'romance-fantasy',
        tropes.data.tropes || [],
      });

      // 각 챕터 분석하여 상태 추출
      for (const chapter of novelChapters) {
        const chapterState = await this.analyzeChapterContent(chapter);
        await this.updateAfterChapter(novelSlug, chapterState);
      }

      // console.log(`✅ ${novelSlug} 스토리 상태 분석 완료: ${novelChapters.length}개 챕터`);
      return story;
    } catch (error) {
      // console.error(`스토리 상태 분석 실패: ${novelSlug}`, error);
      throw error;
    }
  }

  /**
   * 챕터 컨텐츠 분석하여 상태 추출
   */
  private async analyzeChapterContent(chapter<'chapters'>) {
    const content = chapter.body || '';

    // 간단한 텍스트 분석으로 캐릭터 추출 (향후 더 정교하게 개선 가능)
    this.extractCharacterNames(content);
    const keyEvents = this.extractKeyEvents(content);
    const emotions = this.analyzeEmotionalTone(content);

    const chapterState = {
      chapterNumber.data.chapterNumber,
      title.data.title,
      summary.generateSummary(content),
      keyEvents,
      characterStates Map(),
      newCharacters: [],
      locationChanges Map(),
      emotionalTone.tone,
      endingEmotionalState.ending,
      cliffhanger.detectCliffhanger(content),
      plotProgression: {
        mainArcProgress: '',
        subplotChanges: [],
        foreshadowingPlanted: [],
        foreshadowingResolved: [],
      },
      wordCount.data.wordCount || content.length,
      contentRating: '15+', // 기본값 사용 (schema에 없음)
      publishedDate.data.publicationDate,
    };

    return chapterState;
  }

  /**
   * 텍스트에서 캐릭터 이름 추출 (간단한 구현)
   */
  private extractCharacterNames(content) {
    // 한국어 이름 패턴 매칭 (2-4글자 한글 이름)
    const namePattern = /[가-힣]{2,4}(?=은|는|이|가|을|를|의|에게|에서|와|과|로|으로)/g;
    const matches = content.match(namePattern) || [];

    // 중복 제거 및 빈도수 기반 필터링
    const nameCount = new Map<string, number>();
    matches.forEach(name => {
      nameCount.set(name, (nameCount.get(name) || 0) + 1);
    });

    // 3회 이상 등장하는 이름만 캐릭터로 간주
    return Array.from(nameCount.entries())
      .filter(([, count]) => count >= 3)
      .map(([name]) => name);
  }

  /**
   * 핵심 이벤트 추출
   */
  private extractKeyEvents(content) {
    const events = [];

    // 대화, 행동, 감정 변화 등을 나타내는 문장 추출
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);

    for (const sentence of sentences) {
      if (
        sentence.includes('말했다') ||
        sentence.includes('소리쳤다') ||
        sentence.includes('속삭였다') ||
        sentence.includes('대답했다')
      ) {
        events.push(sentence.trim().substring(0, 50) + '...');
      } else if (
        sentence.includes('마법') ||
        sentence.includes('검') ||
        sentence.includes('공격') ||
        sentence.includes('구했다')
      ) {
        events.push(sentence.trim().substring(0, 50) + '...');
      }
    }

    return events.slice(0, 5); // 최대 5개 이벤트
  }

  /**
   * 감정 톤 분석
   */
  private analyzeEmotionalTone(content): { tone; ending } {
    const positiveWords = ['행복', '기쁨', '사랑', '희망', '미소', '웃음', '따뜻'];
    const negativeWords = ['슬픔', '분노', '절망', '두려움', '고통', '눈물', '차가운'];
    const tensionWords = ['위험', '긴장', '갈등', '충돌', '위기', '전투', '대결'];

    let positive = 0,
      negative = 0,
      tension = 0;

    positiveWords.forEach(
      word => (positive += (content.match(new RegExp(word, 'g')) || []).length)
    );
    negativeWords.forEach(
      word => (negative += (content.match(new RegExp(word, 'g')) || []).length)
    );
    tensionWords.forEach(word => (tension += (content.match(new RegExp(word, 'g')) || []).length));

    let tone = 'neutral';
    if (positive > negative && positive > tension) tone = 'positive';
    else if (negative > positive && negative > tension) tone = 'negative';
    else if (tension > positive && tension > negative) tone = 'tense';

    // 마지막 문단의 감정 상태
    const lastParagraph = content.split('\n').slice(-3).join(' ');
    let ending = tone;
    if (lastParagraph.includes('미소') || lastParagraph.includes('행복')) ending = 'hopeful';
    else if (lastParagraph.includes('눈물') || lastParagraph.includes('슬픔')) ending = 'sad';
    else if (lastParagraph.includes('...') || lastParagraph.includes('?')) ending = 'uncertain';

    return { tone, ending };
  }

  /**
   * 클리프행어 감지
   */
  private detectCliffhanger(content) | undefined {
    const lastSentences = content.split(/[.!?]/).slice(-3);

    for (const sentence of lastSentences) {
      if (
        sentence.includes('그때') ||
        sentence.includes('갑자기') ||
        sentence.includes('하지만') ||
        sentence.includes('...')
      ) {
        return sentence.trim();
      }
    }

    return undefined;
  }

  /**
   * 요약 생성
   */
  private generateSummary(content) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 20);
    if (sentences.length === 0) return '';

    // 첫 문장과 중간 문장, 마지막 문장을 조합하여 요약 생성
    const firstSentence = sentences[0]?.trim().substring(0, 30) + '...';
    const lastSentence = sentences[sentences.length - 1]?.trim().substring(0, 30) + '...';

    return `${firstSentence} ${lastSentence}`;
  }

  /**
   * 모든 활성 스토리 목록
   */
  async getActiveStories()<string[]> {
    try {
      const files = await fs.readdir(this.stateDirectory);
      return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    } catch {
      return [];
    }
  }

  /**
   * 스토리 삭제
   */
  async deleteStory(novelSlug) {
    this.stories.delete(novelSlug);

    try {
      const filePath = path.join(this.stateDirectory, `${novelSlug}.json`);
      await fs.unlink(filePath);
    } catch {
      // console.warn(`스토리 파일 삭제 실패: ${novelSlug}`, _error);
    }
  }
}

// 싱글톤 인스턴스
export const storyStateManager = new StoryStateManager();
