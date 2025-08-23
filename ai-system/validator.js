/**
 * 품질 검증 엔진 - 캐릭터 일관성 및 기본 품질 검증
 */

export class Validator {
  constructor(config) {
    this.config = config;
    this.minWordCount = config.chapterLength.min;
    this.maxWordCount = config.chapterLength.max;
  }

  // 메인 검증 함수
  async validate(result) {
    console.log('🔍 품질 검증 시작...');
    
    const checks = [
      this.validateBasicStructure(result),
      this.validateChapterLength(result),
      this.validateCharacterConsistency(result),
      this.validateContent(result)
    ];

    const results = await Promise.all(checks);
    const allPassed = results.every(r => r.passed);
    
    if (allPassed) {
      console.log('✅ 모든 검증 통과');
    } else {
      console.log('❌ 검증 실패:', results.filter(r => !r.passed).map(r => r.error));
    }

    return allPassed;
  }

  // 기본 구조 검증
  validateBasicStructure(result) {
    const required = ['type', 'slug', 'title', 'chapter'];
    const missing = required.filter(field => !result[field]);
    
    if (missing.length > 0) {
      return { passed: false, error: `필수 필드 누락: ${missing.join(', ')}` };
    }

    if (!result.chapter.title || !result.chapter.content) {
      return { passed: false, error: '챕터 제목 또는 내용 누락' };
    }

    // 슬러그 형식 검증 (영문, 숫자, 하이픈만)
    if (!/^[a-z0-9-]+$/.test(result.slug)) {
      return { passed: false, error: '슬러그 형식 오류 (영문소문자, 숫자, 하이픈만 허용)' };
    }

    return { passed: true };
  }

  // 챕터 길이 검증
  validateChapterLength(result) {
    const wordCount = result.chapter.content.length;
    
    if (wordCount < this.minWordCount) {
      return { 
        passed: false, 
        error: `챕터가 너무 짧음 (${wordCount}자, 최소 ${this.minWordCount}자 필요)` 
      };
    }

    if (wordCount > this.maxWordCount) {
      return { 
        passed: false, 
        error: `챕터가 너무 길음 (${wordCount}자, 최대 ${this.maxWordCount}자 초과)` 
      };
    }

    console.log(`📏 적정 길이: ${wordCount}자`);
    return { passed: true };
  }

  // 캐릭터 일관성 검증 (가장 중요!)
  validateCharacterConsistency(result) {
    if (!result.characters || Object.keys(result.characters).length === 0) {
      return { passed: false, error: '캐릭터 정보 누락' };
    }

    const characterNames = Object.keys(result.characters);
    const content = result.chapter.content;
    
    // 정의된 캐릭터명이 본문에 등장하는지 확인
    const foundCharacters = characterNames.filter(name => content.includes(name));
    
    if (foundCharacters.length === 0) {
      return { 
        passed: false, 
        error: `정의된 캐릭터(${characterNames.join(', ')})가 본문에 등장하지 않음` 
      };
    }

    // 본문에서 의심스러운 캐릭터명 패턴 검색 (한글 이름 패턴)
    const namePattern = /[가-힣]{2,4}(?:[이가은는을를]|\s|$|[.,!?])/g;
    const foundNames = [...content.matchAll(namePattern)]
      .map(match => match[0].replace(/[이가은는을를\s.,!?].*$/, ''))
      .filter(name => name.length >= 2);

    const uniqueFoundNames = [...new Set(foundNames)];
    const undefinedNames = uniqueFoundNames.filter(name => !characterNames.includes(name));

    if (undefinedNames.length > 0) {
      // 일반적인 명사는 제외 (간단한 화이트리스트)
      const commonWords = ['그녀', '그가', '사람', '여자', '남자', '아이', '친구', '선생', '의사', '간호사'];
      const realUndefinedNames = undefinedNames.filter(name => 
        !commonWords.includes(name) && name.length >= 2
      );

      if (realUndefinedNames.length > 0) {
        return { 
          passed: false, 
          error: `정의되지 않은 캐릭터명 의심: ${realUndefinedNames.join(', ')}` 
        };
      }
    }

    console.log(`👥 캐릭터 일관성 확인: ${foundCharacters.join(', ')}`);
    return { passed: true };
  }

  // 컨텐츠 품질 검증
  validateContent(result) {
    const content = result.chapter.content;
    
    // 기본적인 품질 체크
    if (content.length < 100) {
      return { passed: false, error: '내용이 너무 짧음' };
    }

    // 중복 문장 체크 (간단한 버전)
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
    const uniqueSentences = new Set(sentences.map(s => s.trim()));
    const duplicateRatio = (sentences.length - uniqueSentences.size) / sentences.length;

    if (duplicateRatio > 0.3) {
      return { passed: false, error: '중복 문장 비율이 높음 (30% 초과)' };
    }

    // 기본적인 문법/형식 체크
    if (!content.includes('"') && !content.includes('"') && !content.includes('"')) {
      if (content.split('\n').length < 5) {
        return { passed: false, error: '대화나 문단 구분이 부족함' };
      }
    }

    // 의미없는 반복 패턴 체크
    const words = content.split(/\s+/);
    const wordCounts = {};
    words.forEach(word => {
      if (word.length > 1) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    const repeatedWords = Object.entries(wordCounts)
      .filter(([word, count]) => count > Math.floor(words.length * 0.05)) // 5% 이상 반복
      .filter(([word]) => !['그녀', '그가', '것을', '때문', '있었', '했다'].includes(word));

    if (repeatedWords.length > 0) {
      console.log(`⚠️  반복되는 단어 주의: ${repeatedWords.map(([w, c]) => `${w}(${c})`).join(', ')}`);
    }

    console.log('📝 컨텐츠 품질 검증 완료');
    return { passed: true };
  }

  // 추가: 완결 검증 (완결편 특별 검증)
  validateCompletion(result) {
    if (result.type !== 'completion') return { passed: true };

    const content = result.chapter.content;
    const completionKeywords = ['완결', '끝', '마지막', '종료', '사랑해', '결혼', '행복'];
    const hasCompletionElement = completionKeywords.some(keyword => content.includes(keyword));

    if (!hasCompletionElement) {
      return { passed: false, error: '완결다운 요소가 부족함' };
    }

    return { passed: true };
  }
}