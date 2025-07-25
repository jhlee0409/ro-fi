import Anthropic from '@anthropic-ai/sdk';
import { QualityAssuranceEngine } from './quality-assurance-engine.js';

// PLAN.md에 정의된 로맨스 판타지 트렌드 매트릭스
const TROPE_PROMPTS = {
  'enemies-to-lovers': {
    conflict: '이념적/개인적 경쟁 관계',
    keyScenes: ['강제적인 협력 상황', '증오에도 불구하고 서로를 구출', '공통의 약점 발견'],
    motivationA: '우월함 증명, 목표 달성',
    motivationB: '경쟁자 타도, 자신을 보호'
  },
  'fated-mates': {
    conflict: '둘을 갈라놓으려는 외부 세력',
    keyScenes: ['예언의 발견', '거부할 수 없는 마법적 이끌림', '꿈의 공유'],
    motivationA: '처음에는 운명을 거부, 이후 숙명을 받아들임',
    motivationB: '운명을 받아들이고 짝을 보호'
  },
  'regression': {
    conflict: '비극적 미래에 대한 지식 vs 모든 것을 바꿀 수 없는 한계',
    keyScenes: ['핵심적인 실패의 재경험', '미래 지식을 이용한 힘/동맹 확보', '특정 인물의 죽음 방지'],
    motivationA: '속죄, 복수, 사랑하는 사람 구하기',
    motivationB: '(회귀 사실을 모르므로) 기존 행동 패턴 반복'
  }
};

// StoryGenerationOptions 인터페이스를 JSDoc으로 변환
/**
 * @typedef {Object} StoryGenerationOptions
 * @property {string} title
 * @property {string[]} tropes
 * @property {number} [chapterNumber]
 * @property {string} [previousContext]
 * @property {string} [characterContext]
 * @property {string} [plotOutline]
 */

export class AIStoryGenerator {
  constructor(apiKey) {
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
    this.qualityEngine = new QualityAssuranceEngine();
    
    // 증분 개선을 위한 캐시 시스템
    this.improvementCache = new Map();
    this.wordCountHistory = [];
    
    // Anthropic API 사용량 모니터링
    this.dailyUsage = {
      requests: 0,
      errors: 0,
      overloadErrors: 0,
      lastReset: new Date().toDateString()
    };
  }

