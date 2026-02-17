# Requirements: Spinner

**Defined:** 2026-02-17
**Core Value:** The circle spins smoothly in 3D on the correct axis when a direction is clicked, continuously cycling through color shades until stopped or redirected.

## v1 Requirements (Complete)

### Display

- [x] **DISP-01**: 3D circle element centered on page with visible perspective depth
- [x] **DISP-02**: Parent container has `perspective` property and `transform-style: preserve-3d`
- [x] **DISP-03**: Circle is visually distinct (border, gradient, or shadow gives it form)

### Controls

- [x] **CTRL-01**: Four directional buttons (up/down/left/right) arranged spatially around the circle
- [x] **CTRL-02**: Stop button halts spinning, freezes current rotation angle and color
- [x] **CTRL-03**: Start button resumes spinning from frozen state
- [x] **CTRL-04**: All buttons are focusable with visible focus indicators

### Animation

- [x] **ANIM-01**: Up/down buttons trigger rotation on X-axis (`rotateX`)
- [x] **ANIM-02**: Left/right buttons trigger rotation on Y-axis (`rotateY`)
- [x] **ANIM-03**: Spinning is continuous (`animation-iteration-count: infinite`) until stopped or redirected
- [x] **ANIM-04**: Stop/start uses `animation-play-state` (not class removal) to preserve rotation angle
- [x] **ANIM-05**: All animation uses CSS transforms only — no JS animation loops

### Color

- [x] **COLR-01**: Each direction maps to a distinct color family (4 families total)
- [x] **COLR-02**: Each full rotation cycles to the next shade within the active color family
- [x] **COLR-03**: Shade cycling triggers on `animationiteration` event
- [x] **COLR-04**: Color applied via CSS custom property (`--spinner-color`)

### State

- [x] **STAT-01**: All state managed through Zustand vanilla store (`zustand/vanilla` createStore)
- [x] **STAT-02**: Store shape: `{ direction, isSpinning, colorFamily, shadeIndex }`
- [x] **STAT-03**: DOM updates driven by `store.subscribe()` callbacks, not framework re-renders
- [x] **STAT-04**: Separate subscribe callbacks per concern (animation class, color updates)

### Accessibility

- [x] **A11Y-01**: Respects `prefers-reduced-motion` — animation disabled or paused when preference set

### Testing

- [x] **TEST-01**: Unit tests for store actions and state transitions (Vitest)
- [x] **TEST-02**: Unit tests for color palette data and shade cycling logic (Vitest)
- [x] **TEST-03**: E2E test verifying button clicks produce correct visual rotation (Playwright)

## v2 Requirements

### Enhanced Controls

- [ ] **ECTL-01**: Speed control slider bound to `animation-duration` via CSS custom property `--spin-duration`
- [ ] **ECTL-02**: Keyboard arrow keys mapped to direction changes, Space for stop/start, Escape to reset
- [ ] **ECTL-03**: Mobile touch/swipe gestures for direction control

### Enhanced Visuals

- [ ] **EVIS-01**: Richer color palette — shades start at medium intensity (index 2), not near-white
- [ ] **EVIS-02**: Smooth color transitions between shades via `@property` registered `--spinner-color`
- [ ] **EVIS-03**: Live status HUD showing current direction, color family name, speed, and shade index

### Platform

- [ ] **PLAT-01**: Mobile-responsive layout — stacked on small screens, touch-friendly button sizes

### Testing v2

- [ ] **TEST-04**: Unit tests for new store actions (setSpeed, reset)
- [ ] **TEST-05**: E2E tests for keyboard controls and speed slider

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend/API | Fully static app, no server needed |
| Persistence across refresh | Not required; fresh state on load is cleaner |
| Three.js / WebGL | CSS 3D transforms sufficient; WebGL is extreme overkill |
| GSAP or JS animation libraries | CSS handles rotation natively; JS libraries add weight without benefit |
| React/Vue/Svelte framework | 5 interactive elements don't justify framework overhead |
| Multiple shapes / 3D scene | Single circle, done well — constraint is the point |
| Physics-based easing | CSS `cubic-bezier` covers reasonable easing needs |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DISP-01 | Phase 1 | Done |
| DISP-02 | Phase 1 | Done |
| DISP-03 | Phase 1 | Done |
| CTRL-01 | Phase 1 | Done |
| CTRL-02 | Phase 2 | Done |
| CTRL-03 | Phase 2 | Done |
| CTRL-04 | Phase 2 | Done |
| ANIM-01 | Phase 1 | Done |
| ANIM-02 | Phase 1 | Done |
| ANIM-03 | Phase 1 | Done |
| ANIM-04 | Phase 2 | Done |
| ANIM-05 | Phase 1 | Done |
| COLR-01 | Phase 2 | Done |
| COLR-02 | Phase 2 | Done |
| COLR-03 | Phase 2 | Done |
| COLR-04 | Phase 2 | Done |
| STAT-01 | Phase 1 | Done |
| STAT-02 | Phase 1 | Done |
| STAT-03 | Phase 1 | Done |
| STAT-04 | Phase 1 | Done |
| A11Y-01 | Phase 3 | Done |
| TEST-01 | Phase 2 | Done |
| TEST-02 | Phase 2 | Done |
| TEST-03 | Phase 3 | Done |
| ECTL-01 | Phase 4 | Pending |
| ECTL-02 | Phase 4 | Pending |
| EVIS-01 | Phase 4 | Pending |
| EVIS-02 | Phase 4 | Pending |
| EVIS-03 | Phase 5 | Pending |
| PLAT-01 | Phase 5 | Pending |
| TEST-04 | Phase 5 | Pending |
| TEST-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 24 total (24 Done)
- v2 requirements: 8 total (0 Done)
- Mapped to phases: 32
- Unmapped: 0

---
*Requirements defined: 2026-02-17*
*Last updated: 2026-02-17 — v2 enhancement scope defined autonomously*
