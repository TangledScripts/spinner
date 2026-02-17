# Architecture Research

**Domain:** CSS 3D animation single-page app with Zustand state management
**Researched:** 2026-02-17
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ index    │  │ style    │  │ colors   │                  │
│  │ .html    │  │ .css     │  │ .js      │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       │              │             │                        │
│  Structure      Animation &    Color palette                │
│  & layout       3D transforms  definitions                  │
│       │              │             │                        │
├───────┴──────────────┴─────────────┴────────────────────────┤
│                   Application Layer                          │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐     │
│  │               spinner.js                            │     │
│  │  DOM bindings / event handlers / animation control  │     │
│  └──────────────────────┬─────────────────────────────┘     │
│                         │                                   │
├─────────────────────────┴───────────────────────────────────┤
│                     State Layer                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │          store.js  (Zustand vanilla store)          │     │
│  │  direction | isSpinning | colorFamily | shadeIndex  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `index.html` | Document structure: circle element, directional buttons (up/down/left/right), stop/start controls | Semantic HTML with `id`/`class` hooks for JS binding and CSS targeting. Perspective container wraps the circle. |
| `style.css` | All visual presentation and animation. Keyframes for continuous 3D rotation, perspective/depth, color transitions, layout | `@keyframes` for each rotation axis, CSS custom properties for dynamic color, `perspective` on parent container, `transform-style: preserve-3d` |
| `store.js` | Single source of truth for all app state. Exposes actions to mutate state. | `createStore` from `zustand/vanilla`. Exports store with `getState`, `setState`, `subscribe`. Contains actions: `setDirection`, `toggleSpinning`, `cycleShade`, `setColorFamily`. |
| `spinner.js` | Orchestration: wires DOM events to store actions, subscribes to store changes, applies CSS classes/properties to DOM | Event listeners on buttons dispatch store actions. `store.subscribe()` triggers DOM updates (class swaps, CSS variable writes). |
| `colors.js` | Color data: family definitions (blue, green, orange, purple) with shade arrays | Pure data module. Exports palette object. No side effects, no DOM access, no store dependency. |

## Recommended Project Structure

```
spinner/
├── index.html              # Single page entry point
├── style.css               # All styles, keyframes, 3D transforms
├── src/
│   ├── store.js            # Zustand vanilla store (state + actions)
│   ├── spinner.js          # Main app: DOM binding + store subscriptions
│   └── colors.js           # Color family/shade palette data
├── test/
│   ├── store.test.js       # Unit tests for store actions and state
│   ├── colors.test.js      # Unit tests for color utilities
│   └── e2e/
│       └── spinner.spec.js # Playwright E2E tests
├── package.json
├── vite.config.js
├── vitest.config.js
└── playwright.config.js
```

### Structure Rationale

- **`src/` for JS modules:** Keeps JS source separate from static assets (`index.html`, `style.css`). Vite resolves module imports from `src/` naturally.
- **`test/` separate from `src/`:** Clean separation of production code from test code. Vitest and Playwright configs point here.
- **Flat `src/` (no nested folders):** With only 3 JS files, subdirectories add friction without benefit. If v2 features grow the codebase, subdirectories can be introduced then.
- **`style.css` at root alongside `index.html`:** These are the static entry points Vite serves. Keeping them together matches Vite's default expectations.

## Architectural Patterns

### Pattern 1: Zustand Vanilla Store (Subscribe + Render)

**What:** Use `createStore` from `zustand/vanilla` to create a framework-agnostic store. The store exposes `getState()`, `setState()`, and `subscribe()`. DOM updates happen inside subscribe callbacks.

**When to use:** Any vanilla JS app that needs centralized state without React.

**Trade-offs:** Extremely lightweight (~1KB), no framework lock-in. But you manually wire DOM updates -- no virtual DOM diffing, no automatic re-renders. For a 5-file app this is a feature, not a bug.

**Example:**
```javascript
// store.js
import { createStore } from 'zustand/vanilla'

export const store = createStore((set, get) => ({
  direction: null,
  isSpinning: false,
  colorFamily: 'blue',
  shadeIndex: 0,

  setDirection: (dir) => set({ direction: dir, isSpinning: true }),
  toggleSpinning: () => set((s) => ({ isSpinning: !s.isSpinning })),
  cycleShade: () => set((s) => ({
    shadeIndex: (s.shadeIndex + 1) % shadeLengthForFamily(s.colorFamily)
  })),
}))
```

### Pattern 2: CSS-Driven Animation with Class Toggling

**What:** CSS defines all animation keyframes and transforms. JS never calls `requestAnimationFrame` or manipulates transform values directly. Instead, JS adds/removes CSS classes (e.g., `.spin-left`, `.spin-up`) and sets CSS custom properties (e.g., `--shade-color`) to control what animates and how it looks.

