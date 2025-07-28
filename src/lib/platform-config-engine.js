/**
 * 플랫폼별 설정 관리 엔진
 * 웹소설 플랫폼 표준에 맞는 분량과 스타일 설정을 제공
 */

export class PlatformConfigEngine {
  constructor() {
    // 플랫폼별 설정 데이터베이스
    this.configs = {
      // 기본 모드 (기존 시스템 호환)
      default: {
        name: '기본 모드 (모바일 최적화)',
        description: '현재 시스템 - 모바일 독자용, 빠른 소비',

        wordCount: {
          min: 1500, // 최소 1,500자 (공백 제외)
          max: 2000, // 최대 2,000자 (공백 제외)
          target: 1750, // 목표 1,750자 (공백 제외)
        },

        structure: {
          scenes: 4, // 4-5개 장면
          sceneLength: 375, // 장면당 평균 길이
          paragraphs: 8, // 평균 문단 수
        },

        style: {
          pacing: 'fast', // 빠른 전개
          focus: 'mobile-friendly', // 모바일 친화적
          engagement: 'high', // 높은 몰입도
          complexity: 'medium', // 중간 복잡도
        },

        quality: {
          threshold: 85, // 품질 점수 기준
          characterThreshold: 90, // 캐릭터 일관성 기준
          dialogueRatio: 0.25, // 대화 비율 25%
        },
      },

      // 네이버 시리즈/카카오페이지 최적화
      naver: {
        name: '네이버 시리즈/카카오페이지',
        description: '20-40대 여성 독자, 감정적 몰입도 중시',

        wordCount: {
          min: 2400, // 최소 2,400자 (공백 제외)
          max: 3200, // 최대 3,200자 (공백 제외)
          target: 2800, // 목표 2,800자 (공백 제외)
        },

        structure: {
          scenes: 5, // 5-6개 장면
          sceneLength: 560, // 장면당 평균 길이
          paragraphs: 12, // 평균 문단 수
        },

        style: {
          pacing: 'moderate', // 적당한 전개
          focus: 'engaging', // 감정적 몰입
          engagement: 'very_high', // 매우 높은 몰입도
          complexity: 'medium', // 중간 복잡도
        },

        quality: {
          threshold: 80, // 품질 점수 기준 (몰입도 우선)
          characterThreshold: 85, // 캐릭터 일관성 기준
          dialogueRatio: 0.3, // 대화 비율 30% (감정 중시)
          emotionFocus: true, // 감정 표현 강화
        },
      },

      // 문피아/조아라 최적화
      munpia: {
        name: '문피아/조아라',
        description: '소설 애호가, 상세한 묘사와 깊이 선호',

        wordCount: {
          min: 3200, // 최소 3,200자 (공백 제외)
          max: 4000, // 최대 4,000자 (공백 제외)
          target: 3600, // 목표 3,600자 (공백 제외)
        },

        structure: {
          scenes: 6, // 6-7개 장면
          sceneLength: 600, // 장면당 평균 길이
          paragraphs: 15, // 평균 문단 수
        },

        style: {
          pacing: 'deep', // 깊이 있는 전개
          focus: 'detailed', // 상세한 묘사
          engagement: 'immersive', // 몰입형
          complexity: 'high', // 높은 복잡도
        },

        quality: {
          threshold: 90, // 높은 품질 점수 기준
          characterThreshold: 95, // 매우 높은 캐릭터 일관성
          dialogueRatio: 0.35, // 대화 비율 35%
          detailFocus: true, // 상세 묘사 강화
          worldBuilding: true, // 세계관 구축 중시
        },
      },

      // 리디북스 최적화
      ridibooks: {
        name: '리디북스',
        description: '프리미엄 독자, 편집 품질과 완성도 중시',

        wordCount: {
          min: 2800, // 최소 2,800자 (공백 제외)
          max: 3600, // 최대 3,600자 (공백 제외)
          target: 3200, // 목표 3,200자 (공백 제외)
        },

        structure: {
          scenes: 5, // 5-6개 장면
          sceneLength: 640, // 장면당 평균 길이
          paragraphs: 13, // 평균 문단 수
        },

        style: {
          pacing: 'balanced', // 균형잡힌 전개
          focus: 'premium', // 프리미엄 품질
          engagement: 'sophisticated', // 세련된 몰입
          complexity: 'high', // 높은 복잡도
        },

        quality: {
          threshold: 95, // 최고 품질 점수 기준
          characterThreshold: 95, // 최고 캐릭터 일관성
          dialogueRatio: 0.28, // 대화 비율 28%
          editorialFocus: true, // 편집 품질 중시
          consistency: true, // 일관성 극대화
          sophistication: true, // 세련된 표현
        },
      },
    };

    // 기본 플랫폼 설정
    this.defaultPlatform = 'default';
    this.currentPlatform = this.defaultPlatform;
  }

  /**
   * 플랫폼 설정 조회
   */
  getConfig(platform = null) {
    const targetPlatform = platform || this.currentPlatform;
    const config = this.configs[targetPlatform];

    if (!config) {
      console.warn(`플랫폼 '${targetPlatform}' 설정을 찾을 수 없습니다. 기본 설정을 사용합니다.`);
      return this.configs[this.defaultPlatform];
    }

    return config;
  }

  /**
   * 현재 플랫폼 설정
   */
  setPlatform(platform) {
    if (!this.configs[platform]) {
      console.warn(`지원하지 않는 플랫폼: ${platform}. 기본 플랫폼을 유지합니다.`);
      return false;
    }

    this.currentPlatform = platform;
    console.log(`플랫폼이 '${this.configs[platform].name}'로 변경되었습니다.`);
    return true;
  }

