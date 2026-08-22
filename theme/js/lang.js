/*
 * 언어 선택 드롭다운.
 * 네이티브 <select> 는 OS 가 그리므로 직접 만든다 — 대신 열고 닫는 일도 직접 해야 한다.
 * 안의 항목은 값이 아니라 링크다. 고르면 그 언어의 사이트로 이동한다.
 */
document.addEventListener('DOMContentLoaded', function () {
    const select = document.querySelector('[data-role="lang-select"]');
    if (!select) return;

    const trigger = select.querySelector('[data-role="lang-toggle"]');
    const menu = select.querySelector('.lang-select-menu');
    if (!trigger || !menu) return;

    const items = Array.from(menu.querySelectorAll('a'));

    const isOpen = function () {
        return !menu.hidden;
    };

    const open = function () {
        menu.hidden = false;
        select.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
    };

    const close = function (refocus) {
        menu.hidden = true;
        select.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        if (refocus) trigger.focus();
    };

    trigger.addEventListener('click', function (event) {
        event.stopPropagation();
        isOpen() ? close(false) : open();
    });

    // 바깥을 누르면 닫힌다 — 열어둔 채로 잊어버리는 메뉴는 없어야 한다.
    document.addEventListener('click', function (event) {
        if (isOpen() && !select.contains(event.target)) close(false);
    });

    document.addEventListener('keydown', function (event) {
        if (!isOpen()) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            close(true);
            return;
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

        // 방아쇠에 초점이 있으면 아직 목록 밖이다 — 위/아래에 따라 양 끝에서 들어간다.
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const at = items.indexOf(document.activeElement);
        const next = at === -1
            ? (step === 1 ? 0 : items.length - 1)
            : (at + step + items.length) % items.length;
        items[next].focus();
    });

    // 방아쇠에서 아래 화살표를 누르면 열면서 첫 항목으로 들어간다.
    trigger.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowDown' || isOpen()) return;
        event.preventDefault();
        open();
        items.length && items[0].focus();
    });
});
