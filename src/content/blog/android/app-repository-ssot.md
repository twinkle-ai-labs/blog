---
title: "안드로이드를 만들며 6 — Room과 DataStore를 AppRepository로 묶기"
date: 2026-08-24T02:00:00+09:00
tags: ["android","architecture","mvvm","room","datastore"]
slug: "app-repository-ssot"
lang: "ko"
author: "Heejeong Kim"
summary: "목록은 Room에, 설정은 DataStore에 저장하면서 화면이 두 저장 방식을 알 필요는 없었습니다. AppRepository가 상태를 합쳐 전달하도록 정리하고, 기존 키와 JSON 마이그레이션의 호환성을 확인했습니다."
---

## 들어가며

종목과 계산 이력을 JSON에서 Room으로 옮겼습니다. 테마·언어·통화·광고 제거 여부는 DataStore에 남아 있으니 저장소가 둘이 됐습니다. 화면마다 두 저장소를 구독하게 할지, 한곳에서 합쳐 전달할지 정해야 했습니다.

## 화면이 받을 AppData를 한곳에서 조립하기

이 앱은 서버 없이 기기 안에 기록을 보관합니다. 처음에는 모든 데이터를 JSON 한 덩어리로 저장했습니다. 이 구조에서는 기록 하나를 지워도 전체를 다시 써야 했고, 목록의 특정 항목만 수정하기 어려웠습니다. 목록을 Room으로 옮긴 이유입니다.

이미 JSON에서 Room으로 한 차례 옮긴 뒤라, 다음에 저장 방식을 바꾸면서 화면까지 고치는 일은 줄이고 싶었습니다. Room과 DataStore를 각각 구독하는 코드는 화면 밖에 뒀습니다.

`AppRepository`가 두 저장소를 받아 하나의 `AppData` 흐름으로 제공하도록 했습니다.

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

저장소는 `Flow<AppData>`를 내보내고, `MainViewModel`은 이를 `stateIn`으로 바꿔 화면에 제공합니다. 실제 연결은 다음과 같습니다.

```kotlin
val data: StateFlow<AppData?> = repository.data
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
```

화면은 이 상태를 구독합니다. 종목이 Room에 있고 설정이 DataStore에 있다는 구분은 저장소 안에 남습니다.

`combine`은 종목 목록, 이력 목록, 설정 중 하나가 바뀌면 새 `AppData`를 내보냅니다. 이전에는 설정이 바뀔 때 관련 화면을 갱신하는 연결을 따로 관리했는데, 이제 종목을 지우든 테마를 바꾸든 화면은 이 흐름에서 변경을 받습니다.

## 상수 이름과 저장된 키는 구분했습니다

DataStore에는 다음 키가 있습니다.

```kotlin
private val PROMO_UNLOCKED = booleanPreferencesKey("dev_unlocked")
```

화면에서 사용하는 말이 바뀌면서 상수 이름은 `PROMO_UNLOCKED`가 됐지만, 저장된 키는 `dev_unlocked`를 유지했습니다. 키 문자열까지 바꾸면 기존 기기에 저장된 값을 새 이름으로 찾을 수 없습니다. 이미 활성화한 설정이 업데이트 후 꺼진 것처럼 보일 수 있습니다.

JSON 파서에도 호환성을 위한 옵션이 있습니다.

```kotlin
private val json = Json {
    ignoreUnknownKeys = true // 현재 모델이 모르는 JSON 필드는 건너뛴다
    encodeDefaults = true
}
```

`ignoreUnknownKeys`는 읽는 JSON에 현재 모델이 모르는 필드가 있을 때 그 필드를 건너뛰게 합니다. 저장본에 필드가 더 있다는 이유만으로 읽기에 실패하지 않도록 둔 설정입니다.

## 마이그레이션을 다시 실행할 경우도 고려했습니다

기존 JSON을 Room으로 옮기는 함수는 다음과 같은 형태입니다.

```kotlin
suspend fun migrateDataStoreToRoomIfNeeded() {
    val legacyJson = store.data.first()[APP_DATA] ?: return
    val legacy = runCatching { json.decodeFromString<AppData>(legacyJson) }.getOrNull() ?: return

    // 이미 Room 에 무언가 있으면 덮지 않는다 — 두 번 불려도 기록이 겹치지 않는다
    …
}
```

앱이 중간에 종료되어 다음 실행에서 다시 호출될 수 있으므로, 이미 Room에 데이터가 있으면 덮어쓰지 않도록 했습니다. 재호출 때문에 같은 기록이 중복되지 않게 하려는 처리입니다.

기존 JSON을 읽지 못하면 `runCatching { … }.getOrNull() ?: return`에서 마이그레이션을 중단합니다. 앱을 종료시키기보다 옮기지 않는 쪽을 택했고, 원래 JSON은 그대로 남겨 뒀습니다. 읽기에 실패한 저장본까지 복구하는 처리는 이 함수가 맡지 않습니다.

## 마치며

5편에서 `AppViewModel`을 나눈 다섯 ViewModel은 모두 `AppRepository`를 사용합니다. 화면에서는 다음처럼 행동만 전달합니다.

```kotlin
viewModel.deleteRecord(id)
```

어디에서 지울지, 실패하면 어떻게 처리할지는 화면 밖에서 정합니다.

[7 — 열세 개 콜백을 CalculatorAction으로 묶기](/android/calculator-action-mvi.html)
