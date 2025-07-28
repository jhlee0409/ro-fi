/**
 * 알림 시스템
 * 크리티컬 에러, 성능 이슈, 시스템 장애 알림
 */

import { getLogger, LogLevel } from './logging-service.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 알림 규칙 정의
 */
export const AlertRule = {
  ERROR_RATE: 'error_rate',
  MEMORY_LIMIT: 'memory_limit',
  API_FAILURE: 'api_failure',
  PERFORMANCE_DEGRADATION: 'performance_degradation',
  TOKEN_LIMIT: 'token_limit',
  COST_LIMIT: 'cost_limit',
  AUTOMATION_FAILURE: 'automation_failure',
  CONTENT_QUALITY: 'content_quality'
};

/**
 * 알림 심각도
 */
export const AlertSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * 알림 시스템
 */
export class AlertSystem {
  constructor(config = {}) {
    this.config = {
      enableEmail: config.enableEmail || false,
      enableWebhook: config.enableWebhook || false,
      enableFile: config.enableFile !== false,
      enableConsole: config.enableConsole !== false,
      webhookUrl: config.webhookUrl,
      emailConfig: config.emailConfig,
      alertsDir: config.alertsDir || path.join(__dirname, '../../logs/alerts'),
      cooldownPeriod: config.cooldownPeriod || 300000, // 5분
      aggregationWindow: config.aggregationWindow || 60000, // 1분
      ...config
    };

    this.logger = getLogger();
    this.alertHandlers = new Map();
    this.alertHistory = new Map();
    this.cooldowns = new Map();
    this.pendingAlerts = [];

    this.initialize();
  }

  async initialize() {
    // 알림 디렉토리 생성
    if (this.config.enableFile) {
      await fs.mkdir(this.config.alertsDir, { recursive: true });
    }

    // 기본 핸들러 등록
    this.registerDefaultHandlers();

    // 알림 집계 시작
    this.startAlertAggregation();
  }

  /**
   * 알림 규칙 등록
   */
  registerRule(rule, handler, config = {}) {
    this.alertHandlers.set(rule, {
      handler,
      config: {
        severity: config.severity || AlertSeverity.WARNING,
        cooldown: config.cooldown || this.config.cooldownPeriod,
        threshold: config.threshold || 1,
        window: config.window || this.config.aggregationWindow,
        ...config
      }
    });
  }

  /**
   * 알림 트리거
   */
  async triggerAlert(rule, data = {}) {
    // 쿨다운 체크
    if (this.isInCooldown(rule)) {
      return false;
    }

    const ruleConfig = this.alertHandlers.get(rule);
    if (!ruleConfig) {
      this.logger.warn(`Unknown alert rule: ${rule}`);
      return false;
    }

    const alert = {
      id: `${rule}-${Date.now()}`,
      rule,
      severity: ruleConfig.config.severity,
      timestamp: new Date().toISOString(),
      data,
      message: await this.formatAlertMessage(rule, data)
    };

    // 임계값 체크를 위한 대기열 추가
    this.pendingAlerts.push(alert);

    // 알림 이력 추가
    this.addToHistory(rule, alert);

    return true;
  }

  /**
   * 알림 처리
   */
  async processAlert(alert) {
    try {
      // 콘솔 출력
      if (this.config.enableConsole) {
        await this.logToConsole(alert);
      }

      // 파일 저장
      if (this.config.enableFile) {
        await this.saveToFile(alert);
      }

      // 웹훅 전송
      if (this.config.enableWebhook && this.config.webhookUrl) {
        await this.sendWebhook(alert);
      }

      // 이메일 전송
      if (this.config.enableEmail && this.config.emailConfig) {
        await this.sendEmail(alert);
      }

      // 커스텀 핸들러 실행
      const ruleConfig = this.alertHandlers.get(alert.rule);
      if (ruleConfig && ruleConfig.handler) {
        await ruleConfig.handler(alert);
      }

      // 쿨다운 설정
      this.setCooldown(alert.rule, ruleConfig.config.cooldown);

    } catch (error) {
      console.error('Failed to process alert:', error);
    }
  }

