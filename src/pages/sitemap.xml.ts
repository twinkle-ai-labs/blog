import type { APIRoute } from 'astro';
import { getPublishedPosts, postUrl, categoryOf, collectTags } from '../lib/posts';
import { SITE, PAGE_SIZE } from '../lib/site';

// 구 Pelican sitemap 플러그인처럼 /sitemap.xml 하나로 낸다
export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));

  const urls: { loc: string; lastmod?: string }[] = [
    { loc: '/', lastmod: posts[0]?.data.date.toISOString() },
    ...Array.from({ length: totalPages - 1 }, (_, i) => ({ loc: `/page/${i + 2}/` })),
    ...posts.map((post) => ({ loc: postUrl(post), lastmod: post.data.date.toISOString() })),
    ...[...new Set(posts.map(categoryOf))].map((cat) => ({ loc: `/category/${cat}/` })),
    ...collectTags(posts).map((info) => ({ loc: `/tag/${info.slug}/` })),
    { loc: '/archives.html' },
    { loc: '/categories.html' },
    { loc: '/tags.html' },
  ];

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${SITE.url}${encodeURI(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
