# 🧪 Testing Guide - Frontend (Next.js)

Esta guía explica cómo ejecutar y escribir tests para el frontend de Nitro.

## 📋 Tipos de Tests

### 1. Tests Unitarios
- **Ubicación**: `src/**/__tests__/*.test.tsx`
- **Propósito**: Probar componentes y funciones individuales
- **Framework**: Jest + React Testing Library

### 2. Tests de Integración
- **Ubicación**: `src/**/__tests__/*.integration.test.tsx`
- **Propósito**: Probar interacciones entre componentes
- **Framework**: Jest + React Testing Library + MSW

### 3. Tests E2E
- **Ubicación**: `e2e/*.spec.ts`
- **Propósito**: Probar flujos completos de usuario
- **Framework**: Playwright

## 🚀 Comandos de Testing

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests E2E
npm run test:e2e

# Ejecutar tests E2E con UI
npm run test:e2e:ui

# Instalar navegadores de Playwright
npx playwright install
```

## 📁 Estructura de Tests

```
redfox-front/
├── src/
│   ├── components/
│   │   ├── MainMenu.tsx
│   │   └── __tests__/
│   │       └── MainMenu.test.tsx
│   ├── services/
│   │   ├── products.service.ts
│   │   └── __tests__/
│   │       └── products.service.test.ts
│   └── __mocks__/
│       └── server.ts                 # MSW server
├── e2e/
│   ├── auth.spec.ts                  # Tests E2E de auth
│   └── products.spec.ts              # Tests E2E de productos
├── jest.config.js                    # Configuración Jest
├── jest.setup.js                     # Setup de Jest
└── playwright.config.ts              # Configuración Playwright
```

## 🛠️ Configuración

### Jest Configuration
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### MSW (Mock Service Worker)
```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/products', () => {
    return HttpResponse.json({
      data: [
        { id: 1, name: 'Test Product', price: 100 }
      ],
      total: 1,
    });
  }),
];

export const server = setupServer(...handlers);
```

## ✍️ Escribir Tests

### Test de Componente React

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductList } from '../ProductList';
import { AuthContext } from '../../context/AuthContext';

const mockUser = {
  id: 1,
  email: 'test@example.com',
  roles: ['admin'],
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={{ user: mockUser, isAuthenticated: true }}>
      {component}
    </AuthContext.Provider>
  );
};

describe('ProductList', () => {
  it('renders product list', async () => {
    renderWithProviders(<ProductList />);

    // Wait for products to load
    await screen.findByText('Test Product');
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductList />);

    const searchInput = screen.getByPlaceholderText('Search products...');
    await user.type(searchInput, 'Laptop');

    // Verify search was triggered
    expect(searchInput).toHaveValue('Laptop');
  });
});
```

### Test de Servicio

```typescript
import { getProducts } from '../products.service';
import { server } from '../../__mocks__/server';
import { http, HttpResponse } from 'msw';

describe('ProductsService', () => {
  it('should fetch products successfully', async () => {
    const result = await getProducts(1, 10);

    expect(result).toEqual({
      data: expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          name: 'Test Product',
        }),
      ]),
      total: 1,
    });
  });

  it('should handle API errors', async () => {
    server.use(
      http.get('/api/products', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    await expect(getProducts(1, 10)).rejects.toThrow();
  });
});
```

### Test E2E con Playwright

```typescript
import { test, expect } from '@playwright/test';

test.describe('Products Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@nitro.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.goto('/products');
  });

  test('should create new product', async ({ page }) => {
    await page.getByRole('button', { name: /add product/i }).click();
    
    await page.getByLabel(/product name/i).fill('Test Product E2E');
    await page.getByLabel(/price/i).fill('199.99');
    
    await page.getByRole('button', { name: /save product/i }).click();
    
    await expect(page.getByText(/product created successfully/i)).toBeVisible();
  });
});
```

## 🎯 Mejores Prácticas

### 1. Testing Library Queries (Orden de Prioridad)
```typescript
// 1. Accesible para todos (mejor)
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByText(/welcome/i)

// 2. Queries semánticas
screen.getByAltText(/profile picture/i)
screen.getByTitle(/close dialog/i)

// 3. Test IDs (último recurso)
screen.getByTestId('submit-button')
```

### 2. Async Testing
```typescript
// Esperar por elementos que aparecen
await screen.findByText('Loading complete');

// Esperar por elementos que desaparecen
await waitForElementToBeRemoved(screen.getByText('Loading...'));

// Esperar por cambios de estado
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### 3. User Interactions
```typescript
const user = userEvent.setup();

// Typing
await user.type(screen.getByLabelText(/email/i), 'test@example.com');

// Clicking
await user.click(screen.getByRole('button', { name: /submit/i }));

// Selecting
await user.selectOptions(screen.getByLabelText(/category/i), 'electronics');
```

### 4. Mocking

#### Mock Next.js Router
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/products',
}));
```

#### Mock API Calls
```typescript
// En jest.setup.js
import { server } from './src/__mocks__/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 📊 Coverage

### Configuración de Coverage
```json
{
  "collectCoverageFrom": [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
    "!src/app/layout.tsx",
    "!src/app/page.tsx"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

### Reportes de Coverage
- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`
- **JSON**: `coverage/coverage-final.json`

## 🎭 Playwright E2E

### Configuración
```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5501',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5501',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Comandos Útiles
```bash
# Ejecutar tests específicos
npx playwright test auth.spec.ts

# Ejecutar en modo debug
npx playwright test --debug

# Generar tests automáticamente
npx playwright codegen localhost:5501

# Ver reporte HTML
npx playwright show-report
```

## 🔧 Debugging

### VS Code Configuration
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

### Debug Playwright
```bash
# Debug mode
npx playwright test --debug

# Headed mode (ver navegador)
npx playwright test --headed

# Slow motion
npx playwright test --headed --slowMo=1000
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Tests fallan por timing**
   ```typescript
   // ❌ Malo
   expect(screen.getByText('Loading complete')).toBeInTheDocument();
   
   // ✅ Bueno
   await screen.findByText('Loading complete');
   ```

2. **Mocks no funcionan**
   ```typescript
   // Verificar que MSW está configurado en jest.setup.js
   import { server } from './src/__mocks__/server';
   beforeAll(() => server.listen());
   ```

3. **Tests E2E lentos**
   ```typescript
   // Usar parallelización
   test.describe.configure({ mode: 'parallel' });
   
   // Reutilizar estado de login
   test.use({ storageState: 'auth.json' });
   ```

## 📈 Métricas de Calidad

### Objetivos de Coverage
- **Componentes**: 80%+
- **Servicios**: 90%+
- **Hooks**: 85%+
- **Utils**: 95%+

### Tipos de Tests por Tipo de Código
- **Componentes UI**: Tests de renderizado y interacción
- **Servicios**: Tests de API calls y error handling
- **Hooks**: Tests de estado y efectos
- **Utils**: Tests de funciones puras

## 🔄 CI/CD Integration

Los tests se ejecutan automáticamente en:
- **Push** a `main` o `develop`
- **Pull Requests**
- **Releases**

### Pipeline de Tests
1. **Lint** - Verificar código
2. **Unit Tests** - Tests unitarios con coverage
3. **Build** - Compilar aplicación
4. **E2E Tests** - Tests end-to-end
5. **Visual Regression** - Tests visuales (opcional)

Ver `.github/workflows/test.yml` para configuración completa.

## 📚 Recursos Adicionales

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/docs/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)