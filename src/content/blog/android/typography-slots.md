---
title: "안드로이드를 만들며 1 — 비워 둔 Typography 슬롯에 들어간 기본 글꼴"
date: 2026-08-22T20:10:00+09:00
tags: ["android","compose","design-system","typography"]
slug: "material3-typography-slots"
lang: "ko"
author: "Heejeong Kim"
summary: "Material3의 Typography 슬롯 열다섯 중 넷을 정의하지 않았더니 화면 일부에 기본 글꼴이 적용됐습니다. 모든 슬롯을 Pretendard로 채우고, 슬롯 수와 디자인의 글자 크기 단계를 구분했습니다."
---

## 들어가며

물타기 계산기의 제목은 Pretendard인데, 같은 화면의 숫자는 다른 글꼴로 보였습니다. 결과 카드의 3열 대시보드와 키패드 판독값, 숫자 키에서 차이가 났습니다.

글꼴 설정을 보니 `displaySmall`, `headlineSmall`, `bodySmall`, `titleSmall` 네 슬롯을 생략한 상태였습니다. 목업 문서에는 쓰지 않는 슬롯이라고 적어 뒀지만, 실제 화면에서는 네 슬롯을 모두 사용하고 있었습니다.

## 생략한 네 슬롯의 기본값

Material3의 `Typography`에는 열다섯 슬롯이 있습니다. 당시에는 열하나만 정의하고 넷은 생략했습니다.

```kotlin
// 이렇게 적으면 "넷은 없다"가 아닙니다
val TwinkleTypography = Typography(
    displayLarge = TextStyle(fontFamily = Pretendard, /* … */),
    displayMedium = TextStyle(fontFamily = Pretendard, /* … */),
    // displaySmall — 안 쓰니까 뺐습니다
    headlineLarge = TextStyle(fontFamily = Pretendard, /* … */),
    headlineMedium = TextStyle(fontFamily = Pretendard, /* … */),
    // headlineSmall — 안 쓰니까 뺐습니다
    // …
)
```

`Typography()`의 매개변수는 기본 `TextStyle`을 가집니다. 인자를 넘기지 않으면 슬롯이 없어지는 대신 Material의 기본값을 사용합니다. 그 결과 생략한 슬롯에는 Pretendard 대신 기본 글꼴인 Roboto가 적용됐습니다.

```kotlin
displaySmall = /* Material 이 알아서 채웁니다 — Roboto 로 */
```

## 한글보다 숫자에서 드러난 차이

Roboto와 Pretendard는 모두 산세리프입니다. Roboto에 없는 한글은 시스템 한글 글꼴로 대체되므로, 한글만 보면서 글꼴 차이를 알아채기 어려웠습니다. 숫자와 라틴 문자를 표시하는 대시보드와 키패드에서 차이가 드러났습니다.

## 글꼴은 열다섯 슬롯에, 크기는 기존 열 단계로

네 슬롯에도 Pretendard를 지정했습니다. 쓰지 않는다고 적어 둔 문서보다 실제 화면 호출부를 먼저 확인했어야 했습니다.

슬롯이 열다섯이라고 글자 크기도 열다섯 종류를 만들 필요는 없습니다. 디자인에서 정한 크기는 열 단계였습니다.

```
11 · 12 · 14 · 16 · 20 · 24 · 28 · 32 · 36 · 40
```

키패드의 숫자 키와 이력의 결과 숫자는 모두 24를 쓰고 굵기로 구분합니다. 이런 식으로 여러 슬롯에 같은 크기를 배정해, 크기는 기존 열 단계를 유지했습니다.

## 마치며

비워 둔 네 슬롯을 채워 화면에서 쓰는 글꼴을 맞췄습니다. 열다섯 슬롯마다 새로운 크기를 만들지는 않았습니다. 글꼴을 빠짐없이 지정하는 일과 디자인의 크기 단계를 정하는 일을 나눠 처리했습니다.

[2 — 라이트 모드에서 사라진 삼각형 꼭지](/android/compose-arrow-elevation.html)
