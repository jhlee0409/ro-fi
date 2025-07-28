# 로깅 및 모니터링 시스템

ro-fan 프로젝트를 위한 종합적인 로깅, 모니터링, 알림 시스템입니다.

## 🎯 주요 기능

### ✨ 핵심 서비스
- **구조화된 로깅**: 레벨별, 카테고리별 로그 관리
- **AI 작업 추적**: 토큰 사용량, 비용, 성능 모니터링
- **실시간 알림**: 임계값 기반 자동 알림 시스템
- **성능 모니터링**: 메모리, CPU, 응답시간 추적
- **로그 관리**: 자동 로테이션, 압축, 보관 정책

### 📊 모니터링 대시보드
- 실시간 시스템 상태
- AI 모델 성능 메트릭
- 비용 추적 및 예산 관리
- 헬스 스코어 및 권장사항

### 🚨 지능형 알림 시스템
- 8가지 알림 규칙 (에러율, 메모리, API 실패 등)
- 집계 및 쿨다운 기능
- 다중 채널 알림 (콘솔, 파일, 웹훅, 이메일)

## 🚀 빠른 시작

### 기본 로깅
```javascript
import { getLogger, LogCategory } from './src/lib/logging-service.js';

const logger = getLogger();

// 기본 로깅
await logger.info('서버 시작됨', { 
  category: LogCategory.SYSTEM,
  port: 3000 
});

await logger.error('데이터베이스 연결 실패', {
  category: LogCategory.ERROR,
  error: error.message
});
```

### AI 작업 로깅
```javascript
import { getAILogger } from './src/lib/ai-operation-logger.js';

const aiLogger = getAILogger();

// AI 작업 추적
const operationId = aiLogger.startOperation('generateChapter', {
  model: 'claude-sonnet',
  chapterNumber: 1
});

// ... AI 작업 수행 ...

await aiLogger.endOperation(operationId, {
  tokens: { input: 1000, output: 1500 },
  cost: 0.05,
  success: true
});
```

### 성능 모니터링
```javascript
import { getPerformanceMonitor } from './src/lib/performance-monitor.js';

const perfMonitor = getPerformanceMonitor();

// 함수 성능 측정
const result = await perfMonitor.measureFunction(
  'chapter_generation',
  generateChapter,
  options
);

console.log(`실행시간: ${result.performance.duration}ms`);
```

### 알림 설정
```javascript
import { getAlertSystem, AlertRule } from './src/lib/alert-system.js';

const alertSystem = getAlertSystem();

// 알림 트리거
await alertSystem.triggerAlert(AlertRule.ERROR_RATE, {
  rate: 10,
  threshold: 5
});
```

## 🛠️ CLI 도구

프로젝트에 포함된 CLI 도구로 로깅 시스템을 관리할 수 있습니다:

```bash
# 시스템 상태 확인
node scripts/logging-cli.js status

# 실시간 모니터링
node scripts/logging-cli.js monitor

# 로그 검색
node scripts/logging-cli.js logs search "ERROR"

# 알림 테스트
node scripts/logging-cli.js alerts test error_rate

# 성능 메트릭 확인
node scripts/logging-cli.js metrics

# 로그 정리
node scripts/logging-cli.js cleanup
```

## 📁 아키텍처

### 파일 구조
```
src/lib/
├── logging-service.js          # 핵심 로깅 서비스
├── ai-operation-logger.js      # AI 작업 전용 로거
├── log-manager.js              # 로그 관리 (로테이션, 압축)
├── monitoring-dashboard.js     # 모니터링 대시보드
├── performance-monitor.js      # 성능 모니터링
├── alert-system.js             # 알림 시스템
└── logging-integration-example.js  # 통합 예제

scripts/
└── logging-cli.js              # CLI 관리 도구
```

### 로그 파일 구조
```
logs/
├── app-2025-07-28.log         # 일일 로그
├── metrics-2025-07-28.json    # 메트릭 데이터
├── structured-2025-07-28.jsonl # 구조화된 로그
├── alerts/                    # 알림 이력
│   └── alerts-2025-07-28.json
└── archive/                   # 압축된 아카이브
    └── app-2025-07-27.log.gz
```

## ⚙️ 설정

### 환경 변수
```bash
# 로그 레벨 (0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=CRITICAL)
LOG_LEVEL=1

# 알림 웹훅 URL
ALERT_WEBHOOK_URL=https://hooks.slack.com/...

# 프로덕션 환경
NODE_ENV=production
```

### 로깅 서비스 설정
```javascript
import { configureLogging } from './src/lib/logging-service.js';

const logger = configureLogging({
  logLevel: 1,                    // INFO 레벨
  maxFileSize: 20 * 1024 * 1024, // 20MB
  maxFiles: 15,                   // 최대 15개 파일
  enableMetrics: true,            // 메트릭 수집 활성화
  bufferSize: 200,               // 버퍼 크기
  flushInterval: 3000            // 플러시 간격 (3초)
});
```

### 알림 시스템 설정
```javascript
import { getAlertSystem } from './src/lib/alert-system.js';

const alertSystem = getAlertSystem({
  enableWebhook: true,
  webhookUrl: process.env.ALERT_WEBHOOK_URL,
  cooldownPeriod: 300000,        // 5분 쿨다운
  alertThresholds: {
    errorRate: 0.05,             // 5% 에러율
    memoryUsage: 0.8,            // 80% 메모리 사용률
    tokenUsage: 15000,           // 시간당 15,000 토큰
    cost: 10                     // 시간당 $10
  }
});
```

## 📊 메트릭 및 알림

