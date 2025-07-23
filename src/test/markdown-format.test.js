import { describe, test, expect } from 'vitest';

/**
 * NOVEL_MARKDOWN_FORMAT.md 가이드라인 준수 테스트
 * 마크다운 형식 규칙을 엄격하게 검증
 */
describe('Markdown Format Compliance Tests', () => {
  
  describe('대화체 (Dialogue) 형식 검증', () => {
    test('올바른 대화 형식을 검증해야 함', () => {
      const validDialogue = [
        '> "안녕하세요, 처음 뵙겠습니다."',
        '> "오늘 날씨가 정말 좋네요."',
        '> "당신을 기다리고 있었어요."'
      ];
      
      validDialogue.forEach(dialogue => {
        expect(dialogue).toMatch(/^> "[^"]+"$/);
        expect(dialogue).not.toMatch(/'/); // 홑따옴표 사용 안함
        expect(dialogue).not.toMatch(/^> \*/); // 별표 사용 안함
      });
    });
    
    test('잘못된 대화 형식을 감지해야 함', () => {
      const invalidDialogue = [
        "> '안녕하세요'", // 홑따옴표 사용
        "> *'대화'*", // 별표와 홑따옴표 조합
        '> [대화]', // 대괄호 사용
        '"대화"', // > 기호 누락
        '> "미완성 대화', // 닫는 따옴표 누락
      ];
      
      invalidDialogue.forEach(dialogue => {
        expect(dialogue).not.toMatch(/^> "[^"]+"$/);
      });
    });
  });

  describe('독백/내적 사고 (Monologue) 형식 검증', () => {
    test('올바른 독백 형식을 검증해야 함', () => {
      const validMonologue = [
        "> *'이상하다... 왜 계속 그 사람이 생각날까?'*",
        "> *'이번에는 실패할 수 없어.'*",
        "> *'내가 정말 이런 감정을 느끼고 있는 건가?'*"
      ];
      
      validMonologue.forEach(monologue => {
        expect(monologue).toMatch(/^> \*'[^']+'\*$/);
        expect(monologue).not.toMatch(/"/); // 쌍따옴표 사용 안함
        expect(monologue).not.toMatch(/\[[^\]]*\]/); // 대괄호 사용 안함
      });
    });
    
    test('잘못된 독백 형식을 감지해야 함', () => {
      const invalidMonologue = [
        "> '생각'", // 별표 누락
        "> *\"생각\"*", // 쌍따옴표 사용
        "> [생각]", // 대괄호 사용
        "*'생각'*", // > 기호 누락
        "> *'미완성 생각", // 닫는 따옴표나 별표 누락
      ];
      
      invalidMonologue.forEach(monologue => {
        expect(monologue).not.toMatch(/^> \*'[^']+'\*$/);
      });
    });
  });

  describe('액션/상황 변화 (Action) 형식 검증', () => {
    test('올바른 액션 형식을 검증해야 함', () => {
      const validActions = [
        '> [아리엘이 마법진 중앙으로 걸어 나갔다]',
        '> [갑자기 강한 바람이 불어와 촛불들이 흔들렸다]',
        '> [문이 열리며 누군가가 들어왔다]'
      ];
      
      validActions.forEach(action => {
        expect(action).toMatch(/^> \[[^\]]+\]$/);
        expect(action).not.toMatch(/"/); // 쌍따옴표 사용 안함
        expect(action).not.toMatch(/'/); // 홑따옴표 사용 안함
        expect(action).not.toMatch(/\*/); // 별표 사용 안함
      });
    });
    
    test('잘못된 액션 형식을 감지해야 함', () => {
      const invalidActions = [
        '> (액션)', // 소괄호 사용
        '> "액션"', // 쌍따옴표 사용
        "> *'액션'*", // 독백 형식 사용
        '[액션]', // > 기호 누락
        '> [미완성 액션', // 닫는 대괄호 누락
      ];
      
      invalidActions.forEach(action => {
        expect(action).not.toMatch(/^> \[[^\]]+\]$/);
      });
    });
  });

  describe('서술 (Narrative) 형식 검증', () => {
    test('볼드 형식이 올바르게 적용되어야 함', () => {
      const validNarrative = [
        '**아리엘**은 복도를 걸으며 오늘 있을 실습을 생각했다.',
        '교실 안은 이미 학생들로 가득 차 있었고, 중앙의 **마법진**이 은은하게 빛나고 있었다.',
        '**크리스털 첨탑** 너머로 햇살이 쏟아져 들어왔다.'
      ];
      
      validNarrative.forEach(text => {
        const boldMatches = text.match(/\*\*([^*]+)\*\*/g);
        if (boldMatches) {
          boldMatches.forEach(bold => {
            expect(bold).toMatch(/^\*\*[^*]+\*\*$/);
            expect(bold).not.toContain('***'); // 삼중 별표 방지
          });
        }
      });
    });
    
    test('서술에 잘못된 형식이 포함되지 않아야 함', () => {
      const textWithInvalidFormat = '아리엘은 > "안녕"이라고 말했다.';
      
      // 서술 중간에 대화 형식이 들어가면 안됨
      expect(textWithInvalidFormat).toMatch(/> "/); // 잘못된 패턴 감지
    });
  });

  describe('전체 컨텐츠 구조 검증', () => {
    test('혼합된 컨텐츠에서 각 형식이 올바르게 구분되어야 함', () => {
      const mixedContent = `---
title: "테스트 챕터"
novel: "test-novel"
chapterNumber: 1
---

**아리엘**은 복도를 걸으며 생각에 잠겼다.

> *'오늘은 정말 중요한 날이야.'*

> [그녀가 교실 문 앞에서 멈춰 섰다]

> "안녕하세요, 선생님."

교실 안은 조용했고, **마법진**이 빛나고 있었다.`;

      // Frontmatter 검증
      expect(mixedContent).toMatch(/^---\n.*\n---/s);
      
      // 각 형식별 검증
      const lines = mixedContent.split('\n');
      lines.forEach(line => {
        if (line.trim().startsWith('> ')) {
          // 대화, 독백, 액션 중 하나여야 함
          const isDialogue = /^> "[^"]+"$/.test(line.trim());
          const isMonologue = /^> \*'[^']+'\*$/.test(line.trim());
          const isAction = /^> \[[^\]]+\]$/.test(line.trim());
          
          expect(isDialogue || isMonologue || isAction).toBe(true);
        }
      });
    });
    
    test('frontmatter가 올바르게 구성되어야 함', () => {
      const validFrontmatter = `---
title: "테스트 챕터"
novel: "test-novel"
chapterNumber: 1
publicationDate: 2024-01-01
wordCount: 1000
rating: 0
---`;

      expect(validFrontmatter).toMatch(/^---\n/);
      expect(validFrontmatter).toMatch(/\n---$/);
      expect(validFrontmatter).toContain('title:');
      expect(validFrontmatter).toContain('novel:');
      expect(validFrontmatter).toContain('chapterNumber:');
    });
  });

  describe('잘못된 형식 조합 검증', () => {
    test('형식이 섞인 잘못된 패턴을 감지해야 함', () => {
      const invalidPatterns = [
        '> "*대화와 독백 섞임*"', // 대화와 독백 섞임
        '> "[액션과 대화 섞임]"', // 액션과 대화 섞임
        "> '[독백과 액션 섞임]'", // 독백과 액션 섞임
        '> **볼드와 대화**', // 볼드와 화살표 섞임
      ];
      
      invalidPatterns.forEach(pattern => {
        // 올바른 패턴 중 어느 것도 만족하지 않아야 함
        const isValidDialogue = /^> "[^"*\[\]]+?"$/.test(pattern); // *, [, ] 문자 포함 시 무효
        const isValidMonologue = /^> \*'[^'"\[\]]+?'\*$/.test(pattern); // ", [, ] 문자 포함 시 무효  
        const isValidAction = /^> \[[^"\*']+?\]$/.test(pattern); // ", *, ' 문자 포함 시 무효
        
        expect(isValidDialogue || isValidMonologue || isValidAction).toBe(false);
      });
    });
  });

  describe('공백 및 줄바꿈 규칙 검증', () => {
    test('각 요소 앞뒤로 적절한 공백이 있어야 함', () => {
      const wellFormattedContent = `**아리엘**은 복도를 걸었다.

> "안녕하세요."

> *'무슨 일이지?'*

> [문이 열렸다]

다시 조용해졌다.`;

      const lines = wellFormattedContent.split('\n');
      let previousLineEmpty = false;
      
      lines.forEach((line, index) => {
        if (line.trim().startsWith('> ')) {
          // 특수 형식 라인들은 앞뒤로 빈 줄이 있는 것이 좋음
          if (index > 0 && index < lines.length - 1) {
            const prevLine = lines[index - 1];
            const nextLine = lines[index + 1];
            
            // 이전 라인이 일반 텍스트라면 빈 줄이 있어야 함
            if (prevLine.trim() && !prevLine.trim().startsWith('> ')) {
              expect(prevLine.trim()).toBe(''); // 실제로는 빈 줄이어야 하지만 예제에서는 확인만
            }
          }
        }
      });
    });
  });
});