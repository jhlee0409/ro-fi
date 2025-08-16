/**
 * ✍️ Literary Excellence Engine - 문체 혁신 시스템
 * 
 * GENESIS AI 설계 기반 문학적 품질 향상 시스템
 * - 어휘 다양성 강화 (중학생 → 대학 수준)
 * - 5감 활용 감정 묘사 강화
 * - 은유/비유 자동 삽입
 * - 문장 리듬 최적화 (완급 조절)
 */

export class LiteraryExcellenceEngine {
  constructor(logger) {
    this.logger = logger;
    
    // 고급 어휘 데이터베이스
    this.vocabularyDatabase = {
      // 기본 어휘 → 고급 어휘 매핑
      basicToAdvanced: {
        // 감정 표현
        '기쁘다': ['환희에 차다', '황홀하다', '희열을 느끼다', '의기양양하다'],
        '슬프다': ['비탄에 잠기다', '애수에 젖다', '참담하다', '비감하다'],
        '화나다': ['분개하다', '격분하다', '의분을 느끼다', '격노하다'],
        '놀라다': ['경악하다', '아연실색하다', '경도하다', '기절초풍하다'],
        '무섭다': ['전율하다', '소름이 끼치다', '간담이 서늘하다', '오금이 저리다'],
        
        // 외모 묘사
        '예쁘다': ['아름답다', '우아하다', '빼어나다', '절세가인이다'],
        '잘생겼다': ['준수하다', '수려하다', '빼어나다', '풍채가 좋다'],
        
        // 행동 표현
        '보다': ['응시하다', '주시하다', '바라보다', '굽어보다'],
        '듣다': ['귀 기울이다', '청취하다', '들어주다', '경청하다'],
        '만지다': ['어루만지다', '쓰다듬다', '애무하다', '어르주다'],
        
        // 상태 표현
        '좋다': ['훌륭하다', '탁월하다', '뛰어나다', '수준급이다'],
        '나쁘다': ['열악하다', '불량하다', '저급하다', '조악하다']
      },
      
      // 감정별 고급 어휘
      emotionalVocabulary: {
        love: {
          nouns: ['애정', '연모', '숭모', '흠모', '정념', '연정'],
          verbs: ['사랑하다', '연모하다', '흠모하다', '애틋해하다', '그리워하다'],
          adjectives: ['애틋한', '간절한', '절절한', '애달픈', '그리운']
        },
        tension: {
          nouns: ['긴장감', '팽팽함', '경계심', '경직', '긴박감'],
          verbs: ['긴장하다', '경계하다', '주시하다', '경직되다'],
          adjectives: ['팽팽한', '경직된', '긴박한', '날카로운', '예민한']
        },
        mystery: {
          nouns: ['신비', '수수께끼', '비밀', '은밀함', '오묘함'],
          verbs: ['감추다', '숨기다', '은폐하다', '비밀에 싸이다'],
          adjectives: ['신비로운', '오묘한', '은밀한', '베일에 싸인', '모호한']
        }
      }
    };
    
    // 5감 묘사 패턴
    this.sensoryPatterns = {
      sight: {
        colors: ['황금빛', '은빛', '청명한', '짙푸른', '새하얀', '칠흑같은'],
        light: ['눈부신', '은은한', '찬란한', '부드러운', '강렬한', '희미한'],
        movement: ['흘러가는', '춤추는', '떨리는', '흔들리는', '번뜩이는']
      },
      sound: {
        soft: ['속삭이는', '감미로운', '부드러운', '나긋나긋한', '윤기 있는'],
        loud: ['우렁찬', '웅장한', '울려퍼지는', '쟁쟁한', '요란한'],
        nature: ['새소리', '바람소리', '물소리', '잎사귀 스치는 소리']
      },
      touch: {
        texture: ['비단같은', '벨벳같은', '거친', '부드러운', '매끄러운'],
        temperature: ['따스한', '차가운', '뜨거운', '서늘한', '미지근한'],
        sensation: ['짜릿한', '따끔한', '간지러운', '아릿한', '찌릿한']
      },
      smell: {
        pleasant: ['향기로운', '달콤한', '상쾌한', '은은한', '그윽한'],
        nature: ['꽃향기', '풀냄새', '바다냄새', '흙냄새', '나무냄새']
      },
      taste: {
        sweet: ['달콤한', '감미로운', '꿀같은', '설탕같은'],
        bitter: ['씁쓸한', '쌉쌀한', '떫은', '밍밍한']
      }
    };
    
    // 은유/비유 패턴
    this.metaphorPatterns = {
      // 자연 은유
      nature: [
        '꽃처럼 피어나는', '바람처럼 스치는', '물처럼 흘러가는',
        '별처럼 빛나는', '달처럼 둥근', '구름처럼 부드러운'
      ],
      
      // 보석/금속 은유
      precious: [
        '다이아몬드처럼 빛나는', '진주처럼 윤기나는', '황금처럼 귀한',
        '은처럼 차가운', '수정처럼 맑은', '루비처럼 붉은'
      ],
      
      // 음악 은유
      music: [
        '멜로디처럼 흘러가는', '화음처럼 어우러지는', '리듬처럼 규칙적인',
        '심포니처럼 웅장한', '자장가처럼 포근한'
      ]
    };
    
    // 문장 리듬 패턴
    this.rhythmPatterns = {
      short: 2,    // 짧은 문장 (2-8 어절)
      medium: 5,   // 중간 문장 (9-15 어절)
      long: 8      // 긴 문장 (16+ 어절)
    };
    
    // 품질 임계값
    this.thresholds = {
      minVocabularyLevel: 7.0,      // 최소 7.0 어휘 수준
      minSensoryRichness: 0.30,     // 최소 30% 감각적 묘사
      minMetaphorDensity: 0.10,     // 최소 10% 은유/비유
      optimalRhythmVariance: 0.20,  // 최적 20% 리듬 변화
      maxRepetitionRate: 0.15       // 최대 15% 어휘 반복
    };
  }

