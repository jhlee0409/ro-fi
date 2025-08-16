#!/usr/bin/env node

/**
 * ⚡ Quick SubAgent Test
 * 
 * 빠른 단일 챕터 테스트로 시스템 검증
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// 환경변수 로드
dotenv.config({ path: join(PROJECT_ROOT, '.env.local') });

class QuickSubAgentTest {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  }

  async quickTest() {
    console.log('⚡ Quick SubAgent Test 시작!\n');
    
    try {
      // 간단한 소설 정보
      const novelInfo = {
        title: '감정 조작자의 딜레마',
        slug: 'emotion-manipulator-dilemma',
        summary: '타인의 감정을 조작할 수 있는 능력을 가진 심리학자가 자신의 능력을 악용하는 연인과 맞서면서 벌어지는 심리 스릴러 로맨스'
      };
      
      // 챕터 1 빠른 생성
      console.log('📖 챕터 1 빠른 생성...');
      
      // Phase 1: BaseStory
      console.log('   📝 BaseStory...');
      const baseStory = await this.quickBaseStory();
      
      // Phase 2: ConflictAgent
      console.log('   🔥 ConflictAgent...');
      const conflictResult = await this.quickConflictAgent(baseStory);
      
      // Phase 3: 결과 저장
      await this.saveQuickResult(novelInfo, conflictResult);
      
      console.log('\n✅ Quick Test 완료!');
      console.log('서브에이전트 시스템 정상 작동 확인');
      
    } catch (error) {
      console.error('❌ Quick Test 실패:', error.message);
      throw error;
    }
  }

  async quickBaseStory() {
    const prompt = `
심리학자 리나는 타인의 감정을 조작할 수 있는 특별한 능력을 가지고 있다. 
그녀는 이 능력을 환자 치료에만 사용하려고 노력해왔지만, 
새로 만난 연인 준호가 자신과 같은 능력을 가지고 있으며 
이를 악용하고 있다는 사실을 알게 된다.

위 설정으로 챕터 1의 기본 스토리를 1500자로 작성하세요.
갈등이나 복잡한 요소는 배제하고 기본 상황만 제시하세요.
`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async quickConflictAgent(baseStory) {
    const prompt = `
다음 기본 스토리에 긴장감과 갈등을 추가하세요:

${baseStory}

추가할 갈등 요소:
- 준호가 리나의 환자들을 조종하고 있다는 증거 발견
- 리나 자신도 무의식중에 능력을 남용했을 가능성
- 시간 압박: 다음 환자 상담까지 2시간
- 도덕적 딜레마: 준호를 막기 위해 자신의 능력을 사용해야 하는가

긴장감 넘치는 스토리로 변환하세요.
`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async saveQuickResult(novelInfo, content) {
    // 소설 파일 생성
    const novelPath = join(PROJECT_ROOT, 'src/content/novels', `${novelInfo.slug}.md`);
    const novelFrontmatter = {
      title: novelInfo.title,
      slug: novelInfo.slug,
      author: 'Quick SubAgent Test',
      status: '연재 중',
      summary: novelInfo.summary,
      tropes: ['심리 스릴러', '갈등 중심', '감정 조작'],
      publishedDate: new Date().toISOString().split('T')[0],
      totalChapters: 1,
      rating: 0,
      quickTest: true,
      subAgentApplied: true
    };
    
    const novelMarkdown = matter.stringify('', novelFrontmatter);
    await fs.writeFile(novelPath, novelMarkdown);
    
    // 챕터 파일 생성
    const chapterPath = join(PROJECT_ROOT, 'src/content/chapters', `${novelInfo.slug}-ch1.md`);
    const chapterFrontmatter = {
      title: '능력자의 딜레마',
      novel: novelInfo.slug,
      chapterNumber: 1,
      publicationDate: new Date().toISOString().split('T')[0],
      wordCount: content.length,
      
      quickTest: true,
      baseStoryGenerated: true,
      conflictAgentApplied: true,
      subAgentWorkflow: true,
      
      lastGenerated: new Date().toISOString()
    };
    
    const chapterMarkdown = matter.stringify(content, chapterFrontmatter);
    await fs.writeFile(chapterPath, chapterMarkdown);
    
    console.log('💾 Quick Test 결과 저장 완료');
  }
}

// CLI 실행
async function main() {
  try {
    const tester = new QuickSubAgentTest();
    await tester.quickTest();
    
  } catch (error) {
    console.error('💥 Quick Test 실패:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { QuickSubAgentTest };