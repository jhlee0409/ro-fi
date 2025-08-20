/**
 * 🎯 연속성 강화 생성기 v2.0
 * 
 * 기존 ai-novel-generator.js와 완벽 호환되는 연속성 시스템 통합
 */

import SimpleContinuityManager from './simple-continuity-system.js';
import { SimplePromptBuilder } from './config/simplified-prompt-templates.js';

/**
 * 🔗 기존 생성기와 연속성 시스템 통합 클래스
 */
export class ContinuityEnhancedGenerator {
  constructor(originalGenerator, logger) {
    this.originalGenerator = originalGenerator;
    this.logger = logger;
    this.continuityManager = new SimpleContinuityManager(logger);
    this.continuityEnabled = process.env.ENABLE_CONTINUITY_SYSTEM === 'true';
  }

  /**
   * 기존 generateContent 메서드를 연속성 강화 버전으로 래핑
   */
  async generateContent(prompt, creativity = 'standard') {
    if (!this.continuityEnabled) {
      await this.logger.info('연속성 시스템 비활성화 - 기존 방식 사용');
      return await this.originalGenerator.generateContent(prompt, creativity);
    }

    try {
      // novelSlug 추출
      const novelSlug = this.extractNovelSlug(prompt);
      
      if (!novelSlug || novelSlug === 'unknown') {
        await this.logger.warn('novelSlug 추출 실패 - 기존 방식으로 폴백');
        return await this.originalGenerator.generateContent(prompt, creativity);
      }

      return await this.generateWithContinuity(novelSlug, prompt, creativity);
    } catch (error) {
      await this.logger.error('연속성 생성 실패, 기존 방식으로 폴백:', error);
      return await this.originalGenerator.generateContent(prompt, creativity);
    }
  }

  /**
   * 연속성 기반 생성
   */
  async generateWithContinuity(novelSlug, originalPrompt, creativity) {
    await this.logger.info(`🎯 연속성 기반 생성 시작: ${novelSlug}`);

    // 다음 챕터 준비
    const { prompt: continuityPrompt, context, shouldComplete } = 
      await this.continuityManager.prepareNextChapter(novelSlug);

    // 연속성 프롬프트로 생성
    await this.logger.info(`📝 챕터 ${context.chapterNumber} 생성 중...`);
    const generatedContent = await this.originalGenerator.generateContent(
      continuityPrompt,
      creativity
    );

    // 생성 결과 처리
    const processResult = await this.continuityManager.processGeneratedChapter(
      novelSlug,
      generatedContent
    );

    // 연속성 메타데이터 추가
    const enhancedResult = {
      ...generatedContent,
      continuityMetadata: {
        novelSlug,
        chapterNumber: processResult.chapterData.chapterNumber,
        continuityScore: processResult.validation.continuityScore,
        arcProgress: context.currentArc,
        plotProgress: Math.round(context.plotProgress),
        romanceProgression: context.romanceProgression,
        isValid: processResult.validation.valid,
        warnings: processResult.validation.warnings,
        isCompleted: shouldComplete || processResult.chapterData.status === '완결',
        systemVersion: '2.0'
      }
    };

    await this.logger.success(`✅ 연속성 생성 완료`, {
      chapter: processResult.chapterData.chapterNumber,
      continuityScore: processResult.validation.continuityScore,
      plotProgress: `${Math.round(context.plotProgress)}%`
    });

    return enhancedResult;
  }

  /**
   * 새 소설 생성
   */
  async generateNewNovel(novelInfo = {}) {
    if (!this.continuityEnabled) {
      await this.logger.info('연속성 시스템 비활성화 - 기존 소설 생성');
      const prompt = new SimplePromptBuilder()
        .addNovelCreation(novelInfo)
        .build();
      return await this.originalGenerator.generateContent(prompt);
    }

    try {
      await this.logger.info('🆕 새 연속성 소설 생성 시작');
      
      // 새 소설 시작
      const { novelSlug, prompt, initialState } = 
        await this.continuityManager.startNewNovel(novelInfo);

      // 첫 챕터 생성
      const generatedContent = await this.originalGenerator.generateContent(prompt);

      // 첫 챕터 처리
      const processResult = await this.continuityManager.processGeneratedChapter(
        novelSlug,
        generatedContent
      );

      const enhancedResult = {
        ...generatedContent,
        novelMetadata: {
          novelSlug,
          title: initialState.metadata.title,
          isNewNovel: true,
          targetChapters: initialState.metadata.completionTarget,
          firstChapter: processResult.chapterData.chapterNumber
        },
        continuityMetadata: {
          novelSlug,
          chapterNumber: 1,
          continuityScore: 100,
          arcProgress: 'introduction',
          plotProgress: 0,
          romanceProgression: 0,
          isValid: true,
          warnings: [],
          systemVersion: '2.0'
        }
      };

      await this.logger.success(`📚 새 소설 '${novelSlug}' 생성 완료!`);
      return enhancedResult;

    } catch (error) {
      await this.logger.error('새 소설 생성 실패:', error);
      throw error;
    }
  }

