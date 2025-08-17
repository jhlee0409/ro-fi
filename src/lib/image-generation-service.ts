/**
 * Google Gemini AI 이미지 생성 서비스
 * 챕터 내 포인트 이미지 생성을 위한 AI 시스템
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChapterImagePoint, NovelCoverOptions, ImageGenerationResult } from './types/image-types';

export class ImageGenerationService {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required for image generation');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * 챕터 내용을 분석하여 핵심 이미지 포인트 1개를 식별
   */
  async identifyKeyImagePoint(chapterContent: string, chapterTitle: string): Promise<ChapterImagePoint | null> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `
로맨스 판타지 소설 챕터를 분석하여 가장 중요한 핵심 이미지 포인트 1개만 식별해주세요.

챕터 제목: ${chapterTitle}
챕터 내용:
${chapterContent}

다음 기준으로 가장 인상적이고 중요한 1개의 핵심 포인트만 선정해주세요:
1. 챕터의 절정/클라이맥스 순간
2. 가장 시각적으로 임팩트가 강한 장면
3. 캐릭터의 감정이나 관계 발전의 핵심 순간
4. 판타지 요소가 가장 드라마틱하게 나타나는 순간
5. 독자가 가장 기억에 남을 만한 장면

다음 정보를 JSON 형태로 제공해주세요:
- targetParagraph: 해당 장면을 묘사하는 구체적인 문단 텍스트 (정확한 원문 일부)
- position: 텍스트 내 해당 문단의 위치 (0-100% 범위)
- type: "scene_transition" | "character_moment" | "romance_tension" | "fantasy_element" | "visual_highlight"
- description: 이미지로 표현할 장면에 대한 상세한 묘사 (한국어, 150-250자)
- mood: "dramatic" | "romantic" | "mysterious" | "action" | "emotional"
- characters: 장면에 포함된 주요 캐릭터들
- setting: 장면의 배경/환경

응답은 JSON 객체 형태로만 제공해주세요.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSON 파싱 시도
      try {
        const imagePoint = JSON.parse(text) as ChapterImagePoint & { targetParagraph: string };
        return {
          ...imagePoint,
          id: `key-img-${Date.now()}`,
          chapterTitle
        };
      } catch (_parseError) {
        // console.warn('Failed to parse key image point JSON:', parseError);
        return this.createFallbackKeyImagePoint(chapterTitle);
      }
      
    } catch (_error) {
      // console.error('Error identifying key image point:', _error);
      return this.createFallbackKeyImagePoint(chapterTitle);
    }
  }

  /**
   * 이미지 포인트에 대한 이미지 프롬프트 생성
   */
  async generateImagePrompt(imagePoint: ChapterImagePoint): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `
로맨스 판타지 소설의 다음 장면을 위한 고품질 이미지 생성 프롬프트를 만들어주세요.

장면 정보:
- 유형: ${imagePoint.type}
- 분위기: ${imagePoint.mood}
- 설명: ${imagePoint.description}
- 캐릭터: ${imagePoint.characters?.join(', ') || '없음'}
- 배경: ${imagePoint.setting}

다음 요구사항을 만족하는 영어 이미지 프롬프트를 생성해주세요:
1. 현대적이고 세련된 일러스트 스타일
2. 로맨스 판타지 장르에 적합한 분위기
3. 4K 해상도에 적합한 고품질
4. 웹툰이나 라이트노벨 삽화 스타일
5. 따뜻하고 감성적인 색감

