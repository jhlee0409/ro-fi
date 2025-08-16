#!/usr/bin/env node

/**
 * 🎲 Unpredictability Amplifier
 * 
 * 독자 피드백 기반 예측 불가능성 증대 시스템
 * - "예상대로", "당연히" 등 예측 가능 표현 제거
 * - 플롯 트위스트와 반전 요소 주입
 * - 캐릭터 행동의 의외성 증대
 * - 독자의 기대 뒤바꾸기
 */

export class UnpredictabilityAmplifier {
  constructor(logger) {
    this.logger = logger;
    
    // 예측 가능성 지표
    this.predictabilityIndicators = {
      obviousOutcomes: [
        '당연히', '예상대로', '역시', '뻔한', '예상했던',
        '자명한', '명백한', '분명한', '확실한'
      ],
      linearProgression: [
        '순서대로', '차례대로', '단계별로', '순조롭게',
        '계획대로', '예정대로'
      ],
      clicheResolutions: [
        '해피엔딩', '완벽한 해결', '모든 것이 잘', '문제없이',
        '쉽게 해결', '간단히 끝'
      ],
      genericReactions: [
        '놀라지 않았다', '예상했다', '당연했다',
        '뻔했다', '생각했던 대로'
      ]
    };
    
    // 반전 요소 생성기
    this.plotTwistGenerators = {
      characterReversal: {
        trustworthyToBetrayer: '믿었던 인물의 배신',
        enemyToAlly: '적이었던 존재의 도움',
        weakToStrong: '약했던 인물의 숨겨진 힘',
        goodToEvil: '선량한 인물의 어두운 면',
        deadToAlive: '죽었다고 여겨진 인물의 생존'
      },
      
      situationReversal: {
        solutionToProblem: '해결책이 더 큰 문제를 야기',
        victoryToDefeat: '승리가 실제로는 패배',
        pastToFuture: '과거 행동이 미래에 예상치 못한 결과',
        truthToLie: '진실이라 믿었던 것이 거짓',
        rescueToTrap: '구원이 실제로는 함정'
      },
      
      motivationReversal: {
        loveToRevenge: '사랑으로 시작된 것이 복수를 위함',
        helpToControl: '도움이 실제로는 조종',
        protectionToDestruction: '보호하려던 것이 파괴로 이어짐',
        selflessToSelfish: '이타적 행동의 이기적 동기',
        nobleToCorrupt: '고귀한 목적의 부패한 실체'
      }
    };
    
    // 의외성 주입 패턴
    this.unexpectedPatterns = {
      timing: [
        '예상보다 일찍', '뜻밖의 순간에', '한발 늦게',
        '갑작스럽게', '예고 없이'
      ],
      manner: [
        '전혀 다른 방식으로', '정반대의 방법으로', '의외의 수단으로',
        '상상도 못한 방법으로', '예측 불가한 방식으로'
      ],
      source: [
        '예상치 못한 곳에서', '전혀 다른 인물이', '뜻밖의 원인으로',
        '숨겨진 요소가', '무시했던 것이'
      ],
      outcome: [
        '정반대의 결과', '예상과 완전히 다른', '상상도 못한 결말',
        '뒤바뀐 상황', '역전된 운명'
      ]
    };
    
    // 독자 기대 조작 기법
    this.expectationManipulation = {
      redHerring: '독자의 관심을 다른 곳으로 유도',
      falseClue: '잘못된 단서 제공',
      hiddenInformation: '중요한 정보 숨기기',
      misleadingPerspective: '오해를 불러일으키는 시점',
      delayedReveal: '진실 공개 시점 조절'
    };
  }

  /**
   * 예측 불가능성 종합 증대
   */
  async amplifyUnpredictability(content, storyContext) {
    this.logger.info('🎲 예측 불가능성 증대 시작');
    
    try {
      // 1단계: 현재 예측 가능성 분석
      const currentPredictability = this.analyzePredictability(content);
      
      // 2단계: 예측 가능한 표현 제거
      let enhanced = this.removePredictableExpressions(content);
      
      // 3단계: 플롯 트위스트 주입
      enhanced = this.injectPlotTwists(enhanced, storyContext);
      
      // 4단계: 캐릭터 행동 의외성 증대
      enhanced = this.addCharacterUnpredictability(enhanced, storyContext);
      
      // 5단계: 타이밍과 방식의 의외성 추가
      enhanced = this.addTimingUnpredictability(enhanced);
      
      // 6단계: 독자 기대 조작
      enhanced = this.manipulateExpectations(enhanced, storyContext);
      
      // 7단계: 최종 예측 불가능성 평가
      const finalPredictability = this.analyzePredictability(enhanced);
      
      const result = {
        enhancedContent: enhanced,
        unpredictabilityScore: finalPredictability.unpredictabilityScore,
        unpredictabilityStatus: this.getUnpredictabilityStatus(finalPredictability.unpredictabilityScore),
        beforeAfter: {
          before: currentPredictability,
          after: finalPredictability
        },
        addedElements: this.extractAddedElements(content, enhanced)
      };
      
      this.logger.success('✅ 예측 불가능성 증대 완료', {
        score: finalPredictability.unpredictabilityScore,
        status: result.unpredictabilityStatus
      });
      
      return result;
      
    } catch (error) {
      this.logger.error('❌ 예측 불가능성 증대 실패:', error.message);
      throw error;
    }
  }

