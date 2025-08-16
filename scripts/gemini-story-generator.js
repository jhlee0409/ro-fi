#!/usr/bin/env node

/**
 * 🔄 Gemini Story Generator - Legacy Compatibility Wrapper
 * 
 * 이 파일은 기존 GitHub Actions와의 호환성을 위한 wrapper입니다.
 * 내부적으로는 새로 개선된 ai-novel-generator.js를 호출합니다.
 * 
 * 🎯 목적:
 * - 기존 GitHub Actions 워크플로우와 호환성 유지
 * - 고품질 AI 생성 시스템으로 자동 redirect
 * - novel- 프리픽스 저품질 파일 생성 방지
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔄 Legacy Gemini Story Generator (Compatibility Wrapper)');
console.log('📈 Redirecting to enhanced ai-novel-generator.js system...');
console.log('');

// 새로운 고품질 시스템으로 redirect
const aiNovelGeneratorPath = join(__dirname, 'ai-novel-generator.js');

// 명령행 옵션 설정 (고품질 생성을 위한 최적 설정)
const args = [
  aiNovelGeneratorPath,
  '--mode', 'auto',           // 자동 모드
  '--creativity', 'high',     // 고창의성
  '--verbose'                 // 상세 로그
];

console.log('🚀 Starting enhanced AI novel generation system...');
console.log(`📋 Command: node ${args.join(' ')}`);
console.log('');

// 새로운 시스템 실행
const childProcess = spawn('node', args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    // 품질 검증 활성화
    ENABLE_QUALITY_VALIDATION: 'true',
    // 연속성 시스템 활성화 (가능한 경우)
    ENABLE_CONTINUITY_SYSTEM: process.env.ENABLE_CONTINUITY_SYSTEM || 'false'
  }
});

// 에러 처리
childProcess.on('error', (error) => {
  console.error('❌ Enhanced system execution failed:', error.message);
  console.error('');
  console.error('🔧 Troubleshooting:');
  console.error('1. Check if ai-novel-generator.js exists');
  console.error('2. Verify GEMINI_API_KEY is properly set');
  console.error('3. Ensure all dependencies are installed');
  process.exit(1);
});

// 종료 처리
childProcess.on('close', (code) => {
  if (code === 0) {
    console.log('');
    console.log('✅ Enhanced AI novel generation completed successfully!');
    console.log('🎉 High-quality content generated with improved system');
  } else {
    console.log('');
    console.log(`❌ Enhanced system exited with code ${code}`);
    console.error('💡 This wrapper redirects to the new ai-novel-generator.js system');
    console.error('   Check the logs above for detailed error information');
  }
  process.exit(code);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🛑 Received interrupt signal, stopping...');
  childProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received termination signal, stopping...');
  childProcess.kill('SIGTERM');
});