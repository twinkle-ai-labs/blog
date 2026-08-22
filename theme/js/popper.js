/*
 * Account popper
 * 사이드바는 스크롤 컨테이너라 안쪽 툴팁은 잘린다.
 * 그래서 popper를 body로 옮기고 앵커 좌표에 맞춰 고정 배치한다.
 */
document.addEventListener('DOMContentLoaded', function () {
    const anchor = document.querySelector('.sidebar-account');
    const popper = anchor && anchor.querySelector('.account-popper');

    if (!anchor || !popper) return;

    document.body.appendChild(popper);

    const GAP = 8;

    const place = function () {
        const rect = anchor.getBoundingClientRect();
        const narrow = window.matchMedia('(max-width: 64em)').matches;

        popper.classList.toggle('is-below', narrow);

        if (narrow) {
            popper.style.left = rect.left + 'px';
            popper.style.top = rect.bottom + GAP + 'px';
        } else {
            popper.style.left = rect.right + GAP + 'px';
            popper.style.top = rect.top + rect.height / 2 + 'px';
        }
    };

    const show = function () {
        place();
        popper.classList.add('is-visible');
    };

    const hide = function () {
        popper.classList.remove('is-visible');
    };

    anchor.addEventListener('mouseenter', show);
    anchor.addEventListener('mouseleave', hide);
    anchor.addEventListener('focus', show);
    anchor.addEventListener('blur', hide);
    window.addEventListener('resize', hide);
    window.addEventListener('scroll', hide, true);
});
