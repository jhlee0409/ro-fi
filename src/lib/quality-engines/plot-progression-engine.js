/**
 * 🎯 Plot Progression Engine - 플롯 정체 해결 시스템
 * 
 * GENESIS AI 설계 기반 플롯 진전 강제 및 검증 시스템
 * - 플롯 진전도 실시간 측정 (최소 60% 요구)
 * - 갈등 에스컬레이션 확인 (최소 40% 요구)  
 * - 반복 패턴 자동 탐지 및 방지
 * - 정체 감지 시 자동 진전 이벤트 삽입
 */

export class PlotProgressionEngine {
  constructor(logger) {
    this.logger = logger;
    
    // 플롯 진전 패턴 데이터베이스
    this.progressionPatterns = {
      // 갈등 에스컬레이션 패턴
      conflictEscalation: [
        '오해가 깊어지다', '진실이 밝혀지다', '위기가 닥치다',
        '선택의 기로에 서다', '결정적 순간이 오다', '운명이 바뀌다'
      ],
      
      // 관계 발전 패턴
      relationshipProgression: [
        '첫 만남', '관심의 시작', '갈등과 이해', '신뢰 구축', 
        '감정의 깊어짐', '위기와 시련', '진정한 사랑의 확인'
      ],
      
      // 플롯 전개 키워드
      plotMovers: [
        '새로운 발견', '예상치 못한 만남', '숨겨진 진실', '위험한 상황',
        '중요한 결정', '운명적 순간', '반전', '갈등의 심화', '해결의 실마리'
      ],
      
      // 정체 신호 키워드
      stagnationSignals: [
        '일상', '평범한', '그냥', '여전히', '다시', '똑같은',
        '변함없이', '계속', '그대로', '반복'
      ]
    };
    
    // 품질 임계값
    this.thresholds = {
      minPlotProgression: 0.60,     // 최소 60% 플롯 진전
      minConflictEscalation: 0.40,  // 최소 40% 갈등 진전  
      maxRepetitionRate: 0.15,      // 최대 15% 반복 허용
      minNewElements: 2,            // 최소 2개 새로운 요소
      stagnationLimit: 3            // 연속 3번 정체 시 강제 진전
    };
    
    // 상태 추적
    this.stagnationCount = 0;
    this.lastPlotElements = [];
  }

  /**
   * 📊 AI 기반 플롯 진전도 종합 분석
   */
  async validatePlotProgression(chapter, _storyContext) {
    await this.logger.info('PlotProgressionEngine: AI 기반 플롯 진전도 검증 시작');
    
    try {
      // AI 직접 분석으로 전환
      const aiAnalysis = await this.aiDirectPlotAnalysis(chapter.content, _storyContext);
      
      // 종합 분석 결과
      const analysis = {
        progressionScore: aiAnalysis.progressionScore,
        conflictScore: aiAnalysis.conflictScore,
        repetitionRate: aiAnalysis.repetitionRate,
        newElementsCount: aiAnalysis.newElementsCount,
        
        // 품질 지표
        meetsProgressionThreshold: aiAnalysis.progressionScore >= 0.6,
        meetsConflictThreshold: aiAnalysis.conflictScore >= 0.4,
        acceptableRepetition: aiAnalysis.repetitionRate <= 0.15,
        sufficientNewElements: aiAnalysis.newElementsCount >= 2,
        
        // 종합 품질 점수 (0-10)
        overallQualityScore: aiAnalysis.overallQualityScore
      };
      
      await this.logger.info('PlotProgressionEngine: AI 분석 완료', analysis);
      return analysis;
      
    } catch (_error) {
      await this.logger.error('PlotProgressionEngine: AI 분석 실패', { error: _error.message });
      throw _error;
    }
  }

