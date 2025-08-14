# GitHub Actions 로컬 테스트 환경

이 문서는 ro-fan 프로젝트에서 GitHub Actions 워크플로우를 로컬에서 테스트할 수 있는 환경 구성과 사용법을 설명합니다.

## 📋 개요

GitHub Actions 워크플로우를 로컬에서 테스트하면 다음과 같은 이점을 얻을 수 있습니다:

- **빠른 피드백**: GitHub에 푸시하지 않고도 워크플로우 테스트 가능
- **비용 절약**: GitHub Actions 실행 시간 절약
- **디버깅 용이성**: 로컬에서 직접 디버깅 가능
- **개발 효율성**: 워크플로우 수정 사이클 단축

## 🛠️ 설치 및 설정

### 1. 자동 설정 (권장)

```bash
# 모든 의존성 설치 및 환경 구성
pnpm actions:setup
```

이 명령어는 다음을 자동으로 수행합니다:
- Docker 및 act 설치 확인
- 필요한 Docker 이미지 다운로드
- 설정 파일 생성
- 환경 초기화

### 2. 수동 설정

#### 2.1 의존성 설치

**macOS:**
```bash
# Homebrew로 설치
brew install act

# 또는 curl로 설치
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
```

**Linux:**
```bash
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

**Windows:**
```bash
# Chocolatey로 설치
choco install act-cli

# 또는 GitHub에서 직접 다운로드
# https://github.com/nektos/act/releases
```

#### 2.2 Docker 설치

- [Docker Desktop](https://www.docker.com/products/docker-desktop) 설치 및 실행

#### 2.3 환경 초기화

```bash
pnpm actions:init
```

## 🚀 사용법

### 기본 명령어

```bash
# 워크플로우 목록 조회
pnpm actions:list

# 워크플로우 유효성 검증
pnpm actions:validate .github/workflows/auto-publish.yml

# 🌟 완전 독립형 워크플로우 실행 (GitHub Token 불필요)
pnpm actions:standalone
pnpm actions:standalone --dry-run

# 일반 워크플로우 실행 (GitHub Token 필요)
pnpm actions:run .github/workflows/auto-publish.yml workflow_dispatch

# 워크플로우 실행 (Dry Run - 계획만 출력)
pnpm actions:run .github/workflows/auto-publish.yml workflow_dispatch --dry-run

# 특정 Job만 실행
pnpm actions:run .github/workflows/auto-publish.yml workflow_dispatch --job automation

# 상세 로그와 함께 실행
pnpm actions:run .github/workflows/auto-publish.yml workflow_dispatch --verbose

# 전체 환경 테스트
pnpm actions:test

# 인증 관련 명령어
pnpm actions:check-auth  # 인증 상태 확인
pnpm actions:fix-auth    # 인증 문제 진단 및 수정
```

### 고급 사용법

#### 1. 시크릿 설정

실제 API 키가 필요한 경우 `.local-actions/secrets` 파일을 수정하세요:

```bash
# .local-actions/secrets 파일 편집
ANTHROPIC_API_KEY="your-actual-api-key"
GEMINI_API_KEY="your-actual-gemini-key"
VERCEL_TOKEN="your-vercel-token"
```

#### 2. 환경변수 설정

`.local-actions/.env` 파일에서 환경변수를 설정할 수 있습니다:

```bash
# .local-actions/.env 파일 편집
NODE_ENV=development
DEBUG=true
CUSTOM_VAR=value
```

#### 3. act 설정 커스터마이징

`.actrc` 파일에서 act의 기본 설정을 변경할 수 있습니다:

```bash
# .actrc 파일 내용
--container-architecture linux/amd64
--artifact-server-path .local-actions/artifacts
--env-file .local-actions/.env
--secret-file .local-actions/secrets
```

## 📁 디렉토리 구조

```
ro-fan/
├── .github/workflows/           # GitHub Actions 워크플로우
├── .local-actions/              # 로컬 테스트 환경 (git에서 제외됨)
│   ├── artifacts/              # 워크플로우 아티팩트
│   ├── logs/                   # 실행 로그
│   ├── secrets                 # 시크릿 설정
│   ├── .env                    # 환경변수
│   └── test-report.json        # 테스트 결과
├── .actrc                      # act 기본 설정
└── scripts/
    ├── local-github-actions.js # 메인 서비스 스크립트
    ├── setup-local-actions.sh  # 환경 설정 스크립트
    └── test-local-actions.js   # 테스트 검증 스크립트
```

## 🧪 테스트 및 검증

### 테스트 실행

```bash
# 모든 테스트 실행
pnpm actions:test

# 특정 테스트만 실행
node scripts/test-local-actions.js deps      # 의존성 테스트
node scripts/test-local-actions.js workflows # 워크플로우 구조 테스트
node scripts/test-local-actions.js service   # 서비스 테스트
node scripts/test-local-actions.js config    # 설정 파일 테스트
```

### 테스트 결과

테스트 실행 후 `.local-actions/test-report.json` 파일에서 상세한 결과를 확인할 수 있습니다.

## 🔧 워크플로우별 테스트 가이드

### 1. auto-publish.yml

```bash
# 전체 워크플로우 테스트 (Dry Run)
pnpm actions:run .github/workflows/auto-publish.yml workflow_dispatch --dry-run