  /**
   * Claude API 재시도 메커니즘 (Anthropic 529 에러 대응)
   * 점진적 트래픽 증가 및 일관된 사용 패턴 유지
   */
  async anthropicWithRetry(params, currentAttempt = 1) {
    const maxRetries = 5; // 재시도 횟수 증가
    
    // 점진적 백오프: 15s → 30s → 60s → 120s → 300s (최대 5분)
    const getBackoffTime = (retryCount) => {
      const baseDelay = 15000; // 15초 시작 (Anthropic 권장)
      const maxDelay = 300000; // 최대 5분
      return Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    };
    
    // 일일 사용량 리셋 체크
    const today = new Date().toDateString();
    if (this.dailyUsage.lastReset !== today) {
      this.dailyUsage = { requests: 0, errors: 0, overloadErrors: 0, lastReset: today };
    }

    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        console.log(`🔄 Claude API 호출 시도 ${retry + 1}/${maxRetries}...`);
        this.dailyUsage.requests++;
        
        const response = await this.anthropic.messages.create(params);
        console.log(`✅ Claude API 호출 성공 (일일 요청: ${this.dailyUsage.requests}회)`);
        return response;
        
      } catch (error) {
        const isOverloaded = error.status === 529 || 
                           (error.error && error.error.type === 'overloaded_error');
        
        if (isOverloaded) {
          this.dailyUsage.overloadErrors++;
          const waitTime = getBackoffTime(retry);
          console.log(`⏳ Anthropic API 전체 과부하 (529) - ${waitTime/1000}초 대기...`);
          console.log(`📊 트래픽 관리: 점진적 백오프로 서비스 안정화 대기 중`);
          console.log(`📈 일일 사용량: 요청 ${this.dailyUsage.requests}회, 과부하 ${this.dailyUsage.overloadErrors}회`);
          
          if (retry < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
            console.log(`🔄 재시도 준비 완료 (${retry + 2}/${maxRetries})`);
            continue;
          } else {
            console.error(`❌ Anthropic API 장기간 과부하 - 서비스 일시 중단 필요`);
            console.error(`📊 최종 통계: 요청 ${this.dailyUsage.requests}회, 과부하 ${this.dailyUsage.overloadErrors}회`);
            console.error(`💡 권장: 몇 시간 후 재시도하거나 일일 사용량 분산 필요`);
            throw new Error('Claude API overloaded - service temporarily unavailable');
          }
        } else {
          this.dailyUsage.errors++;
          console.error(`❌ Claude API 에러 (비과부하):`, error);
          throw error;
        }
      }
    }
  }

  /**
   * PLAN.md의 전략 1: Chain-of-Thought를 활용한 플롯 구성
   */
  async generatePlotOutline(title, tropes) {
    const tropeDetails = tropes.map(trope => TROPE_PROMPTS[trope]).filter(Boolean);
    
    const prompt = `당신은 로맨스 판타지 전문 작가입니다. 단계별로 생각해서 작성해주세요.

소설 제목: "${title}"
적용할 트렌드: ${tropes.join(', ')}

트렌드 세부 정보:
${tropeDetails.map((detail, i) => `
${tropes[i]}:
- 핵심 갈등: ${detail.conflict}
- 주요 장면: ${detail.keyScenes.join(', ')}
- 캐릭터 A 동기: ${detail.motivationA}
- 캐릭터 B 동기: ${detail.motivationB}
`).join('\n')}

다음 단계로 50챕터 분량 소설의 10단계 플롯 개요를 생성하세요:

1. 먼저 주인공들의 기본 설정과 배경을 정하세요
2. 각 트렌드가 어떻게 서로 연결될지 분석하세요  
3. 로맨스 발전 단계를 계획하세요
4. 갈등의 고조와 해결 과정을 설계하세요
5. 10단계로 나누어 각 단계별 핵심 사건을 정리하세요

각 단계는 5챕터 정도의 분량으로 계획해주세요.`;

    const response = await this.anthropicWithRetry({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  /**
   * PLAN.md의 전략 2: 컨텍스트 주입과 역할 부여
   * @param {StoryGenerationOptions} options
   * @returns {Promise<{title: string, content: string}>}
   */
  async generateChapter(options) {
    const { title, tropes, chapterNumber = 1, previousContext = '', characterContext = '', plotOutline = '' } = options;
    
    const contextPrompt = `
**소설 정보:**
- 제목: ${title}
- 적용 트렌드: ${tropes.join(', ')}
- 챕터 번호: ${chapterNumber}

**플롯 개요:**
${plotOutline}

**이전 챕터 요약:**
${previousContext}

**캐릭터 설정:**
${characterContext}
`;

    // 3000자 충족을 위한 강화된 프롬프트
    const generationPrompt = `${contextPrompt}

로맨스 판타지 전문 작가로서 ${chapterNumber}챕터를 작성하세요.

🚨 **절대 분량 요구사항**: 정확히 3,500~4,000자 (공백 제외) 작성

📚 **상세 구조 지침**:
1. **장면 구성**: 7개 장면 × 500자 = 3,500자
   - 도입부 (500자): 상황 설정 + 감정 묘사
   - 전개부 5장면 (각 500자): 갈등 발전 + 대화 + 심리
   - 마무리 (500자): 감정 변화 + 다음 화 연결

2. **대화 요구사항**: 
   - 장면당 최소 3회 대화 교환 (총 21회 이상)
   - 대화마다 행동/표정 묘사 필수 (50자 이상)

3. **내적 독백**: 
   - 장면당 최소 2회 심리 묘사 (총 14회 이상)
   - 각 내적 독백 최소 30자 이상

4. **환경/감각 묘사**:
   - 5감 활용한 배경 서술 (시각, 청각, 촉각, 후각, 미각)
   - 장면당 최소 100자 환경 묘사

5. **회상/설정 설명**:
   - 자연스러운 배경 정보 삽입
   - 캐릭터 과거사 또는 세계관 설명

✍️ **작성 전략**:
- 각 문장을 풍부하게 확장 (단순 문장 금지)
- 감정 변화를 세밀하게 표현
- 긴장감과 로맨틱 요소 균형 유지
- 시간의 흐름과 장소 변화 상세 묘사

🎯 **품질 기준**: 3,500자 이상 + 7장면 + 21회 대화 + 14회 심리묘사

**출력 형식**:
**챕터 제목:** [제목]
**본문:** [3,500자 이상 풍부한 마크다운 스토리]`;

    let bestResult = null;
    let bestScore = 0;
    let attempts = 0;
    const maxAttempts = 3;
    
    // 캐시 키 생성
    const cacheKey = `${title}-${chapterNumber}`;
    const cachedHistory = this.improvementCache.get(cacheKey) || [];

    // 강화된 품질 보장 생성 프로세스 - 증분 개선
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        // 증분 개선 프롬프트 생성
        const enhancedPrompt = this.buildIncrementalPrompt(
          generationPrompt, 
          attempts, 
          bestResult, 
          cachedHistory,
          chapterNumber
        );

        // 3000자 충족을 위한 최대 토큰 할당
        const dynamicMaxTokens = 8192; // Claude Sonnet 최대 토큰으로 고정

        const response = await this.anthropicWithRetry({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: dynamicMaxTokens, // 동적 토큰 할당
          messages: [{ role: 'user', content: enhancedPrompt }],
          temperature: 0.7, // 창의성과 일관성의 균형
          top_p: 0.9
        }, attempts);

        const fullResponse = response.content[0].type === 'text' ? response.content[0].text : '';
        
        // 제목과 본문 분리
        const titleMatch = fullResponse.match(/\*\*챕터 제목:\*\*\s*(.+)/);
        const contentMatch = fullResponse.match(/\*\*본문:\*\*\s*([\s\S]+)/);
        
        // 빈 응답 방지를 위한 안전장치
        if (!fullResponse || fullResponse.trim().length < 100) {
          console.warn(`⚠️ 시도 ${attempts}: 응답이 너무 짧음 (${fullResponse.length}자) - 건너뛰기`);
          continue;
        }
        
        const result = {
          title: titleMatch ? titleMatch[1].trim() : `제${chapterNumber}장`,
          content: contentMatch ? contentMatch[1].trim() : fullResponse
        };
        
        // 결과 유효성 검증
        if (!result.content || result.content.trim().length < 100) {
          console.warn(`⚠️ 시도 ${attempts}: 콘텐츠가 너무 짧음 - 건너뛰기`);
          continue;
        }

        // 즉시 기본 검증 (분량 체크)
        const wordCount = result.content.replace(/\s+/g, '').length;
        console.log(`📄 시도 ${attempts}: 생성된 분량 ${wordCount}자`);

        // 상세 품질 검사 (분량 부족이라도 평가는 진행)
        const qualityAssessment = await this.qualityEngine.assessQuality(result.content, {
          title: result.title,
          chapterNumber,
          expectedLength: 3000
        });

        console.log(`📊 품질 점수: ${qualityAssessment.score}/100 (상태: ${qualityAssessment.status})`);

        // 최고 점수 기록 업데이트 (분량 부족이라도 저장) + 캐시 업데이트
        if (qualityAssessment.score > bestScore || !bestResult) {
          bestScore = qualityAssessment.score;
          bestResult = result;
          console.log(`📈 최고 점수 업데이트: ${bestScore}점`);
          
          // 성공 패턴 캐시에 저장
          cachedHistory.push({
            attempt: attempts,
            wordCount,
            score: qualityAssessment.score,
            successfulPatterns: this.extractSuccessfulPatterns(result.content),
            timestamp: Date.now()
          });
        }

        // 동적 품질 기준 (분량 미달 시 기준을 점진적으로 조정)
        const dynamicThreshold = Math.max(
          70, // 최소 기준 강화 (50→70)
          this.qualityEngine.qualityStandards.qualityThreshold - (attempts - 1) * 10 // 감소폭 축소 (15→10)
        );
        
        console.log(`🎯 동적 품질 기준: ${dynamicThreshold}점 (시도 ${attempts})`);
        
        // 품질 기준 충족 시 즉시 반환
        if (qualityAssessment.score >= dynamicThreshold) {
          console.log(`✅ 품질 기준 충족! 챕터 생성 완료 (${qualityAssessment.score}≥${dynamicThreshold})`);
          return result;
        }

        // 분량 부족 분석 및 로깅
        if (wordCount < 3500) {
          const percentage = Math.round((wordCount / 3500) * 100);
          console.log(`⚠️ 분량 미달: ${wordCount}자 (목표의 ${percentage}%) - 재시도 필요`);
          console.log(`📈 부족분: ${3500 - wordCount}자 추가 확장 필요`);
        }

        // 문제점 로깅 (상위 3개만)
        if (qualityAssessment.issues.length > 0) {
          console.log(`⚠️ 주요 문제점:`);
          qualityAssessment.issues.slice(0, 3).forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
          });
        }

      } catch (error) {
        console.error(`❌ 챕터 생성 시도 ${attempts} 실패:`, error);
        
        if (attempts === maxAttempts) {
          throw new Error(`챕터 생성 실패: ${error.message}`);
        }
      }
    }

    // 캐시 저장
    this.improvementCache.set(cacheKey, cachedHistory);
    
    // 모든 시도가 품질 기준에 미달한 경우 최고 점수 결과 반환
    if (bestResult) {
      console.log(`⚠️ 품질 기준 미달이지만 최고 점수(${bestScore}/100) 결과 반환`);
      console.log(`💾 캐시 저장: ${cachedHistory.length}개 시도 기록`);
      return bestResult;
    }

    // bestResult가 null인 경우 실패로 처리
    console.error('❌ 모든 시도에서 콘텐츠 생성 실패');
    throw new Error(`챕터 ${chapterNumber} 생성 실패: 모든 시도에서 품질 기준을 충족하지 못함`);
  }

  /**
   * 증분 개선 프롬프트 빌더
   */
  buildIncrementalPrompt(basePrompt, attempts, bestResult, cachedHistory, chapterNumber) {
    let enhancedPrompt = basePrompt;
    
    if (attempts === 1) {
      // 첫 번째 시도 - 기본 프롬프트 사용
      return enhancedPrompt;
    }

    // 이전 결과가 있는 경우 증분 개선 요청
    if (bestResult) {
      const previousWordCount = bestResult.content.replace(/\s+/g, '').length;
      const targetIncrease = Math.max(4000 - previousWordCount, 1500); // 최소 1500자 확장
      
      enhancedPrompt = `🔄 **CRITICAL: 증분 확장 모드 ${attempts}차** - 기존 콘텐츠 삭제 절대 금지

📖 **반드시 포함할 기존 콘텐츠** (${previousWordCount}자):
${bestResult.content}

🚨 **절대 규칙 (위반 시 실패)**:
1. 위 기존 콘텐츠를 **한 글자도 삭제하거나 수정하지 마세요**
2. 기존 내용을 **그대로 복사한 후** 추가 내용만 덧붙이세요
3. 목표: 기존 ${previousWordCount}자 + 추가 ${targetIncrease}자 = 총 4,000자

🎯 **작업 방법**:
STEP 1: 위 기존 콘텐츠를 **완전히 그대로** 복사
STEP 2: 기존 내용 **뒤에** 다음 내용 추가:
   - 기존 장면들 사이사이에 환경 묘사와 심리 서술 삽입
   - 캐릭터 대화 확장 및 행동 묘사 추가
   - 새로운 장면이나 회상 추가
   - 감정적 깊이와 로맨틱 긴장감 강화

⚡ **출력 형식**:
**챕터 제목:** [제목]
**본문:** 
[↓ 기존 ${previousWordCount}자를 그대로 복사 ↓]
${bestResult.content}
[↑ 기존 내용 끝 ↑]

[↓ 여기부터 ${targetIncrease}자 추가 확장 ↓]
[새로운 확장 내용...]

⚠️ 기존 콘텐츠를 수정하지 말고 **정확히 복사 + 확장**만 하세요!`;
    }

    // 캐시된 성공 패턴 활용
    if (cachedHistory.length > 0) {
      const bestCached = cachedHistory.reduce((best, current) => 
        current.score > best.score ? current : best
      );
      
      if (bestCached.successfulPatterns && bestCached.successfulPatterns.length > 0) {
        enhancedPrompt += `\n\n💡 **성공 패턴**: ${bestCached.successfulPatterns.join(', ')} 확장 적용`;
      }
    }

    return enhancedPrompt;
  }

  /**
   * 성공적인 패턴 추출
   */
  extractSuccessfulPatterns(content) {
    const patterns = [];
    
    // 대화 패턴 분석
    const dialogueMatches = content.match(/> "([^"]+)"/g);
    if (dialogueMatches && dialogueMatches.length >= 3) {
      patterns.push('충분한 대화량 (3회 이상 대화)');
    }
    
    // 내적 독백 패턴 분석
    const thoughtMatches = content.match(/> \*'([^']+)'\*/g);
    if (thoughtMatches && thoughtMatches.length >= 2) {
      patterns.push('풍부한 내적 독백');
    }
    
    // 굵은 글씨 강조 패턴
    const boldMatches = content.match(/\*\*([^*]+)\*\*/g);
    if (boldMatches && boldMatches.length >= 3) {
      patterns.push('적절한 강조 표현');
    }
    
    // 문단 수 분석
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length >= 5) {
      patterns.push('충분한 문단 구성');
    }
    
    return patterns;
  }


  /**
   * PLAN.md의 전략 3: 재귀적 자가 개선 (Recursive Self-Improvement)
   */
  async improveChapter(originalChapter, improvementCriteria) {
    const critiquePlot = `다음 챕터를 비평적으로 평가하세요:

${originalChapter}

평가 기준:
${improvementCriteria.map((criteria, i) => `${i + 1}. ${criteria}`).join('\n')}

각 기준에 대해 구체적인 약점을 3가지씩 지적해주세요.`;

    const critiqueResponse = await this.anthropicWithRetry({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: critiquePlot }]
    });

    const critique = critiqueResponse.content[0].type === 'text' ? critiqueResponse.content[0].text : '';

    const currentWordCount = originalChapter.replace(/\s+/g, '').length;
    const targetWordCount = Math.max(4000, currentWordCount + 1000); // 최소 1000자 확장
    
    const improvementPrompt = `🔧 **CRITICAL: 기존 챕터 확장 작업** - 삭제/수정 절대 금지

📖 **반드시 포함할 원본 챕터** (${currentWordCount}자):
${originalChapter}

🔍 **개선 포인트 분석**:
${critique}

🚨 **절대 규칙**:
1. 위 원본 챕터 내용을 **한 글자도 삭제/수정하지 마세요**
2. 원본을 **완전히 그대로 복사** 후 추가 내용만 덧붙이세요
3. 목표: 원본 ${currentWordCount}자 + 확장 ${targetWordCount - currentWordCount}자 = 총 ${targetWordCount}자

🎯 **확장 작업 방법**:
STEP 1: 원본 챕터를 **정확히 그대로** 복사
STEP 2: 원본 내용 뒤에 다음 확장 내용 추가:
   - 비평에서 지적된 부분 보완 (대화 개선, 묘사 강화 등)
   - 기존 장면들 사이에 감정적 깊이 추가
   - 환경 묘사와 캐릭터 심리 상세 서술
   - 로맨틱 긴장감과 스토리 연결성 강화

⚡ **출력 형식**:
[↓ 원본 ${currentWordCount}자를 그대로 복사 ↓]
${originalChapter}
[↑ 원본 내용 끝 ↑]

[↓ 여기부터 ${targetWordCount - currentWordCount}자 확장 내용 ↓]
[비평을 반영한 추가 장면과 개선된 표현들...]

⚠️ 원본을 수정하지 말고 **정확한 복사 + 확장**만 하세요!`;

    const improvementResponse = await this.anthropicWithRetry({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: improvementPrompt }]
    });

    return improvementResponse.content[0].type === 'text' ? improvementResponse.content[0].text : originalChapter;
  }

  /**
   * 캐릭터 설정 생성
   */
  async generateCharacterProfiles(title, tropes) {
    const prompt = `"${title}"이라는 로맨스 판타지 소설의 주요 인물들을 설정해주세요.

적용 트렌드: ${tropes.join(', ')}

다음 정보를 포함해서 각 캐릭터를 상세히 설정해주세요:
1. 이름과 나이
2. 외모와 특징
3. 성격과 가치관
4. 배경 스토리와 트라우마
5. 마법/특수 능력 (판타지 세계관)
6. 목표와 동기
7. 다른 캐릭터와의 관계

최소 주인공 2명과 조연 2명을 만들어주세요.`;

    const response = await this.anthropicWithRetry({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
}

// 환경 변수에서 API 키를 가져오는 헬퍼 함수
export function createStoryGenerator() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not found in environment variables');
    return null;
  }
  
  return new AIStoryGenerator(apiKey);
}