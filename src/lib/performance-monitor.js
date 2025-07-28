/**
 * 성능 모니터링 유틸리티
 * 실행 시간, 메모리 사용량, 병목 현상 추적
 */

import { performance } from 'perf_hooks';
import { getLogger, LogCategory } from './logging-service.js';

/**
 * 성능 모니터
 */
export class PerformanceMonitor {
  constructor(config = {}) {
    this.config = {
      enableAutoLogging: config.enableAutoLogging !== false,
      slowThreshold: config.slowThreshold || 1000, // 1초
      memoryCheckInterval: config.memoryCheckInterval || 60000, // 1분
      ...config
    };

    this.logger = getLogger();
    this.measurements = new Map();
    this.memorySnapshots = [];
    this.performanceMarks = new Map();

    this.initialize();
  }

  initialize() {
    if (this.config.memoryCheckInterval > 0) {
      this.startMemoryMonitoring();
    }
  }

  /**
   * 성능 측정 시작
   */
  startMeasurement(name, metadata = {}) {
    const measurementId = `${name}-${Date.now()}`;
    
    this.measurements.set(measurementId, {
      name,
      startTime: performance.now(),
      startMemory: process.memoryUsage(),
      metadata
    });

    // 성능 마크 추가
    performance.mark(`${measurementId}-start`);

    return measurementId;
  }