  /**
   * 🤖 AI 직접 플롯 분석 (하드코딩 패턴 제거)
   */
  async aiDirectPlotAnalysis(content, _storyContext = {}) {
    await this.logger.info('PlotProgressionEngine: Gemini AI 직접 플롯 분석 시작');
    
    try {
      // Gemini API import
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const plotAnalysisPrompt = `
한국어 로맨스 판타지 소설 컨텐츠를 플롯 진전 관점에서 분석해주세요.

**분석할 컨텐츠:**
\`\`\`
${content}
\`\`\`

**분석 요청사항:**
1. 플롯 진전도 (0.0-1.0): 이야기가 얼마나 새롭게 발전하고 있는가?
2. 갈등 강도 (0.0-1.0): 갈등이 얼마나 흥미롭고 극적인가?
3. 반복률 (0.0-1.0): 이전과 비슷한 패턴의 반복 정도 (낮을수록 좋음)
4. 새로운 요소 개수 (0-10): 새로운 사건, 인물, 설정 등의 개수

**한국어 로맨스 판타지 특성을 고려하여:**
- 감정적 발전과 관계 진전도 플롯 진전으로 평가
- 내적 갈등과 심리적 변화도 중요한 플롯 요소로 인정
- 로맨틱한 긴장감과 판타지적 요소의 조화 고려
- 한국 문화적 맥락의 스토리텔링 방식 이해

응답은 반드시 다음 JSON 형식으로만 출력해주세요:
{
  "progressionScore": 0.7,
  "conflictScore": 0.8,
  "repetitionRate": 0.1,
  "newElementsCount": 3,
  "overallQualityScore": 7.5,
  "reasoning": "새로운 갈등이 도입되어 플롯이 효과적으로 진전됨..."
}`;

      const result = await model.generateContent(plotAnalysisPrompt);
      const response = result.response;
      const text = response.text();
      
      await this.logger.info('Gemini 플롯 분석 응답', { text: text.substring(0, 200) });
      
      // JSON 추출 및 파싱 (제어 문자 처리 개선)
      const cleanedText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // 제어 문자 제거
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gemini 응답에서 JSON을 찾을 수 없습니다');
      }
      
      const analysisResult = JSON.parse(jsonMatch[0]);
      
      // 기본값 보장
      const safeResult = {
        progressionScore: Math.max(0, Math.min(1, analysisResult.progressionScore || 0.5)),
        conflictScore: Math.max(0, Math.min(1, analysisResult.conflictScore || 0.5)),
        repetitionRate: Math.max(0, Math.min(1, analysisResult.repetitionRate || 0.2)),
        newElementsCount: Math.max(0, analysisResult.newElementsCount || 2),
        overallQualityScore: Math.max(0, Math.min(10, analysisResult.overallQualityScore || 6.0)),
        reasoning: analysisResult.reasoning || 'AI 플롯 분석 완료'
      };
      
      await this.logger.success('Gemini AI 플롯 분석 완료', safeResult);
      return safeResult;
      
    } catch (_error) {
      await this.logger.error('AI 플롯 분석 실패, 폴백 시스템 사용', { error: _error.message });
      
      // 폴백: 기본 분석
      return this.fallbackPlotAnalysis(content);
    }
  }

  /**
   * 🔄 플롯 분석 폴백 시스템 (AI 실패시)
   */
  fallbackPlotAnalysis(content) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim());
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return {
      progressionScore: Math.min(1.0, paragraphs.length * 0.15),
      conflictScore: Math.min(1.0, sentences.length * 0.05),
      repetitionRate: 0.1,
      newElementsCount: Math.max(1, Math.floor(paragraphs.length / 3)),
      overallQualityScore: 7.0,
      reasoning: '폴백 플롯 분석 적용'
    };
  }

  /**
   * 🎯 플롯 진전도 계산 (0.0-1.0)
   */
  calculateProgressionScore(content) {
    if (!content || typeof content !== 'string') {
      return 0.0;
    }
    
    let progressionPoints = 0;
    const totalSentences = content.split(/[.!?]/).length;
    
    // 진전 키워드 점수 계산
    for (const pattern of this.progressionPatterns.plotMovers) {
      const occurrences = (content.match(new RegExp(pattern, 'g')) || []).length;
      progressionPoints += occurrences * 0.1;
    }
    
    // 갈등 진전 점수
    for (const pattern of this.progressionPatterns.conflictEscalation) {
      const occurrences = (content.match(new RegExp(pattern, 'g')) || []).length;
      progressionPoints += occurrences * 0.15;
    }
    
    // 관계 발전 점수
    for (const pattern of this.progressionPatterns.relationshipProgression) {
      const occurrences = (content.match(new RegExp(pattern, 'g')) || []).length;
      progressionPoints += occurrences * 0.12;
    }
    
    // 정체 신호 페널티
    for (const signal of this.progressionPatterns.stagnationSignals) {
      const occurrences = (content.match(new RegExp(signal, 'g')) || []).length;
      progressionPoints -= occurrences * 0.05;
    }
    
    // 정규화 (0.0-1.0)
    const normalizedScore = Math.max(0, Math.min(1, progressionPoints / Math.max(1, totalSentences * 0.1)));
    
    return parseFloat(normalizedScore.toFixed(3));
  }

  /**
   * ⚔️ 갈등 에스컬레이션 측정
   */
  measureConflictEscalation(content, _storyContext) {
    if (!content) return 0.0;
    
    // 갈등 강화 지표
    const conflictIndicators = [
      '오해', '갈등', '대립', '분노', '좌절', '절망',
      '위기', '위험', '긴급', '압박', '선택', '결정'
    ];
    
    // 갈등 해결 지표  
    const resolutionIndicators = [
      '해결', '이해', '화해', '용서', '깨달음', '진실'
    ];
    
    let conflictScore = 0;
    let resolutionScore = 0;
    
    // 갈등 지표 계산
    for (const indicator of conflictIndicators) {
      const matches = (content.match(new RegExp(indicator, 'g')) || []).length;
      conflictScore += matches;
    }
    
    // 해결 지표 계산
    for (const indicator of resolutionIndicators) {
      const matches = (content.match(new RegExp(indicator, 'g')) || []).length;
      resolutionScore += matches;
    }
    
    // 에스컬레이션 비율 계산 (갈등 증가가 해결보다 우세해야 함)
    const totalConflictElements = conflictScore + resolutionScore;
    if (totalConflictElements === 0) return 0.0;
    
    // 갈등이 해결보다 2:1 이상 우세할 때 높은 점수
    const escalationRatio = Math.max(0, (conflictScore - resolutionScore * 0.5) / totalConflictElements);
    
    return parseFloat(Math.min(1.0, escalationRatio).toFixed(3));
  }

  /**
   * 🔄 반복 패턴 탐지
   */
  detectRepetitionPatterns(content, _storyContext) {
    if (!content || !_storyContext || !_storyContext.previousChapters) {
      return 0.0;
    }
    
    // 현재 챕터의 핵심 키워드 추출
    const currentKeywords = this.extractKeywords(content);
    
    // 이전 챕터들과의 중복도 계산
    let totalRepetitions = 0;
    let totalComparisons = 0;
    
    for (const prevChapter of _storyContext.previousChapters.slice(-3)) { // 최근 3화와 비교
      const prevKeywords = this.extractKeywords(prevChapter.content || '');
      
      // 키워드 중복 계산
      const commonKeywords = currentKeywords.filter(kw => prevKeywords.includes(kw));
      const repetitionRate = commonKeywords.length / Math.max(1, currentKeywords.length);
      
      totalRepetitions += repetitionRate;
      totalComparisons++;
    }
    
    const averageRepetition = totalComparisons > 0 ? totalRepetitions / totalComparisons : 0.0;
    
    return parseFloat(averageRepetition.toFixed(3));
  }

  /**
   * 🆕 새로운 요소 개수 계산
   */
  countNewElements(content, _storyContext) {
    if (!content) return 0;
    
    const newElementPatterns = [
      '새로운', '처음', '첫', '갑자기', '놀랍게도', '예상치 못한',
      '신비로운', '미지의', '알 수 없는', '의외의', '뜻밖의'
    ];
    
    let newElementsCount = 0;
    
    for (const pattern of newElementPatterns) {
      const matches = (content.match(new RegExp(pattern, 'g')) || []).length;
      newElementsCount += matches;
    }
    
    // 새로운 캐릭터나 장소 언급 감지 (대문자로 시작하는 고유명사)
    const properNouns = content.match(/[A-Z가-힣][가-힣]{1,}/g) || [];
    const uniqueProperNouns = [...new Set(properNouns)];
    
    // 기존 스토리 컨텍스트에 없는 고유명사 확인
    if (_storyContext && _storyContext.knownEntities) {
      const newEntities = uniqueProperNouns.filter(noun => 
        !_storyContext.knownEntities.includes(noun)
      );
      newElementsCount += newEntities.length;
    }
    
    return newElementsCount;
  }

  /**
   * 🎯 강제 플롯 진전 시스템
   */
  async enforceProgression(content, _storyContext) {
    await this.logger.info('PlotProgressionEngine: 강제 진전 시작');
    
    try {
      // 현재 진전도 확인
      const analysis = await this.validatePlotProgression({ content }, _storyContext);
      
      if (analysis.overallQualityScore >= 7.0) {
        await this.logger.info('PlotProgressionEngine: 진전도 충족, 강제 진전 불필요');
        return content;
      }
      
      // 정체 카운트 증가
      this.stagnationCount++;
      
      let enhancedContent = content;
      
      // 1. 갈등 강화 요소 자동 추가
      if (!analysis.meetsConflictThreshold) {
        enhancedContent = this.injectConflictElements(enhancedContent);
      }
      
      // 2. 새로운 전개 요소 강제 도입
      if (!analysis.sufficientNewElements) {
        enhancedContent = this.injectNewElements(enhancedContent);
      }
      
      // 3. 반복 패턴 제거
      if (!analysis.acceptableRepetition) {
        enhancedContent = this.removeRepetitiveElements(enhancedContent);
      }
      
      // 4. 연속 정체 시 극적 이벤트 삽입
      if (this.stagnationCount >= this.thresholds.stagnationLimit) {
        enhancedContent = this.injectDramaticEvent(enhancedContent);
        this.stagnationCount = 0; // 카운트 리셋
      }
      
      await this.logger.success('PlotProgressionEngine: 강제 진전 완료');
      return enhancedContent;
      
    } catch (_error) {
      await this.logger.error('PlotProgressionEngine: 강제 진전 실패', { error: _error.message });
      return content; // 실패 시 원본 반환
    }
  }

  /**
   * ⚔️ 갈등 요소 자동 삽입
   */
  injectConflictElements(content) {
    const conflictInserts = [
      '\n\n그러나 예상치 못한 문제가 발생했다.',
      '\n\n갑자기 상황이 복잡하게 얽히기 시작했다.',
      '\n\n이때 새로운 갈등이 수면 위로 떠올랐다.',
      '\n\n운명은 그들에게 또 다른 시련을 준비하고 있었다.',
      '\n\n예기치 못한 위기가 그들을 기다리고 있었다.'
    ];
    
    const randomInsert = conflictInserts[Math.floor(Math.random() * conflictInserts.length)];
    
    // 본문 중간 지점에 삽입
    const midPoint = Math.floor(content.length * 0.6);
    const insertPoint = content.lastIndexOf('.', midPoint);
    
    if (insertPoint > 0) {
      return content.slice(0, insertPoint + 1) + randomInsert + content.slice(insertPoint + 1);
    }
    
    return content + randomInsert;
  }

  /**
   * 🆕 새로운 요소 자동 추가
   */
  injectNewElements(content) {
    const newElementInserts = [
      '\n\n그때 처음 보는 인물이 나타났다.',
      '\n\n갑자기 새로운 사실이 밝혀졌다.',
      '\n\n예상치 못한 장소에서 중요한 단서를 발견했다.',
      '\n\n신비로운 현상이 일어나기 시작했다.',
      '\n\n지금까지 알지 못했던 진실의 일부가 드러났다.'
    ];
    
    const randomInsert = newElementInserts[Math.floor(Math.random() * newElementInserts.length)];
    
    // 본문 후반부에 삽입하여 다음 화 연결점 생성
    const insertPoint = Math.floor(content.length * 0.8);
    const lastParagraph = content.lastIndexOf('\n\n', insertPoint);
    
    if (lastParagraph > 0) {
      return content.slice(0, lastParagraph) + randomInsert + content.slice(lastParagraph);
    }
    
    return content + randomInsert;
  }

  /**
   * 🔄 반복 요소 제거
   */
  removeRepetitiveElements(content) {
    // 반복되는 표현 패턴 제거
    const repetitivePatterns = [
      /(.{10,})\1{2,}/g,  // 동일 구문 3회 이상 반복
      /(그런데|하지만|그러나)\s+\1/g,  // 연결어 중복
      /([가-힣]{2,})\s+\1/g  // 단어 중복
    ];
    
    let cleanContent = content;
    
    for (const pattern of repetitivePatterns) {
      cleanContent = cleanContent.replace(pattern, '$1');
    }
    
    return cleanContent;
  }

  /**
   * 💥 극적 이벤트 강제 삽입
   */
  injectDramaticEvent(content) {
    const dramaticEvents = [
      '\n\n바로 그 순간, 모든 것을 바꿀 사건이 일어났다.',
      '\n\n예상치 못한 반전이 그들의 운명을 완전히 뒤바꾸었다.',
      '\n\n갑작스러운 위기가 그들의 관계를 시험에 들게 했다.',
      '\n\n숨겨져 있던 진실이 마침내 세상에 드러났다.',
      '\n\n운명적인 만남이 모든 것의 시작이 될 줄은 몰랐다.'
    ];
    
    const dramaticEvent = dramaticEvents[Math.floor(Math.random() * dramaticEvents.length)];
    
    // 클라이맥스 지점에 삽입
    const climaxPoint = Math.floor(content.length * 0.75);
    const insertPoint = content.lastIndexOf('.', climaxPoint);
    
    if (insertPoint > 0) {
      return content.slice(0, insertPoint + 1) + dramaticEvent + content.slice(insertPoint + 1);
    }
    
    return content + dramaticEvent;
  }

  /**
   * 📊 종합 품질 점수 계산
   */
  calculateOverallScore(progressionScore, conflictScore, repetitionRate, newElementsCount) {
    // 가중치 적용 점수 계산
    const progressionWeight = 0.30;
    const conflictWeight = 0.25;
    const repetitionWeight = 0.25; // 반전: 낮을수록 좋음
    const newElementsWeight = 0.20;
    
    const adjustedProgressionScore = progressionScore * 10;
    const adjustedConflictScore = conflictScore * 10;
    const adjustedRepetitionScore = (1 - repetitionRate) * 10; // 반전
    const adjustedNewElementsScore = Math.min(10, newElementsCount * 2);
    
    const overallScore = 
      (adjustedProgressionScore * progressionWeight) +
      (adjustedConflictScore * conflictWeight) +
      (adjustedRepetitionScore * repetitionWeight) +
      (adjustedNewElementsScore * newElementsWeight);
    
    return parseFloat(Math.max(0, Math.min(10, overallScore)).toFixed(1));
  }

  /**
   * 🔍 키워드 추출 유틸리티
   */
  extractKeywords(content) {
    if (!content) return [];
    
    // 의미있는 단어 추출 (2자 이상, 조사/접속사 제외)
    const words = content.match(/[가-힣]{2,}/g) || [];
    
    // 불용어 제거
    const stopWords = [
      '그런데', '하지만', '그러나', '그리고', '또한', '따라서',
      '이것', '그것', '저것', '이런', '그런', '저런',
      '있다', '없다', '되다', '하다', '이다', '아니다'
    ];
    
    const keywords = words.filter(word => 
      word.length >= 2 && 
      !stopWords.includes(word) &&
      !/^[0-9]+$/.test(word)
    );
    
    // 중복 제거 및 빈도순 정렬
    const keywordFreq = {};
    keywords.forEach(word => {
      keywordFreq[word] = (keywordFreq[word] || 0) + 1;
    });
    
    return Object.keys(keywordFreq)
      .sort((a, b) => keywordFreq[b] - keywordFreq[a])
      .slice(0, 20); // 상위 20개만 반환
  }

  /**
   * 📈 진전도 리포트 생성
   */
  generateProgressionReport(analysis) {
    return {
      summary: `플롯 진전도 ${(analysis.progressionScore * 100).toFixed(1)}%, 갈등 진전도 ${(analysis.conflictScore * 100).toFixed(1)}%`,
      
      progressionStatus: analysis.progressionScore >= this.thresholds.minPlotProgression ? 'PASS' : 'FAIL',
      conflictStatus: analysis.conflictScore >= this.thresholds.minConflictEscalation ? 'PASS' : 'FAIL',
      repetitionStatus: analysis.repetitionRate <= this.thresholds.maxRepetitionRate ? 'PASS' : 'FAIL',
      
      overallStatus: analysis.overallQualityScore >= 7.0 ? 'HIGH_QUALITY' : 'NEEDS_IMPROVEMENT',
      
      recommendations: this.generateRecommendations(analysis),
      
      metrics: {
        progressionScore: analysis.progressionScore,
        conflictScore: analysis.conflictScore,
        repetitionRate: analysis.repetitionRate,
        newElementsCount: analysis.newElementsCount,
        overallQualityScore: analysis.overallQualityScore
      }
    };
  }

  /**
   * 💡 개선 권장사항 생성
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.progressionScore < this.thresholds.minPlotProgression) {
      recommendations.push('플롯 진전이 부족합니다. 새로운 사건이나 발견을 추가하세요.');
    }
    
    if (analysis.conflictScore < this.thresholds.minConflictEscalation) {
      recommendations.push('갈등 요소를 강화하세요. 오해나 위기 상황을 추가해보세요.');
    }
    
    if (analysis.repetitionRate > this.thresholds.maxRepetitionRate) {
      recommendations.push('반복적인 표현을 줄이고 다양한 어휘를 사용하세요.');
    }
    
    if (analysis.newElementsCount < this.thresholds.minNewElements) {
      recommendations.push('새로운 캐릭터, 장소, 또는 상황을 도입하세요.');
    }
    
    return recommendations;
  }
}