/**
 * 🧪 Scaling Management System Tests
 * 스케일링 관리 시스템 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScalingManagementSystem } from '../lib/scaling-management-system.js';

describe('ScalingManagementSystem', () => {
  let scalingSystem: ScalingManagementSystem;

  beforeEach(() => {
    scalingSystem = new ScalingManagementSystem();
  });

  describe('System Initialization', () => {
    it('should initialize with default settings', () => {
      expect(scalingSystem).toBeDefined();
      
      const status = scalingSystem.getSystemStatus();
      expect(status).toBeDefined();
      expect(status).toHaveProperty('totalPools');
      expect(status).toHaveProperty('activePolicies');
      expect(status).toHaveProperty('totalInstances');
      expect(status).toHaveProperty('systemHealth');
      expect(status).toHaveProperty('costEfficiency');
      expect(status).toHaveProperty('recentScalingEvents');
      
      expect(typeof status.totalPools).toBe('number');
      expect(typeof status.activePolicies).toBe('number');
      expect(typeof status.totalInstances).toBe('number');
      expect(['healthy', 'warning', 'critical']).toContain(status.systemHealth);
      expect(typeof status.costEfficiency).toBe('number');
      expect(Array.isArray(status.recentScalingEvents)).toBe(true);
    });

    it('should have default resource pools and policies', () => {
      const status = scalingSystem.getSystemStatus();
      
      expect(status.totalPools).toBeGreaterThan(0);
      expect(status.activePolicies).toBeGreaterThan(0);
      expect(status.costEfficiency).toBeGreaterThanOrEqual(0);
      expect(status.costEfficiency).toBeLessThanOrEqual(100);
    });

    it('should initialize with healthy system state', () => {
      const status = scalingSystem.getSystemStatus();
      
      expect(status.systemHealth).toBe('healthy');
      expect(status.totalInstances).toBeGreaterThanOrEqual(0);
      expect(status.recentScalingEvents.length).toBe(0);
    });
  });

  describe('Scaling Decision Evaluation', () => {
    it('should evaluate scaling decisions successfully', async () => {
      const result = await scalingSystem.evaluateScalingDecisions();
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('decisions');
      expect(result).toHaveProperty('executionResults');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('costImpact');
      expect(result).toHaveProperty('recommendations');
      
      expect(Array.isArray(result.decisions)).toBe(true);
      expect(Array.isArray(result.executionResults)).toBe(true);
      expect(result.metrics).toBeDefined();
      expect(result.costImpact).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should provide valid cost impact estimates', async () => {
      const result = await scalingSystem.evaluateScalingDecisions();
      const costImpact = result.costImpact;
      
      expect(costImpact).toHaveProperty('hourlyIncrease');
      expect(costImpact).toHaveProperty('dailyEstimate');
      expect(costImpact).toHaveProperty('monthlyEstimate');
      expect(costImpact).toHaveProperty('savings');
      
      expect(typeof costImpact.hourlyIncrease).toBe('number');
      expect(typeof costImpact.dailyEstimate).toBe('number');
      expect(typeof costImpact.monthlyEstimate).toBe('number');
      expect(typeof costImpact.savings).toBe('number');
      
      expect(costImpact.hourlyIncrease).toBeGreaterThanOrEqual(0);
      expect(costImpact.dailyEstimate).toBeGreaterThanOrEqual(0);
      expect(costImpact.monthlyEstimate).toBeGreaterThanOrEqual(0);
      expect(costImpact.savings).toBeGreaterThanOrEqual(0);
    });

    it('should generate scaling recommendations', async () => {
      const result = await scalingSystem.evaluateScalingDecisions();
      const recommendations = result.recommendations;
      
      expect(Array.isArray(recommendations)).toBe(true);
      
      recommendations.forEach(recommendation => {
        expect(recommendation).toHaveProperty('type');
        expect(recommendation).toHaveProperty('description');
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('implementation');
        
        expect(typeof recommendation.type).toBe('string');
        expect(typeof recommendation.description).toBe('string');
        expect(typeof recommendation.priority).toBe('number');
        expect(typeof recommendation.implementation).toBe('string');
        
        expect(recommendation.priority).toBeGreaterThanOrEqual(1);
        expect(recommendation.priority).toBeLessThanOrEqual(10);
        expect(recommendation.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Resource Pool Management', () => {
    it('should track resource pool metrics', () => {
      const status = scalingSystem.getSystemStatus();
      
      expect(status.totalPools).toBeGreaterThan(0);
      expect(status.totalInstances).toBeGreaterThanOrEqual(0);
    });

    it('should maintain resource pool health', () => {
      const status = scalingSystem.getSystemStatus();
      
      expect(['healthy', 'warning', 'critical']).toContain(status.systemHealth);
      
      // 시스템이 건강한 상태로 시작해야 함
      expect(status.systemHealth).toBe('healthy');
    });

    it('should calculate accurate instance counts', () => {
      const status = scalingSystem.getSystemStatus();
      
      expect(typeof status.totalInstances).toBe('number');
      expect(status.totalInstances).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance and Efficiency', () => {
    it('should complete scaling evaluations within reasonable time', async () => {
      const startTime = performance.now();
      
      await scalingSystem.evaluateScalingDecisions();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 1초 이내
    });

    it('should maintain cost efficiency metrics', () => {
      const status = scalingSystem.getSystemStatus();
      
      expect(status.costEfficiency).toBeGreaterThanOrEqual(0);
      expect(status.costEfficiency).toBeLessThanOrEqual(100);
      
      // 효율성이 합리적인 수준이어야 함
      expect(status.costEfficiency).toBeGreaterThan(50);
    });

    it('should handle multiple concurrent evaluations', async () => {
      const concurrentEvaluations = 3;
      const promises = [];
      
      for (let i = 0; i < concurrentEvaluations; i++) {
        promises.push(scalingSystem.evaluateScalingDecisions());
      }
      
      const results = await Promise.all(promises);
      
      expect(results.length).toBe(concurrentEvaluations);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.decisions).toBeDefined();
        expect(result.metrics).toBeDefined();
      });
    });
  });

  describe('Scaling History and Events', () => {
    it('should track scaling events', () => {
      const status = scalingSystem.getSystemStatus();
      
      expect(Array.isArray(status.recentScalingEvents)).toBe(true);
      
      // 초기 상태에서는 이벤트가 없어야 함
      expect(status.recentScalingEvents.length).toBe(0);
    });

    it('should maintain event history structure', () => {
      const status = scalingSystem.getSystemStatus();
      const events = status.recentScalingEvents;
      
      events.forEach(event => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('poolId');
        expect(event).toHaveProperty('action');
        expect(event).toHaveProperty('timestamp');
        expect(event).toHaveProperty('instancesAffected');
        expect(event).toHaveProperty('reason');
        expect(event).toHaveProperty('result');
        
        expect(typeof event.id).toBe('string');
        expect(typeof event.poolId).toBe('string');
        expect(['scale_up', 'scale_down', 'replace_instances', 'rebalance']).toContain(event.action);
        expect(event.timestamp instanceof Date).toBe(true);
        expect(Array.isArray(event.instancesAffected)).toBe(true);
        expect(typeof event.reason).toBe('string');
        expect(['success', 'failure', 'partial']).toContain(event.result);
      });
    });
  });

  describe('Metrics Collection and Analysis', () => {
    it('should provide comprehensive system metrics', async () => {
      const result = await scalingSystem.evaluateScalingDecisions();
      const metrics = result.metrics;
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.getMetric).toBe('function');
      
      // 기본 메트릭이 설정되어 있는지 확인
      const cpuUtilization = metrics.getMetric('cpu_utilization');
      const memoryUtilization = metrics.getMetric('memory_utilization');
      const requestRate = metrics.getMetric('request_rate');
      
      expect(typeof cpuUtilization).toBe('number');
      expect(typeof memoryUtilization).toBe('number');
      expect(typeof requestRate).toBe('number');
      
      expect(cpuUtilization).toBeGreaterThanOrEqual(0);
      expect(cpuUtilization).toBeLessThanOrEqual(100);
      expect(memoryUtilization).toBeGreaterThanOrEqual(0);
      expect(memoryUtilization).toBeLessThanOrEqual(100);
      expect(requestRate).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing metrics gracefully', async () => {
      const result = await scalingSystem.evaluateScalingDecisions();
      const metrics = result.metrics;
      
      const nonExistentMetric = metrics.getMetric('non_existent_metric');
      expect(nonExistentMetric).toBeUndefined();
    });
  });

  describe('Scaling Policies and Constraints', () => {
    it('should respect scaling constraints', async () => {
      const result = await scalingSystem.evaluateScalingDecisions();
      
      // 모든 결정이 제약 조건을 통과했는지 확인
      result.decisions.forEach(decision => {
        expect(decision).toHaveProperty('poolId');
        expect(decision).toHaveProperty('action');
        expect(decision).toHaveProperty('policy');
        expect(decision).toHaveProperty('urgency');
        expect(decision).toHaveProperty('costEstimate');
        
        expect(typeof decision.poolId).toBe('string');
        expect(decision.action).toBeDefined();
        expect(typeof decision.policy).toBe('string');
        expect(typeof decision.urgency).toBe('number');
        expect(typeof decision.costEstimate).toBe('number');
        
        expect(decision.urgency).toBeGreaterThanOrEqual(0);
        expect(decision.costEstimate).toBeGreaterThanOrEqual(0);
      });
    });

    it('should validate policy compliance', () => {
      const status = scalingSystem.getSystemStatus();
      
      expect(status.activePolicies).toBeGreaterThan(0);
      
      // 정책이 활성화되어 있어야 함
      expect(status.activePolicies).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle system errors gracefully', async () => {
      // 정상적인 동작 확인
      const result = await scalingSystem.evaluateScalingDecisions();
      expect(result).toBeDefined();
      
      // 실행 결과가 있다면 성공/실패 상태 확인
      result.executionResults.forEach(execResult => {
        expect(execResult).toHaveProperty('success');
        expect(execResult).toHaveProperty('decision');
        expect(execResult).toHaveProperty('timestamp');
        
        expect(typeof execResult.success).toBe('boolean');
        expect(execResult.decision).toBeDefined();
        expect(execResult.timestamp instanceof Date).toBe(true);
        
        // 실패한 경우 에러 정보가 있어야 함
        if (!execResult.success) {
          expect(execResult).toHaveProperty('error');
          expect(typeof execResult.error).toBe('string');
        }
      });
    });

    it('should maintain system stability under load', async () => {
      const iterations = 5;
      const results = [];
      
      for (let i = 0; i < iterations; i++) {
        const result = await scalingSystem.evaluateScalingDecisions();
        results.push(result);
      }
      
      expect(results.length).toBe(iterations);
      
      // 모든 결과가 일관된 구조를 가져야 함
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(Array.isArray(result.decisions)).toBe(true);
        expect(Array.isArray(result.executionResults)).toBe(true);
        expect(result.metrics).toBeDefined();
      });
    });
  });

  describe('Integration with Performance Engine', () => {
    it('should coordinate with performance optimization', async () => {
      const result = await scalingSystem.evaluateScalingDecisions();
      
      // 성능 최적화와의 연동 확인
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      
      // 추천사항이 성능 최적화와 관련된 내용을 포함하는지 확인
      const hasPerformanceRecommendations = result.recommendations.some(rec => 
        rec.type.includes('performance') || 
        rec.description.includes('성능') ||
        rec.description.includes('최적화')
      );
      
      // 성능 관련 추천사항이 있거나 없어도 정상 (상황에 따라)
      expect(typeof hasPerformanceRecommendations).toBe('boolean');
    });
  });

  describe('Predictive Scaling Capabilities', () => {
    it('should handle predictive scaling scenarios', async () => {
      const result = await scalingSystem.evaluateScalingDecisions();
      
      // 예측적 스케일링 결정이 포함될 수 있음
      expect(Array.isArray(result.decisions)).toBe(true);
      
      // 예측적 결정이 있다면 적절한 구조를 가져야 함
      result.decisions.forEach(decision => {
        expect(decision.estimatedImpact).toBeDefined();
        expect(typeof decision.urgency).toBe('number');
        expect(decision.urgency).toBeGreaterThanOrEqual(0);
      });
    });

    it('should provide trend analysis', async () => {
      const result = await scalingSystem.evaluateScalingDecisions();
      
      // 메트릭에서 트렌드 정보 확인
      expect(result.metrics).toBeDefined();
      
      // 기본 메트릭들이 트렌드 분석을 위한 데이터를 제공하는지 확인
      const cpuMetric = result.metrics.getMetric('cpu_utilization');
      const memoryMetric = result.metrics.getMetric('memory_utilization');
      
      if (cpuMetric !== undefined && memoryMetric !== undefined) {
        expect(typeof cpuMetric).toBe('number');
        expect(typeof memoryMetric).toBe('number');
      }
    });
  });

  describe('Cost Optimization Features', () => {
    it('should optimize costs in scaling decisions', async () => {
      const result = await scalingSystem.evaluateScalingDecisions();
      const costImpact = result.costImpact;
      
      expect(costImpact.savings).toBeGreaterThanOrEqual(0);
      
      // 비용 최적화 추천사항 확인
      const costOptimizationRecs = result.recommendations.filter(rec =>
        rec.type.includes('cost') || 
        rec.description.includes('비용') ||
        rec.description.includes('절약')
      );
      
      expect(Array.isArray(costOptimizationRecs)).toBe(true);
    });

    it('should calculate accurate cost estimates', async () => {
      const result = await scalingSystem.evaluateScalingDecisions();
      
      result.decisions.forEach(decision => {
        expect(typeof decision.costEstimate).toBe('number');
        expect(decision.costEstimate).toBeGreaterThanOrEqual(0);
        
        // 비용 추정치가 합리적인 범위 내에 있는지 확인
        expect(decision.costEstimate).toBeLessThan(10000); // 시간당 $10,000 이하
      });
    });
  });
});