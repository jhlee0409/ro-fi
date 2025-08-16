#!/usr/bin/env node

/**
 * 🏗️ Advanced Story Architect
 * 
 * 독자 피드백을 반영한 고급 스토리 설계 시스템
 * - 시간 수호단, 패러독스 헌터 등 적대 세력
 * - 윤슬의 이중성과 숨겨진 의도
 * - 이연의 윤리적 딜레마와 내적 갈등
 * - 시간 제한과 긴박감 조성
 */

import { ConflictDrivenEnhancementEngine } from './conflict-driven-enhancement-engine.js';

export class AdvancedStoryArchitect {
  constructor(logger, geminiModel) {
    this.logger = logger;
    this.model = geminiModel;
    this.conflictEngine = new ConflictDrivenEnhancementEngine(logger);
    
    // 독자 피드백 기반 스토리 요소들
    this.storyElements = {
      antagonists: {
        timeGuardians: {
          name: '시간 수호단',
          description: '과거 개입을 막으려는 비밀 조직',
          motivation: '시간선의 순수성 보호',
          methods: ['추적', '방해', '기억 조작', '시간 감옥'],
          threat_level: 'HIGH'
        },
        paradoxHunters: {
          name: '패러독스 헌터',
          description: '시간 여행자를 사냥하는 존재들',
          motivation: '시간 균열 복구',
          methods: ['시간 추적', '존재 소거', '운명 조작'],
          threat_level: 'EXTREME'
        },
        pastLover: {
          name: '윤슬의 과거 연인',
          description: '죽었다고 믿어졌지만 실제로는 살아있는 인물',
          motivation: '윤슬과의 재결합',
          methods: ['감정적 조작', '과거 폭로', '질투와 방해'],
          threat_level: 'MEDIUM'
        }
      },
      
      timeConstraints: {
        magicDepletion: {
          description: '매일 줄어드는 마법력',
          urgency: 'HIGH',
          consequences: '현재로 돌아갈 수 없음'
        },
        worldCollapse: {
          description: '미래 세계의 붕괴 카운트다운',
          urgency: 'EXTREME',
          consequences: '모든 것의 소멸'
        },
        pastStayLimit: {
          description: '과거 체류 가능 시간 30일',
          urgency: 'MEDIUM',
          consequences: '강제 추방'
        }
      },
      
      characterSecrets: {
        yeonSecrets: {
          ethicalDilemma: '과거 개입의 도덕적 문제',
          existenceCrisis: '자신의 존재 소멸 가능성',
          familyBurden: '가문의 저주에 대한 책임감',
          powerCost: '마법 사용 시 기억 상실'
        },
        yunseulSecrets: {
          hiddenPlan: '연인을 살리기 위한 거대한 계획',
          timeCrackCreator: '실제로는 시간 균열을 의도적으로 생성',
          usingYeon: '이연을 이용하려는 속셈',
          dualIdentity: '과거와 현재를 오가는 존재'
        }
      },
      
      romanceObstacles: {
        trustIssues: '신뢰와 배신 사이의 갈등',
        timeDifference: '시간과 공간의 제약',
        missionConflict: '개인적 감정 vs 사명',
        pastTrauma: '과거 상처의 재현',
        sacrificeChoice: '사랑 vs 세계 구원의 선택',
        identityCrisis: '진짜 자신을 보여주기의 두려움'
      }
    };
  }

  /**
   * 고급 스토리 구조 생성
   */
  async generateAdvancedStoryStructure(novelInfo, chapterNumber) {
    this.logger.info(`🏗️ 챕터 ${chapterNumber} 고급 스토리 구조 생성`);
    
    const structure = {
      mainConflict: this.selectMainConflict(chapterNumber),
      antagonistRole: this.selectAntagonist(chapterNumber),
      timeConstraint: this.selectTimeConstraint(chapterNumber),
      characterDevelopment: this.planCharacterDevelopment(chapterNumber),
      romanceProgression: this.planRomanceProgression(chapterNumber),
      plotTwist: this.planPlotTwist(chapterNumber),
      cliffhanger: this.generateCliffhanger(chapterNumber)
    };
    
    return structure;
  }

