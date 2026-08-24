import type { APIRoute } from 'astro';
import { ogCard } from '../../lib/og';
import { SITE } from '../../lib/site';

/**
 * 이 집의 기본 나눔 카드 — 목록 화면들과, 제 카드를 못 굽는 글이 물러설 자리.
 */
export const GET: APIRoute = async () => {
  const png = await ogCard({
    eyebrow: 'TWINKLE AI LABS · BLOG',
    title: '실패의 이유까지 남기는 개발 기록',
    lead: '앱을 만들고 출시하며 발견한 문제와, 다시 다듬어 답을 찾은 과정을 기록합니다.',
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
