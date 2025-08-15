/**
 * 🧪 Health Check & Status Dashboard Tests
 * 헬스체크 및 상태 대시보드 시스템 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthStatusDashboard } from '../lib/health-status-dashboard.js';

describe('HealthStatusDashboard', () => {
  let healthDashboard: HealthStatusDashboard;

  beforeEach(() => {
    healthDashboard = new HealthStatusDashboard();
  });

  describe('System Initialization', () => {
    it('should initialize with default health checks', () => {
      expect(healthDashboard).toBeDefined();
      
      const status = healthDashboard.getSystemHealth();
      expect(status).toBeDefined();
      expect(status).toHaveProperty('overall');
      expect(status).toHaveProperty('components');
      expect(status).toHaveProperty('timestamp');
      expect(status).toHaveProperty('uptime');
      
      expect(['healthy', 'degraded', 'unhealthy']).toContain(status.overall);
      expect(Array.isArray(status.components)).toBe(true);
      expect(status.timestamp instanceof Date).toBe(true);
      expect(typeof status.uptime).toBe('number');
    });

    it('should start with healthy system status', () => {
      const status = healthDashboard.getSystemHealth();
      
      expect(status.overall).toBe('healthy');
      expect(status.uptime).toBeGreaterThanOrEqual(0);
      expect(status.components.length).toBeGreaterThan(0);
    });

    it('should have default health check components', () => {
      const healthChecks = healthDashboard.getHealthChecks();
      
      expect(Array.isArray(healthChecks)).toBe(true);
      expect(healthChecks.length).toBeGreaterThan(0);
      
      healthChecks.forEach(check => {
        expect(check).toHaveProperty('id');
        expect(check).toHaveProperty('name');
        expect(check).toHaveProperty('type');
        expect(check).toHaveProperty('enabled');
        expect(check).toHaveProperty('interval');
        expect(check).toHaveProperty('timeout');
        
        expect(typeof check.id).toBe('string');
        expect(typeof check.name).toBe('string');
        expect(['system', 'application', 'business', 'external']).toContain(check.type);
        expect(typeof check.enabled).toBe('boolean');
        expect(typeof check.interval).toBe('number');
        expect(typeof check.timeout).toBe('number');
      });
    });
  });

  describe('Health Check Management', () => {
    it('should create custom health checks', () => {
      const healthCheckConfig = {
        name: 'Database Connection',
        type: 'external' as const,
        enabled: true,
        interval: 30000,
        timeout: 5000,
        configuration: {
          connectionString: 'postgresql://localhost:5432/test',
          query: 'SELECT 1'
        },
        thresholds: {
          warning: 1000,
          critical: 3000
        },
        dependencies: []
      };

      const healthCheck = healthDashboard.createHealthCheck(healthCheckConfig);
      
      expect(healthCheck).toBeDefined();
      expect(healthCheck.name).toBe(healthCheckConfig.name);
      expect(healthCheck.type).toBe(healthCheckConfig.type);
      expect(healthCheck.enabled).toBe(healthCheckConfig.enabled);
      expect(healthCheck.interval).toBe(healthCheckConfig.interval);
      expect(healthCheck.timeout).toBe(healthCheckConfig.timeout);
      expect(typeof healthCheck.id).toBe('string');
    });

    it('should update health check configuration', () => {
      const healthCheckConfig = {
        name: 'API Endpoint',
        type: 'application' as const,
        enabled: true,
        interval: 15000,
        timeout: 3000,
        configuration: {
          url: 'https://api.example.com/health',
          method: 'GET'
        },
        thresholds: {
          warning: 500,
          critical: 2000
        },
        dependencies: []
      };

      const healthCheck = healthDashboard.createHealthCheck(healthCheckConfig);
      const updatedHealthCheck = healthDashboard.updateHealthCheck(healthCheck.id, {
        interval: 10000,
        enabled: false
      });
      
      expect(updatedHealthCheck.interval).toBe(10000);
      expect(updatedHealthCheck.enabled).toBe(false);
      expect(updatedHealthCheck.id).toBe(healthCheck.id);
    });

    it('should delete health checks', () => {
      const healthCheckConfig = {
        name: 'Temporary Check',
        type: 'system' as const,
        enabled: true,
        interval: 5000,
        timeout: 1000,
        configuration: {},
        thresholds: {
          warning: 100,
          critical: 500
        },
        dependencies: []
      };

      const healthCheck = healthDashboard.createHealthCheck(healthCheckConfig);
      const deleted = healthDashboard.deleteHealthCheck(healthCheck.id);
      
      expect(deleted).toBe(true);
    });

    it('should enable and disable health checks', () => {
      const healthCheckConfig = {
        name: 'Toggle Check',
        type: 'application' as const,
        enabled: true,
        interval: 5000,
        timeout: 1000,
        configuration: {},
        thresholds: {
          warning: 100,
          critical: 500
        },
        dependencies: []
      };

      const healthCheck = healthDashboard.createHealthCheck(healthCheckConfig);
      
      // 비활성화
      healthDashboard.disableHealthCheck(healthCheck.id);
      const disabledCheck = healthDashboard.getHealthCheck(healthCheck.id);
      expect(disabledCheck?.enabled).toBe(false);
      
      // 활성화
      healthDashboard.enableHealthCheck(healthCheck.id);
      const enabledCheck = healthDashboard.getHealthCheck(healthCheck.id);
      expect(enabledCheck?.enabled).toBe(true);
    });
  });

  describe('Health Check Execution', () => {
    it('should execute individual health checks', async () => {
      const healthCheckConfig = {
        name: 'Memory Check',
        type: 'system' as const,
        enabled: true,
        interval: 5000,
        timeout: 1000,
        configuration: {
          memoryThreshold: 80
        },
        thresholds: {
          warning: 70,
          critical: 90
        },
        dependencies: []
      };

      const healthCheck = healthDashboard.createHealthCheck(healthCheckConfig);
      const result = await healthDashboard.executeHealthCheck(healthCheck.id);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('checkId');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('metadata');
      
      expect(result.checkId).toBe(healthCheck.id);
      expect(['healthy', 'warning', 'critical', 'unknown']).toContain(result.status);
      expect(typeof result.responseTime).toBe('number');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.message).toBe('string');
      expect(result.timestamp instanceof Date).toBe(true);
    });

    it('should execute all health checks', async () => {
      const results = await healthDashboard.executeAllHealthChecks();
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach(result => {
        expect(result).toHaveProperty('checkId');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('responseTime');
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('timestamp');
        
        expect(['healthy', 'warning', 'critical', 'unknown']).toContain(result.status);
        expect(typeof result.responseTime).toBe('number');
        expect(result.timestamp instanceof Date).toBe(true);
      });
    });

    it('should handle health check timeouts', async () => {
      const healthCheckConfig = {
        name: 'Timeout Check',
        type: 'external' as const,
        enabled: true,
        interval: 5000,
        timeout: 100, // 매우 짧은 타임아웃
        configuration: {
          url: 'https://httpbin.org/delay/5' // 5초 지연
        },
        thresholds: {
          warning: 50,
          critical: 200
        },
        dependencies: []
      };

      const healthCheck = healthDashboard.createHealthCheck(healthCheckConfig);
      const result = await healthDashboard.executeHealthCheck(healthCheck.id);
      
      expect(result.status).toBe('critical');
      expect(result.message).toContain('timeout');
    });

    it('should handle health check failures gracefully', async () => {
      const healthCheckConfig = {
        name: 'Failing Check',
        type: 'external' as const,
        enabled: true,
        interval: 5000,
        timeout: 3000,
        configuration: {
          url: 'https://non-existent-domain-12345.com'
        },
        thresholds: {
          warning: 1000,
          critical: 3000
        },
        dependencies: []
      };

      const healthCheck = healthDashboard.createHealthCheck(healthCheckConfig);
      const result = await healthDashboard.executeHealthCheck(healthCheck.id);
      
      expect(result.status).toBe('critical');
      expect(result.message).toBeDefined();
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('System Health Aggregation', () => {
    it('should calculate overall system health correctly', async () => {
      // 여러 헬스체크 생성
      const checks = [
        {
          name: 'CPU Check',
          type: 'system' as const,
          enabled: true,
          interval: 5000,
          timeout: 1000,
          configuration: {},
          thresholds: { warning: 70, critical: 90 },
          dependencies: []
        },
        {
          name: 'Memory Check',
          type: 'system' as const,
          enabled: true,
          interval: 5000,
          timeout: 1000,
          configuration: {},
          thresholds: { warning: 80, critical: 95 },
          dependencies: []
        },
        {
          name: 'Disk Check',
          type: 'system' as const,
          enabled: true,
          interval: 5000,
          timeout: 1000,
          configuration: {},
          thresholds: { warning: 85, critical: 95 },
          dependencies: []
        }
      ];

      checks.forEach(config => healthDashboard.createHealthCheck(config));
      
      await healthDashboard.executeAllHealthChecks();
      const health = healthDashboard.getSystemHealth();
      
      expect(health.overall).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.overall);
      expect(health.components.length).toBeGreaterThanOrEqual(checks.length);
    });

    it('should handle degraded system health', async () => {
      // 경고 상태를 발생시키는 헬스체크 생성
      const healthCheckConfig = {
        name: 'Warning Check',
        type: 'application' as const,
        enabled: true,
        interval: 5000,
        timeout: 1000,
        configuration: {
          alwaysWarning: true
        },
        thresholds: {
          warning: 1,
          critical: 1000
        },
        dependencies: []
      };

      healthDashboard.createHealthCheck(healthCheckConfig);
      
      // 모의 결과로 경고 상태 설정
      const mockResult = {
        checkId: 'mock-warning',
        status: 'warning' as const,
        responseTime: 500,
        message: 'System is experiencing some issues',
        timestamp: new Date(),
        metadata: {}
      };

      healthDashboard.recordHealthCheckResult(mockResult);
      
      const health = healthDashboard.getSystemHealth();
      // 시스템에 경고가 있으면 degraded 상태가 될 수 있음
      expect(['healthy', 'degraded']).toContain(health.overall);
    });

    it('should prioritize critical issues in health calculation', async () => {
      // 크리티컬 이슈를 시뮬레이션
      const mockCriticalResult = {
        checkId: 'mock-critical',
        status: 'critical' as const,
        responseTime: 5000,
        message: 'Critical system failure',
        timestamp: new Date(),
        metadata: {}
      };

      healthDashboard.recordHealthCheckResult(mockCriticalResult);
      
      const health = healthDashboard.getSystemHealth();
      expect(health.overall).toBe('unhealthy');
    });
  });

  describe('Dashboard Components', () => {
    it('should provide dashboard data', () => {
      const dashboardData = healthDashboard.getDashboardData();
      
      expect(dashboardData).toBeDefined();
      expect(dashboardData).toHaveProperty('systemHealth');
      expect(dashboardData).toHaveProperty('componentStatus');
      expect(dashboardData).toHaveProperty('recentChecks');
      expect(dashboardData).toHaveProperty('trends');
      expect(dashboardData).toHaveProperty('metrics');
      
      expect(dashboardData.systemHealth).toHaveProperty('overall');
      expect(Array.isArray(dashboardData.componentStatus)).toBe(true);
      expect(Array.isArray(dashboardData.recentChecks)).toBe(true);
      expect(dashboardData.trends).toHaveProperty('healthScore');
      expect(dashboardData.metrics).toHaveProperty('uptime');
    });

    it('should provide health check history', () => {
      const history = healthDashboard.getHealthCheckHistory('system', 24); // 24시간
      
      expect(Array.isArray(history)).toBe(true);
      history.forEach(record => {
        expect(record).toHaveProperty('checkId');
        expect(record).toHaveProperty('status');
        expect(record).toHaveProperty('timestamp');
        expect(record).toHaveProperty('responseTime');
        
        expect(['healthy', 'warning', 'critical', 'unknown']).toContain(record.status);
        expect(record.timestamp instanceof Date).toBe(true);
      });
    });

    it('should calculate health trends', () => {
      // 여러 헬스체크 결과를 시뮬레이션
      const now = new Date();
      const results = [
        {
          checkId: 'trend-test',
          status: 'healthy' as const,
          responseTime: 100,
          message: 'OK',
          timestamp: new Date(now.getTime() - 60000),
          metadata: {}
        },
        {
          checkId: 'trend-test',
          status: 'warning' as const,
          responseTime: 200,
          message: 'Slow',
          timestamp: new Date(now.getTime() - 30000),
          metadata: {}
        },
        {
          checkId: 'trend-test',
          status: 'healthy' as const,
          responseTime: 150,
          message: 'OK',
          timestamp: now,
          metadata: {}
        }
      ];

      results.forEach(result => healthDashboard.recordHealthCheckResult(result));
      
      const trends = healthDashboard.getHealthTrends('trend-test', 1); // 1시간
      
      expect(trends).toBeDefined();
      expect(trends).toHaveProperty('checkId');
      expect(trends).toHaveProperty('timeRange');
      expect(trends).toHaveProperty('healthScore');
      expect(trends).toHaveProperty('averageResponseTime');
      expect(trends).toHaveProperty('statusDistribution');
      expect(trends).toHaveProperty('dataPoints');
      
      expect(trends.checkId).toBe('trend-test');
      expect(typeof trends.healthScore).toBe('number');
      expect(typeof trends.averageResponseTime).toBe('number');
      expect(Array.isArray(trends.dataPoints)).toBe(true);
    });
  });

  describe('Status Page Generation', () => {
    it('should generate public status page data', () => {
      const statusPage = healthDashboard.generateStatusPage();
      
      expect(statusPage).toBeDefined();
      expect(statusPage).toHaveProperty('status');
      expect(statusPage).toHaveProperty('lastUpdated');
      expect(statusPage).toHaveProperty('components');
      expect(statusPage).toHaveProperty('incidents');
      expect(statusPage).toHaveProperty('uptime');
      
      expect(['operational', 'degraded_performance', 'partial_outage', 'major_outage']).toContain(statusPage.status);
      expect(statusPage.lastUpdated instanceof Date).toBe(true);
      expect(Array.isArray(statusPage.components)).toBe(true);
      expect(Array.isArray(statusPage.incidents)).toBe(true);
      expect(typeof statusPage.uptime).toBe('object');
    });

    it('should generate component-specific status', () => {
      const healthCheckConfig = {
        name: 'API Gateway',
        type: 'application' as const,
        enabled: true,
        interval: 5000,
        timeout: 3000,
        configuration: {},
        thresholds: {
          warning: 1000,
          critical: 3000
        },
        dependencies: []
      };

      const healthCheck = healthDashboard.createHealthCheck(healthCheckConfig);
      const componentStatus = healthDashboard.getComponentStatus(healthCheck.id);
      
      expect(componentStatus).toBeDefined();
      expect(componentStatus).toHaveProperty('id');
      expect(componentStatus).toHaveProperty('name');
      expect(componentStatus).toHaveProperty('status');
      expect(componentStatus).toHaveProperty('lastCheck');
      expect(componentStatus).toHaveProperty('uptime');
      expect(componentStatus).toHaveProperty('responseTime');
      
      expect(componentStatus.id).toBe(healthCheck.id);
      expect(componentStatus.name).toBe(healthCheck.name);
      expect(['operational', 'degraded', 'down', 'unknown']).toContain(componentStatus.status);
    });

    it('should track and report incidents', () => {
      const incident = {
        title: 'Database Connection Issues',
        description: 'Experiencing intermittent database connectivity',
        severity: 'medium' as const,
        affectedComponents: ['database', 'api'],
        status: 'investigating' as const
      };

      const createdIncident = healthDashboard.createIncident(incident);
      
      expect(createdIncident).toBeDefined();
      expect(createdIncident.title).toBe(incident.title);
      expect(createdIncident.severity).toBe(incident.severity);
      expect(createdIncident.status).toBe(incident.status);
      expect(typeof createdIncident.id).toBe('string');
      expect(createdIncident.createdAt instanceof Date).toBe(true);
      
      // 인시던트 업데이트
      const updatedIncident = healthDashboard.updateIncident(createdIncident.id, {
        status: 'resolved',
        description: 'Database connectivity has been restored'
      });
      
      expect(updatedIncident.status).toBe('resolved');
      expect(updatedIncident.description).toBe('Database connectivity has been restored');
    });
  });

  describe('Alert Integration', () => {
    it('should configure health check alerts', () => {
      const healthCheckConfig = {
        name: 'Critical Service',
        type: 'application' as const,
        enabled: true,
        interval: 5000,
        timeout: 3000,
        configuration: {},
        thresholds: {
          warning: 1000,
          critical: 3000
        },
        dependencies: []
      };

      const healthCheck = healthDashboard.createHealthCheck(healthCheckConfig);
      
      const alertConfig = {
        checkId: healthCheck.id,
        warningAlert: {
          enabled: true,
          channels: ['email'],
          throttle: 300 // 5분
        },
        criticalAlert: {
          enabled: true,
          channels: ['email', 'slack', 'sms'],
          throttle: 60 // 1분
        }
      };

      const alertRule = healthDashboard.configureHealthAlert(alertConfig);
      
      expect(alertRule).toBeDefined();
      expect(alertRule.checkId).toBe(healthCheck.id);
      expect(alertRule.warningAlert.enabled).toBe(true);
      expect(alertRule.criticalAlert.enabled).toBe(true);
    });

    it('should trigger alerts based on health check results', async () => {
      const healthCheckConfig = {
        name: 'Alert Test Service',
        type: 'application' as const,
        enabled: true,
        interval: 5000,
        timeout: 3000,
        configuration: {},
        thresholds: {
          warning: 100,
          critical: 300
        },
        dependencies: []
      };

      const healthCheck = healthDashboard.createHealthCheck(healthCheckConfig);
      
      // 알림 설정
      healthDashboard.configureHealthAlert({
        checkId: healthCheck.id,
        warningAlert: {
          enabled: true,
          channels: ['email'],
          throttle: 300
        },
        criticalAlert: {
          enabled: true,
          channels: ['email', 'slack'],
          throttle: 60
        }
      });

      // 크리티컬 상태 결과 시뮬레이션
      const criticalResult = {
        checkId: healthCheck.id,
        status: 'critical' as const,
        responseTime: 5000,
        message: 'Service is down',
        timestamp: new Date(),
        metadata: {}
      };

      healthDashboard.recordHealthCheckResult(criticalResult);
      
      const triggeredAlerts = healthDashboard.getTriggeredAlerts(healthCheck.id);
      expect(Array.isArray(triggeredAlerts)).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large numbers of health checks efficiently', async () => {
      const startTime = Date.now();
      
      // 100개의 헬스체크 생성
      for (let i = 0; i < 100; i++) {
        healthDashboard.createHealthCheck({
          name: `Performance Test Check ${i}`,
          type: 'system',
          enabled: true,
          interval: 30000,
          timeout: 5000,
          configuration: {},
          thresholds: {
            warning: 1000,
            critical: 3000
          },
          dependencies: []
        });
      }
      
      // 모든 헬스체크 실행
      const results = await healthDashboard.executeAllHealthChecks();
      const executionTime = Date.now() - startTime;
      
      expect(results.length).toBe(100);
      expect(executionTime).toBeLessThan(10000); // 10초 이하
    });

    it('should manage memory usage with large datasets', () => {
      // 대량의 헬스체크 결과 생성
      for (let i = 0; i < 1000; i++) {
        healthDashboard.recordHealthCheckResult({
          checkId: `load-test-${i % 10}`,
          status: 'healthy',
          responseTime: Math.random() * 1000,
          message: 'OK',
          timestamp: new Date(Date.now() - Math.random() * 86400000),
          metadata: {}
        });
      }
      
      const dashboardData = healthDashboard.getDashboardData();
      expect(dashboardData).toBeDefined();
      
      // 시스템이 여전히 반응해야 함
      const health = healthDashboard.getSystemHealth();
      expect(health).toBeDefined();
    });

    it('should handle concurrent health check executions', async () => {
      const healthChecks = [];
      
      // 여러 헬스체크 생성
      for (let i = 0; i < 20; i++) {
        const check = healthDashboard.createHealthCheck({
          name: `Concurrent Check ${i}`,
          type: 'system',
          enabled: true,
          interval: 5000,
          timeout: 2000,
          configuration: {},
          thresholds: {
            warning: 500,
            critical: 1500
          },
          dependencies: []
        });
        healthChecks.push(check);
      }
      
      // 동시 실행
      const promises = healthChecks.map(check => 
        healthDashboard.executeHealthCheck(check.id)
      );
      
      const results = await Promise.all(promises);
      
      expect(results.length).toBe(20);
      results.forEach(result => {
        expect(result).toHaveProperty('checkId');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('responseTime');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle non-existent health check operations', () => {
      expect(() => {
        healthDashboard.updateHealthCheck('non-existent-id', { interval: 5000 });
      }).toThrow('Health check not found');
      
      expect(() => {
        healthDashboard.deleteHealthCheck('non-existent-id');
      }).not.toThrow();
      
      expect(healthDashboard.deleteHealthCheck('non-existent-id')).toBe(false);
    });

    it('should handle invalid health check configurations', () => {
      expect(() => {
        healthDashboard.createHealthCheck({
          name: '',
          type: 'system',
          enabled: true,
          interval: -1000, // 유효하지 않은 간격
          timeout: 0,
          configuration: {},
          thresholds: {
            warning: -1,
            critical: -1
          },
          dependencies: []
        });
      }).toThrow();
    });

    it('should handle health check execution errors', async () => {
      const healthCheckConfig = {
        name: 'Error Test Check',
        type: 'external' as const,
        enabled: true,
        interval: 5000,
        timeout: 1000,
        configuration: {
          throwError: true
        },
        thresholds: {
          warning: 500,
          critical: 2000
        },
        dependencies: []
      };

      const healthCheck = healthDashboard.createHealthCheck(healthCheckConfig);
      const result = await healthDashboard.executeHealthCheck(healthCheck.id);
      
      expect(result.status).toBe('unknown');
      expect(result.message).toContain('error');
    });

    it('should handle circular dependencies in health checks', () => {
      const checkA = healthDashboard.createHealthCheck({
        name: 'Check A',
        type: 'system',
        enabled: true,
        interval: 5000,
        timeout: 1000,
        configuration: {},
        thresholds: { warning: 100, critical: 500 },
        dependencies: []
      });

      const checkB = healthDashboard.createHealthCheck({
        name: 'Check B',
        type: 'system',
        enabled: true,
        interval: 5000,
        timeout: 1000,
        configuration: {},
        thresholds: { warning: 100, critical: 500 },
        dependencies: [checkA.id]
      });

      // 순환 종속성 생성 시도
      expect(() => {
        healthDashboard.updateHealthCheck(checkA.id, {
          dependencies: [checkB.id]
        });
      }).toThrow('Circular dependency detected');
    });
  });

  describe('Data Export and Reporting', () => {
    it('should export health check data', async () => {
      const exportOptions = {
        format: 'json' as const,
        timeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        },
        includeHistory: true,
        includeMetadata: true
      };

      const exportResult = await healthDashboard.exportHealthData(exportOptions);
      
      expect(exportResult).toBeDefined();
      expect(exportResult).toHaveProperty('format');
      expect(exportResult).toHaveProperty('data');
      expect(exportResult).toHaveProperty('metadata');
      
      expect(exportResult.format).toBe('json');
      expect(typeof exportResult.data).toBe('string');
      expect(exportResult.metadata).toHaveProperty('exportedAt');
      expect(exportResult.metadata).toHaveProperty('recordCount');
    });

    it('should generate health reports', async () => {
      const reportOptions = {
        type: 'summary' as const,
        timeRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        includeCharts: true,
        includeRecommendations: true
      };

      const report = await healthDashboard.generateHealthReport(reportOptions);
      
      expect(report).toBeDefined();
      expect(report).toHaveProperty('type');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('details');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('generatedAt');
      
      expect(report.type).toBe('summary');
      expect(report.summary).toHaveProperty('overallHealth');
      expect(report.summary).toHaveProperty('totalChecks');
      expect(Array.isArray(report.details)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.generatedAt instanceof Date).toBe(true);
    });
  });

  describe('Integration and Configuration', () => {
    it('should integrate with monitoring systems', async () => {
      const integrationConfig = {
        type: 'prometheus' as const,
        endpoint: 'http://localhost:9090/metrics',
        enabled: true,
        authentication: {
          type: 'bearer',
          token: 'test-token'
        },
        exportMetrics: ['response_time', 'status', 'uptime']
      };

      const integration = await healthDashboard.configureIntegration('monitoring', integrationConfig);
      
      expect(integration).toBeDefined();
      expect(integration).toHaveProperty('id');
      expect(integration).toHaveProperty('type');
      expect(integration).toHaveProperty('status');
      
      expect(integration.type).toBe('prometheus');
      expect(['connected', 'disconnected', 'error']).toContain(integration.status);
    });

    it('should configure dashboard settings', () => {
      const dashboardConfig = {
        theme: 'dark' as const,
        refreshInterval: 30000,
        showIncidents: true,
        showMetrics: true,
        defaultTimeRange: '24h' as const,
        alertsEnabled: true,
        publicStatus: {
          enabled: true,
          customDomain: 'status.example.com',
          branding: {
            logo: 'https://example.com/logo.png',
            title: 'Service Status'
          }
        }
      };

      healthDashboard.configureDashboard(dashboardConfig);
      
      const currentConfig = healthDashboard.getDashboardConfig();
      expect(currentConfig.theme).toBe(dashboardConfig.theme);
      expect(currentConfig.refreshInterval).toBe(dashboardConfig.refreshInterval);
      expect(currentConfig.publicStatus.enabled).toBe(dashboardConfig.publicStatus.enabled);
    });
  });
});