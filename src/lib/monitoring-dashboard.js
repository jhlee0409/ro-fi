/**
 * 모니터링 대시보드 유틸리티
 * 실시간 시스템 상태, 메트릭, 로그 분석 제공
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLogger, MetricType } from './logging-service.js';
import { getLogManager } from './log-manager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 모니터링 대시보드
 */
export class MonitoringDashboard {
  constructor(config = {}) {
    this.config = {
      refreshInterval: config.refreshInterval || 60000, // 1분
      metricsWindow: config.metricsWindow || 3600000, // 1시간
      alertThresholds: config.alertThresholds || {
        errorRate: 0.05,        // 5% 에러율
        avgResponseTime: 5000,  // 5초
        memoryUsage: 0.8,       // 80% 메모리
        tokenUsage: 10000,      // 시간당 10,000 토큰
        cost: 10               // 시간당 $10
      },
      ...config
    };

    this.logger = getLogger();
    this.logManager = getLogManager();
    
    // 실시간 메트릭
    this.realtimeMetrics = {
      lastUpdate: null,
      system: {},
      ai: {},
      automation: {},
      alerts: []
    };

    this.initialize();
  }

  async initialize() {
    // 초기 메트릭 수집
    await this.collectMetrics();
    
    // 주기적 업데이트 시작
    this.startMetricsCollection();
  }

