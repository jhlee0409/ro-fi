export class EmotionalDepthEngine {
  constructor() {
    this.internalConflictTypes = {
      '과거의 트라우마': [
        "그때의 기억이 또다시... 아니야, 이번엔 달라",
        "왜 자꾸 그 일이 떠오르는 거야... 이미 끝난 일인데",
        "또 그 악몽을 꾸게 될까봐... 무서워"
      ],
      '감정의 부정': [
        "설마 내가... 아니야, 그럴 리 없어. 단지...",
        "이건 그냥... 동정심일 뿐이야. 다른 건 아니야",
        "내가 왜 이런 기분이... 이해할 수 없어"
      ],
      '신분의 차이': [
        "나 같은 사람이 감히... 분수를 모르고 있었어",
        "우리는 너무 다른 세계에 살고 있어"
      ],
      '의무와 감정의 충돌': [
        "내가 해야 할 일과... 내가 원하는 것이 다르다면?",
        "모두가 기대하는 것과 내 마음이 왜 이렇게 다를까"
      ]
    };

    this.microExpressions = {
      attraction: [
        "시선이 무의식적으로 따라갔다",
        "목소리가 평소보다 부드러워졌다", 
        "손끝이 스치자 숨이 멎는 듯했다",
        "상대방의 웃음소리에 자신도 모르게 미소지었다",
        "말을 하다가 문득 상대의 눈을 보며 멈칫했다"
      ],
      anxiety: [
        "입술을 깨물며 불안을 삼켰다",
        "손가락으로 옷자락을 만지작거렸다",
        "눈동자가 불안하게 흔들렸다",
        "목구멍이 마르는 것을 느꼈다",
        "심장 소리가 귓가에서 울렸다"
      ],
      guilt: [
        "고개를 숙인 채 상대방의 눈을 피했다",
        "목소리가 점점 작아졌다",
        "죄책감에 가슴이 답답해졌다",
        "변명을 하다가 말을 멈췄다"
      ],
      longing: [
        "먼 곳을 바라보며 깊은 한숨을 쉬었다",
        "그리운 마음에 가슴 한편이 저렸다",
        "손을 뻗었다가 허공을 움켜쥐었다",
        "애타는 마음을 억누르며 눈을 감았다"
      ],
      jealousy: [
        "억지로 웃음을 지으며 속내를 감췄다",
        "질투심에 손끝이 차갑게 식었다",
        "다른 곳을 보려 하지만 시선이 자꾸 그곳으로 향했다",
        "가슴 속에서 타오르는 감정을 애써 눌렀다"
      ]
    };

    this.sensoryDescriptions = {
      긴장: {
        촉각: ["손바닥에 차가운 땀이 맺혔다", "등줄기를 타고 오한이 흘렀다", "온몸의 근육이 경직되었다"],
        청각: ["자신의 심장소리만 들렸다", "정적이 귓가를 압박했다", "멀리서 시계 초침 소리가 또렷했다"],
        시각: ["시야가 흐릿하게 흔들렸다", "주변이 선명하게 보였다", "빛이 유난히 밝게 느껴졌다"],
        후각: ["코끝에 차가운 공기가 스쳤다", "긴장으로 인한 진땀 냄새가 났다"],
        미각: ["입안이 바싹 말랐다", "쓴맛이 혀끝에 맴돌았다"]
      },
      설렘: {
        촉각: ["심장이 두근거리며 뛰었다", "볼이 뜨거워졌다", "온몸에 전율이 흘렀다"],
        청각: ["상대방의 목소리가 유독 선명했다", "주변 소음이 멀어졌다"],
        시각: ["모든 것이 더 밝고 선명해 보였다", "상대방만 보였다"],
        후각: ["은은한 향기가 코끝을 스쳤다", "봄 바람의 향기가 났다"]
      },
      슬픔: {
        촉각: ["가슴 한편이 먹먹했다", "목구멍이 메었다", "눈가가 뜨거워졌다"],
        청각: ["모든 소리가 멀게 들렸다", "자신의 숨소리만 들렸다"],
        시각: ["시야가 흐려졌다", "색깔이 바래 보였다"],
        후각: ["코가 막힌 듯했다"]
      }
    };

    this.dialogueSubtextPatterns = {
      defensive: {
        hurt: "말은 그렇게 하지만, 떨리는 목소리가 상처받은 마음을 드러냈다.",
        angry: "차가운 말투 뒤로 분노가 숨어있었다.",
        scared: "강한 척하지만 불안한 기색을 감출 수 없었다."
      },
      caring: {
        worried: "무뚝뚝한 말투였지만 진심 어린 걱정이 묻어났다.",
        affectionate: "애써 평범하게 말했지만 따뜻한 애정이 느껴졌다."
      },
      conflicted: {
        torn: "확신에 찬 말이었지만 눈빛은 흔들리고 있었다.",
        guilty: "변명처럼 들렸지만 자신조차 확신하지 못하는 듯했다."
      }
    };

    this.emotionProgressionStages = {
      'enemies-to-lovers': {
        1: { stage: "적대적 긴장", emotions: ["분노", "경계", "불신"] },
        2: { stage: "호기심 발생", emotions: ["의외", "당황", "관찰"] },
        3: { stage: "이해의 시작", emotions: ["공감", "혼란", "갈등"] },
        4: { stage: "끌림 인정", emotions: ["설렘", "부정", "두려움"] },
        5: { stage: "감정 고백", emotions: ["용기", "떨림", "희망"] },
        6: { stage: "관계 발전", emotions: ["행복", "불안", "기대"] },
        7: { stage: "위기 극복", emotions: ["결심", "신뢰", "사랑"] },
        8: { stage: "깊은 유대", emotions: ["안정", "충만", "평화"] },
        9: { stage: "완전한 신뢰", emotions: ["확신", "감사", "만족"] },
        10: { stage: "영원한 사랑", emotions: ["영원", "완성", "축복"] }
      },
      'fake-relationship': {
        1: { stage: "계약적 관계", emotions: ["어색", "긴장", "계산적"] },
        2: { stage: "연기하는 관계", emotions: ["부담", "혼란", "피로"] },
        3: { stage: "익숙해지는 관계", emotions: ["편안", "자연스러움", "의외"] },
        4: { stage: "진심 발견", emotions: ["놀람", "설렘", "거부감"] },
        5: { stage: "감정 혼란", emotions: ["혼돈", "부정", "갈등"] },
        6: { stage: "진실 깨달음", emotions: ["깨달음", "두려움", "희망"] },
        7: { stage: "관계 재정의", emotions: ["용기", "솔직함", "불안"] },
        8: { stage: "진짜 사랑", emotions: ["진실", "기쁨", "감동"] },
        9: { stage: "신뢰 구축", emotions: ["안정", "깊이", "평온"] },
        10: { stage: "진정한 결합", emotions: ["완성", "영원", "축복"] }
      }
    };
  }

  generateInternalConflict(conflictType, characterName) {
    const templates = this.internalConflictTypes[conflictType];
    if (!templates) {
      return `내 마음이 왜 이렇게 복잡한 걸까...`;
    }

    const template = this.getRandomElement(templates);
    // 마크다운 형식 제거하고 순수 텍스트만 반환
    return template.replace(/{character}/g, characterName)
                  .replace(/> \*'/, '')
                  .replace(/'\*.*$/, '')
                  .trim();
  }

  generateMicroExpression(emotionType, characterName) {
    const expressions = this.microExpressions[emotionType];
    if (!expressions) {
      return `${characterName}의 표정이 미묘하게 변했다.`;
    }

    const expression = this.getRandomElement(expressions);
    return `${characterName}${expression.includes('시선') || expression.includes('목소리') ? '의 ' : '는 '}${expression}.`;
  }

  generateSensoryDescription(emotion, setting) {
    const sensoryData = this.sensoryDescriptions[emotion];
    if (!sensoryData) {
      return `${setting}의 분위기가 ${emotion}을 더욱 증폭시켰다.`;
    }

    const senses = Object.keys(sensoryData);
    const randomSense = this.getRandomElement(senses);
    const descriptions = sensoryData[randomSense];
    const description = this.getRandomElement(descriptions);

    return `${setting}에서 ${description}`;
  }

  generateDialogueSubtext(dialogue, tone, underlyingEmotion) {
    const patterns = this.dialogueSubtextPatterns[tone];
    if (!patterns || !patterns[underlyingEmotion]) {
      return `"${dialogue}" 하지만 그 말 속에는 복잡한 감정이 숨어있었다.`;
    }

    const subtext = patterns[underlyingEmotion];
    return `"${dialogue}" ${subtext}`;
  }

  generateEmotionProgression(relationshipType, currentStage, totalStages) {
    const progressionData = this.emotionProgressionStages[relationshipType];
    if (!progressionData) {
      return {
        stage: `${currentStage}/${totalStages} 단계`,
        emotions: ["복잡", "변화", "성장"],
        intensity: Math.round((currentStage / totalStages) * 100)
      };
    }

    const stageData = progressionData[currentStage];
    return {
      stage: stageData.stage,
      emotions: stageData.emotions,
      intensity: Math.round((currentStage / totalStages) * 100),
      description: this.generateStageDescription(stageData, currentStage, totalStages)
    };
  }

  generateStageDescription(stageData, currentStage, totalStages) {
    const progressPercent = Math.round((currentStage / totalStages) * 100);
    return `${stageData.stage} 단계 (진행도: ${progressPercent}%). 주요 감정: ${stageData.emotions.join(', ')}`;
  }

  generateComplexEmotionalState(emotionMix, characterName) {
    const dominantEmotion = emotionMix.reduce((prev, current) => 
      prev.intensity > current.intensity ? prev : current
    );

    const conflictingEmotions = emotionMix.filter(e => e !== dominantEmotion);
    
    let description = `**${characterName}**의 마음은 복잡했다. `;
    description += `${dominantEmotion.emotion}이 가장 강했지만, `;
    description += conflictingEmotions.map(e => e.emotion).join('과 ') + '도 함께 얽혀있었다.';

    // 감정 충돌 묘사 추가
    if (conflictingEmotions.length > 0) {
      description += `\n> *'${dominantEmotion.emotion}을 느끼면서도 ${conflictingEmotions[0].emotion}이... 왜 이렇게 마음이 복잡한 거야?'*`;
    }

    return description;
  }

  calculateEmotionalDepth(text) {
    let score = 0;

    // 내적 독백 체크 (+20점)
    const monologueMatches = (text.match(/> \*'.*?'\*/g) || []).length;
    score += Math.min(monologueMatches * 20, 40);

    // 미묘한 감정 표현 체크 (+15점)
    const microExpressionKeywords = [
      '무의식적으로', '미세하게', '은근히', '살짝', '스치듯',
      '떨렸다', '흔들렸다', '멎는 듯', '저렸다', '먹먹했다'
    ];
    const microExpressions = microExpressionKeywords.filter(keyword => 
      text.includes(keyword)
    ).length;
    score += Math.min(microExpressions * 15, 30);

    // 감각적 묘사 체크 (+10점)
    const sensoryKeywords = [
      '냄새', '향기', '소리', '맛', '촉감', '따뜻한', '차가운',
      '거칠', '부드러운', '달콤한', '쓴', '시큼한'
    ];
    const sensoryDetails = sensoryKeywords.filter(keyword => 
      text.includes(keyword)
    ).length;
    score += Math.min(sensoryDetails * 10, 20);

    // 대화의 이면 의미 체크 (+10점)
    if (text.includes('" ') && text.includes('하지만')) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}