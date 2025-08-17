/**
 * 이미지 생성 관련 타입 정의
 */

export interface ChapterImagePoint {
  id: string;
  position: number; // 0-100% 범위의 텍스트 내 위치
  type: 'scene_transition' | 'character_moment' | 'romance_tension' | 'fantasy_element' | 'visual_highlight';
  description: string; // 이미지로 표현할 장면 묘사
  mood: 'dramatic' | 'romantic' | 'mysterious' | 'action' | 'emotional';
  characters?: string[]; // 장면에 포함된 캐릭터들
  setting: string; // 장면의 배경/환경
  chapterTitle: string; // 챕터 제목
  targetParagraph?: string; // 해당 장면을 묘사하는 구체적 문단 텍스트
  generatedPrompt?: string; // AI 이미지 생성 프롬프트
}

export interface NovelCoverOptions {
  title: string;
  genre: string;
  tropes?: string[];
  mood: string;
  summary: string;
  author?: string;
}

export interface ImageGenerationResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  imagePoint: ChapterImagePoint;
  imageUrl?: string;
  generatedAt: Date;
  attempts: number;
  error?: string;
}

export interface ChapterImageData {
  chapterSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  keyImagePoint?: ChapterImagePoint; // 단일 핵심 이미지 포인트
  coverImageUrl?: string;
  lastAnalyzed: Date;
}

export interface NovelImageData {
  novelSlug: string;
  novelTitle: string;
  coverImagePoint?: ChapterImagePoint; // 소설 대표 이미지
  coverImageUrl?: string;
  chapters: ChapterImageData[];
  lastAnalyzed: Date;
}