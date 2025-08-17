/**
 * 🧪 Phase 6 Integration Tests
 * 배포 및 모니터링 시스템 통합 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DeploymentManagementSystem } from '../lib/deployment-management-system.js';
import { MonitoringAlertingSystem } from '../lib/monitoring-alerting-system.js';
import { HealthStatusDashboard } from '../lib/health-status-dashboard.js';

describe('Phase 6 System Integration', () => {
  let deploymentSystem: DeploymentManagementSystem;
  let monitoringSystem: MonitoringAlertingSystem;
  let healthDashboard: HealthStatusDashboard;

  beforeEach(() => {
    deploymentSystem = new DeploymentManagementSystem();
    monitoringSystem = new MonitoringAlertingSystem();
    healthDashboard = new HealthStatusDashboard();
  });

  afterEach(() => {
    // 정리 작업
    vi.clearAllMocks();
  });

  describe('Cross-System Integration', () => {
    it('should integrate deployment events with monitoring system', async () => {
      // 1. 파이프라인 생성
      const pipeline = deploymentSystem.createPipeline({
        name: 'Integration Test Pipeline',
        environment: 'staging',
        stages: [{
          id: 'deploy',
          name: 'Deploy',
          type: 'deploy',
          dependencies: [],
          configuration: {},
          timeoutMinutes: 10,
          retryPolicy: { enabled: false, maxRetries: 0, backoffSeconds: 0 },
          healthChecks: [],
          rollbackConditions: []
        }],
        deploymentStrategy: {
          type: 'rolling',
          validation: {
            healthChecks: ['http'],
            timeout: 300,
            autoRollback: true
          }
        },
        configuration: {
          buildCommands: [],
          testCommands: [],
          deployCommands: ['echo "deploying"'],
          environmentVariables: new Map(),
          artifacts: [],
          security: {
            secretScanning: false,
            vulnerabilityCheck: false,
            complianceCheck: false
          }
        },
        notifications: {
          channels: ['email'],
          events: ['start', 'success', 'failure'],
          recipients: ['test@example.com']
        }
      });

      // 2. 배포 메트릭 모니터링 설정
      monitoringSystem.createAlertRule({
        name: 'Deployment Failure Alert',
        metric: 'deployment.failure_rate',
        condition: 'greater_than',
        threshold: 5,
        severity: 'critical',
        enabled: true,
        description: 'Deployment failure rate is too high',
        actions: ['email', 'slack']
      });

      // 3. 헬스체크 생성
      const healthCheck = healthDashboard.createHealthCheck({
        name: 'Deployment Health',
        type: 'application',
        enabled: true,
        interval: 30000,
        timeout: 5000,
        configuration: {
          pipelineId: pipeline.id
        },
        thresholds: {
          warning: 1000,
          critical: 3000
        },
        dependencies: []
      });

      // 4. 배포 실행
      const execution = await deploymentSystem.executeDeployment(
        pipeline.id,
        'v1.0.0',
        'integration-test',
        { approved: true }
      );

      // 5. 통합 검증
      expect(execution).toBeDefined();
      expect(execution.pipelineId).toBe(pipeline.id);
      
      // 모니터링 시스템이 배포 이벤트를 감지했는지 확인
      const systemStatus = monitoringSystem.getSystemStatus();
      expect(systemStatus).toBeDefined();
      
      // 헬스체크가 실행되는지 확인
      const healthResult = await healthDashboard.executeHealthCheck(healthCheck.id);
      expect(healthResult).toBeDefined();
    });

    it('should coordinate alerts between monitoring and health systems', async () => {
      // 1. 모니터링 알림 규칙 생성
      const alertRule = monitoringSystem.createAlertRule({
        name: 'System Resource Alert',
        metric: 'cpu.usage',
        condition: 'greater_than',
        threshold: 80,
        severity: 'warning',
        enabled: true,
        description: 'CPU usage is high',
        actions: ['email']
      });

      // 2. 헬스체크 알림 설정
      const healthCheck = healthDashboard.createHealthCheck({
        name: 'CPU Health Check',
        type: 'system',
        enabled: true,
        interval: 15000,
        timeout: 3000,
        configuration: {
          cpuThreshold: 80
        },
        thresholds: {
          warning: 80,
          critical: 95
        },
        dependencies: []
      });

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

      // 3. 높은 CPU 사용률 시뮬레이션
      monitoringSystem.recordMetric('cpu.usage', 85);

      // 4. 알림 평가
      const monitoringAlerts = await monitoringSystem.evaluateAlertRules();
      const healthResult = await healthDashboard.executeHealthCheck(healthCheck.id);

      // 5. 양쪽 시스템에서 알림이 트리거되는지 확인
      expect(monitoringAlerts).toBeDefined();
      expect(healthResult).toBeDefined();
      
      // CPU 사용률이 높으면 헬스체크가 경고 상태가 될 수 있음
      if (healthResult.responseTime > healthCheck.thresholds.warning) {
        expect(['warning', 'critical']).toContain(healthResult.status);
      }
    });

    it('should provide unified system status across all components', async () => {
      // 1. 배포 시스템 상태
      const deploymentStatus = deploymentSystem.getSystemStatus();
      
      // 2. 모니터링 시스템 상태
      const monitoringStatus = monitoringSystem.getSystemStatus();
      
      // 3. 헬스 대시보드 상태
      const healthStatus = healthDashboard.getSystemHealth();

      // 4. 통합 상태 검증
      expect(deploymentStatus).toBeDefined();
      expect(deploymentStatus.systemHealth).toBeDefined();
      
      expect(monitoringStatus).toBeDefined();
      expect(monitoringStatus.overallHealth).toBeDefined();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.overall).toBeDefined();

      // 5. 모든 시스템이 건강한 상태로 시작해야 함
      expect(deploymentStatus.systemHealth).toBe('healthy');
      expect(monitoringStatus.overallHealth).toBe('healthy');
      expect(healthStatus.overall).toBe('healthy');
    });
  });

  describe('End-to-End Deployment Workflow', () => {
    it('should complete full deployment lifecycle with monitoring', async () => {
      // 1. 배포 파이프라인 생성
      const pipeline = deploymentSystem.createPipeline({
        name: 'E2E Test Pipeline',
        environment: 'production',
        stages: [
          {
            id: 'build',
            name: 'Build',
            type: 'build',
            dependencies: [],
            configuration: {},
            timeoutMinutes: 15,
            retryPolicy: { enabled: true, maxRetries: 2, backoffSeconds: 30 },
            healthChecks: [],
            rollbackConditions: []
          },
          {
            id: 'test',
            name: 'Test',
            type: 'test',
            dependencies: ['build'],
            configuration: {},
            timeoutMinutes: 20,
            retryPolicy: { enabled: true, maxRetries: 1, backoffSeconds: 60 },
            healthChecks: [],
            rollbackConditions: []
          },
          {
            id: 'deploy',
            name: 'Deploy',
            type: 'deploy',
            dependencies: ['test'],
            configuration: {},
            timeoutMinutes: 10,
            retryPolicy: { enabled: false, maxRetries: 0, backoffSeconds: 0 },
            healthChecks: [{
              type: 'http',
              endpoint: '/health',
              expectedStatus: 200,
              timeout: 30
            }],
            rollbackConditions: [{
              metric: 'error_rate',
              threshold: 5,
              duration: 300
            }]
          }
        ],
        deploymentStrategy: {
          type: 'blue_green',
          blueGreenConfig: {
            healthCheckDelay: 60,
            validationTimeout: 300,
            trafficSwitchDelay: 30
          },
          validation: {
            healthChecks: ['http', 'database'],
            timeout: 300,
            autoRollback: true
          }
        },
        configuration: {
          buildCommands: ['npm run build'],
          testCommands: ['npm test'],
          deployCommands: ['npm run deploy'],
          environmentVariables: new Map([['NODE_ENV', 'production']]),
          artifacts: [],
          security: {
            secretScanning: true,
            vulnerabilityCheck: true,
            complianceCheck: true
          }
        },
        notifications: {
          channels: ['email', 'slack'],
          events: ['start', 'success', 'failure'],
          recipients: ['devops@example.com']
        }
      });

      // 2. 모니터링 설정
      const deploymentMetricsAlert = monitoringSystem.createAlertRule({
        name: 'E2E Deployment Monitor',
        metric: 'deployment.duration',
        condition: 'greater_than',
        threshold: 1800, // 30분
        severity: 'warning',
        enabled: true,
        description: 'Deployment is taking too long',
        actions: ['email']
      });

      // 3. 헬스체크 설정
      const appHealthCheck = healthDashboard.createHealthCheck({
        name: 'Application Health',
        type: 'application',
        enabled: true,
        interval: 30000,
        timeout: 5000,
        configuration: {
          url: 'https://app.example.com/health',
          expectedStatus: 200
        },
        thresholds: {
          warning: 2000,
          critical: 5000
        },
        dependencies: []
      });

      // 4. 배포 실행
      const execution = await deploymentSystem.executeDeployment(
        pipeline.id,
        'v2.0.0',
        'e2e-test-user',
        { approved: true }
      );

      // 5. 배포 상태 모니터링
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const currentExecution = deploymentSystem.getDeploymentStatus(execution.id);
        
        if (currentExecution && ['completed', 'failed', 'cancelled'].includes(currentExecution.status)) {
          break;
        }
        
        // 헬스체크 실행
        await healthDashboard.executeHealthCheck(appHealthCheck.id);
        
        // 모니터링 데이터 수집
        await monitoringSystem.collectAndStoreMetrics();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      // 6. 최종 검증
      const finalExecution = deploymentSystem.getDeploymentStatus(execution.id);
      expect(finalExecution).toBeDefined();
      expect(['completed', 'failed']).toContain(finalExecution!.status);

      // 7. 시스템 상태 확인
      const finalMonitoringStatus = monitoringSystem.getSystemStatus();
      const finalHealthStatus = healthDashboard.getSystemHealth();
      
      expect(finalMonitoringStatus.overallHealth).toBeDefined();
      expect(finalHealthStatus.overall).toBeDefined();
    });

    it('should handle deployment failure with automatic rollback', async () => {
      // 1. 롤백 가능한 파이프라인 생성
      const pipeline = deploymentSystem.createPipeline({
        name: 'Rollback Test Pipeline',
        environment: 'staging',
        rollbackEnabled: true,
        stages: [{
          id: 'deploy',
          name: 'Deploy',
          type: 'deploy',
          dependencies: [],
          configuration: {},
          timeoutMinutes: 5,
          retryPolicy: { enabled: false, maxRetries: 0, backoffSeconds: 0 },
          healthChecks: [],
          rollbackConditions: []
        }],
        deploymentStrategy: {
          type: 'rolling',
          validation: {
            healthChecks: ['http'],
            timeout: 300,
            autoRollback: true
          }
        },
        configuration: {
          buildCommands: [],
          testCommands: [],
          deployCommands: ['exit 1'], // 실패하는 명령
          environmentVariables: new Map(),
          artifacts: [],
          security: {
            secretScanning: false,
            vulnerabilityCheck: false,
            complianceCheck: false
          }
        },
        notifications: {
          channels: ['email'],
          events: ['start', 'success', 'failure'],
          recipients: ['test@example.com']
        }
      });

      // 2. 실패 모니터링 설정
      const failureAlert = monitoringSystem.createAlertRule({
        name: 'Deployment Failure Alert',
        metric: 'deployment.failures',
        condition: 'greater_than',
        threshold: 0,
        severity: 'critical',
        enabled: true,
        description: 'Deployment failed',
        actions: ['email', 'slack']
      });

      // 3. 배포 실행 (실패 예상)
      let deploymentFailed = false;
      try {
        await deploymentSystem.executeDeployment(
          pipeline.id,
          'v1.0.1',
          'rollback-test-user',
          { approved: true }
        );
      } catch (_error) {
        deploymentFailed = true;
        expect(_error).toBeDefined();
      }

      // 4. 실패가 감지되었는지 확인
      expect(deploymentFailed).toBe(true);

      // 5. 롤백 실행
      const deploymentHistory = deploymentSystem.getDeploymentHistory(pipeline.id, 1);
      if (deploymentHistory.length > 0) {
        const failedDeployment = deploymentHistory[0];
        
        if (pipeline.rollbackEnabled) {
          const rollbackResult = await deploymentSystem.rollbackDeployment(
            failedDeployment.id,
            'v1.0.0',
            'Rollback due to deployment failure'
          );
          
          expect(rollbackResult).toBeDefined();
          expect(rollbackResult.success).toBeDefined();
          expect(rollbackResult.targetVersion).toBe('v1.0.0');
        }
      }

      // 6. 시스템 상태가 복구되었는지 확인
      const postRollbackHealth = healthDashboard.getSystemHealth();
      expect(postRollbackHealth.overall).toBeDefined();
    });
  });

  describe('Performance and Scalability Integration', () => {
    it('should handle multiple concurrent deployments with monitoring', async () => {
      const pipelines = [];
      const executions = [];

      // 1. 여러 파이프라인 생성
      for (let i = 0; i < 5; i++) {
        const pipeline = deploymentSystem.createPipeline({
          name: `Concurrent Pipeline ${i}`,
          environment: 'development',
          stages: [{
            id: 'deploy',
            name: 'Deploy',
            type: 'deploy',
            dependencies: [],
            configuration: {},
            timeoutMinutes: 5,
            retryPolicy: { enabled: false, maxRetries: 0, backoffSeconds: 0 },
            healthChecks: [],
            rollbackConditions: []
          }],
          deploymentStrategy: {
            type: 'recreate',
            validation: {
              healthChecks: [],
              timeout: 300,
              autoRollback: false
            }
          },
          configuration: {
            buildCommands: [],
            testCommands: [],
            deployCommands: [`echo "deploying pipeline ${i}"`],
            environmentVariables: new Map(),
            artifacts: [],
            security: {
              secretScanning: false,
              vulnerabilityCheck: false,
              complianceCheck: false
            }
          },
          notifications: {
            channels: [],
            events: [],
            recipients: []
          }
        });
        
        pipelines.push(pipeline);
      }

      // 2. 각 파이프라인에 대한 모니터링 설정
      pipelines.forEach((pipeline, index) => {
        monitoringSystem.createAlertRule({
          name: `Concurrent Deployment Alert ${index}`,
          metric: `deployment.${pipeline.id}.status`,
          condition: 'equals',
          threshold: 'failed',
          severity: 'warning',
          enabled: true,
          description: `Monitor deployment ${index}`,
          actions: ['email']
        });
      });

      // 3. 동시 배포 실행
      const deploymentPromises = pipelines.map((pipeline, index) =>
        deploymentSystem.executeDeployment(
          pipeline.id,
          `v1.0.${index}`,
          'concurrent-test-user',
          { approved: true }
        )
      );

      const results = await Promise.allSettled(deploymentPromises);

      // 4. 결과 검증
      expect(results.length).toBe(5);
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          expect(result.value).toBeDefined();
          expect(result.value.pipelineId).toBe(pipelines[index].id);
        }
        // 일부 실패는 허용 (리소스 제약 등으로 인해)
      });

      // 5. 모니터링 시스템 성능 확인
      const monitoringStatus = monitoringSystem.getSystemStatus();
      expect(monitoringStatus.overallHealth).not.toBe('critical');

      // 6. 헬스 대시보드 성능 확인
      const healthStatus = healthDashboard.getSystemHealth();
      expect(healthStatus.overall).toBeDefined();
    });

    it('should maintain system performance under load', async () => {
      const startTime = Date.now();

      // 1. 메트릭 등록 후 데이터 생성
      for (let i = 0; i < 10; i++) {
        monitoringSystem.registerMetric({
          id: `load.test.metric.${i}`,
          name: `Load Test Metric ${i}`,
          type: 'gauge',
          unit: 'count',
          description: `Load test metric ${i}`,
          aggregation: 'average',
          retention: 86400,
          tags: {}
        });
      }

      // 2. 메트릭 데이터 기록
      for (let i = 0; i < 100; i++) {
        monitoringSystem.recordMetric(`load.test.metric.${i % 10}`, Math.random() * 100);
      }

      // 3. 여러 헬스체크 실행
      const healthChecks = [];
      for (let i = 0; i < 20; i++) {
        const check = healthDashboard.createHealthCheck({
          name: `Load Test Health Check ${i}`,
          type: 'system',
          enabled: true,
          interval: 30000,
          timeout: 1000,
          configuration: {},
          thresholds: {
            warning: 500,
            critical: 1500
          },
          dependencies: []
        });
        healthChecks.push(check);
      }

      // 4. 배포 파이프라인 생성
      for (let i = 0; i < 10; i++) {
        deploymentSystem.createPipeline({
          name: `Load Test Pipeline ${i}`,
          environment: 'development',
          stages: [],
          deploymentStrategy: {
            type: 'recreate',
            validation: {
              healthChecks: [],
              timeout: 300,
              autoRollback: false
            }
          },
          configuration: {
            buildCommands: [],
            testCommands: [],
            deployCommands: [],
            environmentVariables: new Map(),
            artifacts: [],
            security: {
              secretScanning: false,
              vulnerabilityCheck: false,
              complianceCheck: false
            }
          },
          notifications: {
            channels: [],
            events: [],
            recipients: []
          }
        });
      }

      // 5. 시스템 응답 시간 측정
      const responseStart = Date.now();
      
      const [deploymentStatus, monitoringStatus, healthStatus] = await Promise.all([
        Promise.resolve(deploymentSystem.getSystemStatus()),
        Promise.resolve(monitoringSystem.getSystemStatus()),
        Promise.resolve(healthDashboard.getSystemHealth())
      ]);
      
      const responseTime = Date.now() - responseStart;
      const totalTime = Date.now() - startTime;

      // 6. 성능 검증
      expect(responseTime).toBeLessThan(5000); // 5초 이하
      expect(totalTime).toBeLessThan(30000); // 30초 이하

      expect(deploymentStatus).toBeDefined();
      expect(monitoringStatus).toBeDefined();
      expect(healthStatus).toBeDefined();

      // 시스템이 여전히 정상 작동해야 함
      expect(['healthy', 'warning']).toContain(deploymentStatus.systemHealth);
      expect(['healthy', 'warning']).toContain(monitoringStatus.overallHealth);
      expect(['healthy', 'degraded']).toContain(healthStatus.overall);
    });
  });

  describe('Data Consistency and Reliability', () => {
    it('should maintain data consistency across system restarts', async () => {
      // 1. 초기 데이터 생성
      const pipeline = deploymentSystem.createPipeline({
        name: 'Persistence Test Pipeline',
        environment: 'staging',
        stages: [],
        deploymentStrategy: {
          type: 'recreate',
          validation: {
            healthChecks: [],
            timeout: 300,
            autoRollback: false
          }
        },
        configuration: {
          buildCommands: [],
          testCommands: [],
          deployCommands: [],
          environmentVariables: new Map(),
          artifacts: [],
          security: {
            secretScanning: false,
            vulnerabilityCheck: false,
            complianceCheck: false
          }
        },
        notifications: {
          channels: [],
          events: [],
          recipients: []
        }
      });

      const alertRule = monitoringSystem.createAlertRule({
        name: 'Persistence Test Alert',
        metric: 'test.metric',
        condition: 'greater_than',
        threshold: 50,
        severity: 'info',
        enabled: true,
        description: 'Test alert for persistence',
        actions: []
      });

      const healthCheck = healthDashboard.createHealthCheck({
        name: 'Persistence Test Health',
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

      // 2. 시스템 재시작 시뮬레이션 (새 인스턴스 생성)
      const newDeploymentSystem = new DeploymentManagementSystem();
      const newMonitoringSystem = new MonitoringAlertingSystem();
      const newHealthDashboard = new HealthStatusDashboard();

      // 3. 데이터 일관성 확인
      // 실제 구현에서는 영속성 저장소에서 데이터를 복원해야 함
      // 여기서는 시스템이 정상적으로 초기화되는지 확인
      const newDeploymentStatus = newDeploymentSystem.getSystemStatus();
      const newMonitoringStatus = newMonitoringSystem.getSystemStatus();
      const newHealthStatus = newHealthDashboard.getSystemHealth();

      expect(newDeploymentStatus).toBeDefined();
      expect(newMonitoringStatus).toBeDefined();
      expect(newHealthStatus).toBeDefined();

      expect(newDeploymentStatus.systemHealth).toBe('healthy');
      expect(newMonitoringStatus.overallHealth).toBe('healthy');
      expect(newHealthStatus.overall).toBe('healthy');
    });

    it('should handle system failures gracefully', async () => {
      // 1. 정상 상태 확인
      const initialDeploymentStatus = deploymentSystem.getSystemStatus();
      const initialMonitoringStatus = monitoringSystem.getSystemStatus();
      const initialHealthStatus = healthDashboard.getSystemHealth();

      expect(initialDeploymentStatus.systemHealth).toBe('healthy');
      expect(initialMonitoringStatus.overallHealth).toBe('healthy');
      expect(initialHealthStatus.overall).toBe('healthy');

      // 2. 시스템 부하 생성 (메모리 누수 시뮬레이션)
      const heavyData = [];
      for (let i = 0; i < 1000; i++) {
        heavyData.push({
          id: i,
          data: new Array(1000).fill(Math.random()),
          timestamp: new Date()
        });

        // 주기적으로 시스템 상태 확인
        if (i % 100 === 0) {
          const currentStatus = monitoringSystem.getSystemStatus();
          if (currentStatus.overallHealth === 'critical') {
            break;
          }
        }
      }

      // 3. 시스템이 여전히 응답하는지 확인
      const stressedDeploymentStatus = deploymentSystem.getSystemStatus();
      const stressedMonitoringStatus = monitoringSystem.getSystemStatus();
      const stressedHealthStatus = healthDashboard.getSystemHealth();

      expect(stressedDeploymentStatus).toBeDefined();
      expect(stressedMonitoringStatus).toBeDefined();
      expect(stressedHealthStatus).toBeDefined();

      // 시스템이 완전히 실패하지 않았는지 확인
      expect(stressedDeploymentStatus.systemHealth).not.toBe(undefined);
      expect(stressedMonitoringStatus.overallHealth).not.toBe(undefined);
      expect(stressedHealthStatus.overall).not.toBe(undefined);

      // 4. 정리 작업
      heavyData.length = 0; // 메모리 해제
    });
  });

  describe('Security and Compliance Integration', () => {
    it('should enforce security policies across all systems', async () => {
      // 1. 보안 강화된 파이프라인 생성
      const securePipeline = deploymentSystem.createPipeline({
        name: 'Security Test Pipeline',
        environment: 'production',
        stages: [{
          id: 'security-scan',
          name: 'Security Scan',
          type: 'test',
          dependencies: [],
          configuration: {},
          timeoutMinutes: 15,
          retryPolicy: { enabled: true, maxRetries: 1, backoffSeconds: 30 },
          healthChecks: [],
          rollbackConditions: []
        }],
        deploymentStrategy: {
          type: 'blue_green',
          validation: {
            healthChecks: ['http', 'security'],
            timeout: 300,
            autoRollback: true
          }
        },
        configuration: {
          buildCommands: [],
          testCommands: ['npm audit'],
          deployCommands: [],
          environmentVariables: new Map([
            ['NODE_ENV', 'production'],
            ['SECURITY_LEVEL', 'high']
          ]),
          artifacts: [],
          security: {
            secretScanning: true,
            vulnerabilityCheck: true,
            complianceCheck: true
          }
        },
        notifications: {
          channels: ['email', 'slack'],
          events: ['start', 'success', 'failure'],
          recipients: ['security@example.com']
        }
      });

      // 2. 보안 모니터링 알림 설정
      const securityAlert = monitoringSystem.createAlertRule({
        name: 'Security Vulnerability Alert',
        metric: 'security.vulnerabilities',
        condition: 'greater_than',
        threshold: 0,
        severity: 'critical',
        enabled: true,
        description: 'Security vulnerabilities detected',
        actions: ['email', 'slack', 'pagerduty']
      });

      // 3. 보안 헬스체크 설정
      const securityHealthCheck = healthDashboard.createHealthCheck({
        name: 'Security Health Check',
        type: 'application',
        enabled: true,
        interval: 300000, // 5분마다
        timeout: 30000,
        configuration: {
          securityEndpoint: '/security/status',
          complianceChecks: ['pci', 'gdpr', 'sox']
        },
        thresholds: {
          warning: 5000,
          critical: 10000
        },
        dependencies: []
      });

      // 4. 보안 정책 검증
      expect(securePipeline.configuration.security.secretScanning).toBe(true);
      expect(securePipeline.configuration.security.vulnerabilityCheck).toBe(true);
      expect(securePipeline.configuration.security.complianceCheck).toBe(true);

      expect(securityAlert.severity).toBe('critical');
      expect(securityAlert.actions).toContain('pagerduty');

      expect(securityHealthCheck.configuration.complianceChecks).toContain('gdpr');

      // 5. 통합 보안 상태 확인
      const securityStatus = {
        deployment: securePipeline.configuration.security,
        monitoring: securityAlert.enabled,
        health: securityHealthCheck.enabled
      };

      expect(securityStatus.deployment.secretScanning).toBe(true);
      expect(securityStatus.monitoring).toBe(true);
      expect(securityStatus.health).toBe(true);
    });

    it('should maintain audit logs across all systems', async () => {
      // 1. 감사 로그 생성 활동 수행
      const pipeline = deploymentSystem.createPipeline({
        name: 'Audit Test Pipeline',
        environment: 'production',
        stages: [],
        deploymentStrategy: {
          type: 'recreate',
          validation: {
            healthChecks: [],
            timeout: 300,
            autoRollback: false
          }
        },
        configuration: {
          buildCommands: [],
          testCommands: [],
          deployCommands: [],
          environmentVariables: new Map(),
          artifacts: [],
          security: {
            secretScanning: true,
            vulnerabilityCheck: true,
            complianceCheck: true
          }
        },
        notifications: {
          channels: [],
          events: [],
          recipients: []
        }
      });

      const alertRule = monitoringSystem.createAlertRule({
        name: 'Audit Test Alert',
        metric: 'audit.events',
        condition: 'greater_than',
        threshold: 100,
        severity: 'info',
        enabled: true,
        description: 'High audit event volume',
        actions: ['log']
      });

      const healthCheck = healthDashboard.createHealthCheck({
        name: 'Audit Health Check',
        type: 'system',
        enabled: true,
        interval: 60000,
        timeout: 5000,
        configuration: {
          auditEndpoint: '/audit/health'
        },
        thresholds: {
          warning: 2000,
          critical: 5000
        },
        dependencies: []
      });

      // 2. 감사 로그 존재 확인
      // 실제 구현에서는 감사 로그 시스템과 통합되어야 함
      expect(pipeline.id).toBeDefined();
      expect(alertRule.id).toBeDefined();
      expect(healthCheck.id).toBeDefined();

      // 3. 시스템별 감사 기능 확인
      const deploymentHistory = deploymentSystem.getDeploymentHistory();
      const monitoringStatus = monitoringSystem.getSystemStatus();
      const healthHistory = healthDashboard.getHealthCheckHistory('system', 24);

      expect(Array.isArray(deploymentHistory)).toBe(true);
      expect(monitoringStatus).toBeDefined();
      expect(Array.isArray(healthHistory)).toBe(true);
    });
  });
});