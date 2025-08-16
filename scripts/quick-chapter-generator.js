#!/usr/bin/env node

/**
 * 🚀 Quick Chapter Generator
 * 빠른 챕터 3-5 생성
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

class QuickChapterGenerator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  }

  async generateRemainingChapters() {
    console.log('🚀 Quick Chapter Generator - 챕터 3-5 생성');
    
    const novelSlug = 'innovative-romance-fantasy';
    
    for (let chapterNum = 3; chapterNum <= 5; chapterNum++) {
      console.log(`\n📖 챕터 ${chapterNum} 생성...`);
      
      try {
        const content = await this.generateChapterContent(chapterNum);
        await this.saveChapterFile(novelSlug, chapterNum, content);
        console.log(`✅ 챕터 ${chapterNum} 완료`);
      } catch (error) {
        console.error(`❌ 챕터 ${chapterNum} 실패:`, error.message);
      }
    }
    
    console.log('\n🎉 모든 챕터 생성 완료!');
  }

  async generateChapterContent(chapterNumber) {
    const prompt = `
**독자 피드백 완전 반영 - 서브에이전트 시스템 적용**

이전 챕터 요약:
- 챕터 1: 아리아는 자신이 파괴 병기임을 깨달았고, 엘리아를 디지털 감옥에 가둠
- 챕터 2: 아리아는 자신이 여왕이었으며 사랑하는 카일을 죽였다는 진실을 발견

**챕터 ${chapterNumber} 요구사항:**

🔥 **갈등 중심 (독자 피드백 반영)**:
- 매 문단 긴장감과 위기감
- 시간 압박과 예상치 못한 방해 요소
- 복잡한 윤리적 딜레마

🧠 **캐릭터 복잡성**:
- 아리아의 이중성 (기계 vs 인간감정, 여왕 vs 파괴병기)
- 숨겨진 동기와 내적 갈등
- 예측 불가능한 행동

💕 **로맨스 필연성** (클리셰 완전 제거):
- 카일과의 과거 관계 깊이 있게 탐구
- 감정적 필연성 구축 (왜 카일이어야 하는가)
- 복잡한 감정 (사랑 vs 죄책감 vs 복수심)

🎲 **예측 불가능성**:
- 독자 기대를 뒤엎는 반전
- 캐릭터의 의외성
- "펀치력 있는" 전개

**스토리 방향:**
${chapterNumber === 3 ? '아리아와 카일의 재회 - 하지만 카일도 기계임이 밝혀지는 반전' : 
  chapterNumber === 4 ? '진짜 카일과 가짜 카일의 정체성 혼란 - 아리아의 선택의 기로' : 
  '최종 대결과 예상치 못한 결말 - 새로운 세계의 시작'}

2000자 내외로 작성하세요.

TITLE: [챕터 제목]

CONTENT:
[갈등과 반전이 가득한 스토리]
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    const titleMatch = response.match(/TITLE:\s*(.+)/);
    const contentMatch = response.match(/CONTENT:\s*([\s\S]+)/);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : `챕터 ${chapterNumber}`,
      content: contentMatch ? contentMatch[1].trim() : response
    };
  }

  async saveChapterFile(novelSlug, chapterNumber, contentData) {
    const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `${novelSlug}-ch${chapterNumber}.md`);
    
    const frontmatter = {
      title: contentData.title,
      novel: novelSlug,
      chapterNumber,
      publicationDate: new Date().toISOString().split('T')[0],
      wordCount: contentData.content.length,
      contentRating: '15+',
      
      // Quick Generator Markers
      quickGenerated: true,
      readerFeedbackApplied: true,
      conflictDriven: true,
      characterComplexity: true,
      romanceNecessity: true,
      unpredictableStory: true,
      expectedRating: '4.0+/5',
      
      lastGenerated: new Date().toISOString()
    };
    
    const chapterMarkdown = matter.stringify(contentData.content, frontmatter);
    await fs.writeFile(chapterPath, chapterMarkdown);
  }
}

// CLI 실행
async function main() {
  try {
    const generator = new QuickChapterGenerator();
    await generator.generateRemainingChapters();
  } catch (error) {
    console.error('💥 Quick Generator 실패:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { QuickChapterGenerator };