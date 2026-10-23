---
title: "안드로이드를 만들며 5 — Hilt·ViewModel·Navigation을 정리한 하루"
date: 2026-08-23T22:30:00+09:00
tags: ["android","compose","hilt","navigation","리팩토링"]
slug: "hilt-navigation-cleanup"
lang: "ko"
author: "Heejeong Kim"
summary: "테스트 트랙에 올린 앱의 의존성 주입과 화면 전환을 정리했습니다. Hilt를 도입하고 AppViewModel을 다섯 역할로 나눴으며, Navigation으로 기존 전환 연출을 옮겼습니다."
---

## 들어가며

앱을 테스트 트랙에 올린 뒤에도 기능을 하나 추가하려면 `AppViewModel`과 앱 구성 코드를 함께 열어야 했습니다. 계산과 이력, 설정이 한 ViewModel에 있었고, 필요한 객체를 만드는 일과 화면을 연결하는 일도 직접 관리하고 있었습니다.

2026-08-23에는 이 연결을 정리하는 데 하루를 썼습니다. 객체 생성은 Hilt에, 화면 경로는 Navigation에 맡기고 ViewModel은 업무별로 나눴습니다.

## 객체 생성과 전달을 Hilt에 맡기기

처음에는 `AppRepository`와 `AppViewModel`을 직접 생성해 필요한 곳에 넘겼습니다. 의존성이 셋 정도일 때는 단순했지만, Room DB와 DataStore가 들어오고 화면이 늘면서 생성 순서와 전달 경로도 길어졌습니다.

`DatabaseModule`에서 Room DB와 DataStore를 싱글톤으로 제공하고, 나머지는 생성자 주입으로 바꿨습니다.

```kotlin
@HiltViewModel
class CalculatorViewModel @Inject constructor(
    private val repository: StockRepository,
) : ViewModel()
```

클래스가 무엇을 필요로 하는지 생성자에서 확인할 수 있게 됐습니다. 이전처럼 객체를 만드는 위치까지 찾아가 의존성을 확인할 필요가 줄었습니다.

## 계산·이력·설정·종목·앱 구성으로 나눈 ViewModel

`AppViewModel`은 계산, 이력, 설정, 종목 관리를 함께 맡고 있었습니다. 이를 다섯 ViewModel로 나눴습니다.

| ViewModel | 맡는 것 |
|---|---|
| `CalculatorViewModel` | 계산 |
| `HistoryViewModel` | 이력 |
| `SettingsViewModel` | 설정 |
| `StockViewModel` | 종목 관리 |
| `MainViewModel` | 앱 공통 상태 |

화면마다 하나씩 만들지는 않았습니다. 계산과 이력처럼 다루는 일을 기준으로 나눴습니다.

ViewModel 안에 있던 상태 `data class`도 `CalculatorState.kt`로 옮겼습니다. 다른 코드가 상태 타입을 쓰기 위해 특정 ViewModel을 참조하지 않도록 하기 위해서입니다.

## 화면 경로와 보조 UI 상태 분리

기존에는 `ShellState`가 현재 화면과 뒤로 돌아갈 화면을 직접 관리했습니다. 이 부분을 Navigation으로 옮기고, `Routes.kt`에 직렬화 가능한 경로 타입을 뒀습니다.

```kotlin
@Serializable data object Calculator
@Serializable data class StockDetail(val stockId: Long)

navController.navigate(StockDetail(stockId = 3))
```

문자열을 조립하는 대신 객체를 경로로 전달하므로, 경로 인자의 타입을 컴파일할 때 확인할 수 있습니다.

### 화면 깊이에 따른 전환 방향

`AnimatedContent`로 만든 기존 연출은 화면마다 정한 깊이(depth)를 비교했습니다. 더 깊은 화면으로 갈 때는 왼쪽에서, 얕은 화면으로 갈 때는 오른쪽에서 들어오도록 했습니다.

`NavHost`에서도 출발 화면과 도착 화면의 깊이를 비교하도록 옮겼습니다.

```kotlin
enterTransition = {
    val from = initialState.toRoute<…>().depth
    val to = targetState.toRoute<…>().depth
    slideIn(direction = if (to > from) Left else Right)
}
```

이렇게 출발지와 도착지의 깊이를 비교해서 기존 전환 방향을 유지했습니다.

### ShellState에 남긴 다이얼로그와 필터

다이얼로그, 오버레이, 필터는 화면 경로와 별개로 관리할 곳이 필요했습니다. 따라서 `ShellState`를 없애지 않고 내비게이션 상태만 `NavController`로 옮겼습니다. 남은 보조 UI 상태는 계속 `ShellState`가 맡습니다.

## 함께 정리한 설정

Compose로 구성된 앱에서 사용하지 않는 호환성 계층을 줄이기 위해 `AppCompatActivity`를 `ComponentActivity`로 바꿨습니다. Compose 테마와 역할이 겹치던 `AppCompatDelegate`, `UiModeManager`의 수동 테마 설정도 제거했습니다.

린트에서 확인한 항목도 함께 수정했습니다. `TypographyQuotes`가 지적한 프랑스어·이탈리아어의 일반 아포스트로피(`'`)는 스마트 아포스트로피(`’`)로 교체했습니다. `ObsoleteSdkInt`가 가리키던, 더 이상 도달하지 않는 SDK 버전 분기도 정리했습니다.

`targetSdk`는 37로 올렸습니다. 대상 SDK를 올리면 동작이 달라지는 부분이 있으므로, 출시 직전에 묶어 처리하기보다 구조를 정리하는 날 함께 확인했습니다.

## 마치며

이날 ViewModel을 나누기는 했지만 비즈니스 로직의 단위 테스트까지 붙이지는 못했습니다. 딥링크는 필요할 때 추가하기로 했습니다. 런처 아이콘이 영역을 가득 채운다는 `IconLauncherShape` 경고도 아직 남아 있었습니다.

[6 — Room과 DataStore를 AppRepository로 묶기](/android/app-repository-ssot.html)
