---
name: podreader
description: >
  精读提炼与高质量中文写作技能。用于将播客转录稿、长文、报告、书籍章节、视频转录稿等长内容提炼为高质量的杂志风格中文精读文章，并可输出为 EPUB 电子书或微信公众号格式。当用户提到"精读""总结""提炼""播客""EPUB""转公众号"或上传转录稿/长文要求整理时，使用此技能。也适用于任何需要高质量中文写作的总结任务——即使用户没有明确说"精读"，只要输入是长内容且需要提炼输出，就应触发此技能。
  Author: @KingJing001 | Version: 1.0 | Date: 2026-03-06 | License: CC BY 4.0
---

# PodReader — 精读提炼与高质量中文写作

## 概述

本技能分两层：

- **第一层：写作方法论** — 通用于所有精读/总结/提炼任务
- **第二层：输出格式** — EPUB 电子书 或 微信公众号 HTML，按需调用

当用户只需要文字精读时，只调用第一层。
当用户需要特定格式输出时，同时调用两层。

---

# 第一层：写作方法论

## 目标读者

- 受过良好教育、有好奇心的普通读者
- 日常使用 AI 工具，大致理解其工作原理
- 没有该领域的专业训练（想象成聪明的文科毕业生）

## 文章长度

- 目标：5-8 分钟阅读（约 2000-3200 字）
- 根据原始内容的信息密度智能调整：信噪比高可更长，反之更短
- 原则：提取精华，不做流水账

## 写作流程

### 步骤一：开篇段落（Hook）

必须立即回答三个问题：
- 这个人/这篇内容是谁/什么？为什么值得花时间？
- 现在为什么重要？有什么风险或机遇？
- 一个让人想继续读的钩子

把开篇当成电影预告片。让读者觉得不读就亏了。

### 步骤二：识别并解释"拦路虎"概念

在深入正文前，扫描全文找出反复出现或对理解核心论点至关重要的专业术语。这些是"拦路虎"——读者不懂这些就读不下去。

处理规则：
- 保留英文原文（AI agent、context window、prompt 等）
- 第一次出现时用通俗语言解释清楚，之后不再重复
- 用类比或现实例子解释，不要用另一个术语解释一个术语
- 解释必须自然融入正文，不要生硬插入

好的解释："OpenClaw 是一个 AI agent——能自主执行任务的智能程序，不只回答问题，还能操作电脑、处理文件、发消息。"
坏的解释："OpenClaw 是一个 AI agent（AI 代理）。"（只是翻译，没有解释）

在文章前 1/3 完成所有关键术语的解释。

### 步骤三：识别"宝石"（Gems）

仔细阅读全文，标记这些时刻：

**算宝石的：**
- 真正令人惊讶或违反直觉的内容
- 新鲜视角，不是老生常谈
- 具体的例子或故事
- 坦诚的承认或脆弱的时刻
- 具体的策略或框架（不是泛泛而谈）
- 超越专业领域的洞见——对日常生活、工作、与技术互动方式的启发

**不算宝石的：**
- 泛泛的励志陈述
- 广为人知的事实或流行观点
- 表面观察、闲聊寒暄
- 只有从业者才关心的技术细节

对每个宝石，保存关键思想和原话，作为直接引语的素材。

### 步骤四：清理引语

从原文提取引语时：
- 删除填充词（嗯、呃、就是、你知道、然后）
- 修正转录错误和口语语法
- 消除重复短语和错误开头
- 保持说话者的真实声音和语气

目标：让引语读起来像他们写作时的样子，而非说话时的样子。

**对谈类内容的额外规则：**
- 区分不同说话者的引语，确保归属准确
- 主持人的问题可以简化为叙述过渡，不必逐字引用
- 嘉宾的核心观点优先保留原话
- 多人观点冲突或互补时，保留对话的张力

### 步骤五：构建"语境桥梁"

