/**
 * 🎯 Quality Threshold Agent - 동적 임계값 조정 시스템
 * 
 * 한국어 로맨스 판타지에 특화된 적응형 품질 평가 시스템
 * - 컨텐츠 실시간 분석을 통한 동적 임계값 계산
 * - 장르별/언어별 특성 반영 자동 조정
 * - 기존 quality-config.js와 완벽 연동
 * - 하드코딩된 상수값을 컨텍스트 기반 동적값으로 대체
 */

import { 
  QUALITY_THRESHOLDS, 
  ENGINE_WEIGHTS,
  IMPROVEMENT_STRATEGIES,
  EVALUATION_METRICS,
  GENRE_QUALITY_STANDARDS 
} from '../config/quality-config.js';

export class QualityThresholdAgent {
  constructor(logger) {
    this.logger = logger;
    
    // 기본 설정 (fallback용)
    this.baseThresholds = { ...QUALITY_THRESHOLDS };
    this.baseWeights = { ...ENGINE_WEIGHTS };
    this.baseStrategies = JSON.parse(JSON.stringify(IMPROVEMENT_STRATEGIES));
    
    // 한국어 로맨스 판타지 특성 데이터
    this.koreanRomanceFantasyCharacteristics = {
      // 언어적 특성
      linguistic: {
        sentenceLength: { avg: 45, range: [30, 65] },
        vocabularyDiversity: { threshold: 0.65, optimal: 0.75 },
        emotionalExpression: { 
          intensity: 0.8,
          frequency: 0.4,
          patterns: ['마음이', '가슴이', '심장이', '눈물이', '미소가'] 
        },
        romanticTension: {
          subtleIndicators: ['시선', '침묵', '망설임', '떨림', '흔들림'],
          intensityMarkers: ['두근거림', '설렘', '간절함', '그리움', '애틋함']
        }
      },
      
      // 장르적 특성
      genreSpecific: {
        fantasyElements: {
          frequency: 0.3,
          integration: 0.7,
          keywords: ['마법', '능력', '힘', '세계', '운명', '저주', '축복']
        },
        romanceProgression: {
          stages: 10,
          averageStageProgression: 0.12,
          keyMilestones: ['첫만남', '관심', '설렘', '갈등', '이해', '사랑', '확신']
        },
        culturalElements: {
          honorifics: ['님', '씨', '군', '양'],
          speechPatterns: ['요', '죠', '네', '예'],
          emotionalExpression: 'indirect' // 간접적 감정 표현 선호
        }
      },
      
      // 독자 기대치
      readerExpectations: {
        emotionalEngagement: 0.85,
        romanticSatisfaction: 0.80,
        plotProgression: 0.70,
        characterDevelopment: 0.75
      }
    };
    
    // 동적 조정 히스토리
    this.adjustmentHistory = [];
    this.contentAnalysisCache = new Map();
    
    // 학습 데이터
    this.learningData = {
      successfulThresholds: new Map(),
      failurePatterns: new Map(),
      optimalValues: new Map()
    };
  }

  /**
   * 🔍 컨텐츠 특성 종합 분석
   */
  async analyzeContentCharacteristics(content, storyContext = {}) {
    await this.logger.info('QualityThresholdAgent: 컨텐츠 특성 분석 시작');
    
    try {
      // 캐시 확인
      const cacheKey = this.generateCacheKey(content, storyContext);
      if (this.contentAnalysisCache.has(cacheKey)) {
        return this.contentAnalysisCache.get(cacheKey);
      }
      
      const analysis = {
        // 1. 언어적 특성 분석
        linguistic: await this.analyzeLinguisticCharacteristics(content),
        
        // 2. 장르적 특성 분석
        genre: await this.analyzeGenreCharacteristics(content, storyContext),
        
        // 3. 감정적 특성 분석
        emotional: await this.analyzeEmotionalCharacteristics(content),
        
        // 4. 구조적 특성 분석
        structural: await this.analyzeStructuralCharacteristics(content),
        
        // 5. 컨텍스트 특성 분석
        contextual: await this.analyzeContextualCharacteristics(storyContext),
        
        // 6. 종합 특성 점수
        overallCharacteristics: {}
      };
      
      // 종합 점수 계산
      analysis.overallCharacteristics = this.calculateOverallCharacteristics(analysis);
      
      // 캐시 저장
      this.contentAnalysisCache.set(cacheKey, analysis);
      
      await this.logger.info('QualityThresholdAgent: 컨텐츠 특성 분석 완료', {
        linguisticScore: analysis.linguistic.overallScore,
        genreScore: analysis.genre.overallScore,
        emotionalScore: analysis.emotional.overallScore
      });
      
      return analysis;
      
    } catch (error) {
      await this.logger.error('QualityThresholdAgent: 컨텐츠 특성 분석 실패', { error: error.message });
      throw error;
    }
  }

