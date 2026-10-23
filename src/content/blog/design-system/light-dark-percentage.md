---
title: "디자인 시스템 세우기 4 — light-dark(8%, 12%)로는 배경색을 만들 수 없었다"
date: 2026-09-02T22:00:00+09:00
tags: ["CSS","디자인시스템","웹","토큰","color-mix"]
slug: "light-dark-percentage"
lang: "ko"
author: "Heejeong Kim"
summary: "Emoticon Studio 목업에서 옅은 배경이 보이지 않았습니다. color-mix()의 혼합 비율에 넣은 light-dark(8%, 12%)가 원인이었고, 색상 두 개를 만든 뒤 선택하도록 고쳤습니다."
---

## 들어가며

Emoticon Studio 목업에서 배지와 카드의 옅은 배경이 보이지 않았습니다. 배경에 쓰는 `--wash`, `--primary-wash` 토큰은 있었지만, 값을 만드는 방식이 잘못돼 있었습니다.

## 비율을 고르려던 light-dark()

```css
--wash: color-mix(in srgb, var(--text) light-dark(8%, 12%), transparent);
```

의도는 간단했습니다. 라이트에서는 글자색을 8%, 다크에서는 12% 섞고 나머지는 투명하게 두려 했습니다. 테마에 따라 비율만 바뀌니 그 자리에 `light-dark()`를 넣었습니다.

색상 값에 쓰는 `light-dark()`는 두 색 중 하나를 고릅니다. [CSS Color Module Level 5의 색상 문법](https://www.w3.org/TR/css-color-5/#light-dark)은 다음과 같습니다.

```text
light-dark( <color> , <color> )
```

`8%`와 `12%`는 색이 아닙니다. 색을 반환하는 함수를 퍼센트 자리에 넣었으니, 인자도 결과를 쓸 자리도 맞지 않았습니다. `--wash`라는 변수는 있어도 배경색으로 해석할 수 없는 값이었습니다.

## 색을 만든 다음 고르기

비율을 선택하는 대신 라이트와 다크에 사용할 색을 먼저 만들었습니다.

```css
--wash: light-dark(
  color-mix(in srgb, var(--text) 8%, transparent),
  color-mix(in srgb, var(--text) 12%, transparent)
);
```

첫 번째 `color-mix()`는 8%를 섞은 색, 두 번째는 12%를 섞은 색을 만듭니다. 이제 `light-dark()`가 받는 두 값이 모두 색이고, 선택한 결과도 배경색 자리에 쓸 수 있습니다.

## 마치며

옅은 배경 토큰을 이 형태로 고쳤습니다. 변수 이름을 찾는 데서 끝내지 않고, 개발자 도구의 Computed에서 실제 `background-color`까지 봐야 하는 문제였습니다.
