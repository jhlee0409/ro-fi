import { createStoryGenerator } from './ai-story-generator.js';
import { createGeminiGenerator } from './gemini-story-generator.js';
import { QualityAssuranceEngine } from './quality-assurance-engine.js';

/**
 * 하이브리드 AI 스토리 생성기
 * Claude와 Gemini의 강점을 결합한 최적화된 생성 시스템
 */
export class HybridAIGenerator {
  constructor(config = {}) {
    // Claude 생성기 (감성적 표현, 대화)
    this.claudeGenerator = config.claudeGenerator || createStoryGenerator();
    
    // Gemini 생성기 (세계관, 논리적 구조)
    this.geminiGenerator = config.geminiGenerator || createGeminiGenerator();
    
    // 품질 검증 엔진
    this.qualityEngine = new QualityAssuranceEngine();
    
    // 하이브리드 설정
    this.config = {
      useGeminiForWorldBuilding: true,
      useGeminiForPlotStructure: true,
      useClaudeForEmotionalScenes: true,
      useGeminiForConsistencyCheck: true,
      ...config
    };
    
    // 캐시 (세계관, 플롯 등 재사용)
    this.cache = {
      worldSettings: new Map(),
      plotStructures: new Map(),
      characterRelations: new Map()
    };
  }

  /**
   * 새 소설 초기 설정 (Gemini 주도)
   */
  async initializeNovel(title, tropes, concept) {
    console.log('🌍 Gemini로 세계관 구축 중...');
    
    if (!this.geminiGenerator) {
      console.warn('⚠️ Gemini 생성기 없음, Claude로 대체');
      return this.claudeBasedInitialization(title, tropes, concept);
    }

    try {
      // 1. 세계관 구축 (Gemini)
      const worldSettings = await this.geminiGenerator.generateWorldBuilding(
        title, 
        tropes
      );
      
      // 2. 캐릭터 프로필 생성 (Claude - 감성적 묘사)
      const characters = await this.claudeGenerator.generateCharacterProfiles(
        title, 
        tropes
      );
      
      // 3. 캐릭터 관계도 (Gemini - 복잡한 관계)
      const relationships = await this.geminiGenerator.generateCharacterRelationships(
        characters,
        worldSettings
      );
      
      // 4. 전체 플롯 구조 (Gemini - 논리적 구성)
      const plotStructure = await this.geminiGenerator.generateComplexPlotStructure(
        worldSettings,
        characters
      );
      
      // 캐시에 저장
      const novelKey = title.replace(/\s+/g, '-').toLowerCase();
      this.cache.worldSettings.set(novelKey, worldSettings);
      this.cache.plotStructures.set(novelKey, plotStructure);
      this.cache.characterRelations.set(novelKey, relationships);
      
      return {
        worldSettings,
        characters,
        relationships,
        plotStructure
      };
    } catch (error) {
      console.error('❌ 하이브리드 초기화 실패:', error);
      return this.claudeBasedInitialization(title, tropes, concept);
    }
  }

  /**
   * 챕터 생성 (하이브리드 접근)
   */
  async generateChapter(options) {
    const {
      title,
      tropes,
      chapterNumber,
      previousContext,
      characterContext,
      plotOutline,
      emotionalIntensity = 'normal' // 감정 강도 파라미터 추가
    } = options;

    // config 설정에 따른 처리 흐름 제어
    const shouldUseGeminiForWorldBuilding = this.config.useGeminiForWorldBuilding && this.geminiGenerator;
    const shouldUseGeminiForPlotStructure = this.config.useGeminiForPlotStructure && this.geminiGenerator;

    console.log(`🎭 하이브리드 AI로 챕터 ${chapterNumber} 생성 중...`);

    try {
      // 캐시에서 세계관 정보 가져오기
      const novelKey = title.replace(/\s+/g, '-').toLowerCase();
      const worldSettings = this.cache.worldSettings.get(novelKey);
      const plotStructure = this.cache.plotStructures.get(novelKey);

      // 1단계: 챕터 구조 설계 (config 설정에 따라 결정)
      let chapterOutline = plotOutline; // 기본값으로 전달받은 plotOutline 사용
      
      // 세계관 정보가 필요한 경우 Gemini 활용
      if (shouldUseGeminiForWorldBuilding && !worldSettings) {
        console.log('🌍 Gemini로 세계관 정보 보강 중...');
        try {
          const enhancedWorldSettings = await this.geminiGenerator.generateWorldBuilding(
            title, 
            tropes, 
            worldSettings || {}
          );
          // 캐시에 저장
          this.cache.worldSettings.set(novelKey, enhancedWorldSettings);
        } catch (error) {
          console.warn('세계관 보강 실패:', error);
        }
      }
      
      if (shouldUseGeminiForPlotStructure && plotStructure) {
        chapterOutline = await this.generateChapterOutline(
          chapterNumber,
          plotStructure,
          previousContext
        );
      }

      // 2단계: 감정적 장면 작성 (Claude)
      let chapterContent;
      const isHighEmotionalChapter = this.isEmotionallyIntenseChapter(chapterNumber);
      
      // 2단계: 감정적 장면 작성 (Claude) - 에러 핸들링 강화
      try {
        if (isHighEmotionalChapter || emotionalIntensity === 'high') {
          console.log('💝 Claude로 감정 집중 챕터 생성...');
          chapterContent = await this.claudeGenerator.generateChapter({
            ...options,
            chapterOutline,
            worldSettings,
            characterContext,
            focusOnEmotion: true
          });
        } else {
          // 일반 챕터는 Claude가 기본 생성
          console.log('📝 Claude로 일반 챕터 생성...');
          chapterContent = await this.claudeGenerator.generateChapter({
            ...options,
            chapterOutline,
            worldSettings,
            characterContext
          });
        }
        
        console.log(`✅ Claude 생성 성공: ${chapterContent?.content?.length || 0}자`);
      } catch (claudeError) {
        console.error('❌ Claude 생성 실패:', claudeError.message);
        throw new Error(`Claude 챕터 생성 실패: ${claudeError.message}`);
      }

      // 3단계: 일관성 검증 (Gemini가 있으면 검증)
      if (this.geminiGenerator && this.config.useGeminiForConsistencyCheck) {
        console.log('🔍 Gemini로 일관성 검증 중...');
        const validation = await this.geminiGenerator.validateConsistency(
          previousContext,
          chapterContent.content
        );

        if (validation.issues && validation.issues.length > 0) {
          console.log('⚠️ 일관성 문제 발견, Claude로 수정 중...');
          chapterContent.content = await this.claudeGenerator.improveChapter(
            chapterContent.content,
            validation.issues
          );
        }
      }

      // 4단계: 최종 품질 검사
      const qualityAssessment = await this.qualityEngine.assessQuality(
        chapterContent.content
      );

      if (qualityAssessment.score < this.qualityEngine.qualityStandards.qualityThreshold) {
        console.log('🔧 품질 기준 미달, 개선 중...');
        chapterContent.content = await this.qualityEngine.improveContent(
          chapterContent.content,
          qualityAssessment
        );
      }

      return chapterContent;

    } catch (error) {
      console.error('❌ 하이브리드 생성 실패, Claude 단독 모드로 전환:', error);
      // 오류 시 Claude만으로 생성
      return await this.claudeGenerator.generateChapter(options);
    }
  }

