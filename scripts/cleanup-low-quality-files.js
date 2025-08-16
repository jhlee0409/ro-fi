#!/usr/bin/env node

/**
 * 🧹 저품질 novel- 파일 정리 스크립트
 * 
 * 기능:
 * - novel- 프리픽스 파일 품질 분석
 * - 저품질 파일 식별 및 정리
 * - 고품질 파일 보존
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const CONFIG = {
  NOVEL_DIR: join(PROJECT_ROOT, 'src/content/novels'),
  CHAPTER_DIR: join(PROJECT_ROOT, 'src/content/chapters'),
  BACKUP_DIR: join(PROJECT_ROOT, 'backups/low-quality-files')
};

class QualityAnalyzer {
  constructor() {
    this.qualityThresholds = {
      title: {
        minLength: 5,
        badPatterns: ['새로운', 'novel-', '로맨스 판타지', '테스트']
      },
      summary: {
        minLength: 50,
        badPatterns: ['Gemini AI가 자동 생성한', '자동 생성', 'AI가 생성']
      },
      slug: {
        badPatterns: ['novel-\\d+', 'test-', 'untitled']
      },
      tropes: {
        minCount: 2,
        genericTropes: ['로맨스', '판타지']
      }
    };
  }

  async analyzeAllFiles() {
    console.log('🔍 파일 품질 분석 시작...\n');

    const novels = await this.loadNovelFiles();
    const chapters = await this.loadChapterFiles();
    
    const analysis = {
      novels: {
        total: novels.length,
        lowQuality: [],
        highQuality: [],
        novel_prefixed: []
      },
      chapters: {
        total: chapters.length,
        lowQuality: [],
        orphaned: []
      }
    };

    // 소설 파일 분석
    for (const novel of novels) {
      const quality = this.analyzeNovelQuality(novel);
      
      if (novel.slug.startsWith('novel-')) {
        analysis.novels.novel_prefixed.push({
          ...novel,
          quality
        });
      }
      
      if (quality.score < 60) {
        analysis.novels.lowQuality.push({
          ...novel,
          quality
        });
      } else {
        analysis.novels.highQuality.push({
          ...novel,
          quality
        });
      }
    }

    // 챕터 파일 분석
    for (const chapter of chapters) {
      const quality = this.analyzeChapterQuality(chapter);
      
      if (quality.score < 60) {
        analysis.chapters.lowQuality.push({
          ...chapter,
          quality
        });
      }

      // 소설 파일 없는 고아 챕터 확인
      const hasNovel = novels.some(n => n.slug === chapter.novel);
      if (!hasNovel) {
        analysis.chapters.orphaned.push(chapter);
      }
    }

    return analysis;
  }

  analyzeNovelQuality(novel) {
    const issues = [];
    let score = 100;

    // 제목 품질 검사
    if (!novel.title || novel.title.length < this.qualityThresholds.title.minLength) {
      issues.push('제목이 너무 짧음');
      score -= 20;
    }
    
    for (const pattern of this.qualityThresholds.title.badPatterns) {
      if (novel.title && novel.title.includes(pattern)) {
        issues.push(`제목에 문제 패턴 포함: ${pattern}`);
        score -= 15;
      }
    }

    // 줄거리 품질 검사
    if (!novel.summary || novel.summary.length < this.qualityThresholds.summary.minLength) {
      issues.push('줄거리가 너무 짧음');
      score -= 25;
    }

    for (const pattern of this.qualityThresholds.summary.badPatterns) {
      if (novel.summary && novel.summary.includes(pattern)) {
        issues.push(`줄거리에 자동생성 텍스트 포함: ${pattern}`);
        score -= 30;
      }
    }

    // Slug 품질 검사
    for (const pattern of this.qualityThresholds.slug.badPatterns) {
      if (novel.slug && novel.slug.match(new RegExp(pattern))) {
        issues.push(`Slug 패턴 문제: ${pattern}`);
        score -= 20;
      }
    }

    // 트로프 품질 검사
    if (!novel.tropes || novel.tropes.length < this.qualityThresholds.tropes.minCount) {
      issues.push('트로프 수 부족');
      score -= 15;
    }

    if (novel.tropes && novel.tropes.every(trope => 
      this.qualityThresholds.tropes.genericTropes.includes(trope)
    )) {
      issues.push('트로프가 너무 일반적');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      issues,
      category: score >= 80 ? '고품질' : score >= 60 ? '보통' : '저품질'
    };
  }

  analyzeChapterQuality(chapter) {
    const issues = [];
    let score = 100;

    // 제목 품질
    if (!chapter.title || chapter.title.length < 3) {
      issues.push('챕터 제목 부족');
      score -= 15;
    }

    // 파일명 패턴 검사
    if (chapter.filename.startsWith('novel-')) {
      issues.push('novel- 프리픽스 파일명');
      score -= 10;
    }

    // Slug 불일치 검사
    if (chapter.novel && chapter.novel.startsWith('novel-')) {
      issues.push('소설 slug가 novel- 형태');
      score -= 15;
    }

    // 단어 수 검사
    if (chapter.wordCount && chapter.wordCount < 2000) {
      issues.push('분량 부족');
      score -= 20;
    }

    return {
      score: Math.max(0, score),
      issues,
      category: score >= 80 ? '고품질' : score >= 60 ? '보통' : '저품질'
    };
  }

  async loadNovelFiles() {
    try {
      const files = await fs.readdir(CONFIG.NOVEL_DIR);
      const novels = [];

      for (const file of files.filter(f => f.endsWith('.md'))) {
        try {
          const content = await fs.readFile(join(CONFIG.NOVEL_DIR, file), 'utf-8');
          const { data } = matter(content);
          novels.push({
            filename: file,
            slug: file.replace('.md', ''),
            ...data
          });
        } catch (error) {
          console.warn(`파일 읽기 실패: ${file}`, error.message);
        }
      }

      return novels;
    } catch (error) {
      console.error('소설 디렉토리 읽기 실패:', error);
      return [];
    }
  }

  async loadChapterFiles() {
    try {
      const files = await fs.readdir(CONFIG.CHAPTER_DIR);
      const chapters = [];

      for (const file of files.filter(f => f.endsWith('.md'))) {
        try {
          const content = await fs.readFile(join(CONFIG.CHAPTER_DIR, file), 'utf-8');
          const { data } = matter(content);
          chapters.push({
            filename: file,
            ...data
          });
        } catch (error) {
          console.warn(`챕터 파일 읽기 실패: ${file}`, error.message);
        }
      }

      return chapters;
    } catch (error) {
      console.error('챕터 디렉토리 읽기 실패:', error);
      return [];
    }
  }

  printAnalysisReport(analysis) {
    console.log('📊 품질 분석 리포트');
    console.log('=' * 50);
    
    console.log('\n📚 소설 파일 분석:');
    console.log(`총 파일 수: ${analysis.novels.total}`);
    console.log(`고품질: ${analysis.novels.highQuality.length}`);
    console.log(`저품질: ${analysis.novels.lowQuality.length}`);
    console.log(`novel- 프리픽스: ${analysis.novels.novel_prefixed.length}`);

    if (analysis.novels.novel_prefixed.length > 0) {
      console.log('\n🔍 novel- 프리픽스 파일들:');
      for (const novel of analysis.novels.novel_prefixed) {
        console.log(`  - ${novel.filename} (${novel.quality.category}, 점수: ${novel.quality.score})`);
        if (novel.quality.issues.length > 0) {
          console.log(`    문제점: ${novel.quality.issues.join(', ')}`);
        }
      }
    }

    if (analysis.novels.lowQuality.length > 0) {
      console.log('\n⚠️ 저품질 소설 파일들:');
      for (const novel of analysis.novels.lowQuality) {
        console.log(`  - ${novel.filename} (점수: ${novel.quality.score})`);
        console.log(`    제목: ${novel.title || '없음'}`);
        console.log(`    문제점: ${novel.quality.issues.join(', ')}`);
      }
    }

    console.log('\n📖 챕터 파일 분석:');
    console.log(`총 파일 수: ${analysis.chapters.total}`);
    console.log(`저품질: ${analysis.chapters.lowQuality.length}`);
    console.log(`고아 챕터: ${analysis.chapters.orphaned.length}`);

    if (analysis.chapters.orphaned.length > 0) {
      console.log('\n👻 고아 챕터들 (소설 파일 없음):');
      for (const chapter of analysis.chapters.orphaned) {
        console.log(`  - ${chapter.filename} (소설: ${chapter.novel})`);
      }
    }
  }

  async cleanupLowQualityFiles(analysis, options = {}) {
    const { dryRun = true, backup = true } = options;
    
    console.log(`\n🧹 파일 정리 시작 ${dryRun ? '(DRY RUN)' : '(실제 실행)'}...\n`);

    const filesToDelete = [];

    // 저품질 소설 파일들
    for (const novel of analysis.novels.lowQuality) {
      if (novel.slug.startsWith('novel-') || novel.quality.score < 40) {
        filesToDelete.push({
          type: 'novel',
          path: join(CONFIG.NOVEL_DIR, novel.filename),
          reason: `저품질 (점수: ${novel.quality.score})`
        });
      }
    }

    // 고아 챕터들
    for (const chapter of analysis.chapters.orphaned) {
      filesToDelete.push({
        type: 'chapter',
        path: join(CONFIG.CHAPTER_DIR, chapter.filename),
        reason: '고아 챕터 (소설 파일 없음)'
      });
    }

    // 저품질 novel- 챕터들
    for (const chapter of analysis.chapters.lowQuality) {
      if (chapter.filename.startsWith('novel-')) {
        filesToDelete.push({
          type: 'chapter',
          path: join(CONFIG.CHAPTER_DIR, chapter.filename),
          reason: `저품질 novel- 챕터 (점수: ${chapter.quality.score})`
        });
      }
    }

    console.log(`삭제 예정 파일: ${filesToDelete.length}개`);
    
    for (const file of filesToDelete) {
      console.log(`  - ${file.path} (${file.reason})`);
    }

    if (!dryRun && filesToDelete.length > 0) {
      if (backup) {
        await this.backupFiles(filesToDelete);
      }

      for (const file of filesToDelete) {
        try {
          await fs.unlink(file.path);
          console.log(`✅ 삭제 완료: ${file.path}`);
        } catch (error) {
          console.error(`❌ 삭제 실패: ${file.path}`, error.message);
        }
      }
    }

    return filesToDelete;
  }

  async backupFiles(filesToDelete) {
    console.log('\n💾 백업 생성 중...');
    
    await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });
    
    for (const file of filesToDelete) {
      try {
        const filename = file.path.split('/').pop();
        const backupPath = join(CONFIG.BACKUP_DIR, `${Date.now()}-${filename}`);
        
        await fs.copyFile(file.path, backupPath);
        console.log(`📁 백업: ${filename} -> ${backupPath}`);
      } catch (error) {
        console.error(`❌ 백업 실패: ${file.path}`, error.message);
      }
    }
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: !args.includes('--execute'),
    backup: !args.includes('--no-backup')
  };

  try {
    const analyzer = new QualityAnalyzer();
    
    console.log('🔍 저품질 파일 분석 및 정리 시작\n');
    
    const analysis = await analyzer.analyzeAllFiles();
    analyzer.printAnalysisReport(analysis);
    
    const deletedFiles = await analyzer.cleanupLowQualityFiles(analysis, options);
    
    console.log('\n✨ 정리 완료!');
    console.log(`삭제된 파일: ${deletedFiles.length}개`);
    
    if (options.dryRun) {
      console.log('\n💡 실제 삭제하려면 --execute 옵션을 사용하세요.');
      console.log('   예: node scripts/cleanup-low-quality-files.js --execute');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { QualityAnalyzer };