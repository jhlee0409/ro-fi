/**
 * 로깅 시스템 통합 예제
 * 기존 AI 생성기들에 로깅 시스템을 적용하는 방법을 보여줍니다.
 */

import { getLogger, LogCategory } from './logging-service.js';
import { getAILogger } from './ai-operation-logger.js';
import { getPerformanceMonitor } from './performance-monitor.js';
import { getAlertSystem, AlertRule } from './alert-system.js';
import { getMonitoringDashboard } from './monitoring-dashboard.js';

/**
 * AI 생성기 래퍼 클래스 (예제)
 * 기존 AI 생성기에 로깅 기능을 추가
 */
export class LoggingEnabledAIGenerator {
  constructor(originalGenerator) {
    this.generator = originalGenerator;
    this.logger = getLogger();
    this.aiLogger = getAILogger();
    this.performanceMonitor = getPerformanceMonitor();
    this.alertSystem = getAlertSystem();
  }

  /**
   * 챕터 생성 (로깅 적용 예제)
   */
  async generateChapter(options) {
    const operationId = this.aiLogger.startOperation('generateChapter', {
      model: 'claude-sonnet',
      chapterNumber: options.chapterNumber,
      title: options.title
    });

    const perfId = this.performanceMonitor.startMeasurement('chapter_generation');

    try {
      // 프롬프트 로깅
      const prompt = this.buildPrompt(options);
      await this.aiLogger.logPrompt(prompt, { chapterNumber: options.chapterNumber });

      // 실제 생성 작업
      const result = await this.generator.generateChapter(options);

      // 응답 로깅
      await this.aiLogger.logResponse(result.content, {
        wordCount: result.content.length,
        title: result.title
      });

      // 토큰 사용량 로깅 (가상의 데이터)
      const tokenUsage = { input: 1000, output: 1500 };
      await this.aiLogger.logTokenUsage(tokenUsage, {
        operation: 'chapter_generation',
        cost: 0.05
      });

      // 성능 측정 완료
      const perfData = await this.performanceMonitor.endMeasurement(perfId, {
        success: true,
        wordCount: result.content.length
      });

      // AI 작업 완료
      await this.aiLogger.endOperation(operationId, {
        tokens: tokenUsage,
        cost: 0.05,
        model: 'claude-sonnet'
      });

      // 품질 체크 및 알림
      const qualityScore = this.assessContentQuality(result.content);
      if (qualityScore < 70) {
        await this.alertSystem.triggerAlert(AlertRule.CONTENT_QUALITY, {
          score: qualityScore,
          minimum: 70,
          chapterNumber: options.chapterNumber
        });
      }

      return result;

    } catch (error) {
      // 에러 로깅
      await this.aiLogger.logAPIError(error, {
        operation: 'generateChapter',
        chapterNumber: options.chapterNumber
      });

      // 성능 측정 완료 (실패)
      await this.performanceMonitor.endMeasurement(perfId, {
        success: false,
        error: error.message
      });

      // AI 작업 완료 (실패)
      await this.aiLogger.endOperation(operationId, {
        error: error.message
      });

      // 알림 트리거
      await this.alertSystem.triggerAlert(AlertRule.API_FAILURE, {
        api: 'generateChapter',
        error: error.message,
        chapterNumber: options.chapterNumber
      });

      throw error;
    }
  }

  /**
   * 하이브리드 작업 로깅 예제
   */
  async hybridGeneration(primaryModel, fallbackModel, options) {
    const operationId = this.aiLogger.startOperation('hybrid_generation', {
      primaryModel,
      fallbackModel
    });

    try {
      let result;
      let usedModel = primaryModel;

      try {
        // 주 모델 시도
        result = await this.generateWithModel(primaryModel, options);
      } catch (primaryError) {
        await this.logger.warn('Primary model failed, using fallback', {
          category: LogCategory.AI_OPERATION,
          primaryModel,
          fallbackModel,
          error: primaryError.message
        });

        // 폴백 모델 시도
        result = await this.generateWithModel(fallbackModel, options);
        usedModel = fallbackModel;
      }

      // 하이브리드 작업 로깅
      await this.aiLogger.logHybridOperation(primaryModel, fallbackModel, {
        model: usedModel,
        ...result
      });

      await this.aiLogger.endOperation(operationId, {
        success: true,
        model: usedModel
      });

      return result;

    } catch (error) {
      await this.aiLogger.endOperation(operationId, { error: error.message });
      throw error;
    }
  }

  /**
   * 비용 추적 예제
   */
  async trackCosts(operation, cost, metadata = {}) {
    await this.aiLogger.logCost(cost, {
      operation,
      ...metadata
    });

    // 시간당 비용 한계 체크
    const hourlyCost = await this.calculateHourlyCost();
    if (hourlyCost > 10) { // $10/hour limit
      await this.alertSystem.triggerAlert(AlertRule.COST_LIMIT, {
        current: hourlyCost,
        limit: 10,
        percentage: (hourlyCost / 10 * 100).toFixed(1)
      });
    }
  }

  /**
   * 메모리 모니터링 예제
   */
  async monitorMemoryUsage() {
    const memorySnapshot = this.performanceMonitor.takeMemorySnapshot('routine_check');
    const memoryUsage = memorySnapshot.memory.heapUsed / 1024 / 1024; // MB

    if (memoryUsage > 500) { // 500MB limit
      await this.alertSystem.triggerAlert(AlertRule.MEMORY_LIMIT, {
        used: memoryUsage.toFixed(2),
        limit: 500,
        percentage: (memoryUsage / 500 * 100).toFixed(1)
      });
    }

    return memorySnapshot;
  }

