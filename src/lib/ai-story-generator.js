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

    const response = await this.anthropic.messages.create({
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

    const generationPrompt = `${contextPrompt}

당신은 숙련된 로맨스 판타지 작가입니다. 위의 컨텍스트를 바탕으로 ${chapterNumber}챕터를 작성하세요.

🚨 분량 기준 - 절대 준수 필요:
- **최소 3,000자 이상** 분량 (한글 기준, 공백 제외) - 이는 품질의 핵심 지표입니다
- 현재 1,500-2,000자로 생성되고 있어 기준 미달입니다. 반드시 3,000자 이상으로 작성하세요

📖 구체적 작성 전략:
1. **5개 이상의 장면**으로 구성하여 각 장면당 600-800자씩 작성
2. **대화 확장**: 각 대화마다 3-5번의 주고받기 포함
3. **내적 독백 풍부화**: 캐릭터의 심리 묘사를 최소 5회 이상 포함
4. **감각적 묘사 강화**: 시각, 청각, 촉각, 후각 등 오감을 활용한 환경 묘사
5. **회상과 설명**: 과거 사건이나 배경 설정을 자연스럽게 포함

✍️ 분량 확보 기법:
- 한 장면의 시작과 끝을 명확히 구분하여 상세히 묘사
- 캐릭터의 표정, 몸짓, 톤의 변화를 구체적으로 서술
- 대화 사이사이에 행동과 감정 묘사 삽입
- 환경과 분위기를 생생하게 그려내어 독자의 몰입감 증대
- 갈등 상황에서의 긴장감을 여러 단락에 걸쳐 천천히 고조

🎯 최종 검증:
작성 완료 후 다음을 확인하세요:
- 글자 수가 3,000자 이상인가?
- 5개 이상의 명확한 장면이 있는가?
- 대화와 내적 독백이 충분한가?
- 각 문단이 충실하게 작성되었는가?

출력 형식:
**챕터 제목:** [흥미진진한 제목]

**본문:**
[마크다운 형식의 스토리 본문 - 최소 3,000자 이상]`;

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

        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 12000, // 한글 3000자+ 생성을 위해 대폭 증가
          messages: [{ role: 'user', content: enhancedPrompt }],
          temperature: 0.7, // 창의성과 일관성의 균형
          top_p: 0.9
        });

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
        if (wordCount < 3000) {
          const percentage = Math.round((wordCount / 3000) * 100);
          console.log(`⚠️ 분량 미달: ${wordCount}자 (목표의 ${percentage}%) - 재시도 필요`);
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

    // bestResult가 null인 경우를 방지하기 위한 안전장치
    console.error('❌ 모든 시도에서 결과 생성 실패 - 최소한의 콘텐츠라도 생성하여 반환');
    
    // 최소한의 기본 콘텐츠 생성
    const fallbackContent = this.generateFallbackContent(chapterNumber);
    return {
      title: `${chapterNumber}화`,
      content: fallbackContent
    };
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
      const targetIncrease = Math.max(3000 - previousWordCount, previousWordCount * 0.5);
      
      enhancedPrompt += `\n\n🔄 증분 개선 모드 (시도 ${attempts}):
이전 최고 결과: ${previousWordCount}자 (목표: 3,000자)
필요 증가량: 최소 ${Math.round(targetIncrease)}자

🚨 **절대 준수 요구사항** - 이는 품질의 핵심입니다:
- **최소 3,000자 이상 필수** (현재 ${previousWordCount}자는 기준 미달)
- 현재 ${Math.round((previousWordCount/3000)*100)}%만 달성, ${100 - Math.round((previousWordCount/3000)*100)}% 더 확장 필요
- 분량 부족은 품질 실패로 간주됩니다

🎯 단계적 확장 전략 (목표: ${previousWordCount + Math.round(targetIncrease)}자 이상):
1. **장면 수 늘리기**: 기존 장면을 3-5개로 분할하여 각각 600-800자씩
2. **대화 대폭 확장**: 기존 한 줄 대화를 5-7번 주고받기로 확장
3. **내적 독백 3배 증가**: 각 감정 변화마다 최소 2-3문장 심리 묘사
4. **환경 묘사 강화**: 5감을 활용한 상세한 배경 설정과 분위기 묘사
5. **회상 장면 추가**: 과거 사건이나 배경 설정을 자연스럽게 포함

⚡ 실전 확장 기법:
- 한 장면을 시작-전개-절정-마무리로 4단계 구성
- 대화 사이마다 행동, 표정, 몸짓, 환경 반응 삽입
- 감정 변화를 여러 문단에 걸쳐 점진적으로 서술
- 긴장감 고조를 위한 세밀한 타이밍 조절
- 캐릭터의 과거와 현재를 연결하는 회상 장면

💯 성공 조건: 3,000자 이상 + 5개 이상 장면 + 풍부한 대화와 심리묘사`;
    }

    // 캐시된 성공 패턴 활용
    if (cachedHistory.length > 0) {
      const bestCached = cachedHistory.reduce((best, current) => 
        current.score > best.score ? current : best
      );
      
      if (bestCached.successfulPatterns && bestCached.successfulPatterns.length > 0) {
        enhancedPrompt += `\n\n💡 검증된 성공 패턴 활용:
다음 요소들은 이전에 좋은 평가를 받은 패턴들입니다:
${bestCached.successfulPatterns.map((pattern, i) => `${i+1}. ${pattern}`).join('\n')}

이러한 패턴들을 더욱 확장하고 발전시켜 활용하세요!`;
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
   * 폴백 콘텐츠 생성 (최후의 안전장치)
   */
  generateFallbackContent(chapterNumber) {
    return `# ${chapterNumber}화

안전장치로 생성된 기본 콘텐츠입니다.

**주인공**은 복잡한 상황에 처해 있었다. 마음속 깊은 곳에서는 여러 감정이 교차하고 있었다.

> *'이 상황을 어떻게 해결해야 할까?'*

**주인공**이 생각에 잠겼다.

> "이제 어떻게 해야 하지?"

**주인공**이 중얼거렸다. 주변의 분위기는 긴장감으로 가득했다.

[장면이 천천히 전개되었다]

**남주**가 나타났다. 두 사람 사이에는 미묘한 긴장감이 흘렀다.

> "예상했던 일이야."

**남주**가 차분하게 말했다.

> *'그의 말투에서 뭔가 다른 감정이 느껴진다.'*

**주인공**은 그를 바라보며 생각했다.

대화가 이어지며 두 사람 사이의 관계가 조금씩 변화하기 시작했다. 이것은 앞으로 펼쳐질 이야기의 중요한 전환점이 될 것이었다.

**다음 화에서 계속...**

(이 콘텐츠는 AI 생성 실패 시 제공되는 기본 콘텐츠입니다. 실제 서비스에서는 고품질 샘플로 대체됩니다.)`;
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

    const critiqueResponse = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: critiquePlot }]
    });

    const critique = critiqueResponse.content[0].type === 'text' ? critiqueResponse.content[0].text : '';

    const improvementPrompt = `원본 챕터:
${originalChapter}

비평 내용:
${critique}

지적된 약점을 해결하여 챕터를 다시 작성하세요. 특히 다음 사항을 개선해주세요:
- 대화를 더 날카롭고 캐릭터 개성이 드러나게 만들기
- 로맨틱한 긴장감과 감정적 몰입도 높이기
- 장면 묘사를 더 생생하고 구체적으로 표현하기

개선된 버전을 제공해주세요.`;

    const improvementResponse = await this.anthropic.messages.create({
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

    const response = await this.anthropic.messages.create({
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