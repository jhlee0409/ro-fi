/**
 * EpisodeContinuityEngine - 에피소드 간 연결성 검증 시스템
 * 
 * 참고: 연속성_관리.md의 EpisodeContinuityEngine 클래스를 현재 프로젝트에 맞게 구현
 * 기능: 캐릭터 일관성, 세계관 일관성, 플롯 일관성, 감정선 연속성 검증
 */

import type {
  StoryState,
  ChapterState,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  CharacterProfile,
  FixSuggestion
} from './types/continuity.js';
import { storyStateManager } from './story-state-manager.js';

export class EpisodeContinuityEngine {
  private characterNamePattern = /[가-힣]{2,4}/g;
  private abilityKeywords = ['마법', '검', '힘', '능력', '재능', '기술'];
  
  /**
   * 전체 연속성 검증 (모든 측면)
   */
  async validateAllAspects(storyState: StoryState, newChapter: ChapterState): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. 캐릭터 일관성 검증
    const characterResult = await this.validateCharacterContinuity(storyState, newChapter);
    errors.push(...characterResult.errors);
    warnings.push(...characterResult.warnings);

    // 2. 세계관 일관성 검증
    const worldResult = await this.validateWorldContinuity(storyState, newChapter);
    errors.push(...worldResult.errors);
    warnings.push(...worldResult.warnings);

    // 3. 플롯 일관성 검증
    const plotResult = await this.validatePlotContinuity(storyState, newChapter);
    errors.push(...plotResult.errors);
    warnings.push(...plotResult.warnings);

    // 4. 감정선 연속성 검증
    const emotionalResult = await this.validateEmotionalFlow(storyState, newChapter);
    errors.push(...emotionalResult.errors);
    warnings.push(...emotionalResult.warnings);

    // 5. 타임라인 일관성 검증
    const timelineResult = await this.validateTimelineContinuity(storyState, newChapter);
    errors.push(...timelineResult.errors);
    warnings.push(...timelineResult.warnings);

    // 전체 점수 계산
    const aspectScores = {
      characterConsistency: characterResult.confidence,
      worldConsistency: worldResult.confidence,
      plotConsistency: plotResult.confidence,
      emotionalFlow: emotionalResult.confidence,
      timelineConsistency: timelineResult.confidence
    };

    const overallConfidence = Object.values(aspectScores).reduce((a, b) => a + b, 0) / 5;
    const valid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;

