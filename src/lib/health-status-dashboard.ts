/**
 * 🏥 Health Check & Status Dashboard System
 * 헬스체크 및 상태 대시보드 시스템
 * 
 * Features:
 * - 멀티레벨 헬스체크 (시스템, 애플리케이션, 비즈니스)
 * - 실시간 상태 대시보드
 * - 종속성 상태 추적
 * - 장애 전파 분석
 * - 자동 복구 트리거
 * - 상태 기반 로드밸런싱
 */

import { PerformanceOptimizationEngine } from './performance-optimization-engine.js';
import { ScalingManagementSystem } from './scaling-management-system.js';
import { DeploymentManagementSystem } from './deployment-management-system.js';
import { MonitoringAlertingSystem } from './monitoring-alerting-system.js';

/**
 * 헬스체크 정의 및 설정
 */
interface HealthCheck {
  id: string;
  name: string;
  type: HealthCheckType;
  category: HealthCategory;
  endpoint?: string;
  configuration: HealthCheckConfig;
  schedule: ScheduleConfig;
  dependencies: string[];
  criticalityLevel: CriticalityLevel;
  timeout: number;
  retryPolicy: RetryPolicy;
  metadata: Map<string, unknown>;
}

interface HealthCheckConfig {
  expectedResponse?: unknown;
  customValidation?: ValidationFunction;
  thresholds: HealthThresholds;
  tags: Map<string, string>;
}

interface HealthThresholds {
  responseTime: { warning: number; critical: number };
  availability: { warning: number; critical: number };
  customMetrics?: Map<string, ThresholdRange>;
}

interface ScheduleConfig {
  interval: number; // seconds
  enabled: boolean;
  activeHours?: TimeWindow;
  timezone?: string;
}

/**
 * 헬스체크 결과 및 상태
 */
interface HealthCheckResult {
  checkId: string;
  timestamp: Date;
  status: HealthStatus;
  responseTime: number;
  details: HealthDetails;
  error?: ErrorInfo;
  metrics: Map<string, number>;
  trends: HealthTrends;
}

interface HealthDetails {
  message: string;
  data: unknown;
  validationResults: ValidationResult[];
  dependencyStatus: DependencyStatus[];
}

interface HealthTrends {
  availability: TrendData;
  responseTime: TrendData;
  errorRate: TrendData;
}

interface TrendData {
  current: number;
  previous: number;
  direction: 'improving' | 'degrading' | 'stable';
  change: number;
}

/**
 * 시스템 상태 및 대시보드
 */
interface SystemStatus {
  overall: HealthStatus;
  timestamp: Date;
  components: Map<string, ComponentStatus>;
  dependencies: Map<string, DependencyStatus>;
  incidents: ActiveIncident[];
  sla: SLAStatus;
  performance: PerformanceSnapshot;
  capacity: CapacityStatus;
}

interface ComponentStatus {
  id: string;
  name: string;
  status: HealthStatus;
  lastCheck: Date;
  uptime: number;
  availability: number;
  responseTime: number;
  errorRate: number;
  healthChecks: HealthCheckResult[];
  issues: Issue[];
}

interface DependencyStatus {
  id: string;
  name: string;
  type: DependencyType;
  status: HealthStatus;
  lastCheck: Date;
  uptime: number;
  criticalPath: boolean;
  impact: ImpactLevel;
}

/**
 * 대시보드 및 시각화
 */
interface Dashboard {
  id: string;
  name: string;
  layout: DashboardLayout;
  sections: DashboardSection[];
  refreshInterval: number;
  permissions: Permission[];
  customization: DashboardCustomization;
}

interface DashboardSection {
  id: string;
  title: string;
  type: SectionType;
  position: Position;
  size: Size;
  content: SectionContent;
  filters: Filter[];
}

interface StatusPage {
  id: string;
  title: string;
  description: string;
  components: StatusPageComponent[];
  incidents: IncidentUpdate[];
  maintenance: MaintenanceWindow[];
  branding: BrandingConfig;
  subscription: SubscriptionConfig;
}

/**
 * 헬스체크 및 상태 대시보드 시스템
 */
export class HealthStatusDashboard {
  private healthChecks: Map<string, HealthCheck>;
  private checkResults: Map<string, HealthCheckResult[]>;
  private systemStatus: SystemStatus;
  private dashboards: Map<string, Dashboard>;
  private statusPages: Map<string, StatusPage>;
  private incidents: Map<string, ActiveIncident>;
  private maintenanceWindows: Map<string, MaintenanceWindow>;
  
  private performanceEngine: PerformanceOptimizationEngine;
  private scalingSystem: ScalingManagementSystem;
  private deploymentSystem: DeploymentManagementSystem;
  private monitoringSystem: MonitoringAlertingSystem;
  
  private healthCheckExecutor: HealthCheckExecutor;
  private incidentManager: IncidentManager;
  private statusReporter: StatusReporter;

