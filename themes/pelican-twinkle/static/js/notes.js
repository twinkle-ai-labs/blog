document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('notes-search-input');
    const list = document.querySelector('.post-list');

    if (!input || !list) return;

    const rows = Array.from(list.querySelectorAll(':scope > li:not(.no-results)'));
    const notes = rows.filter(function (row) {
        return !row.classList.contains('list-group-header');
    });
    if (!notes.length) return;

    const emptyState = document.createElement('li');
    emptyState.className = 'no-results search-empty';
    emptyState.innerHTML = '<div class="info"><div class="info-desc"><h3>No Notes Found</h3><p>다른 검색어로 다시 시도해보세요.</p></div></div>';

    // A header stays visible only while at least one note beneath it matches.
    const syncGroupHeaders = function () {
        let header = null;
        let groupHasMatch = false;

        rows.forEach(function (row) {
            if (row.classList.contains('list-group-header')) {
                if (header) header.style.display = groupHasMatch ? '' : 'none';
                header = row;
                groupHasMatch = false;
            } else if (row.style.display !== 'none') {
                groupHasMatch = true;
            }
        });

        if (header) header.style.display = groupHasMatch ? '' : 'none';
    };

    input.addEventListener('input', function () {
        const query = input.value.trim().toLowerCase();
        let visibleCount = 0;

        notes.forEach(function (note) {
            const match = query === '' || note.textContent.toLowerCase().includes(query);
            note.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });

        syncGroupHeaders();

        const showEmpty = query !== '' && visibleCount === 0;
        if (showEmpty && !emptyState.isConnected) {
            list.appendChild(emptyState);
        } else if (!showEmpty && emptyState.isConnected) {
            emptyState.remove();
        }
    });
});
