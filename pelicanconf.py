SITENAME = "Twinkle Blog"
SITEURL = ""

PATH = "content"
TIMEZONE = 'Asia/Seoul'
DEFAULT_LANG = 'en'

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
JINJA_ENVIRONMENT = {
    'extensions': ['jinja2.ext.loopcontrols']
}

# PLUGINS
PLUGIN_PATHS = [THEME + '/plugins']
PLUGINS = [
    'pelican.plugins.sitemap',
    'representative_image',
    'share_post',
    'neighbors',
    'custom_article_urls'
]

# PLUGIN - custom_article_urls
ARTICLE_URL = "posts/{slug}.html"
CUSTOM_ARTICLE_URLS = {
    'pelican': {
        'URL': '{category}/{slug}.html',
        'SAVE_AS': '{category}/{slug}.html'
    }
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
    ("home", "https://twinklekhj.xyz", "fontawesome"),
    ("velog", "https://velog.io/@developer_khj", "image"),
    ("github", "https://github.com/hjkim1004", "image"),
    ("gmail", "mailto:developer.heejeong@gmail.com", "image"),
)

# Author Name
AUTHOR = "Heejeong Kim"
AUTHOR_INFO = {
    "GITHUB": "hjkim1004",
    "DESCRIPTION": "Hi, I'm full-stack developer<br>Thanks for visiting"
}

# OG METADATA
OG_TITLE = SITENAME
OG_DESCRIPTION = AUTHOR_INFO["DESCRIPTION"]

# Date Format
DEFAULT_DATE_FORMAT = ('%b %d, %Y')
