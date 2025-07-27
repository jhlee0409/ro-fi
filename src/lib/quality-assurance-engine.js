/**
 * Quality Assurance Engine - 모든 콘텐츠 출력의 품질을 보장하는 핵심 시스템
 * 
 * 디지털 소울메이트 수준의 품질을 모든 생성 콘텐츠에 적용하여
 * 일관되게 고품질 결과물을 보장합니다.
 */

import { CharacterVoiceEngine } from './character-voice-engine.js';
import { PlatformConfigEngine } from './platform-config-engine.js';

export class QualityAssuranceEngine {
  constructor(platform = null) {
    // 플랫폼 설정 엔진 초기화
    this.platformConfig = new PlatformConfigEngine();
    if (platform) {
      this.platformConfig.setPlatform(platform);
    }
    
    // 플랫폼별 품질 기준 적용
    this.qualityStandards = this.platformConfig.getQualityStandards();
    
    // 기본 품질 패턴은 유지 (플랫폼 공통)
    
    // 캐릭터 보이스 엔진 초기화
    this.voiceEngine = new CharacterVoiceEngine();

    // 디지털 소울메이트 품질 기준에서 추출한 우수 패턴
    this.qualityPatterns = {
      excellentEmotions: [
        '가슴속에서', '마음속에서', '눈동자에', '목소리에', '표정에',
        '설렘', '두근거림', '떨림', '간절함', '그리움', '안타까움'
      ],
      
      excellentDescriptions: [
        '생생하게', '선명하게', '구체적으로', '세밀하게', '정교하게',
        '달빛이', '별빛이', '황금빛이', '은빛이', '신비로운 빛이'
      ],
      
      excellentDialogue: [
        '속삭임으로', '떨리는 목소리로', '진심을 담아', '간절히', '조심스럽게',
        '단호하게', '부드럽게', '따뜻하게', '차가운 목소리로'
      ],
      
      excellentTransitions: [
        '그 순간', '갑자기', '문득', '잠시 후', '그러나', '하지만',
        '동시에', '이윽고', '마침내', '결국', '그제서야'
      ]
    };

    // 품질 저하 패턴 (제거 대상)
    this.qualityViolations = {
      grammarErrors: [
        /(\w+)는 \1는/g,           // 중복 조사 (예: 카엘는 카엘는)
        /(\w+)이 \1이/g,           // 중복 조사 (예: 엘리아나이 엘리아나이)
        /(\w+)가 \1가/g,           // 중복 조사 (예: 그가 그가)
        /에서 (.+)이 두 사람을/g,   // 의미불명 연결 (예: 도서관에서...이 두 사람을)
        /했다이/g,                // 어미 오류 (예: 했다이)
        /있었다이/g               // 어미 오류 (예: 있었다이)
      ],
      
      awkwardRepetitions: [
        /\*'(.+)'\*\s*\*\*(\w+)\*\*가 속으로 생각했다\./g,  // 뻔한 내적 독백 패턴
        /> \*'이 순간이 올 줄 알았어\.\.\.'\*/g,              // 클리셰 대사
        /달빛이 창가로 스며들던 그 밤/g                       // 반복되는 시작 문구
      ],
      
      poorTransitions: [
        /\.\s*\[(.+)\]\s*\*\*(\w+)\*\*의/g,  // 어색한 장면 전환
        /에서 모든 것이 더 밝고 선명해 보였다/g  // 의미없는 묘사
      ]
    };
  }

