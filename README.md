# Markdown Tools

[craigmcn.com/markdown](https://www.craigmcn.com/markdown/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/2ba6dca8-8cdd-41e1-b466-cb6e875d5e0e/deploy-status)](https://app.netlify.com/sites/hardcore-wiles-1aa5f7/deploys)
[![Test](https://github.com/craigmcn/markdown/actions/workflows/test.yml/badge.svg)](https://github.com/craigmcn/markdown/actions/workflows/test.yml)

A Markdown parser tool.

---

## Markdown Parser

Type or paste into any of the three panels and the other two update as you go: Markdown, HTML, or rich text.

- **Markdown panel** — type or paste any Markdown.
- **HTML panel** — shows the converted, sanitized HTML; editable.
- **Rich Text panel** — a [Quill](https://quilljs.com/) editor. Paste rich text from a web page, Google Docs or Word (or format it with the toolbar) to get the equivalent Markdown and HTML. Formatting is limited to what Markdown can express: headings, bold, italic, strikethrough, inline code, links, quotes, code blocks, lists and tables. Colors, fonts and images are dropped. Drag the top edge of the panel to resize it.

HTML output is sanitized with [sanitize-html](https://github.com/apostrophecms/sanitize-html) — script tags, event handlers, and other unsafe markup are stripped automatically.

---

## Stack

- Vanilla [TypeScript](https://www.typescriptlang.org/) built with [Vite](https://vitejs.dev/) 8
- [marked](https://marked.js.org/) for Markdown → HTML conversion
- [turndown](https://github.com/mixmark-io/turndown) with [@joplin/turndown-plugin-gfm](https://github.com/laurent22/joplin/tree/dev/packages/turndown-plugin-gfm) for HTML → Markdown conversion (GFM tables and strikethrough)
- [Quill](https://quilljs.com/) 2 for the rich-text editor
- [sanitize-html](https://github.com/apostrophecms/sanitize-html) for HTML sanitization
- [Ace editor](https://ace.c9.io/) (loaded from CDN) for the editor panels

## Development

```bash
yarn install
yarn dev        # dev server at http://localhost:3040
yarn build      # build to dist/
yarn lint       # ESLint (fails on any error — no auto-fix)
yarn lint:fix   # ESLint with auto-fix
yarn format     # Prettier
yarn coverage   # Vitest + coverage report
```

## Testing

Vitest. Unit tests covering `cleanHtml` sanitization, `markdownToHtml` / `htmlToMarkdown` conversion, the Quill adapters (`htmlToRichText` / `richTextToHtml`), and a check that `netlify.toml`'s CSP hash matches `index.html`'s inline script.

```bash
yarn test       # watch mode
yarn test:run   # single pass
yarn coverage   # single pass with coverage report
```

Playwright covers the page end-to-end (Markdown ⇄ HTML ⇄ rich text, including a synthesized rich-text paste) plus an automated accessibility check with [`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright).

```bash
yarn test:e2e   # Playwright, headless Chromium
```

The `csp` Playwright project runs against `vite preview` of a production build, which serves `netlify.toml`'s headers, and fails on any Content-Security-Policy violation.

## Deployment

Deployed on Netlify. The `build:netlify` script runs two sequential Vite builds — one to `netlify/` (served at the domain root) and one to `netlify/markdown/` (served at the `/markdown/` sub-path). `netlify.toml` sets the build command and the security headers (CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`).
