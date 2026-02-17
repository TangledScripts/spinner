# Feature Research

**Domain:** Interactive CSS 3D animation single-page app (spinner with directional controls, color cycling, state management)
**Researched:** 2026-02-17
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Smooth 3D rotation on correct axis | Core promise of the app; jerky or wrong-axis spin = broken product | MEDIUM | Use CSS `rotateX` (up/down) and `rotateY` (left/right) with `transform-style: preserve-3d` and `perspective`. Animate only `transform` for GPU compositing at 60fps. |
| Directional buttons (up/down/left/right) | Primary interaction model; without them user has no way to control the spinner | LOW | Arrange visually around the circle. Each button sets direction in Zustand store, CSS class swap triggers new `@keyframes`. |
| Continuous spinning until interrupted | Every 3D spinner demo in the wild spins continuously; stopping after one rotation feels broken | LOW | `animation-iteration-count: infinite` on the active keyframe. Direction change restarts with new keyframe. |
| Stop/start (pause/resume) controls | Universal media control pattern; users expect play/pause on anything that moves | LOW | Toggle `animation-play-state: paused/running` via Zustand state. CSS resumes from where it paused natively -- no position tracking needed. |
| Color family per direction | Stated core value; each direction = distinct color family gives visual meaning to direction changes | LOW | Four color families (e.g., blues, reds, greens, purples). Zustand maps direction to family. Apply via CSS custom property `--spinner-color`. |
| Shade cycling per rotation | Stated core value; progression through shades gives sense of motion depth | MEDIUM | Listen for `animationiteration` event to increment shade index in Zustand. Update `--spinner-color` CSS variable on each full rotation. |
| Visible 3D perspective and depth | Without perspective the "3D" claim is false; circle looks flat | LOW | Set `perspective: 800px` (or similar) on parent container. Without it, `rotateX`/`rotateY` produce no visible 3D effect. |
| Responsive centering | A centered spinner is the baseline expectation for any demo/showcase app | LOW | Flexbox centering on viewport. The circle should always be dead-center regardless of window size. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| CSS-first animation with zero JS animation logic | Most 3D demos use GSAP, Three.js, or raw JS animation loops. Pure CSS transforms with JS only managing state is cleaner, more performant, and architecturally distinct. | LOW | This is an architecture decision more than a feature, but it shows up in performance (compositor-only, no main thread blocking) and code simplicity. |
| `prefers-reduced-motion` respect | ~35% of adults 40+ have motion sensitivity. Respecting OS preference is rare in demo apps and shows production-quality thinking. | LOW | `@media (prefers-reduced-motion: reduce)` disables animation, shows static state. Alternatively, slow the animation dramatically. |
| Smooth direction transitions (no jump-cut) | Most CSS spinner demos jump when switching direction. Preserving visual continuity during direction change feels polished. | HIGH | Hardest differentiator. Options: (1) capture current `getComputedStyle` transform, set as starting point for new keyframe, or (2) use CSS custom properties with `animation-delay` trick to maintain position. Needs experimentation. |
| Keyboard accessibility for controls | Interactive apps on CodePen/demos almost never support keyboard nav. Adding it signals quality. | LOW | Standard `<button>` elements get keyboard support for free. Add visible `:focus` styles. Arrow keys for direction is Out of Scope per PROJECT.md v1 but buttons themselves must be focusable. |
| Zustand-driven state as single source of truth | Demo apps typically scatter state across DOM attributes and JS variables. Centralized Zustand store makes state inspectable, testable, and predictable. | LOW | Already a project requirement. The differentiator is doing it well: store shape is `{ direction, isSpinning, colorFamily, shadeIndex }`, derived values computed in selectors. |
| Color transition animation between shades | Instead of hard-swapping colors on each rotation, smoothly transitioning between shades adds visual polish | LOW | Use CSS `transition` on `background-color` (or the custom property via `@property` registration for animatable custom properties). |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| JS-driven animation loop (requestAnimationFrame) | "More control over animation" | Blocks main thread, fights CSS compositor, adds complexity for no gain in this use case. Defeats the CSS-first architecture principle. | CSS `@keyframes` + `animation-play-state` + `transform`. JS only toggles classes and updates CSS custom properties. |
| Speed control slider (v1) | "Let users control how fast it spins" | Adds UI complexity, edge cases (0 speed = stopped?), and animation restart logic. Deferred to v2 per PROJECT.md for good reason. | Fixed speed that feels good. Revisit in v2 with `animation-duration` bound to a CSS custom property. |
| Custom color picker (v1) | "Let users choose their own colors" | Scope creep; designing a good color picker UI is its own project. Premature for a framework shakedown. Deferred to v2. | Curated color families that look good together. Four families, 5-7 shades each. |
| Mobile touch/swipe gestures (v1) | "Swipe to change direction" | Touch event handling adds significant complexity (distinguishing swipe from scroll, debouncing, direction detection). Desktop-first per PROJECT.md. | Buttons work on mobile via tap. Touch gestures deferred to v2. |
| 3D scene with multiple objects | "Add more shapes, make it a scene" | Transforms scope to the FORGE framework test, not a 3D scene builder. Multiple objects multiply state complexity and CSS layering issues. | Single circle, done well. The constraint is the point. |
| Persistence across refresh | "Remember my last direction and color" | Adds localStorage logic, hydration edge cases, and state sync complexity for a demo app that doesn't need it. | Fresh state on load. Clean, predictable, no stale state bugs. |
| Complex easing/physics simulation | "Make it feel more realistic with spring physics" | Requires JS animation library (GSAP, Framer Motion) which contradicts CSS-first principle. CSS `cubic-bezier` covers reasonable easing. | Use `cubic-bezier()` for custom easing curves. CSS `linear()` function (new in modern browsers) for multi-point easing if needed. |

