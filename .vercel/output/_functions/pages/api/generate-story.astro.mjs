import Anthropic from '@anthropic-ai/sdk';
export { renderers } from '../../renderers.mjs';

const TROPE_PROMPTS = {
  "enemies-to-lovers": {
    conflict: "이념적/개인적 경쟁 관계",
    keyScenes: ["강제적인 협력 상황", "증오에도 불구하고 서로를 구출", "공통의 약점 발견"],
    motivationA: "우월함 증명, 목표 달성",
    motivationB: "경쟁자 타도, 자신을 보호"
  },
  "fated-mates": {
    conflict: "둘을 갈라놓으려는 외부 세력",
    keyScenes: ["예언의 발견", "거부할 수 없는 마법적 이끌림", "꿈의 공유"],
    motivationA: "처음에는 운명을 거부, 이후 숙명을 받아들임",
    motivationB: "운명을 받아들이고 짝을 보호"
  },
  "regression": {
    conflict: "비극적 미래에 대한 지식 vs 모든 것을 바꿀 수 없는 한계",
    keyScenes: ["핵심적인 실패의 재경험", "미래 지식을 이용한 힘/동맹 확보", "특정 인물의 죽음 방지"],
    motivationA: "속죄, 복수, 사랑하는 사람 구하기",
    motivationB: "(회귀 사실을 모르므로) 기존 행동 패턴 반복"
  }
};
class AIStoryGenerator {
  anthropic;
  constructor(apiKey) {
    this.anthropic = new Anthropic({
      apiKey
    });
  }
  /**
   * PLAN.md의 전략 1: Chain-of-Thought를 활용한 플롯 구성
   */
  async generatePlotOutline(title, tropes) {
    const tropeDetails = tropes.map((trope) => TROPE_PROMPTS[trope]).filter(Boolean);
    const prompt = `당신은 로맨스 판타지 전문 작가입니다. 단계별로 생각해서 작성해주세요.

소설 제목: "${title}"
적용할 트렌드: ${tropes.join(", ")}

트렌드 세부 정보:
${tropeDetails.map((detail, i) => `
${tropes[i]}:
- 핵심 갈등: ${detail.conflict}
- 주요 장면: ${detail.keyScenes.join(", ")}
- 캐릭터 A 동기: ${detail.motivationA}
- 캐릭터 B 동기: ${detail.motivationB}
`).join("\n")}

다음 단계로 50챕터 분량 소설의 10단계 플롯 개요를 생성하세요:

1. 먼저 주인공들의 기본 설정과 배경을 정하세요
2. 각 트렌드가 어떻게 서로 연결될지 분석하세요  
3. 로맨스 발전 단계를 계획하세요
4. 갈등의 고조와 해결 과정을 설계하세요
5. 10단계로 나누어 각 단계별 핵심 사건을 정리하세요

각 단계는 5챕터 정도의 분량으로 계획해주세요.`;
    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4e3,
      messages: [{ role: "user", content: prompt }]
    });
    return response.content[0].type === "text" ? response.content[0].text : "";
  }
  /**
   * PLAN.md의 전략 2: 컨텍스트 주입과 역할 부여
   */
  async generateChapter(options) {
    const { title, tropes, chapterNumber = 1, previousContext = "", characterContext = "", plotOutline = "" } = options;
    const contextPrompt = `
**소설 정보:**
- 제목: ${title}
- 적용 트렌드: ${tropes.join(", ")}
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

요구사항:
1. 약 2,500단어 분량으로 작성하세요
2. 캐릭터의 감정과 내적 갈등을 세밀하게 묘사하세요
3. 적용된 트렌드의 특성을 자연스럽게 드러내세요
4. 독자의 몰입도를 높이는 생생한 장면 묘사를 포함하세요
5. 다음 챕터로 이어지는 훅(Hook)을 남기세요

출력 형식:
**챕터 제목:** [흥미진진한 제목]

**본문:**
[마크다운 형식의 스토리 본문]`;
    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4e3,
      messages: [{ role: "user", content: generationPrompt }]
    });
    const fullResponse = response.content[0].type === "text" ? response.content[0].text : "";
    const titleMatch = fullResponse.match(/\*\*챕터 제목:\*\*\s*(.+)/);
    const contentMatch = fullResponse.match(/\*\*본문:\*\*\s*([\s\S]+)/);
    return {
      title: titleMatch ? titleMatch[1].trim() : `제${chapterNumber}장`,
      content: contentMatch ? contentMatch[1].trim() : fullResponse
    };
  }
  /**
   * PLAN.md의 전략 3: 재귀적 자가 개선 (Recursive Self-Improvement)
   */
  async improveChapter(originalChapter, improvementCriteria) {
    const critiquePlot = `다음 챕터를 비평적으로 평가하세요:

${originalChapter}

평가 기준:
${improvementCriteria.map((criteria, i) => `${i + 1}. ${criteria}`).join("\n")}

각 기준에 대해 구체적인 약점을 3가지씩 지적해주세요.`;
    const critiqueResponse = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2e3,
      messages: [{ role: "user", content: critiquePlot }]
    });
    const critique = critiqueResponse.content[0].type === "text" ? critiqueResponse.content[0].text : "";
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
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4e3,
      messages: [{ role: "user", content: improvementPrompt }]
    });
    return improvementResponse.content[0].type === "text" ? improvementResponse.content[0].text : originalChapter;
  }
  /**
   * 캐릭터 설정 생성
   */
  async generateCharacterProfiles(title, tropes) {
    const prompt = `"${title}"이라는 로맨스 판타지 소설의 주요 인물들을 설정해주세요.

적용 트렌드: ${tropes.join(", ")}

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
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 3e3,
      messages: [{ role: "user", content: prompt }]
    });
    return response.content[0].type === "text" ? response.content[0].text : "";
  }
}
function createStoryGenerator() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not found in environment variables");
    return null;
  }
  return new AIStoryGenerator(apiKey);
}

const POST = async ({ request }) => {
  try {
    const generator = createStoryGenerator();
    if (!generator) {
      return new Response(JSON.stringify({
        error: "AI Story Generator is not configured. Please check ANTHROPIC_API_KEY."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { action, ...options } = body;
    let result;
    switch (action) {
      case "generate-plot":
        result = await generator.generatePlotOutline(options.title, options.tropes);
        break;
      case "generate-chapter":
        result = await generator.generateChapter(options);
        break;
      case "improve-chapter":
        result = await generator.improveChapter(options.originalChapter, options.improvementCriteria);
        break;
      case "generate-characters":
        result = await generator.generateCharacterProfiles(options.title, options.tropes);
        break;
      default:
        return new Response(JSON.stringify({
          error: "Invalid action. Supported actions: generate-plot, generate-chapter, improve-chapter, generate-characters"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Story generation error:", error);
    return new Response(JSON.stringify({
      error: "Story generation failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
