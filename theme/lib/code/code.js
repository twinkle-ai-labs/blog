// @ref: https://guiyomi.tistory.com/132

const COPY_TEXT_CHANGE_OFFSET = 1000;
const COPY_BUTTON_TEXT_BEFORE = 'Copy';
const COPY_BUTTON_TEXT_AFTER = 'Copied!';
const COPY_ERROR_MESSAGE = '코드를 복사할 수 없습니다. 다시 시도해 주세요.';

const codeBlocks = document.querySelectorAll('pre > code');

const copyBlockCode = async (target = null) => {
    if (!target) return;
    try {
        const code = decodeURI(target.dataset.code);

        await navigator.clipboard.writeText(code);
        target.textContent = COPY_BUTTON_TEXT_AFTER;
        setTimeout(() => {
            target.textContent = COPY_BUTTON_TEXT_BEFORE;
        }, COPY_TEXT_CHANGE_OFFSET);
    } catch (error) {
        alert(COPY_ERROR_MESSAGE);
        console.error(error);
    }
}

// 코드 블록 바로 위에 `파일명`: 한 줄만 있으면 그 줄을 헤더로 끌어올린다.
// 본문에 떠 있는 파일명은 코드와 떨어져 보이지만, 창 제목이면 한 덩어리로 읽힌다.
const FILENAME_PATTERN = /^([\w.\-/@]+)\s*:?$/;

const takeFileName = (pre) => {
    // codehilite는 pre를 div.highlight로 한 번 감싼다 — 형제는 그 바깥에서 찾는다.
    const block = pre.parentElement?.classList.contains('highlight') ? pre.parentElement : pre;
    const prev = block.previousElementSibling;

    if (!prev || prev.tagName !== 'P') return null;
    if (prev.children.length !== 1 || prev.firstElementChild.tagName !== 'CODE') return null;

    const match = prev.textContent.trim().match(FILENAME_PATTERN);
    if (!match) return null;

    prev.remove();
    return match[1];
}

for (const codeBlock of codeBlocks) {
    codeBlock.className = 'code';
    const fileName = takeFileName(codeBlock.parentElement);
    const codes = codeBlock.innerHTML.match(/(.*)(\n|.*$)/g);

    const processedCodes = codes.reduce((prevCodes, curCode) => {
        if(curCode === '') return prevCodes;
        return prevCodes + `<div class="line">${curCode}</div>`
    }, '');

    const copyButton = `<button type="button" class="btn-copy" 
            data-code="${encodeURI(codeBlock.textContent)}" 
            onclick="copyBlockCode(this)">${COPY_BUTTON_TEXT_BEFORE}</button>`;

    codeBlock.innerHTML = `
        <div class="code-header">
            <ul class="circle-list">
                <li class="circle bg-red"></li>
                <li class="circle bg-yellow"></li>
                <li class="circle bg-green"></li>
            </ul>

            ${fileName ? `<span class="code-file">${fileName}</span>` : ''}

            ${copyButton}
      </div>
      <div class="code-body">${processedCodes}</div>
    `;
}
