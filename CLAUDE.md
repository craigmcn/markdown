# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start dev server at http://localhost:3040
yarn build        # Build to dist/
yarn build:netlify  # Build to netlify/ (root) and netlify/markdown/ (sub-path)
yarn preview      # Preview the production build locally
yarn format       # Prettier on all files
yarn format:check  # Prettier check (read-only — fails if any file needs reformatting)
yarn lint         # ESLint check on src/ (no auto-fix — fails on any error)
yarn lint:fix     # ESLint with auto-fix on src/
```

```bash
yarn test         # Vitest in watch mode
yarn test:run     # Vitest single run
yarn coverage     # Vitest with v8 coverage report
```

## Architecture

A vanilla TypeScript multi-page app (Vite 8) with two pages:

- **`index.html`** — Markdown Parser: a three-panel editor (Markdown input → HTML output → rendered preview) using the [Ace editor](https://ace.c9.io/) loaded from CDN, [marked](https://marked.js.org/) for Markdown→HTML conversion, [turndown](https://github.com/mixmark-io/turndown) for HTML→Markdown conversion, and [sanitize-html](https://github.com/apostrophecms/sanitize-html) for sanitization.
- **`music-monday.html`** — Music Monday Markdown Generator: a form that generates Jekyll-compatible frontmatter and post body Markdown for a recurring blog series.

**Key source locations:**

- `src/utils/markdown.ts` — `cleanHtml` (sanitize-and-normalize), `markdownToHtml` (marked + cleanHtml), `htmlToMarkdown` (turndown); the primary unit-tested logic.
- `src/utils/music-monday.ts` — `nextMonday()` (date calculation) and `template` (post template object with `text()` method).
- `src/scripts/index.ts` — Ace editor wiring and resize-handle logic for the Markdown Parser page.
- `src/scripts/music-monday.ts` — Form input handling and DOM updates for the Music Monday page.
- `src/styles/index.css` — All styles for the Markdown Parser page (grid layout, Ace editor sizing, preview content).
- `src/types/globals.d.ts` — Minimal `ace` global declaration (Ace is loaded from CDN, not bundled).

**Ace editor:** loaded from `https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.13/ace.js` as a `<script>` tag in `index.html`. It is not bundled by Vite. The `AceStatic` / `AceEditor` interfaces in `src/types/globals.d.ts` declare the global `ace` variable for TypeScript.

**Netlify build:** `build:netlify` runs two sequential Vite builds — one to `netlify/` (serves at the domain root) and one to `netlify/markdown/` (serves at the `/markdown/` sub-path). Both use `base: './'` for relative asset paths so they work at either location.

## ESLint + Prettier

Formatting is handled by Prettier (`.prettierrc` is `{}` — all defaults). Run `yarn format` to apply.

ESLint (`eslint.config.mjs`, ESLint 9 flat config) handles code quality only. Run `yarn lint` (read-only, fails on any error) or `yarn lint:fix`.

## Key decisions

- **`ace` from CDN** — Ace is not bundled; `src/types/globals.d.ts` declares a minimal global interface covering the methods actually used (`edit`, `getValue`, `setValue`, `clearSelection`, `resize`, `session.selection.on`).
- **`src/utils/` extracted for testability** — `cleanHtml`, `markdownToHtml`, `htmlToMarkdown`, and the music-monday logic live in `src/utils/` rather than inline in the script files so they can be unit-tested without a DOM or Ace dependency. `marked` and `TurndownService` are initialized as module-level singletons in `markdown.ts` so the singleton is shared and testable.
- **`marked` + `turndown` instead of `showdown`** — `showdown` had an unfixed ReDoS vulnerability (Dependabot alert, no upstream patch). `marked` handles MD→HTML (`breaks: true, gfm: true` maps 1:1 to the old `simpleLineBreaks`/`strikethrough`/`tables` options); `turndown` handles HTML→MD. `marked.parse()` is cast `as string` because the return type is `string | Promise<string>` when no async extensions are configured.
- **Column resize uses `clientX`, not `offsetX`** — `offsetX` is relative to the event _target_, which bubbles from Ace editor children and gives wrong results. `clientX >= markdown.getBoundingClientRect().right - HANDLE_SIZE` is viewport-relative and reliable regardless of which child element fired the event.
- **Column resize guarded by `numAreas === 2`** — `getComputedStyle(main).gridTemplateAreas.split('" ').length` returns 2 on desktop (two rows) and 3 on mobile (three rows). The handle and its JS logic are desktop-only; a window-resize handler clears the inline `gridTemplateColumns` when returning to mobile so the stacked CSS layout is not overridden.
- **CSS custom properties in `:root`** — 10 design tokens (`--handle-size`, `--handle-bg`, `--handle-bg-hover`, `--border-color`, `--text-color`, `--bg-subtle`, `--brand-color`, `--header-text`, `--header-bg`, `--header-border`) replace all repeated literal values. `HANDLE_SIZE` in `index.ts` must be kept in sync with `--handle-size` in `index.css`.
- **`base: './'`** — Both the local `dist/` build and the two Netlify builds use relative asset paths, so the same config works when served from the domain root or the `/markdown/` sub-path.
- **No React plugin** — This is a vanilla TypeScript app; `vite.config.ts` has no `@vitejs/plugin-react`.
- **Multi-page input** — `vite.config.ts` uses `rollupOptions.input` with both `index.html` and `music-monday.html` as named entry points.
- **Standalone Yarn 4 project** — an empty `yarn.lock` is required at the repo root; without it Yarn 4 walks up and finds a `package.json` at `~/` and errors with "not part of project".
- **`MusicMondayTemplate.originalYear` / `coverYear` typed `string | number`** — the form returns strings on input but the template initialises them as numbers; widening the type avoids a cast without changing runtime behaviour.
- **`nonTextTags` hardcoded in `cleanHtml`** — `xmp` and `plaintext` are raw-text elements whose contents `htmlparser2` does not re-parse; `sanitize-html`'s default `discard` mode emits them unescaped, enabling XSS bypass (Dependabot #94, CVSS 9.3). Both are added to `nonTextTags` so their entire contents are dropped. The list is hardcoded because `sanitize.defaults.nonTextTags` is not exposed by the `IDefaults` type.
- **Branch coverage intentionally partial** — `nextMonday()`'s day-of-week ternary can only hit one branch per test run without mocking `Date`. Statement/function/line coverage is 100%; branch coverage is left as-is.

## Modernization status — COMPLETE (2026-04-30)

PR #58 merged into `main`. Branch protection applied.

### Completed

- Replaced Gulp + Browserify + Babel with Vite 8 multi-page build
- Switched npm → Yarn 4; deleted `package-lock.json`; bumped Node to v24
- Migrated ESLint 8 → ESLint 9 flat config; added Prettier
- Converted JS → TypeScript; extracted `src/utils/` for testability
- Added 23 Vitest unit tests — all passing, 100% statement/line coverage
- Added `.github/workflows/test.yml` (lint → build → coverage)
- Added `CLAUDE.md`, `.github/CODEOWNERS`, updated README
- Fixed `dayYmdHs` minute zero-padding in `nextMonday()`
- Fixed slug double-dash collapse: `replace('--','-')` → `replace(/-{2,}/g, '-')`
- PR #58 merged; CI passed
- Branch protection on `main`: require PR, 1 approval (owner bypass for `@craigmcn`), `test` status check required, stale reviews dismissed, force push + deletion blocked
- **PR #60** — Prettier reset to `{}`, Husky pre-commit hook, Yarn 4.14.1, `.editorconfig`, `tsconfig.tsbuildinfo` gitignored, `gulpfile.js` deleted, `.vscode/` gitignored
- **PR #61** — `format:check` script + CI step; CI order: format:check → lint → build → coverage
- **PR #62** — Replaced `showdown` (unfixed ReDoS) with `marked` + `turndown`; extracted `markdownToHtml`/`htmlToMarkdown` to `src/utils/`; 33 unit tests; `yarn test:run` in pre-commit hook
- **PR #63** — Vertical resize handle between Markdown/HTML panels (desktop, `ew-resize`, 20–80% clamps); 10 CSS custom properties in `:root`
- **PR #64** — Upgraded `sanitize-html` `2.17.3` → `2.17.4` (critical XSS, Dependabot #94); added `xmp` and `plaintext` to `nonTextTags` as defense-in-depth; 35 unit tests (2 regression tests added)

### Known follow-up items (non-blocking)

- Use American English in any future source comments (`sanitize` / `sanitization`, not `sanitise`)
- **CSS review** — header fonts appear inconsistent with AlbertCSS; app does not load AlbertCSS (no `<link>` in `index.html`) — needs investigation before changes
- **`new/` folder** at repo root — untracked leftover from pre-Vite era (contains only `node_modules`); safe to delete
- **`user-select: none` during drag** — neither resize handle sets it; text in Ace editors may select while dragging (low priority)
