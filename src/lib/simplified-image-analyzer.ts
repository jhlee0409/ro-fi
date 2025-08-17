/**
 * 단순화된 이미지 분석 시스템
 * 소설 대표 이미지 + 챕터별 핵심 포인트 1개 시스템
 * ⚠️ 기존 소설 생성 로직은 절대 건드리지 않음
 */

import { imageGenerationService } from './image-generation-service';
import type {
  ChapterImagePoint,
  ChapterImageData,
  NovelImageData,
  NovelCoverOptions,
} from './types/image-types';

export class SimplifiedImageAnalyzer {
  /**
   * 소설 전체 대표 이미지 생성
   */
  async generateNovelCoverImage(novelData: {
    title: string;
    summary: string;
    tropes?: string[];
    author?: string;
  }): Promise<ChapterImagePoint> {
    try {
      // console.log(`🎨 Generating cover image for novel: ${novelData.title}`);

      const coverOptions: NovelCoverOptions = {
        title: novelData.title,
        genre: '로맨스 판타지',
        tropes: novelData.tropes || ['로맨스', '판타지'],
        mood: 'romantic',
        summary: novelData.summary,
        author: novelData.author,
      };

      // 소설 대표 이미지 프롬프트 생성
      const coverPrompt = await imageGenerationService.generateNovelCoverPrompt(coverOptions);

      const coverImagePoint: ChapterImagePoint = {
        id: `novel-cover-${Date.now()}`,
        position: 0,
        type: 'visual_highlight',
        description: `${novelData.title}을 대표하는 로맨스 판타지 커버 이미지`,
        mood: 'romantic',
        characters: [],
        setting: '소설 전체를 아우르는 대표적 배경',
        chapterTitle: '소설 커버',
        targetParagraph: novelData.summary,
        generatedPrompt: coverPrompt,
      };

      // console.log(`✨ Generated novel cover image point for: ${novelData.title}`);
      return coverImagePoint;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating novel cover image:', error);

      // 폴백 커버 이미지
      return {
        id: `fallback-cover-${Date.now()}`,
        position: 0,
        type: 'visual_highlight',
        description: `${novelData.title}의 대표 이미지`,
        mood: 'romantic',
        characters: [],
        setting: '로맨스 판타지 배경',
        chapterTitle: '소설 커버',
        targetParagraph: novelData.summary,
      };
    }
  }

