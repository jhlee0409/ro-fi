/**
 * 스토리 페이싱 엔진
 * 75챕터 장편 소설의 로맨스 진행 속도를 제어하고 서브플롯을 관리
 */

export class StoryPacingEngine {
  constructor() {
    // 75챕터 기준 로맨스 진행 단계
    this.romanceStages = {
      // 1부: 도입부 (1-15챕터)
      introduction: {
        chapters: [1, 15],
        romanceLevel: [0, 15], // 0%에서 15%
        description: '첫 만남과 초기 갈등',
        keyElements: ['적대감', '호기심', '미묘한 끌림'],
        subPlots: ['세계관 소개', '주인공 배경']
      },
      
      // 2부: 발전부 (16-35챕터)
      development: {
        chapters: [16, 35],
        romanceLevel: [15, 40], // 15%에서 40%
        description: '감정의 깊어짐과 갈등',
        keyElements: ['신뢰 구축', '감정 인식', '내적 갈등'],
        subPlots: ['외부 위협', '과거의 비밀', '라이벌 등장']
      },
      
      // 3부: 절정부 (36-55챕터)
      climax: {
        chapters: [36, 55],
        romanceLevel: [40, 70], // 40%에서 70%
        description: '관계의 전환점과 위기',
        keyElements: ['고백', '오해', '이별'],
        subPlots: ['최대 위협', '비밀 폭로', '선택의 순간']
      },
      
      // 4부: 해결부 (56-75챕터)
      resolution: {
        chapters: [56, 75],
        romanceLevel: [70, 100], // 70%에서 100%
        description: '화해와 해피엔딩',
        keyElements: ['진실 발견', '재회', '영원한 사랑'],
        subPlots: ['최종 시련', '모든 갈등 해결']
      }
    };
    
    // 서브플롯 템플릿
    this.subplotTemplates = {
      'power-struggle': [
        '권력 계승 문제',
        '정치적 음모',
        '가문 간 대립',
        '왕위 쟁탈전'
      ],
      'bodyguard-romance': [
        '암살 위협',
        '신뢰와 의무의 갈등',
        '보호자의 딜레마',
        '숨겨진 정체'
      ],
      'enemies-to-lovers': [
        '과거의 원한',
        '가족 간 복수',
        '오해의 연쇄',
        '공동의 적'
      ]
    };
  }
  
  /**
   * 현재 챕터에 적합한 로맨스 진행도 계산
   */
  calculateRomanceProgress(chapterNumber, currentProgress = null) {
    // 현재 챕터가 속한 단계 찾기
    let currentStage = null;
    for (const [stageName, stage] of Object.entries(this.romanceStages)) {
      if (chapterNumber >= stage.chapters[0] && chapterNumber <= stage.chapters[1]) {
        currentStage = { name: stageName, ...stage };
        break;
      }
    }
    
    if (!currentStage) {
      throw new Error(`Invalid chapter number: ${chapterNumber}`);
    }
    
    // 해당 단계 내에서의 진행률 계산
    const stageProgress = (chapterNumber - currentStage.chapters[0]) / 
                         (currentStage.chapters[1] - currentStage.chapters[0] + 1);
    
    // 목표 로맨스 레벨 계산
    const targetRomanceLevel = currentStage.romanceLevel[0] + 
      (currentStage.romanceLevel[1] - currentStage.romanceLevel[0]) * stageProgress;
    
    return {
      stage: currentStage.name,
      targetLevel: Math.round(targetRomanceLevel),
      currentLevel: currentProgress || Math.round(targetRomanceLevel),
      keyElements: currentStage.keyElements,
      subPlots: currentStage.subPlots,
      description: currentStage.description
    };
  }
  
  /**
   * 로맨스 진행 속도 조정 제안
   */
  suggestPacingAdjustment(chapterNumber, currentRomanceLevel) {
    const target = this.calculateRomanceProgress(chapterNumber);
    const difference = currentRomanceLevel - target.targetLevel;
    
    let adjustment = {
      needed: Math.abs(difference) > 10,
      direction: difference > 0 ? 'slow_down' : 'speed_up',
      intensity: Math.abs(difference),
      suggestions: []
    };
    
    if (adjustment.direction === 'slow_down') {
      adjustment.suggestions = [
        '갈등이나 오해 요소 추가',
        '서브플롯에 더 집중',
        '감정 표현을 간접적으로',
        '외부 장애물 도입'
      ];
    } else if (adjustment.direction === 'speed_up') {
      adjustment.suggestions = [
        '감정적 순간 추가',
        '신체 접촉 증가',
        '내적 독백으로 감정 표현',
        '로맨틱한 상황 설정'
      ];
    }
    
    return adjustment;
  }
  
