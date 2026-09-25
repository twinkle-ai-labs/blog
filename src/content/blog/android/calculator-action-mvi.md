---
title: "안드로이드를 만들며 7 — 열세 개 콜백을 CalculatorAction으로 묶기"
date: 2026-08-24T03:00:00+09:00
tags: ["android","compose","mvi","구조","리팩토링"]
slug: "calculator-action-mvi"
lang: "ko"
author: "Heejeong Kim"
summary: "계산기 화면에 행동을 추가할 때마다 화면 함수, 호출부, ViewModel 연결을 함께 고쳐야 했습니다. 열세 개 콜백을 sealed interface 기반 액션으로 묶고 AppShell의 라우팅도 분리했습니다."
---

`CalculatorScreen`의 콜백이 열세 개까지 늘었습니다. 계산 모드 변경, 입력, 붙여넣기, 저장처럼 사용자가 할 수 있는 행동마다 별도 람다를 받고 있었습니다.

앞선 글에서는 Room과 DataStore의 데이터를 하나의 `Flow`로 전달하도록 정리했습니다. 이번에는 화면이 ViewModel에 행동을 전달하는 쪽을 정리했습니다.

## 행동 하나를 추가하면 세 곳을 고쳐야 했습니다

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

버튼의 행동을 추가할 때마다 `CalculatorScreen`의 인자, 이 화면을 호출하는 코드, ViewModel의 함수 연결을 함께 바꿨습니다. 상태를 끌어올려 화면 밖에서 처리하는 방향은 유지하되, 행동마다 전달 경로를 늘리는 방식을 바꾸고 싶었습니다.

## 사용자 행동을 하나의 타입으로 만들었습니다

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

화면은 발생한 행동과 그에 필요한 값을 전달합니다. 어떤 상태를 바꾸거나 함수를 실행할지는 ViewModel이 결정합니다. 콜백 인자는 `onAction` 하나로 줄었습니다.

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

`sealed interface`의 모든 경우를 `when`에서 처리하므로 액션을 추가하고 처리를 빠뜨리면 컴파일러가 알려 줍니다. 화면과 호출부에 새 콜백을 연결하는 일을 반복하는 대신, 액션의 종류와 처리 위치를 확인할 수 있게 됐습니다. 4편에서 검증 결과를 타입으로 표현한 것과 같은 방향입니다.

## 저장 시각은 액션으로 받습니다

저장 행동은 `data object` 대신 `data class Save(val now: Long)`로 만들었습니다. 화면이 저장 시각을 전달하면 ViewModel은 그 값을 사용합니다.

ViewModel 안에서 `System.currentTimeMillis()`를 호출하면 실행 시점에 따라 결과가 달라집니다. 시각을 인자로 받으면 테스트에서 같은 값을 넣어 같은 조건으로 확인할 수 있습니다. 이번 저장 액션에서는 시각을 구하는 일과 그 시각으로 기록을 만드는 일을 분리했습니다.

## AppShell의 라우팅도 분리했습니다

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

분리 후 `AppShell.kt`는 486줄, `AppNavigation.kt`는 171줄이 됐습니다. 전체 코드 양을 크게 줄인 작업은 아니었습니다. 대신 화면 연결을 바꿀 때는 `AppNavigation.kt`, 공통 시트나 바텀바를 바꿀 때는 `AppShell.kt`를 볼 수 있게 됐습니다.

5편에서 `ShellState`의 역할을 줄였던 것처럼, 이번에도 필요한 코드를 없애기보다 책임에 맞는 위치로 옮겼습니다. 다음 글에서는 같은 날 `MainActivity`에서 분리한 생명주기 처리를 다룹니다.

[8 — MainActivity의 생명주기 처리를 Compose로 옮기기](/android/main-activity-lifecycle-compose.html)
