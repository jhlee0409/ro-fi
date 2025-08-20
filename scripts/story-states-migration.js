#!/usr/bin/env node

/**
 * 🚀 Story States Migration Script
 * 
 * 목적: 전체 시스템 마이그레이션 및 검증
 */

import fs from 'fs/promises';
import path from 'path';
import { validateStoryState } from '../src/lib/story-state-schema.js';
import { enrichStoryState, createDefaultStoryState } from '../src/lib/story-state-defaults.js';

const STORY_STATES_DIR = './data/story-states';
const BACKUP_DIR = './data/story-states-backup';

/**
 * 메인 마이그레이션 실행
 */
async function runMigration() {
  console.log('🚀 Story States Migration 시작\n');
  
  const stats = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    warnings: 0,
    improvements: []
  };

  try {
    // 1. 백업 생성
    await createBackup();
    
    // 2. 파일 목록 가져오기
    const files = await fs.readdir(STORY_STATES_DIR);
    const jsonFiles = files.filter(file => 
      file.endsWith('.json') && 
      !file.startsWith('.') &&
      file !== 'archived-tests'
    );
    
    console.log(`📁 처리 대상 파일: ${jsonFiles.length}개\n`);
    
    // 3. 각 파일 마이그레이션
    for (const filename of jsonFiles) {
      const result = await migrateFile(filename);
      stats.processed++;
      
      if (result.success) {
        stats.succeeded++;
        if (result.improvement > 0) {
          stats.improvements.push({
            file: filename,
            improvement: result.improvement,
            issues: result.issuesFixed
          });
        }
      } else {
        stats.failed++;
      }
      
      stats.warnings += result.warnings || 0;
    }
    
    // 4. 결과 리포트
    generateReport(stats);
    
  } catch (error) {
    console.error('❌ Migration 실패:', error.message);
    process.exit(1);
  }
}

/**
 * 백업 생성
 */
async function createBackup() {
  console.log('💾 백업 생성 중...');
  
  try {
    await fs.access(BACKUP_DIR);
    console.log('   기존 백업 디렉토리 발견');
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log('   백업 디렉토리 생성');
  }
  
  // 파일 복사
  const files = await fs.readdir(STORY_STATES_DIR);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const source = path.join(STORY_STATES_DIR, file);
      const target = path.join(BACKUP_DIR, `${Date.now()}-${file}`);
      await fs.copyFile(source, target);
    }
  }
  
  console.log('✅ 백업 완료\n');
}

/**
 * 개별 파일 마이그레이션
 */
async function migrateFile(filename) {
  console.log(`🔧 처리 중: ${filename}`);
  
  const filepath = path.join(STORY_STATES_DIR, filename);
  
  try {
    // 파일 읽기
    const rawData = await fs.readFile(filepath, 'utf8');
    const originalState = JSON.parse(rawData);
    
    // 마이그레이션 전 검증
    const beforeValidation = validateStoryState(originalState);
    console.log(`   📊 마이그레이션 전: ${beforeValidation.score}/100`);
    
    // 데이터 보강
    const migratedState = enrichStoryState(originalState);
    
    // 마이그레이션 후 검증
    const afterValidation = validateStoryState(migratedState);
    console.log(`   📊 마이그레이션 후: ${afterValidation.score}/100`);
    
    const improvement = afterValidation.score - beforeValidation.score;
    if (improvement > 0) {
      console.log(`   📈 개선: +${improvement}점`);
    }
    
    // 오류 및 경고 보고
    if (afterValidation.errors.length > 0) {
      console.log(`   ❌ 오류: ${afterValidation.errors.length}개`);
      afterValidation.errors.forEach(error => console.log(`     - ${error}`));
    }
    
    if (afterValidation.warnings.length > 0) {
      console.log(`   ⚠️  경고: ${afterValidation.warnings.length}개`);
    }
    
    // 파일 저장
    await fs.writeFile(filepath, JSON.stringify(migratedState, null, 2));
    console.log(`   💾 저장 완료\n`);
    
    return {
      success: afterValidation.errors.length === 0,
      improvement,
      warnings: afterValidation.warnings.length,
      issuesFixed: beforeValidation.errors.length - afterValidation.errors.length
    };
    
  } catch (error) {
    console.error(`   ❌ 처리 실패: ${error.message}\n`);
    return {
      success: false,
      improvement: 0,
      warnings: 0,
      issuesFixed: 0
    };
  }
}

/**
 * 마이그레이션 결과 리포트
 */
function generateReport(stats) {
  console.log('\n' + '='.repeat(50));
  console.log('📋 MIGRATION REPORT');
  console.log('='.repeat(50));
  
  console.log(`\n📊 처리 통계:`);
  console.log(`   • 총 파일: ${stats.processed}개`);
  console.log(`   • 성공: ${stats.succeeded}개`);
  console.log(`   • 실패: ${stats.failed}개`);
  console.log(`   • 경고: ${stats.warnings}개`);
  
  if (stats.improvements.length > 0) {
    console.log(`\n📈 개선 사항:`);
    stats.improvements.forEach(item => {
      console.log(`   • ${item.file}: +${item.improvement}점 (${item.issues}개 이슈 수정)`);
    });
  }
  
  console.log(`\n✅ Migration 완료!`);
  
  if (stats.failed > 0) {
    console.log(`\n⚠️  ${stats.failed}개 파일 처리 실패 - 로그를 확인하세요.`);
  }
}

/**
 * 테스트 실행
 */
async function runTests() {
  console.log('🧪 Migration 테스트 실행\n');
  
  try {
    // 샘플 데이터로 테스트
    const testData = {
      novelSlug: 'test-novel',
      metadata: {
        title: '테스트 소설',
        author: 'Test Author',
        genre: '로맨스 판타지',
        status: '연재 중'
      },
      worldState: {},
      characters: {},
      plot: {},
      chapters: []
    };
    
    console.log('1. 기본 검증 테스트...');
    const validation = validateStoryState(testData);
    console.log(`   결과: ${validation.score}/100`);
    
    console.log('2. 데이터 보강 테스트...');
    const enriched = enrichStoryState(testData);
    const enrichedValidation = validateStoryState(enriched);
    console.log(`   결과: ${enrichedValidation.score}/100`);
    
    console.log('3. 스키마 검증 테스트...');
    const invalidData = { invalid: 'data' };
    const invalidValidation = validateStoryState(invalidData);
    console.log(`   결과: ${invalidValidation.score}/100 (${invalidValidation.errors.length}개 오류)`);
    
    console.log('\n✅ 모든 테스트 통과!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    process.exit(1);
  }
}

// CLI 인터페이스
const command = process.argv[2];

switch (command) {
  case 'test':
    runTests();
    break;
  case 'migrate':
  default:
    runMigration();
    break;
}

export { runMigration, runTests };