  /**
   * 메인 갈등 선택
   */
  selectMainConflict(chapterNumber) {
    if (chapterNumber <= 2) {
      return {
        type: 'introduction',
        focus: '시간 이동의 부작용과 적응',
        intensity: 'medium',
        elements: ['환경 적응', '능력 제한', '첫 위기']
      };
    } else if (chapterNumber <= 5) {
      return {
        type: 'rising_action',
        focus: '적대 세력의 등장과 갈등 심화',
        intensity: 'high',
        elements: ['시간 수호단 추격', '윤슬의 비밀', '내적 갈등']
      };
    } else {
      return {
        type: 'climax_approach',
        focus: '최종 선택의 기로',
        intensity: 'extreme',
        elements: ['배신 폭로', '희생 결정', '운명적 대결']
      };
    }
  }

  /**
   * 적대 세력 선택
   */
  selectAntagonist(chapterNumber) {
    const antagonists = this.storyElements.antagonists;
    
    if (chapterNumber <= 3) {
      return antagonists.timeGuardians;
    } else if (chapterNumber <= 6) {
      return antagonists.paradoxHunters;
    } else {
      return antagonists.pastLover;
    }
  }

  /**
   * 시간 제약 선택
   */
  selectTimeConstraint(chapterNumber) {
    const constraints = this.storyElements.timeConstraints;
    
    if (chapterNumber <= 2) {
      return constraints.magicDepletion;
    } else if (chapterNumber <= 4) {
      return constraints.pastStayLimit;
    } else {
      return constraints.worldCollapse;
    }
  }

  /**
   * 캐릭터 발전 계획
   */
  planCharacterDevelopment(chapterNumber) {
    const secrets = this.storyElements.characterSecrets;
    
    return {
      yeon: {
        currentState: this.getYeonState(chapterNumber),
        development: this.getYeonDevelopment(chapterNumber),
        revealedSecret: this.getYeonSecretReveal(chapterNumber, secrets.yeonSecrets)
      },
      yunseul: {
        currentState: this.getYunseulState(chapterNumber),
        development: this.getYunseulDevelopment(chapterNumber),
        revealedSecret: this.getYunseulSecretReveal(chapterNumber, secrets.yunseulSecrets)
      }
    };
  }

  /**
   * 로맨스 진행 계획
   */
  planRomanceProgression(chapterNumber) {
    const obstacles = this.storyElements.romanceObstacles;
    
    if (chapterNumber <= 2) {
      return {
        stage: 'suspicion',
        emotion: '경계와 호기심',
        obstacle: obstacles.trustIssues,
        progression: '상호 견제하면서도 끌림'
      };
    } else if (chapterNumber <= 4) {
      return {
        stage: 'forced_cooperation',
        emotion: '어쩔 수 없는 협력과 이해',
        obstacle: obstacles.missionConflict,
        progression: '위기 상황에서 드러나는 진심'
      };
    } else {
      return {
        stage: 'crisis_and_choice',
        emotion: '배신감과 깊어지는 사랑',
        obstacle: obstacles.sacrificeChoice,
        progression: '선택의 기로에서 진정한 마음 확인'
      };
    }
  }

  /**
   * 플롯 트위스트 계획
   */
  planPlotTwist(chapterNumber) {
    const twists = [
      '윤슬이 시간 균열을 의도적으로 만들고 있었다는 사실',
      '이연의 시간 마법이 실제로는 세상을 더 망가뜨리고 있었다는 진실',
      '시간 수호단이 실제로는 선한 목적을 가지고 있었다는 반전',
      '윤슬의 과거 연인이 살아있으며 복수를 계획하고 있다는 사실',
      '이연 자신이 미래에서 온 존재가 아니라는 충격적 진실'
    ];
    
    if (chapterNumber >= 3 && Math.random() > 0.6) {
      return twists[Math.floor(Math.random() * twists.length)];
    }
    return null;
  }

  /**
   * 클리프행어 생성
   */
  generateCliffhanger(chapterNumber) {
    const cliffhangers = [
      '갑작스런 시간 수호단의 습격',
      '윤슬의 진짜 정체성 일부 노출',
      '이연의 마법력 급작스런 폭주',
      '과거 연인의 예상치 못한 등장',
      '시간 균열의 급작스런 확대',
      '배신자의 정체 일부 공개'
    ];
    
    return cliffhangers[Math.floor(Math.random() * cliffhangers.length)];
  }

  /**
   * 이연 상태 추적
   */
  getYeonState(chapterNumber) {
    const states = [
      '혼란스럽고 조심스러운 상태',
      '적응하며 의심을 품기 시작',
      '갈등과 책임감 사이에서 고민',
      '윤리적 딜레마에 직면',
      '최종 선택을 앞둔 절박한 상태'
    ];
    return states[Math.min(chapterNumber - 1, states.length - 1)];
  }

