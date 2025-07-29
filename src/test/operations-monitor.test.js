/**
 * 운영 모니터링 시스템 테스트
 * v3.1 통합 모니터링 시스템 검증
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { OperationsMonitor } from '../lib/operations-monitor.js';
import { promises as fs } from 'fs';
import { join } from 'path';

describe('OperationsMonitor - 통합 모니터링 시스템', () => {
  let monitor;
  const testLogDir = '/tmp/ro-fan-monitor-test';

  beforeEach(async () => {
    monitor = new OperationsMonitor({
      logDirectory: testLogDir,
      logLevel: 'info',
      enableFileLogging: true,
      enableConsoleLogging: false
    });

    // 테스트 로그 디렉터리 생성
    await fs.mkdir(testLogDir, { recursive: true });
  });

  afterEach(async () => {
    // 모니터 정리 (열린 스트림 등)
    if (monitor && typeof monitor.cleanup === 'function') {
      try {
        await monitor.cleanup();
      } catch (error) {
        console.warn('Monitor cleanup failed:', error.message);
      }
    }
    
    // 테스트 로그 디렉터리 정리
    try {
      // 약간의 지연을 주어 파일 핸들이 닫히도록 함
      await new Promise(resolve => setTimeout(resolve, 100));
      await fs.rm(testLogDir, { recursive: true, force: true });
    } catch (error) {
      // Windows 환경에서 파일 핸들 문제가 있을 수 있으므로 무시
      console.warn('Test directory cleanup failed:', error.message);
    }
  });

  describe('로깅 시스템', () => {
    test('다양한 로그 레벨 처리', async () => {
      await monitor.logInfo('테스트 정보 메시지', { test: true });
      await monitor.logWarning('테스트 경고 메시지', { warning: true });
      await monitor.logError('테스트 에러 메시지', new Error('Test error'));

      // 로그 파일 생성 확인
      const logFiles = await fs.readdir(testLogDir);
      expect(logFiles.length).toBeGreaterThan(0);
    });

    test('구조화된 로그 데이터 형식', async () => {
      const testData = {
        operation: 'chapter_generation',
        novel: 'test-novel',
        chapter: 5,
        tokensUsed: 1500
      };

      await monitor.logInfo('챕터 생성 완료', testData);

      const logFiles = await fs.readdir(testLogDir);
      const logFileList = logFiles.filter(file => file.endsWith('.log')).sort();
      expect(logFileList.length).toBeGreaterThan(0);
      
      const latestLog = logFileList.pop();
      if (!latestLog) {
        throw new Error('No log files found');
      }
      
      const logPath = join(testLogDir, latestLog);
      
      // 파일이 존재하고 디렉터리가 아닌 것을 확인
      const stats = await fs.stat(logPath);
      expect(stats.isFile()).toBe(true);
      
      const logContent = await fs.readFile(logPath, 'utf-8');
      
      expect(logContent).toContain('chapter_generation');
      expect(logContent).toContain('test-novel');
      expect(logContent).toContain('1500');
    });

    test('로그 파일 로테이션', async () => {
      // 여러 날짜의 로그 시뮬레이션
      const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
      
      for (const date of dates) {
        await monitor.createLogFile(date);
        await monitor.logInfo(`${date} 테스트 로그`);
      }

      const logFiles = await fs.readdir(testLogDir);
      expect(logFiles.length).toBeGreaterThanOrEqual(dates.length);
    });
  });

  describe('AI 운영 추적', () => {
    test('AI 호출 성공/실패 추적', async () => {
      // 성공적인 AI 호출 기록
      await monitor.trackAIOperation({
        model: 'claude',
        operation: 'chapter_generation',
        tokensUsed: 2000,
        responseTime: 3500,
        success: true
      });

      // 실패한 AI 호출 기록
      await monitor.trackAIOperation({
        model: 'gemini',
        operation: 'world_building',
        error: 'API rate limit exceeded',
        responseTime: 1000,
        success: false
      });

      const metrics = monitor.getAIMetrics();
      expect(metrics.totalCalls).toBe(2);
      expect(metrics.successRate).toBe(0.5);
      expect(metrics.averageResponseTime).toBe(2250);
    });

    test('모델별 성능 비교', async () => {
      // Claude 호출들
      await monitor.trackAIOperation({
        model: 'claude',
        tokensUsed: 1500,
        responseTime: 2000,
        success: true
      });

      await monitor.trackAIOperation({
        model: 'claude',
        tokensUsed: 1800,
        responseTime: 2200,
        success: true
      });

      // Gemini 호출들
      await monitor.trackAIOperation({
        model: 'gemini',
        tokensUsed: 1200,
        responseTime: 1500,
        success: true
      });

      const comparison = monitor.compareModelPerformance();

      expect(comparison.claude.averageTokens).toBe(1650);
      expect(comparison.claude.averageResponseTime).toBe(2100);
      expect(comparison.gemini.averageTokens).toBe(1200);
      expect(comparison.gemini.averageResponseTime).toBe(1500);
    });

    test('토큰 사용량 일일 집계', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // 여러 AI 호출 시뮬레이션
      const calls = [
        { model: 'claude', tokensUsed: 1500 },
        { model: 'claude', tokensUsed: 2000 },
        { model: 'gemini', tokensUsed: 1200 },
        { model: 'gemini', tokensUsed: 800 }
      ];

      for (const call of calls) {
        await monitor.trackAIOperation({
          ...call,
          success: true,
          responseTime: 2000
        });
      }

      const dailyUsage = monitor.getDailyTokenUsage(today);
      expect(dailyUsage.total).toBe(5500);
      expect(dailyUsage.claude).toBe(3500);
      expect(dailyUsage.gemini).toBe(2000);
    });
  });

  describe('성능 모니터링', () => {
    test('시스템 성능 지표 수집', async () => {
      await monitor.collectPerformanceMetrics();

      const metrics = monitor.getPerformanceMetrics();

      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.cpuUsage).toBeDefined();
      expect(metrics.timestamp).toBeDefined();
      expect(metrics.uptime).toBeDefined();
    });

    test('응답 시간 추적', async () => {
      const operations = [
        { name: 'chapter_generation', duration: 3500 },
        { name: 'quality_analysis', duration: 1200 },
        { name: 'reader_analytics', duration: 800 }
      ];

      for (const op of operations) {
        monitor.trackOperationTime(op.name, op.duration);
      }

      const timings = monitor.getOperationTimings();

      expect(timings.chapter_generation.average).toBe(3500);
      expect(timings.quality_analysis.average).toBe(1200);
      expect(timings.reader_analytics.average).toBe(800);
    });

    test('성능 임계값 모니터링', async () => {
      monitor.setPerformanceThresholds({
        maxResponseTime: 5000,
        maxMemoryUsage: 500 * 1024 * 1024, // 500MB
        maxErrorRate: 0.05 // 5%
      });

      // 임계값 초과 시뮬레이션
      monitor.trackOperationTime('slow_operation', 7000);
      
      const alerts = monitor.getPerformanceAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].type).toBe('RESPONSE_TIME_EXCEEDED');
    });
  });

  describe('알림 시스템', () => {
    test('에러 알림 생성', async () => {
      const error = new Error('Critical system error');
      
      await monitor.sendAlert({
        type: 'ERROR',
        severity: 'critical',
        message: 'AI 서비스 장애 발생',
        details: error.message,
        source: 'ai-unified-generator'
      });

      const alerts = monitor.getRecentAlerts();
      expect(alerts.length).toBe(1);
      expect(alerts[0].type).toBe('ERROR');
      expect(alerts[0].severity).toBe('critical');
    });

    test('성능 저하 알림', async () => {
      // 연속적인 느린 응답 시뮬레이션
      for (let i = 0; i < 5; i++) {
        monitor.trackOperationTime('chapter_generation', 8000);
      }

      monitor.checkPerformanceDegradation();
      
      const alerts = monitor.getRecentAlerts();
      const performanceAlert = alerts.find(a => a.type === 'PERFORMANCE_DEGRADATION');
      
      expect(performanceAlert).toBeDefined();
      expect(performanceAlert.severity).toBe('warning');
    });

    test('알림 중복 방지', async () => {
      const alertData = {
        type: 'ERROR',
        message: '동일한 에러 메시지',
        source: 'test-component'
      };

      // 같은 알림을 연속으로 발송
      await monitor.sendAlert(alertData);
      await monitor.sendAlert(alertData);
      await monitor.sendAlert(alertData);

      const alerts = monitor.getRecentAlerts();
      const duplicateAlerts = alerts.filter(a => a.message === '동일한 에러 메시지');
      
      expect(duplicateAlerts.length).toBe(1); // 중복 제거됨
    });
  });

  describe('자동화 워크플로우 모니터링', () => {
    test('자동화 실행 추적', async () => {
      const execution = {
        id: 'auto-exec-001',
        type: 'CHAPTER_GENERATION',
        startTime: new Date(),
        novel: 'test-novel',
        status: 'running'
      };

      monitor.startWorkflowTracking(execution);
      
      // 작업 완료 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 100));
      
      monitor.completeWorkflowTracking(execution.id, {
        status: 'completed',
        tokensUsed: 2500,
        qualityScore: 0.85
      });

      const history = monitor.getWorkflowHistory();
      expect(history.length).toBe(1);
      expect(history[0].status).toBe('completed');
      expect(history[0].duration).toBeGreaterThan(0);
    });

    test('워크플로우 실패 추적', async () => {
      const execution = {
        id: 'auto-exec-002',
        type: 'NOVEL_COMPLETION',
        startTime: new Date(),
        novel: 'failing-novel'
      };

      monitor.startWorkflowTracking(execution);

      monitor.failWorkflowTracking(execution.id, {
        error: 'AI service unavailable',
        stage: 'content_generation'
      });

      const failures = monitor.getWorkflowFailures();
      expect(failures.length).toBe(1);
      expect(failures[0].error).toBe('AI service unavailable');
    });

    test('자동화 성공률 계산', async () => {
      // 성공적인 실행들
      for (let i = 0; i < 8; i++) {
        const id = `success-${i}`;
        monitor.startWorkflowTracking({ id, type: 'CHAPTER_GENERATION' });
        monitor.completeWorkflowTracking(id, { status: 'completed' });
      }

      // 실패한 실행들  
      for (let i = 0; i < 2; i++) {
        const id = `failure-${i}`;
        monitor.startWorkflowTracking({ id, type: 'CHAPTER_GENERATION' });
        monitor.failWorkflowTracking(id, { error: 'Test failure' });
      }

      const stats = monitor.getWorkflowStats();
      expect(stats.totalExecutions).toBe(10);
      expect(stats.successRate).toBe(0.8); // 80%
      expect(stats.failureRate).toBe(0.2); // 20%
    });
  });

  describe('대시보드 데이터', () => {
    test('운영 대시보드 데이터 생성', async () => {
      // 다양한 운영 데이터 시뮬레이션
      await monitor.trackAIOperation({
        model: 'claude',
        tokensUsed: 2000,
        success: true,
        responseTime: 3000
      });

      monitor.trackOperationTime('chapter_generation', 4000);
      
      await monitor.sendAlert({
        type: 'WARNING',
        message: '토큰 사용량 80% 초과'
      });

      const dashboardData = monitor.getDashboardData();

      expect(dashboardData.aiMetrics).toBeDefined();
      expect(dashboardData.performanceMetrics).toBeDefined();
      expect(dashboardData.recentAlerts).toBeDefined();
      expect(dashboardData.workflowStats).toBeDefined();
      expect(dashboardData.systemHealth).toBeDefined();
    });

    test('실시간 상태 정보', () => {
      const status = monitor.getSystemStatus();

      expect(status.uptime).toBeDefined();
      expect(status.memoryUsage).toBeDefined();
      expect(status.activeOperations).toBeDefined();
      expect(status.lastUpdate).toBeDefined();
      expect(status.health).toMatch(/^(healthy|warning|critical)$/);
    });
  });

  describe('데이터 내보내기', () => {
    test('운영 리포트 생성', async () => {
      // 테스트 데이터 생성
      await monitor.trackAIOperation({
        model: 'claude',
        tokensUsed: 1500,
        success: true
      });

      const report = await monitor.generateOperationalReport({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 어제
        endDate: new Date(),
        includeMetrics: true,
        includeAlerts: true
      });

      expect(report.summary).toBeDefined();
      expect(report.aiMetrics).toBeDefined();
      expect(report.performanceData).toBeDefined();
      expect(report.alertSummary).toBeDefined();
    });

    test('메트릭스 데이터 CSV 내보내기', async () => {
      const csvData = await monitor.exportMetricsAsCSV({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 일주일 전
        endDate: new Date(),
        metrics: ['ai_calls', 'response_times', 'token_usage']
      });

      expect(csvData).toBeDefined();
      expect(typeof csvData).toBe('string');
      expect(csvData).toContain('timestamp');
    });
  });

  describe('정리 및 유지보수', () => {
    test('오래된 로그 파일 정리', async () => {
      // 오래된 로그 파일 생성
      const oldDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000); // 35일 전
      const oldLogFile = join(testLogDir, `${oldDate.toISOString().split('T')[0]}.log`);
      await fs.writeFile(oldLogFile, 'old log content');

      await monitor.cleanupOldLogs(30); // 30일 이상 된 로그 삭제

      const logFiles = await fs.readdir(testLogDir);
      expect(logFiles).not.toContain(`${oldDate.toISOString().split('T')[0]}.log`);
    });

    test('메트릭스 데이터 압축', async () => {
      // 대량의 메트릭스 데이터 생성
      for (let i = 0; i < 1000; i++) {
        monitor.trackOperationTime('test_operation', Math.random() * 5000);
      }

      const beforeSize = monitor.getMetricsDataSize();
      await monitor.compressOldMetrics(7); // 7일 이상 된 데이터 압축
      const afterSize = monitor.getMetricsDataSize();

      expect(afterSize).toBeLessThanOrEqual(beforeSize);
    });
  });
});