/**
 * 나눔 카드(Open Graph 이미지)를 **코드로 굽는다**.
 *
 * 그림 파일을 손으로 그려 두면 제목을 고친 날 그림이 옛말을 하고 있게 된다 —
 * 카드의 말은 글의 말과 같은 자리에서 와야 한다.
 *
 * 글자는 satori 가 **길(path)로 바꿔** SVG 에 새기고, sharp 는 그 길을 칠하기만 한다 —
 * 그래서 래스터화하는 쪽은 글꼴을 몰라도 된다. 글꼴은 저장소가 든다: CDN 에서 받아 오면
 * 빌드가 남의 서버 사정에 걸리고, 시스템 글꼴에 기대면 CI 에는 그 글꼴이 없다.
 * 실은 것은 라틴 + 현대 한글 + 가나만 남긴 부분집합이라 사용자에게는 나가지 않는다.
 */

import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { SITE } from './site';

/** 나눔 카드의 판 — 페이스북·트위터·슬랙·카카오가 모두 이 비율을 기준으로 자른다. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/* Aurora Ledger — 카드는 **다크 한 벌**로 선다.
   카드가 설 자리(타임라인·메신저)의 바탕은 우리가 못 정하므로, 어느 바탕에 놓여도
   경계가 분명한 쪽을 고른다. 라이트 카드는 흰 타임라인에서 테두리를 잃는다. */
const INK = {
  bg: '#110D19',
  text: '#FAF7FF',
  sub: '#AEA3BA',
  primary: '#7040D9',
  glow: '#8550E4',
  accent: '#B79AFF',
} as const;


/* 글꼴은 **저장소의 자리**에서 읽는다 — `import.meta.url` 은 빌드가 끝나면
   구워진 덩어리(`dist/chunks/…`)를 가리켜 원본 옆을 더는 못 찾는다. */
const FONT_DIR = path.join(process.cwd(), 'src/assets/fonts');

/** 굵기는 **가진 둘**만 부른다 — 없는 굵기는 satori 가 이웃 칸으로 스냅한다. */
const FONTS = [
  { name: 'Pretendard', data: fs.readFileSync(path.join(FONT_DIR, 'Pretendard-Regular.otf')), weight: 400 as const, style: 'normal' as const },
  { name: 'Pretendard', data: fs.readFileSync(path.join(FONT_DIR, 'Pretendard-Bold.otf')), weight: 700 as const, style: 'normal' as const },
];

/**
 * 제목의 크기 — **자르지 않고 줄인다.**
 *
 * 길이가 정해지지 않은 값이 좁은 칸에 설 때 잘라 내면 틀린 말이 되므로, 글자 크기가
 * 사다리 칸을 따라 한 칸씩 내려와 칸에 맞춘다. 글 제목은 홈의 다짐보다 길게 마련이라
 * 이 집의 사다리는 한 칸 아래에서 시작한다.
 */
function titleSize(title: string): number {
  if (title.length > 40) return 46;
  if (title.length > 24) return 54;
  return 64;
}

export type OgCard = {
  /** 작은 머리말 — 이 글이 어느 묶음의 것인가. */
  eyebrow: string;
  title: string;
  /** 한 줄 설명. */
  lead?: string;
};

/** 카드 한 장을 PNG 로. */
export async function ogCard({ eyebrow, title, lead }: OgCard): Promise<Buffer> {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: INK.bg,
          backgroundImage: [
            'radial-gradient(760px 520px at 92% 0%, rgba(183,154,255,0.28), rgba(17,13,25,0))',
            'radial-gradient(620px 520px at 78% 36%, rgba(112,64,217,0.22), rgba(17,13,25,0))',
            'radial-gradient(700px 420px at -8% 108%, rgba(112,64,217,0.34), rgba(17,13,25,0))',
          ].join(','),
          border: '1px solid rgba(183,154,255,0.16)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Pretendard',
          color: INK.text,
        },
        children: [
          {
            type: 'div',
            props: {
              style: { position: 'absolute', right: 86, top: 76, width: 250, height: 250, border: '1px solid rgba(183,154,255,0.18)', borderRadius: 999, boxShadow: '0 0 90px rgba(133,80,228,0.18)' },
            },
          },
          {
            type: 'div',
            props: {
              style: { position: 'absolute', right: 148, top: 138, width: 126, height: 126, border: '1px solid rgba(183,154,255,0.28)', borderRadius: 999 },
            },
          },
          {
            type: 'div',
            props: {
              style: { position: 'absolute', right: 202, top: 192, width: 18, height: 18, backgroundColor: INK.accent, borderRadius: 999, boxShadow: '0 0 34px rgba(183,154,255,0.88)' },
            },
          },
          /* 머리 — 심볼 없이 이름 자체가 브랜드가 된다. */
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center' },
              children: [
                {
                  type: 'span',
                  props: {
                    /* 자간을 주지 않는다 — satori 는 양수 자간에서 한글 사이의 **공백 한 칸을 삼킨다**
                       («안드로이드를 만들며» → «안드로이드를만들며»). 멋보다 낱말이 붙지 않는 쪽이다. */
                    style: { fontSize: 26, fontWeight: 700, color: INK.accent },
                    children: eyebrow,
                  },
                },
              ],
            },
          },
          /* 몸 — 가장 큰 글자는 제목이다.
             한글은 낱말 안에서 끊지 않는다: 그냥 두면 «스튜디오입니다»가 «스튜디 / 오입니다»로 갈린다.
             길이가 정해지지 않은 값(제목·요약)이 판을 넘치지 않도록 이 칸이 남는 자리를 다 먹고
             **제 안에서 자른다** — 넘치면 발치의 실선이 글자 위로 올라탄다. */
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 24,
                flexGrow: 1,
                overflow: 'hidden',
                maxWidth: 940,
                wordBreak: 'keep-all',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: titleSize(title),
                      fontWeight: 700,
                      lineHeight: 1.2,
                      letterSpacing: -1.2,
                      lineClamp: 3,
                    },
                    children: title,
                  },
                },
                lead
                  ? {
                      type: 'span',
                      props: {
                        style: { fontSize: 30, fontWeight: 400, lineHeight: 1.45, color: INK.sub, lineClamp: 2 },
                        children: lead,
                      },
                    }
                  : null,
              ],
            },
          },
          /* 발 — 주소 한 줄과 그 위의 실선. */
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: 22 },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: 180,
                      height: 5,
                      borderRadius: 999,
                      backgroundImage: `linear-gradient(90deg, ${INK.primary}, ${INK.glow})`,
                    },
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { fontSize: 26, fontWeight: 400, color: INK.sub, letterSpacing: 0.4 },
                    children: new URL(SITE.url).host,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { ...OG_SIZE, fonts: FONTS },
  );

  /* satori 가 글자를 이미 길로 새겼으므로 여기서는 칠하기만 한다 — 글꼴이 필요 없다. */
  return sharp(Buffer.from(svg)).png().toBuffer();
}
