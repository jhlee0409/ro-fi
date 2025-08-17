#!/usr/bin/env node

/**
 * 🎨 이미지 프롬프트 생성 에이전트
 * 각 소설과 챕터의 핵심 시점에 맞는 상세한 이미지 생성 프롬프트를 생성합니다
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 설정
const CONFIG = {
  API_KEY: process.env.GEMINI_API_KEY,
  MODEL: 'gemini-2.5-pro',
  MAX_TOKENS: 8192,
  BASE_DIR: join(__dirname, '..'),
  NOVELS_DIR: join(__dirname, '..', 'src', 'content', 'novels'),
  CHAPTERS_DIR: join(__dirname, '..', 'src', 'content', 'chapters'),
  PROMPTS_DIR: join(__dirname, '..', 'data', 'image-prompts')
};

class ImagePromptAgent {
  constructor() {
    if (!CONFIG.API_KEY) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다');
    }
    
    this.genAI = new GoogleGenerativeAI(CONFIG.API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: CONFIG.MODEL,
      generationConfig: {
        maxOutputTokens: CONFIG.MAX_TOKENS,
        temperature: 0.8
      }
    });
  }

  /**
   * 소설 커버 이미지 프롬프트 생성
   */
  async generateNovelCoverPrompt(novelMetadata) {
    const prompt = `
로맨스 판타지 소설의 커버 이미지를 위한 상세한 이미지 생성 프롬프트를 작성해주세요.

**소설 정보:**
- 제목: ${novelMetadata.title}
- 장르: ${novelMetadata.genre?.join(', ') || '로맨스 판타지'}
- 줄거리: ${novelMetadata.description}
- 태그: ${novelMetadata.tags?.join(', ') || ''}

**요구사항:**
1. 한국 웹소설 커버 스타일 (세로형 비율)
2. 로맨스 판타지 장르에 적합한 분위기
3. 주인공들의 실루엣이나 상징적 표현
4. 판타지적 요소 (마법, 신비로운 배경 등)
5. 감정적 몰입도를 높이는 색감과 구도

다음 형식으로 응답해주세요:

=== COVER PROMPT ===
[상세한 영어 이미지 생성 프롬프트]

=== STYLE NOTES ===
- 색감: [주요 색상 팔레트]
- 분위기: [전체적인 무드]
- 핵심 요소: [반드시 포함될 시각적 요소들]
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    return this.parsePromptResponse(response);
  }

  /**
   * 챕터 이미지 프롬프트 생성
   */
  async generateChapterPrompt(chapterData, novelMetadata) {
    const prompt = `
로맨스 판타지 소설 챕터의 핵심 장면을 위한 이미지 생성 프롬프트를 작성해주세요.

**소설 정보:**
- 제목: ${novelMetadata.title}
- 장르: ${novelMetadata.genre?.join(', ') || '로맨스 판타지'}

**챕터 정보:**
- 챕터: ${chapterData.title}
- 내용: ${chapterData.content?.substring(0, 2000)}...

**요구사항:**
1. 이 챕터의 가장 중요하고 감동적인 순간을 시각화
2. 캐릭터들의 감정이 잘 드러나는 구도
3. 판타지 세계관에 맞는 배경과 소품
4. 로맨스적 긴장감이나 달콤함 표현
5. 독자들이 몰입할 수 있는 cinematic한 구성

다음 형식으로 응답해주세요:

=== CHAPTER PROMPT ===
[상세한 영어 이미지 생성 프롬프트]

=== SCENE ANALYSIS ===
- 핵심 장면: [이 챕터의 하이라이트]
- 주요 캐릭터: [등장인물들]
- 배경: [장소와 환경]
- 감정: [전달하고자 하는 감정]

=== TECHNICAL SPECS ===
- 구도: [카메라 앵글과 구성]
- 조명: [빛의 방향과 분위기]
- 색감: [주요 색상]
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    return this.parsePromptResponse(response);
  }

  /**
   * 응답 파싱
   */
  parsePromptResponse(response) {
    const sections = {
      prompt: '',
      style: '',
      analysis: '',
      technical: ''
    };

    const lines = response.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      if (line.includes('COVER PROMPT') || line.includes('CHAPTER PROMPT')) {
        currentSection = 'prompt';
        continue;
      } else if (line.includes('STYLE NOTES')) {
        currentSection = 'style';
        continue;
      } else if (line.includes('SCENE ANALYSIS')) {
        currentSection = 'analysis';
        continue;
      } else if (line.includes('TECHNICAL SPECS')) {
        currentSection = 'technical';
        continue;
      }

      if (currentSection && !line.startsWith('===')) {
        sections[currentSection] += line + '\n';
      }
    }

    return {
      prompt: sections.prompt.trim(),
      style: sections.style.trim(),
      analysis: sections.analysis.trim(),
      technical: sections.technical.trim(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 소설 메타데이터 로드
   */
  async loadNovelMetadata(novelSlug) {
    const novelPath = join(CONFIG.NOVELS_DIR, `${novelSlug}.md`);
    
    try {
      const content = await fs.readFile(novelPath, 'utf-8');
      const { data } = matter(content);
      return data;
    } catch (_error) {
    // Intentionally unused error variable
      throw new Error(`소설 메타데이터 로드 실패: ${_error.message}`);
    }
  }

  /**
   * 챕터 데이터 로드
   */
  async loadChapterData(novelSlug) {
    const chapters = [];
    
    try {
      const files = await fs.readdir(CONFIG.CHAPTERS_DIR);
      const chapterFiles = files
        .filter(file => file.startsWith(`${novelSlug}-`) && file.endsWith('.md'))
        .sort();

      for (const file of chapterFiles) {
        const filePath = join(CONFIG.CHAPTERS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { data, content: chapterContent } = matter(content);
        
        chapters.push({
          ...data,
          content: chapterContent,
          filename: file
        });
      }
      
      return chapters;
    } catch (_error) {
    // Intentionally unused error variable
      // console.warn(`챕터 로드 경고: ${_error.message}`);
      return [];
    }
  }

  /**
   * 프롬프트 데이터 저장
   */
  async savePromptData(novelSlug, promptData) {
    await fs.mkdir(CONFIG.PROMPTS_DIR, { recursive: true });
    
    const outputPath = join(CONFIG.PROMPTS_DIR, `${novelSlug}.json`);
    const jsonData = JSON.stringify(promptData, null, 2);
    
    await fs.writeFile(outputPath, jsonData, 'utf-8');
    // console.log(`✅ 이미지 프롬프트 저장 완료: ${outputPath}`);
  }

  /**
   * 메인 실행 함수
   */
  async generateImagePrompts(novelSlug, options = {}) {
    // console.log(`🎨 "${novelSlug}" 이미지 프롬프트 생성 시작\n`);
    
    try {
      // 1. 소설 메타데이터 로드
      // console.log('📖 소설 메타데이터 로드 중...');
      const novelMetadata = await this.loadNovelMetadata(novelSlug);
      
      // 2. 챕터 데이터 로드
      // console.log('📚 챕터 데이터 로드 중...');
      const chapters = await this.loadChapterData(novelSlug);
      
      // console.log(`   총 ${chapters.length}개 챕터 발견\n`);

      // 3. 커버 이미지 프롬프트 생성
      // console.log('🎨 소설 커버 이미지 프롬프트 생성 중...');
      const coverPrompt = await this.generateNovelCoverPrompt(novelMetadata);
      
      // 4. 챕터별 이미지 프롬프트 생성
      // console.log('📖 챕터별 이미지 프롬프트 생성 중...');
      const chapterPrompts = [];
      
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        // console.log(`   ${i + 1}/${chapters.length}: ${chapter.title}`);
        
        const chapterPrompt = await this.generateChapterPrompt(chapter, novelMetadata);
        chapterPrompts.push({
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
          ...chapterPrompt
        });
        
        // API 속도 제한 방지
        if (i < chapters.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // 5. 결과 데이터 구성
      const promptData = {
        novel: {
          slug: novelSlug,
          title: novelMetadata.title,
          ...novelMetadata
        },
        cover: coverPrompt,
        chapters: chapterPrompts,
        generatedAt: new Date().toISOString(),
        totalChapters: chapters.length
      };

      // 6. 저장
      if (options.saveMetadata) {
        await this.savePromptData(novelSlug, promptData);
      }

      // console.log('\n🎉 이미지 프롬프트 생성 완료!');
      // console.log(`   📚 커버 이미지: 1개`);
      // console.log(`   📖 챕터 이미지: ${chapterPrompts.length}개`);
      // console.log(`   💾 저장: ${options.saveMetadata ? '완료' : '건너뜀'}\n`);

      return promptData;

    } catch (_error) {
    // Intentionally unused error variable
      // console.error(`❌ 이미지 프롬프트 생성 실패: ${_error.message}`);
      throw _error;
    }
  }
}

// CLI 실행 부분
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // console.error('❌ 사용법: node scripts/generate-image-prompts.js <novel-slug> [--save-metadata]');
    // console.error('   예시: node scripts/generate-image-prompts.js time-guardian-fate-thread --save-metadata');
    process.exit(1);
  }

  const novelSlug = args[0];
  const saveMetadata = args.includes('--save-metadata');

  try {
    const agent = new ImagePromptAgent();
    await agent.generateImagePrompts(novelSlug, { saveMetadata });
    
    // console.log('✨ 이미지 프롬프트 생성 작업이 성공적으로 완료되었습니다!');
    
  } catch (_error) {
    // Intentionally unused error variable
    // console.error('\n❌ 오류 발생:', _error.message);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ImagePromptAgent };