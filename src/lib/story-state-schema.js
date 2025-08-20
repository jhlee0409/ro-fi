/**
 * 📋 Story State JSON 스키마 정의
 * 
 * 목적: 런타임 유효성 검증 및 타입 안정성 보장
 */

/**
 * JSON Schema for Story State validation
 */
export const STORY_STATE_SCHEMA = {
  type: "object",
  required: ["novelSlug", "metadata", "worldState", "characters", "plot", "chapters"],
  properties: {
    novelSlug: {
      type: "string",
      pattern: "^[a-z0-9-]+$",
      minLength: 3,
      maxLength: 50
    },
    metadata: {
      type: "object",
      required: ["title", "author", "genre", "status"],
      properties: {
        title: { type: "string", minLength: 1 },
        author: { type: "string", minLength: 1 },
        genre: { type: "string", enum: ["로맨스 판타지", "판타지", "로맨스"] },
        status: { type: "string", enum: ["연재 중", "완결", "휴재"] },
        createdAt: { type: "string", format: "date-time" },
        totalChapters: { type: "integer", minimum: 0 },
        completionTarget: { type: "integer", minimum: 1 },
        currentArc: { 
          type: "string", 
          enum: ["introduction", "development", "climax", "resolution"] 
        },
        plotProgress: { type: "integer", minimum: 0, maximum: 100 }
      }
    },
    worldState: {
      type: "object",
      properties: {
        setting: { type: "string" },
        timeframe: { type: "string" },
        magicSystem: { type: "string" },
        politicalStructure: { type: "string" },
        importantLocations: {
          type: "array",
          items: { type: "string" }
        }
      }
    },
    characters: {
      type: "object",
      properties: {
        protagonist: { $ref: "#/definitions/character" },
        mainLead: { $ref: "#/definitions/character" },
        supportingCharacters: {
          type: "array",
          items: { $ref: "#/definitions/character" }
        },
        antagonists: {
          type: "array",
          items: { $ref: "#/definitions/character" }
        }
      }
    },
    plot: {
      type: "object",
      properties: {
        mainConflict: { type: "string" },
        subplots: {
          type: "array",
          items: { type: "string" }
        },
        resolvedPlots: {
          type: "array",
          items: { type: "string" }
        },
        foreshadowing: {
          type: "array",
          items: { type: "string" }
        },
        unresolvedMysteries: {
          type: "array",
          items: { type: "string" }
        },
        romanceProgression: { type: "integer", minimum: 0, maximum: 100 },
        tensionLevel: { type: "integer", minimum: 1, maximum: 10 }
      }
    },
    chapters: {
      type: "array",
      items: { $ref: "#/definitions/chapter" }
    },
    continuityNotes: {
      type: "array",
      items: { type: "string" }
    },
    qualityMetrics: {
      type: "object",
      properties: {
        averageWordCount: { type: "integer", minimum: 0 },
        averageRating: { type: "number", minimum: 0, maximum: 10 },
        consistencyScore: { type: "integer", minimum: 0, maximum: 100 },
        engagementScore: { type: "integer", minimum: 0, maximum: 100 }
      }
    },
    lastUpdated: { type: "string", format: "date-time" }
  },
  definitions: {
    character: {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer", minimum: 0, maximum: 1000 },
        appearance: { type: "string" },
        personality: {
          type: "array",
          items: { type: "string" }
        },
        abilities: {
          type: "array",
          items: { type: "string" }
        },
        goals: {
          type: "array",
          items: { type: "string" }
        },
        currentEmotionalState: { type: "string" },
        relationshipStatus: { type: "string" }
      }
    },
    chapter: {
      type: "object",
      required: ["chapterNumber", "title"],
      properties: {
        chapterNumber: { type: "integer", minimum: 1 },
        title: { type: "string", minLength: 1 },
        summary: { type: "string" },
        keyEvents: {
          type: "array",
          items: { type: "string" }
        },
        characterDevelopments: {
          type: "array",
          items: { type: "string" }
        },
        emotionalTone: { type: "string" },
        wordCount: { type: "integer", minimum: 0 },
        createdAt: { type: "string", format: "date-time" }
      }
    }
  }
};

/**
 * 간단한 JSON Schema 검증기
 */
