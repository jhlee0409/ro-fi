/**
 * 트로프 시스템 상수 정의
 */

import type { TropeId, ConflictType, GenreType } from '../types';

export const TROPE_DEFINITIONS = {
  // 관계형 트로프
  'enemies-to-lovers': {
    name: 'Enemies to Lovers',
    category: 'relationship',
    description: '적대관계에서 시작하여 사랑으로 발전',
    compatibleWith: ['power-struggle', 'hidden-identity', 'political-intrigue'],
    incompatibleWith: ['fake-relationship', 'arranged-marriage'],
  },
  'second-chance': {
    name: 'Second Chance',
    category: 'relationship', 
    description: '과거의 관계를 재회하여 새로운 기회',
    compatibleWith: ['memory-loss', 'regression', 'time-loop'],
    incompatibleWith: ['enemies-to-lovers'],
  },
  'fake-relationship': {
    name: 'Fake Relationship',
    category: 'relationship',
    description: '가짜 관계에서 시작하여 진짜 사랑으로',
    compatibleWith: ['arranged-marriage', 'hidden-identity'],
    incompatibleWith: ['enemies-to-lovers', 'forbidden-love'],
  },
  'arranged-marriage': {
    name: 'Arranged Marriage',
    category: 'relationship',
    description: '정략결혼에서 시작하는 로맨스',
    compatibleWith: ['fake-relationship', 'power-struggle'],
    incompatibleWith: ['enemies-to-lovers'],
  },
  'bodyguard-romance': {
    name: 'Bodyguard Romance',
    category: 'relationship',
    description: '보호자와 피보호자 간의 로맨스',
    compatibleWith: ['forbidden-love', 'hidden-identity'],
    incompatibleWith: ['arranged-marriage'],
  },
  'master-servant': {
    name: 'Master-Servant',
    category: 'relationship',
    description: '주인과 하인 관계에서 발전하는 사랑',
    compatibleWith: ['hidden-identity', 'power-struggle'],
    incompatibleWith: ['arranged-marriage'],
  },
  'rival-to-lover': {
    name: 'Rival to Lover',
    category: 'relationship',
    description: '경쟁자에서 연인으로',
    compatibleWith: ['power-struggle', 'academy'],
    incompatibleWith: ['second-chance'],
  },
  'forbidden-love': {
    name: 'Forbidden Love',
    category: 'relationship',
    description: '금지된 사랑',
    compatibleWith: ['bodyguard-romance', 'political-intrigue'],
    incompatibleWith: ['fake-relationship'],
  },
  
  // 플롯 트로프
  'memory-loss': {
    name: 'Memory Loss',
    category: 'plot',
    description: '기억상실로 인한 스토리 전개',
    compatibleWith: ['second-chance', 'hidden-identity'],
    incompatibleWith: ['regression'],
  },
  'time-loop': {
    name: 'Time Loop',
    category: 'plot',
    description: '시간 루프 속에서 반복되는 이야기',
    compatibleWith: ['second-chance', 'prophecy-bound'],
    incompatibleWith: ['regression'],
  },
  'power-struggle': {
    name: 'Power Struggle',
    category: 'plot',
    description: '권력 투쟁을 중심으로 한 갈등',
    compatibleWith: ['enemies-to-lovers', 'political-intrigue'],
    incompatibleWith: [],
  },
  'hidden-identity': {
    name: 'Hidden Identity',
    category: 'plot',
    description: '숨겨진 정체성으로 인한 갈등',
    compatibleWith: ['bodyguard-romance', 'fake-relationship'],
    incompatibleWith: [],
  },
  'prophecy-bound': {
    name: 'Prophecy Bound',
    category: 'plot',
    description: '예언에 얽매인 운명',
    compatibleWith: ['time-loop', 'dark-prophecy'],
    incompatibleWith: [],
  },
  
  // 세계관 트로프
  'transmigration': {
    name: 'Transmigration',
    category: 'world',
    description: '다른 세계로의 영혼 이동',
    compatibleWith: ['regression', 'hidden-identity'],
    incompatibleWith: ['memory-loss'],
  },
  'regression': {
    name: 'Regression',
    category: 'world',
    description: '과거로의 회귀',
    compatibleWith: ['second-chance', 'transmigration'],
    incompatibleWith: ['memory-loss', 'time-loop'],
  },
  'parallel-world': {
    name: 'Parallel World',
    category: 'world',
    description: '평행세계 설정',
    compatibleWith: ['transmigration', 'hidden-identity'],
    incompatibleWith: [],
  },
} as const satisfies Record<TropeId, {
  name: string;
  category: string;
  description: string;
  compatibleWith: string[];
  incompatibleWith: string[];
}>;

export const CONFLICT_TYPES: Record<ConflictType, string> = {
  'political-intrigue': '정치적 음모와 권력 투쟁',
  'ancient-curse': '고대의 저주와 그 해결',
  'dark-prophecy': '어둠의 예언과 운명',
  'family-secrets': '가문의 비밀과 유산',
  'war-brewing': '전쟁의 전조와 갈등',
  'forbidden-power': '금지된 힘의 각성',
  'magical-awakening': '마법적 각성과 변화',
  'divine-intervention': '신의 개입과 시련',
};

export const GENRE_DESCRIPTIONS: Record<GenreType, string> = {
  '궁중 로맨스': '화려한 궁정을 배경으로 한 로맨스',
  '아카데미 판타지': '마법 학원에서 펼쳐지는 청춘',
  '기사단 로맨스': '기사와 함께하는 모험과 사랑',
  '마법사 학원': '마법사들의 성장과 로맨스',
  '용족 판타지': '용족과 인간의 금기된 사랑',
  '신화 재해석': '고대 신화를 현대적으로 재해석',
  '이세계 전생': '다른 세계에서의 새로운 삶',
  '회귀 복수극': '과거로 돌아가 펼치는 복수와 사랑',
  '계약 결혼': '계약으로 시작된 결혼 생활',
};

export const MAGIC_SYSTEMS = [
  '원소 조화술',
  '정신 연결술', 
  '시간 조작술',
  '공간 절곡술',
  '생명력 전이술',
  '감정 기반 마법',
  '계약 소환술',
  '운명 직조술',
  '기억 편집술',
  '에너지 변환술',
] as const;

export const WORLD_SETTINGS = [
  '마법과 과학이 공존하는 세계',
  '색깔별로 계급이 나뉜 마법 왕국', 
  '시간이 거꾸로 흐르는 탑',
  '감정이 마법력이 되는 왕국',
  '별들이 운명을 결정하는 제국',
  '죽은 자와 대화할 수 있는 학원',
  '계절이 감정에 따라 바뀌는 땅',
  '기억을 매매하는 상인들의 세계',
  '꿈과 현실의 경계가 모호한 도시',
  '신들의 게임판이 된 현실',
] as const;