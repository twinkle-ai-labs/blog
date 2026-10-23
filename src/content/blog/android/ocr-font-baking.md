---
title: "안드로이드를 만들며 11 — PDF 글자층의 한글 검색과 폰트 서브셋 검증"
date: 2026-09-02T21:30:00+09:00
tags: ["안드로이드","PDF","OCR","폰트","Pretendard"]
slug: "ocr-font-baking"
lang: "ko"
author: "Heejeong Kim"
summary: "PDFBox에 넣을 한글 폰트가 필요했습니다. 저장소의 Pretendard OTF를 11,721자의 TTF로 변환하고, 생성한 PDF에서 한글 문장과 금액을 다시 읽었습니다."
---

## 들어가며

Pocket PDF의 [글자층에서 한글이 지워지는 문제](/silent-failures/korean-text-layer.html)를 고치려면 Helvetica를 대신할 폰트가 필요했습니다. 앱에서 쓰던 Pretendard를 가져오려 했지만, 저장소의 파일을 그대로 넣을 수는 없었습니다.

## 저장소의 Pretendard를 TrueType으로 변환

앱은 이미 SIL Open Font License로 배포되는 Pretendard를 사용하고 있었습니다. 다만 저장소의 파일은 CFF 윤곽선을 담은 OTF였고, 당시 PDFBox의 `PDType0Font`에 넣는 경로는 TrueType의 `glyf`가 필요했습니다.

`tools/bake-ocr-font.py`에서 필요한 글자만 남긴 뒤 CFF 곡선을 TrueType 곡선으로 옮겼습니다. `fontTools`의 서브셋 기능과 `Cu2QuPen`을 사용한 부분입니다.

```python
# tools/bake-ocr-font.py 중 윤곽선 변환 부분
pen = TTGlyphPen(None)
glyph_set[name].draw(
    Cu2QuPen(pen, CURVE_TOLERANCE, reverse_direction=True)
)
glyphs[name] = pen.glyph()
```

이 처리는 폰트 윤곽선을 변환합니다. PDF에서 검색할 문자를 되찾는 `/ToUnicode` 매핑은 PDF 생성 결과에서 별도로 확인해야 합니다.

## OCR이 읽는 문자에 맞춘 11,721자

앱 UI는 11개 언어를 지원하지만, 당시 OCR에는 `KoreanTextRecognizerOptions`를 사용하고 있었습니다. 폰트 범위도 그 인식기가 읽는 한글과 라틴 문자를 기준으로 정했습니다.

한글 음절 11,172자에 기본 라틴·라틴-1·라틴 확장-A, 통화 기호, 문장부호, 호환 자모, 전각 문자를 더했습니다. 생성한 `ocr_text_layer.ttf`에는 11,721자가 들어갔고 크기는 2.14MB였습니다. 일본어·중국어 문서를 지원하려면 글리프만 더하는 것으로는 부족하고 인식기도 추가해야 합니다.

변환은 다음 명령으로 다시 실행할 수 있도록 저장소에 남겼습니다.

```bash
python3 tools/bake-ocr-font.py
```

## 폰트와 문자 치환을 함께 바꿨습니다

`InvisibleTextLayer`는 새 폰트를 문서마다 한 번 읽도록 바꿨습니다. 실제 로딩 코드는 다음과 같습니다.

```kotlin
fun loadFont(context: Context, document: PDDocument): PDFont =
    try {
        context.assets.open(ASSET).use {
            PDType0Font.load(document, it, true)
        }
    } catch (_: Exception) {
        PDType1Font.HELVETICA
    }
```

`ASSET`은 `ocr_text_layer.ttf`이고 마지막 `true`는 PDF에 사용한 글자만 포함하도록 하는 옵션입니다. 앱에 넣는 폰트는 2.14MB여도 문서마다 전체 파일을 복제하지는 않습니다.

기존의 문자 치환은 표준 폰트로 돌아간 경우에만 실행하도록 제한했습니다.

```kotlin
val latinOnly = font is PDType1Font
val sanitized = if (latinOnly) sanitizeToLatin(text) else text.trim()
```

새 폰트를 넣어도 이전 `sanitize`를 그대로 호출하면 한글이 다시 공백이 됩니다. 폰트를 바꾼 것만큼 이 분기를 바꾸는 일이 필요했습니다.

## 생성한 PDF에서 문장을 다시 읽었습니다

`pdfbox-android`를 JVM에서 실행해 폰트 로딩, PDF 생성, 텍스트 추출을 확인했습니다. `android.util.Log`는 스텁을 두고 CMap 자원은 클래스패스에 올렸습니다.

확인에 사용한 문장은 다음과 같습니다.

> 계약서 임대차 보증금 ₩1,850,000 café

생성한 PDF는 약 4KB였고, `/ToUnicode`를 통해 되읽은 문장도 입력과 같았습니다. 한글뿐 아니라 원화 기호, 숫자, 악센트가 있는 라틴 문자까지 되찾을 수 있었습니다.

## 마치며

당시 여기까지는 JVM에서 확인했습니다. 실제 기기로 한국어 영수증을 촬영하고 뷰어에서 검색하는 확인은 남아 있었습니다. 폰트 로딩 실패 시 Helvetica로 돌아가는 경로도 구현했지만, 그 경로를 실제로 통과시키는 검증은 별도로 남겼습니다.
