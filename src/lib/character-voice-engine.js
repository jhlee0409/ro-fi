/**
 * 캐릭터 보이스 엔진
 * 등장인물의 말투, 어조, 행동 패턴의 일관성을 유지하는 시스템
 */

export class CharacterVoiceEngine {
  constructor() {
    // 캐릭터 프로필 데이터베이스
    this.characterProfiles = {
      // 주인공 - 라이아 (일관된 이름 사용)
      protagonist: {
        name: "라이아",
        aliases: ["라이아", "Laia"], // 허용되는 이름 변형
        personality: {
          core: "강인하지만 감정적, 복수심과 정의감이 강함",
          arc: "적대감 → 혼란 → 신뢰 → 사랑"
        },
        speechPatterns: {
          // 감정 상태별 말투
          hostile: {
            pronouns: "넌, 너, 네가", // 반말
            tone: "날카롭고 직설적",
            endings: "~야, ~지, ~잖아",
            vocabulary: ["배신자", "적", "용서하지 않아"]
          },
          confused: {
            pronouns: "당신, 너", // 혼재
            tone: "혼란스럽고 방어적",
            endings: "~는 거야?, ~잖아, ~니까",
            vocabulary: ["이해할 수 없어", "혼란스러워", "모르겠어"]
          },
          warming: {
            pronouns: "당신", // 존중하는 거리감
            tone: "조심스럽지만 부드러워짐",
            endings: "~네요, ~거예요, ~죠",
            vocabulary: ["고마워요", "미안해요", "이해해요"]
          },
          intimate: {
            pronouns: "당신, 카이런", // 이름 호칭
            tone: "따뜻하고 친밀함",
            endings: "~요, ~해요, ~네요",
            vocabulary: ["사랑해", "고마워", "함께해요"]
          }
        },
        actions: {
          hostile: ["노려보다", "이를 악물다", "주먹을 쥐다"],
          confused: ["머뭇거리다", "고개를 숙이다", "눈을 피하다"],
          warming: ["미소짓다", "눈을 마주치다", "고개를 끄덕이다"],
          intimate: ["손을 내밀다", "따뜻하게 웃다", "눈을 반짝이다"]
        }
      },
      
      // 남주 - 카이런
      male_lead: {
        name: "카이런",
        aliases: ["카이런", "Kai", "카이"], 
        personality: {
          core: "냉정하지만 따뜻한 마음, 죄책감과 보호 본능",
          arc: "냉정함 → 후회 → 솔직함 → 헌신"
        },
        speechPatterns: {
          cold: {
            pronouns: "네가, 넌", 
            tone: "냉정하고 거리감 있음",
            endings: "~다, ~지, ~야",
            vocabulary: ["명령", "의무", "필요하다"]
          },
          regretful: {
            pronouns: "너, 네가",
            tone: "무거운 죄책감",
            endings: "~었어, ~지만, ~야",
            vocabulary: ["미안하다", "후회한다", "실수였다"]
          },
          honest: {
            pronouns: "당신, 라이아",
            tone: "진솔하고 담담함",
            endings: "~예요, ~습니다, ~어요",
            vocabulary: ["진심", "솔직히", "정말로"]
          },
          devoted: {
            pronouns: "라이아, 당신",
            tone: "따뜻하고 보호적",
            endings: "~요, ~해요, ~까요",
            vocabulary: ["사랑해", "지키겠다", "함께하자"]
          }
        },
        actions: {
          cold: ["차갑게 바라보다", "무표정하다", "돌아서다"],
          regretful: ["한숨짓다", "고개를 숙이다", "주먹을 쥐다"],
          honest: ["진지하게 말하다", "눈을 마주치다", "차분히 설명하다"],
          devoted: ["부드럽게 웃다", "손을 내밀다", "안아주다"]
        }
      }
    };
    
    // 로맨스 진행 단계별 관계 동학
    this.relationshipDynamics = {
      0: { // 0-20% 적대 관계
        protagonist_mood: "hostile",
        male_lead_mood: "cold",
        interaction_style: "대립적, 날카로운 말다툼",
        physical_distance: "최대한 멀리",
        trust_level: "전혀 없음"
      },
      25: { // 21-40% 혼란 시기
        protagonist_mood: "confused", 
        male_lead_mood: "regretful",
        interaction_style: "어색하고 조심스러운",
        physical_distance: "적당한 거리",
        trust_level: "의심스러운 호기심"
      },
      50: { // 41-60% 마음 열기
        protagonist_mood: "warming",
        male_lead_mood: "honest", 
        interaction_style: "진솔한 대화",
        physical_distance: "가까워짐",
        trust_level: "조심스러운 신뢰"
      },
      75: { // 61-80% 사랑 확인
        protagonist_mood: "intimate",
        male_lead_mood: "devoted",
        interaction_style: "친밀하고 따뜻함",
        physical_distance: "자연스러운 접촉",
        trust_level: "깊은 신뢰"
      }
    };
    
    // 어투 일관성 검사 패턴
    this.consistencyPatterns = {
      // 금지된 혼재 패턴
      forbidden_mix: [
        {
          pattern: /님|께서|입니다.*넌|너/g,
          issue: "존댓말과 반말 혼재"
        },
        {
          pattern: /라이아.*레이나|레이나.*라이아/g,
          issue: "캐릭터 이름 불일치"
        },
        {
          pattern: /카이런.*카이|카이.*카이런/g,
          issue: "남주 이름 불일치"
        }
      ],
      
      // 단계별 어투 체크
      tone_progression: {
        early: {
          required: ["넌", "네가", "~야", "~지"],
          forbidden: ["~요", "~입니다", "고마워요"]
        },
        middle: {
          required: ["당신", "~예요", "~네요"],
          forbidden: ["넌", "~야", "사랑해"]
        },
        late: {
          required: ["~요", "~해요", "함께"],
          forbidden: ["적", "배신자", "용서하지 않아"]
        }
      }
    };
  }
  