  /**
   * ✍️ 문체 품질 종합 분석
   */
  async analyzeLiteraryQuality(content) {
    await this.logger.info('LiteraryExcellenceEngine: 문체 품질 분석 시작');
    
    try {
      // 1. 어휘 수준 분석
      const vocabularyLevel = this.analyzeVocabularyLevel(content);
      
      // 2. 감각적 묘사 밀도 측정
      const sensoryRichness = this.measureSensoryRichness(content);
      
      // 3. 은유/비유 밀도 계산
      const metaphorDensity = this.calculateMetaphorDensity(content);
      
      // 4. 문장 리듬 분석
      const rhythmAnalysis = this.analyzeRhythm(content);
      
      // 5. 어휘 다양성 측정
      const vocabularyDiversity = this.measureVocabularyDiversity(content);
      
      // 6. 종합 분석 결과
      const analysis = {
        vocabularyLevel: vocabularyLevel,
        sensoryRichness: sensoryRichness,
        metaphorDensity: metaphorDensity,
        rhythmVariance: rhythmAnalysis.variance,
        vocabularyDiversity: vocabularyDiversity,
        
        // 품질 지표
        meetsVocabularyThreshold: vocabularyLevel >= this.thresholds.minVocabularyLevel,
        sufficientSensoryRichness: sensoryRichness >= this.thresholds.minSensoryRichness,
        adequateMetaphors: metaphorDensity >= this.thresholds.minMetaphorDensity,
        goodRhythm: rhythmAnalysis.variance >= this.thresholds.optimalRhythmVariance,
        acceptableDiversity: vocabularyDiversity >= (1 - this.thresholds.maxRepetitionRate),
        
        // 상세 분석
        sentenceCount: rhythmAnalysis.sentenceCount,
        averageWordsPerSentence: rhythmAnalysis.averageLength,
        sensoryElements: this.countSensoryElements(content),
        metaphorCount: this.countMetaphors(content),
        
        // 종합 품질 점수 (0-10)
        overallQualityScore: this.calculateLiteraryScore(
          vocabularyLevel, sensoryRichness, metaphorDensity, 
          rhythmAnalysis.variance, vocabularyDiversity
        )
      };
      
      await this.logger.info('LiteraryExcellenceEngine: 분석 완료', analysis);
      return analysis;
      
    } catch (error) {
      await this.logger.error('LiteraryExcellenceEngine: 분석 실패', { error: error.message });
      throw error;
    }
  }

