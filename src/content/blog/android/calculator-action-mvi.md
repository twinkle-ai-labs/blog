---
title: "안드로이드를 만들며 7 — 열세 개 콜백을 CalculatorAction으로 묶기"
date: 2026-08-24T03:00:00+09:00
tags: ["android","compose","mvi","구조","리팩토링"]
slug: "calculator-action-mvi"
lang: "ko"
author: "Heejeong Kim"
summary: "계산기 화면에 행동을 추가할 때마다 화면 함수, 호출부, ViewModel 연결을 함께 고쳐야 했습니다. 열세 개 콜백을 sealed interface 기반 액션으로 묶고 AppShell의 라우팅도 분리했습니다."
---

## 들어가며

`CalculatorScreen`에 버튼 동작을 하나 추가할 때마다 화면 함수의 인자, 호출부, ViewModel 연결을 함께 고쳤습니다. 모드 변경, 입력, 붙여넣기, 저장을 각각 람다로 받다 보니 콜백이 열세 개까지 늘었습니다.

## 화면 함수에 늘어선 콜백

기존 화면 함수는 다음과 같았습니다.

```kotlin
@Composable
fun CalculatorScreen(
    state: CalcState,
    onMode: (CalcKind) -> Unit,
    onBuyInput: (BuyInput) -> Unit,
    onFocus: (Slot) -> Unit,
    onPaste: (Slot, String) -> Unit,
    onKey: (KeypadKey) -> Unit,
    onCloseKeypad: () -> Unit,
    onPickStock: () -> Unit,
    onSave: (Long) -> Unit,
    onReset: () -> Unit,
    // … 열세 개까지 갔습니다
)
```

화면 밖에서 상태를 처리하는 방식은 유지하고 싶었습니다. 불편한 건 행동 하나를 추가할 때마다 위 목록과 호출부를 함께 늘리는 일이었습니다.

## CalculatorAction과 onAction

MVI(Model-View-Intent)의 아이디어를 가져와 계산기에서 발생하는 행동을 `CalculatorAction`에 모았습니다.

```kotlin
/**
 * 계산기 화면에서 발생하는 모든 사용자 행동을 하나로 묶는다.
 */
sealed interface CalculatorAction {
    data class ChangeMode(val mode: CalcKind) : CalculatorAction
    data class ChangeBuyInput(val input: BuyInput) : CalculatorAction
    data class Focus(val slot: Slot) : CalculatorAction
    data class Paste(val slot: Slot, val text: String) : CalculatorAction
    data class KeyPressed(val key: KeypadKey) : CalculatorAction
    data object CloseKeypad : CalculatorAction
    data object PickStock : CalculatorAction
    data class Save(val now: Long) : CalculatorAction
    data object Reset : CalculatorAction
}
```

화면에서는 행동과 필요한 값을 `onAction`으로 넘깁니다. 처리는 ViewModel에서 합니다.

```kotlin
@Composable
fun CalculatorScreen(
    state: CalcState,
    result: CalcResult,
    errors: Map<Slot, InputError>,
    stocks: List<Stock>,
    onAction: (CalculatorAction) -> Unit,   // 열세 개가 하나로
    modifier: Modifier = Modifier,
)
```

ViewModel에서 공개하던 행동 처리 함수도 하나의 진입점으로 모았습니다.

```kotlin
fun onAction(action: CalculatorAction) {
    when (action) {
        is CalculatorAction.ChangeMode -> _calc.update { … }
        is CalculatorAction.ChangeBuyInput -> _calc.update { … }
        // …
    }
}
```

`sealed interface`의 모든 경우를 `when`에서 처리하므로 액션을 추가하고 처리를 빠뜨리면 컴파일러가 알려 줍니다. 새로운 행동에도 처리 코드는 필요하지만, 화면 함수와 호출부에 콜백 인자를 하나씩 더 연결하는 일은 없어졌습니다.

## Save에 시각을 담은 이유

저장 행동은 `data object` 대신 `data class Save(val now: Long)`로 만들었습니다. 화면이 저장 시각을 전달하면 ViewModel은 그 값을 사용합니다.

ViewModel 안에서 `System.currentTimeMillis()`를 부르면 테스트할 때마다 저장 시각이 달라집니다. 밖에서 받게 해 두면 테스트에서는 정해 둔 시각을 넣을 수 있습니다.

## 연결 코드를 찾을 파일도 나눴습니다

같은 날 600줄 가까이 된 `AppShell.kt`도 정리했습니다. 이 파일에는 바텀바·시트·확인창을 구성하는 코드와 화면 경로·전환 애니메이션을 정하는 코드가 함께 있었습니다.

라우팅은 `ui/navigation/AppNavigation.kt`로 옮기고 `NavGraphBuilder`의 확장 함수로 만들었습니다.

```kotlin
internal fun NavGraphBuilder.appGraph(
    data: AppData,
    calcViewModel: CalculatorViewModel,
    shell: ShellState,
    navController: NavController,
    activity: Activity?,
    // …
)
```

## 마치며

계산기 화면의 열세 개 콜백은 `CalculatorAction`을 받는 진입점 하나로 모았습니다. 저장 시각처럼 행동에 필요한 값은 액션에 담고, 화면 밖에서 처리하는 구조는 유지했습니다.

분리 후 `AppShell.kt`는 486줄, `AppNavigation.kt`는 171줄이 됐습니다. 코드 양이 크게 줄지는 않았습니다. 그래도 화면 연결을 고칠 때는 `AppNavigation.kt`를 열면 됐고, 공통 시트와 바텀바는 `AppShell.kt`에 남았습니다.

[8 — MainActivity의 생명주기 처리를 Compose로 옮기기](/android/main-activity-lifecycle-compose.html)
