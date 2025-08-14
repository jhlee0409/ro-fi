#!/usr/bin/env node

/**
 * JavaScript to TypeScript 변환 스크립트
 * lib 디렉토리의 모든 JS 파일을 TypeScript로 변환
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(__dirname, '..');
const libDir = join(projectRoot, 'src', 'lib');

// 변환 대상에서 제외할 파일들
const excludeFiles = ['environment.js', 'metrics-collector.js'];

console.log('🔄 JavaScript to TypeScript 변환 시작...\n');

// lib 디렉토리의 JS 파일 목록 가져오기
import { execSync } from 'child_process';

const jsFiles = execSync(`find ${libDir} -name "*.js" -type f`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(file => file)
  .filter(file => !excludeFiles.some(exclude => file.endsWith(exclude)));

console.log(`발견된 JS 파일: ${jsFiles.length}개`);
jsFiles.forEach(file => console.log(`  - ${file.replace(projectRoot, '.')}`));

const conversionResults = [];

for (const jsFile of jsFiles) {
  try {
    console.log(`\n🔄 변환 중: ${jsFile.replace(projectRoot, '.')}`);
    
    const content = readFileSync(jsFile, 'utf8');
    const tsFile = jsFile.replace('.js', '.ts');
    
    // 기본적인 TypeScript 변환
    let convertedContent = convertToTypeScript(content, jsFile);
    
    // TypeScript 파일로 저장
    writeFileSync(tsFile, convertedContent);
    
    // 원본 JS 파일 삭제
    unlinkSync(jsFile);
    
    conversionResults.push({
      original: jsFile,
      converted: tsFile,
      status: 'success'
    });
    
    console.log(`✅ 변환 완료: ${tsFile.replace(projectRoot, '.')}`);
    
  } catch (error) {
    console.error(`❌ 변환 실패: ${jsFile}`, error.message);
    conversionResults.push({
      original: jsFile,
      converted: null,
      status: 'failed',
      error: error.message
    });
  }
}

// 결과 요약
console.log('\n📊 변환 결과 요약:');
console.log('=================');

const successful = conversionResults.filter(r => r.status === 'success');
const failed = conversionResults.filter(r => r.status === 'failed');

console.log(`✅ 성공: ${successful.length}개 파일`);
console.log(`❌ 실패: ${failed.length}개 파일`);

if (failed.length > 0) {
  console.log('\n실패한 파일들:');
  failed.forEach(f => console.log(`  - ${f.original}: ${f.error}`));
}

console.log('\n🎉 변환 프로세스 완료!');

/**
 * JavaScript 코드를 TypeScript로 변환
 */
function convertToTypeScript(content, filePath) {
  let result = content;
  
  // 파일별 특별 처리
  const fileName = filePath.split('/').pop();
  
  // 기본적인 변환 로직들
  result = addBasicTypes(result, fileName);
  result = convertImports(result);
  result = addInterfaceDefinitions(result, fileName);
  result = addTypeAnnotations(result);
  
  return result;
}

/**
 * 기본 타입 추가
 */
function addBasicTypes(content, fileName) {
  let result = content;
  
  // export function에 기본 타입 추가
  result = result.replace(
    /export function (\w+)\(([^)]*)\)\s*{/g,
    (match, funcName, params) => {
      // 파라미터 타입 추가
      let typedParams = params;
      if (params.trim()) {
        // 간단한 파라미터 타입 추론
        typedParams = params.split(',').map(param => {
          const trimmed = param.trim();
          if (trimmed.includes('=')) {
            // 기본값이 있는 경우
            const [name, defaultValue] = trimmed.split('=');
            const inferredType = inferTypeFromDefault(defaultValue.trim());
            return `${name.trim()}: ${inferredType}`;
          } else {
            // 기본값이 없는 경우 any 타입
            return `${trimmed}: any`;
          }
        }).join(', ');
      }
      
      // 반환 타입 추론
      const returnType = inferReturnType(content, funcName);
      
      return `export function ${funcName}(${typedParams}): ${returnType} {`;
    }
  );
  
  return result;
}

/**
 * import 문 변환
 */
function convertImports(content) {
  // .js 확장자를 .ts로 변경 (상대 경로만)
  return content.replace(
    /from ['"](\.[^'"]*\.js)['"]/g,
    "from '$1'"
  );
}