  /**
   * 📚 어휘 다양성 강화
   */
  async enhanceVocabularyDiversity(content) {
    await this.logger.info('LiteraryExcellenceEngine: 어휘 다양성 강화 시작');
    
    try {
      let enhancedContent = content;
      
      // 1. 기본 어휘 → 고급 어휘 변환
      enhancedContent = this.upgradeBasicVocabulary(enhancedContent);
      
      // 2. 반복 어휘 자동 대체
      enhancedContent = this.replaceRepeatedWords(enhancedContent);
      
      // 3. 문맥별 어휘 선택 최적화
      enhancedContent = this.optimizeContextualVocabulary(enhancedContent);
      
      await this.logger.success('LiteraryExcellenceEngine: 어휘 다양성 강화 완료');
      return enhancedContent;
      
    } catch (error) {
      await this.logger.error('LiteraryExcellenceEngine: 어휘 강화 실패', { error: error.message });
      return content;
    }
  }

  /**
   * 🌟 감정 묘사 강화
   */
  async enhanceEmotionalDescription(content, emotionalContext = 'romantic') {
    await this.logger.info('LiteraryExcellenceEngine: 감정 묘사 강화 시작');
    
    try {
      let enhancedContent = content;
      
      // 1. 5감 활용 묘사 자동 생성
      enhancedContent = this.injectSensoryDescriptions(enhancedContent);
      
      // 2. 은유/비유 자동 삽입
      enhancedContent = this.insertMetaphors(enhancedContent, emotionalContext);
      
      // 3. 감정의 층차 구현
      enhancedContent = this.addEmotionalLayers(enhancedContent);
      
      // 4. 심리적 묘사 강화
      enhancedContent = this.enhancePsychologicalDescription(enhancedContent);
      
      await this.logger.success('LiteraryExcellenceEngine: 감정 묘사 강화 완료');
      return enhancedContent;
      
    } catch (error) {
      await this.logger.error('LiteraryExcellenceEngine: 감정 묘사 강화 실패', { error: error.message });
      return content;
    }
  }

  /**
   * 🎵 문장 리듬 최적화
   */
  async optimizeProse(content) {
    await this.logger.info('LiteraryExcellenceEngine: 문장 리듬 최적화 시작');
    
    try {
      let optimizedContent = content;
      
      // 1. 문장 길이 변화 분석 및 조정
      optimizedContent = this.adjustSentenceLength(optimizedContent);
      
      // 2. 완급 조절 최적화
      optimizedContent = this.optimizeRhythm(optimizedContent);
      
      // 3. 호흡감 있는 문체 구현
      optimizedContent = this.createNaturalFlow(optimizedContent);
      
      await this.logger.success('LiteraryExcellenceEngine: 문장 리듬 최적화 완료');
      return optimizedContent;
      
    } catch (error) {
      await this.logger.error('LiteraryExcellenceEngine: 리듬 최적화 실패', { error: error.message });
      return content;
    }
  }

  /**
   * 📊 어휘 수준 분석
   */
  analyzeVocabularyLevel(content) {
    if (!content) return 0.0;
    
    const words = content.match(/[가-힣]+/g) || [];
    let advancedWordCount = 0;
    
    // 고급 어휘 비율 계산
    const allAdvancedWords = Object.values(this.vocabularyDatabase.basicToAdvanced).flat();
    const emotionalWords = Object.values(this.vocabularyDatabase.emotionalVocabulary)
      .map(category => [...category.nouns, ...category.verbs, ...category.adjectives])
      .flat();
    
    const advancedVocabulary = [...allAdvancedWords, ...emotionalWords];
    
    for (const word of words) {
      if (advancedVocabulary.some(advWord => content.includes(advWord))) {
        advancedWordCount++;
      }
    }
    
    // 한자어, 전문용어 비율도 고려
    const chineseCharacterWords = words.filter(word => 
      /[一-龯]/.test(word) || word.length >= 4
    ).length;
    
    const totalAdvancedScore = (advancedWordCount + chineseCharacterWords * 0.5) / Math.max(1, words.length);
    
    // 0-10 점수로 변환
    return parseFloat(Math.min(10, totalAdvancedScore * 20).toFixed(1));
  }