  constructor() {
    this.healthChecks = new Map();
    this.checkResults = new Map();
    this.dashboards = new Map();
    this.statusPages = new Map();
    this.incidents = new Map();
    this.maintenanceWindows = new Map();
    
    this.performanceEngine = new PerformanceOptimizationEngine();
    this.scalingSystem = new ScalingManagementSystem();
    this.deploymentSystem = new DeploymentManagementSystem();
    this.monitoringSystem = new MonitoringAlertingSystem();
    
    this.healthCheckExecutor = new HealthCheckExecutor();
    this.incidentManager = new IncidentManager();
    this.statusReporter = new StatusReporter();
    
    this.systemStatus = this.initializeSystemStatus();
    
    this.initializeDefaultHealthChecks();
    this.initializeDefaultDashboards();
    this.initializeDefaultStatusPages();
    this.startHealthCheckLoop();
  }

  /**
   * 🏥 메인 헬스체크 실행 메서드
   */
  async executeHealthChecks(): Promise<HealthCheckReport> {
    const startTime = Date.now();
    const results: HealthCheckResult[] = [];
    const errors: string[] = [];

    // 1. 모든 활성 헬스체크 실행
    for (const [checkId, healthCheck] of this.healthChecks) {
      if (healthCheck.schedule.enabled) {
        try {
          const result = await this.executeHealthCheck(healthCheck);
          results.push(result);
          
          // 결과 저장
          this.storeHealthCheckResult(checkId, result);
          
        } catch (_error) {
          errors.push(`Health check ${checkId} failed: ${error}`);
        }
      }
    }

    // 2. 시스템 상태 업데이트
    await this.updateSystemStatus(results);

    // 3. 인시던트 감지 및 관리
    const incidents = await this.detectAndManageIncidents(results);

    // 4. 자동 복구 실행
    const recoveryActions = await this.executeAutoRecovery(results);

    const endTime = Date.now();

    return {
      timestamp: new Date(),
      duration: endTime - startTime,
      totalChecks: this.healthChecks.size,
      executedChecks: results.length,
      passedChecks: results.filter(r => r.status === 'healthy').length,
      failedChecks: results.filter(r => r.status === 'unhealthy').length,
      degradedChecks: results.filter(r => r.status === 'degraded').length,
      newIncidents: incidents.new.length,
      resolvedIncidents: incidents.resolved.length,
      recoveryActions: recoveryActions.length,
      systemStatus: this.systemStatus.overall,
      errors
    };
  }

  /**
   * 🔍 개별 헬스체크 실행
   */
  async executeHealthCheck(healthCheck: HealthCheck): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // 의존성 확인
      await this.checkDependencies(healthCheck);
      
      // 헬스체크 실행
      const result = await this.healthCheckExecutor.execute(healthCheck);
      
      const endTime = Date.now();
      result.responseTime = endTime - startTime;
      
      // 트렌드 계산
      result.trends = await this.calculateHealthTrends(healthCheck.id, result);
      
