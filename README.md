# RO-FI

🌟 **완전 새로운 Gemini API 기반 로맨스 판타지 자동 연재 시스템**

매일 자동으로 고품질 로맨스 판타지 소설을 연재하는 100% Gemini AI 기반 플랫폼

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ro-fi)

## 🚀 새로운 시스템 특징

- **100% Gemini API 직접 호출** (@google/generative-ai)
- **스마트 우선순위 로직** (완결 > 연재 > 신규)
- **GitHub Actions 완전 자동화**
- **프로덕션 품질 로맨스 판타지 생성**
- **고품질 메타데이터 자동 관리**
- **Gemini의 긴 컨텍스트와 빠른 응답 활용**

## 🎯 시작하기

### 1. 설치
```bash
git clone https://github.com/your-username/ro-fi.git
cd ro-fi
pnpm install
```

### 2. 환경 설정
```bash
# GitHub Secrets에 GEMINI_API_KEY 설정 (필수)
# Gemini API 키를 GitHub 레포지토리 Settings > Secrets에 추가
```

### 3. 시스템 테스트
```bash
# 로컬에서 시스템 확인
ANTHROPIC_API_KEY=your_key_here pnpm ai-novel:system-test

# 드라이런 테스트
ANTHROPIC_API_KEY=your_key_here pnpm ai-novel:test
```

### 4. 수동 실행 (로컬)
```bash
# 자동 모드
ANTHROPIC_API_KEY=your_key_here pnpm ai-novel:auto

# 새 소설 생성
ANTHROPIC_API_KEY=your_key_here pnpm ai-novel:new

# 기존 소설 연재
ANTHROPIC_API_KEY=your_key_here pnpm ai-novel:continue

# 소설 완결
ANTHROPIC_API_KEY=your_key_here pnpm ai-novel:complete
```

## ✨ 새로운 시스템 주요 기능

### 🧠 지능형 자동화
- **스마트 우선순위 로직**: 완결 > 연재 > 신규 순서로 자동 판단
- **현재 상황 분석**: 기존 소설 상태, 업데이트 필요성 자동 감지
- **창의성 레벨 조절**: low/medium/high 3단계 창의성 제어

### 📚 고품질 콘텐츠 생성
- **로맨스 판타지 전용**: 16가지 핵심 트로프 활용
- **프로덕션 품질**: 4,000-6,000자 고밀도 스토리텔링
- **감정적 깊이**: 독자 몰입도 극대화 스토리 구조
- **완벽한 연속성**: 기존 캐릭터/플롯 일관성 보장

### 🔄 완전 자동화 워크플로우
- **정기 실행**: 하루 3회 자동 연재 (KST 11:00, 15:30, 21:00)
- **수동 실행**: workflow_dispatch로 언제든 실행 가능
- **Git 자동화**: 커밋/푸시 완전 자동 처리
- **에러 복구**: 실패시 자동 이슈 생성 및 알림

### 🎯 다양한 실행 모드
- **auto**: 상황에 따른 최적 액션 자동 선택
- **new_novel**: 새로운 독창적 소설 생성
- **continue_chapter**: 기존 소설 연재 계속
- **complete_novel**: 감동적인 완결 처리

## 문서

- [CLAUDE.md](./CLAUDE.md) - 기술 문서 및 아키텍처
- [PROMPT_ENHANCER.md](./PROMPT_ENHANCER.md) - AI 프롬프트 가이드
- [NOVEL_MARKDOWN_FORMAT.md](./NOVEL_MARKDOWN_FORMAT.md) - 소설 마크다운 형식

## 🔧 기술 스택

### 새로운 AI 시스템
- **AI Engine**: Claude 3.5 Sonnet (@anthropic-ai/sdk 0.56.0)
- **API 방식**: 100% 직접 호출 (Claude Code Actions 미사용)
- **자동화**: GitHub Actions 네이티브 워크플로우
- **언어**: Node.js + ES Modules

### 기존 웹 플랫폼  
- **Frontend**: Astro.js + React + TypeScript
- **UI**: Radix UI + Tailwind CSS
- **Content**: Gray Matter (마크다운 처리)
- **Hosting**: Vercel

## 📁 새로운 프로젝트 구조

```
📦 ro-fi/
├── 🤖 AI 자동화 시스템 (NEW!)
│   ├── .github/workflows/
│   │   └── ai-romance-novel-automation.yml  # 메인 워크플로우
│   └── scripts/
│       ├── ai-novel-generator.js            # Claude API 직접 호출
│       └── test-ai-system.js                # 시스템 테스트
│
├── 📚 콘텐츠 관리
│   └── src/content/
│       ├── novels/                          # 소설 메타데이터
│       └── chapters/                        # 챕터 콘텐츠
│
├── 🌐 웹 플랫폼
│   ├── src/pages/                          # Astro 페이지
│   ├── src/components/                     # React 컴포넌트
│   └── src/layouts/                        # 레이아웃
│
└── 📝 자동 로그
    └── logs/                               # 실행 로그
```

## 🎉 시스템 상태

### v1.0 완전 새로운 시스템 ✅
- ✅ Claude API 직접 호출 시스템 완료
- ✅ GitHub Actions 자동화 완료  
- ✅ 스마트 우선순위 로직 완료
- ✅ 고품질 로맨스 판타지 생성 완료
- ✅ Git 자동 커밋/푸시 완료
- ✅ 에러 처리 및 로깅 완료

### 💡 실행 준비 완료
- 🔑 **설정 필요**: GitHub Secrets에 `ANTHROPIC_API_KEY` 추가
- ⚡ **즉시 실행 가능**: 워크플로우 완전 준비
- 📊 **모니터링**: 상세 로그 및 에러 알림 완비

## 🚀 빠른 시작

1. **API 키 설정**: GitHub Settings > Secrets > `ANTHROPIC_API_KEY` 추가
2. **워크플로우 실행**: Actions 탭에서 수동 실행 또는 자동 스케줄 대기
3. **결과 확인**: `src/content/` 폴더에서 생성된 소설/챕터 확인

자세한 설정 가이드는 [CLAUDE.md](./CLAUDE.md)를 참조하세요.