宝石之间的内容，用简短的语境桥梁连接：
- 解释正在讨论什么以及为什么重要
- 展示话题之间的流向
- 提供刚好够的背景让宝石有意义
- 保持动力，不陷入细节
- 将专业洞见与更广泛的启示联系起来：非专业人士为什么应该关心？

宝石是目的地，语境是连接它们的高速公路。

### 步骤六：编织完整叙事

将语境和宝石组合成流畅的叙事文章：
- 读起来像精心制作的杂志长文，不是要点摘要
- 自然融入清理过的引语（使用引号）
- 没有人为的编号分隔，用自然的主题转换
- 从头到尾无缝流动
- 对不了解原始内容的人完全有意义
- 让普通读者也觉得相关——读完应该想"很高兴我懂了"

### 质量检查清单

1. 阅读这篇文章能获得原始内容 80% 的价值？
2. 开篇段落是否立即说清楚这是什么、为什么重要？
3. 所有引语自然精炼，没有口语毛病？
4. 没有专业背景的人能从头到尾理解？
5. 拦路虎概念的解释赋能而非让人不知所措？
6. 通过了下方的反 AI 味检查？

---

## 反 AI 味写作规范（强制执行）

以下句式和词汇在所有输出中**严格禁止**。这不是建议，是硬性规则。

### 禁止的句式结构

- "不是A，而是B" / "不是A，更是B"
- "不仅仅是A，更是B" / "不只是A，还是B"（作为修辞强调时禁止；作为事实陈述时允许）
- "值得注意的是" / "值得一提的是" / "值得关注的是"
- "让我们来看看" / "让我们深入探讨" / "让我们一起了解"
- "在这个背景下" / "在当今时代" / "在这样的大环境下"
- "某种意义上来说" / "从某种角度来看"
- "事实上" 做句首
- "毫无疑问" / "不可否认"（作为句首修饰语时禁止）
- "总的来说" / "综上所述" / "总而言之"
- "这意味着什么？这意味着……"（自问自答式设问）
- "简单来说" / "换句话说" / "换言之"
- 任何无功能的排比句
- "深刻的洞见" / "深刻地影响" / "深刻地改变"——禁止所有带"深刻"的修饰
- "引发了广泛关注/讨论/思考"
- "给出了自己的答案"
- "一场关于……的革命/对话/思考"

### 禁止的标点滥用

- 破折号滥用：同一段落中不超过一处破折号。禁止用破折号制造虚假戏剧感或做插入语（用括号或另起一句代替）
- 双引号滥用：不要对普通词汇加双引号来制造"深意"。引号只用于直接引语和特定术语首次出现

### 应该怎么写

- 从原理出发，照顾读者体验，追求自然表达
- 句式偏短，节奏明快
- 善用类比和具体例子
- 判断先行，论证后置
- 括号做旁白是好的（制造聊天感）
- 中英混用是自然的，不需要刻意回避或刻意使用
- 结尾干脆利落，不做无功能的"升华"

---

# 第二层：输出格式

用户指定输出格式时调用此层。支持两种格式：EPUB 电子书、微信公众号 HTML。

## 格式 A：EPUB 电子书

### 播客/音视频内容的元信息（必须包含）

每篇 EPUB 开头必须包含以下元信息块（有多少写多少，缺失的不写）：

```
播客：《播客名》
本期：标题
嘉宾：嘉宾名
期数：第 N 期
时长：XX 分钟
发布日期：YYYY-MM-DD
编辑整理：@KingJing001、Claude Opus
```

对于非播客内容（文章、书籍等），元信息调整为：
```
原文：《标题》
作者：作者名
发布日期：YYYY-MM-DD
编辑整理：@KingJing001、Claude Opus
```

### EPUB 技术规范

