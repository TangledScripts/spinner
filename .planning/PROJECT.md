# Spinner

## What This Is

A single-page web app with a 3D-spinning circle controlled by directional buttons (up/down/left/right), where each spin direction assigns a color family and each rotation cycles through shades of that color. Includes stop/start controls. Built as a FORGE framework shakedown — testing every feature end-to-end.

## Core Value

The circle spins smoothly in 3D on the correct axis when a direction is clicked, continuously cycling through color shades until stopped or redirected.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 3D circle display with perspective — centered, visually distinct
- [ ] Four directional buttons arranged around the circle (up/down/left/right)
- [ ] 3D spin animation on correct axis (up/down = rotateX, left/right = rotateY)
- [ ] Continuous spinning — persists until direction change or stop
- [ ] Color family assignment — each direction maps to a distinct color family
- [ ] Shade cycling — each full rotation shifts to next shade within active family
- [ ] Stop control — halts spinning, freezes position and color
- [ ] Start control — resumes spinning from frozen state
- [ ] All state managed through Zustand store (direction, isSpinning, colorFamily, shadeIndex)

### Out of Scope

- Speed control slider — deferred to v2
- Custom color palette picker — deferred to v2
- Keyboard arrow key support — deferred to v2
- Mobile touch/swipe gestures — deferred to v2
- Backend or API — none needed
- Persistence across refresh — not required
- Mobile-specific layout — desktop-first only

## Context

- **Stack:** JavaScript (vanilla) + Zustand (state) + Vite (bundler) + Vitest (unit tests) + Playwright (E2E tests)
- **Architecture:** Single-page static app, no routing
- **Animation principle:** CSS-first — JS manages state, CSS performs all motion via transforms/keyframes
- **Source files:** index.html, style.css, store.js, spinner.js, colors.js
- **Purpose:** FORGE framework test drive — exercise every FORGE phase and feature with a real deliverable

## Constraints

- **Stack:** Zustand is the only runtime dependency. Vite for dev/build only.
- **Animation:** Must use CSS 3D transforms (GPU-accelerated, 60fps target)
- **Single page:** No routing, no multi-page structure
- **No framework:** Vanilla JS only (no React, Vue, etc.)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Zustand over Redux | Lightweight, works without React, minimal boilerplate for small app | — Pending |
| CSS-first animation | GPU-accelerated, more performant, cleaner separation of concerns | — Pending |
| Vite over Webpack | Modern, fast HMR, native ES modules, pairs with Vitest | — Pending |
| Playwright for E2E | Visual testing of spinning animations, real browser verification | — Pending |

---
*Last updated: 2026-02-17 after FORGE inception (synthesized from docs/reference/prd.md)*
