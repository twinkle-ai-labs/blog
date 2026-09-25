---
title: "조용히 실패하는 것들 6 — PDF는 만들어졌지만 한글을 검색할 수 없었습니다"
date: 2026-09-02T18:30:00+09:00
tags: ["OCR","ML Kit","PDF","폰트","Android"]
slug: "korean-text-layer"
lang: "ko"
author: "Heejeong Kim"
summary: "Pocket PDF로 스캔한 한국어 문서에서 검색이 되지 않았습니다. 글자층의 한글을 공백으로 바꾸던 코드를 찾고, 한글 폰트를 넣은 뒤 ToUnicode에서 원문이 복원되는지 확인했습니다."
---

Pocket PDF로 한국어 계약서를 스캔한 뒤 PDF에서 ‘계약서’를 검색했지만 결과가 나오지 않았습니다. PDF는 정상적으로 열렸고, 화면의 글자도 또렷했습니다.

홈 화면에는 ‘찍은 문서가 검색되는 깨끗한 새 문서로’, 빈 화면에는 ‘자동 보정 후 검색 가능한 PDF로’라고 안내하고 있었습니다. 한국을 주 시장으로 삼은 앱에서, 안내한 기능이 한글 문서에는 동작하지 않았습니다.

## 화면에 보이는 글자와 검색할 글자는 따로 있습니다

스캔한 문서는 글자가 그려진 이미지입니다. 검색과 복사를 하려면 OCR로 이미지 속 글자와 위치를 읽은 뒤, 그 결과를 PDF에 텍스트로 넣어야 합니다.

Pocket PDF는 스캔 이미지와 같은 자리에 보이지 않는 글자층을 얹는 방식을 사용했습니다. 화면에는 원래 이미지가 보이고, 검색이나 선택은 그 위에 배치한 텍스트를 대상으로 이뤄집니다.

OCR에는 Google ML Kit의 Text Recognition을 사용합니다. 문서를 외부로 보내지 않는다는 제품의 약속에 맞춰 기기 안에서 처리합니다.

```kotlin
private val recognizer = TextRecognition.getClient(
    KoreanTextRecognizerOptions.Builder().build()
)
```

한국어 인식기를 만든 뒤 비트맵을 전달합니다.

```kotlin
val inputImage = InputImage.fromBitmap(bitmap, 0)
val visionText = recognizer.process(inputImage).await()
```

`KoreanTextRecognizerOptions`는 한글과 라틴 문자를 읽습니다. 일본어와 중국어에는 각각 다른 인식기와 모델이 필요합니다. 어떤 문자가 결과에 나올 수 있는지는 이 선택에 따라 달라집니다.

ML Kit 결과는 블록, 줄, 낱말(element)로 나뉘며 각 단계에 `boundingBox`가 붙습니다. 예를 들어 ‘보증금’이 이미지의 (320, 480)에 있는 90×40 픽셀 영역이라면, PDF에 놓인 이미지의 크기와 위치에 맞춰 그 좌표를 환산합니다. 검색한 글자의 강조 영역과 이미지가 맞도록 배치하는 과정입니다.

```kotlin
contentStream.setRenderingMode(RenderingMode.NEITHER)  // 그리지도, 외곽선도 없이
contentStream.beginText()
contentStream.setFont(font, height * 0.85f)
contentStream.newLineAtOffset(left, bottom)
contentStream.showText(text)
contentStream.endText()
```

`RenderingMode.NEITHER`는 글자를 채우거나 외곽선을 그리지 않는 모드입니다. 텍스트를 배치하면서 화면에는 보이지 않게 합니다.

## 글자층을 만드는 코드가 한글을 공백으로 바꿨습니다

기존 글자층은 PDF 표준 14 폰트 중 하나인 Helvetica를 사용했습니다. 폰트 파일을 따로 넣지 않아도 쓸 수 있다는 이유였습니다.

```kotlin
val font = PDType1Font.HELVETICA
```

이 폰트로 처리하지 못하는 문자를 피하려고 `sanitize` 함수에는 다음 조건이 들어 있었습니다.

