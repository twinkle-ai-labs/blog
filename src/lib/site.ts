export const SITE = {
  name: 'Twinkle Blog',
  url: 'https://blog.twinklelabs.kr',
  description: "Hi, I'm full-stack developer. Thanks for visiting",
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
  pelican: {
    name: 'Pelican',
    series: 'Pelican 블로그 만들기',
    description: '시작부터 배포·테마·플러그인까지',
  },
  'stock-calculator': {
    name: 'Stock Calculator',
    series: '첫 앱 출시기',
    description: '2주 만에 안드로이드 앱을 스토어에 올리기까지',
  },
  android: {
    name: 'Android',
    series: '안드로이드를 만들며 배운 것',
    description: '화면·문자열·타입에서 실제로 부딪히고 나서야 알게 된 것들',
  },
  'silent-failures': {
    name: 'Silent Failures',
    series: '조용히 실패하는 것들',
    description: '도구가 «됐다»고 말하고는 아무 일도 하지 않았을 때',
  },
  'design-system': {
    name: 'Design System',
    series: '디자인 시스템 세우기',
    description: 'Aurora Ledger — 한 벌이어야 할 값이 여러 벌이 되지 않게',
  },
};

export const PAGE_SIZE = 5;
export const DISQUS_SITENAME = 'twinklekhj';
export const GA_MEASUREMENT_ID = 'G-TCQ067TYB8';
