#!/usr/bin/env node

/**
 * 🌟 World-Class 새로운 소설 생성기
 * 
 * 완전히 새로운 로맨스 판타지 소설을 World-Class Quality로 생성
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

class NewNovelCreator {
  constructor() {
    this.logger = {
      info: (_msg, _data) => {}, // console.log(`ℹ️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      warn: (_msg, _data) => {}, // console.log(`⚠️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      error: (_msg, _data) => {}, // console.log(`❌ ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      success: (_msg, _data) => {}, // console.log(`✅ ${msg}`, data ? JSON.stringify(data, null, 2) : '')
    };
    
    this.enhancementEngine = new WorldClassEnhancementEngine(this.logger);
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  }

  async createCompleteNovel() {
    // console.log('🌟 새로운 World-Class 로맨스 판타지 소설 생성 시작!\n');
    
    try {
      // 1단계: 소설 기본 정보 생성
      // console.log('📚 1단계: 소설 기본 정보 생성...');
      const novelInfo = await this.generateNovelInfo();
      
      // 2단계: 소설 파일 생성
      // console.log('📝 2단계: 소설 파일 생성...');
      await this.createNovelFile(novelInfo);
      
      // 3단계: 챕터 1-5 생성
      // console.log('📖 3단계: 챕터 1-5 생성...');
      for (let chapterNum = 1; chapterNum <= 5; chapterNum++) {
        await this.createChapter(novelInfo, chapterNum);
      }
      
      // console.log('\n🎉 새로운 World-Class 소설 완성!');
      // console.log('================================');
      // console.log(`📚 제목: ${novelInfo.title}`);
      // console.log(`🏷️  슬러그: ${novelInfo.slug}`);
      // console.log(`📖 총 챕터: 5개`);
      // console.log(`🌟 품질: WORLD_CLASS`);
      // console.log(`🎯 트로프: ${novelInfo.tropes.join(', ')}`);
      
      return novelInfo;
      
    } catch (_error) {
    // Intentionally unused error variable
      // console.error('❌ 소설 생성 실패:', _error.message);
      throw _error;
    }
  }
  
  async generateNovelInfo() {
    const prompt = `
당신은 세계급 로맨스 판타지 기획자입니다. 2025년 웹소설 트렌드에 맞는 완전히 새로운 로맨스 판타지 소설을 기획해주세요.

요구사항:
- 독창적이고 매력적인 소재
- 2025년 현대적 감수성 반영
- 주체적인 여주인공
- 건강한 로맨스 관계
- 흥미진진한 판타지 요소
- 한국 웹소설 독자들이 좋아할 트로프 조합

다음 형식으로 작성해주세요:

TITLE: [한국어 제목]
SLUG: [영문 슬러그, 하이픈으로 연결]
SUMMARY: [200자 내외의 매력적인 줄거리]
TROPES: [트로프1, 트로프2, 트로프3]
MAIN_CHARACTERS: 
- 여주인공: [이름] - [간단한 설정]
- 남주인공: [이름] - [간단한 설정]
WORLD_SETTING: [세계관 설정]
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    // 파싱
    const titleMatch = response.match(/TITLE:\s*(.+)/);
    const slugMatch = response.match(/SLUG:\s*(.+)/);
    const summaryMatch = response.match(/SUMMARY:\s*([\s\S]+?)(?=TROPES:|$)/);
    const tropesMatch = response.match(/TROPES:\s*(.+)/);
    const charactersMatch = response.match(/MAIN_CHARACTERS:\s*([\s\S]+?)(?=WORLD_SETTING:|$)/);
    const worldMatch = response.match(/WORLD_SETTING:\s*([\s\S]+)/);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : '새로운 로맨스 판타지',
      slug: slugMatch ? slugMatch[1].trim() : 'new-romance-fantasy',
      summary: summaryMatch ? summaryMatch[1].trim() : '새로운 로맨스 판타지 이야기',
      tropes: tropesMatch ? tropesMatch[1].split(',').map(t => t.trim()) : ['로맨스', '판타지', '성장'],
      characters: charactersMatch ? charactersMatch[1].trim() : '매력적인 캐릭터들',
      worldSetting: worldMatch ? worldMatch[1].trim() : '흥미진진한 판타지 세계'
    };
  }
  
  async createNovelFile(novelInfo) {
    const novelPath = join(PROJECT_ROOT, 'src/content/novels', `${novelInfo.slug}.md`);
    
    const frontmatter = {
      title: novelInfo.title,
      slug: novelInfo.slug,
      author: 'World-Class AI',
      status: '연재 중',
      summary: novelInfo.summary,
      tropes: novelInfo.tropes,
      publishedDate: new Date().toISOString().split('T')[0],
      totalChapters: 5,
      rating: 0,
      worldClassQuality: true,
      aiGenerated: true
    };
    
    const novelMarkdown = matter.stringify('', frontmatter);
    await fs.writeFile(novelPath, novelMarkdown);
    
    // console.log(`✅ 소설 파일 생성: ${novelInfo.title}`);
    return novelPath;
  }
  
  async createChapter(novelInfo, chapterNumber) {
    // console.log(`📝 챕터 ${chapterNumber} 생성 중...`);
    
    // 이전 챕터들 로드 (연속성을 위해)
    const previousChapters = [];
    for (let i = 1; i < chapterNumber; i++) {
      try {
        const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `${novelInfo.slug}-ch${i}.md`);
        const content = await fs.readFile(chapterPath, 'utf-8');
        const { data, content: text } = matter(content);
        previousChapters.push({ ...data, content: text });
      } catch (_) {
        // 이전 챕터가 없으면 무시
      }
    }
    
    // 스토리 컨텍스트 구성
    const storyContext = {
      novelType: 'romance-fantasy',
      chapterNumber,
      allowBackstory: true,
      emotionalTone: this.getEmotionalTone(chapterNumber),
      tropes: novelInfo.tropes,
      worldSetting: novelInfo.worldSetting,
      characters: novelInfo.characters
    };
    
    // 챕터 생성 프롬프트
    const chapterPrompt = this.buildChapterPrompt(novelInfo, previousChapters, chapterNumber, storyContext);
    
    // Gemini로 초기 생성
    const result = await this.model.generateContent(chapterPrompt);
    const response = result.response.text();
    
    // 제목과 내용 파싱
    const titleMatch = response.match(/TITLE:\s*(.+)/);
    const contentMatch = response.match(/CONTENT:\s*([\s\S]+)/);
    
    const initialContent = {
      title: titleMatch ? titleMatch[1].trim() : `챕터 ${chapterNumber}`,
      content: contentMatch ? contentMatch[1].trim() : response
    };
    
    // World-Class Enhancement 적용
    // console.log(`✨ 챕터 ${chapterNumber} World-Class Enhancement 적용...`);
    const enhancedResult = await this.enhancementEngine.transformToWorldClass(
      initialContent.content,
      storyContext
    );
    
    // 챕터 파일 생성
    const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `${novelInfo.slug}-ch${chapterNumber}.md`);
    
    const frontmatter = {
      title: initialContent.title,
      novel: novelInfo.slug,
      chapterNumber,
      publicationDate: new Date().toISOString().split('T')[0],
      wordCount: enhancedResult.enhancedContent.length,
      contentRating: '15+',
      emotionalTone: storyContext.emotionalTone,
      keyEvents: this.extractKeyEvents(enhancedResult.enhancedContent),
      characterDevelopment: '캐릭터 발전 사항',
      qualityScore: parseFloat(enhancedResult.finalQuality.overallScore.toFixed(1)),
      worldClassStatus: enhancedResult.finalQuality.worldClassStatus,
      lastQualityCheck: new Date().toISOString()
    };
    
    const chapterMarkdown = matter.stringify(enhancedResult.enhancedContent, frontmatter);
    await fs.writeFile(chapterPath, chapterMarkdown);
    
    // console.log(`✅ 챕터 ${chapterNumber} 완성 - 품질: ${enhancedResult.finalQuality.overallScore.toFixed(1)}/10 (${enhancedResult.finalQuality.worldClassStatus})`);
    
    return chapterPath;
  }
  
  buildChapterPrompt(novelInfo, previousChapters, chapterNumber, storyContext) {
    const isFirstChapter = chapterNumber === 1;
    const lastChapter = previousChapters[previousChapters.length - 1];
    
    let prompt = `
당신은 세계급 로맨스 판타지 작가입니다. 다음 소설의 챕터 ${chapterNumber}를 작성해주세요.

**소설 정보:**
- 제목: ${novelInfo.title}
- 줄거리: ${novelInfo.summary}
- 트로프: ${novelInfo.tropes.join(', ')}
- 세계관: ${novelInfo.worldSetting}
- 캐릭터: ${novelInfo.characters}

`;

    if (isFirstChapter) {
      prompt += `
**첫 번째 챕터 요구사항:**
- 강력한 훅으로 시작 (첫 3줄로 독자 붙잡기)
- 주인공과 세계관 소개
- 흥미진진한 사건으로 이야기 시작
- 다음 챕터가 궁금하게 만드는 클리프행어
`;
    } else {
      prompt += `
**이전 챕터 요약:**
제목: ${lastChapter.title}
주요 사건: ${lastChapter.keyEvents?.join(', ') || '스토리 진전'}
마지막 장면: ${lastChapter.content.slice(-200)}...

**연속성 유지:**
- 이전 챕터에서 자연스럽게 이어지는 전개
- 캐릭터의 감정과 관계 발전
- 플롯의 점진적 진전
`;
    }

    prompt += `

**품질 요구사항:**
- 감정 톤: ${storyContext.emotionalTone}
- 최소 2000자 이상
- 5감을 활용한 생동감 있는 묘사
- 자연스러운 대화와 내적 독백
- 로맨스 판타지 장르에 맞는 설렘과 긴장감
- 주체적인 여주인공과 건강한 로맨스

다음 형식으로 작성해주세요:

TITLE: [챕터 제목]

CONTENT:
[챕터 내용 - 최소 2000자]
`;

    return prompt;
  }
  
  getEmotionalTone(chapterNumber) {
    const tones = ['설렘', '로맨스', '긴장', '감동', '성장'];
    return tones[(chapterNumber - 1) % tones.length];
  }
  
  extractKeyEvents(content) {
    const events = [];
    if (content.includes('마법') || content.includes('능력')) events.push('마법 사용');
    if (content.includes('갈등') || content.includes('싸움')) events.push('갈등 상황');
    if (content.includes('사랑') || content.includes('마음') || content.includes('설렘')) events.push('로맨스 진전');
    if (content.includes('비밀') || content.includes('진실')) events.push('비밀 공개');
    if (content.includes('성장') || content.includes('깨달음')) events.push('캐릭터 성장');
    
    return events.length > 0 ? events : ['스토리 진전'];
  }
}

// CLI 실행
async function main() {
  try {
    const creator = new NewNovelCreator();
    await creator.createCompleteNovel();
    
    // console.log('\n🏁 새로운 World-Class 소설 생성 완료!');
    
  } catch (_error) {
    // Intentionally unused error variable
    // console.error('\n💥 오류 발생:', _error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { NewNovelCreator };