/**
 * 🚀 Enhanced Gemini API Wrapper
 * v2.1 창의성 모드 기반 고도화된 Gemini API 관리 시스템
 *
 * Features:
 * - 토큰 최적화 및 비용 관리
 * - 창의성 모드 v2.1 통합
 * - 인텔리전트 캐싱 시스템
 * - 에러 핸들링 및 재시도 로직
 * - 배치 처리 및 큐 관리
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { TokenBalancingEngine } from './token-balancing-engine.js';

/**
 * API 요청 설정
 */
interface APIRequestConfig {
  creativityMode: 'standard' | 'high' | 'unlimited';
  priority: 'low' | 'normal' | 'high' | 'critical';
  cacheStrategy: 'none' | 'memory' | 'persistent';
  retryPolicy: RetryPolicy;
  tokenLimit?: number;
  timeoutMs?: number;
}

interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  exponentialBackoff: boolean;
  retryConditions: string[];
}

interface APIResponse<T = string> {
  success: boolean;
  data?: T;
  error?: Error;
  metadata: {
    tokensUsed: number;
    responseTime: number;
    fromCache: boolean;
    creativity: number;
    retryCount: number;
  };
}

interface CacheEntry {
  content: string;
  timestamp: number;
  tokensUsed: number;
  ttl: number;
  accessCount: number;
}

/**
 * 향상된 Gemini API 래퍼
 */
export class EnhancedGeminiWrapper {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private tokenBalancer: TokenBalancingEngine;
  private cache: Map<string, CacheEntry>;
  private requestQueue: Array<QueuedRequest>;
  private isProcessingQueue: boolean;
  private rateLimiter: RateLimiter;
  private metrics: APIMetrics;