## Feature Dependencies

```
[3D Circle Display + Perspective]
    └──requires──> [CSS 3D Transform Setup (preserve-3d, perspective)]
                       └──enables──> [Rotation on Correct Axis (rotateX/rotateY)]

[Directional Buttons]
    └──triggers──> [Direction State in Zustand]
                       └──drives──> [Rotation Axis Selection]
                       └──drives──> [Color Family Assignment]

[Color Family Assignment]
    └──requires──> [Direction State]
    └──enables──> [Shade Cycling]
                       └──requires──> [animationiteration Event Listener]

[Stop/Start Controls]
    └──toggles──> [isSpinning State in Zustand]
                       └──drives──> [animation-play-state: paused/running]

[Shade Cycling]
    └──enhances──> [3D Circle Display] (visual feedback per rotation)
    └──requires──> [Color Family Assignment] (must know which family to cycle through)

[prefers-reduced-motion] ──conflicts──> [Continuous Spinning Default]
    (resolve: disable animation when preference set, show static colored circle)
```

### Dependency Notes

- **Rotation requires 3D transform setup:** `perspective` on parent and `transform-style: preserve-3d` must exist before any `rotateX`/`rotateY` produces visible 3D effect.
- **Shade cycling requires color family:** Cannot cycle shades without knowing which color family is active. Direction must be set first.
- **Shade cycling requires animationiteration:** The `animationiteration` DOM event fires after each full rotation, providing the natural trigger point for shade advancement.
- **Stop/start requires animation-play-state:** CSS natively supports pausing/resuming from current position. No need to track rotation angle in JS.
- **prefers-reduced-motion conflicts with continuous spinning:** Resolve by checking media query and either disabling animation entirely or defaulting to paused state with explicit user opt-in to start.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to validate the concept and exercise all FORGE phases.

- [x] 3D circle with perspective -- centered, visually clear 3D depth
- [x] Four directional buttons (up/down/left/right) -- arranged spatially around circle
- [x] Correct-axis 3D rotation -- rotateX for vertical, rotateY for horizontal
- [x] Continuous spinning -- infinite iteration, persists until stopped or redirected
- [x] Stop/start controls -- pause and resume via animation-play-state
- [x] Color family per direction -- four distinct families, auto-assigned on direction click
- [x] Shade cycling per rotation -- animationiteration event increments shade index
- [x] Zustand store -- single source of truth for direction, isSpinning, colorFamily, shadeIndex
- [x] prefers-reduced-motion support -- respect OS motion preferences

### Add After Validation (v1.x)

Features to add once core is working and FORGE framework validated.

