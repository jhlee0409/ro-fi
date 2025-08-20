#!/usr/bin/env node
/**
 * 🔧 연속성 시스템 활성화 스크립트
 * 
 * 목적: TypeScript 모듈 로딩 문제 해결 및 연속성 시스템 활성화
 * 작성일: 2025-08-19
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// 간단한 로거 구현 (logger.ts가 JavaScript가 아니므로)
const logger = {
  info: async (msg, data) => console.log(`ℹ️ ${msg}`, data || ''),
  success: async (msg, data) => console.log(`✅ ${msg}`, data || ''),
  warn: async (msg, data) => console.warn(`⚠️ ${msg}`, data || ''),
  error: async (msg, data) => console.error(`❌ ${msg}`, data || '')
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Step 1: continuity-integration.js 수정 - TypeScript import를 JavaScript로 변경
 */
async function fixContinuityIntegration() {
  await logger.info('🔧 연속성 통합 모듈 수정 시작...');
  
  const filePath = path.join(__dirname, '../src/lib/continuity-integration.js');
  let content = await fs.readFile(filePath, 'utf-8');
  
  // TypeScript imports를 JavaScript로 변경
  content = content.replace(
    /await import\('\.\/(.+?)\.ts'\)/g,
    "await import('./$1.js')"
  );
  
  await fs.writeFile(filePath, content);
  await logger.success('✅ continuity-integration.js 수정 완료');
}

/**
 * Step 2: TypeScript 모듈들을 JavaScript로 변환 (간단한 변환)
 */
async function convertTypeScriptModules() {
  await logger.info('🔄 TypeScript 모듈 변환 시작...');
  
  const modules = [
    'story-state-manager',
    'episode-continuity-engine',
    'context-window-manager',
    'continuity-aware-generator'
  ];
  
  for (const module of modules) {
    const tsPath = path.join(__dirname, `../src/lib/${module}.ts`);
    const jsPath = path.join(__dirname, `../src/lib/${module}.js`);
    
    try {
      let content = await fs.readFile(tsPath, 'utf-8');
      
      // 기본적인 TypeScript 구문 제거
      content = content
        // import type 구문을 일반 import로 변경
        .replace(/import type/g, 'import')
        // 타입 정의 제거
        .replace(/: \w+(\[\])?/g, '')
        .replace(/<\w+>/g, '')
        // interface와 type 정의 주석 처리
        .replace(/^(interface|type) .+$/gm, '// $&')
        // async/await는 그대로 유지
        .replace(/async (\w+)\(/g, 'async $1(')
        // export 구문 유지
        .replace(/export (class|const|function)/g, 'export $1');
      
      await fs.writeFile(jsPath, content);
      await logger.success(`✅ ${module}.js 생성 완료`);
    } catch (error) {
      await logger.warn(`⚠️ ${module} 변환 실패: ${error.message}`);
    }
  }
}

/**
 * Step 3: ai-novel-generator.js의 slug 인식 개선
 */
async function fixSlugRecognition() {
  await logger.info('🔧 Slug 인식 로직 개선...');
  
  const filePath = path.join(__dirname, 'ai-novel-generator.js');
  let content = await fs.readFile(filePath, 'utf-8');
  
  // generateContent 메서드에서 novelSlug 추출 로직 개선
  const improvedSlugExtraction = `
  // 개선된 novelSlug 추출 로직
  extractNovelSlug(context) {
    // 1. 파일명에서 추출
    if (context.fileName) {
      const match = context.fileName.match(/([a-z0-9-]+)-ch\\d+/);
      if (match) return match[1];
    }
    
    // 2. novel 필드에서 추출
    if (context.novel) {
      return context.novel;
    }
    
    // 3. storyContext에서 추출
    if (context.storyContext?.novelSlug) {
      return context.storyContext.novelSlug;
    }
    
    // 4. 기본값 생성
    const timestamp = Date.now();
    return \`novel-\${timestamp}\`;
  }`;
  
  // generateContent 메서드 찾아서 수정
  if (!content.includes('extractNovelSlug')) {
    // 메서드 추가
    const classEndIndex = content.lastIndexOf('}');
    content = content.slice(0, classEndIndex) + improvedSlugExtraction + '\n' + content.slice(classEndIndex);
  }
  
  await fs.writeFile(filePath, content);
  await logger.success('✅ Slug 인식 로직 개선 완료');
}

/**
 * Step 4: 환경 변수 확인 및 설정
 */
async function ensureEnvironmentVariables() {
  await logger.info('🔧 환경 변수 확인...');
  
  const envPath = path.join(__dirname, '../.env.local');
  let envContent = await fs.readFile(envPath, 'utf-8');
  
  if (!envContent.includes('ENABLE_CONTINUITY_SYSTEM=true')) {
    envContent += '\nENABLE_CONTINUITY_SYSTEM=true\n';
    await fs.writeFile(envPath, envContent);
    await logger.success('✅ ENABLE_CONTINUITY_SYSTEM=true 설정 완료');
  } else {
    await logger.info('✅ 연속성 시스템 이미 활성화됨');
  }
}

/**
 * Step 5: 테스트 실행
 */
async function testContinuitySystem() {
  await logger.info('🧪 연속성 시스템 테스트...');
  
  try {
    // 환경 변수 설정
    process.env.ENABLE_CONTINUITY_SYSTEM = 'true';
    
    // 모듈 로드 테스트
    const { ContinuityIntegrationManager } = await import('../src/lib/continuity-integration.js');
    const manager = new ContinuityIntegrationManager(logger);
    
    const status = await manager.getSystemStatus();
    await logger.info('시스템 상태:', status);
    
    if (status.continuityEnabled) {
      await logger.success('✅ 연속성 시스템 활성화 성공!');
      return true;
    } else {
      await logger.warn('⚠️ 연속성 시스템 활성화 실패');
      return false;
    }
  } catch (error) {
    await logger.error('❌ 테스트 실패:', error);
    return false;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  await logger.info('🚀 연속성 시스템 활성화 프로세스 시작');
  
  try {
    // 1. continuity-integration.js 수정
    await fixContinuityIntegration();
    
    // 2. TypeScript 모듈 변환
    await convertTypeScriptModules();
    
    // 3. Slug 인식 개선
    await fixSlugRecognition();
    
    // 4. 환경 변수 설정
    await ensureEnvironmentVariables();
    
    // 5. 테스트
    const success = await testContinuitySystem();
    
    if (success) {
      await logger.success(`
========================================
✅ 연속성 시스템 활성화 완료!
========================================
이제 다음 기능이 활성화되었습니다:
- JSON 기반 스토리 상태 관리
- 캐릭터/세계관 일관성 검증
- 자동 플롯 진행 추적
- 스마트 엔딩 관리
========================================
      `);
    } else {
      await logger.warn('⚠️ 일부 기능이 제대로 활성화되지 않았습니다. 수동 확인이 필요합니다.');
    }
    
  } catch (error) {
    await logger.error('❌ 활성화 프로세스 실패:', error);
    process.exit(1);
  }
}

// 실행
main().catch(console.error);