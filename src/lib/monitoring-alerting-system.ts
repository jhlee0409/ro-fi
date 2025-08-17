/**
 * 📊 Monitoring & Alerting System
 * 모니터링 및 알림 시스템
 * 
 * Features:
 * - 실시간 시스템 상태 모니터링
 * - 다층 알림 시스템 (이메일, 슬랙, 웹훅)
 * - 지능형 이상 탐지 및 예측
 * - 대시보드 및 메트릭 시각화
 * - SLA 추적 및 보고
 * - 자동 복구 및 에스컬레이션
 */

import { PerformanceOptimizationEngine } from './performance-optimization-engine.js';
import { ScalingManagementSystem } from './scaling-management-system.js';
import { DeploymentManagementSystem } from './deployment-management-system.js';

/**
 * 메트릭 및 모니터링 정의
 */
interface MetricDefinition {
  id: string;
  name: string;
  type: MetricType;
  category: MetricCategory;
  unit: string;
  description: string;
  thresholds: MetricThresholds;
  aggregation: AggregationType;
  retention: RetentionPolicy;
  tags: Map<string, string>;
}

interface MetricThresholds {
  critical: ThresholdConfig;
  warning: ThresholdConfig;
  info?: ThresholdConfig;
}

interface ThresholdConfig {
  value: number;
  operator: ComparisonOperator;
  duration: number; // seconds
  hysteresis?: number; // 히스테리시스 방지
}

interface MetricData {
  metricId: string;
  timestamp: Date;
  value: number;
  tags: Map<string, string>;
  source: string;
  quality: DataQuality;
}

/**
 * 알림 시스템 정의
 */
interface AlertRule {
  id: string;
  name: string;
  description: string;
  metricId: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  enabled: boolean;
  _channels: NotificationChannel[];
  escalation: EscalationPolicy;
  suppressions: SuppressionRule[];
  metadata: Map<string, unknown>;
}

interface AlertCondition {
  expression: string;
  evaluationWindow: number; // seconds
  frequency: number; // seconds
  missingDataTreatment: 'ignore' | 'breaching' | 'not_breaching';
}

interface Alert {
  id: string;
  ruleId: string;
  status: AlertStatus;
  severity: AlertSeverity;
  title: string;
  description: string;
  firedAt: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  escalatedAt?: Date;
  escalationLevel: number;
  metricData: MetricData[];
  context: AlertContext;
}

interface NotificationChannel {
  id: string;
  type: ChannelType;
  name: string;
  configuration: ChannelConfig;
  enabled: boolean;
  filters: NotificationFilter[];
}

/**
 * 대시보드 및 시각화
 */
interface Dashboard {
  id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  widgets: Widget[];
  timeRange: TimeRange;
  refreshInterval: number; // seconds
  permissions: Permission[];
  tags: string[];
}

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfig;
  queries: MetricQuery[];
}

interface MetricQuery {
  metricId: string;
  aggregation: AggregationType;
  groupBy: string[];
  filters: QueryFilter[];
  timeWindow: number;
}

/**
 * SLA 및 서비스 수준 추적
 */
interface SLADefinition {
  id: string;
  name: string;
  service: string;
  objective: SLAObjective;
  timeWindow: SLATimeWindow;
  alerting: SLAAlertConfig;
  reporting: SLAReportConfig;
}

interface SLAObjective {
  type: 'availability' | 'latency' | 'error_rate' | 'throughput';
  target: number; // percentage or value
  metricQueries: MetricQuery[];
}

interface SLAStatus {
  _slaId: string;
  currentPeriod: SLAPeriodStatus;
  historicalData: SLAPeriodStatus[];
  trend: SLATrend;
  budget: SLABudget;
}

/**
 * 모니터링 & 알림 시스템
 */
export class MonitoringAlertingSystem {
  private metrics: Map<string, MetricDefinition>;
  private metricData: Map<string, MetricData[]>;
  private alertRules: Map<string, AlertRule>;
  private activeAlerts: Map<string, Alert>;
  private alertHistory: Alert[];
  private dashboards: Map<string, Dashboard>;
  private slaDefinitions: Map<string, SLADefinition>;
  private slaStatus: Map<string, SLAStatus>;
  private notificationChannels: Map<string, NotificationChannel>;
  
  private performanceEngine: PerformanceOptimizationEngine;
  private scalingSystem: ScalingManagementSystem;
  private deploymentSystem: DeploymentManagementSystem;
  
