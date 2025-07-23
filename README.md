# RO-FI

자동화된 AI 로맨스 판타지 소설 연재 플랫폼

매일 새벽 2시, AI가 자동으로 소설을 연재합니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ro-fi)

## 시작하기

### 설치
```bash
git clone https://github.com/your-username/ro-fi.git
cd ro-fi
pnpm install
```

### 설정
```bash
cp .env.example .env.local
# .env.local에 ANTHROPIC_API_KEY 추가
```

### 실행
```bash
pnpm test                # 테스트
pnpm dev                 # 개발 서버
pnpm automation:run      # 자동화 실행
```

## 주요 기능

- 완전 자동 연재 시스템
- 창의성 모드 v2.1 (독자 반응 기반 품질 조절)
- 7개 AI 엔진 통합
- 저비용 운영 (월 $50-150)

## 문서

- [CLAUDE.md](./CLAUDE.md) - 기술 문서 및 아키텍처
- [PROMPT_ENHANCER.md](./PROMPT_ENHANCER.md) - AI 프롬프트 가이드
- [NOVEL_MARKDOWN_FORMAT.md](./NOVEL_MARKDOWN_FORMAT.md) - 소설 마크다운 형식

## 기술 스택

- **Frontend**: Astro.js + React + TypeScript
- **AI**: Anthropic Claude Sonnet 4
- **Automation**: GitHub Actions + 7 AI engines
- **Hosting**: Vercel

## 구조

```
src/
├── lib/              # AI 자동화 엔진
├── content/          # 생성된 소설 콘텐츠
├── test/             # TDD 테스트
└── pages/            # Astro 페이지

scripts/
└── run-automation.js # 자동화 스크립트
```

## 현재 상태

- v1.0 구현 완료
- 테스트 커버리지 85%
- GitHub Actions 자동 실행 준비

자세한 내용은 [CLAUDE.md](./CLAUDE.md)를 참조하세요.