#!/bin/bash

# Claude Agent 워크플로우 수동 실행 스크립트
# gh CLI 없이 GitHub API 직접 호출

echo "로판 자동 연재 워크플로우 실행"
echo "================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 기본값
GENERATION_MODE=${1:-auto}
CREATIVITY_LEVEL=${2:-high}

echo -e "${YELLOW}설정:${NC}"
echo "  - 생성 모드: $GENERATION_MODE"
echo "  - 창의성: $CREATIVITY_LEVEL"
echo ""

# GitHub 정보
OWNER="jhlee0409"
REPO="ro-fi"
WORKFLOW_FILE="pure-claude-code-generation.yml"

# GitHub Token 확인
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}오류: GITHUB_TOKEN이 설정되지 않았습니다.${NC}"
    echo ""
    echo "해결 방법:"
    echo "1. GitHub에서 Personal Access Token 생성:"
    echo "   https://github.com/settings/tokens"
    echo ""
    echo "2. 다음 권한 체크:"
    echo "   - repo (전체)"
    echo "   - workflow"
    echo ""
    echo "3. 토큰 설정:"
    echo "   export GITHUB_TOKEN='your-token-here'"
    echo ""
    exit 1
fi

echo -e "${GREEN}GitHub Token 확인됨${NC}"
echo ""

# API 호출
echo "워크플로우 실행 중..."
RESPONSE=$(curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$WORKFLOW_FILE/dispatches \
  -d "{\"ref\":\"main\",\"inputs\":{\"generation_mode\":\"$GENERATION_MODE\",\"creativity_level\":\"$CREATIVITY_LEVEL\"}}" \
  -s -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "204" ]; then
    echo -e "${GREEN}워크플로우가 성공적으로 시작되었습니다!${NC}"
    echo ""
    echo "확인 방법:"
    echo "   https://github.com/$OWNER/$REPO/actions"
    echo ""
    echo "로판 자동 생성이 곧 시작됩니다!"
else
    echo -e "${RED}오류 발생 (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
    echo ""
    echo "일반적인 문제:"
    echo "- 401: 토큰이 잘못되었거나 권한 부족"
    echo "- 404: 저장소나 워크플로우를 찾을 수 없음"
    echo "- 422: 입력 값이 잘못됨"
fi