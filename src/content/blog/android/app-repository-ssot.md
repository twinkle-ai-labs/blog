---
title: "안드로이드를 만들며 6 — Room과 DataStore를 AppRepository로 묶기"
date: 2026-08-24T02:00:00+09:00
tags: ["android","architecture","mvvm","room","datastore"]
slug: "app-repository-ssot"
lang: "ko"
author: "Heejeong Kim"
summary: "목록은 Room에, 설정은 DataStore에 저장하면서 화면이 두 저장 방식을 알 필요는 없었습니다. AppRepository가 상태를 합쳐 전달하도록 정리하고, 기존 키와 JSON 마이그레이션의 호환성을 확인했습니다."
---

목록 데이터를 JSON에서 Room으로 옮긴 뒤 앱은 두 저장소를 사용하게 됐습니다. 종목과 계산 이력은 Room에, 테마·언어·통화·광고 제거 여부는 DataStore에 남았습니다.

앞선 5편에서 구조를 정리한 다음 날, 데이터와 이벤트, 생명주기를 다시 살펴봤습니다. 6편은 데이터, 7편은 이벤트, 8편은 생명주기를 다룹니다. 먼저 화면과 저장소 사이의 경계를 정리했습니다.

## 화면에 저장 방식을 노출하지 않기로 했습니다

이 앱은 서버 없이 기기 안에 기록을 보관합니다. 처음에는 모든 데이터를 JSON 한 덩어리로 저장했습니다. 이 구조에서는 기록 하나를 지워도 전체를 다시 써야 했고, 목록의 특정 항목만 수정하기 어려웠습니다. 목록을 Room으로 옮긴 이유입니다.

화면이 Room의 목록과 DataStore의 설정을 각각 구독할 수도 있습니다. 하지만 저장 위치를 바꿀 때마다 이를 아는 화면도 함께 고쳐야 합니다. 이미 JSON에서 Room으로 한 차례 옮겼으므로 저장 방식이 바뀔 가능성을 화면 밖에서 다루고 싶었습니다.

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

저장소가 내보내는 것은 `Flow<AppData>`입니다. 화면에 노출할 상태는 `StateFlow`로 두고, 데이터의 출처는 이 저장소 하나로 모았습니다. 아래 예제는 데이터의 출처를 보여 줍니다. 실제 구현에는 `stateIn` 같은 연산자로 `Flow`를 `StateFlow`로 바꾸는 과정이 필요하지만, 이 예제에서는 그 부분을 생략했습니다.

```kotlin
val data: StateFlow<AppData?> = repository.data
```

화면이 종목의 저장 위치와 설정의 저장 위치를 따로 알지 않도록 한 것이 이 변경의 목적입니다.

## 상태 변경을 한 흐름에서 받습니다

`combine`은 종목 목록, 이력 목록, 설정 중 어느 하나가 바뀌면 이를 합친 새 `AppData`를 내보냅니다. 화면에서는 변경 원인별로 갱신 경로를 연결하는 대신 이 상태를 구독합니다.

종목 삭제와 테마 변경은 서로 다른 저장소에 쓰지만, 화면이 변경을 받는 경로는 같습니다. 이전에는 설정이 바뀔 때 관련 화면을 갱신하는 연결을 따로 관리했습니다. 이제 화면에 전달할 상태를 조립하는 책임을 `AppRepository`에 모았습니다.

여기서 단일 진실 공급원(Single Source of Truth)은 화면이 참조하는 데이터 경계를 뜻합니다. [디자인 시스템 세우기 1](/design-system/light-dark-one-copy.html)에서 색 값을 한 곳에 둔 것처럼, 화면마다 상태 조립 규칙을 반복하지 않으려는 선택이었습니다.

## 상수 이름과 저장된 키는 구분했습니다

DataStore에는 다음 키가 있습니다.

```kotlin
private val PROMO_UNLOCKED = booleanPreferencesKey("dev_unlocked")
```

화면에서 사용하는 말이 바뀌면서 상수 이름은 `PROMO_UNLOCKED`가 됐지만, 저장된 키는 `dev_unlocked`를 유지했습니다. 키 문자열까지 바꾸면 기존 기기에 저장된 값을 새 이름으로 찾을 수 없습니다. 이미 활성화한 설정이 업데이트 후 꺼진 것처럼 보일 수 있습니다.

코드에서 읽는 이름은 정리하되, 기존 저장본을 읽는 키는 호환성을 확인하지 않고 바꾸지 않기로 했습니다.

JSON 파서에도 호환성을 위한 옵션이 있습니다.

```kotlin
private val json = Json {
    ignoreUnknownKeys = true // 앞으로 필드가 늘어도 옛 저장본을 버리지 않는다
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

[조용히 실패하는 것들](/category/silent-failures/)에서 다룬 도구는 결과를 만들지 않고도 성공으로 보고한 경우였습니다. 여기서는 기존 데이터를 지우지 않은 채 이전 작업을 중단한다는 점을 구분했습니다.

## 다섯 ViewModel이 같은 저장 경계를 사용합니다

5편에서 `AppViewModel`을 나눈 다섯 ViewModel은 모두 `AppRepository`를 사용합니다. 화면에서는 다음처럼 행동만 전달합니다.

```kotlin
viewModel.deleteRecord(id)
```

삭제할 저장소와 예외 처리 방식은 화면 밖에 둡니다. 이 구조로 화면이 알아야 할 저장 관련 정보를 줄였습니다.

데이터를 전달하는 경계를 정리한 뒤에는 계산기 화면에 남은 열세 개 콜백을 살펴봤습니다.

[7 — 열세 개 콜백을 CalculatorAction으로 묶기](/android/calculator-action-mvi.html)
