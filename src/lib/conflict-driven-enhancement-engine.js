#!/usr/bin/env node

/**
 * 🔥 Conflict-Driven Enhancement Engine
 * 
 * 독자 피드백 기반 근본적 스토리텔링 개선 시스템
 * - 갈등과 긴장감 중심의 스토리 생성
 * - 예측 불가능한 전개 보장
 * - 캐릭터 복잡성과 성장 아크 강화
 * - 로맨스 필연성 구축
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ConflictDrivenEnhancementEngine {
  constructor(logger) {
    this.logger = logger || {
      info: console.log,
      warn: console.warn,
      error: console.error,
      success: console.log
    };
    
    // 갈등 생성 모듈
    this.conflictGenerators = {
      external: [
        '시간 수호단의 추격',
        '패러독스 위험 증가',
        '마법력 고갈 위기',
        '적대 세력의 개입',
        '시간 제한 카운트다운',
        '예상치 못한 방해 요소'
      ],
      internal: [
        '과거 개입의 윤리적 딜레마',
        '정체성과 존재 가치 혼란',
        '죄책감과 자책',
        '두려움과 불안',
        '선택에 대한 후회',
        '내면의 모순과 갈등'
      ],
      interpersonal: [
        '신뢰의 배신과 복구',
        '숨겨진 의도 발각',
        '이해관계 충돌',
        '감정적 오해와 갈등',
        '과거 상처의 재현',
        '선택의 기로에서 대립'
      ]
    };
    
    // 캐릭터 복잡성 요소
    this.characterComplexity = {
      hiddenMotives: [
        '복수를 위한 계획',
        '과거 연인을 되살리려는 시도',
        '자신의 죄를 속죄하려는 의도',
        '더 큰 비밀을 숨기기 위한 거짓',
        '상대방을 보호하기 위한 거리두기',
        '운명에 맞서려는 반항심'
      ],
      internalStruggles: [
        '과거와 현재 사이의 정체성 혼란',
        '책임감과 개인적 욕망의 충돌',
        '사랑과 의무 사이의 선택',
        '희생과 이기심 사이의 갈등',
        '용서와 복수 사이의 고민',
        '현실과 이상 사이의 괴리'
      ],
      growthArcs: [
        '냉소적 → 희망적',
        '수동적 → 주체적',
        '폐쇄적 → 개방적',
        '의존적 → 독립적',
        '이기적 → 이타적',
        '절망적 → 용기있는'
      ]
    };
    
    // 로맨스 필연성 구축 요소
    this.romanceBuilders = {
      emotionalBonds: [
        '공통의 상처와 치유',
        '서로의 약점을 이해하고 보완',
        '위기 상황에서의 신뢰 구축',
        '가치관의 충돌과 이해',
        '서로를 변화시키는 영향력',
        '운명적 연결고리 발견'
      ],
      obstacles: [
        '시간과 공간의 제약',
        '서로 다른 목적과 사명',
        '과거의 상처와 트라우마',
        '주변의 반대와 방해',
        '자신과의 싸움',
        '선택의 딜레마'
      ],
      chemistryBuilders: [
        '말보다 행동으로 보여주는 관심',
        '위험한 상황에서의 보호 본능',
        '서로의 진짜 모습 발견',
        '예상치 못한 순간의 설렘',
        '갈등 후 더 깊어지는 이해',
        '소소한 일상 속 특별함'
      ]
    };
    
    // 예측 불가능성 증대 요소
    this.unpredictabilityFactors = {
      plotTwists: [
        '믿었던 동료의 배신',
        '적이었던 존재의 진짜 의도',
        '예상과 정반대의 결과',
        '숨겨진 진실의 충격적 공개',
        '시간 패러독스의 예상치 못한 결과',
        '선택의 의외한 파급효과'
      ],
      characterReversals: [
        '착한 인물의 어두운 면',
        '냉정한 인물의 따뜻한 마음',
        '약해 보이는 인물의 강인함',
        '완벽해 보이는 인물의 치명적 결함',
        '적대적 인물의 숨겨진 선의',
        '신뢰했던 인물의 이중성'
      ]
    };
  }

  /**
   * 메인 갈등 중심 향상 함수
   */
  async enhanceWithConflict(content, storyContext) {
    this.logger.info('🔥 갈등 중심 스토리 향상 시작');
    
    try {
      // 1단계: 현재 갈등 수준 분석
      const conflictAnalysis = this.analyzeCurrentConflict(content);
      this.logger.info('📊 갈등 분석 완료', conflictAnalysis);
      
      // 2단계: 부족한 갈등 요소 식별
      const missingElements = this.identifyMissingElements(conflictAnalysis, storyContext);
      this.logger.info('🔍 부족한 요소 식별', missingElements);
      
      // 3단계: 갈등 주입
      let enhancedContent = await this.injectConflicts(content, missingElements, storyContext);
      
      // 4단계: 캐릭터 복잡성 강화
      enhancedContent = await this.enhanceCharacterComplexity(enhancedContent, storyContext);
      
      // 5단계: 로맨스 필연성 구축
      enhancedContent = await this.buildRomanceNecessity(enhancedContent, storyContext);
      
      // 6단계: 예측 불가능성 증대
      enhancedContent = await this.increaseUnpredictability(enhancedContent, storyContext);
      
      // 7단계: 최종 갈등 검증
      const finalAnalysis = this.analyzeCurrentConflict(enhancedContent);
      
      this.logger.success('✨ 갈등 중심 향상 완료', {
        before: conflictAnalysis,
        after: finalAnalysis,
        improvement: finalAnalysis.totalScore - conflictAnalysis.totalScore
      });
      
      return {
        enhancedContent,
        conflictAnalysis: finalAnalysis,
        improvementScore: finalAnalysis.totalScore,
        conflictStatus: finalAnalysis.totalScore >= 8.0 ? 'HIGH_CONFLICT' : finalAnalysis.totalScore >= 6.0 ? 'MEDIUM_CONFLICT' : 'LOW_CONFLICT'
      };
      
    } catch (error) {
      this.logger.error('❌ 갈등 향상 실패:', error.message);
      throw error;
    }
  }

  /**
   * 현재 컨텐츠의 갈등 수준 분석
   */
  analyzeCurrentConflict(content) {
    const analysis = {
      externalConflict: 0,
      internalConflict: 0,
      interpersonalConflict: 0,
      tensionLevel: 0,
      unpredictabilityScore: 0
    };
    
    // 외적 갈등 검출
    const externalKeywords = ['위험', '추격', '위기', '공격', '방해', '장애물', '적', '시간제한'];
    analysis.externalConflict = this.countKeywords(content, externalKeywords) * 0.5;
    
    // 내적 갈등 검출
    const internalKeywords = ['고민', '갈등', '후회', '죄책감', '두려움', '불안', '혼란', '딜레마'];
    analysis.internalConflict = this.countKeywords(content, internalKeywords) * 0.7;
    
    // 인간관계 갈등 검출
    const interpersonalKeywords = ['배신', '오해', '의심', '불신', '갈등', '대립', '충돌'];
    analysis.interpersonalConflict = this.countKeywords(content, interpersonalKeywords) * 0.6;
    
    // 긴장감 수준 (감정적 강도)
    const tensionKeywords = ['긴장', '초조', '불안', '조급', '절망', '분노', '충격'];
    analysis.tensionLevel = this.countKeywords(content, tensionKeywords) * 0.8;
    
    // 예측 불가능성
    const unpredictableKeywords = ['갑자기', '예상치 못한', '뜻밖의', '반전', '놀랍게도', '의외로'];
    analysis.unpredictabilityScore = this.countKeywords(content, unpredictableKeywords) * 0.9;
    
    // 총점 계산 (10점 만점)
    analysis.totalScore = Math.min(10, 
      analysis.externalConflict + 
      analysis.internalConflict + 
      analysis.interpersonalConflict + 
      analysis.tensionLevel + 
      analysis.unpredictabilityScore
    );
    
    return analysis;
  }

  /**
   * 키워드 개수 계산 헬퍼
   */
  countKeywords(content, keywords) {
    let count = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex);
      count += matches ? matches.length : 0;
    });
    return Math.min(5, count); // 최대 5점
  }

  /**
   * 부족한 갈등 요소 식별
   */
  identifyMissingElements(analysis, storyContext) {
    const missing = [];
    
    if (analysis.externalConflict < 2) {
      missing.push('external_conflict');
    }
    if (analysis.internalConflict < 2) {
      missing.push('internal_conflict');
    }
    if (analysis.interpersonalConflict < 2) {
      missing.push('interpersonal_conflict');
    }
    if (analysis.tensionLevel < 2) {
      missing.push('tension_building');
    }
    if (analysis.unpredictabilityScore < 1) {
      missing.push('unpredictability');
    }
    
    return missing;
  }

  /**
   * 갈등 주입
   */
  async injectConflicts(content, missingElements, storyContext) {
    let enhanced = content;
    
    for (const element of missingElements) {
      switch (element) {
        case 'external_conflict':
          enhanced = this.addExternalConflict(enhanced, storyContext);
          break;
        case 'internal_conflict':
          enhanced = this.addInternalConflict(enhanced, storyContext);
          break;
        case 'interpersonal_conflict':
          enhanced = this.addInterpersonalConflict(enhanced, storyContext);
          break;
        case 'tension_building':
          enhanced = this.buildTension(enhanced, storyContext);
          break;
        case 'unpredictability':
          enhanced = this.addUnpredictableElement(enhanced, storyContext);
          break;
      }
    }
    
    return enhanced;
  }

  /**
   * 외적 갈등 추가
   */
  addExternalConflict(content, storyContext) {
    const conflicts = this.conflictGenerators.external;
    const selectedConflict = conflicts[Math.floor(Math.random() * conflicts.length)];
    
    // 스토리 맥락에 따른 갈등 삽입
    if (storyContext.chapterNumber <= 2) {
      // 초반: 위기 상황 도입
      return content.replace(
        /(평화로운|조용한|고요한)/g,
        `긴장감이 감도는`
      ).replace(
        /(쉽게|순조롭게)/g,
        `예상치 못한 방해로 인해 어려움을 겪으며`
      );
    } else {
      // 중후반: 직접적 위협
      return content + `\n\n하지만 그 순간, ${selectedConflict}이 그들의 계획을 위협했다. 상황은 예상보다 훨씬 복잡하고 위험했다.`;
    }
  }

  /**
   * 내적 갈등 추가
   */
  addInternalConflict(content, storyContext) {
    const struggles = this.characterComplexity.internalStruggles;
    const selectedStruggle = struggles[Math.floor(Math.random() * struggles.length)];
    
    // 주인공의 내적 갈등 강화
    return content.replace(
      /(그는|그녀는|이연은|윤슬은)(.+)(생각했다|느꼈다|깨달았다)/g,
      `$1$2$3. 하지만 동시에 ${selectedStruggle}으로 인한 혼란이 마음 깊숙이 자리잡고 있었다`
    );
  }

  /**
   * 인간관계 갈등 추가
   */
  addInterpersonalConflict(content, storyContext) {
    // 신뢰와 의심 사이의 복잡한 감정 추가
    return content.replace(
      /(믿을 수 있을|신뢰할 수 있을)/g,
      `정말로 믿어도 될지 확신할 수 없는`
    ).replace(
      /(편안한|안전한|따뜻한)/g,
      `표면적으로는 $1지만 어딘지 모르게 경계심이 드는`
    );
  }

  /**
   * 긴장감 구축
   */
  buildTension(content, storyContext) {
    // 시간 압박과 긴박감 추가
    return content.replace(
      /(천천히|여유롭게|조용히)/g,
      `조급하게`
    ).replace(
      /(\.|!)/g,
      `$1 시간이 촉박했고, 매 순간이 중요했다.`
    );
  }

  /**
   * 예측 불가능한 요소 추가
   */
  addUnpredictableElement(content, storyContext) {
    const twists = this.unpredictabilityFactors.plotTwists;
    const selectedTwist = twists[Math.floor(Math.random() * twists.length)];
    
    return content + `\n\n그런데 예상치 못한 일이 벌어졌다. ${selectedTwist}이 모든 계획을 뒤바꿔 놓았다. 이제 상황은 완전히 달라졌다.`;
  }

  /**
   * 캐릭터 복잡성 강화
   */
  async enhanceCharacterComplexity(content, storyContext) {
    let enhanced = content;
    
    // 숨겨진 의도 암시
    const hiddenMotives = this.characterComplexity.hiddenMotives;
    const selectedMotive = hiddenMotives[Math.floor(Math.random() * hiddenMotives.length)];
    
    enhanced = enhanced.replace(
      /(진심으로|정말로|솔직히)/g,
      `겉으로는 진심인 것처럼 보이지만 내심으로는`
    );
    
    // 캐릭터의 이중성 표현
    enhanced = enhanced.replace(
      /(미소를 지었다|웃었다)/g,
      `미소를 지었지만 그 눈빛 깊숙한 곳에는 다른 감정이 숨어있었다`
    );
    
    return enhanced;
  }

  /**
   * 로맨스 필연성 구축
   */
  async buildRomanceNecessity(content, storyContext) {
    let enhanced = content;
    
    // 피상적인 끌림을 깊은 감정적 연결로 대체
    enhanced = enhanced.replace(
      /(예뻐서|잘생겨서|매력적이어서)/g,
      `그의/그녀의 상처받은 마음을 이해할 수 있어서`
    );
    
    // 로맨스에 장애물과 갈등 추가
    enhanced = enhanced.replace(
      /(가까워지고 있었다|친해지고 있었다)/g,
      `서로에게 끌리면서도 각자의 사정으로 인해 복잡한 감정을 느끼고 있었다`
    );
    
    return enhanced;
  }

  /**
   * 예측 불가능성 증대
   */
  async increaseUnpredictability(content, storyContext) {
    let enhanced = content;
    
    // 클리셰 표현 제거 및 반전 요소 추가
    enhanced = enhanced.replace(
      /(당연히|예상대로|역시)/g,
      `예상과는 달리`
    );
    
    // 반전 요소 강화
    const reversals = this.unpredictabilityFactors.characterReversals;
    const selectedReversal = reversals[Math.floor(Math.random() * reversals.length)];
    
    if (Math.random() > 0.7) { // 30% 확률로 반전 요소 추가
      enhanced += `\n\n하지만 진실은 그들이 생각했던 것과는 전혀 달랐다. ${selectedReversal}이 서서히 드러나고 있었다.`;
    }
    
    return enhanced;
  }
}

export default ConflictDrivenEnhancementEngine;