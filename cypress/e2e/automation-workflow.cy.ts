describe('AI Automation Workflow E2E Tests', () => {
  beforeEach(() => {
    // 자동화 API 모킹 설정
    cy.mockAutomation();
    
    // 테스트 데이터 정리
    cy.cleanupTestData();
  });

  it('should display automation status on admin page', () => {
    // 관리자 페이지 방문
    cy.visit('/admin');
    
    // 자동화 상태 섹션 확인
    cy.get('[data-testid="automation-status"]').should('be.visible');
    
    // 자동화 통계 확인
    cy.get('[data-testid="active-novels-count"]').should('be.visible');
    cy.get('[data-testid="last-run-time"]').should('be.visible');
    cy.get('[data-testid="automation-health"]').should('be.visible');
  });

  it('should show recent automation activities', () => {
    cy.visit('/admin');
    
    // 최근 활동 로그 확인
    cy.get('[data-testid="recent-activities"]').should('be.visible');
    
    // 활동 항목들 확인
    cy.get('[data-testid="activity-item"]').should('have.length.at.least', 1);
    
    cy.get('[data-testid="activity-item"]').first().within(() => {
      cy.get('[data-testid="activity-type"]').should('be.visible');
      cy.get('[data-testid="activity-time"]').should('be.visible');
      cy.get('[data-testid="activity-result"]').should('be.visible');
    });
  });

  it('should manually trigger automation workflow', () => {
    cy.visit('/admin');
    
    // 수동 실행 버튼이 있다면 테스트
    cy.get('[data-testid="manual-trigger-button"]').then(($button) => {
      if ($button.length > 0) {
        // 버튼 클릭
        cy.wrap($button).click();
        
        // 확인 모달이 있다면 처리
        cy.get('[data-testid="confirm-modal"]').then(($modal) => {
          if ($modal.length > 0) {
            cy.get('[data-testid="confirm-button"]').click();
          }
        });
        
        // 실행 중 상태 확인
        cy.get('[data-testid="automation-status"]').should('contain', '실행 중');
        
        // API 호출 확인
        cy.wait('@runAutomation');
        
        // 완료 상태 확인
        cy.get('[data-testid="automation-status"]').should('contain', '완료');
      }
    });
  });

  it('should display platform configuration', () => {
    cy.visit('/admin');
    
    // 플랫폼 설정 섹션 확인
    cy.get('[data-testid="platform-config"]').then(($config) => {
      if ($config.length > 0) {
        cy.wrap($config).should('be.visible');
        
        // 현재 플랫폼 모드 확인
        cy.get('[data-testid="current-platform"]').should('be.visible');
        
        // 플랫폼별 설정 확인
        cy.get('[data-testid="platform-settings"]').should('be.visible');
      }
    });
  });

  it('should change platform mode', () => {
    cy.visit('/admin');
    
    // 플랫폼 모드 변경 기능이 있다면 테스트
    cy.get('[data-testid="platform-selector"]').then(($selector) => {
      if ($selector.length > 0) {
        // 네이버 모드로 변경
        cy.wrap($selector).select('naver');
        
        // 변경 확인
        cy.get('[data-testid="current-platform"]').should('contain', '네이버');
        
        // 설정 업데이트 확인
        cy.get('[data-testid="target-word-count"]').should('contain', '2800');
        
        // 기본 모드로 복원
        cy.wrap($selector).select('default');
        cy.get('[data-testid="current-platform"]').should('contain', '기본');
      }
    });
  });

  it('should show AI generation logs', () => {
    cy.visit('/admin');
    
    // AI 생성 로그 섹션 확인
    cy.get('[data-testid="ai-generation-logs"]').then(($logs) => {
      if ($logs.length > 0) {
        cy.wrap($logs).should('be.visible');
        
        // 로그 항목들 확인
        cy.get('[data-testid="log-entry"]').should('have.length.at.least', 1);
        
        cy.get('[data-testid="log-entry"]').first().within(() => {
          cy.get('[data-testid="log-timestamp"]').should('be.visible');
          cy.get('[data-testid="log-level"]').should('be.visible');
          cy.get('[data-testid="log-message"]').should('be.visible');
        });
      }
    });
  });

  it('should display token usage statistics', () => {
    cy.visit('/admin');
    
    // 토큰 사용량 통계가 있다면 확인
    cy.get('[data-testid="token-usage"]').then(($usage) => {
      if ($usage.length > 0) {
        cy.wrap($usage).should('be.visible');
        
        // 일일 사용량
        cy.get('[data-testid="daily-tokens"]').should('be.visible');
        
        // 월간 사용량
        cy.get('[data-testid="monthly-tokens"]').should('be.visible');
        
        // 비용 정보
        cy.get('[data-testid="token-cost"]').should('be.visible');
      }
    });
  });

  it('should show quality metrics', () => {
    cy.visit('/admin');
    
    // 품질 지표 섹션 확인
    cy.get('[data-testid="quality-metrics"]').then(($metrics) => {
      if ($metrics.length > 0) {
        cy.wrap($metrics).should('be.visible');
        
        // 평균 품질 점수
        cy.get('[data-testid="avg-quality-score"]').should('be.visible');
        
        // 캐릭터 일관성 점수
        cy.get('[data-testid="character-consistency"]').should('be.visible');
        
        // 최근 품질 트렌드
        cy.get('[data-testid="quality-trend"]').should('be.visible');
      }
    });
  });

  it('should handle error states gracefully', () => {
    // API 에러 시뮬레이션
    cy.intercept('GET', '**/api/automation/status', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('statusError');
    
    cy.visit('/admin');
    
    // 에러 상태 UI 확인
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="retry-button"]').should('be.visible');
  });

  it('should show automation schedule information', () => {
    cy.visit('/admin');
    
    // 자동화 스케줄 정보가 있다면 확인
    cy.get('[data-testid="automation-schedule"]').then(($schedule) => {
      if ($schedule.length > 0) {
        cy.wrap($schedule).should('be.visible');
        
        // 다음 실행 시간
        cy.get('[data-testid="next-run-time"]').should('be.visible');
        
        // 실행 주기
        cy.get('[data-testid="run-interval"]').should('be.visible');
        
        // GitHub Actions 상태
        cy.get('[data-testid="github-actions-status"]').should('be.visible');
      }
    });
  });

  it('should validate automation configuration', () => {
    cy.visit('/admin');
    
    // 설정 검증 기능이 있다면 테스트
    cy.get('[data-testid="validate-config-button"]').then(($button) => {
      if ($button.length > 0) {
        cy.wrap($button).click();
        
        // 검증 결과 확인
        cy.get('[data-testid="validation-results"]').should('be.visible');
        
        // 성공/실패 상태 확인
        cy.get('[data-testid="validation-status"]').should('be.visible');
      }
    });
  });

  it('should backup and restore functionality', () => {
    cy.visit('/admin');
    
    // 백업/복원 기능이 있다면 테스트
    cy.get('[data-testid="backup-section"]').then(($backup) => {
      if ($backup.length > 0) {
        // 백업 생성
        cy.get('[data-testid="create-backup-button"]').click();
        
        // 백업 진행 상태 확인
        cy.get('[data-testid="backup-status"]').should('contain', '진행 중');
        
        // 완료 확인
        cy.get('[data-testid="backup-status"]').should('contain', '완료');
        
        // 백업 목록 확인
        cy.get('[data-testid="backup-list"]').should('be.visible');
      }
    });
  });

  afterEach(() => {
    // 테스트 후 정리
    cy.cleanupTestData();
  });
});