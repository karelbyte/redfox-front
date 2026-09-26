import { test, expect, Page } from '@playwright/test';
import { login } from './utils';

/**
 * La organización de pruebas es peruana. Ninguna pantalla debe mostrar un
 * importe con '$' pelado ni con 'MXN': el primero significa que alguien
 * escribió el símbolo a mano en el JSX, el segundo que cayó en el respaldo
 * mexicano que había repartido por todo el front.
 */
const TENANT = 'david-test-enterprise';

const openPage = async (page: Page, path: string) => {
  await login(page);
  await page.goto(`/${TENANT}/es${path}`);
  await page.waitForLoadState('networkidle');
  return page.locator('body').innerText();
};

const amounts = (text: string) =>
  [...text.matchAll(/(S\/|PEN|USD|MXN|\$)\s?[\d.,]+/g)].map((m) => m[0]);

test.describe('moneda por país', () => {
  test('el punto de venta no escribe el símbolo a mano', async ({ page }) => {
    const text = await openPage(page, '/pos');

    expect(amounts(text).length).toBeGreaterThan(0);
    expect(text).not.toMatch(/\$\s?\d/);
    expect(text).not.toContain('MXN');
  });

  test('la lista de facturas usa la moneda de cada factura', async ({
    page,
  }) => {
    const text = await openPage(page, '/dashboard/facturas');

    // Sin esta comprobación la prueba pasaría con la tabla vacía, que es
    // justo el caso en el que no verifica nada.
    expect(await page.locator('tbody tr').count()).toBeGreaterThan(0);
    expect(amounts(text).length).toBeGreaterThan(0);

    expect(text).not.toMatch(/\$\s?\d/);
    expect(text).not.toContain('MXN');
  });

  /**
   * El detalle leía la moneda del primer producto —que no la tiene— y caía
   * en 'MXN'. Ahora la factura guarda la suya en currency_code.
   */
  test('el detalle de una factura la muestra en soles', async ({ page }) => {
    await openPage(page, '/dashboard/facturas');

    // Se navega por identificador en vez de pinchar en la lista: así la
    // prueba comprueba la moneda y no el marcado de la tabla, que puede
    // cambiar sin que esto tenga nada que ver.
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4010/api';
    const id = await page.evaluate(async (base) => {
      const respuesta = await fetch(`${base}/invoices`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const cuerpo = await respuesta.json();
      const lista = Array.isArray(cuerpo) ? cuerpo : (cuerpo.data ?? []);
      return lista[0]?.id ?? null;
    }, api);

    if (!id) {
      test.skip(true, 'la organización de pruebas no tiene facturas');
    }

    await page.goto(`/${TENANT}/es/dashboard/facturas/facturas/${id}`);
    await page.waitForLoadState('networkidle');

    const text = await page.locator('body').innerText();
    expect(text).not.toContain('MXN');
    expect(amounts(text).length).toBeGreaterThan(0);
    expect(amounts(text).every((i) => i.startsWith('S/'))).toBe(true);
  });
});
