# Cypress E2E Testing for ro-fan Platform

Cypress E2E 테스트 시스템은 ro-fan 플랫폼의 사용자 경험과 AI 자동화 워크플로우를 종합적으로 검증합니다.

## 📊 Testing Architecture Overview

### Testing Stack
- **Cypress 14.5.3**: Modern E2E testing framework
- **cypress-axe**: Accessibility testing
- **cypress-real-events**: Real user interaction simulation  
- **@cypress/code-coverage**: Code coverage tracking

### Test Categories
1. **Core E2E Tests**: 사용자 워크플로우 검증
2. **Component Tests**: React 컴포넌트 격리 테스트
3. **Automation Tests**: AI 자동화 시스템 검증
4. **Accessibility Tests**: WCAG 2.1 AA 준수 검증
5. **Platform Tests**: 플랫폼별 최적화 기능 검증

## 🚀 Quick Start

### Installation
```bash
# 프로젝트 의존성 설치 (Cypress 포함)
pnpm install

# Cypress 바이너리 설치 확인
pnpm cypress verify
```

### Running Tests

#### Interactive Mode (개발용)
```bash
# Cypress GUI로 테스트 실행
pnpm test:e2e:cypress:open

# 특정 브라우저로 실행
pnpm cypress open --browser chrome
pnpm cypress open --browser firefox
```

#### Headless Mode (CI/CD용)
```bash
# 모든 E2E 테스트 실행
pnpm test:e2e:cypress

# Chrome 브라우저로 headless 실행
pnpm test:e2e:cypress:ci

# 특정 스펙 파일만 실행
pnpm cypress run --spec "cypress/e2e/homepage.cy.ts"
```

#### Component Testing
```bash
# React 컴포넌트 테스트
pnpm cypress run --component
```

### Development Server
```bash
# Astro 개발 서버 시작 (테스트 실행 전 필요)
pnpm dev

# 다른 터미널에서 테스트 실행
pnpm test:e2e:cypress
```

## 📁 Project Structure

```
cypress/
├── e2e/                          # E2E 테스트 파일들
│   ├── homepage.cy.ts            # 홈페이지 기능 테스트
│   ├── novels.cy.ts              # 소설 목록 페이지 테스트
│   ├── novel-detail.cy.ts        # 소설 상세 페이지 테스트
│   ├── automation-workflow.cy.ts # AI 자동화 워크플로우 테스트
│   └── platform-optimization.cy.ts # 플랫폼 최적화 기능 테스트
├── component/                    # 컴포넌트 테스트 (향후 확장)
├── support/                      # 공통 설정 및 명령어
│   ├── e2e.ts                   # E2E 테스트 설정
│   ├── component.ts             # 컴포넌트 테스트 설정
│   └── commands.ts              # 커스텀 Cypress 명령어
├── fixtures/                     # 테스트 데이터
│   └── test-data.json           # 샘플 소설, 챕터, 사용자 데이터
└── README.md                     # 이 파일
```

## 🧪 Test Scenarios

### Core User Workflows

#### Homepage Tests (`homepage.cy.ts`)
- ✅ 홈페이지 로딩 및 주요 섹션 표시
- ✅ 네비게이션 메뉴 기능
- ✅ 최신 소설 목록 표시
- ✅ 반응형 디자인 검증
- ✅ 접근성 검증
- ✅ 검색 기능 (선택적)

#### Novels Page Tests (`novels.cy.ts`)
- ✅ 소설 목록 페이지 로딩
- ✅ 소설 카드 정보 표시
- ✅ 소설 상세 페이지 이동
- ✅ 필터링 및 정렬 기능
- ✅ 페이지네이션 (선택적)
- ✅ 검색 기능 (선택적)

#### Novel Detail Tests (`novel-detail.cy.ts`)
- ✅ 소설 상세 정보 표시
- ✅ 챕터 목록 표시
- ✅ 챕터 페이지 이동
- ✅ 북마크 기능 (선택적)
- ✅ 평점 및 리뷰 (선택적)
- ✅ SEO 메타 태그 검증

