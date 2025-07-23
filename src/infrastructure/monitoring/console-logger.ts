/**
 * 콘솔 로거 구현체
 */

import type { ILogger } from './logger-interface';

export class ConsoleLogger implements ILogger {
  info(message: string, context?: any): void {
    console.log(`[ℹ️  INFO] ${message}`, context ? context : '');
  }
  
  warn(message: string, context?: any): void {
    console.warn(`[⚠️  WARN] ${message}`, context ? context : '');
  }
  
  error(message: string, context?: any): void {
    console.error(`[❌ ERROR] ${message}`, context ? context : '');
  }
  
  debug(message: string, context?: any): void {
    if (process.env.DEBUG) {
      console.debug(`[🔍 DEBUG] ${message}`, context ? context : '');
    }
  }
}