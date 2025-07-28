/**
 * 통합 로깅 및 모니터링 서비스
 * 
 * 주요 기능:
 * - 구조화된 로깅 with levels (debug, info, warn, error, critical)
 * - AI 작업 전용 로깅
 * - 성능 메트릭 수집
 * - 로그 로테이션 및 보관
 * - 실시간 모니터링 지원
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 로그 레벨 정의
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
};

// 로그 카테고리 정의
export const LogCategory = {
  SYSTEM: 'SYSTEM',
  AI_OPERATION: 'AI_OPERATION',
  AUTOMATION: 'AUTOMATION',
  PERFORMANCE: 'PERFORMANCE',
  SECURITY: 'SECURITY',
  CONTENT: 'CONTENT',
  API: 'API',
  ERROR: 'ERROR'
};

// 메트릭 타입 정의
export const MetricType = {
  API_CALL: 'API_CALL',
  GENERATION_TIME: 'GENERATION_TIME',
  TOKEN_USAGE: 'TOKEN_USAGE',
  MEMORY_USAGE: 'MEMORY_USAGE',
  ERROR_RATE: 'ERROR_RATE',
  SUCCESS_RATE: 'SUCCESS_RATE'
};

/**
 * 통합 로깅 서비스
 */
export class LoggingService {
  constructor(config = {}) {
    this.config = {
      logLevel: config.logLevel || LogLevel.INFO,
      logDir: config.logDir || path.join(__dirname, '../../logs'),
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      maxFiles: config.maxFiles || 10,
      enableConsole: config.enableConsole !== false,
      enableFile: config.enableFile !== false,
      enableMetrics: config.enableMetrics !== false,
      enableStructuredLogs: config.enableStructuredLogs !== false,
      dateFormat: config.dateFormat || 'YYYY-MM-DD',
      ...config
    };

    // 로그 버퍼 (성능 최적화)
    this.logBuffer = [];
    this.bufferSize = config.bufferSize || 100;
    this.flushInterval = config.flushInterval || 5000; // 5초

    // 메트릭 수집기
    this.metrics = new Map();
    
    // 알림 핸들러
    this.alertHandlers = [];

    // 초기화
    this.initialize();
  }

  async initialize() {
    // 로그 디렉토리 생성
    await this.ensureLogDirectory();
    
    // 버퍼 플러시 타이머 설정
    this.startBufferFlush();
    
    // 메트릭 수집 시작
    if (this.config.enableMetrics) {
      this.startMetricsCollection();
    }
  }

  /**
   * 기본 로깅 메서드
   */
  async log(level, message, metadata = {}) {
    if (level < this.config.logLevel) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: this.getLevelName(level),
      message,
      ...metadata,
      pid: process.pid,
      memory: process.memoryUsage()
    };

    // 콘솔 출력
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // 버퍼에 추가
    if (this.config.enableFile) {
      this.logBuffer.push(logEntry);
      
      // 버퍼가 가득 차면 즉시 플러시
      if (this.logBuffer.length >= this.bufferSize) {
        await this.flushBuffer();
      }
    }