### AI Automation Tests

#### Automation Workflow Tests (`automation-workflow.cy.ts`)
- ✅ 자동화 상태 모니터링
- ✅ 수동 자동화 실행
- ✅ 플랫폼 설정 관리
- ✅ AI 생성 로그 확인
- ✅ 토큰 사용량 통계
- ✅ 품질 지표 모니터링
- ✅ 에러 처리 검증

#### Platform Optimization Tests (`platform-optimization.cy.ts`)
- ✅ 플랫폼별 분량 설정 표시
- ✅ 플랫폼 모드 변경 기능
- ✅ 품질 기준 차별화 확인
- ✅ 최적화 영향도 지표
- ✅ 스타일 가이드라인 표시
- ✅ 설정 유지 및 검증

## 🔧 Custom Commands

### Navigation Commands
```typescript
// 특정 소설 페이지 방문
cy.visitNovel('novel-slug');

// 특정 챕터 페이지 방문  
cy.visitChapter('novel-slug', 1);
```

### Authentication Commands
```typescript
// 관리자 로그인 (세션 설정)
cy.login();
```

### Platform Commands
```typescript
// 플랫폼 모드 설정
cy.setPlatformMode('naver');
```

### Viewport Commands
```typescript
// 모바일 뷰포트로 변경
cy.setMobileViewport();

// 데스크톱 뷰포트로 변경
cy.setDesktopViewport();
```

### Testing Utilities
```typescript
// AI 자동화 API 모킹
cy.mockAutomation();

// 테스트 데이터 정리
cy.cleanupTestData();
```

## 🎭 Mocking Strategy

### API Mocking
자동화 및 AI 관련 API는 테스트 환경에서 모킹됩니다:

```typescript
// AI 스토리 생성 API 모킹
cy.intercept('POST', '**/api/generate-story', {
  statusCode: 200,
  body: { success: true, data: { /* mock data */ } }
}).as('generateStory');

// 자동화 실행 API 모킹
cy.intercept('POST', '**/api/automation/run', {
  statusCode: 200, 
  body: { success: true, action: 'CONTINUE_CHAPTER' }
}).as('runAutomation');
```

### Environment Variables
테스트 환경에서 사용되는 환경 변수:

```bash
NODE_ENV=test                    # 테스트 환경 설정
CYPRESS_MOCK_AI=true            # AI 서비스 모킹 활성화
CYPRESS_PLATFORM_MODE=default   # 기본 플랫폼 모드
CYPRESS_ACCESSIBILITY_ONLY=true # 접근성 전용 테스트 모드
```

## 🚀 CI/CD Integration

### GitHub Actions
Cypress 테스트는 다음 GitHub Actions 워크플로우에서 실행됩니다:

1. **cypress-e2e.yml**: 메인 E2E 테스트 워크플로우
   - Chrome, Firefox 멀티 브라우저 테스트
   - 병렬 실행으로 성능 최적화
   - 접근성 테스트 별도 실행
   - 실패 시 스크린샷/비디오 아티팩트 저장

2. **Integration with Existing Workflows**:
   - quality-assurance.yml에 통합
   - PR 체크 포함
   - 커버리지 리포팅

### Test Matrix
```yaml
strategy:
  matrix:
    browser: [chrome, firefox]
    spec-group: [1, 2]  # 병렬 실행용 스펙 분할
```

### Artifacts
실패한 테스트의 디버깅을 위해 다음 아티팩트가 저장됩니다:
- 스크린샷 (cypress/screenshots)
- 비디오 (cypress/videos)  
- 커버리지 리포트
- 접근성 테스트 결과

## 🎯 Best Practices

