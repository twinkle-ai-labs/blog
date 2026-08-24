import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { categoryOf, seriesName, type Post } from '../../../lib/posts';
import { ownsOgImage } from '../../../lib/share';
import { ogCard } from '../../../lib/og';

/**
 * 글 한 편의 나눔 카드 — 글의 제목과 요약을 그대로 말한다.
 *
 * **글꼴이 그릴 수 있는 글만** 목록에 올린다(한자가 섞이면 두부가 그려진다).
 * 빠진 글은 `Base` 가 기본 카드로 물러선다 — 굽지도 않은 그림을 가리키지 않으려면
 * 여기서 세는 규칙과 거기서 고르는 규칙이 **같은 함수**여야 한다.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts
    .filter(ownsOgImage)
    .map((post: Post) => ({
      params: { category: categoryOf(post), slug: post.data.slug },
      props: { post },
    }));
};

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as Post;
  const png = await ogCard({
    eyebrow: seriesName(categoryOf(post)),
    title: post.data.title,
    lead: post.data.summary,
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
