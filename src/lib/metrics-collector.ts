/**
 * 통합 메트릭 수집기 - 시스템 전반의 메트릭 수집 및 분석
 * 안전한 메트릭 개선사항 구현
 */

import { CircularBuffer, LRUCache } from './performance-optimizer';

interface MetricsConfig {
  enabled?: boolean;
  bufferSize?: number;
  cacheSize?: number;
}

interface APIUsageRecord {
  timestamp: number;
  provider: string;
  operation: string;
  responseTime: number;
  tokensUsed: number;
  success: boolean;
  errorType?: string | null;
  requestSize: number;
  cacheHit: boolean;
}

interface ContentQualityRecord {
  timestamp: number;
  contentType: string;
  overallScore: number;
  dimensions: Record<string, any>;
  readabilityScore: number;
  creativityScore: number;
  consistencyScore: number;
  wordCount: number;
  generationTime: number;
}

interface SystemPerformanceRecord {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: {
    heapUsed?: number;
    heapTotal?: number;
    external?: number;
    rss?: number;
  };
  diskIO: Record<string, any>;
  networkLatency: number;
  activeConnections: number;
  queueLength: number;
  cacheHitRate: number;
}

interface ErrorRecord {
  timestamp: number;
  errorType: string;
  errorMessage: string;
  errorStack: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  userId?: string | null;
  sessionId?: string | null;
}

interface UserEngagementRecord {
  timestamp: number;
  userId: string;
  sessionId?: string | null;
  action: string;
  contentId?: string | null;
  contentType?: string | null;
  timeSpent: number;
  completionRate: number;
  interactionDepth: number;
}

interface RealTimeStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  peakMemoryUsage: number;
  lastReset: number;
}

interface APIMetrics {
  responseTime?: number;
  tokensUsed?: number;
  success?: boolean;
  errorType?: string;
  requestSize?: number;
  cacheHit?: boolean;
}

interface QualityMetrics {
  overall?: number;
  dimensions?: Record<string, any>;
  readability?: number;
  creativity?: number;
  consistency?: number;
  wordCount?: number;
  generationTime?: number;
}

interface PerformanceData {
  cpuUsage?: number;
  memoryUsage?: {
    heapUsed?: number;
    heapTotal?: number;
    external?: number;
    rss?: number;
  };
  diskIO?: Record<string, any>;
  networkLatency?: number;
  activeConnections?: number;
  queueLength?: number;
  cacheHitRate?: number;
}

interface ErrorData {
  type?: string;
  message?: string;
  stack?: string;
  component?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

interface EngagementData {
  userId?: string;
  sessionId?: string;
  action?: string;
  contentId?: string;
  contentType?: string;
  timeSpent?: number;
  completionRate?: number;
  interactionDepth?: number;
}

type TrendType = 'improving' | 'declining' | 'stable' | 'degrading' | 'increasing' | 'decreasing';

export class MetricsCollector {
  private enabled: boolean;
  private bufferSize: number;
  private cacheSize: number;
  private metrics: {
    apiUsage: CircularBuffer<APIUsageRecord>;
    contentQuality: CircularBuffer<ContentQualityRecord>;
    systemPerformance: CircularBuffer<SystemPerformanceRecord>;
    errorTracking: CircularBuffer<ErrorRecord>;
    userEngagement: CircularBuffer<UserEngagementRecord>;
  };
  private aggregatedCache: LRUCache<string, any>;
  private realTimeStats: RealTimeStats;
  private collectionInterval?: NodeJS.Timeout;

  constructor(config: MetricsConfig = {}) {
    this.enabled = config.enabled !== false;
    this.bufferSize = config.bufferSize || 1000;
    this.cacheSize = config.cacheSize || 100;

    // 메트릭 버퍼들
    this.metrics = {
      // AI API 사용량 메트릭
      apiUsage: new CircularBuffer<APIUsageRecord>(this.bufferSize),
      // 콘텐츠 품질 메트릭
      contentQuality: new CircularBuffer<ContentQualityRecord>(this.bufferSize),
      // 시스템 성능 메트릭
      systemPerformance: new CircularBuffer<SystemPerformanceRecord>(this.bufferSize),
      // 에러 발생 메트릭
      errorTracking: new CircularBuffer<ErrorRecord>(this.bufferSize),
      // 사용자 참여도 메트릭
      userEngagement: new CircularBuffer<UserEngagementRecord>(this.bufferSize),
    };

    // 집계된 메트릭 캐시
    this.aggregatedCache = new LRUCache<string, any>(this.cacheSize, 300000); // 5분 TTL

    // 실시간 통계
    this.realTimeStats = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageResponseTime: 0,
      peakMemoryUsage: 0,
      lastReset: Date.now(),
    };

