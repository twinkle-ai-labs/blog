# Post format and frontmatter

Posts live at `src/content/blog/<category>/<file>.md`. The category comes from the file path, while the public post name comes from `slug`.

Use this field order unless an existing post already has a deliberate variation:

```yaml
---
title: "글 제목"
date: 2026-09-02T20:00:00+09:00
tags: ["android","출시기"]
slug: "stable-kebab-case-slug"
lang: "ko"
author: "Heejeong Kim"
summary: "목록과 공유 카드에서 읽어도 글의 사건과 결과가 드러나는 요약입니다."
---
```

The schema also permits `draft` and `hidden` booleans. Add them only when needed.

## Invariants

- Preserve an existing `date` byte for byte unless the user explicitly requests a date change.
- Preserve an existing `slug` unless the user explicitly accepts the resulting URL change.
- Keep series number and title consistent with neighboring posts.
- Do not infer tags solely to increase reach. Reuse the repository's established tag spelling when applicable.
- Write a summary that reports the actual incident, constraint, and result. Do not use generic SEO language or claims absent from the post.
- Keep `lang: "ko"` and `author: "Heejeong Kim"` unless the user supplies different values.

Before adding a slug or series number, search all posts for duplicates and inspect adjacent entries in the same category.
