import { test, expect } from '@playwright/test';

test.describe('Spinner — directional controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads with circle and 4 direction buttons', async ({ page }) => {
    await expect(page.locator('.circle')).toBeVisible();
    await expect(page.locator('.scene')).toBeVisible();
    await expect(page.locator('[data-direction]')).toHaveCount(4);
  });

  test('clicking Right spins circle on Y-axis', async ({ page }) => {
    await page.click('[data-direction="right"]');
    await expect(page.locator('.circle')).toHaveClass(/spin-right/);
  });

  test('clicking Up spins circle on X-axis', async ({ page }) => {
    await page.click('[data-direction="up"]');
    await expect(page.locator('.circle')).toHaveClass(/spin-up/);
  });

  test('clicking Down spins circle on X-axis (reverse)', async ({ page }) => {
    await page.click('[data-direction="down"]');
    await expect(page.locator('.circle')).toHaveClass(/spin-down/);
  });

  test('clicking Left spins circle on Y-axis (reverse)', async ({ page }) => {
    await page.click('[data-direction="left"]');
    await expect(page.locator('.circle')).toHaveClass(/spin-left/);
  });

  test('switching direction changes animation class', async ({ page }) => {
    await page.click('[data-direction="right"]');
    await expect(page.locator('.circle')).toHaveClass(/spin-right/);
    await page.click('[data-direction="up"]');
    await expect(page.locator('.circle')).not.toHaveClass(/spin-right/);
    await expect(page.locator('.circle')).toHaveClass(/spin-up/);
  });
});

test.describe('Spinner — stop/start controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('stop button pauses animation', async ({ page }) => {
    await page.click('[data-direction="right"]');
    await page.click('#stop-btn');
    await expect(page.locator('.circle')).toHaveClass(/paused/);
  });

  test('start button resumes animation', async ({ page }) => {
    await page.click('[data-direction="right"]');
    await page.click('#stop-btn');
    await expect(page.locator('.circle')).toHaveClass(/paused/);
    await page.click('#start-btn');
    await expect(page.locator('.circle')).not.toHaveClass(/paused/);
  });
});

test.describe('Spinner — 3D perspective', () => {
  test('scene has perspective and preserve-3d', async ({ page }) => {
    await page.goto('/');
    const perspective = await page.locator('.scene').evaluate(
      (el) => getComputedStyle(el).perspective
    );
    expect(perspective).toBe('800px');

    const transformStyle = await page.locator('.scene').evaluate(
      (el) => getComputedStyle(el).transformStyle
    );
    expect(transformStyle).toBe('preserve-3d');
  });
});

test.describe('Spinner — color updates', () => {
  test('direction button changes spinner color', async ({ page }) => {
    await page.goto('/');
    // Get initial color
    const initialColor = await page.locator('.circle').evaluate(
      (el) => getComputedStyle(el).getPropertyValue('--spinner-color').trim()
    );

    await page.click('[data-direction="down"]');
    // Wait for transition
    await page.waitForTimeout(500);

    const newColor = await page.locator('.circle').evaluate(
      (el) => getComputedStyle(el).getPropertyValue('--spinner-color').trim()
    );
    // Color should have changed (may be hex or rgb depending on @property)
    expect(newColor).not.toBe(initialColor);
  });
});

test.describe('Spinner — keyboard controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ArrowRight starts spinning right', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.circle')).toHaveClass(/spin-right/);
  });

  test('ArrowUp starts spinning up', async ({ page }) => {
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('.circle')).toHaveClass(/spin-up/);
  });

  test('ArrowLeft starts spinning left', async ({ page }) => {
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.circle')).toHaveClass(/spin-left/);
  });

  test('ArrowDown starts spinning down', async ({ page }) => {
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.circle')).toHaveClass(/spin-down/);
  });

  test('Space toggles stop/start', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.circle')).toHaveClass(/spin-right/);

    await page.keyboard.press('Space');
    await expect(page.locator('.circle')).toHaveClass(/paused/);

    await page.keyboard.press('Space');
    await expect(page.locator('.circle')).not.toHaveClass(/paused/);
  });

  test('Escape resets everything', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.circle')).toHaveClass(/spin-right/);

    await page.keyboard.press('Escape');
    await expect(page.locator('.circle')).not.toHaveClass(/spin-right/);
  });
});

test.describe('Spinner — speed slider', () => {
  test('speed slider is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#speed-slider')).toBeVisible();
  });

  test('changing speed updates CSS custom property', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('ArrowRight');

    // Set slider to 1s (fast)
    await page.locator('#speed-slider').fill('1');
    await page.locator('#speed-slider').dispatchEvent('input');

    const duration = await page.locator('.circle').evaluate(
      (el) => el.style.getPropertyValue('--spin-duration')
    );
    expect(duration).toBe('1s');
  });
});

test.describe('Spinner — status HUD', () => {
  test('HUD shows direction after click', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-direction="up"]');
    await expect(page.locator('#hud-direction')).toHaveText('up');
    await expect(page.locator('#hud-color')).toHaveText('blue');
  });

  test('HUD shows dash when no direction', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hud-direction')).toHaveText('—');
  });
});
