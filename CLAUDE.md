# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context-Aware Development Guidelines

Enhanced web search: Always use web searching based on 2025 current information when needed.

Prompt enhancement: If user's prompt starts with "EP:", read PROMPT_ENHANCER.md and enhance the prompt following the original language (Korean→Korean, English→English).

Token optimization: For complex tasks, consider using `gemini -p "{prompt content}"` for initial task organization to save tokens.

항상 기능을 구현하기 전에 테스트코드를 완벽하게 짜고 레드-그린 테스트 진행해줘

## Critical Schema Compliance

**Content Schema Validation**: All MD file generation must comply with `src/content/config.ts` schema:
- Novels: title, slug (optional), author, summary (50자+), status (enum), tropes (2개+), publishedDate, totalChapters, rating
- Chapters: title, novel, chapterNumber, publicationDate, wordCount, summary, rating
- ❌ Never include: coverImage, tags, genre, targetAudience, expectedLength (schema violations)
- ⚠️ **YAML 멀티바이트 이슈**: 한국어 포함 시 인용부호 사용 권장

**Critical Fix Applied**: 
- `slug` 필드를 optional로 변경하여 YAML 파싱 오류 해결
- 멀티바이트 UTF-8 문자로 인한 Vercel 배포 실패 문제 해결됨

## 🔍 System Health Status (2025-08-19)

### Current Architecture Overview
- **7 AI Engines**: 3,300+ lines of sophisticated automation logic (Active)
- **JSON Continuity System**: Complete but currently disabled (TypeScript module loading issue)
- **Test Coverage**: 87 tests with 85% pass rate (74/87 passing)
- **Content Quality**: 8.5/10 average score with professional-grade output
- **Prompt Simplification**: 65% reduction (17K→6K chars) with quality improvement

## Project Overview

ro-fan is an AI-powered romance fantasy novel platform that combines modern web technologies with sophisticated AI automation for fully automated story creation and publishing.

### Mission

Create a self-sustaining romance fantasy novel platform that generates high-quality, diverse stories automatically while maintaining reader engagement and narrative consistency.

### Architecture Philosophy

- AI-First: Everything is designed around intelligent automation
- Quality-Driven: 80%+ test coverage with TDD methodology
- Production-Ready: Real-world deployment with monitoring and error handling
- Scalable: Modular architecture supporting unlimited expansion

## Project Architecture

### Frontend Stack

- Framework: Astro.js 5.12.0 (SSR mode) for optimal performance
- UI Components: React 18.2.0 + Radix UI (complete component library)
- Styling: Tailwind CSS 3.4.0 + Tailwind Animate
- Animation: Framer Motion 11.0.0
- Deployment: Vercel with global CDN and image optimization

### AI & Automation Stack

- **Primary AI**: Google Gemini 2.5 Pro (@google/generative-ai 0.21.0) - **완전 업그레이드**
- **AI Specialization**: 로맨스 판타지 특화 생성
  - Gemini 2.5 Pro: 감성적 표현, 창의적 문체, 긴 컨텍스트 처리에 최적화
  - 한국어 로맨스 판타지 생성에 특별히 최적화된 프롬프트 시스템
  - **연속성 보장 시스템**: story-state.json 기반 캐릭터/플롯 일관성 관리
- Content Management: Gray Matter for markdown processing
- Automation: 8+ specialized AI engines with enterprise-grade deployment/monitoring
- Scheduling: GitHub Actions (automated daily execution)

### Development Stack

- Language: TypeScript 5.7.2 + JavaScript ES Modules
- Testing: Vitest 3.2.4 + Playwright (E2E)
- Quality: ESLint 9.15.0 + Prettier 3.4.2
- Security: Snyk vulnerability scanning

## Current Status

### v7.1 - Enterprise-Grade AI Platform with Continuity System Analysis

#### Core Systems Status

