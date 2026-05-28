# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Chrome Extension (Manifest V3) for modifying and testing curl requests. Parse curl commands, dynamically modify JSON fields, batch-send requests.

## Commands (run from `client/`)

```bash
pnpm install       # Install deps
pnpm build         # Build to dist/
pnpm dev           # Dev server (port 5173)
pnpm lint:fix      # Auto-fix lint
pnpm format        # Format code
```

## Architecture

**Three-panel React app** opened via **Shadow DOM drawer** injected into any page:

| Entry | Source | Output | Purpose |
|-------|--------|--------|---------|
| popup | `popup.html` | `dist/popup.html` | Main app loaded in drawer iframe |
| index | `index.html` | `dist/index.html` | Standalone tab |
| background | `src/background/background.ts` | `dist/background.js` | Service worker: curl parsing, request generation |
| drawer | `src/drawer/drawer.ts` | `dist/drawer.js` | IIFE injected into pages, creates Shadow DOM drawer |

**Opening flow**: Click extension icon → background injects `drawer.js` → sends `OPEN_DRAWER` → drawer creates Shadow DOM host with iframe loading `popup.html`.

## Key Files

- `src/App.tsx` — 3-panel layout (Left/Middle/Right)
- `src/store/useAppStore.ts` — Zustand store (curl input, modifiers, results)
- `src/background/background.ts` — Message handlers: `PARSE_CURL`, `GENERATE_REQUESTS`, `SEND_REQUEST`
- `src/drawer/drawer.ts` — Shadow DOM drawer with iframe
- `src/services/api.ts` — `chrome.runtime.sendMessage` calls

## Build Notes

- **Vite multi-page build** with `base: './'` for extension compatibility
- `background.js` and `drawer.js` output at root (not in `assets/`)
- `drawer.js` is **IIFE** (not ESM) — Chrome content scripts don't support `import`
- `popup.html` must be in `web_accessible_resources` for iframe access

## Coding Conventions

- No `console.log` — only `console.error` for production errors
- Multi-line curl commands are common; regex must handle `[\s\S]` not just `.`
