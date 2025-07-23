/**
 * 마크다운 포맷 검증 유틸리티
 * NOVEL_MARKDOWN_FORMAT.md 가이드라인 기반
 */

export class MarkdownValidator {
  /**
   * 전체 컨텐츠의 마크다운 형식을 검증
   * @param {string} content - 검증할 마크다운 컨텐츠
   * @returns {Object} 검증 결과와 오류 목록
   */
  static validateContent(content) {
    const errors = [];
    const warnings = [];
    
    // 1. Frontmatter 검증
    const frontmatterResult = this.validateFrontmatter(content);
    if (!frontmatterResult.isValid) {
      errors.push(...frontmatterResult.errors);
    }
    
    // 2. 라인별 형식 검증
    const lines = content.split('\n');
    let inFrontmatter = false;
    let frontmatterCount = 0;
    
    lines.forEach((line, index) => {
      if (line.trim() === '---') {
        frontmatterCount++;
        inFrontmatter = frontmatterCount === 1;
        return;
      }
      
      // Frontmatter 내부는 건너뛰기
      if (inFrontmatter || frontmatterCount < 2) return;
      
      // 특수 형식 라인 검증
      if (line.trim().startsWith('> ')) {
        const lineResult = this.validateSpecialLine(line, index + 1);
        if (!lineResult.isValid) {
          errors.push(...lineResult.errors);
        }
        warnings.push(...lineResult.warnings);
      }
      
      // 서술 부분의 볼드 형식 검증
      if (!line.trim().startsWith('> ') && line.trim()) {
        const boldResult = this.validateBoldFormatting(line, index + 1);
        if (!boldResult.isValid) {
          errors.push(...boldResult.errors);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats: this.generateStats(content)
    };
  }
  
  /**
   * Frontmatter 검증
   */
  static validateFrontmatter(content) {
    const errors = [];
    
    if (!content.startsWith('---\n')) {
      errors.push('Frontmatter must start with "---" at the beginning');
    }
    
    const frontmatterMatch = content.match(/^---\n(.*?)\n---/s);
    if (!frontmatterMatch) {
      errors.push('Frontmatter must be properly closed with "---"');
      return { isValid: false, errors };
    }
    
    const frontmatterContent = frontmatterMatch[1];
    const requiredFields = ['title', 'novel', 'chapterNumber'];
    
    requiredFields.forEach(field => {
      if (!frontmatterContent.includes(`${field}:`)) {
        errors.push(`Required field "${field}" missing from frontmatter`);
      }  
    });
    
    return { isValid: errors.length === 0, errors };
  }
  
  /**
   * 특수 라인 (대화, 독백, 액션) 검증
   */
  static validateSpecialLine(line, lineNumber) {
    const errors = [];
    const warnings = [];
    const trimmed = line.trim();
    
    // 대화 형식 체크: > "content"
    const isDialogue = /^> "[^"]+"$/.test(trimmed);
    // 독백 형식 체크: > *'content'*
    const isMonologue = /^> \*'[^']+'\*$/.test(trimmed);
    // 액션 형식 체크: > [content]
    const isAction = /^> \[[^\]]+\]$/.test(trimmed);
    
    if (!isDialogue && !isMonologue && !isAction) {
      errors.push(`Line ${lineNumber}: Invalid special format - "${trimmed}"`);
      
      // 구체적인 오류 가이드 제공
      if (trimmed.includes('"') && !isDialogue) {
        errors.push(`Line ${lineNumber}: Dialogue should use format: > "content"`);
      } else if (trimmed.includes("'") && !isMonologue) {
        errors.push(`Line ${lineNumber}: Monologue should use format: > *'content'*`);
      } else if (trimmed.includes('[') && !isAction) {
        errors.push(`Line ${lineNumber}: Action should use format: > [content]`);
      }
    }
    
    // 일반적인 실수 패턴 체크
    if (trimmed.match(/^> '[^*]/)) {
      errors.push(`Line ${lineNumber}: Monologue missing asterisks: > *'content'*`);
    }
    
    if (trimmed.match(/^> \*"[^']/)) {
      errors.push(`Line ${lineNumber}: Wrong quote type in monologue: use single quotes`);
    }
    
    if (trimmed.match(/^> \([^)]*\)/)) {
      errors.push(`Line ${lineNumber}: Use square brackets for actions: > [content]`);
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }
  
  /**
   * 볼드 형식 검증
   */
  static validateBoldFormatting(line, lineNumber) {
    const errors = [];
    
    // **text** 패턴 찾기
    const boldMatches = line.match(/\*\*([^*]+)\*\*/g);
    
    if (boldMatches) {
      boldMatches.forEach(match => {
        // 올바른 볼드 형식 확인
        if (!match.match(/^\*\*[^*]+\*\*$/)) {
          errors.push(`Line ${lineNumber}: Invalid bold format - "${match}"`);
        }
        
        // 삼중 별표나 기타 잘못된 패턴 체크
        if (match.includes('***')) {
          errors.push(`Line ${lineNumber}: Avoid triple asterisks - "${match}"`);
        }
      });
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  /**
   * 컨텐츠 통계 생성
   */
  static generateStats(content) {
    const lines = content.split('\n');
    let dialogueCount = 0;
    let monologueCount = 0;
    let actionCount = 0;
    let narrativeLines = 0;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('> ')) {
        if (/^> "[^"]+"$/.test(trimmed)) dialogueCount++;
        else if (/^> \*'[^']+'\*$/.test(trimmed)) monologueCount++;
        else if (/^> \[[^\]]+\]$/.test(trimmed)) actionCount++;
      } else if (trimmed && !trimmed.startsWith('---') && !trimmed.includes(':')) {
        narrativeLines++;
      }
    });
    
    return {
      totalLines: lines.length,
      dialogueCount,
      monologueCount,
      actionCount,
      narrativeLines,
      specialFormatRatio: (dialogueCount + monologueCount + actionCount) / lines.length
    };
  }
  