  private anomalyDetector: AnomalyDetector;
  private notificationService: NotificationService;
  private dataCollector: MetricCollector;

  constructor() {
    this.metrics = new Map();
    this.metricData = new Map();
    this.alertRules = new Map();
    this.activeAlerts = new Map();
    this.alertHistory = [];
    this.dashboards = new Map();
    this.slaDefinitions = new Map();
    this.slaStatus = new Map();
    this.notificationChannels = new Map();
    
    this.performanceEngine = new PerformanceOptimizationEngine();
    this.scalingSystem = new ScalingManagementSystem();
    this.deploymentSystem = new DeploymentManagementSystem();
    
    this.anomalyDetector = new AnomalyDetector();
    this.notificationService = new NotificationService();
    this.dataCollector = new MetricCollector();
    
    this.initializeDefaultMetrics();
    this.initializeDefaultAlertRules();
    this.initializeDefaultDashboards();
    this.initializeSLADefinitions();
    this.startMonitoringLoop();
  }

  /**
   * 📊 메인 모니터링 실행 메서드
   */
  async executeMonitoringCycle(): Promise<MonitoringReport> {
    const startTime = Date.now();
    
    // 1. 메트릭 수집
    const collectionResults = await this.collectAllMetrics();
    
    // 2. 이상 탐지
    const anomalies = await this.detectAnomalies();
    
    // 3. 알림 규칙 평가
    const alertEvaluations = await this.evaluateAlertRules();
    
    // 4. SLA 상태 업데이트
    const _slaUpdates = await this.updateSLAStatus();
    
    // 5. 자동 복구 실행
    const _recoveryActions = await this.executeAutoRecovery();
    
    const endTime = Date.now();
    
    return {
      timestamp: new Date(),
      duration: endTime - startTime,
      metricsCollected: collectionResults.totalMetrics,
      anomaliesDetected: anomalies.length,
      alertsTriggered: alertEvaluations.newAlerts.length,
      alertsResolved: alertEvaluations.resolvedAlerts.length,
      slaStatus: this.getSLAStatusSummary(),
      systemHealth: this.calculateSystemHealth(),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * 🚨 알림 규칙 관리
   */
  createAlertRule(config: AlertRuleConfig): AlertRule {
    const _rule: AlertRule = {
      id: config.id || this.generateAlertRuleId(),
      name: config.name,
      description: config.description,
      metricId: config.metricId,
      condition: config.condition,
      severity: config.severity,
      enabled: config.enabled || true,
      _channels: config._channels,
      escalation: config.escalation,
      suppressions: config.suppressions || [],
      metadata: new Map()
    };

    this.alertRules.set(rule.id, rule);
    return rule;
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRuleConfig>): AlertRule {
    const rule = this.alertRules.get(ruleId);
    if (!rule) {
      throw new Error(`Alert rule not found: ${ruleId}`);
    }

    Object.assign(rule, updates);
    return rule;
  }

  deleteAlertRule(ruleId: string): boolean {
    return this.alertRules.delete(ruleId);
  }

  /**
   * 🔔 알림 처리
   */
  async triggerAlert(ruleId: string, metricData: MetricData[]): Promise<Alert> {
    const rule = this.alertRules.get(ruleId);
    if (!rule || !rule.enabled) {
      throw new Error(`Alert rule not found or disabled: ${ruleId}`);
    }

    const _alert: Alert = {
      id: this.generateAlertId(),
      ruleId,
      status: 'firing',
      severity: rule.severity,
      title: `Alert: ${rule.name}`,
      description: this.generateAlertDescription(rule, metricData),
      firedAt: new Date(),
      escalationLevel: 0,
      metricData,
      context: await this.gatherAlertContext(rule, metricData)
    };

    this.activeAlerts.set(alert.id, alert);
    this.alertHistory.push(alert);

    // 알림 발송
    await this.sendNotifications(alert, rule);

    return alert;
  }

  async resolveAlert(alertId: string, _resolvedBy?: string): Promise<Alert> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`);
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    this.activeAlerts.delete(alertId);

    // 해결 알림 발송
    const rule = this.alertRules.get(alert.ruleId);
    if (rule) {
      await this.sendResolutionNotifications(alert, rule);
    }

    return alert;
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<Alert> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`);
    }

    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy;

