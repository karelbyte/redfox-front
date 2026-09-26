import { expect, test } from '@playwright/test';

test.describe('Comprobación de salud', () => {
  test('responde 200 sin redirigir', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'ok' });
  });

  test('la raíz sí redirige, por eso existe la ruta anterior', async ({
    request,
  }) => {
    const response = await request.get('/', { maxRedirects: 0 });

    expect(response.status()).toBe(307);
  });
});