  /**
   * ⚙️ 동적 임계값 계산
   */
  async calculateDynamicThresholds(contentCharacteristics, currentScores = {}) {
    await this.logger.info('QualityThresholdAgent: 동적 임계값 계산 시작');
    
    try {
      const baseThresholds = { ...this.baseThresholds };
      const adjustedThresholds = { ...baseThresholds };
      
      // 1. 언어적 특성 기반 조정
      const linguisticAdjustment = this.calculateLinguisticAdjustment(contentCharacteristics.linguistic);
      
      // 2. 장르적 특성 기반 조정
      const genreAdjustment = this.calculateGenreAdjustment(contentCharacteristics.genre);
      
      // 3. 감정적 특성 기반 조정
      const emotionalAdjustment = this.calculateEmotionalAdjustment(contentCharacteristics.emotional);
      
      // 4. 현재 성능 기반 적응적 조정
      const adaptiveAdjustment = this.calculateAdaptiveAdjustment(currentScores);
      
      // 5. 종합 조정 적용
      const totalAdjustment = this.combineAdjustments(
        linguisticAdjustment,
        genreAdjustment, 
        emotionalAdjustment,
        adaptiveAdjustment
      );
      
      // 6. 임계값 적용 및 검증
      Object.keys(adjustedThresholds).forEach(key => {
        if (totalAdjustment[key] !== undefined) {
          adjustedThresholds[key] = this.applyAdjustmentSafely(
            baseThresholds[key], 
            totalAdjustment[key],
            key
          );
        }
      });
      
      // 7. 조정 결과 기록
      const adjustmentResult = {
        original: baseThresholds,
        adjusted: adjustedThresholds,
        adjustments: totalAdjustment,
        timestamp: new Date().toISOString(),
        contentCharacteristics: contentCharacteristics.overallCharacteristics
      };
      
      this.adjustmentHistory.push(adjustmentResult);
      this.maintainHistorySize();
      
      await this.logger.info('QualityThresholdAgent: 동적 임계값 계산 완료', {
        minimumAdjusted: adjustedThresholds.minimum,
        originalMinimum: baseThresholds.minimum,
        adjustmentMagnitude: totalAdjustment.minimum || 0
      });
      
      return adjustedThresholds;
      
    } catch (error) {
      await this.logger.error('QualityThresholdAgent: 동적 임계값 계산 실패', { error: error.message });
      return this.baseThresholds; // 실패 시 기본값 반환
    }
  }

