---
title: "안드로이드를 만들며 4 — 입력 검증 결과를 ValidInputs로 전달하기"
date: 2026-08-23T21:20:00+09:00
tags: ["android","kotlin","구조","타입"]
slug: "validate-once-type-carries-proof"
lang: "ko"
author: "Heejeong Kim"
summary: "단가 0이 오류 없이 계산에서 빠지고 목표 평단가 칸은 검증을 건너뛰었습니다. 검증 결과를 유효·미완성·오류로 나누고, 계산 함수가 ValidInputs만 받도록 바꿨습니다."
---

## 들어가며

단가에 `0`을 넣었는데 오류도 계산 결과도 나오지 않았습니다. 같은 날 목표 평단가 칸에서도 문제를 찾았습니다. 여기에 `0`을 넣으면 잘못된 이유를 안내했습니다.

두 버그를 고치고 보니 계산 함수 안에도 비슷한 검사가 남아 있었습니다. 한쪽 조건만 고쳤다가 다시 어긋날 수 있는 구조였습니다.

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

## 검증에서 빠진 목표 평단가

검사 함수는 입력칸 넷을 받았고, 마지막 인자의 이름은 `BUY_QUANTITY`였습니다. 목표 평단가 모드에는 ‘살 수량’이 없으므로 이 자리에 `null`을 넘겼습니다.

하지만 그 모드의 네 번째 칸에는 목표 평단가가 있었습니다. 특정 모드의 의미로 붙인 이름 때문에 다른 모드에서 그 칸을 검증해야 한다는 점을 놓쳤습니다. 위치는 `FOURTH`, 해당 입력의 의미는 `InputKind`로 구분할 필요가 있었습니다.

## 계산 함수가 다시 검사하던 이유

단가 조건을 맞추고 목표 평단가를 검증에 전달하니 두 증상은 해결됐습니다. 그러나 계산 함수는 여전히 nullable 숫자를 받으며 다시 유효성을 확인했습니다.

```kotlin
fun calculate(price: Double?, quantity: Double?, /* … */): Result? {
    val isValid = price != null && price > 0 && /* … */   // ← 또 셉니다
    if (!isValid) return null
    // …
}
```

`Double?`이라는 타입만으로는 호출 전에 검증했는지 알 수 없습니다. 계산 함수가 스스로 입력을 확인하려다 보니 검증 규칙이 다시 생겼습니다. 두 조건을 같은 값으로 고치는 것만으로는 중복을 없앨 수 없었습니다.

## 판정 결과를 계산 함수에 전달하기

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

계산 쪽에서 같은 규칙을 다시 적던 코드는 제거했습니다. 이제 `RawInputs`나 `Double?`을 그대로 넘길 수 없고, `ValidInputs`를 전달해야 합니다. 검증 규칙을 고칠 곳은 `validateInputs`에 남았습니다.

## 미완성 입력과 오류를 구분했습니다

기존의 `null` 결과는 아직 입력을 마치지 않은 경우와 잘못된 값을 넣은 경우를 함께 표현했습니다. 화면은 둘을 구분할 정보가 없어 잘못된 이유를 표시하기도 했습니다.

입력이 덜 된 경우에는 `Incomplete`, 잘못 넣은 경우에는 `Invalid`를 받아 화면에서도 다르게 처리했습니다.

## 마치며

입력하는 동안 보여 주는 ‘≈ n주’ 힌트는 전체 검증 전에 계산됩니다. `0`처럼 아직 유효한 계산 입력이 아닌 값도 받아야 하므로 `ValidInputs`만 요구할 수 없었습니다.

그래서 힌트 쪽 검사는 남겼습니다. 나중에 중복이라고 지우지 않도록 KDoc에 호출 시점과 이유를 적었습니다.

[5 — Hilt·ViewModel·Navigation을 정리한 하루](/android/hilt-navigation-cleanup.html)
