/**
 * 스토리지 인터페이스 - 추상화된 파일 시스템 접근
 */

import type { Result } from '../../shared/types';
import type { StorageError, FileNotFoundError } from '../../shared/errors';

export interface IStorageRepository {
  /**
   * 파일 읽기
   */
  readFile(path: string): Promise<Result<string, StorageError | FileNotFoundError>>;
  
  /**
   * 파일 쓰기
   */
  writeFile(path: string, content: string): Promise<Result<void, StorageError>>;
  
  /**
   * 파일 존재 여부 확인
   */
  exists(path: string): Promise<Result<boolean, StorageError>>;
  
  /**
   * 디렉토리 생성
   */
  ensureDirectory(path: string): Promise<Result<void, StorageError>>;
  
  /**
   * 디렉토리 내 파일 목록
   */
  listFiles(directory: string, pattern?: string): Promise<Result<string[], StorageError>>;
  
  /**
   * 파일 삭제
   */
  deleteFile(path: string): Promise<Result<void, StorageError>>;
  
  /**
   * 디렉토리 삭제
   */
  deleteDirectory(path: string, recursive?: boolean): Promise<Result<void, StorageError>>;
  
  /**
   * 파일 메타데이터 조회
   */
  getMetadata(path: string): Promise<Result<FileMetadata, StorageError>>;
}

export interface FileMetadata {
  readonly path: string;
  readonly size: number;
  readonly created: Date;
  readonly modified: Date;
  readonly isDirectory: boolean;
}