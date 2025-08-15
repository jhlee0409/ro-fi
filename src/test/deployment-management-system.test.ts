/**
 * 🧪 Deployment Management System Tests
 * 배포 관리 시스템 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeploymentManagementSystem } from '../lib/deployment-management-system.js';

describe('DeploymentManagementSystem', () => {
  let deploymentSystem: DeploymentManagementSystem;

  beforeEach(() => {
    deploymentSystem = new DeploymentManagementSystem();
  });

  describe('System Initialization', () => {
    it('should initialize with default pipelines and environments', () => {
      expect(deploymentSystem).toBeDefined();
      
      const status = deploymentSystem.getSystemStatus();
      expect(status).toBeDefined();
      expect(status).toHaveProperty('totalPipelines');
      expect(status).toHaveProperty('activeDeployments');
      expect(status).toHaveProperty('totalEnvironments');
      expect(status).toHaveProperty('recentDeployments');
      expect(status).toHaveProperty('systemHealth');
      expect(status).toHaveProperty('lastDeployment');
      
      expect(typeof status.totalPipelines).toBe('number');
      expect(typeof status.activeDeployments).toBe('number');
      expect(typeof status.totalEnvironments).toBe('number');
      expect(typeof status.recentDeployments).toBe('number');
      expect(['healthy', 'warning', 'critical']).toContain(status.systemHealth);
    });

    it('should have default production pipeline', () => {
      const status = deploymentSystem.getSystemStatus();
      
      expect(status.totalPipelines).toBeGreaterThan(0);
      expect(status.totalEnvironments).toBeGreaterThan(0);
      expect(status.systemHealth).toBe('healthy');
    });

    it('should start with no active deployments', () => {
      const status = deploymentSystem.getSystemStatus();
      
      expect(status.activeDeployments).toBe(0);
      expect(status.recentDeployments).toBe(0);
      expect(status.lastDeployment).toBeUndefined();
    });
  });

  describe('Pipeline Management', () => {
    it('should create a new deployment pipeline', () => {
      const pipelineConfig = {
        name: 'Test Pipeline',
        environment: 'staging' as const,
        stages: [
          {
            id: 'build',
            name: 'Build',
            type: 'build' as const,
            dependencies: [],
            configuration: {},
            timeoutMinutes: 15,
            retryPolicy: { enabled: true, maxRetries: 2, backoffSeconds: 30 },
            healthChecks: [],
            rollbackConditions: []
          }
        ],
        deploymentStrategy: {
          type: 'rolling' as const,
          validation: {
            healthChecks: ['http'],
            timeout: 300,
            autoRollback: true
          }
        },
        configuration: {
          buildCommands: ['npm run build'],
          testCommands: ['npm test'],
          deployCommands: ['npm run deploy'],
          environmentVariables: new Map([['NODE_ENV', 'staging']]),
          artifacts: [],
          security: {
            secretScanning: true,
            vulnerabilityCheck: true,
            complianceCheck: true
          }
        },
        notifications: {
          channels: ['email'],
          events: ['start', 'success', 'failure'],
          recipients: ['dev@company.com']
        }
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      
      expect(pipeline).toBeDefined();
      expect(pipeline.name).toBe('Test Pipeline');
      expect(pipeline.environment).toBe('staging');
      expect(pipeline.stages.length).toBe(1);
      expect(pipeline.stages[0].name).toBe('Build');
      expect(typeof pipeline.id).toBe('string');
    });

    it('should update existing pipeline', () => {
      const pipelineConfig = {
        name: 'Original Pipeline',
        environment: 'development' as const,
        stages: [],
        deploymentStrategy: {
          type: 'recreate' as const,
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
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      const updatedPipeline = deploymentSystem.updatePipeline(pipeline.id, {
        name: 'Updated Pipeline'
      });
      
      expect(updatedPipeline.name).toBe('Updated Pipeline');
      expect(updatedPipeline.id).toBe(pipeline.id);
    });

    it('should delete pipeline', () => {
      const pipelineConfig = {
        name: 'Pipeline to Delete',
        environment: 'development' as const,
        stages: [],
        deploymentStrategy: {
          type: 'recreate' as const,
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
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      const deleted = deploymentSystem.deletePipeline(pipeline.id);
      
      expect(deleted).toBe(true);
    });
  });

  describe('Deployment Execution', () => {
    it('should execute deployment successfully', async () => {
      const pipelineConfig = {
        name: 'Simple Pipeline',
        environment: 'staging' as const,
        stages: [
          {
            id: 'deploy',
            name: 'Deploy',
            type: 'deploy' as const,
            dependencies: [],
            configuration: {},
            timeoutMinutes: 10,
            retryPolicy: { enabled: false, maxRetries: 0, backoffSeconds: 0 },
            healthChecks: [],
            rollbackConditions: []
          }
        ],
        deploymentStrategy: {
          type: 'rolling' as const,
          validation: {
            healthChecks: [],
            timeout: 300,
            autoRollback: false
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
          channels: [],
          events: [],
          recipients: []
        }
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      const execution = await deploymentSystem.executeDeployment(
        pipeline.id,
        'v1.0.0',
        'test-user',
        { approved: true }
      );
      
      expect(execution).toBeDefined();
      expect(execution.pipelineId).toBe(pipeline.id);
      expect(execution.version).toBe('v1.0.0');
      expect(execution.initiator).toBe('test-user');
      expect(['pending', 'running', 'completed']).toContain(execution.status);
      expect(execution.startTime).toBeDefined();
      expect(execution.environment).toBe('staging');
      expect(typeof execution.id).toBe('string');
    });

    it('should handle deployment failure gracefully', async () => {
      const pipelineConfig = {
        name: 'Failing Pipeline',
        environment: 'development' as const,
        stages: [],
        deploymentStrategy: {
          type: 'recreate' as const,
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
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      
      // 승인되지 않은 배포는 오류가 발생해야 함
      await expect(async () => {
        await deploymentSystem.executeDeployment(
          pipeline.id,
          'v1.0.0',
          'test-user',
          { approved: false }
        );
      }).rejects.toThrow();
    });

    it('should track deployment status', async () => {
      const pipelineConfig = {
        name: 'Status Pipeline',
        environment: 'development' as const,
        stages: [],
        deploymentStrategy: {
          type: 'recreate' as const,
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
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      const execution = await deploymentSystem.executeDeployment(
        pipeline.id,
        'v1.0.0',
        'test-user',
        { approved: true }
      );
      
      const status = deploymentSystem.getDeploymentStatus(execution.id);
      expect(status).toBeDefined();
      expect(status?.id).toBe(execution.id);
      expect(status?.pipelineId).toBe(pipeline.id);
    });
  });

  describe('Blue-Green Deployment', () => {
    it('should execute blue-green deployment', async () => {
      const pipelineConfig = {
        name: 'Blue-Green Pipeline',
        environment: 'production' as const,
        stages: [],
        deploymentStrategy: {
          type: 'blue_green' as const,
          blueGreenConfig: {
            healthCheckDelay: 60,
            validationTimeout: 300,
            trafficSwitchDelay: 30
          },
          validation: {
            healthChecks: ['http'],
            timeout: 300,
            autoRollback: true
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
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      const execution = await deploymentSystem.executeBlueGreenDeployment(
        pipeline.id,
        'v2.0.0',
        'test-user'
      );
      
      expect(execution).toBeDefined();
      expect(execution.version).toBe('v2.0.0');
      expect(['completed', 'failed']).toContain(execution.status);
      expect(execution.environment).toBe('production');
    });

    it('should handle blue-green deployment with wrong strategy', async () => {
      const pipelineConfig = {
        name: 'Rolling Pipeline',
        environment: 'staging' as const,
        stages: [],
        deploymentStrategy: {
          type: 'rolling' as const,
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
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      
      await expect(async () => {
        await deploymentSystem.executeBlueGreenDeployment(
          pipeline.id,
          'v2.0.0',
          'test-user'
        );
      }).rejects.toThrow('Blue-Green deployment not configured');
    });
  });

  describe('Rollback Functionality', () => {
    it('should perform rollback successfully', async () => {
      const pipelineConfig = {
        name: 'Rollback Pipeline',
        environment: 'staging' as const,
        rollbackEnabled: true,
        stages: [],
        deploymentStrategy: {
          type: 'rolling' as const,
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
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      const execution = await deploymentSystem.executeDeployment(
        pipeline.id,
        'v1.0.0',
        'test-user',
        { approved: true }
      );
      
      const rollbackResult = await deploymentSystem.rollbackDeployment(
        execution.id,
        'v0.9.0',
        'Manual rollback for testing'
      );
      
      expect(rollbackResult).toBeDefined();
      expect(rollbackResult.success).toBeDefined();
      expect(rollbackResult.targetVersion).toBe('v0.9.0');
      expect(rollbackResult.reason).toBe('Manual rollback for testing');
      expect(rollbackResult.rollbackExecution).toBeDefined();
      expect(rollbackResult.validationResult).toBeDefined();
    });

    it('should reject rollback for non-rollback-enabled pipeline', async () => {
      const pipelineConfig = {
        name: 'No Rollback Pipeline',
        environment: 'development' as const,
        rollbackEnabled: false,
        stages: [],
        deploymentStrategy: {
          type: 'recreate' as const,
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
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      const execution = await deploymentSystem.executeDeployment(
        pipeline.id,
        'v1.0.0',
        'test-user',
        { approved: true }
      );
      
      await expect(async () => {
        await deploymentSystem.rollbackDeployment(execution.id);
      }).rejects.toThrow('Rollback is not enabled');
    });
  });

  describe('Deployment Metrics and Analytics', () => {
    it('should generate deployment metrics', () => {
      const now = new Date();
      const timeRange = {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24시간 전
        end: now
      };

      const metrics = deploymentSystem.getDeploymentMetrics(timeRange);
      
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('totalDeployments');
      expect(metrics).toHaveProperty('successRate');
      expect(metrics).toHaveProperty('averageDeployTime');
      expect(metrics).toHaveProperty('failureRate');
      
      expect(typeof metrics.totalDeployments).toBe('number');
      expect(typeof metrics.successRate).toBe('number');
      expect(typeof metrics.averageDeployTime).toBe('number');
      expect(typeof metrics.failureRate).toBe('number');
      
      expect(metrics.totalDeployments).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeLessThanOrEqual(100);
      expect(metrics.averageDeployTime).toBeGreaterThanOrEqual(0);
      expect(metrics.failureRate).toBeGreaterThanOrEqual(0);
      expect(metrics.failureRate).toBeLessThanOrEqual(100);
    });

    it('should retrieve deployment history', () => {
      const history = deploymentSystem.getDeploymentHistory();
      
      expect(Array.isArray(history)).toBe(true);
      
      // 빈 배열이거나 유효한 배포 실행 객체들의 배열이어야 함
      history.forEach(deployment => {
        expect(deployment).toHaveProperty('id');
        expect(deployment).toHaveProperty('pipelineId');
        expect(deployment).toHaveProperty('version');
        expect(deployment).toHaveProperty('initiator');
        expect(deployment).toHaveProperty('status');
        expect(deployment).toHaveProperty('startTime');
        expect(deployment).toHaveProperty('environment');
        
        expect(typeof deployment.id).toBe('string');
        expect(typeof deployment.pipelineId).toBe('string');
        expect(typeof deployment.version).toBe('string');
        expect(typeof deployment.initiator).toBe('string');
        expect(['pending', 'running', 'completed', 'failed', 'rolled_back', 'cancelled']).toContain(deployment.status);
        expect(deployment.startTime instanceof Date).toBe(true);
      });
    });

    it('should filter deployment history by pipeline', () => {
      const pipelineConfig = {
        name: 'History Pipeline',
        environment: 'development' as const,
        stages: [],
        deploymentStrategy: {
          type: 'recreate' as const,
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
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      const history = deploymentSystem.getDeploymentHistory(pipeline.id, 10);
      
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(10);
      
      // 모든 결과가 지정된 파이프라인의 것이어야 함
      history.forEach(deployment => {
        expect(deployment.pipelineId).toBe(pipeline.id);
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle concurrent deployments', async () => {
      const pipelineConfigs = Array.from({ length: 3 }, (_, i) => ({
        name: `Concurrent Pipeline ${i}`,
        environment: 'development' as const,
        stages: [],
        deploymentStrategy: {
          type: 'recreate' as const,
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
      }));

      const pipelines = pipelineConfigs.map(config => deploymentSystem.createPipeline(config));
      
      const deploymentPromises = pipelines.map(pipeline => 
        deploymentSystem.executeDeployment(
          pipeline.id,
          'v1.0.0',
          'test-user',
          { approved: true }
        )
      );

      const executions = await Promise.all(deploymentPromises);
      
      expect(executions.length).toBe(3);
      executions.forEach(execution => {
        expect(execution).toBeDefined();
        expect(typeof execution.id).toBe('string');
      });
    });

    it('should maintain system consistency during operations', async () => {
      const initialStatus = deploymentSystem.getSystemStatus();
      
      const pipelineConfig = {
        name: 'Consistency Pipeline',
        environment: 'development' as const,
        stages: [],
        deploymentStrategy: {
          type: 'recreate' as const,
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
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      
      const afterCreationStatus = deploymentSystem.getSystemStatus();
      expect(afterCreationStatus.totalPipelines).toBe(initialStatus.totalPipelines + 1);
      expect(afterCreationStatus.totalEnvironments).toBe(initialStatus.totalEnvironments);
      expect(afterCreationStatus.systemHealth).toBe('healthy');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid pipeline ID gracefully', async () => {
      await expect(async () => {
        await deploymentSystem.executeDeployment(
          'non-existent-pipeline',
          'v1.0.0',
          'test-user'
        );
      }).rejects.toThrow('Pipeline not found');
    });

    it('should handle invalid deployment execution ID gracefully', () => {
      const status = deploymentSystem.getDeploymentStatus('non-existent-execution');
      expect(status).toBeUndefined();
    });

    it('should handle rollback of non-existent deployment', async () => {
      await expect(async () => {
        await deploymentSystem.rollbackDeployment('non-existent-execution');
      }).rejects.toThrow('Deployment execution not found');
    });

    it('should handle pipeline updates for non-existent pipeline', () => {
      expect(() => {
        deploymentSystem.updatePipeline('non-existent-pipeline', {
          name: 'Updated Name'
        });
      }).toThrow('Pipeline not found');
    });
  });

  describe('System Status and Health', () => {
    it('should provide accurate system status', () => {
      const status = deploymentSystem.getSystemStatus();
      
      expect(status.totalPipelines).toBeGreaterThanOrEqual(1); // 기본 파이프라인
      expect(status.activeDeployments).toBeGreaterThanOrEqual(0);
      expect(status.totalEnvironments).toBeGreaterThanOrEqual(1); // 기본 환경
      expect(status.recentDeployments).toBeGreaterThanOrEqual(0);
      expect(['healthy', 'warning', 'critical']).toContain(status.systemHealth);
    });

    it('should calculate system health correctly', () => {
      const status = deploymentSystem.getSystemStatus();
      
      // 초기 상태에서는 건강해야 함
      expect(status.systemHealth).toBe('healthy');
    });

    it('should track recent deployments accurately', async () => {
      const initialStatus = deploymentSystem.getSystemStatus();
      const initialRecentDeployments = initialStatus.recentDeployments;
      
      const pipelineConfig = {
        name: 'Recent Deployment Pipeline',
        environment: 'development' as const,
        stages: [],
        deploymentStrategy: {
          type: 'recreate' as const,
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
      };

      const pipeline = deploymentSystem.createPipeline(pipelineConfig);
      await deploymentSystem.executeDeployment(
        pipeline.id,
        'v1.0.0',
        'test-user',
        { approved: true }
      );
      
      const updatedStatus = deploymentSystem.getSystemStatus();
      expect(updatedStatus.recentDeployments).toBeGreaterThanOrEqual(initialRecentDeployments);
    });
  });
});