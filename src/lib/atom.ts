import { SITE } from './site';
import { postUrl, categoryOf, categoryName, type Post } from './posts';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 구 Pelican 사이트와 같은 Atom 1.0 피드
export function atomFeed(options: { title: string; selfPath: string; posts: Post[] }): Response {
  const { title, selfPath, posts } = options;
  const updated = posts[0]?.data.date ?? new Date(0);

  const entries = posts
    .map((post) => {
      const url = `${SITE.url}${postUrl(post)}`;
      const html = post.rendered?.html ?? '';
      return `  <entry>
    <title>${escapeXml(post.data.title)}</title>
    <link href="${url}" rel="alternate"/>
    <id>${url}</id>
    <published>${post.data.date.toISOString()}</published>
    <updated>${post.data.date.toISOString()}</updated>
    <author><name>${escapeXml(post.data.author)}</name></author>
    <category term="${escapeXml(categoryName(categoryOf(post)))}"/>
${post.data.tags.map((tag) => `    <category term="${escapeXml(tag)}"/>`).join('\n')}
    <summary type="html">${escapeXml(post.data.summary)}</summary>
    <content type="html">${escapeXml(html)}</content>
  </entry>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(title)}</title>
  <link href="${SITE.url}/" rel="alternate"/>
  <link href="${SITE.url}${selfPath}" rel="self"/>
  <id>${SITE.url}/</id>
  <updated>${updated.toISOString()}</updated>
  <subtitle>${escapeXml(SITE.description)}</subtitle>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
