#!/usr/bin/env node

/**
 * act 인증 문제 해결 도구
 * 
 * GitHub Actions 로컬 실행 시 발생하는 인증 문제를 해결합니다.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');

class ActAuthFixer {
  constructor() {
    this.secretsFile = join(projectRoot, '.local-actions', 'secrets');
  }

  /**
   * GitHub Token 유효성 검사
   */
  validateGitHubToken(token) {
    if (!token || token.includes('test-token')) {
      return false;
    }
    
    // 기본적인 GitHub Token 형식 검사
    const tokenPatterns = [
      /^ghp_[a-zA-Z0-9]{36}$/, // Personal Access Token
      /^gho_[a-zA-Z0-9]{36}$/, // OAuth Token
      /^ghu_[a-zA-Z0-9]{36}$/, // User Token
    ];
    
    return tokenPatterns.some(pattern => pattern.test(token));
  }

  /**
   * GitHub Token 설정 상태 확인
   */
  checkTokenStatus() {
    console.log('🔍 GitHub Token 상태 확인...\n');

    // 환경변수 확인
    const envToken = process.env.GITHUB_TOKEN;
    console.log(`환경변수 GITHUB_TOKEN: ${envToken ? '설정됨' : '없음'}`);
    
    if (envToken) {
      const isValid = this.validateGitHubToken(envToken);
      console.log(`토큰 유효성: ${isValid ? '✅ 유효' : '❌ 무효 (테스트 토큰)'}`);
    }

    // 시크릿 파일 확인
    if (existsSync(this.secretsFile)) {
      try {
        const content = readFileSync(this.secretsFile, 'utf8');
        const tokenMatch = content.match(/GITHUB_TOKEN="?([^"\n]+)"?/);
        
        if (tokenMatch) {
          const fileToken = tokenMatch[1];
          const isValid = this.validateGitHubToken(fileToken);
          console.log(`시크릿 파일 토큰: ${isValid ? '✅ 유효' : '❌ 무효 (테스트 토큰)'}`);
        } else {
          console.log('시크릿 파일 토큰: ❌ 없음');
        }
      } catch (error) {
        console.log(`시크릿 파일 읽기 실패: ${error.message}`);
      }
    } else {
      console.log('시크릿 파일: ❌ 없음');
    }

    console.log('');
  }

  /**
   * GitHub Token 생성 가이드
   */
  showTokenGuide() {
    console.log('📚 GitHub Personal Access Token 생성 가이드');
    console.log('==========================================\n');
    
    console.log('1️⃣ GitHub 설정 페이지 방문:');
    console.log('   https://github.com/settings/tokens\n');
    
    console.log('2️⃣ "Generate new token" → "Generate new token (classic)" 클릭\n');
    
    console.log('3️⃣ 토큰 설정:');
    console.log('   - Note: "act local testing"');
    console.log('   - Expiration: 90 days (권장)');
    console.log('   - Select scopes:');
    console.log('     ✅ repo (전체 저장소 접근)');
    console.log('     ✅ workflow (워크플로우 접근)');
    console.log('     ✅ read:packages (패키지 읽기)');
    console.log('     ✅ write:packages (패키지 쓰기, 필요시)\n');
    
    console.log('4️⃣ "Generate token" 클릭 후 토큰 복사\n');
    
    console.log('5️⃣ 토큰 설정 (다음 중 하나 선택):');
    console.log('   방법 A) 환경변수: export GITHUB_TOKEN=your_token_here');
    console.log('   방법 B) 시크릿 파일: .local-actions/secrets 파일 수정');
    console.log('   방법 C) 이 도구 사용: node scripts/fix-act-auth.js set-token\n');
    
    console.log('⚠️  중요: 토큰을 안전하게 보관하고 공유하지 마세요!');
  }

  /**
   * 대화형 토큰 설정
   */
  async setTokenInteractive() {
    console.log('🔧 GitHub Token 설정\n');
    
    // Node.js에서 표준 입력 받기
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('GitHub Personal Access Token을 입력하세요: ', (token) => {
        rl.close();
        
        if (!token.trim()) {
          console.log('❌ 토큰이 입력되지 않았습니다.');
          resolve(false);
          return;
        }

        const isValid = this.validateGitHubToken(token.trim());
        if (!isValid) {
          console.log('⚠️  입력된 토큰이 올바른 형식이 아닐 수 있습니다.');
          console.log('    그래도 계속 설정하려면 Y를 입력하세요.');
        }

        this.updateSecretsFile(token.trim());
        console.log('✅ 토큰이 설정되었습니다.');
        resolve(true);
      });
    });
  }

  /**
   * 시크릿 파일 업데이트
   */
  updateSecretsFile(newToken) {
    let content = '';
    
    if (existsSync(this.secretsFile)) {
      content = readFileSync(this.secretsFile, 'utf8');
      
      // GITHUB_TOKEN 라인을 찾아서 교체
      if (content.includes('GITHUB_TOKEN=')) {
        content = content.replace(/GITHUB_TOKEN="?[^"\n]+"?/, `GITHUB_TOKEN="${newToken}"`);
      } else {
        content += `\nGITHUB_TOKEN="${newToken}"\n`;
      }
    } else {
      // 파일이 없으면 기본 시크릿들과 함께 생성
      content = `ANTHROPIC_API_KEY="sk-ant-test-key-for-local-testing"
GEMINI_API_KEY="test-gemini-key-for-local-testing"
VERCEL_TOKEN="test-vercel-token"
VERCEL_ORG_ID="test-org-id"
VERCEL_PROJECT_ID="test-project-id"
GITHUB_TOKEN="${newToken}"
`;
    }

    writeFileSync(this.secretsFile, content);
  }

  /**
   * act 실행 테스트
   */
  async testActExecution() {
    console.log('🧪 act 실행 테스트...\n');
    
    try {
      // 로컬 테스트용 워크플로우로 dry-run 실행
      const testWorkflow = '.github/workflows/auto-publish-local.yml';
      
      if (!existsSync(join(projectRoot, testWorkflow))) {
        console.log(`❌ 테스트 워크플로우 파일이 없습니다: ${testWorkflow}`);
        console.log('   node scripts/local-github-actions.js init 를 먼저 실행하세요.');
        return false;
      }

      console.log(`🔄 테스트 실행: ${testWorkflow}`);
      const result = execSync(
        `act --workflows ${testWorkflow} --dryrun workflow_dispatch --secret-file ${this.secretsFile}`,
        { 
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 30000
        }
      );

      console.log('✅ act 실행 테스트 성공!');
      console.log('인증 문제가 해결되었습니다.');
      return true;
      
    } catch (error) {
      console.log('❌ act 실행 테스트 실패:');
      console.log(error.message);
      
      if (error.message.includes('authentication required')) {
        console.log('\n💡 추가 해결 방법:');
        console.log('1. 토큰 권한 확인 (repo, workflow 권한 필요)');
        console.log('2. 토큰 만료 확인');
        console.log('3. GitHub 2FA 설정 확인');
      }
      
      return false;
    }
  }

  /**
   * 종합 진단 및 수정
   */
  async diagnoseAndFix() {
    console.log('🔧 act 인증 문제 진단 및 수정 도구');
    console.log('==================================\n');

    // 1. 현재 상태 확인
    this.checkTokenStatus();

    // 2. 토큰이 없거나 무효한 경우 안내
    const envToken = process.env.GITHUB_TOKEN;
    const hasValidToken = envToken && this.validateGitHubToken(envToken);

    if (!hasValidToken) {
      console.log('❌ 유효한 GitHub Token이 설정되지 않았습니다.\n');
      
      console.log('🚨 중요: act는 모든 공식 GitHub Actions 사용을 위해 인증이 필요합니다!');
      console.log('   - actions/checkout@v4');
      console.log('   - actions/setup-node@v4');
      console.log('   - actions/cache@v4');
      console.log('   - 기타 모든 actions/* 액션들\n');
      
      this.showTokenGuide();
      console.log('\n📋 추가 해결책:');
      console.log('  A) 완전 독립형 워크플로우 사용:');
      console.log('     pnpm actions:run .github/workflows/auto-publish-standalone.yml');
      console.log('  B) 대화형 토큰 설정:');
      console.log('     node scripts/fix-act-auth.js set-token');
      console.log('  C) 환경변수 설정:');
      console.log('     export GITHUB_TOKEN=your_token_here\n');
      
      // 간단한 확인을 위해 환경변수 확인
      if (process.argv.includes('--auto') || process.argv.includes('set-token')) {
        await this.setTokenInteractive();
      }
    }

    // 3. 테스트 실행
    if (process.argv.includes('--test')) {
      await this.testActExecution();
    }
  }
}

/**
 * CLI 진입점
 */
async function main() {
  const fixer = new ActAuthFixer();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'check':
        fixer.checkTokenStatus();
        break;

      case 'guide':
        fixer.showTokenGuide();
        break;

      case 'set-token':
        await fixer.setTokenInteractive();
        break;

      case 'test':
        await fixer.testActExecution();
        break;

      case 'fix':
        await fixer.diagnoseAndFix();
        break;

      default:
        console.log(`
🔧 act 인증 문제 해결 도구

사용법:
  node fix-act-auth.js <command>

명령어:
  check        현재 토큰 설정 상태 확인
  guide        GitHub Token 생성 가이드 출력
  set-token    대화형 토큰 설정
  test         토큰으로 act 실행 테스트
  fix          종합 진단 및 수정

예시:
  node scripts/fix-act-auth.js check
  node scripts/fix-act-auth.js guide
  node scripts/fix-act-auth.js set-token
  node scripts/fix-act-auth.js test
        `);
        break;
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// ES 모듈에서 직접 실행 확인
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ActAuthFixer;