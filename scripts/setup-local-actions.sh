#!/bin/bash

# GitHub Actions 로컬 테스트 환경 설정 스크립트
# 이 스크립트는 act와 관련 도구들을 설치하고 환경을 구성합니다.

set -euo pipefail

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로깅 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# OS 감지
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Docker 설치 확인
check_docker() {
    log_info "Docker 설치 확인 중..."
    
    if command -v docker >/dev/null 2>&1; then
        if docker info >/dev/null 2>&1; then
            local version=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
            log_success "Docker 설치됨 (버전: $version)"
            return 0
        else
            log_warning "Docker가 설치되어 있지만 실행되지 않습니다."
            log_info "Docker Desktop을 시작해주세요."
            return 1
        fi
    else
        log_error "Docker가 설치되지 않았습니다."
        return 1
    fi
}

# act 설치
install_act() {
    local os=$(detect_os)
    log_info "act 설치 중... (OS: $os)"
    
    case $os in
        "macos")
            if command -v brew >/dev/null 2>&1; then
                log_info "Homebrew를 사용하여 act 설치 중..."
                brew install act
            else
                log_info "curl을 사용하여 act 설치 중..."
                curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
            fi
            ;;
        "linux")
            log_info "curl을 사용하여 act 설치 중..."
            curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
            ;;
        "windows")
            log_info "Windows에서는 다음 방법으로 설치하세요:"
            log_info "1. Chocolatey: choco install act-cli"
            log_info "2. 또는 GitHub에서 직접 다운로드: https://github.com/nektos/act/releases"
            return 1
            ;;
        *)
            log_error "지원되지 않는 운영체제입니다."
            log_info "GitHub에서 직접 다운로드: https://github.com/nektos/act/releases"
            return 1
            ;;
    esac
}

# act 설치 확인
check_act() {
    log_info "act 설치 확인 중..."
    
    if command -v act >/dev/null 2>&1; then
        local version=$(act --version 2>/dev/null || echo "버전 정보 없음")
        log_success "act 설치됨 ($version)"
        return 0
    else
        log_warning "act가 설치되지 않았습니다."
        return 1
    fi
}

# Docker 이미지 미리 다운로드
setup_docker_images() {
    log_info "GitHub Actions Docker 이미지 다운로드 중..."
    
    local images=(
        "ghcr.io/catthehacker/ubuntu:act-latest"
        "ghcr.io/catthehacker/ubuntu:act-22.04"
        "node:18-alpine"
    )
    
    for image in "${images[@]}"; do
        log_info "이미지 다운로드: $image"
        if docker pull "$image"; then
            log_success "다운로드 완료: $image"
        else
            log_warning "다운로드 실패: $image"
        fi
    done
}

# 프로젝트 설정 파일 생성
create_project_config() {
    log_info "프로젝트 설정 파일 생성 중..."
    
    # .local-actions 디렉토리 생성
    local config_dir=".local-actions"
    if [[ ! -d "$config_dir" ]]; then
        mkdir -p "$config_dir"
        log_success "디렉토리 생성: $config_dir"
    fi
    
    # .actrc 파일 생성 (act 설정)
    cat > .actrc << 'EOF'
# act 기본 설정
--container-architecture linux/amd64
--artifact-server-path .local-actions/artifacts
--env-file .local-actions/.env
--secret-file .local-actions/secrets
EOF
    log_success ".actrc 설정 파일 생성"
    
    # .gitignore에 로컬 액션 디렉토리 추가
    if [[ -f ".gitignore" ]]; then
        if ! grep -q ".local-actions" .gitignore; then
            echo "" >> .gitignore
            echo "# Local GitHub Actions testing" >> .gitignore
            echo ".local-actions/" >> .gitignore
            echo ".actrc" >> .gitignore
            log_success ".gitignore에 로컬 액션 항목 추가"
        fi
    fi
}

