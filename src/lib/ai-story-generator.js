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

⚠️ 중요 요구사항 (반드시 준수):
1. **최소 3,000자 이상** 분량으로 작성하세요 (한글 기준, 공백 제외)
2. **대화를 충분히 포함**하여 캐릭터 간의 상호작용을 풍부하게 표현하세요 (전체의 30% 이상)
3. **감정 표현과 내적 독백**을 적극 활용하여 독자의 몰입도를 높이세요
4. **장면 묘사와 분위기 연출**을 구체적이고 생생하게 작성하세요
5. **갈등과 긴장감**을 통해 스토리의 흥미를 지속시키세요

📝 작성 가이드라인:
- 각 장면을 최소 300-500자로 상세히 묘사
- 캐릭터의 대화는 개성과 감정이 드러나도록 작성
- 내적 독백 형식: > *'생각 내용'* 을 적극 활용
- 대화 형식: > "대화 내용" 을 충분히 포함
- 행동 묘사: > [행동 설명] 으로 장면 전환
- **굵은 글씨**로 중요 단어나 캐릭터 이름 강조
- 감정과 분위기를 나타내는 형용사와 부사를 풍부하게 사용

🎯 품질 목표:
- 최소 3,000자 (필수)
- 대화 비율 30% 이상
- 감정 표현 키워드 2% 이상
- 생생한 장면 묘사와 캐릭터 개발
- 다음 챕터로 이어지는 훅 포함

출력 형식:
**챕터 제목:** [흥미진진한 제목]

**본문:**
[마크다운 형식의 스토리 본문 - 최소 3,000자 이상]`;

    let bestResult = null;
    let bestScore = 0;
    let attempts = 0;
    const maxAttempts = 3;

    // 강화된 품질 보장 생성 프로세스
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        // 첫 번째 시도는 표준 생성, 이후는 개선 요청 포함
        let enhancedPrompt = generationPrompt;
        
        if (attempts > 1 && bestResult) {
          // 이전 시도의 문제점을 바탕으로 프롬프트 강화
          const previousAssessment = await this.qualityEngine.assessQuality(bestResult.content);
          const issues = previousAssessment.issues.slice(0, 3); // 상위 3개 문제점만 포함
          
          enhancedPrompt += `\n\n⚡ 이전 시도에서 발견된 문제점을 반드시 해결하세요:\n${issues.map((issue, i) => `${i+1}. ${issue}`).join('\n')}\n\n특히 분량이 부족했다면 각 장면을 더 자세히 묘사하고, 대화와 내적 독백을 늘려주세요.`;
        }

        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 5000, // 토큰 한도 증가
          messages: [{ role: 'user', content: enhancedPrompt }]
        });

        const fullResponse = response.content[0].type === 'text' ? response.content[0].text : '';
        
        // 제목과 본문 분리
        const titleMatch = fullResponse.match(/\*\*챕터 제목:\*\*\s*(.+)/);
        const contentMatch = fullResponse.match(/\*\*본문:\*\*\s*([\s\S]+)/);
        
        const result = {
          title: titleMatch ? titleMatch[1].trim() : `제${chapterNumber}장`,
          content: contentMatch ? contentMatch[1].trim() : fullResponse
        };

        // 즉시 기본 검증 (분량 체크)
        const wordCount = result.content.replace(/\s+/g, '').length;
        if (wordCount < 2000) {
          console.log(`⚠️ 시도 ${attempts}: 분량 부족 (${wordCount}자) - 재시도 중...`);
          continue;
        }

        // 상세 품질 검사
        const qualityAssessment = await this.qualityEngine.assessQuality(result.content, {
          title: result.title,
          chapterNumber,
          expectedLength: 3000
        });

        console.log(`\n🔍 챕터 ${chapterNumber} 품질 평가 (시도 ${attempts}/${maxAttempts}):`);
        console.log(`📊 점수: ${qualityAssessment.score}/100 (분량: ${wordCount}자)`);
        console.log(`📋 상태: ${qualityAssessment.status}`);

        // 품질 기준 충족 시 즉시 반환
        if (qualityAssessment.score >= this.qualityEngine.qualityStandards.qualityThreshold) {
          console.log(`✅ 품질 기준 충족! 챕터 생성 완료`);
          return result;
        }

        // 최고 점수 기록 업데이트
        if (qualityAssessment.score > bestScore) {
          bestScore = qualityAssessment.score;
          bestResult = result;
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

    // 모든 시도가 품질 기준에 미달한 경우 최고 점수 결과 반환
    if (bestResult) {
      console.log(`⚠️ 품질 기준 미달이지만 최고 점수(${bestScore}/100) 결과 반환`);
      return bestResult;
    }

    throw new Error('챕터 생성에 완전히 실패했습니다.');
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