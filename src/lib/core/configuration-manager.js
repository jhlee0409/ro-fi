/**
 * 🏗️ Enterprise-Grade Configuration Management System
 * 
 * 목적: 중앙화된 설정 관리와 환경별 설정 분리
 * 특징: 타입 안전성, 설정 검증, 동적 변경 지원
 * 
 * @version 1.0.0
 * @author SuperClaude Framework
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 설정 스키마 정의
 */
const CONFIG_SCHEMA = {
  // 환경 설정
  environment: {
    NODE_ENV: { type: 'string', default: 'development', enum: ['development', 'test', 'production'] },
    DEBUG: { type: 'boolean', default: false },
    LOG_LEVEL: { type: 'string', default: 'info', enum: ['debug', 'info', 'warn', 'error', 'fatal'] }
  },

  // AI 서비스 설정
  ai: {
    GEMINI_API_KEY: { 
      type: 'string', 
      required: function() { 
        return process.env.NODE_ENV === 'production'; 
      }, 
      sensitive: true,
      default: process.env.NODE_ENV === 'test' ? 'test-key' : undefined
    },
    ENABLE_CONTINUITY_SYSTEM: { type: 'boolean', default: true },
    MAX_RETRIES: { type: 'number', default: 3, min: 1, max: 10 },
    TIMEOUT_MS: { type: 'number', default: 30000, min: 1000, max: 300000 }
  },

  // 데이터 저장 설정
  storage: {
    DATA_ROOT_PATH: { type: 'string', default: './data' },
    STORY_STATES_PATH: { type: 'string', default: 'story-states' },
    LOGS_PATH: { type: 'string', default: 'logs' },
    BACKUP_PATH: { type: 'string', default: 'backups' },
    MAX_BACKUP_FILES: { type: 'number', default: 30, min: 1, max: 100 }
  },

  // GitHub Actions 설정
  deployment: {
    VERCEL_TOKEN: { type: 'string', sensitive: true },
    VERCEL_ORG_ID: { type: 'string', sensitive: true },
    VERCEL_PROJECT_ID: { type: 'string', sensitive: true }
  },

  // 성능 및 품질 설정
  performance: {
    QUALITY_THRESHOLD: { type: 'number', default: 8.5, min: 0, max: 10 },
    TOKEN_BUDGET_LIMIT: { type: 'number', default: 100000, min: 1000 },
    CONCURRENT_LIMIT: { type: 'number', default: 3, min: 1, max: 10 },
    CACHE_TTL_MS: { type: 'number', default: 3600000, min: 60000 }
  }
};

/**
 * 🎯 중앙화된 설정 관리 클래스
 */
export class ConfigurationManager {
  constructor() {
    this.config = {};
    this.initialized = false;
    this.watchers = new Set();
    this.validationErrors = [];
  }

