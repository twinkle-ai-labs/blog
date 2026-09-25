# 🌌 Twinkle Blog

[Astro](https://astro.build/) 기반 개발 블로그 — [blog.twinklelabs.kr](https://blog.twinklelabs.kr)

Aurora Ledger 토큰을 사용하는 개발 블로그다. 시스템 테마 + 라이트·다크 전환,
검색(⌘K / Ctrl+K), 반응형 목차, 이전/다음 글, giscus 댓글, Atom 피드를 지원한다.

첫 화면은 최신 글 하나와 이어지는 글 네 편, 시리즈 탐색으로 구성한다.
시리즈는 주제·최근 글·글 수를 함께 보여주며, 태그는 검색어로 좁힐 수 있다.
모바일에서는 메뉴와 본문 목차를 펼쳐 사용한다.

## 시작하기

```bash
npm install
```

## 개발

```bash
npm run dev        # http://localhost:4321
npm run build      # dist/ 에 정적 빌드
npm run preview    # 빌드 결과 미리보기
```

## 글쓰기

`src/content/blog/<카테고리>/` 아래에 `.md` 파일을 추가한다.
폴더 이름이 곧 카테고리(시리즈)다. 글의 URL 은 `/<카테고리>/<slug>.html` 이 된다.

```markdown
---
title: "글 제목"
date: 2024-03-27T22:14:00+09:00
tags: ["android", "compose"]
slug: "my-post"
lang: "ko"
author: "Heejeong Kim"
summary: "한 줄 요약"
---

본문…
```

- `draft: true` — 목록·피드에서 빠지고 `/drafts/` 에 모인다.
- `hidden: true` — 목록·피드에서 빠지지만 URL 은 살아 있고 `/hidden/` 에 모인다.
- 새 카테고리를 추가하면 `src/lib/site.ts` 의 `CATEGORIES` 에 표시 이름을 등록한다.

## 배포

`master` 에 푸시하면 GitHub Actions 가 빌드해서 `gh-pages` 브랜치로 자동 배포한다.
커스텀 도메인은 `public/CNAME` 으로 관리한다.

## 구조

```
├── public/                  # 그대로 복사되는 정적 파일 (images, robots.txt, CNAME)
├── src/
│   ├── content/blog/        # 글 (.md) — 폴더 = 카테고리
│   ├── content.config.ts    # 콘텐츠 컬렉션 스키마
│   ├── layouts/Base.astro   # 공통 레이아웃 (head, 오로라 배경, 검색, 테마 토글)
│   ├── components/          # Header, Footer, PostCard, Pagination, SearchModal
│   ├── pages/               # 라우트 — 구 Pelican URL 구조를 그대로 보존
│   ├── lib/                 # 사이트 상수, 글 조회 헬퍼, Atom 피드 생성
│   └── styles/              # 정본 토큰 사본 + 기본/목록·탐색·본문·검색 스타일
└── astro.config.mjs         # build.format 'preserve' — *.html URL 유지
```

## URL 구조 (구 Pelican 사이트와 동일)

| 경로 | 내용 |
| --- | --- |
| `/`, `/page/N/` | 글 목록 (5개씩) |
| `/<category>/<slug>.html` | 글 |
| `/category/<slug>/`, `/tag/<slug>/` | 카테고리·태그별 목록 |
| `/archives.html`, `/categories.html`, `/tags.html` | 모아보기 |
| `/feeds/all.atom.xml`, `/feeds/<category>.atom.xml` | Atom 피드 |
| `/sitemap.xml`, `/robots.txt` | 검색엔진용 |
