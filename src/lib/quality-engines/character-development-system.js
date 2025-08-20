/**
 * 👥 Character Development System - 캐릭터 입체화 시스템
 * 
 * GENESIS AI 설계 기반 캐릭터 능동성 강화 및 성장 추적 시스템
 * - 수동적 대사 → 능동적 대사 변환 (최소 60% 능동성)
 * - 반복 표현 자동 탐지 및 대체
 * - 캐릭터별 고유한 말투 차별화
 * - 5단계 성장 아크 추적 시스템
 */

export class CharacterDevelopmentSystem {
  constructor(logger) {
    this.logger = logger;
    
    // 캐릭터 능동성 패턴 데이터베이스
    this.agencyPatterns = {
      // 수동적 표현 → 능동적 표현 변환 매핑
      passiveToActive: {
        '~을 당했다': '~에 맞서 싸웠다',
        '~이 일어났다': '~을 일으켰다',
        '~을 받았다': '~을 쟁취했다',
        '~에 휩쓸렸다': '~을 주도했다',
        '~이 되었다': '~을 선택했다',
        '~을 봤다': '~을 응시했다',
        '~을 들었다': '~에 귀 기울였다',
        '~라고 생각했다': '~라고 확신했다',
        '운명이었다': '운명을 바꿨다',
        '어쩔 수 없었다': '결단을 내렸다'
      },
      
      // 능동적 동사 리스트 (로맨스 판타지 특화)
      activeVerbs: [
        // 기본 행동 동사
        '결정했다', '선택했다', '도전했다', '맞서다', '이끌었다',
        '개척했다', '창조했다', '극복했다', '쟁취했다', '실현했다',
        '추구했다', '관철했다', '수호했다', '변화시켰다',
        
        // 일반적인 한국어 능동 동사
        '했다', '갔다', '왔다', '봤다', '보았다', '말했다', '물었다',
        '답했다', '웃었다', '울었다', '뛰었다', '걸었다', '달렸다',
        '앉았다', '일어났다', '서있었다', '누웠다', '잠들었다',
        
        // 감정/의지 표현 동사
        '원했다', '바랐다', '희망했다', '기대했다', '믿었다',
        '확신했다', '의심했다', '걱정했다', '두려워했다', '사랑했다',
        '미워했다', '질투했다', '부러워했다', '존경했다', '감사했다',
        
        // 로맨스 특화 동사
        '키스했다', '포옹했다', '안았다', '잡았다', '만졌다',
        '바라봤다', '응시했다', '지켜봤다', '찾았다', '찾아갔다',
        '구했다', '구원했다', '보호했다', '지켜냈다', '아꼈다',
        
        // 판타지 특화 동사
        '사용했다', '발동했다', '시전했다', '소환했다', '공격했다',
        '방어했다', '치료했다', '회복했다', '변신했다', '각성했다',
        '깨달았다', '터득했다', '수련했다', '성장했다', '진화했다',
        
        // 대화/소통 동사
        '외쳤다', '속삭였다', '중얼거렸다', '노래했다', '읊었다',
        '부르짖었다', '탄식했다', '한숨쉬었다', '침묵했다', '대답했다',
        
        // 행동/이동 동사
        '움직였다', '이동했다', '돌아왔다', '떠났다', '도착했다',
        '출발했다', '향했다', '접근했다', '피했다', '숨었다',
        '나타났다', '사라졌다', '등장했다', '퇴장했다', '머물렀다'
      ],
      
      // 수동적 동사 탐지
      passiveVerbs: [
        '당했다', '받았다', '휩쓸렸다', '떠밀렸다', '이끌렸다',
        '끌려갔다', '시달렸다', '굴복했다', '포기했다', '체념했다'
      ]
    };
    
    // 감정별 말투 차별화 패턴
    this.speechPatterns = {
      // 기본 성격별 말투
      personalities: {
        strong: {
          patterns: ['단호하게', '결연히', '당당하게', '확신에 차서'],
          endingStyles: ['다', '겠다', '리라', '것이다'],
          characteristics: ['직설적', '명확한', '의지적']
        },
        gentle: {
          patterns: ['부드럽게', '조심스럽게', '따뜻하게', '상냥하게'],
          endingStyles: ['요', '해요', '거예요', '인 것 같아요'],
          characteristics: ['정중한', '배려하는', '공감적']
        },
        cold: {
          patterns: ['차갑게', '냉정하게', '무감정하게', '건조하게'],
          endingStyles: ['다', '군', '겠지', '것 같군'],
          characteristics: ['간결한', '논리적', '거리감 있는']
        },
        passionate: {
          patterns: ['열정적으로', '감격하며', '흥분하여', '격정적으로'],
          endingStyles: ['야!', '어!', '다고!', '잖아!'],
          characteristics: ['강렬한', '감정적', '표현적']
        }
      },
      
      // 감정 상태별 변화
      _emotionalStates: {
        angry: ['화를 내며', '분노하여', '격앙되어', '성난 목소리로'],
        sad: ['슬프게', '우울하게', '침울하게', '눈물을 머금고'],
        happy: ['기쁘게', '환하게', '밝게', '즐거워하며'],
        surprised: ['놀라며', '당황하여', '깜짝 놀라', '경악하며'],
        worried: ['걱정스럽게', '불안하게', '초조하게', '애타게']
      }
    };
    
    // 5단계 성장 아크 정의
    this.growthStages = [
      {
        stage: 1,
        name: '도입 단계',
        description: '캐릭터의 기본 성격과 상황 제시',
        indicators: ['첫 등장', '기본 설정', '현재 상황'],
        goalMilestones: ['성격 확립', '동기 제시', '갈등 상황 인지']
      },
      {
        stage: 2,
        name: '갈등 인식',
        description: '문제 상황과 내적 갈등 인지',
        indicators: ['문제 발견', '갈등 시작', '고민 표출'],
        goalMilestones: ['갈등 요소 파악', '선택의 기로', '의문 제기']
      },
      {
        stage: 3,
        name: '시련과 성장',
        description: '도전과 실패를 통한 학습',
        indicators: ['시련 경험', '실패와 좌절', '깨달음'],
        goalMilestones: ['한계 직면', '새로운 시각', '내적 변화']
      },
      {
        stage: 4,
        name: '변화와 결단',
        description: '성장을 바탕으로 한 새로운 선택',
        indicators: ['결단력 향상', '적극적 행동', '리더십'],
        goalMilestones: ['자신감 획득', '주도권 확보', '관계 변화']
      },
      {
        stage: 5,
        name: '완성과 성취',
        description: '성장한 모습으로 목표 달성',
        indicators: ['목표 달성', '성숙한 판단', '완성된 인격'],
        goalMilestones: ['자아실현', '조화로운 관계', '미래 비전']
      }
    ];
    
    // 품질 임계값
    this.thresholds = {
      minAgencyRate: 0.60,        // 최소 60% 능동성
      maxRepetitionRate: 0.20,    // 최대 20% 대사 반복
      minPersonalityScore: 7.0,   // 최소 7.0 개성 점수
      minGrowthProgress: 0.15     // 최소 15% 성장 진전
    };
    
    // 캐릭터 추적 상태
    this.characterProfiles = new Map();
    this.speechHistory = new Map();
  }