    return {
      valid,
      errors,
      warnings,
      confidence: overallConfidence,
      aspectScores
    };
  }

  /**
   * 캐릭터 일관성 검증
   */
  async validateCharacterContinuity(storyState: StoryState, newChapter: ChapterState): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 이전 챕터 가져오기
    const previousChapter = storyState.chapters.get(newChapter.chapterNumber - 1);
    
    if (!previousChapter) {
      return { valid: true, errors: [], warnings: [], confidence: 1.0, aspectScores: {} as any };
    }

    // 새 챕터에서 캐릭터 이름 추출
    const newCharacters = this.extractCharacterNames(this.getChapterContent(newChapter));
    const prevCharacters = this.extractCharacterNames(this.getChapterContent(previousChapter));

    // 주인공 이름 일관성 검증
    const newProtagonist = this.identifyProtagonist(newCharacters, this.getChapterContent(newChapter));
    const prevProtagonist = this.identifyProtagonist(prevCharacters, this.getChapterContent(previousChapter));

    if (newProtagonist && prevProtagonist && newProtagonist !== prevProtagonist) {
      errors.push({
        type: 'CHARACTER_NAME_CHANGED',
        severity: 'critical',
        description: `주인공 이름이 변경됨: ${prevProtagonist} → ${newProtagonist}`,
        chapterNumber: newChapter.chapterNumber,
        suggestedFix: `모든 "${newProtagonist}"를 "${prevProtagonist}"로 수정`,
        context: { previousName: prevProtagonist, newName: newProtagonist }
      });
    }

    // 캐릭터 능력 일관성 검증
    const newAbilities = this.extractCharacterAbilities(this.getChapterContent(newChapter));
    const prevAbilities = this.extractCharacterAbilities(this.getChapterContent(previousChapter));

    for (const [character, abilities] of newAbilities) {
      const prevCharAbilities = prevAbilities.get(character);
      if (prevCharAbilities && !this.areAbilitiesConsistent(prevCharAbilities, abilities)) {
        errors.push({
          type: 'ABILITY_INCONSISTENCY',
          severity: 'high',
          description: `${character}의 능력 설정이 변경됨`,
          chapterNumber: newChapter.chapterNumber,
          suggestedFix: `이전 능력 설정(${prevCharAbilities.join(', ')})으로 통일`,
          context: { character, previousAbilities: prevCharAbilities, newAbilities: abilities }
        });
      }
    }

    // 캐릭터 성격 일관성 검증
    const characterPersonalityChanges = this.detectPersonalityChanges(previousChapter, newChapter);
    for (const change of characterPersonalityChanges) {
      warnings.push({
        type: 'CHARACTER_OOC',
        description: `${change.character}의 성격이 급변함: ${change.description}`,
        chapterNumber: newChapter.chapterNumber,
        recommendation: '점진적 성격 변화 또는 명확한 사건 계기 제시'
      });
    }

    const confidence = errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.3;
    const valid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;

    return { valid, errors, warnings, confidence, aspectScores: {} as any };
  }

  /**
   * 세계관 일관성 검증
   */
  async validateWorldContinuity(storyState: StoryState, newChapter: ChapterState): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const chapterContent = this.getChapterContent(newChapter);

    // 마법 시스템 규칙 검증
    const magicViolations = this.checkMagicSystemViolations(storyState.worldbuilding.magicSystem, chapterContent);
    errors.push(...magicViolations);

    // 세계관 규칙 검증
    const worldRuleViolations = this.checkWorldRuleViolations(storyState.worldbuilding.rules, chapterContent);
    errors.push(...worldRuleViolations);

    // 지리적 일관성 검증
    const geographyIssues = this.checkGeographyConsistency(storyState.worldbuilding.geography, chapterContent);
    warnings.push(...geographyIssues);

    // 사회적 계층 일관성 검증
    const hierarchyIssues = this.checkSocialHierarchyConsistency(storyState.worldbuilding.socialHierarchy, chapterContent);
    warnings.push(...hierarchyIssues);

    const confidence = errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.4;
    const valid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;

    return { valid, errors, warnings, confidence, aspectScores: {} as any };
  }

  /**
   * 플롯 일관성 검증
   */
  async validatePlotContinuity(storyState: StoryState, newChapter: ChapterState): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 복선 회수 검증
    const unresolvedForeshadowing = storyState.plotProgress.foreshadowing.filter(f => !f.resolved);
    if (unresolvedForeshadowing.length > 10) {
      warnings.push({
        type: 'FORESHADOWING_DELAY',
        description: `회수되지 않은 복선이 너무 많음 (${unresolvedForeshadowing.length}개)`,
        chapterNumber: newChapter.chapterNumber,
        recommendation: '일부 복선을 해결하거나 명확한 해결 계획 제시'
      });
    }

    // 체코프의 총 검증
    const unfiredGuns = storyState.plotProgress.checkovGuns.filter(g => !g.fired);
    const oldGuns = unfiredGuns.filter(g => newChapter.chapterNumber - g.introduced > 20);
    if (oldGuns.length > 0) {
      warnings.push({
        type: 'FORESHADOWING_DELAY',
        description: `오래된 복선이 회수되지 않음: ${oldGuns.map(g => g.item).join(', ')}`,
        chapterNumber: newChapter.chapterNumber,
        recommendation: '복선 회수 또는 자연스러운 제거'
      });
    }

    // 플롯 구멍 검증
    const plotHoles = this.detectPlotHoles(storyState, newChapter);
    errors.push(...plotHoles);

    const confidence = errors.length === 0 ? (warnings.length <= 1 ? 1.0 : 0.7) : 0.3;
    const valid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;

    return { valid, errors, warnings, confidence, aspectScores: {} as any };
  }

  /**
   * 감정선 연속성 검증
   */
  async validateEmotionalFlow(storyState: StoryState, newChapter: ChapterState): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const previousChapter = storyState.chapters.get(newChapter.chapterNumber - 1);
    
    if (!previousChapter) {
      return { valid: true, errors: [], warnings: [], confidence: 1.0, aspectScores: {} as any };
    }

    // 감정 변화 거리 계산
    const emotionalDistance = this.calculateEmotionalDistance(
      previousChapter.endingEmotionalState,
      newChapter.emotionalTone
    );

    if (emotionalDistance > 0.7) { // 70% 이상 변화
      errors.push({
        type: 'EMOTIONAL_DISCONTINUITY',
        severity: 'medium',
        description: `감정선 급변: ${previousChapter.endingEmotionalState} → ${newChapter.emotionalTone}`,
        chapterNumber: newChapter.chapterNumber,
        suggestedFix: '점진적 감정 변화 또는 명확한 사건 계기 제시',
        context: { 
          previous: previousChapter.endingEmotionalState, 
          current: newChapter.emotionalTone,
          distance: emotionalDistance
        }
      });
    } else if (emotionalDistance > 0.5) { // 50% 이상 변화
      warnings.push({
        type: 'PACING_ISSUE',
        description: `감정 변화가 다소 급작스러움`,
        chapterNumber: newChapter.chapterNumber,
        recommendation: '전환 장면 추가 고려'
      });
    }

    const confidence = errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.5;
    const valid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;

    return { valid, errors, warnings, confidence, aspectScores: {} as any };
  }

  /**
   * 타임라인 일관성 검증
   */
  async validateTimelineContinuity(storyState: StoryState, newChapter: ChapterState): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const previousChapter = storyState.chapters.get(newChapter.chapterNumber - 1);
    
    if (!previousChapter) {
      return { valid: true, errors: [], warnings: [], confidence: 1.0, aspectScores: {} as any };
    }

    // 시간 역행 검증
    if (newChapter.publishedDate < previousChapter.publishedDate) {
      errors.push({
        type: 'TIMELINE_CONTRADICTION',
        severity: 'high',
        description: '챕터 시간순서 오류',
        chapterNumber: newChapter.chapterNumber,
        suggestedFix: '발행 날짜 수정',
        context: { 
          previous: previousChapter.publishedDate, 
          current: newChapter.publishedDate 
        }
      });
    }

    // 이벤트 순서 검증
    const timelineIssues = this.checkEventSequence(storyState.continuity.timeline, newChapter);
    errors.push(...timelineIssues);

    const confidence = errors.length === 0 ? 1.0 : 0.3;
    const valid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;

    return { valid, errors, warnings, confidence, aspectScores: {} as any };
  }

  /**
   * 연속성 수정 제안 생성
   */
  async suggestContinuityFix(validationErrors: ValidationError[], storyState: StoryState): Promise<FixSuggestion[]> {
    const suggestions: FixSuggestion[] = [];

    for (const error of validationErrors) {
      switch (error.type) {
        case 'CHARACTER_NAME_CHANGED':
          suggestions.push({
            type: 'character_merge',
            description: `캐릭터 이름 통일: ${error.context.newName} → ${error.context.previousName}`,
            targetChapters: [error.chapterNumber],
            changes: [{
              file: `chapters/novel-*-ch${error.chapterNumber}.md`,
              oldContent: error.context.newName,
              newContent: error.context.previousName,
              reason: '캐릭터 이름 일관성 유지'
            }],
            confidence: 0.9
          });
          break;

        case 'ABILITY_INCONSISTENCY':
          suggestions.push({
            type: 'ability_integration',
            description: `능력 설정 통합 또는 이전 설정으로 복원`,
            targetChapters: [error.chapterNumber],
            changes: [{
              file: `chapters/novel-*-ch${error.chapterNumber}.md`,
              oldContent: `능력: ${error.context.newAbilities.join(', ')}`,
              newContent: `능력: ${error.context.previousAbilities.join(', ')}`,
              reason: '캐릭터 능력 일관성 유지'
            }],
            confidence: 0.8
          });
          break;

        case 'WORLD_RULE_VIOLATION':
          suggestions.push({
            type: 'plot_bridge',
            description: '세계관 규칙 위반 수정',
            targetChapters: [error.chapterNumber],
            changes: [{
              file: `chapters/novel-*-ch${error.chapterNumber}.md`,
              oldContent: error.context.violatingContent,
              newContent: error.suggestedFix || '세계관 규칙에 맞게 수정',
              reason: '세계관 일관성 유지'
            }],
            confidence: 0.7
          });
          break;
      }
    }

    return suggestions;
  }

  // === 헬퍼 메서드들 ===

  /**
   * 챕터 컨텐츠 추출 (실제 구현에서는 마크다운 파싱)
   */
  private getChapterContent(chapter: ChapterState): string {
    // 임시 구현 - 실제로는 마크다운 파일에서 내용 추출
    return chapter.title + ' ' + chapter.summary + ' ' + chapter.keyEvents.join(' ');
  }

  /**
   * 캐릭터 이름 추출
   */
  private extractCharacterNames(content: string): string[] {
    const matches = content.match(this.characterNamePattern) || [];
    const nameCount = new Map<string, number>();
    
    matches.forEach(name => {
      nameCount.set(name, (nameCount.get(name) || 0) + 1);
    });
    
    return Array.from(nameCount.entries())
      .filter(([_, count]) => count >= 2)
      .map(([name, _]) => name);
  }

  /**
   * 주인공 식별
   */
  private identifyProtagonist(characters: string[], content: string): string | null {
    if (characters.length === 0) return null;
    
    // 가장 많이 언급된 캐릭터를 주인공으로 간주
    const counts = new Map<string, number>();
    characters.forEach(char => {
      const regex = new RegExp(char, 'g');
      const matches = content.match(regex) || [];
      counts.set(char, matches.length);
    });
    
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  }

  /**
   * 캐릭터 능력 추출
   */
  private extractCharacterAbilities(content: string): Map<string, string[]> {
    const abilities = new Map<string, string[]>();
    const characters = this.extractCharacterNames(content);
    
    for (const character of characters) {
      const charAbilities: string[] = [];
      
      for (const keyword of this.abilityKeywords) {
        const regex = new RegExp(`${character}.{0,50}${keyword}`, 'g');
        const matches = content.match(regex) || [];
        if (matches.length > 0) {
          charAbilities.push(keyword);
        }
      }
      
      if (charAbilities.length > 0) {
        abilities.set(character, charAbilities);
      }
    }
    
    return abilities;
  }

  /**
   * 능력 일관성 검사
   */
  private areAbilitiesConsistent(prevAbilities: string[], newAbilities: string[]): boolean {
    // 이전 능력이 새 능력에 모두 포함되어야 함 (확장은 허용)
    return prevAbilities.every(ability => newAbilities.includes(ability));
  }

  /**
   * 성격 변화 감지
   */
  private detectPersonalityChanges(prevChapter: ChapterState, newChapter: ChapterState): Array<{character: string, description: string}> {
    // 간단한 구현 - 실제로는 더 정교한 NLP 분석 필요
    const changes: Array<{character: string, description: string}> = [];
    
    // 감정 톤 급변 시 성격 변화로 간주
    if (Math.abs(this.getEmotionalScore(prevChapter.emotionalTone) - this.getEmotionalScore(newChapter.emotionalTone)) > 0.5) {
      changes.push({
        character: '주인공',
        description: `감정 상태 급변: ${prevChapter.emotionalTone} → ${newChapter.emotionalTone}`
      });
    }
    
    return changes;
  }

  /**
   * 마법 시스템 위반 검사
   */
  private checkMagicSystemViolations(magicSystem: any, content: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // 마법 시스템 규칙 위반 검사 (간단한 구현)
    if (content.includes('무한') && content.includes('마법')) {
      errors.push({
        type: 'WORLD_RULE_VIOLATION',
        severity: 'high',
        description: '마법 시스템 규칙 위반: 무한 마법 사용',
        chapterNumber: 0,
        suggestedFix: '마법 사용 제한 추가',
        context: { rule: '마법은 제한적이어야 함', violation: '무한 마법' }
      });
    }
    
    return errors;
  }

  /**
   * 세계관 규칙 위반 검사
   */
  private checkWorldRuleViolations(rules: string[], content: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    for (const rule of rules) {
      // 규칙별 위반 검사 로직 (향후 확장)
      if (rule.includes('감정') && content.includes('가짜 감정') && content.includes('마법')) {
        errors.push({
          type: 'WORLD_RULE_VIOLATION',
          severity: 'medium',
          description: `세계관 규칙 위반: ${rule}`,
          chapterNumber: 0,
          suggestedFix: '진정한 감정 기반 마법으로 수정',
          context: { rule, violatingContent: '가짜 감정으로 마법 사용' }
        });
      }
    }
    
    return errors;
  }

  /**
   * 지리적 일관성 검사
   */
  private checkGeographyConsistency(geography: any, content: string): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    // 새로운 지명이 등장할 때 경고 (간단한 구현)
    const locationPattern = /[가-힣]+(?:성|궁|령|지역|마을|도시)/g;
    const newLocations = content.match(locationPattern) || [];
    
    for (const location of newLocations) {
      if (!geography.locations.has(location)) {
        warnings.push({
          type: 'MINOR_INCONSISTENCY',
          description: `새로운 지명 등장: ${location}`,
          chapterNumber: 0,
          recommendation: '세계관 설정에 추가 고려'
        });
      }
    }
    
    return warnings;
  }

  /**
   * 사회적 계층 일관성 검사
   */
  private checkSocialHierarchyConsistency(hierarchy: any, content: string): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    // 계급 체계 위반 검사 (간단한 구현)
    if (content.includes('평민') && content.includes('황제') && content.includes('대등')) {
      warnings.push({
        type: 'MINOR_INCONSISTENCY',
        description: '사회적 계층 혼란: 평민과 황제의 대등한 관계',
        chapterNumber: 0,
        recommendation: '계급 차이 고려한 상호작용으로 수정'
      });
    }
    
    return warnings;
  }

  /**
   * 플롯 구멍 감지
   */
  private detectPlotHoles(storyState: StoryState, newChapter: ChapterState): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // 간단한 플롯 구멍 감지 로직
    const content = this.getChapterContent(newChapter);
    
    // 갑작스러운 해결 감지
    if (content.includes('갑자기') && (content.includes('해결') || content.includes('끝'))) {
      errors.push({
        type: 'PLOT_HOLE',
        severity: 'medium',
        description: '갑작스러운 문제 해결로 인한 플롯 구멍',
        chapterNumber: newChapter.chapterNumber,
        suggestedFix: '점진적 해결 과정 추가',
        context: { issue: '갑작스러운 해결' }
      });
    }
    
    return errors;
  }

  /**
   * 이벤트 순서 검증
   */
  private checkEventSequence(timeline: any[], newChapter: ChapterState): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // 시간 순서 위반 검사 (간단한 구현)
    const lastEvent = timeline[timeline.length - 1];
    if (lastEvent && newChapter.chapterNumber < lastEvent.chapterNumber) {
      errors.push({
        type: 'TIMELINE_CONTRADICTION',
        severity: 'high',
        description: '이벤트 시간순서 위반',
        chapterNumber: newChapter.chapterNumber,
        suggestedFix: '챕터 순서 조정',
        context: { lastEventChapter: lastEvent.chapterNumber, currentChapter: newChapter.chapterNumber }
      });
    }
    
    return errors;
  }

  /**
   * 감정적 거리 계산
   */
  private calculateEmotionalDistance(emotion1: string, emotion2: string): number {
    const emotionScores = new Map([
      ['positive', 1.0], ['hopeful', 0.8], ['neutral', 0.5], 
      ['tense', 0.3], ['negative', 0.1], ['sad', 0.0], ['uncertain', 0.4]
    ]);
    
    const score1 = emotionScores.get(emotion1) || 0.5;
    const score2 = emotionScores.get(emotion2) || 0.5;
    
    return Math.abs(score1 - score2);
  }

  /**
   * 감정 점수 계산
   */
  private getEmotionalScore(emotion: string): number {
    const scores = new Map([
      ['positive', 1.0], ['hopeful', 0.8], ['neutral', 0.5], 
      ['tense', 0.3], ['negative', 0.1], ['sad', 0.0], ['uncertain', 0.4]
    ]);
    
    return scores.get(emotion) || 0.5;
  }
}

// 싱글톤 인스턴스
export const episodeContinuityEngine = new EpisodeContinuityEngine();