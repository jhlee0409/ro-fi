/**
 * 🚀 통합 로깅 시스템
 * 전체 프로젝트에서 사용할 로깅 인터페이스
 */

export interface Logger {
  info(_message: string, _data?: unknown): void;
  warn(_message: string, _data?: unknown): void;
  error(_message: string, _data?: unknown): void;
  success(_message: string, _data?: unknown): void;
  debug(message: string, _data?: unknown): void;
}

export class ConsoleLogger implements Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  
  info(_message: string, _data?: unknown): void {
    if (!this.isProduction) {
      // console.log(`ℹ️ ${message}`, _data || '');
    }
  }

  warn(_message: string, _data?: unknown): void {
    // console.warn(`⚠️ ${message}`, _data || '');
  }

  error(_message: string, _data?: unknown): void {
    // console.error(`❌ ${message}`, _data || '');
  }

  success(_message: string, _data?: unknown): void {
    if (!this.isProduction) {
      // console.log(`✅ ${message}`, _data || '');
    }
  }

  debug(message: string, _data?: unknown): void {
    if (!this.isProduction && process.env.DEBUG) {
      // eslint-disable-next-line no-console
      console.debug(`🐛 ${message}`, _data || '');
    }
  }
}

export class SilentLogger implements Logger {
  info(): void {}
  warn(): void {}
  error(): void {}
  success(): void {}
  debug(): void {}
}

export const createLogger = (): Logger => {
  if (process.env.NODE_ENV === 'test') {
    return new SilentLogger();
  }
  return new ConsoleLogger();
};

export const logger = createLogger();