# package.json에 스크립트 추가
add_npm_scripts() {
    log_info "package.json에 스크립트 추가 중..."
    
    if [[ -f "package.json" ]]; then
        # 임시로 Node.js를 사용하여 package.json 수정
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (!pkg.scripts) pkg.scripts = {};
        
        // 로컬 액션 스크립트 추가
        const newScripts = {
            'actions:init': 'node scripts/local-github-actions.js init',
            'actions:list': 'node scripts/local-github-actions.js list',
            'actions:validate': 'node scripts/local-github-actions.js validate',
            'actions:run': 'node scripts/local-github-actions.js run',
            'actions:test': 'node scripts/local-github-actions.js run .github/workflows/auto-publish.yml workflow_dispatch --dry-run'
        };
        
        let added = false;
        Object.entries(newScripts).forEach(([key, value]) => {
            if (!pkg.scripts[key]) {
                pkg.scripts[key] = value;
                added = true;
            }
        });
        
        if (added) {
            fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
            console.log('package.json 스크립트 추가 완료');
        } else {
            console.log('package.json 스크립트가 이미 존재합니다');
        }
        "
        log_success "package.json 스크립트 추가 완료"
    else
        log_warning "package.json 파일을 찾을 수 없습니다"
    fi
}

# 테스트 실행
run_test() {
    log_info "설치 테스트 실행 중..."
    
    if node scripts/local-github-actions.js list >/dev/null 2>&1; then
        log_success "로컬 GitHub Actions 서비스 정상 작동"
    else
        log_error "로컬 GitHub Actions 서비스 테스트 실패"
        return 1
    fi
}

# 메인 함수
main() {
    echo "🚀 GitHub Actions 로컬 테스트 환경 설정"
    echo "======================================="
    echo ""
    
    # 프로젝트 루트 디렉토리 확인
    if [[ ! -f "package.json" ]] || [[ ! -d ".github/workflows" ]]; then
        log_error "GitHub Actions 워크플로우가 있는 프로젝트 루트에서 실행하세요"
        exit 1
    fi
    
    # Docker 확인
    if ! check_docker; then
        log_error "Docker를 설치하고 실행한 후 다시 시도하세요"
        log_info "Docker 설치: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    # act 설치 확인 및 설치
    if ! check_act; then
        log_info "act 설치를 시작합니다..."
        if ! install_act; then
            log_error "act 설치에 실패했습니다"
            exit 1
        fi
        
        # 설치 후 재확인
        if ! check_act; then
            log_error "act 설치 확인에 실패했습니다"
            exit 1
        fi
    fi
    
    # Docker 이미지 설정
    setup_docker_images
    
    # 프로젝트 설정
    create_project_config
    add_npm_scripts
    
    # 로컬 GitHub Actions 서비스 초기화
    log_info "로컬 GitHub Actions 서비스 초기화 중..."
    node scripts/local-github-actions.js init
    
    # 테스트 실행
    run_test
    
    # 완료 메시지
    echo ""
    echo "🎉 설정 완료!"
    echo "============="
    echo ""
    log_success "GitHub Actions 로컬 테스트 환경이 준비되었습니다"
    echo ""
    echo "📚 사용 방법:"
    echo "  pnpm actions:list                    # 워크플로우 목록 조회"
    echo "  pnpm actions:validate <workflow>     # 워크플로우 검증"
    echo "  pnpm actions:run <workflow>          # 워크플로우 실행"
    echo "  pnpm actions:test                    # 테스트 실행"
    echo ""
    echo "📁 설정 파일:"
    echo "  .local-actions/secrets               # 시크릿 설정"
    echo "  .local-actions/.env                  # 환경변수 설정"
    echo "  .actrc                               # act 기본 설정"
    echo ""
    echo "🔗 더 많은 정보:"
    echo "  https://github.com/nektos/act"
    echo "  node scripts/local-github-actions.js --help"
}

# 스크립트 실행
main "$@"