import { test, expect } from '@playwright/test';

test('ANS: cambiar categoría y comprobar cards', async ({ page }) => {
  await page.goto('/');
  // seleccionar ANS
  const ansBtn = page.getByRole('button', { name: /Seguimiento ANS/i });
  await ansBtn.click();
  await expect(ansBtn).toHaveAttribute('aria-pressed', 'true');

  // esperar que existan tabs
  const tabs = page.getByRole('tab');
  await expect(await tabs.count()).toBeGreaterThan(0);

  // hacer click en una tab distinta a la primera (si existe)
  if((await tabs.count()) > 1){
    const secondTab = tabs.nth(1);
    await secondTab.click();
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');
  }

  // comprobar que hay al menos una card renderizada: buscar la región con role=region y aria-live
  const gridRegion = page.locator('.panelContainer [role="region"][aria-live="polite"]');
  await expect(gridRegion).toBeVisible();
  const children = gridRegion.locator('> *');
  await expect(await children.count()).toBeGreaterThan(0);
  await expect(children.first()).toBeVisible();
});
