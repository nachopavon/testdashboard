import { test, expect } from '@playwright/test';

test('HeaderFilters: selecciona distintos meses y reqs', async ({ page }) => {
  await page.goto('/');
  // navegar a la vista ANS para ver HeaderFilters
  const ansBtn = page.getByRole('button', { name: /Seguimiento ANS/i });
  await ansBtn.click();
  await expect(ansBtn).toHaveAttribute('aria-pressed', 'true');

  // esperar selects en el header
  const selects = page.locator('header select');
  await expect(selects).toHaveCount(3);

  // cambiar el primer select (mes) por la segunda opción
  const monthSelect = selects.nth(0);
  const initial = await monthSelect.inputValue();
  const optionValue = await monthSelect.locator('option').nth(1).getAttribute('value');
  if(optionValue){
    await monthSelect.selectOption(optionValue);
    await expect(monthSelect).not.toHaveValue(initial);
  }

  // cambiar el tercer select (req)
  const reqSelect = selects.nth(2);
  const reqOption = await reqSelect.locator('option').nth(1).getAttribute('value');
  if(reqOption){
    await reqSelect.selectOption(reqOption);
    await expect(reqSelect).toHaveValue(reqOption);
  }
});