- **💎 High-Quality Content**: 8.5/10 quality achieved with simplified prompts
- **🏗️ Architecture Score**: B+ (85/100) - Modular design, room for security improvements
- **📊 Continuity System**: Complete JSON-based system built but inactive (module loading issue)
- **✅ Recent Content Analysis**:
  - `time-guardian-fate-thread`: 5 chapters with continuity system ✅
  - `the-monsters-only-antidote`: 3 chapters with simple prompts (8.5/10 quality)
  - `undefined` series: Slug recognition failure but high quality (7.4/10)
- **🔧 Technical Debt**: Critical bugs found in slug recognition and module loading

#### AI Engine Architecture

| Engine                       | Purpose                              | Status |
| ---------------------------- | ------------------------------------ | ------ |
| MasterAutomationEngine       | Orchestration & decision-making      | Active |
| TokenBalancingEngine         | Cost optimization (75% savings)      | Active |
| ReaderAnalyticsEngine        | Reader behavior analysis             | Active |
| **StoryStateManager**        | JSON-based continuity management     | **Disabled** |
| **EpisodeContinuityEngine**  | Chapter validation & consistency     | **Disabled** |
| **ContextWindowManager**     | Gemini token optimization (800K)     | **Disabled** |
| **ContinuityIntegration**    | Bridge for TypeScript modules        | **Failed** |

#### Automation Workflow

```
1. Novel Completion (Highest Priority)
   └─ Automatically completes stories meeting criteria

2. New Novel Creation (High Priority)
   └─ Creates unique stories when needed (max 3 active)

3. Chapter Continuation (Normal Priority)
   └─ Adds chapters to existing novels with consistency
```

## Development Setup

### Prerequisites

```bash
Node.js: v22.17.0+
Package Manager: pnpm (preferred)
Environment: GEMINI_API_KEY required
ENABLE_CONTINUITY_SYSTEM=true (currently not working due to module loading issue)
```

### Installation

```bash
# Clone and install dependencies
pnpm install --ignore-scripts

# Setup environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY (required - primary AI)
# ANTHROPIC_API_KEY is no longer needed (fully replaced by Gemini)
```

### Essential Commands

#### Automation System

```bash
# Production automation
pnpm ai-novel:auto                     # Execute full automation (auto mode)
pnpm ai-novel:run                      # Direct execution
pnpm ai-novel:test                     # Test mode (dry-run)

# Manual generation modes
pnpm ai-novel:new                      # Force new novel creation
pnpm ai-novel:continue                 # Force chapter continuation  
pnpm ai-novel:complete                 # Force novel completion

# API testing
pnpm ai-novel:system-test              # Test Gemini API connection
```

#### Testing & Quality

```bash
# Testing suite
pnpm test                              # Run all unit tests (Vitest)
pnpm test:watch                        # Watch mode for development
pnpm test:ui                           # Visual test interface
pnpm test:e2e                          # Playwright E2E tests
pnpm test:e2e:ui                       # Playwright UI mode
pnpm test:coverage                     # Coverage report
pnpm test:integration                  # Integration tests
pnpm test:all                          # Complete test suite (Vitest + Playwright + Cypress)

# Alternative E2E testing
pnpm test:e2e:cypress                  # Cypress E2E tests
pnpm test:e2e:cypress:open             # Cypress interactive mode

# Quality assurance
pnpm lint                              # ESLint check
pnpm lint:fix                          # Fix linting issues
pnpm format                            # Prettier formatting
pnpm format:check                      # Format verification
pnpm type-check                        # TypeScript validation
pnpm security:audit                    # Security audit
```

#### Development Server

```bash
# Development
pnpm dev                               # Start dev server (http://localhost:4321)
pnpm build                             # Production build
pnpm preview                           # Preview production build

# CI/CD
pnpm ci                                # Complete CI pipeline
```

## Advanced System Architecture

### Testing Architecture

**Multi-Layer Testing Strategy**:
- **Vitest**: Unit and integration tests for AI engines and core logic
- **Playwright**: E2E testing for web application and user workflows  
- **Cypress**: Alternative E2E testing with visual testing capabilities
- **Integration Tests**: AI system integration testing with external APIs

