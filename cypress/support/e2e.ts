// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Import cypress-axe for accessibility testing
import 'cypress-axe';

// Import cypress-real-events for real user interactions
import 'cypress-real-events';

// Import code coverage support
import '@cypress/code-coverage/support';

// Global configuration
beforeEach(() => {
  // 접근성 테스트 설정
  cy.injectAxe();
  
  // 테스트 시작 전 로그
  cy.task('log', `Starting test: ${Cypress.currentTest.title}`);
});

afterEach(() => {
  // 각 테스트 후 접근성 검증
  cy.checkA11y(null, null, (violations) => {
    const violationData = violations.map(({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length
    }));
    cy.task('log', `Accessibility violations: ${JSON.stringify(violationData, null, 2)}`);
  });
});

// 전역 에러 핸들링
Cypress.on('uncaught:exception', (err) => {
  // AI 모킹 관련 에러는 무시
  if (err.message.includes('fetch') && err.message.includes('MockAI')) {
    return false;
  }
  
  // Astro 관련 hydration 에러는 무시 (개발 환경에서 흔함)
  if (err.message.includes('hydration') || err.message.includes('island')) {
    return false;
  }
  
  // 기타 예상되는 에러들
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  // 다른 에러는 실패로 처리
  return true;
});

// 커스텀 Cypress 명령어 타입 정의
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * 로그인 상태로 만들기
       * @example cy.login()
       */
      login(): Chainable<void>;
      
      /**
       * 특정 소설 페이지로 이동
       * @param slug 소설 슬러그
       * @example cy.visitNovel('test-novel')
       */
      visitNovel(slug: string): Chainable<void>;
      
      /**
       * 특정 챕터 페이지로 이동
       * @param novelSlug 소설 슬러그
       * @param chapterNumber 챕터 번호
       * @example cy.visitChapter('test-novel', 1)
       */
      visitChapter(novelSlug: string, chapterNumber: number): Chainable<void>;
      
      /**
       * AI 자동화 실행 모킹
       * @example cy.mockAutomation()
       */
      mockAutomation(): Chainable<void>;
      
      /**
       * 테스트 데이터 정리
       * @example cy.cleanupTestData()
       */
      cleanupTestData(): Chainable<void>;
      
      /**
       * 플랫폼 모드 설정
       * @param platform 플랫폼 모드
       * @example cy.setPlatformMode('naver')
       */
      setPlatformMode(platform: string): Chainable<void>;
      
      /**
       * 모바일 뷰포트로 변경
       * @example cy.setMobileViewport()
       */
      setMobileViewport(): Chainable<void>;
      
      /**
       * 데스크톱 뷰포트로 변경
       * @example cy.setDesktopViewport()
       */
      setDesktopViewport(): Chainable<void>;
    }
  }
}