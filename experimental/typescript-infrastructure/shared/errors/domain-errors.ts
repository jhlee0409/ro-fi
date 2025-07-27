/**
 * 도메인별 커스텀 에러 클래스들
 */

export class DomainError extends Error {
  readonly httpStatus: number = 500;
  
  constructor(public readonly code: string, message: string, public readonly context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
  }
}

// 소설 관련 에러
export class NovelNotFoundError extends DomainError {
  readonly httpStatus = 404;
  
  constructor(novelId: string) {
    super('NOVEL_NOT_FOUND', `Novel with id '${novelId}' not found`, { novelId });
  }
}

export class InvalidNovelDataError extends DomainError {
  readonly httpStatus = 400;
  
  constructor(reason: string, data?: any) {
    super('INVALID_NOVEL_DATA', `Invalid novel data: ${reason}`, { data });
  }
}

// 챕터 관련 에러
export class ChapterNotFoundError extends DomainError {
  readonly httpStatus = 404;
  
  constructor(novelId: string, chapterNumber: number) {
    super('CHAPTER_NOT_FOUND', `Chapter ${chapterNumber} not found for novel '${novelId}'`, { 
      novelId, 
      chapterNumber 
    });
  }
}

export class ChapterGenerationError extends DomainError {
  readonly httpStatus = 500;
  
  constructor(reason: string, context?: Record<string, any>) {
    super('CHAPTER_GENERATION_FAILED', `Chapter generation failed: ${reason}`, context);
  }
}

// 스토리 관련 에러
export class StoryConceptError extends DomainError {
  readonly httpStatus = 400;
  
  constructor(reason: string) {
    super('STORY_CONCEPT_ERROR', `Story concept error: ${reason}`);
  }
}

export class TropeCompatibilityError extends DomainError {
  readonly httpStatus = 400;
  
  constructor(mainTrope: string, subTrope: string) {
    super('TROPE_COMPATIBILITY_ERROR', `Tropes '${mainTrope}' and '${subTrope}' are not compatible`, {
      mainTrope,
      subTrope
    });
  }
}

// 자동화 관련 에러
export class AutomationConfigError extends DomainError {
  readonly httpStatus = 500;
  
  constructor(reason: string) {
    super('AUTOMATION_CONFIG_ERROR', `Automation configuration error: ${reason}`);
  }
}

export class AutomationExecutionError extends DomainError {
  readonly httpStatus = 500;
  
  constructor(action: string, reason: string) {
    super('AUTOMATION_EXECUTION_ERROR', `Automation execution failed for action '${action}': ${reason}`, { action });
  }
}

// 스토리지 관련 에러
export class StorageError extends DomainError {
  readonly httpStatus: number = 500;
  
  constructor(operation: string, path: string, cause?: Error) {
    super('STORAGE_ERROR', `Storage operation '${operation}' failed for path '${path}'`, { 
      operation, 
      path, 
      cause: cause?.message 
    });
  }
}

export class FileNotFoundError extends StorageError {
  readonly httpStatus = 404;
  
  constructor(path: string) {
    super('read', path);
    this.message = `File not found: ${path}`;
  }
}

// AI 관련 에러
export class AIServiceError extends DomainError {
  readonly httpStatus = 500;
  
  constructor(service: string, reason: string) {
    super('AI_SERVICE_ERROR', `AI service '${service}' error: ${reason}`, { service });
  }
}

export class AIRateLimitError extends DomainError {
  readonly httpStatus = 429;
  
  constructor(retryAfter?: number) {
    super('AI_RATE_LIMIT', 'AI service rate limit exceeded', { retryAfter });
  }
}

// 검증 관련 에러
export class ValidationError extends DomainError {
  readonly httpStatus = 400;
  
  constructor(reason: string, field?: string, value?: any) {
    super('VALIDATION_ERROR', field ? `Validation failed for field '${field}': ${reason}` : `Validation failed: ${reason}`, { field, value });
  }
}