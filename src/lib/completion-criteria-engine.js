export class CompletionCriteriaEngine {
  constructor() {
    this.minimumChapters = 50;
    this.maximumChapters = 100;
    this.idealChapters = 75;
    
    this.storyArcStages = {
      exposition: { weight: 10, keywords: ["시작", "소개", "설정"] },
      risingAction: { weight: 30, keywords: ["발전", "갈등", "상승"] },
      climax: { weight: 20, keywords: ["절정", "클라이맥스", "최고조"] },
      fallingAction: { weight: 25, keywords: ["해결", "정리", "수습"] },
      resolution: { weight: 15, keywords: ["결말", "마무리", "완결"] }
    };

    this.relationshipStages = {
      hostility: { progress: 0, description: "적대적 관계" },
      tension: { progress: 25, description: "긴장과 갈등" },
      attraction: { progress: 50, description: "서로에 대한 끌림" },
      confession: { progress: 75, description: "고백과 감정 확인" },
      union: { progress: 100, description: "결합과 완성" }
    };

    this.endingTypes = {
      'enemies-to-lovers': {
        scenes: ["최종 대결", "진실 폭로", "감정 고백", "화해", "결합"],
        epilogue: "몇 년 후 행복한 일상"
      },
      'fake-relationship': {
        scenes: ["가짜 관계 종료", "진심 깨달음", "재회", "진정한 고백", "결합"],
        epilogue: "진짜 관계로 발전한 모습"
      },
      'second-chance': {
        scenes: ["과거 청산", "용서", "새로운 시작", "약속", "미래 계획"],
        epilogue: "더 성숙해진 관계"
      },
      'forbidden-love': {
        scenes: ["장애물 극복", "사회적 인정", "선택의 순간", "희생", "승리"],
        epilogue: "자유로워진 사랑"
      }
    };
  }

  checkStoryCompletion(novel) {
    const criteria = {
      minChaptersMet: novel.currentChapter >= this.minimumChapters,
      mainConflictResolved: this.checkMainConflictResolution(novel),
      relationshipFinalized: this.checkRelationshipCompletion(novel),
      subplotsWrapped: this.checkSubplotCompletion(novel),
      characterArcsComplete: this.checkCharacterGrowthCompletion(novel)
    };

    // 5개 기준 중 4개 이상 충족시 완결 가능
    const metCriteria = Object.values(criteria).filter(Boolean).length;
    return metCriteria >= 4;
  }

  checkMainConflictResolution(novel) {
    const resolutionKeywords = ["결말", "해결", "완료", "극복", "승리"];
    return novel.plotProgress.some(stage => 
      resolutionKeywords.some(keyword => stage.includes(keyword))
    );
  }

  checkRelationshipCompletion(novel) {
    const completionStages = ["confession", "union"];
    return completionStages.includes(novel.relationshipStage);
  }

  checkSubplotCompletion(novel) {
    return novel.openThreads.length <= 1; // 1개 이하의 미해결 서브플롯 허용
  }

  checkCharacterGrowthCompletion(novel) {
    const mainCharacters = novel.characters.filter(char => 
      char.name.includes("주인공") || char.name.includes("남주")
    );
    return mainCharacters.every(char => char.growthArc >= 85);
  }

  analyzeStoryArc(novel) {
    const totalProgress = novel.plotProgress.length;
    const currentStage = novel.plotProgress[totalProgress - 1] || "시작";
    
    let arcCompletion = 0;
    for (const [stageName, data] of Object.entries(this.storyArcStages)) {
      if (data.keywords.some(keyword => currentStage.includes(keyword))) {
        arcCompletion = data.weight;
        // 스테이지 정보를 로깅에 활용
        console.log(`📊 현재 스토리 단계: ${stageName} (진행도: ${data.weight}%)`);
        break;
      }
    }

    return {
      currentStage,
      completionPercentage: Math.min(arcCompletion + (totalProgress * 15), 100),
      nextStage: this.getNextStoryStage(currentStage),
      readyForEnding: currentStage.includes("결말") || arcCompletion >= 80
    };
  }

  getNextStoryStage(currentStage) {
    if (currentStage.includes("시작")) return "갈등 발전 단계";
    if (currentStage.includes("발전")) return "클라이맥스 준비";
    if (currentStage.includes("절정")) return "갈등 해결 시작";
    if (currentStage.includes("해결")) return "결말 단계";
    return "마무리 및 완결";
  }

  analyzeRelationshipProgress(novel) {
    const currentStage = novel.relationshipStage;
    const stageData = this.relationshipStages[currentStage];
    
    return {
      currentStage: stageData?.description || "미정의 단계",
      progress: stageData?.progress || 0,
      readyForConclusion: stageData?.progress >= 75,
      nextMilestone: this.getNextRelationshipMilestone(currentStage)
    };
  }

  getNextRelationshipMilestone(currentStage) {
    const stages = Object.keys(this.relationshipStages);
    const currentIndex = stages.indexOf(currentStage);
    const nextStage = stages[currentIndex + 1];
    
    return nextStage ? this.relationshipStages[nextStage].description : "관계 완성";
  }

  checkSubplotResolution(novel) {
    return {
      openThreads: novel.openThreads.length,
      resolutionNeeded: novel.openThreads,
      readyForEnding: novel.openThreads.length <= 1,
      priority: novel.openThreads.length > 2 ? "high" : "low"
    };
  }

  evaluateCharacterGrowth(novel) {
    const growthAnalysis = novel.characters.map(char => ({
      name: char.name,
      growth: char.growthArc,
      completed: char.growthArc >= 85,
      needsWork: char.growthArc < 70
    }));

    const completedCount = growthAnalysis.filter(char => char.completed).length;
    const totalCharacters = growthAnalysis.length;

    return {
      characters: growthAnalysis,
      overallCompletion: Math.round((completedCount / totalCharacters) * 100),
      readyForEnding: completedCount >= Math.ceil(totalCharacters * 0.8)
    };
  }

  prepareEnding(chapterNumber) {
    if (chapterNumber < this.minimumChapters - 10) {
      return {
        phase: "development",
        pacing: "normal",
        focus: "character_growth",
        chaptersRemaining: this.minimumChapters - chapterNumber
      };
    }

    if (chapterNumber >= this.minimumChapters - 10 && chapterNumber < this.minimumChapters) {
      return {
        phase: "pre_ending",
        pacing: "accelerated",
        focus: "conflict_resolution",
        threads: "convergence",
        tension: "building_to_climax",
        hints: "ending_foreshadowing",
        chaptersRemaining: Math.max(0, this.minimumChapters - chapterNumber)
      };
    }

    return {
      phase: "ending_ready",
      pacing: "climactic",
      focus: "resolution",
      threads: "final_convergence",
      tension: "peak",
      hints: "immediate_resolution",
      recommendation: "begin_ending_sequence"
    };
  }

  generateEndingScenario(novel) {
    // 주요 트로프에 따른 결말 시나리오 선택
    const relationshipType = this.detectRelationshipType(novel);
    const endingTemplate = this.endingTypes[relationshipType] || this.endingTypes['enemies-to-lovers'];

    return {
      type: relationshipType,
      scenes: endingTemplate.scenes,
      epilogueContent: endingTemplate.epilogue,
      estimatedChapters: endingTemplate.scenes.length + 1, // +1 for epilogue
      tone: "satisfying_conclusion",
      themes: this.extractEndingThemes(novel)
    };
  }

  detectRelationshipType(novel) {
    // 간단한 패턴 매칭으로 관계 타입 감지
    if (novel.relationshipStage === "hostility") return "enemies-to-lovers";
    if (novel.openThreads.some(thread => thread.includes("가짜"))) return "fake-relationship";
    if (novel.openThreads.some(thread => thread.includes("과거"))) return "second-chance";
    if (novel.openThreads.some(thread => thread.includes("금지"))) return "forbidden-love";
    
    return "enemies-to-lovers"; // 기본값
  }

  extractEndingThemes(novel) {
    const themes = [];
    
    if (novel.characters.some(char => char.growthArc > 90)) {
      themes.push("개인적 성장");
    }
    
    if (novel.relationshipStage === "union") {
      themes.push("사랑의 승리");
    }
    
    if (novel.openThreads.length <= 1) {
      themes.push("갈등 해결");
    }
    
    themes.push("희망적 미래", "새로운 시작");
    
    return themes;
  }

  shouldIncludeEpilogue(novel) {
    // 에필로그 필요성 판단
    const factors = {
      characterGrowthSignificant: novel.characters.some(char => char.growthArc > 95),
      relationshipFullyDeveloped: novel.relationshipStage === "union",
      complexPlotResolved: novel.openThreads.length === 0,
      readerSatisfactionNeeded: novel.currentChapter >= this.idealChapters
    };

    const positiveFactors = Object.values(factors).filter(Boolean).length;
    return positiveFactors >= 3;
  }

  generateCompletionReport(novel) {
    const storyArc = this.analyzeStoryArc(novel);
    const relationship = this.analyzeRelationshipProgress(novel);
    const subplots = this.checkSubplotResolution(novel);
    const characters = this.evaluateCharacterGrowth(novel);
    const readyForEnding = this.checkStoryCompletion(novel);

    return {
      overallReadiness: readyForEnding,
      storyArc,
      relationship,
      subplots,
      characters,
      recommendation: readyForEnding ? "Begin ending sequence" : "Continue development",
      estimatedChaptersToCompletion: readyForEnding ? 5 : Math.max(10, this.minimumChapters - novel.currentChapter)
    };
  }
}