/**
 * 스크립트용 간단 로깅 유틸리티
 */

export const logger = {
  info: (_message, _data) => {
    if (process.env.NODE_ENV !== 'production') {
      // console.log(`ℹ️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
  warn: (_message, _data) => {
    // console.warn(`⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (_message, _data) => {
    // console.error(`❌ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  success: (_message, _data) => {
    if (process.env.NODE_ENV !== 'production') {
      // console.log(`✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
  debug: (message, data) => {
    if (process.env.DEBUG) {
      console.debug(`🐛 ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
};

// 사용 빈도가 높은 스크립트에 특화된 유틸리티
export const createScriptLogger = (scriptName) => ({
  info: (message, data) => logger.info(`[${scriptName}] ${message}`, data),
  warn: (message, data) => logger.warn(`[${scriptName}] ${message}`, data),
  error: (message, data) => logger.error(`[${scriptName}] ${message}`, data),
  success: (message, data) => logger.success(`[${scriptName}] ${message}`, data),
  debug: (message, data) => logger.debug(`[${scriptName}] ${message}`, data)
});