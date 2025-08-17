/**
 * 🔧 API 관련 타입 정의
 * Gemini API, 외부 API 응답 타입들
 */

export interface GeminiResponse {
  response: {
    text(): string;
    candidates?: Array<{
      content: {
        parts: Array<{ text: string }>;
      };
      finishReason?: string;
      index?: number;
    }>;
  };
}

export interface GeminiGenerationConfig {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}

export interface APIError {
  message: string;
  code?: string | number;
  details?: unknown;
}

export interface RequestConfig {
  retries?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ValidationResponse {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  data?: unknown;
}

export interface ProcessingResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: Record<string, unknown>;
}

// 제네릭 API 응답 타입
export interface APIResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: APIError;
  timestamp: string;
}

// 배치 처리 결과
export interface BatchResult<T = unknown> {
  total: number;
  processed: number;
  failed: number;
  results: Array<ProcessingResult<T>>;
  errors: APIError[];
}