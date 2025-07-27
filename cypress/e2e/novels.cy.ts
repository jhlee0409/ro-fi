describe('Novels Page E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/novels');
  });

  it('should load novels page successfully', () => {
    // 페이지 로드 확인
    cy.get('[data-testid="novels-page"]').should('be.visible');
    
    // 페이지 제목 확인
    cy.get('h1').should('contain.text', '소설');
    
    // 소설 목록 확인
    cy.get('[data-testid="novel-list"]').should('be.visible');
  });

  it('should display novel cards with proper information', () => {
    cy.get('[data-testid="novel-card"]').first().within(() => {
      // 소설 제목
      cy.get('[data-testid="novel-title"]').should('be.visible').and('not.be.empty');
      
      // 소설 요약
      cy.get('[data-testid="novel-summary"]').should('be.visible').and('not.be.empty');
      
      // 연재 상태
      cy.get('[data-testid="novel-status"]').should('be.visible');
      
      // 트롭 태그들
      cy.get('[data-testid="trope-tags"]').should('be.visible');
      
      // 총 챕터 수
      cy.get('[data-testid="total-chapters"]').should('be.visible');
      
      // 업데이트 날짜
      cy.get('[data-testid="last-update"]').should('be.visible');
    });
  });

  it('should navigate to individual novel page', () => {
    // 첫 번째 소설 클릭
    cy.get('[data-testid="novel-card"]').first().within(() => {
      cy.get('[data-testid="novel-title"]').invoke('text').as('novelTitle');
      cy.get('a').first().click();
    });
    
    // 소설 상세 페이지로 이동 확인
    cy.url().should('include', '/novels/');
    
    // 소설 상세 페이지 로드 확인
    cy.get('[data-testid="novel-detail"]').should('be.visible');
  });

  it('should filter novels by status', () => {
    // 필터 옵션이 있다면 테스트
    cy.get('[data-testid="status-filter"]').then(($filter) => {
      if ($filter.length > 0) {
        // 연재 중 필터
        cy.wrap($filter).select('연재 중');
        cy.get('[data-testid="novel-card"]').each(($card) => {
          cy.wrap($card).find('[data-testid="novel-status"]').should('contain', '연재 중');
        });
        
        // 완결 필터
        cy.wrap($filter).select('완결');
        cy.get('[data-testid="novel-card"]').then(($cards) => {
          if ($cards.length > 0) {
            cy.wrap($cards).each(($card) => {
              cy.wrap($card).find('[data-testid="novel-status"]').should('contain', '완결');
            });
          }
        });
      }
    });
  });

  it('should search novels', () => {
    // 검색 기능이 있다면 테스트
    cy.get('[data-testid="novel-search"]').then(($search) => {
      if ($search.length > 0) {
        cy.wrap($search).type('로맨스');
        
        // 검색 결과 확인
        cy.get('[data-testid="novel-card"]').should('have.length.at.least', 1);
        
        // 검색어 초기화
        cy.wrap($search).clear();
      }
    });
  });

  it('should sort novels by different criteria', () => {
    // 정렬 옵션이 있다면 테스트
    cy.get('[data-testid="sort-select"]').then(($sort) => {
      if ($sort.length > 0) {
        // 최신순 정렬
        cy.wrap($sort).select('최신순');
        cy.wait(1000);
        
        // 인기순 정렬
        cy.wrap($sort).select('인기순');
        cy.wait(1000);
        
        // 제목순 정렬
        cy.wrap($sort).select('제목순');
        cy.wait(1000);
      }
    });
  });

  it('should handle pagination', () => {
    // 페이지네이션이 있다면 테스트
    cy.get('[data-testid="pagination"]').then(($pagination) => {
      if ($pagination.length > 0) {
        // 다음 페이지로 이동
        cy.get('[data-testid="next-page"]').then(($nextBtn) => {
          if ($nextBtn.length > 0 && !$nextBtn.prop('disabled')) {
            cy.wrap($nextBtn).click();
            cy.url().should('include', 'page=2');
            
            // 이전 페이지로 돌아가기
            cy.get('[data-testid="prev-page"]').click();
            cy.url().should('include', 'page=1');
          }
        });
      }
    });
  });

  it('should display novel metadata correctly', () => {
    cy.get('[data-testid="novel-card"]').first().within(() => {
      // 작가명 확인
      cy.get('[data-testid="novel-author"]').should('be.visible');
      
      // 평점이 있다면 확인
      cy.get('[data-testid="novel-rating"]').then(($rating) => {
        if ($rating.length > 0) {
          cy.wrap($rating).should('be.visible');
        }
      });
      
      // 진행도 확인
      cy.get('[data-testid="novel-progress"]').then(($progress) => {
        if ($progress.length > 0) {
          cy.wrap($progress).should('be.visible');
        }
      });
    });
  });

  it('should be responsive on different screen sizes', () => {
    // 모바일 뷰
    cy.setMobileViewport();
    cy.get('[data-testid="novel-list"]').should('be.visible');
    cy.get('[data-testid="novel-card"]').should('be.visible');
    
    // 태블릿 뷰
    cy.viewport(768, 1024);
    cy.get('[data-testid="novel-list"]').should('be.visible');
    
    // 데스크톱 뷰
    cy.setDesktopViewport();
    cy.get('[data-testid="novel-list"]').should('be.visible');
  });

  it('should have proper accessibility', () => {
    // 접근성 검증
    cy.checkA11y();
    
    // 키보드 네비게이션
    cy.get('[data-testid="novel-card"]').first().focus();
    cy.focused().should('be.visible');
    
    // Tab 키로 다음 요소로 이동
    cy.focused().tab();
    cy.focused().should('be.visible');
  });

  it('should show loading states appropriately', () => {
    // 페이지 새로고침 시 로딩 상태 확인
    cy.visit('/novels');
    
    // 로딩 인디케이터가 있다면 확인
    cy.get('[data-testid="loading"]').then(($loading) => {
      if ($loading.length > 0) {
        cy.wrap($loading).should('be.visible');
      }
    });
    
    // 콘텐츠 로드 후 로딩 인디케이터 사라짐 확인
    cy.get('[data-testid="novel-list"]').should('be.visible');
  });
});