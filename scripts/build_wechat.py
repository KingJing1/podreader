#!/usr/bin/env python3
"""
PodReader 微信公众号 HTML 生成器
将精读文章 HTML 内容转换为带内联样式的 HTML 文件，
复制粘贴到公众号编辑器即可保留排版。

使用方式：
    python build_wechat.py --title "文章标题" --body article.html --output output.html

    也可作为模块调用：
    from build_wechat import build_wechat_html
    build_wechat_html(title, body_html, output_path)

Author: @一龙小包子 | Version: 1.0 | License: CC BY 4.0
"""

import argparse
import os
import re

# ─── 内联样式映射 ───
# 公众号编辑器不支持 <style> 标签，所有样式必须内联。
# 以下样式经过微信公众号编辑器实测，确保粘贴后排版保留。

STYLES = {
    "body": (
        "max-width:680px;margin:0 auto;padding:20px;"
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"
        "color:#333;line-height:2;letter-spacing:0.5px;"
    ),
    "h1": (
        "font-size:22px;font-weight:bold;text-align:center;"
        "margin-bottom:8px;line-height:1.4;color:#1a1a1a;"
    ),
    "h2": (
        "font-size:18px;font-weight:bold;"
        "margin-top:32px;margin-bottom:16px;color:#1a1a1a;"
    ),
    "p": "font-size:15px;color:#333;line-height:2;letter-spacing:0.5px;margin-bottom:16px;",
    "subtitle": (
        "font-size:14px;color:#888;text-align:center;"
        "margin-bottom:24px;line-height:1.8;"
    ),
    "lede": (
        "border-left:3px solid #b0b0b0;padding:16px 20px;"
        "margin:24px 0;background:#f9f9f9;border-radius:4px;"
    ),
    "lede_p": "font-size:15px;color:#555;line-height:2;margin-bottom:8px;",
    "blockquote": (
        "border-left:3px solid #d4d4d4;padding:12px 16px;"
        "margin:20px 0;background:#f7f7f7;font-style:italic;border-radius:4px;"
    ),
    "blockquote_p": "font-size:15px;color:#666;line-height:1.9;margin-bottom:6px;",
    "quote_attr": (
        "text-align:right;font-size:13px;color:#999;"
        "margin-top:-8px;margin-bottom:20px;"
    ),
    "metadata": (
        "font-size:13px;color:#999;border-bottom:1px solid #eee;"
        "padding-bottom:16px;margin-bottom:24px;line-height:1.8;"
    ),
    "section_break": (
        "text-align:center;color:#ddd;margin:32px 0;"
        "letter-spacing:8px;font-size:16px;"
    ),
    "credit": (
        "margin-top:40px;padding-top:16px;"
        "border-top:1px solid #eee;font-size:13px;"
        "color:#999;text-align:right;"
    ),
}


def build_wechat_html(
    title: str,
    body_html: str,
    output_path: str,
    credit: str = "编辑整理：@一龙小包子、Claude Opus",
):
    """
    将精读文章 HTML 内容转换为微信公众号兼容的内联样式 HTML。

    参数：
        title:       文章标题
        body_html:   文章 HTML 内容（使用 SKILL.md 中定义的语义标签）
        output_path: 输出文件路径（.html）
        credit:      文末署名
    """
    html = body_html

    # 追加文末署名
    if credit:
        html += f'\n<div class="credit">{credit}</div>'

    # 按从内到外的顺序替换标签，避免嵌套冲突

    # 1. blockquote 内部的 <p>
    html = _replace_inside_tag(
        html, "blockquote", "<p>",
        f'<p style="{STYLES["blockquote_p"]}">'
    )

    # 2. lede 内部的 <p>
    html = _replace_inside_tag(
        html, "div", "<p>",
        f'<p style="{STYLES["lede_p"]}">',
        class_filter="lede"
    )

    # 3. 外层标签替换
    replacements = [
        # 带 class 的 div
        (r'<div class="metadata">', f'<div style="{STYLES["metadata"]}">'),
        (r'<div class="lede">', f'<div style="{STYLES["lede"]}">'),
        (r'<div class="section-break">', f'<div style="{STYLES["section_break"]}">'),
        (r'<div class="quote-attr">', f'<div style="{STYLES["quote_attr"]}">'),
        (r'<div class="credit">', f'<div style="{STYLES["credit"]}">'),
        # 带 class 的 p
        (r'<p class="subtitle">', f'<p style="{STYLES["subtitle"]}">'),
        # 块级标签
        (r"<h1>", f'<h1 style="{STYLES["h1"]}">'),
        (r"<h2>", f'<h2 style="{STYLES["h2"]}">'),
        (r"<blockquote>", f'<section style="{STYLES["blockquote"]}">'),
        (r"</blockquote>", "</section>"),
        # 普通 <p>（不在 blockquote/lede 内部的）
        (r"<p>", f'<p style="{STYLES["p"]}">'),
    ]

    for pattern, replacement in replacements:
        html = re.sub(pattern, replacement, html)

    # 包装为完整 HTML 文档
    full_html = f"""\
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{_escape_html(title)}</title>
</head>
<body style="{STYLES['body']}">
{html}
</body>
</html>"""

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(full_html)

    print(f"公众号 HTML 已生成: {output_path}")
    print(f"  标题: {title}")
    print(f"  大小: {os.path.getsize(output_path):,} 字节")
    print(f"  使用方式: 在浏览器中打开 → 全选 → 复制 → 粘贴到公众号编辑器")
    return output_path


def _replace_inside_tag(
    html: str,
    parent_tag: str,
    target: str,
    replacement: str,
    class_filter: str = None,
) -> str:
    """
    在指定父标签内部替换子标签。
    用于区分 blockquote 内的 <p> 和普通 <p> 的样式。
    """
    if class_filter:
        pattern = rf'(<{parent_tag}\s+class="{class_filter}"[^>]*>)(.*?)(</{parent_tag}>)'
    else:
        pattern = rf"(<{parent_tag}[^>]*>)(.*?)(</{parent_tag}>)"

    def _inner_replace(match):
        opening = match.group(1)
        content = match.group(2).replace(target, replacement)
        closing = match.group(3)
        return opening + content + closing

    return re.sub(pattern, _inner_replace, html, flags=re.DOTALL)


def _escape_html(text: str) -> str:
    """转义 HTML 特殊字符"""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


# ─── CLI ───

def main():
    parser = argparse.ArgumentParser(
        description="PodReader 微信公众号 HTML 生成器"
    )
    parser.add_argument("--title", required=True, help="文章标题")
    parser.add_argument(
        "--body", required=True,
        help="文章 HTML 文件路径（<body> 内部内容）"
    )
    parser.add_argument("--output", required=True, help="输出 HTML 文件路径")
    parser.add_argument(
        "--credit",
        default="编辑整理：@一龙小包子、Claude Opus",
        help="文末署名",
    )

    args = parser.parse_args()

    with open(args.body, "r", encoding="utf-8") as f:
        body_html = f.read()

    build_wechat_html(
        title=args.title,
        body_html=body_html,
        output_path=args.output,
        credit=args.credit,
    )


if __name__ == "__main__":
    main()