    return alert;
  }

  /**
   * 📈 메트릭 관리
   */
  defineMetric(config: MetricDefinitionConfig): MetricDefinition {
    const metric: MetricDefinition = {
      id: config.id || this.generateMetricId(),
      name: config.name,
      type: config.type,
      category: config.category,
      unit: config.unit,
      description: config.description,
      thresholds: config.thresholds,
      aggregation: config.aggregation,
      retention: config.retention,
      tags: new Map(Object.entries(config.tags || {}))
    };

    this.metrics.set(metric.id, metric);
    this.metricData.set(metric.id, []);
    
    return metric;
  }

  async recordMetric(metricId: string, value: number, tags?: Map<string, string>): Promise<void> {
    const metric = this.metrics.get(metricId);
    if (!metric) {
      throw new Error(`Metric not found: ${metricId}`);
    }

    const dataPoint: MetricData = {
      metricId,
      timestamp: new Date(),
      value,
      tags: tags || new Map(),
      source: 'manual',
      quality: 'good'
    };

    const data = this.metricData.get(metricId) || [];
    data.push(dataPoint);
    this.metricData.set(metricId, data);

    // 데이터 보존 정책 적용
    await this.applyRetentionPolicy(metricId);
  }

  queryMetrics(query: MetricQuery, timeRange: TimeRange): MetricQueryResult {
    const metric = this.metrics.get(query.metricId);
    if (!metric) {
      throw new Error(`Metric not found: ${query.metricId}`);
    }

    const data = this.metricData.get(query.metricId) || [];
    const filteredData = data.filter(point => 
      point.timestamp >= timeRange.start && 
      point.timestamp <= timeRange.end
    );

    return this.aggregateMetricData(filteredData, query);
  }

  /**
   * 📊 대시보드 관리
   */
  createDashboard(config: DashboardConfig): Dashboard {
    const dashboard: Dashboard = {
      id: config.id || this.generateDashboardId(),
      name: config.name,
      description: config.description,
      layout: config.layout,
      widgets: config.widgets,
      timeRange: config.timeRange,
      refreshInterval: config.refreshInterval || 30,
      permissions: config.permissions || [],
      tags: config.tags || []
    };

    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  getDashboardData(dashboardId: string, timeRange?: TimeRange): DashboardData {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${dashboardId}`);
    }

    const effectiveTimeRange = timeRange || dashboard.timeRange;
    const widgetData = new Map<string, unknown>();

    for (const widget of dashboard.widgets) {
      const data = this.getWidgetData(widget, effectiveTimeRange);
      widgetData.set(widget.id, data);
    }

    return {
      dashboard,
      timeRange: effectiveTimeRange,
      widgetData,
      lastUpdated: new Date()
    };
  }

  /**
   * 📋 SLA 관리
   */
  defineSLA(config: SLADefinitionConfig): SLADefinition {
    const _sla: SLADefinition = {
      id: config.id || this.generateSLAId(),
      name: config.name,
      service: config.service,
      objective: config.objective,
      timeWindow: config.timeWindow,
      alerting: config.alerting,
      reporting: config.reporting
    };

    this.slaDefinitions.set(sla.id, sla);
    this.slaStatus.set(sla.id, this.initializeSLAStatus(sla));
    
    return sla;
  }

  getSLAStatus(_slaId: string): SLAStatus | undefined {
    return this.slaStatus.get(_slaId);
  }

  generateSLAReport(_slaId: string, period: SLAReportPeriod): SLAReport {
    const sla = this.slaDefinitions.get(_slaId);
    const status = this.slaStatus.get(_slaId);
    
    if (!sla || !status) {
      throw new Error(`SLA not found: ${_slaId}`);
    }

    return this.calculateSLAReport(sla, status, period);
  }

  /**
   * 🤖 자동 복구 시스템
   */
  async executeAutoRecovery(): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];
    
    for (const [_alertId, alert] of this.activeAlerts) {
      if (alert.severity === 'critical' && this.shouldAttemptRecovery(alert)) {
        const recoveryAction = await this.attemptRecovery(alert);
        if (recoveryAction) {
          actions.push(recoveryAction);
        }
      }
    }
    
    return actions;
  }

  /**
   * 🔍 이상 탐지
   */
  async detectAnomalies(): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    for (const [metricId, data] of this.metricData) {
      const recentData = this.getRecentData(data, 3600); // 1시간
      if (recentData.length > 0) {
        const detected = await this.anomalyDetector.detect(metricId, recentData);
        anomalies.push(...detected);
      }
    }
    
    return anomalies;
  }

  /**
   * 🔧 Private Helper Methods
   */
  private async collectAllMetrics(): Promise<MetricCollectionResult> {
    let totalMetrics = 0;
    const errors: string[] = [];

    // 시스템 메트릭 수집
    try {
      await this.collectSystemMetrics();
      totalMetrics += 10;
    } catch (_error) {
      errors.push(`System metrics: ${error}`);
    }

    // 애플리케이션 메트릭 수집
    try {
      await this.collectApplicationMetrics();
      totalMetrics += 15;
    } catch (_error) {
      errors.push(`Application metrics: ${error}`);
    }

    // 비즈니스 메트릭 수집
    try {
      await this.collectBusinessMetrics();
      totalMetrics += 5;
    } catch (_error) {
      errors.push(`Business metrics: ${error}`);
    }

    return { totalMetrics, errors };
  }

  private async evaluateAlertRules(): Promise<AlertEvaluationResult> {
    const newAlerts: Alert[] = [];
    const resolvedAlerts: Alert[] = [];

    for (const [ruleId, rule] of this.alertRules) {
      if (!rule.enabled) continue;

      try {
        const shouldFire = await this.evaluateAlertCondition(rule);
        const existingAlert = this.findActiveAlertByRule(ruleId);

        if (shouldFire && !existingAlert) {
          // 새 알림 트리거
          const metricData = await this.getMetricDataForRule(rule);
          const alert = await this.triggerAlert(ruleId, metricData);
          newAlerts.push(alert);
        } else if (!shouldFire && existingAlert) {
          // 알림 해결
          const resolvedAlert = await this.resolveAlert(existingAlert.id);
          resolvedAlerts.push(resolvedAlert);
        }
      } catch (_error) {
        // console.error(`Error evaluating alert rule ${ruleId}:`, _error);
      }
    }

    return { newAlerts, resolvedAlerts };
  }

  private async updateSLAStatus(): Promise<SLAUpdateResult> {
    const updates: string[] = [];

    for (const [_slaId, sla] of this.slaDefinitions) {
      try {
        await this.updateSingleSLAStatus(_slaId, sla);
        updates.push(_slaId);
      } catch (_error) {
        // console.error(`Error updating SLA ${_slaId}:`, _error);
      }
    }

    return { updatedSLAs: updates };
  }

  private initializeDefaultMetrics(): void {
    // 시스템 메트릭
    this.defineMetric({
      id: 'cpu_usage',
      name: 'CPU Usage',
      type: 'gauge',
      category: 'system',
      unit: 'percent',
      description: 'CPU utilization percentage',
      thresholds: {
        critical: { value: 90, operator: 'greater_than', duration: 300 },
        warning: { value: 80, operator: 'greater_than', duration: 180 }
      },
      aggregation: 'average',
      retention: { duration: 2592000, resolution: 60 } // 30일, 1분 해상도
    });

    this.defineMetric({
      id: 'memory_usage',
      name: 'Memory Usage',
      type: 'gauge',
      category: 'system',
      unit: 'percent',
      description: 'Memory utilization percentage',
      thresholds: {
        critical: { value: 95, operator: 'greater_than', duration: 300 },
        warning: { value: 85, operator: 'greater_than', duration: 180 }
      },
      aggregation: 'average',
      retention: { duration: 2592000, resolution: 60 }
    });

    // 애플리케이션 메트릭
    this.defineMetric({
      id: 'response_time',
      name: 'Response Time',
      type: 'histogram',
      category: 'application',
      unit: 'milliseconds',
      description: 'HTTP response time',
      thresholds: {
        critical: { value: 5000, operator: 'greater_than', duration: 180 },
        warning: { value: 2000, operator: 'greater_than', duration: 120 }
      },
      aggregation: 'p95',
      retention: { duration: 2592000, resolution: 60 }
    });

    this.defineMetric({
      id: 'error_rate',
      name: 'Error Rate',
      type: 'counter',
      category: 'application',
      unit: 'percent',
      description: 'Application _error rate',
      thresholds: {
        critical: { value: 5, operator: 'greater_than', duration: 300 },
        warning: { value: 2, operator: 'greater_than', duration: 180 }
      },
      aggregation: 'rate',
      retention: { duration: 2592000, resolution: 60 }
    });
  }

  private initializeDefaultAlertRules(): void {
    // 높은 CPU 사용률 알림
    this.createAlertRule({
      name: 'High CPU Usage',
      description: 'CPU usage is consistently high',
      metricId: 'cpu_usage',
      condition: {
        expression: 'cpu_usage > 90',
        evaluationWindow: 300,
        frequency: 60,
        missingDataTreatment: 'not_breaching'
      },
      severity: 'critical',
      _channels: [
        {
          id: 'email-ops',
          type: 'email',
          name: 'Operations Email',
          configuration: { recipients: ['ops@company.com'] },
          enabled: true,
          filters: []
        }
      ],
      escalation: {
        enabled: true,
        levels: [
          { duration: 900, _channels: ['email-ops'] },
          { duration: 1800, _channels: ['email-ops', 'slack-critical'] }
        ]
      }
    });

    // 높은 에러율 알림
    this.createAlertRule({
      name: 'High Error Rate',
      description: 'Application _error rate is too high',
      metricId: 'error_rate',
      condition: {
        expression: 'error_rate > 5',
        evaluationWindow: 300,
        frequency: 60,
        missingDataTreatment: 'not_breaching'
      },
      severity: 'critical',
      _channels: [
        {
          id: 'slack-dev',
          type: 'slack',
          name: 'Development Slack',
          configuration: { webhook: 'https://hooks.slack.com/...' },
          enabled: true,
          filters: []
        }
      ],
      escalation: {
        enabled: true,
        levels: [
          { duration: 600, _channels: ['slack-dev'] },
          { duration: 1200, _channels: ['slack-dev', 'email-ops'] }
        ]
      }
    });
  }

  private initializeDefaultDashboards(): void {
    // 시스템 오버뷰 대시보드
    this.createDashboard({
      name: 'System Overview',
      description: 'High-level system health and performance metrics',
      layout: { type: 'grid', columns: 3 },
      widgets: [
        {
          id: 'cpu-widget',
          type: 'line_chart',
          title: 'CPU Usage',
          position: { row: 0, column: 0 },
          size: { width: 1, height: 1 },
          configuration: { yAxis: { min: 0, max: 100 } },
          queries: [
            {
              metricId: 'cpu_usage',
              aggregation: 'average',
              groupBy: [],
              filters: [],
              timeWindow: 3600
            }
          ]
        },
        {
          id: 'memory-widget',
          type: 'line_chart',
          title: 'Memory Usage',
          position: { row: 0, column: 1 },
          size: { width: 1, height: 1 },
          configuration: { yAxis: { min: 0, max: 100 } },
          queries: [
            {
              metricId: 'memory_usage',
              aggregation: 'average',
              groupBy: [],
              filters: [],
              timeWindow: 3600
            }
          ]
        }
      ],
      timeRange: { start: new Date(Date.now() - 3600000), end: new Date() },
      refreshInterval: 30
    });
  }

  private initializeSLADefinitions(): void {
    // 가용성 SLA
    this.defineSLA({
      name: 'Service Availability',
      service: 'ro-fan-platform',
      objective: {
        type: 'availability',
        target: 99.9,
        metricQueries: [
          {
            metricId: 'error_rate',
            aggregation: 'rate',
            groupBy: [],
            filters: [],
            timeWindow: 3600
          }
        ]
      },
      timeWindow: { type: 'monthly', duration: 30 },
      alerting: {
        enabled: true,
        thresholds: [
          { value: 99.0, severity: 'warning' },
          { value: 98.5, severity: 'critical' }
        ]
      },
      reporting: {
        frequency: 'weekly',
        recipients: ['ops@company.com'],
        includeDetails: true
      }
    });
  }

  private startMonitoringLoop(): void {
    // 메인 모니터링 루프 (30초마다)
    setInterval(async () => {
      try {
        await this.executeMonitoringCycle();
      } catch (_error) {
        // console.error('Monitoring cycle error:', _error);
      }
    }, 30000);

    // SLA 업데이트 (5분마다)
    setInterval(async () => {
      try {
        await this.updateSLAStatus();
      } catch (_error) {
        // console.error('SLA update error:', _error);
      }
    }, 300000);

    // 데이터 정리 (1시간마다)
    setInterval(async () => {
      try {
        await this.cleanupOldData();
      } catch (_error) {
        // console.error('Data cleanup error:', _error);
      }
    }, 3600000);
  }

  // 스텁 메서드들
  private async collectSystemMetrics(): Promise<void> {
    await this.recordMetric('cpu_usage', Math.random() * 100);
    await this.recordMetric('memory_usage', Math.random() * 100);
  }

  private async collectApplicationMetrics(): Promise<void> {
    await this.recordMetric('response_time', Math.random() * 1000);
    await this.recordMetric('error_rate', Math.random() * 10);
  }

  private async collectBusinessMetrics(): Promise<void> {
    // 비즈니스 메트릭 수집 로직
  }

  private async evaluateAlertCondition(_rule: AlertRule): Promise<boolean> {
    // 알림 조건 평가 로직
    return Math.random() < 0.1; // 10% 확률로 알림 트리거
  }

  private findActiveAlertByRule(ruleId: string): Alert | undefined {
    return Array.from(this.activeAlerts.values()).find(alert => alert.ruleId === ruleId);
  }

  private async getMetricDataForRule(_rule: AlertRule): Promise<MetricData[]> {
    const data = this.metricData.get(rule.metricId) || [];
    return data.slice(-10); // 최근 10개 데이터 포인트
  }

  private generateAlertDescription(_rule: AlertRule, _metricData: MetricData[]): string {
    return `Alert triggered for ${rule.name}: ${rule.description}`;
  }

  private async gatherAlertContext(_rule: AlertRule, _metricData: MetricData[]): Promise<AlertContext> {
    return {
      environment: 'production',
      service: 'ro-fan-platform',
      runbook: `https://runbooks.company.com/${rule.id}`,
      relatedMetrics: [],
      recentDeployments: []
    };
  }

  private async sendNotifications(_alert: Alert, _rule: AlertRule): Promise<void> {
    for (const _channel of rule._channels) {
      await this.notificationService.send(_channel, alert);
    }
  }

  private async sendResolutionNotifications(_alert: Alert, _rule: AlertRule): Promise<void> {
    // 해결 알림 발송 로직
  }

  private async applyRetentionPolicy(metricId: string): Promise<void> {
    const metric = this.metrics.get(metricId);
    if (!metric) return;

    const data = this.metricData.get(metricId) || [];
    const cutoff = new Date(Date.now() - metric.retention.duration * 1000);
    const filteredData = data.filter(point => point.timestamp > cutoff);
    
    this.metricData.set(metricId, filteredData);
  }

  private aggregateMetricData(data: MetricData[], query: MetricQuery): MetricQueryResult {
    return {
      metricId: query.metricId,
      aggregation: query.aggregation,
      data: data.map(point => ({ timestamp: point.timestamp, value: point.value })),
      summary: {
        count: data.length,
        average: data.reduce((sum, point) => sum + point.value, 0) / data.length,
        min: Math.min(...data.map(point => point.value)),
        max: Math.max(...data.map(point => point.value))
      }
    };
  }

  private getWidgetData(widget: Widget, timeRange: TimeRange): unknown {
    const results = widget.queries.map(query => this.queryMetrics(query, timeRange));
    return { widget: widget.id, queries: results };
  }

  private initializeSLAStatus(_sla: SLADefinition): SLAStatus {
    return {
      _slaId: sla.id,
      currentPeriod: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
        achievement: 99.5,
        target: sla.objective.target,
        status: 'meeting'
      },
      historicalData: [],
      trend: 'stable',
      budget: {
        total: 100,
        consumed: 0.5,
        remaining: 99.5
      }
    };
  }

  private async updateSingleSLAStatus(_slaId: string, _sla: SLADefinition): Promise<void> {
    // SLA 상태 업데이트 로직
  }

  private calculateSLAReport(_sla: SLADefinition, status: SLAStatus, period: SLAReportPeriod): SLAReport {
    return {
      _slaId: sla.id,
      period,
      achievement: status.currentPeriod.achievement,
      target: sla.objective.target,
      breaches: [],
      summary: `SLA ${sla.name} achieved ${status.currentPeriod.achievement}% availability`
    };
  }

  private shouldAttemptRecovery(_alert: Alert): boolean {
    return alert.escalationLevel === 0 && !alert.acknowledgedAt;
  }

  private async attemptRecovery(_alert: Alert): Promise<RecoveryAction | null> {
    return {
      alertId: alert.id,
      type: 'restart_service',
      description: 'Automatic service restart attempted',
      timestamp: new Date(),
      success: true
    };
  }

  private getRecentData(data: MetricData[], seconds: number): MetricData[] {
    const cutoff = new Date(Date.now() - seconds * 1000);
    return data.filter(point => point.timestamp > cutoff);
  }

  private getSLAStatusSummary(): SLAStatusSummary {
    const totalSLAs = this.slaDefinitions.size;
    const meetingSLAs = Array.from(this.slaStatus.values())
      .filter(status => status.currentPeriod.status === 'meeting').length;

    return {
      total: totalSLAs,
      meeting: meetingSLAs,
      failing: totalSLAs - meetingSLAs,
      overallHealth: meetingSLAs / totalSLAs * 100
    };
  }

  private calculateSystemHealth(): SystemHealthStatus {
    const criticalAlerts = Array.from(this.activeAlerts.values())
      .filter(alert => alert.severity === 'critical').length;

    if (criticalAlerts > 0) return 'critical';
    
    const warningAlerts = Array.from(this.activeAlerts.values())
      .filter(alert => alert.severity === 'warning').length;

    if (warningAlerts > 3) return 'warning';
    return 'healthy';
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // 활성 알림 기반 추천
    const criticalAlerts = Array.from(this.activeAlerts.values())
      .filter(alert => alert.severity === 'critical');
    
    if (criticalAlerts.length > 0) {
      recommendations.push('Investigate and resolve critical alerts immediately');
    }

    return recommendations;
  }

  private async cleanupOldData(): Promise<void> {
    for (const metricId of this.metricData.keys()) {
      await this.applyRetentionPolicy(metricId);
    }
  }

  private generateAlertRuleId(): string {
    return `alert-rule-${Date.now()}`;
  }

  private generateAlertId(): string {
    return `alert-${Date.now()}`;
  }

  private generateMetricId(): string {
    return `metric-${Date.now()}`;
  }

  private generateDashboardId(): string {
    return `dashboard-${Date.now()}`;
  }

  private generateSLAId(): string {
    return `sla-${Date.now()}`;
  }

  /**
   * 📊 시스템 상태 조회
   */
  getSystemStatus(): MonitoringSystemStatus {
    return {
      totalMetrics: this.metrics.size,
      activeAlerts: this.activeAlerts.size,
      totalAlertRules: this.alertRules.size,
      totalDashboards: this.dashboards.size,
      totalSLAs: this.slaDefinitions.size,
      systemHealth: this.calculateSystemHealth(),
      slaStatus: this.getSLAStatusSummary(),
      lastMonitoringCycle: new Date()
    };
  }
}

