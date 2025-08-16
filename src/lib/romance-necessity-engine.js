#!/usr/bin/env node

/**
 * 💕 Romance Necessity Engine
 * 
 * 독자 피드백 기반 로맨스 필연성 강화 시스템
 * - "손잡기=사랑" 클리셰 제거
 * - 감정적 근거와 필연성 구축
 * - 장애물을 통한 관계 발전
 * - 건강하면서도 긴장감 있는 로맨스
 */

export class RomanceNecessityEngine {
  constructor(logger) {
    this.logger = logger;
    
    // 로맨스 필연성 구축 요소
    this.necessityBuilders = {
      // 감정적 근거
      emotionalFoundations: {
        sharedTrauma: {
          description: '공통의 상처와 치유',
          indicators: ['상처', '아픔', '트라우마', '치유', '이해'],
          strength: 'HIGH'
        },
        complementaryFlaws: {
          description: '서로의 약점을 보완',
          indicators: ['보완', '채워줌', '완성', '균형'],
          strength: 'HIGH'
        },
        gradualUnderstanding: {
          description: '점진적 이해와 공감',
          indicators: ['이해', '공감', '알아가는', '발견'],
          strength: 'MEDIUM'
        },
        protectiveInstinct: {
          description: '보호 본능과 희생',
          indicators: ['보호', '지키고 싶은', '희생', '감싸다'],
          strength: 'MEDIUM'
        }
      },
      
      // 로맨스 장애물
      obstacles: {
        missionConflict: {
          description: '사명과 개인적 감정의 충돌',
          severity: 'HIGH',
          resolution: 'difficult'
        },
        timeDifference: {
          description: '시간과 공간의 제약',
          severity: 'HIGH',
          resolution: 'complex'
        },
        trustIssues: {
          description: '신뢰와 배신의 문제',
          severity: 'MEDIUM',
          resolution: 'gradual'
        },
        socialBarriers: {
          description: '사회적 제약과 반대',
          severity: 'MEDIUM',
          resolution: 'challenging'
        },
        pastTrauma: {
          description: '과거 상처와 트라우마',
          severity: 'HIGH',
          resolution: 'healing-based'
        }
      },
      
      // 건강한 관계 발전 단계
      healthyProgression: {
        stage1_wariness: {
          emotions: ['경계', '의심', '호기심'],
          interactions: ['탐색적 대화', '조심스런 접근', '상호 관찰'],
          duration: 'chapters 1-2'
        },
        stage2_reluctant_cooperation: {
          emotions: ['어쩔 수 없는 협력', '서서히 드러나는 관심'],
          interactions: ['위기 상황 협력', '작은 친절', '무의식적 배려'],
          duration: 'chapters 3-4'
        },
        stage3_emotional_recognition: {
          emotions: ['감정 인식', '내적 갈등', '저항과 끌림'],
          interactions: ['진솔한 대화', '감정적 순간', '갈등과 화해'],
          duration: 'chapters 5-7'
        },
        stage4_choice_and_commitment: {
          emotions: ['선택의 기로', '희생각오', '진정한 사랑 확인'],
          interactions: ['운명적 선택', '서로를 위한 희생', '미래 약속'],
          duration: 'chapters 8-10'
        }
      }
    };
    
    // 클리셰 탐지 패턴
    this.clichePatterns = {
      shallowAttraction: [
        '예뻐서', '잘생겨서', '외모', '첫눈에 반한',
        '미모', '외관', '겉모습'
      ],
      instantLove: [
        '한눈에', '첫눈에', '즉시', '바로', '순식간에',
        '곧바로', '당장'
      ],
      physicalOnly: [
        '손잡기', '포옹', '키스', '스킨십',
        '몸짓', '접촉'
      ],
      coincidenceRomance: [
        '우연히', '마침', '공교롭게도', '때마침',
        '어쩌다가', '뜻밖에'
      ],
      noConflictRomance: [
        '순조롭게', '자연스럽게', '문제없이', '쉽게',
        '평화롭게', '편안하게'
      ]
    };
    
    // 강력한 로맨스 대안
    this.powerfulAlternatives = {
      deepConnection: [
        '서로의 상처를 이해할 수 있어서',
        '같은 아픔을 겪었기에',
        '서로를 완성시켜주기 때문에',
        '함께할 때만 완전해지기에'
      ],
      meaningfulMoments: [
        '위기 상황에서 본능적으로 보호하는 모습',
        '무의식 중에 드러나는 진심',
        '말없이도 통하는 마음',
        '서로를 위해 희생하려는 의지'
      ],
      emotionalTension: [
        '끌리면서도 저항하는 복잡한 감정',
        '사랑하지만 상처줄까 두려운 마음',
        '함께하고 싶지만 할 수 없는 현실',
        '선택해야 하는 운명적 기로'
      ]
    };
  }

