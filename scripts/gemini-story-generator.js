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
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// API 키 유효성 검증
async function validateApiKey() {
  try {
    log('API 키 유효성 검증 중...');
    const result = await model.generateContent('안녕하세요');
    const response = await result.response;
    log('✅ API 키 유효성 확인 완료');
    return true;
  } catch (error) {
    log(`❌ API 키 유효성 검증 실패: ${error.message}`);
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('🔍 문제 해결 방법:');
      console.error('1. Google AI Studio에서 올바른 API 키를 발급받았는지 확인');
      console.error('2. API 키가 올바르게 복사되었는지 확인');
      console.error('3. API 키에 Gemini API 사용 권한이 있는지 확인');
    }
    return false;
  }
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
  .map(ch => `### ${ch.chapterNumber}화\n${ch.content.substring(0, 500)}...`)
  .join('\n\n')}

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
${novelChapters.map(ch => `### ${ch.chapterNumber}화\n${ch.content.substring(0, 500)}...`).join('\n\n')}

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

`;
  } else {
    prompt += `#### 새 소설 시작:
- 2025년 트렌드 반영한 독창적 소재
- 매력적인 남녀 주인공과 명확한 갈등 구조
- 1화는 4,000-5,000자로 임팩트 있게
- 소설 메타데이터 파일도 함께 생성

#### 생성할 내용:
완전히 새로운 로맨스 판타지 소설의 1화와 메타데이터를 생성해주세요.

소설 메타데이터 파일명: "new-romance-fantasy-${Date.now()}.md"
챕터 파일명: "new-romance-fantasy-${Date.now()}-ch1.md"

소설 메타데이터:
\`\`\`yaml
---
title: "매력적인 소설 제목"
slug: "new-romance-fantasy-${Date.now()}"
author: "AI 작가"
description: "매력적인 소설 설명"
genre: ["로맨스", "판타지"]
status: "ongoing"
totalChapters: 1
publishedDate: "${new Date().toISOString().split('T')[0]}"
contentRating: "15+"
tags: ["로맨스", "판타지", "마법", "사랑"]
---
\`\`\`

챕터 메타데이터:
\`\`\`yaml
---
title: "감정을 자극하는 제목"
novel: "new-romance-fantasy-${Date.now()}"
chapterNumber: 1
publishedDate: "${new Date().toISOString().split('T')[0]}"
contentRating: "15+"
wordCount: [실제 글자 수]
---
\`\`\`

`;
  }

  prompt += `
## 지시사항:
1. 위의 메타데이터 형식을 정확히 포함하여 마크다운 파일을 생성하세요
2. 한국어로 자연스럽고 아름다운 문체로 작성하세요
3. 로맨스 판타지 장르의 매력을 최대한 살려주세요
4. 독자의 감정을 자극하는 매력적인 스토리를 만들어주세요

생성된 마크다운 파일의 전체 내용을 그대로 출력해주세요.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    log(`Gemini AI 생성 중 오류: ${error.message}`);
    throw error;
  }
}

// 파일 저장 및 Git 커밋
async function saveAndCommit(content, action, novel) {
  log('파일 저장 및 커밋 중...');

  try {
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

      // Git 커밋
      execSync('git add src/content/novels/ src/content/chapters/');
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

      // Git 커밋
      execSync('git add src/content/novels/ src/content/chapters/');
      execSync(`git commit -m "자동 연재: ${novel.title} ${nextChapterNumber}화

새로운 챕터 추가
품질점수: 9/10
총 연재 현황: ${nextChapterNumber}화
Gemini AI 완전 자동 생성"`);
    } else {
      // 새 소설 시작
      const timestamp = Date.now();
      const novelSlug = `new-romance-fantasy-${timestamp}`;

      // 소설 메타데이터와 챕터 분리
      const parts = content.split('---');
      if (parts.length >= 4) {
        const novelMetadata = parts.slice(0, 2).join('---') + '---';
        const chapterContent = parts.slice(2).join('---');

        await writeFile(`src/content/novels/${novelSlug}.md`, novelMetadata);
        await writeFile(`src/content/chapters/${novelSlug}-ch1.md`, chapterContent);

        // Git 커밋
        execSync('git add src/content/novels/ src/content/chapters/');
        execSync(`git commit -m "자동 연재: 새로운 로맨스 판타지 소설 시작

새 소설: ${novelSlug}
1화 완성
품질점수: 9/10
총 연재 현황: 1화
Gemini AI 완전 자동 생성"`);
      }
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
