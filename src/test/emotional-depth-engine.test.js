/**
 * 감정 깊이 엔진 테스트
 * 내적 갈등, 미세 표현, 감각적 묘사, 대화 이면 의미 등 감정 표현 기능 검증
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { EmotionalDepthEngine } from '../lib/emotional-depth-engine.js';

describe('EmotionalDepthEngine', () => {
  let emotionalEngine;
  
  beforeEach(() => {
    emotionalEngine = new EmotionalDepthEngine();
  });

  describe('내적 갈등 생성', () => {
    test('기본 내적 갈등 생성', () => {
      const conflict = emotionalEngine.generateInternalConflict('감정의 부정', '엘리아나');
      
      expect(conflict).toBeDefined();
      expect(typeof conflict).toBe('string');
      expect(conflict.length).toBeGreaterThan(10);
      
      // 마크다운 형식이 제거되었는지 확인
      expect(conflict).not.toContain(">");
      expect(conflict).not.toContain("*'");
      expect(conflict).not.toContain("'*");
    });

    test('갈등 유형별 적절한 내용 생성', () => {
      const conflictTypes = ['과거의 트라우마', '감정의 부정', '신분의 차이', '의무와 감정의 충돌'];
      
      conflictTypes.forEach(type => {
        // 여러 번 시도하여 최소 한 번은 올바른 키워드가 포함되는지 확인
        let foundMatch = false;
        for (let i = 0; i < 10 && !foundMatch; i++) {
          const conflict = emotionalEngine.generateInternalConflict(type, '테스트');
          
          expect(conflict).toBeDefined();
          expect(typeof conflict).toBe('string');
          expect(conflict.length).toBeGreaterThan(5);
          
          // 각 타입에 맞는 키워드 포함 확인
          switch(type) {
            case '과거의 트라우마':
              foundMatch = conflict.includes('기억') || 
                          conflict.includes('트라우마') || 
                          conflict.includes('악몽') ||
                          conflict.includes('그때') ||
                          conflict.includes('떠오르') ||
                          conflict.includes('끝난 일') ||
                          conflict.includes('무서워');
              break;
            case '감정의 부정':
              foundMatch = conflict.includes('설마') || 
                          conflict.includes('그럴 리 없어') || 
                          conflict.includes('이해할 수 없어') ||
                          conflict.includes('단지') ||
                          conflict.includes('동정심') ||
                          conflict.includes('다른 건 아니야') ||
                          conflict.includes('기분');
              break;
            case '신분의 차이':
              foundMatch = conflict.includes('감히') || 
                          conflict.includes('분수') || 
                          conflict.includes('다른 세계') ||
                          conflict.includes('같은 사람') ||
                          conflict.includes('모르고');
              break;
            case '의무와 감정의 충돌':
              foundMatch = conflict.includes('해야 할 일') || 
                          conflict.includes('기대') || 
                          conflict.includes('마음') ||
                          conflict.includes('원하는 것') ||
                          conflict.includes('다르다면') ||
                          conflict.includes('다를까');
              break;
          }
        }
        
        expect(foundMatch).toBe(true);
      });
    });

    test('알 수 없는 갈등 유형에 대한 기본값 처리', () => {
      const unknownConflict = emotionalEngine.generateInternalConflict('unknown-type', '캐릭터');
      
      expect(unknownConflict).toBe('내 마음이 왜 이렇게 복잡한 걸까...');
    });

    test('캐릭터 이름 치환', () => {
      // 실제로는 {character} 플레이스홀더가 있을 수 있음
      const conflict = emotionalEngine.generateInternalConflict('감정의 부정', '엘리아나');
      
      expect(typeof conflict).toBe('string');
      expect(conflict.length).toBeGreaterThan(0);
    });
  });

  describe('미세 표현 생성', () => {
    test('기본 미세 표현 생성', () => {
      const expression = emotionalEngine.generateMicroExpression('attraction', '엘리아나');
      
      expect(expression).toBeDefined();
      expect(typeof expression).toBe('string');
      expect(expression).toContain('엘리아나');
      expect(expression.endsWith('.')).toBe(true);
    });

    test('감정 유형별 적절한 표현 생성', () => {
      const emotionTypes = ['attraction', 'anxiety', 'guilt', 'longing', 'jealousy'];
      
      emotionTypes.forEach(emotion => {
        // 여러 번 시도하여 최소 한 번은 올바른 키워드가 포함되는지 확인
        let foundMatch = false;
        for (let i = 0; i < 10 && !foundMatch; i++) {
          const expression = emotionalEngine.generateMicroExpression(emotion, '캐릭터');
          
          expect(expression).toBeDefined();
          expect(expression).toContain('캐릭터');
          
          // 각 감정에 맞는 키워드 포함 확인
          switch(emotion) {
            case 'attraction':
              foundMatch = expression.includes('시선') || 
                          expression.includes('미소') || 
                          expression.includes('목소리') ||
                          expression.includes('웃음소리') ||
                          expression.includes('따라갔다') ||
                          expression.includes('부드러워졌다') ||
                          expression.includes('스치자') ||
                          expression.includes('멈칫했다');
              break;
            case 'anxiety':
              foundMatch = expression.includes('입술') || 
                          expression.includes('손가락') || 
                          expression.includes('눈동자') ||
                          expression.includes('심장') ||
                          expression.includes('깨물며') ||
                          expression.includes('만지작') ||
                          expression.includes('흔들렸다') ||
                          expression.includes('마르') ||
                          expression.includes('울렸다');
              break;
            case 'guilt':
              foundMatch = expression.includes('고개') || 
                          expression.includes('목소리') || 
                          expression.includes('죄책감') ||
                          expression.includes('숙인') ||
                          expression.includes('피했다') ||
                          expression.includes('작아졌다') ||
                          expression.includes('답답') ||
                          expression.includes('멈췄다');
              break;
            case 'longing':
              foundMatch = expression.includes('한숨') || 
                          expression.includes('그리운') || 
                          expression.includes('애타는') ||
                          expression.includes('바라보며') ||
                          expression.includes('저렸다') ||
                          expression.includes('뻗었다') ||
                          expression.includes('허공') ||
                          expression.includes('감았다');
              break;
            case 'jealousy':
              foundMatch = expression.includes('억지로') || 
                          expression.includes('질투') || 
                          expression.includes('시선') ||
                          expression.includes('웃음') ||
                          expression.includes('감췄다') ||
                          expression.includes('차갑게') ||
                          expression.includes('향했다') ||
                          expression.includes('타오르는') ||
                          expression.includes('눌렀다');
              break;
          }
        }
        
        expect(foundMatch).toBe(true);
      });
    });

    test('알 수 없는 감정 유형에 대한 기본값 처리', () => {
      const unknownExpression = emotionalEngine.generateMicroExpression('unknown-emotion', '테스트');
      
      expect(unknownExpression).toBe('테스트의 표정이 미묘하게 변했다.');
    });

    test('문법적 정확성 확인', () => {
      const expressions = ['attraction', 'anxiety', 'guilt'];
      
      expressions.forEach(emotion => {
        const expression = emotionalEngine.generateMicroExpression(emotion, '엘리아나');
        
        // 적절한 조사 사용 확인
        expect(
          expression.includes('엘리아나는') || 
          expression.includes('엘리아나의') ||
          expression.includes('엘리아나가')
        ).toBe(true);
      });
    });
  });

  describe('감각적 묘사 생성', () => {
    test('기본 감각적 묘사 생성', () => {
      const description = emotionalEngine.generateSensoryDescription('긴장', '어둠이 내린 복도');
      
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
      expect(description).toContain('어둠이 내린 복도');
    });

    test('감정별 적절한 감각 묘사', () => {
      const emotions = ['긴장', '설렘', '슬픔'];
      const setting = '도서관';
      
      emotions.forEach(emotion => {
        // 여러 번 시도하여 최소 한 번은 올바른 키워드가 포함되는지 확인
        let foundMatch = false;
        for (let i = 0; i < 10 && !foundMatch; i++) {
          const description = emotionalEngine.generateSensoryDescription(emotion, setting);
          
          expect(description).toBeDefined();
          expect(description).toContain(setting);
          
          // 각 감정에 맞는 감각적 표현 포함 확인
          switch(emotion) {
            case '긴장':
              foundMatch = description.includes('땀') || 
                          description.includes('오한') || 
                          description.includes('심장') ||
                          description.includes('정적') ||
                          description.includes('경직') ||
                          description.includes('차가운') ||
                          description.includes('맺혔다') ||
                          description.includes('타고') ||
                          description.includes('들렸다') ||
                          description.includes('압박') ||
                          description.includes('또렷') ||
                          description.includes('흔들') ||
                          description.includes('선명') ||
                          description.includes('밝게') ||
                          description.includes('스쳤다') ||
                          description.includes('말랐다') ||
                          description.includes('쓴맛');
              break;
            case '설렘':
              foundMatch = description.includes('두근') || 
                          description.includes('볼이') || 
                          description.includes('전율') ||
                          description.includes('향기') ||
                          description.includes('뜨거워') ||
                          description.includes('뛰었다') ||
                          description.includes('흘렀다') ||
                          description.includes('선명') ||
                          description.includes('멀어') ||
                          description.includes('밝고') ||
                          description.includes('보였다') ||
                          description.includes('은은한') ||
                          description.includes('스쳤다') ||
                          description.includes('바람');
              break;  
            case '슬픔':
              foundMatch = description.includes('먹먹') || 
                          description.includes('메었다') || 
                          description.includes('뜨거워') ||
                          description.includes('흐려') ||
                          description.includes('멀게') ||
                          description.includes('숨소리') ||
                          description.includes('바래') ||
                          description.includes('막힌');
              break;
          }
        }
        
        expect(foundMatch).toBe(true);
      });
    });

    test('다양한 감각 영역 커버', () => {
      const descriptions = [];
      
      // 여러 번 생성하여 다양한 감각이 나오는지 확인
      for (let i = 0; i < 20; i++) {
        const description = emotionalEngine.generateSensoryDescription('긴장', '방');
        descriptions.push(description);
      }
      
      const allText = descriptions.join(' ');
      
      // 최소 2개 이상의 감각 영역이 포함되어야 함
      const sensoryCount = [
        allText.includes('땀') || allText.includes('오한'),  // 촉각
        allText.includes('소리') || allText.includes('들렸다'), // 청각
        allText.includes('보였다') || allText.includes('선명'), // 시각
        allText.includes('냄새') || allText.includes('향'),    // 후각
        allText.includes('맛') || allText.includes('쓴')       // 미각
      ].filter(Boolean).length;
      
      expect(sensoryCount).toBeGreaterThan(1);
    });

    test('알 수 없는 감정에 대한 기본값 처리', () => {
      const unknownDescription = emotionalEngine.generateSensoryDescription('unknown-emotion', '정원');
      
      expect(unknownDescription).toBe('정원의 분위기가 unknown-emotion을 더욱 증폭시켰다.');
    });
  });

  describe('대화 이면 의미 생성', () => {
    test('기본 대화 이면 의미 생성', () => {
      const subtext = emotionalEngine.generateDialogueSubtext('괜찮다고 했잖아', 'defensive', 'hurt');
      
      expect(subtext).toBeDefined();
      expect(typeof subtext).toBe('string');
      expect(subtext).toContain('"괜찮다고 했잖아"');
      expect(subtext).toContain('떨리는 목소리가 상처받은 마음을 드러냈다');
    });

    test('톤과 감정 조합별 적절한 이면 의미', () => {
      const testCases = [
        { tone: 'defensive', emotion: 'hurt', expected: '떨리는 목소리가 상처받은 마음을 드러냈다' },
        { tone: 'defensive', emotion: 'angry', expected: '차가운 말투 뒤로 분노가 숨어있었다' },
        { tone: 'defensive', emotion: 'scared', expected: '강한 척하지만 불안한 기색을 감출 수 없었다' },
        { tone: 'caring', emotion: 'worried', expected: '무뚝뚝한 말투였지만 진심 어린 걱정이 묻어났다' },
        { tone: 'caring', emotion: 'affectionate', expected: '애써 평범하게 말했지만 따뜻한 애정이 느껴졌다' },
        { tone: 'conflicted', emotion: 'torn', expected: '확신에 찬 말이었지만 눈빛은 흔들리고 있었다' },
        { tone: 'conflicted', emotion: 'guilty', expected: '변명처럼 들렸지만 자신조차 확신하지 못하는 듯했다' }
      ];
      
      testCases.forEach(({ tone, emotion, expected }) => {
        const subtext = emotionalEngine.generateDialogueSubtext('테스트 대화', tone, emotion);
        
        expect(subtext).toContain('"테스트 대화"');
        expect(subtext).toContain(expected);
      });
    });

    test('알 수 없는 톤/감정 조합에 대한 기본값 처리', () => {
      const unknownSubtext = emotionalEngine.generateDialogueSubtext('안녕', 'unknown-tone', 'unknown-emotion');
      
      expect(unknownSubtext).toBe('"안녕" 하지만 그 말 속에는 복잡한 감정이 숨어있었다.');
    });
  });

  describe('감정 진행 단계 생성', () => {
    test('enemies-to-lovers 진행 단계', () => {
      const progression = emotionalEngine.generateEmotionProgression('enemies-to-lovers', 3, 10);
      
      expect(progression).toBeDefined();
      expect(progression.stage).toBe('이해의 시작');
      expect(progression.emotions).toEqual(['공감', '혼란', '갈등']);
      expect(progression.intensity).toBe(30); // 3/10 * 100
      expect(progression.description).toContain('이해의 시작 단계');
      expect(progression.description).toContain('30%');
      expect(progression.description).toContain('공감, 혼란, 갈등');
    });

    test('fake-relationship 진행 단계', () => {
      const progression = emotionalEngine.generateEmotionProgression('fake-relationship', 6, 10);
      
      expect(progression.stage).toBe('진실 깨달음');
      expect(progression.emotions).toEqual(['깨달음', '두려움', '희망']);
      expect(progression.intensity).toBe(60);
    });

    test('알 수 없는 관계 유형에 대한 기본값 처리', () => {
      const progression = emotionalEngine.generateEmotionProgression('unknown-relationship', 5, 10);
      
      expect(progression.stage).toBe('5/10 단계');
      expect(progression.emotions).toEqual(['복잡', '변화', '성장']);
      expect(progression.intensity).toBe(50);
    });

    test('진행도 계산 정확성', () => {
      const testCases = [
        { current: 1, total: 10, expected: 10 },
        { current: 5, total: 10, expected: 50 },
        { current: 10, total: 10, expected: 100 },
        { current: 3, total: 7, expected: 43 } // 반올림
      ];
      
      testCases.forEach(({ current, total, expected }) => {
        const progression = emotionalEngine.generateEmotionProgression('enemies-to-lovers', current, total);
        expect(progression.intensity).toBe(expected);
      });
    });
  });

  describe('복합 감정 상태 생성', () => {
    test('복잡한 감정 상태 묘사', () => {
      const emotionMix = [
        { emotion: '설렘', intensity: 0.7 },
        { emotion: '불안', intensity: 0.5 },
        { emotion: '기대', intensity: 0.3 }
      ];
      
      const description = emotionalEngine.generateComplexEmotionalState(emotionMix, '엘리아나');
      
      expect(description).toBeDefined();
      expect(description).toContain('**엘리아나**의 마음은 복잡했다');
      expect(description).toContain('설렘이 가장 강했지만'); // 가장 높은 intensity
      expect(description).toContain('불안과 기대도 함께 얽혀있었다');
      expect(description).toContain('> *\'설렘을 느끼면서도 불안이');
    });

    test('단일 감정에 대한 처리', () => {
      const singleEmotion = [
        { emotion: '기쁨', intensity: 0.9 }
      ];
      
      const description = emotionalEngine.generateComplexEmotionalState(singleEmotion, '캐릭터');
      
      expect(description).toContain('기쁨이 가장 강했지만');
      // 충돌하는 감정이 없으므로 내적 독백이 없어야 함
      expect(description.includes('> *\'')).toBe(false);
    });

    test('동일한 강도의 감정들 처리', () => {
      const equalEmotions = [
        { emotion: '사랑', intensity: 0.5 },
        { emotion: '미안함', intensity: 0.5 }
      ];
      
      const description = emotionalEngine.generateComplexEmotionalState(equalEmotions, '주인공');
      
      expect(description).toBeDefined();
      expect(description).toContain('**주인공**의 마음은 복잡했다');
      // 동일한 강도일 때는 reduce 결과에 따라 결정됨
      expect(
        description.includes('사랑이 가장 강했지만') || 
        description.includes('미안함이 가장 강했지만')
      ).toBe(true);
    });
  });

  describe('감정 깊이 점수 계산', () => {
    test('내적 독백이 포함된 텍스트', () => {
      const text = `
        엘리아나는 당황했다.
        > *'왜 내 마음이 이렇게 떨리는 거지?'*
        그녀는 자신의 감정을 이해할 수 없었다.
        > *'이건 그냥... 동정심일 뿐이야.'*
      `;
      
      const score = emotionalEngine.calculateEmotionalDepth(text);
      
      expect(score).toBeGreaterThanOrEqual(40); // 내적 독백 2개 = 40점
    });

    test('미세 표현이 포함된 텍스트', () => {
      const text = `
        그의 목소리가 무의식적으로 떨렸다.
        엘리아나의 손끝이 미세하게 흔들렸다.
        그녀의 심장이 멎는 듯했다.
      `;
      
      const score = emotionalEngine.calculateEmotionalDepth(text);
      
      expect(score).toBeGreaterThanOrEqual(30); // 미세 표현 키워드들로 최대 30점
    });

    test('감각적 묘사가 포함된 텍스트', () => {
      const text = `
        달콤한 향기가 코끝을 스쳤다.
        차가운 바람이 뺨을 스쳤다.
        쓴맛이 입안에 맴돌았다.
      `;
      
      const score = emotionalEngine.calculateEmotionalDepth(text);
      
      expect(score).toBeGreaterThanOrEqual(20); // 감각적 묘사로 최대 20점
    });

    test('대화 이면 의미가 포함된 텍스트', () => {
      const text = `
        "괜찮다고 했잖아" 하지만 그의 목소리는 떨리고 있었다.
      `;
      
      const score = emotionalEngine.calculateEmotionalDepth(text);
      
      expect(score).toBeGreaterThanOrEqual(10); // 대화 이면 의미로 10점
    });

    test('모든 요소가 포함된 고품질 텍스트', () => {
      const text = `
        **엘리아나**는 무의식적으로 떨렸다.
        > *'왜 내 마음이 이렇게 복잡한 거야?'*
        달콤한 향기가 코끝을 스쳤고, 그녀의 손끝이 미세하게 흔들렸다.
        "괜찮다고 했잖아" 하지만 그 말 속에는 애타는 마음이 숨어있었다.
        > *'이건 그냥... 동정심일 뿐이야.'*
        그녀의 심장이 멎는 듯했고, 쓴맛이 혀끝에 맴돌았다.
      `;
      
      const score = emotionalEngine.calculateEmotionalDepth(text);
      
      expect(score).toBeGreaterThan(80); // 모든 요소가 포함되어 높은 점수
      expect(score).toBeLessThanOrEqual(100); // 최대 100점 제한
    });

    test('감정 표현이 없는 평이한 텍스트', () => {
      const text = `
        엘리아나는 도서관에 갔다.
        그녀는 책을 읽었다.
        날씨가 좋았다.
      `;
      
      const score = emotionalEngine.calculateEmotionalDepth(text);
      
      expect(score).toBe(0); // 감정 표현이 없으므로 0점
    });

    test('점수 상한선 확인', () => {
      // 매우 많은 키워드를 포함한 텍스트
      const text = `
        무의식적으로 미세하게 은근히 살짝 스치듯 떨렸다 흔들렸다 멎는 듯 저렸다 먹먹했다
        > *'첫 번째 독백'* > *'두 번째 독백'* > *'세 번째 독백'* > *'네 번째 독백'*
        냄새 향기 소리 맛 촉감 따뜻한 차가운 거칠 부드러운 달콤한 쓴 시큼한
        "대화1" 하지만 "대화2" 하지만 "대화3" 하지만
      `;
      
      const score = emotionalEngine.calculateEmotionalDepth(text);
      
      expect(score).toBe(100); // 최대 100점으로 제한
    });
  });

  describe('유틸리티 메서드', () => {
    test('랜덤 요소 선택', () => {
      const testArray = ['감정1', '감정2', '감정3', '감정4'];
      const selected = emotionalEngine.getRandomElement(testArray);
      
      expect(testArray).toContain(selected);
    });

    test('랜덤성 검증', () => {
      const testArray = ['A', 'B', 'C', 'D', 'E'];
      const selections = [];
      
      // 100번 선택하여 다양성 확인
      for (let i = 0; i < 100; i++) {
        selections.push(emotionalEngine.getRandomElement(testArray));
      }
      
      const uniqueSelections = new Set(selections);
      expect(uniqueSelections.size).toBeGreaterThan(3); // 최소 4개 이상 선택됨
    });

    test('빈 배열 처리', () => {
      const result = emotionalEngine.getRandomElement([]);
      expect(result).toBeUndefined();
    });
  });

  describe('에러 처리', () => {
    test('잘못된 입력값에 대한 방어적 처리', () => {
      expect(() => {
        emotionalEngine.generateInternalConflict(null, null);
      }).not.toThrow();

      expect(() => {
        emotionalEngine.generateMicroExpression(undefined, '');
      }).not.toThrow();

      expect(() => {
        emotionalEngine.generateSensoryDescription('', null);
      }).not.toThrow();

      expect(() => {
        emotionalEngine.generateDialogueSubtext(null, null, null);
      }).not.toThrow();
    });

    test('빈 데이터에 대한 기본값 처리', () => {
      const conflict = emotionalEngine.generateInternalConflict('', '캐릭터');
      expect(typeof conflict).toBe('string');

      const expression = emotionalEngine.generateMicroExpression('', '캐릭터');
      expect(typeof expression).toBe('string');

      const description = emotionalEngine.generateSensoryDescription('', '장소');
      expect(typeof description).toBe('string');

      const subtext = emotionalEngine.generateDialogueSubtext('대화', '', '');
      expect(typeof subtext).toBe('string');
    });
  });

  describe('통합 시나리오', () => {
    test('전체 감정 표현 워크플로우', () => {
      const characterName = '엘리아나';
      const setting = '달빛이 비치는 정원';
      
      // 1. 내적 갈등 생성
      const conflict = emotionalEngine.generateInternalConflict('감정의 부정', characterName);
      
      // 2. 미세 표현 생성
      const expression = emotionalEngine.generateMicroExpression('attraction', characterName);
      
      // 3. 감각적 묘사 생성
      const sensory = emotionalEngine.generateSensoryDescription('설렘', setting);
      
      // 4. 대화 이면 의미 생성
      const subtext = emotionalEngine.generateDialogueSubtext('아무것도 아니야', 'defensive', 'hurt');
      
      // 5. 감정 진행 단계
      const progression = emotionalEngine.generateEmotionProgression('enemies-to-lovers', 4, 10);
      
      // 6. 통합 텍스트 구성
      const integratedText = `
        ${sensory} ${expression}
        > *'${conflict}'*
        ${subtext}
        
        현재 관계 단계: ${progression.stage} (${progression.intensity}%)
        주요 감정: ${progression.emotions.join(', ')}
      `;
      
      // 7. 감정 깊이 점수 계산
      const emotionalScore = emotionalEngine.calculateEmotionalDepth(integratedText);
      
      // 검증
      expect(conflict).toBeDefined();
      expect(expression).toContain(characterName);
      expect(sensory).toContain(setting);
      expect(subtext).toContain('"아무것도 아니야"');
      expect(progression.stage).toBe('끌림 인정');
      expect(emotionalScore).toBeGreaterThan(30);
      
      console.log('통합 감정 표현 텍스트:', integratedText);
      console.log('감정 깊이 점수:', emotionalScore);
    });

    test('관계 단계별 감정 변화 시뮬레이션', () => {
      const relationshipType = 'fake-relationship';
      const totalStages = 10;
      const progressions = [];
      
      // 모든 단계 생성
      for (let stage = 1; stage <= totalStages; stage++) {
        const progression = emotionalEngine.generateEmotionProgression(relationshipType, stage, totalStages);
        progressions.push(progression);
      }
      
      // 감정 강도가 점진적으로 증가하는지 확인
      for (let i = 1; i < progressions.length; i++) {
        expect(progressions[i].intensity).toBeGreaterThan(progressions[i-1].intensity);
      }
      
      // 첫 단계와 마지막 단계 확인
      expect(progressions[0].stage).toBe('계약적 관계');
      expect(progressions[9].stage).toBe('진정한 결합');
      
      console.log('관계 발전 단계:');
      progressions.forEach((p, i) => {
        console.log(`${i+1}단계: ${p.stage} - ${p.emotions.join(', ')} (${p.intensity}%)`);
      });
    });

    test('복합 감정 상황 처리', () => {
      const complexScenario = {
        character: '리안',
        setting: '비 내리는 발코니',
        situation: '이별 직전',
        emotions: [
          { emotion: '사랑', intensity: 0.8 },
          { emotion: '아픔', intensity: 0.7 },
          { emotion: '후회', intensity: 0.6 },
          { emotion: '체념', intensity: 0.4 }
        ]
      };
      
      // 복합 감정 상태 생성
      const emotionalState = emotionalEngine.generateComplexEmotionalState(
        complexScenario.emotions, 
        complexScenario.character
      );
      
      // 상황에 맞는 감각적 묘사
      const sensoryDescription = emotionalEngine.generateSensoryDescription('슬픔', complexScenario.setting);
      
      // 내적 갈등
      const internalConflict = emotionalEngine.generateInternalConflict('의무와 감정의 충돌', complexScenario.character);
      
      // 통합 장면 구성
      const sceneText = `
        ${sensoryDescription}
        ${emotionalState}
        > *'${internalConflict}'*
      `;
      
      // 감정 깊이 점수
      const depth = emotionalEngine.calculateEmotionalDepth(sceneText);
      
      expect(emotionalState).toContain('사랑이 가장 강했지만');
      expect(sensoryDescription).toContain(complexScenario.setting);
      expect(depth).toBeGreaterThanOrEqual(40);
      
      console.log('복합 감정 장면:', sceneText);
      console.log('감정 깊이:', depth);
    });
  });
});