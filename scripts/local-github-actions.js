#!/usr/bin/env node

/**
 * GitHub Actions 로컬 테스트 환경
 * 
 * 이 서비스는 GitHub Actions 워크플로우를 로컬에서 테스트할 수 있는 환경을 제공합니다.
 * act (nektos/act) 도구를 기반으로 하며, Docker 컨테이너에서 워크플로우를 실행합니다.
 * 
 * 주요 기능:
 * - 워크플로우 유효성 검증
 * - 로컬 실행 환경 구성
 * - 시크릿 및 환경변수 모킹
 * - 실행 결과 분석 및 리포팅
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');

class LocalGitHubActionsService {
  constructor() {
    this.config = {
      actBinary: 'act',
      dockerImage: 'ghcr.io/catthehacker/ubuntu:act-latest',
      workflowsDir: join(projectRoot, '.github', 'workflows'),
      artifactsDir: join(projectRoot, '.local-actions', 'artifacts'),
      logsDir: join(projectRoot, '.local-actions', 'logs'),
      secretsFile: join(projectRoot, '.local-actions', 'secrets'),
      envFile: join(projectRoot, '.local-actions', '.env')
    };
    
    this.ensureDirectories();
  }

  /**
   * 필요한 디렉토리 생성
   */
  ensureDirectories() {
    const dirs = [
      join(projectRoot, '.local-actions'),
      this.config.artifactsDir,
      this.config.logsDir
    ];
    
    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(`📁 디렉토리 생성: ${dir}`);
      }
    });
  }

  /**
   * act 설치 여부 확인 및 설치 가이드
   */
  checkActInstallation() {
    try {
      execSync('which act', { stdio: 'ignore' });
      const version = execSync('act --version', { encoding: 'utf8' }).trim();
      console.log(`✅ act 설치됨: ${version}`);
      return true;
    } catch (error) {
      console.log('❌ act가 설치되지 않았습니다.');
      console.log('\n📦 act 설치 방법:');
      console.log('macOS: brew install act');
      console.log('Linux: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash');
      console.log('Windows: choco install act-cli');
      console.log('\n또는 GitHub에서 직접 다운로드: https://github.com/nektos/act/releases');
      return false;
    }
  }

  /**
   * Docker 설치 여부 확인
   */
  checkDockerInstallation() {
    try {
      execSync('docker --version', { stdio: 'ignore' });
      console.log('✅ Docker 설치됨');
      return true;
    } catch (error) {
      console.log('❌ Docker가 설치되지 않았거나 실행되지 않습니다.');
      console.log('Docker Desktop을 설치하고 실행해주세요: https://www.docker.com/products/docker-desktop');
      return false;
    }
  }

  /**
   * 워크플로우 파일 목록 조회
   */
  getWorkflows() {
    try {
      const workflows = [];
      const files = execSync(`find ${this.config.workflowsDir} -name "*.yml" -o -name "*.yaml"`, 
        { encoding: 'utf8' }).trim().split('\n').filter(f => f);
      
      files.forEach(file => {
        try {
          const content = readFileSync(file, 'utf8');
          const parsed = yaml.parse(content);
          workflows.push({
            file: file.replace(projectRoot + '/', ''),
            name: parsed.name || 'Unnamed Workflow',
            triggers: Object.keys(parsed.on || {}),
            jobs: Object.keys(parsed.jobs || {}),
            path: file
          });
        } catch (parseError) {
          console.warn(`⚠️ YAML 파싱 실패: ${file} - ${parseError.message}`);
        }
      });
      
      return workflows;
    } catch (error) {
      console.error('워크플로우 파일 조회 실패:', error.message);
      return [];
    }
  }

  /**
   * 시크릿 파일 생성/업데이트
   */
  setupSecrets() {
    const secrets = {
      ANTHROPIC_API_KEY: 'sk-ant-test-key-for-local-testing',
      GEMINI_API_KEY: 'test-gemini-key-for-local-testing',
      VERCEL_TOKEN: 'test-vercel-token',
      VERCEL_ORG_ID: 'test-org-id',
      VERCEL_PROJECT_ID: 'test-project-id',
      GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'ghp_test-token-for-local-testing'
    };

    const secretsContent = Object.entries(secrets)
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');

    writeFileSync(this.config.secretsFile, secretsContent);
    console.log(`🔐 시크릿 파일 생성: ${this.config.secretsFile}`);
    console.log('⚠️  실제 API 키가 필요한 경우 이 파일을 수정하세요.');
    
    // GitHub Token 안내
    if (!process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN.includes('test-token')) {
      console.log('\n💡 GitHub Actions 인증 개선을 위해:');
      console.log('   1. https://github.com/settings/tokens 에서 Personal Access Token 생성');
      console.log('   2. 환경변수 설정: export GITHUB_TOKEN=your_token');
      console.log('   3. 또는 .local-actions/secrets 파일에서 GITHUB_TOKEN 직접 수정');
    }
  }

  /**
   * 환경변수 파일 생성
   */
  setupEnvironment() {
    const envVars = {
      NODE_ENV: 'test',
      CI: 'true',
      RUNNER_OS: 'Linux',
      RUNNER_ARCH: 'X64'
    };

    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    writeFileSync(this.config.envFile, envContent);
    console.log(`🌍 환경변수 파일 생성: ${this.config.envFile}`);
  }

  /**
   * GitHub Token 검증 및 경고
   */
  validateGitHubToken() {
    const envToken = process.env.GITHUB_TOKEN;
    const fileToken = this.getTokenFromFile();
    
    let hasValidToken = false;
    let tokenSource = '';
    
    if (envToken && !envToken.includes('test-token')) {
      hasValidToken = true;
      tokenSource = 'environment variable';
    } else if (fileToken && !fileToken.includes('test-token')) {
      hasValidToken = true;
      tokenSource = 'secrets file';
    }
    
    if (!hasValidToken) {
      console.log('\n🚨 GitHub Token 경고:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ 유효한 GitHub Token이 설정되지 않았습니다!');
      console.log('');
      console.log('act는 모든 공식 GitHub Actions (actions/checkout, actions/setup-node 등)를');
      console.log('클론하기 위해 GitHub Token이 필요합니다.');
      console.log('');
      console.log('💡 해결 방법:');
      console.log('  1. 자동 수정: pnpm actions:fix-auth');
      console.log('  2. 수동 설정: export GITHUB_TOKEN=your_token_here');
      console.log('  3. 토큰 생성: https://github.com/settings/tokens');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      
      return false;
    } else {
      console.log(`✅ GitHub Token 확인됨 (${tokenSource})`);
      return true;
    }
  }
  
  /**
   * 시크릿 파일에서 토큰 추출
   */
  getTokenFromFile() {
    try {
      if (existsSync(this.config.secretsFile)) {
        const content = readFileSync(this.config.secretsFile, 'utf8');
        const match = content.match(/GITHUB_TOKEN="?([^"\n]+)"?/);
        return match ? match[1] : null;
      }
    } catch (error) {
      // 파일 읽기 실패시 null 반환
    }
    return null;
  }

  /**
   * 특정 워크플로우 실행
   */
  async runWorkflow(workflowFile, options = {}) {
    const {
      event = 'workflow_dispatch',
      job = null,
      dryRun = false,
      verbose = false
    } = options;

    console.log(`\n🚀 워크플로우 실행: ${workflowFile}`);
    console.log(`📅 이벤트: ${event}`);
    if (job) console.log(`🎯 Job: ${job}`);

    // GitHub Token 검증
    const hasValidToken = this.validateGitHubToken();
    
    if (!hasValidToken && !dryRun) {
      console.log('\n❌ GitHub Token이 없어 실행을 중단합니다.');
      console.log('해결 후 다시 실행하거나 --dry-run 옵션을 사용하세요.');
      throw new Error('GitHub Token required for GitHub Actions execution');
    }

    const actArgs = [
      '--workflows', this.config.workflowsDir,
      '--secret-file', this.config.secretsFile,
      '--env-file', this.config.envFile,
      '--artifact-server-path', this.config.artifactsDir,
      '--container-architecture', 'linux/amd64',
      '--pull=false'  // Don't force pull images to avoid network issues
    ];

    if (job) actArgs.push('--job', job);
    if (dryRun) actArgs.push('--dryrun');
    if (verbose) actArgs.push('--verbose');

    actArgs.push(event);
    if (workflowFile) actArgs.push('--workflows', workflowFile);

    const logFile = join(this.config.logsDir, 
      `${Date.now()}-${workflowFile.replace(/[^a-zA-Z0-9]/g, '_')}.log`);

    return new Promise((resolve, reject) => {
      console.log(`\n📝 실행 로그: ${logFile}`);
      console.log(`🔧 실행 명령: act ${actArgs.join(' ')}\n`);

      const process = spawn('act', actArgs, {
        cwd: projectRoot,
        stdio: ['inherit', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(output);
      });

      process.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        if (verbose) console.error(output);
      });

      process.on('close', (code) => {
        const logContent = {
          timestamp: new Date().toISOString(),
          workflow: workflowFile,
          event,
          job,
          exitCode: code,
          stdout,
          stderr,
          success: code === 0
        };

        writeFileSync(logFile, JSON.stringify(logContent, null, 2));

        if (code === 0) {
          console.log('\n✅ 워크플로우 실행 성공!');
          resolve(logContent);
        } else {
          console.log(`\n❌ 워크플로우 실행 실패 (종료 코드: ${code})`);
          reject(new Error(`Workflow failed with exit code: ${code}`));
        }
      });

      process.on('error', (error) => {
        console.error('실행 오류:', error.message);
        reject(error);
      });
    });
  }

  /**
   * 워크플로우 검증
   */
  validateWorkflow(workflowFile) {
    console.log(`\n🔍 워크플로우 검증: ${workflowFile}`);
    
    try {
      const content = readFileSync(workflowFile, 'utf8');
      const parsed = yaml.parse(content);
      
      const validationResults = {
        syntaxValid: true,
        structureValid: true,
        issues: [],
        warnings: []
      };

      // 기본 구조 검증
      if (!parsed.name) validationResults.warnings.push('워크플로우 이름이 정의되지 않음');
      if (!parsed.on) validationResults.issues.push('트리거 이벤트가 정의되지 않음');
      if (!parsed.jobs) validationResults.issues.push('Job이 정의되지 않음');

      // Job 구조 검증
      Object.entries(parsed.jobs || {}).forEach(([jobName, job]) => {
        if (!job['runs-on']) {
          validationResults.issues.push(`Job '${jobName}': runs-on이 정의되지 않음`);
        }
        if (!job.steps || !Array.isArray(job.steps)) {
          validationResults.issues.push(`Job '${jobName}': steps가 정의되지 않음`);
        }
      });

      validationResults.structureValid = validationResults.issues.length === 0;

      // 결과 출력
      if (validationResults.structureValid) {
        console.log('✅ 워크플로우 구조 유효');
      } else {
        console.log('❌ 워크플로우 구조 문제 발견:');
        validationResults.issues.forEach(issue => console.log(`  - ${issue}`));
      }

      if (validationResults.warnings.length > 0) {
        console.log('⚠️  경고사항:');
        validationResults.warnings.forEach(warning => console.log(`  - ${warning}`));
      }

      return validationResults;
    } catch (error) {
      console.log(`❌ YAML 구문 오류: ${error.message}`);
      return {
        syntaxValid: false,
        structureValid: false,
        issues: [`YAML 구문 오류: ${error.message}`],
        warnings: []
      };
    }
  }

  /**
   * 워크플로우 목록 출력
   */
  listWorkflows() {
    const workflows = this.getWorkflows();
    
    console.log('\n📋 사용 가능한 워크플로우:');
    console.log('================================');
    
    workflows.forEach((workflow, index) => {
      console.log(`${index + 1}. ${workflow.name}`);
      console.log(`   파일: ${workflow.file}`);
      console.log(`   트리거: ${workflow.triggers.join(', ')}`);
      console.log(`   Job: ${workflow.jobs.join(', ')}`);
      console.log('');
    });

    return workflows;
  }

  /**
   * 설정 정보 출력
   */
  showConfig() {
    console.log('\n⚙️  로컬 GitHub Actions 설정:');
    console.log('=====================================');
    console.log(`Docker 이미지: ${this.config.dockerImage}`);
    console.log(`워크플로우 디렉토리: ${this.config.workflowsDir}`);
    console.log(`아티팩트 디렉토리: ${this.config.artifactsDir}`);
    console.log(`로그 디렉토리: ${this.config.logsDir}`);
    console.log(`시크릿 파일: ${this.config.secretsFile}`);
    console.log(`환경변수 파일: ${this.config.envFile}`);
  }

  /**
   * 초기 설정
   */
  async initialize() {
    console.log('🔧 GitHub Actions 로컬 테스트 환경 초기화...\n');

    // 의존성 확인
    const actInstalled = this.checkActInstallation();
    const dockerInstalled = this.checkDockerInstallation();

    if (!actInstalled || !dockerInstalled) {
      console.log('\n❌ 필수 의존성이 설치되지 않았습니다.');
      process.exit(1);
    }

    // 설정 파일 생성
    this.setupSecrets();
    this.setupEnvironment();

    console.log('\n✅ 초기화 완료!');
    this.showConfig();
    this.listWorkflows();
  }
}

