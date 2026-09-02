---
title: "안드로이드를 만들며 8 — MainActivity 다이어트 - 생명주기를 Compose 트리로 내렸어요"
date: 2026-08-24T03:40:00+09:00
tags: ["android","compose","lifecycle","구조","리팩토링"]
slug: "main-activity-lifecycle-compose"
lang: "ko"
author: "Heejeong Kim"
summary: "결제와 인앱 업데이트가 Activity의 생명주기를 요구해서 MainActivity가 온갖 SDK의 진입점이 돼 있었어요. onResume·onDestroy 오버라이드를 걷어내고 그 책임을 컴포저블 하나로 내린 이야기입니다."
---

지난 글에서는 이벤트를 한 입구로 모은 이야기를 했어요.
콜백 열세 개를 `CalculatorAction` 하나로 묶어서, 화면이 사실만 전달하게 만든 이야기였죠.

이 시리즈의 마지막인 이번 글은 생명주기입니다.
그리고 이건 앱을 만들어보신 분이면 다들 하나씩 갖고 계실 거예요.
어느새 온갖 SDK의 진입점이 되어버린 그 클래스요.

# `MainActivity`가 만능 객체가 돼 있었어요

앱을 만들다 보면 자연스럽게 `MainActivity`가 여러 매니저와 SDK의 진입점이 됩니다.
결제(Billing), 인앱 업데이트(In-app Update), 전면 광고 같은 것들이
전부 Activity의 `Context`와 생명주기를 강하게 요구하거든요.

그래서 코드가 이렇게 생겨 있었습니다.

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

동작은 잘 했어요. 그런데 두 가지가 걸렸습니다.

하나. UI 전체를 Compose로 덮은 선언적 환경에서
Activity가 구체적인 생명주기를 직접 관리하고 있는 건 명령형 시절의 잔재예요.

둘. 이게 더 실질적인 문제였는데,
`if (::billing.isInitialized)` 같은 방어 코드가 왜 필요했느냐면
Activity가 언제 무엇을 들고 있는지 자기도 확신할 수 없었기 때문입니다.

5편에서 봤던 것과 같은 냄새였어요. 여기에 SDK를 하나 더 붙일 생각을 하면
`onResume`과 `onDestroy` 양쪽을 다 열어서 짝을 맞춰야 하는 거죠.
그리고 짝은 언젠가 어긋납니다. 하나만 적고 다른 하나를 잊는 식으로요.

# Compose에는 자기만의 생명주기 장치가 있어요

Compose는 View 시스템과 독립적인 메커니즘을 줍니다.
`DisposableEffect`와 `LifecycleEventObserver`요.

이걸 쓰면 Activity가 지고 있던 책임을 UI 트리 안으로 내릴 수 있습니다.

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

핵심은 `onDispose`가 `addObserver` 바로 옆에 있다는 것이에요.

붙이는 코드와 떼는 코드가 한 함수 안에 나란히 있으면 짝을 잊기가 어렵습니다.
Activity 콜백에 나눠 적으면 두 함수가 수십 줄 떨어져 있고,
그 사이에 다른 것들이 끼어들면서 짝이 흐려져요.

이건 [디자인 시스템 세우기 2](/design-system/same-size-comment-binds-nothing.html)와 같은 이야기입니다.
거기서는 "같아야 하는 값을 한 곳에 두고 가리킨다"였고,
여기서는 "짝지어야 하는 동작을 한 곳에 둔다"인 거죠.

# `rememberUpdatedState`가 여기 있는 이유

이 줄이 왜 필요한지가 처음엔 안 보였어요.

```kotlin
val currentUpdateGate = rememberUpdatedState(updateGate)
```

`DisposableEffect`의 키가 `lifecycleOwner` 하나입니다.
그러니 `updateGate`가 새 인스턴스로 바뀌어도 이 블록은 다시 안 돕니다.
그리고 안에 만들어둔 `observer` 람다는 처음 조합 때의 `updateGate`를 붙잡고 있어요.

그러면 나중에 앱이 죽을 때 옛 게이트를 닫게 됩니다.
진짜 열려 있는 건 새 게이트인데요.

`rememberUpdatedState`는 그 사이를 이어줍니다.
람다는 항상 `.value`로 가장 최근 것을 읽고,
그렇다고 옵저버를 다시 붙이지도 않아요.

여기가 재밌었어요. `DisposableEffect`의 키를 `updateGate`로 바꾸면
매번 다시 붙었다 떼었다 하게 되고, 그건 그것대로 낭비거든요.

> 다시 구독할 이유가 없는데 최신 값은 필요할 때 — 그 자리에 `rememberUpdatedState`가 섭니다.

# 그래서 `MainActivity`에 남은 것

`onResume`도 `onDestroy`도 통째로 사라졌습니다.
`setContent { }` 안에 한 줄만 남았어요.

```kotlin
setContent {
    AppLifecycleManager(updateGate, billing)
    // …
}
```

`MainActivity`는 이름 그대로 화면을 띄우는 최초의 도화지로 돌아갔습니다.

그리고 결제와 업데이트는 이제 자기 생명주기를 스스로 구독하고 해제해요.
누가 대신 챙겨주는 게 아니라요.

## 작업을 끝내고 보니

- Compose로 덮은 앱에서 Activity가 생명주기를 직접 관리하고 있으면,
  그건 대개 아직 안 옮긴 것이지 필요해서 남은 게 아니에요.
- `DisposableEffect`의 값어치는 붙이는 코드와 떼는 코드가 붙어 있다는 것입니다.
- 다시 구독할 이유는 없는데 최신 값이 필요하면 `rememberUpdatedState`를 씁니다.
  `DisposableEffect`의 키에 넣어버리면 매번 다시 붙어요.

## 고치고 나서 적어 둔 것

이 시리즈를 한 줄로 줄이면 이렇습니다.

> 빌드가 통과했다는 것은 아무것도 보증하지 않는다.

1편에서 4편까지는 그걸 화면과 문장에서 봤어요.
슬롯을 비웠더니 남의 글꼴이 들어왔고, elevation을 올렸는데 삼각형은 안 보였고,
두 줄로 적은 문자열은 한 줄로 접혔고, 검증을 통과한 값이 다시 검증됐죠.
전부 컴파일러가 아무 말도 안 한 것들이었습니다.

5편에서 8편까지는 구조였는데, 돌아보면 넷 다 같은 동작이었어요.

| | 흩어져 있던 것 | 모은 곳 |
|---|---|---|
| 5편 | 손으로 엮던 의존성 | Hilt · Navigation |
| 6편 | 저장소 둘 | `AppRepository`의 한 줄기 |
| 7편 | 콜백 열세 개 | `CalculatorAction` 한 입구 |
| 8편 | Activity에 흩어진 생명주기 | `AppLifecycleManager` 한 자리 |

하나였던 것은 어긋날 수가 없습니다.
그리고 어긋날 수 없게 만드는 일이, 결국 매번 같은 답이었어요.

이건 [디자인 시스템 세우기](/category/design-system/) 시리즈의 결론과도 정확히 같습니다.
거기서는 색과 치수였고 여기서는 의존성과 상태였을 뿐이에요.

도구가 조용히 실패하는 이야기가 더 궁금하시면
[조용히 실패하는 것들](/category/silent-failures/) 시리즈로 이어집니다.
