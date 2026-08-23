---
title: "안드로이드를 만들며 6 — 저장소가 둘인데 화면은 하나로 봅니다 - AppRepository와 SSOT"
date: 2026-08-24T02:00:00+09:00
tags: ["android","architecture","mvvm","room","datastore"]
slug: "app-repository-ssot"
lang: "ko"
author: "Heejeong Kim"
summary: "목록은 Room이, 설정값은 DataStore가 들고 있어요. 화면이 그 둘을 다 알아야 할 이유는 없었습니다. combine으로 하나의 Flow로 묶어 단일 진실 공급원을 세운 이야기, 그리고 옛 저장본과 맺은 약속에 대한 이야기예요."
---

지난 글에서는 **하루를 통째로 구조에 쓴 이야기**를 했어요.
손으로 만든 DI를 Hilt로, 손으로 만든 화면 전환을 Navigation으로 옮긴 날이었죠.

그런데 그날로 끝나지 않았습니다. 바로 다음 날 두 번째 물결이 왔어요.
그리고 이번 세 편은 전부 같은 동작입니다. **흩어진 것을 한 곳으로 모으는 일.**

- **6편** 데이터를 **한 줄기**로 — 지금 이 글
- **7편** 이벤트를 **한 입구**로
- **8편** 생명주기를 **한 자리**로

먼저 데이터부터요.

---

# 저장소가 둘이 된 이유

이 앱은 서버가 없어요. 기록은 기기 안에만 있습니다.
그런데 그 "기기 안"이 한 곳이 아니에요.

- **Room** — 목록이 되는 것 (종목, 계산 이력)
- **DataStore** — 값 하나로 끝나는 것 (테마, 언어, 통화, 광고 제거 여부)

처음부터 이랬던 건 아니에요. 한때는 **전부 JSON 한 덩이**였습니다.
그런데 그 구조는 기록 하나를 지우려고 덩이 전체를 다시 써야 했어요.
목록이 길어질수록 쓰기가 비싸졌고, 무엇보다
**"이 기록만 바꾼다"를 표현할 방법이 없었습니다.**

그래서 목록은 Room으로 옮겼어요. 옮기고 나니 저장소가 둘이 됐고요.

---

# 그런데 화면이 그걸 알아야 할까요

여기서 갈림길이 하나 있었습니다.

저장소가 둘이니까 화면도 둘을 구독하게 할 수 있어요.
종목 목록은 Room에서, 테마는 DataStore에서 각각 가져오는 식으로요.

동작은 합니다. 그런데 그 순간 **화면이 저장 기술을 알게 돼요.**
"이건 Room에 있고 저건 DataStore에 있다"를 화면이 기억해야 하는 거죠.

그리고 그건 언제든 바뀔 수 있는 사실입니다.
실제로 이미 한 번 바뀌었잖아요. JSON 한 덩이에서 둘로요.
다음에 또 바뀌면 그때마다 화면을 전부 고쳐야 합니다.

그래서 `AppRepository` 하나를 세우고, **저장소가 둘이라는 사실을 그 안에 가뒀어요.**

```kotlin
@Singleton
class AppRepository @Inject constructor(
    private val store: DataStore<Preferences>,
    private val database: AppDatabase
) {
    /** Room 의 목록과 DataStore 의 설정을 한 덩이로 합쳐 내보낸다 */
    val data: Flow<AppData> = combine(
        database.stockDao().getAllStocks(),
        database.historyDao().getAllRecords(),
        store.data
    ) { stockEntities, recordEntities, preferences ->
        // … 하나의 AppData 로 조립합니다
    }
}
```

화면 쪽은 이 한 줄기만 봅니다.

```kotlin
val data: StateFlow<AppData?> = repository.data
```

**저장소가 둘인 줄 모릅니다.** 알 필요가 없고요.
셋이 되든 하나로 합쳐지든 이 줄은 안 바뀝니다.

---

# `combine`이 하는 일이 생각보다 커요

`combine`은 세 흐름 중 **어느 하나라도 바뀌면** 새 `AppData`를 내보냅니다.

이게 왜 좋냐면, 화면이 "언제 다시 그려야 하는가"를 따질 필요가 없어요.
종목을 지우든 테마를 바꾸든 결과는 똑같이 "새 `AppData`가 왔다"입니다.

전에는 이런 게 손으로 엮여 있었어요.
"설정이 바뀌었으니 이 화면도 갱신해야 하고…" 같은 연결이요.
그 연결은 새 화면이 생길 때마다 하나씩 늘어나고, 그중 하나는 반드시 빠집니다.

**단일 진실 공급원(Single Source of Truth)의 값어치가 여기 있었어요.**
진실이 하나면 동기화할 것이 없습니다. 동기화가 없으면 어긋날 자리도 없고요.

