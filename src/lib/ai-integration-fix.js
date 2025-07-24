// AI 통합 수정 패치
import Anthropic from '@anthropic-ai/sdk';

// AI 스토리 생성기 (간소화 버전)
class SimpleAIGenerator {
  constructor(apiKey) {
    this.anthropic = new Anthropic({ apiKey });
  }

  async generateChapter(options) {
    const prompt = `당신은 최고의 로맨스 판타지 작가입니다.

소설 정보:
- 제목: ${options.title}
- 트로프: ${options.tropes.join(', ')}
- 챕터: ${options.chapterNumber}화

다음 요구사항에 맞춰 ${options.chapterNumber}화를 작성해주세요:

1. 3,000-4,000자 분량
2. 감정적 몰입도가 높은 스토리
3. 캐릭터 간의 로맨틱 긴장감
4. 다음 화가 궁금해지는 클리프행어
5. 한국 독자들이 좋아하는 로판 스타일

출력 형식:
제목: [흥미진진한 제목]

[마크다운 형식의 본문]`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const fullText = response.content[0].text;
    const titleMatch = fullText.match(/제목:\s*(.+)/);
    const contentMatch = fullText.match(/제목:.*?\n\n([\s\S]+)/);

    return {
      title: titleMatch ? titleMatch[1].trim() : `${options.chapterNumber}화`,
      content: contentMatch ? contentMatch[1].trim() : fullText
    };
  }

  async improveChapter(content, criteria) {
    const prompt = `다음 챕터를 더 매력적으로 개선해주세요:

${content}

개선 기준:
${criteria.map((c, i) => `${i+1}. ${c}`).join('\n')}

더 감동적이고 몰입도 높은 버전으로 다시 작성해주세요.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].text;
  }
}

function createStoryGenerator() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new SimpleAIGenerator(apiKey);
}

export class AIIntegratedEngine {
  constructor() {
    this.aiGenerator = createStoryGenerator();
  }

  async generateRealChapter(novelSlug, chapterNumber, concept) {
    console.log(`🤖 실제 AI로 챕터 생성: ${novelSlug} ${chapterNumber}화`);

    if (!this.aiGenerator) {
      console.warn('⚠️ ANTHROPIC_API_KEY 없음 - 환경변수 확인 필요');
      return this.generateFallbackChapter(novelSlug, chapterNumber);
    }

    try {
      // AI로 실제 챕터 생성
      const result = await this.aiGenerator.generateChapter({
        title: concept.title || '로맨스 판타지',
        tropes: [concept.main || 'enemies-to-lovers', concept.sub || 'fated-mates'],
        chapterNumber,
        previousContext: '',
        characterContext: '주인공과 남주의 운명적 만남',
        plotOutline: `${concept.main} 트로프를 중심으로 한 로맨스 판타지`
      });

      // 품질 개선
      const improvedContent = await this.aiGenerator.improveChapter(result.content, [
        '감정적 깊이와 몰입도',
        '캐릭터 개성과 대화의 자연스러움',
        '로맨틱 긴장감과 설렘',
        '장면 묘사의 생생함'
      ]);

      return {
        frontmatter: {
          title: result.title,
          novel: novelSlug,
          chapterNumber,
          publicationDate: new Date().toISOString().split('T')[0],
          wordCount: this.calculateWordCount(improvedContent),
          rating: 0
        },
        content: improvedContent
      };

    } catch (error) {
      console.error('❌ AI 생성 실패:', error.message);
      return this.generateFallbackChapter(novelSlug, chapterNumber);
    }
  }

  generateFallbackChapter(novelSlug, chapterNumber) {
    const content = `# ${chapterNumber}화

**아리엘**은 **마법 아카데미**의 복도를 걸으며 오늘의 실습을 생각했다.

> *'오늘은 뭔가 특별한 일이 일어날 것 같은 예감이 든다.'*

> [갑자기 뒤에서 차가운 목소리가 들려왔다]

> "또 혼자 중얼거리고 있군."

**카엘**이 그녀의 뒤에 서 있었다. 그의 깊은 보라색 눈동자가 아리엘을 바라보고 있었다.

> "당신이야말로 왜 항상 나를 따라다니는 거죠?"

**아리엘**이 돌아서며 당당하게 말했다.

> *'왜 내 심장이 이렇게 빨리 뛰는 거지?'*

> [두 사람 사이에 긴장감이 흘렀다]

**마법진**이 갑자기 빛나기 시작했고, 두 사람의 운명이 얽히기 시작했다.`;

    return {
      frontmatter: {
        title: `${chapterNumber}화`,
        novel: novelSlug,
        chapterNumber,
        publicationDate: new Date().toISOString().split('T')[0],
        wordCount: this.calculateWordCount(content),
        rating: 0
      },
      content
    };
  }

  calculateWordCount(content) {
    return content.replace(/\s+/g, '').length;
  }
}