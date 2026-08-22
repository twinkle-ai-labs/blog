# This file is only used if you use `make publish` or
# explicitly specify it as your config file.

import os
import sys

sys.path.append(os.curdir)
from pelicanconf import *

# If your site is available via HTTPS, make sure SITEURL begins with https://
SITEURL = "https://blog.twinklelabs.kr"
RELATIVE_URLS = False

FEED_ALL_ATOM = "feeds/all.atom.xml"
CATEGORY_FEED_ATOM = "feeds/{slug}.atom.xml"

DELETE_OUTPUT_DIRECTORY = True

# Following items are often useful when publishing

DISQUS_SITENAME = "twinklekhj"
# GA4 측정 ID — «G-» 로 시작하는 것. 비밀이 아니다(페이지 소스에 그대로 실린다).
# **여기에만** 둔다. pelicanconf 에 두면 글을 고치는 동안의 새로고침이 전부 통계로 들어간다.
# 비워 두면 계측을 아예 싣지 않는다.
# GOOGLE_ANALYTICS = "G-XXXXXXXXXX"