이건 [디자인 시스템 세우기 1](/design-system/light-dark-one-copy.html)에서
색 표를 한 벌로 만든 것과 정확히 같은 이야기예요.
거기서는 CSS 값이었고 여기서는 앱 상태일 뿐입니다.

---

# 옛 저장본과 맺은 약속은 이름이 바뀌어도 안 바뀝니다

이 파일에서 제일 조심스러웠던 게 이거예요.

DataStore의 키 하나가 이렇게 생겼습니다.

```kotlin
private val PROMO_UNLOCKED = booleanPreferencesKey("dev_unlocked")
```

상수 이름은 `PROMO_UNLOCKED`인데 **저장된 키는 `dev_unlocked`**예요. 안 맞죠.

화면에서 부르는 말이 바뀌었거든요.
그런데 저장된 키를 같이 바꾸면 어떻게 될까요?

**이미 코드를 넣어둔 기기에서 그 값이 사라집니다.**
새 키에는 아무것도 없으니까요.
켜뒀던 것이 앱을 올리자 꺼지는 셈이고, 그 사람은 **무엇이 없어졌는지도 모릅니다.**

그래서 이걸 법으로 적어뒀어요.

> 저장된 이름은 사람이 볼 것이 아니라 **옛 저장본과 맺은 약속**이다.
> 부르는 말이 바뀌었다고 따라 바꾸지 않는다.

같은 이유로 JSON 파서에도 이 옵션이 켜져 있습니다.

```kotlin
private val json = Json {
    ignoreUnknownKeys = true // 앞으로 필드가 늘어도 옛 저장본을 버리지 않는다
    encodeDefaults = true
}
```

모르는 필드를 만나면 터지는 게 아니라 그냥 넘어가요.
안 그러면 필드 하나 더한 날, 옛 저장본을 가진 사람의 기록이 통째로 안 읽힙니다.

---

# 옮기는 일은 두 번 불려도 괜찮아야 해요

JSON 한 덩이를 Room으로 옮기는 함수가 하나 있습니다.

```kotlin
suspend fun migrateDataStoreToRoomIfNeeded() {
    val legacyJson = store.data.first()[APP_DATA] ?: return
    val legacy = runCatching { json.decodeFromString<AppData>(legacyJson) }.getOrNull() ?: return

    // 이미 Room 에 무언가 있으면 덮지 않는다 — 두 번 불려도 기록이 겹치지 않는다
    …
}
```

여기서 챙긴 게 둘이에요.

**하나. 두 번 불려도 같은 결과여야 합니다.**
앱이 언제 죽을지 모르고, 옮기는 도중에 죽을 수도 있어요.
다시 켰을 때 또 부르면 기록이 두 벌이 되면 안 됩니다.

**둘. 못 읽으면 조용히 포기합니다.**
`runCatching { … }.getOrNull() ?: return`이요.
옛 덩이가 깨져 있으면 앱을 죽이는 게 아니라 그냥 안 옮기는 쪽을 골랐어요.

여기서 [조용히 실패하는 것들](/category/silent-failures/) 시리즈의 교훈과 부딪히는 것 같지만,
방향이 다릅니다. 그쪽은 **도구가 결과를 안 남기고도 성공했다고 말한 경우**였어요.
이건 **실패해도 사용자가 잃을 게 없는 자리**입니다. 옛 덩이는 그대로 남아 있으니까요.

---

# ViewModel은 저장 방법을 모릅니다

5편에서 `AppViewModel` 하나를 다섯으로 갈랐다고 했잖아요.
그 다섯이 전부 이 저장소 하나를 봅니다.

그리고 화면은 이렇게만 부릅니다.

```kotlin
viewModel.deleteRecord(id)
```

DB에서 어떻게 지우는지, 예외를 어떻게 처리하는지는 화면이 모릅니다.
**아는 것이 적을수록 고칠 일이 적어져요.**

---

# 정리하면

- 저장 기술이 여럿이면 그걸 **한 곳에 가둡니다.** 화면이 알 이유가 없어요.
- `combine`으로 한 줄기를 만들면 동기화할 것이 사라집니다. 진실이 하나니까요.
- **저장된 키 이름은 옛 저장본과 맺은 약속입니다.** 화면 문구가 바뀌어도 안 바꿔요.
- 마이그레이션은 **두 번 불려도 같은 결과**여야 합니다.

---

# 마치며

이번 글은 **데이터**를 한 줄기로 모은 이야기였어요.
그런데 데이터가 아래로 잘 흐르게 되니까, 이번엔 위로 올라가는 쪽이 눈에 띄더라고요.

화면 컴포저블 하나가 콜백을 열세 개나 들고 있었습니다.

👉 [7 — 화면이 콜백 열세 개를 들고 있었어요 - MVI로 입구를 하나로](/android/calculator-action-mvi.html)
