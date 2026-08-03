# 🌌 Twinkle Blog

[Pelican](https://getpelican.com/) 기반 개발 블로그 — [blog.twinklelabs.kr](https://blog.twinklelabs.kr)

macOS 메모 앱을 닮은 커스텀 테마(`pelican-twinkle`)를 사용한다. 라이트/다크 모드, 검색(⌘K), 우측 목차를 지원한다.

## 시작하기

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 개발

```bash
# 빌드 + 로컬 서버 (자동 리로드, http://localhost:8000)
pelican -lr content -o output -s pelicanconf.py
```

## 글쓰기

`content/<카테고리>/` 아래에 `.md` 파일을 추가한다.

```markdown
Title: 글 제목
Date: 2024-03-27 22:14
Tags: python, pelican
Slug: my-post
Authors: Heejeong Kim
Summary: 한 줄 요약
```

## 배포

`master`에 푸시하면 GitHub Actions가 빌드해서 `gh-pages` 브랜치로 자동 배포한다.

## 구조

```
├── content/          # 글 (.md)
├── themes/
│   └── pelican-twinkle/   # 커스텀 테마 + 플러그인
├── pelicanconf.py    # 개발 설정
└── publishconf.py    # 배포 설정
```