    // 메트릭 수집 시작
    if (this.enabled) {
      this.startCollection();
    }

    console.log('📊 메트릭 수집기 초기화 완료');
  }

  /**
   * API 사용량 메트릭 수집
   */
  recordAPIUsage(provider: string, operation: string, metrics: APIMetrics): void {
    if (!this.enabled) return;

    const record: APIUsageRecord = {
      timestamp: Date.now(),
      provider, // 'claude', 'gemini'
      operation, // 'generate', 'analyze', 'improve'
      responseTime: metrics.responseTime || 0,
      tokensUsed: metrics.tokensUsed || 0,
      success: metrics.success !== false,
      errorType: metrics.errorType || null,
      requestSize: metrics.requestSize || 0,
      cacheHit: metrics.cacheHit || false,
    };

    this.metrics.apiUsage.push(record);
    this.updateRealTimeStats(record);

    // 집계 캐시 무효화
    this.invalidateAggregatedCache('api');
  }

  /**
   * 콘텐츠 품질 메트릭 수집
   */
  recordContentQuality(contentType: string, qualityMetrics: QualityMetrics): void {
    if (!this.enabled) return;

    const record: ContentQualityRecord = {
      timestamp: Date.now(),
      contentType, // 'chapter', 'novel', 'metadata'
      overallScore: qualityMetrics.overall || 0,
      dimensions: qualityMetrics.dimensions || {},
      readabilityScore: qualityMetrics.readability || 0,
      creativityScore: qualityMetrics.creativity || 0,
      consistencyScore: qualityMetrics.consistency || 0,
      wordCount: qualityMetrics.wordCount || 0,
      generationTime: qualityMetrics.generationTime || 0,
    };

    this.metrics.contentQuality.push(record);
    this.invalidateAggregatedCache('quality');
  }

  /**
   * 시스템 성능 메트릭 수집
   */
  recordSystemPerformance(performanceData: PerformanceData): void {
    if (!this.enabled) return;

    const record: SystemPerformanceRecord = {
      timestamp: Date.now(),
      cpuUsage: performanceData.cpuUsage || 0,
      memoryUsage: performanceData.memoryUsage || {},
      diskIO: performanceData.diskIO || {},
      networkLatency: performanceData.networkLatency || 0,
      activeConnections: performanceData.activeConnections || 0,
      queueLength: performanceData.queueLength || 0,
      cacheHitRate: performanceData.cacheHitRate || 0,
    };

    this.metrics.systemPerformance.push(record);

    // 피크 메모리 사용량 업데이트
    if (
      record.memoryUsage.heapUsed &&
      record.memoryUsage.heapUsed > this.realTimeStats.peakMemoryUsage
    ) {
      this.realTimeStats.peakMemoryUsage = record.memoryUsage.heapUsed;
    }

    this.invalidateAggregatedCache('performance');
  }

  /**
   * 에러 추적 메트릭 수집
   */
  recordError(errorData: ErrorData): void {
    if (!this.enabled) return;

    const record: ErrorRecord = {
      timestamp: Date.now(),
      errorType: errorData.type || 'unknown',
      errorMessage: errorData.message || '',
      errorStack: errorData.stack || '',
      component: errorData.component || 'unknown',
      severity: errorData.severity || 'medium', // low, medium, high, critical
      context: errorData.context || {},
      userId: errorData.userId || null,
      sessionId: errorData.sessionId || null,
    };

    this.metrics.errorTracking.push(record);
    this.realTimeStats.failedOperations++;
    this.invalidateAggregatedCache('errors');
  }

