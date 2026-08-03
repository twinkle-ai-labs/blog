// 시스템(OS) 테마 — 사용자가 직접 고르기 전까지 이 값을 따른다
const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const getSystemTheme = function () {
    return systemThemeQuery.matches ? 'dark' : 'light';
};

const Store = {
    theme: {
        // localStorage.theme 이 있으면 사용자가 직접 고른 것, 없으면 시스템을 따른다
        value: localStorage.theme || getSystemTheme(),
        reducers: {
            setTheme: function (theme) {
                Store.theme.value = theme;
                localStorage.theme = theme;
                Store.theme.reducers.applyTheme();
            },
            applyTheme: function () {
                const value = Store.theme.value;

                document.body.dataset.theme = value;

                const metaThemeObj = document.querySelector('meta[name="theme-color"]');
                // 테마 컬러 추가
                if (value === 'dark') {
                    metaThemeObj.setAttribute('content', '#1e1e1e')
                } else {
                    metaThemeObj.setAttribute('content', 'white')
                }

                Store.theme.observer.notify(value);
            }
        },
        observer: {
            listeners: [],
            addObserver: function (listener) {
                return Store.theme.observer.listeners.push(listener) - 1;
            },
            removeObserver: function (id) {
                Store.theme.observer.listeners.splice(id, 1);
            },
            notify: function (value) {
                for (let listener of Store.theme.observer.listeners) {
                    listener(value);
                }
            }
        }
    },
    sidebar: {
        value: localStorage.sidebarCollapsed === 'true',
        reducers: {
            setCollapsed: function (collapsed) {
                Store.sidebar.value = collapsed;
                Store.sidebar.reducers.applyCollapsed();
            },
            applyCollapsed: function () {
                const value = Store.sidebar.value;

                localStorage.sidebarCollapsed = value;
                document.body.classList.toggle('sidebar-collapsed', value);
            }
        }
    },
    offset: {
        value: window.scrollY,
        reducers: {
            setOffset: function (offset) {
                Store.offset.value = offset;
            },
            applyOffset: function () {
                const value = Store.offset.value;
                if (value === 0) {
                    document.body.classList.remove('scrolled')
                } else {
                    document.body.classList.add('scrolled')
                }
            }
        }
    }
}

const Action = {
    toggleTheme: function () {
        if (Store.theme.value === 'light') {
            Store.theme.reducers.setTheme('dark');
        } else {
            Store.theme.reducers.setTheme('light');
        }

        Store.theme.reducers.applyTheme();
    },
    applyTheme: function () {
        Store.theme.reducers.applyTheme();
    },
    // 사용자가 직접 고른 적이 없으면 시스템 테마를 계속 따라간다
    followSystemTheme: function () {
        if (localStorage.theme) return;

        Store.theme.value = getSystemTheme();
        Store.theme.reducers.applyTheme();
    },
    toggleSidebar: function () {
        Store.sidebar.reducers.setCollapsed(!Store.sidebar.value);
    },
    applySidebar: function () {
        Store.sidebar.reducers.applyCollapsed();
    },
    changeOffset: function (offset) {
        Store.offset.reducers.setOffset(offset);
        Store.offset.reducers.applyOffset();
    },
    applyOffset: function () {
        Store.offset.reducers.applyOffset();
    }
}

// OS 테마가 바뀌면 즉시 반영 (사용자 지정이 없을 때만)
systemThemeQuery.addEventListener("change", Action.followSystemTheme);
