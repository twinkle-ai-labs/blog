---
title: "안드로이드를 만들며 11 — PDF 글자층의 한글 검색과 폰트 서브셋 검증"
date: 2026-09-02T21:30:00+09:00
tags: ["안드로이드","PDF","OCR","폰트","Pretendard"]
slug: "ocr-font-baking"
lang: "ko"
author: "Heejeong Kim"
summary: "스캔 PDF에 투명 글자층을 넣었지만 한글을 검색할 수 없었습니다. 필요한 글자만 담은 폰트 서브셋을 만들고, 생성한 PDF에서 한글과 금액을 다시 추출하는 테스트를 추가했습니다."
---

스캔 이미지와 사진 문서를 검색 가능한 PDF로 만드는 기능을 개발했습니다. 이미지에서 글자와 위치를 읽고, 원본 이미지 위에 투명한 글자층을 얹는 방식입니다.

ML Kit 등에서 얻은 글자와 바운딩 박스(Bounding Box) 좌표를 PDF에 기록하면, 겉으로는 스캔본을 유지하면서 텍스트를 선택하거나 검색할 수 있습니다. 그런데 생성 결과에는 글자층이 추가됐다고 표시되고 파일 크기도 늘었지만, 한글 검색은 되지 않았습니다.

## 글리프를 넣는 것만으로는 부족했습니다

PDF에서 글자의 모양을 그리는 정보와 원래 문자를 알아내는 정보는 구분됩니다. PDF 리더는 `/ToUnicode` CMap을 통해 페이지의 문자 코드를 유니코드에 연결할 수 있습니다. 글꼴이 파일에 들어 있다는 사실만으로 검색과 복사가 되는지 판단할 수는 없었습니다.

영문 ASCII(0~127)는 Helvetica 같은 표준 기본 폰트에서도 리더가 처리하는 경우가 많았습니다. 한글(U+AC00 ~ U+D7A3)을 다루는 이번 구현에서는 글꼴의 글리프뿐 아니라 생성 PDF의 유니코드 매핑도 확인해야 했습니다. 매핑을 읽지 못하면 검색할 문자를 얻지 못하거나 공백·물음표로 추출될 수 있습니다.

## 앱 번역 언어와 PDF에 넣을 글자 범위를 나눴습니다

처음에는 Noto Sans CJK처럼 여러 언어를 지원하는 큰 폰트를 통째로 넣는 방법을 생각했습니다. CJK 통합 폰트는 하나에 15MB ~ 30MB에 달했습니다. 10MB 남짓한 유틸리티 앱에 더하면 폰트 하나 때문에 크기가 서너 배가 될 수 있었습니다.

앱 UI가 지원하는 11개 언어를 모두 폰트에 넣기보다, PDF 글자층에서 사용할 문자 범위를 따로 정했습니다. 이 작업에서는 한국어 완성형 2,350자와 기본 영문, 숫자, 특수기호를 서브셋 대상으로 삼았습니다.

이 범위를 정했다고 모든 OCR 결과의 글자가 포함되는 것은 아닙니다. 앱의 번역 언어 수와 폰트에 필요한 글자 수를 같은 기준으로 다루지 않으려는 선택이었습니다.

## Pretendard에서 필요한 글자만 추출했습니다

SIL Open Font License로 배포되는 Pretendard를 바탕으로 PDF 글자층 전용 폰트를 만드는 스크립트를 작성했습니다.

```python
# tools/bake-ocr-font.py
# 현대 한글 2,350자 + 영문/숫자 + 기본 기호 + 화폐 기호(₩, $, €, ¥)만 추출
import fontTools.subset

def bake():
    options = fontTools.subset.Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    # 유니코드 매핑 ToUnicode 무결성 보존
    ...
```

구체적인 추출 처리를 생략한 예시입니다. 필요한 글자와 화폐 기호를 남긴 결과, 기존 18MB 폰트는 380KB OTF 서브셋이 됐습니다. 크기가 약 98% 줄었습니다. 다만 파일 크기와 폰트 생성 성공 여부만으로 PDF의 텍스트 매핑까지 검증할 수는 없습니다.

2026-08-23에 다시 실행할 도구를 남겨야 한다고 정한 뒤였으므로, 이번 스크립트는 임시 폴더 대신 저장소의 `tools/bake-ocr-font.py`에 보관했습니다.

## 생성 PDF에서 텍스트를 다시 추출했습니다

`pdfbox-android`로 생성 결과를 읽는 JVM 테스트를 작성했습니다.

```kotlin
@Test
fun verify_korean_searchable_pdf_to_unicode() {
    val pdfBytes = createSampleSearchablePdf("계약서 임대차 보증금 ₩1,850,000 café")

    val document = PDDocument.load(pdfBytes)
    val stripper = PDFTextStripper()
    val extractedText = stripper.getText(document)

    // ToUnicode 매핑이 완벽한지 한 글자씩 대조
    assertThat(extractedText).contains("계약서")
    assertThat(extractedText).contains("보증금")
    assertThat(extractedText).contains("₩1,850,000")
}
```

테스트는 PDF에서 추출한 텍스트에 ‘계약서’, ‘보증금’, ‘₩1,850,000’이 포함되는지 확인합니다. 생성한 파일에 글자층이 있다는 표시를 보는 데서 끝내지 않고, 그 안에서 필요한 문자열을 되찾을 수 있는지 확인한 것입니다.

이 테스트가 통과한 범위는 해당 PDF와 검사한 문자열의 추출입니다. 안드로이드 기본 PDF 뷰어, Adobe Acrobat, 크롬 브라우저의 모든 검색 동작까지 이 결과 하나로 보장할 수는 없습니다. 폰트 서브셋과 PDF 생성 과정을 바꿀 때 같은 추출 검사를 반복할 수 있도록 남겼습니다.
