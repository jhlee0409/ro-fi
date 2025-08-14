#!/bin/bash

# 프로젝트 정리 스크립트
# 안전하게 불필요한 파일들을 제거합니다

set -euo pipefail

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 타임스탬프
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=".cleanup-backup-$TIMESTAMP"

echo -e "${BLUE}🧹 프로젝트 정리 스크립트${NC}"
echo -e "${BLUE}========================${NC}\n"

# 백업 디렉토리 생성
echo -e "${YELLOW}📦 백업 디렉토리 생성: $BACKUP_DIR${NC}"
mkdir -p "$BACKUP_DIR"

# 정리 대상 파일 목록
declare -a CLEANUP_TARGETS=(
    ".local-actions/logs"
    "logs"
    "dist"
    "coverage"
    ".github/workflows/auto-publish-local.yml"
    ".github/workflows/auto-publish-standalone.yml"
)

# 크기 계산
total_size=0
echo -e "\n${BLUE}📊 정리 대상 분석:${NC}"
for target in "${CLEANUP_TARGETS[@]}"; do
    if [ -e "$target" ]; then
        size=$(du -sh "$target" 2>/dev/null | cut -f1)
        echo -e "  - $target: ${YELLOW}$size${NC}"
        
        # 백업 생성
        if [ -d "$target" ]; then
            cp -r "$target" "$BACKUP_DIR/" 2>/dev/null || true
        else
            cp "$target" "$BACKUP_DIR/" 2>/dev/null || true
        fi
    fi
done

# 사용자 확인
echo -e "\n${YELLOW}⚠️  위 파일들을 정리하시겠습니까? (y/N)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "\n${GREEN}🗑️  파일 정리 시작...${NC}"
    
    # 로그 디렉토리 정리
    if [ -d ".local-actions/logs" ]; then
        echo -e "  정리: .local-actions/logs"
        rm -rf .local-actions/logs/*
        echo "정리 완료: $(date)" > .local-actions/logs/.cleaned
    fi
    
    if [ -d "logs" ]; then
        echo -e "  정리: logs"
        rm -rf logs/*
        echo "정리 완료: $(date)" > logs/.cleaned
    fi
    
    # 빌드 아티팩트 제거
    if [ -d "dist" ]; then
        echo -e "  제거: dist"
        rm -rf dist
    fi
    
    if [ -d "coverage" ]; then
        echo -e "  제거: coverage"
        rm -rf coverage
    fi
    
    # 중복 워크플로우 제거
    if [ -f ".github/workflows/auto-publish-local.yml" ]; then
        echo -e "  제거: auto-publish-local.yml"
        rm -f .github/workflows/auto-publish-local.yml
    fi
    
    if [ -f ".github/workflows/auto-publish-standalone.yml" ]; then
        echo -e "  제거: auto-publish-standalone.yml"
        rm -f .github/workflows/auto-publish-standalone.yml
    fi
    
    # .gitignore 업데이트 확인
    echo -e "\n${BLUE}📝 .gitignore 확인...${NC}"
    
    # 필요한 패턴들이 .gitignore에 있는지 확인
    declare -a GITIGNORE_PATTERNS=(
        "dist/"
        "coverage/"
        "*.log"
        ".local-actions/"
        "logs/"
    )
    
    for pattern in "${GITIGNORE_PATTERNS[@]}"; do
        if ! grep -q "^$pattern" .gitignore 2>/dev/null; then
            echo -e "  추가: $pattern"
            echo "$pattern" >> .gitignore
        fi
    done
    
    echo -e "\n${GREEN}✅ 정리 완료!${NC}"
    echo -e "${BLUE}백업 위치: $BACKUP_DIR${NC}"
    
    # 정리 후 상태
    echo -e "\n${BLUE}📊 정리 후 프로젝트 크기:${NC}"
    du -sh . | grep -v node_modules
    
else
    echo -e "${RED}❌ 정리 취소됨${NC}"
    rm -rf "$BACKUP_DIR"
    exit 0
fi

echo -e "\n${YELLOW}💡 팁: 백업을 삭제하려면 다음 명령어를 사용하세요:${NC}"
echo -e "  rm -rf $BACKUP_DIR"