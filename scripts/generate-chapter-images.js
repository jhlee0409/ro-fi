#!/usr/bin/env node

/**
 * 챕터 이미지 생성 및 관리 스크립트
 * Gemini AI를 활용한 자동 이미지 포인트 분석 및 생성
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
// Import는 나중에 처리하고 먼저 직접 구현

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class ChapterImageGenerator {
  constructor() {
    this.outputDir = join(projectRoot, 'src', 'data', 'chapter-images');
    this.initializeOutputDir();
  }

  async initializeOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      // console.log(`📁 Initialized output directory: ${this.outputDir}`);
    } catch (_error) {
    // Intentionally unused error variable
      // console.error('Error creating output directory:', _error);
    }
  }

  /**
   * 특정 챕터의 핵심 이미지 포인트 분석
   */
  async analyzeChapter(novelSlug, chapterNumber) {
    try {
      // console.log(`\n🔍 Analyzing key point for chapter ${chapterNumber} of "${novelSlug}"`);
      
      // 챕터 파일 경로 생성
      const chapterSlug = `${novelSlug}-ch${chapterNumber}`;
      const chapterPath = join(projectRoot, 'src', 'content', 'chapters', `${chapterSlug}.md`);
      
      // 챕터 파일 읽기
      const chapterContent = await fs.readFile(chapterPath, 'utf-8');
      
      // 프론트매터와 콘텐츠 분리
      const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
      const match = chapterContent.match(frontmatterRegex);
      
      if (!match) {
        throw new Error('Invalid chapter format - missing frontmatter');
      }
      
      const [, frontmatter, content] = match;
      
      // 메타데이터 파싱
      const titleMatch = frontmatter.match(/title:\s*(.+)/);
      const chapterTitle = titleMatch ? titleMatch[1].replace(/['"]/g, '').trim() : `Chapter ${chapterNumber}`;
      
      // console.log(`📖 Chapter title: ${chapterTitle}`);
      // console.log(`📝 Content length: ${content.length} characters`);
      
      // 핵심 이미지 포인트 분석 실행
      const chapterImageData = await simplifiedImageAnalyzer.analyzeChapterKeyPoint(content, {
        slug: chapterSlug,
        chapterNumber: parseInt(chapterNumber),
        title: chapterTitle
      });
      
      // 결과 출력
      // console.log(`\n✨ Analysis completed for chapter ${chapterNumber}:`);
      
      if (chapterImageData.keyImagePoint) {
        const point = chapterImageData.keyImagePoint;
        // console.log(`   🎨 Key image point found:`);
        // console.log(`      Type: ${point.type} (${point.mood})`);
        // console.log(`      Position: ${point.position}%`);
        // console.log(`      Description: ${point.description}`);
        if (point.targetParagraph) {
          // console.log(`      Target: "${point.targetParagraph.substring(0, 80)}..."`);
        }
        if (point.characters && point.characters.length > 0) {
          // console.log(`      Characters: ${point.characters.join(', ')}`);
        }
        // console.log(`      Setting: ${point.setting}`);
      } else {
        // console.log(`   ⚠️  No key image point identified`);
      }
      
      return chapterImageData;
      
    } catch (_error) {
    // Intentionally unused error variable
      // console.error(`❌ Error analyzing chapter ${chapterNumber}:`, _error.message);
      return null;
    }
  }

  /**
   * 전체 소설 분석 (소설 커버 + 모든 챕터)
   */
  async analyzeNovel(novelSlug) {
    try {
      // console.log(`\n🚀 Starting complete novel analysis: "${novelSlug}"`);
      
      // 단순화된 분석기를 사용하여 전체 소설 분석
      const novelImageData = await simplifiedImageAnalyzer.analyzeNovelComplete(novelSlug);
      
      // console.log(`\n🎉 Complete novel analysis finished!`);
      // console.log(`   Novel: ${novelImageData.novelTitle}`);
      // console.log(`   Cover image: ${novelImageData.coverImagePoint ? 'Generated' : 'Not generated'}`);
      // console.log(`   Chapters analyzed: ${novelImageData.chapters.length}`);
      
      const _chaptersWithImages = novelImageData.chapters.filter(c => c.keyImagePoint);
      // console.log(`   Key image points found: ${chaptersWithImages.length}/${novelImageData.chapters.length}`);
      
      // 챕터별 상세 결과
      novelImageData.chapters.forEach(chapter => {
        if (chapter.keyImagePoint) {
          // console.log(`   Ch.${chapter.chapterNumber}: ${chapter.keyImagePoint.type} (${chapter.keyImagePoint.mood})`);
        } else {
          // console.log(`   Ch.${chapter.chapterNumber}: No key point found`);
        }
      });
      
      return novelImageData;
      
    } catch (_error) {
    // Intentionally unused error variable
      // console.error(`❌ Error analyzing novel "${novelSlug}":`, _error.message);
      return null;
    }
  }

  /**
   * 전체 소설 분석 결과 저장
   */
  async saveNovelAnalysis(novelSlug, analysisResults) {
    try {
      const summaryData = {
        novelSlug,
        totalChapters: analysisResults.length,
        totalImagePoints: analysisResults.reduce((sum, r) => sum + r.imagePoints.length, 0),
        analyzedAt: new Date().toISOString(),
        chapters: analysisResults.map(r => ({
          chapterNumber: r.chapterNumber,
          chapterTitle: r.chapterTitle,
          imagePointsCount: r.imagePoints.length,
          lastAnalyzed: r.lastAnalyzed
        }))
      };
      
      const summaryPath = join(this.outputDir, `${novelSlug}-summary.json`);
      await fs.writeFile(summaryPath, JSON.stringify(summaryData, null, 2), 'utf-8');
      
      // console.log(`💾 Saved novel analysis summary: ${novelSlug}-summary.json`);
      
    } catch (_error) {
    // Intentionally unused error variable
      // console.error('Error saving novel analysis:', _error);
    }
  }

  /**
   * 단순화된 이미지 분석 리포트 생성
   */
  async generateReport(novelSlug) {
    try {
      // console.log(`\n📊 Generating simplified image report for "${novelSlug}"`);
      
      // 저장된 완전한 소설 이미지 데이터 로드
      const novelImageData = await simplifiedImageAnalyzer.loadNovelImageData(novelSlug);
      
      if (!novelImageData) {
        // console.log(`⚠️  No analysis data found for "${novelSlug}"`);
        // console.log(`   Run analysis first: pnpm run images:analyze ${novelSlug}`);
        return;
      }
      
      // console.log(`\n=== Simplified Image Analysis Report ===`);
      // console.log(`Novel: ${novelImageData.novelTitle} (${novelImageData.novelSlug})`);
      // console.log(`Last Analysis: ${new Date(novelImageData.lastAnalyzed).toLocaleString()}`);
      // console.log(`Total Chapters: ${novelImageData.chapters.length}`);
      
      // 소설 커버 이미지
      // console.log(`\n🎨 Novel Cover Image:`);
      if (novelImageData.coverImagePoint) {
        // console.log(`   ✅ Generated: ${novelImageData.coverImagePoint.description}`);
        // console.log(`   Mood: ${novelImageData.coverImagePoint.mood}`);
        // console.log(`   Setting: ${novelImageData.coverImagePoint.setting}`);
      } else {
        // console.log(`   ❌ Not generated`);
      }
      
      // 챕터별 핵심 이미지 포인트
      // console.log(`\n📖 Chapter Key Image Points:`);
      const _chaptersWithImages = novelImageData.chapters.filter(c => c.keyImagePoint);
      // console.log(`   Found: ${chaptersWithImages.length}/${novelImageData.chapters.length} chapters have key images`);
      
      novelImageData.chapters.forEach(chapter => {
        // console.log(`\n   Chapter ${chapter.chapterNumber}: "${chapter.chapterTitle}"`);
        
        if (chapter.keyImagePoint) {
          const point = chapter.keyImagePoint;
          // console.log(`   ✅ Key Image: ${point.type} (${point.mood})`);
          // console.log(`      Position: ${point.position}%`);
          // console.log(`      Description: "${point.description}"`);
          
          if (point.targetParagraph) {
            // console.log(`      Target Text: "${point.targetParagraph.substring(0, 100)}..."`);
          }
          
          if (point.characters && point.characters.length > 0) {
            // console.log(`      Characters: ${point.characters.join(', ')}`);
          }
          
          // console.log(`      Setting: ${point.setting}`);
          
          if (point.generatedPrompt) {
            // console.log(`      Generated Prompt: "${point.generatedPrompt.substring(0, 120)}..."`);
          }
        } else {
          // console.log(`   ❌ No key image point found`);
        }
      });
      
      // 통계 요약
      // console.log(`\n📊 Summary Statistics:`);
      // console.log(`   - Total images: ${chaptersWithImages.length + (novelImageData.coverImagePoint ? 1 : 0)}`);
      // console.log(`   - Cover image: ${novelImageData.coverImagePoint ? '1' : '0'}`);
      // console.log(`   - Chapter images: ${chaptersWithImages.length}`);
      
      // 이미지 타입별 분류
      const imageTypes = {};
      chaptersWithImages.forEach(chapter => {
        const type = chapter.keyImagePoint?.type;
        if (type) {
          imageTypes[type] = (imageTypes[type] || 0) + 1;
        }
      });
      
      if (Object.keys(imageTypes).length > 0) {
        // console.log(`\n   Image Types:`);
        Object.entries(imageTypes).forEach(([_type, _count]) => {
          // console.log(`     - ${type}: ${count}`);
        });
      }
      
      // 분위기별 분류
      const moods = {};
      chaptersWithImages.forEach(chapter => {
        const mood = chapter.keyImagePoint?.mood;
        if (mood) {
          moods[mood] = (moods[mood] || 0) + 1;
        }
      });
      
      if (Object.keys(moods).length > 0) {
        // console.log(`\n   Mood Distribution:`);
        Object.entries(moods).forEach(([_mood, _count]) => {
          // console.log(`     - ${mood}: ${count}`);
        });
      }
      
    } catch (_error) {
    // Intentionally unused error variable
      // console.error('Error generating simplified report:', _error);
    }
  }

  /**
   * 사용법 출력
   */
  showUsage() {
    // console.log('📸 Chapter Image Generation Tool');
    // console.log('Usage: node scripts/generate-chapter-images.js <command> [options]');
    // console.log('Commands:');
    // console.log('  analyze <novel-slug>              - Analyze all chapters of a novel');
    // console.log('  chapter <novel-slug> <number>     - Analyze specific chapter');
    // console.log('  report <novel-slug>               - Generate analysis report');
    // console.log('  list                              - List available novels');
    // console.log('Examples:');
    // console.log('  node scripts/generate-chapter-images.js analyze time-guardian-fate-thread');
    // console.log('  node scripts/generate-chapter-images.js chapter time-guardian-fate-thread 1');
    // console.log('Environment: GEMINI_API_KEY - Required for AI analysis');
  }

  /**
   * 사용 가능한 소설 목록 출력
   */
  async listNovels() {
    try {
      const novelsDir = join(projectRoot, 'src', 'content', 'novels');
      const files = await fs.readdir(novelsDir);
      
      // console.log(`\n📚 Available novels:`);
      
      for (const file of files.filter(f => f.endsWith('.md'))) {
        const novelPath = join(novelsDir, file);
        const content = await fs.readFile(novelPath, 'utf-8');
        
        const titleMatch = content.match(/title:\s*"([^"]+)"/);
        const slugMatch = content.match(/slug:\s*"([^"]+)"/);
        
        if (titleMatch && slugMatch) {
          // console.log(`  • ${slugMatch[1]} - "${titleMatch[1]}"`);
        }
      }
      
    } catch (_error) {
    // Intentionally unused error variable
      // console.error('Error listing novels:', _error);
    }
  }

  /**
   * 지연 함수
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI 실행
async function main() {
  const generator = new ChapterImageGenerator();
  const [command, ...args] = process.argv.slice(2);
  
  switch (command) {
    case 'analyze':
      if (!args[0]) {
        // console.error('❌ Novel slug required');
        generator.showUsage();
        process.exit(1);
      }
      await generator.analyzeNovel(args[0]);
      break;
      
    case 'chapter':
      if (!args[0] || !args[1]) {
        // console.error('❌ Novel slug and chapter number required');
        generator.showUsage();
        process.exit(1);
      }
      await generator.analyzeChapter(args[0], args[1]);
      break;
      
    case 'report':
      if (!args[0]) {
        // console.error('❌ Novel slug required');
        generator.showUsage();
        process.exit(1);
      }
      await generator.generateReport(args[0]);
      break;
      
    case 'list':
      await generator.listNovels();
      break;
      
    default:
      generator.showUsage();
      if (command) {
        // console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
      }
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(_error => {
    // console.error('❌ Script failed:', _error);
    process.exit(1);
  });
}