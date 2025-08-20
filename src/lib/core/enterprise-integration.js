/**
 * 🚀 Enterprise Framework Integration Hub
 * 
 * 목적: 3개 핵심 프레임워크의 통합 및 조율
 * 특징: 단일 진입점, 자동 초기화, 의존성 관리
 * 
 * @version 1.0.0
 * @author SuperClaude Framework
 */

import { getConfig } from './configuration-manager.js';
import { createLogger } from './logging-framework.js';
import { getErrorHandler } from './error-handling-framework.js';

/**
 * 🎯 Enterprise 프레임워크 통합 관리자
 */
export class EnterpriseIntegration {
  constructor() {
    this.initialized = false;
    this.config = null;
    this.logger = null;
    this.errorHandler = null;
    this.startTime = Date.now();
  }

  /**
   * 전체 시스템 초기화
   */
  async initialize() {
    try {
      console.log('🚀 Enterprise Framework 초기화 중...');
      
      // 1. 설정 시스템 초기화 (최우선)
      this.config = await getConfig();
      console.log('✅ Configuration Manager 초기화 완료');
      
      // 2. 로깅 시스템 초기화
      this.logger = createLogger('Enterprise');
      await this.logger.info('Enterprise Framework 초기화 시작');
      console.log('✅ Logging Framework 초기화 완료');
      
      // 3. 에러 핸들러 초기화
      this.errorHandler = await getErrorHandler();
      await this.logger.info('Error Handling Framework 초기화 완료');
      console.log('✅ Error Handling Framework 초기화 완료');
      
      // 4. 시스템 헬스체크
      await this.performHealthCheck();
      
      this.initialized = true;
      const initTime = Date.now() - this.startTime;
      
      await this.logger.info('Enterprise Framework 초기화 성공', {
        initializationTime: `${initTime}ms`,
        environment: this.config.getEnvironment(),
        timestamp: new Date().toISOString()
      });
      
      console.log(`🎉 Enterprise Framework 초기화 완료 (${initTime}ms)`);
      return this;
      
    } catch (error) {
      console.error('❌ Enterprise Framework 초기화 실패:', error.message);
      
      if (this.errorHandler) {
        await this.errorHandler.handleError(error, {
          component: 'EnterpriseIntegration',
          operation: 'initialize'
        });
      }
      
      throw error;
    }
  }

  /**
   * 시스템 헬스체크
   */
  async performHealthCheck() {
    const healthStatus = {
      configuration: false,
      logging: false,
      errorHandling: false,
      storage: false
    };

    try {
      // 설정 시스템 체크
      const testConfig = this.config.get('environment.NODE_ENV');
      healthStatus.configuration = testConfig !== undefined;
      
      // 로깅 시스템 체크  
      await this.logger.debug('로깅 시스템 헬스체크');
      healthStatus.logging = true;
      
      // 에러 핸들링 체크
      const errorStats = this.errorHandler.getStatistics();
      healthStatus.errorHandling = errorStats !== undefined;
      
      // 스토리지 체크
      const dataPath = this.config.getAbsolutePath('storage.DATA_ROOT_PATH');
      healthStatus.storage = dataPath !== undefined;
      
      await this.logger.info('시스템 헬스체크 완료', healthStatus);
      
      // 문제가 있는 컴포넌트 경고
      const failedComponents = Object.entries(healthStatus)
        .filter(([_, status]) => !status)
        .map(([component]) => component);
        
      if (failedComponents.length > 0) {
        await this.logger.warn('일부 컴포넌트 헬스체크 실패', { failed: failedComponents });
      }
      
    } catch (error) {
      await this.logger.error('헬스체크 중 오류 발생', { error: error.message });
      throw error;
    }
  }

  /**
   * 프레임워크 인스턴스 접근자들
   */
  getConfig() {
    this.ensureInitialized();
    return this.config;
  }

  getLogger(name = 'app') {
    this.ensureInitialized();
    return createLogger(name);
  }

  getErrorHandler() {
    this.ensureInitialized();
    return this.errorHandler;
  }