  /**
   * 현재 예측 가능성 분석
   */
  analyzePredictability(content) {
    const analysis = {
      obviousOutcomes: 0,
      linearProgression: 0,
      clicheResolutions: 0,
      genericReactions: 0,
      surpriseElements: 0,
      unexpectedTwists: 0
    };
    
    // 예측 가능 요소들 카운트
    Object.entries(this.predictabilityIndicators).forEach(([category, keywords]) => {
      analysis[category] = this.countKeywords(content, keywords);
    });
    
    // 의외성 요소들 카운트
    const surpriseKeywords = ['놀랍게도', '뜻밖에', '갑자기', '예상치 못한', '의외로'];
    analysis.surpriseElements = this.countKeywords(content, surpriseKeywords);
    
    const twistKeywords = ['반전', '뒤바뀐', '정반대', '역전', '변화'];
    analysis.unexpectedTwists = this.countKeywords(content, twistKeywords);
    
    // 예측 불가능성 점수 계산 (10점 만점)
    const predictableTotal = analysis.obviousOutcomes + analysis.linearProgression + 
                           analysis.clicheResolutions + analysis.genericReactions;
    const unpredictableTotal = analysis.surpriseElements + analysis.unexpectedTwists;
    
    analysis.unpredictabilityScore = Math.max(0, Math.min(10,
      10 - (predictableTotal * 0.5) + (unpredictableTotal * 1.5)
    ));
    
    return analysis;
  }

  /**
   * 예측 가능한 표현 제거
   */
  removePredictableExpressions(content) {
    let cleaned = content;
    
    // 명백한 결과 표현 제거
    cleaned = cleaned.replace(
      /(당연히|예상대로|역시)/g,
      '예상과는 달리'
    );
    
    // 선형적 진행 표현 제거
    cleaned = cleaned.replace(
      /(순조롭게|계획대로|예정대로)/g,
      '예기치 않은 방식으로'
    );
    
    // 클리셰 해결 표현 제거
    cleaned = cleaned.replace(
      /(쉽게 해결|간단히 끝|문제없이)/g,
      '복잡하고 예상치 못한 방식으로 풀려나갔다'
    );
    
    // 일반적 반응 표현 제거
    cleaned = cleaned.replace(
      /(놀라지 않았다|예상했다|당연했다)/g,
      '예상과 완전히 달랐다'
    );
    
    return cleaned;
  }

  /**
   * 플롯 트위스트 주입
   */
  injectPlotTwists(content, storyContext) {
    let enhanced = content;
    const chapterNumber = storyContext.chapterNumber || 1;
    
    // 챕터별 적절한 반전 요소 선택
    if (chapterNumber >= 3 && Math.random() > 0.6) {
      const twistType = this.selectAppropriate Twist(chapterNumber);
      const twist = this.generateSpecificTwist(twistType, storyContext);
      
      enhanced += `\n\n그런데 ${twist.indicator}는 일이 벌어졌다. ${twist.description}이 모든 것을 뒤바꿔 놓았다.`;
    }
    
    return enhanced;
  }

  /**
   * 적절한 트위스트 선택
   */
  selectAppropriateTwist(chapterNumber) {
    if (chapterNumber <= 3) {
      return 'characterReversal';
    } else if (chapterNumber <= 5) {
      return 'situationReversal';
    } else {
      return 'motivationReversal';
    }
  }

  /**
   * 구체적 트위스트 생성
   */
  generateSpecificTwist(twistType, storyContext) {
    const twists = this.plotTwistGenerators[twistType];
    const twistKeys = Object.keys(twists);
    const selectedKey = twistKeys[Math.floor(Math.random() * twistKeys.length)];
    
    return {
      indicator: '예상치 못한',
      description: twists[selectedKey],
      type: twistType
    };
  }

