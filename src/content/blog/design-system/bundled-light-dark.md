---
title: "디자인 시스템 세우기 5 — color-scheme을 바꿔도 배경이 그대로였다"
date: 2026-10-22T00:00:00+09:00
tags: ["css","design-system","다크모드"]
slug: "bundled-light-dark"
lang: "ko"
author: "Heejeong Kim"
summary: "테마 선택을 바꿔도 스크롤바만 반응했습니다. 빌드된 CSS에서 light-dark()가 변수로 변환된 것을 확인하고 테마 변경을 data-theme 속성으로 통일했습니다."
---

## 들어가며

이모티콘 작업 조회 화면에서 밝은 테마를 골랐는데 배경은 어두운 채였습니다. 스크롤바와 폼은 바뀌었습니다. 2026년 9월 4일의 문제였습니다.

## 소스와 달랐던 빌드 결과

테마를 고르면 루트 요소의 `style.colorScheme`을 바꾸고 있었습니다. 색상 토큰은 [앞서 정리한 방식](/design-system/light-dark-one-copy.html)대로 `light-dark()`에 밝은 색과 어두운 색을 함께 적었습니다. 소스만 보면 연결이 맞아 보였습니다.

빌드 결과를 열었더니 `light-dark()`가 하나도 없었습니다. 이 프로젝트의 Vite 8 빌드에서 Lightning CSS가 함수를 변환했습니다. 배경 토큰은 이런 모양이었습니다.

```css
--bg: var(--lightningcss-light, #f8f8f8)
      var(--lightningcss-dark, #100d18);
```

브라우저는 이 변수들로 색을 골랐습니다. 출력된 CSS에서 변수를 바꾸는 조건은 시스템 테마 미디어 쿼리와 `:root[data-theme=…]` 선택자였습니다. 자바스크립트가 `color-scheme`만 바꿔도 그 선택자가 새로 적용되지는 않았습니다.

[Lightning CSS 문서](https://lightningcss.dev/transpilation.html)는 대상 브라우저가 `light-dark()`를 지원하지 않을 때 CSS 변수 폴백으로 변환한다고 설명합니다. 모든 빌드가 이렇게 되는 것은 아닙니다. 이번 출력에서는 변환이 일어났고, 그 출력이 따르는 조건에 맞춰 테마를 바꿔야 했습니다.

## data-theme으로 테마 선택 전달하기

기존 토큰 파일은 이미 `data-theme`를 쓰고 있었습니다. 조회 화면도 그 속성을 바꾸도록 맞췄습니다. 핵심 동작만 남기면 다음과 같습니다.

```ts
if (next === 'system') {
  delete document.documentElement.dataset.theme
} else {
  document.documentElement.dataset.theme = next
}
```

밝게 또는 어둡게 고르면 속성을 지정하고, 시스템 설정을 따를 때는 지웁니다. 시스템 모드를 현재의 밝고 어두움 중 하나로 바꿔 저장하면 이후 운영체제의 테마 변경을 따라가지 못합니다.

## 마치며

`color-scheme`은 CSS에서 맡게 했습니다. 저장된 선택도 첫 화면이 그려지기 전에 속성으로 반영했습니다. 소스의 색상 토큰을 다시 두 벌로 나눌 필요는 없었습니다. 고친 곳은 테마 선택을 CSS에 전달하는 부분이었습니다.

<!-- 근거: vault/TIL/2026-09-04-A bundler lowers light-dark so color-scheme alone cannot switch it.md; Emoticon Studio theme.ts -->
