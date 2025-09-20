import { test, expect } from '@playwright/test';

test.describe('Navegación principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside[aria-label="Navegación principal"]')).toBeVisible();
  });

  test('cambiar vista con botones del sidebar', async ({ page }) => {
    const econBtn = page.getByRole('button', { name: /Seguimiento económico/i });
    const ansBtn = page.getByRole('button', { name: /Seguimiento ANS/i });
    const chatBtn = page.getByRole('button', { name: /Chat datos/i });

    // inicialmente la vista econ debería estar visible por defecto
    await expect(econBtn).toHaveAttribute('aria-pressed', 'true');

    // clic en ANS
    await ansBtn.click();
    await expect(ansBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(econBtn).toHaveAttribute('aria-pressed', 'false');

    // clic en Chat
    await chatBtn.click();
    await expect(chatBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(ansBtn).toHaveAttribute('aria-pressed', 'false');
  });
});
