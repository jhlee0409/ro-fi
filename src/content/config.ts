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
    title: z.string(),
    slug: z.string().optional(),
    author: z.string().default('클로드 소네트 AI'),
    coverImage: z.string().optional(),
    summary: z.string(),
    status: z.enum(['연재 중', '완결', '휴재']).default('연재 중'),
    tropes: z.array(z.string()).default([]), // tropes 컬렉션과의 관계
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