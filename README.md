# PodReader

A Claude skill for distilling podcasts and long reads into magazine-quality Chinese articles — EPUB and WeChat ready.

用播客和长文喂它，拿出一篇值得转发的中文精读。

## What This Does

**PodReader** applies a magazine editor's methodology to long-form content: find the gems, cut the noise, write like a human. It handles podcasts, articles, reports, and book chapters — anything with too much to read and too little time.

### Key Features

- **Gem Extraction** — Surfaces only what's genuinely surprising or useful; ignores filler and repetition
- **Terminology First** — Explains jargon before it becomes a wall, keeping the original term alongside the plain-language gloss
- **Speaker Voice** — Cleans up spoken-word roughness without flattening the person's personality
- **Anti-AI-Slop** — Enforces strict style rules against formulaic phrasing; output reads like a person wrote it
- **EPUB Export** — EPUB 3.0, dark-mode compatible, works in WeChat Reading and Apple Books
- **WeChat Export** — Inline-styled HTML you paste directly into the Official Account editor; formatting survives the transfer

## Installation

Download `podreader.skill` and upload it in Claude → Settings → Skills.

Or manually: drop `SKILL.md` into your Claude skills directory.

## Usage

No special syntax. Just describe what you want:

| Say | Result |
|---|---|
| "帮我精读这篇内容" | Deep-read article |
| "做成 EPUB" | Deep-read + EPUB file |
| "转公众号格式" | Deep-read + WeChat HTML |
| "两种都要" | Both at once |

Tip: when uploading a podcast transcript, include the show name, guest, and episode number — they get written into the EPUB header automatically.

## Scripts

Build scripts work standalone, no skill required:

```bash
# EPUB
python scripts/build_epub.py --title "Title" --body article.html --output out.epub

# WeChat HTML
python scripts/build_wechat.py --title "Title" --body article.html --output out.html
```

Standard library only — no third-party dependencies.

## Files

```
podreader/
├── SKILL.md              # Skill definition (methodology + trigger rules)
├── podreader.skill       # One-click install package
├── scripts/
│   ├── build_epub.py     # EPUB 3.0 generator (dark mode compatible)
│   └── build_wechat.py   # WeChat HTML generator (inline styles, paste-ready)
├── README.md
└── LICENSE
```

## Philosophy

1. **80/20** — 20% of reading time should capture 80% of the value. The rest is noise.
2. **Terminology first** — If readers hit an unexplained term, they stop reading. Unblock them early.
3. **Gem-driven** — A good deep-read makes the reader feel smarter. That's the bar.
4. **Anti-AI-slop** — Information stacking isn't writing. Editorial judgment is.

## License

CC BY 4.0 — use freely, modify freely, credit the source.

## Author

[@一龙小包子](https://x.com/KingJing001) · 关心 AI，更关心人类
