# Spinner — 365-Day Experiment

## What This Is

A year-long creative experiment: start with a "useless" CSS 3D spinning circle and add something every day. No long-term plans. Each day's addition is decided that day. Document everything in DIARY.md. See what emerges.

**Started:** 2026-02-17
**Owner:** Tony
**Repo:** https://github.com/TangledScripts/spinner

## Daily Workflow

1. Open this project directory
2. Read DIARY.md — last entry tells you where we are
3. Tony either:
   - Gives a specific idea ("add sound effects")
   - Says "go autonomous" with a time budget (e.g., "15 minutes, your pick")
4. Build the feature, test it, commit it
5. Append a new dated entry to DIARY.md with: what was added, why, any thoughts for tomorrow
6. Keep entries concise — 5-10 lines max per day

## Rules

- **One feature per day** — small, focused, done in 15-20 minutes
- **No long-term planning** — decide the day of, not the day before
- **Always test** — run `npm run test` (vitest) and `npx playwright test` before committing
- **Diary is append-only** — never edit past entries, only add new ones
- **Days don't have to be sequential** — gaps are fine, number by actual date
- **Find usefulness organically** — at some point this thing will accidentally become useful

## Autonomous Mode

When Tony says "go autonomous" or "your pick":
- Read DIARY.md for context on recent additions
- Pick something that builds on recent work or explores a new direction
- Keep it within the time budget
- Commit and document like any other day

## Tech Stack

- **Vite 7.3.x** — build tool and dev server
- **Vanilla JS** — no frameworks, ever (that's the constraint)
- **Zustand vanilla store** — state management via `createStore` from `zustand/vanilla`
- **CSS-first animation** — JS manages state, CSS does all motion
- **Vitest** — unit tests (`npm run test`)
- **Playwright** — E2E tests (`npx playwright test`)

## Key Files

| File | Purpose |
|------|---------|
| `DIARY.md` | Daily log — the real product |
| `src/store.js` | Zustand vanilla store — all state lives here |
| `src/colors.js` | Color palette data (pure module, no side effects) |
| `src/spinner.js` | DOM orchestration — wires store to UI via subscribe |
| `src/style.css` | All CSS including 3D transforms, keyframes, responsive |
| `src/main.js` | Entry point |
| `index.html` | Page structure |
| `src/store.test.js` | Unit tests for store actions |
| `src/colors.test.js` | Unit tests for color palette |
| `tests/spinner.spec.js` | Playwright E2E tests |

## Commands

```bash
npm run dev          # Start dev server (usually port 5173)
npm run build        # Production build
npm run test         # Run unit tests (vitest)
npx playwright test  # Run E2E tests
```

## Architecture Principles (from research)

- CSS owns animation, JS owns state
- Never use requestAnimationFrame — CSS keyframes handle rotation
- `store.subscribe()` callbacks drive DOM updates (not framework re-renders)
- Separate subscribe callbacks per concern (animation, color, HUD)
- `@property` registered `--spinner-color` enables smooth animated transitions
- `animation-play-state` for stop/start (preserves rotation angle)
- `perspective: 800px` + `transform-style: preserve-3d` on parent container

## Future: RAG Integration

A RAG system will be integrated when available. It will serve as an additional memory layer alongside DIARY.md — picking up from wherever we are at the time.
