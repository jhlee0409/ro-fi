# 소설용 마크다운 포맷 가이드라인

## 파일 형식 구분

- `.md` 파일: 순수 마크다운, marked 라이브러리로 파싱
- `.mdx` 파일: Markdown + JSX, Astro Content 컴포넌트로 렌더링

## 기본 원칙

- 한 줄에 한 가지 요소만: 대화, 서술, 독백을 명확히 분리
- 일관된 형식: 같은 요소는 항상 같은 형식 사용
- 시각적 구분: 각 요소가 명확히 구분되도록 작성
- MDX 권장: 새로운 챕터는 .mdx 형식으로 작성

## 1. 대화체 (Dialogue)

실제로 발화되는 모든 대화

```markdown
> "안녕하세요, 처음 뵙겠습니다."

> "오늘 날씨가 정말 좋네요."
```

**규칙:**

- `>` + 공백 + `"대화내용"`
- 쌍따옴표(`""`) 필수 사용
- 대화 앞뒤로 빈 줄 추가
- 화자 설명은 다음 줄에 별도 작성

## 2. 독백/내적 사고 (Monologue)

캐릭터의 내적 사고나 독백

```markdown
> _'이상하다... 왜 계속 그 사람이 생각날까?'_

> _'이번에는 실패할 수 없어.'_
```

**규칙:**

- `>` + 공백 + `*'독백내용'*`
- 기울임체(`*`) + 홑따옴표(`''`) 사용
- 심리 묘사, 생각, 감정 표현

## 3. 서술 (Narrative)

일반적인 스토리 서술

```markdown
**아리엘**은 복도를 걸으며 오늘 있을 실습을 생각했다. 햇살이 **크리스털 첨탑**을 통과하며 무지개빛으로 흩어졌다.

교실 안은 이미 학생들로 가득 차 있었고, 중앙의 **마법진**이 은은하게 빛나고 있었다.
```

**규칙:**

- 일반 문단으로 작성
- **중요 키워드**: 볼드 처리
- **인물명**: 첫 등장시 볼드
- **장소명/마법/아이템**: 볼드 처리

## 4. 액션/상황 변화 (Action Description)

중요한 행동이나 상황 변화

```markdown
> [아리엘이 마법진 중앙으로 걸어 나갔다]

> [갑자기 강한 바람이 불어와 촛불들이 흔들렸다]
```

**규칙:**

- `>` + 공백 + `[행동/상황 설명]`
- 대괄호(`[]`) 사용
- 중요한 액션이나 장면 전환 시 사용

## 5. 화자 설명 (Speaker Attribution)

대화의 화자를 명시

```markdown
**아리엘**이 조심스럽게 말했다.

**카엘**의 목소리가 차갑게 울려 퍼졌다.
```

**규칙:**

- 대화 직후 별도 줄에 작성
- **화자명** 볼드 처리
- "~했다", "~며 말했다" 등 자연스러운 표현

## 6. 강조 요소 (Emphasis)

중요한 내용이나 특별한 표현

```markdown
**마법진이 갑자기 밝게 빛나기 시작했다.**

_그때 예상치 못한 일이 일어났다._
```

**규칙:**

- **중요한 사건**: 볼드
- _강조하고 싶은 서술_: 기울임체
- 과도한 사용 금지

## 7. 장면 전환 (Scene Break)

시간이나 장소의 변화

```markdown
---
## 새로운 장면 제목
---
```

**규칙:**

- `---` 구분선 사용
- 필요시 소제목 추가
- 이모지로 분위기 표현 가능

## 완전한 예시

```markdown
# 제1장: 운명의 만남

**아카데미아 루미나**의 아침이 밝았다. **아리엘**은 복도를 걸으며 오늘의 실습을 생각했다.

> _'드디어 빛과 어둠의 합동 수업이구나.'_

실습실 문을 열자 이미 학생들이 모여 있었다.

> "아리엘! 여기로 와!"

**리나**가 손을 흔들며 소리쳤다.

> [아리엘이 친구들 쪽으로 걸어갔다]

그때 문이 열리며 **카엘 노익스**가 들어왔다. 교실의 분위기가 순식간에 차가워졌다.

> _'왜 하필 저 사람이...'_

**아리엘**이 속으로 생각했다.

> "오늘 파트너를 배정하겠다."

**프로페서 아스트랄**이 엄숙하게 말했다.

> "아리엘 루나와 카엘 노익스."

> [두 사람의 시선이 마주쳤다]

이것이 그들 운명의 시작이었다.

---
```

## 체크리스트

- [ ] 대화체: `> "내용"` 형식 사용
- [ ] 독백: `> *'내용'*` 형식 사용
- [ ] 서술: 일반 문단, 중요 키워드 **볼드**
- [ ] 액션: `> [행동 설명]` 형식 사용
- [ ] 화자 설명: 대화 후 별도 줄
- [ ] 장면 전환: `---` 구분선 사용
- [ ] 한 줄에 한 요소만 포함
