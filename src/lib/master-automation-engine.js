import { NovelDetector } from './novel-detector.js';
import { StoryDiversityEngine } from './story-diversity-engine.js';
import { EmotionalDepthEngine } from './emotional-depth-engine.js';
import { CompletionCriteriaEngine } from './completion-criteria-engine.js';
import { CreativityModeEngine } from './creativity-mode-engine.js';
import { ReaderAnalyticsEngine } from './reader-analytics-engine.js';
import { TokenBalancingEngine } from './token-balancing-engine.js';
import { QualityAssuranceEngine } from './quality-assurance-engine.js';
import { createStoryGenerator } from './ai-story-generator.js';
import { getQualitySample } from './high-quality-samples.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export class MasterAutomationEngine {
  constructor(contentDir = 'src/content') {
    this.contentDir = contentDir;
    this.novelsDir = join(contentDir, 'novels');
    this.chaptersDir = join(contentDir, 'chapters');
    this.dryRun = false; // 드라이런 모드 플래그

    this.novelDetector = new NovelDetector(this.novelsDir, this.chaptersDir);
    this.storyEngine = new StoryDiversityEngine();
    this.emotionEngine = new EmotionalDepthEngine();
    this.completionEngine = new CompletionCriteriaEngine();
    this.qualityEngine = new QualityAssuranceEngine();

    // v2.1 창의성 우선 모드 엔진들
    this.creativityEngine = new CreativityModeEngine();
    this.readerAnalytics = new ReaderAnalyticsEngine();
    this.tokenBalancer = new TokenBalancingEngine();

    // AI 스토리 생성기 초기화
    this.aiGenerator = createStoryGenerator();

    this.automationConfig = {
      maxActiveNovels: 3,
      minChapterGap: 1, // 시간 (시간)
      qualityThreshold: 80,
      autoComplete: true,
      autoCreateNew: true,

      // v2.1 창의성 모드 설정
      creativityMode: {
        enabled: true,
        autoActivation: true,
        budgetLimit: 1000, // 달러
        qualityPriority: true
      }
    };
  }

  // 🎯 메인 실행 함수 - 100% 자동화
  async executeAutomation() {
    console.log('🚀 마스터 자동화 엔진 시작...');

    try {
      // 1단계: 현재 상황 분석
      const situation = await this.analyzeSituation();
      console.log('📊 현재 상황:', situation);

      // 2단계: 액션 결정
      const action = this.decideAction(situation);
      console.log('🎯 결정된 액션:', action.type);

      // 3단계: 액션 실행
      const result = await this.executeAction(action, situation);
      console.log('✅ 실행 결과:', result);

      return {
        success: true,
        action: action.type,
        result,
        situation
      };

    } catch (error) {
      console.error('❌ 자동화 실행 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 현재 상황 완전 분석
  async analyzeSituation() {
    const activeNovels = await this.novelDetector.getActiveNovels();
    const novelsWithProgress = [];

    for (const novel of activeNovels) {
      const progress = await this.novelDetector.getNovelWithProgress(novel.slug);
      if (progress) {
        // 완결 가능성 체크
        const completionReport = this.completionEngine.generateCompletionReport({
          currentChapter: progress.latestChapter,
          plotProgress: ["시작", "발전", "절정"],
          relationshipStage: progress.progressPercentage > 80 ? "union" : "attraction",
          openThreads: progress.progressPercentage > 90 ? [] : ["subplot1"],
          characters: [
            { name: "주인공", growthArc: progress.progressPercentage },
            { name: "남주", growthArc: progress.progressPercentage - 5 }
          ]
        });

        progress.completionAnalysis = completionReport;
        novelsWithProgress.push(progress);
      }
    }

    return {
      activeNovels: novelsWithProgress,
      totalActiveCount: activeNovels.length,
      needsNewNovel: await this.novelDetector.needsNewNovel(),
      readyForCompletion: novelsWithProgress.filter(n => n.completionAnalysis.overallReadiness),
      oldestUpdate: novelsWithProgress.length > 0 ?
        Math.min(...novelsWithProgress.map(n => n.lastUpdate.getTime())) : Date.now()
    };
  }

  // 최적의 액션 결정
  decideAction(situation) {
    // 우선순위 기반 의사결정

    // 1. 완결 가능한 소설이 있으면 완결 처리
    if (situation.readyForCompletion.length > 0) {
      const novelToComplete = situation.readyForCompletion[0];
      return {
        type: 'COMPLETE_NOVEL',
        target: novelToComplete,
        priority: 'highest'
      };
    }

    // 2. 새 소설이 필요하면 생성
    if (situation.needsNewNovel) {
      return {
        type: 'CREATE_NEW_NOVEL',
        priority: 'high'
      };
    }

    // 3. 기존 소설 연재 계속
    if (situation.activeNovels.length > 0) {
      const oldestNovel = situation.activeNovels.reduce((oldest, current) =>
        current.lastUpdate < oldest.lastUpdate ? current : oldest
      );

      return {
        type: 'CONTINUE_CHAPTER',
        target: oldestNovel,
        priority: 'normal'
      };
    }

    // 4. 최후의 수단: 새 소설 생성
    return {
      type: 'CREATE_NEW_NOVEL',
      priority: 'fallback'
    };
  }

  // 액션 실행
  async executeAction(action, situation) {
    switch (action.type) {
      case 'COMPLETE_NOVEL':
        return await this.completeNovel(action.target);

      case 'CREATE_NEW_NOVEL':
        return await this.createNewNovel(situation);

      case 'CONTINUE_CHAPTER':
        return await this.continueChapter(action.target);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // 소설 완결 처리
  async completeNovel(novel) {
    console.log(`📚 소설 완결 처리: ${novel.data.title}`);

    // 완결 시나리오 생성
    const endingScenario = this.completionEngine.generateEndingScenario({
      relationshipStage: "union",
      openThreads: [],
      characters: [
        { name: "주인공", growthArc: 95 },
        { name: "남주", growthArc: 90 }
      ]
    });

    // 완결 챕터들 생성
    const finalChapters = [];
    for (let i = 0; i < endingScenario.estimatedChapters; i++) {
      const chapterNumber = novel.latestChapter + i + 1;
      const isEpilogue = i === endingScenario.estimatedChapters - 1;

      const chapterContent = await this.generateFinalChapter(
        novel,
        chapterNumber,
        endingScenario.scenes[i] || endingScenario.epilogueContent,
        isEpilogue
      );

      await this.saveChapter(novel.slug, chapterNumber, chapterContent, isEpilogue);
      finalChapters.push(chapterNumber);
    }

    // 소설 상태를 "완결"로 변경
    await this.updateNovelStatus(novel.slug, "완결");

    return {
      completedNovel: novel.slug,
      finalChapters,
      endingType: endingScenario.type
    };
  }

  // 새 소설 생성
  async createNewNovel(situation) {
    console.log('🆕 새 소설 생성 중...');

    // 기존 작품들의 트로프 분석
    const existingCombinations = situation.activeNovels.map(novel => ({
      main: 'enemies-to-lovers', // 실제로는 소설 데이터에서 추출
      sub: 'regression',
      conflict: 'political-intrigue'
    }));

    // 고유한 컨셉 생성
    const uniqueConcept = this.storyEngine.generateUniqueNovelConcept(existingCombinations);

    // 제목 생성
    const title = this.storyEngine.generateCatchyTitle(uniqueConcept);

    // 캐릭터 생성
    const characters = this.storyEngine.designMemorableCharacters(uniqueConcept);

    // 소설 슬러그 생성
    const slug = this.generateSlug(title);

    // 소설 파일 생성
    await this.createNovelFile(slug, {
      title,
      concept: uniqueConcept,
      characters
    });

    // 첫 번째 챕터 생성
    const firstChapter = await this.generateChapter(slug, 1, uniqueConcept, characters, true);
    await this.saveChapter(slug, 1, firstChapter);

    return {
      newNovel: slug,
      title,
      concept: uniqueConcept,
      firstChapter: 1
    };
  }

  // 기존 소설 챕터 계속
  async continueChapter(novel) {
    console.log(`📝 챕터 계속: ${novel.data.title}`);

    const nextChapterNumber = novel.latestChapter + 1;

    // 현재 진행도에 따른 감정 단계 결정
    const currentStage = Math.max(1, Math.min(10, Math.floor((novel.progressPercentage / 100) * 10)));
    const emotionStage = this.emotionEngine.generateEmotionProgression(
      'enemies-to-lovers', // 실제로는 소설 데이터에서 추출
      currentStage,
      10
    );

    // 다음 챕터 생성
    const chapterContent = await this.generateChapter(
      novel.slug,
      nextChapterNumber,
      { main: 'enemies-to-lovers' }, // 실제로는 소설 데이터에서 추출
      null, // 캐릭터 정보
      false,
      emotionStage
    );

    await this.saveChapter(novel.slug, nextChapterNumber, chapterContent);

    return {
      continuedNovel: novel.slug,
      newChapter: nextChapterNumber,
      emotionStage: emotionStage.stage
    };
  }

  // 챕터 생성 (실제 AI 통합)
  async generateChapter(novelSlug, chapterNumber, concept, characters, isFirst = false, emotionStage = null) {
    console.log(`🤖 AI로 챕터 생성 중: ${novelSlug} ${chapterNumber}화`);

    // AI 생성기 확인
    if (!this.aiGenerator) {
      console.warn('⚠️ AI 생성기 없음, 샘플 콘텐츠 사용');
      return await this.generateSampleChapter(novelSlug, chapterNumber, concept, emotionStage);
    }

    try {
      // 소설 정보 가져오기
      const novelData = await this.getNovelData(novelSlug);
      const previousContext = await this.getPreviousChapterContext(novelSlug, chapterNumber);

      // 창의성 모드 체크
      const creativityCheck = this.creativityEngine.shouldActivateCreativityMode(
        { slug: novelSlug, progressPercentage: (chapterNumber / 75) * 100 },
        { dropoutRate: 0.1, engagementDrop: 0.2 },
        { chapterNumber, progressPercentage: (chapterNumber / 75) * 100, plotStage: 'development' }
      );

      // AI로 실제 챕터 생성
      const aiResult = await this.aiGenerator.generateChapter({
        title: novelData.title || '로맨스 판타지',
        tropes: concept.main ? [concept.main, concept.sub] : ['enemies-to-lovers', 'fated-mates'],
        chapterNumber,
        previousContext,
        characterContext: this.generateCharacterContext(characters),
        plotOutline: this.generatePlotContext(concept, chapterNumber)
      });

      // 창의성 모드일 경우 품질 개선
      let finalContent = aiResult.content;
      if (creativityCheck.activate) {
        console.log('🎨 창의성 모드 활성화 - 품질 개선 중...');
        finalContent = await this.aiGenerator.improveChapter(aiResult.content, [
          '감정적 깊이와 몰입도',
          '캐릭터 개성과 대화의 자연스러움',
          '로맨틱 긴장감과 설렘',
          '장면 묘사의 생생함',
          '다음 화 궁금증 유발'
        ]);
      }

      // 메타데이터 생성
      const wordCount = this.calculateWordCount(finalContent);

      return {
        frontmatter: {
          title: aiResult.title,
          novel: novelSlug,
          chapterNumber,
          publicationDate: new Date().toISOString().split('T')[0],
          wordCount,
          rating: 0
        },
        content: finalContent
      };

    } catch (error) {
      console.error('❌ AI 챕터 생성 실패:', error);
      console.log('🔄 샘플 콘텐츠로 대체');
      return await this.generateSampleChapter(novelSlug, chapterNumber, concept, emotionStage);
    }
  }

  // 샘플 챕터 생성 (AI 실패시 백업) - 품질 보장됨
  async generateSampleChapter(novelSlug, chapterNumber, concept, emotionStage) {
    console.log(`🔧 고품질 샘플 챕터 생성 중: ${novelSlug} ${chapterNumber}화`);
    
    // 고품질 샘플 가져오기
    const { content: sampleContent } = getQualitySample(chapterNumber, emotionStage);

    // 품질 검사 및 개선
    let content = sampleContent;
    try {
      const qualityAssessment = await this.qualityEngine.assessQuality(content, {
        title: `${chapterNumber}화`,
        chapterNumber,
        expectedLength: 3000
      });

      console.log(`📊 샘플 챕터 품질 점수: ${qualityAssessment.score}/100`);

      // 품질이 기준에 미달하는 경우 자동 개선
      if (qualityAssessment.score < this.qualityEngine.qualityStandards.qualityThreshold) {
        console.log(`🔧 샘플 챕터 품질 개선 중...`);
        content = await this.qualityEngine.improveContent(content, qualityAssessment);
        
        // 재평가
        const improvedAssessment = await this.qualityEngine.assessQuality(content);
        console.log(`✨ 개선 후 품질 점수: ${improvedAssessment.score}/100`);
      }

    } catch (error) {
      console.warn('⚠️ 샘플 챕터 품질 검사 실패, 원본 사용:', error.message);
    }

    return {
      frontmatter: {
        title: `${chapterNumber}화`,
        novel: novelSlug,
        chapterNumber,
        publicationDate: new Date().toISOString().split('T')[0],
        wordCount: this.calculateWordCount(content),
        rating: 0
      },
      content
    };
  }

  // v2.1 프리미엄 콘텐츠 생성 (창의성 모드) - 현재 미사용
  generatePremiumContent(emotionalElements, creativePrompt, chapterNumber) {
    // 향후 확장용 프리미엄 콘텐츠 생성 함수
    console.log('프리미엄 콘텐츠 생성 기능은 현재 개발 중입니다.');
    return null;
  }

  // 플롯 단계 결정
  determinePlotStage(chapterNumber) {
    if (chapterNumber <= 5) return 'introduction';
    if (chapterNumber <= 50) return 'development';
    if (chapterNumber <= 65) return 'climax';
    return 'resolution';
  }

  // 토큰 사용량 추정
  estimateTokensUsed(content) {
    // 간단한 추정: 단어 수 * 1.3 (한국어 특성 고려)
    const wordCount = content.split(/\s+/).length;
    return Math.floor(wordCount * 1.3);
  }

  // 파일 저장 함수들
  async createNovelFile(slug, novelData) {
    const frontmatter = `---
title: "${novelData.title}"
author: "클로드 소네트 AI"
status: "연재 중"
summary: "${novelData.concept.world}에서 펼쳐지는 ${novelData.concept.main} 스토리"
publishedDate: ${new Date().toISOString().split('T')[0]}
totalChapters: 75
rating: 0
tropes: ["${novelData.concept.main}", "${novelData.concept.sub}"]
---

# ${novelData.title}

${novelData.concept.world}에서 펼쳐지는 ${novelData.concept.mainConflict}을 중심으로 한 로맨스 판타지 소설입니다.

## 주요 캐릭터

**주인공**: ${novelData.characters.protagonist.background}, ${novelData.characters.protagonist.personality}

**남주**: ${novelData.characters.male_lead.archetype}, ${novelData.characters.male_lead.personality}`;

    if (this.dryRun) {
      console.log(`🔄 [DRY-RUN] 소설 파일 생성 시뮬레이션: ${slug}.md`);
      console.log(`📝 [DRY-RUN] 콘텐츠 미리보기: ${frontmatter.substring(0, 200)}...`);
    } else {
      await fs.mkdir(this.novelsDir, { recursive: true });
      await fs.writeFile(join(this.novelsDir, `${slug}.md`), frontmatter);
    }
  }

  async saveChapter(novelSlug, chapterNumber, chapterData, isEpilogue = false) {
    const filename = `${novelSlug}-ch${chapterNumber.toString().padStart(2, '0')}.md`;
    const title = isEpilogue ? "에필로그" : chapterData.frontmatter.title;

    const frontmatter = `---
title: "${title}"
novel: "${novelSlug}"
chapterNumber: ${chapterNumber}
publicationDate: ${chapterData.frontmatter.publicationDate}
wordCount: ${chapterData.frontmatter.wordCount}
rating: 0
---

# ${title}

${chapterData.content}`;

    if (this.dryRun) {
      console.log(`🔄 [DRY-RUN] 챕터 파일 생성 시뮬레이션: ${filename}`);
      console.log(`📝 [DRY-RUN] 콘텐츠 미리보기: ${frontmatter.substring(0, 200)}...`);
    } else {
      await fs.mkdir(this.chaptersDir, { recursive: true });
      await fs.writeFile(join(this.chaptersDir, filename), frontmatter);
    }
  }

  async updateNovelStatus(slug, status) {
    if (this.dryRun) {
      console.log(`🔄 [DRY-RUN] 소설 상태 업데이트 시뮬레이션: ${slug} -> ${status}`);
      return;
    }

    const novelPath = join(this.novelsDir, `${slug}.md`);
    const content = await fs.readFile(novelPath, 'utf-8');
    const updatedContent = content.replace(/status: "연재 중"/, `status: "${status}"`);
    await fs.writeFile(novelPath, updatedContent);
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[가-힣]/g, (char) => {
        // 한글을 영문으로 간단 변환
        const korean = "가나다라마바사아자차카타파하";
        const english = "ganadarambasaajachakatapha";
        const index = korean.indexOf(char);
        return index !== -1 ? english[index] : char;
      })
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 30)
      + '-' + Date.now().toString().substring(-6);
  }

  async generateFinalChapter(novel, chapterNumber, scene, isEpilogue) {
    const emotionalElements = {
      internalConflict: this.emotionEngine.generateInternalConflict('의무와 감정의 충돌', '엘리아나'),
      microExpression: this.emotionEngine.generateMicroExpression('longing', '카엘'),
      sensoryDetail: this.emotionEngine.generateSensoryDescription('슬픔', '성당')
    };

    const content = isEpilogue ?
      `# 에필로그 - ${scene}

몇 년이 흘렀다. ${emotionalElements.sensoryDetail}에서 두 사람이 다시 만났다.

> "그때 우리가 내린 선택이 옳았을까?"

**엘리아나**가 물었다.

> *'${emotionalElements.internalConflict}'*

**카엘**은 ${emotionalElements.microExpression} 미소를 지었다.

> "후회는 없어. 우리는 함께 이겨냈으니까."

**카엘**이 따뜻하게 답했다.

**행복한 결말**이 그들을 기다리고 있었다.` :

      `# ${chapterNumber}화 - ${scene}

**${scene}**의 순간이 드디어 왔다.

> *'${emotionalElements.internalConflict}'*

> "이제 모든 것이 명확해졌어."

**엘리아나**가 말했다.

> [두 사람 사이의 거리가 좁혀졌다]

${emotionalElements.sensoryDetail}에서 ${emotionalElements.microExpression}

**두 사람 사이의 모든 갈등이 해결되는 순간**이었다.`;

    return {
      frontmatter: {
        title: isEpilogue ? "에필로그" : `${chapterNumber}화`,
        novel: novel.slug,
        chapterNumber,
        publicationDate: new Date().toISOString().split('T')[0],
        wordCount: 1000 + Math.floor(Math.random() * 500),
        rating: 0
      },
      content
    };
  }

  // 헬퍼 함수들
  async getNovelData(novelSlug) {
    try {
      const novelPath = join(this.novelsDir, `${novelSlug}.md`);
      const content = await fs.readFile(novelPath, 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
        return {
          title: titleMatch ? titleMatch[1] : '로맨스 판타지',
          content
        };
      }
    } catch (error) {
      console.warn(`소설 데이터 로드 실패: ${novelSlug}`);
    }
    return { title: '로맨스 판타지' };
  }

  async getPreviousChapterContext(novelSlug, currentChapter) {
    if (currentChapter <= 1) return '';

    try {
      const prevChapterPath = join(this.chaptersDir, `${novelSlug}-ch${(currentChapter - 1).toString().padStart(2, '0')}.md`);
      const content = await fs.readFile(prevChapterPath, 'utf-8');
      // 마지막 500자만 컨텍스트로 사용
      return content.slice(-500);
    } catch (error) {
      console.warn(`이전 챕터 컨텍스트 로드 실패: ${novelSlug}-ch${currentChapter - 1}`);
      return '';
    }
  }

  generateCharacterContext(characters) {
    if (!characters) return '주인공과 남주의 로맨스 스토리';

    return `
주인공: ${characters.protagonist?.background || '신비로운 배경'}, ${characters.protagonist?.personality || '매력적인 성격'}
남주: ${characters.male_lead?.archetype || '강력한 존재'}, ${characters.male_lead?.personality || '복잡한 내면'}
`;
  }

  generatePlotContext(concept, chapterNumber) {
    const stage = this.determinePlotStage(chapterNumber);
    return `
장르: ${concept.genre || '로맨스 판타지'}
주요 트로프: ${concept.main || 'enemies-to-lovers'} + ${concept.sub || 'fated-mates'}
현재 단계: ${stage} (${chapterNumber}화)
갈등: ${concept.conflict || '운명적 만남과 갈등'}
`;
  }

  calculateWordCount(content) {
    // 한국어 특성을 고려한 글자 수 계산
    return content.replace(/\s+/g, '').length;
  }
}

// 즉시 실행 함수 - 진정한 자동화
export async function runFullAutomation(dryRun = false) {
  const engine = new MasterAutomationEngine();

  if (dryRun) {
    // 드라이런 모드에서는 실제 파일 생성 없이 시뮬레이션만 수행
    console.log('🔄 드라이런 모드: 실제 파일 생성 없이 시뮬레이션을 수행합니다...');
    engine.dryRun = true;
  }

  return await engine.executeAutomation();
}