- [ ] Speed control slider -- bind `animation-duration` to CSS custom property driven by range input
- [ ] Keyboard arrow keys for direction -- map ArrowUp/Down/Left/Right to direction changes
- [ ] Smooth color transitions between shades -- register `--spinner-color` via `@property` for animatable custom property transitions
- [ ] Smooth direction transition -- capture current transform state and carry into new direction keyframe

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Custom color palette picker -- full color customization UI
- [ ] Mobile touch/swipe gestures -- swipe-to-direct interaction model
- [ ] Mobile-responsive layout -- optimized layout for small screens
- [ ] Easing curve selector -- let users pick timing functions
- [ ] Multiple shape support -- add squares, triangles as spinner options
- [ ] Persistence -- localStorage for state across refresh

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| 3D circle with perspective | HIGH | LOW | P1 |
| Directional buttons | HIGH | LOW | P1 |
| Correct-axis rotation | HIGH | MEDIUM | P1 |
| Continuous spinning | HIGH | LOW | P1 |
| Stop/start controls | HIGH | LOW | P1 |
| Color family per direction | HIGH | LOW | P1 |
| Shade cycling per rotation | MEDIUM | MEDIUM | P1 |
| Zustand state management | HIGH | LOW | P1 |
| prefers-reduced-motion | MEDIUM | LOW | P1 |
| Color transition animation | MEDIUM | LOW | P2 |
| Speed control slider | MEDIUM | LOW | P2 |
| Keyboard arrow keys | MEDIUM | LOW | P2 |
| Smooth direction transition | LOW | HIGH | P3 |
| Custom color picker | LOW | HIGH | P3 |
| Mobile gestures | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Animista (playground) | CodePen 3D Spinners | CSS-Tricks Demos | Our Approach |
|---------|----------------------|---------------------|------------------|--------------|
| 3D rotation | Pre-built presets, no live 3D | Mostly decorative, no user control | Tutorial-focused, read-only | User-controlled direction with live 3D perspective |
| Play/pause | No | Rarely | Sometimes in tutorials | First-class stop/start controls |
| Direction control | Animation-direction only (normal/reverse) | No interactive direction | No | Four-axis directional control mapped to 3D axes |
| Color theming | No color tied to animation state | Static colors | Static colors | Dynamic color families driven by direction, shade cycling per rotation |
| State management | No (pure CSS tool) | No (inline scripts) | No (tutorial snippets) | Zustand store, single source of truth |
| Accessibility | No reduced-motion support | No | Occasionally mentioned | prefers-reduced-motion, semantic buttons, focus styles |
| Architecture | CSS generator output | Mixed JS/CSS spaghetti | Educational snippets | Clean CSS-first with JS state layer (Zustand) |

## Sources

- [Polypane CSS 3D Transform Examples](https://polypane.app/css-3d-transform-examples/) -- real-world 3D transform patterns and perspective usage
- [Prismic CSS Animation Examples](https://prismic.io/blog/css-animation-examples) -- 39 animation examples with interactive 3D demos
- [Animista](https://animista.net/) -- CSS animation playground with configurable presets
- [CSS-Tricks: Play/Pause with CSS Custom Properties](https://css-tricks.com/how-to-play-and-pause-css-animations-with-css-custom-properties/) -- animation-play-state patterns
- [MDN: animation-play-state](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-play-state) -- canonical reference for pause/resume
- [Smashing Magazine: CSS GPU Animation](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) -- GPU compositing best practices, implicit compositing pitfalls
- [web.dev: High-Performance CSS Animations](https://web.dev/articles/animations-guide) -- animate only transform/opacity for compositor-only rendering
- [web.dev: Accessibility and Motion](https://web.dev/learn/accessibility/motion) -- prefers-reduced-motion implementation
- [Pope Tech: Accessible Animation](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) -- WCAG motion requirements and pause controls
- [Josh W. Comeau: Interactive Guide to CSS Transitions](https://www.joshwcomeau.com/animation/css-transitions/) -- transition fundamentals and GPU optimization
- [desandro: Intro to CSS 3D Transforms](https://3dtransforms.desandro.com/) -- foundational 3D transform concepts
- [WebPeak: CSS/JS Animation Trends 2026](https://webpeak.org/blog/css-js-animation-trends/) -- current trends in motion design
- [CSS Script: Interactive 3D Text Spinner](https://www.cssscript.com/interactive-3d-text-spinner/) -- pure CSS interactive spinner using :has() and radio buttons
- [iPixel: 60 FPS CSS Animation Guide](https://ipixel.com.sg/web-development/how-to-achieve-smooth-css-animations-60-fps-performance-guide/) -- performance targeting methodology

---
*Feature research for: Interactive CSS 3D Animation App (Spinner)*
*Researched: 2026-02-17*
