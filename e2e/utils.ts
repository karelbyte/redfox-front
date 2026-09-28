import { expect, Page } from '@playwright/test';
import es from '../src/i18n/locales/es.json';

/** Textos de la interfaz, leídos del propio catálogo de traducciones. */
export const copy = {
  login: es.pages.login,
  register: es.pages.register,
  dashboard: es.pages.dashboard,
  navigation: es.navigation,
};

/**
 * Credenciales del entorno de pruebas.
 *
 * Nunca se escriben en el repositorio: se definen en `.env.e2e` (ignorado por
 * git) o como variables de entorno del CI. Sin ellas, las pruebas que
 * requieren sesión se omiten en lugar de fallar.
 */
export const testAccount = {
  tenant: process.env.E2E_TENANT ?? '',
  email: process.env.E2E_EMAIL ?? '',
  password: process.env.E2E_PASSWORD ?? '',
};

/**
 * Símbolo de moneda que debe mostrar la organización de pruebas. Por defecto
 * el sol peruano, que es el país de la cuenta configurada; si se apunta a una
 * organización de otro país, se ajusta con E2E_CURRENCY_SYMBOL.
 */
export const expectedCurrencySymbol = process.env.E2E_CURRENCY_SYMBOL ?? 'S/';

export const hasTestAccount = Boolean(
  testAccount.tenant && testAccount.email && testAccount.password,
);

/** Motivo que Playwright muestra al omitir las pruebas con sesión. */
export const NO_ACCOUNT_REASON =
  'Requiere E2E_TENANT, E2E_EMAIL y E2E_PASSWORD, y la API en marcha';

/**
 * Fija el idioma antes de que cargue la página.
 *
 * Sin `nitro-language` guardado, LanguageInitializer redirige añadiendo el
 * idioma al final de la ruta (`/tenant/login` -> `/tenant/login/es`), que no
 * existe. Es un fallo de la aplicación, no de las pruebas: al fijarlo se
 * simula a un visitante que ya ha estado antes, que es el caso normal.
 */
export async function seedLanguage(page: Page, locale = 'es') {
  await page.addInitScript((value) => {
    try {
      window.localStorage.setItem('nitro-language', value);
    } catch {
      /* el navegador puede bloquear el almacenamiento */
    }
  }, locale);
}

/** Abre el formulario de acceso del tenant de pruebas. */
export async function gotoLogin(page: Page) {
  await seedLanguage(page);
  const path = testAccount.tenant ? `/${testAccount.tenant}/login` : '/login';
  await page.goto(path);
  await expect(
    page.getByRole('heading', { name: copy.login.title }),
  ).toBeVisible();
}

/** Inicia sesión y espera a llegar al panel. */
export async function login(page: Page) {
  await gotoLogin(page);
  await page.getByLabel(copy.login.email).fill(testAccount.email);
  await page.getByLabel(copy.login.password).fill(testAccount.password);
  await page.getByRole('button', { name: copy.login.loginButton }).click();
  // El desvío por suscripción también pasa por /dashboard/...
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Forma que debe tener la URL del panel: el tenant aparece una sola vez,
 * seguido del idioma. Hubo un fallo que dejaba `/tenant/es/tenant/dashboard`,
 * que es un 404, y una comprobación laxa no lo detectaba.
 */
export function dashboardUrlPattern(): RegExp {
  return new RegExp(`/${testAccount.tenant}/[a-z]{2}/dashboard`);
}

/** Indica si un campo del formulario es válido para el navegador. */
export function isFieldValid(page: Page, label: string) {
  return page
    .getByLabel(label)
    .evaluate((input: HTMLInputElement) => input.validity.valid);
}
