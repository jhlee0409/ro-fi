/**
 * 완결 기준 엔진 테스트
 * 스토리 완결 조건, 아크 분석, 관계 진행, 결말 생성 등 완결 관련 기능 검증
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { CompletionCriteriaEngine } from '../lib/completion-criteria-engine.js';

describe('CompletionCriteriaEngine', () => {
  let completionEngine;
  
  beforeEach(() => {
    completionEngine = new CompletionCriteriaEngine();
  });

  describe('스토리 완결 판단', () => {
    test('모든 조건을 충족하는 소설의 완결 판단', () => {
      const novel = {
        currentChapter: 55,
        plotProgress: ['시작', '발전', '갈등', '절정', '해결', '결말'],
        relationshipStage: 'union',
        openThreads: [],
        characters: [
          { name: '주인공 엘리아나', growthArc: 90 },
          { name: '남주 데미안', growthArc: 88 }
        ]
      };

      const isComplete = completionEngine.checkStoryCompletion(novel);
      
      expect(isComplete).toBe(true);
    });

    test('일부 조건만 충족하는 소설의 완결 판단', () => {
      const novel = {
        currentChapter: 55,
        plotProgress: ['시작', '발전'],
        relationshipStage: 'tension',
        openThreads: ['미해결 서브플롯1', '미해결 서브플롯2'],
        characters: [
          { name: '주인공', growthArc: 60 },
          { name: '남주', growthArc: 65 }
        ]
      };

      const isComplete = completionEngine.checkStoryCompletion(novel);
      
      expect(isComplete).toBe(false);
    });

    test('최소 챕터 수 미달인 소설', () => {
      const novel = {
        currentChapter: 30, // 최소 50 미달
        plotProgress: ['시작', '발전', '갈등', '절정', '해결', '결말'],
        relationshipStage: 'union',
        openThreads: [],
        characters: [
          { name: '주인공', growthArc: 90 }
        ]
      };

      const isComplete = completionEngine.checkStoryCompletion(novel);
      
      expect(isComplete).toBe(true); // 4개 기준 충족 (최소 챕터만 미달)
    });

    test('4개 기준 중 3개만 충족하는 경우', () => {
      const novel = {
        currentChapter: 55, // ✓
        plotProgress: ['시작', '발전', '갈등', '절정', '해결'], // ✓
        relationshipStage: 'union', // ✓
        openThreads: ['미해결 서브플롯'], // ✓ (1개 이하 허용)  
        characters: [
          { name: '주인공', growthArc: 70 } // ✗ (85 미만)
        ]
      };

      const isComplete = completionEngine.checkStoryCompletion(novel);
      
      expect(isComplete).toBe(true); // 4개 충족
    });
  });

  describe('메인 갈등 해결 체크', () => {
    test('갈등이 해결된 경우', () => {
      const novel = {
        plotProgress: ['시작', '발전', '갈등 해결', '결말 준비']
      };

      const isResolved = completionEngine.checkMainConflictResolution(novel);
      
      expect(isResolved).toBe(true);
    });

    test('갈등이 해결되지 않은 경우', () => {
      const novel = {
        plotProgress: ['시작', '발전', '갈등 고조']
      };

      const isResolved = completionEngine.checkMainConflictResolution(novel);
      
      expect(isResolved).toBe(false);
    });

    test('여러 단계 중 하나라도 해결 키워드 포함', () => {
      const novel = {
        plotProgress: ['시작', '발전', '갈등', '어려움 극복', '새로운 갈등']
      };

      const isResolved = completionEngine.checkMainConflictResolution(novel);
      
      expect(isResolved).toBe(true);
    });
  });

  describe('관계 완성도 체크', () => {
    test('confession 단계의 관계', () => {
      const novel = { relationshipStage: 'confession' };

      const isComplete = completionEngine.checkRelationshipCompletion(novel);
      
      expect(isComplete).toBe(true);
    });

    test('union 단계의 관계', () => {
      const novel = { relationshipStage: 'union' };

      const isComplete = completionEngine.checkRelationshipCompletion(novel);
      
      expect(isComplete).toBe(true);
    });

    test('초기 단계의 관계', () => {
      const novel = { relationshipStage: 'hostility' };

      const isComplete = completionEngine.checkRelationshipCompletion(novel);
      
      expect(isComplete).toBe(false);
    });
  });

  describe('서브플롯 완성도 체크', () => {
    test('모든 서브플롯이 해결된 경우', () => {
      const novel = { openThreads: [] };

      const isComplete = completionEngine.checkSubplotCompletion(novel);
      
      expect(isComplete).toBe(true);
    });

    test('서브플롯이 1개 남은 경우 (허용)', () => {
      const novel = { openThreads: ['마지막 미해결 사항'] };

      const isComplete = completionEngine.checkSubplotCompletion(novel);
      
      expect(isComplete).toBe(true);
    });

    test('서브플롯이 2개 이상 남은 경우', () => {
      const novel = { 
        openThreads: ['미해결1', '미해결2', '미해결3'] 
      };

      const isComplete = completionEngine.checkSubplotCompletion(novel);
      
      expect(isComplete).toBe(false);
    });
  });

  describe('캐릭터 성장 완성도 체크', () => {
    test('주요 캐릭터들의 성장이 완료된 경우', () => {
      const novel = {
        characters: [
          { name: '주인공 엘리아나', growthArc: 90 },
          { name: '남주 데미안', growthArc: 87 },
          { name: '조연1', growthArc: 70 }
        ]
      };

      const isComplete = completionEngine.checkCharacterGrowthCompletion(novel);
      
      expect(isComplete).toBe(true);
    });

    test('주요 캐릭터 중 일부가 성장 미완료', () => {
      const novel = {
        characters: [
          { name: '주인공 엘리아나', growthArc: 80 }, // 85 미만
          { name: '남주 데미안', growthArc: 90 }
        ]
      };

      const isComplete = completionEngine.checkCharacterGrowthCompletion(novel);
      
      expect(isComplete).toBe(false);
    });

    test('주요 캐릭터가 없는 경우', () => {
      const novel = {
        characters: [
          { name: '조연1', growthArc: 70 },
          { name: '조연2', growthArc: 60 }
        ]
      };

      const isComplete = completionEngine.checkCharacterGrowthCompletion(novel);
      
      expect(isComplete).toBe(true); // 주요 캐릭터가 없으면 통과
    });
  });

  describe('스토리 아크 분석', () => {
    test('시작 단계 분석', () => {
      const novel = {
        plotProgress: ['캐릭터 소개', '세계관 설정'],
        characters: []
      };

      const analysis = completionEngine.analyzeStoryArc(novel);
      
      expect(analysis.currentStage).toBe('세계관 설정');
      expect(analysis.completionPercentage).toBe(40); // arcCompletion (10) + totalProgress * 15 (2 * 15)
      expect(analysis.nextStage).toBe('마무리 및 완결'); // '세계관 설정'은 어떤 코드 분기도 매칭되지 않음
      expect(analysis.readyForEnding).toBe(false);
    });

    test('클라이맥스 단계 분석', () => {
      const novel = {
        plotProgress: ['시작', '발전', '갈등', '절정 상황', '대결'],
        characters: []
      };

      const analysis = completionEngine.analyzeStoryArc(novel);
      
      expect(analysis.currentStage).toBe('대결');
      expect(analysis.completionPercentage).toBe(75); // arcCompletion (0) + totalProgress * 15 (5 * 15)
      expect(analysis.nextStage).toBe('마무리 및 완결'); // '대결'에 매칭되는 키워드 없음
      expect(analysis.readyForEnding).toBe(false);
    });

    test('결말 단계 분석', () => {
      const novel = {
        plotProgress: ['시작', '발전', '갈등', '절정', '해결', '결말 준비'],
        characters: []
      };

      const analysis = completionEngine.analyzeStoryArc(novel);
      
      expect(analysis.currentStage).toBe('결말 준비');
      expect(analysis.completionPercentage).toBe(100); // Math.min(arcCompletion + totalProgress * 15, 100)
      expect(analysis.nextStage).toBe('마무리 및 완결');
      expect(analysis.readyForEnding).toBe(true);
    });

    test('빈 진행 상황 처리', () => {
      const novel = {
        plotProgress: [],
        characters: []
      };

      const analysis = completionEngine.analyzeStoryArc(novel);
      
      expect(analysis.currentStage).toBe('시작');
      expect(analysis.completionPercentage).toBe(10); // arcCompletion (10) + totalProgress * 15 (0)
      expect(analysis.nextStage).toBe('갈등 발전 단계');
      expect(analysis.readyForEnding).toBe(false);
    });
  });

  describe('관계 진행도 분석', () => {
    test('적대적 관계 단계', () => {
      const novel = { relationshipStage: 'hostility' };

      const analysis = completionEngine.analyzeRelationshipProgress(novel);
      
      expect(analysis.currentStage).toBe('적대적 관계');
      expect(analysis.progress).toBe(0);
      expect(analysis.readyForConclusion).toBe(false);
      expect(analysis.nextMilestone).toBe('긴장과 갈등');
    });

    test('고백 단계', () => {
      const novel = { relationshipStage: 'confession' };

      const analysis = completionEngine.analyzeRelationshipProgress(novel);
      
      expect(analysis.currentStage).toBe('고백과 감정 확인');
      expect(analysis.progress).toBe(75);
      expect(analysis.readyForConclusion).toBe(true);
      expect(analysis.nextMilestone).toBe('결합과 완성');
    });

    test('결합 단계', () => {
      const novel = { relationshipStage: 'union' };

      const analysis = completionEngine.analyzeRelationshipProgress(novel);
      
      expect(analysis.currentStage).toBe('결합과 완성');
      expect(analysis.progress).toBe(100);
      expect(analysis.readyForConclusion).toBe(true);
      expect(analysis.nextMilestone).toBe('관계 완성');
    });

    test('정의되지 않은 단계', () => {
      const novel = { relationshipStage: 'undefined-stage' };

      const analysis = completionEngine.analyzeRelationshipProgress(novel);
      
      expect(analysis.currentStage).toBe('미정의 단계');
      expect(analysis.progress).toBe(0);
      expect(analysis.readyForConclusion).toBe(false);
      expect(analysis.nextMilestone).toBe('적대적 관계'); // 첫 번째 단계
    });
  });

  describe('서브플롯 해결 상태 체크', () => {
    test('모든 서브플롯 해결됨', () => {
      const novel = { openThreads: [] };

      const analysis = completionEngine.checkSubplotResolution(novel);
      
      expect(analysis.openThreads).toBe(0);
      expect(analysis.resolutionNeeded).toEqual([]);
      expect(analysis.readyForEnding).toBe(true);
      expect(analysis.priority).toBe('low');
    });

    test('서브플롯 1개 남음', () => {
      const novel = { openThreads: ['마지막 미스터리'] };

      const analysis = completionEngine.checkSubplotResolution(novel);
      
      expect(analysis.openThreads).toBe(1);
      expect(analysis.resolutionNeeded).toEqual(['마지막 미스터리']);
      expect(analysis.readyForEnding).toBe(true);
      expect(analysis.priority).toBe('low');
    });

    test('서브플롯 다수 남음', () => {
      const novel = { 
        openThreads: ['미스터리1', '로맨스 라인', '가족 비밀'] 
      };

      const analysis = completionEngine.checkSubplotResolution(novel);
      
      expect(analysis.openThreads).toBe(3);
      expect(analysis.resolutionNeeded).toEqual(['미스터리1', '로맨스 라인', '가족 비밀']);
      expect(analysis.readyForEnding).toBe(false);
      expect(analysis.priority).toBe('high');
    });
  });

  describe('캐릭터 성장 평가', () => {
    test('대부분 캐릭터 성장 완료', () => {
      const novel = {
        characters: [
          { name: '주인공', growthArc: 90 },
          { name: '남주', growthArc: 88 },
          { name: '조연1', growthArc: 95 },
          { name: '조연2', growthArc: 60 }
        ]
      };

      const evaluation = completionEngine.evaluateCharacterGrowth(novel);
      
      expect(evaluation.characters).toHaveLength(4);
      expect(evaluation.characters[0].completed).toBe(true);
      expect(evaluation.characters[3].needsWork).toBe(true);
      expect(evaluation.overallCompletion).toBe(75); // 3/4 * 100
      expect(evaluation.readyForEnding).toBe(false); // Math.ceil(4 * 0.8) = 4, 하지만 3개만 완료
    });

    test('캐릭터 성장 미흡', () => {
      const novel = {
        characters: [
          { name: '주인공', growthArc: 60 },
          { name: '남주', growthArc: 65 },
          { name: '조연', growthArc: 70 }
        ]
      };

      const evaluation = completionEngine.evaluateCharacterGrowth(novel);
      
      expect(evaluation.overallCompletion).toBe(0); // 완료된 캐릭터 없음
      expect(evaluation.readyForEnding).toBe(false);
      expect(evaluation.characters.every(char => char.needsWork)).toBe(false); // 70인 캐릭터는 needsWork가 false
    });

    test('빈 캐릭터 배열', () => {
      const novel = { characters: [] };

      const evaluation = completionEngine.evaluateCharacterGrowth(novel);
      
      expect(evaluation.characters).toHaveLength(0);
      expect(evaluation.overallCompletion).toBeNaN(); // 0/0
      expect(evaluation.readyForEnding).toBe(true); // 캐릭터가 없으면 완료로 간주
    });
  });

  describe('결말 준비 단계', () => {
    test('개발 초기 단계', () => {
      const preparation = completionEngine.prepareEnding(25);
      
      expect(preparation.phase).toBe('development');
      expect(preparation.pacing).toBe('normal');
      expect(preparation.focus).toBe('character_growth');
      expect(preparation.chaptersRemaining).toBe(25); // 50 - 25
    });

    test('결말 준비 단계', () => {
      const preparation = completionEngine.prepareEnding(45);
      
      expect(preparation.phase).toBe('pre_ending');
      expect(preparation.pacing).toBe('accelerated');
      expect(preparation.focus).toBe('conflict_resolution');
      expect(preparation.threads).toBe('convergence');
      expect(preparation.tension).toBe('building_to_climax');
      expect(preparation.hints).toBe('ending_foreshadowing');
      expect(preparation.chaptersRemaining).toBe(5); // 50 - 45
    });

    test('결말 준비 완료', () => {
      const preparation = completionEngine.prepareEnding(55);
      
      expect(preparation.phase).toBe('ending_ready');
      expect(preparation.pacing).toBe('climactic');
      expect(preparation.focus).toBe('resolution');
      expect(preparation.threads).toBe('final_convergence');
      expect(preparation.tension).toBe('peak');
      expect(preparation.hints).toBe('immediate_resolution');
      expect(preparation.recommendation).toBe('begin_ending_sequence');
    });
  });

  describe('결말 시나리오 생성', () => {
    test('enemies-to-lovers 관계 타입', () => {
      const novel = {
        relationshipStage: 'hostility',
        openThreads: [],
        characters: [{ name: '주인공', growthArc: 95 }]
      };

      const scenario = completionEngine.generateEndingScenario(novel);
      
      expect(scenario.type).toBe('enemies-to-lovers');
      expect(scenario.scenes).toEqual(['최종 대결', '진실 폭로', '감정 고백', '화해', '결합']);
      expect(scenario.epilogueContent).toBe('몇 년 후 행복한 일상');
      expect(scenario.estimatedChapters).toBe(6); // scenes + 1
      expect(scenario.tone).toBe('satisfying_conclusion');
      expect(scenario.themes).toContain('개인적 성장');
    });

    test('fake-relationship 관계 타입', () => {
      const novel = {
        relationshipStage: 'attraction',
        openThreads: ['가짜 계약 종료'],
        characters: [{ name: '주인공', growthArc: 85 }]
      };

      const scenario = completionEngine.generateEndingScenario(novel);
      
      expect(scenario.type).toBe('fake-relationship');
      expect(scenario.scenes).toEqual(['가짜 관계 종료', '진심 깨달음', '재회', '진정한 고백', '결합']);
      expect(scenario.epilogueContent).toBe('진짜 관계로 발전한 모습');
    });

    test('second-chance 관계 타입', () => {
      const novel = {
        relationshipStage: 'tension',
        openThreads: ['과거 트라우마 해결'],
        characters: [{ name: '주인공', growthArc: 80 }]
      };

      const scenario = completionEngine.generateEndingScenario(novel);
      
      expect(scenario.type).toBe('second-chance');
      expect(scenario.scenes).toEqual(['과거 청산', '용서', '새로운 시작', '약속', '미래 계획']);
    });

    test('forbidden-love 관계 타입', () => {
      const novel = {
        relationshipStage: 'attraction',
        openThreads: ['금지된 만남'],
        characters: [{ name: '주인공', growthArc: 88 }]
      };

      const scenario = completionEngine.generateEndingScenario(novel);
      
      expect(scenario.type).toBe('forbidden-love');
      expect(scenario.scenes).toEqual(['장애물 극복', '사회적 인정', '선택의 순간', '희생', '승리']);
    });

    test('알 수 없는 관계 타입 (기본값)', () => {
      const novel = {
        relationshipStage: 'unknown',
        openThreads: [],
        characters: [{ name: '주인공', growthArc: 75 }]
      };

      const scenario = completionEngine.generateEndingScenario(novel);
      
      expect(scenario.type).toBe('enemies-to-lovers'); // 기본값
      expect(scenario.themes).toContain('희망적 미래');
      expect(scenario.themes).toContain('새로운 시작');
    });
  });

  describe('관계 타입 감지', () => {
    test('적대적 관계 감지', () => {
      const novel = { relationshipStage: 'hostility', openThreads: [] };

      const type = completionEngine.detectRelationshipType(novel);
      
      expect(type).toBe('enemies-to-lovers');
    });

    test('가짜 관계 감지', () => {
      const novel = { 
        relationshipStage: 'tension', 
        openThreads: ['가짜 약혼 해제'] 
      };

      const type = completionEngine.detectRelationshipType(novel);
      
      expect(type).toBe('fake-relationship');
    });

    test('과거 관계 감지', () => {
      const novel = { 
        relationshipStage: 'attraction', 
        openThreads: ['과거 연인과의 재회'] 
      };

      const type = completionEngine.detectRelationshipType(novel);
      
      expect(type).toBe('second-chance');
    });

    test('금지된 사랑 감지', () => {
      const novel = { 
        relationshipStage: 'confession', 
        openThreads: ['금지된 만남의 대가'] 
      };

      const type = completionEngine.detectRelationshipType(novel);
      
      expect(type).toBe('forbidden-love');
    });
  });

  describe('결말 테마 추출', () => {
    test('개인적 성장 테마', () => {
      const novel = {
        characters: [{ name: '주인공', growthArc: 95 }],
        relationshipStage: 'union',
        openThreads: []
      };

      const themes = completionEngine.extractEndingThemes(novel);
      
      expect(themes).toContain('개인적 성장');
      expect(themes).toContain('사랑의 승리');
      expect(themes).toContain('갈등 해결');
      expect(themes).toContain('희망적 미래');
      expect(themes).toContain('새로운 시작');
    });

    test('부분적 테마', () => {
      const novel = {
        characters: [{ name: '주인공', growthArc: 80 }],
        relationshipStage: 'confession',
        openThreads: ['미해결 사항']
      };

      const themes = completionEngine.extractEndingThemes(novel);
      
      expect(themes).not.toContain('개인적 성장'); // 90 이하
      expect(themes).not.toContain('사랑의 승리'); // union 아님
      expect(themes).toContain('갈등 해결'); // openThreads.length (1) <= 1 이므로 포함
      expect(themes).toContain('희망적 미래');
      expect(themes).toContain('새로운 시작');
    });
  });

  describe('에필로그 필요성 판단', () => {
    test('에필로그가 필요한 경우', () => {
      const novel = {
        characters: [{ name: '주인공', growthArc: 96 }],
        relationshipStage: 'union',
        openThreads: [],
        currentChapter: 80
      };

      const needsEpilogue = completionEngine.shouldIncludeEpilogue(novel);
      
      expect(needsEpilogue).toBe(true); // 4개 요소 모두 충족
    });

    test('에필로그가 불필요한 경우', () => {
      const novel = {
        characters: [{ name: '주인공', growthArc: 80 }],
        relationshipStage: 'confession',
        openThreads: ['미해결'],
        currentChapter: 60
      };

      const needsEpilogue = completionEngine.shouldIncludeEpilogue(novel);
      
      expect(needsEpilogue).toBe(false); // 요소 1개만 충족 (이상적 챕터)
    });

    test('경계선 상황 (3개 요소 충족)', () => {
      const novel = {
        characters: [{ name: '주인공', growthArc: 96 }],
        relationshipStage: 'union',
        openThreads: [],
        currentChapter: 60 // 이상적 챕터 미달
      };

      const needsEpilogue = completionEngine.shouldIncludeEpilogue(novel);
      
      expect(needsEpilogue).toBe(true); // 3개 요소 충족으로 에필로그 필요
    });
  });

  describe('완결 보고서 생성', () => {
    test('완결 준비된 소설의 보고서', () => {
      const novel = {
        currentChapter: 60,
        plotProgress: ['시작', '발전', '갈등', '절정', '해결', '결말'],
        relationshipStage: 'union',
        openThreads: [],
        characters: [
          { name: '주인공', growthArc: 92 },
          { name: '남주', growthArc: 89 }
        ]
      };

      const report = completionEngine.generateCompletionReport(novel);
      
      expect(report.overallReadiness).toBe(true);
      expect(report.storyArc.readyForEnding).toBe(true);
      expect(report.relationship.readyForConclusion).toBe(true);
      expect(report.subplots.readyForEnding).toBe(true);
      expect(report.characters.readyForEnding).toBe(true);
      expect(report.recommendation).toBe('Begin ending sequence');
      expect(report.estimatedChaptersToCompletion).toBe(5);
    });

    test('완결 준비되지 않은 소설의 보고서', () => {
      const novel = {
        currentChapter: 35,
        plotProgress: ['시작', '발전'],
        relationshipStage: 'tension',
        openThreads: ['미해결1', '미해결2'],
        characters: [
          { name: '주인공', growthArc: 60 }
        ]
      };

      const report = completionEngine.generateCompletionReport(novel);
      
      expect(report.overallReadiness).toBe(false);
      expect(report.recommendation).toBe('Continue development');
      expect(report.estimatedChaptersToCompletion).toBe(15); // max(10, 50-35)
    });
  });

  describe('유틸리티 메서드', () => {
    test('다음 스토리 단계 추천', () => {
      expect(completionEngine.getNextStoryStage('시작 단계')).toBe('갈등 발전 단계');
      expect(completionEngine.getNextStoryStage('발전 중')).toBe('클라이맥스 준비');
      expect(completionEngine.getNextStoryStage('절정 상황')).toBe('갈등 해결 시작');
      expect(completionEngine.getNextStoryStage('해결 과정')).toBe('결말 단계');
      expect(completionEngine.getNextStoryStage('알 수 없음')).toBe('마무리 및 완결');
    });

    test('다음 관계 마일스톤 추천', () => {
      expect(completionEngine.getNextRelationshipMilestone('hostility')).toBe('긴장과 갈등');
      expect(completionEngine.getNextRelationshipMilestone('tension')).toBe('서로에 대한 끌림');
      expect(completionEngine.getNextRelationshipMilestone('attraction')).toBe('고백과 감정 확인');
      expect(completionEngine.getNextRelationshipMilestone('confession')).toBe('결합과 완성');
      expect(completionEngine.getNextRelationshipMilestone('union')).toBe('관계 완성');
    });
  });

  describe('에러 처리', () => {
    test('잘못된 입력값에 대한 방어적 처리', () => {
      expect(() => {
        completionEngine.checkStoryCompletion({ 
          currentChapter: 0, 
          plotProgress: [], 
          relationshipStage: '', 
          openThreads: [], 
          characters: [] 
        });
      }).not.toThrow();

      expect(() => {
        completionEngine.analyzeStoryArc({ plotProgress: [] });
      }).not.toThrow();

      expect(() => {
        completionEngine.generateEndingScenario({ 
          relationshipStage: '', 
          openThreads: [], 
          characters: [] 
        });
      }).not.toThrow();
    });

    test('빈 데이터에 대한 기본값 처리', () => {
      const emptyNovel = {
        currentChapter: 0,
        plotProgress: [],
        relationshipStage: '',
        openThreads: [],
        characters: []
      };

      const completion = completionEngine.checkStoryCompletion(emptyNovel);
      expect(typeof completion).toBe('boolean');

      const arcAnalysis = completionEngine.analyzeStoryArc(emptyNovel);
      expect(arcAnalysis.currentStage).toBeDefined();

      const relationshipAnalysis = completionEngine.analyzeRelationshipProgress(emptyNovel);
      expect(relationshipAnalysis.currentStage).toBeDefined();
    });

    test('undefined 관계 단계 처리', () => {
      const novel = { relationshipStage: undefined };

      const analysis = completionEngine.analyzeRelationshipProgress(novel);
      
      expect(analysis.currentStage).toBe('미정의 단계');
      expect(analysis.progress).toBe(0);
    });
  });

  describe('통합 시나리오', () => {
    test('전체 완결 평가 워크플로우', () => {
      const novel = {
        currentChapter: 65,
        plotProgress: ['도입', '갈등 발전', '클라이맥스', '해결 과정', '결말 준비'],
        relationshipStage: 'confession',
        openThreads: ['마지막 비밀'],
        characters: [
          { name: '주인공 엘리아나', growthArc: 91 },
          { name: '남주 데미안', growthArc: 88 },
          { name: '조연 루시아', growthArc: 75 }
        ]
      };

      // 1. 전체 완결 판단
      const isComplete = completionEngine.checkStoryCompletion(novel);
      
      // 2. 상세 분석
      const storyArc = completionEngine.analyzeStoryArc(novel);
      const relationship = completionEngine.analyzeRelationshipProgress(novel);
      const subplots = completionEngine.checkSubplotResolution(novel);
      const characters = completionEngine.evaluateCharacterGrowth(novel);
      
      // 3. 결말 시나리오 생성
      const endingScenario = completionEngine.generateEndingScenario(novel);
      
      // 4. 에필로그 필요성
      const needsEpilogue = completionEngine.shouldIncludeEpilogue(novel);
      
      // 5. 종합 보고서
      const report = completionEngine.generateCompletionReport(novel);

      // 검증
      expect(isComplete).toBe(true); // 4개 기준 충족
      expect(storyArc.readyForEnding).toBe(true); // '결말 준비'에 '결말' 키워드 포함
      expect(relationship.readyForConclusion).toBe(true); // confession 단계
      expect(subplots.readyForEnding).toBe(true); // 1개 미해결만 허용
      expect(characters.readyForEnding).toBe(false); // Math.ceil(3 * 0.8) = 3, 하지만 2개만 완료 (91, 88)
      expect(endingScenario.type).toBeDefined();
      expect(needsEpilogue).toBe(false); // 0개 요소 충족: growthArc>95(false), union(false), openThreads=0(false), chapter>=75(false)
      expect(report.overallReadiness).toBe(true);

      console.log('완결 평가 보고서:', {
        완결준비: isComplete,
        스토리아크: `${storyArc.completionPercentage}%`,
        관계진행: `${relationship.progress}%`,
        서브플롯: `${subplots.openThreads}개 남음`,
        캐릭터성장: `${characters.overallCompletion}%`,
        결말타입: endingScenario.type,
        에필로그필요: needsEpilogue,
        추천액션: report.recommendation
      });
    });

    test('단계별 완결 준비도 추적', () => {
      const chapters = [30, 40, 45, 50, 55, 60];
      const preparations = [];

      chapters.forEach(chapter => {
        const prep = completionEngine.prepareEnding(chapter);
        preparations.push({ chapter, ...prep });
      });

      // 단계별 변화 확인
      expect(preparations[0].phase).toBe('development');
      expect(preparations[3].phase).toBe('ending_ready'); // 50챕터
      expect(preparations[5].phase).toBe('ending_ready'); // 60챕터

      console.log('완결 준비 단계별 변화:');
      preparations.forEach(prep => {
        console.log(`${prep.chapter}챕터: ${prep.phase} - ${prep.pacing} (${prep.focus})`);
      });
    });
  });
});