  /**
   * 기본 핸들러 등록
   */
  registerDefaultHandlers() {
    // 에러율 알림
    this.registerRule(AlertRule.ERROR_RATE, async (alert) => {
      await this.logger.critical('High error rate detected', alert);
    }, {
      severity: AlertSeverity.CRITICAL,
      threshold: 5,
      window: 300000 // 5분
    });

    // 메모리 한계 알림
    this.registerRule(AlertRule.MEMORY_LIMIT, async (alert) => {
      await this.logger.error('Memory limit exceeded', alert);
    }, {
      severity: AlertSeverity.ERROR,
      cooldown: 600000 // 10분
    });

    // API 실패 알림
    this.registerRule(AlertRule.API_FAILURE, async (alert) => {
      await this.logger.error('API failure', alert);
    }, {
      severity: AlertSeverity.ERROR,
      threshold: 3,
      window: 60000 // 1분
    });

    // 성능 저하 알림
    this.registerRule(AlertRule.PERFORMANCE_DEGRADATION, async (alert) => {
      await this.logger.warn('Performance degradation detected', alert);
    }, {
      severity: AlertSeverity.WARNING
    });

    // 토큰 한계 알림
    this.registerRule(AlertRule.TOKEN_LIMIT, async (alert) => {
      await this.logger.warn('Token limit approaching', alert);
    }, {
      severity: AlertSeverity.WARNING
    });

    // 비용 한계 알림
    this.registerRule(AlertRule.COST_LIMIT, async (alert) => {
      await this.logger.error('Cost limit exceeded', alert);
    }, {
      severity: AlertSeverity.ERROR,
      cooldown: 3600000 // 1시간
    });

    // 자동화 실패 알림
    this.registerRule(AlertRule.AUTOMATION_FAILURE, async (alert) => {
      await this.logger.critical('Automation failure', alert);
    }, {
      severity: AlertSeverity.CRITICAL
    });

    // 콘텐츠 품질 알림
    this.registerRule(AlertRule.CONTENT_QUALITY, async (alert) => {
      await this.logger.warn('Low content quality detected', alert);
    }, {
      severity: AlertSeverity.WARNING
    });
  }

  /**
   * 알림 메시지 포맷팅
   */
  async formatAlertMessage(rule, data) {
    const templates = {
      [AlertRule.ERROR_RATE]: `Error rate: ${data.rate}% (threshold: ${data.threshold}%)`,
      [AlertRule.MEMORY_LIMIT]: `Memory usage: ${data.used}MB / ${data.limit}MB (${data.percentage}%)`,
      [AlertRule.API_FAILURE]: `API ${data.api} failed: ${data.error}`,
      [AlertRule.PERFORMANCE_DEGRADATION]: `Performance degraded: ${data.metric} is ${data.value} (expected: <${data.expected})`,
      [AlertRule.TOKEN_LIMIT]: `Token usage: ${data.used} / ${data.limit} (${data.percentage}%)`,
      [AlertRule.COST_LIMIT]: `Cost: $${data.current} / $${data.limit} (${data.percentage}%)`,
      [AlertRule.AUTOMATION_FAILURE]: `Automation failed: ${data.task} - ${data.error}`,
      [AlertRule.CONTENT_QUALITY]: `Content quality: ${data.score}/100 (minimum: ${data.minimum})`
    };

    return templates[rule] || `Alert: ${rule} - ${JSON.stringify(data)}`;
  }

  /**
   * 알림 집계 및 처리
   */
  async aggregateAndProcessAlerts() {
    const now = Date.now();
    const processedRules = new Set();

    // 규칙별로 그룹화
    const alertsByRule = {};
    this.pendingAlerts.forEach(alert => {
      alertsByRule[alert.rule] = alertsByRule[alert.rule] || [];
      alertsByRule[alert.rule].push(alert);
    });

    // 각 규칙별로 처리
    for (const [rule, alerts] of Object.entries(alertsByRule)) {
      const ruleConfig = this.alertHandlers.get(rule);
      if (!ruleConfig) continue;

      // 시간 창 내의 알림만 필터링
      const recentAlerts = alerts.filter(a => 
        now - new Date(a.timestamp).getTime() < ruleConfig.config.window
      );

      // 임계값 체크
      if (recentAlerts.length >= ruleConfig.config.threshold) {
        // 집계된 알림 생성
        const aggregatedAlert = {
          ...recentAlerts[0],
          count: recentAlerts.length,
          data: {
            alerts: recentAlerts.map(a => a.data),
            aggregated: true
          }
        };

        await this.processAlert(aggregatedAlert);
        processedRules.add(rule);
      }
    }

    // 처리된 알림 제거
    this.pendingAlerts = this.pendingAlerts.filter(alert => 
      !processedRules.has(alert.rule) || 
      now - new Date(alert.timestamp).getTime() < this.config.aggregationWindow
    );
  }

