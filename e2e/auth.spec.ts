import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check that login form elements are present
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click submit without filling fields
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Fill invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for email validation error
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill login form
    await page.getByLabel(/email/i).fill('admin@nitro.com');
    await page.getByLabel(/password/i).fill('admin123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Check that user is logged in (user menu should be visible)
    await expect(page.getByRole('button', { name: /user menu/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill login form with invalid credentials
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i);
    const toggleButton = page.getByRole('button', { name: /toggle password visibility/i });

    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    await toggleButton.click();

    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle button again
    await toggleButton.click();

    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should remember me functionality', async ({ page }) => {
    // Fill login form
    await page.getByLabel(/email/i).fill('admin@nitro.com');
    await page.getByLabel(/password/i).fill('admin123');
    
    // Check remember me
    await page.getByLabel(/remember me/i).check();
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Refresh page to check if user is still logged in
    await page.reload();
    
    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL('/dashboard');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@nitro.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');

    // Click user menu
    await page.getByRole('button', { name: /user menu/i }).click();
    
    // Click logout
    await page.getByRole('menuitem', { name: /logout/i }).click();

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should be redirected back to login
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access protected route while not logged in
    await page.goto('/products');
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login');

    // Login
    await page.getByLabel(/email/i).fill('admin@nitro.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should be redirected to originally intended page
    await expect(page).toHaveURL('/products');
  });

  test('should handle session expiration', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@nitro.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page).toHaveURL('/dashboard');

    // Simulate session expiration by clearing localStorage
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
    });

    // Try to make an authenticated request
    await page.goto('/products');

    // Should be redirected to login due to expired session
    await expect(page).toHaveURL('/login');
    
    // Should show session expired message
    await expect(page.getByText(/session expired/i)).toBeVisible();
  });
});