  /**
   * novelSlug 추출 (강화된 버전 - 의미있는 슬러그 생성)
   */
  extractNovelSlug(input) {
    // 1. novel-[slug]-chapter-[number] 패턴 추출 (대소문자 무관, 언더스코어 포함)
    const chapterMatch = input.match(/novel-([a-zA-Z0-9_-]+)-chapter-\d+/i);
    if (chapterMatch) return this.validateSlug(chapterMatch[1]);

    // 2. 프롬프트에서 직접 추출 (더 유연한 패턴)
    const promptMatch = input.match(/novel[_-]([a-zA-Z0-9_-]+)/i);
    if (promptMatch) return this.validateSlug(promptMatch[1]);

    // 3. 파일명 패턴 추출 (더 유연한 패턴)
    const fileMatch = input.match(/([a-zA-Z0-9_-]+)-ch\d+/i);
    if (fileMatch) return this.validateSlug(fileMatch[1]);

    // 4. 컨텍스트에서 추출 시도
    const contextMatch = input.match(/novelSlug[:\s]+([a-zA-Z0-9_-]+)/i);
    if (contextMatch) return this.validateSlug(contextMatch[1]);

    // 5. 제목에서 슬러그 생성 시도
    const titleSlug = this.extractSlugFromTitle(input);
    if (titleSlug) return titleSlug;

    // 6. JSON 내용에서 추출 시도
    const jsonSlug = this.extractSlugFromJson(input);
    if (jsonSlug) return jsonSlug;

    // 7. 숫자로만 구성된 경우 (타임스탬프) - 더 엄격한 검증
    const numberMatch = input.match(/(\d{13})/);
    if (numberMatch && !this.hasOtherMeaningfulContent(input)) {
      return numberMatch[1];
    }

    // 8. 기본값 - 의미있는 슬러그 생성 시도
    if (input.includes('새') || input.includes('신규') || input.includes('new')) {
      return this.generateMeaningfulSlug('new-story');
    }

    // 9. 최후 수단 - 컨텐츠 기반 슬러그 생성
    return this.generateSlugFromContent(input) || null;
  }

  /**
   * 슬러그 품질 검증
   */
  validateSlug(slug) {
    if (!slug) return null;
    
    // 너무 짧거나 숫자만 있는 경우 거부
    if (slug.length < 3 || /^\d+$/.test(slug)) {
      return null;
    }
    
    // 유효한 문자만 포함하는지 확인
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return null;
    }
    
