# 📸 RO-FAN AI 이미지 생성 시스템

Google Gemini AI를 활용한 로맨스 판타지 소설의 지능형 이미지 포인트 생성 및 관리 시스템입니다.

## 🎯 시스템 개요

### 핵심 기능
- **자동 이미지 포인트 분석**: Gemini AI가 챕터 내용을 분석하여 핵심 장면 식별
- **지능형 프롬프트 생성**: 각 장면에 최적화된 이미지 생성 프롬프트 자동 생성
- **2025 모던 UI**: 최신 디자인 트렌드를 반영한 이미지 컴포넌트
- **반응형 읽기 경험**: 이미지가 통합된 향상된 챕터 읽기 인터페이스

### 이미지 포인트 유형
| 유형 | 설명 | 예시 |
|------|------|------|
| `scene_transition` | 장면 전환 | 새로운 장소나 시간으로의 전환 |
| `character_moment` | 캐릭터 순간 | 감정적 절정, 캐릭터 개발 |
| `romance_tension` | 로맨스 클라이맥스 | 첫 만남, 키스, 고백 장면 |
| `fantasy_element` | 판타지 요소 | 마법, 초능력, 환상적 장면 |
| `visual_highlight` | 시각적 하이라이트 | 인상적인 묘사, 중요한 상징 |

## 🛠️ 설치 및 설정

### 1. 환경 변수 설정
```bash
# .env.local 파일에 추가
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. 의존성 확인
```bash
# @google/generative-ai가 이미 설치되어 있음
pnpm install
```

### 3. 디렉토리 구조
```
src/
├── components/
│   ├── ChapterImagePoint.astro      # 이미지 포인트 컴포넌트
│   └── EnhancedChapterReader.astro  # 향상된 챕터 읽기 컴포넌트
├── lib/
│   ├── image-generation-service.ts  # Gemini AI 이미지 생성 서비스
│   ├── chapter-image-analyzer.ts    # 챕터 분석 시스템
│   └── types/
│       └── image-types.ts           # 타입 정의
├── data/
│   └── chapter-images/              # 생성된 분석 데이터 저장
└── styles/
    └── globals.css                  # 이미지 컴포넌트 스타일
```

## 🚀 사용법

### 기본 명령어

```bash
# 사용 가능한 소설 목록 보기
pnpm run images:list

# 전체 소설 분석 (모든 챕터)
pnpm run images:analyze time-guardian-fate-thread

# 특정 챕터만 분석
pnpm run images:chapter time-guardian-fate-thread 1

# 분석 결과 리포트 생성
pnpm run images:report time-guardian-fate-thread

# 시스템 테스트
node scripts/test-image-system.js
```

### 고급 사용법

```javascript
// 프로그래밍 방식으로 이미지 포인트 분석
import { chapterImageAnalyzer } from './src/lib/chapter-image-analyzer.js';

const result = await chapterImageAnalyzer.analyzeChapter(
  chapterContent,
  {
    slug: 'chapter-slug',
    chapterNumber: 1,
    title: 'Chapter Title'
  }
);

console.log(`Found ${result.imagePoints.length} image points`);
```

## 🎨 컴포넌트 사용

### ChapterImagePoint 컴포넌트

```astro
---
import ChapterImagePoint from '../components/ChapterImagePoint.astro';

const imagePoint = {
  id: 'unique-id',
  position: 50,
  type: 'romance_tension',
  description: '두 주인공의 운명적인 첫 만남',
  mood: 'romantic',
  characters: ['레오나', '카엘'],
  setting: '시계탑 아래',
  chapterTitle: '챕터 제목'
};
---

<ChapterImagePoint 
  imagePoint={imagePoint}
  imageUrl="/images/generated/scene1.jpg"
  className="my-8"
/>
```

### EnhancedChapterReader 컴포넌트

```astro
---
import EnhancedChapterReader from '../components/EnhancedChapterReader.astro';

const chapterData = {
  content: '챕터 내용...',
  title: '챕터 제목',
  slug: 'chapter-slug',
  imagePoints: [...] // 생성된 이미지 포인트들
};
---

<EnhancedChapterReader
  chapterContent={chapterData.content}
  chapterTitle={chapterData.title}
  chapterSlug={chapterData.slug}
  imagePoints={chapterData.imagePoints}
/>
```

## 📊 이미지 포인트 데이터 구조

### ChapterImagePoint 인터페이스

```typescript
interface ChapterImagePoint {
  id: string;                    // 고유 식별자
  position: number;              // 텍스트 내 위치 (0-100%)
  type: ImagePointType;          // 이미지 포인트 유형
  description: string;           // 장면 묘사 (100-200자)
  mood: MoodType;               // 분위기 (dramatic, romantic, etc.)
  characters?: string[];         // 등장 캐릭터들
  setting: string;              // 장면 배경
  chapterTitle: string;         // 챕터 제목
  generatedPrompt?: string;     // AI 생성 프롬프트
}
```

### 저장된 분석 데이터

```json
{
  "chapterSlug": "time-guardian-fate-thread-ch1",
  "chapterNumber": 1,
  "chapterTitle": "멈춰버린 시계탑 아래에서",
  "imagePoints": [...],
  "lastAnalyzed": "2025-08-16T13:42:15.123Z"
}
```

## 🔧 API 참조

### ImageGenerationService

```typescript
class ImageGenerationService {
  // 챕터에서 이미지 포인트 식별
  async identifyImagePoints(
    chapterContent: string, 
    chapterTitle: string
  ): Promise<ChapterImagePoint[]>