  constructor(apiKey: string, modelName: string = 'gemini-2.5-pro') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    this.tokenBalancer = new TokenBalancingEngine();
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.rateLimiter = new RateLimiter();
    this.metrics = new APIMetrics();
  }

  /**
   * 스마트 콘텐츠 생성 (v2.1 창의성 모드 통합)
   */
  async generateContent(
    prompt: string,
    config: Partial<APIRequestConfig> = {}
  ): Promise<APIResponse> {
    const fullConfig = this.buildConfig(config);
    const cacheKey = this.generateCacheKey(prompt, fullConfig);

    // 1. 캐시 확인
    const cachedResult = this.checkCache(cacheKey, fullConfig.cacheStrategy);
    if (cachedResult) {
      return cachedResult;
    }

    // 2. 토큰 밸런싱 및 비용 최적화
    const optimizedPrompt = await this.optimizePrompt(prompt, fullConfig);

    // 3. 레이트 리미팅 확인
    await this.rateLimiter.waitIfNeeded();

    // 4. API 호출 (재시도 로직 포함)
    const startTime = Date.now();
    const result = await this.executeWithRetry(optimizedPrompt, fullConfig);
    const responseTime = Date.now() - startTime;

    // 5. 결과 처리 및 캐싱
    if (result.success && fullConfig.cacheStrategy !== 'none') {
      this.updateCache(cacheKey, result.data!, responseTime, fullConfig);
    }

    // 6. 메트릭 업데이트
    this.metrics.recordRequest(result, responseTime, fullConfig);

    return {
      ...result,
      metadata: {
        ...result.metadata,
        responseTime,
        fromCache: false,
      },
    };
  }

  /**
   * 배치 처리 (여러 요청을 효율적으로 처리)
   */
  async generateBatch(
    requests: Array<{ prompt: string; config?: Partial<APIRequestConfig> }>
  ): Promise<APIResponse[]> {
    const batchSize = this.calculateOptimalBatchSize(requests.length);
    const results: APIResponse[] = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(req => this.generateContent(req.prompt, req.config));

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: new Error(result.reason),
            metadata: {
              tokensUsed: 0,
              responseTime: 0,
              fromCache: false,
              creativity: 0,
              retryCount: 0,
            },
          });
        }
      });

      // 배치 간 딜레이 (레이트 리미팅)
      if (i + batchSize < requests.length) {
        await this.delay(this.rateLimiter.getBatchDelay());
      }
    }

    return results;
  }

  /**
   * 스트리밍 생성 (실시간 응답)
   */
  async *generateStream(
    prompt: string,
    config: Partial<APIRequestConfig> = {}
  ): AsyncGenerator<string, void, unknown> {
    const fullConfig = this.buildConfig(config);
    const optimizedPrompt = await this.optimizePrompt(prompt, fullConfig);

    await this.rateLimiter.waitIfNeeded();

    try {
      const result = await this.model.generateContentStream(optimizedPrompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (_error) {
      throw new Error(`Streaming generation failed: ${error}`);
    }
  }

  /**
   * 프롬프트 최적화 (토큰 효율성 향상)
   */
  private async optimizePrompt(prompt: string, config: APIRequestConfig): Promise<string> {
    // 창의성 모드에 따른 프롬프트 조정
    let optimizedPrompt = prompt;

    if (config.creativityMode === 'unlimited') {
      optimizedPrompt = this.enhanceCreativityPrompt(prompt);
    } else if (config.creativityMode === 'standard') {
      optimizedPrompt = this.compressPrompt(prompt);
    }

    // 토큰 제한 확인
    if (config.tokenLimit) {
      optimizedPrompt = await this.enforceTokenLimit(optimizedPrompt, config.tokenLimit);
    }

    return optimizedPrompt;
  }

  /**
   * 창의성 향상 프롬프트
   */
  private enhanceCreativityPrompt(prompt: string): string {
    const creativityBooster = `
🎨 UNLIMITED CREATIVITY MODE ACTIVATED
비용 신경쓰지 말고 독자를 완전히 놀라게 하세요!
역대급 반전과 감동의 명장면을 만들어주세요.

${prompt}

추가 창의성 지시사항:
- 예측 불가능한 서술 기법과 혁신적 표현 사용
- 감정의 깊이를 극한까지 파고드는 심리 묘사
- 시적이고 영화적인 장면 연출
- 독자가 "이 작품은 진짜 다르다"고 느낄 만한 독창성
`;
    return creativityBooster;
  }

  /**
   * 프롬프트 압축 (토큰 절약)
   */
  private compressPrompt(prompt: string): string {
    return prompt
      .replace(/\n\s*\n/g, '\n') // 빈 줄 제거
      .replace(/\s+/g, ' ') // 연속 공백 압축
      .trim();
  }

  /**
   * 토큰 제한 강제 적용
   */
  private async enforceTokenLimit(prompt: string, limit: number): Promise<string> {
    // 간단한 토큰 추정 (실제로는 더 정확한 토큰 계산 필요)
    const estimatedTokens = Math.ceil(prompt.length / 4);

    if (estimatedTokens <= limit) {
      return prompt;
    }

    // 프롬프트 자르기 (중요한 부분 보존)
    const ratio = limit / estimatedTokens;
    const targetLength = Math.floor(prompt.length * ratio * 0.9); // 10% 여유

    return prompt.substring(0, targetLength) + '...';
  }

  /**
   * 재시도 로직 포함 실행
   */
  private async executeWithRetry(prompt: string, config: APIRequestConfig): Promise<APIResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.retryPolicy.maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 후처리 (코드 블록 마커 제거 등)
        const cleanedText = this.postProcessResponse(text);

        return {
          success: true,
          data: cleanedText,
          metadata: {
            tokensUsed: this.estimateTokensUsed(prompt, cleanedText),
            responseTime: 0, // 외부에서 설정됨
            fromCache: false,
            creativity: this.calculateCreativity(config.creativityMode),
            retryCount: attempt,
          },
        };
      } catch (_error) {
        lastError = _error as Error;

        if (
          !this.shouldRetry(_error as Error, config.retryPolicy) ||
          attempt === config.retryPolicy.maxRetries
        ) {
          break;
        }

        const delay = this.calculateRetryDelay(attempt, config.retryPolicy);
        await this.delay(delay);
      }
    }

    return {
      success: false,
      error: lastError || new Error('Unknown error'),
      metadata: {
        tokensUsed: 0,
        responseTime: 0,
        fromCache: false,
        creativity: 0,
        retryCount: config.retryPolicy.maxRetries,
      },
    };
  }

  /**
   * 응답 후처리 (기존 gemini-story-generator.js 로직 적용)
   */
  private postProcessResponse(text: string): string {
    let content = text;

    // Gemini AI 응답에서 코드 블록 마커 제거
    content = content.replace(/^```[\s\S]*?\n/, ''); // 시작 코드 블록 제거
    content = content.replace(/\n```\s*$/, ''); // 끝 코드 블록 제거
    content = content.replace(/```\s*\n\s*```\s*$/, ''); // 빈 코드 블록 제거
    content = content.trim(); // 앞뒤 공백 제거

    return content;
  }

  /**
   * 설정 빌드
   */
  private buildConfig(config: Partial<APIRequestConfig>): APIRequestConfig {
    return {
      creativityMode: config.creativityMode || 'standard',
      priority: config.priority || 'normal',
      cacheStrategy: config.cacheStrategy || 'memory',
      retryPolicy: config.retryPolicy || this.getDefaultRetryPolicy(),
      tokenLimit: config.tokenLimit,
      timeoutMs: config.timeoutMs || 30000,
    };
  }

  private getDefaultRetryPolicy(): RetryPolicy {
    return {
      maxRetries: 3,
      baseDelayMs: 2000,
      exponentialBackoff: true,
      retryConditions: ['overloaded', '503', 'timeout'],
    };
  }

  /**
   * 캐시 관리
   */
  private generateCacheKey(prompt: string, config: APIRequestConfig): string {
    const configStr = JSON.stringify({
      mode: config.creativityMode,
      limit: config.tokenLimit,
    });
    return `${this.hash(prompt)}-${this.hash(configStr)}`;
  }

  private checkCache(key: string, strategy: string): APIResponse | null {
    if (strategy === 'none') return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.accessCount++;
    return {
      success: true,
      data: entry.content,
      metadata: {
        tokensUsed: entry.tokensUsed,
        responseTime: 0,
        fromCache: true,
        creativity: 0,
        retryCount: 0,
      },
    };
  }

  private updateCache(
    key: string,
    content: string,
    responseTime: number,
    config: APIRequestConfig
  ): void {
    const ttl =
      config.cacheStrategy === 'persistent'
        ? 24 * 60 * 60 * 1000 // 24시간
        : 60 * 60 * 1000; // 1시간

    this.cache.set(key, {
      content,
      timestamp: Date.now(),
      tokensUsed: this.estimateTokensUsed('', content),
      ttl,
      accessCount: 1,
    });

    // 캐시 크기 제한
    if (this.cache.size > 1000) {
      this.evictLRUCache();
    }
  }

  /**
   * 유틸리티 메서드들
   */
  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32bit 정수로 변환
    }
    return hash.toString(36);
  }

  private estimateTokensUsed(prompt: string, response: string): number {
    return Math.ceil((prompt.length + response.length) / 4);
  }

  private calculateCreativity(mode: string): number {
    const modeMap = {
      standard: 0.7,
      high: 0.85,
      unlimited: 1.0,
    };
    return modeMap[mode as keyof typeof modeMap] || 0.7;
  }

  private shouldRetry(error: Error, policy: RetryPolicy): boolean {
    return policy.retryConditions.some(condition =>
      error.message.toLowerCase().includes(condition.toLowerCase())
    );
  }

  private calculateRetryDelay(attempt: number, policy: RetryPolicy): number {
    if (!policy.exponentialBackoff) {
      return policy.baseDelayMs;
    }
    return policy.baseDelayMs * Math.pow(2, attempt);
  }

  private calculateOptimalBatchSize(requestCount: number): number {
    if (requestCount <= 5) return requestCount;
    if (requestCount <= 20) return 5;
    return 10;
  }

  private evictLRUCache(): void {
    // LRU 정책으로 캐시 항목 제거
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].accessCount - b[1].accessCount);

    const toDelete = entries.slice(0, 100); // 100개 제거
    toDelete.forEach(([key]) => this.cache.delete(key));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 메트릭 조회
   */
  getMetrics(): unknown {
    return this.metrics.getReport();
  }

  /**
   * 캐시 통계
   */
  getCacheStats(): unknown {
    return {
      size: this.cache.size,
      hitRate: this.metrics.getCacheHitRate(),
      totalSavings: this.metrics.getTotalTokenSavings(),
    };
  }
}