    return slug.toLowerCase();
  }

  /**
   * 제목에서 슬러그 추출
   */
  extractSlugFromTitle(input) {
    // 제목: "..." 패턴 (더 유연한 따옴표 처리)
    const titleMatch = input.match(/제목[:\s]*["'""]([^"'"'"]+)["'"'"]/);
    if (titleMatch) {
      return this.generateMeaningfulSlug(titleMatch[1]);
    }

    // title: "..." 패턴 (더 유연한 따옴표 처리)
    const englishTitleMatch = input.match(/title[:\s]*["'""]([^"'"'"]+)["'"'"]/i);
    if (englishTitleMatch) {
      return this.generateMeaningfulSlug(englishTitleMatch[1]);
    }

    return null;
  }

  /**
   * JSON 내용에서 슬러그 추출
   */
  extractSlugFromJson(input) {
    try {
      // JSON 형태의 입력에서 제목 찾기 - 더 정확한 패턴
      const jsonMatch = input.match(/"title":\s*"([^"]+)"/);
      if (jsonMatch && jsonMatch[1] !== 'title') { // 'title' 자체가 아닌 실제 제목
        return this.generateMeaningfulSlug(jsonMatch[1]);
      }
      
      // metadata 안의 title 찾기
      const metadataMatch = input.match(/"metadata":\s*{[^}]*"title":\s*"([^"]+)"/s);
      if (metadataMatch && metadataMatch[1] !== 'metadata') {
        return this.generateMeaningfulSlug(metadataMatch[1]);
      }
      
      // 실제 JSON 파싱 시도
      try {
        const jsonObj = JSON.parse(input);
        if (jsonObj.title && typeof jsonObj.title === 'string') {
          return this.generateMeaningfulSlug(jsonObj.title);
        }
        if (jsonObj.metadata && jsonObj.metadata.title && typeof jsonObj.metadata.title === 'string') {
          return this.generateMeaningfulSlug(jsonObj.metadata.title);
        }
      } catch (_parseError) {
        // JSON 파싱 실패는 정상적인 상황
      }
    } catch (_error) {
      // JSON 추출 실패시 무시
    }
    
    return null;
  }

  /**
   * 의미있는 슬러그 생성
   */
  generateMeaningfulSlug(title) {
    if (!title || typeof title !== 'string') return null;
    
    // 한국어 제목 처리 맵
    const koreanTitleMap = {
      '시간': 'time',
      '마법사': 'mage', 
      '사랑': 'love',
      '공작': 'duke',
      '공주': 'princess',
      '기사': 'knight',
      '마녀': 'witch',
      '용': 'dragon',
      '검': 'sword',
      '마음': 'heart',
      '운명': 'fate',
      '운명적': 'fate',
      '테스트': 'test',
      '로맨스': 'romance',
      '판타지': 'fantasy',
      '얼음': 'ice',
      '손길': 'touch',
      '도서관': 'library',
      '엘프': 'elf',
      '그림자': 'shadow',
      '달빛': 'moonlight',
      '꽃': 'bloom',
      '심장': 'heart',
      '닿은': 'touch',
      '을': '',
      '를': '',
      '이': '',
      '가': '',
      '의': '',
      '에': '',
      '으로': '',
      '되돌린': 'return'
    };
    
    // 1단계: 기본 정리
    let slug = title.toLowerCase()
      .replace(/\s+/g, '-')  // 공백을 하이픈으로
      .replace(/[^\w\s가-힣-]/g, '') // 한국어를 제외한 특수문자 제거
      .replace(/--+/g, '-')  // 연속 하이픈 정리
      .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거
    
    // 2단계: 한국어 단어 변환
    Object.entries(koreanTitleMap).forEach(([korean, english]) => {
      slug = slug.replace(new RegExp(korean, 'g'), english);
    });
    
    // 3단계: 남아있는 한국어 로마자 변환
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(slug)) {
      // 완성형 한글을 우선 처리
      const complexKoreanMap = {
        '얼음': 'ice',
        '공주': 'princess', 
        '운명적': 'fate',
        '심장에': 'heart',
        '손길': 'touch',
        '그림자': 'shadow',
        '달빛': 'moonlight'
      };
      
      Object.entries(complexKoreanMap).forEach(([korean, english]) => {
        slug = slug.replace(new RegExp(korean, 'g'), english);
      });
      
      // 여전히 한국어가 남았다면 로마자 변환
      if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(slug)) {
        slug = this.romanizeKorean(slug);
      }
    }
    
    // 4단계: 최종 정리
    slug = slug
      .replace(/[^a-zA-Z0-9-]/g, '') // 영문자, 숫자, 하이픈만 허용
      .replace(/--+/g, '-')          // 연속 하이픈 정리
      .replace(/^-|-$/g, '')         // 앞뒤 하이픈 제거
      .replace(/x+/g, 'x')           // 연속 x 정리 (로마자화 실패 문자)
      .substring(0, 50);             // 길이 제한
    
    // 빈 문자열이거나 너무 짧으면 null 반환
    return slug.length >= 3 ? slug : null;
  }

  /**
   * 한국어 로마자 변환 (확장된 버전)
   */
  romanizeKorean(text) {
    const romanMap = {
      // 자음
      'ㄱ': 'g', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄹ': 'r', 'ㅁ': 'm',
      'ㅂ': 'b', 'ㅅ': 's', 'ㅇ': '', 'ㅈ': 'j', 'ㅊ': 'ch',
      'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
      // 모음
      'ㅏ': 'a', 'ㅑ': 'ya', 'ㅓ': 'eo', 'ㅕ': 'yeo', 'ㅗ': 'o',
      'ㅛ': 'yo', 'ㅜ': 'u', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅣ': 'i',
      // 완성형 글자 (주요 단어들)
      '가': 'ga', '나': 'na', '다': 'da', '라': 'ra', '마': 'ma',
      '바': 'ba', '사': 'sa', '아': 'a', '자': 'ja', '차': 'cha',
      '카': 'ka', '타': 'ta', '파': 'pa', '하': 'ha',
      '공': 'gong', '주': 'ju', '작': 'jak', '심': 'sim', '장': 'jang',
      '손': 'son', '길': 'gil', '도': 'do', '서': 'seo', '관': 'gwan',
      '엘': 'el', '리': 'ri', '그': 'geu', '림': 'rim', '달': 'dal',
      '빛': 'bit', '운': 'un', '명': 'myeong', '적': 'jeok'
    };
    
    return text.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, char => romanMap[char] || 'x')
               .replace(/x+/g, 'x'); // 연속 x 정리
  }

  /**
   * 다른 의미있는 내용이 있는지 확인
   */
  hasOtherMeaningfulContent(input) {
    return /[a-zA-Z가-힣]/.test(input.replace(/\d/g, ''));
  }

  /**
   * 컨텐츠에서 슬러그 생성
   */
  generateSlugFromContent(input) {
    // 마지막 수단: 입력에서 의미있는 단어 추출
    const words = input.match(/[a-zA-Z가-힣]{3,}/g);
    if (words && words.length > 0) {
      const firstWord = words[0].toLowerCase();
      return this.generateMeaningfulSlug(firstWord);
    }
    
    return null;
  }

  /**
   * 연속성 상태 확인
   */
  async getContinuityStatus() {
    if (!this.continuityEnabled) {
      return {
        continuityEnabled: false,
        reason: 'ENABLE_CONTINUITY_SYSTEM=false'
      };
    }

    return await this.continuityManager.getSystemStatus();
  }

  /**
   * 특정 소설의 다음 챕터 프롬프트 미리보기
   */
  async previewNextChapter(novelSlug) {
    const { prompt, context } = await this.continuityManager.prepareNextChapter(novelSlug);
    return {
      novelSlug,
      nextChapter: context.chapterNumber,
      currentArc: context.currentArc,
      plotProgress: context.plotProgress,
      suggestions: context.suggestions,
      isNearEnding: context.isNearEnding,
      prompt: prompt.substring(0, 500) + '...' // 미리보기용 축약
    };
  }

  /**
   * 소설 완결 처리
   */
  async completeNovel(novelSlug) {
    await this.logger.info(`🎊 소설 완결 처리: ${novelSlug}`);
    
    // 완결 프롬프트 생성 및 실행
    const context = await this.continuityManager.stateManager.getNextChapterContext(novelSlug);
    const prompt = await this.continuityManager.promptGenerator.generateEndingPrompt(novelSlug, context);
    
    const generatedContent = await this.originalGenerator.generateContent(prompt, 'high');
    
    // 완결 처리
    const processResult = await this.continuityManager.processGeneratedChapter(novelSlug, generatedContent);
    await this.continuityManager.stateManager.completeStory(novelSlug);

    return {
      ...generatedContent,
      novelMetadata: {
        novelSlug,
        isCompleted: true,
        finalChapter: processResult.chapterData.chapterNumber,
        completedAt: new Date().toISOString()
      }
    };
  }

  /**
   * 연속성 시스템 토글
   */
  toggleContinuitySystem(enabled) {
    this.continuityEnabled = enabled;
    this.logger.info(`연속성 시스템 ${enabled ? '활성화' : '비활성화'}됨`);
  }
}

