const STORAGE_KEY = "podreader.wechat.studio.v1";

const DEFAULT_THEME = {
  bodyFontSize: 15,
  lineHeight: 2,
  letterSpacing: 0.5,
  h1Size: 22,
  h2Size: 18,
  textColor: "#333333",
  headingColor: "#1a1a1a",
  quoteBg: "#f7f7f7",
  quoteBorder: "#d4d4d4",
  bodyMaxWidth: 680,
};

const SNIPPETS = {
  meta: `:::meta
播客：《播客名》
本期：标题
嘉宾：嘉宾名
发布日期：YYYY-MM-DD
:::`,
  subtitle: `:::subtitle
副标题一句话，补充你想让读者先知道的判断。
:::`,
  lede: `:::lede
这里放开篇导语。适合 1 到 2 段，把这篇文章最值得读的地方先说出来。
:::`,
  quote: `> 这里放一段你想重点呈现的原话。

—— 说话者`,
  divider: `---`,
  code: "```text\n这里放代码、步骤或引用片段\n```",
};

const SAMPLE_MARKDOWN = `:::meta
播客：《No Priors》
本期：怎样把长内容做成一篇值得读完的公众号文章
嘉宾：PodReader Studio
发布日期：2026-03-10
:::

# 一篇真正好读的公众号文章，重点不是“总结完整”，而是让读者一路往下滑

:::subtitle
这是 PodReader 的可视化样例稿。左边改 Markdown，右边直接看接近最终粘贴效果。
:::

:::lede
大部分总结类内容的问题，不是信息不够，而是节奏太平均。每段都像摘要，每段都不够重要，于是读者读了三屏就走了。

公众号排版的意义，不是“变好看”这么简单。它是在帮内容建立轻重关系：哪里该停，哪里该快，哪里该把一句原话抬起来。
:::

## 真正需要被强调的，不是所有句子

很多排版器解决的是“Markdown 怎么转成样式”，但你真正想要的是一个编辑器：能一边看内容，一边判断哪里该加留白，哪里该把引用抬起来，哪里该加一个分隔把呼吸拉开。[这类工具的共同思路](https://github.com/doocs/md) 基本都是左写右看，再一键复制到公众号。

> 真正让人读下去的，从来不是某个花哨的标题样式，而是每一段都在往前推。

—— 编辑室笔记

---

## 你只需要控制几个高杠杆变量

- 正文的字号、行距、字色
- 标题和分隔的节奏
- 引用块的背景和边线
- 链接是直接保留，还是转成脚注
- 图片、列表、代码这类少量特殊块

\`\`\`text
复制去公众号前，最后再顺读一遍。
如果某个分隔线只是在“装饰”，那它通常就该删掉。
\`\`\`

## 这就是为什么可视化很重要

你在左边调 Markdown，其实是在改结构；你在右边看预览，其实是在改节奏。两者合在一起，才是适合长期自用的公众号工作台。`;

const state = {
  markdown: SAMPLE_MARKDOWN,
  theme: { ...DEFAULT_THEME },
  linkFootnotes: true,
  rendered: {
    articleHtml: "",
    fullHtml: "",
    plainText: "",
  },
};

const elements = {
  markdownInput: document.querySelector("#markdown-input"),
  preview: document.querySelector("#wechat-preview"),
  statusLine: document.querySelector("#status-line"),
  statsLine: document.querySelector("#stats-line"),
  linkFootnotes: document.querySelector("#link-footnotes"),
  protocolWarning: document.querySelector("#protocol-warning"),
  copyWechat: document.querySelector("#copy-wechat"),
  copyHtml: document.querySelector("#copy-html"),
  downloadHtml: document.querySelector("#download-html"),
  resetTheme: document.querySelector("#reset-theme"),
  loadSample: document.querySelector("#load-sample"),
  clearMarkdown: document.querySelector("#clear-markdown"),
  snippetButtons: Array.from(document.querySelectorAll(".snippet-button")),
  themeInputs: Array.from(document.querySelectorAll("[data-theme-key]")),
  themeOutputs: Array.from(document.querySelectorAll("[data-output-for]")),
};

