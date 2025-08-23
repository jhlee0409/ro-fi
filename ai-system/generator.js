/**
 * AI 생성 엔진 - Gemini API를 사용한 소설/챕터 생성
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export class Generator {
  constructor(config) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }

  // 새로운 소설 생성
  async createNewNovel() {
    const selectedTropes = this.selectRandomTropes();
    const prompt = this.buildNewNovelPrompt(selectedTropes);
    
    console.log(`📝 새 소설 생성 중... (트로프: ${selectedTropes.join(', ')})`);
    
    const response = await this.model.generateContent(prompt);
    const content = response.response.text();
    
    return this.parseNovelResponse(content, selectedTropes);
  }

  // 기존 소설 연재
  async continueNovel(slug, novel) {
    const prompt = this.buildContinuePrompt(slug, novel);
    
    console.log(`📖 ${novel.title} 연재 중... (${novel.chapterCount + 1}화)`);
    
    const response = await this.model.generateContent(prompt);
    const content = response.response.text();
    
    return this.parseChapterResponse(content, slug, novel);
  }

  // 소설 완결
  async completeNovel(slug, novel) {
    const prompt = this.buildCompletionPrompt(slug, novel);
    
    console.log(`🏁 ${novel.title} 완결 중...`);
    
    const response = await this.model.generateContent(prompt);
    const content = response.response.text();
    
    return this.parseChapterResponse(content, slug, novel, true);
  }

  selectRandomTropes() {
    const shuffled = this.config.tropes.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3 + Math.floor(Math.random() * 2)); // 3-4개 선택
  }

  buildNewNovelPrompt(tropes) {
    return `당신은 로맨스 판타지 웹소설 전문 작가입니다. 

다음 트로프들을 활용해 새로운 로맨스 판타지 소설을 기획하고 1화를 작성해주세요:
트로프: ${tropes.join(', ')}

요구사항:
1. 한국어로 작성
2. 현대적이고 매력적인 설정
3. 뚜렷한 캐릭터 2명 (주인공 + 상대역)
4. 1화 길이: ${this.config.chapterLength.target}자 내외
5. 감정적 몰입도가 높은 문체

다음 형식으로 응답해주세요:

=== NOVEL_INFO ===
제목: (매력적인 제목)
슬러그: (영문 slug, 소문자-하이픈)
요약: (100자 내외 요약)
주인공: (이름, 성격, 능력)
상대역: (이름, 성격, 능력)

=== CHAPTER_1 ===
제목: (1화 제목)
내용: (본문 내용 - ${this.config.chapterLength.target}자 내외)`;
  }

  buildContinuePrompt(slug, novel) {
    return `당신은 로맨스 판타지 웹소설 전문 작가입니다.

기존 소설 정보:
- 제목: ${novel.title}
- 현재 챕터: ${novel.chapterCount}화까지 완료
- 주요 캐릭터: ${JSON.stringify(novel.characters)}

다음 화(${novel.chapterCount + 1}화)를 작성해주세요.

요구사항:
1. 캐릭터명과 설정을 정확히 유지
2. 스토리 전개의 자연스러운 연결
3. 길이: ${this.config.chapterLength.target}자 내외
4. 로맨스 판타지다운 매력적인 전개

다음 형식으로 응답해주세요:

=== CHAPTER_${novel.chapterCount + 1} ===
제목: (챕터 제목)
내용: (본문 내용)`;
  }

  buildCompletionPrompt(slug, novel) {
    return `당신은 로맨스 판타지 웹소설 전문 작가입니다.

기존 소설 정보:
- 제목: ${novel.title}
- 현재까지: ${novel.chapterCount}화 완료
- 주요 캐릭터: ${JSON.stringify(novel.characters)}

이제 이 소설을 완결지어주세요. 최종화를 작성해주세요.

요구사항:
1. 모든 갈등 해결
2. 주인공들의 로맨스 성취
3. 만족스러운 결말
4. 길이: ${Math.floor(this.config.chapterLength.target * 1.2)}자 내외 (완결편은 조금 더 길게)

다음 형식으로 응답해주세요:

=== FINAL_CHAPTER ===
제목: (최종화 제목)
내용: (본문 내용)`;
  }

  parseNovelResponse(content, tropes) {
    const novelMatch = content.match(/=== NOVEL_INFO ===\n([\s\S]*?)\n=== CHAPTER_1 ===/);
    const chapterMatch = content.match(/=== CHAPTER_1 ===\n([\s\S]*)/);

    if (!novelMatch || !chapterMatch) {
      throw new Error('소설 파싱 실패');
    }

    const novelInfo = this.parseNovelInfo(novelMatch[1]);
    const chapterInfo = this.parseChapterInfo(chapterMatch[1]);

    return {
      type: 'new_novel',
      slug: novelInfo.slug,
      title: novelInfo.title,
      summary: novelInfo.summary,
      characters: { [novelInfo.protagonist]: '주인공', [novelInfo.love_interest]: '상대역' },
      tropes,
      chapter: {
        number: 1,
        title: chapterInfo.title,
        content: chapterInfo.content,
        wordCount: chapterInfo.content.length
      }
    };
  }

  parseChapterResponse(content, slug, novel, isCompletion = false) {
    const chapterMatch = content.match(/=== (?:CHAPTER_\d+|FINAL_CHAPTER) ===\n([\s\S]*)/);
    
    if (!chapterMatch) {
      throw new Error('챕터 파싱 실패');
    }

    const chapterInfo = this.parseChapterInfo(chapterMatch[1]);
    const chapterNumber = isCompletion ? novel.chapterCount + 1 : novel.chapterCount + 1;

    return {
      type: isCompletion ? 'completion' : 'chapter',
      slug,
      title: novel.title,
      characters: novel.characters,
      status: isCompletion ? '완결' : '연재 중',
      chapter: {
        number: chapterNumber,
        title: chapterInfo.title,
        content: chapterInfo.content,
        wordCount: chapterInfo.content.length
      },
      chapterNumber
    };
  }

  parseNovelInfo(infoText) {
    const lines = infoText.trim().split('\n');
    const info = {};
    
    lines.forEach(line => {
      const [key, ...values] = line.split(':');
      const value = values.join(':').trim();
      
      switch(key.trim()) {
        case '제목': info.title = value; break;
        case '슬러그': info.slug = value; break;
        case '요약': info.summary = value; break;
        case '주인공': info.protagonist = value.split(',')[0].trim(); break;
        case '상대역': info.love_interest = value.split(',')[0].trim(); break;
      }
    });

    return info;
  }

  parseChapterInfo(chapterText) {
    const lines = chapterText.trim().split('\n');
    const titleLine = lines.find(line => line.startsWith('제목:'));
    const contentStartIndex = lines.findIndex(line => line.startsWith('내용:'));
    
    return {
      title: titleLine ? titleLine.replace('제목:', '').trim() : '제목 없음',
      content: contentStartIndex >= 0 
        ? lines.slice(contentStartIndex + 1).join('\n').trim()
        : lines.slice(1).join('\n').trim()
    };
  }
}