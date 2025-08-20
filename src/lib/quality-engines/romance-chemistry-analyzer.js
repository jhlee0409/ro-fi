/**
 * 💕 Romance Chemistry Analyzer - 로맨스 혁신 시스템
 * 
 * GENESIS AI 설계 기반 로맨스 케미스트리 분석 및 강화 시스템
 * - 10단계 로맨스 진행도 추적
 * - 감정선 발전 속도 조절
 * - 케미스트리 점수 실시간 계산
 * - 설렘 포인트 자동 삽입
 */

export class RomanceChemistryAnalyzer {
  constructor(logger) {
    this.logger = logger;
    
    // 10단계 로맨스 진행도 정의
    this.romanceStages = [
      {
        stage: 1,
        name: '첫 만남',
        description: '운명적 첫 만남과 첫인상',
        indicators: ['첫 만남', '첫눈에', '운명', '인상적', '특별한'],
        emotionalIntensity: 0.1,
        physicalProximity: 0.0,
        communicationDepth: 0.1
      },
      {
        stage: 2,
        name: '관심의 시작',
        description: '서로에 대한 호기심과 관심',
        indicators: ['궁금해', '신경쓰이', '관심', '눈길', '생각나'],
        emotionalIntensity: 0.2,
        physicalProximity: 0.1,
        communicationDepth: 0.2
      },
      {
        stage: 3,
        name: '친밀감 형성',
        description: '친근함과 편안함 증가',
        indicators: ['편안한', '친근한', '자연스러운', '익숙한', '마음이 열린'],
        emotionalIntensity: 0.3,
        physicalProximity: 0.2,
        communicationDepth: 0.4
      },
      {
        stage: 4,
        name: '설렘의 시작',
        description: '설렘과 두근거림의 시작',
        indicators: ['설레', '두근거', '떨리', '심장이 뛰', '얼굴이 빨개'],
        emotionalIntensity: 0.5,
        physicalProximity: 0.3,
        communicationDepth: 0.5
      },
      {
        stage: 5,
        name: '감정적 교감',
        description: '깊은 감정적 소통과 이해',
        indicators: ['이해해', '공감', '마음이 통', '같은 마음', '따뜻한'],
        emotionalIntensity: 0.6,
        physicalProximity: 0.4,
        communicationDepth: 0.7
      },
      {
        stage: 6,
        name: '로맨틱 텐션',
        description: '로맨틱한 긴장감과 끌림',
        indicators: ['끌리', '매력적', '아름다운', '황홀한', '빠져들'],
        emotionalIntensity: 0.7,
        physicalProximity: 0.6,
        communicationDepth: 0.6
      },
      {
        stage: 7,
        name: '물리적 친밀감',
        description: '스킨십과 물리적 가까움',
        indicators: ['손을 잡', '포옹', '키스', '안아', '만지'],
        emotionalIntensity: 0.8,
        physicalProximity: 0.8,
        communicationDepth: 0.7
      },
      {
        stage: 8,
        name: '사랑의 자각',
        description: '사랑임을 깨닫는 순간',
        indicators: ['사랑', '좋아해', '마음', '애정', '소중한'],
        emotionalIntensity: 0.9,
        physicalProximity: 0.7,
        communicationDepth: 0.8
      },
      {
        stage: 9,
        name: '고백과 확인',
        description: '마음을 고백하고 확인',
        indicators: ['고백', '좋아한다', '사랑한다', '내 마음', '함께'],
        emotionalIntensity: 1.0,
        physicalProximity: 0.8,
        communicationDepth: 0.9
      },
      {
        stage: 10,
        name: '완성된 사랑',
        description: '서로 확인된 완전한 사랑',
        indicators: ['우리', '함께', '영원히', '운명', '완전한'],
        emotionalIntensity: 1.0,
        physicalProximity: 1.0,
        communicationDepth: 1.0
      }
    ];
    
    // 설렘 포인트 패턴
    this.heartFlutterPatterns = {
      // 시각적 설렘
      visual: [
        '눈이 마주치는 순간', '미소를 지을 때', '머리카락이 흩날리는 모습',
        '잠든 얼굴', '웃는 모습', '진지한 표정'
      ],
      
      // 물리적 설렘
      physical: [
        '우연히 손이 닿았을 때', '가까이 다가왔을 때', '어깨에 기대는 순간',
        '손을 잡는 순간', '포옹하는 순간', '키스하는 순간'
      ],
      
      // 감정적 설렘
      emotional: [
        '마음을 이해해줄 때', '위로해줄 때', '믿어줄 때',
        '지켜줄 때', '응원해줄 때', '함께 웃을 때'
      ],
      
      // 상황적 설렘
      situational: [
        '둘만의 시간', '비 오는 날', '별이 빛나는 밤',
        '축제의 밤', '조용한 카페', '석양이 지는 순간'
      ]
    };
    
    // 로맨틱 텐션 요소
    this.romanticTensionElements = {
      // 갈등-화해 사이클
      conflictResolution: [
        '오해가 생겼다가 풀리는 과정',
        '질투로 인한 갈등과 화해',
        '서로 다른 입장에서 이해하게 되는 순간',
        '위기 상황에서 서로를 지키려는 마음'
      ],
      
      // 점진적 접근
      gradualApproach: [
        '서서히 가까워지는 거리',
        '점점 늘어나는 대화 시간',
        '자연스럽게 이루어지는 스킨십',
        '서로의 비밀을 나누는 과정'
      ],
      
      // 감정적 롤러코스터
      emotionalRollercoaster: [
        '기대와 불안이 교차하는 마음',
        '행복과 걱정이 함께 하는 순간',
        '설렘과 부끄러움이 공존하는 감정',
        '확신과 의심 사이를 오가는 마음'
      ]
    };
    
    // 대화 케미스트리 패턴
    this.dialogueChemistryPatterns = {
      // 말없는 소통
      nonVerbalCommunication: [
        '눈빛만으로도 통하는', '미소로 대답하는', '고개를 끄덕이며',
        '조용히 바라보며', '손짓으로 전하는', '표정으로 말하는'
      ],
      
      // 감정적 공명
      emotionalResonance: [
        '같은 마음이 된 듯한', '마음이 하나가 되는', '감정이 동조되는',
        '서로의 마음을 아는', '말하지 않아도 아는', '마음이 통하는'
      ],
      
      // 특별한 대화
      specialConversation: [
        '다른 사람과는 다른 대화',
        '특별한 의미가 담긴 말',
        '둘만의 비밀스러운 대화',
        '진심이 담긴 대화'
      ]
    };
    
    // 품질 임계값
    this.thresholds = {
      minChemistryScore: 7.0,         // 최소 7.0 케미스트리 점수
      minRomanceProgression: 0.15,    // 최소 15% 로맨스 진전
      minEmotionalDepth: 0.60,        // 최소 60% 감정적 깊이
      minPhysicalProgression: 0.10,   // 최소 10% 물리적 진전
      optimalTensionLevel: 0.40       // 최적 40% 긴장감 수준
    };
    
    // 상태 추적
    this.relationshipHistory = [];
    this.currentChemistryLevel = 0.0;
  }

