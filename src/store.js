import { createStore } from 'zustand/vanilla';
import { palette } from './colors.js';

const DEFAULT_SHADE = 2; // Start at medium intensity, not near-white
const DEFAULT_SPEED = 2; // seconds per rotation

export const store = createStore((set, get) => ({
  /** @feature directional-spin
   *  @day 1 @date 2026-02-17
   *  @category animation/control
   *  @desc Sets spin direction, starts animation, assigns color family. Each direction maps to a rotateX/Y axis and a unique color palette.
   *  @files store.js, spinner.js, style.css, index.html
   */
  direction: null,
  isSpinning: false,
  colorFamily: 'up',
  shadeIndex: DEFAULT_SHADE,

  setDirection(dir) {
    set({
      direction: dir,
      isSpinning: true,
      colorFamily: dir,
      shadeIndex: DEFAULT_SHADE,
    });
  },

  /** @feature stop-start
   *  @day 1 @date 2026-02-17
   *  @category animation/control
   *  @desc Toggles animation-play-state between running and paused. Preserves current rotation angle so the circle resumes from where it stopped.
   *  @files store.js, spinner.js, style.css, index.html
   */
  toggleSpinning() {
    set({ isSpinning: !get().isSpinning });
  },

  /** @feature shade-cycling
   *  @day 1 @date 2026-02-17
   *  @category visual/color
   *  @desc Cycles through shade array on each full rotation (animationiteration event). Wraps from darkest back to lightest. Combined with @property --spinner-color for smooth animated transitions.
   *  @files store.js, spinner.js, colors.js, style.css
   */
  cycleShade() {
    const state = get();
    const maxIndex = palette[state.colorFamily].shades.length - 1;
    set({ shadeIndex: state.shadeIndex >= maxIndex ? 0 : state.shadeIndex + 1 });
  },

  /** @feature speed-control
   *  @day 1 @date 2026-02-17
   *  @category animation/control
   *  @desc Adjusts rotation speed via --spin-duration CSS custom property. Range: 0.5s (fast) to 5s (slow). Clamped to prevent invalid values.
   *  @files store.js, spinner.js, style.css, index.html
   */
  speed: DEFAULT_SPEED,

  setSpeed(speed) {
    set({ speed: Math.max(0.5, Math.min(5, speed)) });
  },

  /** @feature copy-color
   *  @day 2 @date 2026-02-17
   *  @category interaction/utility
   *  @desc Click the spinning circle to copy current hex color to clipboard. Returns the hex string for UI feedback. Guards against copying when no direction is set. Visual glow flash confirms the copy.
   *  @files store.js, spinner.js, style.css, index.html
   */
  copiedColor: null,

  copyCurrentColor() {
    const state = get();
    if (!state.direction) return null;
    const hex = palette[state.colorFamily].shades[state.shadeIndex];
    set({ copiedColor: hex });
    return hex;
  },

  clearCopied() {
    set({ copiedColor: null });
  },

  /** @feature reset
   *  @day 1 @date 2026-02-17
   *  @category state/management
   *  @desc Restores all state to initial defaults. Clears direction, stops spinning, resets color family, shade, speed, and copied color. Triggered by Escape key.
   *  @files store.js, spinner.js
   */
  reset() {
    set({
      direction: null,
      isSpinning: false,
      colorFamily: 'up',
      shadeIndex: DEFAULT_SHADE,
      speed: DEFAULT_SPEED,
      copiedColor: null,
    });
  },
}));
