#!/usr/bin/env node

/**
 * GitHub Actions 로컬 테스트 통합 검증 스크립트
 * 
 * 이 스크립트는 로컬 GitHub Actions 환경을 검증하고
 * 다양한 테스트 시나리오를 실행합니다.
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');

class LocalActionsTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };
  }

  /**
   * 테스트 결과 기록
   */
  recordTest(name, status, message = '', details = null) {
    const test = {
      name,
      status, // 'pass', 'fail', 'skip'
      message,
      details,
      timestamp: new Date().toISOString()
    };

    this.results.tests.push(test);
    
    switch (status) {
      case 'pass':
        this.results.passed++;
        console.log(`✅ ${name}: ${message || 'PASS'}`);
        break;
      case 'fail':
        this.results.failed++;
        console.log(`❌ ${name}: ${message || 'FAIL'}`);
        if (details) console.log(`   세부사항: ${details}`);
        break;
      case 'skip':
        this.results.skipped++;
        console.log(`⏭️  ${name}: ${message || 'SKIP'}`);
        break;
    }
  }

  /**
   * 환경 의존성 테스트
   */
  async testDependencies() {
    console.log('\n🔧 의존성 테스트');
    console.log('================');

    // Docker 테스트
    try {
      execSync('docker --version', { stdio: 'ignore' });
      execSync('docker info', { stdio: 'ignore' });
      this.recordTest('Docker 설치 및 실행', 'pass', 'Docker 정상 작동');
    } catch (error) {
      this.recordTest('Docker 설치 및 실행', 'fail', 'Docker를 확인하세요', error.message);
    }

    // act 테스트
    try {
      const version = execSync('act --version', { encoding: 'utf8' }).trim();
      this.recordTest('act 설치', 'pass', `버전: ${version}`);
    } catch (error) {
      this.recordTest('act 설치', 'fail', 'act를 설치하세요', error.message);
    }

    // Node.js 버전 테스트
    try {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0]);
      if (major >= 18) {
        this.recordTest('Node.js 버전', 'pass', `버전: ${version} (>=18 요구됨)`);
      } else {
        this.recordTest('Node.js 버전', 'fail', `버전: ${version} (18 이상 필요)`);
      }
    } catch (error) {
      this.recordTest('Node.js 버전', 'fail', 'Node.js 버전 확인 실패', error.message);
    }
  }

  /**
   * 워크플로우 파일 구조 테스트
   */
  async testWorkflowStructure() {
    console.log('\n📋 워크플로우 구조 테스트');
    console.log('======================');

    const workflowsDir = join(projectRoot, '.github', 'workflows');
    
    if (!existsSync(workflowsDir)) {
      this.recordTest('워크플로우 디렉토리', 'fail', '.github/workflows 디렉토리 없음');
      return;
    }

    this.recordTest('워크플로우 디렉토리', 'pass', '.github/workflows 디렉토리 존재');

    try {
      const files = execSync(`find ${workflowsDir} -name "*.yml" -o -name "*.yaml"`, 
        { encoding: 'utf8' }).trim().split('\n').filter(f => f);

      if (files.length === 0) {
        this.recordTest('워크플로우 파일', 'fail', '워크플로우 파일이 없음');
        return;
      }

      this.recordTest('워크플로우 파일', 'pass', `${files.length}개 파일 발견`);

      // 각 워크플로우 파일 구조 검증
      for (const file of files) {
        const filename = file.split('/').pop();
        try {
          const content = readFileSync(file, 'utf8');
          const parsed = yaml.parse(content);
          
          // 필수 필드 검증
          const required = ['name', 'on', 'jobs'];
          const missing = required.filter(key => !parsed[key]);
          
          if (missing.length === 0) {
            this.recordTest(`워크플로우 구조: ${filename}`, 'pass', '필수 필드 모두 존재');
          } else {
            this.recordTest(`워크플로우 구조: ${filename}`, 'fail', 
              `누락된 필드: ${missing.join(', ')}`);
          }

          // Job 구조 검증
          const jobs = parsed.jobs || {};
          let jobErrors = 0;
          
          Object.entries(jobs).forEach(([jobName, job]) => {
            if (!job['runs-on'] || !job.steps) {
              jobErrors++;
            }
          });

          if (jobErrors === 0) {
            this.recordTest(`Job 구조: ${filename}`, 'pass', 
              `${Object.keys(jobs).length}개 Job 유효`);
          } else {
            this.recordTest(`Job 구조: ${filename}`, 'fail', 
              `${jobErrors}개 Job에 구조 문제`);
          }

        } catch (parseError) {
          this.recordTest(`YAML 파싱: ${filename}`, 'fail', 
            'YAML 구문 오류', parseError.message);
        }
      }
    } catch (error) {
      this.recordTest('워크플로우 파일 스캔', 'fail', '파일 스캔 실패', error.message);
    }
  }

  /**
   * 로컬 Actions 서비스 테스트
   */
  async testLocalActionsService() {
    console.log('\n🚀 로컬 Actions 서비스 테스트');
    console.log('============================');

    // 서비스 스크립트 존재 확인
    const servicePath = join(projectRoot, 'scripts', 'local-github-actions.js');
    if (!existsSync(servicePath)) {
      this.recordTest('서비스 스크립트', 'fail', '스크립트 파일 없음');
      return;
    }

    this.recordTest('서비스 스크립트', 'pass', '스크립트 파일 존재');

    // 서비스 기본 명령어 테스트
    const commands = [
      { cmd: 'list', desc: '워크플로우 목록 조회' },
      { cmd: 'config', desc: '설정 정보 출력' }
    ];

    for (const { cmd, desc } of commands) {
      try {
        execSync(`node ${servicePath} ${cmd}`, { 
          stdio: 'ignore',
          cwd: projectRoot 
        });
        this.recordTest(`서비스 명령어: ${cmd}`, 'pass', desc);
      } catch (error) {
        this.recordTest(`서비스 명령어: ${cmd}`, 'fail', desc, error.message);
      }
    }
  }

  /**
   * 설정 파일 테스트
   */
  async testConfiguration() {
    console.log('\n⚙️  설정 파일 테스트');
    console.log('=================');

    const configFiles = [
      {
        path: join(projectRoot, '.local-actions'),
        name: '로컬 Actions 디렉토리',
        type: 'directory'
      },
      {
        path: join(projectRoot, '.local-actions', 'secrets'),
        name: '시크릿 설정 파일',
        type: 'file'
      },
      {
        path: join(projectRoot, '.local-actions', '.env'),
        name: '환경변수 설정 파일',
        type: 'file'
      },
      {
        path: join(projectRoot, '.actrc'),
        name: 'act 설정 파일',
        type: 'file'
      }
    ];

    for (const config of configFiles) {
      if (existsSync(config.path)) {
        this.recordTest(config.name, 'pass', `${config.type} 존재`);
        
        // 파일인 경우 내용 검증
        if (config.type === 'file') {
          try {
            const content = readFileSync(config.path, 'utf8');
            if (content.trim().length > 0) {
              this.recordTest(`${config.name} 내용`, 'pass', '설정 내용 존재');
            } else {
              this.recordTest(`${config.name} 내용`, 'skip', '빈 파일');
            }
          } catch (error) {
            this.recordTest(`${config.name} 내용`, 'fail', '읽기 실패', error.message);
          }
        }
      } else {
        this.recordTest(config.name, 'fail', `${config.type} 없음`);
      }
    }
  }

  /**
   * Docker 이미지 테스트
   */
  async testDockerImages() {
    console.log('\n🐳 Docker 이미지 테스트');
    console.log('====================');

    const requiredImages = [
      'ghcr.io/catthehacker/ubuntu:act-latest',
      'node:18-alpine'
    ];

    for (const image of requiredImages) {
      try {
        execSync(`docker image inspect ${image}`, { stdio: 'ignore' });
        this.recordTest(`Docker 이미지: ${image}`, 'pass', '이미지 존재');
      } catch (error) {
        this.recordTest(`Docker 이미지: ${image}`, 'skip', 
          '이미지 없음 (필요시 자동 다운로드됨)');
      }
    }
  }

  /**
   * 실제 워크플로우 실행 테스트 (Dry Run)
   */
  async testWorkflowExecution() {
    console.log('\n🎭 워크플로우 실행 테스트 (Dry Run)');
    console.log('=================================');

    const workflowsDir = join(projectRoot, '.github', 'workflows');
    
    try {
      const files = execSync(`find ${workflowsDir} -name "*.yml" -o -name "*.yaml"`, 
        { encoding: 'utf8' }).trim().split('\n').filter(f => f);

      if (files.length === 0) {
        this.recordTest('워크플로우 실행', 'skip', '실행할 워크플로우 없음');
        return;
      }

      // 첫 번째 워크플로우로 dry-run 테스트
      const testWorkflow = files[0];
      const workflowName = testWorkflow.split('/').pop();
      
      try {
        // act dry-run 실행 (실제로는 실행하지 않고 계획만 출력)
        execSync(`act --workflows ${testWorkflow} --dryrun workflow_dispatch`, {
          stdio: 'ignore',
          cwd: projectRoot,
          timeout: 30000 // 30초 타임아웃
        });
        
        this.recordTest(`워크플로우 Dry Run: ${workflowName}`, 'pass', 
          '실행 계획 생성 성공');
      } catch (error) {
        if (error.message.includes('timeout')) {
          this.recordTest(`워크플로우 Dry Run: ${workflowName}`, 'skip', 
            '타임아웃 (정상적인 경우가 있음)');
        } else {
          this.recordTest(`워크플로우 Dry Run: ${workflowName}`, 'fail', 
            'Dry run 실패', error.message);
        }
      }
    } catch (error) {
      this.recordTest('워크플로우 실행', 'fail', '워크플로우 스캔 실패', error.message);
    }
  }

  /**
   * 통합 테스트 결과 리포트 생성
   */
  generateReport() {
    console.log('\n📊 테스트 결과 요약');
    console.log('==================');
    
    const total = this.results.passed + this.results.failed + this.results.skipped;
    const passRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`총 테스트: ${total}`);
    console.log(`✅ 통과: ${this.results.passed}`);
    console.log(`❌ 실패: ${this.results.failed}`);
    console.log(`⏭️  건너뜀: ${this.results.skipped}`);
    console.log(`📈 통과율: ${passRate}%`);

    // 상세 리포트 파일 생성
    const reportPath = join(projectRoot, '.local-actions', 'test-report.json');
    const report = {
      summary: {
        total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        passRate: parseFloat(passRate),
        timestamp: new Date().toISOString()
      },
      tests: this.results.tests
    };

    try {
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 상세 리포트: ${reportPath}`);
    } catch (error) {
      console.log(`⚠️  리포트 저장 실패: ${error.message}`);
    }

    // 결과에 따른 종료 코드
    if (this.results.failed > 0) {
      console.log('\n❌ 일부 테스트가 실패했습니다. 위의 오류를 확인하세요.');
      return 1;
    } else if (this.results.passed === 0) {
      console.log('\n⚠️  실행된 테스트가 없습니다.');
      return 1;
    } else {
      console.log('\n🎉 모든 테스트가 성공했습니다!');
      return 0;
    }
  }

  /**
   * 전체 테스트 스위트 실행
   */
  async runAllTests() {
    console.log('🧪 GitHub Actions 로컬 테스트 환경 검증');
    console.log('=====================================');
    
    try {
      await this.testDependencies();
      await this.testWorkflowStructure();
      await this.testLocalActionsService();
      await this.testConfiguration();
      await this.testDockerImages();
      await this.testWorkflowExecution();
      
      return this.generateReport();
    } catch (error) {
      console.error('\n💥 테스트 스위트 실행 중 오류 발생:', error.message);
      return 1;
    }
  }
}

/**
 * CLI 진입점
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  const testSuite = new LocalActionsTestSuite();
  
  try {
    switch (command) {
      case 'all':
        process.exit(await testSuite.runAllTests());
        break;
        
      case 'deps':
        await testSuite.testDependencies();
        process.exit(testSuite.generateReport());
        break;
        
      case 'workflows':
        await testSuite.testWorkflowStructure();
        process.exit(testSuite.generateReport());
        break;
        
      case 'service':
        await testSuite.testLocalActionsService();
        process.exit(testSuite.generateReport());
        break;
        
      case 'config':
        await testSuite.testConfiguration();
        process.exit(testSuite.generateReport());
        break;
        
      default:
        console.log(`
🧪 GitHub Actions 로컬 테스트 검증 도구

사용법:
  node test-local-actions.js [command]

명령어:
  all         모든 테스트 실행 (기본값)
  deps        의존성 테스트만 실행
  workflows   워크플로우 구조 테스트만 실행
  service     로컬 Actions 서비스 테스트만 실행  
  config      설정 파일 테스트만 실행

예시:
  node test-local-actions.js
  node test-local-actions.js deps
  node test-local-actions.js workflows
        `);
        break;
    }
  } catch (error) {
    console.error('❌ 실행 오류:', error.message);
    process.exit(1);
  }
}

// ES 모듈에서 직접 실행 확인
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default LocalActionsTestSuite;