  /**
   * 👥 AI 기반 캐릭터 능동성 종합 분석
   */
  async analyzeCharacterDevelopment(chapter, storyContext = {}) {
    await this.logger.info('CharacterDevelopmentSystem: AI 기반 캐릭터 분석 시작');
    
    try {
      // chapter가 문자열인 경우와 객체인 경우 모두 처리
      const content = typeof chapter === 'string' ? chapter : chapter.content;
      
      // AI 직접 평가로 전환 - 하드코딩된 패턴 제거
      const aiAnalysis = await this.aiDirectAnalysis(content, storyContext);
      
      // 종합 분석 결과
      const analysis = {
        agencyScore: aiAnalysis.agencyScore,
        speechDiversityScore: aiAnalysis.speechDiversityScore,
        personalityScore: aiAnalysis.personalityScore,
        growthProgress: aiAnalysis.growthProgress,
        currentGrowthStage: aiAnalysis.currentGrowthStage,
        
        // 품질 지표
        meetsAgencyThreshold: aiAnalysis.agencyScore >= 0.6,
        acceptableSpeechRepetition: aiAnalysis.speechDiversityScore >= 0.8,
        sufficientPersonality: aiAnalysis.personalityScore >= 7.0,
        showsGrowth: aiAnalysis.growthProgress >= 0.15,
        
        // 상세 분석
        dialogueCount: aiAnalysis.dialogueCount,
        actionCount: aiAnalysis.actionCount,
        detectedCharacters: aiAnalysis.detectedCharacters,
        
        // 종합 품질 점수 (0-10)
        overallQualityScore: aiAnalysis.overallQualityScore
      };
      
      await this.logger.info('CharacterDevelopmentSystem: AI 분석 완료', analysis);
      return analysis;
      
    } catch (_error) {
      await this.logger.error('CharacterDevelopmentSystem: AI 분석 실패', { error: _error.message });
      throw _error;
    }
  }