  /**
   * 로맨스 진행도에 따른 캐릭터 보이스 가이드라인 생성
   */
  generateVoiceGuideline(romanceLevel, chapterNumber) {
    // 로맨스 레벨에 따른 관계 단계 결정
    let relationshipStage;
    if (romanceLevel <= 20) relationshipStage = this.relationshipDynamics[0];
    else if (romanceLevel <= 40) relationshipStage = this.relationshipDynamics[25];
    else if (romanceLevel <= 60) relationshipStage = this.relationshipDynamics[50];
    else relationshipStage = this.relationshipDynamics[75];
    
    const protagonist = this.characterProfiles.protagonist;
    const maleLead = this.characterProfiles.male_lead;
    
    const protaVoice = protagonist.speechPatterns[relationshipStage.protagonist_mood];
    const maleVoice = maleLead.speechPatterns[relationshipStage.male_lead_mood];
    
    return {
      chapterNumber,
      romanceLevel,
      relationshipStage: relationshipStage.protagonist_mood,
      
      characters: {
        protagonist: {
          name: protagonist.name,
          mood: relationshipStage.protagonist_mood,
          voice: protaVoice,
          actions: protagonist.actions[relationshipStage.protagonist_mood],
          characterArc: this.getCharacterArcStage(romanceLevel, "protagonist")
        },
        male_lead: {
          name: maleLead.name,
          mood: relationshipStage.male_lead_mood,
          voice: maleVoice,
          actions: maleLead.actions[relationshipStage.male_lead_mood],
          characterArc: this.getCharacterArcStage(romanceLevel, "male_lead")
        }
      },
      
      interactionGuidelines: {
        style: relationshipStage.interaction_style,
        physicalDistance: relationshipStage.physical_distance,
        trustLevel: relationshipStage.trust_level,
        allowedTones: this.getAllowedTones(romanceLevel),
        forbiddenElements: this.getForbiddenElements(romanceLevel)
      },
      
      consistencyRules: this.getConsistencyRules(romanceLevel)
    };
  }
  
  /**
   * 캐릭터 아크 단계 결정
   */
  getCharacterArcStage(romanceLevel, characterType) {
    const stages = {
      protagonist: ["복수심에 사로잡힌 암살자", "혼란스러운 감정", "마음을 여는 과정", "사랑을 받아들임"],
      male_lead: ["냉정한 수호자", "죄책감에 시달림", "진심을 보여줌", "전적인 헌신"]
    };
    
    let stageIndex;
    if (romanceLevel <= 25) stageIndex = 0;
    else if (romanceLevel <= 50) stageIndex = 1;
    else if (romanceLevel <= 75) stageIndex = 2;
    else stageIndex = 3;
    
    return stages[characterType][stageIndex];
  }
  