  /**
   * 유틸리티 메서드
   */
  buildPrompt(options) {
    return `Generate chapter ${options.chapterNumber} for "${options.title}"...`;
  }

  assessContentQuality(content) {
    // 간단한 품질 평가 로직
    const wordCount = content.split(/\s+/).length;
    const hasDialogue = content.includes('"');
    const hasDescription = content.length > 1000;

    let score = 50;
    if (wordCount > 500) score += 20;
    if (hasDialogue) score += 15;
    if (hasDescription) score += 15;

    return score;
  }

  async generateWithModel(model, options) {
    // 모델별 생성 로직 (가상)
    return { content: 'Generated content...', model };
  }

  async calculateHourlyCost() {
    // 시간당 비용 계산 (가상)
    return 5.50;
  }
}

/**
 * 자동화 엔진 로깅 예제
 */
export class LoggingEnabledAutomationEngine {
  constructor() {
    this.logger = getLogger();
    this.alertSystem = getAlertSystem();
    this.performanceMonitor = getPerformanceMonitor();
  }

  async executeAutomation() {
    const perfId = this.performanceMonitor.startMeasurement('automation_cycle');

    try {
      await this.logger.info('Starting automation cycle', {
        category: LogCategory.AUTOMATION
      });

      // 자동화 작업 실행
      const result = await this.runAutomationTasks();

      const perfData = await this.performanceMonitor.endMeasurement(perfId, {
        success: true,
        tasksCompleted: result.tasksCompleted
      });

      await this.logger.info('Automation cycle completed', {
        category: LogCategory.AUTOMATION,
        tasksCompleted: result.tasksCompleted,
        duration: perfData.duration
      });

      return result;

    } catch (error) {
      await this.performanceMonitor.endMeasurement(perfId, {
        success: false,
        error: error.message
      });

      await this.alertSystem.triggerAlert(AlertRule.AUTOMATION_FAILURE, {
        task: 'automation_cycle',
        error: error.message
      });

      throw error;
    }
  }

  async runAutomationTasks() {
    // 가상의 자동화 작업
    return { tasksCompleted: 3 };
  }
}

/**
 * 시스템 초기화 및 설정 예제
 */
export async function initializeLoggingSystem() {
  // 로깅 서비스 설정
  const logger = getLogger({
    logLevel: process.env.NODE_ENV === 'production' ? 1 : 0, // INFO in prod, DEBUG in dev
    maxFileSize: 20 * 1024 * 1024, // 20MB
    enableMetrics: true
  });

  // AI 로거 설정
  const aiLogger = getAILogger();

  // 성능 모니터 설정
  const performanceMonitor = getPerformanceMonitor({
    slowThreshold: 2000, // 2초
    memoryCheckInterval: 30000 // 30초
  });

  // 알림 시스템 설정
  const alertSystem = getAlertSystem({
    enableWebhook: !!process.env.ALERT_WEBHOOK_URL,
    webhookUrl: process.env.ALERT_WEBHOOK_URL,
    cooldownPeriod: 300000 // 5분
  });

  // 모니터링 대시보드 설정
  const dashboard = getMonitoringDashboard({
    refreshInterval: 60000, // 1분
    alertThresholds: {
      errorRate: 0.05,
      avgResponseTime: 3000,
      memoryUsage: 0.8,
      tokenUsage: 15000,
      cost: 15
    }
  });

  await logger.info('Logging system initialized', {
    category: LogCategory.SYSTEM,
    environment: process.env.NODE_ENV || 'development'
  });

  return {
    logger,
    aiLogger,
    performanceMonitor,
    alertSystem,
    dashboard
  };
}

/**
 * 실시간 모니터링 예제
 */
export async function startRealtimeMonitoring() {
  const dashboard = getMonitoringDashboard();
  
  // 5분마다 상태 리포트 출력
  setInterval(async () => {
    try {
      const status = await dashboard.getStatusReport();
      console.log('System Status:', status);
    } catch (error) {
      console.error('Failed to get status report:', error);
    }
  }, 300000);

  // 메모리 누수 감지 (1시간마다)
  const performanceMonitor = getPerformanceMonitor();
  setInterval(async () => {
    try {
      const leakReport = await performanceMonitor.detectMemoryLeak(300000, 100 * 1024 * 1024);
      if (leakReport.possibleLeak) {
        const alertSystem = getAlertSystem();
        await alertSystem.triggerAlert(AlertRule.MEMORY_LIMIT, {
          type: 'memory_leak',
          growth: leakReport.heapGrowth,
          growthRate: leakReport.growthRate
        });
      }
    } catch (error) {
      console.error('Memory leak detection failed:', error);
    }
  }, 3600000);
}

/**
 * 로깅 시스템 테스트
 */
export async function testLoggingSystem() {
  const logger = getLogger();
  const alertSystem = getAlertSystem();

  await logger.info('Testing logging system', { category: LogCategory.SYSTEM });

  // 알림 테스트
  await alertSystem.testAlert(AlertRule.ERROR_RATE, {
    rate: 10,
    threshold: 5
  });

  // 성능 테스트
  const performanceMonitor = getPerformanceMonitor();
  const testResult = await performanceMonitor.measureFunction(
    'test_function',
    async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'test complete';
    }
  );

  console.log('Performance test result:', testResult);

  await logger.info('Logging system test completed', { category: LogCategory.SYSTEM });
}