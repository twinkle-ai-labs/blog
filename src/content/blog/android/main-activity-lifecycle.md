---
title: "안드로이드를 만들며 8 — MainActivity의 생명주기 처리를 Compose로 옮기기"
date: 2026-08-24T03:40:00+09:00
tags: ["android","compose","lifecycle","구조","리팩토링"]
slug: "main-activity-lifecycle-compose"
lang: "ko"
author: "Heejeong Kim"
summary: "MainActivity에서 결제와 인앱 업데이트의 생명주기를 직접 처리하고 있었습니다. AppLifecycleManager로 관찰 코드를 옮겨 등록과 해제를 함께 두고, 콜백이 최신 게이트를 참조하도록 정리했습니다."
---

`MainActivity`가 결제와 인앱 업데이트의 생명주기를 직접 처리하고 있었습니다. SDK를 추가하거나 변경할 때마다 Activity의 콜백을 함께 확인해야 했습니다.

```kotlin
override fun onResume() {
    super.onResume()
    updateGate.onResume()
}

override fun onDestroy() {
    updateGate.onDestroy()
    if (::billing.isInitialized) billing.close()
    super.onDestroy()
}
```

동작은 했지만, 업데이트를 재개하는 코드와 자원을 닫는 코드가 떨어져 있었습니다. 결제 객체가 초기화됐는지 확인하는 방어 코드도 Activity에 있었습니다. UI를 Compose로 구성한 앱에서 이 책임을 한곳으로 모으기로 했습니다.

## 생명주기 관찰을 컴포저블로 옮겼습니다

`AppLifecycleManager`에서 현재 `LifecycleOwner`를 얻고, `DisposableEffect` 안에서 관찰자를 등록하도록 했습니다.

```kotlin
@Composable
fun AppLifecycleManager(
    updateGate: UpdateGate,
    billingGate: BillingGate
) {
    val lifecycleOwner = LocalLifecycleOwner.current
    val currentUpdateGate = rememberUpdatedState(updateGate)
    val currentBillingGate = rememberUpdatedState(billingGate)

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> {
                    currentUpdateGate.value.onResume()
                }
                Lifecycle.Event.ON_DESTROY -> {
                    currentUpdateGate.value.onDestroy()
                    currentBillingGate.value.close()
                }
                else -> {}
            }
        }

        lifecycleOwner.lifecycle.addObserver(observer)

        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }
}
```

생명주기의 `ON_RESUME`에서 업데이트 확인을 이어가고, `ON_DESTROY`에서 게이트를 정리합니다. 관찰자를 등록하는 `addObserver`와 제거하는 `onDispose`는 같은 블록 안에 있습니다.

이 코드에서 관찰자 해제와 게이트 정리는 서로 다른 동작입니다. `onDispose`는 관찰자를 제거하고, 게이트의 정리는 관찰 중 받은 `ON_DESTROY`에서 수행합니다. 여기서는 Activity에 나뉘어 있던 연결 코드를 한 컴포저블로 옮긴 범위까지 다룹니다.

[디자인 시스템 세우기 2](/design-system/same-size-comment-binds-nothing.html)에서 함께 바뀌어야 할 값을 한곳에 두었던 것처럼, 이번에는 등록과 해제 코드를 함께 읽을 수 있는 위치에 뒀습니다.

## 관찰자를 다시 만들지 않고 최신 값을 읽습니다

게이트는 `rememberUpdatedState`로 감쌌습니다.

```kotlin
val currentUpdateGate = rememberUpdatedState(updateGate)
```

`DisposableEffect`의 키는 `lifecycleOwner`입니다. 이 키가 같으면 `updateGate` 인스턴스가 바뀌어도 효과가 다시 실행되지 않습니다. 콜백이 `updateGate`를 직접 참조하면 처음 만들어졌을 때의 값을 계속 사용할 수 있습니다.

`rememberUpdatedState`를 사용하면 콜백은 `.value`에서 최신 게이트를 읽습니다. 게이트 값이 바뀌었다는 이유만으로 생명주기 관찰자를 제거하고 다시 등록할 필요가 없어집니다.

## MainActivity에는 호출을 남겼습니다

생명주기 연결을 옮긴 뒤 `MainActivity`의 `onResume`과 `onDestroy` 오버라이드를 제거했습니다. `setContent` 안에서는 다음처럼 호출합니다.

```kotlin
setContent {
    AppLifecycleManager(updateGate, billing)
    // …
}
```

Activity는 Compose 화면을 시작하고, 결제와 업데이트의 생명주기 연결은 `AppLifecycleManager`에서 확인할 수 있게 됐습니다. 두 게이트의 생명주기 연결을 바꿀 때 확인할 위치가 한곳으로 모였습니다.

## 구조를 정리한 네 작업

1편부터 4편까지는 화면과 입력에서 발견한 문제를 다뤘습니다. 비워 둔 글꼴 슬롯, 라이트에서 보이지 않던 꼭지, 사라진 문자열 줄바꿈, 반복되는 검증은 빌드만으로 확인할 수 없었습니다.

5편부터 8편에서는 다음 책임을 정리했습니다.

| | 흩어져 있던 것 | 모은 곳 |
|---|---|---|
| 5편 | 손으로 엮던 의존성 | Hilt · Navigation |
| 6편 | 저장소 둘 | `AppRepository`의 한 줄기 |
| 7편 | 콜백 열세 개 | `CalculatorAction` 한 입구 |
| 8편 | Activity에 흩어진 생명주기 | `AppLifecycleManager` 한 자리 |

각 작업에서 함께 확인해야 할 코드를 가까이 두려고 했습니다. [디자인 시스템 세우기](/category/design-system/)에서는 색과 치수를, 이 작업에서는 의존성과 상태, 이벤트를 정리했습니다.

도구의 성공 표시와 실제 결과가 달랐던 사례는 [조용히 실패하는 것들](/category/silent-failures/)에 따로 기록했습니다.
