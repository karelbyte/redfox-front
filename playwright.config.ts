import { existsSync, readFileSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * Credenciales del entorno de pruebas. Van en `.env.e2e`, que git ignora, o
 * como variables del CI. Nunca en el repositorio.
 */
if (existsSync('.env.e2e')) {
  for (const line of readFileSync('.env.e2e', 'utf8').split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  /* En local el servidor de Next compila las rutas bajo demanda; con
     demasiados trabajadores en paralelo alguna carga se queda sin tiempo. */
  workers: process.env.CI ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
  ],
  expect: {
    timeout: 10_000,
  },

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5502',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Navegadores. Por defecto solo Chromium: es lo que basta para el humo y
     lo único instalado. Para añadir el resto hace falta `npx playwright
     install firefox webkit`, y Edge/Chrome exigen tenerlos en el sistema. */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    // { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],

  /* Las pruebas corren contra una compilación de producción, no contra el
     servidor de desarrollo: allí Next compila cada ruta la primera vez que
     se pide y esa espera hacía fallar pruebas sin que nada estuviera roto.
     Se compila en `.next-e2e` y se sirve en otro puerto para no interferir
     con un `npm run dev` que esté levantado. */
  webServer: {
    command: 'npm run build && npm run start -- -p 5502',
    url: 'http://localhost:5502/api/health',
    /* Nunca se reutiliza: si se dejara vivo un servidor de una ejecución
       anterior, tras cambiar código se probaría la versión antigua sin que
       nada lo advirtiera. Compilar de nuevo cuesta unos segundos. */
    reuseExistingServer: false,
    timeout: 300 * 1000,
    env: {
      NEXT_DIST_DIR: '.next-e2e',
    },
  },
});