  /**
   * 챕터별 핵심 이미지 포인트 1개 분석
   */
  async analyzeChapterKeyPoint(
    chapterContent: string,
    chapterMeta: {
      slug: string;
      chapterNumber: number;
      title: string;
    }
  ): Promise<ChapterImageData> {
    try {
      // console.log(`🔍 Analyzing key point for chapter ${chapterMeta.chapterNumber}: ${chapterMeta.title}`);

      // 핵심 이미지 포인트 1개 식별
      const keyImagePoint = await imageGenerationService.identifyKeyImagePoint(
        chapterContent,
        chapterMeta.title
      );

      if (keyImagePoint) {
        // 이미지 프롬프트 생성
        const imagePrompt = await imageGenerationService.generateImagePrompt(keyImagePoint);
        keyImagePoint.generatedPrompt = imagePrompt;

        // console.log(`✨ Found key image point: ${keyImagePoint.type} at ${keyImagePoint.position}%`);
      }

      const chapterImageData: ChapterImageData = {
        chapterSlug: chapterMeta.slug,
        chapterNumber: chapterMeta.chapterNumber,
        chapterTitle: chapterMeta.title,
        keyImagePoint: keyImagePoint || undefined,
        lastAnalyzed: new Date(),
      };

      return chapterImageData;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error analyzing chapter ${chapterMeta.chapterNumber}:`, error);

      // 폴백 데이터
      return {
        chapterSlug: chapterMeta.slug,
        chapterNumber: chapterMeta.chapterNumber,
        chapterTitle: chapterMeta.title,
        lastAnalyzed: new Date(),
      };
    }
  }

  /**
   * 전체 소설 이미지 분석 (소설 커버 + 모든 챕터)
   */
  async analyzeNovelComplete(novelSlug: string): Promise<NovelImageData> {
    try {
      // console.log(`🚀 Starting complete analysis for novel: ${novelSlug}`);

      // ⚠️ 기존 소설 생성 로직은 건드리지 않고 content collection만 사용
      const { getCollection } = await import('astro:content');
      const novels = await getCollection('novels');
      const chapters = await getCollection('chapters');

      const novel = novels.find(n => n.slug === novelSlug);
      if (!novel) {
        throw new Error(`Novel not found: ${novelSlug}`);
      }

      const novelChapters = chapters
        .filter(chapter => chapter.data.novel === novelSlug)
        .sort((a, b) => a.data.chapterNumber - b.data.chapterNumber);

      // console.log(`📚 Found novel: ${novel.data.title} with ${novelChapters.length} chapters`);

      // 1. 소설 대표 이미지 생성
      const novelCoverImage = await this.generateNovelCoverImage({
        title: novel.data.title,
        summary: novel.data.summary,
        tropes: novel.data.tropes,
        author: novel.data.author,
      });

      // 2. 각 챕터 핵심 포인트 분석
      const chapterResults: ChapterImageData[] = [];

      for (const chapter of novelChapters) {
        const chapterImageData = await this.analyzeChapterKeyPoint(chapter.body, {
          slug: chapter.slug,
          chapterNumber: chapter.data.chapterNumber,
          title: chapter.data.title,
        });

        chapterResults.push(chapterImageData);

        // API 속도 제한을 위한 지연
        await this.delay(2000);
      }

      const novelImageData: NovelImageData = {
        novelSlug,
        novelTitle: novel.data.title,
        coverImagePoint: novelCoverImage,
        chapters: chapterResults,
        lastAnalyzed: new Date(),
      };

      // 결과 저장
      await this.saveNovelImageData(novelImageData);

      // console.log(`🎉 Complete analysis finished for: ${novel.data.title}`);
      // console.log(`   - Novel cover: Generated`);
      // console.log(`   - Chapters analyzed: ${chapterResults.length}`);
      // console.log(`   - Key image points found: ${chapterResults.filter(c => c.keyImagePoint).length}`);

      return novelImageData;
    } catch (_error) {
      // console.error(`Error analyzing novel ${novelSlug}:`, _error);
      throw _error;
    }
  }

  /**
   * 해당 챕터의 문단에서 targetParagraph 위치 찾기
   */
  findParagraphPosition(chapterContent: string, targetParagraph: string): number {
    if (!targetParagraph) return 50; // 기본값

    try {
      const paragraphs = chapterContent
        .split('\n')
        .filter(p => p.trim().length > 0)
        .map(p => p.trim());

      // 정확한 매치 찾기
      let matchIndex = paragraphs.findIndex(p => p.includes(targetParagraph.trim()));

      // 부분 매치 시도
      if (matchIndex === -1) {
        const words = targetParagraph.trim().split(' ').slice(0, 5); // 첫 5단어
        matchIndex = paragraphs.findIndex(p => words.some(word => p.includes(word)));
      }

      if (matchIndex !== -1) {
        return matchIndex;
      }

      return Math.floor(paragraphs.length / 2); // 중간 지점
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Error finding paragraph position:');
      return 50; // 폴백
    }
  }

  /**
   * 분석 결과 저장
   */
  private async saveNovelImageData(novelImageData: NovelImageData): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      const outputDir = path.join(process.cwd(), 'src', 'data', 'novel-images');

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = `${novelImageData.novelSlug}-complete.json`;
      const filepath = path.join(outputDir, filename);

      await fs.promises.writeFile(filepath, JSON.stringify(novelImageData, null, 2), 'utf-8');

      // console.log(`💾 Saved complete novel image data: ${filename}`);
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Could not save novel image data:');
    }
  }

  /**
   * 저장된 분석 결과 로드
   */
  async loadNovelImageData(novelSlug: string): Promise<NovelImageData | null> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      const filepath = path.join(
        process.cwd(),
        'src',
        'data',
        'novel-images',
        `${novelSlug}-complete.json`
      );

      if (!fs.existsSync(filepath)) {
        return null;
      }

      const data = await fs.promises.readFile(filepath, 'utf-8');
      return JSON.parse(data) as NovelImageData;
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Could not load novel image data:');
      return null;
    }
  }

  /**
   * 지연 함수 (API 속도 제한)
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 분석기 인스턴스 내보내기
export const simplifiedImageAnalyzer = new SimplifiedImageAnalyzer();
