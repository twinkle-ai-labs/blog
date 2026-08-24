/**
 * 실은 글꼴이 이 글자들을 그릴 수 있는가.
 *
 * Pretendard 는 라틴·한글·가나까지 든다 — **한자는 없다.** 없는 글자를 주면 두부(□)가
 * 그려지므로, 한자가 섞인 제목은 카드에 글이 아니라 네모 줄로 나간다.
 *
 * 카드를 **굽는 쪽**(`pages/og`)과 **가리키는 쪽**(`layouts/Base` 를 부르는 장)이
 * 같은 답을 봐야 해서 여기 홀로 산다 — 굽는 쪽에 두면 화면이 그걸 부르느라
 * satori 를 통째로 끌고 온다.
 */
/* 범위는 **코드포인트로 적는다.** 글자를 그대로 적었더니 «豈»를 호환 한자 블록의 첫 자
   (U+F900)로 알고 적었는데 실제로는 U+8C48 이라, 그 범위가 한글(U+AC00~)을 통째로
   삼켜 **모든 한국어 제목이 «못 그린다»로 걸렸다.** 눈으로는 잡히지 않는 종류의 오차다. */
const HAN = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]|[\uD840-\uD87F][\uDC00-\uDFFF]/;

export function isDrawable(...texts: (string | undefined)[]): boolean {
  return !texts.some((text) => text && HAN.test(text));
}
