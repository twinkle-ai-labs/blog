---
title: "Gradle 액션의 캐시와 이용 조건을 확인하고 v5에 남았습니다"
date: 2026-09-02T21:10:00+09:00
tags: ["라이선스","의존성","GitHub Actions","보안","오픈소스"]
slug: "version-bump-terms"
lang: "ko"
author: "Heejeong Kim"
summary: "setup-gradle v6의 기본 캐시는 별도 상용 구성요소를 사용했습니다. v5를 유지한 당시 판단과, v6.1에서 선택할 수 있는 MIT 기본 캐시를 구분해 적었습니다."
---

## 들어가며

두 앱의 `release.yml`을 업데이트하면서 `gradle/actions/setup-gradle`은 v5에 남겨뒀습니다. v6에서 기본으로 쓰는 캐시 구현과 이용 조건이 바뀌어 있었습니다.

## 기본 캐시 구현이 달라졌습니다

검토한 v6 계열의 `action.yml`에는 `cache-provider` 입력이 있었고 기본값은 `enhanced`였습니다. [v6.1.0의 입력 정의](https://github.com/gradle/actions/blob/v6.1.0/setup-gradle/action.yml)를 보면 선택지를 확인할 수 있습니다.

```yaml
cache-provider:
  default: 'enhanced'
```

`enhanced`는 `gradle-actions-caching`이라는 상용 구성요소를 사용합니다. `basic`은 GitHub Actions 캐시를 이용하는 공개 구현입니다. 기존 워크플로에서 옵션을 더하지 않고 버전만 올리면 기본값을 사용하게 되므로, 어느 쪽을 쓸지 확인할 필요가 있었습니다.

[v6.0.0 릴리스 노트](https://github.com/gradle/actions/releases/tag/v6.0.0)는 캐시 기능을 별도 구성요소로 분리했으며 해당 구성요소에 별도의 이용 조건이 적용된다고 설명합니다. 액션이 빌드와 호환되는지뿐 아니라, 기본 설정으로 무엇이 실행되는지도 달라진 것입니다.

## v6에는 MIT 캐시를 고르는 방법도 있습니다

처음 기록을 남길 때는 v6.0 릴리스 요약의 ‘업그레이드하면 이용약관을 받아들인다’는 설명을 보고 보수적으로 판단했습니다. 다만 v6을 쓰는 모든 경우에 같은 조건이 적용되는 것은 아니어서, 이 부분은 구분해서 적어 둡니다.

[v6.1.0 배포 문서](https://github.com/gradle/actions/blob/v6.1.0/DISTRIBUTION.md)는 액션 본체와 Basic Caching은 MIT이고, Enhanced Caching은 별도 라이선스라고 구분합니다. 독점 구성요소와 그 이용 조건을 선택하지 않으려면 다음 설정을 사용할 수 있다고 명시합니다.

```yaml
- uses: gradle/actions/setup-gradle@v6
  with:
    cache-provider: basic
```

이 설정에서는 상용 캐시 구성요소를 불러오거나 사용하지 않습니다. 따라서 v5 유지는 가능한 선택 중 하나였고, v6의 기본 캐시를 사용하는 방법도 검토 대상에 남습니다.

## 마치며

당시 CI는 약 13분이 걸렸고, 빌드 시간이 당장 해결해야 할 문제는 아니었습니다. v6을 적용해 성능 차이를 측정하지도 않았습니다. 약관과 기본값을 살펴본 뒤, 확인하지 않은 속도 개선을 위해 실행 환경을 바꾸기보다는 두 앱의 `setup-gradle`을 v5.x에 두기로 했습니다.

v6의 `basic` 설정은 다음 업데이트에서 검토할 선택지로 남았습니다.
