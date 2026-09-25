import type { APIRoute } from 'astro';
import { ogCard } from '../../lib/og';
import { SITE } from '../../lib/site';

/**
 * 이 집의 기본 나눔 카드 — 목록 화면들과, 제 카드를 못 굽는 글이 물러설 자리.
 */
export const GET: APIRoute = async () => {
  const png = await ogCard({
    eyebrow: `${SITE.name} · 개발 기록`,
    title: '직접 만들고, 겪은 것을 씁니다.',
    lead: '앱을 기획하고 출시하며 마주친 문제와 해결 과정을 기록합니다.',
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