// 보조 클래스들
class RateLimiter {
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private resetTime: number = 0;

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();

    // 분당 요청 제한 (예: 60 RPM)
    if (now - this.resetTime > 60000) {
      this.requestCount = 0;
      this.resetTime = now;
    }

    if (this.requestCount >= 60) {
      const waitTime = 60000 - (now - this.resetTime);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // 요청 간 최소 간격 (예: 1초)
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  getBatchDelay(): number {
    return 2000; // 배치 간 2초 딜레이
  }
}

class APIMetrics {
  private requests: unknown[] = [];
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  recordRequest(result: APIResponse, responseTime: number, config: APIRequestConfig): void {
    this.requests.push({
      timestamp: Date.now(),
      success: result.success,
      responseTime,
      tokensUsed: result.metadata.tokensUsed,
      creativityMode: config.creativityMode,
      fromCache: result.metadata.fromCache,
    });

    if (result.metadata.fromCache) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }

    // 메트릭 크기 제한
    if (this.requests.length > 10000) {
      this.requests.splice(0, 5000);
    }
  }

  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? this.cacheHits / total : 0;
  }

  getTotalTokenSavings(): number {
    return this.requests
      .filter(req => req.fromCache)
      .reduce((total, req) => total + req.tokensUsed, 0);
  }

  getReport(): unknown {
    const recent = this.requests.slice(-100); // 최근 100개 요청

    return {
      totalRequests: this.requests.length,
      successRate: recent.filter(r => r.success).length / Math.max(recent.length, 1),
      avgResponseTime:
        recent.reduce((sum, r) => sum + r.responseTime, 0) / Math.max(recent.length, 1),
      avgTokensUsed: recent.reduce((sum, r) => sum + r.tokensUsed, 0) / Math.max(recent.length, 1),
      cacheHitRate: this.getCacheHitRate(),
      totalTokenSavings: this.getTotalTokenSavings(),
    };
  }
}

interface QueuedRequest {
  prompt: string;
  config: APIRequestConfig;
  resolve: (value: APIResponse) => void;
  reject: (error: Error) => void;
}

export default EnhancedGeminiWrapper;
