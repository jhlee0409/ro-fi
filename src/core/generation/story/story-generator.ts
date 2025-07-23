/**
 * 스토리 생성 엔진 구현체
 */

import type { 
  IStoryGenerator,
  NewNovelResult,
  NextChapterResult,
  CompletionResult,
  Character
} from './story-generator-interface';
import type { INovelRepository } from '../../content/novel/novel-repository-interface';
import type { IChapterRepository } from '../../content/chapter/chapter-repository-interface';
import type { 
  Result, 
  Novel, 
  Chapter, 
  StoryConcept,
  GenerationOptions 
} from '../../../shared/types';
import { ok, err } from '../../../shared/types';
import { DomainError } from '../../../shared/errors';

export class StoryGenerator implements IStoryGenerator {
  constructor(
    private readonly novelRepository: INovelRepository,
    private readonly chapterRepository: IChapterRepository
  ) {}

  async generateNewNovel(options: GenerationOptions = {}): Promise<Result<NewNovelResult, DomainError>> {
    try {
      // 기존 작품들의 컨셉 도출을 위해 활성 소설 조회
      const activeNovelsResult = await this.novelRepository.getActiveNovels();
      const existingConcepts = activeNovelsResult.success 
        ? activeNovelsResult.data.map(novel => this.extractConceptFromNovel(novel))
        : [];
      
      // 고유한 컨셉 생성
      const conceptResult = await this.generateStoryConcept(existingConcepts);
      if (!conceptResult.success) {
        return err(conceptResult.error);
      }
      
      const concept = conceptResult.data;
      
      // 캠릭터 생성
      const charactersResult = await this.generateCharacters(concept);
      if (!charactersResult.success) {
        return err(charactersResult.error);
      }
      
      const characters = charactersResult.data;
      
      // 제목 생성
      const title = this.generateTitle(concept);
      const slug = this.generateSlug(title);
      
      // 소설 객체 생성
      const novel: Novel = {
        title,
        slug,
        author: '클로드 소네트 AI',
        status: '연재 중',
        summary: `${concept.world}에서 펼쳐지는 ${concept.main} 스토리`,
        publishedDate: new Date().toISOString().split('T')[0],
        totalChapters: 75,
        rating: 0,
        tropes: [concept.main, concept.sub],
        content: this.generateNovelDescription(concept, characters)
      };
      
      // 소설 저장
      const createResult = await this.novelRepository.createNovel(novel);
      if (!createResult.success) {
        return err(createResult.error);
      }
      
      // 첫 번째 챕터 생성
      const firstChapterResult = await this.generateFirstChapter(slug, concept, characters);
      let firstChapter: Chapter | undefined;
      
      if (firstChapterResult.success) {
        const chapterCreateResult = await this.chapterRepository.createChapter(firstChapterResult.data);
        if (chapterCreateResult.success) {
          firstChapter = firstChapterResult.data;
        }
      }
      
      const result: NewNovelResult = {
        novel,
        concept,
        firstChapter
      };
      
      return ok(result);
      
    } catch (error) {
      return err(new DomainError('GENERATION_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async generateNextChapter(novelSlug: string, options: GenerationOptions = {}): Promise<Result<NextChapterResult, DomainError>> {
    try {
      // 소설 정보 조회
      const novelResult = await this.novelRepository.getNovelMetadata(novelSlug);
      if (!novelResult.success) {
        return err(novelResult.error);
      }
      
      const novel = novelResult.data;
      
      // 진행도 조회
      const progressResult = await this.novelRepository.getNovelProgress(novelSlug);
      if (!progressResult.success) {
        return err(progressResult.error);
      }
      
      const progress = progressResult.data;
      const nextChapterNumber = progress.latestChapter + 1;
      
      // 감정 단계 결정
      const emotionStage = this.determineEmotionStage(progress.progressPercentage);
      
      // 챕터 생성
      const chapter: Chapter = {
        title: `${nextChapterNumber}화`,
        novel: novelSlug,
        chapterNumber: nextChapterNumber,
        publicationDate: new Date().toISOString().split('T')[0],
        wordCount: 1200 + Math.floor(Math.random() * 800), // 1200-2000자
        rating: 0,
        content: this.generateChapterContent(novel, nextChapterNumber, emotionStage)
      };
      
      // 챕터 저장
      const createResult = await this.chapterRepository.createChapter(chapter);
      if (!createResult.success) {
        return err(createResult.error);
      }
      
      const result: NextChapterResult = {
        chapter,
        chapterNumber: nextChapterNumber,
        emotionStage
      };
      
      return ok(result);
      
    } catch (error) {
      return err(new DomainError('GENERATION_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async completeNovel(novelSlug: string, options: GenerationOptions = {}): Promise<Result<CompletionResult, DomainError>> {
    try {
      // 진행도 조회
      const progressResult = await this.novelRepository.getNovelProgress(novelSlug);
      if (!progressResult.success) {
        return err(progressResult.error);
      }
      
      const progress = progressResult.data;
      const totalChapters = progress.novel.data.totalChapters || 75;
      const remainingChapters = totalChapters - progress.latestChapter;
      const finalChapters: number[] = [];
      
      // 남은 챕터들 생성 (3-5개 정도)
      const chaptersToGenerate = Math.min(remainingChapters, Math.max(3, Math.min(5, remainingChapters)));
      
      for (let i = 1; i <= chaptersToGenerate; i++) {
        const chapterNumber = progress.latestChapter + i;
        const isEpilogue = i === chaptersToGenerate;
        
        const chapter: Chapter = {
          title: isEpilogue ? '에필로그' : `${chapterNumber}화`,
          novel: novelSlug,
          chapterNumber,
          publicationDate: new Date().toISOString().split('T')[0],
          wordCount: 1000 + Math.floor(Math.random() * 500),
          rating: 0,
          content: this.generateFinalChapterContent(progress.novel, chapterNumber, isEpilogue)
        };
        
        const createResult = await this.chapterRepository.createChapter(chapter);
        if (createResult.success) {
          finalChapters.push(chapterNumber);
        }
      }
      
      // 소설 상태 업데이트
      await this.novelRepository.updateNovelStatus(novelSlug, '완결');
      
      const result: CompletionResult = {
        finalChapters,
        endingType: 'happy-ending'
      };
      
      return ok(result);
      
    } catch (error) {
      return err(new DomainError('GENERATION_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async generateStoryConcept(existingConcepts: StoryConcept[] = []): Promise<Result<StoryConcept, DomainError>> {
    try {
      const mainTropes = ['enemies-to-lovers', 'second-chance', 'fake-dating', 'arranged-marriage', 'forbidden-love'];
      const subTropes = ['regression', 'academy', 'political-intrigue', 'magic-academy', 'time-travel'];
      const worlds = ['마법 아카데미', '배람 왕국', '미래 마법 세계', '드래곤 제국', '서양 귀족 사회'];
      
      // 기존 컨셉과 중복되지 않는 조합 생성
      let attempts = 0;
      let concept: StoryConcept;
      
      do {
        const main = mainTropes[Math.floor(Math.random() * mainTropes.length)];
        const sub = subTropes[Math.floor(Math.random() * subTropes.length)];
        const world = worlds[Math.floor(Math.random() * worlds.length)];
        const mainConflict = this.generateMainConflict(main, sub);
        
        concept = {
          main,
          sub,
          world,
          mainConflict
        };
        
        attempts++;
      } while (this.isConceptDuplicate(concept, existingConcepts) && attempts < 10);
      
      return ok(concept);
      
    } catch (error) {
      return err(new DomainError('GENERATION_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async generateCharacters(concept: StoryConcept): Promise<Result<Character[], DomainError>> {
    try {
      const protagonistArchetypes = ['강한 여전사', '영리한 마법사', '용감한 귀족', '지혜로운 학자'];
      const maleLeadArchetypes = ['냉정한 기사', '신비한 마법사', '오만한 왕자', '따뜻한 선생님'];
      
      const characters: Character[] = [
        {
          name: '엘리아나',
          role: 'protagonist',
          archetype: protagonistArchetypes[Math.floor(Math.random() * protagonistArchetypes.length)],
          personality: '단호하지만 따뜻한 마음을 가진',
          background: `${concept.world}의 킹스로 성장한 소녀`
        },
        {
          name: '카엘',
          role: 'male_lead',
          archetype: maleLeadArchetypes[Math.floor(Math.random() * maleLeadArchetypes.length)],
          personality: '차가운 외모 뒤에 뜨거운 마음을 숨긴',
          background: `${concept.world}의 강력한 마법사`
        }
      ];
      
      return ok(characters);
      
    } catch (error) {
      return err(new DomainError('GENERATION_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Private helper methods
  private extractConceptFromNovel(novel: any): StoryConcept {
    return {
      main: novel.data.tropes?.[0] || 'enemies-to-lovers',
      sub: novel.data.tropes?.[1] || 'regression',
      world: '마법 아카데미', // 기본값
      mainConflict: '정치적 음모'
    };
  }

  private generateTitle(concept: StoryConcept): string {
    const titles = [
      `${concept.world}의 비밀`,
      `금지된 사랑의 주문`,
      `다시 만난 운명`,
      `마법사의 약혼자`,
      `드래곤의 심장`
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[\s+]/g, '-')
      .replace(/[^a-z0-9\-가-힣]/g, '')
      .substring(0, 30)
      + '-' + Date.now().toString().substring(-6);
  }

  private generateNovelDescription(concept: StoryConcept, characters: Character[]): string {
    const protagonist = characters.find(c => c.role === 'protagonist');
    const maleLead = characters.find(c => c.role === 'male_lead');
    
    return `${concept.world}에서 펼쳐지는 ${concept.mainConflict}을 중심으로 한 로맨스 판타지 소설입니다.

## 주요 캠릭터

**주인공**: ${protagonist?.name} - ${protagonist?.background}, ${protagonist?.personality}

**남주**: ${maleLead?.name} - ${maleLead?.archetype}, ${maleLead?.personality}`;
  }

  private async generateFirstChapter(novelSlug: string, concept: StoryConcept, characters: Character[]): Promise<Result<Chapter, DomainError>> {
    try {
      const chapter: Chapter = {
        title: '첫 만남',
        novel: novelSlug,
        chapterNumber: 1,
        publicationDate: new Date().toISOString().split('T')[0],
        wordCount: 1500,
        rating: 0,
        content: this.generateFirstChapterContent(concept, characters)
      };
      
      return ok(chapter);
    } catch (error) {
      return err(new DomainError('GENERATION_ERROR', error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private generateFirstChapterContent(concept: StoryConcept, characters: Character[]): string {
    const protagonist = characters.find(c => c.role === 'protagonist')?.name || '엘리아나';
    const maleLead = characters.find(c => c.role === 'male_lead')?.name || '카엘';
    
    return `달빛이 창가로 스며들던 그 밤, **${protagonist}**는 **마법서**의 마지막 페이지를 넘기고 있었다.

> *'이제 더 이상 돌아갈 곳이 없어...'*

> [문이 열리며 ${maleLead}이 들어왔다]

**${maleLead}**의 얼굴에는 두 사람의 첫 만남에 대한 긴장감이 엽보였다.

> "멈춰, ${protagonist}. 아직 준비가 되지 않았어."

**${maleLead}**이 낮은 목소리로 말했다.

> "준비?"

**${protagonist}**가 뒤돌아보며 웃었다.

> "나는 이미 충분히 기다렸어요."

${concept.world}의 고요한 밤 공기에서 두 사람의 시선이 마주쳤다.

> [긴장감이 흐르는 정적이 이어졌다]

**운명적인 만남**이 시작되는 순간이었다.`;
  }

  private generateChapterContent(novel: any, chapterNumber: number, emotionStage: string): string {
    return `# ${chapterNumber}화 - ${emotionStage}

**마법진**의 빛이 더욱 강해지며 두 사람을 감쌌다.

> *'이 순간이 올 줄 알았어...'*

**엘리아나**가 속으로 생각했다.

> "만약 내가 살아돌아온다면..."

**엘리아나**가 조심스럽게 말했다.

> [카엘의 손이 그녀의 뮨을 부드럽게 어루만졌다]

**카엘**은 ${emotionStage}의 감정을 드러내며 미소를 지었다.

> "나는 너를 잃을 수 없어."

**카엘**의 목소리가 속삭임으로 바뀌었다.

**두 사람 사이의 거리가 좋혀지는 순간**이었다.`;
  }

  private generateFinalChapterContent(novel: any, chapterNumber: number, isEpilogue: boolean): string {
    if (isEpilogue) {
      return `# 에필로그

몇 년이 흘렀다. **마법 아카데미**의 **성당**에서 두 사람이 다시 만났다.

> "그때 우리가 내린 선택이 옵았을까?"

**엘리아나**가 물었다.

> *'의무와 감정의 충돌이 마침내 끝났어...'*

**카엘**은 따뜻한 미소를 지었다.

> "후회는 없어. 우리는 함께 이겨냈으니까."

**카엘**이 따뜻하게 답했다.

**행복한 결말**이 그들을 기다리고 있었다.`;
    }
    
    return `# ${chapterNumber}화 - 마지막 결전

**모든 것이 명확해지는 순간**이 드디어 왔다.

> *'이제 모든 것이 끝났어...'*

> "이제 모든 것이 명확해졌어."

**엘리아나**가 말했다.

> [두 사람 사이의 거리가 좋혀졌다]

**마법의 빛** 속에서 그들의 눈이 마주쳤다.

**두 사람 사이의 모든 갈등이 해결되는 순간**이었다.`;
  }

  private determineEmotionStage(progressPercentage: number): string {
    if (progressPercentage < 20) return '첫 만남의 떨림';
    if (progressPercentage < 40) return '안타기운 갈등';
    if (progressPercentage < 60) return '마음의 변화';
    if (progressPercentage < 80) return '깊어지는 애정';
    return '운명의 결정';
  }

  private generateMainConflict(main: string, sub: string): string {
    const conflicts = {
      'enemies-to-lovers': '적대 관계에서 사랑으로',
      'second-chance': '두 번째 기회의 사랑',
      'fake-dating': '가짜 연인에서 진짜 사랑으로',
      'arranged-marriage': '정치적 결혼에서 사랑으로',
      'forbidden-love': '금지된 사랑의 성취'
    };
    
    return conflicts[main as keyof typeof conflicts] || '정치적 음모';
  }

  private isConceptDuplicate(concept: StoryConcept, existing: StoryConcept[]): boolean {
    return existing.some(existing => 
      existing.main === concept.main && 
      existing.sub === concept.sub && 
      existing.world === concept.world
    );
  }
}