---
title: "블로그의 canonical은 404였고 공유 카드는 0장이었습니다"
date: 2026-08-24T12:40:00+09:00
tags: ["seo","astro","nextjs","정적사이트","자동화"]
slug: "seo-head-lies"
lang: "ko"
author: "Heejeong Kim"
summary: "SEO를 점검하다 실제 페이지와 다른 canonical 주소, 한글을 한자로 판정하는 정규식을 찾았습니다. 주소와 문자 범위를 고치고 생성된 HTML과 이미지 파일을 대조했습니다."
---

## 들어가며

블로그에 글별 공유 카드를 만들던 날, 빌드가 끝난 `dist/og/` 폴더에 파일이 하나뿐이었습니다. 글별 이미지는 하나도 생성되지 않았습니다. HTML은 만들어졌고 빌드도 성공한 상태였습니다.

HTML의 canonical도 글이 열리는 주소와 달랐습니다. 본문 화면은 멀쩡한데, 공유 이미지와 대표 주소가 둘 다 잘못돼 있었습니다.

## canonical에 .html이 빠졌습니다

이 블로그는 Pelican을 쓰던 때의 URL을 유지합니다. 글과 일부 목록 페이지는 다음처럼 `.html`로 끝납니다.

```
/android/aapt-string-newline.html
/archives.html
```

공통 레이아웃에서는 `Astro.url.pathname`으로 canonical을 만들고 있었습니다.

```ts
const canonical = new URL(Astro.url.pathname, SITE.url).href;
```

당시 생성 결과에서는 두 주소가 이렇게 달랐습니다.

```
실제 주소   /android/aapt-string-newline.html
pathname   /android/aapt-string-newline/
```

뒤의 주소에는 GitHub Pages가 제공할 파일이 없었습니다. 독자는 `.html` 주소에서 글을 읽을 수 있지만, HTML에 적힌 대표 URL은 404로 연결되는 상태였습니다.

공통 레이아웃에 `path`를 받는 속성을 추가했습니다. 글 페이지는 `postUrl(post)`를 쓰고, 목록 페이지는 실제 경로를 전달하게 했습니다.

```astro
<Base path={postUrl(post)}>      <!-- /android/foo.html -->
<Base path="/archives.html">
```

이렇게 만들어진 canonical이 실제 파일 경로와 일치하는지 결과 HTML에서 확인했습니다.

## 한자를 거르려다가 한글 제목도 제외했습니다

공유 카드에는 저장소의 Pretendard를 사용했습니다. 사용하던 폰트로 표시할 수 없는 한자가 제목에 있으면 글별 카드 생성을 건너뛰도록 했습니다. 이때 작성한 정규식이 문제였습니다.

```ts
const HAN = /[㐀-䶿一-鿿豈-﫿]/;
```

마지막 범위의 시작 문자 `豈`를 호환 한자 블록의 첫 글자인 U+F900으로 알고 적었습니다. 실제로 이 문자의 코드포인트는 U+8C48이었습니다.

```
의도한 범위   U+F900 – U+FAFF
실제 범위     U+8C48 – U+FAFF
한글 음절     U+AC00 – U+D7A3
```

실제 범위 안에는 한글 음절이 전부 들어 있었습니다.

```js
HAN.test('안드로이드를 만들며 배운 것')  // → true
```

이 범위에 걸린 한글 제목을 전부 건너뛰고 있었습니다. 이미지를 만들다가 실패한 게 아니어서 생성 오류도 없었습니다. 빌드 로그에는 HTML 68장을 만들었다고 나왔습니다.

문자 범위를 코드포인트로 고쳤습니다.

```ts
const HAN = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
```

수정 뒤에는 글별 이미지가 생성됐습니다. HTML의 `og:image`가 가리키는 파일이 실제로 있는지도 canonical과 함께 대조했습니다.

## 같은 날 공유 카드에서 더 고친 부분

홈, 디자인 시스템, 약관 보관소도 함께 점검하고 있었습니다. Next.js로 만든 사이트에서는 레이아웃에 적은 이미지 설정이 페이지의 `openGraph`에 의해 사라졌습니다.

```ts
// layout.tsx
export const metadata = { openGraph: { images: [...], siteName: ... } }

// page.tsx
export const metadata = { openGraph: { title: '...' } }
```

페이지에서 제목만 바꾸려 했지만, 이 설정은 `openGraph` 객체를 필드별로 합치지 않았습니다. `shareCard()`가 이미지와 사이트 이름을 포함한 객체를 만들고, 페이지에서는 제목·설명·주소를 전달하는 방식으로 모았습니다.

satori로 그린 카드의 작은 머리말에는 `letterSpacing: 2`를 주었다가 공백 하나가 사라졌습니다.

```
넣은 글자   안드로이드를 만들며 배운 것
그려진 글자  안드로이드를만들며 배운 것
```

그 부분의 자간 설정을 제거해 낱말이 붙지 않게 했습니다.

Next.js 정적 내보내기에서는 `opengraph-image` 규약으로 만든 파일에 확장자가 없었습니다. GitHub Pages에서 이미지로 제공할 주소를 분명히 하기 위해 `.png` 경로를 가진 라우트로 바꿨습니다.

```
src/app/og.png/route.tsx  →  out/og.png
```

메타데이터도 이 주소로 바꿨습니다.

## 마치며

마지막에는 각 사이트에서 생성한 HTML을 열어 canonical과 공유 이미지가 실제 파일을 가리키는지 대조했습니다. 빌드는 처음에도 통과했으므로, 이번에는 생성됐다는 로그에 더해 결과 파일과 그 파일을 가리키는 주소까지 확인했습니다.
