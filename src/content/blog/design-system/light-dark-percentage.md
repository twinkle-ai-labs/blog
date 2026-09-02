---
title: "디자인 시스템 세우기 4 — light-dark()를 퍼센트 자리에 쓰면 선언이 통째로 죽습니다"
date: 2026-09-02T22:00:00+09:00
tags: ["CSS","디자인시스템","웹","토큰","color-mix"]
slug: "light-dark-percentage"
lang: "ko"
author: "Heejeong Kim"
summary: "CSS의 모던 함수 light-dark()를 color-mix()의 퍼센트 농도 자리에 썼더니 에러 하나 없이 선언 전체가 무효 처리되어 투명해졌습니다. CSS 명세의 미묘한 파싱 규칙과 테마 토큰을 안전하게 합성하는 방법을 정리합니다."
---

Aurora Ledger 웹 컴포넌트들을 다듬으면서 옅은 배경색(`--wash` · `--primary-wash`)과 상태 배지 알약의 배경을 정의하고 있었습니다.

라이트 모드에서는 글자색의 `8%`, 다크 모드에서는 `12%` 농도로 은은하게 배경을 깔아주고 싶었습니다.
CSS의 최신 함수인 `color-mix()`와 `light-dark()`를 조합해 아주 우아하게 한 줄로 적었다고 생각했습니다.

```css
/* 겉보기엔 완벽해 보였던 한 줄 */
--wash: color-mix(in srgb, var(--text) light-dark(8%, 12%), transparent);
```

그런데 화면을 띄워보니 배지와 카드의 워시 배경이 처음부터 단 한 번도 그려지지 않고 있었습니다.

콘솔에 에러도 안 뜨고, CSS 린터도 조용했습니다.

# 브라우저는 왜 아무 말 없이 투명으로 넘겼을까?

원인은 CSS 표준 명세(W3C Color Module Level 5)의 엄격한 문법 규칙에 있었습니다.

`light-dark()` 함수는 `<color>` 데이터 타입 자리에만 올 수 있습니다.

```
light-dark( <color> , <color> )
```

그런데 우리가 작성한 코드에서 `light-dark(8%, 12%)`는 색상이 아니라 `<percentage>` 자리에 들어가 있었습니다.

1. 브라우저 CSS 파서는 퍼센트 자리에 색상 함수(`light-dark`)가 들어온 것을 발견합니다.
2. 값 전체를 파싱할 수 없는 잘못된 선언(Invalid Declaration)으로 판정합니다.
3. CSS 파서는 에러를 던져 웹페이지를 멈추지 않고, 해당 스타일 속성을 조용히 무시(Ignore)하고 넘어갑니다.
4. 결과적으로 `--wash` 변수는 정의되지 않은 상태가 되어 투명(transparent)으로 렌더링되었습니다.

# 바른 해결책: `color-mix`를 두 번 접어 넣기

이 문제를 해결하는 정석적인 방법은 `light-dark()` 함수 안에 완성된 `<color>` 표현식 두 개를 전달하는 것입니다.

```css
/* 올바른 합성: light-dark()는 색상 자리에만 선다 */
--wash: light-dark(
  color-mix(in srgb, var(--text) 8%, transparent),
  color-mix(in srgb, var(--text) 12%, transparent)
);
```

이렇게 쓰면 `light-dark()`의 첫 번째 인자와 두 번째 인자 모두 명확한 `<color>` 타입이 되므로 브라우저가 완벽하게 파싱합니다.

# 테마 토큰을 다루며 얻은 교훈

1. CSS 함수는 제 자리가 있습니다: 아무리 강력한 함수라도 스펙이 허용한 슬롯(Type)을 벗어나면 침묵의 무효화가 일어납니다.
2. 조용한 실패는 눈으로 증명해야 합니다: 브라우저 개발자 도구의 Styles 패널에서 취소선이 그어져 있는지, Computed 패널에서 실제로 연산된 RGBA 값이 찍히는지 확인해야 합니다.
3. 토큰 합성 유틸리티의 표준화: 혼합 색상(Wash) 토큰을 작성할 때는 개별 컴포넌트에서 매번 `color-mix`를 손으로 조합하지 않고, 디자인 시스템 글로벌 레이어에서 규격화된 유틸리티 토큰으로 제공해야 합니다.

## 다시 같은 일을 한다면

- `light-dark()`는 오직 색상(`<color>`) 자리에만 섭니다. 퍼센트나 길이 단위 자리에는 쓸 수 없습니다.
- CSS는 문법 오류가 나도 소리치지 않고 조용히 선언을 버립니다.
- 새로운 CSS 명세를 도입할 때는 개발자 도구의 계산된 값(Computed Value)을 반드시 한 번 찍어보세요.