// 타입 정의들
type MetricType = 'gauge' | 'counter' | 'histogram' | 'summary';
type MetricCategory = 'system' | 'application' | 'business' | 'custom';
type AggregationType = 'sum' | 'average' | 'min' | 'max' | 'count' | 'rate' | 'p50' | 'p90' | 'p95' | 'p99';
type ComparisonOperator = 'greater_than' | 'less_than' | 'equals' | 'not_equals';
type AlertSeverity = 'info' | 'warning' | 'critical';
type AlertStatus = 'firing' | 'resolved' | 'acknowledged' | 'suppressed';
type ChannelType = 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
type WidgetType = 'line_chart' | 'bar_chart' | 'pie_chart' | 'gauge' | 'table' | 'stat';
type DataQuality = 'good' | 'degraded' | 'missing';
type SystemHealthStatus = 'healthy' | 'warning' | 'critical';
type SLATrend = 'improving' | 'stable' | 'degrading';

interface RetentionPolicy {
  duration: number; // seconds
  resolution: number; // seconds
}

interface EscalationPolicy {
  enabled: boolean;
  levels: EscalationLevel[];
}

interface EscalationLevel {
  duration: number; // seconds
  _channels: string[];
}

interface SuppressionRule {
  type: 'time_based' | 'condition_based';
  configuration: unknown;
}