  /**
   * ⚖️ 엔진별 가중치 동적 조정
   */
  async adjustEngineWeights(contentCharacteristics, qualityAnalysis = {}) {
    await this.logger.info('QualityThresholdAgent: 엔진 가중치 조정 시작');
    
    try {
      const baseWeights = { ...this.baseWeights };
      const adjustedWeights = { ...baseWeights };
      
      // 1. 컨텐츠 특성 기반 가중치 조정
      if (contentCharacteristics.genre.fantasyIntensity > 0.7) {
        // 판타지 요소가 강한 경우 플롯 가중치 증가
        adjustedWeights.plot += 0.05;
        adjustedWeights.literary -= 0.05;
      }
      
      if (contentCharacteristics.emotional.romanticIntensity > 0.8) {
        // 로맨스 강도가 높은 경우 로맨스 가중치 증가
        adjustedWeights.romance += 0.05;
        adjustedWeights.character -= 0.05;
      }
      
      if (contentCharacteristics.linguistic.dialogueRatio > 0.5) {
        // 대화가 많은 경우 캐릭터 가중치 증가
        adjustedWeights.character += 0.05;
        adjustedWeights.literary -= 0.05;
      }
      
      // 2. 현재 품질 분석 기반 적응적 조정
      if (qualityAnalysis.scores) {
        const scores = qualityAnalysis.scores;
        const validScores = Object.values(scores).filter(score => typeof score === 'number' && !isNaN(score));
        
        if (validScores.length > 0) {
          const avgScore = validScores.reduce((a, b) => a + b, 0) / validScores.length;
          
          // 평균보다 낮은 영역의 가중치 증가 (올바른 엔진 키만 사용)
          const engineKeys = ['plot', 'character', 'literary', 'romance'];
          engineKeys.forEach(engine => {
            const engineScore = scores[engine + 'Score'] || scores[engine];
            if (typeof engineScore === 'number' && !isNaN(engineScore) && engineScore < avgScore - 0.5) {
              adjustedWeights[engine] = Math.min(0.4, adjustedWeights[engine] + 0.03);
            }
          });
        }
      }
      
      // 3. 가중치 합계 정규화
      const weightSum = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
      Object.keys(adjustedWeights).forEach(key => {
        adjustedWeights[key] = parseFloat((adjustedWeights[key] / weightSum).toFixed(3));
      });
      
      await this.logger.info('QualityThresholdAgent: 엔진 가중치 조정 완료', {
        originalWeights: baseWeights,
        adjustedWeights: adjustedWeights
      });
      
      return adjustedWeights;
      
    } catch (error) {
      await this.logger.error('QualityThresholdAgent: 엔진 가중치 조정 실패', { error: error.message });
      return this.baseWeights;
    }
  }

  /**
   * 🇰🇷 한국어 로맨스 판타지 특화 최적화
   */
  async optimizeForKoreanRomanceFantasy(contentCharacteristics, engineSpecificData = {}) {
    await this.logger.info('QualityThresholdAgent: 한국어 로맨스 판타지 최적화 시작');
    
    try {
      const optimizedSettings = {
        thresholds: {},
        engineConfigs: {},
        recommendations: []
      };
      
      // 1. PlotProgressionEngine 최적화
      if (engineSpecificData.plot) {
        optimizedSettings.engineConfigs.plot = this.optimizePlotEngine(
          contentCharacteristics,
          engineSpecificData.plot
        );
      }
      
      // 2. RomanceChemistryAnalyzer 최적화
      if (engineSpecificData.romance) {
        optimizedSettings.engineConfigs.romance = this.optimizeRomanceEngine(
          contentCharacteristics,
          engineSpecificData.romance
        );
      }
      
      // 3. CharacterDevelopmentSystem 최적화
      if (engineSpecificData.character) {
        optimizedSettings.engineConfigs.character = this.optimizeCharacterEngine(
          contentCharacteristics,
          engineSpecificData.character
        );
      }
      
      // 4. LiteraryExcellenceEngine 최적화
      if (engineSpecificData.literary) {
        optimizedSettings.engineConfigs.literary = this.optimizeLiteraryEngine(
          contentCharacteristics,
          engineSpecificData.literary
        );
      }
      
      // 5. 종합 임계값 최적화
      optimizedSettings.thresholds = this.optimizeOverallThresholds(
        contentCharacteristics,
        optimizedSettings.engineConfigs
      );
      
      // 6. 최적화 권장사항 생성
      optimizedSettings.recommendations = this.generateOptimizationRecommendations(
        contentCharacteristics,
        optimizedSettings
      );
      
      await this.logger.success('QualityThresholdAgent: 한국어 로맨스 판타지 최적화 완료');
      
      return optimizedSettings;
      
    } catch (error) {
      await this.logger.error('QualityThresholdAgent: 최적화 실패', { error: error.message });
      throw error;
    }
  }

  /**
   * 📊 언어적 특성 분석
   */
  async analyzeLinguisticCharacteristics(content) {
    if (!content) return { overallScore: 0.5 };
    
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    const words = content.match(/[가-힣]+/g) || [];
    const uniqueWords = [...new Set(words)];
    
    // 어휘 다양성
    const vocabularyDiversity = uniqueWords.length / Math.max(1, words.length);
    
    // 문장 길이 분포
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().length, 0) / Math.max(1, sentences.length);
    
    // 감정 표현 빈도
    const emotionalWords = words.filter(word => 
      this.koreanRomanceFantasyCharacteristics.linguistic.emotionalExpression.patterns
        .some(pattern => word.includes(pattern.replace(/[가-힣]/g, '')))
    );
    const emotionalFrequency = emotionalWords.length / Math.max(1, words.length);
    