### Test Organization
1. **Descriptive Names**: 테스트 이름은 기능을 명확히 설명
2. **Arrange-Act-Assert**: 테스트 구조를 일관되게 유지
3. **Independent Tests**: 각 테스트는 독립적으로 실행 가능
4. **Cleanup**: beforeEach/afterEach에서 테스트 데이터 정리

### Selectors
1. **data-testid 사용**: UI 변경에 영향받지 않는 안정적인 셀렉터
2. **Semantic Selectors**: 의미있는 HTML 요소 활용
3. **Avoid CSS Selectors**: 스타일 변경에 취약한 셀렉터 지양

### Assertions
1. **Explicit Waits**: cy.wait() 보다는 조건부 대기 사용
2. **Multiple Assertions**: 관련된 여러 검증을 그룹화
3. **Error Messages**: 실패 시 의미있는 에러 메시지 제공

### Performance
1. **Efficient Setup**: beforeEach에서 필요한 최소한의 설정만
2. **Parallel Execution**: 독립적인 테스트는 병렬 실행
3. **Smart Waiting**: 불필요한 대기 시간 최소화

## 🐛 Debugging

### Local Debugging
```bash
# 디버그 모드로 Cypress 실행
DEBUG=cypress:* pnpm cypress open

# 특정 테스트만 실행하여 디버깅
pnpm cypress run --spec "cypress/e2e/homepage.cy.ts" --headed

# 브라우저를 열어놓고 디버깅
pnpm cypress open --browser chrome
```

### CI Debugging
1. **Artifacts 확인**: 실패한 테스트의 스크린샷과 비디오 다운로드
2. **Console Logs**: cypress-io/github-action의 로그 확인
3. **Cypress Dashboard**: 클라우드 대시보드에서 상세 분석 (설정 시)

### Common Issues

#### Timeouts
```typescript
// 긴 대기가 필요한 경우 타임아웃 증가
cy.get('[data-testid="slow-element"]', { timeout: 10000 })
  .should('be.visible');
```

#### Flaky Tests
```typescript
// 조건부 대기로 안정성 확보
cy.get('[data-testid="dynamic-content"]')
  .should('be.visible')
  .and('not.be.empty');
```

#### Network Issues
```typescript
// 네트워크 요청 대기
cy.intercept('GET', '/api/novels').as('getNovels');
cy.visit('/novels');
cy.wait('@getNovels');
```

## 📈 Metrics & Reporting

### Test Coverage
- E2E 테스트 커버리지는 @cypress/code-coverage로 수집
- 코드 커버리지 리포트는 Codecov로 업로드
- 최소 커버리지 목표: 70% (E2E 관련 코드)

### Performance Metrics
- 페이지 로드 시간 모니터링
- 상호작용 응답 시간 측정
- Core Web Vitals 검증

### Accessibility Metrics
- WCAG 2.1 AA 준수 검증
- 키보드 네비게이션 테스트
- 스크린 리더 호환성 검증

## 🔄 Maintenance

### Regular Updates
1. **Weekly**: Cypress 버전 및 플러그인 업데이트 확인
2. **Monthly**: 테스트 성공률 분석 및 flaky 테스트 수정
3. **Quarterly**: 테스트 커버리지 리뷰 및 개선

### Test Health
1. **Success Rate**: 95% 이상 유지 목표
2. **Execution Time**: 전체 테스트 10분 이내 완료
3. **Maintenance Overhead**: 새 기능 대비 20% 이하

### Documentation
1. **Test Cases**: 새로운 기능 추가 시 테스트 케이스 업데이트
2. **README**: 설정 변경 시 문서 동기화
3. **Best Practices**: 팀 경험 공유 및 가이드라인 개선

---

## 📞 Support

### Resources
- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Accessibility Testing Guide](https://github.com/component-driven/cypress-axe)

### Team Contact
- **Frontend Team**: UI/UX 테스트 관련 문의
- **QA Team**: 테스트 전략 및 품질 관련 문의  
- **DevOps Team**: CI/CD 파이프라인 관련 문의

---

**Happy Testing! 🚀**