/** @feature color-families
 *  @day 1 @date 2026-02-17
 *  @category visual/color
 *  @desc 4 color palettes keyed by direction: blue (up), green (down), orange (left), purple (right). Each has 6 hex shades from lightest to darkest. Pure data module — no imports, no side effects, no DOM. Used by shade-cycling and copy-color features.
 *  @files colors.js, store.js, spinner.js
 */
export const palette = {
  up: {
    name: 'blue',
    shades: ['#e3f2fd', '#90caf9', '#42a5f5', '#1e88e5', '#1565c0', '#0d47a1'],
  },
  down: {
    name: 'green',
    shades: ['#e8f5e9', '#a5d6a7', '#66bb6a', '#43a047', '#2e7d32', '#1b5e20'],
  },
  left: {
    name: 'orange',
    shades: ['#fff3e0', '#ffcc80', '#ffa726', '#fb8c00', '#ef6c00', '#e65100'],
  },
  right: {
    name: 'purple',
    shades: ['#f3e5f5', '#ce93d8', '#ab47bc', '#8e24aa', '#6a1b9a', '#4a148c'],
  },
};
