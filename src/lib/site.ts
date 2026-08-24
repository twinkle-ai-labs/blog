export const SITE = {
  name: 'Twinkle Blog',
  url: 'https://blog.twinklelabs.kr',
  /* 검색 결과와 피드에 서는 한 줄 — 화면에는 나오지 않는다.
     영어 인사말("Hi, I'm full-stack developer")이 오래 서 있었는데,
     한국어로 쓰는 블로그의 검색 설명이 영어면 **찾아올 말과 보이는 말이 어긋난다.** */
  description: '안드로이드 앱을 만들고 출시하며 배운 것들을 기록합니다 — 실패한 자리와 그 이유까지.',
  author: 'Heejeong Kim',
  lang: 'ko',
} as const;

export const AUTHOR_INFO = {
  github: 'twinkle-ai-labs',
  portfolio: 'https://me.twinklelabs.kr',
  email: 'twinkle.ai.labs@gmail.com',
} as const;

// 이름의 다른 앞마당들 — 바닥글과 모바일 메뉴가 같은 목록을 본다.
export const STUDIO_LINKS = [
  { href: 'https://twinklelabs.kr/', label: '홈' },
  { href: 'https://design.twinklelabs.kr/', label: '디자인 시스템' },
  { href: '/', label: '블로그' },
  { href: 'https://polaris.twinklelabs.kr/', label: '약관' },
] as const;

export const LINKS = [
  { name: 'velog', url: 'https://velog.io/@developer_khj' },
  { name: 'github', url: 'https://github.com/twinkle-ai-labs' },
  { name: 'gmail', url: 'mailto:twinkle.ai.labs@gmail.com' },
] as const;

// 카테고리(시리즈) 표시 정보 — 폴더 이름이 key
// name 은 글머리 칩에 서는 짧은 이름, series 는 묶음을 부르는 이름이다.
// description 에 series 를 다시 적지 않는다 — 화면이 이미 제목으로 그 이름을 말한다.
export const CATEGORIES: Record<string, { name: string; series: string; description: string }> = {
  'stock-calculator': {
    name: 'Stock Calculator',
    series: '첫 앱 출시기',
    description: '2주 만에 안드로이드 앱 하나를 만들어 스토어 콘솔까지 올린 이야기',
  },
  android: {
    name: 'Android',
    series: '안드로이드를 만들며 배운 것',
    description: '빌드는 통과했는데 화면과 뜻이 조용히 틀어져 있던 것들',
  },
  'silent-failures': {
    name: 'Silent Failures',
    series: '조용히 실패하는 것들',
    description: '도구가 됐다고 말하고는 아무 일도 하지 않았을 때',
  },
  'design-system': {
    name: 'Design System',
    series: '디자인 시스템 세우기',
    description: '한 벌이어야 할 값이 여러 벌이 되지 않게 — Aurora Ledger 이야기',
  },
};

export const PAGE_SIZE = 5;
export const DISQUS_SITENAME = 'twinklekhj';

// 댓글 — giscus(깃허브 Discussions). 두 id 가 채워지면 Disqus 대신 이쪽이 선다.
// repoId · categoryId 는 https://giscus.app 에서 저장소를 넣으면 그 자리에서 알려준다.
export const GISCUS = {
  repo: 'twinkle-ai-labs/blog',
  repoId: 'R_kgDOLmbZPQ',
  category: 'Announcements',
  categoryId: 'DIC_kwDOLmbZPc4DECXZ',
  lang: 'ko',
} as const;
export const GA_MEASUREMENT_ID = 'G-TCQ067TYB8';