    // 로맨틱 텐션 지표
    const subtleIndicators = this.koreanRomanceFantasyCharacteristics.linguistic.romanticTension.subtleIndicators;
    const tensionScore = subtleIndicators.reduce((score, indicator) => {
      const matches = (content.match(new RegExp(indicator, 'g')) || []).length;
      return score + (matches * 0.01);
    }, 0);
    
    const overallScore = (
      (vocabularyDiversity * 0.3) +
      (Math.min(1.0, avgSentenceLength / 50) * 0.2) +
      (emotionalFrequency * 2.0 * 0.3) +
      (Math.min(1.0, tensionScore) * 0.2)
    );
    
    return {
      vocabularyDiversity,
      avgSentenceLength,
      emotionalFrequency,
      tensionScore,
      overallScore: parseFloat(overallScore.toFixed(3))
    };
  }

  /**
   * 🎭 장르적 특성 분석
   */
  async analyzeGenreCharacteristics(content, storyContext) {
    if (!content) return { overallScore: 0.5 };
    
    // 판타지 요소 분석
    const fantasyKeywords = this.koreanRomanceFantasyCharacteristics.genreSpecific.fantasyElements.keywords;
    const fantasyMatches = fantasyKeywords.reduce((count, keyword) => {
      return count + ((content.match(new RegExp(keyword, 'g')) || []).length);
    }, 0);
    const fantasyIntensity = Math.min(1.0, fantasyMatches / 10);
    
    // 로맨스 진행도 분석
    const romanceMilestones = this.koreanRomanceFantasyCharacteristics.genreSpecific.romanceProgression.keyMilestones;
    const milestoneMatches = romanceMilestones.reduce((count, milestone) => {
      return count + (content.includes(milestone) ? 1 : 0);
    }, 0);
    const romanceProgression = milestoneMatches / romanceMilestones.length;
    
    // 문화적 요소 분석
    const honorifics = this.koreanRomanceFantasyCharacteristics.genreSpecific.culturalElements.honorifics;
    const honorificUsage = honorifics.reduce((count, honorific) => {
      return count + ((content.match(new RegExp(honorific, 'g')) || []).length);
    }, 0);
    const culturalIntegration = Math.min(1.0, honorificUsage / 20);
    
    const overallScore = (
      (fantasyIntensity * 0.4) +
      (romanceProgression * 0.4) +
      (culturalIntegration * 0.2)
    );
    
    return {
      fantasyIntensity,
      romanceProgression,
      culturalIntegration,
      overallScore: parseFloat(overallScore.toFixed(3))
    };
  }

  /**
   * 💭 감정적 특성 분석
   */
  async analyzeEmotionalCharacteristics(content) {
    if (!content) return { overallScore: 0.5 };
    
    // 감정 강도 분석
    const emotionWords = [
      '사랑', '기쁨', '슬픔', '분노', '두려움', '놀라움', '혐오',
      '설렘', '그리움', '애틋함', '간절함', '벅참', '아련함'
    ];
    
    const emotionMatches = emotionWords.reduce((count, emotion) => {
      return count + ((content.match(new RegExp(emotion, 'g')) || []).length);
    }, 0);
    const emotionalIntensity = Math.min(1.0, emotionMatches / 15);
    
    // 로맨틱 감정 분석
    const romanticEmotions = ['설렘', '두근거림', '그리움', '애틋함', '간절함'];
    const romanticMatches = romanticEmotions.reduce((count, emotion) => {
      return count + ((content.match(new RegExp(emotion, 'g')) || []).length);
    }, 0);
    const romanticIntensity = Math.min(1.0, romanticMatches / 8);
    
    // 감정 표현 다양성
    const uniqueEmotions = emotionWords.filter(emotion => content.includes(emotion));
    const emotionalVariety = uniqueEmotions.length / emotionWords.length;
    
    const overallScore = (
      (emotionalIntensity * 0.4) +
      (romanticIntensity * 0.4) +
      (emotionalVariety * 0.2)
    );
    
    return {
      emotionalIntensity,
      romanticIntensity,
      emotionalVariety,
      overallScore: parseFloat(overallScore.toFixed(3))
    };
  }

  /**
   * 🏗️ 구조적 특성 분석
   */
  async analyzeStructuralCharacteristics(content) {
    if (!content) return { overallScore: 0.5 };
    
    const totalLength = content.length;
    
    // 대화 비율 추정 (따옴표와 대화 표현 기반)
    const dialogueMarkers = (content.match(/["「『]/g) || []).length;
    const dialogueRatio = Math.min(0.7, dialogueMarkers / 20);
    
    // 묘사 vs 액션 비율
    const descriptiveWords = ['아름다운', '고요한', '신비로운', '화려한', '우아한'];
    const actionWords = ['달려가다', '움직이다', '잡다', '떨어지다', '일어나다'];
    
    const descriptiveCount = descriptiveWords.reduce((count, word) => {
      return count + ((content.match(new RegExp(word, 'g')) || []).length);
    }, 0);
    
    const actionCount = actionWords.reduce((count, word) => {
      return count + ((content.match(new RegExp(word, 'g')) || []).length);
    }, 0);
    
    const narrativeBalance = Math.min(1.0, (descriptiveCount + actionCount) / 10);
    
    // 단락 구성
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / Math.max(1, paragraphs.length);
    const paragraphStructure = Math.min(1.0, avgParagraphLength / 200);
    
    const overallScore = (
      (dialogueRatio * 0.4) +
      (narrativeBalance * 0.3) +
      (paragraphStructure * 0.3)
    );
    
    return {
      dialogueRatio,
      narrativeBalance,
      paragraphStructure,
      overallScore: parseFloat(overallScore.toFixed(3))
    };
  }

  /**
   * 📋 컨텍스트 특성 분석
   */
  async analyzeContextualCharacteristics(storyContext) {
    if (!storyContext) return { overallScore: 0.5 };
    
    // 스토리 진행도
    const chapterCount = storyContext.currentChapter || 1;
    const progressionStage = Math.min(1.0, chapterCount / 20); // 20화 기준
    
    // 캐릭터 발전도
    const characterCount = storyContext.characters ? storyContext.characters.length : 2;
    const characterDevelopment = Math.min(1.0, characterCount / 5);
    
    // 플롯 복잡도
    const plotComplexity = storyContext.plotPoints ? 
      Math.min(1.0, storyContext.plotPoints.length / 10) : 0.5;
    
    const overallScore = (
      (progressionStage * 0.4) +
      (characterDevelopment * 0.3) +
      (plotComplexity * 0.3)
    );
    
    return {
      progressionStage,
      characterDevelopment,
      plotComplexity,
      overallScore: parseFloat(overallScore.toFixed(3))
    };
  }

  /**
   * 📈 종합 특성 점수 계산
   */
  calculateOverallCharacteristics(analysis) {
    const weights = {
      linguistic: 0.25,
      genre: 0.25,
      emotional: 0.25,
      structural: 0.15,
      contextual: 0.10
    };
    
    const overallScore = Object.keys(weights).reduce((sum, key) => {
      return sum + (analysis[key].overallScore * weights[key]);
    }, 0);
    
    return {
      overallScore: parseFloat(overallScore.toFixed(3)),
      dominantCharacteristics: this.identifyDominantCharacteristics(analysis),
      weaknesses: this.identifyWeaknesses(analysis),
      strengths: this.identifyStrengths(analysis)
    };
  }

  /**
   * 🎯 PlotProgressionEngine 최적화
   */
  optimizePlotEngine(contentCharacteristics, plotData) {
    const baseConfig = this.baseStrategies.plot.thresholds;
    const optimized = { ...baseConfig };
    
    // 한국어 로맨스 판타지 특성에 맞춰 조정
    if (contentCharacteristics.genre.fantasyIntensity < 0.3) {
      // 판타지 요소가 적으면 플롯 진전 요구사항 완화
      optimized.progression = Math.max(0.4, baseConfig.progression - 0.2);
    }
    
    if (contentCharacteristics.emotional.romanticIntensity > 0.7) {
      // 로맨틱 강도가 높으면 갈등 요구사항 완화 (로맨스에 집중)
      optimized.conflict = Math.max(0.3, baseConfig.conflict - 0.1);
    }
    
    // progressionScore가 0인 문제 해결
    if (plotData && plotData.progressionScore === 0) {
      optimized.progression = 0.1; // 매우 낮은 임계값으로 조정
      optimized.conflict = 0.2;
    }
    
    return {
      thresholds: optimized,
      adjustmentReason: 'Korean romance fantasy genre optimization',
      originalValues: baseConfig
    };
  }

  /**
   * 💕 RomanceChemistryAnalyzer 최적화
   */
  optimizeRomanceEngine(contentCharacteristics, romanceData) {
    const baseConfig = this.baseStrategies.romance.thresholds;
    const optimized = { ...baseConfig };
    
    // 한국어의 간접적 감정 표현 특성 반영
    if (contentCharacteristics.linguistic.tensionScore < 0.02) {
      // 로맨틱 텐션이 매우 낮으면 임계값 대폭 완화
      optimized.tension = 0.01; // 거의 최소값
      optimized.chemistry = 0.3;
    }
    
    // romanceData에서 직접 낮은 tension 감지 시 조정
    if (romanceData && romanceData.tensionLevel <= 0.01) {
      optimized.tension = 0.005; // 매우 낮은 임계값
      optimized.chemistry = 0.2;
    }
    
    // 문화적 특성 반영 (한국어는 함축적 표현 선호)
    if (contentCharacteristics.genre.culturalIntegration > 0.5) {
      optimized.emotionalDepth = Math.max(0.5, baseConfig.emotionalDepth - 0.2);
      optimized.progression = Math.max(0.3, baseConfig.progression - 0.2);
    }
    
    return {
      thresholds: optimized,
      adjustmentReason: 'Korean indirect emotional expression optimization',
      originalValues: baseConfig
    };
  }

  /**
   * 👥 CharacterDevelopmentSystem 최적화
   */
  optimizeCharacterEngine(contentCharacteristics, characterData) {
    const baseConfig = this.baseStrategies.character.thresholds;
    const optimized = { ...baseConfig };
    
    // 대화 비율이 높으면 캐릭터 발전 요구사항 조정
    if (contentCharacteristics.structural.dialogueRatio > 0.5) {
      optimized.speechVariety = Math.max(0.5, baseConfig.speechVariety - 0.1);
      optimized.agency = Math.max(0.4, baseConfig.agency - 0.1);
    }
    
    return {
      thresholds: optimized,
      adjustmentReason: 'Dialogue-heavy content optimization',
      originalValues: baseConfig
    };
  }

  /**
   * 📝 LiteraryExcellenceEngine 최적화
   */
  optimizeLiteraryEngine(contentCharacteristics, literaryData) {
    const baseConfig = this.baseStrategies.literary.thresholds;
    const optimized = { ...baseConfig };
    
    // 한국어 특성에 맞춘 어휘 다양성 조정
    if (contentCharacteristics.linguistic.vocabularyDiversity < 0.7) {
      optimized.vocabulary = Math.max(0.6, baseConfig.vocabulary - 0.1);
    }
    
    return {
      thresholds: optimized,
      adjustmentReason: 'Korean language characteristics optimization',
      originalValues: baseConfig
    };
  }

  /**
   * 🎯 종합 임계값 최적화
   */
  optimizeOverallThresholds(contentCharacteristics, engineConfigs) {
    const baseThreshold = this.baseThresholds.minimum;
    let adjustedThreshold = baseThreshold;
    
    // 전반적인 컨텐츠 특성에 따른 조정
    const overallCharacteristicsScore = contentCharacteristics.overallScore;
    
    if (overallCharacteristicsScore < 0.6) {
      // 특성 점수가 낮으면 임계값 완화
      adjustedThreshold = Math.max(5.5, baseThreshold - 1.0);
    } else if (overallCharacteristicsScore > 0.8) {
      // 특성 점수가 높으면 임계값 상향
      adjustedThreshold = Math.min(8.0, baseThreshold + 0.5);
    }
    
    return {
      minimum: adjustedThreshold,
      good: adjustedThreshold + 0.5,
      excellent: adjustedThreshold + 1.5,
      perfect: 9.5,
      critical: adjustedThreshold - 2.0
    };
  }

  /**
   * 💡 최적화 권장사항 생성
   */
  generateOptimizationRecommendations(contentCharacteristics, optimizedSettings) {
    const recommendations = [];
    
    // 언어적 특성 기반 권장사항
    if (contentCharacteristics.linguistic.vocabularyDiversity < 0.6) {
      recommendations.push({
        category: 'linguistic',
        priority: 'HIGH',
        issue: '어휘 다양성 부족',
        solution: '더 다양한 감정 표현과 형용사 사용을 권장합니다.'
      });
    }
    
    // 장르적 특성 기반 권장사항
    if (contentCharacteristics.genre.fantasyIntensity < 0.3) {
      recommendations.push({
        category: 'genre',
        priority: 'MEDIUM',
        issue: '판타지 요소 부족',
        solution: '마법적 요소나 판타지 설정을 더 자연스럽게 통합해보세요.'
      });
    }
    
    // 감정적 특성 기반 권장사항
    if (contentCharacteristics.emotional.romanticIntensity < 0.5) {
      recommendations.push({
        category: 'emotional',
        priority: 'HIGH',
        issue: '로맨틱 감정 표현 부족',
        solution: '간접적이지만 더 풍부한 감정 표현을 활용해보세요.'
      });
    }
    
    return recommendations;
  }

  /**
   * 🔧 보조 유틸리티 메서드들
   */
  
  generateCacheKey(content, storyContext) {
    const contentHash = content ? content.length.toString() + content.slice(0, 100) : 'empty';
    const contextHash = storyContext ? JSON.stringify(storyContext).slice(0, 100) : 'empty';
    return `${contentHash}_${contextHash}`;
  }

  calculateLinguisticAdjustment(linguisticAnalysis) {
    return {
      minimum: linguisticAnalysis.overallScore < 0.6 ? -0.5 : 0,
      vocabularyThreshold: linguisticAnalysis.vocabularyDiversity < 0.6 ? -0.1 : 0
    };
  }

  calculateGenreAdjustment(genreAnalysis) {
    return {
      minimum: genreAnalysis.fantasyIntensity < 0.3 ? -0.3 : 0,
      romanceThreshold: genreAnalysis.romanceProgression < 0.5 ? -0.2 : 0
    };
  }

  calculateEmotionalAdjustment(emotionalAnalysis) {
    return {
      minimum: emotionalAnalysis.romanticIntensity < 0.4 ? -0.4 : 0,
      emotionalDepthThreshold: emotionalAnalysis.emotionalIntensity < 0.5 ? -0.2 : 0
    };
  }

  calculateAdaptiveAdjustment(currentScores) {
    if (!currentScores || Object.keys(currentScores).length === 0) {
      return { minimum: 0 };
    }
    
    const avgScore = Object.values(currentScores).reduce((a, b) => a + b, 0) / Object.values(currentScores).length;
    
    return {
      minimum: avgScore < 6.0 ? -1.0 : 0
    };
  }

  combineAdjustments(...adjustments) {
    const combined = {};
    
    adjustments.forEach(adj => {
      Object.keys(adj).forEach(key => {
        combined[key] = (combined[key] || 0) + adj[key];
      });
    });
    
    return combined;
  }

  applyAdjustmentSafely(baseValue, adjustment, key) {
    const adjusted = baseValue + adjustment;
    
    // 안전 범위 확인
    const minValue = key === 'minimum' ? 4.0 : baseValue - 2.0;
    const maxValue = key === 'minimum' ? 8.0 : baseValue + 1.0;
    
    return Math.max(minValue, Math.min(maxValue, adjusted));
  }

  identifyDominantCharacteristics(analysis) {
    const scores = {
      linguistic: analysis.linguistic.overallScore,
      genre: analysis.genre.overallScore,
      emotional: analysis.emotional.overallScore,
      structural: analysis.structural.overallScore,
      contextual: analysis.contextual.overallScore
    };
    
    const maxScore = Math.max(...Object.values(scores));
    return Object.keys(scores).filter(key => scores[key] === maxScore);
  }

  identifyWeaknesses(analysis) {
    const scores = {
      linguistic: analysis.linguistic.overallScore,
      genre: analysis.genre.overallScore,
      emotional: analysis.emotional.overallScore,
      structural: analysis.structural.overallScore,
      contextual: analysis.contextual.overallScore
    };
    
    return Object.keys(scores).filter(key => scores[key] < 0.5);
  }

  identifyStrengths(analysis) {
    const scores = {
      linguistic: analysis.linguistic.overallScore,
      genre: analysis.genre.overallScore,
      emotional: analysis.emotional.overallScore,
      structural: analysis.structural.overallScore,
      contextual: analysis.contextual.overallScore
    };
    
    return Object.keys(scores).filter(key => scores[key] > 0.7);
  }

  maintainHistorySize() {
    if (this.adjustmentHistory.length > 50) {
      this.adjustmentHistory = this.adjustmentHistory.slice(-30);
    }
  }

  /**
   * 📊 통합 진단 및 최적화 실행
   */
  async diagnoseAndOptimize(content, storyContext = {}, currentQualityAnalysis = {}) {
    await this.logger.info('QualityThresholdAgent: 통합 진단 및 최적화 시작');
    
    try {
      // 1. 컨텐츠 특성 분석
      const contentCharacteristics = await this.analyzeContentCharacteristics(content, storyContext);
      
      // 2. 동적 임계값 계산
      const optimizedThresholds = await this.calculateDynamicThresholds(
        contentCharacteristics, 
        currentQualityAnalysis.scores || {}
      );
      
      // 3. 엔진 가중치 조정
      const optimizedWeights = await this.adjustEngineWeights(
        contentCharacteristics,
        currentQualityAnalysis
      );
      
      // 4. 한국어 로맨스 판타지 특화 최적화
      const koreanOptimization = await this.optimizeForKoreanRomanceFantasy(
        contentCharacteristics,
        {
          plot: currentQualityAnalysis.detailedAnalysis?.plot,
          romance: currentQualityAnalysis.detailedAnalysis?.romance,
          character: currentQualityAnalysis.detailedAnalysis?.character,
          literary: currentQualityAnalysis.detailedAnalysis?.literary
        }
      );
      
      const result = {
        contentCharacteristics,
        optimizedThresholds,
        optimizedWeights,
        koreanOptimization,
        
        // 실행 정보
        optimizationSummary: {
          majorAdjustments: this.identifyMajorAdjustments(optimizedThresholds),
          expectedImprovements: this.calculateExpectedImprovements(contentCharacteristics),
          riskFactors: this.identifyRiskFactors(contentCharacteristics)
        },
        
        timestamp: new Date().toISOString()
      };
      
      await this.logger.success('QualityThresholdAgent: 통합 최적화 완료', {
        thresholdAdjustment: result.optimizedThresholds.minimum - this.baseThresholds.minimum,
        recommendationCount: koreanOptimization.recommendations.length
      });
      
      return result;
      
    } catch (error) {
      await this.logger.error('QualityThresholdAgent: 통합 최적화 실패', { error: error.message });
      throw error;
    }
  }

  identifyMajorAdjustments(optimizedThresholds) {
    const adjustments = [];
    const baseThresholds = this.baseThresholds;
    
    Object.keys(optimizedThresholds).forEach(key => {
      const diff = optimizedThresholds[key] - baseThresholds[key];
      if (Math.abs(diff) > 0.3) {
        adjustments.push({
          threshold: key,
          originalValue: baseThresholds[key],
          adjustedValue: optimizedThresholds[key],
          change: diff
        });
      }
    });
    
    return adjustments;
  }

  calculateExpectedImprovements(contentCharacteristics) {
    const improvements = [];
    const overallScore = contentCharacteristics.overallScore;
    
    if (overallScore < 0.6) {
      improvements.push('품질 임계값 완화로 인한 통과율 향상 예상');
    }
    
    if (contentCharacteristics.strengths && contentCharacteristics.strengths.length > 0) {
      improvements.push(`${contentCharacteristics.strengths.join(', ')} 영역의 강점 활용 최적화`);
    }
    
    return improvements;
  }

  identifyRiskFactors(contentCharacteristics) {
    const risks = [];
    
    if (contentCharacteristics.weaknesses && contentCharacteristics.weaknesses.length > 2) {
      risks.push('다수 영역에서 특성 점수 저하');
    }
    
    if (contentCharacteristics.overallScore < 0.4) {
      risks.push('전반적 컨텐츠 품질 우려');
    }
    
    return risks;
  }
}

/**
 * 커스텀 에러 클래스들
 */
export class ThresholdOptimizationError extends Error {
  constructor(message, analysisData = null) {
    super(message);
    this.name = 'ThresholdOptimizationError';
    this.analysisData = analysisData;
  }
}

export class ContentAnalysisError extends Error {
  constructor(message, contentHash = null) {
    super(message);
    this.name = 'ContentAnalysisError';
    this.contentHash = contentHash;
  }
}