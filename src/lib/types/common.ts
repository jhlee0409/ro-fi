/**
 * 🔧 공통 타입 정의
 * 프로젝트 전반에서 사용되는 공통 타입들
 */

export type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONObject 
  | JSONArray;

export interface JSONObject {
  [key: string]: JSONValue;
}

export type JSONArray = JSONValue[];

export interface NovelMetadata {
  title: string;
  slug: string;
  author: string;
  status: 'active' | 'completed' | 'paused';
  genre?: string[];
  tags?: string[];
  description?: string;
  publishedDate?: string;
  lastUpdated?: string;
  chapterCount?: number;
  rating?: number;
  wordCount?: number;
}

export interface ChapterMetadata {
  title: string;
  chapterNumber: number;
  novel: string;
  publicationDate: string;
  wordCount: number;
  emotionalTone?: string;
  summary?: string;
  tags?: string[];
  qualityScore?: number;
  overallScore?: number;
}

export interface GenerationConfig {
  creativityLevel?: 'low' | 'medium' | 'high';
  targetLength?: number;
  emotionalTone?: string;
  allowBackstory?: boolean;
  novelType?: string;
  chapterNumber?: number;
}

export interface QualityScore {
  overall: number;
  readability: number;
  creativity: number;
  consistency: number;
  engagement: number;
}

export interface FileSystemPath {
  absolute: string;
  relative: string;
  filename: string;
  extension: string;
}

// 타입 가드 함수들
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isJSONObject(value: unknown): value is JSONObject {
  return isObject(value);
}

export function hasProperty<T extends PropertyKey>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> {
  return isObject(obj) && prop in obj;
}