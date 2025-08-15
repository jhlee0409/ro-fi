#!/usr/bin/env node

/**
 * 🌟 완전 새로운 Gemini API 기반 로맨스 판타지 자동 연재 시스템 v2.0
 * 
 * ✨ 특징:
 * - 100% Gemini API 직접 호출 (@google/generative-ai)
 * - GitHub Actions 완전 자동화
 * - 실제 프로덕션 품질의 로맨스 판타지 소설/챕터 생성
 * - 스마트 우선순위 로직 (완결 > 연재 > 신규)
 * - Git 자동 커밋/푸시
 * - 고품질 메타데이터 관리
 * - Gemini의 긴 컨텍스트와 빠른 응답 활용
 * 
 * 🚀 사용법:
 * node scripts/ai-novel-generator.js [--mode auto|new_novel|continue_chapter|complete_novel] [--creativity low|medium|high] [--dry-run] [--verbose]
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// 환경변수 로드 (GitHub Actions와 로컬 환경 모두 지원)
dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

// 설정
const CONFIG = {
  API_KEY: process.env.GEMINI_API_KEY,
  MODEL: 'gemini-1.5-pro',
  MAX_TOKENS: 8000,
  TEMPERATURE: 0.8,
  NOVEL_DIR: join(PROJECT_ROOT, 'src/content/novels'),
  CHAPTER_DIR: join(PROJECT_ROOT, 'src/content/chapters'),
  LOGS_DIR: join(PROJECT_ROOT, 'logs'),
  MIN_CHAPTER_WORDS: 4000,
  MAX_CHAPTER_WORDS: 6000,
  COMPLETION_CHAPTER_THRESHOLD: 50,
  MAX_ACTIVE_NOVELS: 2,
  UPDATE_THRESHOLD_DAYS: 3
};

// 로맨스 판타지 트로프와 장르 정의
const ROMANCE_TROPES = [
  'enemies-to-lovers', '계약연애', '정략결혼', '회귀', '빙의', '환생',
  '아카데미', '신분차이', '운명의상대', '소울메이트', '마법적연결',
  '복수와구원', '금지된사랑', '시간역행', '이계전이', '능력각성'
];

const NOVEL_THEMES = [
  '황실로맨스', '마법아카데미', '기사와귀족', '용족황제', '마도사학원',
  '엘프왕국', '시간여행자', '전생귀족영애', '마탑의마법사', '신전의성녀'
];

class Logger {
  constructor(verbose = false) {
    this.verbose = verbose;
    this.logFile = join(CONFIG.LOGS_DIR, `ai-novel-${new Date().toISOString().split('T')[0]}.log`);
    this.ensureLogDir();
  }

  async ensureLogDir() {
    try {
      await fs.mkdir(CONFIG.LOGS_DIR, { recursive: true });
    } catch (error) {
      // 디렉토리가 이미 존재하는 경우 무시
    }
  }

  async log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    const logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}${data ? ` | ${JSON.stringify(data)}` : ''}\n`;

    if (this.verbose || level === 'ERROR') {
      console.log(logLine.trim());
    }

    try {
      await fs.appendFile(this.logFile, logLine);
    } catch (error) {
      console.error('로그 파일 쓰기 실패:', error);
    }
  }

  info(message, data) { return this.log('INFO', message, data); }
  warn(message, data) { return this.log('WARN', message, data); }
  error(message, data) { return this.log('ERROR', message, data); }
  success(message, data) { return this.log('SUCCESS', message, data); }
}

class ContentAnalyzer {
  constructor(logger) {
    this.logger = logger;
  }

  async analyzeCurrentState() {
    await this.logger.info('현재 연재 상황 분석 시작');

    const novels = await this.loadAllNovels();
    const chapters = await this.loadAllChapters();

    const analysis = {
      novels: novels.map(novel => ({
        ...novel,
        chapterCount: chapters.filter(ch => ch.novel === novel.slug).length,
        lastUpdate: this.getLastUpdateDate(novel.slug, chapters),
        daysSinceUpdate: this.getDaysSinceUpdate(novel.slug, chapters),
        canComplete: this.canCompleteNovel(novel.slug, chapters),
        needsUpdate: this.needsUpdate(novel.slug, chapters)
      })),
      totalNovels: novels.length,
      activeNovels: novels.filter(n => n.status === '연재 중').length,
      totalChapters: chapters.length,
      completableNovels: novels.filter(n => this.canCompleteNovel(n.slug, chapters)).length,
      updateNeededNovels: novels.filter(n => this.needsUpdate(n.slug, chapters)).length
    };

    await this.logger.info('분석 완료', analysis);
    return analysis;
  }

  async loadAllNovels() {
    try {
      const files = await fs.readdir(CONFIG.NOVEL_DIR);
      const novels = [];

      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(join(CONFIG.NOVEL_DIR, file), 'utf-8');
          const { data } = matter(content);
          novels.push({
            slug: file.replace('.md', ''),
            ...data
          });
        }
      }

      return novels;
    } catch (error) {
      await this.logger.warn('소설 파일 로드 실패', { error: error.message });
      return [];
    }
  }

  async loadAllChapters() {
    try {
      const files = await fs.readdir(CONFIG.CHAPTER_DIR);
      const chapters = [];

      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(join(CONFIG.CHAPTER_DIR, file), 'utf-8');
          const { data } = matter(content);
          chapters.push({
            filename: file,
            ...data
          });
        }
      }

      return chapters.sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));
    } catch (error) {
      await this.logger.warn('챕터 파일 로드 실패', { error: error.message });
      return [];
    }
  }

  getLastUpdateDate(novelSlug, chapters) {
    const novelChapters = chapters.filter(ch => ch.novel === novelSlug);
    if (novelChapters.length === 0) return null;
    return novelChapters[0].publicationDate;
  }

  getDaysSinceUpdate(novelSlug, chapters) {
    const lastUpdate = this.getLastUpdateDate(novelSlug, chapters);
    if (!lastUpdate) return Infinity;
    
    const now = new Date();
    const lastUpdateDate = new Date(lastUpdate);
    return Math.floor((now - lastUpdateDate) / (1000 * 60 * 60 * 24));
  }

  canCompleteNovel(novelSlug, chapters) {
    const chapterCount = chapters.filter(ch => ch.novel === novelSlug).length;
    return chapterCount >= CONFIG.COMPLETION_CHAPTER_THRESHOLD;
  }

  needsUpdate(novelSlug, chapters) {
    const daysSince = this.getDaysSinceUpdate(novelSlug, chapters);
    return daysSince >= CONFIG.UPDATE_THRESHOLD_DAYS;
  }
}

class NovelGenerator {
  constructor(logger) {
    this.logger = logger;
    this.genAI = new GoogleGenerativeAI(CONFIG.API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: CONFIG.MODEL,
      generationConfig: {
        maxOutputTokens: CONFIG.MAX_TOKENS,
      }
    });
  }

  async generateContent(prompt, creativity = 'high') {
    const temperatureMap = {
      low: 0.4,
      medium: 0.7,
      high: 0.9
    };

    try {
      await this.logger.info('Gemini API 호출 시작', { creativity, model: CONFIG.MODEL });

      // Gemini용 프롬프트 최적화
      const optimizedPrompt = `당신은 세계 최고의 로맨스 판타지 작가입니다. 한국어로 자연스럽고 감동적인 소설을 작성해주세요.

${prompt}

중요: 
- 모든 응답은 한국어로 작성
- 감정적 깊이와 몰입감 있는 문체 사용
- 로맨스 판타지 장르의 특징을 살린 창의적 표현
- 독자가 다음 내용이 궁금해지는 스토리텔링`;

      // Gemini API 호출
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: optimizedPrompt }] }],
        generationConfig: {
          temperature: temperatureMap[creativity] || 0.7,
          maxOutputTokens: CONFIG.MAX_TOKENS,
        }
      });

      const response = await result.response;
      const content = response.text();
      
      await this.logger.success('Gemini API 호출 성공', { 
        candidateCount: response.candidates?.length || 1,
        promptFeedback: response.promptFeedback 
      });
      
      return content;

    } catch (error) {
      await this.logger.error('Gemini API 호출 실패', { error: error.message });
      throw new Error(`Gemini API 오류: ${error.message}`);
    }
  }

  async createNewNovel(creativity = 'high') {
    await this.logger.info('새 소설 생성 시작');

    const theme = NOVEL_THEMES[Math.floor(Math.random() * NOVEL_THEMES.length)];
    const tropes = this.selectRandomTropes(3);

    const prompt = `
# 📚 로맨스 판타지 신작 소설 창작 미션

당신은 한국의 1위 웹소설 플랫폼에서 연재하는 베스트셀러 로맨스 판타지 작가입니다.
수백만 독자들이 열광하는 작품을 연재해온 경험을 바탕으로, 완전히 새로운 히트작을 만들어주세요.

## 🎯 창작 조건
- **테마**: ${theme}
- **핵심 트로프**: ${tropes.join(', ')}
- **목표 독자**: 20-30대 한국 여성 (로맨스 판타지 마니아)
- **연재 목표**: 일일 조회수 10만+ 달성 가능한 작품

## 📋 필수 출력 형식

=== METADATA ===
TITLE: [독자들이 클릭하지 않을 수 없는 매력적인 제목]
SLUG: [영문-소문자-하이픈-url-safe]
SUMMARY: [SNS 공유되고 싶어지는 설득력 있는 200자 소개글]
TROPES: [${tropes.map(t => `"${t}"`).join(', ')}]

=== CHAPTER 1 ===
CHAPTER_TITLE: [1화 제목 - 독자 관심 유발]
WORD_COUNT: [정확한 글자 수]

[5000-6000자의 완벽한 1화 본문]

## 🔥 창작 지침 (반드시 준수)

### 스토리텔링 원칙
1. **첫 문장부터 강력한 임팩트** - 독자가 스크롤을 멈추게 하는 오프닝
2. **주인공의 매력 어필** - 독자가 감정이입할 수 있는 캐릭터
3. **남주의 신비로운 등장** - 호기심과 설렘을 동시에 자극
4. **세계관의 자연스러운 소개** - 정보 덤핑 없이 몰입감 있게
5. **갈등과 긴장감 조성** - 다음 화가 궁금해지는 구조

### 문체 및 표현
- **감정 몰입형 3인칭 시점** 사용
- **생생한 묘사와 섬세한 심리 표현**
- **독자가 상황을 그림으로 그릴 수 있을 정도의 구체적 묘사**
- **로맨스 판타지 특유의 달콤하고 몽환적인 분위기**
- **적절한 긴장감과 설렘 포인트 배치**

### 2025년 트렌드 반영
- 독립적이고 주체적인 여주인공
- 과도한 갑질 없는 매력적인 남주
- 건강한 관계 dynamics
- 현대적 감수성이 담긴 대화와 상황

지금부터 한국 웹소설 역사에 남을 대작의 1화를 창작해주세요! 🌟
`;

    const response = await this.generateContent(prompt, creativity);
    return this.parseNovelResponse(response);
  }

  async continueNovel(novelSlug, existingChapters, creativity = 'medium') {
    await this.logger.info('소설 연재 계속', { novelSlug });

    // 기존 챕터들 읽기
    const lastChapters = existingChapters
      .filter(ch => ch.novel === novelSlug)
      .slice(0, 3) // 최근 3화
      .reverse(); // 시간순 정렬

    const nextChapterNumber = existingChapters.filter(ch => ch.novel === novelSlug).length + 1;

    const contextContent = await this.buildChapterContext(lastChapters);

    const prompt = `
# 📖 연재 소설 ${nextChapterNumber}화 집필 미션

당신은 이 인기 로맨스 판타지 소설의 원작자입니다.
독자들이 매주 기다리는 이 작품의 다음 화를 완벽하게 이어가주세요.

## 📚 기존 스토리 흐름 분석
${contextContent}

## 🎯 ${nextChapterNumber}화 집필 목표

### 핵심 미션
- **연속성**: 이전 화와 자연스럽게 연결되는 스토리 진행
- **몰입감**: 독자가 계속 읽을 수밖에 없는 전개
- **캐릭터 일관성**: 기존 설정과 성격을 정확히 유지
- **감정 몰입**: 독자의 감정을 깊이 자극하는 장면들
- **다음화 기대감**: 궁금증을 유발하는 마무리

### 분량 및 구성
- **목표 분량**: 4000-5000자 (독자가 만족할 적정 길이)
- **구성**: 기승전결이 있는 완결성 있는 한 화
- **리듬**: 적절한 긴장과 이완의 리듬감

## 📋 출력 형식

=== CHAPTER ${nextChapterNumber} ===
CHAPTER_TITLE: [독자들이 클릭하고 싶어지는 ${nextChapterNumber}화 제목]
WORD_COUNT: [정확한 글자 수]

[4000-5000자의 완벽한 ${nextChapterNumber}화 본문]

## 🔥 집필 지침

### 스토리텔링 요구사항
1. **이전 화의 여운을 자연스럽게 이어받기**
2. **캐릭터 관계의 미묘한 발전 보여주기**
3. **새로운 갈등이나 반전 요소 추가**
4. **독자의 설렘과 긴장감을 동시에 자극**
5. **다음 화에 대한 강력한 기대감 조성**

### 문체 및 연출
- 기존 화들과 동일한 문체와 어조 유지
- 캐릭터별 고유한 말투와 행동 패턴 일관성
- 생생한 묘사로 장면을 그림처럼 그려내기
- 내적 독백과 대화의 적절한 균형
- 감정적 클라이맥스와 여운 있는 마무리

이제 독자들이 열광할 ${nextChapterNumber}화를 집필해주세요! ✨
`;

    const response = await this.generateContent(prompt, creativity);
    return this.parseChapterResponse(response, novelSlug, nextChapterNumber);
  }

  async completeNovel(novelSlug, existingChapters, creativity = 'high') {
    await this.logger.info('소설 완결 처리', { novelSlug });

    const novelChapters = existingChapters.filter(ch => ch.novel === novelSlug);
    const lastChapters = novelChapters.slice(0, 5).reverse(); // 최근 5화 컨텍스트
    const nextChapterNumber = novelChapters.length + 1;

    const contextContent = await this.buildChapterContext(lastChapters);

    const prompt = `
# 🏆 대망의 완결편 집필 미션

드디어 이 대작 로맨스 판타지 소설을 완결시킬 시간이 왔습니다!
수많은 독자들이 기다려온 최고의 피날레를 선사해주세요.

## 📚 전체 스토리 흐름 정리
${contextContent}

## 🎯 완결편 집필 전략

### 완결 구성안 (2-3화 구조)
1. **클라이맥스 챕터** - 모든 갈등과 미스터리의 폭발적 해결
2. **해피엔딩 챕터** - 주인공과 남주의 완벽한 결합
3. **에필로그** (선택사항) - 훗날의 행복한 모습

### ${nextChapterNumber}화 미션 (첫 번째 완결 챕터)
이 챕터에서 달성해야 할 목표:

#### 🔥 감정적 클라이맥스 연출
- 지금까지 쌓인 모든 감정을 폭발시키는 장면
- 독자들이 울고 웃을 수 있는 카타르시스
- 주인공과 남주의 진심어린 고백과 화해

#### 🧩 플롯 완벽 해결
- 남아있던 모든 갈등과 오해 해소
- 숨겨진 비밀이나 정체성 완전 공개
- 외부 장애물의 극적인 해결

#### 💕 로맨스 완성
- 두 사람의 사랑이 확실히 성취되는 장면
- 독자가 만족할 만한 감동적인 사랑 확인
- 미래에 대한 희망적인 암시

## 📋 출력 형식

=== COMPLETION CHAPTER ${nextChapterNumber} ===
CHAPTER_TITLE: [독자들의 심장을 뛰게 할 ${nextChapterNumber}화 제목]
WORD_COUNT: [정확한 글자 수]
IS_FINAL: [이것이 최종화면 true, 아니면 false]

[4000-5000자의 완벽한 완결 챕터 본문]

## 🌟 완결편 집필 지침

### 감정적 완성도
- 독자들이 눈물을 흘릴 만한 감동적인 순간들
- 캐릭터들의 성장과 변화가 드러나는 장면
- 사랑의 진정성을 확인할 수 있는 대사와 행동
- 모든 독자가 "정말 잘 끝났다"고 말할 수 있는 만족감

### 스토리 완결성
- 던져진 모든 떡밥과 복선의 깔끔한 회수
- 등장인물들의 운명과 미래에 대한 명확한 정리
- 세계관의 완결성과 논리적 일관성
- 다음 에피소드나 후속작에 대한 여지 (선택사항)

### 문학적 완성도
- 처음부터 지금까지의 여정이 느껴지는 서술
- 캐릭터의 내적 성장이 드러나는 독백
- 상징적이고 인상적인 마지막 장면
- 독자들이 오래도록 기억할 명문장

이제 독자들의 가슴에 영원히 남을 최고의 완결편을 써주세요! 🎊
`;

    const response = await this.generateContent(prompt, creativity);
    return this.parseChapterResponse(response, novelSlug, nextChapterNumber, true);
  }

  async buildChapterContext(chapters) {
    if (chapters.length === 0) return '(기존 챕터 없음)';

    let context = '';
    for (const chapter of chapters) {
      try {
        const filePath = join(CONFIG.CHAPTER_DIR, chapter.filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const { content: chapterContent } = matter(content);
        
        context += `\n--- ${chapter.title} (${chapter.chapterNumber}화) ---\n`;
        context += chapterContent.substring(0, 1000) + '...\n';
      } catch (error) {
        await this.logger.warn('챕터 파일 읽기 실패', { filename: chapter.filename });
      }
    }

    return context;
  }

  selectRandomTropes(count) {
    const shuffled = [...ROMANCE_TROPES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  parseNovelResponse(response) {
    const metadataMatch = response.match(/=== METADATA ===([\s\S]*?)=== CHAPTER 1 ===/);
    const chapterMatch = response.match(/=== CHAPTER 1 ===([\s\S]*?)$/);

    if (!metadataMatch || !chapterMatch) {
      throw new Error('AI 응답 파싱 실패: 필요한 섹션을 찾을 수 없습니다');
    }

    const metadata = this.parseMetadata(metadataMatch[1]);
    const chapter = this.parseChapter(chapterMatch[1], metadata.slug, 1);

    return { metadata, chapter };
  }

  parseChapterResponse(response, novelSlug, chapterNumber, isCompletion = false) {
    const chapterMatch = response.match(/=== (?:CHAPTER|COMPLETION CHAPTER) \d+ ===([\s\S]*?)$/);
    
    if (!chapterMatch) {
      throw new Error('AI 응답 파싱 실패: 챕터 섹션을 찾을 수 없습니다');
    }

    return this.parseChapter(chapterMatch[1], novelSlug, chapterNumber, isCompletion);
  }

  parseMetadata(metadataText) {
    const lines = metadataText.trim().split('\n');
    const metadata = {};

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        const cleanKey = key.trim().toLowerCase();

        switch (cleanKey) {
          case 'title':
            metadata.title = value;
            break;
          case 'slug':
            metadata.slug = value;
            break;
          case 'summary':
            metadata.summary = value;
            break;
          case 'tropes':
            metadata.tropes = this.parseTropesArray(value);
            break;
        }
      }
    }

    return metadata;
  }

  parseChapter(chapterText, novelSlug, chapterNumber, isCompletion = false) {
    const lines = chapterText.trim().split('\n');
    let title = '';
    let wordCount = 0;
    let isFinal = false;
    let content = '';
    let contentStarted = false;

    for (const line of lines) {
      if (line.startsWith('CHAPTER_TITLE:')) {
        title = line.replace('CHAPTER_TITLE:', '').trim();
      } else if (line.startsWith('WORD_COUNT:')) {
        wordCount = parseInt(line.replace('WORD_COUNT:', '').trim()) || 0;
      } else if (line.startsWith('IS_FINAL:')) {
        isFinal = line.replace('IS_FINAL:', '').trim() === 'true';
      } else if (line.trim() === '' && !contentStarted) {
        contentStarted = true;
      } else if (contentStarted) {
        content += line + '\n';
      }
    }

    return {
      title: title || `${chapterNumber}화`,
      novel: novelSlug,
      chapterNumber,
      content: content.trim(),
      wordCount: wordCount || content.length,
      isCompletion,
      isFinal
    };
  }

  parseTropesArray(tropesStr) {
    try {
      // 배열 형태로 파싱 시도
      if (tropesStr.startsWith('[') && tropesStr.endsWith(']')) {
        return JSON.parse(tropesStr);
      }
      // 콤마로 구분된 문자열 처리
      return tropesStr.split(',').map(t => t.trim());
    } catch {
      return [tropesStr];
    }
  }
}

class FileManager {
  constructor(logger) {
    this.logger = logger;
  }

  async saveNovel(metadata) {
    await this.logger.info('소설 메타데이터 저장', { title: metadata.title });

    const frontmatter = {
      title: metadata.title,
      slug: metadata.slug,
      author: 'Gemini AI',
      status: '연재 중',
      summary: metadata.summary,
      tropes: metadata.tropes || [],
      publishedDate: new Date().toISOString().split('T')[0],
      totalChapters: 1,
      rating: 0
    };

    const content = matter.stringify('', frontmatter);
    const filename = `${metadata.slug}.md`;
    const filepath = join(CONFIG.NOVEL_DIR, filename);

    await fs.writeFile(filepath, content, 'utf-8');
    await this.logger.success('소설 파일 저장 완료', { filepath });

    return filepath;
  }

  async saveChapter(chapter) {
    await this.logger.info('챕터 저장', { 
      novel: chapter.novel, 
      chapterNumber: chapter.chapterNumber 
    });

    const frontmatter = {
      title: chapter.title,
      novel: chapter.novel,
      chapterNumber: chapter.chapterNumber,
      publicationDate: new Date().toISOString().split('T')[0],
      wordCount: chapter.wordCount,
      contentRating: '15+',
      emotionalTone: this.detectEmotionalTone(chapter.content),
      keyEvents: this.extractKeyEvents(chapter.content),
      characterDevelopment: '캐릭터 발전 사항'
    };

    const content = matter.stringify(chapter.content, frontmatter);
    const filename = `${chapter.novel}-ch${chapter.chapterNumber}.md`;
    const filepath = join(CONFIG.CHAPTER_DIR, filename);

    await fs.writeFile(filepath, content, 'utf-8');
    await this.logger.success('챕터 파일 저장 완료', { filepath });

    // 소설 메타데이터의 totalChapters 업데이트
    await this.updateNovelChapterCount(chapter.novel, chapter.chapterNumber);

    return filepath;
  }

  async updateNovelStatus(novelSlug, status) {
    const novelPath = join(CONFIG.NOVEL_DIR, `${novelSlug}.md`);
    
    try {
      const content = await fs.readFile(novelPath, 'utf-8');
      const { data, content: novelContent } = matter(content);
      
      data.status = status;
      if (status === '완결') {
        data.completedDate = new Date().toISOString().split('T')[0];
      }

      const updatedContent = matter.stringify(novelContent, data);
      await fs.writeFile(novelPath, updatedContent, 'utf-8');
      
      await this.logger.success('소설 상태 업데이트', { novelSlug, status });
    } catch (error) {
      await this.logger.error('소설 상태 업데이트 실패', { novelSlug, error: error.message });
    }
  }

  async updateNovelChapterCount(novelSlug, chapterNumber) {
    const novelPath = join(CONFIG.NOVEL_DIR, `${novelSlug}.md`);
    
    try {
      const content = await fs.readFile(novelPath, 'utf-8');
      const { data, content: novelContent } = matter(content);
      
      data.totalChapters = Math.max(data.totalChapters || 0, chapterNumber);

      const updatedContent = matter.stringify(novelContent, data);
      await fs.writeFile(novelPath, updatedContent, 'utf-8');
      
    } catch (error) {
      await this.logger.warn('소설 챕터 수 업데이트 실패', { novelSlug, error: error.message });
    }
  }

  detectEmotionalTone(content) {
    const tones = {
      '달콤한': ['사랑', '따뜻', '행복', '미소', '설렘'],
      '긴장감있는': ['위험', '긴급', '놀란', '충격', '갈등'],
      '감동적인': ['눈물', '감동', '그리움', '이별', '만남'],
      '스릴있는': ['흥미진진', '모험', '추격', '비밀', '수상한']
    };

    let maxScore = 0;
    let detectedTone = '달콤한';

    for (const [tone, keywords] of Object.entries(tones)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (content.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        detectedTone = tone;
      }
    }

    return detectedTone;
  }

  extractKeyEvents(content) {
    // 간단한 키워드 기반 이벤트 추출
    const events = [];
    
    if (content.includes('만남') || content.includes('첫')) {
      events.push('첫 만남');
    }
    if (content.includes('갈등') || content.includes('오해')) {
      events.push('갈등 발생');
    }
    if (content.includes('고백') || content.includes('사랑')) {
      events.push('감정 표현');
    }
    if (content.includes('위기') || content.includes('위험')) {
      events.push('위기 상황');
    }

    return events.length > 0 ? events : ['스토리 진행'];
  }
}

class AutomationEngine {
  constructor(options = {}) {
    this.options = {
      mode: 'auto',
      creativity: 'high',
      dryRun: false,
      verbose: false,
      ...options
    };

    this.logger = new Logger(this.options.verbose);
    this.analyzer = new ContentAnalyzer(this.logger);
    this.generator = new NovelGenerator(this.logger);
    this.fileManager = new FileManager(this.logger);
  }

  async run() {
    try {
      await this.logger.info('🌟 로맨스 판타지 자동 연재 시스템 시작', this.options);

      // API 키 확인
      await this.logger.info('환경변수 확인', { 
        hasApiKey: !!CONFIG.API_KEY,
        apiKeyLength: CONFIG.API_KEY ? CONFIG.API_KEY.length : 0,
        nodeEnv: process.env.NODE_ENV
      });
      
      if (!CONFIG.API_KEY) {
        throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다. GitHub Secrets에 GEMINI_API_KEY가 올바르게 설정되어 있는지 확인해주세요.');
      }

      // 디렉토리 확인 및 생성
      await this.ensureDirectories();

      // 현재 상황 분석
      const analysis = await this.analyzer.analyzeCurrentState();

      // 실행할 액션 결정
      const action = this.decideAction(analysis);
      await this.logger.info('결정된 액션', action);

      if (this.options.dryRun) {
        await this.logger.info('🔍 DRY RUN 모드: 실제 실행하지 않고 종료');
        return { success: true, action, dryRun: true };
      }

      // 액션 실행
      const result = await this.executeAction(action, analysis);

      // Git 커밋 및 푸시
      if (result.filesCreated && result.filesCreated.length > 0) {
        await this.gitCommitAndPush(action, result);
      }

      await this.logger.success('🎉 자동 연재 시스템 완료', result);
      return { success: true, action, result };

    } catch (error) {
      await this.logger.error('❌ 자동 연재 시스템 실패', { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  }

  decideAction(analysis) {
    const { mode } = this.options;

    // 강제 모드가 설정된 경우
    if (mode !== 'auto') {
      return {
        type: mode,
        reason: `사용자 지정 모드: ${mode}`
      };
    }

    // 자동 우선순위 로직
    
    // 1. 완결 처리 (최우선)
    const completableNovels = analysis.novels.filter(n => 
      n.status === '연재 중' && n.canComplete
    );

    if (completableNovels.length > 0) {
      const novel = completableNovels[0];
      return {
        type: 'complete_novel',
        targetNovel: novel.slug,
        reason: `완결 가능한 소설 발견: ${novel.title} (${novel.chapterCount}화)`
      };
    }

    // 2. 기존 소설 연재 (높은 우선순위)
    const updateNeededNovels = analysis.novels.filter(n => 
      n.status === '연재 중' && n.needsUpdate && !n.canComplete
    );

    if (updateNeededNovels.length > 0) {
      // 가장 오래된 업데이트가 필요한 소설 선택
      const novel = updateNeededNovels.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate)[0];
      return {
        type: 'continue_chapter',
        targetNovel: novel.slug,
        reason: `업데이트 필요: ${novel.title} (${novel.daysSinceUpdate}일 전 마지막 업데이트)`
      };
    }

    // 3. 새 소설 생성 (낮은 우선순위)
    if (analysis.activeNovels < CONFIG.MAX_ACTIVE_NOVELS) {
      return {
        type: 'new_novel',
        reason: `활성 소설 부족 (${analysis.activeNovels}/${CONFIG.MAX_ACTIVE_NOVELS})`
      };
    }

    // 4. 기본값: 가장 최근 소설에 챕터 추가
    const recentNovels = analysis.novels.filter(n => n.status === '연재 중');
    if (recentNovels.length > 0) {
      const novel = recentNovels.sort((a, b) => 
        new Date(b.lastUpdate || 0) - new Date(a.lastUpdate || 0)
      )[0];

      return {
        type: 'continue_chapter',
        targetNovel: novel.slug,
        reason: `기본 연재: ${novel.title}`
      };
    }

    // 5. 최후의 수단: 새 소설 생성
    return {
      type: 'new_novel',
      reason: '연재 중인 소설이 없음'
    };
  }

  async executeAction(action, analysis) {
    switch (action.type) {
      case 'new_novel':
        return await this.executeNewNovel();
      
      case 'continue_chapter':
        return await this.executeContinueChapter(action.targetNovel, analysis);
      
      case 'complete_novel':
        return await this.executeCompleteNovel(action.targetNovel, analysis);
      
      default:
        throw new Error(`알 수 없는 액션 타입: ${action.type}`);
    }
  }

  async executeNewNovel() {
    await this.logger.info('새 소설 생성 실행');

    const { metadata, chapter } = await this.generator.createNewNovel(this.options.creativity);
    
    const novelFile = await this.fileManager.saveNovel(metadata);
    const chapterFile = await this.fileManager.saveChapter(chapter);

    return {
      type: 'new_novel',
      novel: metadata,
      chapter: chapter,
      filesCreated: [novelFile, chapterFile]
    };
  }

  async executeContinueChapter(novelSlug, analysis) {
    await this.logger.info('챕터 연재 실행', { novelSlug });

    const existingChapters = await this.analyzer.loadAllChapters();
    const chapter = await this.generator.continueNovel(
      novelSlug, 
      existingChapters, 
      this.options.creativity
    );
    
    const chapterFile = await this.fileManager.saveChapter(chapter);

    return {
      type: 'continue_chapter',
      novelSlug,
      chapter,
      filesCreated: [chapterFile]
    };
  }

  async executeCompleteNovel(novelSlug, analysis) {
    await this.logger.info('소설 완결 실행', { novelSlug });

    const existingChapters = await this.analyzer.loadAllChapters();
    const chapter = await this.generator.completeNovel(
      novelSlug, 
      existingChapters, 
      this.options.creativity
    );
    
    const chapterFile = await this.fileManager.saveChapter(chapter);

    // 완결인 경우 소설 상태 업데이트
    if (chapter.isFinal) {
      await this.fileManager.updateNovelStatus(novelSlug, '완결');
    }

    return {
      type: 'complete_novel',
      novelSlug,
      chapter,
      isCompleted: chapter.isFinal,
      filesCreated: [chapterFile]
    };
  }

  async ensureDirectories() {
    const dirs = [CONFIG.NOVEL_DIR, CONFIG.CHAPTER_DIR, CONFIG.LOGS_DIR];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // 디렉토리가 이미 존재하는 경우 무시
      }
    }
  }

  async gitCommitAndPush(action, result) {
    try {
      await this.logger.info('Git 커밋 및 푸시 시작');

      // Git 사용자 설정
      execSync('git config --global user.name "로판 자동화 봇 🤖"', { stdio: 'inherit' });
      execSync('git config --global user.email "action@github.com"', { stdio: 'inherit' });

      // 파일 추가
      execSync('git add src/content/novels/ src/content/chapters/', { stdio: 'inherit' });

      // 커밋 메시지 생성
      const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      const actionTypeKorean = {
        'new_novel': '새 소설 생성',
        'continue_chapter': '챕터 연재',
        'complete_novel': '소설 완결'
      }[action.type] || action.type;

      const commitMessage = `Gemini AI 자동 연재: ${actionTypeKorean} - ${timestamp}

생성 정보:
- 액션: ${action.type}
- 이유: ${action.reason}
- 창의성: ${this.options.creativity}
- 생성 파일: ${result.filesCreated.length}개

품질 보장: Gemini API 직접 호출
로맨스 판타지 전문 시스템 v2.0

Co-Authored-By: Gemini AI <noreply@google.com>`;

      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });

      await this.logger.success('Git 푸시 완료');

    } catch (error) {
      await this.logger.error('Git 작업 실패', { error: error.message });
      // Git 실패는 전체 프로세스를 중단하지 않음
    }
  }
}

// CLI 실행
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // 명령행 인수 파싱
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--mode' && args[i + 1]) {
      options.mode = args[++i];
    } else if (arg === '--creativity' && args[i + 1]) {
      options.creativity = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    }
  }

  try {
    const engine = new AutomationEngine(options);
    const result = await engine.run();
    
    console.log('\n🎉 자동 연재 시스템 실행 완료!');
    console.log('📊 결과:', JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AutomationEngine, CONFIG };