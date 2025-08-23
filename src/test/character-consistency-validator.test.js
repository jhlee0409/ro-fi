/**
 * 🧪 캐릭터 일관성 검증 시스템 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterConsistencyValidator } from '../lib/character-consistency-validator.js';

describe('CharacterConsistencyValidator', () => {
  let validator;
  let mockStoryState;

  beforeEach(() => {
    validator = new CharacterConsistencyValidator();
    
    mockStoryState = {
      characters: {
        protagonist: {
          name: '레오나',
          abilities: ['시간 되돌리기', '시간 정지 인지']
        },
        mainLead: {
          name: '카엘',
          abilities: ['미래 예견', '운명 인지']
        }
      },
      worldState: {
        setting: '현대 도시 아우렐리아',
        magicSystem: '시간 조작 능력'
      }
    };
  });

  describe('캐릭터 이름 검증', () => {
    it('올바른 캐릭터 이름이 있을 때 통과해야 함', async () => {
      const content = '레오나는 카엘을 바라보았다. 시간의 힘이 흘렀다.';
      
      const result = await validator.validateCharacterConsistency(mockStoryState, content);
      
      expect(result.valid).toBe(true);
      expect(result.criticalIssues).toHaveLength(0);
    });

    it('잘못된 캐릭터 이름이 있을 때 실패해야 함 (time-guardian 사례)', async () => {
      const content = '이세아는 카일런 윈터하트 공작을 바라보았다. 얼음의 저주가 흘렀다.';
      
      const result = await validator.validateCharacterConsistency(mockStoryState, content);
      
      expect(result.valid).toBe(false);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
      expect(result.criticalIssues.some(issue => 
        issue.type === 'wrong_character_names'
      )).toBe(true);
    });

    it('기대하는 캐릭터 이름이 누락되었을 때 실패해야 함', async () => {
      const content = '그녀는 그를 바라보았다. 마법이 흘렀다.';
      
      const result = await validator.validateCharacterConsistency(mockStoryState, content);
      
      expect(result.valid).toBe(false);
      expect(result.criticalIssues.some(issue => 
        issue.type === 'missing_character_name'
      )).toBe(true);
    });
  });

  describe('세계관 일관성 검증', () => {
    it('현대 설정에 중세 요소가 있을 때 실패해야 함', async () => {
      const content = '레오나는 카엘 공작의 성에서 마력을 사용했다. 기사들이 지켜보았다.';
      
      const result = await validator.validateCharacterConsistency(mockStoryState, content);
      
      expect(result.worldConsistency).toBe(false);
      expect(result.criticalIssues.some(issue => 
        issue.type === 'world_setting_mismatch'
      )).toBe(true);
    });

    it('올바른 현대 설정일 때 통과해야 함', async () => {
      const content = '레오나는 아우렐리아 광장에서 카엘을 만났다. 시간이 멈췄다.';
      
      const result = await validator.validateCharacterConsistency(mockStoryState, content);
      
      expect(result.worldConsistency).toBe(true);
    });
  });

  describe('능력 시스템 검증', () => {
    it('시간 능력이 언급되지 않을 때 경고해야 함', async () => {
      const content = '레오나는 카엘과 대화했다. 그들은 서로를 바라보았다.';
      
      const result = await validator.validateCharacterConsistency(mockStoryState, content);
      
      expect(result.warnings.some(warning => 
        warning.type === 'missing_ability'
      )).toBe(true);
    });
  });

  describe('검증 요약 생성', () => {
    it('심각한 문제가 있을 때 CRITICAL 우선순위를 설정해야 함', () => {
      const validation = {
        valid: false,
        criticalIssues: [{ type: 'wrong_character_names' }],
        warnings: [],
        confidenceScore: 30
      };
      
      const summary = validator.generateValidationSummary(validation);
      
      expect(summary.status).toBe('FAIL');
      expect(summary.priority).toBe('CRITICAL');
      expect(summary.action).toBe('REGENERATION_REQUIRED');
    });

    it('경고만 있을 때 적절한 우선순위를 설정해야 함', () => {
      const validation = {
        valid: true,
        criticalIssues: [],
        warnings: [{ type: 'missing_ability' }],
        confidenceScore: 85
      };
      
      const summary = validator.generateValidationSummary(validation);
      
      expect(summary.status).toBe('PASS');
      expect(summary.priority).toBe('MEDIUM');
    });
  });

  describe('실제 time-guardian 사례 테스트', () => {
    it('6화 잘못된 컨텐츠를 정확히 탐지해야 함', async () => {
      const wrongContent = `
        이세아는 제 허파 속 마지막 남은 온기까지 불어넣는 심정으로 조심스럽게 꽃을 살폈다.
        카일런 윈터하트 공작이 다가왔다. 얼어붙은 땅의 주인이자, 닿는 모든 것을 얼려버리는 저주를 받은 남자.
        공작님의 냉기만으로도 연약한 꽃잎이 금세 시들어버릴 것만 같았다.
      `;
      
      const result = await validator.validateCharacterConsistency(mockStoryState, wrongContent);
      
      expect(result.valid).toBe(false);
      expect(result.criticalIssues.length).toBeGreaterThan(0);
      expect(result.confidenceScore).toBeLessThan(50);
      
      // 구체적인 문제들 확인
      const hasWrongNames = result.criticalIssues.some(issue => 
        issue.type === 'wrong_character_names' && 
        issue.wrongNames.includes('이세아')
      );
      expect(hasWrongNames).toBe(true);
      
      const hasWorldMismatch = result.criticalIssues.some(issue => 
        issue.type === 'world_setting_mismatch'
      );
      expect(hasWorldMismatch).toBe(true);
    });

    it('올바른 컨텐츠는 통과해야 함', async () => {
      const correctContent = `
        레오나는 아우렐리아 광장에서 스케치북을 펼쳤다.
        카엘이 다가와 그녀의 시간 되돌리기 능력에 대해 물었다.
        "미래를 보는 내 능력과 당신의 과거를 바꾸는 힘이 만났다."
        시간이 멈춘 세상에서 두 사람만이 움직일 수 있었다.
      `;
      
      const result = await validator.validateCharacterConsistency(mockStoryState, correctContent);
      
      expect(result.valid).toBe(true);
      expect(result.criticalIssues).toHaveLength(0);
      expect(result.confidenceScore).toBeGreaterThan(80);
    });
  });
});