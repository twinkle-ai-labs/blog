import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // frontmatter 의 slug 가 엔트리 id 를 덮어쓰지 않도록 항상 파일 경로로 id 를 만든다
  // (id 의 첫 세그먼트가 카테고리다: "android/aapt-newline" → android)
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    slug: z.string(),
    lang: z.string().default('ko'),
    author: z.string().default('Heejeong Kim'),
    summary: z.string().default(''),
    draft: z.boolean().default(false),
    hidden: z.boolean().default(false),
  }),
});

export const collections = { blog };
