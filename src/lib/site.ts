export const SITE = {
  name: 'Twinkle Blog',
  url: 'https://blog.twinklelabs.kr',
  description: "Hi, I'm full-stack developer. Thanks for visiting",
  author: 'Heejeong Kim',
  lang: 'ko',
} as const;

export const AUTHOR_INFO = {
  github: 'hjkim1004',
  portfolio: 'https://me.twinklelabs.kr',
  email: 'developer.heejeong@gmail.com',
} as const;

export const LINKS = [
  { name: 'velog', url: 'https://velog.io/@developer_khj' },
  { name: 'github', url: 'https://github.com/hjkim1004' },
  { name: 'gmail', url: 'mailto:developer.heejeong@gmail.com' },
] as const;

// 카테고리(시리즈) 표시 정보 — 폴더 이름이 key
export const CATEGORIES: Record<string, { name: string; description: string }> = {
  pelican: {
    name: 'Pelican',
    description: 'Pelican 블로그 만들기 — 시작부터 배포·테마·플러그인까지',
  },
  'stock-calculator': {
    name: 'Stock Calculator',
    description: '첫 앱 출시기 — 2주 만에 안드로이드 앱을 스토어에 올리기까지',
  },
};

export const PAGE_SIZE = 5;
export const DISQUS_SITENAME = 'twinklekhj';
export const GA_MEASUREMENT_ID = 'G-TCQ067TYB8';
