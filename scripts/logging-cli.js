#!/usr/bin/env node

/**
 * 로깅 시스템 CLI 도구
 * 로그 관리, 모니터링, 알림 테스트 등을 위한 명령줄 도구
 */

import { getLogger } from '../src/lib/logging-service.js';
import { getLogManager } from '../src/lib/log-manager.js';
import { getMonitoringDashboard } from '../src/lib/monitoring-dashboard.js';
import { getAlertSystem, AlertRule } from '../src/lib/alert-system.js';
import { getPerformanceMonitor } from '../src/lib/performance-monitor.js';

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  try {
    switch (command) {
      case 'status':
        await showStatus();
        break;
      case 'logs':
        await manageLogs(args);
        break;
      case 'alerts':
        await manageAlerts(args);
        break;
      case 'metrics':
        await showMetrics();
        break;
      case 'test':
        await runTests(args);
        break;
      case 'cleanup':
        await cleanupLogs();
        break;
      case 'dashboard':
        await showDashboard();
        break;
      case 'monitor':
        await startMonitoring();
        break;
      default:
        showHelp();
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

/**
 * 시스템 상태 표시
 */
async function showStatus() {
  const dashboard = getMonitoringDashboard();
  const status = await dashboard.getStatusReport();

  console.log('📊 ro-fan 로깅 시스템 상태');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`상태: ${getStatusEmoji(status.status)} ${status.status.toUpperCase()}`);
  console.log(`가동시간: ${status.uptime}`);
  console.log('');
  
  console.log('📈 메트릭:');
  console.log(`  API 호출: ${status.metrics.apiCalls}`);
  console.log(`  토큰 사용: ${status.metrics.tokenUsage}`);
  console.log(`  에러율: ${status.metrics.errorRate}`);
  console.log(`  활성 소설: ${status.metrics.activeNovels}`);
  console.log(`  메모리 사용: ${status.metrics.memoryUsage}`);
  console.log('');

  if (status.alerts.length > 0) {
    console.log('🚨 활성 알림:');
    status.alerts.forEach(alert => {
      console.log(`  • ${alert}`);
    });
  } else {
    console.log('✅ 활성 알림 없음');
  }
}

/**
 * 로그 관리
 */
async function manageLogs(args) {
  const logManager = getLogManager();
  const action = args[0];

  switch (action) {
    case 'stats':
      const stats = await logManager.generateLogStats();
      console.log('📁 로그 통계:');
      console.log(`총 파일: ${stats.totalFiles}개`);
      console.log(`총 크기: ${stats.totalSizeMB}MB`);
      console.log('타입별:', stats.byType);
      console.log('연령별:', stats.byAge);
      break;

    case 'search':
      const searchTerm = args[1];
      if (!searchTerm) {
        console.log('사용법: logging-cli logs search <검색어>');
        return;
      }
      const results = await logManager.searchLogs(searchTerm, { maxResults: 20 });
      console.log(`🔍 "${searchTerm}" 검색 결과 (${results.length}개):`);
      results.forEach((result, i) => {
        console.log(`${i + 1}. ${result.file}:${result.line}`);
        console.log(`   ${result.content.substring(0, 100)}...`);
      });
      break;

    case 'cleanup':
      await logManager.applyRetentionPolicy();
      console.log('✅ 로그 정리 완료');
      break;

    case 'archive':
      const pattern = args[1] || 'daily';
      const archived = await logManager.archiveLogs(pattern);
      console.log(`📦 ${archived.length}개 파일 아카이브 완료`);
      break;

    default:
      console.log('로그 관리 명령:');
      console.log('  stats   - 로그 통계 표시');
      console.log('  search  - 로그 검색');
      console.log('  cleanup - 오래된 로그 정리');
      console.log('  archive - 로그 아카이브');
  }
}

/**
 * 알림 관리
 */
async function manageAlerts(args) {
  const alertSystem = getAlertSystem();
  const action = args[0];

  switch (action) {
    case 'stats':
      const stats = alertSystem.getAlertStatistics();
      console.log('🚨 알림 통계:');
      console.log(`총 알림: ${stats.total}개`);
      console.log('규칙별:', stats.byRule);
      console.log('심각도별:', stats.bySeverity);
      
      if (stats.recentAlerts.length > 0) {
        console.log('\n최근 알림:');
        stats.recentAlerts.slice(0, 5).forEach(alert => {
          console.log(`  • [${alert.severity}] ${alert.message} (${alert.timestamp})`);
        });
      }
      break;

    case 'test':
      const rule = args[1];
      if (!rule || !AlertRule[rule.toUpperCase()]) {
        console.log('사용법: logging-cli alerts test <규칙>');
        console.log('가능한 규칙:', Object.keys(AlertRule).join(', '));
        return;
      }
      
      const testData = { test: true, value: 100, threshold: 50 };
      const alert = await alertSystem.testAlert(AlertRule[rule.toUpperCase()], testData);
      console.log('✅ 테스트 알림 전송:', alert.message);
      break;

    default:
      console.log('알림 관리 명령:');
      console.log('  stats - 알림 통계 표시');
      console.log('  test  - 알림 테스트');
  }
}

/**
 * 메트릭 표시
 */
async function showMetrics() {
  const dashboard = getMonitoringDashboard();
  const report = await dashboard.generatePerformanceReport('hour');

  console.log('📊 성능 메트릭 (지난 1시간):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('🚀 성능:');
  console.log(`  평균 응답시간: ${report.performance.avgResponseTime}ms`);
  console.log(`  총 API 호출: ${report.performance.totalApiCalls}회`);
  console.log(`  성공률: ${report.performance.successRate}`);
  console.log(`  토큰 효율성: ${report.performance.tokenEfficiency} tokens/chapter`);
  
  console.log('\n💾 리소스:');
  console.log(`  평균 메모리: ${report.resource.avgMemoryUsage}%`);
  console.log(`  최대 메모리: ${report.resource.peakMemoryUsage}%`);
  console.log(`  로그 저장소: ${report.resource.logStorageUsed}`);
  
  console.log('\n💰 비용:');
  console.log(`  예상 비용: $${report.cost.estimated}`);
  console.log(`  Claude: $${report.cost.breakdown.claude}`);
  console.log(`  Gemini: $${report.cost.breakdown.gemini}`);
}

/**
 * 테스트 실행
 */
async function runTests(args) {
  const testType = args[0] || 'all';

  console.log('🧪 로깅 시스템 테스트 시작...');

  if (testType === 'all' || testType === 'logging') {
    console.log('\n📝 로깅 테스트:');
    const logger = getLogger();
    await logger.debug('Debug 테스트 메시지');
    await logger.info('Info 테스트 메시지');
    await logger.warn('Warning 테스트 메시지');
    await logger.error('Error 테스트 메시지');
    console.log('✅ 로깅 테스트 완료');
  }

  if (testType === 'all' || testType === 'performance') {
    console.log('\n⚡ 성능 테스트:');
    const performanceMonitor = getPerformanceMonitor();
    const result = await performanceMonitor.measureFunction(
      'test_operation',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return 'Performance test completed';
      }
    );
    console.log(`✅ 성능 테스트 완료: ${result.performance.duration.toFixed(2)}ms`);
  }

  if (testType === 'all' || testType === 'alerts') {
    console.log('\n🚨 알림 테스트:');
    const alertSystem = getAlertSystem();
    await alertSystem.testAlert(AlertRule.ERROR_RATE, {
      rate: 15,
      threshold: 5
    });
    console.log('✅ 알림 테스트 완료');
  }

  console.log('\n🎉 모든 테스트 완료!');
}

/**
 * 로그 정리
 */
async function cleanupLogs() {
  const logManager = getLogManager();
  
  console.log('🧹 로그 정리 시작...');
  
  // 보관 정책 적용
  await logManager.applyRetentionPolicy();
  
  // 통계 표시
  const stats = await logManager.generateLogStats();
  
  console.log('✅ 정리 완료:');
  console.log(`  남은 파일: ${stats.totalFiles}개`);
  console.log(`  총 크기: ${stats.totalSizeMB}MB`);
}

/**
 * 대시보드 표시
 */
async function showDashboard() {
  const dashboard = getMonitoringDashboard();
  const data = await dashboard.generateDashboard();

  console.log('📊 ro-fan 모니터링 대시보드');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`마지막 업데이트: ${data.timestamp}`);
  console.log(`상태: ${getStatusEmoji(data.summary.status)} ${data.summary.status.toUpperCase()}`);
  console.log(`가동시간: ${data.summary.uptime}`);
  console.log(`헬스 점수: ${data.summary.health}/100`);
  
  console.log('\n💻 시스템:');
  console.log(`  메모리: ${data.system.memory.percentage}% (${(data.system.memory.used/1024/1024).toFixed(2)}MB)`);
  console.log(`  프로세스 ID: ${data.system.pid}`);
  
  console.log('\n🤖 AI 작업:');
  console.log(`  API 호출: ${data.ai.apiCalls.count}회`);
  console.log(`  토큰 사용: ${data.ai.tokenUsage.total}`);
  console.log(`  에러율: ${(data.ai.errorRate * 100).toFixed(2)}%`);
  console.log(`  시간당 비용: $${data.ai.hourlyCost}`);
  
  console.log('\n🔄 자동화:');
  console.log(`  활성 소설: ${data.automation.activeNovels}개`);
  console.log(`  완성 준비: ${data.automation.completedNovels}개`);
  console.log(`  총 챕터: ${data.automation.totalChapters}개`);
  
  if (data.alerts.length > 0) {
    console.log('\n🚨 활성 알림:');
    data.alerts.forEach(alert => {
      console.log(`  ${getAlertEmoji(alert.level)} ${alert.message}`);
    });
  }
}

