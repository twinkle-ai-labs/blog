---
title: "조용히 실패하는 것들 5 — 로컬 업로드와 CI가 다른 버전 코드를 썼습니다"
date: 2026-08-26T11:20:00+09:00
tags: ["출시","자동화","CI","버전"]
slug: "two-counters-one-number"
lang: "ko"
author: "Heejeong Kim"
summary: "로컬에서 올린 번들이 이미 사용한 버전 코드로 거절돼 8 → 14 → 20으로 번호를 올렸습니다. CI와 로컬의 계산 차이, 뒤처진 로그 상수, 버전 이름 재사용 가능성을 함께 고쳤습니다."
---

새벽에 앱을 한 번 출시하는 동안 버전 코드와 관련된 커밋이 세 개 쌓였습니다.

```
0948ce4  chore: release v1.0.5
088c36b  fix: bump version code to 14 due to previous versions
6358847  fix: bump version code to 20 to surpass CI generated codes
```

Play 콘솔이 이미 사용한 번호라며 업로드를 거절했고, 통과할 번호를 찾느라 8 → 14 → 20으로 올린 기록이었습니다. 낮에 다시 살펴보니 로컬 업로드와 CI가 서로 다른 방식으로 `versionCode`를 계산하고 있었습니다.

## 로컬에서는 CI 실행 번호를 더하지 않았습니다

CI의 버전 코드 계산은 다음과 같았습니다.

```kotlin
val lastManualVersionCode = 20
versionCode = System.getenv("GITHUB_RUN_NUMBER")?.toIntOrNull()
    ?.plus(lastManualVersionCode) ?: lastManualVersionCode
```

`main`에 푸시해 GitHub Actions가 실행되면 `GITHUB_RUN_NUMBER`를 상수에 더합니다. 로컬에는 이 환경 변수가 없으므로 `?:` 뒤의 상수를 그대로 사용합니다.

그날 새벽에는 `main`을 통한 CI 대신 로컬에서 `publishReleaseBundle`을 실행했습니다. CI는 이미 8부터 19까지 사용했지만 로컬 업로드는 8을 제시했습니다. 위 코드는 여러 차례 번호를 올린 뒤 상수가 20이 된 상태입니다.

로컬은 CI가 어느 번호까지 사용했는지 모릅니다. Play 콘솔이 한 번 받은 번호를 다시 쓸 수 없으므로, 두 경로가 각자 계산한 번호는 업로드 시점에 충돌할 수 있었습니다. 출시가 `main`의 CI를 거치도록 경로를 통일해야 했습니다.

## 빌드와 로그도 서로 다른 상수를 읽었습니다

워크플로에는 다음 로그가 남아 있었습니다.

```yaml
- name: Play 에 올리기
  run: |
    echo "track=$TRACK versionCode=$((GITHUB_RUN_NUMBER + 7))"
    ./gradlew publishReleaseBundle --track "$TRACK"
```

`build.gradle.kts`의 상수는 이미 20인데 로그는 여전히 7을 더하고 있었습니다. 실제 번들은 Gradle 설정으로 빌드되므로 CI에서 계산한 버전 코드가 맞았지만, 로그에 찍힌 숫자는 13만큼 작았습니다.

이 차이는 여러 버전 동안 드러나지 않았습니다. 업로드가 성공하고 있었기 때문입니다. 다만 로그로 마지막 사용 번호를 확인하면 잘못된 값을 보게 됩니다.

워크플로에 상수를 다시 적는 대신 `build.gradle.kts`에서 읽도록 바꿨습니다.

```yaml
run: |
  # 상수를 여기 옮겨 적지 않는다 — 옮겨 적은 순간 정본과 갈린다.
  LAST_MANUAL=$(grep -oE 'val lastManualVersionCode *= *[0-9]+' app/build.gradle.kts | grep -oE '[0-9]+$')
  test -n "$LAST_MANUAL" || { echo "lastManualVersionCode 를 못 읽었다"; exit 1; }
  echo "track=$TRACK versionCode=$((GITHUB_RUN_NUMBER + LAST_MANUAL))"
```

상수를 읽지 못하면 즉시 종료하도록 했습니다. 값이 없는 변수를 셸의 산술 확장에 넣으면 0으로 계산될 수 있으므로, 읽기에 실패한 채 로그를 만드는 것을 막았습니다.

## 고친 버전에는 새 이름을 붙였습니다

그날 출시한 1.0.5에는 리팩토링 과정에서 생긴 회귀도 넷 있었습니다. 컴포넌트를 분리하는 작업이 실제로는 다시 작성하는 작업이 되면서 여백, 배지, 애니메이션 키, 미리보기가 하나씩 빠졌습니다.

네 문제를 고친 뒤에도 `versionName`은 1.0.5로 남아 있었습니다. CI가 `versionCode`를 올려주므로 그대로 업로드해도 번호 충돌은 없었겠지만, 동작이 다른 두 빌드를 같은 이름으로 안내하게 될 뻔했습니다.

수정 버전은 1.0.6으로 출시했습니다. 버전 이름을 재사용하지 않고 태그와 출시 기록도 함께 남기도록 했습니다. 다음 출시에서 변경 범위를 확인하려면 시작점이 되는 태그가 필요했습니다.

## 번호를 정하는 일과 올리는 일을 함께 처리합니다

작업을 되짚어보니 버전을 정하는 담당과 업로드 담당을 나눠둔 절차에서도 빠진 단계가 있었습니다. 업로드 쪽만 실행돼 번호를 정하는 단계가 생략된 채 옛 이름으로 출시될 뻔한 것입니다.

버전 계산은 CI 한 곳에서 하고, 로그는 그 계산에 쓰는 값을 읽습니다. 버전 이름을 정하고 태그와 출시 기록을 남기는 과정도 업로드와 함께 완료해야 이번과 같은 누락을 확인할 수 있습니다.
