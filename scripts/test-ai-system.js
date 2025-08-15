#!/usr/bin/env node

/**
 * 🧪 Gemini API 로맨스 판타지 자동 연재 시스템 테스트
 * 
 * 이 스크립트는 메인 시스템을 실제로 실행하지 않고
 * API 연결, 환경 설정, 파일 구조 등을 검증합니다.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// .env.local 파일 로드
dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

class SystemTester {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  async runAllTests() {
    console.log('🧪 Gemini API 시스템 테스트 시작\n');

    await this.testEnvironmentVariables();
    await this.testDirectoryStructure();
    await this.testGeminiAPIConnection();
    await this.testFilePermissions();
    await this.testPackageDependencies();

    this.printResults();
    return this.results.every(r => r.passed);
  }

  async testEnvironmentVariables() {
    const testName = '🔑 환경변수 확인';
    console.log(`${testName}...`);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        this.addResult(testName, false, 'GEMINI_API_KEY가 설정되지 않았습니다');
        return;
      }

      if (!apiKey.startsWith('AIza')) {
        this.addResult(testName, false, 'API 키 형식이 올바르지 않습니다 (AIza로 시작해야 함)');
        return;
      }

      this.addResult(testName, true, `API 키 확인됨 (${apiKey.substring(0, 10)}...)`);
    } catch (error) {
      this.addResult(testName, false, error.message);
    }
  }

  async testDirectoryStructure() {
    const testName = '📁 디렉토리 구조 확인';
    console.log(`${testName}...`);

    try {
      const requiredDirs = [
        'src/content/novels',
        'src/content/chapters',
        'scripts',
        '.github/workflows'
      ];

      const results = await Promise.all(
        requiredDirs.map(async dir => {
          const fullPath = join(PROJECT_ROOT, dir);
          try {
            const stats = await fs.stat(fullPath);
            return { dir, exists: stats.isDirectory() };
          } catch {
            return { dir, exists: false };
          }
        })
      );

      const missing = results.filter(r => !r.exists);
      
      if (missing.length > 0) {
        this.addResult(testName, false, `누락된 디렉토리: ${missing.map(m => m.dir).join(', ')}`);
      } else {
        this.addResult(testName, true, '모든 필수 디렉토리 확인됨');
      }
    } catch (error) {
      this.addResult(testName, false, error.message);
    }
  }

  async testGeminiAPIConnection() {
    const testName = '🤖 Gemini API 연결 테스트';
    console.log(`${testName}...`);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        this.addResult(testName, false, 'API 키가 없어 연결 테스트를 건너뜁니다');
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          maxOutputTokens: 50,
        }
      });

      // 간단한 API 호출 테스트
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: '안녕하세요! 간단한 인사말을 해주세요.' }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        }
      });

      const response = await result.response;
      const content = response.text();

      if (content && content.length > 0) {
        this.addResult(testName, true, `API 연결 성공 (응답: ${content.substring(0, 30)}...)`);
      } else {
        this.addResult(testName, false, 'API 응답이 비어있습니다');
      }
    } catch (error) {
      this.addResult(testName, false, `API 연결 실패: ${error.message}`);
    }
  }

  async testFilePermissions() {
    const testName = '📝 파일 권한 확인';
    console.log(`${testName}...`);

    try {
      const testFile = join(PROJECT_ROOT, 'test-write-permission.tmp');
      
      // 쓰기 권한 테스트
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);

      this.addResult(testName, true, '파일 쓰기/삭제 권한 확인됨');
    } catch (error) {
      this.addResult(testName, false, `파일 권한 오류: ${error.message}`);
    }
  }

  async testPackageDependencies() {
    const testName = '📦 패키지 의존성 확인';
    console.log(`${testName}...`);

    try {
      const packagePath = join(PROJECT_ROOT, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      const requiredDeps = {
        '@google/generative-ai': '필수 Gemini API SDK',
        'gray-matter': '마크다운 처리용',
        'astro': '웹 프레임워크'
      };

      const missing = [];
      const found = [];

      for (const [dep, description] of Object.entries(requiredDeps)) {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
          found.push(`${dep} (${description})`);
        } else {
          missing.push(`${dep} (${description})`);
        }
      }

      if (missing.length > 0) {
        this.addResult(testName, false, `누락된 의존성: ${missing.join(', ')}`);
      } else {
        this.addResult(testName, true, `모든 필수 의존성 확인됨: ${found.length}개`);
      }
    } catch (error) {
      this.addResult(testName, false, error.message);
    }
  }

  addResult(testName, passed, message) {
    this.results.push({ testName, passed, message });
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${message}\n`);
  }

  printResults() {
    console.log('📊 테스트 결과 요약:');
    console.log('='.repeat(50));

    let passed = 0;
    let failed = 0;

    for (const result of this.results) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.testName}`);
      if (result.passed) passed++;
      else failed++;
    }

    console.log('='.repeat(50));
    console.log(`총 ${this.results.length}개 테스트 중 ${passed}개 성공, ${failed}개 실패`);

    if (failed === 0) {
      console.log('\n🎉 모든 테스트가 통과했습니다!');
      console.log('Gemini API 자동 연재 시스템이 정상적으로 설정되었습니다.');
    } else {
      console.log('\n🚨 일부 테스트가 실패했습니다.');
      console.log('실패한 항목들을 확인하고 문제를 해결해주세요.');
    }
  }
}

// 메인 실행
async function main() {
  try {
    const tester = new SystemTester();
    const allPassed = await tester.runAllTests();
    
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('🚨 테스트 실행 중 오류:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}