  /**
   * 서브플롯 추천
   */
  recommendSubplot(chapterNumber, tropes, usedSubplots = []) {
    const progress = this.calculateRomanceProgress(chapterNumber);
    const availableSubplots = [];
    
    // 트로프별 서브플롯 수집
    tropes.forEach(trope => {
      if (this.subplotTemplates[trope]) {
        availableSubplots.push(...this.subplotTemplates[trope]);
      }
    });
    
    // 단계별 추천 서브플롯 추가
    availableSubplots.push(...progress.subPlots);
    
    // 이미 사용한 서브플롯 제외
    const newSubplots = availableSubplots.filter(
      subplot => !usedSubplots.includes(subplot)
    );
    
    return {
      recommended: newSubplots.slice(0, 3),
      stage: progress.stage,
      timing: this.getSubplotTiming(chapterNumber)
    };
  }
  
  /**
   * 서브플롯 도입 타이밍 계산
   */
  getSubplotTiming(chapterNumber) {
    // 5챕터마다 새로운 서브플롯 도입 권장
    const cyclePosition = chapterNumber % 5;
    
    if (cyclePosition === 1) {
      return { introduce: true, develop: false, resolve: false };
    } else if (cyclePosition >= 2 && cyclePosition <= 4) {
      return { introduce: false, develop: true, resolve: false };
    } else {
      return { introduce: false, develop: false, resolve: true };
    }
  }
  
  /**
   * 챕터별 가이드라인 생성
   */
  generateChapterGuideline(chapterNumber, currentState = {}) {
    const pacing = this.calculateRomanceProgress(chapterNumber, currentState.romanceLevel);
    const subplot = this.recommendSubplot(chapterNumber, currentState.tropes || [], currentState.usedSubplots || []);
    
    const guideline = {
      chapterNumber,
      stage: pacing.stage,
      romanceGuideline: {
        targetLevel: pacing.targetLevel,
        keyElements: pacing.keyElements,
        description: pacing.description
      },
      subplotGuideline: subplot,
      tensionLevel: this.calculateTensionLevel(chapterNumber),
      emotionalTone: this.determineEmotionalTone(chapterNumber)
    };
    
    // 페이싱 조정이 필요한 경우
    if (currentState.romanceLevel) {
      const adjustment = this.suggestPacingAdjustment(chapterNumber, currentState.romanceLevel);
      if (adjustment.needed) {
        guideline.pacingAdjustment = adjustment;
      }
    }
    
    return guideline;
  }
  
  /**
   * 긴장감 레벨 계산
   */
  calculateTensionLevel(chapterNumber) {
    // 10챕터 주기로 긴장감 상승과 해소
    const cycle = Math.floor((chapterNumber - 1) / 10);
    const positionInCycle = (chapterNumber - 1) % 10;
    
    let baseTension = 30 + (cycle * 10); // 기본 긴장감은 점진적 상승
    
    // 사이클 내 위치에 따른 긴장감 변화
    if (positionInCycle < 7) {
      baseTension += positionInCycle * 5; // 상승
    } else {
      baseTension -= (positionInCycle - 7) * 10; // 해소
    }
    
    // 특별 챕터에서의 긴장감 피크
    const peakChapters = [15, 35, 50, 55, 70];
    if (peakChapters.includes(chapterNumber)) {
      baseTension = 90;
    }
    
    return Math.max(20, Math.min(100, baseTension));
  }
  
  /**
   * 감정적 톤 결정
   */
  determineEmotionalTone(chapterNumber) {
    const progress = this.calculateRomanceProgress(chapterNumber);
    
    const toneMap = {
      introduction: ['호기심', '긴장', '미스터리', '설렘'],
      development: ['따뜻함', '혼란', '기대', '두려움'],
      climax: ['열정', '절망', '갈등', '아픔'],
      resolution: ['희망', '기쁨', '안도', '사랑']
    };
    
    const availableTones = toneMap[progress.stage] || ['중립'];
    const cyclePosition = (chapterNumber - 1) % availableTones.length;
    
    return availableTones[cyclePosition];
  }
}