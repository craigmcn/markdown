# Markdown Tools

[craigmcn.com/markdown](https://www.craigmcn.com/markdown/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/2ba6dca8-8cdd-41e1-b466-cb6e875d5e0e/deploy-status)](https://app.netlify.com/sites/hardcore-wiles-1aa5f7/deploys)
[![Test](https://github.com/craigmcn/markdown/actions/workflows/test.yml/badge.svg)](https://github.com/craigmcn/markdown/actions/workflows/test.yml)

Two small tools for working with Markdown.

---

## Markdown Parser

Paste or type Markdown into the left panel and see the rendered HTML and a live preview side by side. You can also edit the HTML directly and see the Markdown update.

- **Markdown panel** — type or paste any Markdown; the other panels update as you type.
- **HTML panel** — shows the converted, sanitized HTML; editable, and syncs back to the Markdown panel.
- **Preview panel** — a rendered view of the current HTML. Drag the top edge of the panel to resize it.

HTML output is sanitized with [sanitize-html](https://github.com/apostrophecms/sanitize-html) — script tags, event handlers, and other unsafe markup are stripped automatically.

---

## Music Monday Markdown Generator

Fills in a form to generate a Jekyll-compatible front matter block and post body for a recurring Music Monday blog post.

- Fill in the **Post date**, **Title**, **Artist**, **Album**, **Year**, and **Video** fields for both the original song and the cover version.
- The **Markdown output** panel on the right updates live as you type.
- Copy the output and paste it into a new Jekyll post file.

The post date defaults to the next Monday at 11:45; the year fields default to the current year.

---

## Stack

- Vanilla [TypeScript](https://www.typescriptlang.org/) built with [Vite](https://vitejs.dev/) 8 (multi-page)
- [showdown](https://github.com/showdownjs/showdown) for Markdown ↔ HTML conversion
- [sanitize-html](https://github.com/apostrophecms/sanitize-html) for HTML sanitisation
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

Vitest. 23 unit tests covering `cleanHtml` sanitization logic and the Music Monday `nextMonday()` date calculation and `template.text()` output.

```bash
yarn test       # watch mode
yarn test:run   # single pass
yarn coverage   # single pass with coverage report
```

## Deployment

Deployed on Netlify. The `build:netlify` script runs two sequential Vite builds — one to `netlify/` (served at the domain root) and one to `netlify/markdown/` (served at the `/markdown/` sub-path).
