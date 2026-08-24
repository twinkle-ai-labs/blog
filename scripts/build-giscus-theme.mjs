// giscus 테마 두 벌을 «한 벌»에서 찍어낸다.
//
// giscus 는 절대 주소의 CSS 한 장만 받으므로 라이트·다크를 각각 한 장씩 줘야 한다.
// 그렇다고 값을 두 번 적으면 그 둘은 곧 서로 달라진다 — 그래서 정본은
// 색·크기·모션의 정본은 aurora-ledger.css, giscus 고유 매핑은
// giscus-theme.css 하나이고, 여기서는 둘을 한 장으로 합친다.
//
// @import 로 잇지 않는 이유: giscus 판은 https 인데 우리 테마는 다른 출처에서 오므로
// 한 장이 막히면 나머지도 통째로 없는 것이 된다. 왕복을 하나로 줄여 둔다.
import { readFile, writeFile } from 'node:fs/promises';

const SOURCE = new URL('../src/styles/giscus-theme.css', import.meta.url);
const TOKENS = new URL('../src/styles/aurora-ledger.css', import.meta.url);
const body = await readFile(SOURCE, 'utf8');
const tokens = await readFile(TOKENS, 'utf8');

for (const scheme of ['light', 'dark']) {
  const out = new URL(`../public/giscus-${scheme}.css`, import.meta.url);
  await writeFile(
    out,
    `/*! 이 파일은 scripts/build-giscus-theme.mjs 가 찍어낸다 — 고칠 곳은 src/styles/giscus-theme.css 다. */\n` +
      `:root, main { color-scheme: ${scheme}; }\n\n` +
      tokens +
      '\n' +
      body,
  );
  console.log(`giscus-${scheme}.css  ${(body.length / 1024).toFixed(1)}KB`);
}
