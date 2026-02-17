# Stack Research

**Domain:** CSS 3D animation single-page app with vanilla JS and lightweight state management
**Researched:** 2026-02-17
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 7.3.x | Build tool and dev server | Industry standard for frontend projects. Sub-second HMR, native ESM dev server, optimized production builds. The `vanilla` template gives a zero-config starting point with no framework overhead. 31M weekly downloads. |
| Zustand | 5.0.x | State management | The `zustand/vanilla` export provides a framework-agnostic store via `createStore()` with `getState()`, `setState()`, and `subscribe()` -- exactly what a non-React app needs. ~1KB minified. No providers, no context, no boilerplate. |
| Vanilla JavaScript (ES2022+) | N/A | Application logic | CSS 3D transforms need minimal JS orchestration (class toggling, state reads). A framework adds weight and abstraction with zero benefit for this use case. Vite handles ESM modules natively. |
| CSS (native) | N/A | 3D animations and styling | CSS `transform`, `transition`, and `@keyframes` are GPU-accelerated. The browser compositor handles `rotateX()`/`rotateY()` on the GPU without JavaScript frame loops. This is the correct layer for 3D rotation animations. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand/middleware | (bundled with zustand 5.x) | `devtools` middleware for store inspection | During development. Connect to Redux DevTools browser extension to inspect state changes. Import from `zustand/middleware` in v5 (path changed from v4). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | 4.0.x | Unit testing | Shares Vite's config and transform pipeline. Native ESM, fast watch mode. Use for testing store logic, state transitions, color cycling functions. |
| Playwright | 1.58.x | E2E testing | Tests actual browser rendering of 3D transforms. Use `@playwright/test` package. Validates that button clicks produce correct visual rotations. |
| ESLint | 9.x | Code linting | Flat config format (eslint.config.js). Use `@eslint/js` for vanilla JS rules. |
| Prettier | 3.x | Code formatting | Consistent style. Pair with `eslint-config-prettier` to avoid rule conflicts. |

## Installation

