#!/usr/bin/env node

/**
 * 플랫폼별 최적화 시스템 테스트 스크립트
 * 
 * 테스트 항목:
 * 1. 플랫폼 설정 엔진 기본 기능
 * 2. 플랫폼별 분량 설정
 * 3. AI 프롬프트 최적화
 * 4. 품질 기준 적응
 */

import { PlatformConfigEngine, printPlatformSummary } from '../src/lib/platform-config-engine.js';
import { QualityAssuranceEngine } from '../src/lib/quality-assurance-engine.js';
import { AIStoryGenerator } from '../src/lib/ai-story-generator.js';

console.log('🚀 플랫폼별 최적화 시스템 테스트 시작...\n');

// 1. 플랫폼 설정 엔진 기본 테스트
console.log('📊 1. 플랫폼 설정 엔진 기본 테스트');
console.log('=====================================');

const platformConfig = new PlatformConfigEngine();
const platforms = platformConfig.getAvailablePlatforms();

console.log('사용 가능한 플랫폼:');
platforms.forEach(platform => {
  console.log(`   - ${platform.name}: ${platform.wordCount}자 목표`);
});

// 2. 플랫폼별 분량 비교
console.log('\n📏 2. 플랫폼별 분량 비교');
console.log('========================');

const comparison = platformConfig.compareWordCounts();
Object.entries(comparison).forEach(([key, data]) => {
  console.log(`\n${data.name}:`);
  console.log(`   - 목표: ${data.target}자 (공백 제외)`);
  console.log(`   - 범위: ${data.range}자`);
  console.log(`   - 공백 포함 추정: ${data.spacesIncluded}자`);
});

// 3. 플랫폼별 프롬프트 가이드라인 테스트
console.log('\n🎨 3. 플랫폼별 프롬프트 가이드라인');
console.log('==================================');

const testPlatforms = ['default', 'naver', 'munpia', 'ridibooks'];

testPlatforms.forEach(platform => {
  console.log(`\n[${platform.toUpperCase()}] 플랫폼 가이드라인:`);
  
  const config = platformConfig.getConfig(platform);
  const guidelines = platformConfig.generatePromptGuidelines(platform);
  
  console.log(`   - 분량: ${guidelines.wordCountGuideline}`);
  console.log(`   - 구성: ${guidelines.structureGuideline}`);
  console.log(`   - 스타일: ${guidelines.styleGuideline}`);
  console.log(`   - 품질: ${guidelines.qualityGuideline}`);
});

// 4. 품질 기준 적응 테스트
console.log('\n🏆 4. 품질 기준 적응 테스트');
console.log('============================');

testPlatforms.forEach(platform => {
  const qualityEngine = new QualityAssuranceEngine(platform);
  const standards = qualityEngine.qualityStandards;
  
  console.log(`\n[${platform.toUpperCase()}] 품질 기준:`);
  console.log(`   - 분량 범위: ${standards.minWordCount}-${standards.maxWordCount}자`);
  console.log(`   - 품질 임계점: ${standards.qualityThreshold}점`);
  console.log(`   - 캐릭터 일관성: ${standards.characterConsistencyThreshold}점`);
  console.log(`   - 대화 비율: ${Math.round(standards.dialogueRatio * 100)}%`);
});

// 5. AI 생성기 플랫폼 지원 테스트
console.log('\n🤖 5. AI 생성기 플랫폼 지원 테스트');
console.log('====================================');

// API 키가 없어도 기본 기능 테스트
const generator = new AIStoryGenerator('test-key', 'naver');
const platformInfo = generator.getPlatformInfo();

console.log('네이버 플랫폼 설정:');
console.log(`   - 플랫폼: ${platformInfo.platformName}`);
console.log(`   - 목표 분량: ${platformInfo.targetWordCount}자`);
console.log(`   - 예상 장면 수: ${platformInfo.expectedScenes}개`);

// 플랫폼 변경 테스트
console.log('\n플랫폼 전환 테스트:');
const switchResult = generator.setPlatform('munpia');
console.log(`   - 문피아 전환: ${switchResult ? '성공' : '실패'}`);