  /**
   * 로맨스 필연성 종합 분석 및 강화
   */
  async enhanceRomanceNecessity(content, storyContext) {
    this.logger.info('💕 로맨스 필연성 강화 시작');
    
    try {
      // 1단계: 현재 로맨스 상태 분석
      const currentState = this.analyzeCurrentRomance(content, storyContext);
      
      // 2단계: 클리셰 탐지 및 제거
      let enhancedContent = this.removeCliches(content);
      
      // 3단계: 감정적 근거 강화
      enhancedContent = this.strengthenEmotionalFoundation(enhancedContent, currentState);
      
      // 4단계: 적절한 장애물 추가
      enhancedContent = this.addMeaningfulObstacles(enhancedContent, storyContext);
      
      // 5단계: 건강한 관계 발전 보장
      enhancedContent = this.ensureHealthyProgression(enhancedContent, storyContext);
      
      // 6단계: 로맨스 긴장감 구축
      enhancedContent = this.buildRomanticTension(enhancedContent, storyContext);
      
      // 7단계: 최종 검증
      const finalAnalysis = this.analyzeCurrentRomance(enhancedContent, storyContext);
      
      const result = {
        enhancedContent,
        romanceScore: finalAnalysis.necessityScore,
        romanceStatus: this.getRomanceStatus(finalAnalysis.necessityScore),
        beforeAfter: {
          before: currentState,
          after: finalAnalysis
        },
        improvements: this.generateRomanceImprovements(currentState, finalAnalysis)
      };
      
      this.logger.success('✅ 로맨스 필연성 강화 완료', {
        score: finalAnalysis.necessityScore,
        status: result.romanceStatus
      });
      
      return result;
      
    } catch (error) {
      this.logger.error('❌ 로맨스 필연성 강화 실패:', error.message);
      throw error;
    }
  }

  /**
   * 현재 로맨스 상태 분석
   */
  analyzeCurrentRomance(content, storyContext) {
    const analysis = {
      emotionalFoundation: 0,
      obstaclePresence: 0,
      progressionHealth: 0,
      romanticTension: 0,
      clicheCount: 0,
      necessityScore: 0
    };
    
    // 감정적 근거 점수
    Object.values(this.necessityBuilders.emotionalFoundations).forEach(foundation => {
      const count = this.countKeywords(content, foundation.indicators);
      analysis.emotionalFoundation += count * (foundation.strength === 'HIGH' ? 1 : 0.5);
    });
    
    // 장애물 존재 점수
    const obstacleKeywords = ['갈등', '어려움', '방해', '장애', '문제', '고민', '딜레마'];
    analysis.obstaclePresence = this.countKeywords(content, obstacleKeywords);
    
    // 관계 발전 건강성
    const expectedStage = this.getExpectedRomanceStage(storyContext.chapterNumber);
    analysis.progressionHealth = this.assessProgressionHealth(content, expectedStage);
    
    // 로맨틱 긴장감
    const tensionKeywords = ['끌림', '저항', '갈등', '혼란', '복잡한', '어려운'];
    analysis.romanticTension = this.countKeywords(content, tensionKeywords);
    
    // 클리셰 카운트
    Object.values(this.clichePatterns).forEach(patterns => {
      analysis.clicheCount += this.countKeywords(content, patterns);
    });
    
    // 종합 필연성 점수 계산
    analysis.necessityScore = Math.min(10, Math.max(0,
      (analysis.emotionalFoundation * 0.3) +
      (analysis.obstaclePresence * 0.25) +
      (analysis.progressionHealth * 0.25) +
      (analysis.romanticTension * 0.2) -
      (analysis.clicheCount * 0.5)
    ));
    
    return analysis;
  }

  /**
   * 클리셰 제거
   */
  removeCliches(content) {
    let cleaned = content;
    
    // 피상적 끌림 표현 제거
    cleaned = cleaned.replace(
      /(예뻐서|잘생겨서|미모에|외모에)/g,
      '마음 깊은 곳에서 느껴지는 무언가에'
    );
    
    // 즉석 사랑 표현 제거
    cleaned = cleaned.replace(
      /(한눈에|첫눈에|즉시|바로) (사랑|반했|끌렸)/g,
      '시간이 지나면서 서서히 $2'
    );
    
    // 물리적 접촉 중심 제거
    cleaned = cleaned.replace(
      /(손을 잡|포옹|키스)(.+)(사랑|마음)/g,
      '서로의 마음을 확인$2$3'
    );
    
    // 우연적 로맨스 제거
    cleaned = cleaned.replace(
      /(우연히|마침|공교롭게도)(.+)(만나|알게)/g,
      '운명처럼$2$3'
    );
    
    return cleaned;
  }