interface AlertContext {
  environment: string;
  service: string;
  runbook?: string;
  relatedMetrics: string[];
  recentDeployments: unknown[];
}

interface ChannelConfig {
  [key: string]: unknown;
}

interface NotificationFilter {
  type: string;
  configuration: unknown;
}

interface DashboardLayout {
  type: 'grid' | 'free';
  columns?: number;
}

interface WidgetPosition {
  row: number;
  column: number;
}

interface WidgetSize {
  width: number;
  height: number;
}

interface WidgetConfig {
  [key: string]: unknown;
}

interface QueryFilter {
  field: string;
  operator: string;
  value: unknown;
}

interface Permission {
  type: string;
  subject: string;
}

interface TimeRange {
  start: Date;
  end: Date;
}

interface SLATimeWindow {
  type: 'rolling' | 'calendar' | 'monthly';
  duration: number;
}

interface SLAAlertConfig {
  enabled: boolean;
  thresholds: SLAThreshold[];
}

interface SLAThreshold {
  value: number;
  severity: AlertSeverity;
}

interface SLAReportConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  includeDetails: boolean;
}

interface SLAPeriodStatus {
  start: Date;
  end: Date;
  achievement: number;
  target: number;
  status: 'meeting' | 'at_risk' | 'failing';
}

