/**
 * 로그 관리 유틸리티
 * 로그 로테이션, 압축, 보관, 정리 기능
 */

import fs from 'fs/promises';
import path from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 로그 관리자
 */
export class LogManager {
  constructor(config = {}) {
    this.config = {
      logDir: config.logDir || path.join(__dirname, '../../logs'),
      archiveDir: config.archiveDir || path.join(__dirname, '../../logs/archive'),
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      maxFiles: config.maxFiles || 10,
      maxAge: config.maxAge || 30, // 30일
      compressionEnabled: config.compressionEnabled !== false,
      retentionPolicy: config.retentionPolicy || {
        daily: 7,    // 일일 로그 7일 보관
        weekly: 4,   // 주간 로그 4주 보관
        monthly: 12  // 월간 로그 12개월 보관
      },
      ...config
    };

    this.initialize();
  }

  async initialize() {
    // 디렉토리 생성
    await this.ensureDirectories();
    
    // 자동 정리 스케줄 설정
    this.startAutomaticCleanup();
  }

  /**
   * 로그 파일 로테이션
   */
  async rotateLog(filePath) {
    try {
      const stats = await fs.stat(filePath);
      if (stats.size < this.config.maxFileSize) {
        return false; // 로테이션 불필요
      }

      const baseName = path.basename(filePath, '.log');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedName = `${baseName}-${timestamp}.log`;
      const rotatedPath = path.join(path.dirname(filePath), rotatedName);

      // 파일 이름 변경
      await fs.rename(filePath, rotatedPath);

      // 압축 활성화시 압축 수행
      if (this.config.compressionEnabled) {
        await this.compressLog(rotatedPath);
      }

      return true;
    } catch (error) {
      console.error('Log rotation failed:', error);
      return false;
    }
  }

  /**
   * 로그 파일 압축
   */
  async compressLog(filePath) {
    const gzipPath = `${filePath}.gz`;
    
    try {
      await pipeline(
        createReadStream(filePath),
        createGzip(),
        createWriteStream(gzipPath)
      );

      // 원본 파일 삭제
      await fs.unlink(filePath);

      // 압축 파일을 아카이브로 이동
      const archivePath = path.join(
        this.config.archiveDir,
        path.basename(gzipPath)
      );
      await fs.rename(gzipPath, archivePath);

      return archivePath;
    } catch (error) {
      console.error('Log compression failed:', error);
      throw error;
    }
  }

  /**
   * 로그 정리 정책 적용
   */
  async applyRetentionPolicy() {
    const now = Date.now();
    const files = await this.getAllLogFiles();

    for (const file of files) {
      try {
        const stats = await fs.stat(file.path);
        const ageInDays = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

        // 연령별 보관 정책 적용
        if (this.shouldDelete(file, ageInDays)) {
          await fs.unlink(file.path);
          console.log(`Deleted old log: ${file.name}`);
        }
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }
  }

  /**
   * 파일 삭제 여부 판단
   */
  shouldDelete(file, ageInDays) {
    const { daily, weekly, monthly } = this.config.retentionPolicy;

    // 일일 로그
    if (file.type === 'daily' && ageInDays > daily) {
      return true;
    }

    // 주간 로그
    if (file.type === 'weekly' && ageInDays > weekly * 7) {
      return true;
    }

    // 월간 로그
    if (file.type === 'monthly' && ageInDays > monthly * 30) {
      return true;
    }

    // 최대 연령 초과
    if (ageInDays > this.config.maxAge) {
      return true;
    }

    return false;
  }

  /**
   * 로그 아카이빙
   */
  async archiveLogs(pattern = 'daily') {
    const files = await this.getLogsByPattern(pattern);
    const archived = [];

    for (const file of files) {
      try {
        const archivePath = await this.compressLog(file.path);
        archived.push({
          original: file.path,
          archived: archivePath
        });
      } catch (error) {
        console.error(`Failed to archive ${file.name}:`, error);
      }
    }

    return archived;
  }

  /**
   * 로그 통계 생성
   */
  async generateLogStats() {
    const files = await this.getAllLogFiles();
    const stats = {
      totalFiles: files.length,
      totalSize: 0,
      byType: {},
      byAge: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        older: 0
      }
    };

    const now = Date.now();

    for (const file of files) {
      try {
        const fileStat = await fs.stat(file.path);
        stats.totalSize += fileStat.size;

        // 타입별 통계
        stats.byType[file.type] = (stats.byType[file.type] || 0) + 1;

        // 연령별 통계
        const ageInDays = (now - fileStat.mtime.getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays < 1) stats.byAge.today++;
        else if (ageInDays < 7) stats.byAge.thisWeek++;
        else if (ageInDays < 30) stats.byAge.thisMonth++;
        else stats.byAge.older++;
      } catch (error) {
        console.error(`Failed to stat ${file.name}:`, error);
      }
    }

    stats.totalSizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
    return stats;
  }

