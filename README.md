# 🌹 RO-FAN: AI 로맨스 판타지 자동 연재 플랫폼

> **100% 자동화된 AI 로맨스 판타지 소설 연재 시스템**  
> 매일 새벽 2시, AI가 자동으로 고품질 로판 에피소드를 생성합니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ro-fan)

## 🚀 빠른 시작

### 1. 설치
```bash
git clone https://github.com/your-username/ro-fan.git
cd ro-fan
pnpm install
```

### 2. API 키 설정
```bash
cp .env.example .env.local
# .env.local에 ANTHROPIC_API_KEY 추가
```

### 3. 실행
```bash
pnpm test        # 테스트 실행
pnpm dev         # 개발 서버
pnpm automation:run  # 자동화 실행
```

## 🎯 주요 기능

- **🤖 100% 자동화**: 사람 개입 없이 완전 자동 연재
- **🎨 창의성 모드 v2.1**: 독자 반응 기반 자동 품질 조절
- **📊 7개 AI 엔진**: 통합된 자동화 시스템
- **💰 저비용 운영**: 월 $50-150으로 무제한 연재

## 📚 문서

- [📖 **CLAUDE.md**](./CLAUDE.md) - 상세 기술 문서 및 아키텍처
- [✨ **PROMPT_ENHANCER.md**](./PROMPT_ENHANCER.md) - AI 프롬프트 향상 가이드
- [📝 **NOVEL_MARKDOWN_FORMAT.md**](./NOVEL_MARKDOWN_FORMAT.md) - 소설 마크다운 형식

## 💻 기술 스택

- **Frontend**: Astro.js + React + TypeScript
- **AI**: Anthropic Claude Sonnet 4
- **Automation**: GitHub Actions + 7개 AI 엔진
- **Hosting**: Vercel (무료)

## 🏗️ 프로젝트 구조

```
src/
├── lib/              # 7개 AI 자동화 엔진
├── content/          # 생성된 소설 콘텐츠
├── test/             # TDD 테스트 (87개)
└── pages/            # Astro 페이지

scripts/
└── run-automation.js # 프로덕션 자동화 스크립트
```

## 📊 현재 상태

- ✅ **v3.1 구현 완료**: 100% 자동화 시스템
- ✅ **테스트 커버리지**: 85% (74/87 테스트 통과)
- ✅ **프로덕션 준비**: GitHub Actions 자동 실행

---

자세한 내용은 [CLAUDE.md](./CLAUDE.md)를 참조하세요.