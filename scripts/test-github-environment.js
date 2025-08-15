#!/usr/bin/env node

/**
 * GitHub Actions 환경 테스트 스크립트
 * GEMINI_API_KEY가 올바르게 설정되어 있는지 확인
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// 환경변수 로드 (GitHub Actions와 로컬 환경 모두 지원)
dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

async function testGitHubEnvironment() {
  console.log('🔍 GitHub Actions 환경 테스트 시작\n');
  
  // 환경변수 확인
  console.log('📋 환경변수 상태:');
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV || '미설정'}`);
  console.log(`  - GEMINI_API_KEY 존재: ${process.env.GEMINI_API_KEY ? '✅' : '❌'}`);
  console.log(`  - API 키 길이: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0}`);
  console.log('');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
    console.log('GitHub Secrets에서 GEMINI_API_KEY를 확인해주세요.');
    process.exit(1);
  }
  
  // API 연결 테스트
  try {
    console.log('🔗 Gemini API 연결 테스트...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const result = await model.generateContent('안녕하세요! 간단한 인사 한 줄로 답해주세요.');
    const response = result.response.text();
    
    console.log(`✅ API 연결 성공! 응답: ${response.substring(0, 50)}...`);
    console.log('');
    
    // 성공 결과
    console.log('🎉 GitHub Actions 환경 테스트 완료!');
    console.log('✅ 모든 환경 설정이 올바릅니다.');
    
    process.exit(0);
    
  } catch (error) {
    console.log(`❌ API 연결 실패: ${error.message}`);
    console.log('');
    console.log('🔧 확인 사항:');
    console.log('  1. GitHub Secrets에 GEMINI_API_KEY 올바르게 설정');
    console.log('  2. API 키가 유효하고 사용 가능한 상태인지 확인');
    console.log('  3. Google AI Studio에서 API 할당량 확인');
    
    process.exit(1);
  }
}

testGitHubEnvironment();