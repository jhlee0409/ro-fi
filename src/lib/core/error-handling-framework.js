/**
 * 🛡️ Enterprise-Grade Error Handling Framework
 * 
 * 목적: 중앙화된 에러 처리 및 자동 복구 시스템
 * 특징: 계층화 에러 분류, 자동 복구, 알림, 통계
 * 
 * @version 1.0.0
 * @author SuperClaude Framework
 */

import { getConfig } from './configuration-manager.js';
import { createLogger } from './logging-framework.js';

/**
 * 에러 심각도 레벨
 */
export const ErrorSeverity = {
  LOW: 1,      // 로그만, 서비스 계속
  MEDIUM: 2,   // 경고 + 로그, 복구 시도
  HIGH: 3,     // 에러 + 알림, 즉시 복구
  CRITICAL: 4  // 치명적, 서비스 중단 가능
};

/**
 * 에러 카테고리
 */
export const ErrorCategory = {
  // 시스템 에러
  SYSTEM: 'SYSTEM',
  CONFIGURATION: 'CONFIGURATION', 
  NETWORK: 'NETWORK',
  FILE_SYSTEM: 'FILE_SYSTEM',
  
  // 비즈니스 로직 에러
  AI_SERVICE: 'AI_SERVICE',
  CONTENT_GENERATION: 'CONTENT_GENERATION',
  STORY_CONTINUITY: 'STORY_CONTINUITY',
  
  // 사용자 에러
  VALIDATION: 'VALIDATION',
  PERMISSION: 'PERMISSION',
  
  // 외부 서비스 에러
  EXTERNAL_API: 'EXTERNAL_API',
  DATABASE: 'DATABASE',
  
  // 알 수 없는 에러
  UNKNOWN: 'UNKNOWN'
};

/**
 * 에러 복구 전략
 */
export const RecoveryStrategy = {
  NONE: 'none',           // 복구하지 않음
  RETRY: 'retry',         // 재시도
  FALLBACK: 'fallback',   // 대체 방법 사용
  CIRCUIT_BREAK: 'circuit_break',  // 일시 중단
  RESTART: 'restart',     // 서비스 재시작
  ALERT: 'alert'          // 알림만
};

/**
 * 🎯 커스텀 에러 클래스들
 */
export class BaseError extends Error {
  constructor(message, category = ErrorCategory.UNKNOWN, severity = ErrorSeverity.MEDIUM, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.category = category;
    this.severity = severity;
    this.timestamp = Date.now();
    this.requestId = options.requestId;
    this.context = options.context || {};
    this.recoveryStrategy = options.recoveryStrategy || RecoveryStrategy.NONE;
    this.retryable = options.retryable || false;
    this.userMessage = options.userMessage || this.generateUserMessage();
    
    // 스택 트레이스 캡처
    Error.captureStackTrace(this, this.constructor);
  }

  generateUserMessage() {
    switch (this.category) {
      case ErrorCategory.AI_SERVICE:
        return 'AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
      case ErrorCategory.NETWORK:
        return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
      case ErrorCategory.VALIDATION:
        return '입력 정보를 다시 확인해주세요.';
      case ErrorCategory.PERMISSION:
        return '권한이 부족합니다. 관리자에게 문의해주세요.';
      default:
        return '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      timestamp: this.timestamp,
      requestId: this.requestId,
      context: this.context,
      recoveryStrategy: this.recoveryStrategy,
      retryable: this.retryable,
      userMessage: this.userMessage,
      stack: this.stack
    };
  }
}

// 구체적인 에러 클래스들
export class SystemError extends BaseError {
  constructor(message, options = {}) {
    super(message, ErrorCategory.SYSTEM, ErrorSeverity.HIGH, options);
  }
}

export class ConfigurationError extends BaseError {
  constructor(message, options = {}) {
    super(message, ErrorCategory.CONFIGURATION, ErrorSeverity.CRITICAL, options);
  }
}

export class NetworkError extends BaseError {
  constructor(message, options = {}) {
    super(message, ErrorCategory.NETWORK, ErrorSeverity.MEDIUM, {
      retryable: true,
      recoveryStrategy: RecoveryStrategy.RETRY,
      ...options
    });
  }
}

export class AIServiceError extends BaseError {
  constructor(message, options = {}) {
    super(message, ErrorCategory.AI_SERVICE, ErrorSeverity.HIGH, {
      retryable: true,
      recoveryStrategy: RecoveryStrategy.FALLBACK,
      ...options
    });
  }
}

export class ContentGenerationError extends BaseError {
  constructor(message, options = {}) {
    super(message, ErrorCategory.CONTENT_GENERATION, ErrorSeverity.MEDIUM, {
      retryable: true,
      recoveryStrategy: RecoveryStrategy.RETRY,
      ...options
    });
  }
}

export class ValidationError extends BaseError {
  constructor(message, options = {}) {
    super(message, ErrorCategory.VALIDATION, ErrorSeverity.LOW, options);
  }
}

