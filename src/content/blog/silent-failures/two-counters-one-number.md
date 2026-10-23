---
title: "로컬 업로드와 CI가 다른 버전 코드를 썼습니다"
date: 2026-08-26T11:20:00+09:00
tags: ["출시","자동화","CI","버전"]
slug: "two-counters-one-number"
lang: "ko"
author: "Heejeong Kim"
summary: "물타기 계산기 출시 중 버전 코드를 8 → 14 → 20으로 올려야 했습니다. 로컬과 CI의 계산 차이를 찾고, 실제 번들과 다른 숫자를 출력하던 로그도 고쳤습니다."
---

## 들어가며

물타기 계산기 v1.0.5를 출시하던 새벽에 번호를 올리는 커밋이 세 개 생겼습니다.

```
0948ce4  chore: release v1.0.5
088c36b  fix: bump version code to 14 due to previous versions
6358847  fix: bump version code to 20 to surpass CI generated codes
```

Play 콘솔이 이미 쓴 번호라며 번들을 거절할 때마다 8 → 14 → 20으로 올렸습니다. 어디까지 사용했는지 모른 채 번호부터 바꾼 셈입니다. 낮에 다시 살펴보니 로컬과 CI의 계산식이 달랐습니다.

## CI에서 더하던 값이 로컬에는 없었습니다

앱의 `versionCode` 계산은 다음과 같았습니다. 상수 `20`은 그날 여러 차례 번호를 올린 뒤의 값입니다.

```kotlin
val lastManualVersionCode = 20
versionCode = System.getenv("GITHUB_RUN_NUMBER")?.toIntOrNull()
    ?.plus(lastManualVersionCode) ?: lastManualVersionCode
```

GitHub Actions에서는 실행 번호인 `GITHUB_RUN_NUMBER`를 상수에 더합니다. 로컬에는 이 환경 변수가 없으므로 상수만 사용합니다.

그날 새벽에는 `main`을 통한 CI 대신 로컬에서 `publishReleaseBundle`을 실행했습니다. CI가 이미 8부터 19까지 사용한 상태에서 로컬은 8을 제시했습니다. 같은 앱을 올리는 두 경로가 마지막으로 사용한 번호를 공유하지 못한 것입니다.

당시에는 계산식을 유지하고 출시를 `main`의 CI로 통일했습니다. 로컬 업로드까지 쓰려면 양쪽에서 사용한 번호를 맞추는 절차가 더 필요했습니다.

## 로그는 실제 번들보다 13 작은 숫자를 출력했습니다

마지막 번호를 확인하는 데 쓸 로그도 맞지 않았습니다. 워크플로에는 다음 줄이 남아 있었습니다.

```yaml
- name: Play 에 올리기
  run: |
    echo "track=$TRACK versionCode=$((GITHUB_RUN_NUMBER + 7))"
    ./gradlew publishReleaseBundle --track "$TRACK"
```

Gradle의 상수는 20으로 바뀌었는데 로그에는 7이 남아 있었습니다. 번들은 Gradle 설정으로 만들었으므로 업로드에 쓰는 번호는 CI 계산대로였지만, 로그에 출력한 숫자는 13만큼 작았습니다.

로그용 상수를 따로 관리하지 않고 `build.gradle.kts`에서 읽도록 고쳤습니다.

```yaml
run: |
  LAST_MANUAL=$(grep -oE 'val lastManualVersionCode *= *[0-9]+' app/build.gradle.kts | grep -oE '[0-9]+$')
  test -n "$LAST_MANUAL" || { echo "lastManualVersionCode 를 못 읽었다"; exit 1; }
  echo "track=$TRACK versionCode=$((GITHUB_RUN_NUMBER + LAST_MANUAL))"
```

값을 못 읽었을 때 0처럼 계산하지 않도록 빈 값이면 종료하게 했습니다. 다만 이 코드는 Gradle 파일의 선언 형식을 읽습니다. 선언을 바꿀 때는 이쪽도 확인해야 합니다.

## 버전 이름도 그대로 내보낼 뻔했습니다

`versionCode`와 별도로 사용자가 보는 `versionName`도 확인했습니다. 1.0.5에는 컴포넌트를 분리하는 과정에서 여백, 배지, 애니메이션 키, 미리보기가 빠진 회귀 넷이 있었습니다. 이를 고친 뒤에도 이름은 1.0.5로 남아 있었습니다.

CI가 새 코드를 계산해 주더라도, 동작이 다른 두 빌드를 같은 이름으로 내보내면 테스터가 말하는 ‘1.0.5’가 어느 빌드인지 알기 어렵습니다. 수정 버전은 1.0.6으로 출시하고 태그와 출시 기록을 함께 남겼습니다.

## 마치며

버전을 정하는 절차를 따로 두고 업로드만 실행하면서 빠뜨린 일이었습니다. 이후 출시 작업에는 버전 이름, 태그, 출시 기록도 함께 넣었습니다.