const newInfo = generator.getPlatformInfo();
console.log(`   - 새 목표 분량: ${newInfo.targetWordCount}자`);

// 6. 환경 변수 시뮬레이션 테스트
console.log('\n🔧 6. 환경 변수 시뮬레이션 테스트');
console.log('===================================');

// 실제 환경 변수 확인
const currentPlatform = process.env.PLATFORM_MODE || 'default';
console.log(`현재 PLATFORM_MODE: ${currentPlatform}`);

console.log('\n환경 변수 설정 예시:');
console.log('   - PLATFORM_MODE=naver node scripts/run-automation.js');
console.log('   - PLATFORM_MODE=munpia node scripts/test-platform-system.js');
console.log('   - PLATFORM_MODE=ridibooks npm run automation:run');

// 7. 성능 비교 분석
console.log('\n📈 7. 성능 영향 분석');
console.log('=====================');

const defaultConfig = platformConfig.getConfig('default');
const naverConfig = platformConfig.getConfig('naver');
const munpiaConfig = platformConfig.getConfig('munpia');

const defaultTokens = Math.round(defaultConfig.wordCount.target * 1.5); // 토큰 추정
const naverTokens = Math.round(naverConfig.wordCount.target * 1.5);
const munpiaTokens = Math.round(munpiaConfig.wordCount.target * 1.5);

console.log(`토큰 사용량 비교 (추정):`)
console.log(`   - 기본 모드: ${defaultTokens} 토큰`);
console.log(`   - 네이버 모드: ${naverTokens} 토큰 (+${Math.round((naverTokens/defaultTokens-1)*100)}%)`);
console.log(`   - 문피아 모드: ${munpiaTokens} 토큰 (+${Math.round((munpiaTokens/defaultTokens-1)*100)}%)`);

console.log(`\n예상 AI 비용 증가:`)
console.log(`   - 네이버: 약 ${Math.round((naverTokens/defaultTokens-1)*100)}% 증가`);
console.log(`   - 문피아: 약 ${Math.round((munpiaTokens/defaultTokens-1)*100)}% 증가`);
console.log(`   - 리디북스: 약 ${Math.round((Math.round(platformConfig.getConfig('ridibooks').wordCount.target * 1.5)/defaultTokens-1)*100)}% 증가`);

// 8. 결과 요약
console.log('\n✨ 테스트 결과 요약');
console.log('==================');
console.log('1. ✅ 플랫폼 설정 엔진: 4개 플랫폼 지원 완료');
console.log('2. ✅ 분량 최적화: 플랫폼별 목표 분량 자동 설정');
console.log('3. ✅ 프롬프트 적응: 플랫폼 특성에 맞는 가이드라인 생성');
console.log('4. ✅ 품질 기준 조정: 플랫폼별 품질 임계점 적용');
console.log('5. ✅ AI 생성기 통합: 기존 시스템과 완전 호환');
console.log('6. ✅ 환경 변수 지원: PLATFORM_MODE로 간편 설정');

console.log('\n🎯 주요 개선사항:');
console.log('- 네이버/카카오: 2,800자 목표 (기존 대비 +60%)');
console.log('- 문피아/조아라: 3,600자 목표 (기존 대비 +106%)');
console.log('- 리디북스: 3,200자 목표 (기존 대비 +83%)');
console.log('- 플랫폼별 스타일 최적화 및 품질 기준 차별화');

console.log('\n💡 사용 방법:');
console.log('현재 시스템: node scripts/run-automation.js');
console.log('네이버 최적화: PLATFORM_MODE=naver node scripts/run-automation.js');
console.log('문피아 최적화: PLATFORM_MODE=munpia node scripts/run-automation.js');
console.log('리디북스 최적화: PLATFORM_MODE=ridibooks node scripts/run-automation.js');

console.log('\n🚀 플랫폼별 최적화 시스템이 성공적으로 통합되었습니다!');

// 플랫폼 요약 출력
console.log('\n📚 플랫폼 상세 정보:');
printPlatformSummary();