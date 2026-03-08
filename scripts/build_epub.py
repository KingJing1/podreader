#!/usr/bin/env python3
"""
PodReader EPUB 生成器
将精读文章 HTML 内容打包为格式精美的 EPUB 3.0 电子书。

使用方式：
    python build_epub.py --title "文章标题" --body article.html --output output.epub
    
    也可作为模块调用：
    from build_epub import build_epub
    build_epub(title, body_html, output_path, metadata_block=None, author=None)

Author: @一龙小包子 | Version: 1.0 | License: CC BY 4.0
"""

import argparse
import os
import uuid
import zipfile
from datetime import datetime, timezone

# ─── 默认值 ───

DEFAULT_AUTHOR = "@一龙小包子"
DEFAULT_CREDIT = "编辑整理：@一龙小包子、Claude Opus"
DEFAULT_LANG = "zh-CN"

# ─── CSS 样式 ───
# 关键原则：
# - 不设 body font-size，让阅读器控制（解决微信读书字号偏大问题）
# - 不设 body background-color，让阅读器控制暗色/亮色模式
# - 所有背景色使用 rgba() 半透明值，确保暗色模式兼容
# - blockquote 绝对不用不透明背景色

STYLESHEET = """\
@charset "utf-8";

body {
  font-family: "Source Han Serif SC", "Noto Serif CJK SC", "Songti SC",
               "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", serif;
  line-height: 1.8;
  margin: 1.5em;
  color: #333;
}

h1 {
  font-size: 1.6em;
  line-height: 1.3;
  margin-bottom: 0.3em;
  font-weight: bold;
}

h2 {
  font-size: 1.2em;
  margin-top: 2em;
  margin-bottom: 0.8em;
  font-weight: bold;
}

p {
  margin-bottom: 0.8em;
  text-align: justify;
}

.subtitle {
  font-size: 0.95em;
  color: #666;
  margin-bottom: 1.5em;
  line-height: 1.6;
}

.lede {
  background: rgba(128, 128, 128, 0.05);
  border-left: 4px solid rgba(128, 128, 128, 0.3);
  border-radius: 4px;
  padding: 1em 1.2em;
  margin: 1.5em 0;
}

.lede p {
  margin-bottom: 0.5em;
}

blockquote {
  background: rgba(128, 128, 128, 0.04);
  border-left: 4px solid rgba(128, 128, 128, 0.25);
  border-radius: 4px;
  padding: 0.8em 1.2em;
  margin: 1.2em 0;
  font-style: italic;
}

blockquote p {
  margin-bottom: 0.3em;
}

.quote-attr {
  text-align: right;
  font-size: 0.85em;
  color: #888;
  margin-top: -0.5em;
  margin-bottom: 1.2em;
}

.metadata {
  font-size: 0.8em;
  color: #999;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  padding-bottom: 1em;
  margin-bottom: 2em;
  line-height: 1.6;
}

.section-break {
  text-align: center;
  margin: 2em 0;
  color: #ccc;
  font-size: 1.2em;
  letter-spacing: 0.5em;
}

.credit {
  margin-top: 3em;
  padding-top: 1em;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
  font-size: 0.8em;
  color: #999;
  text-align: right;
}
"""

# ─── EPUB 模板 ───

MIMETYPE = "application/epub+zip"

CONTAINER_XML = """\
<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>"""

CONTENT_OPF_TEMPLATE = """\
<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">urn:uuid:{uuid}</dc:identifier>
    <dc:title>{title}</dc:title>
    <dc:creator>{author}</dc:creator>
    <dc:language>{lang}</dc:language>
    <dc:date>{date}</dc:date>
    <meta property="dcterms:modified">{modified}</meta>
  </metadata>
  <manifest>
    <item id="style" href="style.css" media-type="text/css"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="article" href="article.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="article"/>
  </spine>
</package>"""

