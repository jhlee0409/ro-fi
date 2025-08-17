// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your component test files.
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

// React 컴포넌트 테스트를 위한 설정
import { mount } from 'cypress/react';

// React 18 지원을 위한 설정
Cypress.Commands.add('mount', mount);

// 전역 스타일 적용 (Tailwind CSS)
import '../../src/styles/globals.css';

// 컴포넌트 테스트 전용 헬퍼 함수들
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * React 컴포넌트 마운트
       */
      mount: typeof mount;
      
      /**
       * Radix UI 컴포넌트 테스트 헬퍼
       * @param component 컴포넌트 셀렉터
       * @example cy.testRadixComponent('[data-testid="button"]')
       */
      testRadixComponent(component: string): Chainable<void>;
      
      /**
       * 다크 모드 토글 테스트
       * @example cy.testDarkMode()
       */
      testDarkMode(): Chainable<void>;
      
      /**
       * 반응형 디자인 테스트
       * @param breakpoints 테스트할 브레이크포인트들
       * @example cy.testResponsive(['mobile', 'tablet', 'desktop'])
       */
      testResponsive(breakpoints: string[]): Chainable<void>;
    }
  }
}

/**
 * Radix UI 컴포넌트 공통 테스트
 */
Cypress.Commands.add('testRadixComponent', (component: string) => {
  cy.get(component).should('be.visible');
  cy.get(component).should('not.have.attr', 'aria-disabled', 'true');
  
  // 접근성 검증
  cy.checkA11y(component);
});

/**
 * 다크 모드 토글 테스트
 */
Cypress.Commands.add('testDarkMode', () => {
  // 라이트 모드 확인
  cy.get('html').should('not.have.class', 'dark');
  
  // 다크 모드 토글 (테마 토글 버튼이 있다면)
  cy.get('[data-testid="theme-toggle"]').then(($button) => {
    if ($button.length > 0) {
      cy.wrap($button).click();
      cy.get('html').should('have.class', 'dark');
      
      // 다시 라이트 모드로
      cy.wrap($button).click();
      cy.get('html').should('not.have.class', 'dark');
    }
  });
});

/**
 * 반응형 디자인 테스트
 */
Cypress.Commands.add('testResponsive', (breakpoints: string[]) => {
  const viewports = {
    mobile: [375, 667],
    tablet: [768, 1024],
    desktop: [1280, 720],
    wide: [1920, 1080]
  };
  
  breakpoints.forEach((breakpoint) => {
    if (viewports[breakpoint as keyof typeof viewports]) {
      const [width, height] = viewports[breakpoint as keyof typeof viewports];
      cy.viewport(width, height);
      
      // 각 뷰포트에서 기본 레이아웃 확인
      cy.get('body').should('be.visible');
      cy.wait(500); // 리사이즈 애니메이션 완료 대기
      
      // 스크린샷 (필요시)
      if (Cypress.env('takeResponsiveScreenshots')) {
        cy.screenshot(`responsive-${breakpoint}-${width}x${height}`);
      }
    }
  });
});

// 컴포넌트 테스트 전용 설정
beforeEach(() => {
  // 각 컴포넌트 테스트마다 초기화
  cy.injectAxe();
});

afterEach(() => {
  // 컴포넌트 언마운트 후 정리
  cy.get('[data-cy-root]').should('not.exist');
});