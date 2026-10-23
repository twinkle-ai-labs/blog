---
title: "안드로이드를 만들며 14 — 스키마 파일이 있는데 마이그레이션 테스트가 못 읽었다"
date: 2026-10-22T00:00:00+09:00
tags: ["android","room","검사"]
slug: "room-migration-test-assets"
lang: "ko"
author: "Heejeong Kim"
summary: "Pocket PDF의 JVM 테스트에서 MigrationTestHelper가 스키마 에셋을 찾지 못했습니다. 이전 스키마로 DB를 직접 만들고 실제 마이그레이션과 Room의 최종 검증을 실행하도록 바꿨습니다."
---

## 들어가며

Pocket PDF에서 폴더를 없앤 뒤에도 옛 보관함 기록은 남아야 했습니다. 2026년 9월 3일, DB 버전 1에서 2로, 2에서 3으로 바뀌는 경로에 테스트를 붙였습니다.

## 스키마가 테스트 에셋에 들어오지 않았습니다

저장소에는 세 버전의 스키마 JSON이 모두 있었습니다. `room-testing` 의존성을 넣고 `MigrationTestHelper`를 사용했습니다. 테스트 소스셋의 에셋 경로에도 스키마 폴더를 연결했습니다. 실행 결과는 `FileNotFoundException`이었습니다.

파일이 저장소에 있다는 것과 테스트 프로세스의 에셋으로 들어간다는 것은 달랐습니다. 당시 이 프로젝트의 AGP 9 설정에는 `mergeDebugUnitTestAssets` 태스크가 없었습니다. Robolectric의 `test_config.properties`를 보니 `android_merged_assets`가 앱 본체의 에셋 결과를 가리켰습니다. 헬퍼가 읽는 `context.assets.open`까지 테스트용 스키마가 도착하지 않았습니다.

[MigrationTestHelper 문서](https://developer.android.com/reference/androidx/room/testing/MigrationTestHelper)는 내보낸 스키마를 테스트의 기반으로 사용한다고 설명합니다. 이번에 막힌 곳은 마이그레이션 SQL을 실행하는 단계보다 앞선 파일 전달 경로였습니다.

## 옛 DB를 만든 뒤 현재 Room으로 열기

계측 테스트로 옮기는 방법도 있었지만, 이 앱에는 아직 그 기반이 없었습니다. 기존 JVM 테스트에서 검사할 수 있도록 이전 DB를 직접 만들기로 했습니다.

버전 1의 테이블 생성문은 추측해서 쓰지 않았습니다. 내보낸 스키마의 `createSql`을 그대로 테스트에 옮겼습니다. 여기에 옛 기록을 넣고 실제 `MIGRATION_1_2`, `MIGRATION_2_3`을 실행했습니다.

당시에 추가한 검사는 네 개였습니다.

- 1에서 2로 바꿔도 기록이 남고 폴더 관련 구조가 생기는지
- 2에서 3으로 바꾸면 폴더 구조가 없어지고 기록은 남는지
- 버전 1 DB를 현재 Room으로 열어 두 마이그레이션을 거친 뒤 DAO로 읽을 수 있는지
- 최신 버전의 DAO로 넣고, 읽고, 수정하고, 지울 수 있는지

세 번째 검사는 `Room.databaseBuilder`에 마이그레이션 둘을 등록해서 실행했습니다. 이전 파일을 현재 Room으로 열면 최종 스키마를 기대 구조와 대조합니다. SQL을 실행했다는 사실뿐 아니라 결과를 Room이 받아들이는지도 확인했습니다.

## 마치며

사용하지 않게 된 `room-testing` 의존성과 에셋 설정은 제거했습니다. 대신 옛 스키마의 생성문을 테스트에 한 벌 보관하는 비용이 생겼습니다. 실제 기기에서의 검증을 대신한다고 보지는 않았습니다. 그날 추가한 것은 JVM에서 옛 기록의 이동과 최종 스키마를 반복해서 확인할 수 있는 경로였습니다.

<!-- 근거: vault/products/Pocket PDF/journal/2026-09-03/Viewmodel-And-Migration-Tests.md; PocketPdfDatabaseMigrationTest.kt -->