  /**
   * 빠른 검증 (기본적인 패턴만 체크)
   */
  static quickValidate(content) {
    const hasValidFrontmatter = content.match(/^---\n.*\n---/s);
    const invalidPatterns = [
      /> '[^*]/, // 잘못된 독백
      /> \*"[^']/, // 잘못된 독백 따옴표
      /> \([^)]/, // 소괄호 사용
    ];
    
    const hasInvalidPatterns = invalidPatterns.some(pattern => pattern.test(content));
    
    return {
      isValid: hasValidFrontmatter && !hasInvalidPatterns,
      hasValidFrontmatter: !!hasValidFrontmatter,
      hasInvalidPatterns
    };
  }
}

/**
 * 컨텐츠 내의 특정 형식 요소들을 추출
 */
export class MarkdownExtractor {
  /**
   * 대화 추출
   */
  static extractDialogue(content) {
    return content.match(/> "([^"]+)"/g) || [];
  }
  
  /**
   * 독백 추출
   */
  static extractMonologue(content) {
    return content.match(/> \*'([^']+)'\*/g) || [];
  }
  
  /**
   * 액션 추출
   */
  static extractActions(content) {
    return content.match(/> \[([^\]]+)\]/g) || [];
  }
  
  /**
   * 볼드 텍스트 추출
   */
  static extractBoldText(content) {
    return content.match(/\*\*([^*]+)\*\*/g) || [];
  }
  
  /**
   * Frontmatter 데이터 추출
   */
  static extractFrontmatter(content) {
    const match = content.match(/^---\n(.*?)\n---/s);
    if (!match) return null;
    
    const frontmatterText = match[1];
    const data = {};
    
    frontmatterText.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        data[key.trim()] = value.replace(/^["']|["']$/g, ''); // 따옴표 제거
      }
    });
    
    return data;
  }
}