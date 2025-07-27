describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    // 홈페이지 방문
    cy.visit('/');
  });

  it('should load homepage successfully', () => {
    // 페이지 제목 확인
    cy.title().should('contain', 'ro-fan');
    
    // 주요 섹션들이 존재하는지 확인
    cy.get('[data-testid="hero-section"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="latest-updates"]').should('be.visible');
    cy.get('[data-testid="novel-grid"]').should('be.visible');
  });

  it('should display navigation menu', () => {
    // 네비게이션 메뉴 확인
    cy.get('nav').should('be.visible');
    
    // 메인 링크들 확인
    cy.get('a[href="/"]').should('contain.text', '홈');
    cy.get('a[href="/novels"]').should('contain.text', '소설 목록');
  });

  it('should show latest novels', () => {
    // 최신 소설 목록 확인
    cy.get('[data-testid="latest-updates"]').within(() => {
      cy.get('[data-testid="novel-card"]').should('have.length.at.least', 1);
      
      // 첫 번째 소설 카드 확인
      cy.get('[data-testid="novel-card"]').first().within(() => {
        cy.get('[data-testid="novel-title"]').should('be.visible');
        cy.get('[data-testid="novel-summary"]').should('be.visible');
        cy.get('[data-testid="novel-status"]').should('be.visible');
      });
    });
  });

  it('should navigate to novels page', () => {
    // 소설 목록 페이지로 이동
    cy.get('a[href="/novels"]').click();
    
    // URL 확인
    cy.url().should('include', '/novels');
    
    // 페이지 로드 확인
    cy.get('[data-testid="novels-page"]').should('be.visible');
  });

  it('should be responsive', () => {
    // 모바일 뷰 테스트
    cy.setMobileViewport();
    cy.get('[data-testid="hero-section"]').should('be.visible');
    
    // 태블릿 뷰 테스트
    cy.viewport(768, 1024);
    cy.get('[data-testid="hero-section"]').should('be.visible');
    
    // 데스크톱 뷰 테스트
    cy.setDesktopViewport();
    cy.get('[data-testid="hero-section"]').should('be.visible');
  });

  it('should have proper accessibility', () => {
    // 접근성 검증
    cy.checkA11y();
    
    // 키보드 네비게이션 테스트
    cy.get('body').tab();
    cy.focused().should('be.visible');
  });

  it('should handle search functionality', () => {
    // 검색 기능이 있다면 테스트
    cy.get('[data-testid="search-input"]').then(($search) => {
      if ($search.length > 0) {
        cy.wrap($search).type('로맨스');
        cy.get('[data-testid="search-button"]').click();
        
        // 검색 결과 확인
        cy.get('[data-testid="search-results"]').should('be.visible');
      }
    });
  });

  it('should load without console errors', () => {
    // 콘솔 에러 체크
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
    
    cy.reload();
    cy.get('@consoleError').should('not.have.been.called');
  });

  it('should display automation info section', () => {
    // 자동화 정보 섹션 확인
    cy.get('[data-testid="automation-info"]').then(($section) => {
      if ($section.length > 0) {
        cy.wrap($section).should('be.visible');
        cy.wrap($section).within(() => {
          cy.contains('AI 자동화').should('be.visible');
        });
      }
    });
  });

  it('should show trend section', () => {
    // 트렌드 섹션 확인
    cy.get('[data-testid="trend-section"]').then(($section) => {
      if ($section.length > 0) {
        cy.wrap($section).should('be.visible');
        cy.wrap($section).within(() => {
          cy.get('[data-testid="trope-tag"]').should('have.length.at.least', 1);
        });
      }
    });
  });
});