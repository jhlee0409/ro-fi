describe('Novel Detail Page E2E Tests', () => {
  let novelSlug: string;

  before(() => {
    // 테스트용 소설 슬러그 가져오기
    cy.visit('/novels');
    cy.get('[data-testid="novel-card"]').first().within(() => {
      cy.get('a').first().invoke('attr', 'href').then((href) => {
        novelSlug = href.split('/novels/')[1];
      });
    });
  });

  beforeEach(() => {
    // 소설 상세 페이지 방문
    cy.visit(`/novels/${novelSlug || 'test-novel'}`);
  });

  it('should load novel detail page successfully', () => {
    // 페이지 로드 확인
    cy.get('[data-testid="novel-detail"]').should('be.visible');
    
    // 소설 제목 확인
    cy.get('[data-testid="novel-title"]').should('be.visible').and('not.be.empty');
    
    // 소설 정보 섹션 확인
    cy.get('[data-testid="novel-info"]').should('be.visible');
  });

  it('should display complete novel information', () => {
    // 소설 메타데이터 확인
    cy.get('[data-testid="novel-author"]').should('be.visible').and('not.be.empty');
    cy.get('[data-testid="novel-summary"]').should('be.visible').and('not.be.empty');
    cy.get('[data-testid="novel-status"]').should('be.visible');
    
    // 트롭 태그들 확인
    cy.get('[data-testid="trope-tags"]').should('be.visible');
    cy.get('[data-testid="trope-tag"]').should('have.length.at.least', 1);
    
    // 총 챕터 수 확인
    cy.get('[data-testid="total-chapters"]').should('be.visible');
    
    // 발행일 확인
    cy.get('[data-testid="published-date"]').should('be.visible');
  });

  it('should display chapter list', () => {
    // 챕터 목록 섹션 확인
    cy.get('[data-testid="chapter-list"]').should('be.visible');
    
    // 챕터 아이템들 확인
    cy.get('[data-testid="chapter-item"]').should('have.length.at.least', 1);
    
    cy.get('[data-testid="chapter-item"]').first().within(() => {
      // 챕터 제목
      cy.get('[data-testid="chapter-title"]').should('be.visible').and('not.be.empty');
      
      // 챕터 번호
      cy.get('[data-testid="chapter-number"]').should('be.visible');
      
      // 발행일
      cy.get('[data-testid="chapter-date"]').should('be.visible');
      
      // 챕터 링크
      cy.get('a').should('have.attr', 'href');
    });
  });

  it('should navigate to chapter page', () => {
    // 첫 번째 챕터 클릭
    cy.get('[data-testid="chapter-item"]').first().within(() => {
      cy.get('a').click();
    });
    
    // 챕터 페이지로 이동 확인
    cy.url().should('include', '/chapter/');
    
    // 챕터 페이지 로드 확인
    cy.get('[data-testid="chapter-content"]').should('be.visible');
  });

  it('should show reading progress', () => {
    // 독서 진행도가 있다면 확인
    cy.get('[data-testid="reading-progress"]').then(($progress) => {
      if ($progress.length > 0) {
        cy.wrap($progress).should('be.visible');
        
        // 진행률 바 확인
        cy.get('[data-testid="progress-bar"]').should('be.visible');
        
        // 진행률 텍스트 확인
        cy.get('[data-testid="progress-text"]').should('be.visible');
      }
    });
  });

  it('should handle bookmarking functionality', () => {
    // 북마크 버튼이 있다면 테스트
    cy.get('[data-testid="bookmark-button"]').then(($bookmark) => {
      if ($bookmark.length > 0) {
        // 북마크 추가
        cy.wrap($bookmark).click();
        
        // 북마크 상태 변경 확인
        cy.wrap($bookmark).should('have.attr', 'aria-pressed', 'true');
        
        // 북마크 제거
        cy.wrap($bookmark).click();
        cy.wrap($bookmark).should('have.attr', 'aria-pressed', 'false');
      }
    });
  });

  it('should show rating and review section', () => {
    // 평점 섹션이 있다면 확인
    cy.get('[data-testid="rating-section"]').then(($rating) => {
      if ($rating.length > 0) {
        cy.wrap($rating).should('be.visible');
        
        // 평점 표시
        cy.get('[data-testid="average-rating"]').should('be.visible');
        
        // 별점 컴포넌트
        cy.get('[data-testid="star-rating"]').should('be.visible');
      }
    });
    
    // 리뷰 섹션이 있다면 확인
    cy.get('[data-testid="reviews-section"]').then(($reviews) => {
      if ($reviews.length > 0) {
        cy.wrap($reviews).should('be.visible');
      }
    });
  });

  it('should handle sharing functionality', () => {
    // 공유 버튼이 있다면 테스트
    cy.get('[data-testid="share-button"]').then(($share) => {
      if ($share.length > 0) {
        cy.wrap($share).click();
        
        // 공유 모달/드롭다운 확인
        cy.get('[data-testid="share-modal"]', '[data-testid="share-dropdown"]').should('be.visible');
        
        // ESC 키로 닫기
        cy.get('body').type('{esc}');
      }
    });
  });

  it('should display related novels', () => {
    // 관련 소설 섹션이 있다면 확인
    cy.get('[data-testid="related-novels"]').then(($related) => {
      if ($related.length > 0) {
        cy.wrap($related).should('be.visible');
        
        // 관련 소설 카드들 확인
        cy.get('[data-testid="related-novel-card"]').should('have.length.at.least', 1);
      }
    });
  });

  it('should be responsive on different screen sizes', () => {
    // 모바일 뷰
    cy.setMobileViewport();
    cy.get('[data-testid="novel-detail"]').should('be.visible');
    cy.get('[data-testid="chapter-list"]').should('be.visible');
    
    // 태블릿 뷰
    cy.viewport(768, 1024);
    cy.get('[data-testid="novel-detail"]').should('be.visible');
    
    // 데스크톱 뷰
    cy.setDesktopViewport();
    cy.get('[data-testid="novel-detail"]').should('be.visible');
  });

  it('should have proper SEO elements', () => {
    // 페이지 제목 확인
    cy.title().should('not.be.empty');
    
    // 메타 디스크립션 확인
    cy.get('meta[name="description"]').should('have.attr', 'content');
    
    // Open Graph 태그들 확인
    cy.get('meta[property="og:title"]').should('have.attr', 'content');
    cy.get('meta[property="og:description"]').should('have.attr', 'content');
    cy.get('meta[property="og:type"]').should('have.attr', 'content', 'article');
  });

  it('should have proper accessibility', () => {
    // 접근성 검증
    cy.checkA11y();
    
    // 헤딩 구조 확인
    cy.get('h1').should('have.length', 1);
    cy.get('h2, h3, h4, h5, h6').should('exist');
    
    // 키보드 네비게이션
    cy.get('[data-testid="chapter-item"]').first().focus();
    cy.focused().should('be.visible');
  });

  it('should handle 404 for non-existent novel', () => {
    // 존재하지 않는 소설 슬러그로 접근
    cy.visit('/novels/non-existent-novel', { failOnStatusCode: false });
    
    // 404 페이지 또는 적절한 에러 메시지 확인
    cy.get('body').should('contain.text', '404').or('contain.text', '찾을 수 없습니다');
  });

  it('should show loading states appropriately', () => {
    // 페이지 새로고침
    cy.reload();
    
    // 로딩 상태 확인 (있다면)
    cy.get('[data-testid="loading"]').then(($loading) => {
      if ($loading.length > 0) {
        cy.wrap($loading).should('be.visible');
      }
    });
    
    // 콘텐츠 로드 완료 확인
    cy.get('[data-testid="novel-detail"]').should('be.visible');
  });
});