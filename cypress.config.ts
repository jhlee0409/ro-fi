import { defineConfig } from 'cypress';

export default defineConfig({
  // 기본 설정
  projectId: 'ro-fan-e2e',
  
  e2e: {
    // 테스트 파일 패턴
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // 기본 URL (Astro 개발 서버)
    baseUrl: 'http://localhost:4321',
    
    // 서포트 파일
    supportFile: 'cypress/support/e2e.ts',
    
    // 스크린샷 및 비디오 설정
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // 테스트 러너 설정
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // 타임아웃 설정
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    
    // 재시도 설정
    retries: {
      runMode: 2, // CI 환경에서 2번 재시도
      openMode: 0, // 개발 환경에서는 재시도 없음
    },
    
    // 실험적 기능
    experimentalStudio: true,
    experimentalMemoryManagement: true,
    
    // 테스트 격리
    testIsolation: true,
    
    // 브라우저별 설정
    chromeWebSecurity: false,
    
    // 환경 변수
    env: {
      // Astro 개발 서버 URL
      ASTRO_DEV_URL: 'http://localhost:4321',
      // 플랫폼 모드 테스트용
      PLATFORM_MODE: 'default',
      // AI 모킹 활성화
      MOCK_AI: true,
      // 테스트 데이터 디렉토리
      TEST_DATA_DIR: 'cypress/fixtures',
    },

    setupNodeEvents(on, config) {
      // 코드 커버리지 설정
      require('@cypress/code-coverage/task')(on, config);
      
      // 환경별 설정 조정
      if (config.env.NODE_ENV === 'ci') {
        config.video = true;
        config.screenshotOnRunFailure = true;
      } else {
        config.video = false;
        config.screenshotOnRunFailure = false;
      }
      
      // 플랫폼 모드별 설정
      const platformMode = config.env.PLATFORM_MODE || 'default';
      if (platformMode !== 'default') {
        config.baseUrl = `http://localhost:4321?platform=${platformMode}`;
      }
      
      // 커스텀 태스크 등록
      on('task', {
        // 로그 출력
        log(message: string) {
          // eslint-disable-next-line no-console
          console.log(message);
          return null;
        },
        
        // 테스트 데이터 생성
        generateTestContent() {
          // 테스트용 소설/챕터 데이터 생성 로직
          return {
            novel: {
              title: 'Test Novel',
              slug: 'test-novel-' + Date.now(),
              summary: 'This is a test novel for Cypress E2E testing'
            },
            chapter: {
              title: 'Test Chapter',
              chapterNumber: 1,
              content: 'This is test content for Cypress testing'
            }
          };
        },
        
        // 파일 시스템 정리
        cleanupTestFiles() {
          const fs = require('fs');
          const path = require('path');
          
          try {
            // 테스트 파일 정리
            const novelsDir = path.join(process.cwd(), 'src/content/novels');
            const chaptersDir = path.join(process.cwd(), 'src/content/chapters');
            
            // test-* 파일들 삭제
            if (fs.existsSync(novelsDir)) {
              const novelFiles = fs.readdirSync(novelsDir)
                .filter((file: string) => file.startsWith('test-') && file.endsWith('.md'));
              novelFiles.forEach((file: string) => {
                fs.unlinkSync(path.join(novelsDir, file));
              });
            }
            
            if (fs.existsSync(chaptersDir)) {
              const chapterFiles = fs.readdirSync(chaptersDir)
                .filter((file: string) => file.startsWith('test-') && file.endsWith('.md'));
              chapterFiles.forEach((file: string) => {
                fs.unlinkSync(path.join(chaptersDir, file));
              });
            }
            
            return { cleaned: true };
          } catch (error: unknown) {
            return { error: error instanceof Error ? error.message : 'Unknown error' };
          }
        }
      });
      
      return config;
    },
  },

  // 컴포넌트 테스트 설정 (Astro + React 컴포넌트용)
  component: {
    devServer: {
      framework: 'react' as const,
      bundler: 'vite',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
});