### 수집되는 메트릭
- **API 호출**: 횟수, 성공률, 응답시간
- **토큰 사용량**: 입력/출력 토큰, 비용
- **메모리 사용량**: 힙, RSS, 외부 메모리
- **성능**: 실행시간, 처리량, 병목현상
- **에러**: 에러율, 에러 유형, 빈도

### 알림 규칙
1. **ERROR_RATE**: 에러율 5% 초과
2. **MEMORY_LIMIT**: 메모리 사용률 80% 초과
3. **API_FAILURE**: API 호출 실패
4. **PERFORMANCE_DEGRADATION**: 성능 저하 감지
5. **TOKEN_LIMIT**: 토큰 사용량 한계 근접
6. **COST_LIMIT**: 비용 한계 초과
7. **AUTOMATION_FAILURE**: 자동화 작업 실패
8. **CONTENT_QUALITY**: 콘텐츠 품질 기준 미달

## 🔧 기존 코드 통합

### 단계 1: 로깅 시스템 초기화
```javascript
// main.js 또는 app.js
import { initializeLoggingSystem } from './src/lib/logging-integration-example.js';

const loggingSystem = await initializeLoggingSystem();
```

### 단계 2: AI 생성기에 로깅 추가
```javascript
// 기존 AI 생성기 래핑
import { LoggingEnabledAIGenerator } from './src/lib/logging-integration-example.js';

const originalGenerator = new AIStoryGenerator(apiKey);
const loggingGenerator = new LoggingEnabledAIGenerator(originalGenerator);

// 로깅이 포함된 생성
const result = await loggingGenerator.generateChapter(options);
```

### 단계 3: 기존 console.log 대체
```javascript
// 기존 코드
console.log('작업 시작');
console.error('에러 발생:', error);

// 로깅 시스템 사용
import { getLogger, LogCategory } from './src/lib/logging-service.js';
const logger = getLogger();

await logger.info('작업 시작', { category: LogCategory.SYSTEM });
await logger.error('에러 발생', { 
  category: LogCategory.ERROR, 
  error: error.message 
});
```

## 🎯 모범 사례

### 1. 로그 레벨 사용
- **DEBUG**: 개발 중 상세 디버깅 정보
- **INFO**: 일반적인 작업 진행 상황
- **WARN**: 주의가 필요한 상황
- **ERROR**: 처리 가능한 에러
- **CRITICAL**: 즉시 대응이 필요한 심각한 문제

### 2. 카테고리 분류
- **SYSTEM**: 시스템 관련 로그
- **AI_OPERATION**: AI 모델 호출 및 작업
- **AUTOMATION**: 자동화 프로세스
- **PERFORMANCE**: 성능 관련 정보
- **SECURITY**: 보안 관련 이벤트
- **CONTENT**: 콘텐츠 생성 및 관리
- **ERROR**: 에러 및 예외상황

### 3. 구조화된 로깅
```javascript
// 좋은 예
await logger.info('챕터 생성 완료', {
  category: LogCategory.AI_OPERATION,
  chapterNumber: 5,
  wordCount: 3500,
  model: 'claude-sonnet',
  duration: 2500,
  cost: 0.05
});

// 피해야 할 예
console.log('챕터 5 생성 완료 3500자 2.5초 $0.05');
```

### 4. 성능 모니터링
```javascript
// 중요한 함수의 성능 측정
const measurementId = perfMonitor.startMeasurement('critical_operation');
try {
  const result = await criticalOperation();
  await perfMonitor.endMeasurement(measurementId, { success: true });
  return result;
} catch (error) {
  await perfMonitor.endMeasurement(measurementId, { 
    success: false, 
    error: error.message 
  });
  throw error;
}
```

## 🚀 프로덕션 배포

### 1. 환경 설정
```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=1
ALERT_WEBHOOK_URL=https://your-webhook-url
```

### 2. 로그 로테이션 스케줄
```bash
# crontab 설정
0 0 * * * node /path/to/logging-cli.js cleanup
0 2 * * 0 node /path/to/logging-cli.js logs archive
```

### 3. 모니터링 알림 설정
Slack, Discord, 또는 이메일을 통한 실시간 알림 설정

## 📈 성능 영향

- **로그 버퍼링**: 성능 영향 최소화 (< 1ms overhead)
- **비동기 처리**: 논블로킹 로그 처리
- **메모리 사용량**: 평균 10-20MB 추가
- **디스크 사용량**: 일일 50-100MB (압축 후 10-20MB)

## 🔍 문제 해결

### 일반적인 문제
1. **로그 파일이 생성되지 않음**
   - 디렉토리 권한 확인
   - `logs/` 디렉토리 존재 확인

2. **메모리 사용량 증가**
   - 버퍼 크기 조정 (`bufferSize` 설정)
   - 플러시 간격 단축 (`flushInterval` 설정)

3. **알림이 전송되지 않음**
   - 웹훅 URL 확인
   - 쿨다운 기간 확인

### 디버깅
```bash
# 로깅 시스템 테스트
node scripts/logging-cli.js test all

# 상태 확인
node scripts/logging-cli.js status

# 실시간 모니터링
node scripts/logging-cli.js monitor
```

## 📚 추가 리소스

- [로깅 서비스 API 문서](./src/lib/logging-service.js)
- [AI 로거 API 문서](./src/lib/ai-operation-logger.js)
- [모니터링 대시보드 API](./src/lib/monitoring-dashboard.js)
- [통합 예제](./src/lib/logging-integration-example.js)

---

**이 로깅 시스템은 ro-fan 프로젝트의 안정성, 성능, 유지보수성을 크게 향상시킵니다.**