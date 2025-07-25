#!/usr/bin/env node

// AI 생성 테스트 스크립트
import { AIIntegratedEngine } from '../src/lib/ai-integration-fix.js';

async function testAIGeneration() {
  console.log('🧪 AI 생성 테스트 시작...');

  const engine = new AIIntegratedEngine();

  try {
    const result = await engine.generateRealChapter('test-novel', 1, {
      title: '테스트 로맨스',
      main: 'enemies-to-lovers',
      sub: 'fated-mates'
    });

    console.log('✅ 생성 성공!');
    console.log('📝 제목:', result.frontmatter.title);
    console.log('📊 글자 수:', result.frontmatter.wordCount);
    console.log('📖 내용 미리보기:');
    console.log(result.content.substring(0, 200) + '...');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

testAIGeneration();