  /**
   * 로맨스 레벨에 따른 허용 톤
   */
  getAllowedTones(romanceLevel) {
    if (romanceLevel <= 20) {
      return ["적대적", "방어적", "차가운", "날카로운"];
    } else if (romanceLevel <= 40) {
      return ["혼란스러운", "조심스러운", "어색한", "호기심 있는"];
    } else if (romanceLevel <= 60) {
      return ["따뜻해지는", "진솔한", "부드러운", "이해하는"];
    } else {
      return ["친밀한", "사랑스러운", "헌신적인", "보호적인"];
    }
  }
  
  /**
   * 로맨스 레벨에 따른 금지 요소
   */
  getForbiddenElements(romanceLevel) {
    if (romanceLevel <= 20) {
      return ["애정 표현", "친밀한 호칭", "존댓말", "신뢰 표현"];
    } else if (romanceLevel <= 40) {
      return ["과도한 적대감", "명확한 애정 고백", "완전한 신뢰"];
    } else if (romanceLevel <= 60) {
      return ["적대적 언사", "완전한 거부감", "과도한 친밀감"];
    } else {
      return ["적대감", "불신", "거리감", "냉정함"];
    }
  }
  
  /**
   * 일관성 규칙 생성
   */
  getConsistencyRules(romanceLevel) {
    return {
      nameConsistency: {
        protagonist: "라이아",
        maleLead: "카이런",
        note: "이름은 일관되게 사용, 별명이나 변형 금지"
      },
      
      speechConsistency: {
        level: romanceLevel,
        requiredPatterns: this.getRequiredPatterns(romanceLevel),
        forbiddenPatterns: this.getForbiddenPatterns(romanceLevel)
      },
      
      emotionalConsistency: {
        allowedEmotions: this.getAllowedEmotions(romanceLevel),
        forbiddenEmotions: this.getForbiddenEmotions(romanceLevel)
      }
    };
  }
  
  /**
   * 필수 어투 패턴
   */
  getRequiredPatterns(romanceLevel) {
    if (romanceLevel <= 20) {
      return ["반말", "직설적 표현", "거친 어조"];
    } else if (romanceLevel <= 40) {
      return ["혼재된 어투", "조심스러운 표현"];
    } else if (romanceLevel <= 60) {
      return ["정중한 어투", "부드러운 표현"];
    } else {
      return ["친밀한 어투", "애정 표현"];
    }
  }
  
  /**
   * 금지 어투 패턴
   */
  getForbiddenPatterns(romanceLevel) {
    if (romanceLevel <= 20) {
      return ["존댓말", "애정 표현", "친밀한 호칭"];
    } else if (romanceLevel <= 40) {
      return ["과도한 적대감", "명확한 사랑 고백"];
    } else if (romanceLevel <= 60) {
      return ["적대적 표현", "완전한 거부"];
    } else {
      return ["적대감", "불신 표현", "거리두기"];
    }
  }
  
  /**
   * 허용 감정
   */
  getAllowedEmotions(romanceLevel) {
    const emotions = {
      0: ["분노", "증오", "복수심", "불신"],
      25: ["혼란", "의심", "호기심", "갈등"],
      50: ["관심", "이해", "동정", "따뜻함"],
      75: ["사랑", "신뢰", "헌신", "행복"]
    };
    
    let level = Math.floor(romanceLevel / 25) * 25;
    return emotions[level] || emotions[75];
  }
  
  /**
   * 금지 감정
   */
  getForbiddenEmotions(romanceLevel) {
    if (romanceLevel <= 20) {
      return ["사랑", "신뢰", "행복", "만족"];
    } else if (romanceLevel <= 40) {
      return ["완전한 사랑", "절대적 신뢰"];
    } else if (romanceLevel <= 60) {
      return ["증오", "복수심", "완전한 거부"];
    } else {
      return ["증오", "불신", "적대감", "냉정함"];
    }
  }
  