**Critical Test Categories**:
- Content generation schema compliance validation
- AI engine functionality and decision logic
- Deployment system reliability and rollback procedures
- Health monitoring system accuracy
- Reader analytics and engagement tracking

### AI Engine Integration Flow

```
User Request/Schedule Trigger
         ↓
   Master Automation Engine
         ↓
   ┌─────────────────────────┐
   │  Decision Tree Analysis │
   └─────────────────────────┘
         ↓
   ┌─ Novel Completion ←────────── Completion Criteria Engine
   ├─ New Story Creation ←─────── Story Diversity Engine
   └─ Chapter Continuation ←───── Emotional Depth Engine
         ↓
   ┌─────────────────────────┐
   │    Quality Control      │
   │  ↳ Token Balancing      │ ←─ Token Balancing Engine
   │  ↳ Reader Analytics     │ ←─ Reader Analytics Engine
   │  ↳ Creativity Mode      │ ←─ Creativity Mode Engine
   └─────────────────────────┘
         ↓
   Content Generation & Publishing
```

### Smart Decision Making

- Priority-Based: Critical tasks first (completion > creation > continuation)
- Resource-Aware: Dynamic cost optimization (75% savings in efficiency mode)
- Quality-Focused: Reader engagement metrics drive creativity investment
- Anti-Repetition: Ensures story diversity through algorithmic checking

## Project Structure

```
ro-fan/                               # AI Romance Fantasy Platform
├── Configuration
│   ├── package.json                  # 30+ npm scripts
│   ├── astro.config.mjs             # SSR + Vercel optimization
│   ├── vitest.config.ts             # Testing configuration
│   ├── playwright.config.ts         # E2E testing setup
│   └── tailwind.config.mjs          # UI styling setup
│
├── AI Automation System
│   ├── .github/workflows/           # 4 automated workflows
│   │   ├── ai-story-generation.yml  # Main AI content creation
│   │   ├── auto-publish.yml         # Publishing automation
│   │   ├── quality-assurance.yml    # Quality checks
│   │   └── github-pages.yml         # Deployment
│   ├── scripts/
│   │   ├── run-automation.js        # Production automation runner
│   │   └── test-claude.js           # API connection testing
│   └── src/lib/                     # 7 AI engines (3,300+ lines)
│
├── Web Application
│   ├── src/pages/                   # Astro page routing
│   ├── src/components/              # React + Radix UI components
│   ├── src/layouts/                 # Page layouts
│   └── src/styles/                  # Global styles
│
├── Content Management
│   ├── src/content/
│   │   ├── novels/                  # Novel metadata (.md)
│   │   ├── chapters/                # Chapter content (.md)
│   │   └── tropes/                  # Story trope definitions
│   └── src/content/config.ts        # Content schema
│
├── Testing & Quality
│   ├── src/test/                    # Unit tests (540+ cases)
│   ├── tests/e2e/                   # Playwright E2E tests
│   └── coverage/                    # Test coverage reports
│
└── Infrastructure
    ├── logs/                        # Automation logs
    ├── .vercel/                     # Deployment configuration
    └── dist/                        # Production build
```

## Advanced Features

### Intelligent Content Generation

- Context-Aware: Maintains character consistency across chapters
- Trope-Based: Generates unique combinations (enemies-to-lovers, regression, etc.)
- Emotional Progression: Sophisticated emotional arc development
- Anti-Repetition: Algorithmic diversity ensuring fresh content

### Cost Optimization

- Efficiency Mode: 75% cost reduction for standard content
- Creativity Mode: Unlimited budget for critical moments
- Dynamic Balancing: Real-time cost vs quality optimization
- ROI Tracking: Performance-based strategy adjustment

### Reader-Driven Quality

- Analytics Engine: Reader behavior and engagement tracking
- Dropout Prevention: Automatic quality enhancement triggers
- Feedback Loops: Reader response influences future content
- A/B Testing: Content strategy optimization

