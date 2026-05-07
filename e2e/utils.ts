import { Page, expect } from '@playwright/test';

/**
 * E2E Test Utilities
 * Helper functions for common test operations
 */

// Test tenant and locale constants
export const TEST_TENANT = 'test-tenant';
export const TEST_LOCALE = 'en';

// URL builders
export const buildUrl = (path: string) => `/${TEST_TENANT}/${TEST_LOCALE}${path}`;
export const buildDashboardUrl = (module: string) =>
  `/${TEST_TENANT}/${TEST_LOCALE}/dashboard/${module}`;

// Product module URLs
export const PRODUCTS_URL = buildDashboardUrl('productos/lista-de-productos');
export const PRODUCT_IMPORT_URL = buildDashboardUrl('productos/importar-productos');

// Auth credentials for testing
export const TEST_CREDENTIALS = {
  email: 'admin@nitro.com',
  password: 'admin123',
};

/**
 * Login helper - performs login and returns to the dashboard
 */
export async function login(page: Page, email = TEST_CREDENTIALS.email, password = TEST_CREDENTIALS.password) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL(/.*\/dashboard.*/);
}

/**
 * Navigate to products page after login
 */
export async function navigateToProducts(page: Page) {
  await login(page);
  await page.goto(PRODUCTS_URL);
  await page.waitForSelector('table tbody tr');
}

/**
 * Get product row by name
 */
export async function getProductRowByName(page: Page, productName: string) {
  return page.locator('table tbody tr').filter({ hasText: productName });
}

/**
 * Open action menu for a product row
 */
export async function openProductActionMenu(page: Page, productName: string) {
  const row = await getProductRowByName(page, productName);
  const actionButton = row.locator('button').filter({ has: page.locator('svg') }).first();
  await actionButton.click();
}

/**
 * Wait for toast message to appear
 */
export async function waitForToast(page: Page, messagePattern: RegExp) {
  await page.waitForSelector(`text=/${messagePattern.source}/i`);
}

/**
 * Generate unique test product name
 */
export function generateTestProductName(prefix = 'Test Product') {
  return `${prefix} ${Date.now()}`;
}

/**
 * Verify we're on the dashboard page
 */
export async function checkDashboard(page: Page) {
  await expect(page).toHaveURL(/.*\/dashboard.*/);
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
}

/**
 * Verify we're on the login page
 */
export async function checkLoginPage(page: Page) {
  await expect(page).toHaveURL(/.*login.*/);
  await expect(page.getByLabel(/email/i)).toBeVisible();
}

/**
 * Logout helper - performs logout from dashboard
 */
export async function logout(page: Page) {
  // Click on user menu or profile button to access logout
  const userMenuButton = page.locator('button').filter({ has: page.locator('svg') }).first();
  if (await userMenuButton.isVisible().catch(() => false)) {
    await userMenuButton.click();
  }

  // Wait for dropdown and click logout
  await page.getByRole('menuitem', { name: /logout|cerrar sesión/i }).click();
}