  /**
   * 설정 시스템 초기화
   */
  async initialize() {
    try {
      // 1. 환경변수 로드
      this.loadFromEnvironment();
      
      // 2. 설정 파일 로드 (있다면)
      await this.loadFromConfigFiles();
      
      // 3. 설정 검증
      this.validateConfiguration();
      
      // 4. 필수 디렉토리 생성
      await this.ensureDirectories();
      
      this.initialized = true;
      console.log('✅ Configuration system initialized successfully');
      
      return this;
    } catch (error) {
      console.error('❌ Configuration initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * 환경변수에서 설정 로드
   */
  loadFromEnvironment() {
    for (const [category, settings] of Object.entries(CONFIG_SCHEMA)) {
      this.config[category] = {};
      
      for (const [key, schema] of Object.entries(settings)) {
        const envValue = process.env[key];
        let value;

        if (envValue !== undefined) {
          // 타입 변환
          value = this.convertType(envValue, schema.type);
        } else if (schema.default !== undefined) {
          // 기본값 (함수형도 지원)
          value = typeof schema.default === 'function' ? schema.default() : schema.default;
        } else {
          // 필수 값 검사 (함수형 required 지원)
          const isRequired = typeof schema.required === 'function' 
            ? schema.required() 
            : schema.required;
            
          if (isRequired) {
            this.validationErrors.push(`Required environment variable ${key} is missing`);
            continue;
          }
        }

        this.config[category][key] = value;
      }
    }
  }

  /**
   * 설정 파일에서 로드 (JSON/JS)
   */
  async loadFromConfigFiles() {
    const configPaths = [
      path.join(process.cwd(), 'config.js'),
      path.join(process.cwd(), 'config.json'),
      path.join(process.cwd(), `.config.${this.get('environment.NODE_ENV')}.js`)
    ];

    for (const configPath of configPaths) {
      try {
        const stats = await fs.stat(configPath);
        if (stats.isFile()) {
          const config = configPath.endsWith('.json') 
            ? JSON.parse(await fs.readFile(configPath, 'utf-8'))
            : (await import(configPath)).default;
            
          this.mergeConfig(config);
        }
      } catch (error) {
        // 설정 파일이 없는 것은 정상
        if (error.code !== 'ENOENT') {
          console.warn(`Warning: Failed to load config from ${configPath}:`, error.message);
        }
      }
    }
  }

  /**
   * 설정 검증
   */
  validateConfiguration() {
    for (const [category, settings] of Object.entries(CONFIG_SCHEMA)) {
      for (const [key, schema] of Object.entries(settings)) {
        const value = this.config[category]?.[key];
        
        // 필수 값 검사 (함수형 required 지원)
        const isRequired = typeof schema.required === 'function' 
          ? schema.required() 
          : schema.required;
          
        if (isRequired && (value === undefined || value === null)) {
          this.validationErrors.push(`Required config ${category}.${key} is missing`);
          continue;
        }
        
        if (value === undefined) continue;
        
        // 타입 검사
        if (!this.isValidType(value, schema.type)) {
          this.validationErrors.push(`Config ${category}.${key} has invalid type. Expected ${schema.type}`);
        }
        
        // enum 검사
        if (schema.enum && !schema.enum.includes(value)) {
          this.validationErrors.push(`Config ${category}.${key} must be one of: ${schema.enum.join(', ')}`);
        }
        
        // 숫자 범위 검사
        if (schema.type === 'number') {
          if (schema.min !== undefined && value < schema.min) {
            this.validationErrors.push(`Config ${category}.${key} must be >= ${schema.min}`);
          }
          if (schema.max !== undefined && value > schema.max) {
            this.validationErrors.push(`Config ${category}.${key} must be <= ${schema.max}`);
          }
        }
      }
    }
    
    if (this.validationErrors.length > 0) {
      throw new Error(`Configuration validation failed:\n${this.validationErrors.join('\n')}`);
    }
  }

  /**
   * 필수 디렉토리 생성
   */
  async ensureDirectories() {
    const directories = [
      this.getAbsolutePath('storage.DATA_ROOT_PATH'),
      this.getAbsolutePath('storage.DATA_ROOT_PATH', 'storage.STORY_STATES_PATH'),
      this.getAbsolutePath('storage.DATA_ROOT_PATH', 'storage.LOGS_PATH'),
      this.getAbsolutePath('storage.DATA_ROOT_PATH', 'storage.BACKUP_PATH')
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.warn(`Warning: Failed to create directory ${dir}:`, error.message);
      }
    }
  }

  /**
   * 설정 값 가져오기
   * @param {string} path - 점으로 구분된 경로 (예: 'ai.GEMINI_API_KEY')
   */
  get(path) {
    const keys = path.split('.');
    let current = this.config;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * 절대 경로 생성
   */
  getAbsolutePath(...pathParts) {
    const resolvedParts = pathParts.map(part => {
      if (part.includes('.')) {
        return this.get(part) || '';
      }
      return part;
    });
    
    return path.resolve(process.cwd(), ...resolvedParts);
  }

  /**
   * 환경별 설정 가져오기
   */
  getEnvironment() {
    return this.get('environment.NODE_ENV');
  }

  /**
   * 개발 환경 여부
   */
  isDevelopment() {
    return this.getEnvironment() === 'development';
  }

  /**
   * 프로덕션 환경 여부
   */
  isProduction() {
    return this.getEnvironment() === 'production';
  }

  /**
   * 테스트 환경 여부
   */
  isTest() {
    return this.getEnvironment() === 'test';
  }

  /**
   * 타입 변환
   */
  convertType(value, type) {
    switch (type) {
      case 'boolean':
        return value === 'true' || value === true;
      case 'number':
        return Number(value);
      case 'string':
        return String(value);
      default:
        return value;
    }
  }

  /**
   * 타입 검증
   */
  isValidType(value, expectedType) {
    switch (expectedType) {
      case 'boolean':
        return typeof value === 'boolean';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'string':
        return typeof value === 'string';
      default:
        return true;
    }
  }

  /**
   * 설정 병합
   */
  mergeConfig(newConfig) {
    for (const [category, settings] of Object.entries(newConfig)) {
      if (!this.config[category]) {
        this.config[category] = {};
      }
      Object.assign(this.config[category], settings);
    }
  }

  /**
   * 민감한 정보 마스킹된 설정 반환
   */
  getSafeConfig() {
    const safeConfig = JSON.parse(JSON.stringify(this.config));
    
    for (const [category, settings] of Object.entries(CONFIG_SCHEMA)) {
      for (const [key, schema] of Object.entries(settings)) {
        if (schema.sensitive && safeConfig[category]?.[key]) {
          safeConfig[category][key] = '***MASKED***';
        }
      }
    }
    
    return safeConfig;
  }

  /**
   * 설정 변경 감지 등록
   */
  onChange(callback) {
    this.watchers.add(callback);
    
    // 제거 함수 반환
    return () => this.watchers.delete(callback);
  }

  /**
   * 설정 변경 알림
   */
  notifyChange(path, oldValue, newValue) {
    for (const callback of this.watchers) {
      try {
        callback(path, oldValue, newValue);
      } catch (error) {
        console.error('Config watcher error:', error);
      }
    }
  }
}

// 싱글톤 인스턴스
let configInstance = null;

/**
 * 글로벌 설정 관리자 인스턴스 가져오기
 */
export async function getConfig() {
  if (!configInstance) {
    configInstance = new ConfigurationManager();
    await configInstance.initialize();
  }
  return configInstance;
}

/**
 * 편의 함수들
 */
export const config = {
  get: async (path) => (await getConfig()).get(path),
  getPath: async (...parts) => (await getConfig()).getAbsolutePath(...parts),
  isDev: async () => (await getConfig()).isDevelopment(),
  isProd: async () => (await getConfig()).isProduction(),
  isTest: async () => (await getConfig()).isTest()
};