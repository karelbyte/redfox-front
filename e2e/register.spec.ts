import { expect, test } from '@playwright/test';
import { copy, seedLanguage } from './utils';

/**
 * El país determina los impuestos, las unidades y la facturación electrónica
 * con la que nace una organización, y la lista la sirve la API para que
 * añadir un país no obligue a tocar el front. Estas pruebas recorren ese
 * camino completo: navegador -> front -> API.
 */
test.describe('Registro', () => {
  test.beforeEach(async ({ page }) => {
    await seedLanguage(page);
    await page.goto('/register');
    await expect(
      page.getByRole('heading', { name: copy.register.title }),
    ).toBeVisible();
  });

  test('ofrece los países que publica la API', async ({ page }) => {
    const country = page.getByLabel(copy.register.country);

    await expect(country).toBeVisible();
    // Se espera a que llegue la respuesta antes de leer las opciones
    await expect(country.getByRole('option')).not.toHaveCount(0);

    const values = await country
      .getByRole('option')
      .evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      );

    expect(values).toContain('MX');
    expect(values).toContain('PE');
  });

  test('usa códigos en mayúscula, como los valida la API', async ({ page }) => {
    const values = await page
      .getByLabel(copy.register.country)
      .getByRole('option')
      .evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      );

    for (const value of values) {
      expect(value).toBe(value.toUpperCase());
    }
  });

  test('permite elegir Perú y avisa de que no se puede cambiar', async ({
    page,
  }) => {
    const country = page.getByLabel(copy.register.country);

    await country.selectOption('PE');

    await expect(country).toHaveValue('PE');
    await expect(page.getByText(copy.register.countryHelp)).toBeVisible();
  });
});