function init() {
  loadState();
  hydrateControls();
  bindEvents();

  if (window.location.protocol === "file:") {
    elements.protocolWarning.hidden = false;
  }

  render();
}

function bindEvents() {
  elements.markdownInput.addEventListener("input", (event) => {
    state.markdown = event.target.value;
    saveState();
    render();
  });

  elements.linkFootnotes.addEventListener("change", (event) => {
    state.linkFootnotes = event.target.checked;
    saveState();
    render();
  });

  elements.themeInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.themeKey;
      state.theme[key] = input.type === "range" ? Number(input.value) : input.value;
      syncControlOutput(key);
      saveState();
      render();
    });
  });

  elements.snippetButtons.forEach((button) => {
    button.addEventListener("click", () => insertSnippet(button.dataset.snippet));
  });

  elements.resetTheme.addEventListener("click", () => {
    state.theme = { ...DEFAULT_THEME };
    hydrateControls();
    saveState();
    render();
    setStatus("样式已恢复到 PodReader 默认值。");
  });

  elements.loadSample.addEventListener("click", () => {
    state.markdown = SAMPLE_MARKDOWN;
    elements.markdownInput.value = state.markdown;
    saveState();
    render();
    setStatus("已载入样例稿。");
  });

  elements.clearMarkdown.addEventListener("click", () => {
    state.markdown = "";
    elements.markdownInput.value = "";
    saveState();
    render();
    setStatus("输入区已清空。");
  });

  elements.copyWechat.addEventListener("click", async () => {
    await copyRichTextToClipboard();
  });

  elements.copyHtml.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(state.rendered.fullHtml);
      setStatus("完整 HTML 已复制。");
    } catch (error) {
      fallbackCopyText(state.rendered.fullHtml);
      setStatus("HTML 已用备用方式复制。");
    }
  });

  elements.downloadHtml.addEventListener("click", () => {
    const blob = new Blob([state.rendered.fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${createFileStem(state.markdown)}_公众号.html`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("HTML 文件已开始下载。");
  });

  document.addEventListener("keydown", async (event) => {
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      await copyRichTextToClipboard();
    }
  });
}

function hydrateControls() {
  elements.markdownInput.value = state.markdown;
  elements.linkFootnotes.checked = state.linkFootnotes;

  elements.themeInputs.forEach((input) => {
    const key = input.dataset.themeKey;
    input.value = state.theme[key];
    syncControlOutput(key);
  });
}

function syncControlOutput(key) {
  const input = elements.themeInputs.find((item) => item.dataset.themeKey === key);
  const output = elements.themeOutputs.find((item) => item.dataset.outputFor === key);

  if (!input || !output) {
    return;
  }

  if (input.type === "range") {
    output.textContent = key === "lineHeight" ? Number(input.value).toFixed(2) : `${input.value}${key.includes("Color") ? "" : "px"}`;
    if (key === "lineHeight") {
      output.textContent = Number(input.value).toFixed(2);
    }
  } else {
    output.textContent = input.value;
  }
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    state.markdown = parsed.markdown || SAMPLE_MARKDOWN;
    state.linkFootnotes = parsed.linkFootnotes ?? true;
    state.theme = { ...DEFAULT_THEME, ...(parsed.theme || {}) };
  } catch (error) {
    console.warn("loadState failed", error);
  }
}

function saveState() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        markdown: state.markdown,
        linkFootnotes: state.linkFootnotes,
        theme: state.theme,
      }),
    );
  } catch (error) {
    console.warn("saveState failed", error);
  }
}

function render() {
  const compiled = compileMarkdown(state.markdown, {
    theme: state.theme,
    linkFootnotes: state.linkFootnotes,
  });

  state.rendered = compiled;
  elements.preview.innerHTML = compiled.articleHtml;
  elements.statsLine.textContent = `${compiled.stats.characters} 字 · ${compiled.stats.blocks} 个区块`;

  if (compiled.stats.characters === 0) {
    setStatus("还没有内容。左侧开始输入 Markdown 即可。", true);
  } else {
    setStatus("预览已刷新。Cmd/Ctrl + Shift + C 可直接复制公众号富文本。", true);
  }
}

function compileMarkdown(markdown, options) {
  const theme = { ...DEFAULT_THEME, ...(options.theme || {}) };
  const styles = buildStyles(theme);
  const context = {
    styles,
    footnotes: [],
    linkFootnotes: options.linkFootnotes,
    lastBlockType: null,
  };

  const blocks = parseBlocks(markdown, context);
  const renderedBlocks = blocks.map((block) => renderBlock(block, context)).join("\n");
  const footnotesHtml = renderFootnotes(context);
  const articleHtml = `<article style="${styles.article}">${renderedBlocks}${footnotesHtml}</article>`;
  const title = extractTitle(markdown);
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="${styles.body}">${articleHtml}</body>
</html>`;

  return {
    articleHtml,
    fullHtml,
    plainText: toPlainText(articleHtml),
    stats: {
      characters: markdown.replace(/\s+/g, "").length,
      blocks: blocks.length + (context.footnotes.length ? 1 : 0),
    },
  };
}

function parseBlocks(markdown, context) {
  const lines = normalizeMarkdown(markdown).split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      index += 1;
      continue;
    }

    const customBlock = line.match(/^:::(meta|subtitle|lede)$/);
    if (customBlock) {
      const kind = customBlock[1];
      const collected = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== ":::") {
        collected.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: kind, content: collected.join("\n").trim() });
      context.lastBlockType = kind;
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.replace(/^```/, "").trim();
      const codeLines = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", language, content: codeLines.join("\n") });
      context.lastBlockType = "code";
      index += 1;
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      blocks.push({
        type: level === 1 ? "h1" : "h2",
        content: line.replace(/^#{1,3}\s+/, ""),
      });
      context.lastBlockType = level === 1 ? "h1" : "h2";
      index += 1;
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line)) {
      blocks.push({ type: "divider" });
      context.lastBlockType = "divider";
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", paragraphs: splitParagraphs(quoteLines) });
      context.lastBlockType = "quote";
      continue;
    }

    if (/^\d+\.\s+/.test(line) || /^[-*]\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items = [];
      while (
        index < lines.length &&
        ((ordered && /^\d+\.\s+/.test(lines[index].trim())) ||
          (!ordered && /^[-*]\s+/.test(lines[index].trim())))
      ) {
        items.push(lines[index].trim().replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: ordered ? "ol" : "ul", items });
      context.lastBlockType = ordered ? "ol" : "ul";
      continue;
    }

    const paragraphLines = [];
    while (index < lines.length) {
      const current = lines[index];
      const trimmed = current.trim();
      if (!trimmed) {
        index += 1;
        break;
      }
      if (
        /^:::(meta|subtitle|lede)$/.test(trimmed) ||
        /^```/.test(trimmed) ||
        /^#{1,3}\s+/.test(trimmed) ||
        /^(-{3,}|\*{3,})$/.test(trimmed) ||
        /^>\s?/.test(trimmed) ||
        /^\d+\.\s+/.test(trimmed) ||
        /^[-*]\s+/.test(trimmed)
      ) {
        break;
      }

      paragraphLines.push(current);
      index += 1;
    }

    const content = paragraphLines.join(" ").trim();
    if (!content) {
      continue;
    }

    if (context.lastBlockType === "quote" && /^[-—]{1,2}\s*/.test(content)) {
      blocks.push({
        type: "quote_attr",
        content: content.replace(/^[-—]{1,2}\s*/, ""),
      });
      context.lastBlockType = "quote_attr";
      continue;
    }

    blocks.push({ type: "p", content });
    context.lastBlockType = "p";
  }

  return blocks;
}

