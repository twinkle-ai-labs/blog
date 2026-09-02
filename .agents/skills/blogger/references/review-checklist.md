# Editorial review checklist

Read the finished post once for facts and once for prose. Do not combine the passes.

## Evidence pass

- Every number, date, version, result, and causal claim is supported by supplied material or repository evidence.
- No attempt, emotion, user response, or conversation was invented.
- Code and command samples still express the behavior described around them.
- Existing date, slug, links, and series number remain unchanged unless requested.
- The title and summary match what the body actually establishes.

## Prose pass

- The opening reaches a concrete event quickly.
- Background appears before the point where it becomes necessary, but not much earlier.
- Adjacent paragraphs do different jobs.
- Sentence endings and paragraph lengths do not fall into a mechanical rhythm.
- Bold text, lists, blockquotes, and headings improve retrieval rather than decorate the prose.
- Stock transitions and universal lessons have been removed or made specific.
- The ending stops after the work is complete; it does not repeat the entire post by habit.

## Repository pass

1. Run `node .agents/skills/blogger/scripts/validate-posts.mjs`.
2. Check `git diff --check`.
3. Check the post diff specifically for `date:` and `slug:` changes.
4. Run `npm run build` when post content or metadata changed.
5. Report any check that could not be run instead of implying success.
