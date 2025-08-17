/**
 * 환경 감지 및 설정 유틸리티
 * 테스트, 개발, 프로덕션 환경을 구분하여 적절한 설정 제공
 */

interface TimeoutSettings {
  test: number;
  hook: number;
  api: number;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface EnvironmentInfo {
  isTest: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
  shouldMockExternal: boolean;
  shouldMockAI: boolean;
  timeouts: TimeoutSettings;
  logLevel: LogLevel;
  nodeEnv: string;
}

interface ValidationResult {
  warnings: string[];
  errors: string[];
}

/**
 * 현재 실행 환경이 테스트 환경인지 확인
 */
export function isTestEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.VITEST === 'true' ||
    process.env.npm_lifecycle_event?.includes('test') ||
    false
  );
}

/**
 * 현재 실행 환경이 개발 환경인지 확인
 */
export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development' || (!process.env.NODE_ENV && !isTestEnvironment());
}

/**
 * 현재 실행 환경이 프로덕션 환경인지 확인
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * 외부 서비스(API)를 모킹해야 하는지 확인
 */
export function shouldMockExternalServices(): boolean {
  // 테스트 환경에서는 기본적으로 모킹
  if (isTestEnvironment()) {
    // INTEGRATION_TEST=true인 경우만 실제 API 사용
    return !process.env.INTEGRATION_TEST;
  }

  // 개발/프로덕션에서는 실제 서비스 사용
  return false;
}

/**
 * AI 서비스를 모킹해야 하는지 확인
 */
export function shouldMockAIService(): boolean {
  // API 키가 없으면 강제 모킹
  if (!process.env.ANTHROPIC_API_KEY) {
    return true;
  }

  // 테스트 환경에서는 모킹 (통합 테스트 제외)
  return shouldMockExternalServices();
}

/**
 * 환경에 따른 타임아웃 설정 반환
 */
export function getTimeoutSettings(): TimeoutSettings {
  if (isTestEnvironment()) {
    return {
      test: 5000, // 5초
      hook: 3000, // 3초
      api: 2000, // 2초
    };
  }

  if (isDevelopmentEnvironment()) {
    return {
      test: 15000, // 15초
      hook: 10000, // 10초
      api: 30000, // 30초
    };
  }

  // 프로덕션
  return {
    test: 30000, // 30초
    hook: 20000, // 20초
    api: 60000, // 60초
  };
}

/**
 * 환경별 로깅 레벨 반환
 */
export function getLogLevel(): LogLevel {
  if (isTestEnvironment()) {
    return (process.env.TEST_LOG_LEVEL as LogLevel) || 'warn';
  }

  if (isDevelopmentEnvironment()) {
    return (process.env.LOG_LEVEL as LogLevel) || 'debug';
  }

  return (process.env.LOG_LEVEL as LogLevel) || 'info';
}

/**
 * 현재 환경 정보 객체 반환
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  return {
    isTest: isTestEnvironment(),
    isDevelopment: isDevelopmentEnvironment(),
    isProduction: isProductionEnvironment(),
    shouldMockExternal: shouldMockExternalServices(),
    shouldMockAI: shouldMockAIService(),
    timeouts: getTimeoutSettings(),
    logLevel: getLogLevel(),
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}

/**
 * 환경 검증 및 경고
 */
export function validateEnvironment(): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // API 키 검증
  if (isProductionEnvironment() && !process.env.ANTHROPIC_API_KEY) {
    errors.push('ANTHROPIC_API_KEY가 프로덕션 환경에서 설정되지 않았습니다.');
  }

  // 테스트 환경에서 API 키가 있으면 경고
  if (isTestEnvironment() && process.env.ANTHROPIC_API_KEY && !process.env.INTEGRATION_TEST) {
    warnings.push(
      '테스트 환경에서 ANTHROPIC_API_KEY가 설정되어 있습니다. 모킹을 사용하는 것이 권장됩니다.'
    );
  }

  // NODE_ENV 검증
  if (!process.env.NODE_ENV && !isTestEnvironment()) {
    warnings.push('NODE_ENV가 설정되지 않았습니다. 기본값 "development"를 사용합니다.');
  }

  return { warnings, errors };
}

// 환경 정보 디버깅용 출력
export function debugEnvironment(): void {
  if (getLogLevel() === 'debug') {
    const _env = getEnvironmentInfo();
    // console.log('🔍 Environment Debug Info:', {
    //   ...env,
    //   hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    //   processEnv: {
    //     NODE_ENV: process.env.NODE_ENV,
    //     VITEST: process.env.VITEST,
    //     npm_lifecycle_event: process.env.npm_lifecycle_event,
    //   },
    // });

    const validation = validateEnvironment();
    if (validation.warnings.length > 0) {
      // console.warn('⚠️ Environment Warnings:', validation.warnings);
    }
    if (validation.errors.length > 0) {
      // console.error('❌ Environment Errors:', validation.errors);
    }
  }
}
