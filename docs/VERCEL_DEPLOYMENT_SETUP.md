# Vercel 자동 배포 설정 가이드

## 필요한 GitHub Secrets

워크플로우가 Vercel에 자동 배포하려면 다음 시크릿들이 필요합니다:

### 1. VERCEL_TOKEN
- **목적**: Vercel API 인증
- **생성 방법**:
  1. https://vercel.com/account/tokens 접속
  2. "Create Token" 클릭
  3. 토큰 이름 입력 (예: "GitHub Actions")
  4. "Create" 클릭
  5. 생성된 토큰 복사

### 2. VERCEL_ORG_ID
- **목적**: Vercel 조직/계정 식별
- **찾는 방법**:
  1. https://vercel.com/account 접속
  2. Settings → General
  3. "Team ID" 또는 "Personal Account ID" 복사

### 3. VERCEL_PROJECT_ID
- **목적**: 특정 프로젝트 식별
- **찾는 방법**:
  1. Vercel 대시보드에서 프로젝트 클릭
  2. Settings → General
  3. "Project ID" 복사

## GitHub에 시크릿 추가하기

1. GitHub 저장소로 이동
2. Settings → Secrets and variables → Actions
3. "New repository secret" 클릭
4. 각 시크릿 추가:
   - Name: `VERCEL_TOKEN`
   - Secret: [Vercel에서 복사한 토큰]
   
   - Name: `VERCEL_ORG_ID`
   - Secret: [Vercel에서 복사한 조직 ID]
   
   - Name: `VERCEL_PROJECT_ID`
   - Secret: [Vercel에서 복사한 프로젝트 ID]

## 자동 배포 프로세스

1. **소설 생성**: Gemini API가 새 콘텐츠 생성
2. **Git 커밋**: 생성된 파일을 GitHub에 푸시
3. **Vercel 배포**: 자동으로 빌드하고 배포
4. **라이브 사이트**: https://ro-fi.vercel.app 에서 확인

## 테스트 방법

```bash
# 로컬에서 테스트
pnpm ai-novel:new

# GitHub Actions에서 테스트
GitHub → Actions → "Gemini API 로맨스 판타지 자동 연재" → Run workflow
```

## 트러블슈팅

### Vercel 배포 실패시
- GitHub 푸시는 성공했으므로 Vercel이 자동 감지하여 배포할 수 있음
- Vercel 대시보드에서 수동으로 "Redeploy" 가능
- Vercel 로그 확인: https://vercel.com/[your-username]/ro-fi

### 빌드 실패시
- `npm run build` 명령어가 로컬에서 작동하는지 확인
- `package.json`의 build 스크립트 확인
- Astro 버전 및 의존성 확인