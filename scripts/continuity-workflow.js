#!/usr/bin/env node

/**
 * 연계성 기반 소설 연재 워크플로우
 * 캐릭터, 세계관, 스토리 연속성을 보장하는 완전 자동화 시스템
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env.local') });

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 설정
const CONFIG = {
  NOVELS_DIR: path.join(__dirname, '../src/content/novels'),
  CHAPTERS_DIR: path.join(__dirname, '../src/content/chapters'),
  CONTINUITY_DATA: path.join(__dirname, '../data/continuity'),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY
};

class ContinuityWorkflowEngine {
  constructor() {
    if (!CONFIG.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    
    this.genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 4000,
        topP: 0.9,
        topK: 40
      }
    });
    
    this.log = this.createLogger();
  }

  createLogger() {
    return {
      info: (msg, data = {}) => console.log(`[${new Date().toISOString()}] ℹ️  ${msg}`, data),
      success: (msg, data = {}) => console.log(`[${new Date().toISOString()}] ✅ ${msg}`, data),
      warn: (msg, data = {}) => console.log(`[${new Date().toISOString()}] ⚠️  ${msg}`, data),
      error: (msg, data = {}) => console.log(`[${new Date().toISOString()}] ❌ ${msg}`, data)
    };
  }

  /**
   * 연속성 데이터 구조 초기화
   */
  async initializeContinuity() {
    await fs.mkdir(CONFIG.CONTINUITY_DATA, { recursive: true });
    
    const continuityTemplate = {
      metadata: {
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      },
      worldSettings: {
        name: '',
        magicSystem: {
          type: '',
          rules: [],
          limitations: []
        },
        geography: [],
        politics: [],
        culture: []
      },
      characters: {
        protagonist: {
          name: '',
          age: null,
          appearance: {},
          personality: [],
          abilities: [],
          background: '',
          relationships: {},
          currentState: {}
        },
        love_interest: {
          name: '',
          age: null,
          appearance: {},
          personality: [],
          abilities: [],
          background: '',
          relationships: {},
          currentState: {}
        },
        supporting: []
      },
      plot: {
        mainArc: '',
        currentPhase: '',
        completedEvents: [],
        activeConflicts: [],
        foreshadowing: [],
        themes: []
      },
      timeline: [],
      quality_checkpoints: []
    };

    return continuityTemplate;
  }

  /**
   * 소설 메타데이터에서 연속성 정보 추출
   */
  async extractContinuityFromNovel(novelSlug) {
    try {
      // 연속성 데이터 디렉토리 생성
      await fs.mkdir(CONFIG.CONTINUITY_DATA, { recursive: true });
      
      const novelPath = path.join(CONFIG.NOVELS_DIR, `${novelSlug}.md`);
      const novelContent = await fs.readFile(novelPath, 'utf-8');
      const { data: novelMeta } = matter(novelContent);

      // 첫 번째 챕터 읽기
      const firstChapterPath = path.join(CONFIG.CHAPTERS_DIR, `${novelSlug}-ch1.md`);
      const chapterContent = await fs.readFile(firstChapterPath, 'utf-8');
      const { data: chapterMeta, content: chapterText } = matter(chapterContent);

      this.log.info('연속성 정보 추출 시작', { novel: novelMeta.title });

      const extractionPrompt = `
소설과 첫 번째 챕터를 분석하여 연속성 정보를 추출해주세요.

=== 소설 정보 ===
제목: ${novelMeta.title}
요약: ${novelMeta.summary}
트로프: ${novelMeta.tropes?.join(', ')}

=== 첫 번째 챕터 ===
제목: ${chapterMeta.title}
내용: ${chapterText}

다음 JSON 형식으로 연속성 정보를 추출해주세요:

{
  "worldSettings": {
    "name": "세계 이름",
    "magicSystem": {
      "type": "마법 시스템 유형",
      "rules": ["규칙1", "규칙2"],
      "limitations": ["제약1", "제약2"]
    },
    "geography": ["지역1", "지역2"],
    "politics": ["정치 상황"],
    "culture": ["문화적 특징"]
  },
  "characters": {
    "protagonist": {
      "name": "주인공 이름",
      "age": 나이,
      "appearance": {"hair": "머리색", "eyes": "눈색", "build": "체형"},
      "personality": ["성격1", "성격2"],
      "abilities": ["능력1", "능력2"],
      "background": "배경 설명",
      "currentState": {"location": "현재 위치", "emotion": "감정 상태", "motivation": "동기"}
    },
    "love_interest": {
      "name": "남주 이름",
      "age": 나이,
      "appearance": {"hair": "머리색", "eyes": "눈색", "build": "체형"},
      "personality": ["성격1", "성격2"],
      "abilities": ["능력1", "능력2"],
      "background": "배경 설명",
      "currentState": {"location": "현재 위치", "emotion": "감정 상태", "motivation": "동기"}
    },
    "supporting": []
  },
  "plot": {
    "mainArc": "메인 스토리 아크",
    "currentPhase": "현재 진행 단계",
    "completedEvents": ["완료된 사건1"],
    "activeConflicts": ["진행 중 갈등1"],
    "foreshadowing": ["복선1"],
    "themes": ["주제1", "주제2"]
  }
}
`;

      const result = await this.model.generateContent(extractionPrompt);
      const responseText = result.response.text();
      
      // JSON 부분 추출
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 형식을 찾을 수 없습니다.');
      }

      const continuityData = JSON.parse(jsonMatch[0]);
      
      // 메타데이터 추가
      continuityData.metadata = {
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        novelSlug,
        currentChapter: 1
      };

      // 타임라인 초기화
      continuityData.timeline = [{
        chapter: 1,
        title: chapterMeta.title,
        summary: `첫 만남: ${continuityData.characters.protagonist.name}과 ${continuityData.characters.love_interest.name}`,
        keyEvents: chapterMeta.keyEvents || [],
        date: new Date().toISOString()
      }];

      // 연속성 데이터 저장
      const continuityPath = path.join(CONFIG.CONTINUITY_DATA, `${novelSlug}.json`);
      await fs.writeFile(continuityPath, JSON.stringify(continuityData, null, 2), 'utf-8');

      this.log.success('연속성 정보 추출 완료', { 
        characters: Object.keys(continuityData.characters).length,
        worldName: continuityData.worldSettings.name
      });

      return continuityData;
    } catch (error) {
      this.log.error('연속성 정보 추출 실패', { error: error.message });
      throw error;
    }
  }

  /**
   * 연속성 데이터 로드
   */
  async loadContinuityData(novelSlug) {
    try {
      const continuityPath = path.join(CONFIG.CONTINUITY_DATA, `${novelSlug}.json`);
      const data = await fs.readFile(continuityPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      this.log.warn('연속성 데이터 없음, 추출 시작', { novelSlug });
      return await this.extractContinuityFromNovel(novelSlug);
    }
  }

  /**
   * 연속성 유지 프롬프트 생성
   */
  buildContinuityPrompt(continuityData, targetChapter) {
    const { worldSettings, characters, plot, timeline } = continuityData;
    const lastChapter = timeline[timeline.length - 1];

    return `
[연속성 보장 시스템 - 절대 변경 금지]

소설: ${continuityData.metadata.novelSlug}
현재 생성: ${targetChapter}화

=== 캐릭터 설정 (절대 변경 금지) ===
주인공: ${characters.protagonist.name}
- 나이: ${characters.protagonist.age}
- 외모: ${JSON.stringify(characters.protagonist.appearance)}
- 성격: ${characters.protagonist.personality.join(', ')}
- 능력: ${characters.protagonist.abilities.join(', ')}
- 현재 상태: ${JSON.stringify(characters.protagonist.currentState)}

남주: ${characters.love_interest.name}
- 나이: ${characters.love_interest.age}
- 외모: ${JSON.stringify(characters.love_interest.appearance)}
- 성격: ${characters.love_interest.personality.join(', ')}
- 능력: ${characters.love_interest.abilities.join(', ')}
- 현재 상태: ${JSON.stringify(characters.love_interest.currentState)}

=== 세계관 설정 (절대 준수) ===
세계명: ${worldSettings.name}
마법 시스템: ${worldSettings.magicSystem.type}
- 규칙: ${worldSettings.magicSystem.rules.join(', ')}
- 제약: ${worldSettings.magicSystem.limitations.join(', ')}
지역: ${worldSettings.geography.join(', ')}

=== 직전 챕터 연결 ===
${lastChapter.chapter}화: ${lastChapter.title}
요약: ${lastChapter.summary}
주요 사건: ${lastChapter.keyEvents.join(', ')}

=== 진행 중인 플롯 ===
메인 아크: ${plot.mainArc}
현재 단계: ${plot.currentPhase}
활성 갈등: ${plot.activeConflicts.join(', ')}
복선: ${plot.foreshadowing.join(', ')}

=== 연속성 규칙 ===
1. 캐릭터 이름/성격/능력 절대 변경 금지
2. 직전 챕터와 자연스럽게 연결
3. 세계관 설정 100% 준수
4. 감정선 급변 금지 (점진적 변화만)
5. 기존 관계성 유지

=== 작성 요구사항 ===
- 분량: 2,500-3,500자
- 대화 40%, 서술 60%
- 로맨스 감정선 발전
- 챕터 말미 클리프행어
- 캐릭터 내적 변화 표현

=== 출력 형식 (JSON) ===
{
  "title": "챕터 제목",
  "content": "본문 내용 (2,500-3,500자)",
  "summary": "100자 이내 요약",
  "keyEvents": ["핵심 사건1", "핵심 사건2"],
  "characterUpdates": {
    "${characters.protagonist.name}": {
      "location": "현재 위치",
      "emotion": "감정 상태",
      "newRealizations": ["깨달음1"]
    },
    "${characters.love_interest.name}": {
      "location": "현재 위치", 
      "emotion": "감정 상태",
      "newRealizations": ["깨달음1"]
    }
  },
  "plotProgression": {
    "mainArcProgress": "메인 플롯 진전",
    "newConflicts": ["새로운 갈등"],
    "resolvedConflicts": ["해결된 갈등"],
    "newForeshadowing": ["새 복선"]
  },
  "emotionalTone": "romantic|tense|hopeful|conflicted",
  "cliffhanger": "다음 화 기대 포인트"
}

${targetChapter}화를 연속성을 유지하며 작성해주세요.
`;
  }

  /**
   * 연속성 기반 챕터 생성
   */
  async generateContinuousChapter(novelSlug, targetChapter) {
    try {
      this.log.info('연속성 기반 챕터 생성 시작', { novel: novelSlug, chapter: targetChapter });

      // 연속성 데이터 로드
      const continuityData = await this.loadContinuityData(novelSlug);

      // 연속성 프롬프트 생성
      const prompt = this.buildContinuityPrompt(continuityData, targetChapter);

      // AI 생성
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      // JSON 파싱
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('생성된 응답에서 JSON을 찾을 수 없습니다.');
      }

      const generatedData = JSON.parse(jsonMatch[0]);

      // 연속성 검증
      await this.validateContinuity(continuityData, generatedData, targetChapter);

      // 챕터 파일 저장
      await this.saveChapter(novelSlug, targetChapter, generatedData);

      // 연속성 데이터 업데이트
      await this.updateContinuityData(novelSlug, targetChapter, generatedData);

      this.log.success('연속성 기반 챕터 생성 완료', {
        chapter: targetChapter,
        title: generatedData.title,
        wordCount: generatedData.content.length
      });

      return generatedData;
    } catch (error) {
      this.log.error('연속성 기반 챕터 생성 실패', { error: error.message });
      throw error;
    }
  }

  /**
   * 연속성 검증
   */
  async validateContinuity(continuityData, generatedData, chapterNumber) {
    const errors = [];
    const warnings = [];

    // 캐릭터 이름 일관성 검증
    const protag = continuityData.characters.protagonist;
    const loveInterest = continuityData.characters.love_interest;

    if (!generatedData.content.includes(protag.name)) {
      errors.push(`주인공 이름 '${protag.name}' 누락`);
    }

    if (!generatedData.content.includes(loveInterest.name)) {
      warnings.push(`남주 이름 '${loveInterest.name}' 미언급`);
    }

    // 세계관 일관성 검증
    const worldName = continuityData.worldSettings.name;
    if (worldName && !generatedData.content.includes(worldName)) {
      warnings.push(`세계명 '${worldName}' 미언급`);
    }

    // 분량 검증
    if (generatedData.content.length < 2000) {
      warnings.push('분량 부족 (2000자 미만)');
    }

    if (errors.length > 0) {
      throw new Error(`연속성 검증 실패: ${errors.join(', ')}`);
    }

    if (warnings.length > 0) {
      this.log.warn('연속성 경고', { warnings });
    }

    this.log.success('연속성 검증 통과', { 
      chapter: chapterNumber,
      warnings: warnings.length 
    });
  }

  /**
   * 챕터 파일 저장
   */
  async saveChapter(novelSlug, chapterNumber, generatedData) {
    const frontmatter = {
      title: generatedData.title,
      novel: novelSlug,
      chapterNumber: chapterNumber,
      publicationDate: new Date().toISOString().split('T')[0],
      wordCount: generatedData.content.length,
      contentRating: '15+',
      emotionalTone: generatedData.emotionalTone || '달콤한',
      keyEvents: generatedData.keyEvents || ['스토리 진행'],
      characterDevelopment: '캐릭터 발전 사항'
    };

    // undefined 값 제거
    const cleanFrontmatter = {};
    for (const [key, value] of Object.entries(frontmatter)) {
      if (value !== undefined && value !== null) {
        cleanFrontmatter[key] = value;
      }
    }

    const chapterContent = matter.stringify(generatedData.content, cleanFrontmatter);
    const filename = `${novelSlug}-ch${chapterNumber}.md`;
    const filepath = path.join(CONFIG.CHAPTERS_DIR, filename);

    await fs.writeFile(filepath, chapterContent, 'utf-8');
    this.log.success('챕터 파일 저장', { filepath });

    // 소설 메타데이터의 totalChapters 업데이트
    await this.updateNovelChapterCount(novelSlug, chapterNumber);
  }

  /**
   * 소설 챕터 수 업데이트
   */
  async updateNovelChapterCount(novelSlug, chapterNumber) {
    try {
      const novelPath = path.join(CONFIG.NOVELS_DIR, `${novelSlug}.md`);
      const novelContent = await fs.readFile(novelPath, 'utf-8');
      const { data: frontmatter, content } = matter(novelContent);

      frontmatter.totalChapters = Math.max(frontmatter.totalChapters || 1, chapterNumber);
      
      const updatedContent = matter.stringify(content, frontmatter);
      await fs.writeFile(novelPath, updatedContent, 'utf-8');
      
      this.log.success('소설 메타데이터 업데이트', { 
        novel: novelSlug, 
        totalChapters: frontmatter.totalChapters 
      });
    } catch (error) {
      this.log.error('소설 메타데이터 업데이트 실패', { error: error.message });
    }
  }

  /**
   * 연속성 데이터 업데이트
   */
  async updateContinuityData(novelSlug, chapterNumber, generatedData) {
    const continuityPath = path.join(CONFIG.CONTINUITY_DATA, `${novelSlug}.json`);
    const continuityData = JSON.parse(await fs.readFile(continuityPath, 'utf-8'));

    // 메타데이터 업데이트
    continuityData.metadata.lastUpdated = new Date().toISOString();
    continuityData.metadata.currentChapter = chapterNumber;

    // 캐릭터 상태 업데이트
    if (generatedData.characterUpdates) {
      for (const [charName, updates] of Object.entries(generatedData.characterUpdates)) {
        if (continuityData.characters.protagonist.name === charName) {
          Object.assign(continuityData.characters.protagonist.currentState, updates);
        }
        if (continuityData.characters.love_interest.name === charName) {
          Object.assign(continuityData.characters.love_interest.currentState, updates);
        }
      }
    }

    // 플롯 진행 업데이트
    if (generatedData.plotProgression) {
      const { plotProgression } = generatedData;
      
      if (plotProgression.mainArcProgress) {
        continuityData.plot.currentPhase = plotProgression.mainArcProgress;
      }
      
      if (plotProgression.newConflicts) {
        continuityData.plot.activeConflicts.push(...plotProgression.newConflicts);
      }
      
      if (plotProgression.resolvedConflicts) {
        continuityData.plot.activeConflicts = continuityData.plot.activeConflicts
          .filter(conflict => !plotProgression.resolvedConflicts.includes(conflict));
      }
      
      if (plotProgression.newForeshadowing) {
        continuityData.plot.foreshadowing.push(...plotProgression.newForeshadowing);
      }
    }

    // 타임라인 추가
    continuityData.timeline.push({
      chapter: chapterNumber,
      title: generatedData.title,
      summary: generatedData.summary,
      keyEvents: generatedData.keyEvents || [],
      date: new Date().toISOString()
    });

    // 저장
    await fs.writeFile(continuityPath, JSON.stringify(continuityData, null, 2), 'utf-8');
    this.log.success('연속성 데이터 업데이트 완료', { chapter: chapterNumber });
  }

  /**
   * Git 커밋 및 푸시
   */
  async commitAndPush(chapterNumber, novelSlug) {
    try {
      this.log.info('Git 커밋 시작');
      
      await execAsync('git add .');
      await execAsync(`git commit -m "연속성 기반 자동 연재: ${novelSlug} ${chapterNumber}화 - ${new Date().toLocaleString('ko-KR')}"`);
      
      this.log.success('Git 커밋 완료');
      
      try {
        await execAsync('git push origin main');
        this.log.success('Git 푸시 완료');
      } catch (pushError) {
        this.log.warn('Git 푸시 실패 (로컬 커밋은 성공)', { error: pushError.message });
      }
    } catch (error) {
      this.log.error('Git 작업 실패', { error: error.message });
    }
  }

  /**
   * 전체 워크플로우 실행
   */
  async runContinuityWorkflow(novelSlug, chapterCount = 5) {
    try {
      this.log.info('🌟 연속성 기반 연재 워크플로우 시작', { 
        novel: novelSlug, 
        targetChapters: chapterCount 
      });

      const continuityData = await this.loadContinuityData(novelSlug);
      const startChapter = continuityData.metadata.currentChapter + 1;

      for (let i = 0; i < chapterCount; i++) {
        const chapterNumber = startChapter + i;
        
        this.log.info(`\n=== ${chapterNumber}화 생성 시작 ===`);
        
        // 연속성 기반 챕터 생성
        const generatedChapter = await this.generateContinuousChapter(novelSlug, chapterNumber);
        
        // Git 커밋
        await this.commitAndPush(chapterNumber, novelSlug);
        
        this.log.success(`${chapterNumber}화 생성 완료`, {
          title: generatedChapter.title,
          wordCount: generatedChapter.content.length
        });

        // 다음 챕터 생성 전 딜레이 (API 레이트 리밋 고려)
        if (i < chapterCount - 1) {
          this.log.info('다음 챕터 생성 전 대기 중...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      this.log.success('🎉 연속성 기반 연재 워크플로우 완료', {
        novel: novelSlug,
        generatedChapters: chapterCount,
        finalChapter: startChapter + chapterCount - 1
      });

      return { success: true, chaptersGenerated: chapterCount };
    } catch (error) {
      this.log.error('💥 연속성 워크플로우 실패', { error: error.message });
      throw error;
    }
  }
}

// CLI 실행
async function main() {
  try {
    const args = process.argv.slice(2);
    const novelSlug = args[0] || 'elf-shadow-moonlight-bloom';
    const chapterCount = parseInt(args[1]) || 5;

    console.log(`
🚀 연속성 기반 소설 연재 워크플로우
📚 소설: ${novelSlug}
📖 생성 챕터 수: ${chapterCount}개
⏰ 시작 시간: ${new Date().toLocaleString('ko-KR')}
`);

    const engine = new ContinuityWorkflowEngine();
    await engine.runContinuityWorkflow(novelSlug, chapterCount);

    console.log('\n✅ 모든 작업이 성공적으로 완료되었습니다!');
  } catch (error) {
    console.error('\n❌ 워크플로우 실행 실패:', error.message);
    process.exit(1);
  }
}

// 직접 실행시에만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ContinuityWorkflowEngine };