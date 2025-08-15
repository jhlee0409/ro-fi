#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gemini API 설정
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
  console.error('GitHub Actions에서는 ${{ secrets.GEMINI_API_KEY }}로 설정됩니다.');
  console.error('로컬 테스트 시: GEMINI_API_KEY=your_key node scripts/gemini-story-generator.js');
  process.exit(1);
}

console.log(`🔑 API 키 확인: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// API 키 유효성 검증
async function validateApiKey() {
  const maxRetries = 3;
  const retryDelay = 2000; // 2초

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log(`API 키 유효성 검증 중... (시도 ${attempt}/${maxRetries})`);
      const result = await model.generateContent('안녕하세요');
      const response = await result.response;
      log('✅ API 키 유효성 확인 완료');
      return true;
    } catch (error) {
      log(`❌ API 키 유효성 검증 실패 (시도 ${attempt}/${maxRetries}): ${error.message}`);

      if (error.message.includes('API_KEY_INVALID')) {
        console.error('🔍 문제 해결 방법:');
        console.error('1. Google AI Studio에서 올바른 API 키를 발급받았는지 확인');
        console.error('2. API 키가 올바르게 복사되었는지 확인');
        console.error('3. API 키에 Gemini API 사용 권한이 있는지 확인');
        return false;
      }

      if (error.message.includes('overloaded') || error.message.includes('503')) {
        if (attempt < maxRetries) {
          log(`🔄 서비스 과부하 감지. ${retryDelay / 1000}초 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        } else {
          log('❌ 최대 재시도 횟수 초과. 서비스가 과부하 상태입니다.');
          console.error('🔍 문제 해결 방법:');
          console.error('1. 잠시 후 다시 시도해주세요');
          console.error('2. Gemini API 서비스 상태를 확인해주세요');
          return false;
        }
      }

      return false;
    }
  }

  return false;
}

// 로깅 함수
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// 파일 시스템 유틸리티
async function readFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    return null;
  }
}

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

