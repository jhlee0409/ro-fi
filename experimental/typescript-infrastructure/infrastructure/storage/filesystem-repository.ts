/**
 * 파일 시스템 기반 스토리지 구현체
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import type { IStorageRepository, FileMetadata } from './storage-interface';
import type { Result } from '../../shared/types';
import { ok, err } from '../../shared/types';
import { StorageError, FileNotFoundError } from '../../shared/errors';

export class FileSystemRepository implements IStorageRepository {
  constructor(private readonly basePath: string = '') {}

  async readFile(path: string): Promise<Result<string, StorageError | FileNotFoundError>> {
    try {
      const fullPath = this.getFullPath(path);
      const content = await fs.readFile(fullPath, 'utf-8');
      return ok(content);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return err(new FileNotFoundError(path));
      }
      return err(new StorageError('readFile', path, error as Error));
    }
  }

  async writeFile(path: string, content: string): Promise<Result<void, StorageError>> {
    try {
      const fullPath = this.getFullPath(path);
      
      // 디렉토리가 존재하지 않으면 생성
      const dirResult = await this.ensureDirectory(dirname(fullPath));
      if (!dirResult.success) {
        return dirResult;
      }
      
      await fs.writeFile(fullPath, content, 'utf-8');
      return ok(undefined);
    } catch (error) {
      return err(new StorageError('writeFile', path, error as Error));
    }
  }

  async exists(path: string): Promise<Result<boolean, StorageError>> {
    try {
      const fullPath = this.getFullPath(path);
      await fs.access(fullPath);
      return ok(true);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return ok(false);
      }
      return err(new StorageError('exists', path, error as Error));
    }
  }

  async ensureDirectory(path: string): Promise<Result<void, StorageError>> {
    try {
      const fullPath = this.getFullPath(path);
      await fs.mkdir(fullPath, { recursive: true });
      return ok(undefined);
    } catch (error) {
      return err(new StorageError('ensureDirectory', path, error as Error));
    }
  }

  async listFiles(directory: string, pattern?: string): Promise<Result<string[], StorageError>> {
    try {
      const fullPath = this.getFullPath(directory);
      const files = await fs.readdir(fullPath);
      
      const filteredFiles = pattern 
        ? files.filter(file => file.includes(pattern))
        : files;
        
      return ok(filteredFiles);
    } catch (error) {
      return err(new StorageError('listFiles', directory, error as Error));
    }
  }

  async deleteFile(path: string): Promise<Result<void, StorageError>> {
    try {
      const fullPath = this.getFullPath(path);
      await fs.unlink(fullPath);
      return ok(undefined);
    } catch (error) {
      return err(new StorageError('deleteFile', path, error as Error));
    }
  }

  async deleteDirectory(path: string, recursive = false): Promise<Result<void, StorageError>> {
    try {
      const fullPath = this.getFullPath(path);
      await fs.rm(fullPath, { recursive, force: true });
      return ok(undefined);
    } catch (error) {
      return err(new StorageError('deleteDirectory', path, error as Error));
    }
  }

  async getMetadata(path: string): Promise<Result<FileMetadata, StorageError>> {
    try {
      const fullPath = this.getFullPath(path);
      const stats = await fs.stat(fullPath);
      
      const metadata: FileMetadata = {
        path,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
      };
      
      return ok(metadata);
    } catch (error) {
      return err(new StorageError('getMetadata', path, error as Error));
    }
  }

  private getFullPath(path: string): string {
    return this.basePath ? join(this.basePath, path) : path;
  }
}