# 🌌 Twinkle Blog

[Pelican](https://getpelican.com/) 기반 개발 블로그 — [blog.twinklelabs.kr](https://blog.twinklelabs.kr)

macOS 메모 앱을 닮은 커스텀 테마(`pelican-twinkle`)를 사용한다. 라이트/다크 모드, 검색(⌘K), 우측 목차를 지원한다.

한국어가 본진이고, 영어는 `/en/` 서브사이트로 함께 만들어진다.

## 시작하기

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 개발

```bash
pelican -lr content -o output -s pelicanconf.py
```

한 번 빌드하면 한국어(`output/`)와 영어(`output/en/`) 두 벌이 함께 나온다.

## 글쓰기

`content/<카테고리>/` 아래에 `.md` 파일을 추가한다. **`Lang`은 반드시 적는다** —
비워두면 각 사이트가 자기 언어로 착각해서 한국어 글이 영어 사이트에도 나타난다.

```markdown
Title: 글 제목
Date: 2024-03-27 22:14
Tags: python, pelican
Slug: my-post
Lang: ko
Authors: Heejeong Kim
Summary: 한 줄 요약
```

### 번역 붙이기

**`Slug`가 같고 `Lang`만 다르면** 두 글은 같은 글의 번역본이 된다.
헤더의 언어 버튼이 서로를 가리키고, 번역이 없는 글은 상대 사이트에서 아예 빠진다.

```markdown
Title: Starting a Blog with Pelican
Slug: create-pelican-site      ← 한국어 글과 같은 slug
Lang: en
```

## 테마 문장 번역

테마 UI의 원문은 한국어이고, 영어는 `themes/pelican-twinkle/translations/en/` 에서 갈아 끼운다.
템플릿의 문장을 고치거나 추가했다면:

```bash
pip install Babel && make i18n
```

`Babel`은 번역 파일을 만들 때만 쓴다 — 빌드에는 필요 없어서 `requirements.txt`에는 없다.

문장을 다시 뽑아 `messages.po`를 갱신하고 `messages.mo`로 굽는다.
**`.mo`는 커밋한다** — CI는 컴파일하지 않고 있는 그대로 쓴다.
새 문장은 `.po`에 빈 `msgstr`로 들어오므로 채워 넣은 뒤 `make i18n`을 한 번 더 돌린다.

자바스크립트가 쓰는 문장은 `template/base.html`의 `window.I18N`을 거친다 —
js 파일 하나를 두 사이트가 함께 쓰기 때문이다.

## 배포

`master`에 푸시하면 GitHub Actions가 빌드해서 `gh-pages` 브랜치로 자동 배포한다.

## 구조

```
├── content/                    # 글 (.md)
├── themes/
│   └── pelican-twinkle/
│       ├── templates/          # Jinja 템플릿
│       ├── translations/en/    # 영어 UI 번역 (.po / .mo)
│       └── plugins/            # 내장 플러그인
├── babel.cfg                   # 번역 문장 추출 규칙
├── pelicanconf.py              # 개발 설정 + 다국어 설정
└── publishconf.py              # 배포 설정
```