  /**
   * 캐릭터 행동 의외성 증대
   */
  addCharacterUnpredictability(content, storyContext) {
    let enhanced = content;
    
    // 예측 가능한 캐릭터 반응 수정
    enhanced = enhanced.replace(
      /(당연히|자연스럽게|예상대로) (말했다|행동했다|반응했다)/g,
      '예상과는 전혀 다르게 $2'
    );
    
    // 캐릭터의 이중성 암시
    enhanced = enhanced.replace(
      /(진심으로|정말로) (말했다|표현했다)/g,
      '겉으로는 진심인 것처럼 $2지만, 그 눈빛 깊은 곳에는 다른 무언가가 숨어있었다'
    );
    
    // 예측 불가능한 감정 변화
    enhanced = enhanced.replace(
      /(화가 났다|기뻤다|슬펐다)/g,
      '$1가 동시에 복잡한 다른 감정들이 뒤섞였다'
    );
    
    return enhanced;
  }

  /**
   * 타이밍과 방식의 의외성 추가
   */
  addTimingUnpredictability(content) {
    let enhanced = content;
    
    // 예측 가능한 타이밍 수정
    enhanced = enhanced.replace(
      /(그때|그 순간|바로 그때)/g,
      '아무도 예상하지 못한 순간에'
    );
    
    // 방식의 의외성 추가
    enhanced = enhanced.replace(
      /(일반적인|보통의|평범한) (방법|방식)/g,
      '전혀 예상치 못한 $2'
    );
    
    return enhanced;
  }

  /**
   * 독자 기대 조작
   */
  manipulateExpectations(content, storyContext) {
    let enhanced = content;
    
    // 잘못된 단서 제공
    if (Math.random() > 0.7) {
      enhanced = enhanced.replace(
        /(단서|흔적|증거)/g,
        '오해를 불러일으킬 수 있는 $1'
      );
    }
    
    // 숨겨진 정보 암시
    enhanced = enhanced.replace(
      /(모든 것|전부|완전히)/g,
      '겉보기에는 $1'
    );
    
    // 시점의 제한성 강조
    enhanced = enhanced.replace(
      /(확실했다|분명했다|명백했다)/g,
      '그렇게 보였다'
    );
    
    return enhanced;
  }

  /**
   * 헬퍼 메서드들
   */
  countKeywords(content, keywords) {
    let count = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex);
      count += matches ? matches.length : 0;
    });
    return count;
  }

  getUnpredictabilityStatus(score) {
    if (score >= 8) return 'HIGHLY_UNPREDICTABLE';
    if (score >= 6) return 'MODERATELY_UNPREDICTABLE';
    if (score >= 4) return 'SOMEWHAT_PREDICTABLE';
    return 'HIGHLY_PREDICTABLE';
  }

  extractAddedElements(originalContent, enhancedContent) {
    const addedElements = [];
    
    // 추가된 반전 요소 탐지
    const twistKeywords = ['예상치 못한', '뜻밖의', '갑작스런', '정반대', '역전'];
    twistKeywords.forEach(keyword => {
      const originalCount = this.countKeywords(originalContent, [keyword]);
      const enhancedCount = this.countKeywords(enhancedContent, [keyword]);
      
      if (enhancedCount > originalCount) {
        addedElements.push(`${keyword} 요소 ${enhancedCount - originalCount}개 추가`);
      }
    });
    
    return addedElements;
  }

  /**
   * 전체 예측 불가능성 검증
   */
  async validateUnpredictability(content, storyContext) {
    const analysis = this.analyzePredictability(content);
    
    const validation = {
      score: analysis.unpredictabilityScore,
      status: this.getUnpredictabilityStatus(analysis.unpredictabilityScore),
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
    
    // 강점과 약점 분석
    if (analysis.surpriseElements >= 3) {
      validation.strengths.push('충분한 의외성 요소');
    }
    if (analysis.unexpectedTwists >= 2) {
      validation.strengths.push('적절한 반전 요소');
    }
    
    if (analysis.obviousOutcomes >= 3) {
      validation.weaknesses.push('너무 많은 뻔한 결과');
      validation.recommendations.push('예측 가능한 표현 줄이기');
    }
    if (analysis.linearProgression >= 2) {
      validation.weaknesses.push('선형적 진행');
      validation.recommendations.push('비선형적 전개 추가');
    }
    
    return validation;
  }
}

export default UnpredictabilityAmplifier;