  /**
   * 🤖 AI 직접 컨텐츠 분석 (하드코딩 패턴 제거)
   */
  async aiDirectAnalysis(content, storyContext = {}) {
    await this.logger.info('CharacterDevelopmentSystem: Gemini AI 직접 분석 시작');
    
    try {
      // Gemini API import
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const analysisPrompt = `
한국어 로맨스 판타지 소설 컨텐츠를 캐릭터 개발 관점에서 분석해주세요.

**분석할 컨텐츠:**
\`\`\`
${content}
\`\`\`

**분석 요청사항:**
1. 캐릭터 능동성 (0.0-1.0): 캐릭터가 얼마나 주도적이고 능동적으로 행동하는가?
2. 대화 다양성 (0.0-1.0): 대화 패턴과 말투가 얼마나 다양하고 개성적인가?
3. 개성 강도 (0-10): 캐릭터의 개성과 고유성이 얼마나 잘 드러나는가?
4. 성장 진전도 (0.0-1.0): 캐릭터의 변화와 성장이 얼마나 보이는가?
5. 성장 단계 (1-5): 현재 캐릭터가 어느 발전 단계에 있는가?

**한국어 로맨스 판타지 특성을 고려하여:**
- 간접적 감정 표현과 함축적 대화도 높게 평가
- 내적 갈등과 심리 묘사 중시
- 로맨틱한 긴장감과 감정적 깊이 고려
- 한국 문화적 맥락의 캐릭터 표현 이해

응답은 반드시 다음 JSON 형식으로만 출력해주세요:
{
  "agencyScore": 0.7,
  "speechDiversityScore": 0.8,
  "personalityScore": 7.5,
  "growthProgress": 0.6,
  "currentGrowthStage": 3,
  "dialogueCount": 25,
  "actionCount": 30,
  "detectedCharacters": ["주인공", "상대방"],
  "overallQualityScore": 7.8,
  "reasoning": "캐릭터가 능동적으로 상황에 대응하며..."
}`;

      const result = await model.generateContent(analysisPrompt);
      const response = result.response;
      const text = response.text();
      
      await this.logger.info('Gemini 원본 응답', { text: text.substring(0, 200) });
      
      // JSON 추출 및 파싱
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gemini 응답에서 JSON을 찾을 수 없습니다');
      }
      
      const analysisResult = JSON.parse(jsonMatch[0]);
      
      // 기본값 보장
      const safeResult = {
        agencyScore: analysisResult.agencyScore || 0.5,
        speechDiversityScore: analysisResult.speechDiversityScore || 0.5,
        personalityScore: analysisResult.personalityScore || 5.0,
        growthProgress: analysisResult.growthProgress || 0.3,
        currentGrowthStage: analysisResult.currentGrowthStage || 1,
        dialogueCount: analysisResult.dialogueCount || 0,
        actionCount: analysisResult.actionCount || 0,
        detectedCharacters: analysisResult.detectedCharacters || ['주인공'],
        overallQualityScore: analysisResult.overallQualityScore || 5.0,
        reasoning: analysisResult.reasoning || 'AI 분석 완료'
      };
      
      await this.logger.success('Gemini AI 분석 완료', safeResult);
      return safeResult;
      
    } catch (_error) {
      await this.logger.error('AI 분석 실패, 폴백 시스템 사용', { error: _error.message });
      
      // 폴백: 기본 분석
      return this.fallbackAnalysis(content);
    }
  }

  /**
   * 🔄 폴백 분석 시스템 (AI 실패시)
   */
  fallbackAnalysis(content) {
    // 간단한 휴리스틱 기반 분석
    const lines = content.split('\n').filter(line => line.trim());
    const sentences = content.split(/[.!?]/).filter(s => s.trim());
    
    return {
      agencyScore: Math.min(1.0, lines.length * 0.05),
      speechDiversityScore: Math.min(1.0, sentences.length * 0.03),
      personalityScore: Math.min(10, lines.length * 0.1),
      growthProgress: 0.5,
      currentGrowthStage: 2,
      dialogueCount: (content.match(/["']/g) || []).length / 2,
      actionCount: sentences.length,
      detectedCharacters: ['주인공'],
      overallQualityScore: 6.0,
      reasoning: '폴백 분석 적용'
    };
  }

  /**
   * 🎬 캐릭터 능동성 강화
   */
  async enforceCharacterAgency(content, storyContext = {}) {
    await this.logger.info('CharacterDevelopmentSystem: 능동성 강화 시작');
    
    try {
      let enhancedContent = content;
      
      // 1. 수동적 대사 → 능동적 대사 변환
      enhancedContent = this.convertPassiveToActiveSpeech(enhancedContent);
      
      // 2. 반응형 행동 → 주체적 행동 변환
      enhancedContent = this.enhanceCharacterActions(enhancedContent);
      
      // 3. 캐릭터 개성 강화
      enhancedContent = this.strengthenCharacterPersonality(enhancedContent, storyContext);
      
      // 4. 성장 요소 추가
      enhancedContent = this.injectGrowthElements(enhancedContent, storyContext);
      
      await this.logger.success('CharacterDevelopmentSystem: 능동성 강화 완료');
      return enhancedContent;
      
    } catch (_error) {
      await this.logger.error('CharacterDevelopmentSystem: 능동성 강화 실패', { error: _error.message });
      return content;
    }
  }

  /**
   * 💬 대사 패턴 다양화
   */
  async diversifyDialogue(content, emotionalState = 'neutral') {
    await this.logger.info('CharacterDevelopmentSystem: 대사 다양화 시작');
    
    try {
      const _dialogues = this.extractDialogues(content);
      let enhancedContent = content;
      
      // 반복 표현 자동 탐지 및 대체
      enhancedContent = this.replaceRepetitiveExpressions(enhancedContent);
      
      // 감정별 말투 차별화
      enhancedContent = this.applyEmotionalSpeechPatterns(enhancedContent, emotionalState);
      
      // "차가운" 등 과다 반복 방지
      enhancedContent = this.reduceOverusedAdjectives(enhancedContent);
      
      await this.logger.success('CharacterDevelopmentSystem: 대사 다양화 완료');
      return enhancedContent;
      
    } catch (_error) {
      await this.logger.error('CharacterDevelopmentSystem: 대사 다양화 실패', { error: _error.message });
      return content;
    }
  }

  /**
   * 📈 캐릭터 성장 추적
   */
  trackCharacterGrowth(chapter, storyContext = {}) {
    const characterStates = {};
    
    // 스토리 컨텍스트에서 캐릭터 정보 추출
    if (storyContext && storyContext.characters) {
      for (const [charName, charInfo] of Object.entries(storyContext.characters)) {
        characterStates[charName] = this.analyzeIndividualGrowth(charName, chapter, charInfo);
      }
    }
    
    // 기본 주인공 분석 (명시적 캐릭터 정보가 없는 경우)
    if (Object.keys(characterStates).length === 0) {
      characterStates['주인공'] = this.detectGrowthFromContent(chapter.content);
    }
    
    // 전체 성장 진전률 계산
    const progressRates = Object.values(characterStates).map(state => state.progressRate);
    const averageProgress = progressRates.length > 0 ? 
      progressRates.reduce((sum, rate) => sum + rate, 0) / progressRates.length : 0;
    
    return {
      characterStates: characterStates,
      progressRate: averageProgress,
      currentStage: this.determineOverallGrowthStage(characterStates),
      recommendations: this.generateGrowthRecommendations(characterStates)
    };
  }

  /**
   * 🎭 능동성 측정
   */
  measureCharacterAgency(dialogues, actions) {
    if (dialogues.length === 0 && actions.length === 0) {
      return 0.0;
    }
    
    let activeCount = 0;
    let totalCount = 0;
    
    // 대사 능동성 분석
    for (const dialogue of dialogues) {
      totalCount++;
      
      // 능동적 표현 확인
      const hasActiveVerbs = this.agencyPatterns.activeVerbs.some(verb => 
        dialogue.text.includes(verb)
      );
      
      // 수동적 표현 확인
      const hasPassiveVerbs = this.agencyPatterns.passiveVerbs.some(verb => 
        dialogue.text.includes(verb)
      );
      
      // 의문문이나 명령문 (능동적 소통)
      const isActiveCommunication = /[?!]/.test(dialogue.text) || 
        /^(해봐|하자|가자|해보자)/.test(dialogue.text);
      
      if (hasActiveVerbs || isActiveCommunication || !hasPassiveVerbs) {
        activeCount++;
      }
    }
    
    // 행동 능동성 분석
    for (const action of actions) {
      totalCount++;
      
      const hasActiveAction = this.agencyPatterns.activeVerbs.some(verb => 
        action.includes(verb)
      );
      
      if (hasActiveAction) {
        activeCount++;
      }
    }
    
    return totalCount > 0 ? parseFloat((activeCount / totalCount).toFixed(3)) : 0.0;
  }

  /**
   * 🗣️ 말투 다양성 분석
   */
  analyzeSpeechDiversity(dialogues) {
    if (dialogues.length === 0) return 1.0;
    
    const speechPatterns = dialogues.map(d => d.text);
    const uniquePatterns = new Set();
    
    // 어미 패턴 추출
    for (const speech of speechPatterns) {
      const endings = speech.match(/[가-힣]+다|[가-힣]+요|[가-힣]+까|[가-힣]+지/g) || [];
      endings.forEach(ending => uniquePatterns.add(ending));
    }
    
    // 표현 패턴 추출
    const expressions = speechPatterns.join(' ').match(/[가-힣]{3,}/g) || [];
    const uniqueExpressions = new Set(expressions);
    
    // 다양성 점수 계산
    const endingDiversity = uniquePatterns.size / Math.max(1, speechPatterns.length);
    const expressionDiversity = uniqueExpressions.size / Math.max(1, expressions.length);
    
    return parseFloat(((endingDiversity + expressionDiversity) / 2).toFixed(3));
  }

  /**
   * 🎨 개성 강도 측정
   */
  measurePersonalityStrength(dialogues, actions) {
    let personalityScore = 0;
    const totalElements = dialogues.length + actions.length;
    
    if (totalElements === 0) return 0.0;
    
    // 개성적 어휘 사용 점수
    const personalityKeywords = [
      '특별한', '독특한', '고유한', '유일한', '독창적인',
      '개성있는', '특징적인', '차별화된', '독자적인'
    ];
    
    const allText = dialogues.map(d => d.text).join(' ') + ' ' + actions.join(' ');
    
    personalityKeywords.forEach(keyword => {
      const matches = (allText.match(new RegExp(keyword, 'g')) || []).length;
      personalityScore += matches * 0.5;
    });
    
    // 감정 표현 다양성 점수
    const emotionWords = [
      '기뻐', '슬퍼', '화나', '놀라', '걱정', '설레', '두려워', '감동'
    ];
    
    let emotionCount = 0;
    emotionWords.forEach(emotion => {
      if (allText.includes(emotion)) {
        emotionCount++;
      }
    });
    
    personalityScore += emotionCount * 0.3;
    
    // 고유한 말투 패턴 점수
    const uniquePhrases = this.detectUniquePhrases(dialogues);
    personalityScore += uniquePhrases.length * 0.4;
    
    // 10점 만점으로 정규화
    return parseFloat(Math.min(10, personalityScore).toFixed(1));
  }

  /**
   * 🔄 수동적 표현 → 능동적 표현 변환
   */
  convertPassiveToActiveSpeech(content) {
    let convertedContent = content;
    
    // 직접 매핑된 패턴 변환
    for (const [passive, active] of Object.entries(this.agencyPatterns.passiveToActive)) {
      const regex = new RegExp(passive.replace(/~/g, '[가-힣\\s]*'), 'g');
      convertedContent = convertedContent.replace(regex, active);
    }
    
    // 수동 구문 → 능동 구문 변환
    const passivePatterns = [
      { pattern: /([가-힣]+)에 의해 ([가-힣]+)되었다/g, replacement: '$1이 $2했다' },
      { pattern: /([가-힣]+)이 일어났다/g, replacement: '$1을 일으켰다' },
      { pattern: /([가-힣]+)을 당했다/g, replacement: '$1에 맞섰다' },
      { pattern: /어쩔 수 없이 ([가-힣]+)/g, replacement: '결단을 내려 $1' }
    ];
    
    for (const { pattern, replacement } of passivePatterns) {
      convertedContent = convertedContent.replace(pattern, replacement);
    }
    
    return convertedContent;
  }

  /**
   * 🎯 캐릭터 행동 강화
   */
  enhanceCharacterActions(content) {
    // 반응형 → 주도형 행동 변환
    const actionEnhancements = [
      { from: /가만히 지켜봤다/g, to: '적극적으로 개입했다' },
      { from: /받아들였다/g, to: '적극 수용했다' },
      { from: /따라갔다/g, to: '동행하기로 결정했다' },
      { from: /기다렸다/g, to: '기회를 만들었다' },
      { from: /피했다/g, to: '전략적으로 회피했다' }
    ];
    
    let enhancedContent = content;
    
    for (const { from, to } of actionEnhancements) {
      enhancedContent = enhancedContent.replace(from, to);
    }
    
    return enhancedContent;
  }

  /**
   * 🎭 캐릭터 개성 강화
   */
  strengthenCharacterPersonality(content, storyContext = {}) {
    // 캐릭터별 말투 패턴 적용
    let enhancedContent = content;
    
    // 대화 구간 식별 및 개성 적용
    const dialogueRegex = /"([^"]+)"/g;
    
    enhancedContent = enhancedContent.replace(dialogueRegex, (match, dialogue) => {
      // 감정 상태 추론
      const emotionalState = this.inferEmotionalState(dialogue);
      
      // 개성 있는 표현으로 변환
      const enhancedDialogue = this.applyPersonalityToDialogue(dialogue, emotionalState);
      
      return `"${enhancedDialogue}"`;
    });
    
    return enhancedContent;
  }

  /**
   * 🌱 성장 요소 삽입
   */
  injectGrowthElements(content, storyContext = {}) {
    const growthInserts = [
      '\n\n이 순간 그는 전과 다른 자신을 발견했다.',
      '\n\n그녀의 마음속에서 새로운 결의가 싹텄다.',
      '\n\n이제는 더 이상 예전의 자신이 아니었다.',
      '\n\n경험을 통해 한층 성숙해진 모습이었다.',
      '\n\n이 시련을 통해 더욱 강해질 수 있었다.'
    ];
    
    // 적절한 삽입 위치 찾기
    const insertPoint = Math.floor(content.length * 0.7); // 후반부
    const nearestParagraph = content.lastIndexOf('\n\n', insertPoint);
    
    if (nearestParagraph > 0) {
      const growthElement = growthInserts[Math.floor(Math.random() * growthInserts.length)];
      return content.slice(0, nearestParagraph) + growthElement + content.slice(nearestParagraph);
    }
    
    return content;
  }

  /**
   * 📱 유틸리티 메서드들
   */
  
  extractDialogues(content) {
    // 한국어 컨텐츠에서 사용되는 다양한 대화 패턴 지원
    const dialoguePatterns = [
      /"([^"]+)"/g,           // 영어 스타일 따옴표
      /'([^']+)'/g,           // 한국어 따옴표
      /「([^」]+)」/g,          // 일본식 따옴표
      /『([^』]+)』/g,          // 큰 따옴표
      /["""]([^"""]+)["""]/g,  // 유니코드 따옴표
      /^[\s]*-[\s]*([^.\n]+)[.\n]/gm,  // 대시 형태 대화
      /([가-힣]+이|[가-힣]+가|[가-힣]+은|[가-힣]+는)[\s]*["'"「『"""]([^"'"」』"""]+)["'"」』"""][\s]*(?:말했다|대답했다|물었다|외쳤다|속삭였다|답했다)/g  // 한국어 대화 패턴
    ];
    
    const dialogues = [];
    
    for (const pattern of dialoguePatterns) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(content)) !== null) {
        const dialogueText = match[1] || match[2]; // 두 번째 캡처 그룹도 고려
        if (dialogueText && dialogueText.trim().length > 0) {
          dialogues.push({
            text: dialogueText.trim(),
            position: match.index
          });
        }
      }
    }
    
    // 중복 제거 (같은 위치의 대화)
    const uniqueDialogues = [];
    const seenPositions = new Set();
    
    for (const dialogue of dialogues) {
      if (!seenPositions.has(dialogue.position)) {
        uniqueDialogues.push(dialogue);
        seenPositions.add(dialogue.position);
      }
    }
    
    return uniqueDialogues;
  }
  
  extractActions(content) {
    // 행동을 나타내는 다양한 한국어 패턴 추출
    const actionPatterns = [
      // 기본 동사 패턴 (과거형)
      /[가-힣]+했다[\.!\?]?/g,
      /[가-힣]+였다[\.!\?]?/g,
      /[가-힣]+았다[\.!\?]?/g,
      /[가-힣]+었다[\.!\?]?/g,
      /[가-힣]+ㅆ다[\.!\?]?/g,
      
      // 현재/진행형 패턴
      /[가-힣]+하고 있다[\.!\?]?/g,
      /[가-힣]+고 있었다[\.!\?]?/g,
      /[가-힣]+한다[\.!\?]?/g,
      /[가-힣]+는다[\.!\?]?/g,
      
      // 의지/미래형 패턴  
      /[가-힣]+하겠다[\.!\?]?/g,
      /[가-힣]+할 것이다[\.!\?]?/g,
      /[가-힣]+하리라[\.!\?]?/g,
      
      // 행동 서술 패턴
      /[가-힣]+을 향해 [가-힣]+했다[\.!\?]?/g,
      /[가-힣]+에게 [가-힣]+했다[\.!\?]?/g,
      /[가-힣]+로 [가-힣]+했다[\.!\?]?/g,
      /[가-힣]+을 [가-힣]+했다[\.!\?]?/g,
      /[가-힣]+를 [가-힣]+했다[\.!\?]?/g,
      
      // 감정/상태 변화 패턴
      /[가-힣]+해졌다[\.!\?]?/g,
      /[가-힣]+이 되었다[\.!\?]?/g,
      /[가-힣]+가 되었다[\.!\?]?/g,
      
      // 움직임/이동 패턴
      /[가-힣]+으로 갔다[\.!\?]?/g,
      /[가-힣]+에서 왔다[\.!\?]?/g,
      /[가-힣]+을 향해 움직였다[\.!\?]?/g,
      
      // 대화 행동 패턴
      /[가-힣]+라고 말했다[\.!\?]?/g,
      /[가-힣]+라고 대답했다[\.!\?]?/g,
      /[가-힣]+라고 물었다[\.!\?]?/g,
      /[가-힣]+라고 외쳤다[\.!\?]?/g,
      
      // 감각 행동 패턴
      /[가-힣]+을 보았다[\.!\?]?/g,
      /[가-힣]+를 보았다[\.!\?]?/g,
      /[가-힣]+을 들었다[\.!\?]?/g,
      /[가-힣]+를 들었다[\.!\?]?/g,
      /[가-힣]+을 느꼈다[\.!\?]?/g,
      /[가-힣]+를 느꼈다[\.!\?]?/g,
      
      // 신체 행동 패턴
      /손을 [가-힣]+했다[\.!\?]?/g,
      /발을 [가-힣]+했다[\.!\?]?/g,
      /머리를 [가-힣]+했다[\.!\?]?/g,
      /눈을 [가-힣]+했다[\.!\?]?/g,
      /입을 [가-힣]+했다[\.!\?]?/g
    ];
    
    const actions = [];
    
    for (const pattern of actionPatterns) {
      const matches = content.match(pattern) || [];
      actions.push(...matches.map(match => match.replace(/[\.!\?]$/, ''))); // 구두점 제거
    }
    
    // 중복 제거 및 정리
    const uniqueActions = [...new Set(actions)];
    
    // 너무 짧거나 의미없는 행동 제거
    return uniqueActions.filter(action => 
      action.length >= 3 && 
      !action.match(/^[가-힣]{1,2}다$/) // "했다", "였다" 같은 단순한 것 제거
    );
  }
  
  analyzeIndividualGrowth(charName, chapter, charInfo) {
    // 개별 캐릭터 성장 분석 로직
    const content = chapter.content || '';
    const currentStage = charInfo.currentStage || 1;
    
    // 성장 지표 확인
    const growthIndicators = this.growthStages[currentStage - 1]?.indicators || [];
    let indicatorCount = 0;
    
    for (const indicator of growthIndicators) {
      if (content.includes(indicator)) {
        indicatorCount++;
      }
    }
    
    const progressRate = indicatorCount / Math.max(1, growthIndicators.length);
    
    return {
      currentStage: currentStage,
      progressRate: progressRate,
      nextStageReady: progressRate >= 0.7
    };
  }
  
  detectGrowthFromContent(content) {
    // 컨텐츠에서 성장 단계 추론
    const stageKeywords = {
      1: ['처음', '시작', '등장', '기본'],
      2: ['문제', '갈등', '고민', '의문'],
      3: ['시련', '어려움', '실패', '좌절'],
      4: ['결단', '선택', '결정', '용기'],
      5: ['성취', '완성', '목표', '실현']
    };
    
    let detectedStage = 1;
    let maxScore = 0;
    
    for (const [stage, keywords] of Object.entries(stageKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        score += (content.match(new RegExp(keyword, 'g')) || []).length;
      }
      
      if (score > maxScore) {
        maxScore = score;
        detectedStage = parseInt(stage);
      }
    }
    
    return {
      currentStage: detectedStage,
      progressRate: Math.min(1.0, maxScore / 10),
      nextStageReady: maxScore >= 7
    };
  }
  
  determineOverallGrowthStage(characterStates) {
    const stages = Object.values(characterStates).map(state => state.currentStage);
    if (stages.length === 0) return 1;
    
    // 가장 진전된 단계 반환
    return Math.max(...stages);
  }
  
  generateGrowthRecommendations(characterStates) {
    const recommendations = [];
    
    for (const [charName, state] of Object.entries(characterStates)) {
      if (state.progressRate < 0.3) {
        recommendations.push(`${charName}의 성장 요소를 더 추가하세요.`);
      }
      
      if (state.nextStageReady) {
        recommendations.push(`${charName}은 다음 성장 단계로 진전시킬 때입니다.`);
      }
    }
    
    return recommendations;
  }
  
  replaceRepetitiveExpressions(content) {
    // 자주 반복되는 표현 대체
    const repetitiveExpressions = {
      '차가운': ['냉정한', '냉담한', '서늘한', '쌀쌀한', '얼음같은'],
      '따뜻한': ['온화한', '포근한', '다정한', '부드러운', '친근한'],
      '아름다운': ['매혹적인', '우아한', '고운', '빼어난', '눈부신'],
      '강한': ['힘센', '튼튼한', '견고한', '굳건한', '단단한']
    };
    
    let improvedContent = content;
    
    for (const [repetitive, alternatives] of Object.entries(repetitiveExpressions)) {
      const regex = new RegExp(repetitive, 'g');
      const matches = content.match(regex) || [];
      
      if (matches.length > 2) { // 3회 이상 반복 시
        let replacementIndex = 0;
        improvedContent = improvedContent.replace(regex, () => {
          const replacement = alternatives[replacementIndex % alternatives.length];
          replacementIndex++;
          return replacement;
        });
      }
    }
    
    return improvedContent;
  }
  
  applyEmotionalSpeechPatterns(content, emotionalState) {
    if (!this.speechPatterns._emotionalStates[emotionalState]) {
      return content;
    }
    
    const patterns = this.speechPatterns._emotionalStates[emotionalState];
    const dialogueRegex = /"([^"]+)"/g;
    
    return content.replace(dialogueRegex, (match, dialogue) => {
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      return `"${dialogue}" ${pattern} 말했다.`;
    });
  }
  
  reduceOverusedAdjectives(content) {
    // 과다 사용된 형용사 탐지 및 감소
    const adjectives = content.match(/[가-힣]+한|[가-힣]+운|[가-힣]+은/g) || [];
    const adjectiveCount = {};
    
    adjectives.forEach(adj => {
      adjectiveCount[adj] = (adjectiveCount[adj] || 0) + 1;
    });
    
    // 5회 이상 사용된 형용사 대체
    let improvedContent = content;
    
    for (const [adjective, count] of Object.entries(adjectiveCount)) {
      if (count >= 5) {
        const regex = new RegExp(adjective, 'g');
        let replacementCount = 0;
        
        improvedContent = improvedContent.replace(regex, (match) => {
          replacementCount++;
          if (replacementCount > 2) {
            return this.findAdjectiveSynonym(adjective);
          }
          return match;
        });
      }
    }
    
    return improvedContent;
  }
  
  findAdjectiveSynonym(adjective) {
    const synonymMap = {
      '차가운': '냉정한',
      '따뜻한': '온화한',
      '아름다운': '우아한',
      '강한': '튼튼한',
      '작은': '소중한',
      '큰': '거대한'
    };
    
    return synonymMap[adjective] || adjective;
  }
  
  inferEmotionalState(dialogue) {
    const emotionalCues = {
      angry: ['화나', '분노', '짜증', '열받'],
      sad: ['슬프', '우울', '눈물', '서글'],
      happy: ['기쁘', '행복', '즐거', '웃음'],
      surprised: ['놀라', '깜짝', '어머', '헉'],
      worried: ['걱정', '불안', '초조', '애타']
    };
    
    for (const [emotion, cues] of Object.entries(emotionalCues)) {
      if (cues.some(cue => dialogue.includes(cue))) {
        return emotion;
      }
    }
    
    return 'neutral';
  }
  
  applyPersonalityToDialogue(dialogue, emotionalState) {
    // 기본 개성 패턴 적용
    const personalityTypes = Object.keys(this.speechPatterns.personalities);
    const randomPersonality = personalityTypes[Math.floor(Math.random() * personalityTypes.length)];
    const personality = this.speechPatterns.personalities[randomPersonality];
    
    // 어미 스타일 적용
    const endingStyle = personality.endingStyles[Math.floor(Math.random() * personality.endingStyles.length)];
    
    // 기존 어미를 새 스타일로 교체
    const enhancedDialogue = dialogue.replace(/다$|요$|야$|지$/, endingStyle);
    
    return enhancedDialogue;
  }
  
  detectUniquePhrases(dialogues) {
    const phrases = [];
    
    for (const dialogue of dialogues) {
      // 3글자 이상의 특징적 구문 추출
      const uniquePhrases = dialogue.text.match(/[가-힣]{3,}/g) || [];
      phrases.push(...uniquePhrases);
    }
    
    // 빈도가 낮은 (1-2회) 구문을 고유한 것으로 판단
    const phraseCount = {};
    phrases.forEach(phrase => {
      phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
    });
    
    return Object.entries(phraseCount)
      .filter(([phrase, count]) => count <= 2 && phrase.length >= 3)
      .map(([phrase]) => phrase);
  }
  
  calculateCharacterScore(agencyScore, speechDiversityScore, personalityScore, growthProgress) {
    // 가중치 적용 점수 계산
    const agencyWeight = 0.30;
    const speechWeight = 0.25;
    const personalityWeight = 0.25;
    const growthWeight = 0.20;
    
    const adjustedAgencyScore = agencyScore * 10;
    const adjustedSpeechScore = speechDiversityScore * 10;
    const adjustedPersonalityScore = personalityScore; // 이미 0-10 범위
    const adjustedGrowthScore = growthProgress * 10;
    
    const overallScore = 
      (adjustedAgencyScore * agencyWeight) +
      (adjustedSpeechScore * speechWeight) +
      (adjustedPersonalityScore * personalityWeight) +
      (adjustedGrowthScore * growthWeight);
    
    return parseFloat(Math.max(0, Math.min(10, overallScore)).toFixed(1));
  }

  /**
   * 📊 캐릭터 발전 리포트 생성
   */
  generateCharacterReport(analysis) {
    return {
      summary: `캐릭터 능동성 ${(analysis.agencyScore * 100).toFixed(1)}%, 개성 점수 ${analysis.personalityScore}/10`,
      
      agencyStatus: analysis.agencyScore >= this.thresholds.minAgencyRate ? 'PASS' : 'FAIL',
      speechStatus: analysis.speechDiversityScore >= (1 - this.thresholds.maxRepetitionRate) ? 'PASS' : 'FAIL',
      personalityStatus: analysis.personalityScore >= this.thresholds.minPersonalityScore ? 'PASS' : 'FAIL',
      growthStatus: analysis.growthProgress >= this.thresholds.minGrowthProgress ? 'PASS' : 'FAIL',
      
      overallStatus: analysis.overallQualityScore >= 7.0 ? 'HIGH_QUALITY' : 'NEEDS_IMPROVEMENT',
      
      recommendations: this.generateCharacterRecommendations(analysis),
      
      metrics: {
        agencyScore: analysis.agencyScore,
        speechDiversityScore: analysis.speechDiversityScore,
        personalityScore: analysis.personalityScore,
        growthProgress: analysis.growthProgress,
        overallQualityScore: analysis.overallQualityScore
      }
    };
  }

  /**
   * 💡 캐릭터 개선 권장사항 생성
   */
  generateCharacterRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.agencyScore < this.thresholds.minAgencyRate) {
      recommendations.push('캐릭터의 능동성을 높이세요. 수동적 표현을 능동적으로 바꿔보세요.');
    }
    
    if (analysis.speechDiversityScore < (1 - this.thresholds.maxRepetitionRate)) {
      recommendations.push('대사 패턴을 다양화하세요. 반복되는 표현을 줄여보세요.');
    }
    
    if (analysis.personalityScore < this.thresholds.minPersonalityScore) {
      recommendations.push('캐릭터의 개성을 더 강화하세요. 고유한 말투나 행동을 추가해보세요.');
    }
    
    if (analysis.growthProgress < this.thresholds.minGrowthProgress) {
      recommendations.push('캐릭터의 성장 요소를 추가하세요. 변화와 발전을 보여주세요.');
    }
    
    return recommendations;
  }
}