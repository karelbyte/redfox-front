import { expect, test } from '@playwright/test';
import {
  copy,
  dashboardUrlPattern,
  gotoLogin,
  hasTestAccount,
  isFieldValid,
  login,
  NO_ACCOUNT_REASON,
  testAccount,
} from './utils';

test.describe('Acceso', () => {
  test('muestra el formulario de acceso', async ({ page }) => {
    await gotoLogin(page);

    await expect(page.getByLabel(copy.login.email)).toBeVisible();
    await expect(page.getByLabel(copy.login.password)).toBeVisible();
    await expect(
      page.getByRole('button', { name: copy.login.loginButton }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: copy.login.forgotPassword }),
    ).toBeVisible();
  });

  test('no envía el formulario con los campos vacíos', async ({ page }) => {
    await gotoLogin(page);

    await page.getByRole('button', { name: copy.login.loginButton }).click();

    // Los campos son obligatorios: el navegador bloquea el envío
    expect(await isFieldValid(page, copy.login.email)).toBe(false);
    await expect(
      page.getByRole('heading', { name: copy.login.title }),
    ).toBeVisible();
  });

  test('rechaza un correo con formato inválido', async ({ page }) => {
    await gotoLogin(page);

    await page.getByLabel(copy.login.email).fill('esto-no-es-un-correo');
    await page.getByLabel(copy.login.password).fill('cualquier-cosa');
    await page.getByRole('button', { name: copy.login.loginButton }).click();

    expect(await isFieldValid(page, copy.login.email)).toBe(false);
    await expect(
      page.getByRole('heading', { name: copy.login.title }),
    ).toBeVisible();
  });

  test('lleva a recuperar la contraseña', async ({ page }) => {
    await gotoLogin(page);

    await page.getByRole('link', { name: copy.login.forgotPassword }).click();

    await expect(page).toHaveURL(/forgot-password/);
  });

  test.describe('con una cuenta de pruebas', () => {
    test.skip(!hasTestAccount, NO_ACCOUNT_REASON);

    test('entra con credenciales válidas', async ({ page }) => {
      await login(page);

      // Estricto a propósito: comprueba que el tenant no se duplique
      await expect(page).toHaveURL(dashboardUrlPattern());
    });

    test('muestra un error con credenciales inválidas', async ({ page }) => {
      await gotoLogin(page);

      await page.getByLabel(copy.login.email).fill(testAccount.email);
      await page.getByLabel(copy.login.password).fill('contraseña-incorrecta');
      await page.getByRole('button', { name: copy.login.loginButton }).click();

      // Permanece en el formulario en lugar de entrar
      await expect(page).not.toHaveURL(/\/dashboard/);
      await expect(
        page.getByRole('heading', { name: copy.login.title }),
      ).toBeVisible();
    });

    test('mantiene la sesión al recargar', async ({ page }) => {
      await login(page);

      await page.reload();

      await expect(page).toHaveURL(/\/dashboard/);
    });
  });
});
