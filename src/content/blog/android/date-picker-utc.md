---
title: "안드로이드를 만들며 15 — 달력에서 고른 날짜와 저장 시각을 섞었다"
date: 2026-10-22T00:00:00+09:00
tags: ["android","compose","검사"]
slug: "date-picker-utc"
lang: "ko"
author: "Heejeong Kim"
summary: "이력 필터에 Material DatePicker를 붙이면서 UTC 자정을 기기의 날짜로 읽는 문제를 확인했습니다. 연월일을 옮겨 현지 자정을 만들고 필터 테스트에 시간대를 전달하도록 고쳤습니다."
---

## 들어가며

물타기 계산기의 이력에 날짜 필터를 넣었습니다. “이번 달”처럼 한 번에 고르는 기간과 시작·종료 날짜를 직접 고르는 기능을 함께 뒀습니다. 2026년 9월 3일에는 직접 그렸던 달력을 Material `DatePicker`로 교체했습니다.

## UTC 자정을 현지 시각으로 읽으면

달력에서 받은 값과 기록의 저장 시각은 모두 밀리초 단위의 `Long`이었습니다. 타입은 같지만 의미는 달랐습니다. [DatePickerState의 `selectedDateMillis`](https://developer.android.com/reference/kotlin/androidx/compose/material3/DatePickerState)는 선택한 날짜의 **UTC 자정**을 나타냅니다.

9월 1일을 고른 값을 현지 시각으로 바로 읽으면 다음처럼 됩니다. 시간대 차이를 보여주기 위한 예시입니다.

| 읽는 시간대 | UTC 9월 1일 00:00을 현지 시각으로 읽은 값 |
| --- | --- |
| UTC+9 | 9월 1일 09:00 |
| UTC−5 | 8월 31일 19:00 |

서울에서는 같은 날짜가 나왔습니다. UTC보다 느린 시간대에서는 전날이 됩니다. 이 값을 현지 하루의 시작으로 내리면, 사용자가 선택하지 않은 전날 기록까지 필터에 들어올 수 있었습니다.

## 연월일을 옮겨 현지 자정 만들기

필요했던 것은 그 순간의 현지 시각이 아니었습니다. 사용자가 고른 연도·월·일이었습니다. UTC 달력에서 세 값을 꺼내고, 같은 숫자로 기기 시간대의 자정을 만들었습니다. 당시 작성한 함수의 핵심입니다.

```kotlin
fun localDayOf(
    utcMidnight: Long,
    zone: TimeZone = TimeZone.getDefault(),
): Long {
    val utc = Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply {
        timeInMillis = utcMidnight
    }
    return Calendar.getInstance(zone).apply {
        clear()
        set(utc.get(Calendar.YEAR), utc.get(Calendar.MONTH), utc.get(Calendar.DAY_OF_MONTH))
    }.timeInMillis
}
```

고른 날짜를 읽는 쪽에서 시간대를 지정할 수 있게 했고, 다음 날에는 기록을 거르는 `filterHistory`도 시간대를 인자로 받도록 고쳤습니다. 개발 기기의 기본 시간대만으로 테스트하지 않기 위해서였습니다.

테스트 기대값을 적을 때도 한 번 틀렸습니다. `Calendar.MONTH`가 0부터 시작하는데 월을 숫자로 적었습니다. `Calendar.FEBRUARY`처럼 이름이 있는 상수로 바꿨습니다.

## 마치며

당시 컴파일·단위 테스트·린트는 통과했습니다. 다만 Material 달력으로 교체한 뒤의 화면 확인은 그날 일지에 미완료로 남아 있습니다. 시간대 계산을 검사한 결과와 달력을 실제로 눌러 본 결과를 같은 완료 항목으로 묶지는 않았습니다.

<!-- 근거: vault/products/Stock Calculator/journal/2026-09-03/History-Filter-Drawer.md; 2026-09-04-Stock Calculator.md; core/Days.kt -->
