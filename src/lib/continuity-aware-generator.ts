/**
 * ContinuityAwareEpisodeGenerator - 연속성 기반 에피소드 생성기
 * 
 * 참고: 연속성_관리.md의 ContinuityAwareEpisodeGenerator 클래스를 현재 프로젝트에 맞게 구현
 * 기능: StoryStateManager, EpisodeContinuityEngine, ContextWindowManager 통합하여 연속성 보장
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  StoryState,
  ChapterState,
  GenerationContext,
  ValidationResult,
  GenerationResult,
  FixSuggestion
} from './types/continuity.js';
import { storyStateManager } from './story-state-manager.js';
import { episodeContinuityEngine } from './episode-continuity-engine.js';
import { contextWindowManager } from './context-window-manager.js';

export class ContinuityAwareEpisodeGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 4000,
        topP: 0.9,
        topK: 40
      }
    });
  }

  /**
   * 연속성을 보장하는 다음 챕터 생성
   */
  async generateNextChapter(novelSlug: string): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 ${novelSlug} 다음 챕터 생성 시작`);
      
      // 1. 스토리 상태 로드
      const storyState = await storyStateManager.getStory(novelSlug);
      const nextChapterNum = storyState.metadata.currentChapter + 1;
      
      console.log(`📖 현재 챕터: ${storyState.metadata.currentChapter}, 생성 예정: ${nextChapterNum}`);
      
      // 2. 컨텍스트 구성 (연속성 고려)
      const context = await contextWindowManager.buildContextForChapter(novelSlug, nextChapterNum);
      
      console.log(`📝 컨텍스트 구성 완료:`);
      console.log(contextWindowManager.generateContextSummary(context));
      
      // 3. 연속성 강화 프롬프트 구성
      const prompt = this.buildContinuityPrompt(context, storyState, nextChapterNum);
      
      // 4. AI 생성 (재시도 로직 포함)
      let chapter: ChapterState | null = null;
      let validationResult: ValidationResult | null = null;
      let attempts = 0;
      const maxAttempts = 3;
      let tokensUsed = 0;
      
      while (!chapter && attempts < maxAttempts) {
        attempts++;
        console.log(`🤖 AI 생성 시도 ${attempts}/${maxAttempts}`);
        
        try {
          // Gemini API 호출
          const result = await this.callGeminiWithContext(prompt, context);
          const generated = this.parseGeneratedContent(result, nextChapterNum, novelSlug);
          tokensUsed += this.estimateTokenUsage(prompt);
          
          // 5. 연속성 검증
          validationResult = await episodeContinuityEngine.validateAllAspects(storyState, generated);
          
          console.log(`✅ 연속성 검증 결과:`);
          console.log(`- 유효성: ${validationResult.valid}`);
          console.log(`- 신뢰도: ${(validationResult.confidence * 100).toFixed(1)}%`);
          console.log(`- 오류: ${validationResult.errors.length}개`);
          console.log(`- 경고: ${validationResult.warnings.length}개`);
          
          if (validationResult.valid && validationResult.confidence >= 0.7) {
            chapter = generated;
            console.log(`✅ 챕터 생성 성공! (시도 ${attempts}/${maxAttempts})`);
          } else {
            // 검증 실패 시 피드백 추가하여 재생성
            const feedback = this.generateValidationFeedback(validationResult);
            prompt = this.addValidationFeedback(prompt, feedback);
            console.log(`❌ 검증 실패, 피드백 추가하여 재시도`);
            console.log(`피드백: ${feedback.substring(0, 200)}...`);
          }
        } catch (error) {
          console.error(`🚨 생성 시도 ${attempts} 실패:`, error);
          if (attempts === maxAttempts) {
            throw error;
          }
        }
      }
      
      if (!chapter || !validationResult) {
        throw new Error('연속성 검증을 통과하는 챕터 생성에 실패했습니다.');
      }
      
      // 6. 스토리 상태 업데이트
      await storyStateManager.updateAfterChapter(novelSlug, chapter);
      
      console.log(`🎉 챕터 ${nextChapterNum} 생성 완료!`);
      console.log(`- 단어 수: ${chapter.wordCount}자`);
      console.log(`- 감정 톤: ${chapter.emotionalTone}`);
      console.log(`- 주요 이벤트: ${chapter.keyEvents.length}개`);
      
      const generationTime = Date.now() - startTime;
      
      return {
        chapter,
        metadata: {
          generationTime,
          tokensUsed,
          validationPassed: true,
          attempts
        },
        context,
        validationResult
      };
      
    } catch (error) {
      console.error(`💥 챕터 생성 실패:`, error);
      throw error;
    }
  }

  /**
   * 연속성 강화 프롬프트 구성
   */
  private buildContinuityPrompt(context: GenerationContext, storyState: StoryState, chapterNum: number): string {
    const previousChapter = context.immediate.previousChapter;
    const mainCharacters = Array.from(context.essential.mainCharacters.entries());
    
    return `
[연속성 유지 시스템 - 절대 변경 금지 사항]