    // 크리티컬 에러는 즉시 알림
    if (level === LogLevel.CRITICAL) {
      await this.sendAlert(logEntry);
    }
  }

  // 편의 메서드
  debug(message, metadata) { return this.log(LogLevel.DEBUG, message, metadata); }
  info(message, metadata) { return this.log(LogLevel.INFO, message, metadata); }
  warn(message, metadata) { return this.log(LogLevel.WARN, message, metadata); }
  error(message, metadata) { return this.log(LogLevel.ERROR, message, metadata); }
  critical(message, metadata) { return this.log(LogLevel.CRITICAL, message, metadata); }

  /**
   * AI 작업 전용 로깅
   */
  async logAIOperation(operation, metadata = {}) {
    const aiLogEntry = {
      category: LogCategory.AI_OPERATION,
      operation,
      ...metadata,
      // AI 특화 메타데이터
      model: metadata.model || 'unknown',
      tokens: metadata.tokens || { input: 0, output: 0 },
      cost: metadata.cost || 0,
      duration: metadata.duration || 0,
      success: metadata.success !== false,
      error: metadata.error || null
    };

    await this.log(LogLevel.INFO, `AI Operation: ${operation}`, aiLogEntry);

    // 메트릭 업데이트
    if (this.config.enableMetrics) {
      await this.updateMetrics(MetricType.API_CALL, aiLogEntry);
      await this.updateMetrics(MetricType.TOKEN_USAGE, aiLogEntry.tokens);
    }
  }

  /**
   * 성능 로깅
   */
  async logPerformance(operation, duration, metadata = {}) {
    const perfLogEntry = {
      category: LogCategory.PERFORMANCE,
      operation,
      duration,
      ...metadata
    };

    await this.log(LogLevel.INFO, `Performance: ${operation} took ${duration}ms`, perfLogEntry);

    // 메트릭 업데이트
    if (this.config.enableMetrics) {
      await this.updateMetrics(MetricType.GENERATION_TIME, { operation, duration });
    }
  }

  /**
   * 구조화된 로깅 (JSON 형식)
   */
  async logStructured(data) {
    if (!this.config.enableStructuredLogs) return;

    const structuredEntry = {
      timestamp: new Date().toISOString(),
      type: 'structured',
      data
    };

    const fileName = `structured-${this.getDateString()}.jsonl`;
    const filePath = path.join(this.config.logDir, fileName);

    try {
      await fs.appendFile(filePath, JSON.stringify(structuredEntry) + '\n');
    } catch (error) {
      console.error('Failed to write structured log:', error);
    }
  }

  /**
   * 메트릭 업데이트
   */
  async updateMetrics(type, value) {
    const key = `${type}_${this.getDateString()}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        type,
        date: this.getDateString(),
        values: [],
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        avg: 0
      });
    }

    const metric = this.metrics.get(key);
    const numValue = typeof value === 'object' ? 
      (value.duration || value.total || value.count || 0) : value;

    metric.values.push(numValue);
    metric.count++;
    metric.sum += numValue;
    metric.min = Math.min(metric.min, numValue);
    metric.max = Math.max(metric.max, numValue);
    metric.avg = metric.sum / metric.count;

    // 메트릭 저장 (1시간마다)
    if (metric.count % 100 === 0) {
      await this.saveMetrics();
    }
  }

  /**
   * 로그 버퍼 플러시
   */
  async flushBuffer() {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // 날짜별 로그 파일
      const fileName = `app-${this.getDateString()}.log`;
      const filePath = path.join(this.config.logDir, fileName);

      // 로그 포맷팅
      const logLines = logs.map(entry => {
        if (this.config.enableStructuredLogs) {
          return JSON.stringify(entry);
        } else {
          return `[${entry.timestamp}] [${entry.level}] ${entry.message} ${JSON.stringify(entry)}`;
        }
      }).join('\n') + '\n';

      // 파일에 추가
      await fs.appendFile(filePath, logLines);

      // 파일 크기 체크 및 로테이션
      await this.checkAndRotateLog(filePath);
    } catch (error) {
      console.error('Failed to flush log buffer:', error);
    }
  }

  /**
   * 로그 로테이션
   */
  async checkAndRotateLog(filePath) {
    try {
      const stats = await fs.stat(filePath);
      
      if (stats.size > this.config.maxFileSize) {
        // 로테이션 실행
        const baseName = path.basename(filePath, '.log');
        const rotatedPath = path.join(
          this.config.logDir, 
          `${baseName}-${Date.now()}.log`
        );
        
        await fs.rename(filePath, rotatedPath);
        
        // 오래된 로그 파일 정리
        await this.cleanOldLogs();
      }
    } catch (error) {
      // 파일이 없으면 무시
      if (error.code !== 'ENOENT') {
        console.error('Log rotation error:', error);
      }
    }
  }

  /**
   * 오래된 로그 정리
   */
  async cleanOldLogs() {
    try {
      const files = await fs.readdir(this.config.logDir);
      const logFiles = files
        .filter(f => f.endsWith('.log'))
        .map(f => ({
          name: f,
          path: path.join(this.config.logDir, f)
        }));

      // 수정 시간순 정렬
      const fileStats = await Promise.all(
        logFiles.map(async f => ({
          ...f,
          mtime: (await fs.stat(f.path)).mtime
        }))
      );

      fileStats.sort((a, b) => b.mtime - a.mtime);

      // 최대 파일 수 초과시 삭제
      if (fileStats.length > this.config.maxFiles) {
        const toDelete = fileStats.slice(this.config.maxFiles);
        await Promise.all(toDelete.map(f => fs.unlink(f.path)));
      }
    } catch (error) {
      console.error('Failed to clean old logs:', error);
    }
  }

  /**
   * 메트릭 저장
   */
  async saveMetrics() {
    if (!this.config.enableMetrics) return;

    const metricsData = Object.fromEntries(this.metrics);
    const fileName = `metrics-${this.getDateString()}.json`;
    const filePath = path.join(this.config.logDir, fileName);

    try {
      await fs.writeFile(filePath, JSON.stringify(metricsData, null, 2));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * 알림 전송
   */
  async sendAlert(logEntry) {
    for (const handler of this.alertHandlers) {
      try {
        await handler(logEntry);
      } catch (error) {
        console.error('Alert handler error:', error);
      }
    }
  }

  /**
   * 알림 핸들러 등록
   */
  addAlertHandler(handler) {
    this.alertHandlers.push(handler);
  }

  /**
   * 콘솔 출력 포맷팅
   */
  logToConsole(entry) {
    const colors = {
      DEBUG: '\x1b[36m',    // Cyan
      INFO: '\x1b[32m',     // Green
      WARN: '\x1b[33m',     // Yellow
      ERROR: '\x1b[31m',    // Red
      CRITICAL: '\x1b[35m'  // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level] || reset;

    console.log(
      `${color}[${entry.timestamp}] [${entry.level}]${reset} ${entry.message}`,
      entry.category ? `[${entry.category}]` : '',
      entry
    );
  }

  /**
   * 유틸리티 메서드
   */
  getLevelName(level) {
    const names = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    return names[level] || 'UNKNOWN';
  }

  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.config.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  startBufferFlush() {
    this.flushTimer = setInterval(() => {
      this.flushBuffer().catch(console.error);
    }, this.config.flushInterval);
  }

  startMetricsCollection() {
    // 시스템 메트릭 수집 (1분마다)
    this.metricsTimer = setInterval(() => {
      const memUsage = process.memoryUsage();
      this.updateMetrics(MetricType.MEMORY_USAGE, memUsage.heapUsed);
    }, 60000);
  }

  /**
   * 서비스 종료 처리
   */
  async shutdown() {
    // 타이머 정리
    if (this.flushTimer) clearInterval(this.flushTimer);
    if (this.metricsTimer) clearInterval(this.metricsTimer);

    // 남은 로그 플러시
    await this.flushBuffer();
    
    // 메트릭 저장
    await this.saveMetrics();
  }
}

// 싱글톤 인스턴스
let loggingInstance = null;

/**
 * 로깅 서비스 인스턴스 가져오기
 */
export function getLogger(config) {
  if (!loggingInstance) {
    loggingInstance = new LoggingService(config);
  }
  return loggingInstance;
}

/**
 * 전역 로거 설정
 */
export function configureLogging(config) {
  loggingInstance = new LoggingService(config);
  return loggingInstance;
}