/**
 * 🛠️ 기존 생성기 래핑 헬퍼
 */
export class GeneratorWrapper {
  /**
   * 기존 NovelGenerator를 연속성 강화 버전으로 업그레이드
   */
  static enhanceWithContinuity(originalGenerator, logger) {
    const enhancedGenerator = new ContinuityEnhancedGenerator(originalGenerator, logger);
    
    // 기존 메서드들 보존하면서 연속성 기능 추가
    const wrapper = {
      // 기존 메서드들 위임
      ...originalGenerator,
      
      // 연속성 강화 메서드들
      generateContent: enhancedGenerator.generateContent.bind(enhancedGenerator),
      generateNewNovel: enhancedGenerator.generateNewNovel.bind(enhancedGenerator),
      completeNovel: enhancedGenerator.completeNovel.bind(enhancedGenerator),
      getContinuityStatus: enhancedGenerator.getContinuityStatus.bind(enhancedGenerator),
      previewNextChapter: enhancedGenerator.previewNextChapter.bind(enhancedGenerator),
      toggleContinuitySystem: enhancedGenerator.toggleContinuitySystem.bind(enhancedGenerator),
      
      // 내부 참조
      _originalGenerator: originalGenerator,
      _continuityManager: enhancedGenerator.continuityManager,
      _isEnhanced: true
    };

    logger.success('✅ NovelGenerator 연속성 시스템 통합 완료');
    return wrapper;
  }

  /**
   * 환경 변수 확인
   */
  static isContinuityEnabled() {
    return process.env.ENABLE_CONTINUITY_SYSTEM === 'true';
  }

  /**
   * 연속성 데이터 디렉토리 생성
   */
  static async ensureDataDirectory() {
    const { mkdir } = await import('fs/promises');
    try {
      await mkdir('./data/story-states', { recursive: true });
      return true;
    } catch (error) {
      console.warn('데이터 디렉토리 생성 실패:', error.message);
      return false;
    }
  }
}

export default { ContinuityEnhancedGenerator, GeneratorWrapper };