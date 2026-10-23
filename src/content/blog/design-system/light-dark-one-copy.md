---
title: "디자인 시스템 세우기 1 — 테마를 바꾸면 되살아나는 옛 브랜드색"
date: 2026-08-22T22:00:00+09:00
tags: ["css","design-system","다크모드"]
slug: "light-dark-one-copy"
lang: "ko"
author: "Heejeong Kim"
summary: "목업의 여러 테마 블록에 색을 따로 적어 두자 옛 브랜드색이 남았습니다. light-dark()로 두 테마의 색을 한곳에 모으고, 테마 선택은 color-scheme으로 분리했습니다."
---

## 들어가며

물타기 계산기의 디자인 목업에서 브랜드색을 확인하다가 주석과 값이 다른 줄을 발견했습니다.

```css
/* Aurora 는 #7040D9 */
--brand: #6F3DE0;
```

설명에 적힌 색은 새 보라였지만, 화면을 그리는 값은 옛 보라였습니다. 다른 블록에서 새 색을 선언해도 뒤에 남아 있던 선언이 덮어쓰고 있었습니다.

## 같은 색을 고칠 곳이 여러 군데였다

목업에는 시스템 설정과 사용자의 선택에 따라 적용되는 색 정의가 각각 있었습니다.

| 위치 | 적용되는 경우 |
|---|---|
| `:root` | 기본 라이트 테마 |
| `@media (prefers-color-scheme: dark)` | 시스템이 다크일 때 |
| `[data-theme="dark"]` | 사용자가 다크를 고를 때 |
| `[data-theme="light"]` | 사용자가 라이트를 고를 때 |
| `.phone` 스킨 3개 | 목업 안의 휴대전화 화면 |

이 중 한 곳에 `#6F3DE0`이 남아 있었습니다. 특히 시스템 기본 라이트와 사용자가 직접 고른 라이트가 서로 다른 블록을 쓴다는 게 수정할 때 번거로웠습니다. 같은 라이트 화면을 보고 있어도 어느 경로로 들어왔는지에 따라 값이 달라질 수 있었습니다.

색 하나를 바꿀 때 이 목록을 모두 따라가지 않도록, 라이트와 다크 값을 나란히 두기로 했습니다.

## 색 정의와 테마 선택을 분리하기

`light-dark()`에 첫 번째로 라이트 색, 두 번째로 다크 색을 넣었습니다.

```css
:root {
  color-scheme: light dark;

  --token-bg:      light-dark(#F8F6FC, #110D19);
  --token-text:    light-dark(#21182D, #FAF7FF);
  --token-primary: light-dark(#7040D9, #986CF4);
}
```

이제 배경색을 고칠 때는 `--token-bg`의 두 값을 함께 볼 수 있습니다. 어느 쪽을 쓸지는 요소에 적용된 `color-scheme`이 정합니다. 사용자가 테마를 직접 선택하는 경우에도 색을 다시 나열할 필요가 없습니다.

```css
:root[data-theme="dark"]  { color-scheme: dark; }
:root[data-theme="light"] { color-scheme: light; }
```

수동 선택이 없으면 시스템 설정을 따르고, `data-theme`이 있으면 그 선택을 따릅니다.

화면에서 짧은 이름을 쓸 때도 색을 복사하지 않고 기존 변수를 참조하게 했습니다.

```css
/* 값을 복사하면 원래 토큰과 따로 관리해야 합니다. */
--bg: #F8F6FC;

/* 화면에서는 원래 토큰을 참조합니다. */
--bg: var(--token-bg);
```

이제 `--token-bg`를 고치면 화면에서 쓰는 `--bg`에도 반영됩니다.

## color-scheme을 루트에 둔 이유

`color-scheme`은 색상 함수 외에도 브라우저가 그리는 스크롤바와 폼 컨트롤에 영향을 줍니다. 루트 요소에 선언하면 페이지 캔버스와 뷰포트 스크롤바에도 적용됩니다. [CSS Color Adjustment 명세](https://www.w3.org/TR/css-color-adjust-1/#color-scheme-effect)가 이 범위를 구분합니다.

그래서 수동 테마 선택도 `body`가 아닌 `:root`에 선언했습니다. 페이지 배경만 어두워지고 브라우저 컨트롤은 밝게 남는 상황을 함께 다룰 수 있습니다.

## 마치며

여러 테마 블록에 흩어진 색상값을 한곳에 모으고, 테마를 고르는 설정은 루트에 남겼습니다. 이제 색을 고칠 때 라이트와 다크 값을 함께 볼 수 있습니다.

작업 당시 확인한 지원 시작 버전은 Chrome 123, Safari 17.5, Firefox 120이었습니다. 적용할 환경은 [MDN의 브라우저 호환성 표](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark#browser_compatibility)에서 확인할 수 있습니다.

[다음에는 두 배지에 따로 적어 둔 24.dp 값을 정리했습니다.](/design-system/same-size-comment-binds-nothing.html)
