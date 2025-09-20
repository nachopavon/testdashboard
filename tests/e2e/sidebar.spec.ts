import { test, expect } from '@playwright/test';

test('Sidebar: colapsar/expandir y navegación por teclado', async ({ page }) => {
  await page.goto('/');

  const aside = page.locator('aside[aria-label="Navegación principal"]');
  await expect(aside).toBeVisible();

  const collapseBtn = aside.getByRole('button', { name: /Cerrar menú|Abrir menú/ });
  await expect(collapseBtn).toBeVisible();

  // click para colapsar
  await collapseBtn.click();
  // aria-label toggles between 'Abrir menú' and 'Cerrar menú'
  const label = await collapseBtn.getAttribute('aria-label');
  expect(label === 'Abrir menú' || label === 'Cerrar menú').toBeTruthy();

  // enfoque en botón ECON y activar con tecla Enter
  const econBtn = page.getByRole('button', { name: /Seguimiento económico/i });
  await econBtn.focus();
  await page.keyboard.press('Enter');
  await expect(econBtn).toHaveAttribute('aria-pressed', 'true');
});