# automation job만 테스트
pnpm actions:run .github/workflows/auto-publish.yml workflow_dispatch --job automation

# 실제 실행 (주의: 실제 API 호출됨)
pnpm actions:run .github/workflows/auto-publish.yml workflow_dispatch --verbose
```

### 2. ai-story-generation.yml

```bash
# 구조 검증
pnpm actions:validate .github/workflows/ai-story-generation.yml

# Dry Run 테스트
pnpm actions:run .github/workflows/ai-story-generation.yml workflow_dispatch --dry-run
```

### 3. content-quality-check.yml

```bash
# Push 이벤트 시뮬레이션
pnpm actions:run .github/workflows/content-quality-check.yml push --dry-run

# 특정 job 테스트
pnpm actions:run .github/workflows/content-quality-check.yml push --job auto-quality-check
```

## 🐛 문제 해결

### act 인증 오류 (핵심 문제)

#### 증상
```
❌ Unable to clone https://github.com/actions/setup-node refs/heads/v4
❌ authentication required: Invalid username or token
```

**중요**: act는 **모든 공식 GitHub Actions**를 클론하기 위해 GitHub Token이 필요합니다:
- actions/checkout@v4
- actions/setup-node@v4  
- actions/cache@v4
- 기타 모든 actions/* 액션들

#### 해결 방법

**방법 1: 완전 독립형 워크플로우 사용 (가장 간단)**
```bash
# GitHub Actions 없이 순수 bash 스크립트로만 실행
pnpm actions:standalone

# 또는 dry-run으로 테스트
pnpm actions:standalone --dry-run
```

**방법 2: 자동 진단 및 수정 (권장)**
```bash
pnpm actions:fix-auth
```

**방법 3: GitHub Token 수동 설정**
```bash
# 1. GitHub에서 Personal Access Token 생성
# https://github.com/settings/tokens
# 권한: repo, workflow, read:packages 필요

# 2. 환경변수로 설정
export GITHUB_TOKEN=your_token_here

# 3. 또는 시크릿 파일에 직접 추가
echo 'GITHUB_TOKEN="your_token_here"' >> .local-actions/secrets

# 4. 설정 확인
pnpm actions:check-auth
```

**방법 4: 캐시 없는 워크플로우 사용 (부분적 해결)**
```bash
# 캐시 의존성이 없는 로컬 테스트용 워크플로우 사용
# 여전히 다른 GitHub Actions에는 인증 필요
pnpm actions:run .github/workflows/auto-publish-local.yml workflow_dispatch
```

### 일반적인 문제

#### 1. Docker 관련 오류

```bash
# Docker 상태 확인
docker info

# Docker Desktop 재시작 필요할 수 있음
```

#### 2. act 설치 오류

```bash
# act 버전 확인
act --version

# 최신 버전으로 재설치
brew upgrade act  # macOS
```

#### 3. 권한 오류

```bash
# 스크립트 실행 권한 부여
chmod +x scripts/setup-local-actions.sh
chmod +x scripts/local-github-actions.js
```

#### 4. 이미지 다운로드 실패

```bash
# 수동으로 필요한 이미지 다운로드
docker pull ghcr.io/catthehacker/ubuntu:act-latest
docker pull node:18-alpine
```

### 로그 확인

실행 로그는 `.local-actions/logs/` 디렉토리에 저장됩니다:

```bash
# 최신 로그 확인
ls -la .local-actions/logs/
cat .local-actions/logs/[timestamp]-[workflow].log
```

## 🔒 보안 고려사항

### 시크릿 관리

- `.local-actions/secrets` 파일은 git에서 제외됩니다
- 실제 API 키 사용 시 주의하세요
- 테스트용 더미 키를 기본값으로 사용합니다

### 네트워크 접근

- 로컬 실행 시에도 외부 API 호출이 발생할 수 있습니다
- `--dry-run` 옵션을 사용하여 실제 실행 없이 테스트하세요

## 📚 추가 자료

### 공식 문서

- [nektos/act GitHub Repository](https://github.com/nektos/act)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)

### 유용한 링크

- [act 사용법 가이드](https://github.com/nektos/act#usage)
- [GitHub Actions 이벤트 시뮬레이션](https://github.com/nektos/act#supported-events)
- [Docker 이미지 목록](https://github.com/nektos/act#docker-images)

## 🤝 기여하기

로컬 테스트 환경 개선을 위한 제안이나 버그 리포트는 언제든 환영합니다:

1. 이슈 생성
2. 개선 사항 제안
3. 문서 업데이트
4. 테스트 케이스 추가

## 📝 변경 이력

### v1.0.0 (2025-01-30)

- 초기 로컬 GitHub Actions 테스트 환경 구축
- act 기반 워크플로우 실행 환경 구성
- 자동 설정 스크립트 및 테스트 도구 추가
- 포괄적인 문서화 및 사용법 가이드 제공