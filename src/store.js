import { createStore } from 'zustand/vanilla';
import { palette } from './colors.js';

const DEFAULT_SHADE = 2; // Start at medium intensity, not near-white
const DEFAULT_SPEED = 2; // seconds per rotation

export const store = createStore((set, get) => ({
  direction: null,
  isSpinning: false,
  colorFamily: 'up',
  shadeIndex: DEFAULT_SHADE,
  speed: DEFAULT_SPEED,
  copiedColor: null,

  setDirection(dir) {
    set({
      direction: dir,
      isSpinning: true,
      colorFamily: dir,
      shadeIndex: DEFAULT_SHADE,
    });
  },

  toggleSpinning() {
    set({ isSpinning: !get().isSpinning });
  },

  cycleShade() {
    const state = get();
    const maxIndex = palette[state.colorFamily].shades.length - 1;
    set({ shadeIndex: state.shadeIndex >= maxIndex ? 0 : state.shadeIndex + 1 });
  },

  setSpeed(speed) {
    set({ speed: Math.max(0.5, Math.min(5, speed)) });
  },

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
