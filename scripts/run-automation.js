#!/usr/bin/env node

import { runFullAutomation } from '../src/lib/master-automation-engine.js';
import { promises as fs } from 'fs';
import { join } from 'path';

// 로그 함수
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };

  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

// 메인 실행 함수
async function main() {
  log('📱 디지털 소울메이트 자동 연재 시스템 시작', 'info');

  try {
    // 명령행 인수 확인
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');
    const isVerbose = args.includes('--verbose') || args.includes('-v');

    if (isDryRun) {
      log('🔄 드라이런 모드로 실행합니다 (파일 생성 없음)', 'warning');
    }

    // 콘텐츠 디렉토리 확인 및 생성 (드라이런이 아닌 경우에만)
    if (!isDryRun) {
      const contentDir = 'src/content';
      await ensureDirectories(contentDir);
    }

    // 자동화 실행
    const result = await runFullAutomation(isDryRun);

    if (result.success) {
      log(`✅ 자동화 성공: ${result.action}`, 'success');

      // 결과 상세 로그
      if (result.action === 'CREATE_NEW_NOVEL') {
        log(`📚 새 소설 생성: "${result.result.title}"`, 'info');
        log(`🏷️  장르: ${result.result.concept.genre}`, 'info');
        log(`🔗 트로프: ${result.result.concept.main} + ${result.result.concept.sub}`, 'info');
      } else if (result.action === 'CONTINUE_CHAPTER') {
        log(`📝 챕터 추가: ${result.result.newChapter}화`, 'info');
        log(`😊 감정 단계: ${result.result.emotionStage}`, 'info');
      } else if (result.action === 'COMPLETE_NOVEL') {
        log(`🎉 소설 완결: ${result.result.completedNovel}`, 'success');
        log(`📖 완결 챕터: ${result.result.finalChapters.join(', ')}화`, 'info');
      }

      // 현재 상황 리포트
      await generateStatusReport(result.situation);

    } else {
      log(`❌ 자동화 실패: ${result.error}`, 'error');
      process.exit(1);
    }

  } catch (error) {
    log(`💥 시스템 오류: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// 디렉토리 확인 및 생성
async function ensureDirectories(contentDir) {
  const directories = [
    join(contentDir, 'novels'),
    join(contentDir, 'chapters'),
    join(contentDir, 'tropes')
  ];

  for (const dir of directories) {
    try {
      await fs.access(dir);
      log(`📁 디렉토리 확인됨: ${dir}`, 'info');
    } catch {
      await fs.mkdir(dir, { recursive: true });
      log(`📁 디렉토리 생성됨: ${dir}`, 'info');
    }
  }
}

// 상태 리포트 생성
async function generateStatusReport(situation) {
  log('\n📊 현재 상태 리포트', 'info');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

  log(`📚 활성 소설 수: ${situation.totalActiveCount}`, 'info');
  log(`🆕 새 소설 필요: ${situation.needsNewNovel ? 'YES' : 'NO'}`, 'info');
  log(`🏁 완결 준비 소설: ${situation.readyForCompletion.length}개`, 'info');

  if (situation.activeNovels.length > 0) {
    log('\n📖 활성 소설 목록:', 'info');
    situation.activeNovels.forEach((novel, index) => {
      log(`  ${index + 1}. ${novel.data.title}`, 'info');
      log(`     진행도: ${novel.progressPercentage}% (${novel.chaptersCount}/${novel.data.totalChapters}화)`, 'info');
      log(`     최종 업데이트: ${novel.lastUpdate.toLocaleDateString('ko-KR')}`, 'info');

      if (novel.completionAnalysis.overallReadiness) {
        log(`     🎯 완결 준비 완료!`, 'success');
      }
    });
  }

  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

  // 리포트를 파일로도 저장 (logs 디렉토리 자동 생성)
  try {
    const logsDir = 'logs';
    await fs.mkdir(logsDir, { recursive: true });

    const reportPath = join(logsDir, `automation-report-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      situation,
      summary: {
        activeNovels: situation.totalActiveCount,
        needsNewNovel: situation.needsNewNovel,
        readyForCompletion: situation.readyForCompletion.length
      }
    }, null, 2));
    log(`📄 리포트 저장됨: ${reportPath}`, 'info');
  } catch (error) {
    log(`⚠️  리포트 저장 실패: ${error.message}`, 'warning');
  }
}

// 명령행 인수 처리
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📱 디지털 소울메이트 자동 연재 시스템 v3.0 📱

사용법:
  node scripts/run-automation.js [옵션]

옵션:
  --help, -h     이 도움말 표시
  --verbose, -v  상세 로그 출력
  --dry-run      실제 파일 생성 없이 시뮬레이션만 실행

예시:
  node scripts/run-automation.js           # 기본 실행
  node scripts/run-automation.js --verbose # 상세 로그 포함
  node scripts/run-automation.js --dry-run # 시뮬레이션 실행

이 스크립트는 다음을 자동으로 수행합니다:
- 디지털 소울메이트 소설 상태 분석
- 다음 챕터 자동 생성 및 연재
- 완결 조건 충족시 자동 완결 처리
- 감정 발전 단계별 스토리 진행

사이버펑크 로맨스 판타지의 완전 자동화 연재를 경험해보세요! ✨
`);
  process.exit(0);
}

// 실행
main().catch(error => {
  log(`💥 예기치 못한 오류: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});