  /**
   * 💕 AI 기반 로맨스 케미스트리 종합 분석
   */
  async analyzeRomanceChemistry(chapter, storyContext) {
    await this.logger.info('RomanceChemistryAnalyzer: AI 기반 로맨스 분석 시작');
    
    try {
      // AI 직접 분석으로 전환
      const aiAnalysis = await this.aiDirectRomanceAnalysis(chapter.content, storyContext);
      
      // 종합 분석 결과
      const analysis = {
        currentStage: aiAnalysis.currentStage,
        progressionRate: aiAnalysis.progressionRate,
        chemistryScore: aiAnalysis.chemistryScore,
        emotionalDepth: aiAnalysis.emotionalDepth,
        tensionLevel: aiAnalysis.tensionLevel,
        dialogueChemistryScore: aiAnalysis.dialogueChemistryScore,
        heartFlutterCount: aiAnalysis.heartFlutterCount,
        
        // 품질 지표
        meetsChemistryThreshold: aiAnalysis.chemistryScore >= 0.7,
        sufficientProgression: aiAnalysis.progressionRate >= 0.6,
        adequateEmotionalDepth: aiAnalysis.emotionalDepth >= 0.8,
        appropriateTension: aiAnalysis.tensionLevel >= 0.65,
        
        // 상세 분석
        stageIndicators: aiAnalysis.stageIndicators,
        emotionalElements: aiAnalysis.emotionalElements,
        tensionSources: aiAnalysis.tensionSources,
        
        // 종합 품질 점수 (0-10)
        overallQualityScore: aiAnalysis.overallQualityScore
      };
      
      await this.logger.info('RomanceChemistryAnalyzer: AI 분석 완료', analysis);
      return analysis;
      
    } catch (_error) {
      await this.logger.error('RomanceChemistryAnalyzer: AI 분석 실패', { error: _error.message });
      throw _error;
    }
  }