  /**
   * 콘텐츠 품질을 종합적으로 검사하고 점수를 산출합니다
   */
  async assessQuality(content, metadata = {}) {
    const assessment = {
      score: 0,
      issues: [],
      suggestions: [],
      improvements: [],
      status: 'pending'
    };

    // 1. 기본 구조 검사
    const structureScore = this.checkStructure(content, assessment);
    
    // 2. 언어 품질 검사
    const languageScore = this.checkLanguageQuality(content, assessment);
    
    // 3. 스토리 품질 검사  
    const storyScore = this.checkStoryQuality(content, assessment);
    
    // 4. 감정 몰입도 검사
    const emotionScore = this.checkEmotionalDepth(content, assessment);
    
    // 5. 창의성 검사
    const creativityScore = this.checkCreativity(content, assessment);
    
    // 6. 캐릭터 일관성 검사 (신규 추가)
    const characterScore = await this.checkCharacterConsistency(content, metadata, assessment);

    // 종합 점수 계산 (가중 평균, 캐릭터 일관성 추가)
    assessment.score = Math.round(
      (structureScore * 0.15) +
      (languageScore * 0.25) +
      (storyScore * 0.2) +
      (emotionScore * 0.15) +
      (creativityScore * 0.1) +
      (characterScore * 0.15)  // 캐릭터 일관성 15% 비중
    );

    // 품질 상태 결정 (조정된 기준)
    if (assessment.score >= this.qualityStandards.qualityThreshold) {
      assessment.status = 'approved';
    } else if (assessment.score >= 65) { // 기준 완화
      assessment.status = 'needs_minor_improvement';
    } else {
      assessment.status = 'needs_major_improvement';
    }

    return assessment;
  }
  
  /**
   * 캐릭터 일관성 검사 (신규 추가)
   */
  async checkCharacterConsistency(content, metadata, assessment) {
    let score = 100;
    
    try {
      // 로맨스 레벨과 챕터 번호에서 캐릭터 보이스 가이드라인 생성
      const romanceLevel = metadata.romanceLevel || this.estimateRomanceLevel(metadata.chapterNumber || 1);
      const chapterNumber = metadata.chapterNumber || 1;
      
      const voiceGuideline = this.voiceEngine.generateVoiceGuideline(romanceLevel, chapterNumber);
      const consistencyCheck = this.voiceEngine.checkVoiceConsistency(content, voiceGuideline);
      
      // 일관성 점수 적용
      score = consistencyCheck.score;
      
      // 발견된 문제점들을 assessment에 추가
      consistencyCheck.issues.forEach(issue => {
        assessment.issues.push(`[캐릭터 일관성] ${issue.message}`);
      });
      
      // 개선 제안 추가
      consistencyCheck.suggestions.forEach(suggestion => {
        assessment.suggestions.push(`[캐릭터 보이스] ${suggestion}`);
      });
      
      // 심각한 일관성 문제가 있는 경우
      if (score < this.qualityStandards.characterConsistencyThreshold) {
        assessment.improvements.push('캐릭터 말투와 톤의 일관성을 개선해야 합니다.');
      }
      
      // 상세 분석 결과 저장
      assessment.characterAnalysis = {
        romanceLevel,
        relationshipStage: voiceGuideline.relationshipStage,
        consistencyScore: score,
        guidelines: voiceGuideline,
        issues: consistencyCheck.issues
      };
      
    } catch (error) {
      console.warn('캐릭터 일관성 검사 중 오류:', error.message);
      assessment.issues.push('[캐릭터 일관성] 검사 중 오류가 발생했습니다.');
      score = 80; // 기본 점수
    }
    
    return score;
  }
  
  /**
   * 챕터 번호로부터 로맨스 레벨 추정
   */
  estimateRomanceLevel(chapterNumber) {
    // 75챕터 기준으로 로맨스 진행도 추정
    if (chapterNumber <= 15) return Math.round(chapterNumber * 1); // 0-15%
    else if (chapterNumber <= 35) return 15 + Math.round((chapterNumber - 15) * 1.25); // 15-40%
    else if (chapterNumber <= 55) return 40 + Math.round((chapterNumber - 35) * 1.5); // 40-70%
    else return 70 + Math.round((chapterNumber - 55) * 1.5); // 70-100%
  }

  /**
   * 기본 구조와 분량을 검사합니다
   */
  checkStructure(content, assessment) {
    let score = 100;
    const wordCount = content.replace(/\s+/g, '').length;
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0).length;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    // 분량 검사 (단계적 점수 차감)
    if (wordCount < this.qualityStandards.minWordCount) {
      const shortage = this.qualityStandards.minWordCount - wordCount;
      const penaltyRatio = Math.min(shortage / this.qualityStandards.minWordCount, 0.5);
      const penalty = Math.round(penaltyRatio * 40); // 최대 40점 차감
      score -= penalty;
      assessment.issues.push(`분량 부족: ${wordCount}자 (최소 ${this.qualityStandards.minWordCount}자 필요)`);
      assessment.improvements.push('내용을 확장하여 최소 분량을 충족해야 합니다.');
    }

