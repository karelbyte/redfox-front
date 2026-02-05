import { test, expect } from '@playwright/test';

test.describe('Products Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@nitro.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Navigate to products page
    await page.goto('/products');
  });

  test('should display products list', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible();
    
    // Check that products table/grid is visible
    await expect(page.getByTestId('products-list')).toBeVisible();
    
    // Check for search input
    await expect(page.getByPlaceholder(/search products/i)).toBeVisible();
    
    // Check for add product button
    await expect(page.getByRole('button', { name: /add product/i })).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="products-list"]');
    
    // Get initial product count
    const initialProducts = await page.locator('[data-testid="product-card"]').count();
    
    // Search for a specific product
    await page.getByPlaceholder(/search products/i).fill('Laptop');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Check that results are filtered
    const filteredProducts = await page.locator('[data-testid="product-card"]').count();
    expect(filteredProducts).toBeLessThanOrEqual(initialProducts);
    
    // Check that visible products contain search term
    const productNames = await page.locator('[data-testid="product-name"]').allTextContents();
    productNames.forEach(name => {
      expect(name.toLowerCase()).toContain('laptop');
    });
  });

  test('should create new product', async ({ page }) => {
    // Click add product button
    await page.getByRole('button', { name: /add product/i }).click();
    
    // Check that create product modal/form is visible
    await expect(page.getByRole('dialog', { name: /add product/i })).toBeVisible();
    
    // Fill product form
    await page.getByLabel(/product name/i).fill('Test Product E2E');
    await page.getByLabel(/description/i).fill('Test product created via E2E test');
    await page.getByLabel(/price/i).fill('199.99');
    await page.getByLabel(/cost/i).fill('99.99');
    await page.getByLabel(/stock/i).fill('50');
    await page.getByLabel(/minimum stock/i).fill('10');
    await page.getByLabel(/barcode/i).fill('1234567890123');
    
    // Select category and brand
    await page.getByLabel(/category/i).selectOption('1');
    await page.getByLabel(/brand/i).selectOption('1');
    
    // Submit form
    await page.getByRole('button', { name: /save product/i }).click();
    
    // Check for success message
    await expect(page.getByText(/product created successfully/i)).toBeVisible();
    
    // Check that modal is closed
    await expect(page.getByRole('dialog', { name: /add product/i })).not.toBeVisible();
    
    // Check that new product appears in the list
    await expect(page.getByText('Test Product E2E')).toBeVisible();
  });

  test('should edit existing product', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Click edit button on first product
    await page.locator('[data-testid="product-card"]').first().getByRole('button', { name: /edit/i }).click();
    
    // Check that edit product modal is visible
    await expect(page.getByRole('dialog', { name: /edit product/i })).toBeVisible();
    
    // Update product name
    const nameInput = page.getByLabel(/product name/i);
    await nameInput.clear();
    await nameInput.fill('Updated Product Name');
    
    // Update price
    const priceInput = page.getByLabel(/price/i);
    await priceInput.clear();
    await priceInput.fill('299.99');
    
    // Submit form
    await page.getByRole('button', { name: /update product/i }).click();
    
    // Check for success message
    await expect(page.getByText(/product updated successfully/i)).toBeVisible();
    
    // Check that modal is closed
    await expect(page.getByRole('dialog', { name: /edit product/i })).not.toBeVisible();
    
    // Check that product name is updated in the list
    await expect(page.getByText('Updated Product Name')).toBeVisible();
  });

  test('should delete product', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Get initial product count
    const initialCount = await page.locator('[data-testid="product-card"]').count();
    
    // Click delete button on first product
    await page.locator('[data-testid="product-card"]').first().getByRole('button', { name: /delete/i }).click();
    
    // Check that confirmation dialog is visible
    await expect(page.getByRole('dialog', { name: /confirm delete/i })).toBeVisible();
    await expect(page.getByText(/are you sure you want to delete/i)).toBeVisible();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Check for success message
    await expect(page.getByText(/product deleted successfully/i)).toBeVisible();
    
    // Check that product count decreased
    await page.waitForTimeout(1000);
    const newCount = await page.locator('[data-testid="product-card"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should update product stock', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Click stock update button on first product
    await page.locator('[data-testid="product-card"]').first().getByRole('button', { name: /update stock/i }).click();
    
    // Check that stock update modal is visible
    await expect(page.getByRole('dialog', { name: /update stock/i })).toBeVisible();
    
    // Fill stock update form
    await page.getByLabel(/quantity/i).fill('25');
    await page.getByLabel(/operation/i).selectOption('add');
    
    // Submit form
    await page.getByRole('button', { name: /update stock/i }).click();
    
    // Check for success message
    await expect(page.getByText(/stock updated successfully/i)).toBeVisible();
    
    // Check that modal is closed
    await expect(page.getByRole('dialog', { name: /update stock/i })).not.toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="products-list"]');
    
    // Select category filter
    await page.getByLabel(/filter by category/i).selectOption('1');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Check that only products from selected category are shown
    const categoryLabels = await page.locator('[data-testid="product-category"]').allTextContents();
    categoryLabels.forEach(category => {
      expect(category).toBe('Electronics'); // Assuming category 1 is Electronics
    });
  });

  test('should sort products', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="products-list"]');
    
    // Sort by price (high to low)
    await page.getByLabel(/sort by/i).selectOption('price_desc');
    
    // Wait for sort to apply
    await page.waitForTimeout(1000);
    
    // Get product prices
    const prices = await page.locator('[data-testid="product-price"]').allTextContents();
    const numericPrices = prices.map(price => parseFloat(price.replace('$', '')));
    
    // Check that prices are in descending order
    for (let i = 0; i < numericPrices.length - 1; i++) {
      expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i + 1]);
    }
  });

  test('should handle pagination', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="products-list"]');
    
    // Check if pagination is present (only if there are multiple pages)
    const paginationExists = await page.locator('[data-testid="pagination"]').isVisible();
    
    if (paginationExists) {
      // Get current page number
      const currentPage = await page.locator('[data-testid="current-page"]').textContent();
      expect(currentPage).toBe('1');
      
      // Click next page if available
      const nextButton = page.getByRole('button', { name: /next/i });
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        
        // Wait for page to load
        await page.waitForTimeout(1000);
        
        // Check that page number changed
        const newPage = await page.locator('[data-testid="current-page"]').textContent();
        expect(newPage).toBe('2');
      }
    }
  });

  test('should show product details', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Click on first product card
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Check that product details modal is visible
    await expect(page.getByRole('dialog', { name: /product details/i })).toBeVisible();
    
    // Check that product information is displayed
    await expect(page.getByTestId('product-name')).toBeVisible();
    await expect(page.getByTestId('product-description')).toBeVisible();
    await expect(page.getByTestId('product-price')).toBeVisible();
    await expect(page.getByTestId('product-stock')).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: /close/i }).click();
    
    // Check that modal is closed
    await expect(page.getByRole('dialog', { name: /product details/i })).not.toBeVisible();
  });

  test('should show low stock warning', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="products-list"]');
    
    // Look for products with low stock warning
    const lowStockBadges = page.locator('[data-testid="low-stock-badge"]');
    const badgeCount = await lowStockBadges.count();
    
    if (badgeCount > 0) {
      // Check that low stock badge is visible and has correct styling
      await expect(lowStockBadges.first()).toBeVisible();
      await expect(lowStockBadges.first()).toHaveClass(/bg-red/);
      await expect(lowStockBadges.first()).toContainText(/low stock/i);
    }
  });

  test('should validate product form', async ({ page }) => {
    // Click add product button
    await page.getByRole('button', { name: /add product/i }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: /save product/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/product name is required/i)).toBeVisible();
    await expect(page.getByText(/price is required/i)).toBeVisible();
    
    // Fill invalid price
    await page.getByLabel(/price/i).fill('-10');
    await page.getByRole('button', { name: /save product/i }).click();
    
    // Check for price validation error
    await expect(page.getByText(/price must be positive/i)).toBeVisible();
  });
});