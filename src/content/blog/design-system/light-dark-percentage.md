---
title: "디자인 시스템 세우기 4 — light-dark()를 퍼센트 자리에 쓴 오류"
date: 2026-09-02T22:00:00+09:00
tags: ["CSS","디자인시스템","웹","토큰","color-mix"]
slug: "light-dark-percentage"
lang: "ko"
author: "Heejeong Kim"
summary: "라이트 8%·다크 12%의 배경을 만들려고 퍼센트 자리에 light-dark()를 넣었지만 색이 표시되지 않았습니다. 완성된 color-mix() 색상 두 개를 light-dark()에 전달하도록 고쳤습니다."
---

Aurora Ledger 웹 컴포넌트의 옅은 배경색인 `--wash`, `--primary-wash`와 상태 배지 배경을 정리하고 있었습니다. 라이트에서는 글자색을 8%, 다크에서는 12% 섞은 배경을 만들려 했습니다.

```css
/* 겉보기엔 완벽해 보였던 한 줄 */
--wash: color-mix(in srgb, var(--text) light-dark(8%, 12%), transparent);
```

이 선언을 적용한 배지와 카드에서는 배경이 보이지 않았습니다. 콘솔과 CSS 린터에도 오류가 표시되지 않아, 사용한 함수의 문법을 확인했습니다.

## light-dark()는 색상을 받는 함수였습니다

CSS Color Module Level 5에서 `light-dark()`의 두 인자는 `<color>`로 정의돼 있습니다.

```
light-dark( <color> , <color> )
```

원래 코드에서는 `color-mix()`의 퍼센트(`<percentage>`) 자리에 `light-dark(8%, 12%)`를 넣었습니다. 색상 함수에 퍼센트만 전달한 데다, 그 결과를 혼합 비율이 필요한 자리에 사용한 것입니다.

이 표현식은 배경색으로 사용할 수 없었습니다. 브라우저는 잘못된 CSS 값 때문에 페이지 전체를 멈추지 않았고, 해당 배경은 기대한 색 대신 투명하게 보였습니다.

## 색상 두 개를 만든 뒤 테마에 따라 골랐습니다

`color-mix()`로 완성한 색상 두 개를 `light-dark()`에 넣도록 바꿨습니다.

```css
/* 올바른 합성: light-dark()는 색상 자리에만 선다 */
--wash: light-dark(
  color-mix(in srgb, var(--text) 8%, transparent),
  color-mix(in srgb, var(--text) 12%, transparent)
);
```

첫 번째 인자는 8%를 섞은 색, 두 번째 인자는 12%를 섞은 색입니다. 두 값 모두 `<color>`가 되므로 `light-dark()`가 테마에 맞는 색을 선택할 수 있습니다.

이후 옅은 배경 토큰을 확인할 때는 선언이 코드에 있는지만 보지 않고, 개발자 도구의 Styles와 Computed에서 실제 적용된 배경색도 확인할 기준으로 삼았습니다. 컴포넌트마다 같은 조합을 반복하기보다 공통 토큰으로 정의해 사용하도록 정리했습니다.
