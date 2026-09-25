export const SITE = {
  name: 'Twinkle Blog',
  url: 'https://blog.twinklelabs.kr',
  /* 검색 결과와 피드에 서는 한 줄 — 화면에는 나오지 않는다.
     영어 인사말("Hi, I'm full-stack developer")이 오래 서 있었는데,
     한국어로 쓰는 블로그의 검색 설명이 영어면 **찾아올 말과 보이는 말이 어긋난다.** */
  description: '앱을 기획하고 출시하며 겪은 문제와 해결 과정을 기록합니다. 안드로이드 개발, 디자인 시스템, 개발 도구에 관한 Twinkle AI Labs의 블로그입니다.',
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
  { href: 'https://twinklelabs.kr/', label: '소개' },
  { href: 'https://twinklelabs.kr/app/', label: '앱' },
  { href: 'https://design.twinklelabs.kr/', label: '디자인 시스템' },
  { href: '/', label: '블로그' },
  { href: 'https://polaris.twinklelabs.kr/', label: '약관' },
] as const;

export const LINKS = [
  { name: 'velog', url: 'https://velog.io/@developer_khj' },
  { name: 'GitHub', url: 'https://github.com/twinkle-ai-labs' },
  { name: 'gmail', url: 'mailto:twinkle.ai.labs@gmail.com' },
] as const;

// 카테고리(시리즈) 표시 정보 — 폴더 이름이 key
// name 은 글머리 칩에 서는 짧은 이름, series 는 묶음을 부르는 이름이다.
// description 에 series 를 다시 적지 않는다 — 화면이 이미 제목으로 그 이름을 말한다.
export const CATEGORIES: Record<string, { name: string; series: string; description: string }> = {
  'stock-calculator': {
    name: '물타기 계산기',
    series: '첫 앱 출시기',
    description: '물타기 계산기를 만들고 출시하며 다듬은 화면, 광고, 스토어 등록 과정을 담았습니다.',
  },
  android: {
    name: '안드로이드',
    series: '안드로이드를 만들며 배운 것',
    description: '화면 구성부터 앱 구조와 다국어 지원까지, 구현 중 만난 문제와 해결 방법을 기록했습니다.',
  },
  'silent-failures': {
    name: '오류와 디버깅',
    series: '조용히 실패하는 것들',
    description: '검사와 배포가 성공해도 놓칠 수 있는 오류를 살펴보고, 원인을 찾은 과정을 담았습니다.',
  },
  'design-system': {
    name: '디자인 시스템',
    series: '디자인 시스템 세우기',
    description: 'Aurora Ledger의 색과 글자, 간격을 정하고 여러 제품에 같은 기준을 적용한 기록입니다.',
  },
  'pocket-pdf': {
    name: 'Pocket PDF',
    series: '두 번째 앱 출시기',
    description: '이미지를 검색 가능한 PDF로 만들고, 앱과 웹을 연결하며 해결한 문제를 기록했습니다.',
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
