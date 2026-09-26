import { test, expect, Page } from '@playwright/test';
import { login } from './utils';

/**
 * La pantalla de pago mezcla datos de la base (nombre, precio, moneda) con
 * textos traducidos. Lo que se rompió antes fue justo la frontera: un '$'
 * escrito a mano delante de un precio en otra moneda, y frases comerciales
 * guardadas en la base en un solo idioma que contradecían lo que la pantalla
 * calculaba. Estas pruebas vigilan esa frontera.
 */

const TENANT = 'david-test-enterprise';
const PAGO = `/${TENANT}/es/dashboard/suscripcion/pago`;

/**
 * La cuenta de pruebas es peruana. Intl, en una locale peruana, siempre
 * antepone el código o el símbolo de la moneda ('USD 49.00', 'S/ 200.00')
 * porque ninguna de las dos es la moneda local implícita. Un '$' pelado
 * delante del número significa que alguien lo escribió a mano en el JSX en
 * vez de pasar por formatCurrency: ese es el error que vigilan estas pruebas.
 */
const IMPORTE = /(USD|PEN|MXN|S\/)\s?([\d,]+\.\d{2})/g;

const amounts = (text: string): number[] =>
  [...text.matchAll(IMPORTE)].map((m) => Number(m[2].replace(/,/g, '')));

const openPaymentPage = async (page: Page) => {
  await login(page);
  await page.goto(PAGO);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Selecciona tu Plan' })).toBeVisible();
  return page.locator('main');
};

test.describe('suscripción · pago', () => {
  test('el precio lleva el código de su moneda, no un símbolo fijo', async ({ page }) => {
    const main = await openPaymentPage(page);
    const text = await main.innerText();

    expect(text).not.toMatch(/\$\s?\d/);
    expect(amounts(text).length).toBeGreaterThanOrEqual(2);
  });

  test('el ahorro anual se calcula y coincide con los precios mostrados', async ({ page }) => {
    const main = await openPaymentPage(page);
    const text = await main.innerText();

    const values = amounts(text);
    expect(values.length).toBeGreaterThanOrEqual(2);
    const monthly = Math.min(...values);
    const yearly = Math.max(...values);

    const badge = main.getByText(/Ahorras \d+ mes/);
    const expected = Math.max(0, Math.floor((monthly * 12 - yearly) / monthly));

    if (expected > 0) {
      await expect(badge).toBeVisible();
      const meses = Number((await badge.innerText()).match(/\d+/)![0]);
      expect(meses).toBe(expected);
    } else {
      await expect(badge).toHaveCount(0);
    }
  });

  test('no quedan promesas de ahorro escritas a mano', async ({ page }) => {
    const main = await openPaymentPage(page);
    const text = await main.innerText();

    // La frase vivía en plans.description y se desincronizó de los precios.
    expect(text).not.toMatch(/Ahorra más de/i);
    expect(text).not.toMatch(/Save more than/i);
  });

  test('el pago sale de la aplicación hacia Stripe', async ({ page }) => {
    const main = await openPaymentPage(page);

    // Ya no se teclea la tarjeta aquí: si reapareciera un campo de tarjeta
    // significaría que volvimos a montar Elements y a cargar con el riesgo
    // de manejar esos datos nosotros.
    await expect(main.locator('input[name*="card" i]')).toHaveCount(0);
    await expect(main.frameLocator('iframe').locator('body')).toHaveCount(0);

    const boton = main.getByRole('button', { name: 'Continuar al pago' });
    await expect(boton).toBeEnabled();
  });

  test('no se filtran términos fiscales de un solo país', async ({ page }) => {
    const main = await openPaymentPage(page);
    const text = await main.innerText();

    for (const term of [/\bCFDI\b/, /\bSAT\b/, /\bRFC\b/]) {
      expect(text).not.toMatch(term);
    }
  });
});
