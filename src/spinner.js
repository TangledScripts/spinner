import { store } from './store.js';
import { palette } from './colors.js';

const SPIN_CLASSES = ['spin-up', 'spin-down', 'spin-left', 'spin-right'];

const KEY_MAP = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

export function initSpinner() {
  const circle = document.querySelector('.circle');
  const buttons = document.querySelectorAll('[data-direction]');
  const stopBtn = document.getElementById('stop-btn');
  const startBtn = document.getElementById('start-btn');
  const speedSlider = document.getElementById('speed-slider');
  const hudDirection = document.getElementById('hud-direction');
  const hudColor = document.getElementById('hud-color');
  const hudShade = document.getElementById('hud-shade');
  const hudSpeed = document.getElementById('hud-speed');

  // Wire direction button click handlers
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      store.getState().setDirection(btn.dataset.direction);
    });
  });

  // Wire stop/start buttons
  stopBtn.addEventListener('click', () => {
    const state = store.getState();
    if (state.isSpinning) state.toggleSpinning();
  });

  startBtn.addEventListener('click', () => {
    const state = store.getState();
    if (!state.isSpinning && state.direction) state.toggleSpinning();
  });

  // Wire speed slider
  speedSlider.addEventListener('input', (e) => {
    store.getState().setSpeed(parseFloat(e.target.value));
  });

  // Wire click-to-copy on circle
  const copyHint = document.getElementById('copy-hint');
  let copyTimeout = null;

  circle.addEventListener('click', async () => {
    const hex = store.getState().copyCurrentColor();
    if (!hex) return;
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      // Clipboard API may be blocked — still show visual feedback
    }
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => store.getState().clearCopied(), 1200);
  });

  // Wire keyboard controls
  document.addEventListener('keydown', (e) => {
    if (KEY_MAP[e.key]) {
      e.preventDefault();
      store.getState().setDirection(KEY_MAP[e.key]);
    } else if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      const state = store.getState();
      if (state.direction) state.toggleSpinning();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      store.getState().reset();
    }
  });

  // Subscribe: animation class + play state updates
  store.subscribe((state, prevState) => {
    // Handle direction changes
    if (state.direction !== prevState.direction) {
      circle.classList.remove(...SPIN_CLASSES);
      if (state.direction) {
        circle.classList.add(`spin-${state.direction}`);
      }

      buttons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.direction === state.direction);
      });
    }

    // Handle play state changes
    if (state.isSpinning !== prevState.isSpinning) {
      circle.classList.toggle('paused', !state.isSpinning);
    }

    // Handle speed changes
    if (state.speed !== prevState.speed) {
      circle.style.setProperty('--spin-duration', `${state.speed}s`);
      speedSlider.value = state.speed;
    }
  });

  // Subscribe: color updates (separate concern)
  store.subscribe((state, prevState) => {
    if (
      state.colorFamily === prevState.colorFamily &&
      state.shadeIndex === prevState.shadeIndex
    ) return;

    const shade = palette[state.colorFamily].shades[state.shadeIndex];
    circle.style.setProperty('--spinner-color', shade);
  });

  // Subscribe: HUD updates (separate concern)
  store.subscribe((state) => {
    hudDirection.textContent = state.direction ?? '—';
    hudColor.textContent = state.direction ? palette[state.colorFamily].name : '—';
    hudShade.textContent = state.direction ? `${state.shadeIndex + 1}/${palette[state.colorFamily].shades.length}` : '—';
    hudSpeed.textContent = `${state.speed.toFixed(1)}s`;
  });

  // Subscribe: copy feedback (separate concern)
  store.subscribe((state, prevState) => {
    if (state.copiedColor !== prevState.copiedColor) {
      circle.classList.toggle('copied', !!state.copiedColor);
      if (copyHint) {
        copyHint.textContent = state.copiedColor
          ? `Copied ${state.copiedColor}!`
          : 'Click circle to copy color';
      }
    }
  });

  // Wire animationiteration for shade cycling
  circle.addEventListener('animationiteration', () => {
    store.getState().cycleShade();
  });
}
