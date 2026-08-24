/**
 * 글 한 편의 나눔 카드가 **어디에 서는가**.
 *
 * 카드를 굽는 쪽(`pages/og/[category]/[slug].png.ts`)과 가리키는 쪽(글 화면)이
 * 이 규칙을 각자 적고 있었다 — 두 곳의 규칙이 어긋나면 굽지도 않은 그림을
 * 가리키거나, 구워 놓고 아무도 안 가리킨다. 규칙은 여기 한 벌이다:
 * 글꼴이 그릴 수 있으면 제 카드, 못 그리면(한자) 집의 기본 카드.
 */

import { isDrawable } from './drawable';
import { categoryOf, seriesName, type Post } from './posts';

/** 이 집의 기본 카드 — 목록 화면들과, 제 카드를 못 굽는 글이 물러설 자리. */
export const DEFAULT_OG_IMAGE = '/og/default.png';

export function ogImageOf(post: Post): string {
  const drawable = isDrawable(post.data.title, post.data.summary, seriesName(categoryOf(post)));
  return drawable ? `/og/${categoryOf(post)}/${post.data.slug}.png` : DEFAULT_OG_IMAGE;
}

/** 제 카드를 굽는 글인가 — 굽는 목록과 가리키는 주소가 같은 답을 보게 한다. */
export function ownsOgImage(post: Post): boolean {
  return ogImageOf(post) !== DEFAULT_OG_IMAGE;
}
