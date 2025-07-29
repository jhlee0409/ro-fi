/**
 * 메트릭 개선사항 테스트
 * 안전한 메트릭 기능 검증
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { MetricsCollector } from '../lib/metrics-collector.js';
import { GCMonitor, CircularBuffer } from '../lib/performance-optimizer.js';

describe('메트릭 개선사항 테스트', () => {
  let metricsCollector;
  let gcMonitor;

  beforeEach(() => {
    metricsCollector = new MetricsCollector({ enabled: true, bufferSize: 100 });
    gcMonitor = new GCMonitor();
  });

  afterEach(async () => {
    // MetricsCollector 정리 (주기적 수집 중지)
    if (metricsCollector && typeof metricsCollector.stop === 'function') {
      try {
        metricsCollector.stop();
      } catch (error) {
        console.warn('MetricsCollector cleanup failed:', error.message);
      }
    }
    
    // 약간의 지연을 주어 모든 타이머가 정리되도록 함
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  describe('MetricsCollector - 통합 메트릭 수집', () => {
    test('API 사용량 메트릭 기록', () => {
      const apiMetrics = {
        responseTime: 150,
        tokensUsed: 1000,
        success: true,
        requestSize: 500
      };

      metricsCollector.recordAPIUsage('claude', 'generate', apiMetrics);

      const recent = metricsCollector.metrics.apiUsage.getRecent(1);
      expect(recent).toHaveLength(1);
      expect(recent[0].provider).toBe('claude');
      expect(recent[0].operation).toBe('generate');
      expect(recent[0].responseTime).toBe(150);
      expect(recent[0].success).toBe(true);
    });

    test('콘텐츠 품질 메트릭 기록', () => {
      const qualityMetrics = {
        overall: 85,
        dimensions: { emotional: 90, technical: 80 },
        readability: 88,
        creativity: 82,
        wordCount: 2000
      };

      metricsCollector.recordContentQuality('chapter', qualityMetrics);

      const recent = metricsCollector.metrics.contentQuality.getRecent(1);
      expect(recent).toHaveLength(1);
      expect(recent[0].contentType).toBe('chapter');
      expect(recent[0].overallScore).toBe(85);
      expect(recent[0].wordCount).toBe(2000);
    });

    test('시스템 성능 메트릭 기록', () => {
      const performanceData = {
        memoryUsage: { heapUsed: 100, heapTotal: 200 },
        cpuUsage: 25,
        networkLatency: 50,
        cacheHitRate: 85
      };

      metricsCollector.recordSystemPerformance(performanceData);

      const recent = metricsCollector.metrics.systemPerformance.getRecent(1);
      expect(recent).toHaveLength(1);
      expect(recent[0].memoryUsage.heapUsed).toBe(100);
      expect(recent[0].cpuUsage).toBe(25);
      expect(recent[0].cacheHitRate).toBe(85);
    });

    test('에러 추적 메트릭 기록', () => {
      const errorData = {
        type: 'api_timeout',
        message: 'Request timeout',
        component: 'ai-generator',
        severity: 'high'
      };

      metricsCollector.recordError(errorData);

      const recent = metricsCollector.metrics.errorTracking.getRecent(1);
      expect(recent).toHaveLength(1);
      expect(recent[0].errorType).toBe('api_timeout');
      expect(recent[0].severity).toBe('high');
      expect(recent[0].component).toBe('ai-generator');
    });

    test('집계된 API 메트릭 생성', () => {
      // 여러 API 호출 기록
      const apiCalls = [
        { provider: 'claude', responseTime: 100, success: true, tokensUsed: 500 },
        { provider: 'claude', responseTime: 150, success: true, tokensUsed: 600 },
        { provider: 'gemini', responseTime: 200, success: false, tokensUsed: 0 },
        { provider: 'gemini', responseTime: 120, success: true, tokensUsed: 400 }
      ];

      apiCalls.forEach(call => {
        metricsCollector.recordAPIUsage(call.provider, 'generate', call);
      });

      const aggregated = metricsCollector.getAggregatedMetrics('api', 3600000);
      
      expect(aggregated.apiMetrics.totalRequests).toBe(4);
      expect(aggregated.apiMetrics.successRate).toBe('75.0');
      expect(aggregated.apiMetrics.totalTokensUsed).toBe(1500);
      expect(aggregated.apiMetrics.providerBreakdown.claude.requests).toBe(2);
      expect(aggregated.apiMetrics.providerBreakdown.gemini.requests).toBe(2);
    });

    test('품질 메트릭 집계 및 트렌드 분석', () => {
      // 품질 데이터 시리즈 생성
      const qualityScores = [75, 78, 82, 85, 88, 90, 87, 85, 83, 86];
      
      qualityScores.forEach(score => {
        metricsCollector.recordContentQuality('chapter', {
          overall: score,
          readability: score + 5,
          creativity: score - 3,
          wordCount: 2000
        });
      });

      const aggregated = metricsCollector.getAggregatedMetrics('quality', 3600000);
      
      expect(aggregated.qualityMetrics.totalContent).toBe(10);
      expect(parseFloat(aggregated.qualityMetrics.averageQuality)).toBeCloseTo(83.9, 1);
      expect(['improving', 'stable']).toContain(aggregated.qualityMetrics.qualityTrend);
    });

    test('시스템 건강도 점수 계산', () => {
      // 좋은 성능 데이터
      metricsCollector.recordAPIUsage('claude', 'generate', { 
        responseTime: 100, success: true, tokensUsed: 500 
      });
      metricsCollector.recordSystemPerformance({ 
        memoryUsage: { heapUsed: 200 }, cpuUsage: 20 
      });

      const metrics = metricsCollector.getAggregatedMetrics('all', 3600000);
      expect(metrics.systemHealthScore).toBeGreaterThan(80);

      // 메트릭 리셋
      metricsCollector.reset();

      // 나쁜 성능 데이터
      metricsCollector.recordAPIUsage('claude', 'generate', { 
        responseTime: 100, success: false, tokensUsed: 0 
      });
      metricsCollector.recordError({ type: 'api_error', severity: 'high' });
      metricsCollector.recordSystemPerformance({ 
        memoryUsage: { heapUsed: 800 }, cpuUsage: 90 
      });

      const badMetrics = metricsCollector.getAggregatedMetrics('all', 3600000);
      expect(badMetrics.systemHealthScore).toBeLessThan(50);
    });
  });

  describe('GCMonitor - 향상된 메모리 모니터링', () => {
    test('메모리 사용량 기록 및 히스토리 추적', () => {
      // process.memoryUsage 모킹
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = vi.fn(() => ({
        heapUsed: 100 * 1024 * 1024,
        heapTotal: 200 * 1024 * 1024,
        external: 50 * 1024 * 1024,
        rss: 300 * 1024 * 1024
      }));

      const memoryData = gcMonitor.getMemoryUsage();
      
      expect(memoryData.heapUsed).toBe(100);
      expect(memoryData.heapTotal).toBe(200);
      expect(memoryData.heapUtilization).toBe(50);
      expect(memoryData.timestamp).toBeTypeOf('number');

      // 히스토리가 업데이트되었는지 확인
      expect(gcMonitor.memoryHistory.count).toBe(1);

      process.memoryUsage = originalMemoryUsage;
    });

    test('메모리 트렌드 분석', () => {
      // 메모리 사용량이 증가하는 시나리오
      for (let i = 1; i <= 10; i++) {
        gcMonitor.memoryHistory.push({ heapUsed: 100 + i * 10, timestamp: Date.now() });
      }

      expect(gcMonitor.calculateMemoryTrend()).toBe('increasing');
    });

    test('성능 영향 계산', () => {
      // 높은 메모리 사용률 데이터
      for (let i = 0; i < 5; i++) {
        gcMonitor.memoryHistory.push({ heapUtilization: 85, timestamp: Date.now() });
      }

      expect(gcMonitor.calculatePerformanceImpact()).toBe('high');
    });

    test('메모리 건강도 점수 및 권장사항', () => {
      const mockMemoryData = { heapUtilization: 95 };
      gcMonitor.gcStats.forcedGC = 12;

      const healthScore = gcMonitor.calculateMemoryHealthScore(mockMemoryData);
      const recommendations = gcMonitor.generateMemoryRecommendations(mockMemoryData);

      expect(healthScore).toBeLessThanOrEqual(50);
      expect(recommendations).toContain('메모리 사용량이 높습니다. 캐시 크기를 줄이거나 GC를 실행하세요.');
      expect(recommendations).toContain('잦은 강제 GC가 감지됩니다. 메모리 풀 최적화를 고려하세요.');
    });

    test('확장된 GC 통계', () => {
      gcMonitor.gcStats.forcedGC = 5;
      gcMonitor.gcStats.peakMemoryUsage = 500;

      const stats = gcMonitor.getStats();
      
      expect(stats).toHaveProperty('memoryTrend');
      expect(stats).toHaveProperty('performanceImpact');
      expect(stats).toHaveProperty('healthScore');
      expect(stats).toHaveProperty('recommendations');
      expect(stats.peakMemoryUsage).toBe(500);
    });
  });

  describe('CircularBuffer - 성능 최적화', () => {
    test('순환 버퍼 기본 기능', () => {
      const buffer = new CircularBuffer(5);
      
      // 데이터 추가
      for (let i = 1; i <= 7; i++) {
        buffer.push(i * 10);
      }
      
      // 크기 제한 확인
      expect(buffer.count).toBe(5);
      expect(buffer.getStats().isFull).toBe(true);
      
      // 최근 값들 확인 (30, 40, 50, 60, 70)
      const recent = buffer.getRecent(3);
      expect(recent).toEqual([50, 60, 70]);
    });

    test('평균값 계산', () => {
      const buffer = new CircularBuffer(5);
      buffer.push(10);
      buffer.push(20);
      buffer.push(30);
      
      expect(buffer.getAverage()).toBe(20);
    });

    test('버퍼 통계', () => {
      const buffer = new CircularBuffer(10);
      buffer.push(100);
      buffer.push(200);
      
      const stats = buffer.getStats();
      expect(stats.size).toBe(10);
      expect(stats.count).toBe(2);
      expect(stats.usage).toBe('20.0%');
    });
  });

  describe('메트릭 캐시 및 성능', () => {
    test('집계 메트릭 캐싱', () => {
      metricsCollector.recordAPIUsage('claude', 'generate', { 
        responseTime: 100, success: true, tokensUsed: 500 
      });

      // 첫 번째 호출 - 계산 후 캐시
      const metrics1 = metricsCollector.getAggregatedMetrics('api', 3600000);
      
      // 두 번째 호출 - 캐시에서 반환
      const metrics2 = metricsCollector.getAggregatedMetrics('api', 3600000);
      
      expect(metrics1).toEqual(metrics2);
    });

    test('캐시 무효화', () => {
      metricsCollector.recordAPIUsage('claude', 'generate', { 
        responseTime: 100, success: true, tokensUsed: 500 
      });

      const metrics1 = metricsCollector.getAggregatedMetrics('api', 3600000);
      
      // 새로운 데이터 추가 (캐시 무효화)
      metricsCollector.recordAPIUsage('gemini', 'generate', { 
        responseTime: 150, success: true, tokensUsed: 600 
      });

      const metrics2 = metricsCollector.getAggregatedMetrics('api', 3600000);
      
      expect(metrics1.apiMetrics.totalRequests).toBe(1);
      expect(metrics2.apiMetrics.totalRequests).toBe(2);
    });
  });

  describe('실시간 통계 업데이트', () => {
    test('실시간 통계 계산', () => {
      expect(metricsCollector.realTimeStats.totalOperations).toBe(0);
      
      metricsCollector.recordAPIUsage('claude', 'generate', { 
        responseTime: 100, success: true, tokensUsed: 500 
      });
      
      expect(metricsCollector.realTimeStats.totalOperations).toBe(1);
      expect(metricsCollector.realTimeStats.successfulOperations).toBe(1);
      expect(metricsCollector.realTimeStats.averageResponseTime).toBeGreaterThan(0);
    });

    test('메트릭 리셋 functionality', () => {
      metricsCollector.recordAPIUsage('claude', 'generate', { 
        responseTime: 100, success: true, tokensUsed: 500 
      });
      
      expect(metricsCollector.realTimeStats.totalOperations).toBe(1);
      
      metricsCollector.reset();
      
      expect(metricsCollector.realTimeStats.totalOperations).toBe(0);
      expect(metricsCollector.metrics.apiUsage.count).toBe(0);
    });
  });
});