**When to use:** Any animation expressible as CSS keyframes or transitions. This covers rotation, color transitions, and pause/resume.

**Trade-offs:** GPU-accelerated, 60fps performance with zero JS overhead during animation. The limitation is that CSS cannot do physics-based or dynamically computed animations. For a spinner with fixed rotation axes and discrete color steps, CSS handles everything.

**Example:**
```css
/* style.css */
.circle { animation: none; }
.circle.spin-right { animation: rotateY-cw 1s linear infinite; }
.circle.spin-left  { animation: rotateY-ccw 1s linear infinite; }
.circle.spin-up    { animation: rotateX-cw 1s linear infinite; }
.circle.spin-down  { animation: rotateX-ccw 1s linear infinite; }

@keyframes rotateY-cw {
  from { transform: rotateY(0deg); }
  to   { transform: rotateY(360deg); }
}
```

```javascript
// spinner.js - applies the class based on store state
store.subscribe((state) => {
  circle.className = 'circle'
  if (state.isSpinning && state.direction) {
    circle.classList.add(`spin-${state.direction}`)
  }
})
```

### Pattern 3: Reactive DOM Binding via Store Subscription

**What:** Each DOM concern subscribes to the store independently. One subscription handles animation class swaps; another handles color updates. This keeps each subscription focused on a single responsibility.

**When to use:** When multiple independent DOM updates derive from the same state changes.

**Trade-offs:** Clean separation of concerns. Each subscriber is easy to test and reason about. Risk of redundant re-renders if subscriptions overlap, but with `subscribeWithSelector` middleware you can listen to specific slices and avoid unnecessary work.

**Example:**
```javascript
// spinner.js

// Subscription 1: Animation class
store.subscribe((state) => {
  updateAnimationClass(circle, state.direction, state.isSpinning)
})

// Subscription 2: Color
store.subscribe((state) => {
  const color = getShade(state.colorFamily, state.shadeIndex)
  circle.style.setProperty('--shade-color', color)
})
```

## Data Flow

### User Interaction Flow

```
[User clicks direction button]
    │
    ▼
[Event listener in spinner.js]
    │
    ▼
[store.getState().setDirection('right')]
    │
    ▼
[Zustand store updates: direction='right', isSpinning=true, colorFamily='blue']
    │
    ▼
[store.subscribe callbacks fire]
    │
    ├──▶ [Animation subscriber] → swaps CSS class on circle → CSS takes over rotation
    │
    └──▶ [Color subscriber] → reads colors.js palette → sets --shade-color CSS variable
```

### Shade Cycling Flow

```
[CSS animation completes one full rotation]
    │
    ▼
[animationiteration event fires on circle element]
    │
    ▼
[spinner.js handler calls store.getState().cycleShade()]
    │
    ▼
[Store updates shadeIndex]
    │
    ▼
[Color subscriber fires → new shade applied via CSS variable]
```

### Stop/Start Flow

```
[User clicks Stop]
    │
    ▼
[store.getState().toggleSpinning()] → isSpinning: false
    │
    ▼
[Animation subscriber] → removes spin-* class → CSS animation stops
    │                     (animation-play-state or class removal)
    │
[User clicks Start]
    │
    ▼
[store.getState().toggleSpinning()] → isSpinning: true
    │
    ▼
[Animation subscriber] → re-adds spin-* class → CSS animation resumes
```

### Key Data Flows

1. **Direction change:** Button click -> store action -> class swap -> CSS animation starts on correct axis. Each direction maps to a color family, so `setDirection` also sets `colorFamily`.
2. **Shade cycling:** CSS `animationiteration` event -> store action -> CSS variable update. The browser's animation engine drives the timing; JS only responds to the iteration boundary.
3. **Stop/Start:** Button click -> store toggle -> class add/remove. CSS `animation-play-state: paused` or class removal handles the freeze.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (1 spinner, 5 files) | Flat structure, single store, direct DOM binding. This is the right size. |
| v2 features (speed slider, keyboard, custom palettes) | Add actions to store, new event listeners in spinner.js. colors.js grows with custom palette logic. Still flat structure. |
| Multiple spinners / complex UI | Extract DOM binding into a small rendering abstraction. Consider splitting store into slices. May warrant a `ui/` directory. |

### Scaling Priorities

1. **First bottleneck:** Not performance (CSS handles animation). It is code organization -- if spinner.js grows past ~150 lines, extract subscription handlers into focused modules.
2. **Second bottleneck:** Color system complexity. If custom palettes arrive in v2, colors.js needs to become a utility module with validation, not just a data file.

## Anti-Patterns

### Anti-Pattern 1: JS-Driven Animation Loops

**What people do:** Use `requestAnimationFrame` to manually increment rotation degrees and set `transform` via inline styles.
**Why it's wrong:** Blocks the main thread, can't be GPU-accelerated the same way, harder to pause/resume, more code to maintain. CSS `@keyframes` with `infinite` iteration does this automatically at 60fps with hardware acceleration.
**Do this instead:** Define keyframes in CSS. JS only adds/removes the class that triggers the animation.

