---
title: "안드로이드를 만들며 11 — 글자층을 싣는 것과 검색이 되는 것은 다른 말입니다"
date: 2026-09-02T21:30:00+09:00
tags: ["안드로이드","PDF","OCR","폰트","Pretendard"]
slug: "ocr-font-baking"
lang: "ko"
author: "Heejeong Kim"
summary: "이미지 스캔본 위에 투명 텍스트를 얹어 검색 가능한 PDF를 만들었습니다. 그런데 글꼴 파일이 PDF에 들어갔다는 것과 뷰어에서 실제로 검색이 된다는 것은 전혀 다른 문제였습니다. ToUnicode 맵과 폰트 서브셋 베이킹의 집착을 정리합니다."
---

스캔한 이미지나 사진 문서에서 글자를 추출해 ‘검색 가능한 PDF(Searchable PDF)’를 만드는 기능을 개발하고 있었습니다.

원리는 간단해 보입니다.

1. ML Kit 등으로 이미지 내 글자와 바운딩 박스(Bounding Box) 좌표를 읽는다.
2. PDF 페이지 위에 원본 이미지를 깔고, 그 위에 정확한 위치와 크기로 투명 글자층(Invisible Text Layer)을 인쇄한다.
3. 겉으로는 깨끗한 스캔본으로 보이지만, 사용자가 드래그해서 복사하거나 돋보기로 검색하면 글자가 잡힌다.

그런데 화면에는 분명히 글자층이 올라갔다고 뜨고 파일 용량도 늘어났는데, 한글 검색이 단 한 글자도 되지 않았습니다.

# 폰트가 들어갔는데 왜 검색이 안 될까?

PDF 명세에서 글자가 뷰어에 검색되고 복사되려면 단순히 글리프(외형)를 그리는 것만으로는 부족합니다.

PDF 리더는 페이지 내 글리프 인덱스를 유니코드 문자로 변환하기 위해 `/ToUnicode` CMap(문자 맵)을 참조합니다.

- 영문 ASCII(0~127)는 표준 기본 폰트(Helvetica 등)로도 대부분의 리더가 유니코드를 알아챕니다.
- 하지만 한글(U+AC00 ~ U+D7A3)은 유니코드 매핑 테이블이 정확히 임베딩된 TrueType/OpenType 폰트가 PDF 바이너리 안에 내장되어 있지 않으면, 뷰어는 해당 자리를 깨진 물음표나 공백으로 인식합니다.

즉, ‘PDF 안에 폰트가 실렸다’는 것과 ‘뷰어가 그 폰트의 글리프를 유니코드로 읽을 수 있다’는 것은 완전히 다른 이야기였습니다.

# 11개 언어를 다 넣으면 앱이 터집니다

처음 든 생각은 "모든 언어를 지원하는 대형 Noto Sans CJK 폰트를 통째로 에셋에 넣자"였습니다.

하지만 CJK 통합 폰트는 파일 하나에 15MB ~ 30MB에 달합니다. 10MB 남짓한 가벼운 유틸리티 앱에 폰트 하나 때문에 용량이 서너 배로 불어나는 것은 용납할 수 없었습니다.

여기서 원칙을 세웠습니다.

> "폰트가 덮어야 하는 것은 '앱이 번역된 언어'가 아니라 'OCR 엔진이 인식해 뱉을 수 있는 글자 집합'이다."

앱 UI가 11개 언어를 지원한다고 해서 폰트까지 11개 언어의 글리프를 다 들고 있을 필요는 없습니다. OCR 인식기가 추출하는 한국어 완성형 2,350자와 기본 영문/특수기호만 있으면 충분합니다.

# Pretendard OFL에서 필요한 글자만 굽기 (`bake-ocr-font.py`)

우리는 오픈소스 폰트인 Pretendard(SIL Open Font License)를 기반으로, PDF 글자층 전용 경량 서브셋 폰트를 생성하는 스크립트를 작성했습니다.

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

결과물:
- 기존 18MB 폰트 → 380KB의 초경량 OTF 서브셋으로 압축.
- 앱 크기에 거의 영향을 주지 않으면서 완벽한 ToUnicode CMap 보장.

그리고 2026-08-23의 교훈을 잊지 않고, 이 스크립트를 임시 폴더가 아니라 프로젝트 저장소의 `tools/bake-ocr-font.py`에 영구 자산으로 보관했습니다.

# JVM 단위 테스트로 ToUnicode 역추출 검증

"빌드가 성공했으니 검색도 잘 되겠지"라는 짐작은 금물입니다.

우리는 안드로이드 기기를 켜지 않고도 JVM 환경에서 즉시 검증할 수 있도록 `pdfbox-android`를 활용한 파서 테스트 코드를 작성했습니다.

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

이 테스트가 초록불을 띄운 순간, 비로소 사용자가 안드로이드 기본 PDF 뷰어, Adobe Acrobat, 크롬 브라우저 어디서 열어도 한글이 온전히 검색되는 것을 확신할 수 있었습니다.

## 이번 작업에서 정한 기준

- 글자층을 얹는 것과 검색이 되는 것은 다릅니다. 핵심은 올바른 `/ToUnicode` 매핑입니다.
- 필요한 글자만 구워야 합니다. OCR이 뱉는 유니코드 범위를 명확히 규정하면 용량을 98% 줄일 수 있습니다.
- 다시 돌릴 스크립트는 반드시 저장소에 남깁니다.
- 눈으로 보지 말고 JVM 테스트로 ToUnicode를 역추출해 검증하세요.
