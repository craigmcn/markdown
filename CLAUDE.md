# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start dev server at http://localhost:3040
yarn build        # Build to dist/
yarn build:netlify  # Build to netlify/ (root) and netlify/markdown/ (sub-path)
yarn preview      # Preview the production build locally
yarn format       # Prettier on all files
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

- **`index.html`** — Markdown Parser: a three-panel editor (Markdown input → HTML output → rendered preview) using the [Ace editor](https://ace.c9.io/) loaded from CDN, [showdown](https://github.com/showdownjs/showdown) for Markdown→HTML conversion, and [sanitize-html](https://github.com/apostrophecms/sanitize-html) for sanitisation.
- **`music-monday.html`** — Music Monday Markdown Generator: a form that generates Jekyll-compatible frontmatter and post body Markdown for a recurring blog series.

**Key source locations:**

- `src/utils/markdown.ts` — `cleanHtml`: the sanitise-and-normalise function; the primary unit-tested logic.
- `src/utils/music-monday.ts` — `nextMonday()` (date calculation) and `template` (post template object with `text()` method).
- `src/scripts/index.ts` — Ace editor wiring and resize-handle logic for the Markdown Parser page.
- `src/scripts/music-monday.ts` — Form input handling and DOM updates for the Music Monday page.
- `src/styles/index.css` — All styles for the Markdown Parser page (grid layout, Ace editor sizing, preview content).
- `src/types/globals.d.ts` — Minimal `ace` global declaration (Ace is loaded from CDN, not bundled).

**Ace editor:** loaded from `https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.13/ace.js` as a `<script>` tag in `index.html`. It is not bundled by Vite. The `AceStatic` / `AceEditor` interfaces in `src/types/globals.d.ts` declare the global `ace` variable for TypeScript.

**Netlify build:** `build:netlify` runs two sequential Vite builds — one to `netlify/` (serves at the domain root) and one to `netlify/markdown/` (serves at the `/markdown/` sub-path). Both use `base: './'` for relative asset paths so they work at either location.

## ESLint + Prettier

Formatting is handled by Prettier (`.prettierrc`): single quotes, semicolons, 2-space indent. Run `yarn format` to apply.

ESLint (`eslint.config.mjs`, ESLint 9 flat config) handles code quality only. Run `yarn lint` (read-only, fails on any error) or `yarn lint:fix`.

## Key decisions

- **`ace` from CDN** — Ace is not bundled; `src/types/globals.d.ts` declares a minimal global interface covering the methods actually used (`edit`, `getValue`, `setValue`, `clearSelection`, `resize`, `session.selection.on`).
- **`src/utils/` extracted for testability** — `cleanHtml` and the music-monday logic live in `src/utils/` rather than inline in the script files so they can be unit-tested without a DOM or Ace dependency.
- **`base: './'`** — Both the local `dist/` build and the two Netlify builds use relative asset paths, so the same config works when served from the domain root or the `/markdown/` sub-path.
- **No React plugin** — This is a vanilla TypeScript app; `vite.config.ts` has no `@vitejs/plugin-react`.
- **Multi-page input** — `vite.config.ts` uses `rollupOptions.input` with both `index.html` and `music-monday.html` as named entry points.
- **Standalone Yarn 4 project** — an empty `yarn.lock` is required at the repo root; without it Yarn 4 walks up and finds a `package.json` at `~/` and errors with "not part of project".
- **`MusicMondayTemplate.originalYear` / `coverYear` typed `string | number`** — the form returns strings on input but the template initialises them as numbers; widening the type avoids a cast without changing runtime behaviour.
- **Branch coverage intentionally partial** — `nextMonday()`'s day-of-week ternary can only hit one branch per test run without mocking `Date`. Statement/function/line coverage is 100%; branch coverage is left as-is.

## Modernization status (2026-04-30)

### Completed (branch `vite-migration`)

- Replaced Gulp + Browserify + Babel with Vite 8 multi-page build
- Switched npm → Yarn 4; deleted `package-lock.json`; bumped Node to v24
- Migrated ESLint 8 → ESLint 9 flat config; added Prettier
- Converted JS → TypeScript; extracted `src/utils/` for testability
- Added 23 Vitest unit tests — all passing, 100% statement/line coverage
- Added `.github/workflows/test.yml` (lint → build → coverage)
- Added `CLAUDE.md` and `.github/CODEOWNERS`

### In progress (PR #58 open)

- [x] Opened PR #58 against `main`
- [x] Updated README (end-user usage + developer usage sections)
- [ ] Confirm CI (`test` job) passes on GitHub Actions
- [ ] Apply branch protection: require PR, 1 approval with owner bypass, require `test` status check, dismiss stale reviews, block force push + deletion

### Known follow-up items (non-blocking)

- `sanitise` / `sanitisation` → American English in source comments if any are added