export class StoryStateValidator {
  /**
   * Story State 검증
   */
  static validate(storyState) {
    const errors = [];
    const warnings = [];

    try {
      // 기본 구조 검증
      this._validateBasicStructure(storyState, errors);
      
      // 메타데이터 검증
      this._validateMetadata(storyState.metadata, errors, warnings);
      
      // 캐릭터 검증
      this._validateCharacters(storyState.characters, errors, warnings);
      
      // 플롯 검증
      this._validatePlot(storyState.plot, errors, warnings);
      
      // 챕터 검증
      this._validateChapters(storyState.chapters, errors, warnings);

    } catch (error) {
      errors.push(`검증 중 오류 발생: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: this._calculateScore(errors, warnings)
    };
  }

  /**
   * 기본 구조 검증
   */
  static _validateBasicStructure(storyState, errors) {
    const required = ['novelSlug', 'metadata', 'worldState', 'characters', 'plot', 'chapters'];
    
    for (const field of required) {
      if (!storyState[field]) {
        errors.push(`필수 필드 누락: ${field}`);
      }
    }

    // novelSlug 형식 검증
    if (storyState.novelSlug && !/^[a-z0-9-]+$/.test(storyState.novelSlug)) {
      errors.push('novelSlug는 소문자, 숫자, 하이픈만 사용 가능');
    }
  }

  /**
   * 메타데이터 검증
   */
  static _validateMetadata(metadata, errors, warnings) {
    if (!metadata) return;

    // 필수 필드
    const required = ['title', 'author', 'genre', 'status'];
    for (const field of required) {
      if (!metadata[field]) {
        errors.push(`metadata.${field} 필수`);
      }
    }

    // 열거형 검증
    const validGenres = ['로맨스 판타지', '판타지', '로맨스'];
    if (metadata.genre && !validGenres.includes(metadata.genre)) {
      errors.push(`잘못된 장르: ${metadata.genre}`);
    }

    const validStatuses = ['연재 중', '완결', '휴재'];
    if (metadata.status && !validStatuses.includes(metadata.status)) {
      errors.push(`잘못된 상태: ${metadata.status}`);
    }

    // 범위 검증
    if (metadata.plotProgress !== undefined) {
      if (metadata.plotProgress < 0 || metadata.plotProgress > 100) {
        errors.push('plotProgress는 0-100 사이여야 함');
      }
    }
  }

  /**
   * 캐릭터 검증
   */
  static _validateCharacters(characters, errors, warnings) {
    if (!characters) return;

    // 주인공 이름 확인
    if (characters.protagonist && !characters.protagonist.name) {
      warnings.push('주인공 이름이 비어있음');
    }

    // 남주 이름 확인
    if (characters.mainLead && !characters.mainLead.name) {
      warnings.push('남주 이름이 비어있음');
    }
  }

  /**
   * 플롯 검증
   */
  static _validatePlot(plot, errors, warnings) {
    if (!plot) return;

    // 로맨스 진행도 검증
    if (plot.romanceProgression !== undefined) {
      if (plot.romanceProgression < 0 || plot.romanceProgression > 100) {
        errors.push('romanceProgression은 0-100 사이여야 함');
      }
    }

    // 긴장 레벨 검증
    if (plot.tensionLevel !== undefined) {
      if (plot.tensionLevel < 1 || plot.tensionLevel > 10) {
        errors.push('tensionLevel은 1-10 사이여야 함');
      }
    }

    // 메인 갈등 확인
    if (!plot.mainConflict) {
      warnings.push('메인 갈등이 정의되지 않음');
    }
  }

  /**
   * 챕터 검증
   */
  static _validateChapters(chapters, errors, warnings) {
    if (!Array.isArray(chapters)) {
      errors.push('chapters는 배열이어야 함');
      return;
    }

    // 챕터 번호 중복 검사
    const chapterNumbers = chapters.map(ch => ch.chapterNumber).filter(Boolean);
    const duplicates = chapterNumbers.filter((num, index) => chapterNumbers.indexOf(num) !== index);
    
    if (duplicates.length > 0) {
      errors.push(`중복된 챕터 번호: ${duplicates.join(', ')}`);
    }

    // 각 챕터 검증
    chapters.forEach((chapter, index) => {
      if (!chapter.title) {
        warnings.push(`챕터 ${index + 1}: 제목 누락`);
      }
      if (!chapter.chapterNumber) {
        errors.push(`챕터 ${index + 1}: 챕터 번호 누락`);
      }
    });
  }

  /**
   * 점수 계산
   */
  static _calculateScore(errors, warnings) {
    const maxScore = 100;
    const errorPenalty = 20;
    const warningPenalty = 5;
    
    return Math.max(0, maxScore - (errors.length * errorPenalty) - (warnings.length * warningPenalty));
  }
}

/**
 * 편의 함수
 */
export function validateStoryState(storyState) {
  return StoryStateValidator.validate(storyState);
}