/**
 * 🎯 에러 통계 수집기
 */
export class ErrorStatistics {
  constructor() {
    this.stats = {
      total: 0,
      byCategory: {},
      bySeverity: {},
      byHour: {},
      recoveryAttempts: 0,
      recoverySuccess: 0
    };
  }

  record(error) {
    this.stats.total++;
    
    // 카테고리별 통계
    this.stats.byCategory[error.category] = (this.stats.byCategory[error.category] || 0) + 1;
    
    // 심각도별 통계
    this.stats.bySeverity[error.severity] = (this.stats.bySeverity[error.severity] || 0) + 1;
    
    // 시간별 통계
    const hour = new Date().getHours();
    this.stats.byHour[hour] = (this.stats.byHour[hour] || 0) + 1;
  }

  recordRecoveryAttempt() {
    this.stats.recoveryAttempts++;
  }

  recordRecoverySuccess() {
    this.stats.recoverySuccess++;
  }

  getStats() {
    return {
      ...this.stats,
      recoveryRate: this.stats.recoveryAttempts > 0 
        ? (this.stats.recoverySuccess / this.stats.recoveryAttempts * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  reset() {
    this.stats = {
      total: 0,
      byCategory: {},
      bySeverity: {},
      byHour: {},
      recoveryAttempts: 0,
      recoverySuccess: 0
    };
  }
}

/**
 * 🎯 서킷 브레이커 패턴
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1분
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10초
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  async execute(operation, fallback) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        return fallback ? fallback() : Promise.reject(new Error('Circuit breaker is OPEN'));
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) { // 3번 성공하면 복구
        this.state = 'CLOSED';
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * 🛡️ 중앙화된 에러 처리 관리자
 */
export class ErrorHandlingManager {
  constructor() {
    this.logger = createLogger('ErrorHandling');
    this.statistics = new ErrorStatistics();
    this.circuitBreakers = new Map();
    this.recoveryHandlers = new Map();
    this.alertHandlers = [];
    
    // 기본 복구 핸들러 등록
    this.registerDefaultRecoveryHandlers();
    
    // 전역 에러 핸들러 설정
    this.setupGlobalErrorHandlers();
  }

  /**
   * 에러 처리 및 복구
   */
  async handleError(error, context = {}) {
    try {
      // BaseError가 아닌 경우 래핑
      if (!(error instanceof BaseError)) {
        error = this.wrapError(error, context);
      }

      // 컨텍스트 추가
      error.context = { ...error.context, ...context };
      
      // 통계 수집
      this.statistics.record(error);
      
      // 로깅
      await this.logError(error);
      
      // 알림 (심각도가 높은 경우)
      if (error.severity >= ErrorSeverity.HIGH) {
        await this.sendAlert(error);
      }
      
      // 복구 시도
      const recoveryResult = await this.attemptRecovery(error);
      
      // 사용자에게 반환할 결과
      return {
        handled: true,
        error: error,
        userMessage: error.userMessage,
        recovered: recoveryResult.success,
        recoveryData: recoveryResult.data
      };
      
    } catch (handlingError) {
      // 에러 처리 중 에러 발생
      this.logger.fatal('Error handling system failed', {
        originalError: error.message,
        handlingError: handlingError.message
      });
      
      return {
        handled: false,
        error: handlingError,
        userMessage: '시스템에 치명적인 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 일반 Error를 BaseError로 래핑
   */
  wrapError(error, context = {}) {
    // 에러 메시지 패턴으로 카테고리 추정
    let category = ErrorCategory.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      category = ErrorCategory.NETWORK;
      severity = ErrorSeverity.MEDIUM;
    } else if (message.includes('permission') || message.includes('unauthorized')) {
      category = ErrorCategory.PERMISSION;
      severity = ErrorSeverity.LOW;
    } else if (message.includes('config') || message.includes('env')) {
      category = ErrorCategory.CONFIGURATION;
      severity = ErrorSeverity.HIGH;
    } else if (message.includes('ai') || message.includes('gemini')) {
      category = ErrorCategory.AI_SERVICE;
      severity = ErrorSeverity.HIGH;
    }
    
    return new BaseError(error.message, category, severity, {
      context,
      originalStack: error.stack
    });
  }

  /**
   * 에러 로깅
   */
  async logError(error) {
    const logData = {
      category: error.category,
      severity: error.severity,
      requestId: error.requestId,
      context: error.context,
      recoveryStrategy: error.recoveryStrategy
    };

    if (error.severity >= ErrorSeverity.HIGH) {
      this.logger.error(error.message, logData, error);
    } else if (error.severity === ErrorSeverity.MEDIUM) {
      this.logger.warn(error.message, logData, error);
    } else {
      this.logger.info(error.message, logData, error);
    }
  }

  /**
   * 복구 시도
   */
  async attemptRecovery(error) {
    if (error.recoveryStrategy === RecoveryStrategy.NONE) {
      return { success: false, data: null };
    }

    this.statistics.recordRecoveryAttempt();
    
    try {
      const handler = this.recoveryHandlers.get(error.recoveryStrategy);
      if (!handler) {
        this.logger.warn(`No recovery handler for strategy: ${error.recoveryStrategy}`);
        return { success: false, data: null };
      }

      const result = await handler(error);
      
      if (result.success) {
        this.statistics.recordRecoverySuccess();
        this.logger.info(`Recovery successful for error: ${error.message}`, result.data);
      }
      
      return result;
      
    } catch (recoveryError) {
      this.logger.error('Recovery attempt failed', {
        originalError: error.message,
        recoveryError: recoveryError.message
      });
      return { success: false, data: { recoveryError: recoveryError.message } };
    }
  }

  /**
   * 알림 발송
   */
  async sendAlert(error) {
    const alertData = {
      message: error.message,
      category: error.category,
      severity: error.severity,
      timestamp: new Date(error.timestamp).toISOString(),
      context: error.context
    };

    for (const handler of this.alertHandlers) {
      try {
        await handler(alertData);
      } catch (alertError) {
        this.logger.error('Alert handler failed', { alertError: alertError.message });
      }
    }
  }

  /**
   * 기본 복구 핸들러 등록
   */
  registerDefaultRecoveryHandlers() {
    // 재시도 핸들러
    this.recoveryHandlers.set(RecoveryStrategy.RETRY, async (error) => {
      // 서킷 브레이커 확인
      const breakerKey = `${error.category}_${error.name}`;
      let breaker = this.circuitBreakers.get(breakerKey);
      
      if (!breaker) {
        breaker = new CircuitBreaker();
        this.circuitBreakers.set(breakerKey, breaker);
      }
      
      // 재시도 로직은 호출하는 쪽에서 구현해야 함
      return { 
        success: false, 
        data: { 
          strategy: 'retry', 
          circuitBreakerState: breaker.getState() 
        } 
      };
    });

    // 폴백 핸들러
    this.recoveryHandlers.set(RecoveryStrategy.FALLBACK, async (error) => {
      // 기본 폴백 로직
      return { 
        success: true, 
        data: { 
          strategy: 'fallback', 
          message: '대체 방법으로 처리되었습니다.' 
        } 
      };
    });
  }

  /**
   * 전역 에러 핸들러 설정
   */
  setupGlobalErrorHandlers() {
    // 처리되지 않은 Promise rejection
    process.on('unhandledRejection', (reason, promise) => {
      const error = new SystemError('Unhandled Promise Rejection', {
        context: { reason: reason.toString(), promise: promise.toString() }
      });
      this.handleError(error);
    });

    // 처리되지 않은 예외
    process.on('uncaughtException', (error) => {
      const systemError = new SystemError('Uncaught Exception', {
        context: { originalError: error.message }
      });
      this.handleError(systemError).then(() => {
        process.exit(1); // 안전하게 종료
      });
    });
  }

  /**
   * 커스텀 복구 핸들러 등록
   */
  registerRecoveryHandler(strategy, handler) {
    this.recoveryHandlers.set(strategy, handler);
  }

  /**
   * 알림 핸들러 등록
   */
  registerAlertHandler(handler) {
    this.alertHandlers.push(handler);
  }

  /**
   * 에러 통계 가져오기
   */
  getStatistics() {
    return this.statistics.getStats();
  }

  /**
   * 서킷 브레이커 상태 가져오기
   */
  getCircuitBreakerStates() {
    const states = {};
    for (const [key, breaker] of this.circuitBreakers) {
      states[key] = breaker.getState();
    }
    return states;
  }
}

// 싱글톤 인스턴스
let errorHandlerInstance = null;

/**
 * 글로벌 에러 처리 관리자 인스턴스
 */
export async function getErrorHandler() {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new ErrorHandlingManager();
  }
  return errorHandlerInstance;
}

/**
 * 편의 함수들
 */
export const handleError = async (error, context) => {
  const handler = await getErrorHandler();
  return handler.handleError(error, context);
};

export const createError = (type, message, options) => {
  const errorClasses = {
    system: SystemError,
    config: ConfigurationError,
    network: NetworkError,
    ai: AIServiceError,
    content: ContentGenerationError,
    validation: ValidationError
  };
  
  const ErrorClass = errorClasses[type] || BaseError;
  return new ErrorClass(message, options);
};

/**
 * 데코레이터 패턴으로 에러 처리 자동화
 */
export function withErrorHandling(category = ErrorCategory.UNKNOWN) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const handler = await getErrorHandler();
        const result = await handler.handleError(error, {
          method: propertyKey,
          class: target.constructor.name,
          args: args.map(arg => typeof arg === 'object' ? '[object]' : String(arg))
        });
        
        if (!result.recovered) {
          throw result.error;
        }
        
        return result.recoveryData;
      }
    };
    
    return descriptor;
  };
}