소설명: ${context.essential.novelTitle}
현재 진행: ${chapterNum}화 작성

=== 캐릭터 설정 (절대 변경 금지) ===
${mainCharacters.map(([name, profile]) => `
캐릭터명: ${name}
능력: ${profile.abilities.join(', ')}
성격: ${profile.personality.join(', ')}
현재 상태: ${JSON.stringify(profile.currentState)}
`).join('\n')}

=== 세계관 규칙 (절대 준수) ===
${context.essential.worldRules.map(rule => `- ${rule}`).join('\n')}

마법 시스템: ${context.essential.magicSystem.name}
- 원리: ${context.essential.magicSystem.source}
- 제약: ${context.essential.magicSystem.limitations.join(', ')}

=== 직전 챕터 연결점 ===
${previousChapter ? `
제목: ${previousChapter.title}
마지막 상황: ${previousChapter.endingEmotionalState}
클리프행어: ${previousChapter.cliffhanger || '없음'}
주요 이벤트: ${previousChapter.keyEvents.slice(0, 3).join(', ')}
` : '첫 번째 챕터입니다.'}

=== 현재 진행 중인 플롯 ===
메인 스토리 아크: ${context.essential.currentArc}
활성 갈등: ${context.immediate.activeConflicts.join(', ')}

=== 최근 진행 상황 ===
${context.recent.last5Chapters.slice(-2).map(ch => `
${ch.chapterNumber}화: ${ch.title} - ${ch.emotionalTone}
`).join('')}

=== 연속성 준수 규칙 ===
1. 캐릭터 이름/능력 절대 변경 금지
2. 직전 챕터 상황과 자연스럽게 연결
3. 설정된 세계관 규칙 100% 준수
4. 감정선 급변 금지 (점진적 변화만 허용)
5. 기존 캐릭터 성격 일관성 유지
6. 트로프 유지: ${context.essential.tropes.join(', ')}

=== 작성 요구사항 ===
- 분량: 2,500-3,500자 (한국어 기준)
- 감정선: ${previousChapter?.endingEmotionalState || 'neutral'}에서 자연스럽게 진행
- 대화 40%, 서술 60% 비율
- 내적 독백으로 감정 표현
- 로맨스 장르 특성 반영
- 챕터 말미 적절한 클리프행어

=== 출력 형식 (JSON) ===
반드시 다음 JSON 형식으로만 응답하세요:

{
  "title": "챕터 제목",
  "content": "본문 내용 (2,500-3,500자)",
  "summary": "100자 이내 요약",
  "keyEvents": ["핵심 사건1", "핵심 사건2", "핵심 사건3"],
  "characterStates": {
    "캐릭터명": {
      "location": "현재 위치",
      "emotionalState": "감정 상태",
      "powerLevel": 5,
      "motivations": ["동기1", "동기2"]
    }
  },
  "emotionalTone": "positive|negative|tense|neutral|romantic",
  "endingEmotionalState": "챕터 종료 시점 감정",
  "cliffhanger": "다음 화를 기대하게 할 마무리",
  "plotProgression": {
    "mainArcProgress": "메인 플롯 진전 사항",
    "foreshadowingPlanted": ["새로 심은 복선"],
    "foreshadowingResolved": ["해결된 복선"]
  }
}