- 使用标准 EPUB 3.0 规范
- 使用 Python 创建（ZIP 格式），包含 mimetype、META-INF/container.xml、OEBPS/content.opf、nav.xhtml 等完整结构
- 保存到 `/mnt/user-data/outputs/` 目录
- 文件名清晰描述内容，使用中文

### 文章 HTML 结构标签

```html
<div class="metadata">播客元信息</div>
<h1>文章主标题</h1>
<p class="subtitle">副标题（如有）</p>
<div class="lede"><p>开篇引导段落</p></div>
<div class="section-break">✦</div>
<h2>章节标题</h2>
<p>正文段落</p>
<blockquote><p>引用内容</p></blockquote>
<div class="quote-attr">——说话者</div>
```

### CSS 样式规范

```css
body {
  font-family: "Source Han Serif SC", "Noto Serif CJK SC", "Songti SC", serif;
  line-height: 1.8;
  /* 不设 font-size，让阅读器控制 */
  /* 不设 background-color，让阅读器控制暗色/亮色模式 */
  margin: 1.5em;
  color: #333;
}

h1 {
  font-size: 1.6em;
  line-height: 1.3;
  margin-bottom: 0.3em;
}

h2 {
  font-size: 1.2em;
  margin-top: 2em;
  margin-bottom: 0.8em;
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
  /* 绝对不要设置 background-color 为白色或任何不透明色 */
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
```

**关键原则：**
- 所有背景色使用 `rgba()` 半透明值，确保暗色模式兼容
- 不设置 `body` 的 `font-size` 和 `background-color`
- 不对 `blockquote` 设置不透明背景色

### EPUB 元数据

```
title: 从文章 h1 标题自动生成
author: @KingJing001
language: zh-CN
identifier: 使用 uuid4 生成
```

## 格式 B：微信公众号 HTML

生成一个自包含的 HTML 文件，使用内联样式（因为公众号编辑器不支持 `<style>` 标签）。

### 内联样式规范

- 正文：`style="font-size:15px;color:#333;line-height:2;letter-spacing:1px;"`
- 标题 h1：`style="font-size:22px;font-weight:bold;text-align:center;margin-bottom:8px;"`
- 标题 h2：`style="font-size:18px;font-weight:bold;margin-top:32px;margin-bottom:16px;"`
- 副标题：`style="font-size:14px;color:#888;text-align:center;margin-bottom:24px;"`
- 引用块：`style="border-left:3px solid #d4d4d4;padding:12px 16px;margin:20px 0;color:#666;background:#f7f7f7;font-style:italic;"`
- 元信息：`style="font-size:13px;color:#999;border-bottom:1px solid #eee;padding-bottom:16px;margin-bottom:24px;"`
- 分隔符：`style="text-align:center;color:#ddd;margin:32px 0;letter-spacing:8px;"`

### 公众号 HTML 文件结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>文章标题</title></head>
<body style="max-width:680px;margin:0 auto;padding:20px;font-family:-apple-system,sans-serif;">
  <!-- 内容使用内联样式 -->
</body>
</html>
```

保存到 `/mnt/user-data/outputs/` 目录，文件名后缀 `_公众号.html`。

用户打开此 HTML 文件后，全选内容复制，粘贴到公众号编辑器即可保留基本排版。

---

## 使用方式

### 场景一：纯精读（无格式要求）

用户说"帮我总结/精读这篇内容" → 只调用第一层，在对话中直接输出精读文章。

### 场景二：播客转 EPUB

用户上传转录稿并说"做成 EPUB"或"精读" → 调用第一层写文章 + 第二层格式 A 打包 EPUB。

### 场景三：转微信公众号

用户说"转公众号格式" → 调用第一层写文章 + 第二层格式 B 生成内联样式 HTML。

### 场景四：同时输出

用户说"EPUB 和公众号都要" → 同时生成两种格式文件。

### 场景五：日常总结（非播客）

用户上传长文/报告/书籍章节要求总结 → 调用第一层方法论，元信息使用非播客格式。
