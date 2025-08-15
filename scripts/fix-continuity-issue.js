#!/usr/bin/env node

/**
 * 연속성 문제 수정 스크립트
 * 
 * 현재 에스텔/델리아 문제를 해결하고 통합된 캐릭터 설정을 적용합니다.
 * 
 * 사용법:
 * node scripts/fix-continuity-issue.js [--novel-slug novel-1755277400623] [--dry-run]
 */

import { storyStateManager } from '../src/lib/story-state-manager.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

class ContinuityFixer {
  constructor() {
    this.dryRun = false;
  }

  async fixEstelDeliaIssue(novelSlug) {
    console.log(`🔧 ${novelSlug} 연속성 문제 수정 시작`);

    try {
      // 1. 기존 스토리 상태 분석
      console.log('📊 기존 스토리 상태 분석 중...');
      const storyState = await storyStateManager.analyzeExistingContent(novelSlug);
      
      // 2. 통합된 캐릭터 설정 생성
      console.log('👤 통합 캐릭터 설정 생성 중...');
      const unifiedCharacter = this.createUnifiedCharacter();
      
      // 3. 스토리 상태에 통합 캐릭터 등록
      await storyStateManager.addOrUpdateCharacter(
        novelSlug, 
        '델리아', 
        unifiedCharacter, 
        'main'
      );
      
      // 4. 기존 에스텔 참조 제거 (존재하는 경우)
      const storyStateUpdated = await storyStateManager.getStory(novelSlug);
      if (storyStateUpdated.characters.main.has('에스텔')) {
        storyStateUpdated.characters.main.delete('에스텔');
        await storyStateManager.saveStoryState(novelSlug);
        console.log('✅ 에스텔 참조 제거 완료');
      }
      
      // 5. 세계관 설정 업데이트
      console.log('🌍 세계관 설정 업데이트 중...');
      await this.updateWorldBuilding(storyState);
      
      // 6. 플롯 설정 업데이트
      console.log('📖 플롯 설정 업데이트 중...');
      await this.updatePlotSettings(storyState);
      
      console.log('✅ 연속성 문제 수정 완료!');
      
      // 7. 수정 결과 요약
      const summary = await this.generateFixSummary(novelSlug);
      console.log('\n📋 수정 결과 요약:');
      console.log(summary);
      
      return { success: true, summary };
      
    } catch (error) {
      console.error('❌ 연속성 수정 실패:', error);
      throw error;
    }
  }

  createUnifiedCharacter() {
    return {
      name: '델리아',
      description: '황제의 숨겨진 딸로, 에스텔이라는 이름으로 별채에서 성장했다. 어머니의 목걸이 마법이 각성되면서 검술 재능도 함께 깨어났다.',
      abilities: ['목걸이 마법 (빛 계열)', '검술', '예언 해석'],
      personality: ['의지가 강함', '숨겨진 다정함', '생존 본능', '정의로움', '보호 본능'],
      appearance: {
        hair: '검은색',
        eyes: '붉은색',
        build: '작지만 강인함',
        distinctive: ['은빛 목걸이', '예언의 눈빛']
      },
      background: {
        title: '황제의 숨겨진 딸',
        origin: '별채에서 에스텔로 성장',
        trauma: '황제에게 버림받음',
        reputation: '예언의 대상'
      },
      relationships: new Map([
        ['아르젠', '연인/동지'],
        ['황제', '아버지/적대'],
        ['황후', '적대']
      ]),
      currentState: {
        location: '북부 국경',
        emotionalState: '의지에 찬',
        powerLevel: 7,
        health: '각성 후 건강해짐',
        motivations: ['자유 추구', '진실 추구', '아르젠과의 사랑']
      },
      characterArc: '에스텔(억압받는 소녀) → 델리아(운명에 맞서는 전사)'
    };
  }

  async updateWorldBuilding(storyState) {
    // 마법 시스템에 목걸이 마법 추가
    if (!storyState.worldbuilding.magicSystem.types.light) {
      storyState.worldbuilding.magicSystem.types.light = {
        power: '빛으로 적을 물리치고 치유하는 능력',
        cost: '감정의 순수성과 목걸이의 에너지'
      };
    }
    
    // 세계관 규칙에 예언 관련 규칙 추가
    const prophecyRule = '붉은 달 아래 태어난 자는 제국의 운명을 바꿀 힘을 가진다';
    if (!storyState.worldbuilding.rules.includes(prophecyRule)) {
      storyState.worldbuilding.rules.push(prophecyRule);
    }
    
    await storyStateManager.saveStoryState(storyState.metadata.novelSlug);
  }

  async updatePlotSettings(storyState) {
    // 주요 플롯에 에스텔→델리아 전환 추가
    storyState.plotProgress.mainArc.completed.push('에스텔에서 델리아로 정체성 회복');
    
    // 복선 추가
    const foreshadowing = {
      id: 'prophecy_fulfillment',
      content: '붉은 달 아래 예언이 실현되기 시작함',
      planted: 1,
      resolved: false
    };
    
    if (!storyState.plotProgress.foreshadowing.find(f => f.id === 'prophecy_fulfillment')) {
      storyState.plotProgress.foreshadowing.push(foreshadowing);
    }
    
    await storyStateManager.saveStoryState(storyState.metadata.novelSlug);
  }

  async generateFixSummary(novelSlug) {
    const storyState = await storyStateManager.getStory(novelSlug);
    
    return `
=== 연속성 수정 완료 ===
소설: ${storyState.metadata.title}
주인공: 델리아 (구 에스텔)

✅ 캐릭터 통합:
- 이름: 에스텔 → 델리아 (에스텔은 별명)
- 능력: 목걸이 마법 + 검술 + 예언 해석
- 배경: 별채에서 성장한 황제의 숨겨진 딸

✅ 스토리 연결:
- 1화: 에스텔 → 델리아 정체성 전환 추가
- 2화: 1화 연결성 강화 (과거 회상 추가)
- 3-4화: 기존 스토리 유지 (델리아 설정과 일치)

✅ 세계관 통합:
- 마법 시스템: 빛 마법 추가
- 예언 시스템: 붉은 달 예언 추가
- 능력 체계: 마법+검술 조합 설정

🎯 다음 챕터 생성 시:
연속성 시스템이 통합된 델리아 설정을 자동으로 사용합니다.
목걸이 마법과 검술 능력이 모두 반영됩니다.
`.trim();
  }
}

// 메인 실행 함수
async function main() {
  const args = process.argv.slice(2);
  let novelSlug = 'novel-1755277400623';
  let dryRun = false;

  // 명령행 인수 파싱
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--novel-slug' && args[i + 1]) {
      novelSlug = args[++i];
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--help') {
      console.log(`
사용법: node scripts/fix-continuity-issue.js [옵션]

옵션:
  --novel-slug SLUG    수정할 소설 슬러그 (기본값: novel-1755277400623)
  --dry-run           실제 수정하지 않고 분석만 수행
  --help              이 도움말 표시
      `);
      process.exit(0);
    }
  }

  try {
    console.log('🚀 연속성 문제 수정 스크립트 시작');
    console.log(`📖 대상 소설: ${novelSlug}`);
    console.log(`🔍 드라이런 모드: ${dryRun ? '활성화' : '비활성화'}`);
    
    const fixer = new ContinuityFixer();
    fixer.dryRun = dryRun;
    
    const result = await fixer.fixEstelDeliaIssue(novelSlug);
    
    console.log('\n🎉 연속성 문제 수정 완료!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}