지금 ${chapterNum}화를 작성해주세요.
`;
  }

  /**
   * Gemini API 호출
   */
  private async callGeminiWithContext(prompt: string, context: GenerationContext): Promise<string> {
    try {
      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 4000,
          topP: 0.9,
          topK: 40
        }
      });

      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('Gemini API에서 빈 응답을 받았습니다.');
      }

      return text;
    } catch (error) {
      console.error('Gemini API 호출 실패:', error);
      throw new Error(`Gemini API 오류: ${error}`);
    }
  }

  /**
   * 생성된 컨텐츠 파싱
   */
  private parseGeneratedContent(content: string, chapterNumber: number, novelSlug: string): ChapterState {
    try {
      // JSON 부분 추출
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 형식을 찾을 수 없습니다.');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // ChapterState 형식으로 변환
      const chapterState: ChapterState = {
        chapterNumber,
        title: parsed.title || `${chapterNumber}화`,
        summary: parsed.summary || '',
        keyEvents: parsed.keyEvents || [],
        characterStates: new Map(Object.entries(parsed.characterStates || {})),
        newCharacters: [],
        locationChanges: new Map(),
        emotionalTone: parsed.emotionalTone || 'neutral',
        endingEmotionalState: parsed.endingEmotionalState || parsed.emotionalTone || 'neutral',
        cliffhanger: parsed.cliffhanger,
        plotProgression: {
          mainArcProgress: parsed.plotProgression?.mainArcProgress || '',
          subplotChanges: [],
          foreshadowingPlanted: parsed.plotProgression?.foreshadowingPlanted || [],
          foreshadowingResolved: parsed.plotProgression?.foreshadowingResolved || []
        },
        wordCount: (parsed.content || '').length,
        contentRating: '15+',
        publishedDate: new Date()
      };

      // 내용 검증
      if (!parsed.content || parsed.content.length < 1000) {
        throw new Error('생성된 내용이 너무 짧습니다.');
      }

      if (!parsed.title) {
        throw new Error('제목이 생성되지 않았습니다.');
      }

      return chapterState;
    } catch (error) {
      console.error('생성된 컨텐츠 파싱 실패:', error);
      console.error('원본 컨텐츠:', content.substring(0, 500) + '...');
      throw new Error(`컨텐츠 파싱 오류: ${error}`);
    }
  }

  /**
   * 검증 피드백 생성
   */
  private generateValidationFeedback(validationResult: ValidationResult): string {
    const feedback: string[] = [];
    
    feedback.push('[연속성 검증 피드백]');
    
    if (validationResult.errors.length > 0) {
      feedback.push('\n❌ 오류 (반드시 수정):');
      for (const error of validationResult.errors) {
        feedback.push(`- ${error.description}`);
        if (error.suggestedFix) {
          feedback.push(`  수정 방안: ${error.suggestedFix}`);
        }
      }
    }
    
    if (validationResult.warnings.length > 0) {
      feedback.push('\n⚠️ 경고 (개선 권장):');
      for (const warning of validationResult.warnings) {
        feedback.push(`- ${warning.description}`);
        if (warning.recommendation) {
          feedback.push(`  권장사항: ${warning.recommendation}`);
        }
      }
    }
    
    feedback.push('\n📊 신뢰도 점수:');
    Object.entries(validationResult.aspectScores).forEach(([aspect, score]) => {
      feedback.push(`- ${aspect}: ${(score * 100).toFixed(1)}%`);
    });
    
    feedback.push('\n위 피드백을 반영하여 다시 작성해주세요.');
    
    return feedback.join('\n');
  }

  /**
   * 프롬프트에 검증 피드백 추가
   */
  private addValidationFeedback(originalPrompt: string, feedback: string): string {
    return `${originalPrompt}

${feedback}

위 피드백을 모두 반영하여 다시 작성해주세요.`;
  }

  /**
   * 토큰 사용량 추정
   */
  private estimateTokenUsage(prompt: string): number {
    // 한국어 기준 대략적 추정
    return Math.ceil(prompt.length * 0.8);
  }

  /**
   * 연속성 문제 자동 수정 (실험적 기능)
   */
  async autoFixContinuityIssues(novelSlug: string, validationErrors: any[]): Promise<FixSuggestion[]> {
    const suggestions = await episodeContinuityEngine.suggestContinuityFix(validationErrors, await storyStateManager.getStory(novelSlug));
    
    console.log(`🔧 ${suggestions.length}개의 자동 수정 제안 생성`);
    for (const suggestion of suggestions) {
      console.log(`- ${suggestion.type}: ${suggestion.description}`);
    }
    
    return suggestions;
  }

  /**
   * 배치 생성 (여러 챕터를 한 번에 생성)
   */
  async generateMultipleChapters(novelSlug: string, count: number): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];
    
    console.log(`📚 ${novelSlug} ${count}개 챕터 배치 생성 시작`);
    
    for (let i = 0; i < count; i++) {
      try {
        console.log(`\n=== ${i + 1}/${count} 챕터 생성 ===`);
        const result = await this.generateNextChapter(novelSlug);
        results.push(result);
        
        // 챕터 간 딜레이 (API 레이트 리밋 고려)
        if (i < count - 1) {
          console.log('⏳ 다음 챕터 생성 전 대기...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`💥 ${i + 1}번째 챕터 생성 실패:`, error);
        break; // 하나가 실패하면 배치 중단
      }
    }
    
    console.log(`✅ 배치 생성 완료: ${results.length}/${count}개 성공`);
    return results;
  }

  /**
   * 생성 통계 조회
   */
  async getGenerationStats(novelSlug: string): Promise<{
    totalChapters: number;
    avgWordCount: number;
    avgGenerationTime: number;
    validationSuccessRate: number;
    continuityScore: number;
  }> {
    const storyState = await storyStateManager.getStory(novelSlug);
    const chapters = Array.from(storyState.chapters.values());
    
    if (chapters.length === 0) {
      return {
        totalChapters: 0,
        avgWordCount: 0,
        avgGenerationTime: 0,
        validationSuccessRate: 0,
        continuityScore: 0
      };
    }
    
    const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
    const avgWordCount = Math.round(totalWords / chapters.length);
    
    // 연속성 점수 계산 (간단한 구현)
    let continuityScore = 1.0;
    for (let i = 1; i < chapters.length; i++) {
      const validation = await episodeContinuityEngine.validateAllAspects(storyState, chapters[i]);
      continuityScore = Math.min(continuityScore, validation.confidence);
    }
    
    return {
      totalChapters: chapters.length,
      avgWordCount,
      avgGenerationTime: 0, // 추후 구현
      validationSuccessRate: continuityScore,
      continuityScore
    };
  }
}

// 싱글톤 인스턴스
export const continuityAwareGenerator = new ContinuityAwareEpisodeGenerator();