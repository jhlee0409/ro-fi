/**
 * 🚀 Enterprise-Enhanced Script Logging Utility
 * 
 * 목적: scripts 폴더의 레거시 로거를 Enterprise 프레임워크로 업그레이드
 * 특징: 하위 호환성 유지, Enterprise 로깅 시스템 활용, 점진적 마이그레이션 지원
 * 
 * @version 2.0.0 - Enterprise Enhanced
 */

import { getEnterprise } from '../src/lib/core/enterprise-integration.js';

let enterpriseLogger = null;

/**
 * Enterprise 로거 초기화 (지연 초기화)
 */
async function initEnterpriseLogger() {
  if (!enterpriseLogger) {
    try {
      const enterprise = await getEnterprise();
      enterpriseLogger = enterprise.getLogger('Script');
    } catch (error) {
      console.warn('Enterprise 로거 초기화 실패, 폴백 로거 사용:', error.message);
      enterpriseLogger = null;
    }
  }
  return enterpriseLogger;
}

/**
 * 통합 로깅 함수 - Enterprise와 콘솔 로깅을 모두 지원
 */
async function logMessage(level, message, data, emoji) {
  // Enterprise 로거 시도
  try {
    const logger = await initEnterpriseLogger();
    if (logger) {
      await logger[level](message, data);
    }
  } catch (error) {
    console.warn('Enterprise 로깅 실패:', error.message);
  }

  // 콘솔 로깅 (폴백 + 즉시 표시용)
  const shouldLog = level === 'debug' ? process.env.DEBUG : 
                   (level === 'error' || process.env.NODE_ENV !== 'production');
                   
  if (shouldLog) {
    const dataStr = data ? JSON.stringify(data, null, 2) : '';
    const logMessage = `${emoji} ${message} ${dataStr}`;
    console[level === 'success' ? 'log' : level](logMessage);
  }
}

export const logger = {
  info: async (message, data) => {
    await logMessage('info', message, data, 'ℹ️');
  },
  
  warn: async (message, data) => {
    await logMessage('warn', message, data, '⚠️');
  },
  
  error: async (message, data) => {
    await logMessage('error', message, data, '❌');
  },
  
  success: async (message, data) => {
    await logMessage('info', message, data, '✅');
  },
  
  debug: async (message, data) => {
    await logMessage('debug', message, data, '🐛');
  },

  // 동기식 호환성 메서드 (레거시 지원)
  infoSync: (message, data) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`ℹ️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
    // 비동기로 Enterprise 로깅도 시도
    logger.info(message, data).catch(() => {});
  },

  warnSync: (message, data) => {
    console.warn(`⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    logger.warn(message, data).catch(() => {});
  },

  errorSync: (message, data) => {
    console.error(`❌ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    logger.error(message, data).catch(() => {});
  },

  successSync: (message, data) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
    logger.success(message, data).catch(() => {});
  },

  debugSync: (message, data) => {
    if (process.env.DEBUG) {
      console.debug(`🐛 ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
    logger.debug(message, data).catch(() => {});
  }
};

/**
 * 스크립트별 로거 생성 (Enterprise Enhanced)
 */
export const createScriptLogger = (scriptName) => ({
  info: async (message, data) => await logger.info(`[${scriptName}] ${message}`, data),
  warn: async (message, data) => await logger.warn(`[${scriptName}] ${message}`, data), 
  error: async (message, data) => await logger.error(`[${scriptName}] ${message}`, data),
  success: async (message, data) => await logger.success(`[${scriptName}] ${message}`, data),
  debug: async (message, data) => await logger.debug(`[${scriptName}] ${message}`, data),

  // 동기식 메서드도 제공
  infoSync: (message, data) => logger.infoSync(`[${scriptName}] ${message}`, data),
  warnSync: (message, data) => logger.warnSync(`[${scriptName}] ${message}`, data),
  errorSync: (message, data) => logger.errorSync(`[${scriptName}] ${message}`, data),
  successSync: (message, data) => logger.successSync(`[${scriptName}] ${message}`, data),
  debugSync: (message, data) => logger.debugSync(`[${scriptName}] ${message}`, data)
});

/**
 * Enterprise 로깅 상태 확인
 */
export async function checkEnterpriseLogging() {
  try {
    const logger = await initEnterpriseLogger();
    return {
      available: !!logger,
      initialized: !!enterpriseLogger,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      available: false,
      initialized: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}