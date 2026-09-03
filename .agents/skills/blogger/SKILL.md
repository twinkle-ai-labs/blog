---
name: blogger
description: Write, rewrite, or review Korean posts for the Twinkle AI Labs Astro blog. Use for work on src/content/blog, including turning development notes into posts, editing existing series, matching the author's voice, and checking posts before publication.
---

# Blogger

Write this blog as a first-person record of work that actually happened. Preserve evidence and the author's point of view; do not manufacture anecdotes, emotions, dialogue, measurements, causes, or outcomes.

## Choose the mode

- **Draft:** Turn supplied notes, code, diffs, or repository evidence into a new post.
- **Rewrite:** Improve an existing post without changing its factual claims, dates, code, links, series order, or intended conclusion.
- **Review:** Report factual gaps, repetitive AI-like phrasing, structural problems, broken metadata, and unsupported claims. Do not edit unless the user asked for changes.

For drafting or rewriting, read [references/voice.md](references/voice.md) completely before writing. For a new post or any metadata change, also read [references/frontmatter.md](references/frontmatter.md). Before delivering any changed post, read and apply [references/review-checklist.md](references/review-checklist.md).

## Establish the evidence

Inspect the relevant notes and repository files before drafting. Separate what is directly supported from what would be an inference. Ask only when a missing fact would materially change the story; otherwise omit unsupported detail or label an inference plainly.

When editing an existing post, inventory its date, slug, URLs, code, commands, numbers, product names, and stated chronology first. Keep them unless the user explicitly requests a factual change. Never silently "improve" a technical explanation beyond what the evidence establishes.

## Write and edit

Anchor the post in one concrete event or decision. Prefer chronological discovery when it makes the debugging story easier to follow; use a different structure when the material calls for it. Explain only the technical background needed to understand the event.

Keep useful irregularity in paragraph and sentence length. Let specific facts carry emphasis instead of bolding every conclusion. A post does not need a moral, a three-item list, a recap, or a next-post teaser. Use them only when they genuinely help.

For a full-blog rewrite, work post by post. Do not apply a blind global replacement as the substantive edit. Repeated-pattern cleanup may be mechanical only after each post's meaning and local context have been reviewed.

## Preserve scope

- Do not change `date` unless the user explicitly asks.
- Do not publish, commit, push, or change unrelated site code without an explicit request.
- Preserve working-tree changes that predate the task.
- Keep internal links and series numbering consistent with existing routes.
- Do not add SEO claims, performance numbers, user reactions, or business results without evidence.

## Verify

Run `node .agents/skills/blogger/scripts/validate-posts.mjs` after changing posts. Then run the repository build for changes that could affect rendering or metadata. Review the diff for changed dates and accidental edits outside `src/content/blog` before finishing.

Summarize which posts changed, whether dates changed, and which checks passed. Do not claim the prose is "human" merely because a pattern check passed; describe the concrete editorial changes instead.