  /**
   * 사용 가능한 플랫폼 목록
   */
  getAvailablePlatforms() {
    return Object.keys(this.configs).map(key => ({
      key,
      name: this.configs[key].name,
      description: this.configs[key].description,
      wordCount: this.configs[key].wordCount.target,
    }));
  }

  /**
   * 플랫폼별 프롬프트 생성
   */
  generatePromptGuidelines(platform = null) {
    const config = this.getConfig(platform);

    return {
      wordCountGuideline: `${config.wordCount.min}-${config.wordCount.max}자 (공백 제외) - 목표 ${config.wordCount.target}자`,

      structureGuideline: `${config.structure.scenes}개 장면으로 구성, 각 장면당 약 ${config.structure.sceneLength}자`,

      styleGuideline: this.getStyleGuideline(config.style),

      qualityGuideline: this.getQualityGuideline(config.quality),

      platformNote: `${config.name} 최적화: ${config.description}`,
    };
  }

  /**
   * 스타일 가이드라인 생성
   */
  getStyleGuideline(style) {
    const guidelines = {
      fast: '빠른 전개로 독자의 집중력 유지, 간결하고 임팩트 있는 서술',
      moderate: '적당한 속도로 감정적 몰입도 극대화, 균형잡힌 묘사와 대화',
      deep: '깊이 있는 전개로 세밀한 심리 묘사, 상세한 환경과 감정 설명',
      balanced: '균형잡힌 전개로 완성도 높은 구성, 세련되고 일관된 서술',
    };

    const focuses = {
      'mobile-friendly': '모바일 독자를 위한 읽기 편한 구성',
      engaging: '감정적 몰입도와 다음 화 기대감 조성',
      detailed: '상세한 묘사와 깊이 있는 캐릭터 개발',
      premium: '편집 품질과 완성도, 세련된 표현',
    };

    return `${guidelines[style.pacing] || ''} | ${focuses[style.focus] || ''}`;
  }

  /**
   * 품질 가이드라인 생성
   */
  getQualityGuideline(quality) {
    const guidelines = [];

    guidelines.push(`품질 기준: ${quality.threshold}점 이상`);
    guidelines.push(`캐릭터 일관성: ${quality.characterThreshold}점 이상`);
    guidelines.push(`대화 비율: ${Math.round(quality.dialogueRatio * 100)}% 이상`);

    if (quality.emotionFocus) guidelines.push('감정 표현 강화 필수');
    if (quality.detailFocus) guidelines.push('상세 묘사 중점');
    if (quality.worldBuilding) guidelines.push('세계관 구축 강화');
    if (quality.editorialFocus) guidelines.push('편집 품질 최우선');
    if (quality.sophistication) guidelines.push('세련된 표현 사용');

    return guidelines.join(' | ');
  }

  /**
   * 플랫폼 간 분량 비교
   */
  compareWordCounts() {
    const comparison = {};

    Object.keys(this.configs).forEach(platform => {
      const config = this.configs[platform];
      comparison[platform] = {
        name: config.name,
        target: config.wordCount.target,
        range: `${config.wordCount.min}-${config.wordCount.max}`,
        spacesIncluded: Math.round(config.wordCount.target * 1.2), // 공백 포함 추정
      };
    });

    return comparison;
  }

  /**
   * 품질 기준 조회
   */
  getQualityStandards(platform = null) {
    const config = this.getConfig(platform);
    return {
      minWordCount: config.wordCount.min,
      maxWordCount: config.wordCount.max,
      targetWordCount: config.wordCount.target,
      qualityThreshold: config.quality.threshold,
      characterConsistencyThreshold: config.quality.characterThreshold,
      dialogueRatio: config.quality.dialogueRatio,
      minSentences: Math.round(config.wordCount.target / 100), // 추정치
      maxParagraphs: config.structure.paragraphs,
    };
  }

  /**
   * 플랫폼별 메타데이터 생성
   */
  generateMetadata(platform = null) {
    const config = this.getConfig(platform);

    return {
      platform: platform || this.currentPlatform,
      platformName: config.name,
      targetWordCount: config.wordCount.target,
      expectedScenes: config.structure.scenes,
      styleProfile: config.style,
      qualityProfile: config.quality,
      generatedAt: new Date().toISOString(),
    };
  }
}

// 환경 변수에서 플랫폼 설정을 가져오는 헬퍼 함수
export function createPlatformConfig() {
  const platform = process.env.PLATFORM_MODE || 'default';
  const engine = new PlatformConfigEngine();

  if (platform !== 'default') {
    engine.setPlatform(platform);
  }

  return engine;
}

// 플랫폼별 설정 요약 출력
export function printPlatformSummary() {
  const engine = new PlatformConfigEngine();
  const platforms = engine.getAvailablePlatforms();

  console.log('\n📚 사용 가능한 웹소설 플랫폼 설정:');
  console.log('=====================================');

  platforms.forEach(platform => {
    console.log(`\n${platform.name}:`);
    console.log(`   - 키: ${platform.key}`);
    console.log(`   - 목표 분량: ${platform.wordCount}자 (공백 제외)`);
    console.log(`   - 설명: ${platform.description}`);
  });

  console.log('\n사용법: PLATFORM_MODE=naver node scripts/run-automation.js');
  console.log('');
}