  /**
   * 사용자 참여도 메트릭 수집
   */
  recordUserEngagement(engagementData: EngagementData): void {
    if (!this.enabled) return;

    const record: UserEngagementRecord = {
      timestamp: Date.now(),
      userId: engagementData.userId || 'anonymous',
      sessionId: engagementData.sessionId || null,
      action: engagementData.action || 'unknown', // 'read', 'like', 'share', 'comment'
      contentId: engagementData.contentId || null,
      contentType: engagementData.contentType || null,
      timeSpent: engagementData.timeSpent || 0,
      completionRate: engagementData.completionRate || 0,
      interactionDepth: engagementData.interactionDepth || 0,
    };

    this.metrics.userEngagement.push(record);
    this.invalidateAggregatedCache('engagement');
  }

  /**
   * 실시간 통계 업데이트
   */
  private updateRealTimeStats(record: APIUsageRecord): void {
    this.realTimeStats.totalOperations++;

    if (record.success) {
      this.realTimeStats.successfulOperations++;
    }

    // 평균 응답시간 계산 (이동평균)
    if (record.responseTime) {
      const currentAvg = this.realTimeStats.averageResponseTime;
      const newAvg = currentAvg * 0.9 + record.responseTime * 0.1;
      this.realTimeStats.averageResponseTime = Math.round(newAvg);
    }
  }

  /**
   * 집계된 메트릭 생성 및 캐싱
   */
  getAggregatedMetrics(type: string = 'all', timeRange: number = 3600000): any {
    // 1시간 기본값
    const cacheKey = `${type}_${timeRange}`;
    const cached = this.aggregatedCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const cutoffTime = Date.now() - timeRange;
    const result: any = {};

    if (type === 'all' || type === 'api') {
      result.apiMetrics = this.aggregateAPIMetrics(cutoffTime);
    }

    if (type === 'all' || type === 'quality') {
      result.qualityMetrics = this.aggregateQualityMetrics(cutoffTime);
    }

    if (type === 'all' || type === 'performance') {
      result.performanceMetrics = this.aggregatePerformanceMetrics(cutoffTime);
    }

    if (type === 'all' || type === 'errors') {
      result.errorMetrics = this.aggregateErrorMetrics(cutoffTime);
    }

    if (type === 'all' || type === 'engagement') {
      result.engagementMetrics = this.aggregateEngagementMetrics(cutoffTime);
    }

    // 전체 시스템 건강도 점수
    result.systemHealthScore = this.calculateSystemHealthScore(result);

    // 캐시에 저장
    this.aggregatedCache.set(cacheKey, result);

    return result;
  }

  /**
   * API 메트릭 집계
   */
  private aggregateAPIMetrics(cutoffTime: number): any {
    const apiData = this.metrics.apiUsage
      .getRecent(1000)
      .filter(record => record.timestamp > cutoffTime);

    if (apiData.length === 0) {
      return { totalRequests: 0, successRate: 100, averageResponseTime: 0 };
    }

    const totalRequests = apiData.length;
    const successfulRequests = apiData.filter(r => r.success).length;
    const totalResponseTime = apiData.reduce((sum, r) => sum + r.responseTime, 0);
    const totalTokens = apiData.reduce((sum, r) => sum + r.tokensUsed, 0);

    const providerStats: Record<string, any> = {};
    ['claude', 'gemini'].forEach(provider => {
      const providerData = apiData.filter(r => r.provider === provider);
      providerStats[provider] = {
        requests: providerData.length,
        successRate:
          providerData.length > 0
            ? ((providerData.filter(r => r.success).length / providerData.length) * 100).toFixed(1)
            : 0,
        averageResponseTime:
          providerData.length > 0
            ? Math.round(
                providerData.reduce((sum, r) => sum + r.responseTime, 0) / providerData.length
              )
            : 0,
        totalTokens: providerData.reduce((sum, r) => sum + r.tokensUsed, 0),
      };
    });

    return {
      totalRequests,
      successRate: ((successfulRequests / totalRequests) * 100).toFixed(1),
      averageResponseTime: Math.round(totalResponseTime / totalRequests),
      totalTokensUsed: totalTokens,
      providerBreakdown: providerStats,
      cacheHitRate: ((apiData.filter(r => r.cacheHit).length / totalRequests) * 100).toFixed(1),
    };
  }