  /**
   * 로그 검색
   */
  async searchLogs(searchTerm, options = {}) {
    const files = await this.getLogsByPattern(options.pattern || '.*');
    const results = [];
    const maxResults = options.maxResults || 100;

    for (const file of files) {
      if (results.length >= maxResults) break;

      try {
        const content = await fs.readFile(file.path, 'utf8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(searchTerm)) {
            results.push({
              file: file.name,
              line: i + 1,
              content: lines[i],
              context: {
                before: lines[i - 1] || '',
                after: lines[i + 1] || ''
              }
            });

            if (results.length >= maxResults) break;
          }
        }
      } catch (error) {
        console.error(`Failed to search ${file.name}:`, error);
      }
    }

    return results;
  }

  /**
   * 로그 병합 (여러 로그 파일을 하나로)
   */
  async mergeLogs(pattern, outputPath) {
    const files = await this.getLogsByPattern(pattern);
    const writeStream = createWriteStream(outputPath);

    for (const file of files) {
      try {
        const content = await fs.readFile(file.path, 'utf8');
        writeStream.write(`\n=== ${file.name} ===\n`);
        writeStream.write(content);
      } catch (error) {
        console.error(`Failed to read ${file.name}:`, error);
      }
    }

    writeStream.end();
    return outputPath;
  }

  /**
   * 유틸리티 메서드
   */
  async getAllLogFiles() {
    const files = [];
    
    // 로그 디렉토리 스캔
    const logFiles = await this.scanDirectory(this.config.logDir);
    files.push(...logFiles.map(f => ({ ...f, type: this.getLogType(f.name) })));

    // 아카이브 디렉토리 스캔
    const archiveFiles = await this.scanDirectory(this.config.archiveDir);
    files.push(...archiveFiles.map(f => ({ ...f, type: 'archive' })));

    return files;
  }

  async getLogsByPattern(pattern) {
    const allFiles = await this.getAllLogFiles();
    const regex = new RegExp(pattern);
    return allFiles.filter(f => regex.test(f.name));
  }

  async scanDirectory(dir) {
    try {
      const files = await fs.readdir(dir);
      return files
        .filter(f => f.endsWith('.log') || f.endsWith('.log.gz'))
        .map(f => ({
          name: f,
          path: path.join(dir, f)
        }));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Failed to scan directory ${dir}:`, error);
      }
      return [];
    }
  }

  getLogType(filename) {
    if (filename.includes('app-')) return 'daily';
    if (filename.includes('metrics-')) return 'metrics';
    if (filename.includes('structured-')) return 'structured';
    if (filename.includes('error-')) return 'error';
    return 'other';
  }

  async ensureDirectories() {
    await fs.mkdir(this.config.logDir, { recursive: true });
    await fs.mkdir(this.config.archiveDir, { recursive: true });
  }

  startAutomaticCleanup() {
    // 매일 자정에 정리 실행
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.applyRetentionPolicy();
      // 이후 24시간마다 반복
      setInterval(() => this.applyRetentionPolicy(), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }
}

// 싱글톤 인스턴스
let logManagerInstance = null;

export function getLogManager(config) {
  if (!logManagerInstance) {
    logManagerInstance = new LogManager(config);
  }
  return logManagerInstance;
}