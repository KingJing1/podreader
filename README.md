# PodReader — 播客精读与高质量中文写作 Skill

将播客转录稿、长文、报告、书籍章节等长内容提炼为高质量的杂志风格中文精读文章。可输出为 EPUB 电子书或微信公众号格式。

## 这个 Skill 能做什么

- 从长内容中提取"宝石"（真正有价值的洞见），过滤噪音
- 自动处理专业术语：保留英文原文，用大白话解释
- 清理口语引语，保留说话者的真实语气
- 支持单人独白和多人对谈
- 内置反"AI 味"写作规范，输出自然、有人味儿的中文
- 一键输出 EPUB 电子书（兼容微信读书等阅读器）
- 一键输出微信公众号格式（复制粘贴即保留排版）

## 安装

下载 `podreader.skill` 文件，在 Claude 设置页面的 Skills 板块上传即可。

或者手动安装：将 `SKILL.md` 放入 Claude 可访问的 skills 目录。

## 使用方式

安装后直接在对话中使用，无需额外指令：

| 你说的话 | 触发模式 |
|---------|---------|
| "帮我精读/总结这篇内容" | 纯文字精读 |
| "做成 EPUB" | 精读 + EPUB 电子书 |
| "转公众号格式" | 精读 + 微信公众号 HTML |
| "EPUB 和公众号都要" | 同时输出两种格式 |

上传播客转录稿时，建议同时提供播客名、嘉宾、期数等元信息，会自动写入 EPUB 头部。

## 设计理念

这个 Skill 的写作方法论脱胎于长期的播客精读实践，核心信念是：

1. **80/20 法则** — 用 20% 的阅读时间获取 80% 的价值
2. **拦路虎先行** — 在读者被术语卡住之前就解释清楚
3. **宝石驱动** — 只保留真正令人惊讶或有用的内容
4. **反 AI 味** — 严格禁止"不是A而是B"等套路句式，追求粗粝的真诚感

## 文件说明

```
podreader/
├── SKILL.md              # 技能定义文件（写作方法论 + 调用说明）
├── editor/
│   ├── index.html        # 可视化公众号排版器（左 Markdown，右预览）
│   ├── styles.css        # 编辑器样式
│   └── app.js            # Markdown 解析、预览和复制逻辑
├── scripts/
│   ├── build_epub.py     # EPUB 3.0 生成器（CSS 样式、暗色模式兼容已内置）
│   ├── build_wechat.py   # 微信公众号 HTML 生成器（内联样式，复制粘贴即保留排版）
│   └── serve_editor.py   # 本地可视化公众号排版器启动脚本
├── podreader.skill       # 打包好的一键安装文件
├── README.md
└── LICENSE
```

### 脚本也可独立使用

不安装 Skill，也可以直接用脚本把已有的 HTML 文章打包：

```bash
# 生成 EPUB
python scripts/build_epub.py --title "文章标题" --body article.html --output output.epub

# 生成公众号 HTML
python scripts/build_wechat.py --title "文章标题" --body article.html --output output.html
```

脚本只依赖 Python 标准库，无需安装任何第三方包。

### 可视化公众号排版器

如果你想一边看预览一边微调排版，可以直接启动本地可视化编辑器：

```bash
python scripts/serve_editor.py
```

启动后打开浏览器访问 `http://127.0.0.1:8765/editor/` 即可。

它支持：

- 左侧直接粘贴成品 Markdown
- 右侧实时预览公众号效果
- 调整正文字号、行距、标题、引用样式
- 一键复制成公众号可粘贴的富文本
- 复制完整 HTML 或下载 `_公众号.html`
- `:::meta`、`:::subtitle`、`:::lede` 这类公众号文章专用块

## License

CC BY 4.0 — 自由使用和修改，署名即可。

## Author

[@一龙小包子](https://x.com/KingJing001) — 关心 AI，更关心人类
