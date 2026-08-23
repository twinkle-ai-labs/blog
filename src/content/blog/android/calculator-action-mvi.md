---
title: "안드로이드를 만들며 7 — 화면이 콜백 열세 개를 들고 있었어요 - MVI로 입구를 하나로"
date: 2026-08-24T03:00:00+09:00
tags: ["android","compose","mvi","구조","리팩토링"]
slug: "calculator-action-mvi"
lang: "ko"
author: "Heejeong Kim"
summary: "상태 끌어올리기를 하다 보니 화면 컴포저블의 시그니처가 끝없이 길어졌어요. 버튼 하나를 더할 때마다 화면·껍데기·ViewModel 세 곳을 고쳐야 했습니다. 사용자의 행동을 sealed interface 하나로 묶어 입구를 하나로 줄인 이야기예요."
---

지난 글에서는 **데이터를 한 줄기로 모은 이야기**를 했어요.
저장소가 Room과 DataStore 둘인데 화면은 하나의 `Flow`만 보게 만든 이야기였죠.

그렇게 아래로 내려오는 길을 정리하고 나니, 이번엔 **위로 올라가는 길**이 눈에 띄었습니다.
화면에서 로직 층으로 올라가는 그 길이요.

---

# 시그니처가 계속 길어지고 있었어요

Compose에서 상태 끌어올리기(State Hoisting)를 하다 보면
최상단 화면 컴포저블의 시그니처가 무한정 길어집니다.

`CalculatorScreen`이 정확히 그랬어요.
사용자가 계산기에서 할 수 있는 행동이 다양한데, 그걸 전부 개별 람다로 열어뒀거든요.

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

이게 왜 문제였냐면, **버튼 하나를 더할 때마다 고칠 자리가 셋**이었어요.

1. `CalculatorScreen`의 시그니처
2. 그걸 호출하는 껍데기
3. `ViewModel`의 함수와 그 매핑

한 줄 더하는 일이 세 파일을 여는 일이 되면, 사람은 그 일을 안 하게 됩니다.
이건 5편에서 `AppViewModel`에 한 줄 더하는 게 무서워졌던 것과 정확히 같은 병이었어요.

---

# 화면은 "무슨 함수를 부를지"를 알 필요가 없어요

여기서 한 가지를 다시 봤습니다.

`onSave`, `onReset`, `onKey`… 이 이름들은 전부 **"무엇을 실행하라"**는 말이에요.
그런데 화면이 정말 알아야 하는 건 그게 아니었습니다.

화면이 아는 것은 **"사용자가 방금 무엇을 했다"**뿐이에요.
그걸 받아서 무슨 함수를 태울지는 로직 층의 일이고요.

그래서 MVI(Model-View-Intent)의 아이디어를 빌려서,
사용자의 모든 행위를 `sealed interface` 하나로 묶었습니다.

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

이제 화면의 시그니처는 이렇게 됐어요.

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

ViewModel도 마찬가지로 `public` 메서드를 전부 닫고 입구를 하나만 열었습니다.

```kotlin
fun onAction(action: CalculatorAction) {
    when (action) {
        is CalculatorAction.ChangeMode -> _calc.update { … }
        is CalculatorAction.ChangeBuyInput -> _calc.update { … }
        // …
    }
}
```

`when`이 `sealed interface`를 받으니 **케이스를 빠뜨리면 컴파일이 안 됩니다.**
액션을 새로 더하면 컴파일러가 "여기도 처리해야 한다"고 알려줘요.
전에는 람다를 하나 더 열어두고 연결을 잊어도 아무 말이 없었거든요.

이게 4편의 결론과 같은 이야기입니다.
**사람의 기억에 맡기던 것을 컴파일러에게 넘긴 것.**

---

# `Save(val now: Long)` — 액션이 시각을 들고 옵니다

작은 부분인데 마음에 들어서 적어둘게요.

저장 액션은 `data object`가 아니라 `data class Save(val now: Long)`입니다.
저장 시각을 **화면이 넘겨줘요.**

ViewModel 안에서 `System.currentTimeMillis()`를 부르면 편하죠.
그런데 그 순간 그 함수는 시험할 수 없게 됩니다.
같은 입력을 줘도 결과가 매번 달라지니까요.

시각이 액션에 실려 들어오면 로직은 그냥 받은 값을 씁니다.
테스트에서는 원하는 시각을 넣으면 되고요.

**바깥 세상에서 오는 값은 인자로 받습니다.** 안에서 꺼내오지 않고요.

---

# 같이 한 것 — 껍데기에서 길 찾기를 떼어냈어요

같은 날 `AppShell.kt`도 손봤습니다. 600줄 가까이 가 있었거든요.

이 파일 안에 두 가지가 섞여 있었어요.

- **스캐폴드와 오버레이** — 바텀바, 시트, 확인창 같은 껍데기
- **라우팅** — 어느 화면이 어디로 가고, 어떤 애니메이션으로 가는가

둘은 같이 살 이유가 없었습니다.
라우팅을 `ui/navigation/AppNavigation.kt`로 옮겼어요.
`NavGraphBuilder`의 확장 함수 하나입니다.

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

지금은 `AppShell.kt` 486줄, `AppNavigation.kt` 171줄이에요.
합은 비슷한데, **"화면이 어떻게 이어지는가"를 보고 싶을 때 여는 파일이 하나**가 됐습니다.

5편에서 `ShellState`를 지우지 않고 역할만 줄였던 것과 같은 판단이었어요.
**쓸모없어서 걷는 게 아니라, 맡을 것만 맡기는 것.**

---

# 정리하면

- 화면 컴포저블의 콜백이 열 개를 넘어가면, 그건 인자가 많은 게 아니라
  **화면이 로직을 너무 많이 알고 있다는 신호**예요.
- 콜백 이름이 `on<할 일>`이면 화면이 실행할 함수를 아는 거고,
  `on<일어난 일>`이면 화면은 사실만 전달합니다. 후자여야 해요.
- `sealed interface` + `when`은 **연결을 잊는 실수를 컴파일 오류로 바꿉니다.**
- 바깥 세상의 값(시각, 난수)은 액션에 실어 받습니다. 안에서 꺼내면 시험할 수 없어요.

---

# 마치며

이번 글은 **화면 층**에서 책임을 덜어낸 이야기였어요.
그런데 같은 날, 그보다 더 오래 눌러앉아 있던 곳이 하나 더 있었습니다.

앱을 만들면 누구나 하나씩 갖고 있는, 온갖 SDK의 진입점이 되어버린 그 클래스요.

👉 [8 — MainActivity 다이어트 - 생명주기를 Compose 트리로 내렸어요](/android/main-activity-lifecycle-compose.html)
