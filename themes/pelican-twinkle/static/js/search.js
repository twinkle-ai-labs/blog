/*
 * 전역 검색 모달.
 * 헤더의 검색 버튼 또는 ⌘K / Ctrl+K 로 열고, 인라인 JSON 인덱스(#search-index)를
 * 훑어 제목·요약·태그·카테고리에서 찾는다. 사이트가 작아 서버 없이 충분하다.
 */
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.querySelector('[data-role="search-modal"]');
    const trigger = document.querySelector('[data-role="search-open"]');
    const indexEl = document.getElementById('search-index');

    if (!modal || !indexEl) return;

    let index;
    try {
        index = JSON.parse(indexEl.textContent);
    } catch (e) {
        console.error('검색 인덱스를 읽지 못했습니다.', e);
        return;
    }

    const input = modal.querySelector('#search-modal-input');
    const list = modal.querySelector('#search-modal-results');
    const empty = modal.querySelector('.search-modal-empty');
    let cursor = -1;

    const open = function () {
        modal.hidden = false;
        document.body.classList.add('search-open');
        // hidden 해제 직후엔 아직 렌더 전이라, 다음 프레임에 focus 해야 먹는다.
        requestAnimationFrame(function () {
            modal.classList.add('is-open');
            input.focus();
        });
        render(input.value);
    };

    const close = function () {
        modal.classList.remove('is-open');
        document.body.classList.remove('search-open');
        // 퇴장 트랜지션(150ms)이 끝난 뒤에 숨긴다.
        setTimeout(function () {
            modal.hidden = true;
        }, 160);
    };

    const matches = function (query) {
        const q = query.trim().toLowerCase();
        if (!q) return index;
        return index.filter(function (item) {
            return (item.title + ' ' + item.summary + ' ' + item.category + ' ' + item.tags.join(' '))
                .toLowerCase().includes(q);
        });
    };

    const render = function (query) {
        const found = matches(query);
        cursor = found.length ? 0 : -1;

        list.innerHTML = found.map(function (item, i) {
            return '<li class="' + (i === cursor ? 'active' : '') + '">' +
                '<a href="' + item.url + '">' +
                '<span class="result-title">' + item.title + '</span>' +
                '<span class="result-meta">' + item.category +
                (item.date ? ' · ' + item.date : '') + '</span>' +
                (item.summary ? '<span class="result-summary">' + item.summary + '</span>' : '') +
                '</a></li>';
        }).join('');

        empty.hidden = found.length > 0;
    };

    const move = function (delta) {
        const items = list.querySelectorAll('li');
        if (!items.length) return;
        cursor = (cursor + delta + items.length) % items.length;
        items.forEach(function (item, i) {
            item.classList.toggle('active', i === cursor);
        });
        items[cursor].scrollIntoView({block: 'nearest'});
    };

    trigger && trigger.addEventListener('click', open);
    modal.querySelector('[data-role="search-close"]').addEventListener('click', close);
    input.addEventListener('input', function () {
        render(input.value);
    });

    document.addEventListener('keydown', function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            modal.hidden ? open() : close();
            return;
        }
        if (modal.hidden) return;

        if (event.key === 'Escape') close();
        else if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
        else if (event.key === 'Enter') {
            const active = list.querySelector('li.active a');
            if (active) window.location.href = active.href;
        }
    });
});
