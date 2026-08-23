import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES } from './site';

export type Post = CollectionEntry<'blog'>;

// Pelican 의 slugify 와 호환 — 유니코드 문자를 보존해야 /tag/출시기/ 같은 구 URL이 유지된다.
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s]+/g, '-');
}

export function categoryOf(post: Post): string {
  return post.id.split('/')[0]!;
}

export function categoryName(slug: string): string {
  return CATEGORIES[slug]?.name ?? slug;
}

export function postUrl(post: Post): string {
  return `/${categoryOf(post)}/${post.data.slug}.html`;
}

// 공개 글 — 목록·피드·사이트맵에 실리는 것들 (최신순)
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft && !data.hidden);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getDraftPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getHiddenPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => data.hidden && !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function formatDate(date: Date): string {
  // 구 사이트의 DEFAULT_DATE_FORMAT('%Y년 %-m월 %-d일') 그대로
  const kst = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  return `${kst.getFullYear()}년 ${kst.getMonth() + 1}월 ${kst.getDate()}일`;
}

export interface TagInfo {
  tag: string;
  slug: string;
  posts: Post[];
}

export function collectTags(posts: Post[]): TagInfo[] {
  const map = new Map<string, TagInfo>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = slugify(tag);
      const entry = map.get(slug) ?? { tag, slug, posts: [] };
      entry.posts.push(post);
      map.set(slug, entry);
    }
  }
  return [...map.values()].sort((a, b) => b.posts.length - a.posts.length || a.slug.localeCompare(b.slug));
}
