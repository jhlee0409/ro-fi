/**
 * 🧪 Performance Optimization Engine Tests
 * 성능 최적화 엔진 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceOptimizationEngine } from '../lib/performance-optimization-engine.js';

describe('PerformanceOptimizationEngine', () => {
  let optimizationEngine: PerformanceOptimizationEngine;
  let mockPayload: unknown;

  beforeEach(() => {
    optimizationEngine = new PerformanceOptimizationEngine();
    
    mockPayload = {
      type: 'story_generation',
      data: {
        chapter: 15,
        characters: ['민준', '서연'],
        setting: 'school'
      }
    };
  });

  describe('System Initialization', () => {
    it('should initialize with default metrics and strategies', () => {
      expect(optimizationEngine).toBeDefined();
      
      const report = optimizationEngine.generatePerformanceReport();
      expect(report).toBeDefined();
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('optimizations');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('trends');
      expect(report).toHaveProperty('alerts');
      
      expect(report.metrics).toHaveProperty('responseTime');
      expect(report.metrics).toHaveProperty('throughput');
      expect(report.metrics).toHaveProperty('resourceUsage');
      expect(report.metrics).toHaveProperty('cachePerformance');
      expect(report.metrics).toHaveProperty('systemHealth');
    });

    it('should have valid initial performance metrics', () => {
      const report = optimizationEngine.generatePerformanceReport();
      const metrics = report.metrics;
      
      // Response Time Metrics
      expect(metrics.responseTime).toHaveProperty('average');
      expect(metrics.responseTime).toHaveProperty('median');
      expect(metrics.responseTime).toHaveProperty('p95');
      expect(metrics.responseTime).toHaveProperty('p99');
      expect(metrics.responseTime).toHaveProperty('trend');
      expect(['improving', 'degrading', 'stable']).toContain(metrics.responseTime.trend);
      
      // Throughput Metrics
      expect(metrics.throughput).toHaveProperty('requestsPerSecond');
      expect(metrics.throughput).toHaveProperty('queueLength');
      expect(metrics.throughput).toHaveProperty('processingCapacity');
      expect(typeof metrics.throughput.processingCapacity).toBe('number');
      
      // Resource Usage Metrics
      expect(metrics.resourceUsage).toHaveProperty('cpuUsage');
      expect(metrics.resourceUsage).toHaveProperty('memoryUsage');
      expect(metrics.resourceUsage).toHaveProperty('heapSize');
      expect(typeof metrics.resourceUsage.cpuUsage).toBe('number');
      
      // System Health
      expect(metrics.systemHealth).toHaveProperty('overall');
      expect(['excellent', 'good', 'fair', 'poor', 'critical']).toContain(metrics.systemHealth.overall);
      expect(metrics.systemHealth).toHaveProperty('availability');
      expect(typeof metrics.systemHealth.availability).toBe('number');
    });
  });

  describe('Performance Optimization', () => {
    it('should optimize performance for story generation', async () => {
      const result = await optimizationEngine.optimizePerformance(
        'story_generation',
        mockPayload,
        { priority: 5 }
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('optimizations');
      expect(result).toHaveProperty('performanceGain');
      expect(result).toHaveProperty('metrics');
      
      expect(Array.isArray(result.optimizations)).toBe(true);
      expect(typeof result.performanceGain).toBe('number');
      expect(result.performanceGain).toBeGreaterThanOrEqual(0);
      expect(result.performanceGain).toBeLessThanOrEqual(100);
    });

    it('should handle different operation types', async () => {
      const operationTypes = ['story_generation', 'character_customization', 'choice_generation', 'quality_validation'];
      
      for (const opType of operationTypes) {
        const result = await optimizationEngine.optimizePerformance(
          opType as unknown,
          mockPayload
        );
        
        expect(result).toBeDefined();
        expect(result.result).toBeDefined();
        expect(Array.isArray(result.optimizations)).toBe(true);
      }
    });

    it('should handle cache optimization options', async () => {
      // 캐시 바이패스 테스트
      const result1 = await optimizationEngine.optimizePerformance(
        'story_generation',
        mockPayload,
        { bypassCache: true }
      );

      // 캐시 스킵 테스트
      const result2 = await optimizationEngine.optimizePerformance(
        'story_generation',
        mockPayload,
        { skipCache: true }
      );

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(Array.isArray(result1.optimizations)).toBe(true);
      expect(Array.isArray(result2.optimizations)).toBe(true);
    });

    it('should measure performance gains accurately', async () => {
      const startTime = performance.now();
      
      const result = await optimizationEngine.optimizePerformance(
        'story_generation',
        mockPayload
      );
      
      const endTime = performance.now();
      const actualDuration = endTime - startTime;
      
      expect(result.performanceGain).toBeGreaterThanOrEqual(0);
      expect(typeof result.performanceGain).toBe('number');
      expect(actualDuration).toBeLessThan(1000); // 1초 이내 완료
    });
  });

  describe('Cache Optimization', () => {
    it('should analyze cache performance', async () => {
      const cacheResult = await optimizationEngine.optimizeCaching('story_generation', mockPayload);
      
      expect(cacheResult).toBeDefined();
      expect(cacheResult).toHaveProperty('currentStats');
      expect(cacheResult).toHaveProperty('recommendations');
      expect(cacheResult).toHaveProperty('estimatedImprovement');
      
      expect(Array.isArray(cacheResult.recommendations)).toBe(true);
      expect(typeof cacheResult.estimatedImprovement).toBe('number');
      expect(cacheResult.estimatedImprovement).toBeGreaterThanOrEqual(0);
    });

    it('should provide cache recommendations', async () => {
      const cacheResult = await optimizationEngine.optimizeCaching('story_generation', mockPayload);
      
      cacheResult.recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('reason');
        expect(rec).toHaveProperty('expectedImpact');
        expect(rec).toHaveProperty('implementation');
        
        expect(typeof rec.type).toBe('string');
        expect(typeof rec.reason).toBe('string');
        expect(['low', 'medium', 'high']).toContain(rec.expectedImpact);
        expect(typeof rec.implementation).toBe('string');
      });
    });

    it('should calculate cache stats correctly', async () => {
      const cacheResult = await optimizationEngine.optimizeCaching('story_generation', mockPayload);
      const stats = cacheResult.currentStats;
      
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('memoryUsage');
      expect(stats).toHaveProperty('entries');
      
      expect(typeof stats.hitRate).toBe('number');
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeLessThanOrEqual(100);
      
      expect(typeof stats.memoryUsage).toBe('number');
      expect(stats.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(stats.memoryUsage).toBeLessThanOrEqual(100);
    });
  });

  describe('API Optimization', () => {
    it('should optimize API request batching', async () => {
      const mockRequests = [
        { id: '1', type: 'generate', data: { prompt: 'test1' }, batchable: true },
        { id: '2', type: 'generate', data: { prompt: 'test2' }, batchable: true },
        { id: '3', type: 'validate', data: { content: 'test3' }, batchable: false }
      ];

      const apiResult = await optimizationEngine.optimizeAPIUsage(mockRequests);
      
      expect(apiResult).toBeDefined();
      expect(apiResult).toHaveProperty('originalCount');
      expect(apiResult).toHaveProperty('optimizedCount');
      expect(apiResult).toHaveProperty('timeSavings');
      expect(apiResult).toHaveProperty('costSavings');
      expect(apiResult).toHaveProperty('optimizations');
      
      expect(typeof apiResult.originalCount).toBe('number');
      expect(typeof apiResult.optimizedCount).toBe('number');
      expect(typeof apiResult.timeSavings).toBe('number');
      expect(typeof apiResult.costSavings).toBe('number');
      expect(Array.isArray(apiResult.optimizations)).toBe(true);
      
      expect(apiResult.originalCount).toBe(3);
      expect(apiResult.timeSavings).toBeGreaterThanOrEqual(0);
      expect(apiResult.costSavings).toBeGreaterThanOrEqual(0);
    });

    it('should identify optimization opportunities', async () => {
      const duplicateRequests = [
        { id: '1', type: 'generate', data: { prompt: 'same' }, batchable: true },
        { id: '2', type: 'generate', data: { prompt: 'same' }, batchable: true },
        { id: '3', type: 'generate', data: { prompt: 'different' }, batchable: true }
      ];

      const apiResult = await optimizationEngine.optimizeAPIUsage(duplicateRequests);
      
      expect(apiResult.optimizations).toContain('deduplication');
      expect(apiResult.timeSavings).toBeGreaterThan(0);
    });
  });

  describe('Performance Metrics', () => {
    it('should track response time metrics', () => {
      const report = optimizationEngine.generatePerformanceReport();
      const responseTime = report.metrics.responseTime;
      
      expect(responseTime.average).toBeGreaterThanOrEqual(0);
      expect(responseTime.median).toBeGreaterThanOrEqual(0);
      expect(responseTime.p95).toBeGreaterThanOrEqual(responseTime.median);
      expect(responseTime.p99).toBeGreaterThanOrEqual(responseTime.p95);
      expect(responseTime.min).toBeGreaterThanOrEqual(0);
      expect(responseTime.max).toBeGreaterThanOrEqual(responseTime.min);
    });

    it('should track throughput metrics', () => {
      const report = optimizationEngine.generatePerformanceReport();
      const throughput = report.metrics.throughput;
      
      expect(throughput.requestsPerSecond).toBeGreaterThanOrEqual(0);
      expect(throughput.requestsPerMinute).toBeGreaterThanOrEqual(0);
      expect(throughput.requestsPerHour).toBeGreaterThanOrEqual(0);
      expect(throughput.queueLength).toBeGreaterThanOrEqual(0);
      expect(throughput.processingCapacity).toBeGreaterThan(0);
      expect(throughput.processingCapacity).toBeLessThanOrEqual(100);
    });

    it('should track resource usage metrics', () => {
      const report = optimizationEngine.generatePerformanceReport();
      const resources = report.metrics.resourceUsage;
      
      expect(resources.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(resources.cpuUsage).toBeLessThanOrEqual(100);
      expect(resources.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(resources.memoryUsage).toBeLessThanOrEqual(100);
      expect(resources.heapSize).toBeGreaterThanOrEqual(0);
      expect(resources.gcPressure).toBeGreaterThanOrEqual(0);
      expect(resources.gcPressure).toBeLessThanOrEqual(100);
    });

    it('should track cache performance metrics', () => {
      const report = optimizationEngine.generatePerformanceReport();
      const cache = report.metrics.cachePerformance;
      
      expect(cache.hitRate).toBeGreaterThanOrEqual(0);
      expect(cache.hitRate).toBeLessThanOrEqual(100);
      expect(cache.missRate).toBeGreaterThanOrEqual(0);
      expect(cache.missRate).toBeLessThanOrEqual(100);
      expect(cache.cacheSize).toBeGreaterThanOrEqual(0);
      expect(cache.cacheUtilization).toBeGreaterThanOrEqual(0);
      expect(cache.cacheUtilization).toBeLessThanOrEqual(100);
    });
  });

  describe('Performance Trends', () => {
    it('should provide optimization recommendations', () => {
      const report = optimizationEngine.generatePerformanceReport();
      
      expect(Array.isArray(report.recommendations)).toBe(true);
      report.recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });

    it('should analyze historical trends', () => {
      const report = optimizationEngine.generatePerformanceReport();
      const trends = report.trends;
      
      expect(trends).toBeDefined();
      expect(trends).toHaveProperty('responseTimeTrend');
      expect(trends).toHaveProperty('throughputTrend');
      expect(trends).toHaveProperty('errorRateTrend');
      
      const validTrends = ['improving', 'degrading', 'stable'];
      expect(validTrends).toContain(trends.responseTimeTrend);
      expect(validTrends).toContain(trends.throughputTrend);
      expect(validTrends).toContain(trends.errorRateTrend);
    });

    it('should identify applied optimizations', () => {
      const report = optimizationEngine.generatePerformanceReport();
      
      expect(Array.isArray(report.optimizations)).toBe(true);
      expect(report.optimizations.length).toBeGreaterThan(0);
      
      const commonOptimizations = ['caching', 'batching', 'load_balancing', 'auto_scaling'];
      report.optimizations.forEach(opt => {
        expect(typeof opt).toBe('string');
        expect(commonOptimizations).toContain(opt);
      });
    });
  });

  describe('System Health', () => {
    it('should monitor system health', () => {
      const report = optimizationEngine.generatePerformanceReport();
      const health = report.metrics.systemHealth;
      
      expect(health.overall).toBeDefined();
      expect(['excellent', 'good', 'fair', 'poor', 'critical']).toContain(health.overall);
      
      expect(health.uptime).toBeGreaterThanOrEqual(0);
      expect(health.availability).toBeGreaterThan(0);
      expect(health.availability).toBeLessThanOrEqual(100);
      expect(health.reliability).toBeGreaterThan(0);
      expect(health.reliability).toBeLessThanOrEqual(100);
      expect(health.scalability).toBeGreaterThan(0);
      expect(health.scalability).toBeLessThanOrEqual(100);
    });

    it('should track _error rates', () => {
      const report = optimizationEngine.generatePerformanceReport();
      const errors = report.metrics.errorRates;
      
      expect(errors.totalErrors).toBeGreaterThanOrEqual(0);
      expect(errors.errorRate).toBeGreaterThanOrEqual(0);
      expect(errors.errorRate).toBeLessThanOrEqual(100);
      expect(errors.timeoutRate).toBeGreaterThanOrEqual(0);
      expect(errors.timeoutRate).toBeLessThanOrEqual(100);
      expect(errors.retryRate).toBeGreaterThanOrEqual(0);
      expect(errors.retryRate).toBeLessThanOrEqual(100);
      expect(errors.errorCategories instanceof Map).toBe(true);
    });

    it('should provide active alerts', () => {
      const report = optimizationEngine.generatePerformanceReport();
      const alerts = report.alerts;
      
      expect(Array.isArray(alerts)).toBe(true);
      alerts.forEach(alert => {
        expect(alert).toHaveProperty('level');
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('value');
        expect(alert).toHaveProperty('threshold');
        
        expect(['info', 'warning', 'critical']).toContain(alert.level);
        expect(typeof alert.type).toBe('string');
        expect(typeof alert.message).toBe('string');
        expect(typeof alert.value).toBe('number');
        expect(typeof alert.threshold).toBe('number');
      });
    });
  });

  describe('Stress Testing', () => {
    it('should handle high concurrency', async () => {
      const concurrentRequests = 10;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          optimizationEngine.optimizePerformance(
            'story_generation',
            { ...mockPayload, id: i }
          )
        );
      }
      
      const results = await Promise.all(promises);
      
      expect(results.length).toBe(concurrentRequests);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.result).toBeDefined();
        expect(Array.isArray(result.optimizations)).toBe(true);
      });
    });

    it('should maintain performance under load', async () => {
      const iterations = 5;
      const responseTimes = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        await optimizationEngine.optimizePerformance(
          'character_customization',
          mockPayload
        );
        
        const endTime = performance.now();
        responseTimes.push(endTime - startTime);
      }
      
      // 응답 시간이 일정 수준 이내에 있는지 확인
      const averageResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
      expect(averageResponseTime).toBeLessThan(1000); // 1초 이내
      
      // 응답 시간의 편차가 크지 않은지 확인
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      const variance = maxResponseTime - minResponseTime;
      expect(variance).toBeLessThan(500); // 최대 500ms 편차
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid operation types gracefully', async () => {
      const result = await optimizationEngine.optimizePerformance(
        'invalid_operation' as unknown,
        mockPayload
      );
      
      expect(result).toBeDefined();
      expect(result.result).toBeDefined();
    });

    it('should handle empty payloads', async () => {
      const result = await optimizationEngine.optimizePerformance(
        'story_generation',
        {}
      );
      
      expect(result).toBeDefined();
      expect(result.result).toBeDefined();
    });

    it('should handle null and undefined inputs', async () => {
      const result1 = await optimizationEngine.optimizePerformance(
        'story_generation',
        null
      );
      
      const result2 = await optimizationEngine.optimizePerformance(
        'story_generation',
        undefined
      );
      
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('should handle extreme optimization options', async () => {
      const result = await optimizationEngine.optimizePerformance(
        'story_generation',
        mockPayload,
        {
          priority: 999,
          timeout: 1,
          bypassCache: true,
          skipCache: true
        }
      );
      
      expect(result).toBeDefined();
      expect(result.result).toBeDefined();
    });
  });

  describe('Memory Management', () => {
    it('should track memory usage', () => {
      const report = optimizationEngine.generatePerformanceReport();
      const memory = report.metrics.resourceUsage;
      
      expect(memory.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(memory.heapSize).toBeGreaterThanOrEqual(0);
      expect(memory.gcPressure).toBeGreaterThanOrEqual(0);
      expect(memory.gcPressure).toBeLessThanOrEqual(100);
    });

    it('should not cause memory leaks during repeated operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 반복 작업 수행
      for (let i = 0; i < 20; i++) {
        await optimizationEngine.optimizePerformance(
          'story_generation',
          { ...mockPayload, iteration: i }
        );
      }
      
      // 가비지 컬렉션 트리거 (가능한 경우)
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024); // MB
      
      // 메모리 증가가 합리적인 수준인지 확인 (20MB 이하)
      expect(memoryIncrease).toBeLessThan(20);
    });
  });

  describe('Performance Report Generation', () => {
    it('should generate comprehensive performance reports', () => {
      const report = optimizationEngine.generatePerformanceReport();
      
      expect(report.timestamp instanceof Date).toBe(true);
      expect(report.metrics).toBeDefined();
      expect(Array.isArray(report.optimizations)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.trends).toBeDefined();
      expect(Array.isArray(report.alerts)).toBe(true);
      
      // 보고서의 타임스탬프가 현재 시간과 비슷한지 확인
      const now = new Date();
      const timeDiff = Math.abs(now.getTime() - report.timestamp.getTime());
      expect(timeDiff).toBeLessThan(5000); // 5초 이내
    });

    it('should provide actionable insights', () => {
      const report = optimizationEngine.generatePerformanceReport();
      
      // 최적화 제안이 있어야 함
      expect(report.optimizations.length).toBeGreaterThan(0);
      
      // 각 최적화 항목이 유효한 문자열이어야 함
      report.optimizations.forEach(opt => {
        expect(typeof opt).toBe('string');
        expect(opt.length).toBeGreaterThan(0);
      });
      
      // 트렌드 분석이 유효해야 함
      expect(report.trends).toHaveProperty('responseTimeTrend');
      expect(report.trends).toHaveProperty('throughputTrend');
      expect(report.trends).toHaveProperty('errorRateTrend');
    });
  });
});