  /**
   * 품질 메트릭 집계
   */
  private aggregateQualityMetrics(cutoffTime: number): any {
    const qualityData = this.metrics.contentQuality
      .getRecent(1000)
      .filter(record => record.timestamp > cutoffTime);

    if (qualityData.length === 0) {
      return { averageQuality: 0, totalContent: 0 };
    }

    const totalContent = qualityData.length;
    const averageQuality = qualityData.reduce((sum, r) => sum + r.overallScore, 0) / totalContent;
    const averageReadability =
      qualityData.reduce((sum, r) => sum + r.readabilityScore, 0) / totalContent;
    const averageCreativity =
      qualityData.reduce((sum, r) => sum + r.creativityScore, 0) / totalContent;

    const contentTypeBreakdown: Record<string, any> = {};
    ['chapter', 'novel', 'metadata'].forEach(type => {
      const typeData = qualityData.filter(r => r.contentType === type);
      if (typeData.length > 0) {
        contentTypeBreakdown[type] = {
          count: typeData.length,
          averageQuality: (
            typeData.reduce((sum, r) => sum + r.overallScore, 0) / typeData.length
          ).toFixed(1),
          totalWords: typeData.reduce((sum, r) => sum + r.wordCount, 0),
        };
      }
    });

    return {
      totalContent,
      averageQuality: averageQuality.toFixed(1),
      averageReadability: averageReadability.toFixed(1),
      averageCreativity: averageCreativity.toFixed(1),
      contentTypeBreakdown,
      qualityTrend: this.calculateQualityTrend(qualityData),
    };
  }

  /**
   * 성능 메트릭 집계
   */
  private aggregatePerformanceMetrics(cutoffTime: number): any {
    const perfData = this.metrics.systemPerformance
      .getRecent(1000)
      .filter(record => record.timestamp > cutoffTime);

    if (perfData.length === 0) {
      return { averageMemoryUsage: 0, averageCpuUsage: 0 };
    }

    const averageMemoryUsage =
      perfData.reduce((sum, r) => sum + (r.memoryUsage.heapUsed || 0), 0) / perfData.length;
    const averageCpuUsage = perfData.reduce((sum, r) => sum + r.cpuUsage, 0) / perfData.length;
    const averageCacheHitRate =
      perfData.reduce((sum, r) => sum + r.cacheHitRate, 0) / perfData.length;

    return {
      averageMemoryUsage: Math.round(averageMemoryUsage),
      averageCpuUsage: averageCpuUsage.toFixed(1),
      averageCacheHitRate: averageCacheHitRate.toFixed(1),
      peakMemoryUsage: Math.max(...perfData.map(r => r.memoryUsage.heapUsed || 0)),
      performanceTrend: this.calculatePerformanceTrend(perfData),
    };
  }