/**
 * 실시간 모니터링
 */
async function startMonitoring() {
  const dashboard = getMonitoringDashboard();
  
  console.log('🔄 실시간 모니터링 시작... (Ctrl+C로 종료)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const updateInterval = setInterval(async () => {
    try {
      const status = await dashboard.getStatusReport();
      
      // 화면 지우기
      process.stdout.write('\x1b[2J\x1b[H');
      
      console.log(`🕐 ${new Date().toLocaleTimeString()} - ro-fan 실시간 상태`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`상태: ${getStatusEmoji(status.status)} ${status.status.toUpperCase()}`);
      console.log(`API 호출: ${status.metrics.apiCalls} | 토큰: ${status.metrics.tokenUsage}`);
      console.log(`에러율: ${status.metrics.errorRate} | 메모리: ${status.metrics.memoryUsage}`);
      console.log(`활성 소설: ${status.metrics.activeNovels}개`);
      
      if (status.alerts.length > 0) {
        console.log('\n🚨 알림:');
        status.alerts.slice(0, 3).forEach(alert => {
          console.log(`  • ${alert}`);
        });
      }
      
    } catch (error) {
      console.error('모니터링 업데이트 실패:', error.message);
    }
  }, 5000); // 5초마다 업데이트

  // Ctrl+C 처리
  process.on('SIGINT', () => {
    clearInterval(updateInterval);
    console.log('\n\n모니터링 종료');
    process.exit(0);
  });
}

