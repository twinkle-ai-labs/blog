---
title: "안드로이드를 만들며 9 — 공유 QR을 스토어 주소에서 App Links로 바꾸기"
date: 2026-09-02T19:00:00+09:00
tags: ["딥링크","App Links","QR","공유","Android"]
slug: "app-links-qr"
lang: "ko"
author: "Heejeong Kim"
summary: "공유 QR에 스토어 주소가 들어 있어 앱을 설치한 사람도 스토어를 거쳐야 했습니다. QR을 자체 도메인으로 바꾸고 앱의 경로 선언, 도메인 검증, 웹의 스토어 이동을 연결했습니다."
---

## 들어가며

물타기 계산기를 이미 설치한 기기에서 공유 그림의 QR을 찍었는데 Play 스토어가 열렸습니다. 앱에 들어가려면 ‘열기’를 한 번 더 눌러야 했습니다. QR에 스토어 주소를 직접 넣어 둔 탓이었습니다.

앱이 있으면 바로 열고, 없으면 웹을 거쳐 스토어로 보내도록 바꿨습니다. QR 주소뿐 아니라 앱의 매니페스트와 도메인의 검증 파일도 함께 준비해야 했습니다.

## 설치 여부와 관계없이 열리는 주소

`mycalc://open` 같은 커스텀 스킴도 생각할 수 있지만, 앱이 없는 기기에서는 열 곳이 없습니다. 공유 그림은 앱을 설치하지 않은 사람도 보므로 HTTPS 주소를 쓰는 App Links로 연결했습니다.

QR에는 `https://twinklelabs.kr/app/stock-calculator`를 넣었습니다. 앱이 받을 주소를 매니페스트에 선언하고, 그 앱이 우리 도메인의 링크를 받아도 되는지 도메인 쪽에서 검증하게 했습니다.

## 앱이 받을 호스트와 경로

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="https"
        android:host="twinklelabs.kr"
        android:pathPrefix="/app/stock-calculator" />
</intent-filter>
```

`autoVerify="true"`를 지정하면 OS가 설치 시점에 도메인의 검증 정보를 확인합니다. 검증이 통과해야 해당 주소를 앱으로 연결할 수 있습니다.

주소 범위는 `pathPrefix`로 `/app/stock-calculator`에 한정했습니다. 도메인만 지정하면 같은 호스트의 다른 웹 페이지까지 앱이 받게 됩니다. 앱으로 연결할 페이지와 웹에서 읽을 페이지를 구분해야 했습니다.

## 도메인이 확인해 줄 앱 서명 키

검증 파일은 도메인 루트의 정해진 주소에 둡니다. 사용한 주소는 `https://twinklelabs.kr/.well-known/assetlinks.json`입니다.

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "kr.twinklelabs.stockcalculator",
    "sha256_cert_fingerprints": ["8E:CB:…:03"]
  }
}]
```

이 파일은 패키지 이름과 서명 인증서 지문으로 연결할 앱을 특정합니다. 이때 업로드 키와 앱 서명 키를 구분해야 했습니다.

- 업로드 키는 개발자가 번들을 올릴 때 사용하는 키입니다.
- 앱 서명 키는 Play가 사용자에게 배포할 APK에 사용하는 키입니다.

Play 앱 서명을 사용하면 사용자 기기의 APK는 앱 서명 키로 서명됩니다. 따라서 `assetlinks.json`에도 이 지문이 필요합니다. Play Console의 ‘앱 무결성 → 앱 서명’에서 제공하는 assetlinks 스니펫을 확인했습니다. 업로드 키로 서명한 사이드로드 빌드도 연결하려면 그 지문을 배열에 함께 넣을 수 있습니다.

## 앱이 없을 때는 웹에서 스토어로

`https://twinklelabs.kr/app/stock-calculator`는 브라우저에서도 열리는 페이지여야 합니다. 앱이 없는 기기에서는 이 페이지가 요청을 받습니다.

페이지는 스토어로 이동시키면서 `utm_source=share` 같은 유입 경로 값을 붙입니다. QR에는 짧은 주소만 담고, 스토어로 전달할 집계 정보는 웹에서 덧붙이도록 나눴습니다.

## 계산 결과를 URL에서 뺀 이유

처음 주소는 `/stock-calculator/app`이었습니다. 같은 날 Pocket PDF의 `/app/pocket-pdf`와 형식을 맞추면서 `/app/stock-calculator`로 옮겼습니다. [두 앱과 웹의 경로를 정리한 과정](/pocket-pdf/app-links-three-repos-deep-link.html)은 출시기에 남겼습니다.

링크에는 앱으로 들어오는 데 필요한 주소만 남겼습니다. 처음에는 계산 값을 쿼리에 넣고 받는 기기에서 리포트를 다시 구성하는 화면까지 만들었지만 제거했습니다. 공유 그림 구석의 작은 QR은 한 칸 4px, 주소 약 106바이트라는 크기 제약이 있었습니다. 종목 이름을 포함한 링크는 그 범위에 들어가지 않았습니다.

계산 결과는 이미 공유 그림에 표시되어 있습니다. 리포트를 링크에 다시 담기보다 QR이 안정적으로 읽히는 쪽을 선택했습니다. 주소의 역할이 바뀌었으므로 이름도 `share_store_url`에서 `share_app_url`로 바꿨습니다.

## 마치며

앱 코드를 머지한 것만으로는 검증이 끝나지 않습니다. `.well-known/assetlinks.json`이 실제 도메인에서 제공되어야 설치 시점 검증이 통과합니다. 당시 웹은 main에 푸시할 때 배포되므로, 웹 배포 전에는 앱 코드가 준비되어 있어도 링크가 브라우저로 열렸습니다.

기기에서 검증 상태는 다음 명령으로 확인합니다.

```bash
adb shell pm get-app-links kr.twinklelabs.stockcalculator
```

이 결과의 `verified`가 앱 코드와 도메인 설정이 실제로 연결됐는지 확인할 기준입니다.