  /**
   * 실시간 메트릭 수집
   */
  async collectMetrics() {
    try {
      // 시스템 메트릭
      this.realtimeMetrics.system = await this.collectSystemMetrics();
      
      // AI 메트릭
      this.realtimeMetrics.ai = await this.collectAIMetrics();
      
      // 자동화 메트릭
      this.realtimeMetrics.automation = await this.collectAutomationMetrics();
      
      // 알림 체크
      this.realtimeMetrics.alerts = await this.checkAlerts();
      
      this.realtimeMetrics.lastUpdate = new Date().toISOString();
    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
  }

  /**
   * 시스템 메트릭 수집
   */
  async collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal * 100).toFixed(2),
        rss: memUsage.rss
      },
      cpu: process.cpuUsage(),
      uptime: {
        seconds: uptime,
        formatted: this.formatUptime(uptime)
      },
      pid: process.pid,
      version: process.version,
      platform: process.platform
    };
  }

  /**
   * AI 메트릭 수집
   */
  async collectAIMetrics() {
    const metricsPath = path.join(this.config.logDir || path.join(__dirname, '../../logs'), 
                                  `metrics-${new Date().toISOString().split('T')[0]}.json`);
    
    try {
      const metricsData = await fs.readFile(metricsPath, 'utf8');
      const metrics = JSON.parse(metricsData);
      
      // 시간 창 내의 메트릭만 필터링
      const now = Date.now();
      const windowStart = now - this.config.metricsWindow;
      
      return {
        apiCalls: this.aggregateMetric(metrics, MetricType.API_CALL, windowStart),
        tokenUsage: this.aggregateMetric(metrics, MetricType.TOKEN_USAGE, windowStart),
        generationTime: this.aggregateMetric(metrics, MetricType.GENERATION_TIME, windowStart),
        errorRate: this.calculateErrorRate(metrics, windowStart),
        models: this.getModelStats(metrics)
      };
    } catch (error) {
      return {
        apiCalls: { count: 0, total: 0 },
        tokenUsage: { count: 0, total: 0 },
        generationTime: { count: 0, avg: 0 },
        errorRate: 0,
        models: {}
      };
    }
  }

  /**
   * 자동화 메트릭 수집
   */
  async collectAutomationMetrics() {
    const reportPath = path.join(this.config.logDir || path.join(__dirname, '../../logs'), 
                                `automation-report-${new Date().toISOString().split('T')[0]}.json`);
    
    try {
      const reportData = await fs.readFile(reportPath, 'utf8');
      const report = JSON.parse(reportData);
      
      return {
        lastRun: report.timestamp,
        activeNovels: report.summary.activeNovels || 0,
        completedNovels: report.summary.readyForCompletion || 0,
        newNovelsCreated: report.summary.needsNewNovel ? 1 : 0,
        totalChapters: await this.countTotalChapters()
      };
    } catch (error) {
      return {
        lastRun: null,
        activeNovels: 0,
        completedNovels: 0,
        newNovelsCreated: 0,
        totalChapters: 0
      };
    }
  }

  /**
   * 알림 체크
   */
  async checkAlerts() {
    const alerts = [];
    const thresholds = this.config.alertThresholds;
    
    // 에러율 체크
    if (this.realtimeMetrics.ai?.errorRate > thresholds.errorRate) {
      alerts.push({
        level: 'critical',
        type: 'error_rate',
        message: `High error rate: ${(this.realtimeMetrics.ai.errorRate * 100).toFixed(2)}%`,
        value: this.realtimeMetrics.ai.errorRate,
        threshold: thresholds.errorRate
      });
    }
    
    // 메모리 사용량 체크
    const memoryPercentage = parseFloat(this.realtimeMetrics.system?.memory?.percentage) / 100;
    if (memoryPercentage > thresholds.memoryUsage) {
      alerts.push({
        level: 'warning',
        type: 'memory_usage',
        message: `High memory usage: ${(memoryPercentage * 100).toFixed(2)}%`,
        value: memoryPercentage,
        threshold: thresholds.memoryUsage
      });
    }
    
    // 토큰 사용량 체크
    const hourlyTokens = this.realtimeMetrics.ai?.tokenUsage?.total || 0;
    if (hourlyTokens > thresholds.tokenUsage) {
      alerts.push({
        level: 'warning',
        type: 'token_usage',
        message: `High token usage: ${hourlyTokens} tokens/hour`,
        value: hourlyTokens,
        threshold: thresholds.tokenUsage
      });
    }
    
    return alerts;
  }

  /**
   * 대시보드 데이터 생성
   */
  async generateDashboard() {
    await this.collectMetrics();
    
    return {
      timestamp: this.realtimeMetrics.lastUpdate,
      summary: {
        status: this.getSystemStatus(),
        uptime: this.realtimeMetrics.system.uptime.formatted,
        activeAlerts: this.realtimeMetrics.alerts.length,
        health: this.calculateHealthScore()
      },
      system: this.realtimeMetrics.system,
      ai: {
        ...this.realtimeMetrics.ai,
        hourlyCost: this.calculateHourlyCost()
      },
      automation: this.realtimeMetrics.automation,
      alerts: this.realtimeMetrics.alerts,
      logs: await this.getRecentLogs()
    };
  }

  /**
   * 간단한 상태 리포트
   */
  async getStatusReport() {
    const dashboard = await this.generateDashboard();
    
    return {
      status: dashboard.summary.status,
      uptime: dashboard.summary.uptime,
      metrics: {
        apiCalls: dashboard.ai.apiCalls.count,
        tokenUsage: dashboard.ai.tokenUsage.total,
        errorRate: `${(dashboard.ai.errorRate * 100).toFixed(2)}%`,
        activeNovels: dashboard.automation.activeNovels,
        memoryUsage: `${dashboard.system.memory.percentage}%`
      },
      alerts: dashboard.alerts.map(a => a.message)
    };
  }

  /**
   * 성능 리포트 생성
   */
  async generatePerformanceReport(period = 'day') {
    const logStats = await this.logManager.generateLogStats();
    const metrics = await this.collectMetrics();
    
    return {
      period,
      generated: new Date().toISOString(),
      performance: {
        avgResponseTime: metrics.ai.generationTime.avg,
        totalApiCalls: metrics.ai.apiCalls.total,
        successRate: `${((1 - metrics.ai.errorRate) * 100).toFixed(2)}%`,
        tokenEfficiency: this.calculateTokenEfficiency()
      },
      resource: {
        avgMemoryUsage: metrics.system.memory.percentage,
        peakMemoryUsage: await this.getPeakMemoryUsage(),
        logStorageUsed: logStats.totalSizeMB + ' MB'
      },
      cost: {
        estimated: this.calculateCost(period),
        breakdown: {
          claude: this.calculateModelCost('claude', period),
          gemini: this.calculateModelCost('gemini', period)
        }
      }
    };
  }

  /**
   * 실시간 모니터링 스트림
   */
  async *streamMetrics() {
    while (true) {
      yield await this.generateDashboard();
      await new Promise(resolve => setTimeout(resolve, this.config.refreshInterval));
    }
  }

  /**
   * 유틸리티 메서드
   */
  aggregateMetric(metrics, type, windowStart) {
    const relevantMetrics = Object.entries(metrics)
      .filter(([key, value]) => 
        key.startsWith(type) && 
        new Date(value.date).getTime() > windowStart
      )
      .map(([_, value]) => value);

    const total = relevantMetrics.reduce((sum, m) => sum + m.sum, 0);
    const count = relevantMetrics.reduce((sum, m) => sum + m.count, 0);
    const avg = count > 0 ? total / count : 0;

    return { total, count, avg };
  }

  calculateErrorRate(metrics, windowStart) {
    const errorMetrics = this.aggregateMetric(metrics, MetricType.ERROR_RATE, windowStart);
    const apiMetrics = this.aggregateMetric(metrics, MetricType.API_CALL, windowStart);
    
    return apiMetrics.count > 0 ? errorMetrics.count / apiMetrics.count : 0;
  }

  getModelStats(metrics) {
    // 모델별 사용 통계 추출
    const models = {};
    
    Object.entries(metrics).forEach(([key, value]) => {
      if (value.model) {
        models[value.model] = models[value.model] || { count: 0, tokens: 0 };
        models[value.model].count += value.count;
        models[value.model].tokens += value.sum;
      }
    });
    
    return models;
  }

  async countTotalChapters() {
    try {
      const chaptersDir = path.join(__dirname, '../../src/content/chapters');
      const files = await fs.readdir(chaptersDir);
      return files.filter(f => f.endsWith('.md')).length;
    } catch {
      return 0;
    }
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  }

  getSystemStatus() {
    const alerts = this.realtimeMetrics.alerts;
    
    if (alerts.some(a => a.level === 'critical')) return 'critical';
    if (alerts.some(a => a.level === 'warning')) return 'warning';
    return 'healthy';
  }

  calculateHealthScore() {
    let score = 100;
    
    // 에러율에 따른 감점
    score -= this.realtimeMetrics.ai?.errorRate * 100 || 0;
    
    // 메모리 사용량에 따른 감점
    const memUsage = parseFloat(this.realtimeMetrics.system?.memory?.percentage) || 0;
    if (memUsage > 80) score -= (memUsage - 80);
    
    // 알림에 따른 감점
    score -= this.realtimeMetrics.alerts.length * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  calculateHourlyCost() {
    const tokenUsage = this.realtimeMetrics.ai?.tokenUsage?.total || 0;
    
    // 토큰당 예상 비용 (실제 가격으로 조정 필요)
    const costPerThousandTokens = 0.01; // $0.01 per 1K tokens
    
    return (tokenUsage / 1000 * costPerThousandTokens).toFixed(2);
  }

  calculateTokenEfficiency() {
    const tokens = this.realtimeMetrics.ai?.tokenUsage?.total || 0;
    const chapters = this.realtimeMetrics.automation?.totalChapters || 0;
    
    return chapters > 0 ? Math.round(tokens / chapters) : 0;
  }

  async getPeakMemoryUsage() {
    // 로그에서 최대 메모리 사용량 추출
    return this.realtimeMetrics.system?.memory?.percentage || '0';
  }

  calculateCost(period) {
    const hourlyCost = parseFloat(this.calculateHourlyCost());
    const multipliers = {
      hour: 1,
      day: 24,
      week: 168,
      month: 720
    };
    
    return (hourlyCost * (multipliers[period] || 1)).toFixed(2);
  }

  calculateModelCost(model, period) {
    const modelStats = this.realtimeMetrics.ai?.models?.[model] || { tokens: 0 };
    const costPerThousand = model === 'claude' ? 0.01 : 0.005;
    const hourlyCost = (modelStats.tokens / 1000 * costPerThousand);
    
    const multipliers = {
      hour: 1,
      day: 24,
      week: 168,
      month: 720
    };
    
    return (hourlyCost * (multipliers[period] || 1)).toFixed(2);
  }

  async getRecentLogs() {
    const searchResults = await this.logManager.searchLogs('ERROR', { maxResults: 10 });
    return searchResults.map(r => ({
      time: new Date().toISOString(), // 실제로는 로그에서 추출
      level: 'ERROR',
      message: r.content.substring(0, 100) + '...'
    }));
  }

  startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics().catch(console.error);
    }, this.config.refreshInterval);
  }
}

// 싱글톤 인스턴스
let dashboardInstance = null;

export function getMonitoringDashboard(config) {
  if (!dashboardInstance) {
    dashboardInstance = new MonitoringDashboard(config);
  }
  return dashboardInstance;
}