/**
 * 도움말 표시
 */
function showHelp() {
  console.log('ro-fan 로깅 시스템 CLI');
  console.log('');
  console.log('사용법: logging-cli <명령> [옵션]');
  console.log('');
  console.log('명령:');
  console.log('  status      시스템 상태 표시');
  console.log('  logs        로그 관리 (stats|search|cleanup|archive)');
  console.log('  alerts      알림 관리 (stats|test)');
  console.log('  metrics     성능 메트릭 표시');
  console.log('  test        테스트 실행 (all|logging|performance|alerts)');
  console.log('  cleanup     로그 정리');
  console.log('  dashboard   대시보드 표시');
  console.log('  monitor     실시간 모니터링');
  console.log('');
  console.log('예제:');
  console.log('  logging-cli status');
  console.log('  logging-cli logs search "ERROR"');
  console.log('  logging-cli alerts test error_rate');
  console.log('  logging-cli monitor');
}

/**
 * 유틸리티 함수
 */
function getStatusEmoji(status) {
  switch (status) {
    case 'healthy': return '✅';
    case 'warning': return '⚠️';
    case 'critical': return '🚨';
    default: return '❓';
  }
}

function getAlertEmoji(level) {
  switch (level) {
    case 'info': return 'ℹ️';
    case 'warning': return '⚠️';
    case 'error': return '❌';
    case 'critical': return '🚨';
    default: return '📢';
  }
}

// CLI 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}