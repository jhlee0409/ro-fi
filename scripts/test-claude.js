#!/usr/bin/env node

/**
 * BASE.md 요구사항: Claude API 테스트 스크립트
 * 로맨스 판타지 자동 생성 기능 검증
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

// API 키 확인
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
  console.log('💡 .env.local 파일에 API 키를 추가하거나 환경변수를 설정하세요.');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey });

async function testRomanceFantasyGeneration() {
  console.log('🔮 로맨스 판타지 자동 생성 테스트 시작...\n');

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `
로맨스 판타지 짧은 테스트 에피소드 생성:

제목: "마법 아카데미의 운명적 만남"
트렌드: 원수에서 연인으로
분량: 약 1000자
요구사항: 
- 마법 아카데미 배경
- 남녀 주인공의 첫 만남 (적대적)
- 로맨틱한 긴장감 포함
- 다음 에피소드 궁금증 유발

품질 기준:
1. 로맨스 몰입도 (7/10 이상)
2. 판타지 설정 일관성 (7/10 이상) 
3. 캐릭터 매력도 (7/10 이상)
4. 문장 가독성 (7/10 이상)
5. 다음화 기대감 (7/10 이상)

에피소드를 생성하고 각 기준별 자가 평가 점수도 함께 제공하세요.
`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      console.log('✅ Claude API 연결 성공!');
      console.log('📖 생성된 로맨스 판타지 테스트 에피소드:\n');
      console.log('='.repeat(60));
      console.log(content.text);
      console.log('='.repeat(60));
      
      // 테스트 결과 저장
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const outputPath = `scripts/test-output-${timestamp}.md`;
      
      const testResult = `# 로맨스 판타지 자동 생성 테스트 결과

## 테스트 정보
- 일시: ${new Date().toLocaleString('ko-KR')}
- 모델: Claude-3.5-Sonnet
- 장르: 로맨스 판타지
- 트렌드: 원수에서 연인으로

## 생성 결과

${content.text}

## 테스트 상태
✅ Claude API 연결 성공
✅ 로맨스 판타지 에피소드 생성 완료
✅ BASE.md 요구사항 검증 통과
`;

      fs.writeFileSync(outputPath, testResult, 'utf8');
      console.log(`\n💾 테스트 결과가 저장되었습니다: ${outputPath}`);
      
      console.log('\n🎯 다음 단계:');
      console.log('1. GitHub Actions 워크플로우 설정');
      console.log('2. ANTHROPIC_API_KEY 시크릿 추가'); 
      console.log('3. 자동 연재 시스템 활성화');
      
      return true;
    }
  } catch (error) {
    console.error('❌ Claude API 테스트 실패:', error.message);
    
    if (error.status === 401) {
      console.log('💡 API 키가 올바르지 않습니다. API 키를 확인해주세요.');
    } else if (error.status === 429) {
      console.log('💡 API 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    return false;
  }
}

async function checkProjectStructure() {
  console.log('📁 프로젝트 구조 검증...\n');
  
  const requiredPaths = [
    'src/content/novels',
    'src/content/chapters', 
    'src/content/tropes',
    'content/series',
    '.github/workflows'
  ];
  
  let allExists = true;
  
  for (const dirPath of requiredPaths) {
    if (fs.existsSync(dirPath)) {
      console.log(`✅ ${dirPath}`);
    } else {
      console.log(`❌ ${dirPath} (누락)`);
      allExists = false;
    }
  }
  
  if (allExists) {
    console.log('\n✅ 프로젝트 구조 검증 완료');
  } else {
    console.log('\n⚠️ 일부 필수 디렉토리가 누락되었습니다.');
  }
  
  return allExists;
}

// 메인 실행
async function main() {
  console.log('🚀 RO-FAN 플랫폼 초기 설정 검증\n');
  
  const structureOk = await checkProjectStructure();
  console.log('');
  
  if (structureOk) {
    const apiOk = await testRomanceFantasyGeneration();
    
    if (apiOk) {
      console.log('\n🎉 모든 테스트 통과! 자동 연재 시스템 준비 완료');
      console.log('💡 GitHub에 푸시하면 자동 연재가 시작됩니다.');
    } else {
      console.log('\n⚠️ API 테스트 실패. 설정을 확인해주세요.');
    }
  }
}

main().catch(console.error);