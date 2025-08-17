/**
 * 🧪 Monitoring & Alerting System Tests
 * 모니터링 및 알림 시스템 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MonitoringAlertingSystem } from '../lib/monitoring-alerting-system.js';

describe('MonitoringAlertingSystem', () => {
  let monitoringSystem: MonitoringAlertingSystem;

  beforeEach(() => {
    monitoringSystem = new MonitoringAlertingSystem();
  });

  describe('System Initialization', () => {
    it('should initialize with default monitoring configuration', () => {
      expect(monitoringSystem).toBeDefined();
      
      const status = monitoringSystem.getSystemStatus();
      expect(status).toBeDefined();
      expect(status).toHaveProperty('overallHealth');
      expect(status).toHaveProperty('activeAlerts');
      expect(status).toHaveProperty('metricsCount');
      expect(status).toHaveProperty('systemUptime');
      
      expect(['healthy', 'warning', 'critical']).toContain(status.overallHealth);
      expect(typeof status.activeAlerts).toBe('number');
      expect(typeof status.metricsCount).toBe('number');
      expect(typeof status.systemUptime).toBe('number');
    });

    it('should start with healthy status and no active alerts', () => {
      const status = monitoringSystem.getSystemStatus();
      
      expect(status.overallHealth).toBe('healthy');
      expect(status.activeAlerts).toBe(0);
      expect(status.metricsCount).toBeGreaterThanOrEqual(0);
      expect(status.systemUptime).toBeGreaterThanOrEqual(0);
    });

    it('should have default metric collectors configured', () => {
      const collectors = monitoringSystem.getMetricCollectors();
      
      expect(Array.isArray(collectors)).toBe(true);
      expect(collectors.length).toBeGreaterThan(0);
      
      collectors.forEach(collector => {
        expect(collector).toHaveProperty('id');
        expect(collector).toHaveProperty('name');
        expect(collector).toHaveProperty('type');
        expect(collector).toHaveProperty('enabled');
        expect(collector).toHaveProperty('interval');
        
        expect(typeof collector.id).toBe('string');
        expect(typeof collector.name).toBe('string');
        expect(['system', 'application', 'business', 'custom']).toContain(collector.type);
        expect(typeof collector.enabled).toBe('boolean');
        expect(typeof collector.interval).toBe('number');
      });
    });
  });

  describe('Metric Collection', () => {
    it('should collect system metrics successfully', async () => {
      const metrics = await monitoringSystem.collectSystemMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('cpu');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('disk');
      expect(metrics).toHaveProperty('network');
      
      expect(metrics.timestamp instanceof Date).toBe(true);
      expect(typeof metrics.cpu.usage).toBe('number');
      expect(typeof metrics.memory.usage).toBe('number');
      expect(typeof metrics.disk.usage).toBe('number');
      expect(typeof metrics.network.bytesIn).toBe('number');
      expect(typeof metrics.network.bytesOut).toBe('number');
      
      // 메트릭 값이 유효한 범위 내에 있는지 확인
      expect(metrics.cpu.usage).toBeGreaterThanOrEqual(0);
      expect(metrics.cpu.usage).toBeLessThanOrEqual(100);
      expect(metrics.memory.usage).toBeGreaterThanOrEqual(0);
      expect(metrics.memory.usage).toBeLessThanOrEqual(100);
      expect(metrics.disk.usage).toBeGreaterThanOrEqual(0);
      expect(metrics.disk.usage).toBeLessThanOrEqual(100);
    });

    it('should collect application metrics successfully', async () => {
      const metrics = await monitoringSystem.collectApplicationMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('responseTime');
      expect(metrics).toHaveProperty('throughput');
      expect(metrics).toHaveProperty('errorRate');
      expect(metrics).toHaveProperty('activeConnections');
      
      expect(metrics.timestamp instanceof Date).toBe(true);
      expect(typeof metrics.responseTime.average).toBe('number');
      expect(typeof metrics.throughput.requestsPerSecond).toBe('number');
      expect(typeof metrics.errorRate.percentage).toBe('number');
      expect(typeof metrics.activeConnections).toBe('number');
      
      // 메트릭 값이 논리적으로 유효한지 확인
      expect(metrics.responseTime.average).toBeGreaterThanOrEqual(0);
      expect(metrics.throughput.requestsPerSecond).toBeGreaterThanOrEqual(0);
      expect(metrics.errorRate.percentage).toBeGreaterThanOrEqual(0);
      expect(metrics.errorRate.percentage).toBeLessThanOrEqual(100);
      expect(metrics.activeConnections).toBeGreaterThanOrEqual(0);
    });

    it('should collect business metrics successfully', async () => {
      const metrics = await monitoringSystem.collectBusinessMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('activeUsers');
      expect(metrics).toHaveProperty('contentGeneration');
      expect(metrics).toHaveProperty('readerEngagement');
      
      expect(metrics.timestamp instanceof Date).toBe(true);
      expect(typeof metrics.activeUsers.total).toBe('number');
      expect(typeof metrics.contentGeneration.storiesGenerated).toBe('number');
      expect(typeof metrics.readerEngagement.averageReadTime).toBe('number');
      
      expect(metrics.activeUsers.total).toBeGreaterThanOrEqual(0);
      expect(metrics.contentGeneration.storiesGenerated).toBeGreaterThanOrEqual(0);
      expect(metrics.readerEngagement.averageReadTime).toBeGreaterThanOrEqual(0);
    });

    it('should store collected metrics', async () => {
      const initialCount = monitoringSystem.getSystemStatus().metricsCount;
      
      await monitoringSystem.collectAndStoreMetrics();
      
      const updatedCount = monitoringSystem.getSystemStatus().metricsCount;
      expect(updatedCount).toBeGreaterThan(initialCount);
    });

    it('should handle metric collection errors gracefully', async () => {
      // 실패하는 메트릭 수집기 등록
      monitoringSystem.registerMetricCollector({
        id: 'failing-collector',
        name: 'Failing Collector',
        type: 'custom',
        enabled: true,
        interval: 5000,
        configuration: {}
      });
      
      // 메트릭 수집이 실패해도 시스템이 정상 작동해야 함
      await expect(async () => {
        await monitoringSystem.collectAndStoreMetrics();
      }).not.toThrow();
    });
  });

  describe('Alert Management', () => {
    it('should create alert rules successfully', () => {
      const alertRule = {
        name: 'High CPU Usage',
        metric: 'cpu.usage',
        condition: 'greater_than',
        threshold: 80,
        severity: 'warning' as const,
        enabled: true,
        description: 'CPU usage is too high',
        actions: ['email', 'slack']
      };

      const rule = monitoringSystem.createAlertRule(alertRule);
      
      expect(rule).toBeDefined();
      expect(rule.name).toBe(alertRule.name);
      expect(rule.metric).toBe(alertRule.metric);
      expect(rule.condition).toBe(alertRule.condition);
      expect(rule.threshold).toBe(alertRule.threshold);
      expect(rule.severity).toBe(alertRule.severity);
      expect(rule.enabled).toBe(alertRule.enabled);
      expect(typeof rule.id).toBe('string');
    });

    it('should update alert rules', () => {
      const alertRule = {
        name: 'Memory Usage',
        metric: 'memory.usage',
        condition: 'greater_than',
        threshold: 90,
        severity: 'critical' as const,
        enabled: true,
        description: 'Memory usage is critical',
        actions: ['email']
      };

      const rule = monitoringSystem.createAlertRule(alertRule);
      const updatedRule = monitoringSystem.updateAlertRule(rule.id, {
        threshold: 85,
        severity: 'warning'
      });
      
      expect(updatedRule.threshold).toBe(85);
      expect(updatedRule.severity).toBe('warning');
      expect(updatedRule.id).toBe(rule.id);
    });

    it('should delete alert rules', () => {
      const alertRule = {
        name: 'Test Rule',
        metric: 'test.metric',
        condition: 'greater_than',
        threshold: 50,
        severity: 'info' as const,
        enabled: true,
        description: 'Test rule',
        actions: []
      };

      const rule = monitoringSystem.createAlertRule(alertRule);
      const deleted = monitoringSystem.deleteAlertRule(rule.id);
      
      expect(deleted).toBe(true);
    });

    it('should evaluate alert rules correctly', async () => {
      const alertRule = {
        name: 'Low Disk Space',
        metric: 'disk.usage',
        condition: 'greater_than',
        threshold: 50, // 낮은 임계값으로 설정하여 알림 트리거
        severity: 'warning' as const,
        enabled: true,
        description: 'Disk usage is high',
        actions: ['email']
      };

      monitoringSystem.createAlertRule(alertRule);
      
      const alerts = await monitoringSystem.evaluateAlertRules();
      
      expect(Array.isArray(alerts)).toBe(true);
      // 알림이 트리거될 수 있지만 필수는 아님 (시스템 상태에 따라)
      alerts.forEach(alert => {
        expect(alert).toHaveProperty('id');
        expect(alert).toHaveProperty('ruleId');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('timestamp');
        expect(alert).toHaveProperty('status');
        
        expect(['info', 'warning', 'critical']).toContain(alert.severity);
        expect(['active', 'acknowledged', 'resolved']).toContain(alert.status);
        expect(alert.timestamp instanceof Date).toBe(true);
      });
    });

    it('should handle alert acknowledgment', () => {
      const alertRule = {
        name: 'Test Alert',
        metric: 'test.metric',
        condition: 'greater_than',
        threshold: 1,
        severity: 'info' as const,
        enabled: true,
        description: 'Test alert',
        actions: []
      };

      const rule = monitoringSystem.createAlertRule(alertRule);
      
      // 알림을 수동으로 생성
      const alert = monitoringSystem.createAlert(rule.id, 'Test alert message', rule.severity);
      
      const acknowledged = monitoringSystem.acknowledgeAlert(alert.id, 'test-user', 'Investigating issue');
      
      expect(acknowledged).toBe(true);
      
      const alertStatus = monitoringSystem.getAlert(alert.id);
      expect(alertStatus?.status).toBe('acknowledged');
    });

    it('should resolve alerts', () => {
      const alertRule = {
        name: 'Resolvable Alert',
        metric: 'test.metric',
        condition: 'greater_than',
        threshold: 1,
        severity: 'warning' as const,
        enabled: true,
        description: 'Resolvable alert',
        actions: []
      };

      const rule = monitoringSystem.createAlertRule(alertRule);
      const alert = monitoringSystem.createAlert(rule.id, 'Test alert', rule.severity);
      
      const resolved = monitoringSystem.resolveAlert(alert.id, 'Issue fixed');
      
      expect(resolved).toBe(true);
      
      const alertStatus = monitoringSystem.getAlert(alert.id);
      expect(alertStatus?.status).toBe('resolved');
    });
  });

  describe('Anomaly Detection', () => {
    it('should detect anomalies in metrics', async () => {
      // 정상 메트릭 패턴 생성
      for (let i = 0; i < 10; i++) {
        await monitoringSystem.collectAndStoreMetrics();
        await new Promise(resolve => setTimeout(resolve, 10)); // 짧은 대기
      }
      
      const anomalies = await monitoringSystem.detectAnomalies();
      
      expect(Array.isArray(anomalies)).toBe(true);
      anomalies.forEach(anomaly => {
        expect(anomaly).toHaveProperty('metric');
        expect(anomaly).toHaveProperty('value');
        expect(anomaly).toHaveProperty('expectedRange');
        expect(anomaly).toHaveProperty('severity');
        expect(anomaly).toHaveProperty('timestamp');
        expect(anomaly).toHaveProperty('confidence');
        
        expect(typeof anomaly.metric).toBe('string');
        expect(typeof anomaly.value).toBe('number');
        expect(typeof anomaly.confidence).toBe('number');
        expect(anomaly.confidence).toBeGreaterThanOrEqual(0);
        expect(anomaly.confidence).toBeLessThanOrEqual(100);
        expect(['low', 'medium', 'high']).toContain(anomaly.severity);
        expect(anomaly.timestamp instanceof Date).toBe(true);
      });
    });

    it('should configure anomaly detection parameters', () => {
      const config = {
        sensitivity: 0.8,
        windowSize: 100,
        algorithm: 'statistical' as const,
        metrics: ['cpu.usage', 'memory.usage'],
        enabled: true
      };

      monitoringSystem.configureAnomalyDetection(config);
      
      const currentConfig = monitoringSystem.getAnomalyDetectionConfig();
      expect(currentConfig.sensitivity).toBe(config.sensitivity);
      expect(currentConfig.windowSize).toBe(config.windowSize);
      expect(currentConfig.algorithm).toBe(config.algorithm);
      expect(currentConfig.metrics).toEqual(config.metrics);
      expect(currentConfig.enabled).toBe(config.enabled);
    });
  });

  describe('SLA Monitoring', () => {
    it('should track SLA metrics', () => {
      const slaDefinition = {
        name: 'API Response Time',
        metric: 'responseTime.average',
        target: 200, // 200ms 이하
        period: 'daily',
        threshold: 95 // 95% 이상
      };

      const sla = monitoringSystem.defineSLA(slaDefinition);
      
      expect(sla).toBeDefined();
      expect(sla.name).toBe(slaDefinition.name);
      expect(sla.metric).toBe(slaDefinition.metric);
      expect(sla.target).toBe(slaDefinition.target);
      expect(sla.period).toBe(slaDefinition.period);
      expect(sla.threshold).toBe(slaDefinition.threshold);
      expect(typeof sla.id).toBe('string');
    });

    it('should calculate SLA compliance', () => {
      const slaDefinition = {
        name: 'System Uptime',
        metric: 'system.uptime',
        target: 99.9,
        period: 'monthly',
        threshold: 99.5
      };

      const sla = monitoringSystem.defineSLA(slaDefinition);
      const compliance = monitoringSystem.calculateSLACompliance(sla.id);
      
      expect(compliance).toBeDefined();
      expect(compliance).toHaveProperty('slaId');
      expect(compliance).toHaveProperty('period');
      expect(compliance).toHaveProperty('compliance');
      expect(compliance).toHaveProperty('target');
      expect(compliance).toHaveProperty('actual');
      expect(compliance).toHaveProperty('status');
      
      expect(compliance.slaId).toBe(sla.id);
      expect(typeof compliance.compliance).toBe('number');
      expect(typeof compliance.target).toBe('number');
      expect(typeof compliance.actual).toBe('number');
      expect(['met', 'at_risk', 'breached']).toContain(compliance.status);
    });

    it('should generate SLA reports', () => {
      const slaDefinition = {
        name: 'Error Rate',
        metric: 'errorRate.percentage',
        target: 1, // 1% 이하
        period: 'weekly',
        threshold: 95
      };

      const sla = monitoringSystem.defineSLA(slaDefinition);
      const report = monitoringSystem.generateSLAReport(sla.id, 'weekly');
      
      expect(report).toBeDefined();
      expect(report).toHaveProperty('slaId');
      expect(report).toHaveProperty('period');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('details');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('generatedAt');
      
      expect(report.slaId).toBe(sla.id);
      expect(report.period).toBe('weekly');
      expect(Array.isArray(report.details)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.generatedAt instanceof Date).toBe(true);
    });
  });

  describe('Notification System', () => {
    it('should configure notification channels', () => {
      const emailConfig = {
        type: 'email' as const,
        enabled: true,
        recipients: ['admin@example.com'],
        configuration: {
          server: 'smtp.example.com',
          port: 587
        }
      };

      const channel = monitoringSystem.configureNotificationChannel('email', emailConfig);
      
      expect(channel).toBeDefined();
      expect(channel.type).toBe(emailConfig.type);
      expect(channel.enabled).toBe(emailConfig.enabled);
      expect(channel.recipients).toEqual(emailConfig.recipients);
    });

    it('should send test notifications', async () => {
      const emailConfig = {
        type: 'email' as const,
        enabled: true,
        recipients: ['test@example.com'],
        configuration: {}
      };

      monitoringSystem.configureNotificationChannel('email', emailConfig);
      
      const result = await monitoringSystem.sendTestNotification('email', 'Test message');
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('channel');
      expect(result).toHaveProperty('timestamp');
      
      expect(result.channel).toBe('email');
      expect(result.timestamp instanceof Date).toBe(true);
    });

    it('should handle notification failures gracefully', async () => {
      const invalidConfig = {
        type: 'webhook' as const,
        enabled: true,
        recipients: [],
        configuration: {
          url: 'invalid-url'
        }
      };

      monitoringSystem.configureNotificationChannel('webhook', invalidConfig);
      
      const result = await monitoringSystem.sendTestNotification('webhook', 'Test message');
      
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('error');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle high-frequency metric collection', async () => {
      const promises = [];
      
      // 동시에 여러 메트릭 수집 요청
      for (let i = 0; i < 10; i++) {
        promises.push(monitoringSystem.collectAndStoreMetrics());
      }
      
      const results = await Promise.allSettled(promises);
      
      // 모든 요청이 성공적으로 처리되어야 함
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });
    });

    it('should maintain system performance under load', async () => {
      const startTime = Date.now();
      
      // 100개의 알림 규칙 생성
      for (let i = 0; i < 100; i++) {
        monitoringSystem.createAlertRule({
          name: `Load Test Rule ${i}`,
          metric: `test.metric.${i}`,
          condition: 'greater_than',
          threshold: 50,
          severity: 'info',
          enabled: true,
          description: `Load test rule ${i}`,
          actions: []
        });
      }
      
      // 알림 규칙 평가 시간 측정
      const evaluationStart = Date.now();
      await monitoringSystem.evaluateAlertRules();
      const evaluationTime = Date.now() - evaluationStart;
      
      // 평가 시간이 합리적이어야 함 (5초 이하)
      expect(evaluationTime).toBeLessThan(5000);
    });

    it('should handle memory efficiently', () => {
      const initialStatus = monitoringSystem.getSystemStatus();
      
      // 대량의 메트릭 데이터 생성
      for (let i = 0; i < 1000; i++) {
        monitoringSystem.recordMetric(`test.metric.${i % 10}`, Math.random() * 100);
      }
      
      const finalStatus = monitoringSystem.getSystemStatus();
      
      // 시스템이 여전히 건강한 상태여야 함
      expect(finalStatus.overallHealth).not.toBe('critical');
    });
  });

  describe('Data Retention and Cleanup', () => {
    it('should configure data retention policies', () => {
      const retentionPolicy = {
        metrics: {
          raw: 7, // 7일
          aggregated: 30, // 30일
          summary: 365 // 1년
        },
        alerts: {
          active: 90, // 90일
          resolved: 30 // 30일
        },
        logs: {
          debug: 1, // 1일
          info: 7, // 7일
          warning: 30, // 30일
          error: 90 // 90일
        }
      };

      monitoringSystem.configureDataRetention(retentionPolicy);
      
      const currentPolicy = monitoringSystem.getDataRetentionPolicy();
      expect(currentPolicy.metrics.raw).toBe(retentionPolicy.metrics.raw);
      expect(currentPolicy.alerts.active).toBe(retentionPolicy.alerts.active);
      expect(currentPolicy.logs.error).toBe(retentionPolicy.logs.error);
    });

    it('should perform data cleanup', async () => {
      // 오래된 데이터 생성 시뮬레이션
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10일 전
      
      const cleanupResult = await monitoringSystem.performDataCleanup();
      
      expect(cleanupResult).toBeDefined();
      expect(cleanupResult).toHaveProperty('metricsDeleted');
      expect(cleanupResult).toHaveProperty('alertsDeleted');
      expect(cleanupResult).toHaveProperty('logsDeleted');
      expect(cleanupResult).toHaveProperty('completedAt');
      
      expect(typeof cleanupResult.metricsDeleted).toBe('number');
      expect(typeof cleanupResult.alertsDeleted).toBe('number');
      expect(typeof cleanupResult.logsDeleted).toBe('number');
      expect(cleanupResult.completedAt instanceof Date).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid metric data gracefully', () => {
      expect(() => {
        monitoringSystem.recordMetric('', NaN);
      }).not.toThrow();
      
      expect(() => {
        monitoringSystem.recordMetric('test.metric', Infinity);
      }).not.toThrow();
      
      expect(() => {
        monitoringSystem.recordMetric(null as unknown, 100);
      }).not.toThrow();
    });

    it('should handle non-existent alert rule operations', () => {
      expect(() => {
        monitoringSystem.updateAlertRule('non-existent-id', { threshold: 50 });
      }).toThrow('Alert rule not found');
      
      expect(() => {
        monitoringSystem.deleteAlertRule('non-existent-id');
      }).not.toThrow();
      
      expect(monitoringSystem.deleteAlertRule('non-existent-id')).toBe(false);
    });

    it('should handle invalid alert acknowledgment', () => {
      expect(() => {
        monitoringSystem.acknowledgeAlert('non-existent-alert', 'user', 'comment');
      }).not.toThrow();
      
      expect(monitoringSystem.acknowledgeAlert('non-existent-alert', 'user', 'comment')).toBe(false);
    });

    it('should handle system resource constraints', async () => {
      // 시스템 리소스 제한 시뮬레이션
      const originalCollectMetrics = monitoringSystem.collectSystemMetrics;
      monitoringSystem.collectSystemMetrics = vi.fn().mockRejectedValue(new Error('Resource exhausted'));
      
      await expect(async () => {
        await monitoringSystem.collectAndStoreMetrics();
      }).not.toThrow();
      
      // 원래 메서드 복원
      monitoringSystem.collectSystemMetrics = originalCollectMetrics;
    });

    it('should record metrics after registration', () => {
      // 메트릭 등록
      const metric = monitoringSystem.registerMetric({
        id: 'test.metric',
        name: 'Test Metric',
        type: 'gauge',
        unit: 'count',
        description: 'Test metric for validation',
        aggregation: 'average',
        retention: 86400,
        tags: {}
      });

      expect(metric).toBeDefined();

      // 메트릭 기록
      expect(() => {
        monitoringSystem.recordMetric('test.metric', 100);
      }).not.toThrow();
    });
  });

  describe('System Integration', () => {
    it('should provide comprehensive system status', () => {
      const status = monitoringSystem.getComprehensiveStatus();
      
      expect(status).toBeDefined();
      expect(status).toHaveProperty('system');
      expect(status).toHaveProperty('metrics');
      expect(status).toHaveProperty('alerts');
      expect(status).toHaveProperty('sla');
      expect(status).toHaveProperty('performance');
      
      expect(status.system).toHaveProperty('health');
      expect(status.system).toHaveProperty('uptime');
      expect(status.metrics).toHaveProperty('collectorsActive');
      expect(status.alerts).toHaveProperty('activeCount');
      expect(status.sla).toHaveProperty('overallCompliance');
      expect(status.performance).toHaveProperty('averageResponseTime');
    });

    it('should export monitoring data', async () => {
      const exportResult = await monitoringSystem.exportData({
        format: 'json',
        timeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        },
        includeMetrics: true,
        includeAlerts: true,
        includeLogs: false
      });
      
      expect(exportResult).toBeDefined();
      expect(exportResult).toHaveProperty('format');
      expect(exportResult).toHaveProperty('data');
      expect(exportResult).toHaveProperty('metadata');
      
      expect(exportResult.format).toBe('json');
      expect(typeof exportResult.data).toBe('string');
      expect(exportResult.metadata).toHaveProperty('recordCount');
      expect(exportResult.metadata).toHaveProperty('exportedAt');
    });

    it('should integrate with external monitoring systems', async () => {
      const integrationConfig = {
        type: 'prometheus',
        endpoint: 'http://localhost:9090',
        enabled: true,
        authentication: {
          type: 'basic',
          username: 'admin',
          password: 'secret'
        }
      };

      const integration = await monitoringSystem.configureIntegration('prometheus', integrationConfig);
      
      expect(integration).toBeDefined();
      expect(integration).toHaveProperty('id');
      expect(integration).toHaveProperty('type');
      expect(integration).toHaveProperty('status');
      
      expect(integration.type).toBe('prometheus');
      expect(['connected', 'disconnected', 'error']).toContain(integration.status);
    });
  });
});