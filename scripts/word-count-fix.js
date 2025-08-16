#!/usr/bin/env node

/**
 * 📏 Word Count Fix
 * 실제 글자수 재계산 및 수정
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

class WordCountFixer {
  async fixAllChapters() {
    console.log('📏 Word Count Fix 시작\n');
    
    let totalWords = 0;
    
    for (let i = 1; i <= 5; i++) {
      try {
        const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `innovative-romance-fantasy-ch${i}.md`);
        const content = await fs.readFile(chapterPath, 'utf-8');
        const { data, content: text } = matter(content);
        
        // 실제 글자수 계산 (공백 제외)
        const actualWordCount = text.replace(/\s/g, '').length;
        
        console.log(`챕터 ${i}:`);
        console.log(`  기존 wordCount: ${data.wordCount || 'N/A'}`);
        console.log(`  실제 글자수: ${actualWordCount.toLocaleString()}자`);
        
        // 메타데이터 업데이트
        data.wordCount = actualWordCount;
        data.lastWordCountUpdate = new Date().toISOString();
        
        // 파일 저장
        const updatedMarkdown = matter.stringify(text, data);
        await fs.writeFile(chapterPath, updatedMarkdown);
        
        totalWords += actualWordCount;
        console.log(`  ✅ 업데이트 완료\n`);
        
      } catch (error) {
        console.error(`❌ 챕터 ${i} 처리 실패:`, error.message);
      }
    }
    
    console.log(`📊 총 글자수: ${totalWords.toLocaleString()}자`);
    console.log(`📖 평균 챕터 길이: ${Math.round(totalWords / 5).toLocaleString()}자`);
    
    // 기존 8,481자는 바이트수였고, 실제 글자수는 훨씬 많을 것
    console.log('\n💡 이전 8,481은 바이트수였음 (한글 1자 = 3바이트)');
    console.log(`💡 실제 예상 글자수: ${Math.round(8481 / 2.5).toLocaleString()}자 정도`);
  }
}

// CLI 실행
async function main() {
  const fixer = new WordCountFixer();
  await fixer.fixAllChapters();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { WordCountFixer };