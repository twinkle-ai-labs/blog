import type { APIRoute } from 'astro';
import { ogCard } from '../../lib/og';
import { SITE } from '../../lib/site';

/**
 * 이 집의 기본 나눔 카드 — 목록 화면들과, 제 카드를 못 굽는 글이 물러설 자리.
 */
export const GET: APIRoute = async () => {
  const png = await ogCard({
    eyebrow: SITE.name,
    title: '작은 발견이 오래 빛나는 기록으로',
    lead: '만들고, 실패하고, 다시 다듬으며 배운 것들을 솔직하게 기록합니다.',
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