프롬프트는 100-150 단어 내외로 구체적이고 상세하게 작성해주세요.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
      
    } catch (_error) {
      // console.error('Error generating image prompt:', _error);
      return this.createFallbackImagePrompt(imagePoint);
    }
  }

  /**
   * 소설 대표 이미지 생성 프롬프트 (전체 소설을 대표)
   */
  async generateNovelCoverPrompt(options: NovelCoverOptions): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `
로맨스 판타지 소설의 대표 이미지를 위한 프롬프트를 생성해주세요.

소설 정보:
- 제목: ${options.title}
- 장르: ${options.genre}
- 트로프: ${options.tropes?.join(', ') || '로맨스 판타지'}
- 분위기: ${options.mood}
- 요약: ${options.summary}

다음 요구사항을 만족하는 영어 이미지 프롬프트를 생성해주세요:
1. 소설 전체를 가장 잘 표현하는 대표적인 장면
2. 주인공들의 관계와 스토리 핵심을 담은 구성
3. 3:4 세로 비율에 최적화된 커버 이미지 스타일
4. 현대적이고 고급스러운 로맨스 판타지 분위기
5. 웹툰/라이트노벨 일러스트 스타일

프롬프트는 영어로 120-180 단어 내외로 작성해주세요.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
      
    } catch (_error) {
      // console.error('Error generating novel cover prompt:', _error);
      return this.createFallbackCoverPrompt(options);
    }
  }

  /**
   * 이미지 생성 상태 추적 및 결과 관리
   */
  async trackImageGeneration(imagePoint: ChapterImagePoint, prompt: string): Promise<ImageGenerationResult> {
    const result: ImageGenerationResult = {
      id: imagePoint.id,
      status: 'pending',
      prompt,
      imagePoint,
      generatedAt: new Date(),
      attempts: 1
    };

    try {
      // 실제 이미지 생성은 외부 이미지 생성 API (DALL-E, Midjourney 등)를 통해 수행
      // 여기서는 상태 관리만 수행
      result.status = 'processing';
      
      // 이미지 생성 완료 시뮬레이션 (실제로는 API 호출 결과 대기)
      setTimeout(() => {
        result.status = 'completed';
        result.imageUrl = `/images/generated/${result.id}.jpg`;
      }, 5000);
      
      return result;
      
    } catch (_error) {
      // console.error('Error tracking image generation:', _error);
      result.status = 'failed';
      result.error = _error instanceof Error ? error.message : 'Unknown error';
      return result;
    }
  }

  /**
   * 폴백 핵심 이미지 포인트 생성
   */
  private createFallbackKeyImagePoint(chapterTitle: string): ChapterImagePoint {
    return {
      id: `fallback-key-${Date.now()}`,
      position: 60,
      type: 'character_moment',
      description: '챕터의 핵심 장면을 표현하는 감동적인 이미지',
      mood: 'dramatic',
      characters: [],
      setting: '챕터의 주요 배경',
      chapterTitle,
      targetParagraph: '핵심 장면 묘사 문단'
    };
  }

  /**
   * 폴백 이미지 프롬프트 생성
   */
  private createFallbackImagePrompt(imagePoint: ChapterImagePoint): string {
    const basePrompt = `High-quality romance fantasy illustration, modern webtoon style, 4K resolution, warm emotional lighting, ${imagePoint.mood} atmosphere`;
    
    switch (imagePoint.type) {
      case 'romance_tension':
        return `${basePrompt}, romantic tension scene, soft focus, intimate lighting, cinematic composition`;
      case 'fantasy_element':
        return `${basePrompt}, magical fantasy elements, mystical atmosphere, ethereal effects`;
      case 'character_moment':
        return `${basePrompt}, character emotional moment, expressive illustration, detailed character art`;
      default:
        return `${basePrompt}, dramatic scene transition, dynamic composition, storytelling illustration`;
    }
  }

  /**
   * 폴백 커버 이미지 프롬프트 생성
   */
  private createFallbackCoverPrompt(options: NovelCoverOptions): string {
    return `Professional romance fantasy book cover design, 3:4 vertical aspect ratio, modern elegant style, ${options.mood} atmosphere, symbolic elements representing ${options.genre}, high-quality commercial book cover, sophisticated typography space, premium romance novel aesthetic, 4K resolution, marketable design`;
  }
}

// 서비스 인스턴스 내보내기
export const imageGenerationService = new ImageGenerationService();