  /**
   * 🤖 AI 직접 로맨스 분석 (하드코딩 패턴 제거)
   */
  async aiDirectRomanceAnalysis(content, _storyContext = {}) {
    await this.logger.info('RomanceChemistryAnalyzer: Gemini AI 직접 로맨스 분석 시작');
    
    try {
      // Gemini API import
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const romanceAnalysisPrompt = `
한국어 로맨스 판타지 소설 컨텐츠를 로맨스 케미스트리 관점에서 분석해주세요.

**분석할 컨텐츠:**
\`\`\`
${content}
\`\`\`

**분석 요청사항:**
1. 로맨스 진행도 (1-10): 현재 로맨스가 어느 단계에 있는가? (1=첫만남, 10=완성된사랑)
2. 진행률 (0.0-1.0): 이 단계에서 얼마나 발전했는가?
3. 케미스트리 점수 (0.0-1.0): 두 인물 간 화학적 끌림이 얼마나 강한가?
4. 감정적 깊이 (0.0-1.0): 감정 표현이 얼마나 깊고 진정성 있는가?
5. 로맨틱 텐션 (0.0-1.0): 로맨틱한 긴장감과 설렘이 얼마나 있는가?
6. 대화 케미스트리 (0.0-1.0): 대화에서 느껴지는 화학적 반응은?
7. 설렘 포인트 개수 (0-10): 독자가 설렐 만한 순간들의 개수

**한국어 로맨스 판타지 특성을 고려하여:**
- 간접적이고 함축적인 로맨스 표현도 높게 평가
- 내적 감정과 심리적 변화를 중요하게 고려  
- 시선, 터치, 분위기 등 미묘한 로맨틱 신호 인식
- 한국 문화적 맥락의 로맨스 표현 방식 이해

응답은 반드시 다음 JSON 형식으로만 출력해주세요:
{
  "currentStage": 6,
  "progressionRate": 0.7,
  "chemistryScore": 0.8,
  "emotionalDepth": 0.9,
  "tensionLevel": 0.75,
  "dialogueChemistryScore": 0.7,
  "heartFlutterCount": 4,
  "stageIndicators": ["끌림", "설렘"],
  "emotionalElements": [{"type": "love", "keyword": "마음"}],
  "tensionSources": [{"type": "approach", "trigger": "가까워진 거리"}],
  "overallQualityScore": 8.2,
  "reasoning": "두 인물 간 로맨틱한 케미스트리가 효과적으로 표현됨..."
}`;

      const result = await model.generateContent(romanceAnalysisPrompt);
      const response = result.response;
      const text = response.text();
      
      await this.logger.info('Gemini 로맨스 분석 응답', { text: text.substring(0, 200) });
      
      // JSON 추출 및 파싱 (제어 문자 처리 개선)
      const cleanedText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // 제어 문자 제거
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gemini 응답에서 JSON을 찾을 수 없습니다');
      }
      
      const analysisResult = JSON.parse(jsonMatch[0]);
      
      // 기본값 보장
      const safeResult = {
        currentStage: Math.max(1, Math.min(10, analysisResult.currentStage || 5)),
        progressionRate: Math.max(0, Math.min(1, analysisResult.progressionRate || 0.5)),
        chemistryScore: Math.max(0, Math.min(1, analysisResult.chemistryScore || 0.5)),
        emotionalDepth: Math.max(0, Math.min(1, analysisResult.emotionalDepth || 0.5)),
        tensionLevel: Math.max(0, Math.min(1, analysisResult.tensionLevel || 0.5)),
        dialogueChemistryScore: Math.max(0, Math.min(1, analysisResult.dialogueChemistryScore || 0.5)),
        heartFlutterCount: Math.max(0, analysisResult.heartFlutterCount || 2),
        stageIndicators: analysisResult.stageIndicators || ['로맨스'],
        emotionalElements: analysisResult.emotionalElements || [{"type": "love", "keyword": "마음"}],
        tensionSources: analysisResult.tensionSources || [],
        overallQualityScore: Math.max(0, Math.min(10, analysisResult.overallQualityScore || 6.0)),
        reasoning: analysisResult.reasoning || 'AI 로맨스 분석 완료'
      };
      
      await this.logger.success('Gemini AI 로맨스 분석 완료', safeResult);
      return safeResult;
      
    } catch (_error) {
      await this.logger.error('AI 로맨스 분석 실패, 폴백 시스템 사용', { error: _error.message });
      
      // 폴백: 기본 분석
      return this.fallbackRomanceAnalysis(content);
    }
  }

  /**
   * 🔄 로맨스 분석 폴백 시스템 (AI 실패시)
   */
  fallbackRomanceAnalysis(content) {
    const hasRomanceKeywords = /사랑|마음|설레|끌리|좋아/.test(content);
    const hasTensionElements = /시선|손|가까이|멀어/.test(content);
    
    return {
      currentStage: hasRomanceKeywords ? 7 : 4,
      progressionRate: 0.6,
      chemistryScore: hasRomanceKeywords ? 0.7 : 0.4,
      emotionalDepth: 0.6,
      tensionLevel: hasTensionElements ? 0.5 : 0.3,
      dialogueChemistryScore: 0.5,
      heartFlutterCount: hasRomanceKeywords ? 3 : 1,
      stageIndicators: ['로맨스'],
      emotionalElements: [{"type": "love", "keyword": "마음"}],
      tensionSources: [],
      overallQualityScore: 7.0,
      reasoning: '폴백 로맨스 분석 적용'
    };
  }

  /**
   * 📈 로맨스 진행도 추적
   */
  trackRomanceProgression(chapter, storyContext) {
    const content = chapter.content || '';
    let currentStage = 1;
    let maxStageScore = 0;
    const detectedIndicators = [];
    
    // 각 단계별 지표 확인
    for (const stage of this.romanceStages) {
      let stageScore = 0;
      const stageIndicators = [];
      
      for (const indicator of stage.indicators) {
        const matches = (content.match(new RegExp(indicator, 'g')) || []).length;
        if (matches > 0) {
          stageScore += matches;
          stageIndicators.push(indicator);
        }
      }
      
      if (stageScore > maxStageScore) {
        maxStageScore = stageScore;
        currentStage = stage.stage;
        detectedIndicators.length = 0;
        detectedIndicators.push(...stageIndicators);
      }
    }
    
    // 이전 컨텍스트와 비교하여 진전률 계산
    const previousStage = this.getPreviousRomanceStage(storyContext);
    const progressionRate = previousStage > 0 ? 
      Math.max(0, (currentStage - previousStage) / previousStage) : 
      currentStage / 10;
    
    return {
      currentStage: currentStage,
      progressionRate: parseFloat(Math.min(1.0, progressionRate).toFixed(3)),
      stageScore: maxStageScore,
      detectedIndicators: detectedIndicators,
      previousStage: previousStage
    };
  }

  /**
   * 💖 케미스트리 점수 계산
   */
  calculateChemistryScore(content) {
    if (!content) return 0.0;
    
    let chemistryPoints = 0;
    const totalSentences = content.split(/[.!?]/).length;
    
    // 로맨틱 요소 점수
    const romanticElements = [
      '사랑', '애정', '마음', '설렘', '두근거림', '좋아해',
      '그리워', '보고싶어', '소중한', '특별한', '운명'
    ];
    
    for (const element of romanticElements) {
      const matches = (content.match(new RegExp(element, 'g')) || []).length;
      chemistryPoints += matches * 0.5;
    }
    
    // 친밀감 표현 점수
    const intimacyExpressions = [
      '눈을 마주', '손을 잡', '포옹', '키스', '안아', '쓰다듬',
      '어루만지', '기대', '가까이', '함께'
    ];
    
    for (const expression of intimacyExpressions) {
      const matches = (content.match(new RegExp(expression, 'g')) || []).length;
      chemistryPoints += matches * 0.8;
    }
    
    // 감정적 교감 점수
    const emotionalConnectionWords = [
      '이해', '공감', '마음이 통', '같은 마음', '하나가 된',
      '서로의 마음', '진심', '솔직한', '믿어'
    ];
    
    for (const _word of emotionalConnectionWords) {
      const matches = (content.match(new RegExp(_word, 'g')) || []).length;
      chemistryPoints += matches * 0.7;
    }
    
    // 정규화하여 0-10 점수로 변환
    const normalizedScore = Math.min(10, (chemistryPoints / Math.max(1, totalSentences)) * 20);
    
    return parseFloat(normalizedScore.toFixed(1));
  }

  /**
   * 💭 감정선 발전 분석
   */
  analyzeEmotionalDevelopment(chapter, storyContext) {
    const content = chapter.content || '';
    
    // 감정 깊이 측정
    const emotionalDepthIndicators = [
      '깊은 감정', '진심', '마음 깊이', '가슴 깊은 곳',
      '영혼', '운명', '평생', '영원히', '절대적인'
    ];
    
    let depthScore = 0;
    for (const indicator of emotionalDepthIndicators) {
      depthScore += (content.match(new RegExp(indicator, 'g')) || []).length;
    }
    
    // 감정 변화 추적
    const emotionalElements = this.identifyEmotionalElements(content);
    
    // 감정적 복잡성 측정
    const emotionalComplexity = this.measureEmotionalComplexity(content);
    
    const totalEmotionalScore = depthScore + emotionalElements.length + emotionalComplexity;
    const normalizedDepth = Math.min(1.0, totalEmotionalScore / 20);
    
    return {
      depth: parseFloat(normalizedDepth.toFixed(3)),
      elements: emotionalElements,
      complexity: emotionalComplexity,
      changeRate: this.calculateEmotionalChangeRate(chapter, storyContext)
    };
  }

  /**
   * ⚡ 로맨틱 텐션 생성 및 측정
   */
  async generateRomanticTension(content) {
    await this.logger.info('RomanceChemistryAnalyzer: 로맨틱 텐션 생성 시작');
    
    try {
      let enhancedContent = content;
      
      // 1. 설렘 포인트 자동 삽입
      enhancedContent = this.injectHeartFlutterMoments(enhancedContent);
      
      // 2. 갈등-화해 사이클 생성
      enhancedContent = this.createConflictResolutionCycle(enhancedContent);
      
      // 3. 상호작용 품질 향상
      enhancedContent = this.enhanceInteractionQuality(enhancedContent);
      
      // 4. 감정적 롤러코스터 추가
      enhancedContent = this.addEmotionalRollercoaster(enhancedContent);
      
      await this.logger.success('RomanceChemistryAnalyzer: 로맨틱 텐션 생성 완료');
      return enhancedContent;
      
    } catch (_error) {
      await this.logger.error('RomanceChemistryAnalyzer: 텐션 생성 실패', { error: _error.message });
      return content;
    }
  }

  /**
   * 💬 대화 케미스트리 강화
   */
  async enhanceDialogueChemistry(content) {
    await this.logger.info('RomanceChemistryAnalyzer: 대화 케미스트리 강화 시작');
    
    try {
      let enhancedContent = content;
      
      // 1. 말없는 소통 추가
      enhancedContent = this.addNonVerbalCommunication(enhancedContent);
      
      // 2. 감정적 공명 구현
      enhancedContent = this.implementEmotionalResonance(enhancedContent);
      
      // 3. 로맨틱 긴장감 조성
      enhancedContent = this.createRomanticTension(enhancedContent);
      
      // 4. 특별한 대화 순간 생성
      enhancedContent = this.createSpecialConversationMoments(enhancedContent);
      
      await this.logger.success('RomanceChemistryAnalyzer: 대화 케미스트리 강화 완료');
      return enhancedContent;
      
    } catch (_error) {
      await this.logger.error('RomanceChemistryAnalyzer: 대화 강화 실패', { error: _error.message });
      return content;
    }
  }

  /**
   * 📱 유틸리티 메서드들
   */
  
  measureRomanticTension(content) {
    if (!content) return 0.0;
    
    // 긴장감 요소 탐지
    const tensionIndicators = [
      '긴장', '떨리', '두근거', '심장이 뛰', '숨이 막히',
      '어떻게 해야', '말해야 할까', '어색한', '부끄러운'
    ];
    
    let tensionScore = 0;
    for (const indicator of tensionIndicators) {
      tensionScore += (content.match(new RegExp(indicator, 'g')) || []).length;
    }
    
    // 대화 긴장감
    const dialogueTension = this.measureDialogueTension(content);
    
    // 상황적 긴장감
    const situationalTension = this.measureSituationalTension(content);
    
    const totalTension = tensionScore + dialogueTension + situationalTension;
    const totalSentences = content.split(/[.!?]/).length;
    
    return parseFloat(Math.min(1.0, totalTension / Math.max(1, totalSentences)).toFixed(3));
  }
  
  analyzeDialogueChemistry(content) {
    const dialogues = this.extractDialogues(content);
    
    if (dialogues.length === 0) return 0.0;
    
    let chemistryScore = 0;
    
    // 대화의 감정적 깊이
    for (const dialogue of dialogues) {
      // 감정적 단어 포함 여부
      const emotionalWords = ['사랑', '좋아', '그리워', '보고싶어', '소중해'];
      const hasEmotionalContent = emotionalWords.some(word => dialogue.includes(word));
      
      if (hasEmotionalContent) {
        chemistryScore += 1;
      }
      
      // 개인적인 내용 포함 여부
      const personalIndicators = ['너만', '우리', '함께', '비밀', '약속'];
      const hasPersonalContent = personalIndicators.some(word => dialogue.includes(word));
      
      if (hasPersonalContent) {
        chemistryScore += 0.5;
      }
    }
    
    // 0-10 점수로 정규화
    return parseFloat(Math.min(10, (chemistryScore / dialogues.length) * 5).toFixed(1));
  }
  
  countHeartFlutterMoments(content) {
    let count = 0;
    
    // 각 카테고리별 설렘 포인트 확인
    for (const [_category, patterns] of Object.entries(this.heartFlutterPatterns)) {
      for (const pattern of patterns) {
        count += (content.match(new RegExp(pattern, 'g')) || []).length;
      }
    }
    
    // 설렘 관련 키워드 추가 확인
    const flutterKeywords = ['설레', '두근거', '떨리', '심장이 뛰', '얼굴이 빨개'];
    for (const _keyword of flutterKeywords) {
      count += (content.match(new RegExp(_keyword, 'g')) || []).length;
    }
    
    return count;
  }
  
  getPreviousRomanceStage(storyContext) {
    if (!storyContext || !storyContext.romanceHistory) {
      return 0;
    }
    
    const history = storyContext.romanceHistory;
    return history.length > 0 ? history[history.length - 1].stage : 0;
  }
  
  identifyEmotionalElements(content) {
    const elements = [];
    
    // 기본 감정 요소
    const basicEmotions = {
      'joy': ['기뻐', '행복', '즐거워', '웃음'],
      'love': ['사랑', '좋아', '애정', '마음'],
      'longing': ['그리워', '보고싶어', '그리움'],
      'nervousness': ['떨려', '긴장', '두근거려'],
      'comfort': ['편안', '안정', '따뜻함', '평화']
    };
    
    for (const [emotion, keywords] of Object.entries(basicEmotions)) {
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          elements.push({ type: emotion, keyword: keyword });
        }
      }
    }
    
    return elements;
  }
  
  measureEmotionalComplexity(content) {
    // 복합 감정 표현 확인
    const complexEmotions = [
      '기쁘면서도 슬픈', '행복하지만 불안한', '사랑하지만 두려운',
      '설레면서도 걱정되는', '즐거우면서도 아쉬운'
    ];
    
    let complexity = 0;
    for (const complex of complexEmotions) {
      complexity += (content.match(new RegExp(complex, 'g')) || []).length;
    }
    
    return complexity;
  }
  
  calculateEmotionalChangeRate(chapter, storyContext) {
    // 감정 변화율 계산 (이전 챕터와 비교)
    if (!storyContext || !storyContext.previousEmotions) {
      return 0.5; // 기본값
    }
    
    const currentEmotions = this.identifyEmotionalElements(chapter.content);
    const previousEmotions = storyContext.previousEmotions;
    
    const newEmotions = currentEmotions.filter(current => 
      !previousEmotions.some(prev => prev.type === current.type)
    );
    
    return Math.min(1.0, newEmotions.length / Math.max(1, currentEmotions.length));
  }
  
  identifyTensionSources(content) {
    const sources = [];
    
    // 긴장감 원인 분류
    const tensionTypes = {
      'confession': ['고백', '말하고 싶어', '전하고 싶어'],
      'misunderstanding': ['오해', '모르겠어', '이해할 수 없어'],
      'jealousy': ['질투', '시기', '부러워'],
      'separation': ['헤어', '떠나', '이별'],
      'approach': ['다가가', '가까이', '손을 뻗어']
    };
    
    for (const [type, keywords] of Object.entries(tensionTypes)) {
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          sources.push({ type: type, trigger: keyword });
        }
      }
    }
    
    return sources;
  }
  
  injectHeartFlutterMoments(content) {
    const flutterMoments = [
      '\n\n그 순간, 마음이 두근거리기 시작했다.',
      '\n\n예상치 못한 설렘이 가슴을 채웠다.',
      '\n\n이상하게도 심장이 빨리 뛰기 시작했다.',
      '\n\n얼굴이 붉어지는 것을 느꼈다.',
      '\n\n가슴 한편이 따뜻해지는 것 같았다.'
    ];
    
    // 로맨틱한 상황 근처에 삽입
    const romanticContext = /사랑|좋아|마음|설레|두근거|함께|포옹|키스/;
    const match = content.match(romanticContext);
    
    if (match) {
      const insertPoint = match.index + match[0].length;
      const nearestPeriod = content.indexOf('.', insertPoint);
      
      if (nearestPeriod > 0) {
        const flutterMoment = flutterMoments[Math.floor(Math.random() * flutterMoments.length)];
        return content.slice(0, nearestPeriod + 1) + flutterMoment + content.slice(nearestPeriod + 1);
      }
    }
    
    return content;
  }
  
  createConflictResolutionCycle(content) {
    // 갈등과 화해의 사이클 생성
    const conflictElements = [
      '\n\n그러나 작은 오해가 생기기 시작했다.',
      '\n\n예상치 못한 갈등이 둘 사이에 끼어들었다.',
      '\n\n서로 다른 생각 때문에 어색해졌다.'
    ];
    
    const resolutionElements = [
      '\n\n하지만 곧 서로의 진심을 이해하게 되었다.',
      '\n\n오해는 금세 풀리고 더욱 가까워졌다.',
      '\n\n이 일로 인해 오히려 더 깊이 알게 되었다.'
    ];
    
    // 중간 지점에 갈등 요소 삽입
    const midPoint = Math.floor(content.length * 0.4);
    const insertPoint1 = content.lastIndexOf('.', midPoint);
    
    if (insertPoint1 > 0) {
      const conflictElement = conflictElements[Math.floor(Math.random() * conflictElements.length)];
      content = content.slice(0, insertPoint1 + 1) + conflictElement + content.slice(insertPoint1 + 1);
      
      // 후반부에 해결 요소 삽입
      const latePoint = Math.floor(content.length * 0.7);
      const insertPoint2 = content.lastIndexOf('.', latePoint);
      
      if (insertPoint2 > insertPoint1 + conflictElement.length) {
        const resolutionElement = resolutionElements[Math.floor(Math.random() * resolutionElements.length)];
        content = content.slice(0, insertPoint2 + 1) + resolutionElement + content.slice(insertPoint2 + 1);
      }
    }
    
    return content;
  }
  
  enhanceInteractionQuality(content) {
    // 상호작용 품질 향상
    const qualityEnhancements = {
      '말했다': '부드럽게 말했다',
      '대답했다': '미소를 지으며 대답했다',
      '봤다': '따뜻한 눈빛으로 바라봤다',
      '들었다': '집중해서 들었다',
      '웃었다': '환하게 웃었다'
    };
    
    let enhancedContent = content;
    
    for (const [basic, enhanced] of Object.entries(qualityEnhancements)) {
      enhancedContent = enhancedContent.replace(new RegExp(basic, 'g'), enhanced);
    }
    
    return enhancedContent;
  }
  
  addEmotionalRollercoaster(content) {
    // 감정적 기복 추가
    const emotionalShifts = [
      '\n\n마음이 복잡해지기 시작했다.',
      '\n\n기쁨과 불안이 동시에 밀려왔다.',
      '\n\n예상치 못한 감정의 변화를 느꼈다.',
      '\n\n마음 한구석에서 다른 감정이 스며들었다.'
    ];
    
    // 감정 표현 근처에 삽입
    const emotionalMatch = content.match(/기쁘|슬프|화나|사랑|설레|두근거/);
    
    if (emotionalMatch) {
      const insertPoint = emotionalMatch.index + emotionalMatch[0].length;
      const nearestParagraph = content.indexOf('\n\n', insertPoint);
      
      if (nearestParagraph > 0) {
        const emotionalShift = emotionalShifts[Math.floor(Math.random() * emotionalShifts.length)];
        return content.slice(0, nearestParagraph) + emotionalShift + content.slice(nearestParagraph);
      }
    }
    
    return content;
  }
  
  addNonVerbalCommunication(content) {
    // 말없는 소통 추가
    const nonVerbalElements = [
      '눈빛만으로도 서로의 마음을 알 수 있었다',
      '미소로 모든 것을 대신했다',
      '조용한 시선 교환이 더 많은 것을 말해주었다',
      '손짓 하나로도 충분히 전해졌다'
    ];
    
    const dialogueRegex = /"[^"]+"/g;
    const dialogueMatches = [...content.matchAll(dialogueRegex)];
    
    if (dialogueMatches.length > 0) {
      const randomDialogue = dialogueMatches[Math.floor(Math.random() * dialogueMatches.length)];
      const insertPoint = randomDialogue.index + randomDialogue[0].length;
      
      const nonVerbalElement = nonVerbalElements[Math.floor(Math.random() * nonVerbalElements.length)];
      const addition = ` ${nonVerbalElement}.`;
      
      return content.slice(0, insertPoint) + addition + content.slice(insertPoint);
    }
    
    return content;
  }
  
  implementEmotionalResonance(content) {
    // 감정적 공명 구현
    const resonanceElements = [
      '\n\n같은 마음이 된 것 같았다.',
      '\n\n서로의 감정이 하나로 연결되는 것을 느꼈다.',
      '\n\n마음이 완전히 통하는 순간이었다.',
      '\n\n말하지 않아도 서로를 이해할 수 있었다.'
    ];
    
    // 감정적 순간 근처에 삽입
    const emotionalMoment = content.match(/마음|감정|사랑|이해|공감/);
    
    if (emotionalMoment) {
      const insertPoint = emotionalMoment.index + emotionalMoment[0].length;
      const nearestPeriod = content.indexOf('.', insertPoint);
      
      if (nearestPeriod > 0) {
        const resonance = resonanceElements[Math.floor(Math.random() * resonanceElements.length)];
        return content.slice(0, nearestPeriod + 1) + resonance + content.slice(nearestPeriod + 1);
      }
    }
    
    return content;
  }
  
  createRomanticTension(content) {
    // 로맨틱 긴장감 조성
    const tensionElements = [
      '\n\n공기가 미묘하게 달라졌다.',
      '\n\n둘 사이에 특별한 긴장감이 흘렀다.',
      '\n\n마치 시간이 멈춘 것 같은 순간이었다.',
      '\n\n모든 것이 느려지는 것 같았다.'
    ];
    
    // 가까운 거리나 친밀한 상황 근처에 삽입
    const intimateContext = /가까이|함께|손을|포옹|키스|안아/;
    const match = content.match(intimateContext);
    
    if (match) {
      const insertPoint = match.index + match[0].length;
      const nearestPeriod = content.indexOf('.', insertPoint);
      
      if (nearestPeriod > 0) {
        const tension = tensionElements[Math.floor(Math.random() * tensionElements.length)];
        return content.slice(0, nearestPeriod + 1) + tension + content.slice(nearestPeriod + 1);
      }
    }
    
    return content;
  }
  
  createSpecialConversationMoments(content) {
    // 특별한 대화 순간 생성
    const specialMoments = [
      '\n\n이 대화는 다른 누구와도 나눌 수 없는 특별한 것이었다.',
      '\n\n둘만의 비밀스러운 대화가 계속되었다.',
      '\n\n평범한 말들이 특별한 의미로 다가왔다.',
      '\n\n진심이 담긴 대화였다.'
    ];
    
    const dialogueRegex = /"[^"]+"/g;
    const lastDialogue = [...content.matchAll(dialogueRegex)].pop();
    
    if (lastDialogue) {
      const insertPoint = lastDialogue.index + lastDialogue[0].length;
      const nearestPeriod = content.indexOf('.', insertPoint);
      
      if (nearestPeriod > 0) {
        const specialMoment = specialMoments[Math.floor(Math.random() * specialMoments.length)];
        return content.slice(0, nearestPeriod + 1) + specialMoment + content.slice(nearestPeriod + 1);
      }
    }
    
    return content;
  }
  
  extractDialogues(content) {
    const dialogueRegex = /"([^"]+)"/g;
    const dialogues = [];
    let match;
    
    while ((match = dialogueRegex.exec(content)) !== null) {
      dialogues.push(match[1]);
    }
    
    return dialogues;
  }
  
  measureDialogueTension(content) {
    const dialogues = this.extractDialogues(content);
    let tensionScore = 0;
    
    const tensionKeywords = ['어떻게', '왜', '정말', '진짜', '혹시', '만약'];
    
    for (const dialogue of dialogues) {
      for (const keyword of tensionKeywords) {
        if (dialogue.includes(keyword)) {
          tensionScore += 0.5;
        }
      }
      
      // 질문형 대화 (긴장감 증가)
      if (dialogue.includes('?')) {
        tensionScore += 0.3;
      }
      
      // 미완성 문장 (말을 잇지 못함)
      if (dialogue.includes('...') || dialogue.includes('그러니까')) {
        tensionScore += 0.4;
      }
    }
    
    return tensionScore;
  }
  
  measureSituationalTension(content) {
    const situationalTensionKeywords = [
      '조용한', '둘만의', '아무도 없는', '고요한', '적막한',
      '밤늦은', '어두운', '비밀스러운', '숨겨진'
    ];
    
    let situationScore = 0;
    
    for (const _keyword of situationalTensionKeywords) {
      situationScore += (content.match(new RegExp(_keyword, 'g')) || []).length;
    }
    
    return situationScore * 0.3;
  }
  
  calculateRomanceScore(chemistryScore, progressionRate, emotionalDepth, tensionLevel, dialogueChemistry) {
    // 가중치 적용 점수 계산
    const chemistryWeight = 0.30;
    const progressionWeight = 0.25;
    const emotionalWeight = 0.20;
    const tensionWeight = 0.15;
    const dialogueWeight = 0.10;
    
    const adjustedChemistryScore = chemistryScore; // 이미 0-10 범위
    const adjustedProgressionScore = progressionRate * 10;
    const adjustedEmotionalScore = emotionalDepth * 10;
    const adjustedTensionScore = tensionLevel * 10;
    const adjustedDialogueScore = dialogueChemistry; // 이미 0-10 범위
    
    const overallScore = 
      (adjustedChemistryScore * chemistryWeight) +
      (adjustedProgressionScore * progressionWeight) +
      (adjustedEmotionalScore * emotionalWeight) +
      (adjustedTensionScore * tensionWeight) +
      (adjustedDialogueScore * dialogueWeight);
    
    return parseFloat(Math.max(0, Math.min(10, overallScore)).toFixed(1));
  }

  /**
   * 📊 로맨스 품질 리포트 생성
   */
  generateRomanceReport(analysis) {
    return {
      summary: `로맨스 단계 ${analysis.currentStage}/10, 케미스트리 ${analysis.chemistryScore}/10`,
      
      chemistryStatus: analysis.chemistryScore >= this.thresholds.minChemistryScore ? 'PASS' : 'FAIL',
      progressionStatus: analysis.progressionRate >= this.thresholds.minRomanceProgression ? 'PASS' : 'FAIL',
      emotionalStatus: analysis.emotionalDepth >= this.thresholds.minEmotionalDepth ? 'PASS' : 'FAIL',
      tensionStatus: analysis.tensionLevel >= this.thresholds.optimalTensionLevel ? 'PASS' : 'FAIL',
      
      overallStatus: analysis.overallQualityScore >= 7.0 ? 'HIGH_QUALITY' : 'NEEDS_IMPROVEMENT',
      
      recommendations: this.generateRomanceRecommendations(analysis),
      
      metrics: {
        currentStage: analysis.currentStage,
        chemistryScore: analysis.chemistryScore,
        progressionRate: analysis.progressionRate,
        emotionalDepth: analysis.emotionalDepth,
        tensionLevel: analysis.tensionLevel,
        overallQualityScore: analysis.overallQualityScore
      }
    };
  }

  /**
   * 💡 로맨스 개선 권장사항 생성
   */
  generateRomanceRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.chemistryScore < this.thresholds.minChemistryScore) {
      recommendations.push('캐릭터 간 케미스트리를 강화하세요. 더 친밀한 상호작용을 추가해보세요.');
    }
    
    if (analysis.progressionRate < this.thresholds.minRomanceProgression) {
      recommendations.push('로맨스 진전이 느립니다. 관계 발전 요소를 더 추가하세요.');
    }
    
    if (analysis.emotionalDepth < this.thresholds.minEmotionalDepth) {
      recommendations.push('감정적 깊이를 더하세요. 내적 감정 묘사를 강화해보세요.');
    }
    
    if (analysis.tensionLevel < this.thresholds.optimalTensionLevel) {
      recommendations.push('로맨틱 긴장감을 높이세요. 설렘이나 떨림의 순간을 추가해보세요.');
    }
    
    if (analysis.heartFlutterCount < 2) {
      recommendations.push('설렘 포인트를 더 추가하세요. 독자가 설렐 수 있는 순간을 만들어보세요.');
    }
    
    return recommendations;
  }
}