  /**
   * 윤슬 상태 추적
   */
  getYunseulState(chapterNumber) {
    const states = [
      '차가우면서도 도움을 주는 모순적 태도',
      '이연에 대한 복잡한 감정 표출',
      '과거 상처와 현재 감정 사이에서 갈등',
      '진짜 계획의 일부가 드러나기 시작',
      '선택의 기로에서 흔들리는 모습'
    ];
    return states[Math.min(chapterNumber - 1, states.length - 1)];
  }

  /**
   * 캐릭터 발전 로직들 (간략화)
   */
  getYeonDevelopment(chapterNumber) {
    return `챕터 ${chapterNumber}에서의 성장: 책임감과 개인적 욕망 사이의 갈등 심화`;
  }

  getYunseulDevelopment(chapterNumber) {
    return `챕터 ${chapterNumber}에서의 변화: 이연에 대한 진심과 숨겨진 계획 사이의 내적 갈등`;
  }

  getYeonSecretReveal(chapterNumber, secrets) {
    if (chapterNumber === 2) return secrets.powerCost;
    if (chapterNumber === 4) return secrets.ethicalDilemma;
    return null;
  }

  getYunseulSecretReveal(chapterNumber, secrets) {
    if (chapterNumber === 3) return secrets.hiddenPlan;
    if (chapterNumber === 5) return secrets.usingYeon;
    return null;
  }

  /**
   * 고급 프롬프트 생성
   */
  async generateAdvancedPrompt(novelInfo, chapterNumber, storyStructure) {
    return `
당신은 독자들이 "예측 불가능하고 긴장감 넘치는" 스토리를 요구하는 세계급 로맨스 판타지 작가입니다.

**CRITICAL 요구사항 - 무조건 포함:**

🔥 **갈등과 긴장감 (필수)**:
- 메인 갈등: ${storyStructure.mainConflict.focus}
- 적대 세력: ${storyStructure.antagonistRole.name} (${storyStructure.antagonistRole.description})
- 시간 제약: ${storyStructure.timeConstraint.description}
- 긴장감 레벨: ${storyStructure.mainConflict.intensity}

⚡ **캐릭터 복잡성 (필수)**:
- 이연 상태: ${storyStructure.characterDevelopment.yeon.currentState}
- 윤슬 상태: ${storyStructure.characterDevelopment.yunseul.currentState}
- 숨겨진 비밀 암시: ${storyStructure.characterDevelopment.yeon.revealedSecret || storyStructure.characterDevelopment.yunseul.revealedSecret || '서로에 대한 의심과 불신'}

💔 **로맨스 장애물 (필수)**:
- 현재 단계: ${storyStructure.romanceProgression.stage}
- 감정 상태: ${storyStructure.romanceProgression.emotion}
- 주요 장애: ${storyStructure.romanceProgression.obstacle}

🎭 **예측 불가능성 (필수)**:
${storyStructure.plotTwist ? `- 플롯 트위스트: ${storyStructure.plotTwist}` : '- 예상과 다른 전개나 반전 요소 포함'}
- 클리프행어: ${storyStructure.cliffhanger}

**FORBIDDEN (절대 사용 금지)**:
❌ "편안한", "따뜻한", "평화로운" 등 갈등 없는 표현
❌ "당연히", "예상대로", "역시" 등 예측 가능한 표현  
❌ 쉬운 해결책이나 우연한 발견
❌ 감정적 근거 없는 로맨스 진전

**MUST USE (반드시 사용)**:
✅ "긴장감", "의심", "갈등", "위기", "딜레마"
✅ "예상치 못한", "갑작스런", "뜻밖의"
✅ 캐릭터 간 신뢰 문제와 감정적 충돌
✅ 시간 압박과 절박함

**스토리 정보:**
- 제목: ${novelInfo.title}
- 챕터: ${chapterNumber}
- 줄거리: ${novelInfo.summary}

**품질 기준:**
- 갈등 수준: 8.0/10 이상
- 예측 불가능성: 7.0/10 이상  
- 캐릭터 복잡성: 8.0/10 이상
- 로맨스 긴장감: 8.0/10 이상

TITLE: [긴장감 있는 챕터 제목]

CONTENT:
[최소 2500자, 갈등과 긴장감이 넘치는 스토리]
`;
  }
}

export default AdvancedStoryArchitect;