# Twinkle Labs blog voice

## Point of view

Write as the person who built, broke, inspected, and changed the product. The voice is candid and technically precise, without pretending the author knew the answer before the investigation.

Good posts usually contain:

- the concrete symptom or decision that started the work;
- what the author first suspected or tried, when the source supports it;
- the evidence that changed the diagnosis;
- the actual fix or design choice;
- a short reflection grounded in that event.

Do not invent the first suspicion, failed attempts, emotional reaction, conversation, or timeline merely to make the narrative vivid.

## Korean prose

- Prefer ordinary contemporary Korean over translated technical prose.
- Mix `했어요` and `했습니다` only where the surrounding tone makes the shift natural. Do not alternate them mechanically.
- Use the shortest technical term that remains accurate. Explain a term when a reader needs it to follow the incident, not simply because it is English.
- Keep code identifiers in backticks. Preserve official product spelling.
- Use a direct sentence after a code block to say what the code proves.
- Vary sentence and paragraph length according to the material. Do not manufacture choppiness as a style effect.

## Characteristic shape

A strong opening enters through a real scene or constraint:

> 광고 아래 빈 공간이 보여서 처음에는 배너 높이부터 확인했습니다. 그런데 광고 뷰를 지워도 공간이 남았습니다.

A weak opening announces a generic lesson:

> 개발에서 문제는 언제나 예상하지 못한 곳에서 찾아옵니다. 이번에도 예외는 아니었습니다.

Prefer the first shape because its claims can be checked and it gives the reader a reason to continue.

## Patterns to resist

Treat these as warning signs, not forbidden tokens. Keep an occurrence when it is the most natural wording, but rewrite repeated or empty uses.

- `정리하면`, `결론적으로`, `남는 것`, `마치며` as automatic closing sections;
- “단순한 A가 아니라 B입니다” and “A는 B를 넘어 C입니다” constructions;
- “이 부분이 중요합니다” without immediately stating why;
- a bold sentence at the end of every section;
- perfectly symmetrical three-item lists that add no retrieval value;
- universal maxims derived from one small incident;
- rhetorical questions whose answer is already obvious;
- repeated em dashes used as a default pause;
- calling something “조용한 실패”, “진짜 문제”, or “가장 무서운 부분” without concrete consequences;
- a compulsory recap followed by a compulsory next-post teaser.

## Emphasis and structure

Use headings to help a reader relocate information, not to make every paragraph dramatic. Headings may be factual, conversational, or terse; avoid giving every heading the same grammatical shape.

Bold is appropriate for a value, warning, or contrast the reader may need to find later. It is not a substitute for sentence hierarchy. Horizontal rules are rarely needed when headings and whitespace already separate sections.

End when the event is complete. A final observation is welcome when it belongs specifically to the work just described. Do not inflate it into a universal lesson.
