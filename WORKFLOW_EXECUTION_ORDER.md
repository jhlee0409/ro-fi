# GitHub Actions 워크플로우 실행 순서 최적화

## 현재 문제점 분석

### 🚨 **발견된 문제들**
1. **의존성 관리 충돌**: `cache: 'npm'`이 `pnpm-lock.yaml`과 충돌
2. **실행 순서 비효율**: 워크플로우 간 의존성 무시
3. **중복 실행**: 동일한 시간대에 여러 워크플로우 실행
4. **품질 검사 타이밍**: 콘텐츠 생성 후 품질 검사 지연

## 최적화된 워크플로우 실행 순서

### 📅 **일일 스케줄 (UTC 기준)**

```
02:00 - AI Story Generation      [콘텐츠 생성]
  ↓
02:30 - Quality Assurance        [품질 검증] 
  ↓
03:00 - Auto Publish (1차)       [첫 배포]
  ↓
06:00 - Auto Publish (2차)       [점심 배포]
  ↓  
12:00 - Auto Publish (3차)       [저녁 배포]
```

### 🔄 **워크플로우 체인 의존성**

#### **1단계: 콘텐츠 생성** (02:00 UTC)
```yaml
ai-story-generation.yml
├─ 트리거: schedule (cron: "0 2 * * *")
├─ 기능: Master Automation Engine 실행
├─ 결과: 새 챕터/소설 생성
└─ 다음: Quality Assurance 자동 트리거
```

#### **2단계: 품질 검증** (02:30 UTC + Push 트리거)
```yaml
quality-assurance.yml + content-quality-check.yml
├─ 트리거: schedule (cron: "30 2 * * *") + push 이벤트
├─ 기능: Claude AI 품질 검증 + 기본 검증
├─ 조건: 7.5/10 이상 통과 필수
└─ 다음: Auto Publish 허가
```

#### **3단계: 자동 배포** (00:00, 06:00, 12:00 UTC)
```yaml
auto-publish.yml
├─ 트리거: schedule (cron: "0 0,6,12 * * *")
├─ 조건: 품질 검증 통과된 콘텐츠만
├─ 기능: 테스트 → 빌드 → Vercel 배포
└─ 결과: 라이브 사이트 업데이트
```

## 수정된 워크플로우 설정

### 🎯 **최적 타이밍 조정**

1. **AI Story Generation**: 02:00 UTC (한국 오전 11시)
   - 새로운 콘텐츠 생성
   - 자동으로 push 이벤트 발생

2. **Content Quality Check**: Push 이벤트시 즉시
   - 기본 품질 검사 (2-3분 내 완료)
   - 실패시 자동 이슈 생성

3. **Quality Assurance**: 02:30 UTC (생성 30분 후)
   - Claude AI 고품질 검증
   - 7.5/10 기준 엄격 검사

4. **Auto Publish**: 
   - **1차** 00:00 UTC (한국 오전 9시)
   - **2차** 06:00 UTC (한국 오후 3시) 
   - **3차** 12:00 UTC (한국 오후 9시)

### 🔧 **의존성 해결책**

#### **Package Manager 통일**
```yaml
# 모든 워크플로우에서 동일 설정
- name: 🔧 pnpm 설치
  uses: pnpm/action-setup@v4
  with:
    version: 8

- name: 📦 Node.js 설정
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm'        # npm이 아닌 pnpm

- name: 📚 의존성 설치
  run: pnpm install --ignore-scripts
```

#### **워크플로우 체인 제어**
```yaml
# Quality Assurance에서 배포 제어
- name: Deployment Gate
  if: steps.claude_review.outcome == 'success'
  run: echo "deployment_approved=true" >> $GITHUB_OUTPUT

# Auto Publish에서 조건 체크
- name: Check Quality Gate
  run: |
    # 최근 품질 검증 결과 확인
    if ! git log --oneline -10 | grep -q "품질 검증 통과"; then
      echo "품질 검증이 완료되지 않았습니다."
      exit 1
    fi
```

## 워크플로우 간 통신 방식

### 📋 **상태 전달 메커니즘**

1. **Git Commit Messages**: 워크플로우 상태 정보 포함
2. **GitHub Issues**: 품질 실패시 자동 생성
3. **Artifacts**: 실행 결과 30일 보관
4. **환경 변수**: 크로스 워크플로우 데이터 전달

### 🚦 **실패 처리 전략**

```yaml
# AI Story Generation 실패시
- Claude Code Action 폴백 실행
- 수동 실행 알림 생성

# Quality Assurance 실패시  
- 기본 품질 검사로 폴백
- 개선 이슈 자동 생성
- 배포 차단

# Auto Publish 실패시
- 이전 버전 유지
- 알림 발송
- 수동 개입 요청
```

## 권장 실행 순서

### ✅ **최적화된 흐름**

1. **02:00** - AI가 새 콘텐츠 생성
2. **02:00-02:05** - Push 이벤트로 기본 품질 검사
3. **02:30** - Claude AI 고품질 검증
4. **03:00** - 첫 번째 자동 배포 (새 콘텐츠 포함)
5. **06:00, 12:00** - 추가 배포 (업데이트 반영)

### 🎯 **효과**

- **지연 시간 최소화**: 생성→검증→배포 30분 내 완료
- **품질 보장**: 2단계 품질 검증 시스템
- **안정성 확보**: 각 단계별 폴백 메커니즘
- **운영 효율성**: 한국 시간대 최적화 스케줄

이제 워크플로우가 논리적 순서로 실행되어 충돌 없이 안정적으로 작동할 것입니다.