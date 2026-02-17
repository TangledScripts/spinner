import { describe, it, expect } from 'vitest';
import { palette } from './colors.js';

describe('Color palette — structure', () => {
  it('has exactly 4 color families', () => {
    expect(Object.keys(palette)).toEqual(['up', 'down', 'left', 'right']);
  });

  it('each family has a name string', () => {
    for (const dir of ['up', 'down', 'left', 'right']) {
      expect(typeof palette[dir].name).toBe('string');
      expect(palette[dir].name.length).toBeGreaterThan(0);
    }
  });

  it('each family has 5-7 shades', () => {
    for (const dir of ['up', 'down', 'left', 'right']) {
      const count = palette[dir].shades.length;
      expect(count).toBeGreaterThanOrEqual(5);
      expect(count).toBeLessThanOrEqual(7);
    }
  });

  it('all shades are valid hex colors', () => {
    const hexPattern = /^#[0-9a-fA-F]{6}$/;
    for (const dir of ['up', 'down', 'left', 'right']) {
      for (const shade of palette[dir].shades) {
        expect(shade).toMatch(hexPattern);
      }
    }
  });
});

describe('Color palette — distinct families', () => {
  it('each direction maps to a distinct color family name', () => {
    const names = Object.values(palette).map((f) => f.name);
    const unique = new Set(names);
    expect(unique.size).toBe(4);
  });

  it('families are keyed by direction', () => {
    expect(palette.up.name).toBe('blue');
    expect(palette.down.name).toBe('green');
    expect(palette.left.name).toBe('orange');
    expect(palette.right.name).toBe('purple');
  });
});

describe('Color palette — shade cycling logic', () => {
  it('shades go from lighter to darker', () => {
    // Verify first shade is lighter than last (higher hex values = lighter)
    for (const dir of ['up', 'down', 'left', 'right']) {
      const shades = palette[dir].shades;
      const firstVal = parseInt(shades[0].slice(1), 16);
      const lastVal = parseInt(shades[shades.length - 1].slice(1), 16);
      expect(firstVal).toBeGreaterThan(lastVal);
    }
  });

  it('shade index 0 is always valid', () => {
    for (const dir of ['up', 'down', 'left', 'right']) {
      expect(palette[dir].shades[0]).toBeDefined();
    }
  });

  it('last shade index is shades.length - 1', () => {
    for (const dir of ['up', 'down', 'left', 'right']) {
      const last = palette[dir].shades.length - 1;
      expect(palette[dir].shades[last]).toBeDefined();
    }
  });
});
