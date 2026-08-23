---
title: "하루에 구조를 세 번 바꿨다 — Hilt · Navigation · 걷어낸 것들"
date: 2026-08-23T22:30:00+09:00
tags: ["android","compose","hilt","navigation","리팩토링"]
slug: "hilt-navigation-cleanup"
lang: "ko"
author: "Heejeong Kim"
summary: "돌아가는 앱을 스토어에 올리고 나서, 하루를 통째로 구조에 썼다. 손으로 만든 DI를 Hilt로, 손으로 만든 화면 전환을 Navigation으로, 그리고 이미 낡은 것들을 걷어냈다."
---

앱은 이미 돌아가고 있었다. 테스트 트랙에 올라가 있었고, 기능도 다 됐다.
그런데 안을 열면 «처음 만들면서 손에 잡히는 대로 붙인 것»이 그대로 있었다.

하루를 통째로 여기에 썼다. 세 덩이였다.

---

# 하나 — 손으로 만든 DI를 Hilt로

## 무엇이 문제였나

`AppRepository`와 `AppViewModel`을 **직접 만들어서 직접 넘기고** 있었다.
처음엔 이게 제일 간단하다. 의존성이 셋일 때는 정말 그렇다.

그런데 Room DB가 들어오고, DataStore가 들어오고, 화면이 늘면서
«이걸 만들려면 저걸 먼저 만들어야 하고» 하는 사슬이 길어졌다.
그 사슬을 사람이 손으로 엮고 있었다.

## 무엇을 했나

`DatabaseModule` 하나를 두고 Room DB와 DataStore를 싱글톤으로 제공했다.
나머지는 전부 생성자 주입으로 바꿨다.

```kotlin
@HiltViewModel
class CalculatorViewModel @Inject constructor(
    private val repository: StockRepository,
) : ViewModel()
```

## 얻은 것

보일러플레이트가 준 것보다, **«이 클래스가 무엇에 기대는가»가 생성자 한 줄에 다 적히게 된 것**이 컸다.
전에는 그 답을 알려면 만드는 자리를 찾아가야 했다.

---

# 둘 — 비대한 ViewModel을 다섯으로 나눴다

`AppViewModel` 하나가 계산·이력·설정·종목 관리를 전부 들고 있었다.
이름부터가 «앱»이었다. 앱이 하는 일을 다 하는 클래스라는 뜻이다.

다섯으로 갈랐다.

| ViewModel | 맡는 것 |
|---|---|
| `CalculatorViewModel` | 계산 |
| `HistoryViewModel` | 이력 |
| `SettingsViewModel` | 설정 |
| `StockViewModel` | 종목 관리 |
| `MainViewModel` | 앱 껍데기 |

**화면 단위가 아니라 도메인 단위로 갈랐다.** 화면은 합쳐지거나 나뉘는데
도메인은 잘 안 그러기 때문이다.

## 상태를 파일 밖으로 꺼냈다

가르고 나서 한 가지가 더 필요했다. ViewModel 안에 있던 `data class` 상태들을
`CalculatorState.kt`로 따로 꺼냈다.

안 꺼내면 A의 상태를 B가 쓰려고 A를 import하게 되고, 그 순간 **가른 의미가 없어진다.**
상태가 독립된 파일에 있으면 상호 참조가 생길 자리가 없다.

---

# 셋 — 화면 전환을 Navigation으로

## 손으로 만든 백스택

화면 전환을 `ShellState`라는 상태 객체가 관리하고 있었다.
어느 화면인지, 뒤로 가면 어디로 가는지를 전부 손으로 적었다.

## Type-safe Navigation

`Routes.kt`에 `@Serializable` 클래스를 두고, 경로를 객체로 넘기게 했다.

```kotlin
@Serializable data object Calculator
@Serializable data class StockDetail(val stockId: Long)

navController.navigate(StockDetail(stockId = 3))
```

문자열 경로의 오타 위험이 사라지고, 인자가 컴파일 타임에 검사된다.

## 애니메이션 이식이 제일 까다로웠다

기존에 `AnimatedContent`로 만든 연출이 있었다. 화면마다 **깊이(depth)** 를 매기고,
깊은 데로 가면 왼쪽에서, 얕은 데로 가면 오른쪽에서 미끄러지는 방식이다.

`NavHost`에 그대로 옮기려면 «지금 어디서 어디로 가는가»를 알아야 한다.

```kotlin
enterTransition = {
    val from = initialState.toRoute<…>().depth
    val to = targetState.toRoute<…>().depth
    slideIn(direction = if (to > from) Left else Right)
}
```

`initialState`와 `targetState`에서 각각 라우트를 꺼내 깊이를 비교한다.
이게 되니까 표준 내비게이션을 쓰면서 연출은 그대로 유지할 수 있었다.

## `ShellState`는 살아남았다 — 역할만 줄어서

전부 걷어낼 뻔했는데, 다이얼로그·오버레이·필터 같은
**«화면이 아닌 UI 보조 상태»** 는 여전히 어딘가 있어야 했다.

내비게이션 상태만 `NavController`로 넘기고, `ShellState`는 나머지를 맡게 정제했다.
«쓸모없어졌으니 지운다»가 아니라 «맡을 것만 맡긴다»가 맞았다.

---

# 넷 — 이미 낡은 것들을 걷었다

## `AppCompatActivity` → `ComponentActivity`

완전히 Compose로 만든 앱인데 구형 `AppCompatActivity`를 상속하고 있었다.
쓰지도 않는 호환성 레이어를 들고 다닌 셈이다.

같이 걷힌 것: `AppCompatDelegate`와 `UiModeManager`로 하던 **수동 테마 설정.**
Compose 테마 시스템이 이미 그 일을 하고 있었으므로 두 벌이었다.

## 린트가 잡아 준 것

경고로 치부하기 쉬운 것들이 실제로 사용자가 보는 것이었다.

- **`TypographyQuotes`** — 프랑스어·이탈리아어 리소스에서 일반 아포스트로피(`'`)를 쓰고 있었다.
  그 언어권의 조판 관례는 스마트 아포스트로피(`’`)다. 전수 교체했다.
- **`ObsoleteSdkInt`** — 이제 안 오는 SDK 버전을 분기하고 있었다.

린트 경고를 «나중에»로 미루면 쌓이고, 쌓이면 진짜 경고가 그 속에 묻힌다.

## `targetSdk` 37

올리고 나면 동작이 바뀌는 것들이 있어서 한 번 다 돌려 봐야 한다.
출시 전날 할 일이 아니다. 이런 날에 한다.

---

# 하루를 이렇게 쓴 이유

기능은 이미 다 됐는데 왜 하루를 구조에 썼나.

**다음 기능을 붙일 자리가 없어서다.** `AppViewModel`에 한 줄을 더하는 일이
점점 무서워지고 있었다. 무서워지면 안 붙이게 되고, 안 붙이면 앱이 거기서 멈춘다.

그리고 이런 일은 «나중에»가 안 온다. 기능이 늘수록 옮길 것이 늘어서,
미룬 만큼 비싸진다. 지금이 제일 싼 시점이었다.

---

# 남긴 것

- 갈라 놓은 ViewModel의 비즈니스 로직에 **단위 테스트**를 붙이는 일.
  가른 이유의 절반이 «시험할 수 있게»였는데 아직 시험은 안 붙었다.
- 딥링크. 표준 내비게이션으로 옮겨서 이제 붙이기 쉬워졌다 — 필요해지면.
- 런처 아이콘이 영역을 가득 채운다는 린트 경고(`IconLauncherShape`).
  이건 디자인 쪽 일이다.