  /**
   * 알림 전송 메서드
   */
  async logToConsole(alert) {
    const colors = {
      [AlertSeverity.INFO]: '\x1b[36m',
      [AlertSeverity.WARNING]: '\x1b[33m',
      [AlertSeverity.ERROR]: '\x1b[31m',
      [AlertSeverity.CRITICAL]: '\x1b[35m'
    };

    const color = colors[alert.severity] || '\x1b[0m';
    const reset = '\x1b[0m';

    console.log(`${color}[ALERT] [${alert.severity.toUpperCase()}] ${alert.message}${reset}`);
    if (alert.data) {
      console.log('Details:', alert.data);
    }
  }

  async saveToFile(alert) {
    const fileName = `alerts-${new Date().toISOString().split('T')[0]}.json`;
    const filePath = path.join(this.config.alertsDir, fileName);

    try {
      let alerts = [];
      try {
        const existing = await fs.readFile(filePath, 'utf8');
        alerts = JSON.parse(existing);
      } catch {
        // 파일이 없으면 새로 생성
      }

      alerts.push(alert);
      await fs.writeFile(filePath, JSON.stringify(alerts, null, 2));
    } catch (error) {
      console.error('Failed to save alert to file:', error);
    }
  }

  async sendWebhook(alert) {
    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ro-fan-alert',
          alert
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  }

  async sendEmail(alert) {
    // 이메일 전송 로직 (실제 구현시 nodemailer 등 사용)
    console.log('Email alert would be sent:', alert);
  }

  /**
   * 알림 상태 관리
   */
  isInCooldown(rule) {
    const cooldownUntil = this.cooldowns.get(rule);
    return cooldownUntil && Date.now() < cooldownUntil;
  }

  setCooldown(rule, duration) {
    this.cooldowns.set(rule, Date.now() + duration);
  }

  addToHistory(rule, alert) {
    if (!this.alertHistory.has(rule)) {
      this.alertHistory.set(rule, []);
    }

    const history = this.alertHistory.get(rule);
    history.push(alert);

    // 최대 100개 이력 유지
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * 알림 통계
   */
  getAlertStatistics() {
    const stats = {
      total: 0,
      byRule: {},
      bySeverity: {},
      recentAlerts: []
    };

    for (const [rule, history] of this.alertHistory) {
      stats.byRule[rule] = history.length;
      stats.total += history.length;

      history.forEach(alert => {
        stats.bySeverity[alert.severity] = 
          (stats.bySeverity[alert.severity] || 0) + 1;
      });

      // 최근 알림 추가
      stats.recentAlerts.push(...history.slice(-5));
    }

    // 최근 알림 정렬
    stats.recentAlerts.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    stats.recentAlerts = stats.recentAlerts.slice(0, 10);

    return stats;
  }

  /**
   * 알림 테스트
   */
  async testAlert(rule, testData = {}) {
    console.log(`Testing alert rule: ${rule}`);
    
    const alert = {
      id: `test-${Date.now()}`,
      rule,
      severity: AlertSeverity.INFO,
      timestamp: new Date().toISOString(),
      data: { ...testData, test: true },
      message: `TEST: ${await this.formatAlertMessage(rule, testData)}`
    };

    await this.processAlert(alert);
    return alert;
  }

  startAlertAggregation() {
    setInterval(() => {
      this.aggregateAndProcessAlerts().catch(console.error);
    }, 10000); // 10초마다
  }
}

// 싱글톤 인스턴스
let alertSystemInstance = null;

export function getAlertSystem(config) {
  if (!alertSystemInstance) {
    alertSystemInstance = new AlertSystem(config);
  }
  return alertSystemInstance;
}