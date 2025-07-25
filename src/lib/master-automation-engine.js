import { NovelDetector } from './novel-detector.js';
import { StoryDiversityEngine } from './story-diversity-engine.js';
import { EmotionalDepthEngine } from './emotional-depth-engine.js';
import { CompletionCriteriaEngine } from './completion-criteria-engine.js';
import { CreativityModeEngine } from './creativity-mode-engine.js';
import { ReaderAnalyticsEngine } from './reader-analytics-engine.js';
import { TokenBalancingEngine } from './token-balancing-engine.js';
import { QualityAssuranceEngine } from './quality-assurance-engine.js';
import { createStoryGenerator } from './ai-story-generator.js';
import { createHybridGenerator } from './hybrid-ai-generator.js';
// import { getQualitySample } from './high-quality-samples.js'; // 잘못된 장르 문제로 비활성화
import { shouldMockAIService, debugEnvironment, getEnvironmentInfo } from './environment.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export class MasterAutomationEngine {
  constructor(contentDir = 'src/content', dependencies = {}) {
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

    // 환경 정보 디버깅
    debugEnvironment();

    // AI 스토리 생성기 초기화 - 하이브리드 기본 설정
    this.aiGenerator = dependencies.aiGenerator || this.createAIGenerator();

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
        qualityPriority: true,
      },
    };
  }

  // 환경별 AI 생성기 생성
  createAIGenerator() {
    const shouldMock = shouldMockAIService() || this.dryRun === true;

    if (shouldMock) {
      const env = getEnvironmentInfo();
      console.log(
        `🧪 모킹 모드: MockAIGenerator 사용 (환경: ${env.nodeEnv}, 모킹 필요: ${shouldMock})`
      );
      return this.createMockAIGenerator();
    }

    // 하이브리드 AI 생성기 사용 시도
    const hybridGenerator = createHybridGenerator();
    if (hybridGenerator) {
      console.log('🌟 하이브리드 AI 시스템 사용 (Claude + Gemini)');
      return hybridGenerator;
    }

    // 폴백: Claude 단독 사용
    console.log('🤖 Claude 단독 서비스 사용');
    return createStoryGenerator();
  }

  // 모킹된 AI 생성기 생성
  createMockAIGenerator() {
    return {
      generateChapter: async options => {
        const { chapterNumber, tropes = ['enemies-to-lovers'] } = options;

        return {
          title: `${chapterNumber}화`,
          content: this.generateMockChapterContent(tropes, chapterNumber),
        };
      },

      improveChapter: async (content, criteria) => {
        return `개선된 ${content.substring(0, 100)}...`;
      },
    };
  }

  // 모킹 챕터 콘텐츠 생성
  generateMockChapterContent(tropes, chapterNumber) {
    const tropeElements = {
      'enemies-to-lovers': '적대적 긴장감 속에서도 서로에 대한 끌림',
      'fated-mates': '운명적 이끌림과 예언의 실현',
      regression: '과거의 기억과 미래에 대한 지식',
      'bodyguard-romance': '보호자와 피보호자 사이의 금지된 감정',
    };

    const mainTrope = tropes[0] || 'enemies-to-lovers';
    const tropeDescription = tropeElements[mainTrope] || '로맨틱한 긴장감';

    return `# ${chapterNumber}화

## 테스트 챕터

**모킹된 콘텐츠**: 이 챕터는 테스트를 위해 자동 생성된 내용입니다.

**주요 트롭**: ${mainTrope}

**스토리 요소**: ${tropeDescription}

> "이것은 테스트용 대화입니다."

주인공들 사이에 ${tropeDescription}이 흐르고 있었다.

### 장면 전개

테스트 환경에서 생성된 스토리가 자연스럽게 전개됩니다.

**워드카운트**: 약 500자 (테스트용)`;
  }

  // 🎯 메인 실행 함수 - 100% 자동화
  async executeAutomation() {
    console.log('🚀 마스터 자동화 엔진 시작...');

    try {
      // 1단계: 현재 상황 분석
      const situation = await this.analyzeSituation();

      // 가독성 있는 상황 요약 로깅
      console.log('📊 현재 상황 요약:');
      console.log(`   📚 활성 소설: ${situation.totalActiveCount}개`);
      console.log(`   🆕 새 소설 필요: ${situation.needsNewNovel ? 'YES' : 'NO'}`);
      console.log(`   🏁 완결 준비 소설: ${situation.readyForCompletion.length}개`);

      if (situation.activeNovels.length > 0) {
        console.log('   📖 활성 소설 목록:');
        situation.activeNovels.forEach((novel, index) => {
          console.log(`     ${index + 1}. ${novel.data?.title || novel.slug}`);
          console.log(
            `        진행도: ${novel.progressPercentage}% (${novel.latestChapter}/${novel.data?.totalChapters || 75}화)`
          );
          console.log(`        최종 업데이트: ${novel.lastUpdate.toLocaleDateString('ko-KR')}`);
        });
      }

      // 2단계: 액션 결정
      const action = this.decideAction(situation);
      console.log('🎯 결정된 액션:', action.type);

      // 3단계: 액션 실행
      const result = await this.executeAction(action, situation);

      // 실행 결과 요약 로깅
      console.log('✅ 실행 결과 요약:');
      if (result.completedNovel) {
        console.log(`   📚 완결 소설: ${result.completedNovel}`);
        console.log(`   📖 완결 챕터: ${result.finalChapters?.join(', ')}화`);
      } else if (result.newNovel) {
        console.log(`   🆕 새 소설: ${result.title}`);
        console.log(`   📖 첫 챕터: ${result.firstChapter}화`);
      } else if (result.continuedNovel) {
        console.log(`   📝 챕터 추가: ${result.newChapter}화`);
        console.log(`   📚 소설: ${result.continuedNovel}`);
        if (result.emotionStage) {
          console.log(`   😊 감정 단계: ${result.emotionStage}`);
        }
      }

      return {
        success: true,
        action: action.type,
        result,
        situation,
      };
    } catch (error) {
      console.error('❌ 자동화 실행 실패:');
      console.error(`   🔍 에러 타입: ${error.constructor.name}`);
      console.error(`   💬 에러 메시지: ${error.message}`);
      if (error.stack) {
        console.error(`   📍 스택 트레이스: ${error.stack.split('\n')[1]?.trim()}`);
      }

      return {
        success: false,
        error: error.message,
        errorType: error.constructor.name,
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
          plotProgress: ['시작', '발전', '절정'],
          relationshipStage: progress.progressPercentage > 80 ? 'union' : 'attraction',
          openThreads: progress.progressPercentage > 90 ? [] : ['subplot1'],
          characters: [
            { name: '주인공', growthArc: progress.progressPercentage },
            { name: '남주', growthArc: progress.progressPercentage - 5 },
          ],
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
      oldestUpdate:
        novelsWithProgress.length > 0
          ? Math.min(...novelsWithProgress.map(n => n.lastUpdate.getTime()))
          : Date.now(),
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
        priority: 'highest',
      };
    }

    // 2. 새 소설이 필요하면 생성
    if (situation.needsNewNovel) {
      return {
        type: 'CREATE_NEW_NOVEL',
        priority: 'high',
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
        priority: 'normal',
      };
    }

    // 4. 최후의 수단: 새 소설 생성
    return {
      type: 'CREATE_NEW_NOVEL',
      priority: 'fallback',
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
      relationshipStage: 'union',
      openThreads: [],
      characters: [
        { name: '주인공', growthArc: 95 },
        { name: '남주', growthArc: 90 },
      ],
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
    await this.updateNovelStatus(novel.slug, '완결');

    return {
      completedNovel: novel.slug,
      finalChapters,
      endingType: endingScenario.type,
    };
  }

  // 새 소설 생성
  async createNewNovel(situation) {
    console.log('🆕 새 소설 생성 중...');

    // 기존 작품들의 트로프 분석
    const existingCombinations = situation.activeNovels.map(novel => ({
      main: 'enemies-to-lovers', // 실제로는 소설 데이터에서 추출
      sub: 'regression',
      conflict: 'political-intrigue',
    }));

    // 고유한 컨셉 생성
    const uniqueConcept = this.storyEngine.generateUniqueNovelConcept(existingCombinations);

    // 제목 생성
    const title = this.storyEngine.generateCatchyTitle(uniqueConcept);

    // 하이브리드 AI로 소설 초기화 시도
    let novelInitialization = null;
    if (this.aiGenerator && typeof this.aiGenerator.initializeNovel === 'function') {
      try {
        console.log('🎭 하이브리드 AI로 소설 초기화 중...');
        novelInitialization = await this.aiGenerator.initializeNovel(
          title,
          [uniqueConcept.main, uniqueConcept.sub],
          uniqueConcept
        );
      } catch (error) {
        console.warn('⚠️ 하이브리드 초기화 실패, 기본 방식 사용:', error.message);
      }
    }

    // 캐릭터 생성 (하이브리드 결과 우선 사용)
    const characters =
      novelInitialization?.characters || this.storyEngine.designMemorableCharacters(uniqueConcept);

    // 소설 슬러그 생성
    const slug = this.generateSlug(title);

    // 소설 파일 생성 (하이브리드 정보 포함)
    await this.createNovelFile(slug, {
      title,
      concept: uniqueConcept,
      characters,
      worldSettings: novelInitialization?.worldSettings,
      plotStructure: novelInitialization?.plotStructure,
    });

    // 첫 번째 챕터 생성
    const firstChapter = await this.generateChapter(slug, 1, uniqueConcept, characters, true);
    await this.saveChapter(slug, 1, firstChapter);

    return {
      newNovel: slug,
      title,
      concept: uniqueConcept,
      firstChapter: 1,
    };
  }

  // 기존 소설 챕터 계속
  async continueChapter(novel) {
    console.log(`📝 챕터 계속: ${novel.data.title}`);

    const nextChapterNumber = novel.latestChapter + 1;

    // 현재 진행도에 따른 감정 단계 결정
    const currentStage = Math.max(
      1,
      Math.min(10, Math.floor((novel.progressPercentage / 100) * 10))
    );
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
      emotionStage: emotionStage.stage,
    };
  }

  // 챕터 생성 (실제 AI 통합)
  async generateChapter(
    novelSlug,
    chapterNumber,
    concept,
    characters,
    isFirst = false,
    emotionStage = null
  ) {
    console.log(`🤖 AI로 챕터 생성 중: ${novelSlug} ${chapterNumber}화`);

    // AI 생성기 확인
    if (!this.aiGenerator) {
      console.error('❌ AI 생성기 없음 - 실패로 처리');
      throw new Error('AI 생성기가 초기화되지 않았습니다. 소설 생성을 중단합니다.');
    }

    try {
      // 소설 정보 가져오기
      const novelData = await this.getNovelData(novelSlug);
      const previousContext = await this.getPreviousChapterContext(novelSlug, chapterNumber);

      // 개선된 AI 생성 및 품질 검증 프로세스
      let bestResult = null;
      let bestScore = 0;
      const maxRetries = 2; // 리트라이 수 감소로 효율성 증대

      for (let i = 0; i < maxRetries; i++) {
        console.log(`🤖 AI 챕터 생성 시도 (${i + 1}/${maxRetries})...`);

        try {
          let aiResult;

          if (i === 0) {
            // 첫 번째 시도: 표준 생성
            aiResult = await this.aiGenerator.generateChapter({
              title: novelData.title || '로맨스 판타지',
              tropes: concept.main
                ? [concept.main, concept.sub]
                : ['enemies-to-lovers', 'fated-mates'],
              chapterNumber,
              previousContext,
              characterContext: this.generateCharacterContext(characters),
              plotOutline: this.generatePlotContext(concept, chapterNumber),
            });
          } else {
            // 두 번째 시도: 이전 결과의 문제점을 바탕으로 개선
            const previousAssessment = await this.qualityEngine.assessQuality(bestResult.content);
            const mainIssues = previousAssessment.issues.slice(0, 2); // 주요 문제 2개만 집중

            console.log(`🔧 이전 결과 개선 중: ${mainIssues.join(', ')}`);
            const improvedContent = await this.aiGenerator.improveChapter(
              bestResult.content,
              mainIssues
            );

            aiResult = {
              title: bestResult.title,
              content: improvedContent,
            };
          }

          // 기본 분량 체크
          const wordCount = aiResult.content.replace(/\s+/g, '').length;
          console.log(`📄 생성된 콘텐츠 분량: ${wordCount}자`);

          // 상세 품질 검사
          const qualityAssessment = await this.qualityEngine.assessQuality(aiResult.content, {
            title: aiResult.title,
            chapterNumber,
            expectedLength: 3000,
          });

          console.log(
            `📊 품질 점수: ${qualityAssessment.score}/100 (상태: ${qualityAssessment.status})`
          );

          // 업데이트된 기준으로 승인 체크
          if (qualityAssessment.score >= this.qualityEngine.qualityStandards.qualityThreshold) {
            console.log(`✅ 품질 기준 통과! 대산 준비 완료`);
            return {
              frontmatter: {
                title: aiResult.title || `${chapterNumber}화`,
                novel: novelSlug,
                chapterNumber,
                publicationDate: new Date().toISOString().split('T')[0],
                wordCount: this.calculateWordCount(aiResult.content),
                rating: 0,
              },
              content: aiResult.content,
            };
          }

          // 최고 점수 기록 업데이트
          if (qualityAssessment.score > bestScore) {
            bestScore = qualityAssessment.score;
            bestResult = aiResult;
          }

          // 주요 문제점 로깅
          if (qualityAssessment.issues.length > 0) {
            console.log(`⚠️ 주요 문제점: ${qualityAssessment.issues.slice(0, 2).join(', ')}`);
          }
        } catch (error) {
          console.error(`❌ 시도 ${i + 1} 실패:`, error.message);
          if (i === maxRetries - 1) {
            throw error;
          }
        }
      }

      // 모든 시도가 기준에 미달하는 경우 최고 점수 결과 반환
      if (bestResult) {
        console.log(`⚠️ 품질 기준 미달이지만 최고 점수(${bestScore}/100) 결과 반환`);

        const finalContent = bestResult.content;

        return {
          frontmatter: {
            title: bestResult.title || `${chapterNumber}화`,
            novel: novelSlug,
            chapterNumber,
            publicationDate: new Date().toISOString().split('T')[0],
            wordCount: this.calculateWordCount(finalContent),
            rating: 0,
          },
          content: finalContent,
        };
      }

      // 여기에 도달하면 모든 시도가 실패한 경우
      console.error(`❌ AI 생성 완전 실패 - 샘플 콘텐츠 없이 실패 처리`);
      throw new Error('AI generated content failed to meet minimum standards after all retries.');
    } catch (error) {
      console.error('❌ AI 챕터 생성 실패:', error.message);
      console.error('🚨 소설 콘텐츠는 폴백 없이 실패로 처리됩니다.');
      throw error; // 실패를 그대로 전파
    }
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
    // 하이브리드 AI 정보 활용
    const worldInfo = novelData.worldSettings
      ? `\n\n## 세계관 설정\n${novelData.worldSettings.substring(0, 500)}...`
      : '';

    const plotInfo = novelData.plotStructure
      ? `\n\n## 플롯 구조\n${novelData.plotStructure.substring(0, 500)}...`
      : '';

    const frontmatter = `---
title: "${novelData.title}"
author: "하이브리드 AI (Claude + Gemini)"
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

**주인공**: ${novelData.characters.protagonist?.background || '신비로운 배경'}, ${novelData.characters.protagonist?.personality || '매력적인 성격'}

**남주**: ${novelData.characters.male_lead?.archetype || '강력한 존재'}, ${novelData.characters.male_lead?.personality || '복잡한 내면'}${worldInfo}${plotInfo}`;

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
    const title = isEpilogue ? '에필로그' : chapterData.frontmatter.title;

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
    return (
      title
        .toLowerCase()
        .replace(/[가-힣]/g, char => {
          // 한글을 영문으로 간단 변환
          const korean = '가나다라마바사아자차카타파하';
          const english = 'ganadarambasaajachakatapha'; // cspell: disable-line
          const index = korean.indexOf(char);
          return index !== -1 ? english[index] : char;
        })
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 30) +
      '-' +
      Date.now().toString().substring(-6)
    );
  }

  async generateFinalChapter(novel, chapterNumber, scene, isEpilogue) {
    console.log(`🏁 AI로 완결 챕터 생성 중: ${novel.slug} ${chapterNumber}화`);

    // AI 생성기 확인
    if (!this.aiGenerator) {
      console.error('❌ AI 생성기 없음 - 완결 챕터 생성 실패');
      throw new Error('AI 생성기가 초기화되지 않았습니다. 완결 챕터 생성을 중단합니다.');
    }

    try {
      // 소설 정보 가져오기
      const novelData = await this.getNovelData(novel.slug);
      const previousContext = await this.getPreviousChapterContext(novel.slug, chapterNumber);
      
      // 소설의 트로프와 배경 정보 추출
      const tropes = novelData.tropes || ['enemies-to-lovers', 'fated-mates'];
      const title = novelData.title || '로맨스 판타지';
      
      // 완결 전용 컨텍스트 생성
      const completionContext = `
이 소설의 완결 챕터입니다.
이전 전체 줄거리: ${previousContext}
주요 결말 장면: ${scene}
에필로그 여부: ${isEpilogue ? '에필로그' : '일반 완결 챕터'}
자연스러운 결말을 위한 감정적 마무리가 필요합니다.`;

      // 완결 챕터 생성
      const finalChapter = await this.aiGenerator.generateChapter({
        title,
        tropes,
        chapterNumber,
        previousContext: completionContext,
        characterContext: this.extractCharacterNamesFromNovel(novelData),
        plotOutline: `소설 완결 - ${scene} 장면으로 마무리`,
        isCompletion: true,
        isEpilogue
      });

      // 단어수 계산
      const wordCount = this.calculateWordCount(finalChapter.content);

      return {
        frontmatter: {
          title: isEpilogue ? '에필로그' : finalChapter.title || `${chapterNumber}화`,
          novel: novel.slug,
          chapterNumber,
          publicationDate: new Date().toISOString().split('T')[0],
          wordCount,
          rating: 0,
        },
        content: finalChapter.content,
      };
    } catch (error) {
      console.error('❌ 완결 챕터 AI 생성 실패:', error.message);
      throw new Error(`완결 챕터 생성 실패: ${error.message}`);
    }
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
        const tropesMatch = frontmatter.match(/tropes:\s*\[(.*?)\]/);
        
        let tropes = ['enemies-to-lovers', 'fated-mates']; // 기본값
        if (tropesMatch) {
          try {
            // tropes 배열 파싱
            const tropesStr = tropesMatch[1].replace(/"/g, '').split(',').map(t => t.trim());
            if (tropesStr.length > 0 && tropesStr[0] !== '') {
              tropes = tropesStr;
            }
          } catch {
            // 파싱 실패 시 기본값 사용
          }
        }
        
        return {
          title: titleMatch ? titleMatch[1] : '로맨스 판타지',
          tropes,
          content,
        };
      }
    } catch {
      console.warn(`소설 데이터 로드 실패: ${novelSlug}`);
    }
    return { 
      title: '로맨스 판타지', 
      tropes: ['enemies-to-lovers', 'fated-mates'],
      content: '' 
    };
  }

  async getPreviousChapterContext(novelSlug, currentChapter) {
    if (currentChapter <= 1) return '';

    try {
      const prevChapterPath = join(
        this.chaptersDir,
        `${novelSlug}-ch${(currentChapter - 1).toString().padStart(2, '0')}.md`
      );
      const content = await fs.readFile(prevChapterPath, 'utf-8');
      // 마지막 500자만 컨텍스트로 사용
      return content.slice(-500);
    } catch {
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

  /**
   * 소설 데이터에서 캐릭터 이름 추출
   */
  extractCharacterNamesFromNovel(novelData) {
    if (!novelData || !novelData.content) {
      return '주인공과 남주의 로맨스 스토리';
    }

    // 마크다운에서 캐릭터 정보 추출 시도
    const characterSection = novelData.content.match(/## 주요 캐릭터[\s\S]*?(?=##|$)/);
    if (characterSection) {
      return characterSection[0];
    }

    // 기본값 반환
    return '주인공과 남주의 로맨스 스토리';
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