  /**
   * 초기화 상태 검증
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Enterprise Framework가 아직 초기화되지 않았습니다. initialize()를 먼저 호출하세요.');
    }
  }

  /**
   * 시스템 상태 정보
   */
  async getSystemStatus() {
    this.ensureInitialized();
    
    const uptime = Date.now() - this.startTime;
    const errorStats = this.errorHandler.getStatistics();
    const circuitBreakerStates = this.errorHandler.getCircuitBreakerStates();
    
    return {
      initialized: this.initialized,
      uptime: `${uptime}ms`,
      environment: this.config.getEnvironment(),
      errorStatistics: errorStats,
      circuitBreakers: circuitBreakerStates,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 안전한 종료
   */
  async shutdown() {
    if (!this.initialized) return;
    
    try {
      await this.logger.info('Enterprise Framework 종료 중...');
      
      // 로그 플러시 등 정리 작업
      if (this.logger.fileWriter) {
        await this.logger.fileWriter.flush();
      }
      
      await this.logger.info('Enterprise Framework 안전 종료 완료');
      this.initialized = false;
      
    } catch (error) {
      console.error('종료 중 오류:', error.message);
    }
  }
}

// 싱글톤 인스턴스
let enterpriseInstance = null;

/**
 * Enterprise Framework 싱글톤 인스턴스
 */
export async function getEnterprise() {
  if (!enterpriseInstance) {
    enterpriseInstance = new EnterpriseIntegration();
    await enterpriseInstance.initialize();
  }
  return enterpriseInstance;
}

/**
 * 편의 함수들 - 빠른 접근
 */
export const enterprise = {
  // 설정 관련
  config: async (path) => (await getEnterprise()).getConfig().get(path),
  getPath: async (...parts) => (await getEnterprise()).getConfig().getAbsolutePath(...parts),
  
  // 로깅 관련
  logger: async (name = 'app') => (await getEnterprise()).getLogger(name),
  log: async (level, message, data) => {
    const logger = (await getEnterprise()).getLogger();
    return logger.log(level, message, data);
  },
  
  // 에러 처리 관련
  handleError: async (error, context) => {
    const errorHandler = (await getEnterprise()).getErrorHandler();
    return errorHandler.handleError(error, context);
  },
  
  // 시스템 상태
  status: async () => (await getEnterprise()).getSystemStatus(),
  health: async () => (await getEnterprise()).performHealthCheck()
};

/**
 * 프로세스 종료 시 자동 정리
 */
process.on('SIGINT', async () => {
  if (enterpriseInstance) {
    await enterpriseInstance.shutdown();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (enterpriseInstance) {
    await enterpriseInstance.shutdown();
  }
  process.exit(0);
});

/**
 * 레거시 코드 마이그레이션 헬퍼
 */
export class LegacyMigrationHelper {
  constructor(enterprise) {
    this.enterprise = enterprise;
  }

  /**
   * 하드코딩된 경로를 설정 기반으로 변환
   */
  migratePath(hardcodedPath) {
    const pathMappings = {
      './data/story-states': 'storage.DATA_ROOT_PATH',
      './data': 'storage.DATA_ROOT_PATH',
      './logs': 'storage.LOGS_PATH',
      './backups': 'storage.BACKUP_PATH'
    };

    return pathMappings[hardcodedPath] || hardcodedPath;
  }

  /**
   * 레거시 로거를 새 로거로 래핑
   */
  wrapLegacyLogger(legacyLogger, loggerName = 'legacy') {
    const newLogger = this.enterprise.getLogger(loggerName);
    
    return {
      info: (message, data) => newLogger.info(`[Legacy] ${message}`, data),
      warn: (message, data) => newLogger.warn(`[Legacy] ${message}`, data),
      error: (message, data) => newLogger.error(`[Legacy] ${message}`, data),
      debug: (message, data) => newLogger.debug(`[Legacy] ${message}`, data)
    };
  }
}

/**
 * 초기화 검증 및 환경 확인
 */
export async function validateEnvironment() {
  try {
    const enterprise = await getEnterprise();
    const config = enterprise.getConfig();
    
    const requiredKeys = [
      'ai.GEMINI_API_KEY',
      'storage.DATA_ROOT_PATH'
    ];
    
    const missingKeys = [];
    for (const key of requiredKeys) {
      if (!config.get(key)) {
        missingKeys.push(key);
      }
    }
    
    if (missingKeys.length > 0) {
      throw new Error(`필수 설정이 누락되었습니다: ${missingKeys.join(', ')}`);
    }
    
    console.log('✅ 환경 검증 완료');
    return true;
    
  } catch (error) {
    console.error('❌ 환경 검증 실패:', error.message);
    return false;
  }
}