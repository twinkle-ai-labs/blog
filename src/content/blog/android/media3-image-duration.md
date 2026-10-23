---
title: "안드로이드를 만들며 16 — 사진 길이를 줬는데 Media3가 트랙을 찾았다"
date: 2026-10-22T00:00:00+09:00
tags: ["android","검사","영상"]
slug: "media3-image-duration"
lang: "ko"
author: "Heejeong Kim"
summary: "사진을 넣은 영상 내보내기가 Asset loader error로 멈췄습니다. EditedMediaItem의 길이 설정과 별개로 MediaItem에 이미지 표시 시간을 지정해야 했습니다."
---

## 들어가며

Phone Cleaner의 편집기에 사진을 넣고 내보냈더니 약 6초 뒤에 실패했습니다. 2026년 10월 15일의 기록입니다. 화면에는 “저장하지 못했어요”만 나왔습니다.

사진을 몇 초 동안 보여줄지는 이미 지정하고 있었습니다. `EditedMediaItem.Builder`에 `setDurationUs`와 `setFrameRate`를 넣은 상태였습니다.

## 로그가 가리킨 입력 로더

`onError`에서 예외를 로그로 남기자 `ExportException: Asset loader error`와 함께 오디오나 비디오 트랙이 없다는 원인이 나왔습니다. 입력 이미지의 `MediaItem`에 표시 시간을 지정하라는 안내도 있었습니다.

사진에는 읽어 낼 영상 트랙이 없습니다. 당시 사용한 Media3 경로에서는 `MediaItem`에 이미지 표시 시간이 없으면 사진을 이미지 로더로 넘기지 못했습니다. 편집 항목에 적은 전체 길이는 그 앞의 입력 처리 문제를 해결하지 못했습니다.

## MediaItem에 이미지 표시 시간 지정하기

수정은 입력 항목을 만드는 쪽에 들어갔습니다. 흐름을 줄이면 이렇습니다.

```kotlin
val mediaItem = MediaItem.Builder()
    .setUri(uri)
    .setMimeType(mimeType)
    .setImageDurationMs(durationMs)
    .build()
```

사진의 MIME 타입과 표시 시간을 `MediaItem`에 명시했습니다. [Media3 Transformer 문서](https://developer.android.com/media/media3/transformer/transformations)도 이미지 입력의 표시 시간을 `MediaItem.Builder.setImageDurationMs`로 지정하고, 프레임 속도는 `EditedMediaItem.Builder.setFrameRate`로 설정하는 예를 제공합니다.

여기에는 단위 차이도 있습니다. `setDurationUs`는 마이크로초이고 `setImageDurationMs`는 밀리초입니다. 기존 값을 같은 숫자로 옮기는 방식으로 고칠 수는 없었습니다.

## 마치며

화면에는 짧은 실패 문구를 두고, 로그에는 예외를 남기게 했습니다. “저장하지 못했어요”만으로는 파일을 쓰다가 실패했는지, 입력 사진을 읽기도 전에 실패했는지 알 수 없었습니다. 이번에는 입력을 여는 쪽이었습니다.

<!-- 근거: vault/TIL/2026-10-15-Media3 recognises a photo only by imageDurationMs.md; Phone Cleaner data/VideoRepository.kt -->