NAV_XHTML_TEMPLATE = """\
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="{lang}">
<head>
  <meta charset="utf-8"/>
  <title>导航</title>
</head>
<body>
  <nav epub:type="toc">
    <h1>目录</h1>
    <ol>
      <li><a href="article.xhtml">{title}</a></li>
    </ol>
  </nav>
</body>
</html>"""

ARTICLE_XHTML_TEMPLATE = """\
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="{lang}">
<head>
  <meta charset="utf-8"/>
  <title>{title}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
{body}
</body>
</html>"""


def build_epub(
    title: str,
    body_html: str,
    output_path: str,
    author: str = DEFAULT_AUTHOR,
    credit: str = DEFAULT_CREDIT,
    lang: str = DEFAULT_LANG,
):
    """
    将精读文章 HTML 内容打包为 EPUB 3.0 文件。

    参数：
        title:       文章标题（用于 EPUB 元数据和导航）
        body_html:   文章 HTML 内容（<body> 内部的内容，不含 <body> 标签本身）
                     应使用 SKILL.md 中定义的 HTML 结构标签：
                     <div class="metadata">, <h1>, <p class="subtitle">,
                     <div class="lede">, <h2>, <blockquote>, 等
        output_path: 输出文件路径（.epub）
        author:      作者署名，默认 @一龙小包子
        credit:      文末署名，默认"编辑整理：@一龙小包子、Claude Opus"
        lang:        语言代码，默认 zh-CN
    """
    book_uuid = str(uuid.uuid4())
    now = datetime.now(tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    today = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")

    # 在文末追加署名
    if credit:
        body_html += f'\n<div class="credit">{credit}</div>'

    article_xhtml = ARTICLE_XHTML_TEMPLATE.format(
        title=_escape_xml(title), lang=lang, body=body_html
    )
    content_opf = CONTENT_OPF_TEMPLATE.format(
        uuid=book_uuid,
        title=_escape_xml(title),
        author=_escape_xml(author),
        lang=lang,
        date=today,
        modified=now,
    )
    nav_xhtml = NAV_XHTML_TEMPLATE.format(
        title=_escape_xml(title), lang=lang
    )

    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    # 打包 EPUB（本质是 ZIP，mimetype 必须为第一个文件且不压缩）
    with zipfile.ZipFile(output_path, "w") as zf:
        # mimetype 必须是第一个条目，不压缩
        zf.writestr("mimetype", MIMETYPE, compress_type=zipfile.ZIP_STORED)
        zf.writestr("META-INF/container.xml", CONTAINER_XML)
        zf.writestr("OEBPS/content.opf", content_opf)
        zf.writestr("OEBPS/nav.xhtml", nav_xhtml)
        zf.writestr("OEBPS/style.css", STYLESHEET)
        zf.writestr("OEBPS/article.xhtml", article_xhtml)

    print(f"EPUB 已生成: {output_path}")
    print(f"  标题: {title}")
    print(f"  作者: {author}")
    print(f"  大小: {os.path.getsize(output_path):,} 字节")
    return output_path


def _escape_xml(text: str) -> str:
    """转义 XML 特殊字符"""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


# ─── CLI ───

def main():
    parser = argparse.ArgumentParser(
        description="PodReader EPUB 生成器 — 将精读文章 HTML 打包为 EPUB 电子书"
    )
    parser.add_argument("--title", required=True, help="文章标题")
    parser.add_argument(
        "--body", required=True,
        help="文章 HTML 文件路径（<body> 内部内容）"
    )
    parser.add_argument("--output", required=True, help="输出 EPUB 文件路径")
    parser.add_argument("--author", default=DEFAULT_AUTHOR, help="作者署名")
    parser.add_argument("--credit", default=DEFAULT_CREDIT, help="文末署名")
    parser.add_argument("--lang", default=DEFAULT_LANG, help="语言代码")

    args = parser.parse_args()

    with open(args.body, "r", encoding="utf-8") as f:
        body_html = f.read()

    build_epub(
        title=args.title,
        body_html=body_html,
        output_path=args.output,
        author=args.author,
        credit=args.credit,
        lang=args.lang,
    )


if __name__ == "__main__":
    main()