interface SLABudget {
  total: number;
  consumed: number;
  remaining: number;
}

interface Anomaly {
  metricId: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  description: string;
  confidence: number;
}

interface RecoveryAction {
  alertId: string;
  type: string;
  description: string;
  timestamp: Date;
  success: boolean;
}

interface MonitoringReport {
  timestamp: Date;
  duration: number;
  metricsCollected: number;
  anomaliesDetected: number;
  alertsTriggered: number;
  alertsResolved: number;
  slaStatus: SLAStatusSummary;
  systemHealth: SystemHealthStatus;
  recommendations: string[];
}

interface MetricCollectionResult {
  totalMetrics: number;
  errors: string[];
}

interface AlertEvaluationResult {
  newAlerts: Alert[];
  resolvedAlerts: Alert[];
}

interface SLAUpdateResult {
  updatedSLAs: string[];
}

interface SLAStatusSummary {
  total: number;
  meeting: number;
  failing: number;
  overallHealth: number;
}

interface MetricQueryResult {
  metricId: string;
  aggregation: AggregationType;
  data: { timestamp: Date; value: number }[];
  summary: {
    count: number;
    average: number;
    min: number;
    max: number;
  };
}

interface DashboardData {
  dashboard: Dashboard;
  timeRange: TimeRange;
  widgetData: Map<string, unknown>;
  lastUpdated: Date;
}