  // 이미지 생성 프롬프트 생성
  async generateImagePrompt(
    imagePoint: ChapterImagePoint
  ): Promise<string>

  // 소설 커버 이미지 프롬프트 생성
  async generateCoverImagePrompt(
    options: NovelCoverOptions
  ): Promise<string>
}
```

### ChapterImageAnalyzer

```typescript
class ChapterImageAnalyzer {
  // 챕터 분석
  async analyzeChapter(
    chapterContent: string,
    chapterMeta: ChapterMeta
  ): Promise<ChapterImageData>

  // 전체 소설 분석
  async analyzeAllChapters(
    novelSlug: string
  ): Promise<ChapterImageData[]>

  // 텍스트에 이미지 포인트 삽입
  insertImagePointsIntoText(
    chapterContent: string,
    imagePoints: ChapterImagePoint[]
  ): string
}
```

## 🎯 AI 프롬프트 최적화

### Gemini AI 프롬프트 전략

1. **컨텍스트 풍부한 분석**
   - 로맨스 판타지 장르 특성 고려
   - 캐릭터 관계와 감정 발전 추적
   - 판타지 요소와 현실적 요소의 균형

2. **시각적 묘사 최적화**
   - 웹툰/라이트노벨 일러스트 스타일
   - 4K 고품질 이미지 사양
   - 로맨스 장르에 적합한 색감과 분위기

3. **일관성 있는 캐릭터 묘사**
   - 캐릭터별 고유한 시각적 특성
   - 감정 상태에 따른 표현 변화
   - 스토리 진행에 따른 관계 발전 반영

## 📈 성능 최적화

### 이미지 로딩 전략

1. **지연 로딩 (Lazy Loading)**
   ```javascript
   <img loading="lazy" decoding="async" />
   ```

2. **프로그레시브 향상**
   ```css
   .chapter-image-point {
     opacity: 0;
     transform: translateY(30px);
   }
   
   .chapter-image-point.animate-fade-in-up {
     animation: fadeInUp 0.8s ease-out forwards;
   }
   ```

3. **인터섹션 옵저버 활용**
   ```javascript
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         entry.target.classList.add('animate-fade-in-up');
       }
     });
   });
   ```

### API 속도 제한 관리

```javascript
// 순차적 처리로 API 호출 제한
for (const chapter of novelChapters) {
  const result = await analyzeChapter(chapter);
  results.push(result);
  
  // API 속도 제한을 위한 지연
  await delay(3000);
}
```

## 🔍 디버깅 및 문제 해결

### 일반적인 문제들

1. **GEMINI_API_KEY 미설정**
   ```bash
   ⚠️  GEMINI_API_KEY not found in environment
   💡 Please set GEMINI_API_KEY for full functionality
   ```

2. **챕터 파일 형식 오류**
   ```bash
   ❌ Invalid chapter format - missing frontmatter
   ```

3. **JSON 파싱 오류**
   ```javascript
   console.warn('Failed to parse image points JSON:', parseError);
   return this.createFallbackImagePoints(chapterTitle);
   ```

### 로그 분석

```bash
# 상세한 분석 로그 확인
node scripts/generate-chapter-images.js analyze time-guardian-fate-thread

# 특정 챕터 디버깅
node scripts/generate-chapter-images.js chapter time-guardian-fate-thread 1
```

## 🚀 배포 및 프로덕션

### 환경 변수 설정

```bash
# Vercel 배포용
vercel env add GEMINI_API_KEY

# 로컬 개발용
echo "GEMINI_API_KEY=your_key_here" >> .env.local
```

### 빌드 최적화

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  integrations: [
    react(),
    tailwind()
  ],
  vite: {
    optimizeDeps: {
      include: ['@google/generative-ai']
    }
  }
});
```

## 🔮 향후 개발 계획

### Phase 1: 기본 시스템 (완료)
- ✅ Gemini AI 이미지 포인트 분석
- ✅ 이미지 컴포넌트 시스템
- ✅ 향상된 챕터 읽기 경험

### Phase 2: 이미지 생성 통합
- 🔄 실제 이미지 생성 API 연동
- 🔄 이미지 캐싱 및 최적화
- 🔄 자동 이미지 품질 검증

### Phase 3: 고급 기능
- 📋 사용자 맞춤형 이미지 스타일
- 📋 A/B 테스트를 통한 이미지 효과 분석
- 📋 다국어 이미지 프롬프트 지원

## 🤝 기여 가이드

### 새로운 이미지 포인트 유형 추가

1. `image-types.ts`에 새 유형 추가
2. `ImageGenerationService`에 처리 로직 구현
3. `ChapterImagePoint.astro`에 스타일 추가
4. 테스트 케이스 작성

### 프롬프트 개선

1. `image-generation-service.ts`의 프롬프트 템플릿 수정
2. 여러 챕터로 테스트 수행
3. 품질 평가 및 피드백 수집
4. 문서 업데이트

---

🎨 **RO-FAN Image System** - AI가 만드는 몰입형 로맨스 판타지 읽기 경험