### Anti-Pattern 2: DOM as State Store

**What people do:** Store current direction in a `data-direction` attribute, read it back with `getAttribute`, check `classList` to determine if spinning.
**Why it's wrong:** Multiple sources of truth. State becomes fragmented across DOM attributes, class lists, and inline styles. Race conditions when multiple updates happen. Impossible to unit test without a DOM.
**Do this instead:** All state lives in the Zustand store. DOM reflects state; it never _is_ the state.

### Anti-Pattern 3: Monolithic Subscribe Callback

**What people do:** Single `store.subscribe` callback that handles animation class swaps, color updates, button enable/disable states, and any other DOM concern in one giant function.
**Why it's wrong:** Violates single responsibility. Hard to test individual behaviors. Hard to add new behaviors without risking regressions in existing ones.
**Do this instead:** Separate subscriptions per concern. Or use `subscribeWithSelector` to react only to relevant state slices.

### Anti-Pattern 4: Inline `perspective()` Instead of Parent Property

**What people do:** Apply `transform: perspective(800px) rotateY(45deg)` on the animated element itself.
**Why it's wrong:** When animating with keyframes, the perspective value gets interpolated along with the rotation, causing distortion. Multiple child elements don't share a vanishing point.
**Do this instead:** Set `perspective: 800px` on the parent container. Apply `transform-style: preserve-3d` on the parent. Animate only `rotateX`/`rotateY` on the child.

## Integration Points

### External Services

None. This is a fully static, local-only app with no network dependencies.

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `spinner.js` <-> `store.js` | Import store, call actions via `getState()`, listen via `subscribe()` | One-way data flow: spinner dispatches actions, subscribes to state. Never mutates store directly. |
| `spinner.js` <-> `colors.js` | Import palette data, call lookup functions | Pure function calls. colors.js has no side effects and no store awareness. |
| `store.js` <-> `colors.js` | Store may import palette length for shade cycling bounds | Minimal coupling. Store needs to know max shade count to wrap `shadeIndex`. |
| `style.css` <-> `spinner.js` | JS toggles CSS classes; CSS defines what those classes do | The contract is class names. JS adds `.spin-right`; CSS defines what `.spin-right` animates. Changes to animation timing/easing stay in CSS without touching JS. |
| `index.html` <-> `spinner.js` | JS queries DOM elements by `id`/`class` established in HTML | HTML defines the structure; JS binds to it. IDs are the contract. |

## Suggested Build Order

Based on dependency analysis, build components in this order:

```
Phase 1: colors.js          (no dependencies, pure data)
    │
Phase 2: store.js           (depends on: colors.js for shade count)
    │
Phase 3: style.css          (depends on: knowing class name contracts)
    │
Phase 4: index.html         (depends on: knowing element structure)
    │
Phase 5: spinner.js         (depends on: all of the above — wires everything together)
```

**Rationale:**
- `colors.js` is a leaf node -- no imports, no side effects. Build and test it first.
- `store.js` needs color palette lengths for shade wrapping. Once colors exist, the store can be fully built and unit tested in isolation (no DOM needed).
- `style.css` and `index.html` can be built in parallel once the class name and element ID contracts are decided. CSS needs to know what classes spinner.js will toggle; HTML needs to know what IDs spinner.js will query.
- `spinner.js` is the orchestrator. It imports store and colors, queries the DOM, and wires subscriptions. It must be built last because it depends on every other component existing.

## Sources

- [createStore API - Zustand official docs](https://zustand.docs.pmnd.rs/apis/create-store)
- [How to use Zustand in vanilla JavaScript - Charles (Medium)](https://medium.com/@scriptingwithcharles/how-to-use-zustand-in-vanilla-javascript-019c9bcc1056)
- [How CSS Perspective Works - CSS-Tricks](https://css-tricks.com/how-css-perspective-works/)
- [CSS 3D Transforms and Animations - The Art of Web](https://www.the-art-of-web.com/css/3d-transforms/)
- [Perspective - Intro to CSS 3D Transforms (Desandro)](https://3dtransforms.desandro.com/perspective)
- [State Management in Vanilla JS: 2026 Trends (Medium)](https://medium.com/@chirag.dave/state-management-in-vanilla-js-2026-trends-f9baed7599de)
- [Modern State Management in Vanilla JavaScript: 2026 Patterns (Medium)](https://medium.com/@orami98/modern-state-management-in-vanilla-javascript-2026-patterns-and-beyond-ce00425f7ac5)
- [CSS 3D Transform Perspective Examples - Polypane](https://polypane.app/css-3d-transform-examples/)

---
*Architecture research for: CSS 3D animation single-page app with Zustand state management*
*Researched: 2026-02-17*
