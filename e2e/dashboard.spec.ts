import { expect, test } from '@playwright/test';
import {
  copy,
  expectedCurrencySymbol,
  hasTestAccount,
  login,
  NO_ACCOUNT_REASON,
  testAccount,
} from './utils';

test.describe('Panel', () => {
  test.skip(!hasTestAccount, NO_ACCOUNT_REASON);

  test.beforeEach(async ({ page }) => {
    await login(page);

    // El desvío por suscripción ocurre en el cliente y puede tardar, así que
    // se espera a que la aplicación se decida: o pinta el panel, o desvía.
    await expect
      .poll(
        async () => {
          if (/suscripcion\/pago/.test(page.url())) return 'pago';
          const visible = await page
            .getByRole('heading', { name: copy.dashboard.title })
            .isVisible()
            .catch(() => false);
          return visible ? 'panel' : 'cargando';
        },
        { timeout: 20_000 },
      )
      .not.toBe('cargando');

    // Con la suscripción vencida el panel no llega a mostrarse. Es un estado
    // de la cuenta de pruebas, no un fallo del panel: se omite con el motivo
    // a la vista.
    if (/suscripcion\/pago/.test(page.url())) {
      test.skip(
        true,
        `La suscripción de "${testAccount.tenant}" está vencida: la aplicación desvía al pago`,
      );
    }
  });

  test('carga con sus indicadores', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: copy.dashboard.title }),
    ).toBeVisible();

    for (const card of [
      copy.dashboard.analytics.totalSales,
      copy.dashboard.analytics.totalRevenue,
      copy.dashboard.analytics.totalProducts,
      copy.dashboard.analytics.inventoryValue,
    ] as const) {
      await expect(page.getByText(card, { exact: true })).toBeVisible();
    }
  });

  /**
   * La moneda sale del país de la organización, que viaja en la sesión. Antes
   * todo se formateaba en pesos mexicanos por defecto, así que una
   * organización peruana veía "$" en lugar de "S/".
   */
  test('muestra los importes en la moneda del país de la organización', async ({
    page,
  }) => {
    const revenue = page
      .getByText(copy.dashboard.analytics.totalRevenue, { exact: true })
      .locator('xpath=..');

    await expect(revenue).toContainText(expectedCurrencySymbol);
    await expect(revenue).not.toContainText('$');
  });

  test('el valor del inventario usa la misma moneda', async ({ page }) => {
    const inventory = page
      .getByText(copy.dashboard.analytics.inventoryValue, { exact: true })
      .locator('xpath=..');

    await expect(inventory).toContainText(expectedCurrencySymbol);
  });

  test('el menú lateral lleva a la lista de productos', async ({ page }) => {
    await page
      .getByRole('navigation')
      .getByText(copy.navigation.products, { exact: true })
      .click();

    await page
      .getByRole('link', { name: copy.navigation.productList })
      .first()
      .click();

    await expect(page).toHaveURL(/lista-de-productos/);
  });
});
