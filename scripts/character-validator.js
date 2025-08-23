/**
 * 🛡️ 캐릭터 일관성 검증 시스템
 * 
 * 소설별 캐릭터 이름을 엄격하게 관리하여
 * 이세아/카일런 같은 잘못된 이름 생성을 방지
 */

export class CharacterValidator {
  constructor() {
    // 소설별 정확한 캐릭터 매핑
    this.characterMap = {
      'time-guardian-fate-thread': {
        allowed: ['레오나', '카엘'],
        blacklist: ['이세아', '카일런', '윈터하트', '세아', '레이나', '엘리아']
      },
      'ice-heart-touch': {
        allowed: ['아리아', '루시안'],
        blacklist: ['아리엘', '루카스', '리안']
      },
      'the-monsters-only-antidote': {
        allowed: ['리아', '에시온'],
        blacklist: ['세라핀', '다리우스', '세라', '다리오', '세라피나', '강이서']
      }
    };
  }

  /**
   * 캐릭터 일관성 검증
   */
  validate(novelSlug, content) {
    const config = this.characterMap[novelSlug];
    
    if (!config) {
      return { valid: true, reason: '등록되지 않은 소설' };
    }

    // 1. 필수 캐릭터 확인
    const missingRequired = config.allowed.filter(name => !content.includes(name));
    if (missingRequired.length > 0) {
      return {
        valid: false,
        reason: `필수 캐릭터 누락: ${missingRequired.join(', ')}`
      };
    }

    // 2. 금지된 이름 확인
    const foundBlacklisted = config.blacklist.filter(name => content.includes(name));
    if (foundBlacklisted.length > 0) {
      return {
        valid: false,
        reason: `잘못된 캐릭터 이름 발견: ${foundBlacklisted.join(', ')}`
      };
    }

    // 3. 분량 확인
    const contentMatch = content.match(/--- CONTENT START ---\n([\s\S]+?)\n--- CONTENT END ---/);
    const actualContent = contentMatch ? contentMatch[1] : content;
    const wordCount = actualContent.length;

    if (wordCount < 2000) {
      return {
        valid: false,
        reason: `분량 부족: ${wordCount}자 (최소 2000자 필요)`
      };
    }

    return { valid: true, reason: '검증 통과' };
  }

  /**
   * 허용된 캐릭터 목록 반환
   */
  getCharacters(novelSlug) {
    const config = this.characterMap[novelSlug];
    return config ? config.allowed : [];
  }

  /**
   * 새 소설 캐릭터 등록
   */
  registerNovel(novelSlug, characters, blacklist = []) {
    this.characterMap[novelSlug] = {
      allowed: characters,
      blacklist: blacklist
    };
  }

  /**
   * 캐릭터 설정 업데이트
   */
  updateCharacters(novelSlug, characters) {
    if (this.characterMap[novelSlug]) {
      this.characterMap[novelSlug].allowed = characters;
    }
  }
}