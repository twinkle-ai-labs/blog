---
title: "안드로이드를 만들며 4 — 입력 검증 결과를 ValidInputs로 전달하기"
date: 2026-08-23T21:20:00+09:00
tags: ["android","kotlin","구조","타입"]
slug: "validate-once-type-carries-proof"
lang: "ko"
author: "Heejeong Kim"
summary: "단가 0이 오류 없이 계산에서 빠지고 목표 평단가 칸은 검증을 건너뛰었습니다. 검증 결과를 유효·미완성·오류로 나누고, 계산 함수가 ValidInputs만 받도록 바꿨습니다."
---

같은 날 입력 검증에서 두 버그를 발견했습니다. 단가에 `0`을 넣으면 오류도 결과도 표시되지 않았습니다. 목표 평단가 칸에 `0`을 넣을 때는 맞지 않는 오류 이유가 나왔습니다.

각각의 조건을 수정한 뒤에도 검증과 계산이 입력을 따로 판정하는 구조는 남았습니다. 두 판정이 왜 필요했는지부터 다시 살펴봤습니다.

## 검증과 계산이 0을 다르게 처리했습니다

단가를 판정하는 코드가 두 곳에 있었습니다.

```kotlin
// 검증하는 쪽
fun validatePrice(price: Double?): Error? =
    if (price != null && price < 0) Error.Negative else null

// 계산하는 쪽
val isValid = price != null && price > 0
```

검증은 `0`을 음수가 아니라고 통과시켰습니다. 계산은 `0`이 양수가 아니라는 이유로 실행하지 않았습니다. 이 조건 차이 때문에 화면에는 오류도 계산 결과도 나타나지 않았습니다.

## 네 번째 입력칸의 이름이 검증을 빠뜨리게 했습니다

검사 함수는 입력칸 넷을 받았고, 마지막 인자의 이름은 `BUY_QUANTITY`였습니다. 목표 평단가 모드에는 ‘살 수량’이 없으므로 이 자리에 `null`을 넘겼습니다.

하지만 그 모드의 네 번째 칸에는 목표 평단가가 있었습니다. 특정 모드의 의미로 붙인 이름 때문에 다른 모드에서 그 칸을 검증해야 한다는 점을 놓쳤습니다. 위치는 `FOURTH`, 해당 입력의 의미는 `InputKind`로 구분할 필요가 있었습니다.

## 조건만 맞춰도 중복 판정은 남았습니다

단가 조건을 맞추고 목표 평단가를 검증에 전달하니 두 증상은 해결됐습니다. 그러나 계산 함수는 여전히 nullable 숫자를 받으며 다시 유효성을 확인했습니다.

```kotlin
fun calculate(price: Double?, quantity: Double?, /* … */): Result? {
    val isValid = price != null && price > 0 && /* … */   // ← 또 셉니다
    if (!isValid) return null
    // …
}
```

`Double?`이라는 타입만으로는 호출 전에 검증했는지 알 수 없습니다. 계산 함수가 스스로 입력을 확인하려다 보니 검증 규칙이 다시 생겼습니다. 두 조건을 같은 값으로 고치는 것만으로는 중복을 없앨 수 없었습니다.

## 검증 결과와 계산 함수의 입력 타입을 바꿨습니다

검증 결과를 세 가지로 나누고, 계산 함수는 유효한 입력을 담는 `ValidInputs`만 받도록 했습니다.

```kotlin
sealed interface Validation {
    data class Valid(val inputs: ValidInputs) : Validation
    data object Incomplete : Validation
    data class Invalid(val kind: InputKind, val reason: Reason) : Validation
}

fun validateInputs(raw: RawInputs): Validation

// 계산 함수는 ValidInputs 만 받습니다
fun calculate(inputs: ValidInputs): Result
```

`validateInputs`가 판정한 결과를 계산과 오류 표시에 함께 사용합니다. 유효한 경우에는 `ValidInputs`를 계산 함수에 넘기고, 오류인 경우에는 `InputKind`와 `Reason`으로 문구를 만듭니다.

계산 함수에는 `RawInputs`나 `Double?`을 그대로 전달할 수 없습니다. 함수의 입력 타입을 바꿔 검증을 거친 값을 받는 경계를 드러냈습니다. 계산 쪽에서 같은 규칙을 다시 적던 코드는 제거했습니다.

이 타입 구분이 검증 규칙 자체의 정확성까지 확인해 주는 것은 아닙니다. 이번 변경은 판정을 한 함수에 모으고, 그 결과를 계산과 화면이 함께 사용하도록 한 것입니다.

## 미완성 입력과 오류를 구분했습니다

기존의 `null` 결과는 아직 입력을 마치지 않은 경우와 잘못된 값을 넣은 경우를 함께 표현했습니다. 화면은 둘을 구분할 정보가 없어 잘못된 이유를 표시하기도 했습니다.

`Incomplete`와 `Invalid`를 나눈 뒤에는 입력 중인 상태와 오류 상태를 따로 처리할 수 있었습니다. `null` 하나에 두 의미를 담지 않게 된 변화입니다.

## 입력 중 힌트에는 별도 검사를 남겼습니다

입력하는 동안 보여 주는 ‘≈ n주’ 힌트는 전체 검증 전에 계산됩니다. `0`처럼 아직 유효한 계산 입력이 아닌 값도 받아야 하므로 `ValidInputs`만 요구할 수 없었습니다.

이 힌트의 검사는 남기고 KDoc에 이유를 적었습니다. 계산 함수의 중복 검증을 제거한 것과 입력 중 힌트의 검사를 유지한 것은 서로 다른 선택입니다. 호출 시점이 다르다는 점을 코드 옆에 남겼습니다.

다음 날에는 의존성과 화면 전환을 정리하는 데 하루를 썼습니다. 그 작업은 이어지는 글에 기록했습니다.

[5 — Hilt·ViewModel·Navigation을 정리한 하루](/android/hilt-navigation-cleanup.html)