```kotlin
ch.isLetterOrDigit() || ch.isWhitespace() ->
    sb.append(if (ch.code < 256) ch else ' ')
```

문자나 숫자를 처리하는 분기에서 코드값이 256 이상이면 공백을 넣습니다. 255까지의 문자만 남기는 조건입니다. 한글 음절은 U+AC00(44032)부터 시작하므로 모두 공백이 됐습니다. OCR이 정확히 읽었더라도 PDF에 넣는 단계에서 한글을 잃은 것입니다.

예외나 로그는 없었습니다. 스캔 이미지는 그대로 남아 있어 PDF를 눈으로 확인하는 것만으로는 텍스트가 사라진 사실을 알기 어려웠습니다.

## 좌표 계산을 모으다가 발견했습니다

당시 하던 일은 스캔 → PDF와 이미지 → PDF에 나뉘어 있던 글자층 코드를 `InvisibleTextLayer` 한 곳으로 모으는 작업이었습니다. 좌표 계산이 두 벌로 갈리는 것을 막으려던 중이었습니다.

코드를 옮기면서 몇 달 동안 다시 읽지 않았던 `sanitize` 함수도 확인했습니다. 그 과정에서 256 이상을 공백으로 바꾸는 조건을 찾았습니다. 중복을 정리하기 위해 다시 읽은 코드에서 검색 실패의 원인이 드러났습니다.

## 앱에 있던 Pretendard로 글자층 폰트를 만들었습니다

한글 글리프가 있는 폰트를 PDF에 넣기로 했습니다. 앱에 이미 OFL 라이선스의 Pretendard와 라이선스 고지가 있었으므로 새 폰트를 추가로 받을 필요는 없었습니다.

`tools/bake-ocr-font.py`에서 필요한 문자만 남기고 PDFBox가 읽을 형식으로 변환했습니다. 문자 범위의 기준은 앱이 지원하는 열한 언어가 아니라 OCR 인식기가 반환할 수 있는 문자였습니다. 한국어 인식기 하나를 사용하는데, 결과에 나오지 않을 일본어 글리프까지 넣을 필요는 없었습니다.

남긴 문자는 한글 음절 11,172자, 라틴 문자, 통화 기호(₩ € £), 문장부호를 합쳐 11,721자였습니다. Pretendard의 OTF(CFF) 데이터를 `PDType0Font`가 읽는 TrueType `glyf` 형식으로 바꾸는 데는 cu2qu를 사용했습니다.

변환한 2.14 MB 폰트를 assets에 넣고 다음과 같이 읽었습니다.

```kotlin
context.assets.open("ocr_text_layer.ttf").use {
    PDType0Font.load(document, it, /* embedSubset = */ true)
}
```

`embedSubset = true`로 설정하면 실제로 사용한 글리프만 PDF에 들어갑니다. 폰트가 약 2 MB라고 해서 문서마다 같은 용량이 추가되지는 않습니다. 측정한 한글 한 줄짜리 PDF는 4 KB였습니다. 전체 폰트 파일은 APK에 한 번 포함됩니다.

## 만든 PDF에서 원문을 다시 읽었습니다

폰트를 넣었다는 사실만으로 검색을 확인할 수는 없습니다. PDF의 글리프와 유니코드를 연결하는 ToUnicode 표에서도 원문이 유지되는지 봐야 했습니다.

pdfbox-android를 JVM에서 실행해 PDF를 만들고, ToUnicode를 되읽어 다음 문자열이 그대로 나오는지 확인했습니다.

> 계약서 임대차 보증금 ₩1,850,000 café

이 검사는 한글, 통화 기호, 숫자, 라틴 문자가 텍스트층에 남았는지를 확인합니다. 모든 PDF 뷰어의 동작을 시험한 것은 아닙니다. 이번에 확인한 범위는 이미지가 보이는지에 더해, 생성된 PDF에서 검색에 필요한 원문을 복원할 수 있는지까지였습니다.
