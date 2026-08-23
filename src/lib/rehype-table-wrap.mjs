/**
 * 표를 스크롤되는 통 하나에 넣는다.
 *
 * 표에 `display: block` 을 주면 `overflow-x` 는 듣지만, 그 순간 테두리와 배경만
 * 100% 로 늘어나고 «행»은 제 내용만큼만 남는다 — 카드 안쪽 오른편이 통째로
 * 비어 보이는 게 그 때문이다. 표는 표로 두고(`display: table`), 스크롤은
 * 바깥 통이 지게 한다.
 */
export function rehypeTableWrap() {
  return (tree) => {
    const walk = (node) => {
      const children = node.children;
      if (!children) return;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type !== 'element') continue;
        if (child.tagName === 'table') {
          children[i] = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-wrap'] },
            children: [child],
          };
        } else {
          walk(child);
        }
      }
    };
    walk(tree);
  };
}
