import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { palette } from './colors.js';

const DEFAULT_SHADE = 2;
const DEFAULT_SPEED = 2;

// Create a fresh store for each test (mirrors production store)
function makeStore() {
  return createStore((set, get) => ({
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
}

describe('Store — initial state', () => {
  it('has correct default shape', () => {
    const store = makeStore();
    const state = store.getState();
    expect(state.direction).toBe(null);
    expect(state.isSpinning).toBe(false);
    expect(state.colorFamily).toBe('up');
    expect(state.shadeIndex).toBe(DEFAULT_SHADE);
    expect(state.speed).toBe(DEFAULT_SPEED);
    expect(state.copiedColor).toBe(null);
  });
});

describe('Store — setDirection', () => {
  let store;
  beforeEach(() => { store = makeStore(); });

  it('sets direction and starts spinning', () => {
    store.getState().setDirection('left');
    const s = store.getState();
    expect(s.direction).toBe('left');
    expect(s.isSpinning).toBe(true);
    expect(s.colorFamily).toBe('left');
    expect(s.shadeIndex).toBe(DEFAULT_SHADE);
  });

  it('switching direction resets shadeIndex to default', () => {
    store.getState().setDirection('up');
    store.getState().cycleShade();
    store.getState().cycleShade();
    expect(store.getState().shadeIndex).toBe(DEFAULT_SHADE + 2);

    store.getState().setDirection('right');
    expect(store.getState().shadeIndex).toBe(DEFAULT_SHADE);
    expect(store.getState().colorFamily).toBe('right');
  });

  it('works for all four directions', () => {
    for (const dir of ['up', 'down', 'left', 'right']) {
      store.getState().setDirection(dir);
      expect(store.getState().direction).toBe(dir);
      expect(store.getState().colorFamily).toBe(dir);
    }
  });
});

describe('Store — toggleSpinning', () => {
  let store;
  beforeEach(() => { store = makeStore(); });

  it('toggles isSpinning from false to true', () => {
    store.getState().toggleSpinning();
    expect(store.getState().isSpinning).toBe(true);
  });

  it('toggles back to false', () => {
    store.getState().toggleSpinning();
    store.getState().toggleSpinning();
    expect(store.getState().isSpinning).toBe(false);
  });

  it('stop after setDirection preserves direction', () => {
    store.getState().setDirection('down');
    store.getState().toggleSpinning();
    expect(store.getState().isSpinning).toBe(false);
    expect(store.getState().direction).toBe('down');
    expect(store.getState().colorFamily).toBe('down');
  });
});

describe('Store — cycleShade', () => {
  let store;
  beforeEach(() => { store = makeStore(); });

  it('increments shadeIndex', () => {
    store.getState().setDirection('up');
    store.getState().cycleShade();
    expect(store.getState().shadeIndex).toBe(DEFAULT_SHADE + 1);
  });

  it('wraps around at max shade', () => {
    store.getState().setDirection('up');
    const maxShades = palette.up.shades.length;
    for (let i = 0; i < maxShades; i++) {
      store.getState().cycleShade();
    }
    // After cycling through all shades from DEFAULT_SHADE, wraps around
    expect(store.getState().shadeIndex).toBe(DEFAULT_SHADE);
  });

  it('cycles correctly for each color family', () => {
    for (const dir of ['up', 'down', 'left', 'right']) {
      store.getState().setDirection(dir);
      const maxShades = palette[dir].shades.length;
      // Cycle to max
      for (let i = store.getState().shadeIndex; i < maxShades - 1; i++) {
        store.getState().cycleShade();
      }
      expect(store.getState().shadeIndex).toBe(maxShades - 1);
      // One more wraps to 0
      store.getState().cycleShade();
      expect(store.getState().shadeIndex).toBe(0);
    }
  });
});

describe('Store — setSpeed', () => {
  let store;
  beforeEach(() => { store = makeStore(); });

  it('sets speed within valid range', () => {
    store.getState().setSpeed(3.5);
    expect(store.getState().speed).toBe(3.5);
  });

  it('clamps speed to minimum 0.5', () => {
    store.getState().setSpeed(0.1);
    expect(store.getState().speed).toBe(0.5);
  });

  it('clamps speed to maximum 5', () => {
    store.getState().setSpeed(10);
    expect(store.getState().speed).toBe(5);
  });

  it('does not affect other state', () => {
    store.getState().setDirection('right');
    store.getState().setSpeed(1);
    expect(store.getState().direction).toBe('right');
    expect(store.getState().isSpinning).toBe(true);
    expect(store.getState().speed).toBe(1);
  });
});

describe('Store — reset', () => {
  let store;
  beforeEach(() => { store = makeStore(); });

  it('resets all state to defaults', () => {
    store.getState().setDirection('left');
    store.getState().setSpeed(4);
    store.getState().cycleShade();

    store.getState().reset();
    const s = store.getState();
    expect(s.direction).toBe(null);
    expect(s.isSpinning).toBe(false);
    expect(s.colorFamily).toBe('up');
    expect(s.shadeIndex).toBe(DEFAULT_SHADE);
    expect(s.speed).toBe(DEFAULT_SPEED);
  });

  it('reset after stop restores everything', () => {
    store.getState().setDirection('up');
    store.getState().toggleSpinning();
    store.getState().reset();
    expect(store.getState().direction).toBe(null);
    expect(store.getState().isSpinning).toBe(false);
  });

  it('reset clears copiedColor', () => {
    store.getState().setDirection('up');
    store.getState().copyCurrentColor();
    expect(store.getState().copiedColor).not.toBe(null);
    store.getState().reset();
    expect(store.getState().copiedColor).toBe(null);
  });
});

describe('Store — copyCurrentColor', () => {
  let store;
  beforeEach(() => { store = makeStore(); });

  it('returns null when no direction set', () => {
    const result = store.getState().copyCurrentColor();
    expect(result).toBe(null);
    expect(store.getState().copiedColor).toBe(null);
  });

  it('returns the current hex color when spinning', () => {
    store.getState().setDirection('up');
    const result = store.getState().copyCurrentColor();
    const expected = palette.up.shades[DEFAULT_SHADE];
    expect(result).toBe(expected);
    expect(store.getState().copiedColor).toBe(expected);
  });

  it('returns correct color after shade cycling', () => {
    store.getState().setDirection('left');
    store.getState().cycleShade();
    const result = store.getState().copyCurrentColor();
    expect(result).toBe(palette.left.shades[DEFAULT_SHADE + 1]);
  });

  it('returns correct color for each direction', () => {
    for (const dir of ['up', 'down', 'left', 'right']) {
      store.getState().setDirection(dir);
      const result = store.getState().copyCurrentColor();
      expect(result).toBe(palette[dir].shades[DEFAULT_SHADE]);
    }
  });
});

describe('Store — clearCopied', () => {
  let store;
  beforeEach(() => { store = makeStore(); });

  it('clears copiedColor back to null', () => {
    store.getState().setDirection('down');
    store.getState().copyCurrentColor();
    expect(store.getState().copiedColor).not.toBe(null);
    store.getState().clearCopied();
    expect(store.getState().copiedColor).toBe(null);
  });
});
