---
title: "안드로이드를 만들며 1 — 비워 둔 Typography 슬롯에 들어간 기본 글꼴"
date: 2026-08-22T20:10:00+09:00
tags: ["android","compose","design-system","typography"]
slug: "material3-typography-slots"
lang: "ko"
author: "Heejeong Kim"
summary: "Material3의 Typography 슬롯 열다섯 중 넷을 정의하지 않았더니 화면 일부에 기본 글꼴이 적용됐습니다. 모든 슬롯을 Pretendard로 채우고, 슬롯 수와 디자인의 글자 크기 단계를 구분했습니다."
---

물타기 계산기는 Pretendard를 사용합니다. 그런데 결과 카드의 3열 대시보드와 키패드의 판독값, 숫자 키가 다른 글꼴로 표시되고 있었습니다. 같은 화면에서도 제목과 숫자의 모양이 달랐습니다.

목업의 토큰 페이지에는 다음 네 슬롯을 쓰지 않는다고 적어 뒀습니다.

> 안 서는 칸이 넷 — `displaySmall` · `headlineSmall` · `bodySmall` · `titleSmall`

실제 화면은 이 슬롯들을 사용하고 있었습니다. 정의하지 않은 슬롯에 어떤 값이 들어가는지 확인하지 않은 것이 원인이었습니다.

## 생략한 슬롯에는 Material의 기본값이 들어갑니다

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

코드에서는 네 슬롯을 지웠다고 생각했지만, 실제로는 그 네 자리의 값을 프레임워크에 맡긴 상태였습니다.

## 숫자를 표시하는 자리에서 차이가 보였습니다

Roboto와 Pretendard는 모두 산세리프입니다. Roboto에 없는 한글은 시스템 한글 글꼴로 대체되므로, 한글만 보면서 글꼴 차이를 알아채기 어려웠습니다. 숫자와 라틴 문자를 표시하는 대시보드와 키패드에서 차이가 드러났습니다.

문서의 ‘쓰지 않는 슬롯’이라는 설명도 그대로 믿고 있었습니다. 호출하는 화면과 대조했다면 사용 여부가 다른 것을 확인할 수 있었지만, 문서에 적은 뒤 다시 확인하지 않았습니다.

## 모든 슬롯을 정의하되 크기를 새로 늘리지는 않았습니다

누락한 슬롯에도 Pretendard를 지정했습니다. 이후 어느 화면에서 그 슬롯을 사용하더라도 기본 글꼴이 섞이지 않도록 하기 위해서입니다.

슬롯이 열다섯이라고 글자 크기도 열다섯 종류를 만들 필요는 없습니다. 디자인에서 정한 크기는 열 단계였습니다.

```
11 · 12 · 14 · 16 · 20 · 24 · 28 · 32 · 36 · 40
```

여러 슬롯에 같은 크기를 지정할 수 있습니다. 키패드의 숫자 키와 이력의 결과 숫자는 모두 24를 사용하고 굵기로 구분합니다. 프레임워크의 슬롯 이름과 디자인의 크기 단계를 1:1로 늘리는 대신, 기존 크기를 각 슬롯에 배정했습니다.

## 처음 여덟 편에 기록한 범위

이 문제를 시작으로 첫 앱에서 겪은 일을 여덟 편에 나눠 적었습니다. 앞의 네 편은 빌드와 린트만으로 드러나지 않았던 화면·문자열·검증 문제입니다.

1. 정의하지 않은 Typography 슬롯의 기본 글꼴
2. 라이트에서 보이지 않던 삼각형 꼭지
3. 공백으로 바뀐 문자열 줄바꿈
4. 검증과 계산에서 서로 달랐던 입력 판정

뒤의 네 편에서는 그 과정에서 정리한 구조를 다룹니다.

5. Hilt와 Navigation 도입, ViewModel 분리
6. `AppRepository`로 Room과 DataStore의 데이터 전달 통합
7. `CalculatorAction`으로 사용자 행동 전달 통합
8. `MainActivity`의 생명주기 처리 분리

첫 문제는 기본값이 있는 API에서 인자를 생략했을 때 실제 화면이 무엇을 사용하는지 확인하면서 해결했습니다. 이어지는 글은 같은 디자인 작업 중 라이트에서 보이지 않던 삼각형 꼭지에 관한 기록입니다.

[2 — 라이트 모드에서 사라진 삼각형 꼭지](/android/compose-arrow-elevation.html)