  /**
   * 감정적 근거 강화
   */
  strengthenEmotionalFoundation(content, currentState) {
    let enhanced = content;
    
    // 공통 상처 기반 연결 추가
    if (currentState.emotionalFoundation < 3) {
      enhanced = enhanced.replace(
        /(끌렸다|관심이 생겼다|좋아하게 되었다)/g,
        '서로의 아픈 과거를 이해할 수 있어서 마음이 움직였다'
      );
    }
    
    // 상호 보완 관계 강조
    enhanced = enhanced.replace(
      /(완벽한|훌륭한|멋진)/g,
      '부족한 자신을 채워주는'
    );
    
    // 점진적 이해 과정 추가
    enhanced = enhanced.replace(
      /(알게 되었다|깨달았다)/g,
      '조금씩 이해하게 되었고, 그럴수록 더욱 소중하게 느껴졌다'
    );
    
    return enhanced;
  }

  /**
   * 의미있는 장애물 추가
   */
  addMeaningfulObstacles(content, storyContext) {
    let enhanced = content;
    
    const chapterNumber = storyContext.chapterNumber || 1;
    
    if (chapterNumber <= 3) {
      // 초기: 신뢰 문제
      enhanced = enhanced.replace(
        /(믿을 수 있을|신뢰할 수 있을)/g,
        '정말로 믿어도 될지 확신할 수 없는'
      );
    } else if (chapterNumber <= 5) {
      // 중기: 사명과 감정의 충돌
      enhanced = enhanced.replace(
        /(함께하고 싶었다|가까워지고 싶었다)/g,
        '함께하고 싶었지만 각자의 사명이 그들을 갈라놓고 있었다'
      );
    } else {
      // 후기: 희생과 선택의 문제
      enhanced = enhanced.replace(
        /(사랑한다|소중하다)/g,
        '사랑하기에 더욱 포기해야 할지도 모른다고 생각했다'
      );
    }
    
    return enhanced;
  }

  /**
   * 건강한 관계 발전 보장
   */
  ensureHealthyProgression(content, storyContext) {
    let enhanced = content;
    const expectedStage = this.getExpectedRomanceStage(storyContext.chapterNumber);
    const stageInfo = this.necessityBuilders.healthyProgression[expectedStage];
    
    if (!stageInfo) return enhanced;
    
    // 해당 단계에 맞는 감정과 상호작용 추가
    const emotions = stageInfo.emotions;
    const interactions = stageInfo.interactions;
    
    // 급작스런 발전 방지
    enhanced = enhanced.replace(
      /(갑자기|순식간에|즉시) (사랑|끌린|빠져들었)/g,
      '서서히 $2'
    );
    
    // 단계별 적절한 감정 추가
    if (emotions.length > 0) {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      enhanced += `\n\n${randomEmotion}이 그들 사이에 미묘하게 흐르고 있었다.`;
    }
    
    return enhanced;
  }

  /**
   * 로맨틱 긴장감 구축
   */
  buildRomanticTension(content, storyContext) {
    let enhanced = content;
    
    // 끌림과 저항의 이중감정 추가
    enhanced = enhanced.replace(
      /(끌렸다|관심이 생겼다)/g,
      '끌렸지만 동시에 저항하고 싶었다'
    );
    
    // 복잡한 감정 상태 강조
    enhanced = enhanced.replace(
      /(좋아한다|사랑한다)/g,
      '마음은 확실하지만 표현하기엔 너무 복잡한 상황이었다'
    );
    
    // 내적 갈등 추가
    enhanced = enhanced.replace(
      /(행복했다|기뻤다)/g,
      '행복했지만 동시에 불안했다. 이 감정이 과연 옳은 것일까?'
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

  getExpectedRomanceStage(chapterNumber) {
    if (chapterNumber <= 2) return 'stage1_wariness';
    if (chapterNumber <= 4) return 'stage2_reluctant_cooperation';
    if (chapterNumber <= 7) return 'stage3_emotional_recognition';
    return 'stage4_choice_and_commitment';
  }

  assessProgressionHealth(content, expectedStage) {
    // 간단한 건강성 평가 (실제로는 더 복잡한 로직 필요)
    const stageInfo = this.necessityBuilders.healthyProgression[expectedStage];
    if (!stageInfo) return 5;
    
    const emotionCount = this.countKeywords(content, stageInfo.emotions);
    const interactionCount = this.countKeywords(content, stageInfo.interactions);
    
    return Math.min(10, (emotionCount + interactionCount) * 2);
  }

  getRomanceStatus(score) {
    if (score >= 8) return 'STRONG_NECESSITY';
    if (score >= 6) return 'ADEQUATE_NECESSITY';
    if (score >= 4) return 'WEAK_NECESSITY';
    return 'CLICHE_HEAVY';
  }

  generateRomanceImprovements(before, after) {
    const improvements = [];
    
    if (after.necessityScore - before.necessityScore > 2) {
      improvements.push('로맨스 필연성이 크게 개선됨');
    }
    
    if (after.clicheCount < before.clicheCount) {
      improvements.push('클리셰 표현이 감소됨');
    }
    
    if (after.emotionalFoundation > before.emotionalFoundation) {
      improvements.push('감정적 근거가 강화됨');
    }
    
    return improvements;
  }
}

export default RomanceNecessityEngine;