/**
 * 인터페이스 정의 추가
 */
function addInterfaceDefinitions(content, fileName) {
  let result = content;
  
  // 클래스 기반 파일의 경우 인터페이스 추가
  if (content.includes('export class')) {
    result = addClassInterfaces(result, fileName);
  }
  
  return result;
}

/**
 * 타입 어노테이션 추가
 */
function addTypeAnnotations(content) {
  let result = content;
  
  // 클래스 멤버 변수에 타입 추가
  result = result.replace(
    /^\s*(\w+)\s*=\s*(.+);$/gm,
    (match, varName, value) => {
      const inferredType = inferTypeFromValue(value);
      return match.replace(`${varName} =`, `${varName}: ${inferredType} =`);
    }
  );
  
  return result;
}

/**
 * 클래스용 인터페이스 추가
 */
function addClassInterfaces(content, fileName) {
  // 파일명에 따른 특별 처리
  if (fileName.includes('generator')) {
    return addGeneratorInterfaces(content);
  } else if (fileName.includes('engine')) {
    return addEngineInterfaces(content);
  } else if (fileName.includes('optimizer')) {
    return addOptimizerInterfaces(content);
  }
  
  return content;
}

/**
 * Generator 클래스용 인터페이스
 */
function addGeneratorInterfaces(content) {
  const interfaces = `
interface GeneratorConfig {
  enabled?: boolean;
  maxRetries?: number;
  timeout?: number;
}

interface GenerationOptions {
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface GenerationResult {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: Record<string, any>;
}

`;
  
  return interfaces + content;
}

/**
 * Engine 클래스용 인터페이스
 */
function addEngineInterfaces(content) {
  const interfaces = `
interface EngineConfig {
  enabled?: boolean;
  bufferSize?: number;
  cacheSize?: number;
}

interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: number;
}

`;
  
  return interfaces + content;
}

/**
 * Optimizer 클래스용 인터페이스
 */
function addOptimizerInterfaces(content) {
  const interfaces = `
interface OptimizerConfig {
  enabled?: boolean;
  maxSize?: number;
  ttl?: number;
}

interface OptimizationResult {
  optimized: boolean;
  savings?: number;
  metadata?: Record<string, any>;
}

`;
  
  return interfaces + content;
}

/**
 * 기본값에서 타입 추론
 */
function inferTypeFromDefault(defaultValue) {
  if (defaultValue === 'true' || defaultValue === 'false') return 'boolean';
  if (/^\d+$/.test(defaultValue)) return 'number';
  if (/^['"].*['"]$/.test(defaultValue)) return 'string';
  if (defaultValue === '{}') return 'Record<string, any>';
  if (defaultValue === '[]') return 'any[]';
  if (defaultValue === 'null') return 'any | null';
  return 'any';
}

/**
 * 값에서 타입 추론
 */
function inferTypeFromValue(value) {
  const trimmed = value.trim();
  
  if (trimmed === 'true' || trimmed === 'false') return 'boolean';
  if (/^\d+$/.test(trimmed)) return 'number';
  if (/^['"].*['"]$/.test(trimmed)) return 'string';
  if (trimmed === '{}') return 'Record<string, any>';
  if (trimmed === '[]') return 'any[]';
  if (trimmed.startsWith('new ')) {
    const className = trimmed.match(/new (\w+)/)?.[1];
    return className || 'any';
  }
  
  return 'any';
}

/**
 * 함수 반환 타입 추론
 */
function inferReturnType(content, funcName) {
  // 함수 본문에서 return 문 찾기
  const funcRegex = new RegExp(`export function ${funcName}\\([^)]*\\)\\s*{([^}]*(?:{[^}]*}[^}]*)*)}`);
  const match = content.match(funcRegex);
  
  if (!match) return 'any';
  
  const funcBody = match[1];
  
  // return 문 분석
  if (funcBody.includes('return true') || funcBody.includes('return false')) {
    return 'boolean';
  }
  if (funcBody.includes('return {')) {
    return 'Record<string, any>';
  }
  if (funcBody.includes('return [')) {
    return 'any[]';
  }
  if (funcBody.includes('return ')) {
    return 'any';
  }
  
  // return이 없으면 void
  return 'void';
}