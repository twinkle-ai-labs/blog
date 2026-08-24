/* 브랜드의 별 — polaris 의 StarMark 와 같은 모양. */
export const STAR_PATH =
  'M50 12 C58.36 36.624 63.376 41.64 88 50 C63.376 58.36 58.36 63.376 50 88 ' +
  'C41.64 63.376 36.624 58.36 12 50 C36.624 41.64 41.64 36.624 50 12 Z';

/**
 * 별 한 장을 데이터 주소로 — Aurora Ledger 의 보라 그라데이션으로 채워서.
 *
 * favicon(레이아웃)과 나눔 카드([lib/og])가 같은 그림을 저마다 그리고 있었다 —
 * 같아야 하는 그림은 **이름 하나**를 둘이 가리키게 한다.
 */
export const STAR_DATA_URI =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="14" y1="86" x2="86" y2="14" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7040D9"/><stop offset="1" stop-color="#8550E4"/></linearGradient></defs><path fill="url(#g)" d="${STAR_PATH}"/></svg>`,
  );