function renderBlock(block, context) {
  const { styles } = context;

  switch (block.type) {
    case "meta":
      return `<div style="${styles.metadata}">${block.content
        .split("\n")
        .filter(Boolean)
        .map((line) => `<div>${parseInline(line.trim(), context)}</div>`)
        .join("")}</div>`;
    case "subtitle":
      return `<p style="${styles.subtitle}">${parseInline(block.content, context)}</p>`;
    case "lede":
      return `<section style="${styles.lede}">${splitParagraphs(block.content.split("\n"))
        .map((paragraph) => `<p style="${styles.ledeP}">${parseInline(paragraph, context)}</p>`)
        .join("")}</section>`;
    case "h1":
      return `<h1 style="${styles.h1}">${parseInline(block.content, context)}</h1>`;
    case "h2":
      return `<h2 style="${styles.h2}">${parseInline(block.content, context)}</h2>`;
    case "p":
      return `<p style="${styles.p}">${parseInline(block.content, context)}</p>`;
    case "quote":
      return `<blockquote style="${styles.blockquote}">${block.paragraphs
        .map((paragraph) => `<p style="${styles.blockquoteP}">${parseInline(paragraph, context)}</p>`)
        .join("")}</blockquote>`;
    case "quote_attr":
      return `<div style="${styles.quoteAttr}">—— ${parseInline(block.content, context)}</div>`;
    case "ul":
      return `<ul style="${styles.ul}">${block.items
        .map((item) => `<li style="${styles.li}">${parseInline(item, context)}</li>`)
        .join("")}</ul>`;
    case "ol":
      return `<ol style="${styles.ol}">${block.items
        .map((item) => `<li style="${styles.li}">${parseInline(item, context)}</li>`)
        .join("")}</ol>`;
    case "divider":
      return `<div style="${styles.sectionBreak}">✦</div>`;
    case "code":
      return `<pre style="${styles.pre}"><code>${escapeHtml(block.content)}</code></pre>`;
    default:
      return "";
  }
}

