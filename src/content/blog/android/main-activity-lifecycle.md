---
title: "안드로이드를 만들며 8 — MainActivity의 생명주기 처리를 Compose로 옮기기"
date: 2026-08-24T03:40:00+09:00
tags: ["android","compose","lifecycle","구조","리팩토링"]
slug: "main-activity-lifecycle-compose"
lang: "ko"
author: "Heejeong Kim"
summary: "MainActivity에서 결제와 인앱 업데이트의 생명주기를 직접 처리하고 있었습니다. AppLifecycleManager로 관찰 코드를 옮겨 등록과 해제를 함께 두고, 콜백이 최신 게이트를 참조하도록 정리했습니다."
---

## 들어가며

결제와 인앱 업데이트를 붙이면서 `MainActivity`에 생명주기 처리가 쌓였습니다. 업데이트 재개는 `onResume`, 업데이트와 결제 자원 정리는 `onDestroy`에 있었습니다.

## Activity에 나뉘어 있던 생명주기 처리

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

결제나 업데이트 연결을 손볼 때마다 두 콜백을 오가야 했습니다. 화면은 Compose로 구성하고 있었으니, 이 연결도 별도 컴포저블로 옮겨 보기로 했습니다.

## AppLifecycleManager에 모은 생명주기 연결

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

`ON_RESUME`에서는 업데이트 확인을 이어가고, `ON_DESTROY`에서는 게이트를 정리합니다. 관찰자를 등록하고 해제하는 코드도 같은 블록에서 읽을 수 있습니다.

다만 `onDispose`가 게이트까지 닫는 것은 아닙니다. 여기서는 관찰자만 제거합니다. 게이트 정리는 관찰 중 받은 `ON_DESTROY`에 달려 있으므로, 두 동작을 같은 것으로 읽으면 안 됩니다.

## 콜백이 처음의 게이트를 계속 참조하지 않도록

게이트는 `rememberUpdatedState`로 감쌌습니다.

```kotlin
val currentUpdateGate = rememberUpdatedState(updateGate)
```

`DisposableEffect`의 키는 `lifecycleOwner`입니다. 이 키가 같으면 `updateGate` 인스턴스가 바뀌어도 효과가 다시 실행되지 않습니다. 콜백이 `updateGate`를 직접 참조하면 처음 만들어졌을 때의 값을 계속 사용할 수 있습니다.

`rememberUpdatedState`를 사용하면 콜백은 `.value`에서 최신 게이트를 읽습니다. 게이트 값이 바뀌었다는 이유만으로 생명주기 관찰자를 제거하고 다시 등록할 필요가 없어집니다.

## 마치며

생명주기 연결을 옮긴 뒤 `MainActivity`의 `onResume`과 `onDestroy` 오버라이드를 제거했습니다. `setContent` 안에서는 다음처럼 호출합니다.

```kotlin
setContent {
    AppLifecycleManager(updateGate, billing)
    // …
}
```

이제 결제와 업데이트의 생명주기 연결은 `AppLifecycleManager`에서 고칩니다.