      return result;
      
    } catch (_error) {
      const endTime = Date.now();
      
      return {
        checkId: healthCheck.id,
        timestamp: new Date(),
        status: 'unhealthy',
        responseTime: endTime - startTime,
        details: {
          message: 'Health check execution failed',
          data: null,
          validationResults: [],
          dependencyStatus: []
        },
        error: {
          type: 'execution_error',
          message: _error instanceof Error ? error.message : 'Unknown error',
          stack: _error instanceof Error ? error.stack : undefined,
          timestamp: new Date()
        },
        metrics: new Map(),
        trends: {
          availability: { current: 0, previous: 0, direction: 'degrading', change: -100 },
          responseTime: { current: endTime - startTime, previous: 0, direction: 'degrading', change: 100 },
          errorRate: { current: 100, previous: 0, direction: 'degrading', change: 100 }
        }
      };
    }
  }

  /**
   * 📊 시스템 상태 조회
   */
  getSystemStatus(): SystemStatus {
    return { ...this.systemStatus };
  }

  /**
   * 🏥 헬스체크 관리
   */
  createHealthCheck(config: HealthCheckConfig): HealthCheck {
    const healthCheck: HealthCheck = {
      id: config.id || this.generateHealthCheckId(),
      name: config.name,
      type: config.type,
      category: config.category,
      endpoint: config.endpoint,
      configuration: config.configuration,
      schedule: config.schedule,
      dependencies: config.dependencies || [],
      criticalityLevel: config.criticalityLevel || 'medium',
      timeout: config.timeout || 30000,
      retryPolicy: config.retryPolicy || { maxRetries: 3, backoffMs: 1000 },
      metadata: new Map(Object.entries(config.metadata || {}))
    };

    this.healthChecks.set(healthCheck.id, healthCheck);
    this.checkResults.set(healthCheck.id, []);
    
    return healthCheck;
  }

  updateHealthCheck(checkId: string, updates: Partial<HealthCheckConfig>): HealthCheck {
    const healthCheck = this.healthChecks.get(checkId);
    if (!healthCheck) {
      throw new Error(`Health check not found: ${checkId}`);
    }

    Object.assign(healthCheck, updates);
    return healthCheck;
  }

  deleteHealthCheck(checkId: string): boolean {
    this.checkResults.delete(checkId);
    return this.healthChecks.delete(checkId);
  }

  /**
   * 📈 대시보드 관리
   */
  createDashboard(config: DashboardConfig): Dashboard {
    const dashboard: Dashboard = {
      id: config.id || this.generateDashboardId(),
      name: config.name,
      layout: config.layout,
      sections: config.sections,
      refreshInterval: config.refreshInterval || 30,
      permissions: config.permissions || [],
      customization: config.customization || {}
    };

    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  getDashboardData(dashboardId: string): DashboardData {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${dashboardId}`);
    }

    const sectionData = new Map<string, unknown>();
    
    for (const section of dashboard.sections) {
      const data = this.getSectionData(section);
      sectionData.set(section.id, data);
    }

    return {
      dashboard,
      sectionData,
      lastUpdated: new Date(),
      systemStatus: this.systemStatus
    };
  }

  /**
   * 📄 상태 페이지 관리
   */
  createStatusPage(config: StatusPageConfig): StatusPage {
    const statusPage: StatusPage = {
      id: config.id || this.generateStatusPageId(),
      title: config.title,
      description: config.description,
      components: config.components,
      incidents: [],
      maintenance: [],
      branding: config.branding || {},
      subscription: config.subscription || {}
    };

    this.statusPages.set(statusPage.id, statusPage);
    return statusPage;
  }

  getStatusPageData(pageId: string): StatusPageData {
    const statusPage = this.statusPages.get(pageId);
    if (!statusPage) {
      throw new Error(`Status page not found: ${pageId}`);
    }

    // 컴포넌트 상태 업데이트
    const updatedComponents = statusPage.components.map(component => {
      const status = this.getComponentStatus(component.id);
      return {
        ...component,
        status: status?.status || 'unknown',
        lastUpdate: status?.lastCheck || new Date()
      };
    });

    // 활성 인시던트 가져오기
    const activeIncidents = Array.from(this.incidents.values())
      .filter(incident => incident.status !== 'resolved')
      .map(incident => this.convertToIncidentUpdate(incident));

    // 예정된 유지보수 가져오기
    const upcomingMaintenance = Array.from(this.maintenanceWindows.values())
      .filter(maintenance => maintenance.status === 'scheduled' || maintenance.status === 'in_progress');

    return {
      statusPage: {
        ...statusPage,
        components: updatedComponents,
        incidents: activeIncidents,
        maintenance: upcomingMaintenance
      },
      overallStatus: this.calculateOverallStatus(updatedComponents),
      lastUpdated: new Date()
    };
  }

  /**
   * 🚨 인시던트 관리
   */
  async createIncident(config: IncidentConfig): Promise<ActiveIncident> {
    const incident: ActiveIncident = {
      id: config.id || this.generateIncidentId(),
      title: config.title,
      description: config.description,
      severity: config.severity,
      status: 'investigating',
      startTime: new Date(),
      affectedComponents: config.affectedComponents || [],
      updates: [],
      rootCause: config.rootCause,
      resolution: config.resolution,
      timeline: []
    };

    this.incidents.set(incident.id, incident);
    
    // 인시던트 알림 발송
    await this.notifyIncident(incident);
    
    return incident;
  }

  async updateIncident(incidentId: string, update: IncidentUpdate): Promise<ActiveIncident> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    incident.updates.push({
      ...update,
      timestamp: new Date()
    });

    if (update.status) {
      incident.status = update.status;
      if (update.status === 'resolved') {
        incident.endTime = new Date();
        incident.resolution = update.message;
      }
    }

    // 인시던트 업데이트 알림
    await this.notifyIncidentUpdate(incident, update);

    return incident;
  }

  /**
   * 🔧 Private Helper Methods
   */
  private async updateSystemStatus(_results: HealthCheckResult[]): Promise<void> {
    const components = new Map<string, ComponentStatus>();
    const dependencies = new Map<string, DependencyStatus>();

    // 컴포넌트 상태 계산
    for (const [checkId, healthCheck] of this.healthChecks) {
      const recentResults = this.getRecentResults(checkId, 10);
      const componentStatus = this.calculateComponentStatus(healthCheck, recentResults);
      components.set(checkId, componentStatus);
    }

    // 의존성 상태 계산
    for (const component of components.values()) {
      for (const depId of this.getDependencies(component.id)) {
        if (!dependencies.has(depId)) {
          const depStatus = this.calculateDependencyStatus(depId);
          dependencies.set(depId, depStatus);
        }
      }
    }

    // 전체 시스템 상태 계산
    const overallStatus = this.calculateOverallSystemStatus(components);

    this.systemStatus = {
      overall: overallStatus,
      timestamp: new Date(),
      components,
      dependencies,
      incidents: Array.from(this.incidents.values()),
      sla: await this.calculateSLAStatus(),
      performance: await this.getPerformanceSnapshot(),
      capacity: await this.getCapacityStatus()
    };
  }

  private async detectAndManageIncidents(results: HealthCheckResult[]): Promise<IncidentDetectionResult> {
    const newIncidents: ActiveIncident[] = [];
    const resolvedIncidents: ActiveIncident[] = [];

    // 실패한 헬스체크에서 인시던트 감지
    const failedChecks = results.filter(r => r.status === 'unhealthy');
    
    for (const result of failedChecks) {
      const existingIncident = this.findIncidentByComponent(result.checkId);
      
      if (!existingIncident) {
        // 새 인시던트 생성
        const incident = await this.createIncident({
          title: `${this.healthChecks.get(result.checkId)?.name} is unhealthy`,
          description: result.details.message,
          severity: this.determineSeverity(result),
          affectedComponents: [result.checkId]
        });
        newIncidents.push(incident);
      }
    }

    // 복구된 컴포넌트의 인시던트 해결
    const healthyChecks = results.filter(r => r.status === 'healthy');
    
    for (const result of healthyChecks) {
      const existingIncident = this.findIncidentByComponent(result.checkId);
      
      if (existingIncident && existingIncident.status !== 'resolved') {
        await this.updateIncident(existingIncident.id, {
          status: 'resolved',
          message: `${this.healthChecks.get(result.checkId)?.name} has recovered`,
          timestamp: new Date()
        });
        resolvedIncidents.push(existingIncident);
      }
    }

    return { new: newIncidents, resolved: resolvedIncidents };
  }

  private async executeAutoRecovery(results: HealthCheckResult[]): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];
    
    const criticalFailures = results.filter(r => 
      r.status === 'unhealthy' && 
      this.healthChecks.get(r.checkId)?.criticalityLevel === 'critical'
    );

    for (const result of criticalFailures) {
      const healthCheck = this.healthChecks.get(result.checkId);
      if (healthCheck && this.shouldAttemptRecovery(result)) {
        const action = await this.attemptRecovery(healthCheck, result);
        if (action) {
          actions.push(action);
        }
      }
    }

    return actions;
  }

  private initializeSystemStatus(): SystemStatus {
    return {
      overall: 'healthy',
      timestamp: new Date(),
      components: new Map(),
      dependencies: new Map(),
      incidents: [],
      sla: {
        availability: 99.9,
        responseTime: 200,
        errorRate: 0.1,
        trend: 'stable'
      },
      performance: {
        cpu: 45,
        memory: 60,
        disk: 30,
        network: 25
      },
      capacity: {
        current: 65,
        projected: 70,
        threshold: 85,
        timeToThreshold: 72 // hours
      }
    };
  }

  private initializeDefaultHealthChecks(): void {
    // API 헬스체크
    this.createHealthCheck({
      id: 'api-health',
      name: 'API Health Check',
      type: 'http',
      category: 'application',
      endpoint: '/api/health',
      configuration: {
        expectedResponse: { status: 'ok' },
        thresholds: {
          responseTime: { warning: 1000, critical: 3000 },
          availability: { warning: 99.5, critical: 99.0 }
        },
        tags: new Map([['service', 'api'], ['tier', 'critical']])
      },
      schedule: {
        interval: 30,
        enabled: true
      },
      criticalityLevel: 'critical',
      timeout: 5000,
      retryPolicy: { maxRetries: 3, backoffMs: 1000 }
    });

    // 데이터베이스 헬스체크
    this.createHealthCheck({
      id: 'database-health',
      name: 'Database Health Check',
      type: 'database',
      category: 'infrastructure',
      configuration: {
        thresholds: {
          responseTime: { warning: 500, critical: 2000 },
          availability: { warning: 99.9, critical: 99.5 }
        },
        tags: new Map([['service', 'database'], ['tier', 'critical']])
      },
      schedule: {
        interval: 60,
        enabled: true
      },
      criticalityLevel: 'critical',
      timeout: 10000,
      retryPolicy: { maxRetries: 2, backoffMs: 2000 }
    });

    // AI 서비스 헬스체크
    this.createHealthCheck({
      id: 'ai-service-health',
      name: 'AI Service Health Check',
      type: 'custom',
      category: 'business',
      configuration: {
        thresholds: {
          responseTime: { warning: 2000, critical: 5000 },
          availability: { warning: 99.0, critical: 98.0 }
        },
        tags: new Map([['service', 'ai'], ['tier', 'high']])
      },
      schedule: {
        interval: 120,
        enabled: true
      },
      criticalityLevel: 'high',
      timeout: 15000,
      retryPolicy: { maxRetries: 2, backoffMs: 3000 }
    });
  }

  private initializeDefaultDashboards(): void {
    this.createDashboard({
      name: 'System Health Overview',
      layout: { type: 'grid', columns: 3 },
      sections: [
        {
          id: 'overall-status',
          title: 'Overall System Status',
          type: 'status_indicator',
          position: { row: 0, column: 0 },
          size: { width: 1, height: 1 },
          content: { source: 'system_status' },
          filters: []
        },
        {
          id: 'component-status',
          title: 'Component Status',
          type: 'component_grid',
          position: { row: 0, column: 1 },
          size: { width: 2, height: 1 },
          content: { source: 'components' },
          filters: []
        },
        {
          id: 'response-times',
          title: 'Response Times',
          type: 'time_series',
          position: { row: 1, column: 0 },
          size: { width: 3, height: 1 },
          content: { source: 'response_times', timeRange: '1h' },
          filters: []
        }
      ],
      refreshInterval: 30
    });
  }

  private initializeDefaultStatusPages(): void {
    this.createStatusPage({
      title: 'ro-fan Platform Status',
      description: 'Real-time status and uptime monitoring for ro-fan romance fantasy platform',
      components: [
        {
          id: 'api-health',
          name: 'API Services',
          description: 'Core API endpoints and services',
          status: 'operational'
        },
        {
          id: 'database-health',
          name: 'Database',
          description: 'Database services and data storage',
          status: 'operational'
        },
        {
          id: 'ai-service-health',
          name: 'AI Story Generation',
          description: 'AI-powered story generation services',
          status: 'operational'
        }
      ],
      branding: {
        title: 'ro-fan Status',
        logo: '/logo.png',
        colors: {
          primary: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      }
    });
  }

  private startHealthCheckLoop(): void {
    // 메인 헬스체크 루프 (30초마다)
    setInterval(async () => {
      try {
        await this.executeHealthChecks();
      } catch (_error) {
        // console.error('Health check execution error:', _error);
      }
    }, 30000);

    // 상태 업데이트 루프 (10초마다)
    setInterval(async () => {
      try {
        await this.refreshSystemStatus();
      } catch (_error) {
        // console.error('Status refresh error:', _error);
      }
    }, 10000);
  }

  // 스텁 메서드들
  private async checkDependencies(_healthCheck: HealthCheck): Promise<void> {
    // 의존성 확인 로직
  }

  private async calculateHealthTrends(checkId: string, _result: HealthCheckResult): Promise<HealthTrends> {
    const previousResults = this.getRecentResults(checkId, 10);
    
    return {
      availability: this.calculateTrend(previousResults.map(r => r.status === 'healthy' ? 100 : 0)),
      responseTime: this.calculateTrend(previousResults.map(r => r.responseTime)),
      errorRate: this.calculateTrend(previousResults.map(r => r.status === 'unhealthy' ? 100 : 0))
    };
  }

  private calculateTrend(values: number[]): TrendData {
    if (values.length < 2) {
      return { current: values[0] || 0, previous: 0, direction: 'stable', change: 0 };
    }

    const current = values[values.length - 1];
    const previous = values[values.length - 2];
    const change = ((current - previous) / previous) * 100;

    let direction: 'improving' | 'degrading' | 'stable' = 'stable';
    if (Math.abs(change) > 5) {
      direction = change > 0 ? 'improving' : 'degrading';
    }

    return { current, previous, direction, change };
  }

  private storeHealthCheckResult(checkId: string, result: HealthCheckResult): void {
    const results = this.checkResults.get(checkId) || [];
    results.push(result);
    
    // 최근 100개 결과만 유지
    if (results.length > 100) {
      results.splice(0, results.length - 100);
    }
    
    this.checkResults.set(checkId, results);
  }

  private getRecentResults(checkId: string, count: number): HealthCheckResult[] {
    const results = this.checkResults.get(checkId) || [];
    return results.slice(-count);
  }

  private calculateComponentStatus(healthCheck: HealthCheck, results: HealthCheckResult[]): ComponentStatus {
    const recentResults = results.slice(-10);
    const uptime = recentResults.filter(r => r.status === 'healthy').length / recentResults.length * 100;
    const avgResponseTime = recentResults.reduce((sum, r) => sum + r.responseTime, 0) / recentResults.length;
    const errorRate = recentResults.filter(r => r.status === 'unhealthy').length / recentResults.length * 100;

    return {
      id: healthCheck.id,
      name: healthCheck.name,
      status: this.determineComponentStatus(recentResults),
      lastCheck: recentResults[recentResults.length - 1]?.timestamp || new Date(),
      uptime,
      availability: uptime,
      responseTime: avgResponseTime,
      errorRate,
      healthChecks: recentResults,
      issues: this.identifyIssues(recentResults)
    };
  }

  private determineComponentStatus(results: HealthCheckResult[]): HealthStatus {
    if (results.length === 0) return 'unknown';
    
    const latest = results[results.length - 1];
    return latest.status;
  }

  private identifyIssues(results: HealthCheckResult[]): Issue[] {
    const issues: Issue[] = [];
    
    // 높은 응답 시간 감지
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    if (avgResponseTime > 2000) {
      issues.push({
        type: 'performance',
        severity: 'warning',
        message: `High response time detected: ${avgResponseTime.toFixed(0)}ms`,
        timestamp: new Date()
      });
    }

    return issues;
  }

  private calculateDependencyStatus(depId: string): DependencyStatus {
    return {
      id: depId,
      name: `Dependency ${depId}`,
      type: 'external',
      status: 'healthy',
      lastCheck: new Date(),
      uptime: 99.9,
      criticalPath: true,
      impact: 'high'
    };
  }

  private calculateOverallSystemStatus(components: Map<string, ComponentStatus>): HealthStatus {
    const statuses = Array.from(components.values()).map(c => c.status);
    
    if (statuses.some(s => s === 'unhealthy')) return 'unhealthy';
    if (statuses.some(s => s === 'degraded')) return 'degraded';
    if (statuses.every(s => s === 'healthy')) return 'healthy';
    
    return 'unknown';
  }

  private async calculateSLAStatus(): Promise<SLAStatus> {
    return {
      availability: 99.9,
      responseTime: 200,
      errorRate: 0.1,
      trend: 'stable'
    };
  }

  private async getPerformanceSnapshot(): Promise<PerformanceSnapshot> {
    return {
      cpu: 45,
      memory: 60,
      disk: 30,
      network: 25
    };
  }

  private async getCapacityStatus(): Promise<CapacityStatus> {
    return {
      current: 65,
      projected: 70,
      threshold: 85,
      timeToThreshold: 72
    };
  }

  private getSectionData(section: DashboardSection): unknown {
    switch (section.type) {
      case 'status_indicator':
        return { status: this.systemStatus.overall };
      case 'component_grid':
        return { components: Array.from(this.systemStatus.components.values()) };
      case 'time_series':
        return { data: this.getTimeSeriesData(section.content.source) };
      default:
        return {};
    }
  }

  private getTimeSeriesData(_source: string): unknown[] {
    // 시계열 데이터 생성 로직
    return [];
  }

  private getComponentStatus(componentId: string): ComponentStatus | undefined {
    return this.systemStatus.components.get(componentId);
  }

  private calculateOverallStatus(components: StatusPageComponent[]): HealthStatus {
    const statuses = components.map(c => c.status);
    
    if (statuses.some(s => s === 'major_outage' || s === 'partial_outage')) return 'unhealthy';
    if (statuses.some(s => s === 'degraded_performance')) return 'degraded';
    if (statuses.every(s => s === 'operational')) return 'healthy';
    
    return 'unknown';
  }

  private convertToIncidentUpdate(incident: ActiveIncident): IncidentUpdate {
    return {
      title: incident.title,
      status: incident.status,
      message: incident.description,
      timestamp: incident.startTime
    };
  }

  private findIncidentByComponent(componentId: string): ActiveIncident | undefined {
    return Array.from(this.incidents.values()).find(incident => 
      incident.affectedComponents.includes(componentId) && incident.status !== 'resolved'
    );
  }

  private determineSeverity(result: HealthCheckResult): IncidentSeverity {
    const healthCheck = this.healthChecks.get(result.checkId);
    if (!healthCheck) return 'minor';
    
    switch (healthCheck.criticalityLevel) {
      case 'critical': return 'major';
      case 'high': return 'minor';
      default: return 'minor';
    }
  }

  private shouldAttemptRecovery(_result: HealthCheckResult): boolean {
    return true; // 복구 시도 조건 로직
  }

  private async attemptRecovery(healthCheck: HealthCheck, _result: HealthCheckResult): Promise<RecoveryAction | null> {
    return {
      checkId: healthCheck.id,
      type: 'restart',
      description: 'Attempted automatic recovery',
      timestamp: new Date(),
      success: true
    };
  }

  private getDependencies(componentId: string): string[] {
    const healthCheck = this.healthChecks.get(componentId);
    return healthCheck?.dependencies || [];
  }

  private async notifyIncident(_incident: ActiveIncident): Promise<void> {
    // console.log('Incident created:', incident.title);
  }

  private async notifyIncidentUpdate(_incident: ActiveIncident, _update: IncidentUpdate): Promise<void> {
    // console.log('Incident updated:', incident.title, update.message);
  }

  private async refreshSystemStatus(): Promise<void> {
    this.systemStatus.timestamp = new Date();
  }

  private generateHealthCheckId(): string {
    return `health-check-${Date.now()}`;
  }

  private generateDashboardId(): string {
    return `dashboard-${Date.now()}`;
  }

  private generateStatusPageId(): string {
    return `status-page-${Date.now()}`;
  }

  private generateIncidentId(): string {
    return `incident-${Date.now()}`;
  }

  /**
   * 📊 공개 API 메서드들
   */
  getHealthCheckResults(checkId: string, limit?: number): HealthCheckResult[] {
    const results = this.checkResults.get(checkId) || [];
    return limit ? results.slice(-limit) : results;
  }

  getSystemHealthSummary(): SystemHealthSummary {
    const components = Array.from(this.systemStatus.components.values());
    const healthy = components.filter(c => c.status === 'healthy').length;
    const degraded = components.filter(c => c.status === 'degraded').length;
    const unhealthy = components.filter(c => c.status === 'unhealthy').length;

    return {
      overall: this.systemStatus.overall,
      components: {
        total: components.length,
        healthy,
        degraded,
        unhealthy
      },
      uptime: this.calculateSystemUptime(),
      lastUpdated: this.systemStatus.timestamp
    };
  }

  private calculateSystemUptime(): number {
    // 시스템 업타임 계산 로직
    return 99.9;
  }

  /**
   * 🎨 대시보드 설정
   */
  configureDashboard(config: DashboardConfig): void {
    this.dashboardConfig = { ...config };
  }

  getDashboardConfig(): DashboardConfig {
    return { ...this.dashboardConfig };
  }

  // 대시보드 설정 초기화
  private dashboardConfig: DashboardConfig = {
    theme: 'light',
    refreshInterval: 30000,
    showIncidents: true,
    showMetrics: true,
    defaultTimeRange: '24h',
    alertsEnabled: true,
    publicStatus: {
      enabled: false,
      customDomain: '',
      branding: {
        logo: '',
        title: 'System Status'
      }
    }
  };

  /**
   * 시스템 헬스 상태 조회
   */
  getSystemHealth(): unknown {
    return {
      status: this.systemStatus.overallStatus,
      timestamp: this.systemStatus.timestamp,
      components: Array.from(this.healthChecks.keys()).map(id => ({
        id,
        status: this.getLatestHealthStatus(id) || 'unknown'
      }))
    };
  }

  /**
   * 헬스체크 목록 조회
   */
  getHealthChecks(): Map<string, HealthCheck> {
    return this.healthChecks;
  }

  /**
   * 헬스체크 조회
   */
  getHealthCheck(checkId: string): unknown {
    const healthCheck = this.healthChecks.get(checkId);
    if (!healthCheck) return null;
    
    return {
      ...healthCheck,
      enabled: healthCheck.schedule.enabled
    };
  }

  /**
   * 헬스체크 비활성화
   */
  async disableHealthCheck(checkId: string): Promise<void> {
    const healthCheck = this.healthChecks.get(checkId);
    if (healthCheck && healthCheck.schedule) {
      healthCheck.schedule.enabled = false;
    }
  }

  /**
   * 헬스체크 활성화
   */
  async enableHealthCheck(checkId: string): Promise<void> {
    const healthCheck = this.healthChecks.get(checkId);
    if (healthCheck && healthCheck.schedule) {
      healthCheck.schedule.enabled = true;
    }
  }

  /**
   * 모든 헬스체크 실행
   */
  async executeAllHealthChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    for (const [checkId, healthCheck] of this.healthChecks) {
      if (healthCheck.schedule.enabled) {
        try {
          const result = await this.executeHealthCheck(healthCheck);
          results.push(result);
          this.storeHealthCheckResult(checkId, result);
        } catch (_error) {
          results.push({
            checkId: healthCheck.id,
            name: healthCheck.name,
            status: 'unhealthy',
            timestamp: new Date(),
            duration: 0,
            message: `Error: ${error}`
          });
        }
      }
    }
    
    return results;
  }

  /**
   * 최신 헬스 상태 조회
   */
  private getLatestHealthStatus(checkId: string): HealthStatus | null {
    const results = this.checkResults.get(checkId);
    if (!results || results.length === 0) {
      return null;
    }
    return results[results.length - 1].status;
  }
}

// 타입 정의들
type HealthCheckType = 'http' | 'tcp' | 'database' | 'custom' | 'external';
type HealthCategory = 'system' | 'application' | 'infrastructure' | 'business';
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
type CriticalityLevel = 'low' | 'medium' | 'high' | 'critical';
type DependencyType = 'internal' | 'external' | 'third_party';
type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';
type SectionType = 'status_indicator' | 'component_grid' | 'time_series' | 'metrics' | 'incidents';
type IncidentSeverity = 'minor' | 'major' | 'critical';
type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

interface ValidationFunction {
  (data: unknown): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  message?: string;
}

interface ThresholdRange {
  min: number;
  max: number;
}

interface TimeWindow {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
}

interface ErrorInfo {
  type: string;
  message: string;
  stack?: string;
  timestamp: Date;
}

interface ActiveIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startTime: Date;
  endTime?: Date;
  affectedComponents: string[];
  updates: IncidentUpdate[];
  rootCause?: string;
  resolution?: string;
  timeline: unknown[];
}

interface Issue {
  type: string;
  severity: string;
  message: string;
  timestamp: Date;
}

interface SLAStatus {
  availability: number;
  responseTime: number;
  errorRate: number;
  trend: string;
}

interface PerformanceSnapshot {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface CapacityStatus {
  current: number;
  projected: number;
  threshold: number;
  timeToThreshold: number;
}

interface Position {
  row: number;
  column: number;
}

interface Size {
  width: number;
  height: number;
}

interface SectionContent {
  _source: string;
  timeRange?: string;
  [key: string]: unknown;
}

interface Filter {
  field: string;
  operator: string;
  value: unknown;
}

interface Permission {
  type: string;
  subject: string;
}

interface DashboardLayout {
  type: 'grid' | 'free';
  columns?: number;
}

interface DashboardCustomization {
  [key: string]: unknown;
}

interface StatusPageComponent {
  id: string;
  name: string;
  description: string;
  status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
  lastUpdate?: Date;
}

interface IncidentUpdate {
  title?: string;
  status?: IncidentStatus;
  message: string;
  timestamp: Date;
}

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  startTime: Date;
  endTime: Date;
  affectedComponents: string[];
}

interface BrandingConfig {
  title?: string;
  logo?: string;
  colors?: {
    primary: string;
    success: string;
    warning: string;
    danger: string;
  };
}

interface SubscriptionConfig {
  [key: string]: unknown;
}

interface RecoveryAction {
  checkId: string;
  type: string;
  description: string;
  timestamp: Date;
  success: boolean;
}

interface HealthCheckReport {
  timestamp: Date;
  duration: number;
  totalChecks: number;
  executedChecks: number;
  passedChecks: number;
  failedChecks: number;
  degradedChecks: number;
  newIncidents: number;
  resolvedIncidents: number;
  recoveryActions: number;
  systemStatus: HealthStatus;
  errors: string[];
}

interface IncidentDetectionResult {
  new: ActiveIncident[];
  resolved: ActiveIncident[];
}

interface DashboardData {
  dashboard: Dashboard;
  sectionData: Map<string, unknown>;
  lastUpdated: Date;
  systemStatus: SystemStatus;
}

interface StatusPageData {
  statusPage: StatusPage;
  overallStatus: HealthStatus;
  lastUpdated: Date;
}

interface SystemHealthSummary {
  overall: HealthStatus;
  components: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
  uptime: number;
  lastUpdated: Date;
}

interface DashboardConfig {
  theme: 'light' | 'dark';
  refreshInterval: number;
  showIncidents: boolean;
  showMetrics: boolean;
  defaultTimeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  alertsEnabled: boolean;
  publicStatus: {
    enabled: boolean;
    customDomain: string;
    branding: {
      logo: string;
      title: string;
    };
  };
}

// 설정 인터페이스들
interface HealthCheckConfig {
  id?: string;
  name: string;
  type: HealthCheckType;
  category: HealthCategory;
  endpoint?: string;
  configuration: unknown;
  schedule: ScheduleConfig;
  dependencies?: string[];
  criticalityLevel?: CriticalityLevel;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  metadata?: Record<string, unknown>;
}

interface DashboardConfig {
  id?: string;
  name: string;
  layout: DashboardLayout;
  sections: DashboardSection[];
  refreshInterval?: number;
  permissions?: Permission[];
  customization?: DashboardCustomization;
}

interface StatusPageConfig {
  id?: string;
  title: string;
  description: string;
  components: StatusPageComponent[];
  branding?: BrandingConfig;
  subscription?: SubscriptionConfig;
}

interface IncidentConfig {
  id?: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  affectedComponents?: string[];
  rootCause?: string;
  resolution?: string;
}

// Mock 클래스들
class HealthCheckExecutor {
  async execute(healthCheck: HealthCheck): Promise<HealthCheckResult> {
    // 실제 헬스체크 실행 로직
    const isHealthy = Math.random() > 0.1; // 90% 성공률
    
    return {
      checkId: healthCheck.id,
      timestamp: new Date(),
      status: isHealthy ? 'healthy' : 'unhealthy',
      responseTime: Math.random() * 1000,
      details: {
        message: isHealthy ? 'Health check passed' : 'Health check failed',
        data: { checked: true },
        validationResults: [],
        dependencyStatus: []
      },
      metrics: new Map([
        ['response_time', Math.random() * 1000],
        ['availability', isHealthy ? 100 : 0]
      ]),
      trends: {
        availability: { current: 100, previous: 100, direction: 'stable', change: 0 },
        responseTime: { current: 200, previous: 200, direction: 'stable', change: 0 },
        errorRate: { current: 0, previous: 0, direction: 'stable', change: 0 }
      }
    };
  }
}

class IncidentManager {
  async createIncident(config: IncidentConfig): Promise<ActiveIncident> {
    return {
      id: config.id || `incident-${Date.now()}`,
      title: config.title,
      description: config.description,
      severity: config.severity,
      status: 'investigating',
      startTime: new Date(),
      affectedComponents: config.affectedComponents || [],
      updates: [],
      timeline: []
    };
  }
}

class StatusReporter {
  async generateReport(): Promise<{ status: string; timestamp: Date }> {
    return { status: 'healthy', timestamp: new Date() };
  }
}

export default HealthStatusDashboard;