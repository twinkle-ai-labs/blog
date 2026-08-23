# 🌌 Twinkle Blog

[Astro](https://astro.build/) 기반 개발 블로그 — [blog.twinklelabs.kr](https://blog.twinklelabs.kr)

오로라(Aurora) 스타일 커스텀 테마를 사용한다. 다크 모드 기본 + 라이트 토글,
검색(⌘K), 우측 목차(TOC), 이전/다음 글, Disqus 댓글, Atom 피드를 지원한다.

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
tags: ["python", "pelican"]
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
│   └── styles/global.css    # 오로라 테마 토큰과 전체 스타일
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
