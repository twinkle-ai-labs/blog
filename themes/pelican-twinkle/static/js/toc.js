/**
 * 우측 이정표(Table of Contents).
 * 본문의 h2/h3를 읽어 목차를 만들고, 스크롤 위치에 따라 현재 섹션을 표시한다.
 * 제목 id는 Markdown의 toc 확장이 서버에서 미리 만들어 둔다 (pelicanconf.py).
 */
document.addEventListener('DOMContentLoaded', function () {
    const toc = document.querySelector('.post-toc');
    const body = document.querySelector('.post-body');

    if (!toc || !body) return;

    // 글마다 최상위 제목이 h1일 수도 h2일 수도 있다. 문서에 실제로 쓰인
    // 가장 얕은 레벨을 기준으로 삼고, 거기서 세 단계까지 이정표에 싣는다.
    const all = Array.from(body.querySelectorAll('h1, h2, h3, h4'));
    if (!all.length) return;

    const level = function (heading) {
        return Number(heading.tagName.slice(1));
    };
    const top = Math.min.apply(null, all.map(level));
    const headings = all.filter(function (heading) {
        return level(heading) <= top + 2;
    });

    // 제목이 하나뿐이면 이정표가 길잡이 노릇을 못 한다 — 아예 띄우지 않는다.
    if (headings.length < 2) return;

    const list = toc.querySelector('.post-toc-list');
    const links = new Map();

    headings.forEach(function (heading, index) {
        if (!heading.id) heading.id = 'section-' + index;

        const item = document.createElement('li');
        const depth = level(heading) - top;
        item.className = depth === 0 ? 'toc-main' : (depth === 1 ? 'toc-sub' : 'toc-sub2');

        const link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;

        item.appendChild(link);
        list.appendChild(item);
        links.set(heading.id, link);
    });

    toc.hidden = false;

    // 고정 헤더에 제목이 가리지 않도록 스크롤 위치를 헤더 높이만큼 띄운다.
    const headerSize = function () {
        const value = getComputedStyle(document.documentElement).getPropertyValue('--header-size');
        return parseFloat(value) * (value.trim().endsWith('rem')
            ? parseFloat(getComputedStyle(document.documentElement).fontSize)
            : 1);
    };

    list.addEventListener('click', function (event) {
        const link = event.target.closest('a');
        if (!link) return;

        const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
        if (!target) return;

        event.preventDefault();
        window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - headerSize() - 16,
            behavior: 'smooth'
        });
        history.replaceState(null, '', link.hash);
    });

    const setActive = function (id) {
        links.forEach(function (link, key) {
            link.parentElement.classList.toggle('active', key === id);
        });
    };

    // 화면 위쪽을 지난 제목 중 가장 마지막 것이 "지금 읽는 섹션"이다.
    const sync = function () {
        const line = headerSize() + 24;
        let current = headings[0];

        for (const heading of headings) {
            if (heading.getBoundingClientRect().top <= line) current = heading;
            else break;
        }

        // 맨 아래에 닿으면 마지막 섹션을 고른다 — 짧은 마지막 섹션은 위 규칙만으로 안 잡힌다.
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
            current = headings[headings.length - 1];
        }

        setActive(current.id);
    };

    let ticking = false;
    const onScroll = function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            sync();
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});
    sync();
});
