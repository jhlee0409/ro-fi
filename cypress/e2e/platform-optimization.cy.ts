describe('Platform Optimization E2E Tests', () => {
  beforeEach(() => {
    // 플랫폼 최적화 API 모킹
    cy.intercept('GET', '**/api/platform/config', {
      statusCode: 200,
      body: {
        currentPlatform: 'default',
        availablePlatforms: ['default', 'naver', 'munpia', 'ridibooks'],
        platformSettings: {
          default: { name: '기본 모드', targetWordCount: 1750 },
          naver: { name: '네이버 시리즈', targetWordCount: 2800 },
          munpia: { name: '문피아/조아라', targetWordCount: 3600 },
          ridibooks: { name: '리디북스', targetWordCount: 3200 }
        }
      }
    }).as('platformConfig');
  });

  it('should display platform optimization features on admin page', () => {
    cy.visit('/admin');
    
    // 플랫폼 최적화 섹션 확인
    cy.get('[data-testid="platform-optimization"]').should('be.visible');
    
    // 현재 플랫폼 모드 표시
    cy.get('[data-testid="current-platform-mode"]').should('be.visible');
    
    // 플랫폼 설정 정보
    cy.get('[data-testid="platform-settings"]').should('be.visible');
  });

  it('should show platform-specific word count targets', () => {
    cy.visit('/admin');
    
    // 각 플랫폼별 분량 정보 확인
    const platforms = ['default', 'naver', 'munpia', 'ridibooks'];
    const expectedWordCounts = [1750, 2800, 3600, 3200];
    
    platforms.forEach((platform, index) => {
      cy.get(`[data-testid="platform-${platform}"]`).within(() => {
        cy.get('[data-testid="target-word-count"]')
          .should('contain', expectedWordCounts[index].toString());
      });
    });
  });

  it('should allow switching between platform modes', () => {
    cy.visit('/admin');
    
    // 플랫폼 모드 변경 기능이 있다면 테스트
    cy.get('[data-testid="platform-mode-selector"]').then(($selector) => {
      if ($selector.length > 0) {
        // 네이버 모드로 변경
        cy.wrap($selector).select('naver');
        
        // 설정 변경 확인
        cy.get('[data-testid="current-target-count"]').should('contain', '2800');
        cy.get('[data-testid="current-platform-name"]').should('contain', '네이버');
        
        // 문피아 모드로 변경
        cy.wrap($selector).select('munpia');
        cy.get('[data-testid="current-target-count"]').should('contain', '3600');
        cy.get('[data-testid="current-platform-name"]').should('contain', '문피아');
        
        // 기본 모드로 복원
        cy.wrap($selector).select('default');
        cy.get('[data-testid="current-target-count"]').should('contain', '1750');
      }
    });
  });

  it('should display platform-specific quality standards', () => {
    cy.visit('/admin');
    
    // 품질 기준 정보 섹션
    cy.get('[data-testid="quality-standards"]').should('be.visible');
    
    // 각 플랫폼별 품질 기준 확인
    cy.get('[data-testid="platform-quality-naver"]').within(() => {
      cy.get('[data-testid="quality-threshold"]').should('contain', '80');
      cy.get('[data-testid="dialogue-ratio"]').should('contain', '30%');
    });
    
    cy.get('[data-testid="platform-quality-munpia"]').within(() => {
      cy.get('[data-testid="quality-threshold"]').should('contain', '90');
      cy.get('[data-testid="dialogue-ratio"]').should('contain', '35%');
    });
    
    cy.get('[data-testid="platform-quality-ridibooks"]').within(() => {
      cy.get('[data-testid="quality-threshold"]').should('contain', '95');
      cy.get('[data-testid="dialogue-ratio"]').should('contain', '28%');
    });
  });

  it('should show platform optimization impact metrics', () => {
    cy.visit('/admin');
    
    // 최적화 영향도 지표가 있다면 확인
    cy.get('[data-testid="optimization-impact"]').then(($impact) => {
      if ($impact.length > 0) {
        cy.wrap($impact).should('be.visible');
        
        // 토큰 사용량 증가율
        cy.get('[data-testid="token-increase-naver"]').should('contain', '+60%');
        cy.get('[data-testid="token-increase-munpia"]').should('contain', '+106%');
        cy.get('[data-testid="token-increase-ridibooks"]').should('contain', '+83%');
        
        // 예상 품질 향상도
        cy.get('[data-testid="quality-improvement"]').should('be.visible');
      }
    });
  });

  it('should validate platform configuration settings', () => {
    cy.visit('/admin');
    
    // 설정 검증 기능
    cy.get('[data-testid="validate-platform-config"]').then(($button) => {
      if ($button.length > 0) {
        cy.wrap($button).click();
        
        // 검증 결과 확인
        cy.get('[data-testid="config-validation-results"]').should('be.visible');
        
        // 각 플랫폼별 검증 상태
        cy.get('[data-testid="validation-naver"]').should('contain', '✅');
        cy.get('[data-testid="validation-munpia"]').should('contain', '✅');
        cy.get('[data-testid="validation-ridibooks"]').should('contain', '✅');
      }
    });
  });

  it('should show platform-specific style guidelines', () => {
    cy.visit('/admin');
    
    // 스타일 가이드라인 정보
    cy.get('[data-testid="style-guidelines"]').should('be.visible');
    
    // 네이버 스타일 가이드라인
    cy.get('[data-testid="style-naver"]').within(() => {
      cy.should('contain', '감정적 몰입도');
      cy.should('contain', '다음 화 기대감');
    });
    
    // 문피아 스타일 가이드라인
    cy.get('[data-testid="style-munpia"]').within(() => {
      cy.should('contain', '상세한 묘사');
      cy.should('contain', '깊이 있는 캐릭터');
    });
    
    // 리디북스 스타일 가이드라인
    cy.get('[data-testid="style-ridibooks"]').within(() => {
      cy.should('contain', '편집 품질');
      cy.should('contain', '세련된 표현');
    });
  });

  it('should test platform mode with live generation', () => {
    // 테스트용 소설 생성 API 모킹
    cy.intercept('POST', '**/api/generate/test-chapter', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          title: '테스트 챕터',
          content: '플랫폼 최적화 테스트용 콘텐츠...',
          wordCount: 2800,
          platform: 'naver',
          qualityScore: 85
        }
      }
    }).as('generateTestChapter');
    
    cy.visit('/admin');
    
    // 플랫폼 모드를 네이버로 설정
    cy.setPlatformMode('naver');
    
    // 테스트 생성 버튼이 있다면 클릭
    cy.get('[data-testid="test-generation-button"]').then(($button) => {
      if ($button.length > 0) {
        cy.wrap($button).click();
        
        // 생성 완료 대기
        cy.wait('@generateTestChapter');
        
        // 결과 확인
        cy.get('[data-testid="generation-result"]').should('be.visible');
        cy.get('[data-testid="generated-word-count"]').should('contain', '2800');
        cy.get('[data-testid="platform-mode-used"]').should('contain', 'naver');
      }
    });
  });

  it('should show platform comparison chart', () => {
    cy.visit('/admin');
    
    // 플랫폼 비교 차트가 있다면 확인
    cy.get('[data-testid="platform-comparison"]').then(($chart) => {
      if ($chart.length > 0) {
        cy.wrap($chart).should('be.visible');
        
        // 각 플랫폼별 데이터 포인트 확인
        cy.get('[data-testid="chart-data-default"]').should('be.visible');
        cy.get('[data-testid="chart-data-naver"]').should('be.visible');
        cy.get('[data-testid="chart-data-munpia"]').should('be.visible');
        cy.get('[data-testid="chart-data-ridibooks"]').should('be.visible');
        
        // 범례 확인
        cy.get('[data-testid="chart-legend"]').should('be.visible');
      }
    });
  });

  it('should handle platform mode persistence', () => {
    cy.visit('/admin');
    
    // 플랫폼 모드를 네이버로 설정
    cy.setPlatformMode('naver');
    
    // 페이지 새로고침
    cy.reload();
    
    // 설정이 유지되는지 확인
    cy.get('[data-testid="current-platform-mode"]').should('contain', 'naver');
    cy.get('[data-testid="current-target-count"]').should('contain', '2800');
  });

  it('should show platform optimization recommendations', () => {
    cy.visit('/admin');
    
    // 최적화 권장사항 섹션이 있다면 확인
    cy.get('[data-testid="optimization-recommendations"]').then(($recommendations) => {
      if ($recommendations.length > 0) {
        cy.wrap($recommendations).should('be.visible');
        
        // 권장사항 항목들 확인
        cy.get('[data-testid="recommendation-item"]').should('have.length.at.least', 1);
        
        cy.get('[data-testid="recommendation-item"]').first().within(() => {
          cy.get('[data-testid="recommendation-title"]').should('be.visible');
          cy.get('[data-testid="recommendation-description"]').should('be.visible');
          cy.get('[data-testid="recommendation-impact"]').should('be.visible');
        });
      }
    });
  });

  afterEach(() => {
    // 테스트 후 기본 모드로 복원
    cy.setPlatformMode('default');
  });
});