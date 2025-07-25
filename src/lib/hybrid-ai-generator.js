import { createStoryGenerator } from './ai-story-generator.js';
import { createGeminiGenerator } from './gemini-story-generator.js';
import { QualityAssuranceEngine } from './quality-assurance-engine.js';

/**
 * 하이브리드 AI 스토리 생성기
 * "감성의 Claude, 이성의 Gemini" 협업 시스템
 * 
 * Claude 전담: 감정 장면, 대화, 내적 독백, 캐릭터 감정선
 * Gemini 전담: 세계관 구축, 논리적 설정, 플롯 구조, 일관성 검증
 */
export class HybridAIGenerator {
  constructor(config = {}) {
    // Claude 생성기 (감성 전문가)
    this.claudeGenerator = config.claudeGenerator || createStoryGenerator();
    
    // Gemini 생성기 (논리 전문가)
    this.geminiGenerator = config.geminiGenerator || createGeminiGenerator();
    
    // 품질 검증 엔진
    this.qualityEngine = new QualityAssuranceEngine();
    
    // 새로운 역할 분배 설정
    this.config = {
      // Claude 전담 영역 (감성)
      claudeForEmotionalScenes: true,
      claudeForDialogue: true,
      claudeForInternalMonologue: true,
      claudeForCharacterGrowth: true,
      claudeForRomanticMoments: true,
      
      // Gemini 전담 영역 (이성)
      geminiForWorldBuilding: true,
      geminiForPlotStructure: true,
      geminiForLogicalConsistency: true,
      geminiForSettingManagement: true,
      geminiForComplexRelationships: true,
      
      // 협업 전략
      collaborativeMode: 'sequential', // sequential | parallel
      qualityCheckMode: 'cross-validation', // single | cross-validation
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
   * 새 소설 초기 설정 - 3단계 협업 워크플로우
   * 1단계(Gemini): 세계관 구축 → 2단계(Claude): 감성적 캐릭터 → 3단계(Gemini): 검수
   */
  async initializeNovel(title, tropes, concept) {
    console.log('🤝 하이브리드 3단계 소설 초기화 시작...');
    
    if (!this.geminiGenerator) {
      console.warn('⚠️ Gemini 생성기 없음, Claude 단독 모드로 전환');
      return this.claudeBasedInitialization(title, tropes, concept);
    }

    try {
      // 🧠 1단계: Gemini가 논리적 뼈대 구축
      console.log('🌍 1단계: Gemini로 세계관과 플롯 구조 설계...');
      const [worldSettings, plotStructure] = await Promise.all([
        this.geminiGenerator.generateWorldBuilding(title, tropes),
        this.geminiGenerator.generateComplexPlotStructure(null, null, 75)
      ]);
      
      // 💝 2단계: Claude가 감성적 캐릭터와 관계 생성
      console.log('💖 2단계: Claude로 감성적 캐릭터 프로필 생성...');
      const characters = await this.claudeGenerator.generateCharacterProfiles(
        title, 
        tropes
      );
      
      // 🔍 3단계: Gemini가 캐릭터 관계도와 일관성 검증
      console.log('🔧 3단계: Gemini로 관계도 설계 및 설정 검증...');
      const relationships = await this.geminiGenerator.generateCharacterRelationships(
        characters,
        worldSettings
      );
      
      // 캐시에 저장
      const novelKey = title.replace(/\s+/g, '-').toLowerCase();
      this.cache.worldSettings.set(novelKey, worldSettings);
      this.cache.plotStructures.set(novelKey, plotStructure);
      this.cache.characterRelations.set(novelKey, relationships);
      
      console.log('✅ 하이브리드 초기화 완료: 논리적 구조 + 감성적 캐릭터');
      
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
   * 챕터 생성 - 역할 분배 협업 워크플로우
   * 1단계(Gemini): 논리적 구조 → 2단계(Claude): 감정적 집필 → 3단계(Gemini): 일관성 검증
   */
  async generateChapter(options) {
    const {
      title,
      tropes,
      chapterNumber,
      previousContext,
      characterContext,
      plotOutline,
      emotionalIntensity = 'normal'
    } = options;

    console.log(`🤝 하이브리드 챕터 ${chapterNumber} 생성: 감성+이성 협업 모드`);

    try {
      // 캐시에서 정보 가져오기
      const novelKey = title.replace(/\s+/g, '-').toLowerCase();
      const worldSettings = this.cache.worldSettings.get(novelKey);
      const plotStructure = this.cache.plotStructures.get(novelKey);

      // 🧠 1단계: Gemini가 논리적 챕터 구조 설계
      let chapterOutline = plotOutline;
      let logicalFramework = null;
      
      if (this.geminiGenerator && this.config.geminiForPlotStructure) {
        console.log('🌍 1단계: Gemini로 논리적 챕터 구조 설계...');
        
        try {
          // 논리적 구조와 설정 일관성 확인
          logicalFramework = await this.generateLogicalChapterFramework(
            chapterNumber,
            plotStructure,
            previousContext,
            worldSettings
          );
          
          chapterOutline = logicalFramework.outline;
          console.log('✅ Gemini 구조 설계 완료');
        } catch (error) {
          console.warn('⚠️ Gemini 구조 설계 실패, 기본 구조 사용:', error.message);
        }
      }

      // 💝 2단계: Claude가 감정적 콘텐츠 집필 (핵심 단계)
      console.log('💖 2단계: Claude로 감정적 스토리 집필...');
      
      const isEmotionalChapter = this.isEmotionallyIntenseChapter(chapterNumber) || emotionalIntensity === 'high';
      
      let chapterContent;
      try {
        // Claude 전용 감성적 컨텍스트 생성
        const emotionalContext = this.buildEmotionalContext(
          chapterOutline,
          characterContext,
          logicalFramework,
          isEmotionalChapter
        );
        
        chapterContent = await this.claudeGenerator.generateChapter({
          ...options,
          plotOutline: emotionalContext,
          worldSettings: worldSettings || '',
          focusOnEmotion: isEmotionalChapter,
          logicalConstraints: logicalFramework?.constraints || []
        });
        
        console.log(`✅ Claude 감성 집필 완료: ${chapterContent?.content?.length || 0}자`);
      } catch (claudeError) {
        console.error('❌ Claude 감성 집필 실패:', claudeError.message);
        
        // Claude는 감성 전문가로 필수 - 폴백 없이 실패 처리
        console.error('💔 Claude 감성 집필 필수 서비스 실패 - 하이브리드 모드 중단');
        throw new Error(`감성 전문가(Claude) 서비스 실패: ${claudeError.message}`);
      }

      // 🔍 3단계: Gemini가 논리적 일관성 검증 및 수정 제안
      if (this.geminiGenerator && this.config.geminiForLogicalConsistency) {
        console.log('🔧 3단계: Gemini로 논리적 일관성 검증...');
        
        try {
          const validation = await this.geminiGenerator.validateConsistency(
            previousContext,
            chapterContent.content
          );

          if (validation.issues && validation.issues.length > 0) {
            console.log(`⚠️ ${validation.issues.length}개 일관성 문제 발견, Claude로 수정...`);
            
            // Claude가 Gemini의 논리적 지적사항을 반영하여 감성적으로 수정
            chapterContent.content = await this.claudeGenerator.improveChapter(
              chapterContent.content,
              validation.issues
            );
            
            console.log('✅ 하이브리드 검증-수정 완료');
          }
        } catch (error) {
          console.warn('⚠️ Gemini 일관성 검증 실패:', error.message);
        }
      }

      // 4단계: 최종 품질 검사
      const qualityAssessment = await this.qualityEngine.assessQuality(
        chapterContent.content
      );

      if (qualityAssessment.score < this.qualityEngine.qualityStandards.qualityThreshold) {
        console.log('🔧 최종 품질 개선 중...');
        chapterContent.content = await this.qualityEngine.improveContent(
          chapterContent.content,
          qualityAssessment
        );
      }

      console.log('🎉 하이브리드 챕터 생성 완료: 논리적 구조 + 감성적 표현');
      return chapterContent;

    } catch (error) {
      // Claude 필수 서비스 실패 시 - 재시도 후 최종 실패 처리
      if (error.message.includes('감성 전문가(Claude)')) {
        console.error('💔 감성 전문가 서비스 완전 실패 - 하이브리드 불가능');
        throw error;
      }
      
      // 다른 오류는 Claude 단독 모드로 폴백
      console.error('❌ 하이브리드 생성 실패, Claude 단독 모드로 전환:', error);
      console.log('🎭 Claude 감성 중심 단독 생성 모드 활성화');
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
   * Gemini가 논리적 챕터 구조 설계 (이성 전담)
   */
  async generateLogicalChapterFramework(chapterNumber, plotStructure, previousContext, worldSettings) {
    const prompt = `당신은 논리적 스토리 구조 설계 전문가입니다.

플롯 구조: ${plotStructure || '기본 로맨스 판타지 구조'}
이전 맥락: ${previousContext}
세계관 설정: ${worldSettings || '기본 판타지 세계관'}
현재 챕터: ${chapterNumber}화

다음을 포함한 논리적 챕터 구조를 설계해주세요:

1. **논리적 사건 순서**
   - 이 챕터에서 일어나야 할 핵심 사건
   - 사건들의 인과관계와 타이밍
   - 플롯 진행에 미치는 영향

2. **설정 일관성 체크포인트**
   - 세계관 설정과 충돌하지 않을 요소들
   - 이전 챕터와의 연속성 확인사항
   - 캐릭터 능력과 제약사항

3. **구조적 제약조건**
   - 지켜야 할 논리적 규칙들
   - 피해야 할 모순점들
   - 복선 회수나 설치 타이밍

4. **다음 챕터 연결고리**
   - 논리적으로 이어져야 할 요소들
   - 남겨둘 의문점이나 긴장감

JSON 형식으로 구조화해주세요.`;

    try {
      const result = await this.geminiGenerator.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch {
        // JSON 파싱 실패시 텍스트로 반환
        return {
          outline: response,
          constraints: [],
          logicalChecks: response
        };
      }
    } catch (error) {
      console.warn('논리적 구조 설계 실패:', error);
      return null;
    }
  }

  /**
   * Claude 전용 감성적 컨텍스트 생성 (감성 전담)
   */
  buildEmotionalContext(chapterOutline, characterContext, logicalFramework, isEmotionalChapter) {
    let emotionalPrompt = `
감정적 스토리텔링에 집중하여 다음 챕터를 작성해주세요:

기본 구조: ${chapterOutline}
캐릭터 정보: ${characterContext}`;

    if (logicalFramework) {
      emotionalPrompt += `

논리적 제약사항 (지켜야 할 요소들):
${Array.isArray(logicalFramework.constraints) ? 
  logicalFramework.constraints.join('\n') : 
  logicalFramework.logicalChecks || '기본 논리적 일관성 유지'}`;
    }

    if (isEmotionalChapter) {
      emotionalPrompt += `

🌟 **감정 집중 모드 활성화**:
- 캐릭터들의 내적 갈등과 감정 변화를 세밀하게 묘사
- 대화에서 숨겨진 감정과 미묘한 뉘앙스 표현
- 로맨틱한 긴장감과 감정적 몰입도 극대화
- 독자의 심장을 뛰게 만드는 감동적인 순간들 창조`;
    }

    emotionalPrompt += `

감정적 표현에 집중하되, 논리적 제약사항은 자연스럽게 지켜주세요.`;

    return emotionalPrompt;
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
   * 콘텐츠 개선 - 역할 분배 협업 방식
   */
  async improveChapter(content, criteria) {
    console.log('🔧 하이브리드 개선 모드: 논리적 분석 + 감성적 개선');
    
    let enhancedCriteria = [...criteria];
    
    // 🧠 1단계: Gemini가 논리적 문제점 분석
    if (this.geminiGenerator && this.config.geminiForLogicalConsistency) {
      console.log('🌍 Gemini로 논리적 문제점 분석 중...');
      
      try {
        const logicalAnalysis = await this.geminiGenerator.validateConsistency('', content);
        
        if (logicalAnalysis.issues && logicalAnalysis.issues.length > 0) {
          console.log(`📋 Gemini가 ${logicalAnalysis.issues.length}개 논리적 문제점 발견`);
          enhancedCriteria = [...enhancedCriteria, ...logicalAnalysis.issues];
        }
      } catch (error) {
        console.warn('⚠️ Gemini 논리 분석 실패:', error.message);
      }
    }
    
    // 💝 2단계: Claude가 감성을 살린 개선
    console.log('💖 Claude로 감성적 개선 진행...');
    
    // 감성 중심 개선 지시사항 추가
    const emotionalGuidance = [
      '캐릭터의 감정 표현을 더욱 섬세하고 깊이 있게 다듬기',
      '대화의 자연스러움과 감정적 뉘앙스 강화',
      '독자의 감정 몰입도를 높이는 표현 개선',
      '로맨틱한 긴장감과 감동적인 순간들 부각'
    ];
    
    const combinedCriteria = [...enhancedCriteria, ...emotionalGuidance];
    
    try {
      const improvedContent = await this.claudeGenerator.improveChapter(content, combinedCriteria);
      console.log('✅ 하이브리드 개선 완료: 논리적 정확성 + 감성적 표현');
      return improvedContent;
    } catch (error) {
      console.error('❌ Claude 감성 개선 실패:', error.message);
      return content; // 원본 반환
    }
  }

  /**
   * 모드별 생성 전략
   */
  async generateChapterEconomical(options) {
    // 경제 모드: Claude 단독 (감성은 유지하되 논리 검증 생략)
    console.log('💰 경제 모드: Claude 감성 중심 단독 생성');
    return await this.claudeGenerator.generateChapter(options);
  }

  async generateChapterPremium(options) {
    // 프리미엄 모드: 완전한 하이브리드 (모든 검증 단계 포함)
    console.log('🌟 프리미엄 모드: 완전 하이브리드 협업');
    return await this.generateChapter({
      ...options,
      qualityCheckMode: 'comprehensive',
      multipleValidation: true
    });
  }

  async generateChapterEmotionFocused(options) {
    // 감정 집중 모드: Claude 중심 + Gemini 최소 지원
    console.log('💝 감정 집중 모드: Claude 감성 극대화');
    return await this.generateChapter({
      ...options,
      emotionalIntensity: 'high',
      claudeFocus: true
    });
  }
}

/**
 * 하이브리드 생성기 생성 헬퍼
 */
export function createHybridGenerator(config = {}) {
  console.log('🔧 하이브리드 생성기 초기화 중...');
  
  // API 키 상태 확인
  const claudeApiKey = process.env.ANTHROPIC_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  console.log(`🔑 Claude API 키: ${claudeApiKey ? '✅ 설정됨' : '❌ 없음'}`);
  console.log(`🔑 Gemini API 키: ${geminiApiKey ? '✅ 설정됨' : '❌ 없음'}`);
  
  const claudeGenerator = createStoryGenerator();
  const geminiGenerator = createGeminiGenerator();
  
  console.log(`🤖 Claude 생성기: ${claudeGenerator ? '✅ 사용 가능' : '❌ 초기화 실패'}`);
  console.log(`🧠 Gemini 생성기: ${geminiGenerator ? '✅ 사용 가능' : '❌ 초기화 실패'}`);
  
  if (!claudeGenerator && !geminiGenerator) {
    console.error('❌ Claude와 Gemini 모두 사용할 수 없습니다.');
    throw new Error('하이브리드 생성기 초기화 실패: 모든 AI 서비스 사용 불가');
  }
  
  if (!geminiGenerator) {
    console.warn('⚠️ Gemini를 사용할 수 없습니다. Claude 단독 모드로 실행됩니다.');
    console.warn('   GEMINI_API_KEY 환경변수를 확인해주세요.');
  }
  
  if (!claudeGenerator) {
    console.error('❌ Claude를 사용할 수 없습니다. Claude는 필수입니다.');
    console.error('   ANTHROPIC_API_KEY 환경변수를 확인해주세요.');
    throw new Error('하이브리드 생성기 초기화 실패: Claude 서비스 필수');
  }
  
  console.log('✅ 하이브리드 생성기 초기화 완료');
  return new HybridAIGenerator({
    claudeGenerator,
    geminiGenerator,
    ...config
  });
}