  /**
   * 텍스트의 캐릭터 보이스 일관성 검사
   */
  checkVoiceConsistency(content, guideline) {
    const issues = [];
    
    // 1. 이름 일관성 체크
    const nameIssues = this.checkNameConsistency(content);
    issues.push(...nameIssues);
    
    // 2. 어투 일관성 체크
    const toneIssues = this.checkToneConsistency(content, guideline);
    issues.push(...toneIssues);
    
    // 3. 감정 일관성 체크
    const emotionIssues = this.checkEmotionalConsistency(content, guideline);
    issues.push(...emotionIssues);
    
    return {
      consistent: issues.length === 0,
      issues: issues,
      score: Math.max(0, 100 - (issues.length * 10)),
      suggestions: this.generateImprovementSuggestions(issues, guideline)
    };
  }
  
  /**
   * 이름 일관성 체크
   */
  checkNameConsistency(content) {
    const issues = [];
    
    // 주인공 이름 체크
    if (content.includes("레이나") && content.includes("라이아")) {
      issues.push({
        type: "name_inconsistency",
        message: "주인공 이름이 '라이아'와 '레이나'로 혼재됨",
        severity: "high"
      });
    }
    
    // 남주 이름 체크
    if (content.includes("카이") && content.includes("카이런")) {
      issues.push({
        type: "name_inconsistency", 
        message: "남주 이름이 '카이런'과 '카이'로 혼재됨",
        severity: "medium"
      });
    }
    
    return issues;
  }
  
  /**
   * 어투 일관성 체크
   */
  checkToneConsistency(content, guideline) {
    const issues = [];
    const romanceLevel = guideline.romanceLevel;
    
    // 존댓말-반말 혼재 체크
    const hasHonorific = /요$|습니다$|세요$|께서/.test(content);
    const hasCasual = /야$|지$|냐$|넌|네가/.test(content);
    
    if (romanceLevel <= 20 && hasHonorific) {
      issues.push({
        type: "tone_inconsistency",
        message: `초기 단계(${romanceLevel}%)에서 존댓말 사용됨`,
        severity: "high"
      });
    }
    
    if (romanceLevel >= 60 && hasCasual) {
      issues.push({
        type: "tone_inconsistency",
        message: `후기 단계(${romanceLevel}%)에서 반말 사용됨`,
        severity: "medium"
      });
    }
    
    return issues;
  }
  
  /**
   * 감정 일관성 체크
   */
  checkEmotionalConsistency(content, guideline) {
    const issues = [];
    const forbiddenEmotions = guideline.interactionGuidelines.forbiddenElements;
    
    forbiddenEmotions.forEach(emotion => {
      const keywords = this.getEmotionKeywords(emotion);
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          issues.push({
            type: "emotion_inconsistency",
            message: `현재 단계에서 부적절한 감정 표현: "${keyword}"`,
            severity: "medium"
          });
        }
      });
    });
    
    return issues;
  }
  
  /**
   * 감정별 키워드 매핑
   */
  getEmotionKeywords(emotion) {
    const keywords = {
      "애정 표현": ["사랑해", "좋아해", "소중해"],
      "친밀한 호칭": ["자기", "여보", "내 사랑"],
      "적대감": ["증오", "죽이고 싶어", "배신자"],
      "불신": ["믿을 수 없어", "거짓말", "속이고"]
    };
    
    return keywords[emotion] || [];
  }
  
  /**
   * 개선 제안 생성
   */
  generateImprovementSuggestions(issues, guideline) {
    const suggestions = [];
    
    issues.forEach(issue => {
      switch (issue.type) {
        case "name_inconsistency":
          suggestions.push("캐릭터 이름을 일관되게 사용하세요 (라이아, 카이런)");
          break;
        case "tone_inconsistency":
          suggestions.push(`로맨스 레벨 ${guideline.romanceLevel}%에 맞는 어투를 사용하세요`);
          break;
        case "emotion_inconsistency":
          suggestions.push(`현재 관계 단계(${guideline.relationshipStage})에 적절한 감정 표현을 사용하세요`);
          break;
      }
    });
    
    return [...new Set(suggestions)]; // 중복 제거
  }
}