interface SLAReport {
  _slaId: string;
  period: SLAReportPeriod;
  achievement: number;
  target: number;
  breaches: unknown[];
  summary: string;
}

interface MonitoringSystemStatus {
  totalMetrics: number;
  activeAlerts: number;
  totalAlertRules: number;
  totalDashboards: number;
  totalSLAs: number;
  systemHealth: SystemHealthStatus;
  slaStatus: SLAStatusSummary;
  lastMonitoringCycle: Date;
}

// 설정 인터페이스들
interface AlertRuleConfig {
  id?: string;
  name: string;
  description: string;
  metricId: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  enabled?: boolean;
  _channels: NotificationChannel[];
  escalation: EscalationPolicy;
  suppressions?: SuppressionRule[];
}

interface MetricDefinitionConfig {
  id?: string;
  name: string;
  type: MetricType;
  category: MetricCategory;
  unit: string;
  description: string;
  thresholds: MetricThresholds;
  aggregation: AggregationType;
  retention: RetentionPolicy;
  tags?: { [key: string]: string };
}

interface DashboardConfig {
  id?: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  widgets: Widget[];
  timeRange: TimeRange;
  refreshInterval?: number;
  permissions?: Permission[];
  tags?: string[];
}

interface SLADefinitionConfig {
  id?: string;
  name: string;
  service: string;
  objective: SLAObjective;
  timeWindow: SLATimeWindow;
  alerting: SLAAlertConfig;
  reporting: SLAReportConfig;
}

type SLAReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

// Mock 클래스들
class AnomalyDetector {
  async detect(metricId: string, _data: MetricData[]): Promise<Anomaly[]> {
    if (Math.random() < 0.05) { // 5% 확률로 이상 탐지
      return [{
        metricId,
        timestamp: new Date(),
        severity: 'medium',
        description: 'Unusual pattern detected',
        confidence: 0.8
      }];
    }
    return [];
  }
}

class NotificationService {
  async send(_channel: NotificationChannel, _alert: Alert): Promise<void> {
    // console.log(`Sending notification via ${_channel.type}:`, alert.title);
  }
}

class MetricCollector {
  async collect(metricId: string): Promise<MetricData[]> {
    return [{
      metricId,
      timestamp: new Date(),
      value: Math.random() * 100,
      tags: new Map(),
      source: 'collector',
      quality: 'good'
    }];
  }
}

export default MonitoringAlertingSystem;