  /**
   * 감정적으로 중요한 챕터 판단
   */
  isEmotionallyIntenseChapter(chapterNumber) {
    // 주요 감정선이 폭발하는 챕터들 (커스터마이징 가능)
    const emotionalChapters = [
      5,   // 첫 만남의 강렬함
      15,  // 첫 갈등
      25,  // 오해와 아픔
      35,  // 화해의 순간
      45,  // 고백
      55,  // 위기
      65,  // 재회
      70,  // 클라이맥스
      74   // 해피엔딩
    ];
    
    return emotionalChapters.includes(chapterNumber);
  }

  /**
   * Gemini로 챕터 개요 생성
   */
  async generateChapterOutline(chapterNumber, plotStructure, previousContext) {
    const prompt = `플롯 구조: ${plotStructure}
이전 내용: ${previousContext}

${chapterNumber}화의 상세 개요를 작성해주세요:
1. 이 챕터의 핵심 사건
2. 캐릭터들의 행동과 동기
3. 복선이나 암시
4. 다음 챕터로의 연결고리`;

    try {
      const result = await this.geminiGenerator.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.warn('챕터 개요 생성 실패:', error);
      return null;
    }
  }

  /**
   * Claude 전용 초기화 (Gemini 없을 때)
   */
  async claudeBasedInitialization(title, tropes, concept = '') {
    console.log('🎭 Claude 단독 모드로 초기화...');
    
    // concept 활용하여 더 정확한 초기화
    const enhancedTropes = concept ? [...tropes, `컨셉: ${concept}`] : tropes;
    
    const plotOutline = await this.claudeGenerator.generatePlotOutline(title, enhancedTropes);
    const characters = await this.claudeGenerator.generateCharacterProfiles(title, enhancedTropes);
    
    return {
      worldSettings: plotOutline,
      characters,
      relationships: '', // Claude는 관계도 생성 없음
      plotStructure: plotOutline
    };
  }

  /**
   * 콘텐츠 개선 (하이브리드)
   */
  async improveChapter(content, criteria) {
    // 논리적 문제는 Gemini로 확인
    if (this.geminiGenerator && criteria.some(c => 
      c.includes('논리') || c.includes('설정') || c.includes('일관성')
    )) {
      const validation = await this.geminiGenerator.validateConsistency('', content);
      if (validation.issues) {
        criteria = [...criteria, ...validation.issues];
      }
    }
    
    // 감성적 개선은 Claude가 담당
    return await this.claudeGenerator.improveChapter(content, criteria);
  }

  /**
   * 비용 효율적 모드
   */
  async generateChapterEconomical(options) {
    // 비용 절감을 위해 Claude만 사용
    console.log('💰 경제 모드: Claude 단독 생성');
    return await this.claudeGenerator.generateChapter(options);
  }
}

/**
 * 하이브리드 생성기 생성 헬퍼
 */
export function createHybridGenerator(config = {}) {
  const claudeGenerator = createStoryGenerator();
  const geminiGenerator = createGeminiGenerator();
  
  if (!claudeGenerator && !geminiGenerator) {
    console.error('❌ Claude와 Gemini 모두 사용할 수 없습니다.');
    return null;
  }
  
  if (!geminiGenerator) {
    console.warn('⚠️ Gemini를 사용할 수 없습니다. Claude 단독 모드로 실행됩니다.');
  }
  
  if (!claudeGenerator) {
    console.error('❌ Claude를 사용할 수 없습니다. Claude는 필수입니다.');
    return null;
  }
  
  return new HybridAIGenerator({
    claudeGenerator,
    geminiGenerator,
    ...config
  });
}