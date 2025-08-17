#!/bin/bash

# Gemini AI 로맨스 판타지 자동 생성 로컬 테스트 스크립트
# GitHub Actions의 ai-story-generation-pipeline.yml 로직을 로컬에서 테스트

echo "🚀 Gemini AI 로맨스 판타지 자동 생성 로컬 테스트 시작"
echo "======================================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
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

# 1. 환경 변수 확인
log_info "API 키 상태 확인"
if [ -n "$GEMINI_API_KEY" ]; then
    log_success "GEMINI_API_KEY 설정됨"
else
    log_error "GEMINI_API_KEY 없음"
    echo "환경 변수에 GEMINI_API_KEY를 설정해주세요:"
    echo "export GEMINI_API_KEY='your-api-key-here'"
    exit 1
fi

# 2. 의존성 확인
log_info "의존성 확인 중..."
if ! command -v node &> /dev/null; then
    log_error "Node.js가 설치되어 있지 않습니다"
    exit 1
fi

if [ ! -f "scripts/ai-novel-generator.js" ]; then
    log_error "AI 생성 스크립트를 찾을 수 없습니다"
    exit 1
fi

log_success "환경 설정 완료"

# 3. Gemini AI 로맨스 판타지 자동 생성 (GitHub Actions 로직 복제)
log_info "Gemini AI를 사용한 로맨스 판타지 자동 생성 시작"

# 최대 3번 재시도 (GitHub Actions와 동일)
max_attempts=3
attempt=1

while [ $attempt -le $max_attempts ]; do
    log_info "시도 $attempt/$max_attempts"
    
    if node scripts/ai-novel-generator.js --mode auto --creativity high --verbose; then
        log_success "Gemini AI 생성 성공"
        break
    else
        log_warning "시도 $attempt 실패"
        if [ $attempt -lt $max_attempts ]; then
            log_info "30초 후 재시도..."
            sleep 30
        else
            log_error "최대 재시도 횟수 초과. 실패"
            exit 1
        fi
    fi
    
    attempt=$((attempt + 1))
done

log_success "Gemini AI 생성 완료"

# 4. AI 이미지 생성 및 저장 (GitHub Actions 로직 복제)
log_info "소설 이미지 자동 생성 시작"

# 새로 생성된 소설들 찾기
if [ -d ".git" ]; then
    new_novels=$(find src/content/novels/ -name "*.md" -newer .git/COMMIT_EDITMSG 2>/dev/null | head -5)
else
    # Git이 없는 경우 최근 5개 파일
    new_novels=$(find src/content/novels/ -name "*.md" -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -5 | cut -d' ' -f2-)
fi

if [ -n "$new_novels" ]; then
    log_info "새 소설에 대한 이미지 생성 시작"
    
    # public/images 디렉토리 생성
    mkdir -p public/images/novels
    mkdir -p public/images/chapters
    
    for novel_file in $new_novels; do
        # 소설 slug 추출
        novel_slug=$(basename "$novel_file" .md)
        log_info "이미지 생성 중: $novel_slug"
        
        # 이미지 생성 실행
        if [ -f "scripts/generate-images-for-novel.js" ]; then
            if node scripts/generate-images-for-novel.js "$novel_slug" --save-to-public; then
                log_success "이미지 생성 성공: $novel_slug"
            else
                log_warning "이미지 생성 실패: $novel_slug (계속 진행)"
            fi
        else
            log_warning "이미지 생성 스크립트를 찾을 수 없습니다"
        fi
        
        # API 속도 제한 방지
        sleep 5
    done
else
    log_info "새 소설이 없어 이미지 생성 생략"
fi

# 기존 소설 중 이미지가 없는 것들도 처리
log_info "기존 소설 이미지 확인 중..."
all_novels=$(find src/content/novels/ -name "*.md" 2>/dev/null)

for novel_file in $all_novels; do
    novel_slug=$(basename "$novel_file" .md)
    
    # 이미지 파일 존재 확인
    if [ ! -f "public/images/novels/${novel_slug}-cover.webp" ] && [ ! -f "public/images/novels/${novel_slug}-cover.jpg" ]; then
        log_info "누락된 이미지 생성: $novel_slug"
        
        if [ -f "scripts/generate-images-for-novel.js" ]; then
            if node scripts/generate-images-for-novel.js "$novel_slug" --save-to-public --quiet; then
                log_success "이미지 생성 완료: $novel_slug"
            else
                log_warning "이미지 생성 실패: $novel_slug (건너뛰기)"
            fi
        fi
        
        sleep 3
    fi
done

log_success "이미지 생성 완료"

# 5. 생성 결과 확인 및 요약 (GitHub Actions 로직 복제)
log_info "로맨스 판타지 자동 연재 확인"

# 새로 생성된 파일들 확인
if [ -d ".git" ]; then
    new_novels=$(find src/content/novels/ -name "*.md" -newer .git/COMMIT_EDITMSG 2>/dev/null || echo "")
    new_chapters=$(find src/content/chapters/ -name "*.md" -newer .git/COMMIT_EDITMSG 2>/dev/null || echo "")
else
    # Git이 없는 경우 최근 수정된 파일들
    new_novels=$(find src/content/novels/ -name "*.md" -mtime -1 2>/dev/null || echo "")
    new_chapters=$(find src/content/chapters/ -name "*.md" -mtime -1 2>/dev/null || echo "")
fi

if [ -n "$new_novels" ] || [ -n "$new_chapters" ]; then
    log_success "새 콘텐츠 생성 확인됨"
    
    if [ -n "$new_novels" ]; then
        echo "새 소설: $new_novels"
    fi
    
    if [ -n "$new_chapters" ]; then
        echo "새 챕터: $new_chapters"
        
        # 가장 최근 챕터의 글자 수 확인
        latest_chapter=$(echo "$new_chapters" | head -1)
        if [ -f "$latest_chapter" ]; then
            char_count=$(wc -m < "$latest_chapter" | tr -d ' ')
            log_info "챕터 글자 수: $char_count"
            
            if [ "$char_count" -ge 3000 ] && [ "$char_count" -le 6000 ]; then
                log_success "적절한 분량"
            else
                log_warning "분량 확인 필요"
            fi
        fi
    fi
else
    log_info "새 콘텐츠가 생성되지 않았을 수도 있음 (정상 동작일 수 있음)"
fi

# 전체 연재 현황 요약
total_novels=$(find src/content/novels/ -name "*.md" 2>/dev/null | wc -l)
total_chapters=$(find src/content/chapters/ -name "*.md" 2>/dev/null | wc -l)
total_images=$(find public/images/ -name "*.jpg" -o -name "*.webp" -o -name "*.png" 2>/dev/null | wc -l)

echo ""
echo "=========================================="
echo "AI 로맨스 판타지 자동 연재 테스트 완료"
echo "=========================================="
echo ""
echo "실행 시간: $(date '+%Y-%m-%d %H:%M:%S KST')"
echo "AI 엔진: Gemini AI"
echo ""
echo "전체 현황:"
echo "  소설: ${total_novels}편"
echo "  챕터: ${total_chapters}화"
echo "  이미지: ${total_images}개"
echo ""
echo "✨ Gemini AI 자동 연재 시스템 테스트 완료!"
echo "최고 품질의 로맨스 판타지를 선사합니다"
echo ""