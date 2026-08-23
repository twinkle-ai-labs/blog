import type { APIRoute } from 'astro';
import { getPublishedPosts, categoryOf, categoryName } from '../../lib/posts';
import { atomFeed } from '../../lib/atom';
import { SITE } from '../../lib/site';

// 구 Pelican CATEGORY_FEED_ATOM("feeds/{slug}.atom.xml") 유지
export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return [...new Set(posts.map(categoryOf))].map((category) => ({ params: { category } }));
}

export const GET: APIRoute = async ({ params }) => {
  const posts = (await getPublishedPosts()).filter((p) => categoryOf(p) === params.category);
  return atomFeed({
    title: `${SITE.name} — ${categoryName(params.category!)}`,
    selfPath: `/feeds/${params.category}.atom.xml`,
    posts,
  });
};
