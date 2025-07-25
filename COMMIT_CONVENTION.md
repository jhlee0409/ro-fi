# Git Commit Convention

ro-fan 프로젝트를 위한 Git 커밋 메시지 컨벤션입니다.

## 기본 형식

```text
<type>: <description>

[optional body]

[optional footer]
```

## 타입 (Type)

### AI 및 자동화 관련

- `ai`: AI 엔진 및 자동화 시스템 개발
- `automation`: 자동화 워크플로우 및 스케줄링
- `content`: 콘텐츠 생성 및 관리

### 개발 관련

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링 (기능 변경 없음)
- `perf`: 성능 최적화

### 테스트 및 품질

- `test`: 테스트 코드 추가/수정
- `style`: 코드 스타일 변경 (포매팅, 세미콜론 등)
- `docs`: 문서 변경

### 환경 및 설정

- `build`: 빌드 시스템 또는 외부 의존성 변경
- `ci`: CI 설정 파일 및 스크립트 변경
- `config`: 설정 파일 변경

### 기타

- `chore`: 기타 변경사항 (빌드 과정, 보조 도구 등)
- `revert`: 이전 커밋 되돌리기

## 설명 (Description) 가이드라인

- 명령문, 현재 시제 사용 ("add" not "added" nor "adds")
- 첫 글자는 소문자
- 마침표(.)로 끝내지 않음
- 50자 이내로 작성
- 한글 또는 영어 사용 가능

## 예시

### AI 및 자동화

```text
ai: 새로운 감정 분석 엔진 추가
automation: GitHub Actions 스케줄링 최적화
content: 소설 메타데이터 스키마 개선
```

### 기능 개발

```text
feat: 소설 검색 필터링 기능 구현
fix: 챕터 페이지네이션 오류 수정
refactor: 소설 감지기 클래스 구조 개선
```

### 테스트 및 품질

```text
test: 자동화 엔진 통합 테스트 추가
style: ESLint 규칙에 따른 코드 포매팅
docs: API 문서 업데이트
```

### 환경 설정

```text
build: Astro 설정 최적화
ci: 테스트 커버리지 리포트 추가
config: TypeScript 설정 업데이트
```

## 상세 설명 (Body)

- 선택사항
- "무엇을" 그리고 "왜"에 대해 설명
- 72자마다 줄바꿈

예시:

```text
ai: 독자 참여도 분석 알고리즘 개선

이전 알고리즘의 정확도가 낮아 독자 이탈률 예측에
문제가 있었음. 새로운 가중치 시스템을 도입하여
예측 정확도를 85%에서 92%로 향상시킴.
```

## 푸터 (Footer)

### Breaking Changes

```text
BREAKING CHANGE: 소설 메타데이터 스키마가 변경됨
기존 소설 파일들의 frontmatter 업데이트 필요
```

### 이슈 참조

```text
Closes #123
Refs #456, #789
```

## 특별 상황

### 자동 커밋 (GitHub Actions)

```text
🤖 자동 연재 업데이트 - 2025-07-25 17:13:00 KST

- 신규 소설 1편 생성
- 기존 소설 2편 챕터 추가
- 총 3개 파일 변경
```

### 긴급 수정

```text
hotfix: 프로덕션 빌드 오류 긴급 수정

Vercel 배포 실패 원인인 TypeScript 타입 오류 해결
```

### 리버트

```text
revert: "feat: 실험적 AI 엔진 통합"

This reverts commit 1234567.
성능 이슈로 인한 롤백
```

## 규칙

1. **일관성 유지**: 팀 전체가 동일한 컨벤션 사용
2. **간결성**: 커밋 메시지는 명확하고 간결하게
3. **의미 전달**: 변경사항의 의도와 목적을 명확히
4. **자동화 친화적**: CI/CD 시스템에서 파싱 가능한 형태
5. **한국어 허용**: 프로젝트 특성상 한국어 설명 권장

## 도구 지원

### VS Code 확장

- Conventional Commits
- GitLens

### 커밋 템플릿

`.gitmessage` 파일 생성:

```text
# <type>: <subject>
#
# <body>
#
# <footer>
```

설정:

```bash
git config commit.template .gitmessage
```

## 관련 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)