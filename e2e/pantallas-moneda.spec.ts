import { test, expect, Page } from '@playwright/test';
import { login } from './utils';

/**
 * Pantallas que formatean dinero y que llegaron a romperse por ello.
 *
 * La de crédito estuvo semanas mostrando "This page couldn't load": un
 * `Intl.NumberFormat` con `style: 'currency'` recibía la moneda indefinida y
 * lanzaba un TypeError, que en un componente tumba el render entero. Por eso
 * estas pruebas no miran solo el texto: escuchan los errores de página, que
 * es donde ese fallo se manifiesta.
 */
const TENANT = 'david-test-enterprise';

const watchErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
};

const firstClientId = async (page: Page) => {
  const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010/api';

  return page.evaluate(async (base) => {
    const res = await fetch(`${base}/clients`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const body = await res.json();
    const list = Array.isArray(body) ? body : (body.data ?? []);
    return list[0]?.id ?? null;
  }, api);
};

test('el crédito de un cliente se muestra sin reventar', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page);

  const clientId = await firstClientId(page);
  test.skip(!clientId, 'la organización de pruebas no tiene clientes');

  await page.goto(`/${TENANT}/es/dashboard/clientes/${clientId}/credito`);
  await page.waitForLoadState('networkidle');

  const text = await page.locator('body').innerText();
  expect(errors).toEqual([]);
  expect(text).not.toContain("This page couldn't load");
  expect(text).not.toContain('MXN');
});

test('el inventario se muestra sin reventar', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page);

  await page.goto(`/${TENANT}/es/dashboard/inventarios`);
  await page.waitForLoadState('networkidle');

  const text = await page.locator('body').innerText();
  expect(errors).toEqual([]);
  expect(text).not.toContain("This page couldn't load");
});
