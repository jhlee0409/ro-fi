#!/usr/bin/env node

/**
 * 🔧 Story States 데이터 보강 스크립트
 * 
 * 목적: 빈 데이터를 의미있는 기본값으로 보강
 */

import fs from 'fs/promises';
import path from 'path';
import { enrichStoryState, validateStoryState } from '../src/lib/story-state-defaults.js';

const STORY_STATES_DIR = './data/story-states';

async function enrichAllStoryStates() {
  console.log('🔧 Story States 데이터 보강 시작...\n');
  
  try {
    // 파일 목록 가져오기
    const files = await fs.readdir(STORY_STATES_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json') && !file.startsWith('.'));
    
    console.log(`📁 발견된 파일: ${jsonFiles.length}개\n`);
    
    for (const filename of jsonFiles) {
      const filepath = path.join(STORY_STATES_DIR, filename);
      
      console.log(`🔍 처리 중: ${filename}`);
      
      // 파일 읽기
      const rawData = await fs.readFile(filepath, 'utf8');
      const storyState = JSON.parse(rawData);
      
      // 검증 (보강 전)
      const beforeValidation = validateStoryState(storyState);
      console.log(`   ⚠️  보강 전 점수: ${beforeValidation.score}/100`);
      
      if (beforeValidation.warnings.length > 0) {
        console.log(`   📋 경고: ${beforeValidation.warnings.length}개`);
      }
      
      // 데이터 보강
      const enrichedState = enrichStoryState(storyState);
      
      // 검증 (보강 후)
      const afterValidation = validateStoryState(enrichedState);
      console.log(`   ✅ 보강 후 점수: ${afterValidation.score}/100`);
      
      // 개선 사항 표시
      const improvement = afterValidation.score - beforeValidation.score;
      if (improvement > 0) {
        console.log(`   📈 개선: +${improvement}점`);
      }
      
      // 파일 저장
      await fs.writeFile(filepath, JSON.stringify(enrichedState, null, 2));
      console.log(`   💾 저장 완료\n`);
    }
    
    console.log('🎉 모든 Story States 보강 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 직접 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  enrichAllStoryStates();
}

export default enrichAllStoryStates;