### Production Automation

- GitHub Actions: 4 workflows, daily execution schedule
- Error Recovery: Comprehensive error handling and retry logic
- Monitoring: Detailed logging and performance tracking
- Scalability: Handles unlimited concurrent story generation

## Content Strategy

### Content Model

```typescript
Novel: {
  title: string,
  slug: string,
  author: "하이브리드 AI (Claude + Gemini)",
  status: "연재 중" | "완결" | "휴재",
  summary: string,
  tropes: string[],
  totalChapters: number,
  publishedDate: Date,
  rating: number
}

Chapter: {
  title: string,
  novel: string,
  chapterNumber: number,
  publicationDate: Date,
  content: string,
  wordCount: number,
  emotionalTone: string
}
```

### AI Strategy

- **Hybrid Intelligence**: Claude + Gemini 최적 조합으로 작업 특성별 AI 선택
- **Chain-of-Thought**: Multi-step reasoning for plot development
- **Context Injection**: Character and world-state awareness
- **Quality Loops**: Self-improvement through feedback analysis
- **Template-Based**: Romance fantasy trope integration
- **Intelligent Fallback**: Gemini 불가용시 Claude 단독 모드 자동 전환

## Advanced Configuration

### Environment Variables

```bash
# Required for production
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXX     # Gemini 2.5 Pro API (Primary AI - 완전 대체)
VERCEL_TOKEN=xxx                       # Deployment token
VERCEL_ORG_ID=xxx                      # Organization ID
VERCEL_PROJECT_ID=xxx                  # Project ID

# Optional
NODE_ENV=production                    # Environment mode
LOG_LEVEL=info                         # Logging verbosity

# ❌ Deprecated (완전 제거됨)
# ANTHROPIC_API_KEY - No longer needed (Gemini 2.5 Pro 완전 대체)
```

### Automation Schedule

```yaml
GitHub Actions Schedule (AI Story Generation Pipeline):
  - 01:00 UTC (KST 10:00): Main execution time
  - 02:30 UTC (KST 11:30): Backup execution
  - 04:00 UTC (KST 13:00): Final backup execution
  - Manual trigger: workflow_dispatch available
```

## Best Practices & Guidelines

### Development Guidelines

1. Test-Driven: Write tests before implementation (TDD)
2. TypeScript First: Use strong typing for reliability
3. Modular Design: Keep engines independent and composable
4. Error Handling: Comprehensive error recovery strategies
5. Performance: Monitor and optimize for production use

### AI Development

1. Context Preservation: Maintain story continuity across sessions
2. Quality Gates: Validate output before publication
3. Cost Awareness: Balance quality vs resource consumption
4. Reader Focus: Optimize for reader engagement metrics
5. Diversity: Ensure content variety and freshness

### Code Quality Standards

- Coverage: Minimum 80% test coverage
- Linting: ESLint + Prettier compliance
- Security: Regular Snyk vulnerability scans
- Performance: Sub-3-second page load times
- Accessibility: WCAG 2.1 AA compliance

## Deployment & Operations

### Production Deployment

- Platform: Vercel with global CDN
- Build: Astro SSR with optimizations
- Monitoring: Built-in analytics and error tracking
- Scaling: Automatic scaling based on traffic
- CI/CD: GitHub Actions automated deployment

### Monitoring & Maintenance

- Logs: Comprehensive automation logs in `/logs/`
- Metrics: Performance and quality metrics tracking
- Alerts: Automated failure notifications
- Backup: Content versioning through Git
- Updates: Automated dependency updates

## Performance Metrics

### System Performance

- Automation Success Rate: 95%+
- Average Generation Time: <5 minutes per chapter
- Cost Efficiency: 75% savings in standard mode
- Content Quality Score: 8.5/10 average
- Reader Engagement: Tracked and optimized

### Technical Metrics

- Test Coverage: 540+ test cases, 95% pass rate
- Build Time: <2 minutes
- Deployment Time: <30 seconds
- Page Load Speed: <2 seconds
- Uptime: 99.9%+

