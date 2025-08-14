/**
 * MasterAutomationEngine을 위한 동적 생성 메서드들
 * 정적 콘텐츠를 100% AI 생성으로 전환하는 새로운 메서드들
 */

import { join } from 'path';
import type {
  Novel,
  Chapter,
  CharacterProfile,
  WorldSettings,
  PlotStructure,
} from './types/index.js';

interface NovelData {
  title: string;
  summary: string;
  hook: string;
  characters: {
    female: CharacterProfile;
    male: CharacterProfile;
  };
  worldSetting: WorldSettings;
  tropeCombination: {
    main_trope: string;
    sub_tropes: string[];
  };
  plotStructure: PlotStructure;
  keywords: string[];
}

interface ChapterOptions {
  novel: string;
  chapter: string | number;
  characters: string[];
  worldSettings: WorldSettings;
}

export const dynamicMethods = {
  /**
   * 완전히 동적인 소설 파일 생성
   */
  async createDynamicNovelFile(slug: string, novelData: NovelData): Promise<string> {
    const {
      title,
      summary,
      hook,
      characters,
      worldSetting,
      tropeCombination,
      plotStructure,
      keywords,
    } = novelData;

    const frontmatter = `---
title: "${title}"
author: "하이브리드 AI (Claude + Gemini)"
status: "연재 중"
summary: "${summary}"
publishedDate: ${new Date().toISOString().split('T')[0]}
totalChapters: 75
rating: 0
tropes: ["${tropeCombination.main_trope}", "${tropeCombination.sub_tropes.join('", "')}"]
characterNames: ["${characters.female.name}", "${characters.male.name}"]
worldName: "${worldSetting.world_name}"
keywords: ["${keywords.join('", "')}"]
---

# ${title}

${summary}

*${hook}*

## 세계관: ${worldSetting.world_name}

${worldSetting.setting_description}

**마법 시스템**: ${worldSetting.magic_system}
**사회 구조**: ${worldSetting.social_structure}

### 주요 장소
${worldSetting.key_locations.map(loc => `- **${loc}**`).join('\n')}

### 독특한 요소
${worldSetting.unique_elements.map(elem => `- ${elem}`).join('\n')}

## 주요 캐릭터

**${characters.female.name} (여주인공)**
- **의미**: ${characters.female.meaning}
- **성격**: ${characters.female.personality_hint}

**${characters.male.name} (남주인공)**
- **의미**: ${characters.male.meaning}
- **성격**: ${characters.male.personality_hint}

## 스토리 트로프

**주요 트로프**: ${tropeCombination.main_trope}
**보조 트로프**: ${tropeCombination.sub_tropes.join(', ')}
**갈등 요소**: ${tropeCombination.conflict_driver}
**로맨스 텐션**: ${tropeCombination.romance_tension}

### 독창적 반전
${tropeCombination.unique_twist}

## 플롯 구조

### 도입부 (${plotStructure.introduction.chapters})
- **관계 단계**: ${plotStructure.introduction.relationship_stage}
- **주요 사건**: ${plotStructure.introduction.key_events.join(', ')}

### 전개부 (${plotStructure.development.chapters})
- **관계 단계**: ${plotStructure.development.relationship_stage}
- **갈등 확대**: ${plotStructure.development.conflict_escalation}

### 절정부 (${plotStructure.climax.chapters})
- **관계 단계**: ${plotStructure.climax.relationship_stage}
- **주요 위기**: ${plotStructure.climax.major_crisis}

### 결말부 (${plotStructure.resolution.chapters})
- **관계 단계**: ${plotStructure.resolution.relationship_stage}
- **결말 유형**: ${plotStructure.resolution.ending_type}`;

    if (this.dryRun) {
      console.log(`🔄 [DRY-RUN] 동적 소설 파일 생성 시뮬레이션: ${slug}.md`);
      console.log(
        `📝 [DRY-RUN] 완전 동적 생성 콘텐츠 미리보기: ${frontmatter.substring(0, 300)}...`
      );
    } else {
      await this.ensureDirectoryExists(this.novelsDir);
      const novelPath = this.join(this.novelsDir, `${slug}.md`);
      await this.writeFile(novelPath, frontmatter);
      console.log(`📚 100% 동적 생성 소설 파일 저장: ${novelPath}`);
    }
  },

  /**
   * 완전히 동적인 챕터 생성
   */
  async generateDynamicChapter(novelSlug, chapterNumber, novelContext, chapterTitle) {
    console.log(`🎭 100% 동적 챕터 생성: ${novelSlug} ${chapterNumber}화 - "${chapterTitle}"`);

    if (!this.aiGenerator) {
      throw new Error('AI 생성기가 초기화되지 않았습니다.');
    }

    try {
      const { title, characters, characterNames, worldSetting, tropeCombination, plotStructure } =
        novelContext;

      // 이전 챕터들의 컨텍스트 추출
      const previousContext = await this.getPreviousChapterContext(novelSlug, chapterNumber);

      // 현재 플롯 단계 결정
      const plotStage = this.determinePlotStage(chapterNumber);

      // 캐릭터 정보 정규화 (두 가지 형식 지원)
      let finalCharacters;
      if (characters && characters.female && characters.male) {
        // 완전한 캐릭터 객체가 있는 경우 (새 소설 생성시)
        finalCharacters: any = characters;
      } else if (characterNames && characterNames.length >= 2) {
        // characterNames 배열만 있는 경우 (기존 소설 계속시)
        finalCharacters = {
          female: {
            name: characterNames[0],
            meaning: '아름다운 의미',
            personality_hint: '강인하고 지혜로운',
          },
          male: {
            name: characterNames[1],
            meaning: '강력한 의미',
            personality_hint: '신비롭고 카리스마 있는',
          },
        };
      } else {
        // 폴백: 기본 캐릭터 정보
        console.warn('⚠️ 캐릭터 정보 부족, 기본값 사용');
        finalCharacters = {
          female: {
            name: '세라핀',
            meaning: '천사의 이름',
            personality_hint: '강인하고 지혜로운',
          },
          male: {
            name: '다미안',
            meaning: '정복자',
            personality_hint: '신비롭고 카리스마 있는',
          },
        };
      }

      // 완전히 동적인 캐릭터 컨텍스트 생성
      const dynamicCharacterContext = `
**${finalCharacters.female.name}** (${finalCharacters.female.meaning}): ${finalCharacters.female.personality_hint}
**${finalCharacters.male.name}** (${finalCharacters.male.meaning}): ${finalCharacters.male.personality_hint}

⚠️ 중요: 반드시 여주는 "${finalCharacters.female.name}", 남주는 "${finalCharacters.male.name}"을 사용하세요.
절대로 다른 이름을 사용하지 마세요.`;

      // 세계관 정보 정규화
      const finalWorldSetting = worldSetting || {
        world_name: '판타지 왕국',
        setting_description: '마법과 로맨스가 어우러진 환상적인 세계',
        magic_system: '엘레멘탈 마법 시스템',
      };

      // 트로프 정보 정규화
      const finalTropeCombination = tropeCombination || {
        main_trope: title?.includes('시간') ? 'time-manipulation' : 'enemies-to-lovers',
        conflict_driver: '운명적 갈등',
        romance_tension: '마법적 연결',
      };

      // 동적 플롯 컨텍스트 생성
      const dynamicPlotContext = `
**세계관**: ${finalWorldSetting.world_name} - ${finalWorldSetting.setting_description}
**마법 시스템**: ${finalWorldSetting.magic_system}
**주요 트로프**: ${finalTropeCombination.main_trope}
**현재 단계**: ${plotStage} (${chapterNumber}화)
**관계 단계**: ${plotStructure?.relationship_stage || '발전 중'}
**갈등 요소**: ${finalTropeCombination.conflict_driver}
**로맨스 텐션**: ${finalTropeCombination.romance_tension}`;

      // AI 챕터 생성 (기존 generateChapter와 동일한 품질 보장)
      let bestResult = null;
      const bestScore = 0;
      const maxRetries = 2;

      for (let i = 0; i < maxRetries; i++) {
        console.log(`🤖 동적 AI 챕터 생성 시도 (${i + 1}/${maxRetries})...`);

        const aiResult = await this.aiGenerator.generateChapter({
          title: title || '로맨스 판타지',
          tropes: [finalTropeCombination.main_trope, ...(finalTropeCombination.sub_tropes || [])],
          chapterNumber,
          chapterTitle, // 동적 생성된 제목 사용
          previousContext,
          characterContext: dynamicCharacterContext,
          plotOutline: dynamicPlotContext,
          worldSetting: finalWorldSetting.setting_description,
          isDynamic: true, // 완전 동적 생성 표시
        });

        if (!aiResult?.content) {
          console.error(`❌ 동적 AI 생성 결과 유효하지 않음:`, aiResult);
          continue;
        }

        // 품질 평가
        const qualityScore = await this.qualityEngine.assessQuality(aiResult.content);
        console.log(`📊 동적 생성 품질 점수: ${qualityScore.score}/100`);

        if (qualityScore.score > bestScore) {
          bestScore: any = qualityScore.score;
          bestResult = {
            title: chapterTitle, // 동적 생성된 제목 사용
            content: aiResult.content,
            qualityScore: qualityScore.score,
          };
        }

        // 품질 임계값 충족시 조기 종료
        if (qualityScore.score >= this.automationConfig.qualityThreshold) {
          console.log(`✅ 동적 생성 품질 기준 충족: ${qualityScore.score}/100`);
          break;
        }
      }

      if (bestResult) {
        // 일일 생성 카운트 증가
        this.incrementDailyCount(novelSlug);

        return {
          frontmatter: {
            title: bestResult.title,
            novel: novelSlug,
            chapterNumber,
            publicationDate: new Date().toISOString().split('T')[0],
            wordCount: this.calculateWordCount(bestResult.content),
            rating: 0,
            dynamicallyGenerated: true, // 완전 동적 생성 표시
            qualityScore: bestResult.qualityScore,
          },
          content: bestResult.content,
        };
      }

      throw new Error('동적 AI 생성이 품질 기준을 충족하지 못했습니다.');
    } catch (error) {
      console.error('❌ 동적 챕터 생성 실패:', error.message);
      throw error;
    }
  },

  /**
   * 이전 사건들 추출 (동적 분석)
   */
  async extractPreviousEvents(novelSlug, lastChapterNumber) {
    if (lastChapterNumber <= 0) return '이야기 시작';

    try {
      // 최근 2-3개 챕터의 주요 사건만 추출
      const recentChapters = [];
      const startChapter = Math.max(1, lastChapterNumber - 2);

      for (let i = startChapter; i <= lastChapterNumber; i++) {
        const chapterPath = this.join(
          this.chaptersDir,
          `${novelSlug}-ch${i.toString().padStart(2, '0')}.md`
        );
        try {
          const content = await this.readFile(chapterPath, 'utf-8');
          // 챕터 내용에서 주요 사건 키워드 추출
          const events = this.extractKeyEvents(content);
          if (events.length > 0) {
            recentChapters.push(`${i}화: ${events.join(', ')}`);
          }
        } catch {
          // 챕터가 없으면 스킵
        }
      }

      return recentChapters.join(' → ') || '이전 사건들';
    } catch {
      return '이전 사건 분석 불가';
    }
  },

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
  },

  /**
   * 콘텐츠에서 주요 사건 키워드 추출
   */
  extractKeyEvents(content) {
    const eventKeywords = [
      '만남',
      '갈등',
      '위기',
      '해결',
      '고백',
      '이별',
      '재회',
      '비밀',
      '폭로',
      '계약',
      '결정',
      '변화',
      '성장',
      '깨달음',
    ];

    const events = [];
    eventKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        events.push(keyword);
      }
    });

    return events.slice(0, 3); // 최대 3개 이벤트만 반환
  },

  /**
   * 파일 시스템 헬퍼 메서드들
   */
  async ensureDirectoryExists(dirPath) {
    const fs = await import('fs/promises');
    await fs.mkdir(dirPath, { recursive: true });
  },

  async readFile(filePath, encoding) {
    const fs = await import('fs/promises');
    return await fs.readFile(filePath, encoding);
  },

  async writeFile(filePath, content) {
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, content, 'utf-8');
  },

  join(...paths) {
    return join(...paths);
  },
};