```bash
# Scaffold project
npm create vite@latest spinner -- --template vanilla

# Core dependency
npm install zustand

# Dev dependencies
npm install -D vitest @playwright/test eslint @eslint/js prettier eslint-config-prettier

# Install Playwright browsers
npx playwright install --with-deps chromium
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Zustand (vanilla) | Nano Stores | If you want a smaller API surface and don't need middleware (devtools, persist). Zustand wins here because devtools middleware is valuable for debugging rotation/color state. |
| Zustand (vanilla) | Preact Signals | If you want fine-grained reactivity with automatic DOM updates. Overkill for this project's simple state shape. |
| Zustand (vanilla) | Redux Toolkit | Never for this project. RTK is designed for large apps with complex async flows. Massive overhead for a single-page spinner. |
| Vite | Parcel | If you want zero-config without even a config file. Vite's ecosystem (Vitest integration, plugin ecosystem) makes it the better choice. |
| Vite | Webpack | Never for a greenfield project in 2025+. Slower dev server, more complex configuration, no native ESM dev mode. |
| Vitest | Jest | If your team already has deep Jest infrastructure. For greenfield, Vitest is faster and shares Vite's transform pipeline -- no duplicate config. |
| CSS transitions/keyframes | GSAP | If you need complex sequenced timelines, physics-based easing, or morph animations. CSS handles simple rotations and color transitions natively without a 30KB+ library. |
| CSS transitions/keyframes | Three.js / WebGL | If you need actual 3D geometry, lighting, or textures. CSS 3D transforms create the illusion of 3D via perspective projection -- sufficient for rotating a flat circle element. |
| Vanilla JS | React/Vue/Svelte | If the project grows to need component-based UI with complex state-driven re-renders. A spinner with 4 buttons and 1 animated element does not justify framework overhead. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Three.js / WebGL | Extreme overkill. You are rotating a DOM element, not rendering 3D geometry. Three.js adds ~150KB and a completely different rendering paradigm (canvas). | CSS `transform: rotateX() rotateY()` with `perspective` and `transform-style: preserve-3d`. |
| GSAP for simple rotations | Adds 30KB+ for something CSS does natively with GPU acceleration. GSAP shines for complex sequenced timelines, not single-property transitions. | CSS `transition` on `transform` property. |
| jQuery | Dead ecosystem. Vite + vanilla ES modules provide everything jQuery offered (DOM selection, event handling) in a modern, tree-shakeable way. | `document.querySelector()`, `element.addEventListener()`, native DOM APIs. |
| React/Vue/Svelte | Framework overhead (virtual DOM diffing, component lifecycle, hydration) provides zero value for a single-view app with 5 interactive elements. Adds 30-100KB+ to bundle. | Vanilla JS with Zustand vanilla store. Manual DOM updates via `store.subscribe()`. |
| CSS-in-JS (styled-components, emotion) | Requires a framework runtime. Adds JavaScript overhead to what should be pure CSS. Defeats the CSS-first animation principle. | Plain CSS files. Vite handles CSS imports and hot-reloading natively. |
| Webpack | Slower dev experience, complex configuration, no native ESM dev server. No reason to choose it for a greenfield project. | Vite. |
| Jest | Slower than Vitest, requires separate transform config, doesn't share Vite's pipeline. | Vitest. |
| Anime.js | Another JS animation library that's unnecessary when CSS handles the animations natively. Adds bundle weight for no benefit. | CSS `transition` and `@keyframes`. |

## Stack Patterns by Variant

**If adding persistence (remember last rotation/color across refreshes):**
- Use Zustand's `persist` middleware (built-in, import from `zustand/middleware`)
- Stores state in `localStorage` automatically
- Use Zustand v5.0.10+ (fixes persist middleware bug)

**If adding more complex animation sequences later:**
- Consider GSAP only if you need timeline-based sequencing of multiple properties
- For single-property transitions (rotation, color), CSS remains the correct choice

**If the project grows to need multiple views/pages:**
- Consider adding a lightweight router (e.g., `navigo` ~3KB) rather than jumping to a framework
- Re-evaluate framework need only if component count exceeds ~15-20

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Vite 7.3.x | Node.js 20.19+ or 22.12+ | Node 18 support dropped in Vite 7. Use Node 22 LTS for best compatibility. |
| Vite 7.3.x | Vitest 4.0.x | Same transform pipeline, shared config via `vite.config.js`. |
| Zustand 5.0.x | Vite 7.x | Pure ESM, works seamlessly with Vite's native ESM dev server. |
| Playwright 1.58.x | Node.js 20+ | Requires Chromium install via `npx playwright install`. |
| Vitest 4.0.x | Node.js 20.19+ or 22.12+ | Aligns with Vite 7's Node requirements. |

## Key CSS Properties for 3D Animation

These are not "libraries" but the core CSS APIs this project depends on:

| CSS Property | Purpose | Critical Notes |
|--------------|---------|----------------|
| `perspective` | Creates 3D viewing context with depth | Set on parent element. Values 400-1000px typical. Lower = more dramatic 3D effect. |
| `transform-style: preserve-3d` | Keeps child elements in 3D space | Must be on the element being transformed, not just the parent. |
| `transform: rotateX() rotateY()` | Performs the 3D rotation | GPU-accelerated. Order matters (applied right to left). |
| `transition` | Animates between transform states | Use on the `transform` property. `ease-in-out` or `cubic-bezier()` for natural motion. |
| `backface-visibility: hidden` | Hides element back face during rotation | Essential if the circle has a "back side" that should not be visible. |
| `will-change: transform` | Hints browser to optimize for transform changes | Apply sparingly. Promotes element to its own compositor layer. |
| `prefers-reduced-motion` | Accessibility: respect user motion preferences | Wrap animations in `@media (prefers-reduced-motion: no-preference)`. |

## Sources

- [Vite 7.0 release blog](https://vite.dev/blog/announcing-vite7) -- Vite 7 features, Node.js requirements (HIGH confidence)
- [Vite Getting Started](https://vite.dev/guide/) -- Vanilla template scaffolding (HIGH confidence)
- [Zustand GitHub / npm](https://github.com/pmndrs/zustand) -- v5 API, vanilla store (HIGH confidence)
- [Zustand `createStore` docs](https://zustand.docs.pmnd.rs/apis/create-store) -- Vanilla store API (HIGH confidence)
- [Zustand vanilla JS usage (Medium)](https://medium.com/@scriptingwithcharles/how-to-use-zustand-in-vanilla-javascript-019c9bcc1056) -- Vanilla integration patterns (MEDIUM confidence)
- [Vitest 4.0 release](https://vitest.dev/blog/vitest-4) -- Vitest 4 features (HIGH confidence)
- [Playwright release notes](https://playwright.dev/docs/release-notes) -- v1.58 features (HIGH confidence)
- [CSS 3D Transforms (desandro)](https://3dtransforms.desandro.com/) -- Comprehensive 3D CSS guide (HIGH confidence)
- [W3Schools CSS 3D Transforms](https://www.w3schools.com/css/css3_3dtransforms.asp) -- Property reference (HIGH confidence)
- [CSS/JS Animation Trends 2026](https://webpeak.org/blog/css-js-animation-trends/) -- GPU acceleration best practices (MEDIUM confidence)

---
*Stack research for: CSS 3D animation single-page app (Spinner)*
*Researched: 2026-02-17*
