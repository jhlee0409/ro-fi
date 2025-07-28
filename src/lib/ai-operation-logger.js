/**
 * AI 작업 전용 로거
 * AI 모델 호출, 토큰 사용량, 비용 추적 등 특화 기능
 */

import { getLogger, LogCategory, MetricType } from './logging-service.js';

/**
 * AI 작업 로거
 */
export class AIOperationLogger {
  constructor(config = {}) {
    this.logger = getLogger(config);
    this.operationStack = [];
    this.sessionMetrics = {
      totalTokens: 0,
      totalCost: 0,
      apiCalls: 0,
      errors: 0,
      avgResponseTime: 0
    };
  }

  /**
   * AI 작업 시작
   */
  startOperation(operationName, metadata = {}) {
    const operation = {
      id: `${operationName}-${Date.now()}`,
      name: operationName,
      startTime: Date.now(),
      metadata: {
        ...metadata,
        model: metadata.model || 'unknown',
        provider: metadata.provider || 'unknown',
        maxTokens: metadata.maxTokens || 0
      }
    };

    this.operationStack.push(operation);

    this.logger.debug(`AI Operation started: ${operationName}`, {
      category: LogCategory.AI_OPERATION,
      operationId: operation.id,
      ...operation.metadata
    });

    return operation.id;
  }

  /**
   * AI 작업 완료
   */
  async endOperation(operationId, result = {}) {
    const operationIndex = this.operationStack.findIndex(op => op.id === operationId);
    if (operationIndex === -1) {
      this.logger.warn(`Unknown operation ID: ${operationId}`);
      return;
    }

    const operation = this.operationStack.splice(operationIndex, 1)[0];
    const duration = Date.now() - operation.startTime;

    // 세션 메트릭 업데이트
    this.updateSessionMetrics(result, duration);

    // 상세 로깅
    const logData = {
      category: LogCategory.AI_OPERATION,
      operationId: operation.id,
      operationName: operation.name,
      duration,
      success: !result.error,
      ...operation.metadata,
      result: {
        tokens: result.tokens || { input: 0, output: 0 },
        cost: result.cost || 0,
        model: result.model || operation.metadata.model,
        error: result.error || null
      }
    };

    if (result.error) {
      await this.logger.error(`AI Operation failed: ${operation.name}`, logData);
    } else {
      await this.logger.info(`AI Operation completed: ${operation.name}`, logData);
    }

    // 성능 로깅
    await this.logger.logPerformance(`AI_${operation.name}`, duration, {
      tokens: result.tokens,
      cost: result.cost
    });

    return logData;
  }

  /**
   * 프롬프트 로깅
   */
  async logPrompt(prompt, metadata = {}) {
    const truncatedPrompt = prompt.length > 500 ? 
      prompt.substring(0, 500) + '... [truncated]' : prompt;

    await this.logger.debug('AI Prompt', {
      category: LogCategory.AI_OPERATION,
      promptLength: prompt.length,
      prompt: truncatedPrompt,
      ...metadata
    });
  }

  /**
   * 응답 로깅
   */
  async logResponse(response, metadata = {}) {
    const truncatedResponse = response.length > 500 ? 
      response.substring(0, 500) + '... [truncated]' : response;

    await this.logger.debug('AI Response', {
      category: LogCategory.AI_OPERATION,
      responseLength: response.length,
      response: truncatedResponse,
      ...metadata
    });
  }

  /**
   * 토큰 사용량 로깅
   */
  async logTokenUsage(usage, metadata = {}) {
    const totalTokens = (usage.input || 0) + (usage.output || 0);
    
    await this.logger.info('Token Usage', {
      category: LogCategory.AI_OPERATION,
      tokens: usage,
      totalTokens,
      ...metadata
    });

    // 메트릭 업데이트
    await this.logger.updateMetrics(MetricType.TOKEN_USAGE, totalTokens);
  }

  /**
   * API 에러 로깅
   */
  async logAPIError(error, context = {}) {
    const errorData = {
      category: LogCategory.AI_OPERATION,
      errorType: error.constructor.name,
      errorMessage: error.message,
      errorStack: error.stack,
      statusCode: error.status || error.statusCode,
      ...context
    };

    // 429 에러 (rate limit) 특별 처리
    if (error.status === 429 || error.statusCode === 429) {
      await this.logger.warn('AI API Rate Limit', errorData);
    } else if (error.status >= 500 || error.statusCode >= 500) {
      await this.logger.critical('AI API Server Error', errorData);
    } else {
      await this.logger.error('AI API Error', errorData);
    }

    // 에러율 메트릭
    await this.logger.updateMetrics(MetricType.ERROR_RATE, 1);
  }

  /**
   * 비용 추적
   */
  async logCost(cost, metadata = {}) {
    await this.logger.info('AI Operation Cost', {
      category: LogCategory.AI_OPERATION,
      cost,
      currency: metadata.currency || 'USD',
      ...metadata
    });
  }

  /**
   * 하이브리드 AI 작업 로깅
   */
  async logHybridOperation(primaryModel, fallbackModel, result, metadata = {}) {
    await this.logger.info('Hybrid AI Operation', {
      category: LogCategory.AI_OPERATION,
      primaryModel,
      fallbackModel,
      usedModel: result.model,
      fallbackUsed: result.model === fallbackModel,
      ...metadata,
      result
    });
  }

  /**
   * 세션 메트릭 업데이트
   */
  updateSessionMetrics(result, duration) {
    this.sessionMetrics.apiCalls++;
    
    if (result.tokens) {
      this.sessionMetrics.totalTokens += 
        (result.tokens.input || 0) + (result.tokens.output || 0);
    }
    
    if (result.cost) {
      this.sessionMetrics.totalCost += result.cost;
    }
    
    if (result.error) {
      this.sessionMetrics.errors++;
    }
    
    // 평균 응답 시간 계산
    this.sessionMetrics.avgResponseTime = 
      (this.sessionMetrics.avgResponseTime * (this.sessionMetrics.apiCalls - 1) + duration) / 
      this.sessionMetrics.apiCalls;
  }

  /**
   * 세션 요약 로깅
   */
  async logSessionSummary() {
    await this.logger.info('AI Session Summary', {
      category: LogCategory.AI_OPERATION,
      summary: this.sessionMetrics,
      successRate: ((this.sessionMetrics.apiCalls - this.sessionMetrics.errors) / 
                    this.sessionMetrics.apiCalls * 100).toFixed(2) + '%'
    });
  }

  /**
   * 모델별 성능 비교 로깅
   */
  async logModelComparison(comparisons) {
    await this.logger.info('AI Model Performance Comparison', {
      category: LogCategory.AI_OPERATION,
      comparisons
    });
  }
}

/**
 * AI 작업 로거 인스턴스
 */
let aiLoggerInstance = null;

export function getAILogger(config) {
  if (!aiLoggerInstance) {
    aiLoggerInstance = new AIOperationLogger(config);
  }
  return aiLoggerInstance;
}

/**
 * AI 작업 추적 데코레이터
 */
export function trackAIOperation(operationName) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const logger = getAILogger();
      const operationId = logger.startOperation(operationName, {
        method: propertyKey,
        args: args.length
      });

      try {
        const result = await originalMethod.apply(this, args);
        await logger.endOperation(operationId, {
          success: true,
          ...result
        });
        return result;
      } catch (error) {
        await logger.endOperation(operationId, {
          error: error.message
        });
        throw error;
      }
    };

    return descriptor;
  };
}