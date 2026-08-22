SITENAME = "Twinkle Blog"
SITEURL = ""

PATH = "content"
TIMEZONE = 'Asia/Seoul'
DEFAULT_LANG = 'ko'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

DEFAULT_PAGINATION = 5
PAGINATION_PATTERNS = (
    (1, "{base_name}/", "{base_name}/index.html"),
    (2, "{base_name}/page/{number}/", "{base_name}/page/{number}/index.html"),
)

# Uncomment following line if you want document-relative URLs when developing
# RELATIVE_URLS = True

DISQUS_SITENAME = "twinklekhj"

#######################################
# THEME Options
#######################################
# Statics
STATIC_PATHS = ["images", "extra/robots.txt", "extra/CNAME"]
EXTRA_PATH_METADATA = {
    "extra/robots.txt": {"path": "robots.txt"},
    "extra/CNAME": {"path": "CNAME"},
}

# THEME
THEME = "themes/pelican-twinkle"
THEME_STATIC_DIR = 'theme'

# JINJA
# i18n — 테마의 문장을 gettext로 갈아 끼우기 위한 확장. 없으면 번역이 통째로 무시된다.
JINJA_ENVIRONMENT = {
    'extensions': ['jinja2.ext.loopcontrols', 'jinja2.ext.i18n']
}

# MARKDOWN
# Pelican 기본값 + toc — 제목마다 id가 생겨야 우측 이정표(TOC)가 링크를 걸 수 있다.
MARKDOWN = {
    'extension_configs': {
        'markdown.extensions.codehilite': {'css_class': 'highlight'},
        'markdown.extensions.extra': {},
        'markdown.extensions.meta': {},
        'markdown.extensions.toc': {'permalink': False},
    },
    'output_format': 'html5',
}

# PLUGINS
PLUGIN_PATHS = [THEME + '/plugins']
PLUGINS = [
    'pelican.plugins.sitemap',
    'pelican.plugins.i18n_subsites',
    'representative_image',
    'share_post',
    'neighbors',
    'custom_article_urls'
]

#######################################
# I18N — 한국어가 본진, 영어는 /en/ 서브사이트
#######################################
# 본진의 언어는 DEFAULT_LANG(ko)이다. Lang: en 이 붙은 글만 /en/ 으로 간다.
# 테마 문장의 원문(msgid)도 한국어라, 번역 파일이 없어도 한국어 사이트는 멀쩡하다.
I18N_SUBSITES = {
    'en': {
        # 앞의 것부터 시도하고 없으면 다음으로 넘어간다 — CI 이미지마다 있는 로케일이 다르다.
        'LOCALE': ['en_US.UTF-8', 'en_US.utf8', 'C.UTF-8'],
        'DEFAULT_DATE_FORMAT': '%B %-d, %Y',
    }
}

# 언어 이름은 늘 그 언어로 적는다 — 영어를 쓰는 사람에게 '영어'라고 써두면 읽을 수가 없다.
# 언어를 늘리려면 I18N_SUBSITES 와 이곳에 한 줄씩 추가하면 된다.
LANGUAGE_NAMES = {
    'ko': {'flag': '🇰🇷', 'name': '한국어'},
    'en': {'flag': '🇺🇸', 'name': 'English'},
}

# 번역이 없는 글은 상대 사이트에서 아예 빼낸다.
# 'hide'는 초안으로 밀어넣어 /en/drafts/ 에 한국어 글이 되살아난다 — 그건 원하는 그림이 아니다.
I18N_UNTRANSLATED_ARTICLES = 'remove'
I18N_UNTRANSLATED_PAGES = 'remove'

# PLUGIN - custom_article_urls
ARTICLE_URL = "posts/{slug}.html"
CUSTOM_ARTICLE_URLS = {
    'pelican': {
        'URL': '{category}/{slug}.html',
        'SAVE_AS': '{category}/{slug}.html'
    },
    # 시리즈는 제 이름의 자리에 모인다 — /stock-calculator/…-intro.html
    'stock-calculator': {
        'URL': '{category}/{slug}.html',
        'SAVE_AS': '{category}/{slug}.html'
    },
}

CATEGORY_URL = 'category/{slug}/'
CATEGORY_SAVE_AS = 'category/{slug}/index.html'

TAG_URL = 'tag/{slug}/'
TAG_SAVE_AS = 'tag/{slug}/index.html'


# PLUGIN - sitemap
SITEMAP = {
    'format': 'xml'
}

# Author Links
LINKS = (
    ("velog", "https://velog.io/@developer_khj", "image"),
    ("github", "https://github.com/hjkim1004", "image"),
    ("gmail", "mailto:developer.heejeong@gmail.com", "image"),
)

# Author Name
AUTHOR = "Heejeong Kim"
AUTHOR_INFO = {
    "GITHUB": "hjkim1004",
    "PORTFOLIO": "https://me.twinklelabs.kr",
    "DESCRIPTION": "Hi, I'm full-stack developer<br>Thanks for visiting"
}

# OG METADATA
OG_TITLE = SITENAME
OG_DESCRIPTION = AUTHOR_INFO["DESCRIPTION"]

# Date Format
DEFAULT_DATE_FORMAT = ('%Y년 %-m월 %-d일')
