// @ts-check
import { defineConfig } from 'astro/config';

// 구 Pelican 사이트의 URL 을 그대로 보존한다.
// build.format 'preserve': [slug].astro → {slug}.html, foo/index.astro → foo/index.html
export default defineConfig({
  site: 'https://blog.twinklelabs.kr',
  trailingSlash: 'ignore',
  build: {
    format: 'preserve',
  },
  markdown: {
    shikiConfig: {
      // 라이트/다크 듀얼 — CSS 변수(--shiki-light/--shiki-dark)로 내려와 테마 토글을 따른다.
      themes: {
        light: 'catppuccin-latte',
        dark: 'tokyo-night',
      },
      defaultColor: false,
    },
  },
});