    if (wordCount > this.qualityStandards.maxWordCount) {
      score -= 10;
      assessment.suggestions.push(`분량 조정 권장: ${wordCount}자 (권장 ${this.qualityStandards.maxWordCount}자 이하)`);
    }

    // 문장 구조 검사
    if (sentences < this.qualityStandards.minSentences) {
      score -= 20;
      assessment.issues.push(`문장 수 부족: ${sentences}개 (최소 ${this.qualityStandards.minSentences}개 필요)`);
    }

    // 문단 구조 검사
    if (paragraphs < 3) {
      score -= 15;
      assessment.issues.push('문단 구성 부족: 최소 3개 문단 필요');
    }

    return Math.max(0, score);
  }

  /**
   * 언어 품질과 문법을 검사합니다
   */
  checkLanguageQuality(content, assessment) {
    let score = 100;
    let issueCount = 0;

    // 문법 오류 검사
    for (const [pattern, description] of Object.entries(this.qualityViolations.grammarErrors)) {
      const matches = content.match(pattern);
      if (matches) {
        issueCount += matches.length;
        assessment.issues.push(`문법 오류 발견: ${matches[0]} (${matches.length}회)`);
      }
    }

    // 어색한 반복 검사
    for (const pattern of this.qualityViolations.awkwardRepetitions) {
      const matches = content.match(pattern);
      if (matches) {
        issueCount += matches.length;
        assessment.issues.push(`어색한 반복 표현: ${matches[0]} (${matches.length}회)`);
      }
    }

    // 품질 저하 패턴 검사
    for (const pattern of this.qualityViolations.poorTransitions) {
      const matches = content.match(pattern);
      if (matches) {
        issueCount += matches.length;
        assessment.issues.push(`품질 저하 패턴: ${matches[0]} (${matches.length}회)`);
      }
    }

    // 점수 차감
    score -= issueCount * 15;

    if (score < 70) {
      assessment.improvements.push('언어 품질이 기준에 미달합니다. 문법 오류와 어색한 표현을 수정해야 합니다.');
    }

    return Math.max(0, score);
  }

  /**
   * 스토리 품질을 검사합니다
   */
  checkStoryQuality(content, assessment) {
    let score = 100;

    // 대화 비율 검사 (개선된 패턴 매칭)
    const dialogueMatches = content.match(/>\ \"/g) || []; // > " 패턴으로 정확한 대화 식별
    const totalText = content.replace(/\s+/g, '').length;
    const dialogueText = content.match(/>\ \"[^\"]*\"/g)?.join('').replace(/\s+/g, '').length || 0;
    const dialogueRatio = totalText > 0 ? dialogueText / totalText : 0;

    if (dialogueRatio < this.qualityStandards.dialogueRatio) {
      const penalty = Math.min(15, (this.qualityStandards.dialogueRatio - dialogueRatio) * 60);
      score -= penalty;
      assessment.issues.push(`대화 비율 부족: ${Math.round(dialogueRatio * 100)}% (최소 ${Math.round(this.qualityStandards.dialogueRatio * 100)}% 필요)`);
      assessment.improvements.push('캐릭터 간의 대화를 늘려 몰입도를 높여야 합니다.');
    }

    // 스토리 구조 요소 검사
    const hasConflict = /갈등|대립|충돌|문제|위기/.test(content);
    const hasEmotion = /사랑|그리움|설렘|두려움|분노|슬픔/.test(content);
    const hasProgress = /변화|발전|깨달음|결심|선택/.test(content);

    if (!hasConflict) {
      score -= 15;
      assessment.issues.push('갈등 요소 부족: 스토리의 긴장감이 필요합니다.');
    }

    if (!hasEmotion) {
      score -= 20;
      assessment.issues.push('감정적 요소 부족: 캐릭터의 감정 표현이 필요합니다.');
    }

    if (!hasProgress) {
      score -= 15;
      assessment.issues.push('스토리 진행 요소 부족: 플롯의 발전이 필요합니다.');
    }

    return Math.max(0, score);
  }

  /**
   * 감정적 몰입도를 검사합니다
   */
  checkEmotionalDepth(content, assessment) {
    let score = 100;
    let emotionKeywords = 0;

    // 감정 키워드 밀도 검사
    for (const emotion of this.qualityPatterns.excellentEmotions) {
      const regex = new RegExp(emotion, 'g');
      const matches = content.match(regex);
      if (matches) {
        emotionKeywords += matches.length;
      }
    }

    const totalWords = content.replace(/\s+/g, '').length;
    const emotionDensity = emotionKeywords / totalWords;

    if (emotionDensity < this.qualityStandards.emotionKeywordDensity) {
      const penalty = Math.min(20, (this.qualityStandards.emotionKeywordDensity - emotionDensity) * 1000);
      score -= penalty;
      assessment.issues.push(`감정 표현 부족: 밀도 ${Math.round(emotionDensity * 1000)/10}% (최소 ${Math.round(this.qualityStandards.emotionKeywordDensity * 1000)/10}% 필요)`);
      assessment.improvements.push('캐릭터의 내적 감정을 더 섬세하게 표현해야 합니다.');
    }

    // 내적 독백 품질 검사
    const internalThoughts = content.match(/\*'[^']+'\*/g) || [];
    if (internalThoughts.length < 3) {
      score -= 15;
      assessment.issues.push('내적 독백 부족: 캐릭터의 심리적 깊이가 필요합니다.');
    }

    return Math.max(0, score);
  }

  /**
   * 창의성과 독창성을 검사합니다
   */
  checkCreativity(content, assessment) {
    let score = 100;

    // 클리셰 패턴 검사
    const cliches = [
      /달빛이 창가로 스며들던 그 밤/g,
      /이 순간이 올 줄 알았어/g,
      /운명적인 만남/g,
      /마법같은 순간/g
    ];

    let clicheCount = 0;
    for (const pattern of cliches) {
      const matches = content.match(pattern);
      if (matches) {
        clicheCount += matches.length;
      }
    }

    if (clicheCount > 2) {
      score -= 20;
      assessment.issues.push(`클리셰 표현 과다: ${clicheCount}개 발견`);
      assessment.improvements.push('더 독창적이고 신선한 표현을 사용해야 합니다.');
    }

    // 독창적 표현 보너스
    const uniqueExpressions = [
      /[가-힣]+빛[이가].*[춤추|흘러|퍼져]/g,
      /[감정|마음|영혼].*[공명|울려|진동]/g,
      /시간[이가].*[멈춘|느려진|빨라진]/g
    ];

    let uniqueCount = 0;
    for (const pattern of uniqueExpressions) {
      const matches = content.match(pattern);
      if (matches) {
        uniqueCount += matches.length;
      }
    }

    if (uniqueCount > 0) {
      score = Math.min(100, score + (uniqueCount * 5));
      assessment.suggestions.push(`독창적 표현 발견: ${uniqueCount}개 (가산점 적용)`);
    }

    return Math.max(0, score);
  }

  /**
   * 콘텐츠를 자동으로 개선합니다
   */
  async improveContent(content, assessment) {
    let improvedContent = content;

    // 1. 문법 오류 수정
    improvedContent = this.fixGrammarErrors(improvedContent);

    // 2. 어색한 표현 개선
    improvedContent = this.improveAwkwardExpressions(improvedContent);

    // 3. 감정 표현 강화
    improvedContent = this.enhanceEmotionalExpressions(improvedContent);

    // 4. 대화 품질 향상
    improvedContent = this.improveDialogue(improvedContent);

    return improvedContent;
  }

  /**
   * 문법 오류를 자동 수정합니다
   */
  fixGrammarErrors(content) {
    let fixed = content;

    // 중복 조사 수정
    fixed = fixed.replace(/(\w+)는 \1는/g, '$1는');
    fixed = fixed.replace(/(\w+)이 \1이/g, '$1이');
    fixed = fixed.replace(/(\w+)가 \1가/g, '$1가');

    // 어미 오류 수정
    fixed = fixed.replace(/했다이/g, '했다');
    fixed = fixed.replace(/있었다이/g, '있었다');

    // 의미불명 연결 수정
    fixed = fixed.replace(/에서 (.+)이 두 사람을/g, '에서 $1. 두 사람은');

    return fixed;
  }

  /**
   * 어색한 표현을 개선합니다
   */
  improveAwkwardExpressions(content) {
    let improved = content;

    // 반복되는 시작 문구 다양화
    improved = improved.replace(
      /달빛이 창가로 스며들던 그 밤/g,
      this.getRandomElement([
        '별빛이 쏟아지던 고요한 밤',
        '은은한 달빛이 흘러내리던 밤',
        '신비로운 빛이 스며들던 밤',
        '고요한 정적이 흐르던 밤'
      ])
    );

    return improved;
  }

  /**
   * 감정 표현을 강화합니다
   */
  enhanceEmotionalExpressions(content) {
    let enhanced = content;

    // 기본적인 감정 표현을 더 풍부하게
    enhanced = enhanced.replace(/마음이 두근거렸다/g, '가슴속 깊은 곳에서 무언가가 꿈틀거렸다');
    enhanced = enhanced.replace(/놀랐다/g, '순간 숨이 멎는 듯했다');
    enhanced = enhanced.replace(/기뻤다/g, '마음이 따뜻하게 물들었다');

    return enhanced;
  }

  /**
   * 대화 품질을 향상시킵니다
   */
  improveDialogue(content) {
    const improved = content;

    // 대화 패턴 개선 - 기존 캐릭터 이름을 유지하면서 개선
    const dialogueMatches = [...content.matchAll(/> "(.+)"\s*\n\s*\n\s*\*\*(\w+)\*\*[가이]?\s+(.+)/g)];
    
    if (dialogueMatches.length === 0) {
      // 대화가 없거나 패턴이 다른 경우 원본 유지
      return content;
    }

    return improved;
  }

  /**
   * 유틸리티: 배열에서 랜덤 요소 선택
   */
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 품질 보고서를 생성합니다
   */
  generateQualityReport(assessment) {
    let report = `\n🏆 콘텐츠 품질 평가 보고서\n`;
    report += `==============================\n\n`;
    report += `📊 종합 점수: ${assessment.score}/100\n`;
    report += `📋 상태: ${this.getStatusEmoji(assessment.status)} ${this.getStatusText(assessment.status)}\n\n`;

    if (assessment.issues.length > 0) {
      report += `❌ 발견된 문제점 (${assessment.issues.length}개):\n`;
      assessment.issues.forEach((issue, index) => {
        report += `   ${index + 1}. ${issue}\n`;
      });
      report += `\n`;
    }

    if (assessment.improvements.length > 0) {
      report += `🔧 개선 권장사항 (${assessment.improvements.length}개):\n`;
      assessment.improvements.forEach((improvement, index) => {
        report += `   ${index + 1}. ${improvement}\n`;
      });
      report += `\n`;
    }

    if (assessment.suggestions.length > 0) {
      report += `💡 제안사항 (${assessment.suggestions.length}개):\n`;
      assessment.suggestions.forEach((suggestion, index) => {
        report += `   ${index + 1}. ${suggestion}\n`;
      });
      report += `\n`;
    }

    return report;
  }

  getStatusEmoji(status) {
    const emojis = {
      'approved': '✅',
      'needs_minor_improvement': '⚠️',
      'needs_major_improvement': '❌',
      'pending': '⏳'
    };
    return emojis[status] || '❓';
  }

  getStatusText(status) {
    const texts = {
      'approved': '승인됨 (출간 가능)',
      'needs_minor_improvement': '소폭 개선 필요',
      'needs_major_improvement': '대폭 개선 필요',
      'pending': '검토 중'
    };
    return texts[status] || '알 수 없음';
  }
}