function renderFootnotes(context) {
  if (!context.linkFootnotes || context.footnotes.length === 0) {
    return "";
  }

  return `<section style="${context.styles.footnotes}">
    <p style="${context.styles.footnoteTitle}">参考链接</p>
    <ol style="${context.styles.footnoteList}">
      ${context.footnotes
        .map(
          (item, index) =>
            `<li style="${context.styles.footnoteItem}">[${index + 1}] ${escapeHtml(item.label)}：${escapeHtml(item.url)}</li>`,
        )
        .join("")}
    </ol>
  </section>`;
}

function parseInline(text, context) {
  let html = escapeHtml(text);
  const tokens = [];

  html = html.replace(/`([^`]+)`/g, (_, code) => stash(tokens, `<code style="${context.styles.inlineCode}">${escapeHtml(code)}</code>`));

  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, alt, url) =>
    stash(tokens, `<figure style="${context.styles.figure}"><img src="${escapeAttribute(url)}" alt="${escapeAttribute(alt)}" style="${context.styles.image}"><figcaption style="${context.styles.figcaption}">${escapeHtml(alt || "图片")}</figcaption></figure>`),
  );

  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, label, url) => {
    if (context.linkFootnotes) {
      context.footnotes.push({ label, url });
      return `${escapeHtml(label)}<sup style="${context.styles.sup}">[${context.footnotes.length}]</sup>`;
    }

    return stash(
      tokens,
      `<a href="${escapeAttribute(url)}" target="_blank" rel="noreferrer" style="${context.styles.link}">${escapeHtml(label)}</a>`,
    );
  });

  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  html = html.replace(/~~([^~]+)~~/g, '<span style="text-decoration:line-through;">$1</span>');

  return restoreStash(html, tokens);
}

function buildStyles(theme) {
  return {
    body: [
      "margin:0",
      "padding:24px",
      "background:#fbf8f2",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    ].join(";"),
    article: [
      `max-width:${theme.bodyMaxWidth}px`,
      "margin:0 auto",
      "padding:20px",
      "background:#ffffff",
      "color:#1f1f1f",
    ].join(";"),
    metadata: [
      "font-size:13px",
      "color:#999",
      "border-bottom:1px solid #eee",
      "padding-bottom:16px",
      "margin-bottom:24px",
      "line-height:1.8",
    ].join(";"),
    h1: [
      `font-size:${theme.h1Size}px`,
      "font-weight:bold",
      "text-align:center",
      "margin:0 0 8px",
      "line-height:1.35",
      `color:${theme.headingColor}`,
    ].join(";"),
    h2: [
      `font-size:${theme.h2Size}px`,
      "font-weight:bold",
      "margin:32px 0 16px",
      "line-height:1.45",
      `color:${theme.headingColor}`,
    ].join(";"),
    subtitle: [
      "font-size:14px",
      "color:#888",
      "text-align:center",
      "margin:0 0 24px",
      "line-height:1.8",
    ].join(";"),
    p: [
      `font-size:${theme.bodyFontSize}px`,
      `color:${theme.textColor}`,
      `line-height:${theme.lineHeight}`,
      `letter-spacing:${theme.letterSpacing}px`,
      "margin:0 0 16px",
    ].join(";"),
    lede: [
      "border-left:3px solid #b0b0b0",
      "padding:16px 20px",
      "margin:24px 0",
      "background:#f9f9f9",
      "border-radius:4px",
    ].join(";"),
    ledeP: [
      `font-size:${theme.bodyFontSize}px`,
      "color:#555",
      `line-height:${theme.lineHeight}`,
      "margin:0 0 8px",
      `letter-spacing:${theme.letterSpacing}px`,
    ].join(";"),
    blockquote: [
      `border-left:3px solid ${theme.quoteBorder}`,
      "padding:12px 16px",
      "margin:20px 0",
      `background:${theme.quoteBg}`,
      "font-style:italic",
      "border-radius:4px",
    ].join(";"),
    blockquoteP: [
      `font-size:${theme.bodyFontSize}px`,
      "color:#666",
      `line-height:${Math.max(theme.lineHeight - 0.1, 1.6)}`,
      "margin:0 0 6px",
      `letter-spacing:${theme.letterSpacing}px`,
    ].join(";"),
    quoteAttr: [
      "text-align:right",
      "font-size:13px",
      "color:#999",
      "margin:-8px 0 20px",
    ].join(";"),
    sectionBreak: [
      "text-align:center",
      "color:#ddd",
      "margin:32px 0",
      "letter-spacing:8px",
      "font-size:16px",
    ].join(";"),
    ul: [
      "margin:0 0 18px",
      "padding-left:22px",
      `color:${theme.textColor}`,
    ].join(";"),
    ol: [
      "margin:0 0 18px",
      "padding-left:22px",
      `color:${theme.textColor}`,
    ].join(";"),
    li: [
      `font-size:${theme.bodyFontSize}px`,
      `line-height:${theme.lineHeight}`,
      `letter-spacing:${theme.letterSpacing}px`,
      "margin:0 0 8px",
    ].join(";"),
    pre: [
      "margin:22px 0",
      "padding:16px 18px",
      "border-radius:12px",
      "background:#1d1f24",
      "color:#f5f4f0",
      "overflow:auto",
      "font-size:13px",
      "line-height:1.7",
      "font-family:'SFMono-Regular',Menlo,Monaco,Consolas,monospace",
    ].join(";"),
    inlineCode: [
      "padding:2px 6px",
      "border-radius:6px",
      "background:#f2ece4",
      "font-family:'SFMono-Regular',Menlo,Monaco,Consolas,monospace",
      "font-size:0.92em",
    ].join(";"),
    link: [
      "color:#9b4f1f",
      "text-decoration:none",
      "border-bottom:1px solid rgba(155,79,31,0.3)",
    ].join(";"),
    figure: [
      "margin:24px 0",
      "text-align:center",
    ].join(";"),
    image: [
      "max-width:100%",
      "height:auto",
      "border-radius:14px",
      "display:block",
      "margin:0 auto",
    ].join(";"),
    figcaption: [
      "margin-top:10px",
      "font-size:12px",
      "color:#999",
      "line-height:1.7",
    ].join(";"),
    sup: [
      "margin-left:2px",
      "font-size:11px",
      "color:#9b4f1f",
      "font-weight:bold",
    ].join(";"),
    footnotes: [
      "margin-top:34px",
      "padding-top:18px",
      "border-top:1px solid #eee",
    ].join(";"),
    footnoteTitle: [
      "margin:0 0 10px",
      "font-size:13px",
      "font-weight:bold",
      "color:#777",
      "letter-spacing:0.08em",
    ].join(";"),
    footnoteList: [
      "margin:0",
      "padding-left:18px",
    ].join(";"),
    footnoteItem: [
      "font-size:13px",
      "color:#888",
      "line-height:1.85",
      "margin-bottom:6px",
    ].join(";"),
  };
}

function splitParagraphs(lines) {
  const paragraphs = [];
  let bucket = [];

  lines.forEach((line) => {
    if (!line.trim()) {
      if (bucket.length) {
        paragraphs.push(bucket.join(" ").trim());
        bucket = [];
      }
      return;
    }

    bucket.push(line.trim());
  });

  if (bucket.length) {
    paragraphs.push(bucket.join(" ").trim());
  }

  return paragraphs;
}

function normalizeMarkdown(markdown) {
  return markdown.replace(/\r\n/g, "\n").trim();
}

function extractTitle(markdown) {
  const titleLine = normalizeMarkdown(markdown)
    .split("\n")
    .find((line) => /^#\s+/.test(line.trim()));

  return titleLine ? titleLine.replace(/^#\s+/, "").trim() : "PodReader 公众号文章";
}

function createFileStem(markdown) {
  const title = extractTitle(markdown)
    .replace(/[^\p{L}\p{N}\u4e00-\u9fa5-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return title || "podreader-wechat";
}

function insertSnippet(key) {
  const snippet = SNIPPETS[key];
  if (!snippet) {
    return;
  }

  const textarea = elements.markdownInput;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const prefix = textarea.value.slice(0, start);
  const suffix = textarea.value.slice(end);
  const spacerBefore = prefix && !prefix.endsWith("\n\n") ? "\n\n" : "";
  const spacerAfter = suffix && !suffix.startsWith("\n") ? "\n\n" : "";

  textarea.value = `${prefix}${spacerBefore}${snippet}${spacerAfter}${suffix}`;
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = prefix.length + spacerBefore.length + snippet.length;

  state.markdown = textarea.value;
  saveState();
  render();
}

async function copyRichTextToClipboard() {
  const html = state.rendered.articleHtml;
  const text = state.rendered.plainText;

  if (!html.trim()) {
    setStatus("没有可复制的内容。");
    return;
  }

  if (navigator.clipboard && window.ClipboardItem && window.isSecureContext) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
      setStatus("富文本已复制，可直接粘贴到公众号后台。");
      return;
    } catch (error) {
      console.warn("clipboard.write failed, falling back", error);
    }
  }

  const temp = document.createElement("div");
  temp.contentEditable = "true";
  temp.style.position = "fixed";
  temp.style.left = "-99999px";
  temp.style.top = "0";
  temp.innerHTML = html;
  document.body.appendChild(temp);

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(temp);
  selection.removeAllRanges();
  selection.addRange(range);

  const success = document.execCommand("copy");
  selection.removeAllRanges();
  temp.remove();

  setStatus(success ? "富文本已复制，可直接粘贴到公众号后台。" : "复制失败，请用 localhost 打开后重试。");
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-99999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function setStatus(message, quiet = false) {
  elements.statusLine.textContent = message;
  if (!quiet) {
    elements.statusLine.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

function toPlainText(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || "";
}

function stash(tokens, html) {
  const key = `__TOKEN_${tokens.length}__`;
  tokens.push({ key, html });
  return key;
}

function restoreStash(text, tokens) {
  return tokens.reduce((acc, token) => acc.replaceAll(token.key, token.html), text);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(text) {
  return escapeHtml(text).replaceAll("'", "&#39;");
}

init();
