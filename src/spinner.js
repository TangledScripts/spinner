import { store } from './store.js';
import { palette } from './colors.js';

const SPIN_CLASSES = ['spin-up', 'spin-down', 'spin-left', 'spin-right'];

/** @feature keyboard-controls
 *  @day 1 @date 2026-02-17
 *  @category interaction/input
 *  @desc Arrow keys set direction, Space toggles stop/start, Escape resets. Keydown listener on document with preventDefault to block scroll. KEY_MAP translates ArrowUp/Down/Left/Right to direction strings.
 *  @files spinner.js, store.js
 */
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

  /** @feature directional-spin — DOM wiring
   *  @desc Button click handlers call store.setDirection(). Subscribe callback adds/removes spin-* CSS class and toggles .active on the clicked button.
   */
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      store.getState().setDirection(btn.dataset.direction);
    });
  });

  /** @feature stop-start — DOM wiring
   *  @desc Stop button pauses if spinning. Start button resumes if paused and direction exists. Subscribe callback toggles .paused class.
   */
  stopBtn.addEventListener('click', () => {
    const state = store.getState();
    if (state.isSpinning) state.toggleSpinning();
  });

  startBtn.addEventListener('click', () => {
    const state = store.getState();
    if (!state.isSpinning && state.direction) state.toggleSpinning();
  });

  /** @feature speed-control — DOM wiring
   *  @desc Range input (0.5–5) calls store.setSpeed(). Subscribe callback updates --spin-duration CSS property and syncs slider value.
   */
  speedSlider.addEventListener('input', (e) => {
    store.getState().setSpeed(parseFloat(e.target.value));
  });

  /** @feature copy-color — DOM wiring
   *  @desc Click handler on .circle calls store.copyCurrentColor(), writes hex to clipboard via navigator.clipboard.writeText(). 1200ms timeout clears feedback. Subscribe callback toggles .copied class and updates hint text.
   */
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

  /** @feature keyboard-controls — DOM wiring
   *  @desc Keydown listener dispatches to store actions based on KEY_MAP. Space toggles only if direction exists. Escape calls reset().
   */
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

  /** @feature directional-spin — subscribe: animation class + play state
   *  @desc Removes all spin-* classes, adds spin-{direction}. Toggles .active on matching button. Also handles play state (.paused class) and speed (--spin-duration property).
   */
  store.subscribe((state, prevState) => {
    if (state.direction !== prevState.direction) {
      circle.classList.remove(...SPIN_CLASSES);
      if (state.direction) {
        circle.classList.add(`spin-${state.direction}`);
      }

      buttons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.direction === state.direction);
      });
    }

    /** @feature stop-start — subscribe: play state */
    if (state.isSpinning !== prevState.isSpinning) {
      circle.classList.toggle('paused', !state.isSpinning);
    }

    /** @feature speed-control — subscribe: duration update */
    if (state.speed !== prevState.speed) {
      circle.style.setProperty('--spin-duration', `${state.speed}s`);
      speedSlider.value = state.speed;
    }
  });

  /** @feature shade-cycling — subscribe: color updates
   *  @desc Updates --spinner-color CSS property when colorFamily or shadeIndex changes. The @property registration in CSS enables smooth animated transitions between shade values.
   */
  store.subscribe((state, prevState) => {
    if (
      state.colorFamily === prevState.colorFamily &&
      state.shadeIndex === prevState.shadeIndex
    ) return;

    const shade = palette[state.colorFamily].shades[state.shadeIndex];
    circle.style.setProperty('--spinner-color', shade);
  });

  /** @feature status-hud
   *  @day 1 @date 2026-02-17
   *  @category display/info
   *  @desc Live status display showing current direction, color family name, shade position (N/total), and speed. Updates on every state change. Monospace font, muted colors.
   *  @files spinner.js, style.css, index.html
   */
  store.subscribe((state) => {
    hudDirection.textContent = state.direction ?? '—';
    hudColor.textContent = state.direction ? palette[state.colorFamily].name : '—';
    hudShade.textContent = state.direction ? `${state.shadeIndex + 1}/${palette[state.colorFamily].shades.length}` : '—';
    hudSpeed.textContent = `${state.speed.toFixed(1)}s`;
  });

  /** @feature copy-color — subscribe: visual feedback */
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

  /** @feature shade-cycling — animationiteration trigger
   *  @desc Fires cycleShade() on each full rotation, progressing through the color family's shade array.
   */
  circle.addEventListener('animationiteration', () => {
    store.getState().cycleShade();
  });
}
