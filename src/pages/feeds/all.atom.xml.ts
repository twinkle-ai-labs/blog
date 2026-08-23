import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../../lib/posts';
import { atomFeed } from '../../lib/atom';
import { SITE } from '../../lib/site';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  return atomFeed({ title: SITE.name, selfPath: '/feeds/all.atom.xml', posts });
};
