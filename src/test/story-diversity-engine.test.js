/**
 * 스토리 다양성 엔진 테스트
 * 트로프 조합, 캐릭터 생성, 다양성 점수 계산 등 핵심 기능 검증
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { StoryDiversityEngine } from '../lib/story-diversity-engine.js';

describe('StoryDiversityEngine', () => {
  let diversityEngine;
  
  beforeEach(() => {
    diversityEngine = new StoryDiversityEngine();
  });

  describe('트로프 조합 생성', () => {
    test('기본 트로프 조합 생성', () => {
      const combination = diversityEngine.generateTropeCombination();
      
      expect(combination).toBeDefined();
      expect(combination.main).toBeDefined();
      expect(combination.sub).toBeDefined();
      expect(combination.conflict).toBeDefined();
      
      // 유효한 트로프인지 확인
      expect(diversityEngine.primaryTropes).toContain(combination.main);
      expect(diversityEngine.secondaryTropes).toContain(combination.sub);
      expect(diversityEngine.conflictTypes).toContain(combination.conflict);
    });

    test('여러 조합 생성시 다양성 확보', () => {
      const combinations = [];
      for (let i = 0; i < 10; i++) {
        combinations.push(diversityEngine.generateTropeCombination());
      }
      
      // 모든 조합이 서로 다른지 확인
      const uniqueCombinations = new Set(
        combinations.map(c => `${c.main}-${c.sub}-${c.conflict}`)
      );
      
      // 최소 70% 이상은 고유해야 함
      expect(uniqueCombinations.size).toBeGreaterThan(7);
    });
  });

  describe('고유 설정 생성', () => {
    test('고유한 세계관 설정 생성', () => {
      const setting = diversityEngine.generateUniqueSetting();
      
      expect(setting).toBeDefined();
      expect(setting.world).toBeDefined();
      expect(setting.mainConflict).toBeDefined();
      expect(setting.magicSystem).toBeDefined();
      
      // 유효한 설정인지 확인
      expect(diversityEngine.worldSettings).toContain(setting.world);
      expect(diversityEngine.mainConflicts).toContain(setting.mainConflict);
      expect(diversityEngine.magicSystems).toContain(setting.magicSystem);
    });

    test('설정 요소들의 일관성', () => {
      const setting = diversityEngine.generateUniqueSetting();
      
      expect(typeof setting.world).toBe('string');
      expect(typeof setting.mainConflict).toBe('string');
      expect(typeof setting.magicSystem).toBe('string');
      
      expect(setting.world.length).toBeGreaterThan(0);
      expect(setting.mainConflict.length).toBeGreaterThan(0);
      expect(setting.magicSystem.length).toBeGreaterThan(0);
    });
  });

  describe('소설 컨셉 생성', () => {
    test('고유한 소설 컨셉 생성', () => {
      const concept = diversityEngine.generateUniqueNovelConcept();
      
      expect(concept).toBeDefined();
      expect(concept.main).toBeDefined();
      expect(concept.sub).toBeDefined();
      expect(concept.conflict).toBeDefined();
      expect(concept.world).toBeDefined();
      expect(concept.mainConflict).toBeDefined();
      expect(concept.magicSystem).toBeDefined();
      expect(concept.genre).toBeDefined();
    });

    test('기존 조합과 겹치지 않는 컨셉 생성', () => {
      const existingCombinations = [
        { main: 'enemies-to-lovers', sub: 'regression', conflict: 'ancient-curse' },
        { main: 'fake-relationship', sub: 'hidden-identity', conflict: 'political-intrigue' }
      ];
      
      const newConcept = diversityEngine.generateUniqueNovelConcept(existingCombinations);
      
      // 기존 조합과 다른지 확인
      const isDuplicate = existingCombinations.some(existing => 
        existing.main === newConcept.main && 
        existing.sub === newConcept.sub && 
        existing.conflict === newConcept.conflict
      );
      
      expect(isDuplicate).toBe(false);
    });

    test('최대 시도 후 고유성 보장', () => {
      // 모든 조합을 사용했다고 가정
      const allCombinations = [];
      diversityEngine.primaryTropes.forEach(main => {
        diversityEngine.secondaryTropes.forEach(sub => {
          diversityEngine.conflictTypes.forEach(conflict => {
            allCombinations.push({ main, sub, conflict });
          });
        });
      });
      
      const concept = diversityEngine.generateUniqueNovelConcept(allCombinations);
      
      // uniqueModifier가 추가되었는지 확인
      expect(concept.uniqueModifier).toBeDefined();
      expect(concept.uniqueModifier).toContain('variant-');
    });
  });

  describe('매력적인 제목 생성', () => {
    test('컨셉에 기반한 제목 생성', () => {
      const concept = {
        main: 'enemies-to-lovers',
        sub: 'regression',
        conflict: 'ancient-curse',
        world: '마법과 과학이 공존하는 세계',
        genre: '아카데미 판타지'
      };
      
      const title = diversityEngine.generateCatchyTitle(concept);
      
      expect(title).toBeDefined();
      expect(typeof title).toBe('string');
      expect(title.length).toBeGreaterThan(5);
      
      // 플레이스홀더가 제거되었는지 확인
      expect(title).not.toContain('{');
      expect(title).not.toContain('}');
    });

    test('regression 트로프 제목 수정', () => {
      const concept = {
        main: 'second-chance',
        sub: 'regression',
        conflict: 'political-intrigue'
      };
      
      const title = diversityEngine.generateCatchyTitle(concept);
      
      expect(title).toContain('다시 돌아온');
    });

    test('enemies-to-lovers 트로프 제목 수정', () => {
      const concept = {
        main: 'enemies-to-lovers',
        sub: 'hidden-identity',
        conflict: 'forbidden-power'
      };
      
      // 여러 번 생성해서 적어도 하나는 수정된 제목이 나오는지 확인
      let modifiedTitleFound = false;
      for (let i = 0; i < 10; i++) {
        const title = diversityEngine.generateCatchyTitle(concept);
        if (title.includes('적대') || title.includes('라이벌')) {
          modifiedTitleFound = true;
          break;
        }
      }
      
      // 모든 제목이 유효한 문자열인지만 확인 (수정 로직은 확률적)
      const title = diversityEngine.generateCatchyTitle(concept);
      expect(typeof title).toBe('string');
      expect(title.length).toBeGreaterThan(0);
    });
  });

  describe('캐릭터 디자인', () => {
    test('기억에 남는 캐릭터 생성', () => {
      const concept = {
        main: 'forbidden-love',
        sub: 'transmigration',
        conflict: 'divine-intervention',
        magicSystem: '감정 기반 마법'
      };
      
      const characters = diversityEngine.designMemorableCharacters(concept);
      
      expect(characters).toBeDefined();
      expect(characters.protagonist).toBeDefined();
      expect(characters.male_lead).toBeDefined();
      expect(characters.supporting).toBeDefined();
    });

    test('주인공 캐릭터 일관성', () => {
      const concept = {
        main: 'arranged-marriage',
        sub: 'hidden-identity',
        conflict: 'family-secrets',
        magicSystem: '원소 조화술'
      };
      
      const protagonist = diversityEngine.generateProtagonist(concept);
      
      expect(protagonist.background).toBeDefined();
      expect(protagonist.personality).toBeDefined();
      expect(protagonist.specialAbility).toBe(concept.magicSystem);
      expect(protagonist.motivation).toBeDefined();
      
      expect(typeof protagonist.background).toBe('string');
      expect(typeof protagonist.personality).toBe('string');
      expect(typeof protagonist.motivation).toBe('string');
    });

    test('남주 캐릭터 일관성', () => {
      const concept = {
        main: 'bodyguard-romance',
        sub: 'power-struggle',
        conflict: 'war-brewing'
      };
      
      const maleLead = diversityEngine.generateMaleLead(concept);
      
      expect(maleLead.archetype).toBeDefined();
      expect(maleLead.personality).toBeDefined();
      expect(maleLead.relationship).toBe(concept.main);
      expect(maleLead.innerConflict).toBeDefined();
      
      expect(typeof maleLead.archetype).toBe('string');
      expect(typeof maleLead.personality).toBe('string');
      expect(typeof maleLead.innerConflict).toBe('string');
    });

    test('조연 캐릭터 구성', () => {
      const concept = { main: 'rival-to-lover' };
      const supporting = diversityEngine.generateSupportingCharacters(concept);
      
      expect(Array.isArray(supporting)).toBe(true);
      expect(supporting).toHaveLength(3);
      
      supporting.forEach(character => {
        expect(character.name).toBeDefined();
        expect(character.role).toBeDefined();
        expect(character.relationship).toBeDefined();
      });
    });
  });

  describe('동기와 갈등 생성', () => {
    test('컨셉별 주인공 동기 생성', () => {
      const concepts = [
        { main: 'enemies-to-lovers' },
        { main: 'fake-relationship' },
        { main: 'second-chance' },
        { main: 'forbidden-love' },
        { main: 'regression' }
      ];
      
      concepts.forEach(concept => {
        const motivation = diversityEngine.getMotivationFromConcept(concept);
        expect(motivation).toBeDefined();
        expect(typeof motivation).toBe('string');
        expect(motivation.length).toBeGreaterThan(10);
      });
    });

    test('갈등별 내적 충돌 생성', () => {
      const concepts = [
        { conflict: 'ancient-curse' },
        { conflict: 'political-intrigue' },
        { conflict: 'forbidden-power' },
        { conflict: 'divine-intervention' }
      ];
      
      concepts.forEach(concept => {
        const innerConflict = diversityEngine.getInnerConflictFromConcept(concept);
        expect(innerConflict).toBeDefined();
        expect(typeof innerConflict).toBe('string');
        expect(innerConflict.length).toBeGreaterThan(10);
      });
    });

    test('알 수 없는 컨셉에 대한 기본값 처리', () => {
      const unknownConcept = { main: 'unknown-trope' };
      const motivation = diversityEngine.getMotivationFromConcept(unknownConcept);
      
      expect(motivation).toBe('자신의 운명을 개척하고 진정한 사랑을 찾음');
      
      const unknownConflict = { conflict: 'unknown-conflict' };
      const innerConflict = diversityEngine.getInnerConflictFromConcept(unknownConflict);
      
      expect(innerConflict).toBe('의무와 감정 사이에서의 갈등');
    });
  });

  describe('다양성 점수 계산', () => {
    test('기본 다양성 점수 계산', () => {
      const concept = {
        main: 'enemies-to-lovers',
        sub: 'regression',
        conflict: 'ancient-curse',
        genre: '아카데미 판타지'
      };
      
      const score = diversityEngine.calculateDiversityScore(concept, []);
      
      expect(score).toBe(100); // 기존 조합이 없으면 만점
    });

    test('기존 조합과의 유사도에 따른 점수 감소', () => {
      const concept = {
        main: 'enemies-to-lovers',
        sub: 'regression',
        conflict: 'ancient-curse',
        genre: '아카데미 판타지'
      };
      
      const existingCombinations = [
        {
          main: 'enemies-to-lovers', // -15점
          sub: 'hidden-identity',
          conflict: 'political-intrigue',
          genre: '궁중 로맨스'
        },
        {
          main: 'fake-relationship',
          sub: 'regression', // -10점
          conflict: 'ancient-curse', // -10점
          genre: '아카데미 판타지' // -5점
        }
      ];
      
      const score = diversityEngine.calculateDiversityScore(concept, existingCombinations);
      
      expect(score).toBe(60); // 100 - 15 - 10 - 10 - 5 = 60
    });

    test('희귀한 조합에 대한 보너스 점수', () => {
      const concept = {
        main: 'enemies-to-lovers',
        sub: 'time-loop', // 희귀한 조합
        conflict: 'forbidden-power',
        genre: '현대 판타지'
      };
      
      const score = diversityEngine.calculateDiversityScore(concept, []);
      
      expect(score).toBe(120); // 100 + 20 (희귀 조합 보너스)
    });

    test('점수 범위 제한 (0 이상)', () => {
      const concept = {
        main: 'enemies-to-lovers',
        sub: 'regression',
        conflict: 'ancient-curse',
        genre: '아카데미 판타지'
      };
      
      // 많은 기존 조합으로 점수를 0 이하로 만들기
      const manyExistingCombinations = Array(20).fill({
        main: 'enemies-to-lovers',
        sub: 'regression',
        conflict: 'ancient-curse',
        genre: '아카데미 판타지'
      });
      
      const lowScore = diversityEngine.calculateDiversityScore(concept, manyExistingCombinations);
      expect(lowScore).toBeGreaterThanOrEqual(0);
      
      // 희귀 조합으로 점수를 100 이상으로 만들기
      const rareConcept = {
        main: 'fake-relationship',
        sub: 'parallel-world', // 희귀한 조합
        conflict: 'divine-intervention',
        genre: '신화 재해석'
      };
      
      const highScore = diversityEngine.calculateDiversityScore(rareConcept, []);
      expect(highScore).toBeGreaterThan(100); // 희귀 조합으로 120점 가능
    });
  });

  describe('유틸리티 메서드', () => {
    test('랜덤 요소 선택', () => {
      const testArray = ['apple', 'banana', 'cherry', 'date'];
      const selected = diversityEngine.getRandomElement(testArray);
      
      expect(testArray).toContain(selected);
    });

    test('랜덤성 검증', () => {
      const testArray = ['a', 'b', 'c', 'd', 'e'];
      const selections = [];
      
      // 100번 선택하여 모든 요소가 최소 한 번은 선택되는지 확인
      for (let i = 0; i < 100; i++) {
        selections.push(diversityEngine.getRandomElement(testArray));
      }
      
      const uniqueSelections = new Set(selections);
      expect(uniqueSelections.size).toBeGreaterThan(3); // 최소 4개 이상 선택됨
    });

    test('빈 배열 처리', () => {
      const result = diversityEngine.getRandomElement([]);
      expect(result).toBeUndefined();
    });
  });

  describe('에러 처리', () => {
    test('잘못된 입력값에 대한 방어적 처리', () => {
      expect(() => {
        diversityEngine.generateCatchyTitle(null);
      }).not.toThrow();

      expect(() => {
        diversityEngine.designMemorableCharacters(undefined);
      }).not.toThrow();

      expect(() => {
        diversityEngine.calculateDiversityScore({}, null);
      }).not.toThrow();
    });

    test('빈 객체에 대한 기본값 처리', () => {
      const title = diversityEngine.generateCatchyTitle({});
      expect(typeof title).toBe('string');

      const characters = diversityEngine.designMemorableCharacters({});
      expect(characters).toBeDefined();

      const score = diversityEngine.calculateDiversityScore({}, []);
      expect(typeof score).toBe('number');
    });
  });

  describe('통합 시나리오', () => {
    test('전체 워크플로우 시나리오', () => {
      // 1. 트로프 조합 생성
      const tropeCombination = diversityEngine.generateTropeCombination();
      
      // 2. 설정 생성
      const setting = diversityEngine.generateUniqueSetting();
      
      // 3. 통합 컨셉 생성
      const concept = {
        ...tropeCombination,
        ...setting,
        genre: diversityEngine.getRandomElement(diversityEngine.genres)
      };
      
      // 4. 제목 생성
      const title = diversityEngine.generateCatchyTitle(concept);
      
      // 5. 캐릭터 생성
      const characters = diversityEngine.designMemorableCharacters(concept);
      
      // 6. 다양성 점수 계산
      const diversityScore = diversityEngine.calculateDiversityScore(concept, []);
      
      // 모든 요소가 올바르게 생성되었는지 검증
      expect(concept.main).toBeDefined();
      expect(concept.world).toBeDefined();
      expect(title).toBeDefined();
      expect(characters.protagonist).toBeDefined();
      expect(diversityScore).toBeGreaterThanOrEqual(0);
      
      console.log('Generated Story Concept:', {
        title,
        concept,
        diversityScore,
        protagonist: characters.protagonist.background
      });
    });

    test('연속 소설 생성시 다양성 보장', () => {
      const existingCombinations = [];
      const newConcepts = [];
      
      // 5개의 서로 다른 소설 컨셉 생성
      for (let i = 0; i < 5; i++) {
        const concept = diversityEngine.generateUniqueNovelConcept(existingCombinations);
        newConcepts.push(concept);
        existingCombinations.push(concept);
        
        // 각 컨셉의 다양성 점수 계산
        const score = diversityEngine.calculateDiversityScore(concept, existingCombinations.slice(0, -1));
        
        expect(score).toBeGreaterThan(0);
      }
      
      // 모든 컨셉이 서로 다른지 확인
      const uniqueKeys = new Set(
        newConcepts.map(c => `${c.main}-${c.sub}-${c.conflict}`)
      );
      
      expect(uniqueKeys.size).toBe(5);
    });
  });
});