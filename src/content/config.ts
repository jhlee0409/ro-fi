import { defineCollection, z } from 'astro:content';

// 트렌드/클리셰 컬렉션 스키마
const tropesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    slug: z.string().optional(),
    description: z.string(),
  }),
});

// 소설 컬렉션 스키마  
const novelsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(5, "제목은 최소 5자 이상이어야 합니다"),
    slug: z.string().min(3, "slug는 최소 3자 이상이어야 합니다").optional(),
    author: z.string().default('Gemini AI'),
    coverImage: z.string().optional(),
    summary: z.string().min(50, "줄거리는 최소 50자 이상이어야 합니다").refine(val => !val.includes("자동 생성"), "줄거리에 '자동 생성' 문구가 포함될 수 없습니다"),
    status: z.enum(['연재 중', '완결', '휴재']).default('연재 중'),
    tropes: z.array(z.string()).min(2, "최소 2개 이상의 트로프가 필요합니다").refine(val => !(val.length === 2 && val.includes("로맨스") && val.includes("판타지")), "트로프가 너무 일반적입니다. 구체적인 트로프를 사용해주세요"), // tropes 컬렉션과의 관계
    publishedDate: z.coerce.date().default(() => new Date()),
    totalChapters: z.number().default(0),
    rating: z.number().min(0).max(5).optional().default(0), // 평점 필드 추가
  }),
});

// 챕터 컬렉션 스키마
const chaptersCollection = defineCollection({
  type: 'content', 
  schema: z.object({
    title: z.string(),
    novel: z.string(), // 부모 소설의 slug
    chapterNumber: z.number(),
    publicationDate: z.coerce.date().default(() => new Date()),
    wordCount: z.number().optional(),
    summary: z.string().optional(),
    rating: z.number().min(0).max(5).optional().default(0), // 평점 필드 추가
  }),
});

// 컬렉션 내보내기
export const collections = {
  novels: novelsCollection,
  chapters: chaptersCollection, 
  tropes: tropesCollection,
};