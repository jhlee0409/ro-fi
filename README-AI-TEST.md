# Gemini AI 로맨스 판타지 자동 생성 로컬 테스트

GitHub Actions의 `ai-story-generation-pipeline.yml`에서 실행되는 Gemini AI 로맨스 판타지 자동 생성을 로컬에서 테스트할 수 있습니다.

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.ai-test .env.local

# Gemini API 키 설정
echo "GEMINI_API_KEY=your-actual-api-key-here" > .env.local
```

### 2. 로컬 스크립트 실행

```bash
# 환경 변수 로드
source .env.local

# AI 생성 테스트 실행
./scripts/test-ai-generation.sh
```

### 3. Docker를 사용한 테스트 (권장)

```bash
# 환경 변수 설정
export GEMINI_API_KEY="your-actual-api-key-here"

# Docker Compose로 테스트 환경 실행
docker-compose -f docker-compose.ai-test.yml up -d

# 컨테이너 접속하여 테스트
docker exec -it ro-fi-ai-generator bash

# 컨테이너 내에서 AI 생성 테스트
./scripts/test-ai-generation.sh
```

## 📋 테스트 내용

GitHub Actions 워크플로우의 다음 단계들을 로컬에서 재현합니다:

### 1. Gemini AI 로맨스 판타지 자동 생성
- `node scripts/ai-novel-generator.js --mode auto --creativity high --verbose`
- 최대 3번 재시도 로직
- 30초 대기 후 재시도

### 2. AI 이미지 생성 및 저장
- 새로 생성된 소설에 대한 이미지 자동 생성
- `public/images/novels/` 및 `public/images/chapters/` 디렉토리에 저장
- 기존 소설 중 이미지가 없는 것들도 처리

### 3. 생성 결과 확인
- 새 콘텐츠 확인 (소설, 챕터)
- 글자 수 검증 (3,000-6,000자)
- 전체 현황 요약

## 🔧 고급 사용법

### 수동으로 단계별 실행

```bash
# 1. Gemini AI 소설/챕터 생성만
node scripts/ai-novel-generator.js --mode auto --creativity high --verbose

# 2. 특정 소설의 이미지 생성만
node scripts/generate-images-for-novel.js "novel-slug-here" --save-to-public

# 3. 모든 소설의 이미지 생성
find src/content/novels/ -name "*.md" -exec basename {} .md \; | while read slug; do
  node scripts/generate-images-for-novel.js "$slug" --save-to-public --quiet
  sleep 3
done
```

### Docker 컨테이너 내에서 개별 테스트

```bash
# 컨테이너 실행
docker-compose -f docker-compose.ai-test.yml up -d ai-story-generator

# 컨테이너 접속
docker exec -it ro-fi-ai-generator bash

# 개별 명령어 실행
node scripts/ai-novel-generator.js --help
node scripts/generate-images-for-novel.js --help
```

## 📊 모니터링

### 콘텐츠 모니터링 서비스

```bash
# 콘텐츠 모니터링 시작
docker-compose -f docker-compose.ai-test.yml up -d content-monitor

# 모니터링 로그 확인
docker logs -f ro-fi-content-monitor
```

### 실시간 로그 확인

```bash
# AI 생성 로그
docker logs -f ro-fi-ai-generator

# 파일 변화 감지
watch -n 5 'find src/content -name "*.md" | wc -l'
```

## 🛠️ 문제 해결

### API 키 관련 오류
```bash
# API 키 확인
echo $GEMINI_API_KEY

# 환경 변수 재설정
export GEMINI_API_KEY="your-actual-api-key-here"
```

### 의존성 오류
```bash
# 컨테이너 내에서 의존성 재설치
docker exec -it ro-fi-ai-generator pnpm install
```

### 권한 오류
```bash
# 스크립트 실행 권한 부여
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

## 📁 생성된 파일 위치

- **소설**: `src/content/novels/*.md`
- **챕터**: `src/content/chapters/*.md`
- **소설 커버 이미지**: `public/images/novels/*-cover.jpg`
- **챕터 이미지**: `public/images/chapters/*-ch*.jpg`
- **로그**: `logs/`

## 🔍 테스트 성공 지표

✅ **정상 동작 확인사항:**
- Gemini API 연결 성공
- 새로운 소설/챕터 생성 확인
- 이미지 자동 생성 확인
- 적절한 글자 수 (3,000-6,000자)
- 에러 없이 완료

## 🚫 주의사항

- **API 키 보안**: `.env.local` 파일은 절대 Git에 커밋하지 마세요
- **API 제한**: Gemini API의 사용량 제한을 확인하세요
- **파일 백업**: 테스트 전 기존 콘텐츠를 백업하세요
- **네트워크**: 안정적인 인터넷 연결이 필요합니다

이 테스트 환경을 통해 GitHub Actions 배포 전에 로컬에서 안전하게 AI 생성 기능을 검증할 수 있습니다.