  /**
   * 에러 메트릭 집계
   */
  private aggregateErrorMetrics(cutoffTime: number): any {
    const errorData = this.metrics.errorTracking
      .getRecent(1000)
      .filter(record => record.timestamp > cutoffTime);

    const totalErrors = errorData.length;
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    errorData.forEach(error => {
      errorsByType[error.errorType] = (errorsByType[error.errorType] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });

    return {
      totalErrors,
      errorRate:
        this.realTimeStats.totalOperations > 0
          ? ((totalErrors / this.realTimeStats.totalOperations) * 100).toFixed(2)
          : 0,
      errorsByType,
      errorsBySeverity,
      mostCommonError: Object.keys(errorsByType).reduce(
        (a, b) => (errorsByType[a] > errorsByType[b] ? a : b),
        'none'
      ),
    };
  }

  /**
   * 사용자 참여도 메트릭 집계
   */
  private aggregateEngagementMetrics(cutoffTime: number): any {
    const engagementData = this.metrics.userEngagement
      .getRecent(1000)
      .filter(record => record.timestamp > cutoffTime);

    if (engagementData.length === 0) {
      return { totalInteractions: 0, averageTimeSpent: 0 };
    }

    const totalInteractions = engagementData.length;
    const uniqueUsers = new Set(engagementData.map(r => r.userId)).size;
    const averageTimeSpent =
      engagementData.reduce((sum, r) => sum + r.timeSpent, 0) / totalInteractions;
    const averageCompletionRate =
      engagementData.reduce((sum, r) => sum + r.completionRate, 0) / totalInteractions;

    return {
      totalInteractions,
      uniqueUsers,
      averageTimeSpent: Math.round(averageTimeSpent),
      averageCompletionRate: (averageCompletionRate * 100).toFixed(1),
      engagementTrend: this.calculateEngagementTrend(engagementData),
    };
  }

  /**
   * 시스템 건강도 점수 계산
   */
  private calculateSystemHealthScore(metrics: any): number {
    let score = 100;

    // API 성공률 기반 점수 차감
    if (metrics.apiMetrics) {
      const successRate = parseFloat(metrics.apiMetrics.successRate);
      if (successRate < 95) score -= (95 - successRate) * 2;
    }

    // 에러율 기반 점수 차감
    if (metrics.errorMetrics) {
      const errorRate = parseFloat(metrics.errorMetrics.errorRate);
      if (errorRate > 1) score -= errorRate * 10;
    }

    // 성능 기반 점수 차감
    if (metrics.performanceMetrics) {
      const memoryUsage = metrics.performanceMetrics.averageMemoryUsage;
      if (memoryUsage > 500) score -= Math.min(30, ((memoryUsage - 500) / 50) * 5);
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * 품질 트렌드 계산
   */
  private calculateQualityTrend(data: ContentQualityRecord[]): TrendType {
    if (data.length < 2) return 'stable';

    const recent = data.slice(-10);
    const older = data.slice(-20, -10);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, r) => sum + r.overallScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.overallScore, 0) / older.length;

    const difference = recentAvg - olderAvg;

    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  /**
   * 성능 트렌드 계산
   */
  private calculatePerformanceTrend(data: SystemPerformanceRecord[]): TrendType {
    if (data.length < 2) return 'stable';

    const recent = data.slice(-5);
    const older = data.slice(-10, -5);

    if (older.length === 0) return 'stable';

    const recentAvgMemory =
      recent.reduce((sum, r) => sum + (r.memoryUsage.heapUsed || 0), 0) / recent.length;
    const olderAvgMemory =
      older.reduce((sum, r) => sum + (r.memoryUsage.heapUsed || 0), 0) / older.length;

    const memoryDiff = recentAvgMemory - olderAvgMemory;

    if (memoryDiff > 50) return 'degrading';
    if (memoryDiff < -50) return 'improving';
    return 'stable';
  }

  /**
   * 참여도 트렌드 계산
   */
  private calculateEngagementTrend(data: UserEngagementRecord[]): TrendType {
    if (data.length < 2) return 'stable';

    const recent = data.slice(-10);
    const older = data.slice(-20, -10);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, r) => sum + r.completionRate, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.completionRate, 0) / older.length;

    const difference = recentAvg - olderAvg;

    if (difference > 0.1) return 'increasing';
    if (difference < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * 캐시 무효화
   */
  private invalidateAggregatedCache(type: string): void {
    for (const [key] of this.aggregatedCache.cache.entries()) {
      if (key.startsWith(type) || key.startsWith('all')) {
        this.aggregatedCache.cache.delete(key);
      }
    }
  }

  /**
   * 메트릭 수집 시작
   */
  private startCollection(): void {
    // 주기적으로 시스템 성능 메트릭 수집
    this.collectionInterval = setInterval(() => {
      if (this.enabled) {
        this.collectSystemMetrics();
      }
    }, 30000); // 30초마다

    console.log('📈 주기적 메트릭 수집 시작 (30초 간격)');
  }

  /**
   * 시스템 메트릭 자동 수집
   */
  private collectSystemMetrics(): void {
    try {
      const memoryUsage = process.memoryUsage();
      const performanceData: PerformanceData = {
        memoryUsage: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
        },
      };

      this.recordSystemPerformance(performanceData);
    } catch (error) {
      console.warn('⚠️ 시스템 메트릭 수집 중 오류:', (error as Error).message);
    }
  }

  /**
   * 메트릭 리셋
   */
  reset(): void {
    Object.values(this.metrics).forEach(buffer => buffer.clear());
    this.aggregatedCache.clear();
    this.realTimeStats = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageResponseTime: 0,
      peakMemoryUsage: 0,
      lastReset: Date.now(),
    };

    console.log('📊 메트릭 데이터 리셋 완료');
  }

  /**
   * 메트릭 수집 중지
   */
  stop(): void {
    this.enabled = false;
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }
    console.log('📊 메트릭 수집 중지');
  }
}

// 전역 메트릭 수집기 인스턴스
export const metricsCollector = new MetricsCollector();