  /**
   * 🌈 감각적 묘사 밀도 측정
   */
  measureSensoryRichness(content) {
    if (!content) return 0.0;
    
    let sensoryCount = 0;
    const totalSentences = content.split(/[.!?]/).length;
    
    // 5감별 요소 카운트
    for (const [sense, patterns] of Object.entries(this.sensoryPatterns)) {
      for (const [category, words] of Object.entries(patterns)) {
        for (const word of words) {
          sensoryCount += (content.match(new RegExp(word, 'g')) || []).length;
        }
      }
    }
    
    // 감각 동사/형용사 추가 카운트
    const sensoryVerbs = ['보다', '듣다', '냄새나다', '맛보다', '만지다', '느끼다'];
    for (const verb of sensoryVerbs) {
      sensoryCount += (content.match(new RegExp(verb, 'g')) || []).length;
    }
    
    return parseFloat(Math.min(1.0, sensoryCount / Math.max(1, totalSentences)).toFixed(3));
  }

  /**
   * 🎭 은유/비유 밀도 계산
   */
  calculateMetaphorDensity(content) {
    if (!content) return 0.0;
    
    let metaphorCount = 0;
    const totalWords = (content.match(/[가-힣]+/g) || []).length;
    
    // 직접적 비유 표현
    const directMetaphors = ['처럼', '같은', '마치', '마치도', '흡사', '비슷한'];
    for (const metaphor of directMetaphors) {
      metaphorCount += (content.match(new RegExp(metaphor, 'g')) || []).length;
    }
    
    // 패턴 기반 은유
    for (const [category, patterns] of Object.entries(this.metaphorPatterns)) {
      for (const pattern of patterns) {
        metaphorCount += (content.match(new RegExp(pattern, 'g')) || []).length;
      }
    }
    
    return parseFloat(Math.min(1.0, metaphorCount / Math.max(1, totalWords / 100)).toFixed(3));
  }