// CLI 인터페이스
async function main() {
  const service = new LocalGitHubActionsService();
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'init':
        await service.initialize();
        break;

      case 'list':
        service.listWorkflows();
        break;

      case 'validate':
        const workflowToValidate = args[1];
        if (!workflowToValidate) {
          console.log('사용법: node local-github-actions.js validate <workflow-file>');
          process.exit(1);
        }
        service.validateWorkflow(workflowToValidate);
        break;

      case 'run':
        const workflowToRun = args[1];
        const event = args[2] || 'workflow_dispatch';
        
        if (!workflowToRun) {
          console.log('사용법: node local-github-actions.js run <workflow-file> [event]');
          process.exit(1);
        }

        const options = {
          event,
          dryRun: args.includes('--dry-run'),
          verbose: args.includes('--verbose'),
          job: args.includes('--job') ? args[args.indexOf('--job') + 1] : null
        };

        await service.runWorkflow(workflowToRun, options);
        break;

      case 'config':
        service.showConfig();
        break;

      default:
        console.log(`
🎯 GitHub Actions 로컬 테스트 환경

사용법:
  node local-github-actions.js <command> [options]

명령어:
  init                     초기 설정 및 환경 구성
  list                     사용 가능한 워크플로우 목록
  validate <workflow>      워크플로우 유효성 검증  
  run <workflow> [event]   워크플로우 로컬 실행
  config                   현재 설정 정보 출력

실행 옵션:
  --dry-run               실제 실행하지 않고 계획만 출력
  --verbose               상세 로그 출력
  --job <job-name>        특정 Job만 실행

예시:
  node local-github-actions.js init
  node local-github-actions.js list
  node local-github-actions.js validate .github/workflows/auto-publish.yml
  node local-github-actions.js run .github/workflows/auto-publish.yml workflow_dispatch
  node local-github-actions.js run .github/workflows/auto-publish.yml push --job automation
  node local-github-actions.js run .github/workflows/auto-publish.yml push --dry-run --verbose
        `);
        break;
    }
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    if (process.argv.includes('--verbose')) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// ES 모듈에서 직접 실행 확인
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default LocalGitHubActionsService;