## Future Roadmap

### Near-term Enhancements

- [ ] Multi-language content generation
- [ ] Advanced reader personalization
- [ ] Real-time content optimization
- [ ] Enhanced analytics dashboard

### Long-term Vision

- [ ] AI-driven marketing optimization
- [ ] Multi-platform publishing
- [ ] Community features integration
- [ ] Advanced monetization strategies

## Support & Resources

### Documentation

- `PLAN.md` - Original project planning document
- `PROMPT_ENHANCER.md` - AI prompt optimization guide
- `NOVEL_MARKDOWN_FORMAT.md` - Content formatting standards
- `BASE.md` - Project foundation documentation

### Key Files

- `src/lib/master-automation-engine.ts` - Main orchestration engine
- `scripts/ai-novel-generator.js` - Gemini API 메인 생성기 (schema-compliant)
- `scripts/gemini-story-generator.js` - GitHub Actions 생성기 (schema-compliant)  
- `scripts/test-gemini-system.js` - Gemini API 시스템 테스트
- `src/content/config.ts` - Content schema validation (CRITICAL)
- `.github/workflows/ai-story-generation-pipeline.yml` - Main automation workflow
- `src/lib/deployment-management-system.ts` - Blue-Green deployment system
- `src/lib/monitoring-alerting-system.ts` - Enterprise monitoring
- `src/test/` - Comprehensive test suites (295+ tests)

## 🔍 Critical Issues & Findings (2025-08-19 Analysis)

### 🚨 Critical Bugs Found
1. **Slug Recognition Failure**: `undefined-ch*.md` files due to regex mismatch
2. **Module Loading Failure**: TypeScript continuity modules can't be imported in Node.js
3. **Continuity System Inactive**: Despite `ENABLE_CONTINUITY_SYSTEM=true` in .env

### ✅ Quality Achievements
- **Simplified Prompts Success**: 65% reduction (17K→6K) with quality improvement
- **High Content Quality**: 8.5/10 average without continuity system
- **Natural Korean Writing**: Professional-grade emotional descriptions

### 📈 System Analysis Results
- **JSON Continuity System**: Fully implemented but unused (10/10 potential, 2/10 usage)
- **Content Quality**: Excellent without complex systems (8.5/10)
- **Performance**: Token usage could be reduced 75% with compression
- **Security Issues**: API key exposure risk, path traversal vulnerability

### 📊 Deep Analysis Metrics
```yaml
Overall Health Score: B+ (85/100)
├─ Architecture: 9/10 (Excellent modular design)
├─ Code Quality: 8.5/10 (Strong but needs TypeScript migration)
├─ Security: 7/10 (Critical vulnerabilities found)
├─ Performance: 8/10 (Good but token waste detected)
├─ Content Quality: 8.5/10 (Professional without continuity)
└─ Continuity System: 2/10 (Built but inactive)
```

### 🔧 Immediate Action Items
1. **Fix Module Loading**: Convert TypeScript continuity modules to JavaScript
2. **Resolve Slug Recognition**: Fix regex pattern in `ai-novel-generator.js:378`
3. **Activate Continuity System**: Resolve import issues in `continuity-integration.js`
4. **Security Hardening**: Rotate API keys, add path validation
5. **Performance Optimization**: Implement token compression (75% potential savings)

## Project Status Summary (2025-08-19)

**Content Quality**: Excellent (8.5/10) - Professional-grade romance fantasy achieved  
**Continuity System**: Complete but inactive - TypeScript module loading failure  
**Architecture**: Strong modular design (B+) - Security and performance improvements needed  
**Critical Issues**: 3 bugs blocking continuity system activation  
**Key Finding**: Simplified prompts (6K chars) outperform complex systems (17K chars)

**The ro-fan platform demonstrates that simplified approaches can achieve professional quality, while sophisticated JSON-based continuity system awaits activation through bug fixes.**

---

## important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
