#!/usr/bin/env node

/**
 * 🌟 World-Class Quality System 챕터 생성기
 * 
 * World-Class Enhancement Engine을 사용하여 새로운 챕터를 생성
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// World-Class Enhancement Engine 가져오기
import { WorldClassEnhancementEngine } from '../src/lib/world-class-enhancement-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// 환경변수 로드
dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

class WorldClassChapterGenerator {
  constructor() {
    this.logger = {
      info: (msg, data) => console.log(`ℹ️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      warn: (msg, data) => console.log(`⚠️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      error: (msg, data) => console.log(`❌ ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      success: (msg, data) => console.log(`✅ ${msg}`, data ? JSON.stringify(data, null, 2) : '')
    };
    
    this.enhancementEngine = new WorldClassEnhancementEngine(this.logger);
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  }

  async generateNewChapter(novelSlug, targetChapterNumber) {
    console.log(`🌟 새로운 World-Class 챕터 생성 시작: ${novelSlug} - 챕터 ${targetChapterNumber}\n`);
    
    try {
      // 소설 정보 로드
      const novelInfo = await this.loadNovelInfo(novelSlug);
      console.log(`📚 소설: ${novelInfo.title}`);
      console.log(`📝 줄거리: ${novelInfo.summary.substring(0, 100)}...`);
      console.log(`🏷️  트로프: ${novelInfo.tropes.join(', ')}\n`);
      
      // 이전 챕터들 로드
      const previousChapters = await this.loadPreviousChapters(novelSlug, targetChapterNumber - 1);
      console.log(`📖 이전 챕터 ${previousChapters.length}개 로드 완료\n`);
      
      // 스토리 연속성 분석
      const storyContext = this.analyzeStoryContext(novelInfo, previousChapters, targetChapterNumber);
      
      // 초기 챕터 생성
      console.log('🔮 Gemini AI로 초기 챕터 생성...');
      const initialChapter = await this.generateInitialChapter(novelInfo, previousChapters, storyContext);
      
      // World-Class Enhancement 적용
      console.log('✨ World-Class Enhancement 적용...');
      const enhancedResult = await this.enhancementEngine.transformToWorldClass(
        initialChapter.content,
        storyContext
      );
      
      // 최종 챕터 구성
      const finalChapter = {
        title: initialChapter.title,
        novel: novelSlug,
        chapterNumber: targetChapterNumber,
        publicationDate: new Date().toISOString().split('T')[0],
        wordCount: enhancedResult.enhancedContent.length,
        contentRating: '15+',
        emotionalTone: storyContext.emotionalTone,
        keyEvents: this.extractKeyEvents(enhancedResult.enhancedContent),
        characterDevelopment: '캐릭터 발전 사항',
        qualityScore: parseFloat(enhancedResult.finalQuality.overallScore.toFixed(1)),
        worldClassStatus: enhancedResult.finalQuality.worldClassStatus,
        lastQualityCheck: new Date().toISOString(),
        content: enhancedResult.enhancedContent
      };
      
      // 결과 출력
      this.displayResults(finalChapter, enhancedResult);
      
      // 저장 여부 확인
      const args = process.argv.slice(2);
      if (args.includes('--save')) {
        await this.saveChapter(finalChapter);
        await this.updateNovelInfo(novelSlug, targetChapterNumber);
      } else {
        console.log('💡 챕터를 저장하려면 --save 옵션을 사용하세요.');
        console.log(`   예: node scripts/generate-world-class-chapter.js ${novelSlug} ${targetChapterNumber} --save`);
      }
      
      return finalChapter;
      
    } catch (error) {
      console.error('❌ 챕터 생성 실패:', error.message);
      throw error;
    }
  }
  
  async loadNovelInfo(novelSlug) {
    const novelPath = join(PROJECT_ROOT, 'src/content/novels', `${novelSlug}.md`);
    const novelContent = await fs.readFile(novelPath, 'utf-8');
    const { data } = matter(novelContent);
    return data;
  }
  
  async loadPreviousChapters(novelSlug, maxChapter) {
    const chapters = [];
    for (let i = 1; i <= maxChapter; i++) {
      try {
        const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `${novelSlug}-ch${i}.md`);
        const chapterContent = await fs.readFile(chapterPath, 'utf-8');
        const { data, content } = matter(chapterContent);
        chapters.push({ ...data, content, chapterNumber: i });
      } catch (error) {
        console.warn(`⚠️  챕터 ${i} 로드 실패: ${error.message}`);
      }
    }
    return chapters;
  }
  
  analyzeStoryContext(novelInfo, previousChapters, targetChapterNumber) {
    const lastChapter = previousChapters[previousChapters.length - 1];
    
    return {
      novelType: 'romance-fantasy',
      chapterNumber: targetChapterNumber,
      allowBackstory: true,
      emotionalTone: lastChapter?.emotionalTone || 'romance',
      tropes: novelInfo.tropes,
      previousEvents: previousChapters.map(ch => ch.keyEvents || []).flat(),
      characterProgress: this.analyzeCharacterProgress(previousChapters),
      plotStage: this.determinePlotStage(targetChapterNumber, novelInfo.totalChapters)
    };
  }
  
  analyzeCharacterProgress(chapters) {
    // 간단한 캐릭터 진행 분석
    return {
      리아: { development: '능력 각성 진행 중', relationships: ['에시온'] },
      에시온: { development: '신뢰 관계 형성', relationships: ['리아'] }
    };
  }
  
  determinePlotStage(chapterNumber, totalChapters) {
    const progress = chapterNumber / (totalChapters || 50);
    if (progress <= 0.3) return 'introduction';
    if (progress <= 0.6) return 'rising_action';
    if (progress <= 0.8) return 'climax';
    return 'resolution';
  }
  
  async generateInitialChapter(novelInfo, previousChapters, storyContext) {
    const lastChapter = previousChapters[previousChapters.length - 1];
    
    const prompt = `
당신은 세계급 로맨스 판타지 작가입니다. 다음 소설의 새로운 챕터를 작성해주세요.

**소설 정보:**
- 제목: ${novelInfo.title}
- 줄거리: ${novelInfo.summary}
- 트로프: ${novelInfo.tropes.join(', ')}

**이전 챕터 요약:**
${lastChapter ? `
제목: ${lastChapter.title}
주요 사건: ${lastChapter.keyEvents?.join(', ') || '미지정'}
마지막 장면: ${lastChapter.content.slice(-200)}...
` : '첫 번째 챕터입니다.'}

**새 챕터 요구사항:**
- 챕터 번호: ${storyContext.chapterNumber}
- 감정 톤: ${storyContext.emotionalTone}
- 플롯 단계: ${storyContext.plotStage}
- 최소 2000자 이상
- 로맨스 판타지 장르에 맞는 흥미진진한 전개
- 캐릭터 간의 감정적 교감과 성장
- 다음 챕터로 이어질 흥미로운 클리프행어

다음 형식으로 작성해주세요:

TITLE: [챕터 제목]

CONTENT:
[챕터 내용 - 최소 2000자]
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    // 제목과 내용 파싱
    const titleMatch = response.match(/TITLE:\s*(.+)/);
    const contentMatch = response.match(/CONTENT:\s*([\s\S]+)/);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : `챕터 ${storyContext.chapterNumber}`,
      content: contentMatch ? contentMatch[1].trim() : response
    };
  }
  
  extractKeyEvents(content) {
    // 간단한 키워드 추출
    const events = [];
    if (content.includes('마법') || content.includes('능력')) events.push('마법 사용');
    if (content.includes('갈등') || content.includes('싸움')) events.push('갈등 상황');
    if (content.includes('사랑') || content.includes('마음')) events.push('로맨스 진전');
    if (content.includes('비밀') || content.includes('진실')) events.push('비밀 공개');
    
    return events.length > 0 ? events : ['스토리 진전'];
  }
  
  displayResults(chapter, enhancementResult) {
    console.log('\n🎉 World-Class 챕터 생성 완료!');
    console.log('================================');
    console.log(`📖 제목: ${chapter.title}`);
    console.log(`📊 글자 수: ${chapter.wordCount}자`);
    console.log(`🎯 품질 점수: ${chapter.qualityScore}/10`);
    console.log(`🌟 품질 등급: ${chapter.worldClassStatus}`);
    console.log(`🎭 감정 톤: ${chapter.emotionalTone}`);
    console.log(`🗝️  주요 사건: ${chapter.keyEvents.join(', ')}`);
    
    console.log('\n📈 품질 개선 결과:');
    console.log(`플롯 진전: ${enhancementResult.finalQuality.plotProgression.toFixed(1)}/10`);
    console.log(`캐릭터 깊이: ${enhancementResult.finalQuality.characterDepth.toFixed(1)}/10`);
    console.log(`문체 수준: ${enhancementResult.finalQuality.literaryLevel.toFixed(1)}/10`);
    console.log(`로맨스 케미스트리: ${enhancementResult.finalQuality.romanceChemistry.toFixed(1)}/10`);
    console.log(`현대적 감수성: ${enhancementResult.finalQuality.modernStandards.toFixed(1)}/10`);
    
    console.log('\n📝 챕터 미리보기:');
    console.log('━'.repeat(50));
    console.log(chapter.content.substring(0, 500) + '...');
    console.log('━'.repeat(50));
  }
  
  async saveChapter(chapter) {
    const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `${chapter.novel}-ch${chapter.chapterNumber}.md`);
    
    const frontmatter = {
      title: chapter.title,
      novel: chapter.novel,
      chapterNumber: chapter.chapterNumber,
      publicationDate: chapter.publicationDate,
      wordCount: chapter.wordCount,
      contentRating: chapter.contentRating,
      emotionalTone: chapter.emotionalTone,
      keyEvents: chapter.keyEvents,
      characterDevelopment: chapter.characterDevelopment,
      qualityScore: chapter.qualityScore,
      worldClassStatus: chapter.worldClassStatus,
      lastQualityCheck: chapter.lastQualityCheck
    };
    
    const chapterMarkdown = matter.stringify(chapter.content, frontmatter);
    await fs.writeFile(chapterPath, chapterMarkdown);
    
    console.log(`✅ 챕터 저장 완료: ${chapterPath}`);
    console.log(`📈 품질 점수: ${chapter.qualityScore}/10 (${chapter.worldClassStatus})`);
  }
  
  async updateNovelInfo(novelSlug, newChapterCount) {
    const novelPath = join(PROJECT_ROOT, 'src/content/novels', `${novelSlug}.md`);
    const novelContent = await fs.readFile(novelPath, 'utf-8');
    const { data, content } = matter(novelContent);
    
    data.totalChapters = Math.max(data.totalChapters || 0, newChapterCount);
    
    const updatedNovel = matter.stringify(content, data);
    await fs.writeFile(novelPath, updatedNovel);
    
    console.log(`✅ 소설 정보 업데이트 완료: 총 ${data.totalChapters}챕터`);
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('사용법: node scripts/generate-world-class-chapter.js [novel-slug] [chapter-number] [--save]');
    console.log('예시: node scripts/generate-world-class-chapter.js elf-shadow-moonlight-bloom 6 --save');
    process.exit(1);
  }
  
  const [novelSlug, chapterNumber] = args;
  
  try {
    const generator = new WorldClassChapterGenerator();
    await generator.generateNewChapter(novelSlug, parseInt(chapterNumber));
    
    console.log('\n🏁 챕터 생성 완료!');
    
  } catch (error) {
    console.error('\n💥 오류 발생:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { WorldClassChapterGenerator };