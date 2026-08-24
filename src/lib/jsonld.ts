/**
 * 기계가 읽는 표(JSON-LD).
 *
 * 화면이 사람에게 말하는 것과 **같은 것**을 다른 말로 한 번 더 말한다 — 그래서
 * 여기서 짓지 화면마다 손으로 적지 않는다. 두 벌로 적으면 제목을 고친 날
 * 검색 결과만 옛 제목으로 남는다.
 */

import { SITE, AUTHOR_INFO } from './site';
import { categoryOf, categoryName, postUrl, seriesName, type Post } from './posts';

const at = (path: string) => new URL(path, SITE.url).href;

/** 이 집을 내는 사람 — 글의 지은이이자 발행인이다. */
const person = {
  '@type': 'Person',
  '@id': `${SITE.url}/#author`,
  name: SITE.author,
  url: AUTHOR_INFO.portfolio,
  email: AUTHOR_INFO.email,
  sameAs: [`https://github.com/${AUTHOR_INFO.github}`, AUTHOR_INFO.portfolio],
};

/** 이 집 자체 — 목록 화면들이 든다. */
export function blogGraph(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      {
        '@type': 'Blog',
        '@id': `${SITE.url}/#blog`,
        url: `${SITE.url}/`,
        name: SITE.name,
        description: SITE.description,
        inLanguage: SITE.lang,
        author: { '@id': `${SITE.url}/#author` },
        publisher: { '@id': `${SITE.url}/#author` },
      },
    ],
  };
}

/**
 * 글 한 편 — 제목·때·지은이·묶음, 그리고 여기까지 오는 길(BreadcrumbList).
 *
 * `image` 는 부르는 쪽이 준다: 한자가 섞인 글은 카드를 굽지 못해 기본 카드로 물러서는데,
 * 그 판단을 두 곳에서 따로 하면 표가 없는 그림을 가리키게 된다.
 */
export function postGraph(post: Post, image: string): Record<string, unknown> {
  const category = categoryOf(post);
  const url = at(postUrl(post));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      {
        '@type': 'BlogPosting',
        '@id': `${url}#post`,
        headline: post.data.title,
        description: post.data.summary || SITE.description,
        url,
        mainEntityOfPage: url,
        datePublished: post.data.date.toISOString(),
        dateModified: post.data.date.toISOString(),
        inLanguage: post.data.lang,
        image: new URL(image, SITE.url).href,
        keywords: post.data.tags,
        articleSection: seriesName(category),
        author: { '@id': `${SITE.url}/#author` },
        publisher: { '@id': `${SITE.url}/#author` },
        isPartOf: { '@id': `${SITE.url}/#blog` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE.name, item: `${SITE.url}/` },
          { '@type': 'ListItem', position: 2, name: categoryName(category), item: at(`/category/${category}/`) },
          { '@type': 'ListItem', position: 3, name: post.data.title, item: url },
        ],
      },
    ],
  };
}

/** 묶음(시리즈) 한 장 — 그 안의 글들을 차례로 든다. */
export function seriesGraph(category: string, posts: Post[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url: at(`/category/${category}/`),
    name: `${seriesName(category)} 시리즈`,
    inLanguage: SITE.lang,
    isPartOf: { '@id': `${SITE.url}/#blog` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.data.title,
        url: at(postUrl(post)),
      })),
    },
  };
}
