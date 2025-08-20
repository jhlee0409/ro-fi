/**
 * 🎯 Enterprise-Grade Structured Logging Framework
 * 
 * 목적: 중앙화된 구조화 로깅 및 성능 최적화
 * 특징: 로그 레벨, 파일 회전, 버퍼링, JSON 구조화
 * 
 * @version 1.0.0
 * @author SuperClaude Framework
 */

import fs from 'fs/promises';
import path from 'path';
import { getConfig } from './configuration-manager.js';

/**
 * 로그 레벨 정의
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1, 
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

export const LogLevelNames = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL'
};

/**
 * 로그 포매터
 */
export class LogFormatter {
  static formatStructured(entry) {
    return {
      timestamp: entry.timestamp,
      level: LogLevelNames[entry.level],
      logger: entry.logger,
      message: entry.message,
      data: entry.data,
      context: entry.context,
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack
      } : undefined,
      performance: entry.performance,
      requestId: entry.requestId
    };
  }

  static formatConsole(entry) {
    const emoji = {
      [LogLevel.DEBUG]: '🐛',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
      [LogLevel.FATAL]: '💀'
    }[entry.level];

    const timestamp = new Date(entry.timestamp).toISOString();
    const level = LogLevelNames[entry.level];
    const logger = entry.logger ? `[${entry.logger}]` : '';
    
    let output = `${emoji} ${timestamp} ${level} ${logger} ${entry.message}`;
    
    if (entry.data) {
      output += `\n   Data: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    if (entry.error) {
      output += `\n   Error: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n   Stack: ${entry.error.stack}`;
      }
    }
    
    if (entry.performance) {
      output += `\n   Performance: ${JSON.stringify(entry.performance)}`;
    }
    
    return output;
  }
}

/**
 * 파일 로그 라이터 (회전 지원)
 */
export class FileLogWriter {
  constructor(logPath, maxSize = 10 * 1024 * 1024) { // 10MB default
    this.logPath = logPath;
    this.maxSize = maxSize;
    this.writeBuffer = [];
    this.flushInterval = 5000; // 5초마다 플러시
    this.isFlushingPaused = false;
    
    // 주기적 플러시 시작
    this.startPeriodicFlush();
    
    // 프로세스 종료시 남은 로그 플러시
    process.on('exit', () => this.flush());
    process.on('SIGINT', () => this.flush());
    process.on('SIGTERM', () => this.flush());
  }

  async write(entry) {
    this.writeBuffer.push(JSON.stringify(LogFormatter.formatStructured(entry)));
    
    // 버퍼가 너무 크면 즉시 플러시
    if (this.writeBuffer.length >= 100) {
      await this.flush();
    }
  }

  async flush() {
    if (this.writeBuffer.length === 0 || this.isFlushingPaused) return;
    
    try {
      const content = this.writeBuffer.join('\n') + '\n';
      this.writeBuffer = [];
      
      // 파일 크기 확인
      await this.rotateIfNeeded();
      
      // 로그 디렉토리 생성
      await fs.mkdir(path.dirname(this.logPath), { recursive: true });
      
      // 파일에 추가
      await fs.appendFile(this.logPath, content, 'utf8');
      
    } catch (error) {
      console.error('Failed to write log file:', error.message);
      // 에러 발생시 콘솔에라도 출력
      this.writeBuffer.forEach(log => console.log(log));
      this.writeBuffer = [];
    }
  }

  async rotateIfNeeded() {
    try {
      const stats = await fs.stat(this.logPath);
      if (stats.size >= this.maxSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedPath = `${this.logPath}.${timestamp}`;
        await fs.rename(this.logPath, rotatedPath);
        
        // 오래된 로그 파일 정리 (30개 이상 유지하지 않음)
        await this.cleanupOldLogs();
      }
    } catch (error) {
      // 파일이 없으면 회전 불필요
      if (error.code !== 'ENOENT') {
        console.warn('Log rotation warning:', error.message);
      }
    }
  }

  async cleanupOldLogs() {
    try {
      const dir = path.dirname(this.logPath);
      const basename = path.basename(this.logPath);
      const files = await fs.readdir(dir);
      
      const logFiles = files
        .filter(file => file.startsWith(basename + '.'))
        .map(file => path.join(dir, file))
        .sort((a, b) => b.localeCompare(a)); // 최신순 정렬
      
      // 30개 이상이면 오래된 것 삭제
      if (logFiles.length > 30) {
        const filesToDelete = logFiles.slice(30);
        for (const file of filesToDelete) {
          await fs.unlink(file);
        }
      }
    } catch (error) {
      console.warn('Log cleanup warning:', error.message);
    }
  }

  startPeriodicFlush() {
    setInterval(() => {
      this.flush().catch(error => {
        console.error('Periodic flush error:', error.message);
      });
    }, this.flushInterval);
  }
}

/**
 * 🎯 중앙화된 로깅 시스템
 */
export class Logger {
  constructor(name = 'root') {
    this.name = name;
    this.context = {};
    this.requestId = null;
    this.startTime = Date.now();
  }

  /**
   * 컨텍스트 설정
   */
  withContext(context) {
    const newLogger = new Logger(this.name);
    newLogger.context = { ...this.context, ...context };
    newLogger.requestId = this.requestId;
    return newLogger;
  }

  /**
   * 요청 ID 설정 (트레이싱용)
   */
  withRequestId(requestId) {
    const newLogger = new Logger(this.name);
    newLogger.context = { ...this.context };
    newLogger.requestId = requestId;
    return newLogger;
  }

  /**
   * 성능 측정 로거
   */
  withPerformance(operation) {
    const startTime = Date.now();
    const logger = this.withContext({ operation, startTime });
    
    return {
      end: (data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        logger.info(`${operation} completed`, {
          ...data,
          performance: { duration, startTime, endTime }
        });
        return duration;
      },
      
      logger: logger
    };
  }

  /**
   * 로그 레벨별 메서드들
   */
  debug(message, data, error) {
    return this.log(LogLevel.DEBUG, message, data, error);
  }

  info(message, data, error) {
    return this.log(LogLevel.INFO, message, data, error);
  }

  warn(message, data, error) {
    return this.log(LogLevel.WARN, message, data, error);
  }

  error(message, data, error) {
    return this.log(LogLevel.ERROR, message, data, error);
  }

  fatal(message, data, error) {
    return this.log(LogLevel.FATAL, message, data, error);
  }

  /**
   * 핵심 로깅 메서드
   */
  async log(level, message, data, error) {
    try {
      const config = await getConfig();
      const minLevel = this.getMinLogLevel(config.get('environment.LOG_LEVEL'));
      
      // 로그 레벨 필터링
      if (level < minLevel) {
        return;
      }

      const entry = {
        timestamp: Date.now(),
        level,
        logger: this.name,
        message,
        data,
        context: this.context,
        error,
        requestId: this.requestId,
        performance: this.calculatePerformance()
      };

      // 콘솔 출력 (개발 환경 또는 ERROR 이상)
      if (config.isDevelopment() || level >= LogLevel.ERROR) {
        console.log(LogFormatter.formatConsole(entry));
      }

      // 파일 출력 (프로덕션 환경)
      if (config.isProduction() || config.isTest()) {
        const logPath = config.getAbsolutePath('storage.DATA_ROOT_PATH', 'storage.LOGS_PATH', 'app.log');
        if (!this.fileWriter) {
          this.fileWriter = new FileLogWriter(logPath);
        }
        await this.fileWriter.write(entry);
      }

      // FATAL 레벨은 프로세스 종료
      if (level === LogLevel.FATAL) {
        process.exit(1);
      }

    } catch (error) {
      // 로깅 시스템 자체에 문제가 있으면 콘솔에 직접 출력
      console.error('Logging system error:', error.message);
      console.log(`[${LogLevelNames[level]}] ${message}`, data, error);
    }
  }

  getMinLogLevel(levelName) {
    switch (levelName?.toLowerCase()) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      case 'fatal': return LogLevel.FATAL;
      default: return LogLevel.INFO;
    }
  }

  calculatePerformance() {
    const now = Date.now();
    const uptime = now - this.startTime;
    return {
      uptime,
      memoryUsage: process.memoryUsage(),
      timestamp: now
    };
  }
}

/**
 * 🎯 로거 팩토리
 */
export class LoggerFactory {
  static loggers = new Map();

  static getLogger(name = 'root') {
    if (!this.loggers.has(name)) {
      this.loggers.set(name, new Logger(name));
    }
    return this.loggers.get(name);
  }

  static createLogger(name) {
    const logger = new Logger(name);
    this.loggers.set(name, logger);
    return logger;
  }

  static getAllLoggers() {
    return Array.from(this.loggers.values());
  }
}

/**
 * 편의 함수들
 */
export const createLogger = (name) => LoggerFactory.getLogger(name);
export const getLogger = (name) => LoggerFactory.getLogger(name);

// 기본 로거 내보내기
export const logger = LoggerFactory.getLogger('app');

/**
 * 기존 console 메서드 프록시 (점진적 마이그레이션용)
 */
export function interceptConsole() {
  const originalConsole = { ...console };
  
  console.log = (...args) => {
    logger.info(args.join(' '));
    originalConsole.log(...args);
  };
  
  console.warn = (...args) => {
    logger.warn(args.join(' '));
    originalConsole.warn(...args);
  };
  
  console.error = (...args) => {
    logger.error(args.join(' '));
    originalConsole.error(...args);
  };
  
  // 복원 함수 반환
  return () => {
    Object.assign(console, originalConsole);
  };
}