#!/usr/bin/env node

/**
 * 🌟 World-Class Quality System 챕터 품질 검증 도구
 * 
 * 기존 챕터의 품질을 World-Class Enhancement Engine으로 검증하고 개선
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import dotenv from 'dotenv';

// World-Class Enhancement Engine 가져오기
import { WorldClassEnhancementEngine } from '../src/lib/world-class-enhancement-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// 환경변수 로드
dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

class ChapterQualityChecker {
  constructor() {
    this.logger = {
      info: (msg, data) => console.log(`ℹ️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      warn: (msg, data) => console.log(`⚠️  ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      error: (msg, data) => console.log(`❌ ${msg}`, data ? JSON.stringify(data, null, 2) : ''),
      success: (msg, data) => console.log(`✅ ${msg}`, data ? JSON.stringify(data, null, 2) : '')
    };
    
    this.enhancementEngine = new WorldClassEnhancementEngine(this.logger);
  }

  async checkChapterQuality(novelSlug, chapterNumber) {
    console.log(`🔍 챕터 품질 검증 시작: ${novelSlug} - 챕터 ${chapterNumber}\n`);
    
    try {
      // 챕터 파일 읽기
      const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `${novelSlug}-ch${chapterNumber}.md`);
      const chapterContent = await fs.readFile(chapterPath, 'utf-8');
      const { data: frontmatter, content } = matter(chapterContent);
      
      console.log(`📄 챕터 정보:`);
      console.log(`   제목: ${frontmatter.title}`);
      console.log(`   글자 수: ${frontmatter.wordCount || content.length}`);
      console.log(`   출간일: ${frontmatter.publicationDate}`);
      console.log(`   감정 톤: ${frontmatter.emotionalTone}\n`);
      
      // 스토리 컨텍스트 구성
      const storyContext = {
        novelType: 'romance-fantasy',
        chapterNumber: parseInt(chapterNumber),
        allowBackstory: true,
        emotionalTone: frontmatter.emotionalTone || 'romance'
      };
      
      // World-Class Enhancement Engine으로 품질 검증
      console.log('🌟 World-Class Quality 분석 시작...\n');
      
      const transformationResult = await this.enhancementEngine.transformToWorldClass(
        content,
        storyContext
      );
      
      // 결과 분석
      const diagnosis = transformationResult.diagnosis;
      const finalQuality = transformationResult.finalQuality;
      
      console.log('📊 품질 분석 결과:');
      console.log('================================');
      console.log(`전체 심각도: ${(diagnosis.overallSeverity * 100).toFixed(1)}%`);
      console.log(`플롯 정체성: ${(diagnosis.plotStagnation.severity * 100).toFixed(1)}% - ${diagnosis.plotStagnation.details}`);
      console.log(`캐릭터 문제: ${(diagnosis.characterFlaws.severity * 100).toFixed(1)}% - ${diagnosis.characterFlaws.details}`);
      console.log(`문체 수준: ${(diagnosis.literaryQuality.severity * 100).toFixed(1)}% - ${diagnosis.literaryQuality.details}`);
      console.log(`로맨스 부족: ${(diagnosis.romanceFailure.severity * 100).toFixed(1)}% - ${diagnosis.romanceFailure.details}\n`);
      
      console.log('🎯 최종 품질 점수:');
      console.log('================================');
      console.log(`플롯 진전: ${finalQuality.plotProgression.toFixed(1)}/10`);
      console.log(`캐릭터 깊이: ${finalQuality.characterDepth.toFixed(1)}/10`);
      console.log(`문체 수준: ${finalQuality.literaryLevel.toFixed(1)}/10`);
      console.log(`로맨스 케미스트리: ${finalQuality.romanceChemistry.toFixed(1)}/10`);
      console.log(`현대적 감수성: ${finalQuality.modernStandards.toFixed(1)}/10`);
      console.log(`종합 점수: ${finalQuality.overallScore.toFixed(1)}/10`);
      console.log(`품질 등급: ${finalQuality.worldClassStatus}\n`);
      
      // 개선된 컨텐츠가 있는지 확인
      if (transformationResult.enhancedContent !== content) {
        console.log('✨ 컨텐츠 개선이 적용되었습니다!\n');
        
        // 개선된 내용 저장 여부 묻기
        const args = process.argv.slice(2);
        if (args.includes('--save')) {
          await this.saveImprovedChapter(chapterPath, frontmatter, transformationResult.enhancedContent, finalQuality);
        } else {
          console.log('💡 개선된 내용을 저장하려면 --save 옵션을 사용하세요.');
          console.log(`   예: node scripts/quality-check-chapter.js ${novelSlug} ${chapterNumber} --save\n`);
          
          // 개선된 내용 미리보기 (처음 500자)
          console.log('📝 개선된 내용 미리보기:');
          console.log('━'.repeat(50));
          console.log(transformationResult.enhancedContent.substring(0, 500) + '...');
          console.log('━'.repeat(50));
        }
      } else {
        console.log('ℹ️  현재 컨텐츠는 이미 적절한 품질을 유지하고 있습니다.');
      }
      
      return transformationResult;
      
    } catch (error) {
      console.error('❌ 품질 검증 실패:', error.message);
      throw error;
    }
  }
  
  async saveImprovedChapter(chapterPath, frontmatter, improvedContent, finalQuality) {
    try {
      // 백업 생성
      const backupPath = chapterPath.replace('.md', '.backup.md');
      const originalContent = await fs.readFile(chapterPath, 'utf-8');
      await fs.writeFile(backupPath, originalContent);
      
      // 프론트매터 업데이트
      const updatedFrontmatter = {
        ...frontmatter,
        lastQualityCheck: new Date().toISOString(),
        qualityScore: parseFloat(finalQuality.overallScore.toFixed(1)),
        worldClassStatus: finalQuality.worldClassStatus
      };
      
      // 개선된 챕터 저장
      const updatedChapter = matter.stringify(improvedContent, updatedFrontmatter);
      await fs.writeFile(chapterPath, updatedChapter);
      
      console.log(`✅ 개선된 챕터가 저장되었습니다!`);
      console.log(`📁 백업: ${backupPath}`);
      console.log(`📈 품질 점수: ${finalQuality.overallScore.toFixed(1)}/10 (${finalQuality.worldClassStatus})`);
      
    } catch (error) {
      console.error('❌ 저장 실패:', error.message);
      throw error;
    }
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('사용법: node scripts/quality-check-chapter.js [novel-slug] [chapter-number] [--save]');
    console.log('예시: node scripts/quality-check-chapter.js elf-shadow-moonlight-bloom 5 --save');
    process.exit(1);
  }
  
  const [novelSlug, chapterNumber] = args;
  
  try {
    const checker = new ChapterQualityChecker();
    await checker.checkChapterQuality(novelSlug, chapterNumber);
    
    console.log('\n🏁 품질 검증 완료!');
    
  } catch (error) {
    console.error('\n💥 오류 발생:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ChapterQualityChecker };