  /**
   * 성능 측정 종료
   */
  async endMeasurement(measurementId, result = {}) {
    const measurement = this.measurements.get(measurementId);
    if (!measurement) {
      this.logger.warn(`Unknown measurement ID: ${measurementId}`);
      return null;
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - measurement.startTime;

    // 성능 마크 및 측정
    performance.mark(`${measurementId}-end`);
    performance.measure(
      measurementId,
      `${measurementId}-start`,
      `${measurementId}-end`
    );

    // 메모리 변화 계산
    const memoryDelta = {
      heapUsed: endMemory.heapUsed - measurement.startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - measurement.startMemory.heapTotal,
      external: endMemory.external - measurement.startMemory.external,
      rss: endMemory.rss - measurement.startMemory.rss
    };

    const perfData = {
      name: measurement.name,
      duration,
      memoryDelta,
      startMemory: measurement.startMemory,
      endMemory,
      metadata: measurement.metadata,
      result,
      slow: duration > this.config.slowThreshold
    };

    // 자동 로깅
    if (this.config.enableAutoLogging) {
      await this.logPerformance(perfData);
    }

    // 측정 정리
    this.measurements.delete(measurementId);
    performance.clearMarks(`${measurementId}-start`);
    performance.clearMarks(`${measurementId}-end`);
    performance.clearMeasures(measurementId);

    return perfData;
  }

  /**
   * 함수 실행 시간 측정
   */
  async measureFunction(name, fn, ...args) {
    const measurementId = this.startMeasurement(name);
    
    try {
      const result = await fn(...args);
      const perfData = await this.endMeasurement(measurementId, { success: true });
      return { result, performance: perfData };
    } catch (error) {
      const perfData = await this.endMeasurement(measurementId, { 
        success: false, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * 데코레이터: 메서드 성능 측정
   */
  static measure(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    const monitor = new PerformanceMonitor();

    descriptor.value = async function(...args) {
      const measurementId = monitor.startMeasurement(`${target.constructor.name}.${propertyKey}`);
      
      try {
        const result = await originalMethod.apply(this, args);
        await monitor.endMeasurement(measurementId, { success: true });
        return result;
      } catch (error) {
        await monitor.endMeasurement(measurementId, { 
          success: false, 
          error: error.message 
        });
        throw error;
      }
    };

    return descriptor;
  }

  /**
   * 메모리 스냅샷
   */
  takeMemorySnapshot(label = '') {
    const snapshot = {
      timestamp: Date.now(),
      label,
      memory: process.memoryUsage(),
      heapStatistics: this.getHeapStatistics()
    };

    this.memorySnapshots.push(snapshot);

    // 최대 100개 스냅샷 유지
    if (this.memorySnapshots.length > 100) {
      this.memorySnapshots.shift();
    }

    return snapshot;
  }

  /**
   * 메모리 누수 감지
   */
  async detectMemoryLeak(duration = 60000, threshold = 50 * 1024 * 1024) { // 50MB
    const startSnapshot = this.takeMemorySnapshot('leak-detection-start');
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    const endSnapshot = this.takeMemorySnapshot('leak-detection-end');
    
    const heapGrowth = endSnapshot.memory.heapUsed - startSnapshot.memory.heapUsed;
    const isLeak = heapGrowth > threshold;

    const report = {
      duration,
      heapGrowth,
      growthRate: heapGrowth / (duration / 1000), // bytes per second
      possibleLeak: isLeak,
      startMemory: startSnapshot.memory,
      endMemory: endSnapshot.memory
    };

    if (isLeak) {
      await this.logger.critical('Possible memory leak detected', {
        category: LogCategory.PERFORMANCE,
        ...report
      });
    }

    return report;
  }

  /**
   * 병목 현상 분석
   */
  async analyzeBottlenecks() {
    const entries = performance.getEntries();
    const bottlenecks = [];

    entries.forEach(entry => {
      if (entry.duration > this.config.slowThreshold) {
        bottlenecks.push({
          name: entry.name,
          type: entry.entryType,
          duration: entry.duration,
          startTime: entry.startTime
        });
      }
    });

    // 가장 느린 작업 정렬
    bottlenecks.sort((a, b) => b.duration - a.duration);

    return {
      totalBottlenecks: bottlenecks.length,
      topBottlenecks: bottlenecks.slice(0, 10),
      summary: this.summarizeBottlenecks(bottlenecks)
    };
  }

  /**
   * 리소스 타이밍 분석
   */
  getResourceTimings() {
    const resources = performance.getEntriesByType('resource');
    
    return resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      type: this.getResourceType(resource.name),
      timing: {
        dns: resource.domainLookupEnd - resource.domainLookupStart,
        connect: resource.connectEnd - resource.connectStart,
        request: resource.responseStart - resource.requestStart,
        response: resource.responseEnd - resource.responseStart
      }
    }));
  }

  /**
   * 성능 리포트 생성
   */
  async generatePerformanceReport() {
    const memoryStats = this.getMemoryStatistics();
    const bottlenecks = await this.analyzeBottlenecks();
    const resourceTimings = this.getResourceTimings();

    return {
      timestamp: new Date().toISOString(),
      memory: {
        current: process.memoryUsage(),
        statistics: memoryStats,
        snapshots: this.memorySnapshots.slice(-10) // 최근 10개
      },
      bottlenecks,
      resources: {
        count: resourceTimings.length,
        totalDuration: resourceTimings.reduce((sum, r) => sum + r.duration, 0),
        byType: this.groupResourcesByType(resourceTimings)
      },
      recommendations: this.generateRecommendations(memoryStats, bottlenecks)
    };
  }

  /**
   * 유틸리티 메서드
   */
  async logPerformance(perfData) {
    const level = perfData.slow ? 'warn' : 'info';
    
    await this.logger[level](`Performance: ${perfData.name}`, {
      category: LogCategory.PERFORMANCE,
      duration: Math.round(perfData.duration),
      memoryDelta: perfData.memoryDelta.heapUsed,
      slow: perfData.slow,
      ...perfData.metadata
    });
  }

  getHeapStatistics() {
    try {
      const v8 = require('v8');
      return v8.getHeapStatistics();
    } catch {
      return null;
    }
  }

  getMemoryStatistics() {
    if (this.memorySnapshots.length < 2) {
      return null;
    }

    const recent = this.memorySnapshots.slice(-20);
    const heapUsages = recent.map(s => s.memory.heapUsed);

    return {
      average: heapUsages.reduce((a, b) => a + b) / heapUsages.length,
      min: Math.min(...heapUsages),
      max: Math.max(...heapUsages),
      trend: this.calculateTrend(heapUsages),
      volatility: this.calculateVolatility(heapUsages)
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  calculateVolatility(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  summarizeBottlenecks(bottlenecks) {
    const byType = {};
    
    bottlenecks.forEach(b => {
      byType[b.type] = byType[b.type] || { count: 0, totalDuration: 0 };
      byType[b.type].count++;
      byType[b.type].totalDuration += b.duration;
    });

    return byType;
  }

  getResourceType(url) {
    if (url.endsWith('.js')) return 'script';
    if (url.endsWith('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  groupResourcesByType(resources) {
    const groups = {};
    
    resources.forEach(r => {
      groups[r.type] = groups[r.type] || [];
      groups[r.type].push(r);
    });

    return groups;
  }

  generateRecommendations(memoryStats, bottlenecks) {
    const recommendations = [];

    // 메모리 권장사항
    if (memoryStats?.trend === 'increasing') {
      recommendations.push({
        type: 'memory',
        severity: 'warning',
        message: 'Memory usage is trending upward. Consider investigating for memory leaks.'
      });
    }

    if (memoryStats?.volatility > 0.3) {
      recommendations.push({
        type: 'memory',
        severity: 'info',
        message: 'High memory volatility detected. Consider implementing object pooling.'
      });
    }

    // 성능 권장사항
    if (bottlenecks.totalBottlenecks > 10) {
      recommendations.push({
        type: 'performance',
        severity: 'warning',
        message: `${bottlenecks.totalBottlenecks} slow operations detected. Review top bottlenecks.`
      });
    }

    return recommendations;
  }

  startMemoryMonitoring() {
    setInterval(() => {
      this.takeMemorySnapshot('periodic');
    }, this.config.memoryCheckInterval);
  }

  /**
   * 정리
   */
  cleanup() {
    performance.clearMarks();
    performance.clearMeasures();
    this.measurements.clear();
    this.memorySnapshots = [];
  }
}

// 싱글톤 인스턴스
let performanceMonitorInstance = null;

export function getPerformanceMonitor(config) {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor(config);
  }
  return performanceMonitorInstance;
}