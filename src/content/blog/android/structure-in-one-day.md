---
title: "안드로이드를 만들며 5 — Hilt·ViewModel·Navigation을 정리한 하루"
date: 2026-08-23T22:30:00+09:00
tags: ["android","compose","hilt","navigation","리팩토링"]
slug: "hilt-navigation-cleanup"
lang: "ko"
author: "Heejeong Kim"
summary: "테스트 트랙에 올린 앱의 의존성 주입과 화면 전환을 정리했습니다. Hilt를 도입하고 AppViewModel을 다섯 역할로 나눴으며, Navigation으로 기존 전환 연출을 옮겼습니다."
---

앱은 테스트 트랙에 올라가 있었고 기능도 동작했습니다. 하지만 처음 만들 때 직접 연결한 의존성과 화면 전환 코드가 그대로 남아 있었습니다. 기능을 추가할수록 `AppViewModel`과 앱 구성 코드를 함께 수정해야 했습니다.

2026-08-23에는 하루를 구조 정리에 썼습니다. 의존성 주입, ViewModel 분리, 화면 전환을 크게 세 작업으로 나누고 오래된 설정도 함께 걷어냈습니다.

## 직접 만들던 의존성을 Hilt로 옮겼습니다

처음에는 `AppRepository`와 `AppViewModel`을 직접 생성해 필요한 곳에 넘겼습니다. 의존성이 셋 정도일 때는 단순했지만, Room DB와 DataStore가 들어오고 화면이 늘면서 생성 순서와 전달 경로도 길어졌습니다.

`DatabaseModule`에서 Room DB와 DataStore를 싱글톤으로 제공하고, 나머지는 생성자 주입으로 바꿨습니다.

```kotlin
@HiltViewModel
class CalculatorViewModel @Inject constructor(
    private val repository: StockRepository,
) : ViewModel()
```

클래스가 무엇을 필요로 하는지 생성자에서 확인할 수 있게 됐습니다. 이전처럼 객체를 만드는 위치까지 찾아가 의존성을 확인할 필요가 줄었습니다.

## AppViewModel을 다섯 역할로 나눴습니다

`AppViewModel`은 계산, 이력, 설정, 종목 관리를 함께 맡고 있었습니다. 이를 다섯 ViewModel로 나눴습니다.

| ViewModel | 맡는 것 |
|---|---|
| `CalculatorViewModel` | 계산 |
| `HistoryViewModel` | 이력 |
| `SettingsViewModel` | 설정 |
| `StockViewModel` | 종목 관리 |
| `MainViewModel` | 앱 껍데기 |

화면의 개수보다 다루는 업무를 기준으로 나눴습니다. 화면이 합쳐지거나 나뉘더라도 계산과 이력 같은 책임을 별도로 관리하려는 선택이었습니다.

ViewModel 안에 있던 상태 `data class`도 `CalculatorState.kt`로 옮겼습니다. 다른 코드가 상태 타입을 쓰기 위해 특정 ViewModel을 참조하지 않도록 하기 위해서입니다.

## 화면 전환을 Navigation으로 옮겼습니다

기존에는 `ShellState`가 현재 화면과 뒤로 돌아갈 화면을 직접 관리했습니다. 이 부분을 Navigation으로 옮기고, `Routes.kt`에 직렬화 가능한 경로 타입을 뒀습니다.

```kotlin
@Serializable data object Calculator
@Serializable data class StockDetail(val stockId: Long)

navController.navigate(StockDetail(stockId = 3))
```

문자열을 조립하는 대신 객체를 경로로 전달하므로, 경로 인자의 타입을 컴파일할 때 확인할 수 있습니다.

### 기존 전환 연출은 유지했습니다

`AnimatedContent`로 만든 기존 연출은 화면마다 정한 깊이(depth)를 비교했습니다. 더 깊은 화면으로 갈 때는 왼쪽에서, 얕은 화면으로 갈 때는 오른쪽에서 들어오도록 했습니다.

`NavHost`에서도 출발 화면과 도착 화면의 깊이를 비교하도록 옮겼습니다.

```kotlin
enterTransition = {
    val from = initialState.toRoute<…>().depth
    val to = targetState.toRoute<…>().depth
    slideIn(direction = if (to > from) Left else Right)
}
```

`initialState`와 `targetState`에서 경로를 읽으면 이동 방향을 정할 수 있었습니다. 내비게이션을 바꾸면서도 기존 화면 전환 연출은 유지했습니다.

### ShellState에는 보조 UI 상태를 남겼습니다

다이얼로그, 오버레이, 필터는 화면 경로와 별개로 관리할 곳이 필요했습니다. 따라서 `ShellState`를 없애지 않고 내비게이션 상태만 `NavController`로 옮겼습니다. 남은 보조 UI 상태는 계속 `ShellState`가 맡습니다.

## 중복 설정과 오래된 분기도 정리했습니다

Compose로 구성된 앱에서 사용하지 않는 호환성 계층을 줄이기 위해 `AppCompatActivity`를 `ComponentActivity`로 바꿨습니다. Compose 테마와 역할이 겹치던 `AppCompatDelegate`, `UiModeManager`의 수동 테마 설정도 제거했습니다.

린트에서 확인한 항목도 함께 수정했습니다. `TypographyQuotes`가 지적한 프랑스어·이탈리아어의 일반 아포스트로피(`'`)는 스마트 아포스트로피(`’`)로 교체했습니다. `ObsoleteSdkInt`가 가리키던, 더 이상 도달하지 않는 SDK 버전 분기도 정리했습니다.

`targetSdk`는 37로 올렸습니다. 대상 SDK를 올리면 동작이 달라지는 부분이 있으므로, 출시 직전에 묶어 처리하기보다 구조를 정리하는 날 함께 확인했습니다.

## 분리한 뒤에도 남은 작업이 있었습니다

이날의 목적은 다음 기능을 붙일 때 확인할 범위를 줄이는 것이었습니다. 의존성은 Hilt, 화면 전환은 Navigation에 맡기고 ViewModel은 역할별로 나눴습니다.

분리만으로 검증이 끝난 것은 아니었습니다. ViewModel의 비즈니스 로직에 단위 테스트를 붙이는 일은 남아 있었습니다. 딥링크는 필요할 때 추가하기로 했고, 런처 아이콘이 영역을 가득 채운다는 `IconLauncherShape` 경고도 디자인 작업으로 남겼습니다.

다음 날에는 구조 사이로 데이터와 이벤트가 어떻게 전달되는지 살펴봤습니다. 이어지는 세 편은 데이터, 이벤트, 생명주기 순서입니다.

[6 — Room과 DataStore를 AppRepository로 묶기](/android/app-repository-ssot.html)