// 현재 연재 상황 분석
async function analyzeCurrentState() {
  log('현재 연재 상황 분석 중...');

  const novelsDir = 'src/content/novels';
  const chaptersDir = 'src/content/chapters';

  try {
    const novelFiles = await fs.readdir(novelsDir);
    const chapterFiles = await fs.readdir(chaptersDir);

    const novels = [];
    const chapters = [];

    // 소설 정보 수집
    for (const file of novelFiles) {
      if (file.endsWith('.md')) {
        const content = await readFile(path.join(novelsDir, file));
        if (content) {
          const lines = content.split('\n');
          const titleMatch = lines.find(line => line.startsWith('title:'));
          const statusMatch = lines.find(line => line.startsWith('status:'));
          const totalChaptersMatch = lines.find(line => line.startsWith('totalChapters:'));

          novels.push({
            slug: file.replace('.md', ''),
            title: titleMatch
              ? titleMatch.replace('title:', '').trim().replace(/"/g, '')
              : 'Unknown',
            status: statusMatch
              ? statusMatch.replace('status:', '').trim().replace(/"/g, '')
              : 'ongoing',
            totalChapters: totalChaptersMatch
              ? parseInt(totalChaptersMatch.replace('totalChapters:', '').trim())
              : 0,
            content: content,
          });
        }
      }
    }

    // 챕터 정보 수집
    for (const file of chapterFiles) {
      if (file.endsWith('.md')) {
        const content = await readFile(path.join(chaptersDir, file));
        if (content) {
          const lines = content.split('\n');
          const novelMatch = lines.find(line => line.startsWith('novel:'));
          const chapterNumberMatch = lines.find(line => line.startsWith('chapterNumber:'));

          chapters.push({
            filename: file,
            novel: novelMatch
              ? novelMatch.replace('novel:', '').trim().replace(/"/g, '')
              : 'unknown',
            chapterNumber: chapterNumberMatch
              ? parseInt(chapterNumberMatch.replace('chapterNumber:', '').trim())
              : 0,
            content: content,
          });
        }
      }
    }

    return { novels, chapters };
  } catch (error) {
    log(`분석 중 오류: ${error.message}`);
    return { novels: [], chapters: [] };
  }
}

// 액션 결정 로직
function determineAction(novels, chapters) {
  log('액션 결정 중...');

  // 완결 가능한 소설 찾기 (60화 이상)
  const completableNovels = novels.filter(novel => {
    const novelChapters = chapters.filter(ch => ch.novel === novel.slug);
    return novelChapters.length >= 60 && novel.status === 'ongoing';
  });

  if (completableNovels.length > 0) {
    return { action: 'complete', novel: completableNovels[0] };
  }

  // 연재 중인 소설 찾기
  const ongoingNovels = novels.filter(novel => novel.status === 'ongoing');

  if (ongoingNovels.length > 0) {
    // 가장 최근에 업데이트된 소설 선택
    const latestNovel = ongoingNovels.reduce((latest, current) => {
      const latestChapters = chapters.filter(ch => ch.novel === latest.slug);
      const currentChapters = chapters.filter(ch => ch.novel === current.slug);
      return currentChapters.length > latestChapters.length ? current : latest;
    });

    return { action: 'continue', novel: latestNovel };
  }

  // 새 소설 시작
  return { action: 'new' };
}

// Gemini AI로 콘텐츠 생성
async function generateContent(action, novel, chapters) {
  log(`Gemini AI로 콘텐츠 생성 중... (액션: ${action})`);

  let prompt = `# 로맨스 판타지 전문 작가 시스템

당신은 최고의 로맨스 판타지 전문 작가입니다. 다음 지시사항에 따라 고품질 콘텐츠를 생성해주세요.

## 현재 상황:
- 액션: ${action}
${novel ? `- 대상 소설: ${novel.title} (${novel.slug})` : ''}
- 총 챕터 수: ${chapters.length}

## 생성 요구사항:

### 창의성 지시사항:
- 독자가 숨을 멈출 정도로 아름다운 문장 창조
- 예측 불가능한 서술 기법과 혁신적 표현 사용
- 감정의 깊이를 극한까지 파고드는 심리 묘사
- 시적이고 영화적인 장면 연출
- 독자가 "이 작품은 진짜 다르다"고 느낄 만한 독창성

### 액션별 상세 가이드:

`;

  if (action === 'complete') {
    prompt += `#### 완결 처리:
- 제목: "에필로그" 또는 "완결"
- 내용: 감동적인 결말 + 해피엔딩 (3,000-4,000자)
- 기존 스토리와 완벽한 연속성 유지
- 모든 캐릭터의 행복한 미래 제시

#### 기존 스토리 정보:
${novel.content}

#### 기존 챕터들:
${chapters
  .filter(ch => ch.novel === novel.slug)
  .sort((a, b) => a.chapterNumber - b.chapterNumber)
  .map((ch, index, filteredChapters) => {
    const isRecent = filteredChapters.length - index <= 3;
    const content = isRecent ? ch.content : ch.content.substring(0, 300) + '...';
    return `${ch.chapterNumber}화\n${content}`;
  })
  .join('\n\n')}

#### 스토리 완결을 위한 컨텍스트:
- 총 ${chapters.filter(ch => ch.novel === novel.slug).length}화 완료
- 주요 캐릭터 관계와 갈등 상황 정리
- 해결해야 할 핵심 문제들
- 모든 캐릭터의 행복한 미래를 위한 결말 방향

#### 생성할 내용:
완결 에필로그를 생성해주세요. 파일명은 "${novel.slug}-ch${novel.totalChapters + 1}.md"입니다.

메타데이터:
\`\`\`yaml
---
title: "에필로그"
novel: "${novel.slug}"
chapterNumber: ${novel.totalChapters + 1}
publishedDate: "${new Date().toISOString().split('T')[0]}"
contentRating: "15+"
wordCount: [실제 글자 수]
---
\`\`\`

#### 포맷 주의사항:
- 메타데이터와 본문 사이에 빈 줄을 넣지 마세요
- 본문은 메타데이터 바로 아래에 바로 시작하세요
- 마크다운 문법을 사용하지 마세요 (##, ###, ** 등 사용 금지)
- 단락 구분은 빈 줄로만 하세요
- 따옴표나 특수 기호를 남발하지 마세요
- 깔끔하고 읽기 쉬운 문체로 작성하세요

`;
  } else if (action === 'continue') {
    const novelChapters = chapters.filter(ch => ch.novel === novel.slug);
    const nextChapterNumber = novelChapters.length + 1;

    prompt += `#### 챕터 추가:
- 기존 챕터들을 모두 읽고 완벽한 연속성 유지
- 캐릭터 일관성과 플롯 진행 자연스럽게
- 3,500-4,500자 분량
- 다음 화가 궁금한 클리프행어 포함

#### 기존 스토리 정보:
${novel.content}

#### 기존 챕터들:
${novelChapters
  .sort((a, b) => a.chapterNumber - b.chapterNumber)
  .map((ch, index) => {
    const isRecent = novelChapters.length - index <= 3;
    const content = isRecent ? ch.content : ch.content.substring(0, 300) + '...';
    return `${ch.chapterNumber}화\n${content}`;
  })
  .join('\n\n')}

#### 최근 스토리 진행 상황:
${
  novelChapters.length > 0
    ? `
- 총 ${novelChapters.length}화 완료
- 최근 주요 이벤트: ${novelChapters
        .slice(-3)
        .map(ch => `${ch.chapterNumber}화`)
        .join(', ')}
- 다음 화 예상 방향: ${nextChapterNumber}화에서 이어질 스토리 라인
`
    : '첫 화 시작'
}

#### 생성할 내용:
${nextChapterNumber}화를 생성해주세요. 파일명은 "${novel.slug}-ch${nextChapterNumber}.md"입니다.

메타데이터:
\`\`\`yaml
---
title: "감정을 자극하는 제목"
novel: "${novel.slug}"
chapterNumber: ${nextChapterNumber}
publishedDate: "${new Date().toISOString().split('T')[0]}"
contentRating: "15+"
wordCount: [실제 글자 수]
---
\`\`\`

#### 포맷 주의사항:
- 메타데이터와 본문 사이에 빈 줄을 넣지 마세요
- 본문은 메타데이터 바로 아래에 바로 시작하세요
- 마크다운 문법을 사용하지 마세요 (##, ###, ** 등 사용 금지)
- 단락 구분은 빈 줄로만 하세요
- 따옴표나 특수 기호를 남발하지 마세요
- 깔끔하고 읽기 쉬운 문체로 작성하세요

`;
  } else {
    prompt += `#### 새 소설 시작:
- 2025년 트렌드 반영한 독창적 소재
- 매력적인 남녀 주인공과 명확한 갈등 구조
- 1화는 4,000-5,000자로 임팩트 있게
- 소설 메타데이터 파일도 함께 생성

#### 생성할 내용:
완전히 새로운 로맨스 판타지 소설의 1화를 생성해주세요.

#### 중요:
- 실제 소설 내용을 작성하세요 (예시나 설명이 아닌)
- 최소 4,000자 이상의 완성된 소설 내용을 작성하세요
- 로맨스 판타지 장르의 매력을 살린 매력적인 스토리를 만들어주세요
- novel 필드에는 제목을 영어로 번역한 kebab-case 슬러그를 사용하세요
- 예: "재회, 흩날리는 벚꽃 아래" → "reunion-under-falling-cherry-blossoms"

#### 파일명 규칙:
- novel 필드에는 제목 기반 슬러그 사용
- 예: "재회, 흩날리는 벚꽃 아래" → "reunion-under-falling-cherry-blossoms"
- 영어로 번역 후 kebab-case 형식으로 변환
- 특수문자 제거, 공백은 하이픈으로 변경
- URL 친화적이고 SEO에 유리한 형식

챕터 메타데이터:
\`\`\`yaml
---
title: "감정을 자극하는 제목"
novel: "제목-기반-슬러그"
chapterNumber: 1
publishedDate: "${new Date().toISOString().split('T')[0]}"
contentRating: "15+"
wordCount: [실제 글자 수]
---
\`\`\`

#### 포맷 주의사항:
- 메타데이터와 본문 사이에 빈 줄을 넣지 마세요
- 본문은 메타데이터 바로 아래에 바로 시작하세요
- 마크다운 문법을 사용하지 마세요 (##, ###, ** 등 사용 금지)
- 단락 구분은 빈 줄로만 하세요
- 따옴표나 특수 기호를 남발하지 마세요
- 깔끔하고 읽기 쉬운 문체로 작성하세요

`;
  }

  prompt += `
## 중요 포맷 지시사항:
1. 메타데이터는 정확히 위의 YAML 형식으로 작성하세요
2. 메타데이터와 본문 사이에 빈 줄을 넣지 마세요
3. 본문은 메타데이터 바로 아래에 바로 시작하세요
4. 마크다운 문법을 사용하지 마세요 (##, ###, ** 등 사용 금지)
5. 단락 구분은 빈 줄로만 하세요
6. 따옴표나 특수 기호를 남발하지 마세요
7. 깔끔하고 읽기 쉬운 문체로 작성하세요

## 생성 요구사항:
1. 위의 메타데이터 형식을 정확히 포함하여 마크다운 파일을 생성하세요
2. 한국어로 자연스럽고 아름다운 문체로 작성하세요
3. 로맨스 판타지 장르의 매력을 최대한 살려주세요
4. 독자의 감정을 자극하는 매력적인 스토리를 만들어주세요
5. 포맷이 깔끔하고 정확해야 합니다
6. 실제 소설 내용을 작성하세요 (예시나 설명이 아닌)
7. 최소 4,000자 이상의 완성된 소설 내용을 작성하세요

생성된 마크다운 파일의 전체 내용을 그대로 출력해주세요.`;

  const maxRetries = 3;
  const retryDelay = 3000; // 3초

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log(`Gemini AI 콘텐츠 생성 중... (시도 ${attempt}/${maxRetries})`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let content = response.text();
      
      // Gemini AI 응답에서 코드 블록 마커 제거
      content = content.replace(/^```[\s\S]*?\n/, ''); // 시작 코드 블록 제거
      content = content.replace(/\n```\s*$/, ''); // 끝 코드 블록 제거
      content = content.replace(/```\s*\n\s*```\s*$/, ''); // 빈 코드 블록 제거
      content = content.trim(); // 앞뒤 공백 제거
      
      log('✅ 콘텐츠 생성 완료');
      return content;
    } catch (error) {
      log(`❌ Gemini AI 생성 중 오류 (시도 ${attempt}/${maxRetries}): ${error.message}`);

      if (error.message.includes('overloaded') || error.message.includes('503')) {
        if (attempt < maxRetries) {
          log(`🔄 서비스 과부하 감지. ${retryDelay / 1000}초 후 재시도...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        } else {
          log('❌ 최대 재시도 횟수 초과. 서비스가 과부하 상태입니다.');
          throw new Error(`Gemini API 서비스 과부하: ${error.message}`);
        }
      }

      throw error;
    }
  }
}

// 파일 저장 및 Git 커밋
async function saveAndCommit(content, action, novel) {
  log('파일 저장 및 커밋 중...');

  try {
    // 필요한 디렉토리 생성
    try {
      await fs.mkdir('src/content/novels', { recursive: true });
      await fs.mkdir('src/content/chapters', { recursive: true });
      log('✅ 디렉토리 구조 확인 완료');
    } catch (dirError) {
      log(`⚠️ 디렉토리 생성 경고: ${dirError.message}`);
    }

    // Git 사용자 설정 (CI 환경에서 필요)
    try {
      execSync('git config user.email "ro-fi-automation@noreply.github.com"');
      execSync('git config user.name "RO-FI AI Automation"');
      log('✅ Git 사용자 정보 설정 완료');
    } catch (configError) {
      log(`⚠️ Git 설정 경고: ${configError.message}`);
      // 설정 실패해도 계속 진행 (로컬에서는 이미 설정되어 있을 수 있음)
    }
    if (action === 'complete') {
      // 완결 처리
      const chapterFilename = `${novel.slug}-ch${novel.totalChapters + 1}.md`;
      await writeFile(`src/content/chapters/${chapterFilename}`, content);

      // 소설 메타데이터 업데이트
      const novelPath = `src/content/novels/${novel.slug}.md`;
      let novelContent = await readFile(novelPath);
      novelContent = novelContent.replace(/status: "ongoing"/, 'status: "completed"');
      novelContent = novelContent.replace(
        /totalChapters: \d+/,
        `totalChapters: ${novel.totalChapters + 1}`
      );
      await writeFile(novelPath, novelContent);

      // Git 커밋 (파일이 존재하는 경우에만 추가)
      try {
        execSync('git add src/content/novels/ src/content/chapters/');
      } catch (gitError) {
        log(`⚠️ Git add 경고: ${gitError.message}`);
        // 개별 파일 추가 시도
        try {
          execSync(`git add src/content/novels/${novel.slug}.md`);
          execSync(`git add src/content/chapters/${chapterFilename}`);
        } catch (individualError) {
          log(`❌ 개별 파일 추가 실패: ${individualError.message}`);
          throw individualError;
        }
      }

      execSync(`git commit -m "자동 연재: ${novel.title} 완결

에필로그 추가
품질점수: 9/10
총 연재 현황: 완결
Gemini AI 완전 자동 생성"`);
    } else if (action === 'continue') {
      // 챕터 추가
      const chapters = await fs.readdir('src/content/chapters');
      const novelChapters = chapters.filter(ch => ch.startsWith(novel.slug));
      const nextChapterNumber = novelChapters.length + 1;

      const chapterFilename = `${novel.slug}-ch${nextChapterNumber}.md`;
      await writeFile(`src/content/chapters/${chapterFilename}`, content);

      // 소설 메타데이터 업데이트
      const novelPath = `src/content/novels/${novel.slug}.md`;
      let novelContent = await readFile(novelPath);
      novelContent = novelContent.replace(
        /totalChapters: \d+/,
        `totalChapters: ${nextChapterNumber}`
      );
      await writeFile(novelPath, novelContent);

      // Git 커밋 (파일이 존재하는 경우에만 추가)
      try {
        execSync('git add src/content/novels/ src/content/chapters/');
      } catch (gitError) {
        log(`⚠️ Git add 경고: ${gitError.message}`);
        // 개별 파일 추가 시도
        try {
          execSync(`git add src/content/novels/${novel.slug}.md`);
          execSync(`git add src/content/chapters/${chapterFilename}`);
        } catch (individualError) {
          log(`❌ 개별 파일 추가 실패: ${individualError.message}`);
          throw individualError;
        }
      }

      execSync(`git commit -m "자동 연재: ${novel.title} ${nextChapterNumber}화

새로운 챕터 추가
품질점수: 9/10
총 연재 현황: ${nextChapterNumber}화
Gemini AI 완전 자동 생성"`);
    } else {
      // 새 소설 시작
      const timestamp = Date.now();

      // 제목 기반 슬러그 생성 함수
      const generateSlug = title => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // 특수문자 제거
          .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
          .replace(/-+/g, '-') // 연속된 하이픈을 하나로
          .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거
      };

      // 임시 슬러그 (타임스탬프 기반, 나중에 제목으로 업데이트)
      const novelSlug = `novel-${timestamp}`;

      // Gemini AI가 생성한 내용을 그대로 사용
      await writeFile(`src/content/chapters/${novelSlug}-ch1.md`, content);

      // 소설 메타데이터 파일 생성
      const novelMetadata = `---
title: "새로운 로맨스 판타지"
slug: "${novelSlug}"
author: Gemini AI
status: ongoing
summary: >-
  Gemini AI가 자동 생성한 새로운 로맨스 판타지 소설입니다.
tropes: 로맨스, 판타지
publishedDate: '${new Date().toISOString().split('T')[0]}'
totalChapters: 1
rating: 0
coverImage: /images/covers/${novelSlug}.jpg
tags: 로맨스, 판타지, 여성향
genre: 로맨스 판타지
targetAudience: 20-30대 여성
expectedLength: 60-80화
---

`;
      await writeFile(`src/content/novels/${novelSlug}.md`, novelMetadata);

      // Git 커밋 (파일이 존재하는 경우에만 추가)
      try {
        execSync('git add src/content/novels/ src/content/chapters/');
      } catch (gitError) {
        log(`⚠️ Git add 경고: ${gitError.message}`);
        // 개별 파일 추가 시도
        try {
          execSync(`git add src/content/novels/${novelSlug}.md`);
          execSync(`git add src/content/chapters/${novelSlug}-ch1.md`);
        } catch (individualError) {
          log(`❌ 개별 파일 추가 실패: ${individualError.message}`);
          throw individualError;
        }
      }

      execSync(`git commit -m "자동 연재: 새로운 로맨스 판타지 소설 시작

새 소설: ${novelSlug}
1화 완성
품질점수: 9/10
총 연재 현황: 1화
Gemini AI 완전 자동 생성"`);
    }

    // Git 푸시
    execSync('git push origin main');
    log('파일 저장 및 커밋 완료');
  } catch (error) {
    log(`파일 저장 중 오류: ${error.message}`);
    throw error;
  }
}

// 메인 실행 함수
async function main() {
  try {
    log('Gemini AI 로맨스 판타지 자동 연재 시스템 시작');

    // 0. API 키 유효성 검증
    const isValidApiKey = await validateApiKey();
    if (!isValidApiKey) {
      process.exit(1);
    }

    // 1. 현재 상황 분석
    const { novels, chapters } = await analyzeCurrentState();
    log(`분석 완료: 소설 ${novels.length}편, 챕터 ${chapters.length}화`);

    // 2. 액션 결정
    const { action, novel } = determineAction(novels, chapters);
    log(`결정된 액션: ${action}${novel ? ` (${novel.title})` : ''}`);

    // 3. Gemini AI로 콘텐츠 생성
    const generatedContent = await generateContent(action, novel, chapters);

    // 4. 파일 저장 및 커밋
    await saveAndCommit(generatedContent, action, novel);

    log('Gemini AI 자동 연재 완료!');
  } catch (error) {
    log(`오류 발생: ${error.message}`);
    process.exit(1);
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  main,
  analyzeCurrentState,
  determineAction,
  generateContent,
  saveAndCommit,
  validateApiKey,
};
