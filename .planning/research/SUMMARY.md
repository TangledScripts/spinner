# Research Summary

**Project:** Spinner
**Researched:** 2026-02-17
**Confidence:** HIGH

## Key Findings

### Stack
- **Vite 7.3.x + Vanilla JS is the optimal foundation** - Zero framework overhead, sub-second HMR, native ESM dev server with 31M weekly downloads proves production readiness
- **Zustand vanilla store (createStore) provides clean state management** - Framework-agnostic at ~1KB with getState(), setState(), subscribe() - exactly what non-React apps need without provider/context boilerplate
- **CSS handles all animations natively** - GPU-accelerated transform/transition/keyframes eliminate need for GSAP, Three.js, or JS animation loops. Browser compositor handles rotateX()/rotateY() at 60fps without blocking main thread

### Features
- **Table stakes are minimal but precise** - Smooth 3D rotation on correct axes, directional buttons, continuous spinning, stop/start controls, color families per direction, and shade cycling are all users expect
- **CSS-first animation is the key differentiator** - Most demos use GSAP or Three.js. Pure CSS transforms with JS managing only state shows architectural discipline and delivers superior performance
- **Animation state must never trigger React re-renders** - Storing rotation angle or frame data in Zustand causes 60 re-renders/second. CSS keyframes run on compositor; JS only toggles classes and updates CSS variables at discrete boundaries

### Architecture
- **Five-file structure with clear separation of concerns** - colors.js (data) → store.js (state) → style.css (animation) + index.html (structure) → spinner.js (orchestration). Build in dependency order
- **Subscribe + Render pattern for DOM binding** - store.subscribe() callbacks apply CSS classes and custom properties. Never store animation frame data in Zustand. One subscription per concern (animation class, color updates) keeps responsibilities focused
- **CSS-driven animation with class toggling** - JS never calls requestAnimationFrame or manipulates transform values. Add/remove classes (.spin-left, .spin-up); set CSS custom properties (--shade-color). CSS compositor handles the rest at 60fps

### Pitfalls
- **Missing transform-style: preserve-3d flattens 3D into 2D** - Always pair perspective property on parent with preserve-3d. Default is flat, making rotation appear as skew/scale instead of true depth
- **perspective() function vs perspective property confusion** - Using transform: perspective(800px) rotateX(45deg) on element creates per-element vanishing point. Use perspective: 800px on parent container for shared vanishing point across all 3D children
- **Safari breaks preserve-3d with grouping properties** - opacity, overflow: hidden, mix-blend-mode, filter on same element force transform-style: flat in most browsers. Test Safari early; avoid pseudo-elements for 3D content

## Consensus Across Research

All four research dimensions agree on these core principles:

1. **CSS owns animation, JS owns state** - Never drive animation loops with requestAnimationFrame. CSS keyframes with infinite iteration + animation-play-state for pause/resume. JS only toggles classes and updates CSS variables
2. **Zustand vanilla store is the correct state layer** - Not Zustand React hooks. Use createStore() from zustand/vanilla with subscribe() for DOM updates. Store shape: { direction, isSpinning, colorFamily, shadeIndex }
3. **Animate only transform and opacity** - These are compositor-only properties. Background-color, box-shadow, border-color trigger paint on main thread → visible jank. Use opacity crossfade for colors or discrete CSS variable updates at rotation boundaries
4. **Parent perspective container is mandatory** - Set perspective: 800px and transform-style: preserve-3d on parent. Apply rotateX/rotateY transforms only on child element. Never inline perspective() in transform chain
5. **Build in dependency order** - colors.js (no deps) → store.js (needs color data) → style.css + index.html (parallel) → spinner.js (orchestrates everything). Test each layer before moving to next

## Open Questions

1. **Smooth direction transitions without jump-cut** - How to preserve visual continuity when swapping from spin-left to spin-up? Options: (a) capture getComputedStyle transform, use as starting point for new keyframe, or (b) CSS custom properties with animation-delay trick. Needs experimentation in Phase 2
2. **Color transition timing** - Should shade changes be instant or fade over 200-400ms? Instant avoids paint overhead but feels jarring. Fade requires registering --shade-color via @property for animatable custom property transitions
3. **prefers-reduced-motion implementation** - Disable animation entirely (static colored circle) or slow to 10% speed with user opt-in to start? WCAG requires ability to pause, but static-by-default may be clearer UX
4. **Vite HMR state preservation** - How to prevent animation jump on hot reload? Store isSpinning + last direction in Zustand, re-apply animation-play-state on HMR. Verify this in Phase 3 polish

## Recommendations for Implementation

1. **Establish perspective container first** - Create parent wrapper with perspective: 800px and transform-style: preserve-3d before any rotation code. Verify 3D depth with manual 90-degree rotation test in Chrome/Firefox/Safari
2. **Build colors.js as pure data module** - Four color families (blue, green, orange, purple), 5-7 shades each. Export palette object. No side effects, no DOM, no store dependency. Unit test first
3. **Define Zustand store shape with actions** - { direction: null, isSpinning: false, colorFamily: 'blue', shadeIndex: 0 }. Actions: setDirection(dir), toggleSpinning(), cycleShade(). Unit test state transitions before wiring to DOM
4. **Use separate store.subscribe() callbacks per concern** - One for animation class swaps (spin-left/spin-up), one for color CSS variable updates. Keeps each subscription focused and testable
5. **Trigger shade cycling with animationiteration event** - Listen on circle element for animationiteration, call store cycleShade() action. This naturally syncs color changes to rotation completion
6. **Test Safari in Phase 2, not Phase 4** - Safari has known preserve-3d bugs with pseudo-elements and grouping properties. Validate base 3D rotation works before building features on top
7. **Use animation-play-state for stop/start, not class removal** - Paused preserves exact rotation angle; removing animation class resets to 0 degrees. Store isSpinning boolean, map to paused/running in CSS

---

**Implementation Priority:** Start with static 3D perspective → Add CSS rotation keyframes → Wire Zustand state → Add color cycling → Polish stop/start controls

**Critical Success Factors:**
- Zero React re-renders during animation (verify with DevTools Profiler)
- No paint events on animation frames (verify with Performance panel)
- 3D depth visible at extreme rotation angles in Safari
- Stop button freezes rotation at current angle without reset