  /**
   * 🎵 문장 리듬 분석
   */
  analyzeRhythm(content) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      return { variance: 0, averageLength: 0, sentenceCount: 0 };
    }
    
    // 각 문장의 어절 수 계산
    const wordCounts = sentences.map(sentence => 
      (sentence.trim().match(/[가-힣]+/g) || []).length
    );
    
    // 평균과 분산 계산
    const average = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
    const variance = Math.sqrt(
      wordCounts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / wordCounts.length
    ) / average;
    
    return {
      variance: parseFloat(Math.min(1.0, variance).toFixed(3)),
      averageLength: parseFloat(average.toFixed(1)),
      sentenceCount: sentences.length,
      distribution: this.analyzeSentenceLengthDistribution(wordCounts)
    };
  }

  /**
   * 🔤 어휘 다양성 측정
   */
  measureVocabularyDiversity(content) {
    if (!content) return 0.0;
    
    const words = content.match(/[가-힣]{2,}/g) || [];
    const uniqueWords = new Set(words);
    
    // 조사, 어미 제외한 실질적 어휘만 계산
    const contentWords = Array.from(uniqueWords).filter(word => 
      word.length >= 2 && 
      !['그런데', '하지만', '그리고', '또한'].includes(word)
    );
    
    const diversityRatio = contentWords.length / Math.max(1, words.length);
    
    return parseFloat(Math.min(1.0, diversityRatio * 2).toFixed(3));
  }

  /**
   * 📈 기본 어휘 → 고급 어휘 변환
   */
  upgradeBasicVocabulary(content) {
    let upgradedContent = content;
    
    for (const [basic, advanced] of Object.entries(this.vocabularyDatabase.basicToAdvanced)) {
      const regex = new RegExp(basic, 'g');
      const matches = content.match(regex) || [];
      
      if (matches.length > 0) {
        // 무작위로 고급 어휘 선택
        const selectedAdvanced = advanced[Math.floor(Math.random() * advanced.length)];
        
        // 첫 번째 발생만 교체 (과도한 변경 방지)
        upgradedContent = upgradedContent.replace(regex, selectedAdvanced);
      }
    }
    
    return upgradedContent;
  }

  /**
   * 🔄 반복 어휘 자동 대체
   */
  replaceRepeatedWords(content) {
    const words = content.match(/[가-힣]{2,}/g) || [];
    const wordFreq = {};
    
    // 빈도 계산
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    let improvedContent = content;
    
    // 3회 이상 반복된 단어 대체
    for (const [word, freq] of Object.entries(wordFreq)) {
      if (freq >= 3) {
        const synonyms = this.findSynonyms(word);
        if (synonyms.length > 0) {
          const regex = new RegExp(word, 'g');
          let replacementIndex = 0;
          
          improvedContent = improvedContent.replace(regex, () => {
            if (replacementIndex === 0) {
              replacementIndex++;
              return word; // 첫 번째는 원본 유지
            }
            const synonym = synonyms[(replacementIndex - 1) % synonyms.length];
            replacementIndex++;
            return synonym;
          });
        }
      }
    }
    
    return improvedContent;
  }

  /**
   * 🎨 5감 묘사 자동 삽입
   */
  injectSensoryDescriptions(content) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    if (sentences.length < 3) return content;
    
    // 감정이 드러나는 문장 찾기
    const emotionalSentences = sentences.filter(sentence => 
      /기쁘|슬프|화나|놀라|무서|사랑|그리|설레/.test(sentence)
    );
    
    if (emotionalSentences.length === 0) return content;
    
    // 무작위로 감각 묘사 추가
    let enhancedContent = content;
    const targetSentence = emotionalSentences[0];
    
    // 시각적 묘사 추가
    const visualDescription = this.generateVisualDescription();
    const enhancedSentence = targetSentence + ` ${visualDescription}`;
    
    enhancedContent = enhancedContent.replace(targetSentence, enhancedSentence);
    
    return enhancedContent;
  }

  /**
   * 🌟 은유/비유 자동 삽입
   */
  insertMetaphors(content, emotionalContext) {
    const metaphorCategories = Object.keys(this.metaphorPatterns);
    const selectedCategory = metaphorCategories[Math.floor(Math.random() * metaphorCategories.length)];
    const metaphors = this.metaphorPatterns[selectedCategory];
    
    const selectedMetaphor = metaphors[Math.floor(Math.random() * metaphors.length)];
    
    // 적절한 삽입 위치 찾기 (감정 표현 근처)
    const emotionalRegex = /기쁘|슬프|화나|사랑|그리|설레/;
    const match = content.match(emotionalRegex);
    
    if (match) {
      const insertPosition = match.index + match[0].length;
      const metaphorText = `, ${selectedMetaphor} 마음으로,`;
      
      return content.slice(0, insertPosition) + metaphorText + content.slice(insertPosition);
    }
    
    return content;
  }

  /**
   * 💭 감정의 층차 구현
   */
  addEmotionalLayers(content) {
    // 기본 감정 표현을 더 복합적으로 만들기
    const emotionalLayers = {
      '기뻤다': '기쁨과 동시에 약간의 불안도 스며들었다',
      '슬펐다': '슬픔 속에서도 희미한 위안을 찾고 있었다',
      '화났다': '분노 뒤에 숨겨진 상처가 더욱 깊었다',
      '놀랐다': '놀라움과 함께 묘한 기대감이 피어났다'
    };
    
    let layeredContent = content;
    
    for (const [simple, complex] of Object.entries(emotionalLayers)) {
      layeredContent = layeredContent.replace(new RegExp(simple, 'g'), complex);
    }
    
    return layeredContent;
  }

  /**
   * 🧠 심리적 묘사 강화
   */
  enhancePsychologicalDescription(content) {
    // 내적 독백 강화
    const psychologicalInserts = [
      '\n\n마음 한구석에서는 다른 생각이 스멀스멀 피어올랐다.',
      '\n\n이상하게도 가슴 깊은 곳에서 알 수 없는 감정이 꿈틀거렸다.',
      '\n\n머릿속으로는 수백 가지 생각이 빠르게 스쳐 지나갔다.',
      '\n\n마음과 이성 사이에서 치열한 갈등이 벌어지고 있었다.'
    ];
    
    // 감정 표현이 있는 부분 근처에 삽입
    const emotionalMatch = content.match(/기쁘|슬프|화나|사랑|그리|설레/);
    
    if (emotionalMatch) {
      const insertPoint = emotionalMatch.index + emotionalMatch[0].length;
      const nearestPeriod = content.indexOf('.', insertPoint);
      
      if (nearestPeriod > 0) {
        const psychInsert = psychologicalInserts[Math.floor(Math.random() * psychologicalInserts.length)];
        return content.slice(0, nearestPeriod + 1) + psychInsert + content.slice(nearestPeriod + 1);
      }
    }
    
    return content;
  }

  /**
   * 📏 문장 길이 조정
   */
  adjustSentenceLength(content) {
    const sentences = content.split(/([.!?])/).filter(s => s.trim().length > 0);
    const adjustedSentences = [];
    
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i];
      const punctuation = sentences[i + 1] || '.';
      
      if (!sentence) continue;
      
      const wordCount = (sentence.match(/[가-힣]+/g) || []).length;
      
      // 너무 긴 문장 분할
      if (wordCount > 20) {
        const midPoint = Math.floor(sentence.length / 2);
        const splitPoint = sentence.lastIndexOf(',', midPoint) || sentence.lastIndexOf(' ', midPoint);
        
        if (splitPoint > 0) {
          adjustedSentences.push(sentence.slice(0, splitPoint));
          adjustedSentences.push('.');
          adjustedSentences.push(sentence.slice(splitPoint + 1));
          adjustedSentences.push(punctuation);
        } else {
          adjustedSentences.push(sentence);
          adjustedSentences.push(punctuation);
        }
      }
      // 너무 짧은 문장 결합 고려
      else if (wordCount < 3 && i + 2 < sentences.length) {
        const nextSentence = sentences[i + 2];
        const nextPunctuation = sentences[i + 3] || '.';
        
        adjustedSentences.push(sentence + ', ' + nextSentence);
        adjustedSentences.push(nextPunctuation);
        i += 2; // 다음 문장 건너뛰기
      } else {
        adjustedSentences.push(sentence);
        adjustedSentences.push(punctuation);
      }
    }
    
    return adjustedSentences.join('');
  }

  /**
   * 🎵 리듬 최적화
   */
  optimizeRhythm(content) {
    // 연속된 긴 문장이나 짧은 문장을 조정
    let optimizedContent = content;
    
    // 연속된 짧은 문장 패턴 탐지 및 조정
    const shortSentencePattern = /([^.!?]{1,20}[.!?])\s*([^.!?]{1,20}[.!?])\s*([^.!?]{1,20}[.!?])/g;
    
    optimizedContent = optimizedContent.replace(shortSentencePattern, (match, s1, s2, s3) => {
      // 첫 번째와 두 번째 문장을 결합하고 세 번째는 독립적으로 유지
      const combined = s1.replace(/[.!?]$/, '') + ', ' + s2.replace(/^[^가-힣]*/, '');
      return combined + ' ' + s3;
    });
    
    return optimizedContent;
  }

  /**
   * 🌊 자연스러운 흐름 생성
   */
  createNaturalFlow(content) {
    // 문단 간 연결을 부드럽게 만들기
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    if (paragraphs.length < 2) return content;
    
    const transitions = [
      '그러던 중', '이때', '문득', '그 순간', '잠시 후',
      '한편', '그런데', '그러나', '하지만', '그리고'
    ];
    
    const improvedParagraphs = [paragraphs[0]];
    
    for (let i = 1; i < paragraphs.length; i++) {
      const currentParagraph = paragraphs[i];
      
      // 첫 문장이 갑작스럽게 시작하는지 확인
      if (!/^(그런데|하지만|그리고|이때|그 순간)/.test(currentParagraph)) {
        const transition = transitions[Math.floor(Math.random() * transitions.length)];
        improvedParagraphs.push(transition + ' ' + currentParagraph);
      } else {
        improvedParagraphs.push(currentParagraph);
      }
    }
    
    return improvedParagraphs.join('\n\n');
  }

  /**
   * 📱 유틸리티 메서드들
   */
  
  findSynonyms(word) {
    // 기본 동의어 데이터베이스
    const synonymDatabase = {
      '아름다운': ['예쁜', '곱다', '빼어난', '수려한'],
      '크다': ['거대한', '웅장한', '큰', '방대한'],
      '작다': ['소중한', '자그마한', '미세한', '작은'],
      '빠르다': ['신속한', '재빠른', '민첩한', '발빠른'],
      '느리다': ['더딘', '천천한', '늦은', '지체된']
    };
    
    return synonymDatabase[word] || [];
  }
  
  generateVisualDescription() {
    const colors = this.sensoryPatterns.sight.colors;
    const lights = this.sensoryPatterns.sight.light;
    
    const selectedColor = colors[Math.floor(Math.random() * colors.length)];
    const selectedLight = lights[Math.floor(Math.random() * lights.length)];
    
    return `${selectedColor} 빛이 ${selectedLight} 분위기를 연출했다.`;
  }
  
  countSensoryElements(content) {
    let count = 0;
    
    for (const [sense, patterns] of Object.entries(this.sensoryPatterns)) {
      for (const [category, words] of Object.entries(patterns)) {
        for (const word of words) {
          count += (content.match(new RegExp(word, 'g')) || []).length;
        }
      }
    }
    
    return count;
  }
  
  countMetaphors(content) {
    let count = 0;
    
    // 직접적 비유 표현
    const metaphorMarkers = ['처럼', '같은', '마치', '흡사'];
    for (const marker of metaphorMarkers) {
      count += (content.match(new RegExp(marker, 'g')) || []).length;
    }
    
    // 패턴 기반 은유
    for (const patterns of Object.values(this.metaphorPatterns)) {
      for (const pattern of patterns) {
        count += (content.match(new RegExp(pattern, 'g')) || []).length;
      }
    }
    
    return count;
  }
  
  analyzeSentenceLengthDistribution(wordCounts) {
    const distribution = { short: 0, medium: 0, long: 0 };
    
    for (const count of wordCounts) {
      if (count <= 8) {
        distribution.short++;
      } else if (count <= 15) {
        distribution.medium++;
      } else {
        distribution.long++;
      }
    }
    
    const total = wordCounts.length;
    return {
      short: parseFloat((distribution.short / total).toFixed(2)),
      medium: parseFloat((distribution.medium / total).toFixed(2)),
      long: parseFloat((distribution.long / total).toFixed(2))
    };
  }
  
  optimizeContextualVocabulary(content) {
    // 문맥에 따른 최적 어휘 선택
    const contextPatterns = {
      romantic: {
        context: /사랑|연인|키스|포옹|애정/,
        vocabulary: this.vocabularyDatabase.emotionalVocabulary.love
      },
      tense: {
        context: /위험|긴급|놀라|충격|위기/,
        vocabulary: this.vocabularyDatabase.emotionalVocabulary.tension
      },
      mysterious: {
        context: /비밀|수수께끼|신비|알 수 없/,
        vocabulary: this.vocabularyDatabase.emotionalVocabulary.mystery
      }
    };
    
    let optimizedContent = content;
    
    for (const [contextType, { context, vocabulary }] of Object.entries(contextPatterns)) {
      if (context.test(content)) {
        // 해당 맥락에 적합한 어휘로 일부 교체
        const randomWord = vocabulary.adjectives[Math.floor(Math.random() * vocabulary.adjectives.length)];
        
        // 일반적인 형용사를 맥락에 맞는 것으로 교체
        optimizedContent = optimizedContent.replace(/좋은|나쁜|큰|작은/, randomWord);
      }
    }
    
    return optimizedContent;
  }
  
  calculateLiteraryScore(vocabularyLevel, sensoryRichness, metaphorDensity, rhythmVariance, vocabularyDiversity) {
    // 가중치 적용 점수 계산
    const vocabularyWeight = 0.25;
    const sensoryWeight = 0.25;
    const metaphorWeight = 0.20;
    const rhythmWeight = 0.15;
    const diversityWeight = 0.15;
    
    const adjustedVocabularyScore = vocabularyLevel; // 이미 0-10 범위
    const adjustedSensoryScore = sensoryRichness * 10;
    const adjustedMetaphorScore = metaphorDensity * 10;
    const adjustedRhythmScore = rhythmVariance * 10;
    const adjustedDiversityScore = vocabularyDiversity * 10;
    
    const overallScore = 
      (adjustedVocabularyScore * vocabularyWeight) +
      (adjustedSensoryScore * sensoryWeight) +
      (adjustedMetaphorScore * metaphorWeight) +
      (adjustedRhythmScore * rhythmWeight) +
      (adjustedDiversityScore * diversityWeight);
    
    return parseFloat(Math.max(0, Math.min(10, overallScore)).toFixed(1));
  }

  /**
   * 📊 문체 품질 리포트 생성
   */
  generateLiteraryReport(analysis) {
    return {
      summary: `어휘 수준 ${analysis.vocabularyLevel}/10, 감각적 묘사 ${(analysis.sensoryRichness * 100).toFixed(1)}%`,
      
      vocabularyStatus: analysis.vocabularyLevel >= this.thresholds.minVocabularyLevel ? 'PASS' : 'FAIL',
      sensoryStatus: analysis.sensoryRichness >= this.thresholds.minSensoryRichness ? 'PASS' : 'FAIL',
      metaphorStatus: analysis.metaphorDensity >= this.thresholds.minMetaphorDensity ? 'PASS' : 'FAIL',
      rhythmStatus: analysis.rhythmVariance >= this.thresholds.optimalRhythmVariance ? 'PASS' : 'FAIL',
      diversityStatus: analysis.vocabularyDiversity >= (1 - this.thresholds.maxRepetitionRate) ? 'PASS' : 'FAIL',
      
      overallStatus: analysis.overallQualityScore >= 7.0 ? 'HIGH_QUALITY' : 'NEEDS_IMPROVEMENT',
      
      recommendations: this.generateLiteraryRecommendations(analysis),
      
      metrics: {
        vocabularyLevel: analysis.vocabularyLevel,
        sensoryRichness: analysis.sensoryRichness,
        metaphorDensity: analysis.metaphorDensity,
        rhythmVariance: analysis.rhythmVariance,
        vocabularyDiversity: analysis.vocabularyDiversity,
        overallQualityScore: analysis.overallQualityScore
      }
    };
  }

  /**
   * 💡 문체 개선 권장사항 생성
   */
  generateLiteraryRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.vocabularyLevel < this.thresholds.minVocabularyLevel) {
      recommendations.push('어휘 수준을 높이세요. 더 정교하고 다양한 표현을 사용해보세요.');
    }
    
    if (analysis.sensoryRichness < this.thresholds.minSensoryRichness) {
      recommendations.push('5감을 활용한 묘사를 늘리세요. 시각, 청각, 촉각 등의 감각적 표현을 추가하세요.');
    }
    
    if (analysis.metaphorDensity < this.thresholds.minMetaphorDensity) {
      recommendations.push('은유와 비유를 더 활용하세요. 자연이나 보석에 빗댄 표현을 시도해보세요.');
    }
    
    if (analysis.rhythmVariance < this.thresholds.optimalRhythmVariance) {
      recommendations.push('문장 길이에 변화를 주세요. 짧은 문장과 긴 문장을 적절히 섞어보세요.');
    }
    
    if (analysis.vocabularyDiversity < (1 - this.thresholds.maxRepetitionRate)) {
      recommendations.push('어휘 다양성을 높이세요. 같은 의미의 다른 표현들을 활용해보세요.');
    }
    
    return recommendations;
  }
}