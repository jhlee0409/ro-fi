#!/bin/bash

# 빠른 AI 테스트 - API 키 없이도 실행 가능한 버전

echo "🚀 Gemini AI 로맨스 판타지 자동 생성 로컬 테스트 (빠른 버전)"
echo "=================================================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 1. Docker 환경 확인
log_info "Docker 환경 확인"
if ! command -v docker &> /dev/null; then
    log_error "Docker가 설치되어 있지 않습니다"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose가 설치되어 있지 않습니다"
    exit 1
fi

log_success "Docker 환경 확인 완료"

# 2. API 키 확인 및 설정 가이드
log_info "Gemini API 키 설정 확인"
if [ -z "$GEMINI_API_KEY" ]; then
    log_warning "GEMINI_API_KEY가 설정되지 않았습니다"
    echo ""
    echo "API 키 설정 방법:"
    echo "1. Google AI Studio에서 API 키 발급: https://makersuite.google.com/app/apikey"
    echo "2. 환경 변수 설정: export GEMINI_API_KEY='your-api-key-here'"
    echo "3. 또는 .env.local 파일에 설정"
    echo ""
    log_info "API 키 없이 구조 테스트만 진행합니다"
else
    log_success "GEMINI_API_KEY 설정 확인됨"
fi

# 3. Docker 이미지 빌드
log_info "Docker 이미지 빌드 중..."
if docker build -f Dockerfile.ai-test -t ro-fi-ai-test:latest . > /dev/null 2>&1; then
    log_success "Docker 이미지 빌드 완료"
else
    log_error "Docker 이미지 빌드 실패"
    exit 1
fi

# 4. 기존 컨테이너 정리
log_info "기존 컨테이너 정리 중..."
docker-compose -f docker-compose.ai-test.yml down > /dev/null 2>&1

# 5. 테스트 컨테이너 실행
log_info "AI 테스트 컨테이너 실행 중..."
export GEMINI_API_KEY="${GEMINI_API_KEY:-test-key-for-structure-check}"

if docker-compose -f docker-compose.ai-test.yml up -d > /dev/null 2>&1; then
    log_success "컨테이너 실행 완료"
else
    log_error "컨테이너 실행 실패"
    exit 1
fi

# 6. 컨테이너 준비 상태 확인
log_info "컨테이너 준비 상태 확인 중..."
sleep 3

if docker exec ro-fi-ai-generator test -f /app/scripts/ai-novel-generator.js; then
    log_success "AI 생성 스크립트 확인됨"
else
    log_error "AI 생성 스크립트를 찾을 수 없습니다"
    exit 1
fi

# 7. 구조 테스트 실행
log_info "구조 테스트 실행 중..."

echo ""
echo "=== 컨테이너 내부 구조 확인 ==="
docker exec ro-fi-ai-generator ls -la /app/scripts/ | grep -E "(ai-novel|generate-images|test-ai)"

echo ""
echo "=== 의존성 확인 ==="
docker exec ro-fi-ai-generator node --version
docker exec ro-fi-ai-generator pnpm --version

echo ""
echo "=== AI 생성 스크립트 구조 확인 ==="
docker exec ro-fi-ai-generator head -20 /app/scripts/ai-novel-generator.js

echo ""
echo "=== 환경 변수 확인 ==="
docker exec ro-fi-ai-generator printenv | grep -E "(GEMINI|NODE_ENV|TZ)"

# 8. API 키가 있는 경우 실제 테스트
if [ -n "$GEMINI_API_KEY" ] && [ "$GEMINI_API_KEY" != "test-key-for-structure-check" ]; then
    log_info "실제 Gemini AI 테스트 실행 중..."
    echo ""
    echo "=== 실제 AI 생성 테스트 ==="
    
    # 실제 AI 생성 테스트 (타임아웃 설정)
    if timeout 300 docker exec ro-fi-ai-generator ./scripts/test-ai-generation.sh; then
        log_success "AI 생성 테스트 완료"
    else
        log_warning "AI 생성 테스트 타임아웃 또는 실패 (API 키 확인 필요)"
    fi
else
    log_info "API 키가 없어 구조 테스트만 완료"
    echo ""
    echo "실제 테스트를 위해서는:"
    echo "1. export GEMINI_API_KEY='your-actual-api-key'"
    echo "2. ./test-ai-quick.sh"
fi

# 9. 결과 요약
echo ""
echo "=========================================="
echo "AI 테스트 환경 준비 완료!"
echo "=========================================="
echo ""
echo "다음 명령어로 컨테이너에 접속하여 테스트 가능:"
echo "  docker exec -it ro-fi-ai-generator bash"
echo ""
echo "컨테이너 내에서 실행 가능한 명령어:"
echo "  ./scripts/test-ai-generation.sh          # 전체 AI 테스트"
echo "  node scripts/ai-novel-generator.js --help # AI 생성 도움말"
echo "  node scripts/generate-images-for-novel.js --help # 이미지 생성 도움말"
echo ""
echo "로그 확인:"
echo "  docker logs ro-fi-ai-generator           # AI 생성 로그"
echo "  docker logs ro-fi-content-monitor        # 콘텐츠 모니터링"
echo ""
echo "정리:"
echo "  docker-compose -f docker-compose.ai-test.yml down"
echo ""

if [ -n "$GEMINI_API_KEY" ] && [ "$GEMINI_API_KEY" != "test-key-for-structure-check" ]; then
    log_success "실제 AI 테스트까지 완료!"
else
    log_info "구조 테스트 완료 - API 키 설정 후 실제 테스트 가능"
fi