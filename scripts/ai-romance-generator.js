#!/usr/bin/env node

/**
 * 🌸 로판 AI 자동 연재 시스템 v2.0
 * 
 * 단순하고 효과적인 로맨스 판타지 자동 생성 엔진
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CharacterValidator } from './character-validator.js';
import { NovelDatabase } from './novel-database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class AIRomanceGenerator {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    this.validator = new CharacterValidator();
    this.database = new NovelDatabase();
    this.isDryRun = process.argv.includes('--dry-run');
  }

  async runAutomation() {
    console.log('🌸 로판 AI 자동 연재 시스템 시작');
    console.log(`📅 ${new Date().toLocaleString('ko-KR')}\n`);

    const activeNovels = await this.database.getActiveNovels();
    
    if (activeNovels.length === 0) {
      console.log('⚠️ 활성 연재 소설이 없습니다.');
      return;
    }

    console.log(`📚 활성 소설: ${activeNovels.length}개`);
    
    for (const novel of activeNovels) {
      await this.generateNextChapter(novel);
    }

    console.log('\n✅ 자동 연재 완료!');
  }

  async generateNextChapter(novel) {
    try {
      console.log(`\n📖 ${novel.title} - 다음 챕터 생성 중...`);

      if (this.shouldSkipUpdate(novel)) {
        console.log(`⏭️ 최근 업데이트됨 - 스킵`);
        return;
      }

      const nextChapter = novel.lastChapter + 1;
      
      if (nextChapter > 100) {
        console.log(`🎊 ${novel.title} 연재 완료 (100화 달성)`);
        await this.database.markCompleted(novel.slug);
        return;
      }

      const prompt = this.buildPrompt(novel, nextChapter);
      
      let attempts = 0;
      while (attempts < 3) {
        attempts++;
        console.log(`🔄 시도 ${attempts}/3`);

        try {
          const result = await this.model.generateContent(prompt);
          const content = result.response.text();

          const validation = this.validator.validate(novel.slug, content);
          
          if (!validation.valid) {
            console.log(`❌ 검증 실패: ${validation.reason}`);
            continue;
          }

          const chapter = this.parseChapter(content, novel.slug, nextChapter);
          
          if (!this.isDryRun) {
            await this.saveChapter(chapter);
            await this.database.updateLastChapter(novel.slug, nextChapter);
          }

          console.log(`✅ ${chapter.title} 생성 완료`);
          console.log(`📏 분량: ${chapter.wordCount}자`);
          return;

        } catch (error) {
          console.log(`⚠️ 생성 오류: ${error.message}`);
        }
      }

      console.log(`❌ ${novel.title} 생성 실패 (3회 시도 후)`);

    } catch (error) {
      console.error(`❌ ${novel.title} 처리 중 오류:`, error.message);
    }
  }

  buildPrompt(novel, chapterNumber) {
    const characters = this.validator.getCharacters(novel.slug);
    
    return `# 🌸 로맨스 판타지 소설 계속 작성

## 📚 작품 정보
제목: ${novel.title}
장르: 로맨스 판타지
현재 진행: ${novel.lastChapter}화 완료 → ${chapterNumber}화 작성

## 🔒 캐릭터 정보 (절대 변경 금지)
${characters.map(char => `- **${char}**: 이 이름만 사용하세요`).join('\n')}

⚠️ 위 캐릭터 이름 외에는 절대 사용하지 마세요!
⚠️ 다른 이름이 나오면 즉시 거부됩니다!

## 📖 이전 스토리 요약
${novel.recentSummary || '첫 번째 챕터입니다.'}

## 📝 작성 요구사항
- 분량: 3,000-4,000자
- 로맨스 판타지 장르
- 감정적이고 몰입감 있는 문체
- 이전 스토리와 자연스러운 연결
- 위에 명시된 캐릭터만 사용

## 📋 출력 형식
CHAPTER: ${chapterNumber}
TITLE: ${chapterNumber}화: [제목]
WORD_COUNT: [글자수]

--- CONTENT START ---
[소설 내용]
--- CONTENT END ---

지금 ${chapterNumber}화를 작성해주세요:`;
  }

  parseChapter(content, novelSlug, chapterNumber) {
    const titleMatch = content.match(/TITLE:\s*(.+)/);
    const wordCountMatch = content.match(/WORD_COUNT:\s*(\d+)/);
    const contentMatch = content.match(/--- CONTENT START ---\n([\s\S]+?)\n--- CONTENT END ---/);

    return {
      slug: novelSlug,
      chapterNumber: chapterNumber,
      title: titleMatch ? titleMatch[1].trim() : `${chapterNumber}화`,
      wordCount: wordCountMatch ? parseInt(wordCountMatch[1]) : 0,
      content: contentMatch ? contentMatch[1].trim() : content,
      publicationDate: new Date().toISOString().split('T')[0]
    };
  }

  async saveChapter(chapter) {
    const filename = `${chapter.slug}-ch${chapter.chapterNumber}.md`;
    const filepath = path.join(process.cwd(), 'src/content/chapters', filename);

    const frontmatter = `---
title: '${chapter.title}'
novel: ${chapter.slug}
chapterNumber: ${chapter.chapterNumber}
publicationDate: '${chapter.publicationDate}'
wordCount: ${chapter.wordCount}
contentRating: 15+
qualityScore: 85
---

${chapter.content}`;

    await fs.writeFile(filepath, frontmatter);
  }

  shouldSkipUpdate(novel) {
    if (!novel.lastUpdated) return false;
    
    const lastUpdate = new Date(novel.lastUpdated);
    const hoursSince = (Date.now() - lastUpdate) / (1000 * 60 * 60);
    
    return hoursSince < 24;
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const generator = new AIRomanceGenerator(apiKey);
  await generator.runAutomation();
}

if (process.env.NODE_ENV !== 'production') {
  const { config } = await import('dotenv');
  config({ path: path.join(process.cwd(), '.env.local') });
}

main().catch(console.error);