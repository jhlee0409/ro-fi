// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * 관리자 로그인 (현재는 단순 세션 설정)
 */
Cypress.Commands.add('login', () => {
  // 향후 실제 인증 시스템 구현 시 사용
  cy.window().then((win) => {
    win.localStorage.setItem('isAuthenticated', 'true');
    win.localStorage.setItem('userRole', 'admin');
  });
});

/**
 * 특정 소설 페이지 방문
 */
Cypress.Commands.add('visitNovel', (slug: string) => {
  cy.visit(`/novels/${slug}`);
  
  // 페이지 로드 확인
  cy.get('h1').should('be.visible');
  cy.get('[data-testid="novel-content"]').should('exist');
});

/**
 * 특정 챕터 페이지 방문
 */
Cypress.Commands.add('visitChapter', (novelSlug: string, chapterNumber: number) => {
  cy.visit(`/novels/${novelSlug}/chapter/${chapterNumber}`);
  
  // 챕터 로드 확인
  cy.get('[data-testid="chapter-title"]').should('be.visible');
  cy.get('[data-testid="chapter-content"]').should('exist');
});

/**
 * AI 자동화 시스템 모킹
 */
Cypress.Commands.add('mockAutomation', () => {
  // AI API 호출 모킹
  cy.intercept('POST', '**/api/generate-story', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        title: 'Test Generated Chapter',
        content: 'This is a test generated chapter content for Cypress E2E testing.',
        chapterNumber: 1,
        wordCount: 500
      }
    }
  }).as('generateStory');
  
  // 자동화 스크립트 모킹
  cy.intercept('POST', '**/api/automation/run', {
    statusCode: 200,
    body: {
      success: true,
      action: 'CONTINUE_CHAPTER',
      result: {
        novelSlug: 'test-novel',
        chapterNumber: 1,
        emotionStage: 'introduction'
      }
    }
  }).as('runAutomation');
});

/**
 * 테스트 데이터 정리
 */
Cypress.Commands.add('cleanupTestData', () => {
  cy.task('cleanupTestFiles');
});

/**
 * 플랫폼 모드 설정
 */
Cypress.Commands.add('setPlatformMode', (platform: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem('platformMode', platform);
  });
  
  // 페이지 새로고침으로 설정 적용
  cy.reload();
});

/**
 * 모바일 뷰포트 설정
 */
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667); // iPhone SE 크기
});

/**
 * 데스크톱 뷰포트 설정
 */
Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720); // 기본 데스크톱 크기
});

// 기존 명령어 확장
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  // 모든 방문에 대해 기본 대기 설정
  const extendedOptions = {
    ...options,
    failOnStatusCode: false, // 개발 서버에서 가끔 발생하는 일시적 오류 무시
    timeout: 30000 // 30초 타임아웃
  };
  
  return originalFn(url, extendedOptions).then(() => {
    // 페이지 로드 후 기본 요소들이 렌더링될 때까지 대기
    cy.get('body').should('be.visible');
    
    // Astro 아일랜드 hydration 대기
    cy.wait(1000);
  });
});

Cypress.Commands.overwrite('type', (originalFn, element, text, options) => {
  // 타이핑 시 더 자연스러운 지연 추가
  const extendedOptions = {
    delay: 50,
    ...options
  };
  
  return originalFn(element, text, extendedOptions);
});

// 네트워크 요청 인터셉트 헬퍼
export const interceptApiCalls = () => {
  // AI 관련 API 모킹
  cy.intercept('POST', '**/api/ai/**', { 
    statusCode: 200, 
    body: { success: true, message: 'Mocked AI response' } 
  }).as('aiApi');
  
  // 자동화 관련 API 모킹
  cy.intercept('GET', '**/api/automation/status', { 
    statusCode: 200, 
    body: { 
      isRunning: false, 
      lastRun: new Date().toISOString(),
      activeNovels: 3 
    } 
  }).as('automationStatus');
};

// 페이지 성능 측정 헬퍼
export const measurePagePerformance = () => {
  cy.window().then((win) => {
    cy.wrap(win.performance.timing).as('performanceTiming');
  });
};

// 콘솔 에러 체크 헬퍼
export const checkConsoleErrors = () => {
  cy.window().then((win) => {
    const errors = [];
    const originalError = win.console.error;
    
    win.console.error = (...args) => {
      errors.push(args.join(' '));
      originalError.apply(win.console, args);
    };
    
    cy.wrap(errors).as('consoleErrors');
  });
};